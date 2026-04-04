import { NextRequest, NextResponse } from "next/server";
import { authMiddleware } from "@/lib/middleware/auth";
import { createAnalysis, updateAnalysis } from "@/lib/models/Analysis";
import { Client } from "@gradio/client";
import { transformMLResponse } from "@/lib/services/analysisService";
export const runtime = "nodejs";


const HF_SPACE = "genathon00/sikshanetra-model";
export const maxDuration = 300; 
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate
    const user = authMiddleware(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { originalVideoUrl, compressedVideoUrl, subject, language, fileName, fileSize, mimeType, publicId } = body || {};

    if (!originalVideoUrl || !subject || !language) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // ---------------------------------------------------------
    // STEP 1: JOB BANANA (Create DB Entry Immediately)
    // ---------------------------------------------------------
    const initialAnalysis = await createAnalysis({
      userId: user.id,
      videoUrl: originalVideoUrl, 
      subject,
      language,
      videoMetadata: {
        fileName: fileName || "video.mp4",
        fileSize,
        mimeType,
        videoUrl: originalVideoUrl,
        compressedVideoUrl,
        storagePath: publicId,
        cloudinaryPublicId: publicId,
      },
      // Status: Processing, Progress: 0%
      progress: 0,
      status: "processing" 
    });

    // ---------------------------------------------------------
    // STEP 2: BACKGROUND TASK DEFINE KARNA
    // (Ye function run karega lekin hum iska wait nahi karenge response ke liye)
    // ---------------------------------------------------------
    const backgroundTask = async () => {
      try {
        console.log(`[Background] Starting job ${initialAnalysis.id}`);
        
        await updateAnalysis(initialAnalysis.id, { progress: 10 });

        // Use compressed URL for analysis if available, otherwise original
        const analysisUrl = compressedVideoUrl || originalVideoUrl;
        const downloadResponse = await fetch(analysisUrl);
        if (!downloadResponse.ok) {
          throw new Error(`Failed to fetch video (${downloadResponse.status})`);
        }

        const buffer = await downloadResponse.arrayBuffer();
        const fallbackMime = mimeType || downloadResponse.headers.get("content-type") || "video/mp4";

        const client = await Client.connect(HF_SPACE);
        const prediction = await client.predict("/analyze_session", {
          video: new Blob([buffer], { type: fallbackMime }),
        });

        await updateAnalysis(initialAnalysis.id, { progress: 80 });

        const [summary, scores, feedback, rawData] = (prediction as any).data;
        
        const transformedData = transformMLResponse(
          { success: true, data: rawData },
          user.id,
          {
            fileName: fileName || "video.mp4",
            fileSize,
            mimeType: fallbackMime,
            videoUrl: originalVideoUrl,
            compressedVideoUrl,
            storagePath: publicId,
            cloudinaryPublicId: publicId,
          },
          subject,
          language,
          (rawData as any)?.session_id
        );

        // FINAL UPDATE: Completed (100%)
        await updateAnalysis(initialAnalysis.id, {
          ...transformedData,
          videoUrl: originalVideoUrl,
          status: "completed",
          progress: 100
        });
        
        console.log(`[Background] Job ${initialAnalysis.id} Completed`);

      } catch (err: any) {
        console.error(`[Background] Job ${initialAnalysis.id} Failed:`, err);
        await updateAnalysis(initialAnalysis.id, { 
          status: "failed", 
          progress: 0,
          coachFeedbackError: err.message 
        });
      }
    };

    // ---------------------------------------------------------
    // STEP 3: EXECUTE & RETURN IMMEDIATELY
    // ---------------------------------------------------------
    
    // Try to use Edge-style waitUntil when available; otherwise detach with setTimeout
    const maybeReqAny = req as unknown as { waitUntil?: (p: Promise<any>) => void };
    if (typeof maybeReqAny.waitUntil === "function") {
      maybeReqAny.waitUntil(backgroundTask());
    } else {
      setTimeout(() => {
        backgroundTask().catch((e) => console.error("Background task error:", e));
      }, 0);
    }

    // Frontend ko turant job ID return kar do
    return NextResponse.json({
      success: true,
      message: "Analysis started in background",
      analysisId: initialAnalysis.id,
      status: "processing",
      progress: 0
    });

  } catch (error: any) {
    console.error("Route error:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}