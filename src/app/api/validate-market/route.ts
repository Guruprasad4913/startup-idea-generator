import { NextRequest, NextResponse } from "next/server";
import { validateMarketIdea } from "@/lib/ai-engine";
import { fetchLiveMarketSignals } from "@/lib/market-api";
import { StartupIdea, FounderProfile } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { idea, profile, apiKey, tavilyApiKey } = body as {
      idea: StartupIdea;
      profile: FounderProfile;
      apiKey?: string;
      tavilyApiKey?: string;
    };

    if (!idea || !idea.id) {
      return NextResponse.json({ error: "Valid startup idea is required." }, { status: 400 });
    }

    // 1. Fetch live market signals & web research (via Tavily if key supplied, with graceful fallbacks)
    let liveSignals: { trends: any[]; tavilyAnswer?: string; usedTavily: boolean } = {
      trends: [],
      tavilyAnswer: undefined,
      usedTavily: false,
    };
    try {
      liveSignals = await fetchLiveMarketSignals(
        idea.domain,
        idea.tags || [],
        tavilyApiKey,
        idea.name
      );
    } catch (e) {
      console.warn("Live market signals fetch error:", e);
    }

    // 2. Generate market validation, grounded with Tavily web research if available
    const validation = await validateMarketIdea(idea, profile, {
      apiKey,
      tavilyApiKey,
      tavilyContext: liveSignals.tavilyAnswer,
    });

    // 3. Attach Tavily indicators and verified citations
    if (liveSignals.usedTavily) {
      validation.usedTavily = true;
      if (liveSignals.tavilyAnswer) {
        validation.tavilyResearchSummary = liveSignals.tavilyAnswer;
      }
    }

    if (liveSignals.trends && liveSignals.trends.length > 0) {
      validation.realTimeTrends = liveSignals.trends.slice(0, 4);
    }

    return NextResponse.json({ success: true, validation });
  } catch (error: any) {
    console.error("Error in validate-market route:", error);
    return NextResponse.json(
      { error: error.message || "Failed to validate market" },
      { status: 500 }
    );
  }
}

