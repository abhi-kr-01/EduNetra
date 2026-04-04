import { NextRequest, NextResponse } from "next/server";
import { validateLoginRequest } from "@/lib/validators/auth";
import { generateTokens } from "@/lib/utils/jwt";
import { authenticateUser } from "@/lib/services/authService";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate request
    const validation = validateLoginRequest(body);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { email, password } = body;

    // Authenticate user against MongoDB
    const user = await authenticateUser(email, password);
    console.log("User authenticated:", { 
      id: user.id, 
      email: user.email, 
      role: user.role,
      institutionId: user.institutionId 
    });

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens({
      id: user.id,
      email: user.email,
      role: user.role,
      institutionId: user.institutionId,
    });
    console.log("Tokens generated with payload:", {
      id: user.id,
      email: user.email,
      role: user.role,
      institutionId: user.institutionId,
    });

    // Set refresh token in HTTP-only cookie
    const response = NextResponse.json(
      {
        message: "Login successful",
        accessToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          institutionId: user.institutionId,
        },
      },
      { status: 200 }
    );

    response.cookies.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { error: message },
      { status: error instanceof Error && message.includes("Invalid") ? 401 : 500 }
    );
  }
}
