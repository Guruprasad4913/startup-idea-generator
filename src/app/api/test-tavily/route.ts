import { NextRequest, NextResponse } from 'next/server';
import { testTavilyConnection } from '@/lib/market-api';

export async function POST(req: NextRequest) {
  try {
    const { apiKey } = await req.json();
    const keyToTest = (apiKey && apiKey.trim()) || process.env.TAVILY_API_KEY || "";
    const result = await testTavilyConnection(keyToTest);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, message: err?.message || 'Failed to test Tavily key' },
      { status: 500 }
    );
  }
}
