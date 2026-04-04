import { NextRequest, NextResponse } from "next/server";
import { authMiddleware } from "@/lib/middleware/auth";
import { searchAnalyses } from "@/lib/models/Analysis";
import { AnalysisSearchFilters } from "@/lib/types/analysis";

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
    
    const filters: AnalysisSearchFilters = {
      userId: user.id, // Always filter by current user
      subject: searchParams.get("subject") || undefined,
      topic: searchParams.get("topic") || undefined,
      dominantEmotion: searchParams.get("dominantEmotion") || undefined,
      status: (searchParams.get("status") as any) || undefined,
      minClarityScore: searchParams.get("minClarityScore") 
        ? parseFloat(searchParams.get("minClarityScore")!) 
        : undefined,
      minConfidenceScore: searchParams.get("minConfidenceScore")
        ? parseFloat(searchParams.get("minConfidenceScore")!)
        : undefined,
      minEngagementScore: searchParams.get("minEngagementScore")
        ? parseFloat(searchParams.get("minEngagementScore")!)
        : undefined,
      minTechnicalDepth: searchParams.get("minTechnicalDepth")
        ? parseFloat(searchParams.get("minTechnicalDepth")!)
        : undefined,
      fromDate: searchParams.get("fromDate")
        ? new Date(searchParams.get("fromDate")!)
        : undefined,
      toDate: searchParams.get("toDate")
        ? new Date(searchParams.get("toDate")!)
        : undefined,
    };

    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = parseInt(searchParams.get("skip") || "0");

    // Search analyses
    const analyses = await searchAnalyses(filters, limit, skip);

    return NextResponse.json(
      {
        message: "Search completed successfully",
        analyses,
        pagination: {
          limit,
          skip,
          count: analyses.length,
        },
        filters,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Search analyses error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
