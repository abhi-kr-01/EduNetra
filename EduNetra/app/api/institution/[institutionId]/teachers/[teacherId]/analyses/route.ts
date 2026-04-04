import { NextRequest, NextResponse } from "next/server";
import { authMiddleware } from "@/lib/middleware/auth";
import { getDatabase } from "@/lib/db/mongodb";
import { getAnalysesByUserId } from "@/lib/models/Analysis";
import { ObjectId } from "mongodb";

/**
 * GET /api/institution/[institutionId]/teachers/[teacherId]/analyses
 * Fetch analyses for a specific teacher in the institution
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { institutionId: string; teacherId: string } }
) {
  try {
    const user = authMiddleware(req);
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { institutionId, teacherId } = params;
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "10");
    console.log("Fetching analyses for teacher:", { institutionId, teacherId, limit });

    // Verify user is the institution admin
    if (user.role !== "Institution Admin" || user.institutionId !== institutionId) {
      return NextResponse.json(
        { error: "Forbidden - Only institution admins can view teacher analyses" },
        { status: 403 }
      );
    }

    // Verify teacher belongs to this institution
    const db = await getDatabase();
    const usersCollection = db.collection("users");
    
    let teacherObjectId: ObjectId;
    try {
      teacherObjectId = new ObjectId(teacherId);
    } catch {
      return NextResponse.json(
        { error: "Invalid teacher ID format" },
        { status: 400 }
      );
    }
    
    const teacher = await usersCollection.findOne({
      _id: teacherObjectId,
      institutionId: institutionId,
    });

    if (!teacher) {
      return NextResponse.json(
        { error: "Teacher not found in this institution" },
        { status: 404 }
      );
    }

    const analyses = await getAnalysesByUserId(teacherId, limit, 0);
    console.log("Raw analyses from DB:", { count: analyses.length, limit, analyses });

    // Sort by createdAt descending and get top sessions
    const sortedAnalyses = analyses.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });

    return NextResponse.json(
      {
        success: true,
        count: sortedAnalyses.length,
        analyses: sortedAnalyses,
        teacher: {
          id: teacher._id.toString(),
          name: teacher.name,
          email: teacher.email,
        }
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching teacher analyses:", error);
    return NextResponse.json(
      { error: "Failed to fetch teacher analyses", details: error?.message },
      { status: 500 }
    );
  }
}
