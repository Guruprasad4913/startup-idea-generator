import { NextRequest, NextResponse } from "next/server";
import { getProjectsCollection } from "@/lib/mongodb";
import { StartupProject } from "@/types";

export async function GET(req: NextRequest) {
  try {
    const col = await getProjectsCollection();
    const projects = await col
      .find({}, { projection: { _id: 0 } })
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

    if (!project || !project.id || !project.selectedIdea) {
      return NextResponse.json(
        { error: "Invalid startup project payload" },
        { status: 400 }
      );
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

    if (!id) {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 }
      );
    }

    const col = await getProjectsCollection();
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
