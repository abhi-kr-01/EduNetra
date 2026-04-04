"use client";

import { useState, useRef } from "react";
import { Card } from "./Card";
import { UploadCloud, CheckCircle2, X, FileVideo } from "lucide-react";

interface VideoUploadZoneProps {
  fileName: string | null;
  subject: string;
  language: string;
  loading: boolean;
  uploadStage: "idle" | "compressing" | "uploading" | "analyzing";
  uploadProgress: number;
  compressionProgress: number;
  statusMessage?: string;
  onFileSelect: (file: File) => void;
  onSubjectChange: (subject: string) => void;
  onLanguageChange: (language: string) => void;
  onUpload: () => void;
  onRemoveFile: () => void;
}

export function VideoUploadZone({
  fileName,
  subject,
  language,
  loading,
  uploadStage,
  uploadProgress,
  compressionProgress,
  statusMessage,
  onFileSelect,
  onSubjectChange,
  onLanguageChange,
  onUpload,
  onRemoveFile,
}: VideoUploadZoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      onFileSelect(files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      onFileSelect(files[0]);
    }
  };

  const subjects = [
    "Data Structures",
    "Algorithms",
    "Machine Learning",
    "Web Development",
    "Python Programming",
    "Mathematics",
    "Physics",
    "Chemistry",
    "Biology",
    "History",
    "Literature",
    "General Teaching",
  ];

  const languages = [
    "English – Indian",
    "English – US",
    "Hindi",
    "Spanish",
    "French",
    "German",
    "Chinese",
    "Japanese",
  ];

  const stageLabel = {
    idle: "Run Analysis ✨",
    compressing: "Compressing video…",
    uploading: "Uploading to Cloudinary…",
    analyzing: "Starting AI analysis…",
  }[uploadStage];

  const showProgress = uploadStage !== "idle";
  const effectiveProgress = uploadStage === "compressing"
    ? Math.min(100, Math.max(compressionProgress, 1))
    : uploadProgress;

  return (
    <div className="space-y-8">
      {/* Upload Zone */}
      <div
        className={`group relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all duration-200 cursor-pointer min-h-[320px] p-8 ${
          isDragActive
            ? "border-primary-500 bg-primary-50/50"
            : fileName
              ? "border-emerald-400 bg-emerald-50/30"
              : "border-slate-200 bg-slate-50/50 hover:border-primary-400 hover:bg-slate-50"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !fileName && inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept="video/*"
          onChange={handleChange}
          className="hidden"
          disabled={loading || !!fileName}
        />

        <div className="text-center space-y-4 max-w-sm mx-auto">
          {fileName ? (
            <div className="animate-in fade-in zoom-in-95 duration-300">
               <div className="h-16 w-16 mx-auto rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mb-4 shadow-sm">
                  <CheckCircle2 className="h-8 w-8" />
               </div>
               <h3 className="text-lg font-bold text-slate-900">
                  Video Ready for Analysis
               </h3>
               <div className="flex items-center justify-center gap-2 mt-2 px-3 py-1.5 bg-white rounded-md border border-emerald-200 text-sm font-medium text-slate-700 shadow-sm mx-auto w-fit max-w-full">
                  <FileVideo className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span className="truncate max-w-[200px]">{fileName}</span>
               </div>
               
               <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveFile();
                  }}
                  className="mt-6 text-sm font-semibold text-slate-400 hover:text-red-500 transition-colors flex items-center justify-center gap-1 mx-auto"
                >
                  <X className="h-3.5 w-3.5" /> Remove file
                </button>
            </div>
          ) : (
            <>
              <div className="h-16 w-16 mx-auto rounded-full bg-white flex items-center justify-center text-slate-400 shadow-sm border border-slate-100 group-hover:scale-110 group-hover:text-primary-500 group-hover:border-primary-100 transition-all duration-300">
                <UploadCloud className="h-8 w-8" />
              </div>
              <div>
                <p className="text-lg font-bold text-slate-900">
                  Click to upload or drag & drop
                </p>
                <p className="mt-1.5 text-sm text-slate-500">
                  Upload your teaching session video for AI analysis.
                </p>
              </div>
              <div className="pt-2">
                 <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-500">
                    MP4, MOV, AVI (Max 100MB)
                 </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Configuration Section - Only show when file is selected */}
      {fileName && (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 fade-in duration-500">
          <div className="grid gap-6 sm:grid-cols-2">
             <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">
                  Subject / Topic
                </label>
                <div className="relative">
                    <select
                      value={subjects.includes(subject) ? subject : "Other"}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "Other") {
                           onSubjectChange(""); // clear to let user type
                        } else {
                           onSubjectChange(val);
                        }
                      }}
                      disabled={loading}
                      className="w-full appearance-none rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-900 shadow-sm hover:border-slate-300 focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-500/10 disabled:bg-slate-50 disabled:text-slate-400 transition-all"
                    >
                      {subjects.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                      <option value="Other">Other (Custom Topic)</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                       <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
                    </div>
                </div>
                
                {/* Custom Subject Input */}
                {(!subjects.includes(subject) || subject === "") && (
                    <div className="animate-in fade-in slide-in-from-top-1 duration-200 pt-1">
                        <input
                           type="text"
                           value={subject}
                           onChange={(e) => onSubjectChange(e.target.value)}
                           placeholder="Enter custom topic..."
                           disabled={loading}
                           className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-900 shadow-sm hover:border-slate-300 focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-500/10 disabled:bg-slate-50 disabled:text-slate-400 transition-all placeholder:font-normal placeholder:text-slate-400"
                        />
                    </div>
                )}
             </div>

             {/* Language Selection */}
             <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">
                  Language
                </label>
                <div className="relative">
                    <select
                      value={language}
                      onChange={(e) => onLanguageChange(e.target.value)}
                      disabled={loading}
                      className="w-full appearance-none rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-900 shadow-sm hover:border-slate-300 focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-500/10 disabled:bg-slate-50 disabled:text-slate-400 transition-all"
                    >
                      {languages.map((l) => (
                        <option key={l} value={l}>
                          {l}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                       <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
                    </div>
                </div>
             </div>
          </div>

          <div className="pt-2">
            <button
              onClick={onUpload}
              disabled={loading || !fileName}
              className="group w-full relative overflow-hidden rounded-xl bg-slate-900 px-6 py-4 font-bold text-white shadow-lg shadow-slate-900/10 hover:bg-slate-800 hover:shadow-slate-900/20 hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:hover:translate-y-0 transition-all duration-200"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {stageLabel}
                  </>
                ) : (
                  <>
                    {stageLabel}
                  </>
                )}
              </span>
            </button>
            <p className="mt-3 text-center text-xs text-slate-500">
               Typical analysis time: 2-5 minutes. You can leave the page safely.
            </p>

            {showProgress && (
              <div className="mt-4 rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-600 mb-2">
                  <span>{statusMessage || stageLabel}</span>
                  <span>{effectiveProgress}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-slate-900 transition-all duration-300"
                    style={{ width: `${Math.min(100, Math.max(0, effectiveProgress))}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
