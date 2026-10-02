import { NextResponse } from "next/server";
import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { ensureDb } from "@/db/bootstrap";
import { bookings } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function POST(req: Request, ctx: { params: Promise<{ reference: string }> }) {
  await ensureDb();
  const { reference } = await ctx.params;
  let body: { txHash?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const txHash = typeof body.txHash === "string" ? body.txHash.trim() : "";
  if (!/^(0x)?[A-Za-z0-9]{20,100}$/.test(txHash)) {
    return NextResponse.json({ error: "Please paste a valid transaction hash (TXID)." }, { status: 400 });
  }
  const updated = await db
    .update(bookings)
    .set({ txHash, status: "payment_submitted" })
    .where(and(eq(bookings.reference, reference), inArray(bookings.status, ["pending_payment", "payment_submitted"])))
    .returning({ reference: bookings.reference });
  if (!updated.length) return NextResponse.json({ error: "Booking not found or already confirmed." }, { status: 404 });
  return NextResponse.json({ ok: true });
}
