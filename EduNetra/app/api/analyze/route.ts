import { NextRequest, NextResponse } from "next/server";
import { authMiddleware } from "@/lib/middleware/auth";
// UPDATE: Import from the new models folder
import { createJob } from "@/lib/models/Job";
import { processVideoAnalysis } from "@/lib/services/videoAnalysisProcessor";

// Configure route segment for large file uploads
export const runtime = "nodejs";
export const maxDuration = 300; // 5 minutes max for upload
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate user
    const user = authMiddleware(req);
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized - invalid or missing token" },
        { status: 401 }
      );
    }

    // 2. Parse JSON payload (browser already uploaded to Cloudinary)
    const body = await req.json();
    const {
      originalVideoUrl,
      compressedVideoUrl,
      publicId,
      fileName,
      fileSize,
      mimeType,
      subject,
      language,
    } = body || {};

    if (!originalVideoUrl || !subject || !language || !fileName) {
      return NextResponse.json(
        { error: "originalVideoUrl, fileName, subject, and language are required" },
        { status: 400 }
      );
    }

    // Store original URL in metadata for reports, use compressed for analysis
    const videoMetadata = {
      fileName,
      fileSize,
      mimeType,
      videoUrl: originalVideoUrl,
      compressedVideoUrl,
      storagePath: publicId,
      cloudinaryPublicId: publicId,
    };

    // 3. Create job with Cloudinary metadata
    const job = await createJob({
      userId: user.id,
      videoMetadata,
      subject,
      language,
    });

    console.log("Created job:", job.id);

    // 4. Start async processing (don't await)
    // Use compressed URL for analysis if available, otherwise original
    const analysisUrl = compressedVideoUrl || originalVideoUrl;
    processVideoAnalysis(job.id, analysisUrl, user.id, subject, language, videoMetadata).catch(
      (error) => {
        console.error("Fatal error in background process:", error);
      }
    );

    // 5. Return job immediately for frontend tracking
    return NextResponse.json(
      {
        success: true,
        job,
      },
      { status: 202 }
    );

  } catch (error: any) {
    console.error("Job creation error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to create analysis job",
        details: error?.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}