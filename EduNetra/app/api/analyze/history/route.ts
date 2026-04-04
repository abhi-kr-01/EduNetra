import { NextRequest, NextResponse } from "next/server";
import { authMiddleware } from "@/lib/middleware/auth";
import { getAnalysesByUserId, getAnalysisStats } from "@/lib/models/Analysis";

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    // Verify authentication
    const user = authMiddleware(req);
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized - Invalid or missing token" },
        { status: 401 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = parseInt(searchParams.get("skip") || "0");
    const includeStats = searchParams.get("includeStats") === "true";

    // Get user's analyses
    const analyses = await getAnalysesByUserId(user.id, limit, skip);

    // Get stats if requested
    let stats = undefined;
    if (includeStats) {
      stats = await getAnalysisStats(user.id);
    }

    return NextResponse.json(
      {
        message: "Analyses retrieved successfully",
        analyses,
        stats,
        pagination: {
          limit,
          skip,
          count: analyses.length,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get analyses error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
