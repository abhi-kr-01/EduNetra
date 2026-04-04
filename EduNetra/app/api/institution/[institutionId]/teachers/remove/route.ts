import { NextRequest, NextResponse } from "next/server";
import { authMiddleware } from "@/lib/middleware/auth";
import { getInstitutionById, updateInstitution } from "@/lib/models/Institution";
import { getDatabase } from "@/lib/db/mongodb";

interface RemoveTeacherRequest {
  email: string;
}

/**
 * POST /api/institution/[institutionId]/teachers/remove
 * Remove a teacher from an institution by email
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { institutionId: string } }
) {
  try {
    // Verify authentication
    const user = authMiddleware(request);
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized - Invalid or missing token" },
        { status: 401 }
      );
    }

    const { institutionId } = params;
    const body: RemoveTeacherRequest = await request.json();
    const { email } = body;

    // Validate inputs
    if (!institutionId || !email) {
      return NextResponse.json(
        { error: "institutionId and email are required" },
        { status: 400 }
      );
    }

    // Verify institution exists
    const institution = await getInstitutionById(institutionId);
    if (!institution) {
      return NextResponse.json(
        { error: "Institution not found" },
        { status: 404 }
      );
    }

    // Verify user has access (is the institution admin)
    if (user.role !== "Institution Admin" || String(user.institutionId) !== String(institutionId)) {
      console.log("Access denied for remove teacher", {
        userRole: user.role,
        userInstitutionId: user.institutionId,
        requestedInstitutionId: institutionId,
      });
      return NextResponse.json(
        { error: "Forbidden - Only Institution Admins can remove teachers" },
        { status: 403 }
      );
    }

    // Find user by email
    const db = await getDatabase();
    const usersCollection = db.collection("users");
    
    const teacherUser = await usersCollection.findOne({ email });
    
    if (!teacherUser) {
      return NextResponse.json(
        { error: "User with this email not found" },
        { status: 404 }
      );
    }

    const teacherId = teacherUser._id.toString();

    // Check if teacher is in institution
    if (!institution.userIds.includes(teacherId)) {
      return NextResponse.json(
        { error: "User is not a member of this institution" },
        { status: 400 }
      );
    }

    // Remove teacher from institution
    const updatedInstitution = await updateInstitution(institutionId, {
      userIds: institution.userIds.filter((id) => id !== teacherId),
    });

    if (!updatedInstitution) {
      return NextResponse.json(
        { error: "Failed to remove teacher from institution" },
        { status: 500 }
      );
    }

    // Remove teacher's institutionId field
    await usersCollection.updateOne(
      { _id: teacherUser._id },
      { $unset: { institutionId: "" } }
    );

    return NextResponse.json(
      {
        message: "Teacher removed from institution successfully",
        teacher: {
          id: teacherId,
          email: teacherUser.email,
          name: teacherUser.name,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error removing teacher from institution:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
