// Builds src/data/airports.json from OurAirports open data (public domain).
// Usage: node scripts/build-airports.mjs /path/to/dir-with-csvs
import fs from "node:fs";
import path from "node:path";
const dir = process.argv[2] || "/tmp/oa";
function parseCSV(text) {
  const rows = []; let row = [], f = "", q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) { if (c === '"') { if (text[i + 1] === '"') { f += '"'; i++; } else q = false; } else f += c; }
    else if (c === '"') q = true;
    else if (c === ",") { row.push(f); f = ""; }
    else if (c === "\n") { row.push(f); rows.push(row); row = []; f = ""; }
    else if (c !== "\r") f += c;
  }
  if (f || row.length) { row.push(f); rows.push(row); }
  const h = rows.shift();
  return rows.filter(r => r.length === h.length).map(r => Object.fromEntries(h.map((k, i) => [k, r[i]])));
}
const read = n => parseCSV(fs.readFileSync(path.join(dir, n), "utf8"));
const countries = Object.fromEntries(read("countries.csv").map(c => [c.code, c.name]));
const regions = Object.fromEntries(read("regions.csv").map(r => [r.code, r.name]));
const out = [];
for (const a of read("airports.csv")) {
  if (a.type === "closed" || a.type === "balloonport") continue;
  const us = a.iso_country === "US";
  const hasIata = !!a.iata_code;
  const sched = a.scheduled_service === "yes";
  const nameIntl = /international|intl/i.test(a.name);
  const bigAir = ["large_airport", "medium_airport", "small_airport"].includes(a.type);
  let cls = null;
  if (a.type === "large_airport") cls = "international";
  else if (bigAir && ((hasIata && sched) || (nameIntl && (hasIata || a.type !== "small_airport")))) cls = "international";
  else if (bigAir && hasIata && a.type === "medium_airport") cls = "international";
  else if (us) cls = "local";
  if (!cls) continue;
  const region = regions[a.iso_region] || a.iso_region;
  const code = a.iata_code || a.icao_code || a.gps_code || a.local_code || a.ident;
  out.push([
    a.ident, a.name, a.municipality, region, a.iso_region.split("-")[1] || "", a.iso_country, countries[a.iso_country] || a.iso_country,
    a.iata_code, code, cls, a.type, Math.round(parseFloat(a.latitude_deg) * 1e4) / 1e4, Math.round(parseFloat(a.longitude_deg) * 1e4) / 1e4,
  ]);
}
fs.writeFileSync("src/data/airports.json", JSON.stringify(out));
const c = k => out.filter(o => o[9] === k).length;
console.log("total", out.length, "intl", c("international"), "local", c("local"),
  "intl US", out.filter(o => o[9] === "international" && o[5] === "US").length);
for (const st of ["MS", "KY", "TN"]) console.log(st, "local", out.filter(o => o[9] === "local" && o[5] === "US" && o[4] === st).length, "intl", out.filter(o => o[9] === "international" && o[5] === "US" && o[4] === st).length);
