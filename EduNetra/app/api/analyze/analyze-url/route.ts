import { NextRequest, NextResponse } from "next/server";

const PYTHON_BACKEND_URL = process.env.PYTHON_BACKEND_URL || "http://127.0.0.1:5000";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.url) {
      return NextResponse.json(
        { error: "Missing 'url' in request body" },
        { status: 400 }
      );
    }

    console.log(`[API] Forwarding to: ${PYTHON_BACKEND_URL}/analyze_from_url`);

    const response = await fetch(`${PYTHON_BACKEND_URL}/analyze_from_url`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: body.url,
        topic: body.topic || "General",
      }),
      // @ts-ignore
      signal: AbortSignal.timeout(300000), // 5 min timeout for long videos
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || "Backend error" },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: 200 });

  } catch (error) {
    console.error("[API] Error:", error);
    return NextResponse.json(
      { 
        error: "Failed to connect to Python backend",
        details: String(error),
        hint: "Make sure Python Flask is running on http://127.0.0.1:5000"
      },
      { status: 500 }
    );
  }
}