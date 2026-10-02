import { NextResponse } from "next/server";
import { pool } from "@/db";
import { ensureDb } from "@/db/bootstrap";
import { JET_EXCLUDED_TYPES } from "@/lib/pricing";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  await ensureDb();
  const sp = new URL(req.url).searchParams;
  const cls = sp.get("cls") === "local" ? "local" : "international";
  const q = (sp.get("q") ?? "").trim().slice(0, 80);
  const region = (sp.get("state") ?? "").trim().toUpperCase();
  const country = (sp.get("country") ?? "").trim().toUpperCase();
  const kind = sp.get("kind");
  const limit = Math.min(Math.max(parseInt(sp.get("limit") ?? "50", 10) || 50, 1), 100);
  const offset = Math.max(parseInt(sp.get("offset") ?? "0", 10) || 0, 0);

  const where: string[] = ["class = $1"];
  const params: unknown[] = [cls];
  if (cls === "local") {
    where.push("country_code = 'US'");
    if (region) {
      params.push(region);
      where.push(`region_code = $${params.length}`);
    }
  } else if (country) {
    params.push(country);
    where.push(`country_code = $${params.length}`);
  }
  if (kind === "jet") {
    params.push(JET_EXCLUDED_TYPES);
    where.push(`type <> ALL($${params.length}::text[])`);
  }
  let rank = "0::int";
  let whereParamCount = -1;
  if (q) {
    params.push(`%${q}%`);
    const like = `$${params.length}`;
    whereParamCount = params.length;
    params.push(q.toUpperCase());
    const exact = `$${params.length}`;
    where.push(
      `(name ILIKE ${like} OR city ILIKE ${like} OR iata ILIKE ${like} OR ident ILIKE ${like} OR region ILIKE ${like} OR country ILIKE ${like})`,
    );
    rank = `CASE WHEN upper(iata)=${exact} OR upper(ident)=${exact} THEN 0 WHEN upper(city)=${exact} THEN 1 ELSE 2 END`;
  }
  const whereSql = where.join(" AND ");
  const countParams = whereParamCount >= 0 ? params.slice(0, whereParamCount) : params;
  const total = await pool.query(`SELECT count(*)::int AS n FROM airports WHERE ${whereSql}`, countParams);
  const rows = await pool.query(
    `SELECT id, ident, name, city, region, region_code AS "regionCode", country_code AS "countryCode", country,
            iata, code, class, type, lat, lon
     FROM airports WHERE ${whereSql}
     ORDER BY ${rank}, (CASE WHEN iata <> '' THEN 0 ELSE 1 END), (CASE type WHEN 'large_airport' THEN 0 WHEN 'medium_airport' THEN 1 ELSE 2 END), name
     LIMIT ${limit} OFFSET ${offset}`,
    params,
  );
  return NextResponse.json({ total: total.rows[0].n, items: rows.rows });
}
