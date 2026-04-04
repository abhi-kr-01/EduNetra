import { NextRequest, NextResponse } from "next/server";
import { createAllIndexes } from "@/lib/db/indexes";

/**
 * Initialize database indexes
 * This should be called once during deployment or setup
 * For production, protect this endpoint or remove it after initial setup
 */
export async function POST(req: NextRequest) {
  try {
    // Optional: Add authentication check here for production
    const authHeader = req.headers.get("x-admin-secret");
    const adminSecret = process.env.ADMIN_SECRET;

    if (adminSecret && authHeader !== adminSecret) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await createAllIndexes();

    return NextResponse.json(
      {
        message: "Database indexes created successfully",
        success: true,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error creating indexes:", error);
    return NextResponse.json(
      {
        error: "Failed to create indexes",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
