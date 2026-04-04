import { NextRequest, NextResponse } from "next/server";
import { OAuth2Client } from "google-auth-library";
import { getUserByEmail, createUser } from "@/lib/models/User";
import { generateTokens } from "@/lib/utils/jwt";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json({ error: "Missing Google token" }, { status: 400 });
    }

    // Verify Google Token
    let ticket;
    try {
        ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
    } catch (error) {
        console.error("Google Token Verification Failed:", error);
        return NextResponse.json({ error: "Invalid Google token" }, { status: 401 });
    }

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return NextResponse.json({ error: "Invalid token payload" }, { status: 400 });
    }

    const { email, name, picture, sub: googleId } = payload;

    // Check if user exists
    let user = await getUserByEmail(email);

    if (!user) {
      // Register new user
      try {
          const newUser = await createUser({
            email,
            name: name || "Google User",
            role: "Mentor", // Default role
            googleId,
            image: picture,
            password: "", // No password for Google users
          });
          
          // UserResponse from createUser has id as string, which is what we need
          user = {
              ...newUser,
              // UserResponse doesn't have password, which is fine
          } as any; // Cast to avoid strict type mismatch if any intermediate types differ
      } catch (err: any) {
             console.error("Error creating user:", err);
             return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
      }
    } else {
        // User exists - optionally sync googleId/image here if we implemented updateUser
        // For now, allow login
    }

    if (!user || !user.id) {
         return NextResponse.json({ error: "User not found or created" }, { status: 500 });
    }

    // Generate JWTs
    const { accessToken, refreshToken } = generateTokens({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    const response = NextResponse.json(
      {
        message: "Login successful",
        accessToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          image: user.image || picture // Return image if available
        },
      },
      { status: 200 }
    );

    // Set refresh token cookie
    response.cookies.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    return response;

  } catch (error) {
    console.error("Google Auth Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
