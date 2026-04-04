import { NextRequest, NextResponse } from "next/server";
import { authMiddleware } from "@/lib/middleware/auth";
import { getInstitutionById } from "@/lib/models/Institution";

/**
 * GET /api/institution/[institutionId]
 * Returns institution details (name, userIds) if requester belongs to it or is its admin.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { institutionId: string } }
) {
  try {
    const user = authMiddleware(request);
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized - Invalid or missing token" },
        { status: 401 }
      );
    }

    const { institutionId } = params;
    if (!institutionId) {
      return NextResponse.json(
        { error: "institutionId is required" },
        { status: 400 }
      );
    }

    const institution = await getInstitutionById(institutionId);
    if (!institution) {
      return NextResponse.json(
        { error: "Institution not found" },
        { status: 404 }
      );
    }

    // Access: Institution Admin of this institution OR member by token OR member by institution user list
    const isAdminOfInstitution =
      user.role === "Institution Admin" && String(user.institutionId) === String(institutionId);
    const isMemberByToken = String(user.institutionId) === String(institutionId);
    const isMemberByList = (institution.userIds || []).includes(user.id);

    if (!isAdminOfInstitution && !isMemberByToken && !isMemberByList) {
      return NextResponse.json(
        { error: "Forbidden - Not a member of this institution" },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { success: true, institution },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching institution details:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
