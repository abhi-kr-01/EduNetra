import { NextRequest, NextResponse } from "next/server";
import { authMiddleware } from "@/lib/middleware/auth";
import { getInstitutionById } from "@/lib/models/Institution";
import { getDatabase } from "@/lib/db/mongodb";
import { ObjectId } from "mongodb";

/**
 * GET /api/institution/[institutionId]/teachers
 * Fetch all teachers (users) in an institution
 */
export async function GET(
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
    // Validate institutionId
    if (!institutionId) {
      console.log("Fetch teachers - missing institutionId", { user });
      return NextResponse.json(
        { error: "institutionId is required" },
        { status: 400 }
      );
    }

    console.log("Fetch teachers - institutionId:", institutionId, "user:", user);

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
      console.log("Access denied", {
        userRole: user.role,
        userInstitutionId: user.institutionId,
        requestedInstitutionId: institutionId,
      });
      return NextResponse.json(
        { error: "Forbidden - Only institution admins can view teachers" },
        { status: 403 }
      );
    }

    // Fetch all users (teachers) in this institution
    const { userIds = [] } = institution;
    console.log("Institution userIds array:", userIds);

    if (userIds.length === 0) {
      return NextResponse.json(
        { success: true, count: 0, teachers: [] },
        { status: 200 }
      );
    }

    const db = await getDatabase();
    const usersCollection = db.collection("users");

    const teacherObjectIds = userIds
      .map((id: string) => {
        try {
          return new ObjectId(id);
        } catch {
          console.error("Invalid ObjectId for teacher userId:", id);
          return null;
        }
      })
      .filter((id): id is ObjectId => id !== null);

    console.log(
      "Searching for teachers with IDs:",
      teacherObjectIds.map((id) => id.toString())
    );

    const teachers = await usersCollection
      .find({
        _id: { $in: teacherObjectIds },
        role: { $in: ["Mentor", "Coordinator"] },
      })
      .project({ password: 0 })
      .toArray();

    // Transform to proper format
    const teachersList = teachers.map((teacher: any) => ({
      id: teacher._id.toString(),
      email: teacher.email,
      name: teacher.name,
      role: teacher.role,
      createdAt: teacher.createdAt,
      updatedAt: teacher.updatedAt,
    }));

    return NextResponse.json(
      { success: true, count: teachersList.length, teachers: teachersList },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching institution teachers:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
