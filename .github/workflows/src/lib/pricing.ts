// Shared (client + server) pricing and geo helpers.

export type TripType = "one-way" | "round-trip";

export function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(a)));
}

export function legsFor(trip: TripType): number {
  return trip === "round-trip" ? 2 : 1;
}

export function computeTotals(opts: {
  trip: TripType;
  oneWayUsd: number;
  roundTripUsd: number;
  perkPrices: number[]; // per-leg prices of selected perks
}) {
  const base = opts.trip === "round-trip" ? opts.roundTripUsd : opts.oneWayUsd;
  const perks = opts.perkPrices.reduce((s, n) => s + n, 0) * legsFor(opts.trip);
  return { base, perks, total: base + perks };
}

export const usd = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

export const usd2 = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(n);

export const km = (n: number) => `${new Intl.NumberFormat("en-US").format(n)} km`;

/** Facility types a fixed-wing jet may not use. */
export const JET_EXCLUDED_TYPES = ["heliport", "seaplane_base"];
