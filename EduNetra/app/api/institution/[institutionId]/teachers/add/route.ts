import { NextRequest, NextResponse } from "next/server";
import { authMiddleware } from "@/lib/middleware/auth";
import { getInstitutionById } from "@/lib/models/Institution";
import { getDatabase } from "@/lib/db/mongodb";
import { ObjectId } from "mongodb";

interface AddTeacherRequest {
  email: string;
}

/**
 * POST /api/institution/[institutionId]/teachers/add
 * Add a teacher to an institution by email
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
    let body: AddTeacherRequest;
    try {
      body = await request.json();
    } catch (e) {
      console.error("Add teacher - invalid JSON body", e);
      return NextResponse.json(
        { error: "Invalid JSON payload" },
        { status: 400 }
      );
    }
    const email = (body.email || "").trim().toLowerCase();
    console.log("Add teacher request", { institutionId, adminUser: user.id, email });

    // Validate inputs
    if (!institutionId || !email) {
      return NextResponse.json(
        { error: "institutionId and email are required" },
        { status: 400 }
      );
    }

    console.log("Checking institution exists", {
      institutionId,
      isValidObjectId: ObjectId.isValid(institutionId),
    });

    // Verify institution exists
    const institution = await getInstitutionById(institutionId);
    if (!institution) {
      console.error("Institution not found in database", { 
        institutionId,
        adminInstitutionId: user.institutionId
      });
      return NextResponse.json(
        { error: "Institution not found" },
        { status: 404 }
      );
    }
    console.log("Institution found", { 
      institutionName: institution.name,
      userIds: institution.userIds?.length || 0
    });

    // Verify user has access (is the institution admin)
    if (user.role !== "Institution Admin" || String(user.institutionId) !== String(institutionId)) {
      console.log("Access denied for add teacher", {
        userRole: user.role,
        userInstitutionId: user.institutionId,
        requestedInstitutionId: institutionId,
      });
      return NextResponse.json(
        { error: "Forbidden - Only Institution Admins can add teachers" },
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
    // Validate role: only Mentor or Coordinator are eligible
    if (teacherUser.role === "Institution Admin") {
      console.log("Rejected adding institution account as teacher", { teacherId, email });
      return NextResponse.json(
        { error: "Cannot add institution accounts as teachers" },
        { status: 400 }
      );
    }
    if (teacherUser.role !== "Mentor" && teacherUser.role !== "Coordinator") {
      console.log("Rejected user due to unsupported role", { teacherId, email, role: teacherUser.role });
      return NextResponse.json(
        { error: "User must have role 'Mentor' or 'Coordinator'" },
        { status: 400 }
      );
    }

    // Check if teacher is already in this institution
    if (institution.userIds.includes(teacherId)) {
      return NextResponse.json(
        { error: "User is already a member of this institution" },
        { status: 400 }
      );
    }

    // Check if teacher is already in another institution
    if (
      teacherUser.institutionId &&
      String(teacherUser.institutionId) !== String(institutionId)
    ) {
      return NextResponse.json(
        { error: "User is already a member of another institution" },
        { status: 400 }
      );
    }

    // Add teacher to institution via $addToSet for safety
    const institutionsCollection = db.collection("institutions");
    let institutionObjectId: ObjectId;
    try {
      institutionObjectId = new ObjectId(institutionId);
    } catch {
      return NextResponse.json(
        { error: "Invalid institution ID format" },
        { status: 400 }
      );
    }

    const addRes = await institutionsCollection.updateOne(
      { _id: institutionObjectId },
      { $addToSet: { userIds: teacherId }, $set: { updatedAt: new Date() } }
    );
    console.log("Institution update $addToSet result", { matched: addRes.matchedCount, modified: addRes.modifiedCount });
    if (addRes.matchedCount === 0) {
      return NextResponse.json(
        { error: "Institution not found" },
        { status: 404 }
      );
    }

    // Update teacher's institutionId field
    const updateRes = await usersCollection.findOneAndUpdate(
      { _id: teacherUser._id },
      { $set: { institutionId: institutionId, updatedAt: new Date() } },
      { returnDocument: "after" }
    );
    const updatedTeacher = updateRes?.value as any;
    console.log("Updated teacher institutionId via findOneAndUpdate", {
      teacherId,
      updatedInstitutionId: updatedTeacher?.institutionId,
    });
    if (!updatedTeacher || String(updatedTeacher.institutionId) !== String(institutionId)) {
      console.warn("Verification failed after findOneAndUpdate, re-reading teacher doc");
      const verifyDoc = await usersCollection.findOne(
        { _id: teacherUser._id },
        { projection: { institutionId: 1 } }
      );
      console.log("Verify read teacher.institutionId", { institutionId: verifyDoc?.institutionId });
      if (!verifyDoc || String(verifyDoc.institutionId) !== String(institutionId)) {
        console.error("Failed to persist teacher.institutionId", { teacherId, institutionId });
        return NextResponse.json(
          { error: "Failed to update teacher record with institutionId" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      {
        message: "Teacher added to institution successfully",
        teacher: {
          id: teacherId,
          email: teacherUser.email,
          name: teacherUser.name,
          role: teacherUser.role,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error adding teacher to institution:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
