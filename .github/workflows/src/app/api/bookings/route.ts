import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { ensureDb } from "@/db/bootstrap";
import { aircraft, airports, bookings, perks } from "@/db/schema";
import { computeTotals, haversineKm, JET_EXCLUDED_TYPES, type TripType } from "@/lib/pricing";
import { PAY_METHODS, type PayMethod } from "@/lib/payments";
import { getBtcUsd, walletFor } from "@/lib/crypto";

export const dynamic = "force-dynamic";

const ALPHA = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
function makeReference() {
  const bytes = randomBytes(8);
  return "SJ-" + Array.from(bytes, (b) => ALPHA[b % ALPHA.length]).join("");
}
const label = (a: { city: string; name: string; code: string }) =>
  `${a.city ? a.city + " — " : ""}${a.name} (${a.code})`;

const fail = (error: string, status = 400) => NextResponse.json({ error }, { status });
const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const isDate = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s));

export async function POST(req: Request) {
  await ensureDb();
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return fail("Invalid request body.");
  }

  const aircraftId = Number(body.aircraftId);
  const originId = Number(body.originId);
  const destinationId = Number(body.destinationId);
  const tripType: TripType = body.tripType === "round-trip" ? "round-trip" : "one-way";
  const passengers = Number(body.passengers);
  const departDate = str(body.departDate, 10);
  const returnDate = str(body.returnDate, 10);
  const departTime = str(body.departTime, 5);
  const returnTime = str(body.returnTime, 5);
  const fullName = str(body.fullName, 120);
  const email = str(body.email, 160).toLowerCase();
  const phone = str(body.phone, 40);
  const notes = str(body.notes, 1000);
  const payMethod = body.payMethod as PayMethod;
  const perkSlugs = Array.isArray(body.perkSlugs) ? (body.perkSlugs as unknown[]).filter((s): s is string => typeof s === "string").slice(0, 20) : [];

  if (!Number.isInteger(aircraftId) || !Number.isInteger(originId) || !Number.isInteger(destinationId)) return fail("Please select an aircraft, origin and destination.");
  if (originId === destinationId) return fail("Origin and destination must be different.");
  if (!isDate(departDate)) return fail("Please choose a valid departure date.");
  if (departDate < new Date().toISOString().slice(0, 10)) return fail("Departure date cannot be in the past.");
  if (tripType === "round-trip" && (!isDate(returnDate) || returnDate < departDate)) return fail("Return date must be on or after the departure date.");
  if (!fullName || fullName.length < 2) return fail("Please enter your full name.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail("Please enter a valid email address.");
  if (phone.replace(/\D/g, "").length < 7) return fail("Please enter a valid phone number.");
  if (!PAY_METHODS.some((m) => m.id === payMethod)) return fail("Please choose a payment method.");

  const [craft] = await db.select().from(aircraft).where(eq(aircraft.id, aircraftId));
  if (!craft) return fail("Aircraft not found.", 404);
  if (!Number.isInteger(passengers) || passengers < 1 || passengers > craft.seats) return fail(`This aircraft seats 1–${craft.seats} passengers.`);

  const ap = await db.select().from(airports).where(inArray(airports.id, [originId, destinationId]));
  const origin = ap.find((a) => a.id === originId);
  const dest = ap.find((a) => a.id === destinationId);
  if (!origin || !dest) return fail("Airport not found.", 404);
  if (craft.kind === "jet" && (JET_EXCLUDED_TYPES.includes(origin.type) || JET_EXCLUDED_TYPES.includes(dest.type)))
    return fail("Jets cannot operate from heliports or seaplane bases. Please choose a helicopter or a different airport.");

  const distance = haversineKm(origin.lat, origin.lon, dest.lat, dest.lon);
  if (distance < 5) return fail("Origin and destination are too close together.");
  if (distance > craft.rangeKm) return fail(`This route is ${distance.toLocaleString()} km, beyond the ${craft.rangeKm.toLocaleString()} km range of the ${craft.name}. Please choose a longer-range aircraft.`);

  const perkRows = perkSlugs.length ? await db.select().from(perks).where(inArray(perks.slug, perkSlugs)) : [];
  const totals = computeTotals({
    trip: tripType,
    oneWayUsd: craft.oneWayUsd,
    roundTripUsd: craft.roundTripUsd,
    perkPrices: perkRows.map((p) => p.priceUsd),
  });

  let payAmount: string | null = null;
  let btcRate: number | null = null;
  if (payMethod === "BTC") {
    btcRate = await getBtcUsd();
    if (btcRate) payAmount = (totals.total / btcRate).toFixed(8);
  } else {
    payAmount = totals.total.toFixed(2);
  }

  const reference = makeReference();
  await db.insert(bookings).values({
    reference,
    aircraftId: craft.id,
    aircraftName: craft.name,
    tripType,
    originId: origin.id,
    destinationId: dest.id,
    originLabel: label(origin),
    destinationLabel: label(dest),
    distanceKm: distance,
    departDate,
    departTime,
    returnDate: tripType === "round-trip" ? returnDate : null,
    returnTime: tripType === "round-trip" ? returnTime : null,
    passengers,
    perkSlugs: perkRows.map((p) => p.slug),
    fullName,
    email,
    phone,
    notes,
    baseUsd: totals.base,
    perksUsd: totals.perks,
    totalUsd: totals.total,
    payMethod,
    payAmount,
    btcRateUsd: btcRate ? btcRate.toFixed(2) : null,
    payAddress: walletFor(payMethod),
    status: "pending_payment",
  });

  return NextResponse.json({ reference });
}
