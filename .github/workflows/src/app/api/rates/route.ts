import { NextResponse } from "next/server";
import { getBtcUsd } from "@/lib/crypto";

export const dynamic = "force-dynamic";

export async function GET() {
  const btcUsd = await getBtcUsd();
  return NextResponse.json({ btcUsd, usdt: 1, at: new Date().toISOString() });
}
