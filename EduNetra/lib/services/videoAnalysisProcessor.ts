import { createAnalysis } from "@/lib/models/Analysis";
import { updateJob } from "@/lib/models/Job";
import { updateMemoryFromAnalysis } from "@/lib/models/Memory";
import { transformMLResponse } from "@/lib/services/analysisService";
import { generateCoachFeedback, generateFallbackFeedback } from "@/lib/services/feedbackService";
import type { JobStatus } from "@/lib/types/job";
import { Client } from "@gradio/client";

export const runtime = "nodejs";

function toUserFriendlyJobError(raw: unknown): string {
  const message = typeof raw === "string" ? raw : (raw as any)?.message;
  const msg = (message || "").toString();
  const lower = msg.toLowerCase();

  if (!msg) return "Analysis failed. Please try again.";
  if (lower.includes("timeout") || lower.includes("timed out")) {
    return "Analysis timed out. Please try again with a shorter video or retry later.";
  }
  if (lower.includes("rate") && (lower.includes("limit") || lower.includes("429"))) {
    return "The analysis service is busy (rate-limited). Please wait a minute and try again.";
  }
  if (lower.includes("upload")) {
    return "Video upload failed. Please check your connection and try again.";
  }
  if (lower.includes("network") || lower.includes("fetch") || lower.includes("econn") || lower.includes("enotfound")) {
    return "Network error while contacting the analysis service. Please try again.";
  }

  return msg.length > 180 ? `${msg.slice(0, 180)}…` : msg;
}

const HF_SPACE = "genathon00/sikshanetra-model";

/**
 * Background processor for video analysis. Safe to call from routes.
 */
export async function processVideoAnalysis(
  jobId: string,
  videoUrl: string,
  userId: string,
  subject: string,
  language: string,
  videoMetadataFromJob?: {
    fileName?: string;
    fileSize?: number;
    mimeType?: string;
    storagePath?: string;
    videoUrl?: string;
    compressedVideoUrl?: string;
  }
) {
  const statusRank: Record<JobStatus, number> = {
    created: 0,
    analyzing: 2,
    analysis_done: 3,
    generating_feedback: 4,
    completed: 5,
    failed: 99,
    uploading: 1, // legacy
    uploaded: 2, // legacy
  };

  let currentStatus: JobStatus = "created";
  let currentProgress = 0;

  const setStatus = async (
    nextStatus: JobStatus,
    nextProgress?: number,
    extra?: Record<string, unknown>
  ) => {
    if (statusRank[nextStatus] < statusRank[currentStatus]) return;
    currentStatus = nextStatus;
    if (typeof nextProgress === "number") {
      currentProgress = Math.max(currentProgress, nextProgress);
    }
    await updateJob(jobId, {
      status: nextStatus,
      ...(typeof nextProgress === "number" ? { progress: currentProgress } : {}),
      ...(extra || {}),
    } as any);
  };

  try {
    // PHASE 1 — DOWNLOAD (Cloudinary already stores the file)
    // videoUrl parameter is the analysis URL (compressed if available)
    // videoMetadataFromJob.videoUrl is the original URL for reports
    const videoMetadata = {
      fileName: videoMetadataFromJob?.fileName || "video.mp4",
      fileSize: videoMetadataFromJob?.fileSize,
      mimeType: videoMetadataFromJob?.mimeType,
      storagePath: videoMetadataFromJob?.storagePath,
      videoUrl: videoMetadataFromJob?.videoUrl || videoUrl, // Original URL for reports
      compressedVideoUrl: videoMetadataFromJob?.compressedVideoUrl,
    };

    await setStatus("analyzing", 15, { videoMetadata });

    // Download from analysis URL (compressed if provided, otherwise original)
    const downloadResponse = await fetch(videoUrl);
    if (!downloadResponse.ok) {
      await setStatus("failed", undefined, {
        error: toUserFriendlyJobError(
          `Failed to download video for analysis (${downloadResponse.status})`
        ),
      });
      return;
    }

    const buffer = await downloadResponse.arrayBuffer();
    const mimeType =
      videoMetadata.mimeType ||
      downloadResponse.headers.get("content-type") ||
      "video/mp4";

    // PHASE 2 — ANALYSIS
    await setStatus("analyzing", 35);

    const client = await Client.connect(HF_SPACE);
    const videoBlob = new Blob([buffer], { type: mimeType });

    const result = await client.predict(
      "/analyze_session_with_status",
      { video: videoBlob, topic_name: subject }
    );

    if (!result || !result.data) {
      await setStatus("failed", undefined, {
        error: toUserFriendlyJobError("Analysis service returned no data"),
      });
      return;
    }

    await setStatus("analysis_done", 70);

    const [, , , rawData] = (result as any).data;

    const transformed = transformMLResponse(
      { success: true, data: rawData },
      userId,
      videoMetadata,
      subject,
      language,
      videoMetadata.videoUrl
    );

    // PHASE 3 — FEEDBACK
    await setStatus("generating_feedback", 75);

    let coachFeedback: any;
    let coachFeedbackError: any;

    try {
      const feedbackResult = await generateCoachFeedback({
        userId,
        topic: rawData.topic || subject,
        language,
        transcript: rawData.transcript || "",
        scores: rawData.scores,
      });

      if (feedbackResult.success) {
        coachFeedback = feedbackResult.feedback;
      } else {
        coachFeedbackError = feedbackResult.error;
        const user = await import("@/lib/models/User").then(m => m.getUserById(userId));
        coachFeedback = generateFallbackFeedback(user?.name || "Teacher", rawData.scores);
      }
    } catch (err: any) {
      coachFeedbackError = err?.message;
      const user = await import("@/lib/models/User").then(m => m.getUserById(userId));
      coachFeedback = generateFallbackFeedback(user?.name || "Teacher", rawData.scores);
    }

    await setStatus("generating_feedback", 90);

    const savedAnalysis = await createAnalysis({
      ...transformed,
      sessionId: transformed.sessionId || `sess_${Date.now()}`,
      coachFeedback,
      coachFeedbackError,
    });

    // Non-blocking memory update
    updateMemoryFromAnalysis(userId, savedAnalysis).catch((error) => {
      console.warn("Memory update failed (non-critical):", (error as any)?.message);
    });

    await setStatus("completed", 100, { analysisId: savedAnalysis.id });

  } catch (error: any) {
    console.error("Background processing error for job:", jobId, error);
    await updateJob(jobId, { status: "failed", error: toUserFriendlyJobError(error) });
  }
}
