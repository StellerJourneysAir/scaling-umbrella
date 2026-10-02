import { NextResponse } from "next/server";
import { pool } from "@/db";
import { ensureDb } from "@/db/bootstrap";

export const dynamic = "force-dynamic";

export async function GET() {
  await ensureDb();
  const countries = await pool.query(
    `SELECT country_code AS code, country AS name, count(*)::int AS n
     FROM airports WHERE class='international'
     GROUP BY country_code, country
     ORDER BY (CASE WHEN country_code='US' THEN 0 ELSE 1 END), country`,
  );
  const states = await pool.query(
    `SELECT region_code AS code, region AS name, count(*)::int AS n
     FROM airports WHERE class='local' AND country_code='US'
     GROUP BY region_code, region
     ORDER BY (CASE region_code WHEN 'MS' THEN 0 WHEN 'KY' THEN 1 WHEN 'TN' THEN 2 ELSE 3 END), region`,
  );
  const totals = await pool.query(`SELECT class, count(*)::int AS n FROM airports GROUP BY class`);
  return NextResponse.json({
    countries: countries.rows,
    states: states.rows,
    totals: Object.fromEntries(totals.rows.map((r: { class: string; n: number }) => [r.class, r.n])),
  });
}
