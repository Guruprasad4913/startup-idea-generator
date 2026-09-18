import { NextRequest, NextResponse } from "next/server";
import { testMongoConnection } from "@/lib/mongodb";

export async function GET(req: NextRequest) {
  const result = await testMongoConnection();
  return NextResponse.json(result, { status: result.ok ? 200 : 503 });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const uri = body?.uri;
    const result = await testMongoConnection(uri);
    return NextResponse.json(result, { status: result.ok ? 200 : 503 });
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        message: error?.message || "Invalid connection test request",
      },
      { status: 400 }
    );
  }
}
