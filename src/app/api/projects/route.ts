import { NextRequest, NextResponse } from "next/server";
import { getProjectsCollection } from "@/lib/mongodb";
import { StartupProject } from "@/types";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get("username")?.trim();
    const userId = searchParams.get("userId")?.trim();
    const role = searchParams.get("role")?.trim();

    const col = await getProjectsCollection();
    let query: any = {};

    if (role === "admin") {
      // Admins have platform-wide visibility
      query = {};
    } else if (username || userId) {
      // Regular users only see their own reports (case-insensitive username or exact userId)
      const orConditions: any[] = [];
      if (username) {
        orConditions.push({
          username: { $regex: new RegExp(`^${username.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") },
        });
      }
      if (userId) {
        orConditions.push({ userId });
      }
      query = { $or: orConditions };
    } else {
      // Unspecified / unauthenticated requests cannot access other users' reports
      return NextResponse.json({
        success: true,
        projects: [],
        source: "mongodb",
        count: 0,
      });
    }

    const projects = await col
      .find(query, { projection: { _id: 0 } })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({
      success: true,
      projects,
      source: "mongodb",
      count: projects.length,
    });
  } catch (error: any) {
    console.warn("MongoDB GET /api/projects fallback:", error?.message);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "MongoDB is not reachable or not configured",
        projects: [],
        source: "fallback",
      },
      { status: 200 } // Return 200 with fallback indicator so client can handle smoothly
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const project = (body.project || body) as StartupProject;
    const bodyUsername = body.username || project.username;
    const bodyUserId = body.userId || project.userId;

    if (!project || !project.id || !project.selectedIdea) {
      return NextResponse.json(
        { error: "Invalid startup project payload" },
        { status: 400 }
      );
    }

    // Ensure user ownership is tagged on the project document
    if (bodyUsername && !project.username) {
      project.username = bodyUsername;
    }
    if (bodyUserId && !project.userId) {
      project.userId = bodyUserId;
    }

    const col = await getProjectsCollection();
    await col.replaceOne(
      { id: project.id },
      { ...project, updatedAt: new Date().toISOString() } as any,
      { upsert: true }
    );

    return NextResponse.json({
      success: true,
      id: project.id,
      message: "Project successfully persisted to MongoDB",
    });
  } catch (error: any) {
    console.warn("MongoDB POST /api/projects error:", error?.message);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to persist project to MongoDB",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const username = searchParams.get("username")?.trim();
    const userId = searchParams.get("userId")?.trim();
    const role = searchParams.get("role")?.trim();

    if (!id) {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 }
      );
    }

    const col = await getProjectsCollection();

    // Security check: if not admin, ensure the project belongs to the requesting user
    if (role !== "admin" && (username || userId)) {
      const existing = await col.findOne({ id });
      if (existing) {
        const pUname = existing.username?.toLowerCase().trim();
        const pUid = existing.userId;
        const matchesUsername = username && pUname && pUname === username.toLowerCase();
        const matchesUserId = userId && pUid && pUid === userId;
        if (!matchesUsername && !matchesUserId) {
          return NextResponse.json(
            { error: "Unauthorized to delete this project" },
            { status: 403 }
          );
        }
      }
    }

    const result = await col.deleteOne({ id });

    return NextResponse.json({
      success: true,
      deletedCount: result.deletedCount,
      id,
    });
  } catch (error: any) {
    console.warn("MongoDB DELETE /api/projects error:", error?.message);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to delete project from MongoDB",
      },
      { status: 500 }
    );
  }
}
