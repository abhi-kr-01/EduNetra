import { NextRequest, NextResponse } from "next/server";
import { authMiddleware } from "@/lib/middleware/auth";
import { getInstitutionById, addUserToInstitution, removeUserFromInstitution } from "@/lib/models/Institution";
import { getUserById, getUserByEmail, updateUser } from "@/lib/models/User";

interface ChangeMembershipRequest {
  adminEmail?: string;
  newInstitutionId?: string;
}

/**
 * POST /api/institution/membership
 * Allows a Mentor/Coordinator to change their institution membership.
 * Removes them from old institution (if any) and adds to the new one.
 */
export async function POST(request: NextRequest) {
  try {
    const authUser = authMiddleware(request);
    if (!authUser) {
      return NextResponse.json(
        { error: "Unauthorized - Invalid or missing token" },
        { status: 401 }
      );
    }

    const body: ChangeMembershipRequest = await request.json();
    const adminEmailInput = body.adminEmail?.trim().toLowerCase();
    const institutionIdInput = body.newInstitutionId?.trim();
    if (!adminEmailInput && !institutionIdInput) {
      return NextResponse.json(
        { error: "Provide either adminEmail or newInstitutionId" },
        { status: 400 }
      );
    }

    // Only Mentor/Coordinator can self-change membership
    if (authUser.role !== "Mentor" && authUser.role !== "Coordinator") {
      return NextResponse.json(
        { error: "Forbidden - Only mentors/coordinators can change membership" },
        { status: 403 }
      );
    }

    const requester = await getUserById(authUser.id);
    if (!requester) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Resolve target institution via institution admin email
    let targetInstitutionId: string | undefined = undefined;
    if (adminEmailInput) {
      const adminUser = await getUserByEmail(adminEmailInput);
      if (!adminUser || adminUser.role !== "Institution Admin" || !adminUser.institutionId) {
        return NextResponse.json(
          { error: "Institution admin not found or invalid" },
          { status: 404 }
        );
      }
      targetInstitutionId = adminUser.institutionId;
    } else if (institutionIdInput) {
      targetInstitutionId = institutionIdInput;
    }
    if (!targetInstitutionId) {
      return NextResponse.json(
        { error: "Target institution not resolved" },
        { status: 400 }
      );
    }
    const targetInstitution = await getInstitutionById(targetInstitutionId);
    if (!targetInstitution) {
      return NextResponse.json(
        { error: "Target institution not found" },
        { status: 404 }
      );
    }

    // If already in target institution, do nothing
    if (String(requester.institutionId || "") === String(targetInstitutionId)) {
      return NextResponse.json(
        { message: "Already a member of the target institution" },
        { status: 200 }
      );
    }

    // Remove from old institution if set (no-op if none)
    const oldInstitutionId = requester.institutionId;
    if (oldInstitutionId) {
      try {
        await removeUserFromInstitution(oldInstitutionId, requester.id!);
      } catch (e) {
        // Log but proceed; we want to ensure new membership applies even if old cleanup fails
        console.warn("Failed to remove user from old institution", { oldInstitutionId, userId: requester.id });
      }
    }

    // Add to new institution
    let updatedInstitution;
    try {
      updatedInstitution = await addUserToInstitution(targetInstitutionId, requester.id!);
      console.log("addUserToInstitution result", { targetInstitutionId, userId: requester.id, updatedInstitution });
    } catch (e) {
      console.error("Error adding user to institution:", e);
      return NextResponse.json(
        { error: "Failed to add user to new institution" },
        { status: 500 }
      );
    }
    if (!updatedInstitution) {
      return NextResponse.json(
        { error: "Institution update failed" },
        { status: 500 }
      );
    }

    // Update user's institutionId
    let updatedUser;
    try {
      console.log("Updating user institutionId", { userId: requester.id, targetInstitutionId });
      updatedUser = await updateUser(requester.id!, { institutionId: targetInstitutionId });
    } catch (e) {
      console.error("Error updating user institutionId:", e);
      return NextResponse.json(
        { error: "Failed to persist user institution change" },
        { status: 500 }
      );
    }
    if (!updatedUser) {
      console.error("updateUser returned null", { userId: requester.id, targetInstitutionId });
      return NextResponse.json(
        { error: "Failed to persist user institution change" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: "Membership updated successfully",
        institution: {
          id: updatedInstitution.id,
          name: updatedInstitution.name,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error changing membership:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
