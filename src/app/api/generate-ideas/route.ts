import { NextRequest, NextResponse } from "next/server";
import { generateStartupIdeas } from "@/lib/ai-engine";
import { FounderProfile } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { profile, apiKey } = body as { profile: FounderProfile; apiKey?: string };

    if (!profile || !profile.domains || profile.domains.length === 0) {
      return NextResponse.json(
        { error: "At least one domain or area of interest is required." },
        { status: 400 }
      );
    }

    const ideas = await generateStartupIdeas(profile, { apiKey });
    return NextResponse.json({ success: true, ideas });
  } catch (error: any) {
    console.error("Error in generate-ideas route:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate ideas" },
      { status: 500 }
    );
  }
}
