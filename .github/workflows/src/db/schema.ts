import {
  doublePrecision,
  index,
  integer,
  jsonb,
  numeric,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const aircraft = pgTable("aircraft", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  maker: text("maker").notNull(),
  kind: text("kind").notNull(), // "jet" | "helicopter"
  tier: text("tier").notNull(), // Light, Midsize, Heavy, ...
  seats: integer("seats").notNull(),
  rangeKm: integer("range_km").notNull(),
  speedKmh: integer("speed_kmh").notNull(),
  oneWayUsd: integer("one_way_usd").notNull(),
  roundTripUsd: integer("round_trip_usd").notNull(),
  image: text("image").notNull(),
  description: text("description").notNull(),
  amenities: jsonb("amenities").$type<string[]>().notNull(),
  featured: integer("featured").notNull().default(0),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const perks = pgTable("perks", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  priceUsd: integer("price_usd").notNull(),
  icon: text("icon").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const airports = pgTable(
  "airports",
  {
    id: serial("id").primaryKey(),
    ident: text("ident").notNull(),
    name: text("name").notNull(),
    city: text("city").notNull().default(""),
    region: text("region").notNull().default(""),
    regionCode: text("region_code").notNull().default(""),
    countryCode: text("country_code").notNull(),
    country: text("country").notNull(),
    iata: text("iata").notNull().default(""),
    code: text("code").notNull(),
    class: text("class").notNull(), // "international" | "local"
    type: text("type").notNull(),
    lat: doublePrecision("lat").notNull(),
    lon: doublePrecision("lon").notNull(),
  },
  (t) => [
    uniqueIndex("airports_ident_uq").on(t.ident),
    index("airports_class_idx").on(t.class),
    index("airports_country_idx").on(t.countryCode),
  ],
);

export const bookings = pgTable(
  "bookings",
  {
    id: serial("id").primaryKey(),
    reference: text("reference").notNull().unique(),
    aircraftId: integer("aircraft_id").notNull(),
    aircraftName: text("aircraft_name").notNull(),
    tripType: text("trip_type").notNull(), // "one-way" | "round-trip"
    originId: integer("origin_id").notNull(),
    destinationId: integer("destination_id").notNull(),
    originLabel: text("origin_label").notNull(),
    destinationLabel: text("destination_label").notNull(),
    distanceKm: integer("distance_km").notNull(),
    departDate: text("depart_date").notNull(),
    departTime: text("depart_time").notNull().default(""),
    returnDate: text("return_date"),
    returnTime: text("return_time"),
    passengers: integer("passengers").notNull(),
    perkSlugs: jsonb("perk_slugs").$type<string[]>().notNull(),
    fullName: text("full_name").notNull(),
    email: text("email").notNull(),
    phone: text("phone").notNull(),
    notes: text("notes").notNull().default(""),
    baseUsd: integer("base_usd").notNull(),
    perksUsd: integer("perks_usd").notNull(),
    totalUsd: integer("total_usd").notNull(),
    payMethod: text("pay_method").notNull(), // USDT_TRC20 | USDT_BEP20 | BTC
    payAmount: numeric("pay_amount", { precision: 24, scale: 8 }),
    btcRateUsd: numeric("btc_rate_usd", { precision: 18, scale: 2 }),
    payAddress: text("pay_address").notNull().default(""),
    status: text("status").notNull().default("pending_payment"),
    txHash: text("tx_hash"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("bookings_email_idx").on(t.email)],
);

export type Aircraft = typeof aircraft.$inferSelect;
export type Perk = typeof perks.$inferSelect;
export type Airport = typeof airports.$inferSelect;
export type Booking = typeof bookings.$inferSelect;
