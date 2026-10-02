import { asc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { ensureDb } from "@/db/bootstrap";
import { aircraft, airports, perks } from "@/db/schema";

export async function getAircraft(kind?: "jet" | "helicopter") {
  await ensureDb();
  const q = db.select().from(aircraft);
  const rows = kind ? await q.where(eq(aircraft.kind, kind)).orderBy(asc(aircraft.sortOrder)) : await q.orderBy(asc(aircraft.sortOrder));
  return rows;
}

export async function getPerks() {
  await ensureDb();
  return db.select().from(perks).orderBy(asc(perks.sortOrder));
}

export async function getAirportStats() {
  await ensureDb();
  const rows = await db
    .select({
      cls: airports.class,
      cc: airports.countryCode,
      rc: airports.regionCode,
      n: sql<number>`count(*)::int`,
    })
    .from(airports)
    .groupBy(airports.class, airports.countryCode, airports.regionCode);
  let intl = 0, local = 0, intlUs = 0, countries = new Set<string>();
  const states: Record<string, number> = {};
  for (const r of rows) {
    if (r.cls === "international") {
      intl += r.n;
      countries.add(r.cc);
      if (r.cc === "US") intlUs += r.n;
    } else {
      local += r.n;
      states[r.rc] = (states[r.rc] ?? 0) + r.n;
    }
  }
  return { intl, local, intlUs, countries: countries.size, states };
}
