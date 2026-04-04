import { NextRequest, NextResponse } from "next/server";
import { authMiddleware } from "@/lib/middleware/auth";
import { getUserById } from "@/lib/models/User";

// GET /api/auth/me - returns the authenticated user's latest data
export async function GET(request: NextRequest) {
  const authUser = authMiddleware(request);
  if (!authUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await getUserById(authUser.id);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      institutionId: user.institutionId,
      image: user.image,
    },
    { status: 200 }
  );
}
