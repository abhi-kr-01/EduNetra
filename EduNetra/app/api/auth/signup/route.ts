import { NextRequest, NextResponse } from "next/server";
import { validateSignupRequest } from "@/lib/validators/auth";
import { generateTokens } from "@/lib/utils/jwt";
import { registerUser } from "@/lib/services/authService";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate request
    const validation = validateSignupRequest(body);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { email, password, name, role = "Mentor" } = body;
    console.log("Signup request received", { email, name, role });

    // Register user in MongoDB
    const user = await registerUser(email, password, name, role);
    console.log("User registered successfully", { 
      userId: user.id, 
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

    // Set refresh token in HTTP-only cookie
    const response = NextResponse.json(
      {
        message: "Signup successful",
        accessToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          institutionId: user.institutionId,
        },
      },
      { status: 201 }
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
    console.error("Signup error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    
    if (message.includes("already exists")) {
      return NextResponse.json(
        { error: message },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
