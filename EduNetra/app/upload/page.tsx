"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ToastContext";
import { getWithAuth, postWithAuth } from "@/lib/utils/api";
import { VideoUploadZone } from "@/components/VideoUploadZone";
import { EnhancedJobTracker } from "@/components/EnhancedJobTracker";
import { Sparkles, Check } from "lucide-react";

export default function UploadPage() {
  const { showToast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploadStage, setUploadStage] = useState<
    "idle" | "compressing" | "uploading" | "analyzing"
  >("idle");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [compressionProgress, setCompressionProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState<string | undefined>();
  const [subject, setSubject] = useState("Data Structures");
  const [language, setLanguage] = useState("English – Indian");
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileObject, setFileObject] = useState<File | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [jobs, setJobs] = useState<any[]>([]);
  const [expandedJobIds, setExpandedJobIds] = useState<Record<string, boolean>>(
    {}
  );
  const [messageTick, setMessageTick] = useState(0);
  const prevJobsRef = useRef<Map<string, string>>(new Map());

  useEffect(() => {
    const token = localStorage.getItem("shikshanetra_token");
    const loggedIn = localStorage.getItem("shikshanetra_logged_in") === "true";
    if (!token && !loggedIn) {
      showToast("Please login to upload videos");
      router.push("/login");
      return;
    }
    setIsAuthenticated(true);
  }, [router, showToast]);

  // Job polling logic
  const refreshJobs = async (silent: boolean = true) => {
    if (!isAuthenticated) return;
    try {
      const res = await getWithAuth("/api/jobs?limit=5");
      if (!res.ok) return;
      const data = await res.json();
      const nextJobs = data.jobs || [];

      // Detect newly completed jobs
      const prev = prevJobsRef.current;
      for (const job of nextJobs) {
        const prevStatus = prev.get(job.id);
        if (prevStatus && prevStatus !== "completed" && job.status === "completed") {
          showToast("Job completed! You can open the report.");
        }
        prev.set(job.id, job.status);
      }

      setJobs(nextJobs);
    } catch {
      // ignore polling errors
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;

    refreshJobs(false);
    const id = setInterval(() => {
      refreshJobs(true);
    }, 3000);

    return () => clearInterval(id);
  }, [isAuthenticated]);

  // Rotating message tick for expanded jobs
  const pendingJobs = jobs.filter((j: any) => j.status !== "completed" && j.status !== "failed");
  const hasExpandedPending = pendingJobs.some((j: any) => expandedJobIds[j.id]);

  useEffect(() => {
    if (!hasExpandedPending) return;
    const id = setInterval(() => setMessageTick((t) => t + 1), 1800);
    return () => clearInterval(id);
  }, [hasExpandedPending]);

  const getRotatingMessage = (job: any) => {
    const status = job.status;
    const messagesByStatus: Record<string, string[]> = {
      created: ["Job created. Preparing uploads…", "Warming up the pipeline…"],
      uploading: ["Upload started. Sending your video securely…", "Uploading video to storage…"],
      uploaded: ["Upload complete. Preparing analysis…", "Video received. Initializing model…"],
      analyzing: [
        "Analysis running. Processing video signals…",
        "Analyzing audio clarity and confidence…",
        "Analyzing text / transcript features…",
        "Computing classroom engagement metrics…",
      ],
      analysis_done: ["Core analysis complete. Finalizing outputs…", "Scoring complete. Preparing feedback…"],
      generating_feedback: ["Generating coach feedback…", "Drafting strengths and improvement areas…"],
      completed: ["Completed."],
      failed: ["Failed."],
    };

    const messages = messagesByStatus[status] || ["Working…"];
    const salt = job.id.split("").reduce((acc: number, ch: string) => acc + ch.charCodeAt(0), 0);
    const idx = Math.abs(messageTick + salt) % messages.length;
    return messages[idx];
  };

  const handleRunAnalysis = async () => {
    if (loading || !fileObject) {
      showToast("Please select a video file first.");
      return;
    }

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
    const uploadPreset =
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "Shikshanetra";
    const uploadFolder =
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_FOLDER || "video";

    // 🚫 Hard cap
    if (fileObject.size > 100 * 1024 * 1024) {
      showToast("Video must be under 100 MB.");
      return;
    }

    setLoading(true);
    setUploadStage("uploading");
    setUploadProgress(0);
    setCompressionProgress(0);
    setStatusMessage("Uploading video…");

    try {
      const cloudinaryResponse = await new Promise<any>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        const url = `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`;
        const formData = new FormData();

        formData.append("file", fileObject);
        formData.append("upload_preset", uploadPreset);
        formData.append("folder", uploadFolder);

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const percent = Math.round((e.loaded / e.total) * 100);
            setUploadProgress(percent);
            setStatusMessage(`Uploading… ${percent}%`);
          }
        };

        xhr.onerror = () => reject(new Error("Cloudinary network error"));

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            reject(
              new Error(
                `Cloudinary upload failed (${xhr.status}): ${xhr.responseText}`
              )
            );
          }
        };

        xhr.open("POST", url);
        xhr.send(formData);
      });

      const originalUrl: string = cloudinaryResponse.secure_url;
      const publicId: string = cloudinaryResponse.public_id;

      if (!originalUrl || !publicId) {
        throw new Error("Cloudinary upload did not return required data");
      }

      // ✅ URL-based compression ONLY if > 40 MB
      let compressedUrl: string | null = null;
      if (fileObject.size > 40 * 1024 * 1024) {
        compressedUrl = originalUrl.replace(
          "/video/upload/",
          "/video/upload/q_auto:good,f_mp4,w_1280,vc_h264/"
        );
      }

      setUploadStage("analyzing");
      setStatusMessage("Starting AI analysis…");

      const response = await postWithAuth("/api/analyze", {
        originalVideoUrl: originalUrl,         // Always send original
        compressedVideoUrl: compressedUrl,     // Optional, may be null
        publicId,
        fileName: fileObject.name,
        fileSize: fileObject.size,
        mimeType: fileObject.type,
        subject,
        language,
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const result = await response.json();
      if (result.success && result.job) {
        setJobs((prev) => [result.job, ...prev]);
      }

      showToast("Video uploaded & analysis started.");

      setUploadStage("idle");
      setUploadProgress(0);
      setCompressionProgress(0);
      setStatusMessage(undefined);
      setFileObject(null);
      setFileName(null);
      if (fileInputRef.current) fileInputRef.current.value = "";

      // Refresh jobs to show the new one
      refreshJobs(true);
    } catch (err: any) {
      showToast(err.message || "Upload failed");
      setUploadStage("idle");
      setUploadProgress(0);
      setCompressionProgress(0);
      setStatusMessage(undefined);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-white pb-20 pt-8 sm:pt-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-10 max-w-2xl">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl mb-3">
            Upload Session Video
          </h1>
          <p className="text-lg text-slate-500 leading-relaxed">
            Upload your teaching session for comprehensive AI analysis.
          </p>
        </div>

        <div className="h-px w-full bg-slate-100 mb-10" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-7">
            <VideoUploadZone
              fileName={fileName}
              subject={subject}
              language={language}
              loading={loading}
              uploadStage={uploadStage}
              uploadProgress={uploadProgress}
              compressionProgress={compressionProgress}
              statusMessage={statusMessage}
              onFileSelect={(file) => {
                setFileName(file.name);
                setFileObject(file);
              }}
              onSubjectChange={setSubject}
              onLanguageChange={setLanguage}
              onUpload={handleRunAnalysis}
              onRemoveFile={() => {
                setFileObject(null);
                setFileName(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
            />
          </div>

          <div className="lg:col-span-5 space-y-10">
            <EnhancedJobTracker
              jobs={jobs}
              expandedJobIds={expandedJobIds}
              onToggleExpand={(id) =>
                setExpandedJobIds((p) => ({ ...p, [id]: !p[id] }))
              }
              messageTick={messageTick}
              getRotatingMessage={getRotatingMessage}
            />

            <div className="bg-slate-50 rounded-2xl p-6 border">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-purple-500" /> What You'll Get
              </h3>
              <ul className="space-y-3">
                {[
                  "Minute-by-minute performance graphs",
                  "Audio clarity & confidence scores",
                  "Video engagement & gesture analysis",
                  "Personalized coaching feedback",
                ].map((item, i) => (
                  <li key={i} className="flex gap-3 text-sm text-slate-600">
                    <div className="h-4 w-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                      <Check className="h-2.5 w-2.5" strokeWidth={3} />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
