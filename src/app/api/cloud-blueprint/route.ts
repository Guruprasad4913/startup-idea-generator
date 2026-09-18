import { NextRequest, NextResponse } from "next/server";
import { generateCloudFeasibility } from "@/lib/ai-engine";
import { StartupIdea, MarketValidation, FounderProfile } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { idea, validation, profile, apiKey } = body as {
      idea: StartupIdea;
      validation: MarketValidation;
      profile: FounderProfile;
      apiKey?: string;
    };

    if (!idea || !validation) {
      return NextResponse.json(
        { error: "Idea and market validation data are required." },
        { status: 400 }
      );
    }

    const feasibility = await generateCloudFeasibility(idea, validation, profile, { apiKey });
    return NextResponse.json({ success: true, feasibility });
  } catch (error: any) {
    console.error("Error in cloud-blueprint route:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate cloud feasibility blueprint" },
      { status: 500 }
    );
  }
}
