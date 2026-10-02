import fs from "node:fs";
import path from "node:path";
import { sql } from "drizzle-orm";
import { db, pool } from "@/db";
import { aircraft, airports, perks } from "@/db/schema";
import { FLEET, PERKS } from "@/data/fleet";

/**
 * Idempotent bootstrap: creates tables if missing, upserts the fleet + perks
 * catalogue, and seeds the worldwide airport directory on first run.
 */
const CREATE_SQL = `
CREATE TABLE IF NOT EXISTS aircraft (
  id serial PRIMARY KEY,
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  maker text NOT NULL,
  kind text NOT NULL,
  tier text NOT NULL,
  seats integer NOT NULL,
  range_km integer NOT NULL,
  speed_kmh integer NOT NULL,
  one_way_usd integer NOT NULL,
  round_trip_usd integer NOT NULL,
  image text NOT NULL,
  description text NOT NULL,
  amenities jsonb NOT NULL,
  featured integer NOT NULL DEFAULT 0,
  sort_order integer NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS perks (
  id serial PRIMARY KEY,
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  description text NOT NULL,
  price_usd integer NOT NULL,
  icon text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS airports (
  id serial PRIMARY KEY,
  ident text NOT NULL,
  name text NOT NULL,
  city text NOT NULL DEFAULT '',
  region text NOT NULL DEFAULT '',
  region_code text NOT NULL DEFAULT '',
  country_code text NOT NULL,
  country text NOT NULL,
  iata text NOT NULL DEFAULT '',
  code text NOT NULL,
  class text NOT NULL,
  type text NOT NULL,
  lat double precision NOT NULL,
  lon double precision NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS airports_ident_uq ON airports (ident);
CREATE INDEX IF NOT EXISTS airports_class_idx ON airports (class);
CREATE INDEX IF NOT EXISTS airports_country_idx ON airports (country_code);
CREATE TABLE IF NOT EXISTS bookings (
  id serial PRIMARY KEY,
  reference text NOT NULL UNIQUE,
  aircraft_id integer NOT NULL,
  aircraft_name text NOT NULL,
  trip_type text NOT NULL,
  origin_id integer NOT NULL,
  destination_id integer NOT NULL,
  origin_label text NOT NULL,
  destination_label text NOT NULL,
  distance_km integer NOT NULL,
  depart_date text NOT NULL,
  depart_time text NOT NULL DEFAULT '',
  return_date text,
  return_time text,
  passengers integer NOT NULL,
  perk_slugs jsonb NOT NULL,
  full_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  notes text NOT NULL DEFAULT '',
  base_usd integer NOT NULL,
  perks_usd integer NOT NULL,
  total_usd integer NOT NULL,
  pay_method text NOT NULL,
  pay_amount numeric(24,8),
  btc_rate_usd numeric(18,2),
  pay_address text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'pending_payment',
  tx_hash text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS bookings_email_idx ON bookings (email);
`;

type Row = [
  string, string, string, string, string, string, string,
  string, string, string, string, number, number,
];

async function seedAirports() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("SELECT pg_advisory_xact_lock(727401)");
    const { rows } = await client.query("SELECT count(*)::int AS n FROM airports");
    if (rows[0].n > 0) {
      await client.query("COMMIT");
      return;
    }
    const file = path.join(process.cwd(), "src", "data", "airports.json");
    const data = JSON.parse(fs.readFileSync(file, "utf8")) as Row[];
    const BATCH = 2000;
    for (let i = 0; i < data.length; i += BATCH) {
      const slice = data.slice(i, i + BATCH);
      const values: unknown[] = [];
      const tuples = slice.map((r, k) => {
        const b = k * 13;
        values.push(...r);
        return `(${Array.from({ length: 13 }, (_, n) => `$${b + n + 1}`).join(",")})`;
      });
      await client.query(
        `INSERT INTO airports (ident,name,city,region,region_code,country_code,country,iata,code,class,type,lat,lon)
         VALUES ${tuples.join(",")} ON CONFLICT (ident) DO NOTHING`,
        values,
      );
    }
    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

async function run() {
  await pool.query(CREATE_SQL);

  for (const a of FLEET) {
    await db
      .insert(aircraft)
      .values(a)
      .onConflictDoUpdate({
        target: aircraft.slug,
        set: {
          name: a.name, maker: a.maker, kind: a.kind, tier: a.tier, seats: a.seats,
          rangeKm: a.rangeKm, speedKmh: a.speedKmh, oneWayUsd: a.oneWayUsd,
          roundTripUsd: a.roundTripUsd, image: a.image, description: a.description,
          amenities: a.amenities, featured: a.featured, sortOrder: a.sortOrder,
        },
      });
  }
  for (const p of PERKS) {
    await db
      .insert(perks)
      .values(p)
      .onConflictDoUpdate({
        target: perks.slug,
        set: { name: p.name, description: p.description, priceUsd: p.priceUsd, icon: p.icon, sortOrder: p.sortOrder },
      });
  }
  const [{ n }] = (await db.select({ n: sql<number>`count(*)::int` }).from(airports)) as { n: number }[];
  if (n === 0) await seedAirports();
}

const g = globalThis as typeof globalThis & { __sjBootstrap?: Promise<void> };

export function ensureDb(): Promise<void> {
  if (!g.__sjBootstrap) {
    g.__sjBootstrap = run().catch((e) => {
      g.__sjBootstrap = undefined;
      throw e;
    });
  }
  return g.__sjBootstrap;
}
