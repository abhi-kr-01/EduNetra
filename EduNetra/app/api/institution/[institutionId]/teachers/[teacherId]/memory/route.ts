import { NextRequest, NextResponse } from "next/server";
import { authMiddleware } from "@/lib/middleware/auth";
import { getDatabase } from "@/lib/db/mongodb";
import { getMemoryByUserId } from "@/lib/models/Memory";
import { ObjectId } from "mongodb";

/**
 * GET /api/institution/[institutionId]/teachers/[teacherId]/memory
 * Fetch memory/summary for a specific teacher in the institution
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

    // Verify user is the institution admin
    if (user.role !== "Institution Admin" || user.institutionId !== institutionId) {
      return NextResponse.json(
        { error: "Forbidden - Only institution admins can view teacher memory" },
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

    const memory = await getMemoryByUserId(teacherId);

    return NextResponse.json(
      { 
        success: true, 
        memory: memory || null,
        teacher: {
          id: teacher._id.toString(),
          name: teacher.name,
          email: teacher.email,
        }
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching teacher memory:", error);
    return NextResponse.json(
      { error: "Failed to fetch teacher memory", details: error?.message },
      { status: 500 }
    );
  }
}
