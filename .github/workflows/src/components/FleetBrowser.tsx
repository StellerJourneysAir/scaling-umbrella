"use client";

import { useMemo, useState } from "react";
import type { Aircraft } from "@/db/schema";
import AircraftCard from "@/components/AircraftCard";

type Kind = "all" | "jet" | "helicopter";

export default function FleetBrowser({
  items,
  initialKind,
  initialSeats,
}: {
  items: Aircraft[];
  initialKind: Kind;
  initialSeats: string;
}) {
  const [kind, setKind] = useState<Kind>(initialKind);
  const [seats, setSeats] = useState(initialSeats);
  const [sort, setSort] = useState("price-asc");
  const [q, setQ] = useState("");

  const list = useMemo(() => {
    let r = items.filter((a) => (kind === "all" ? true : a.kind === kind));
    if (seats === "10") r = r.filter((a) => a.seats === 10);
    else if (seats === "1-6") r = r.filter((a) => a.seats <= 6);
    else if (seats === "7-9") r = r.filter((a) => a.seats >= 7 && a.seats <= 9);
    else if (seats === "11+") r = r.filter((a) => a.seats >= 11);
    if (q.trim()) {
      const s = q.trim().toLowerCase();
      r = r.filter((a) => `${a.name} ${a.maker} ${a.tier}`.toLowerCase().includes(s));
    }
    return [...r].sort((a, b) =>
      sort === "price-desc" ? b.roundTripUsd - a.roundTripUsd
        : sort === "seats" ? b.seats - a.seats
        : sort === "range" ? b.rangeKm - a.rangeKm
        : a.roundTripUsd - b.roundTripUsd,
    );
  }, [items, kind, seats, sort, q]);

  const jets = items.filter((i) => i.kind === "jet").length;
  const helis = items.length - jets;

  return (
    <div>
      <div className="card flex flex-col gap-5 p-5 lg:flex-row lg:items-end">
        <div className="flex flex-wrap gap-2">
          {([
            ["all", `All (${items.length})`],
            ["jet", `Jets (${jets})`],
            ["helicopter", `Helicopters (${helis})`],
          ] as [Kind, string][]).map(([k, l]) => (
            <button
              key={k}
              onClick={() => setKind(k)}
              className={`px-5 py-3 font-display text-[0.7rem] font-semibold uppercase tracking-[0.18em] transition ${
                kind === k ? "bg-gradient-to-r from-amber to-brand text-[#1a0f00]" : "border border-line text-cream/80 hover:border-brand"
              }`}
            >
              {l}
            </button>
          ))}
        </div>
        <div className="grid flex-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="label">Search</label>
            <input className="field" placeholder="Model or maker…" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <div>
            <label className="label">Seats</label>
            <select className="field" value={seats} onChange={(e) => setSeats(e.target.value)}>
              <option value="all">Any</option>
              <option value="1-6">1 – 6</option>
              <option value="7-9">7 – 9</option>
              <option value="10">10 seats (Signature)</option>
              <option value="11+">11+</option>
            </select>
          </div>
          <div>
            <label className="label">Sort by</label>
            <select className="field" value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
              <option value="seats">Most seats</option>
              <option value="range">Longest range</option>
            </select>
          </div>
        </div>
      </div>
      <p className="mt-6 text-sm text-mute">{list.length} aircraft available</p>
      <div className="mt-4 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {list.map((a) => <AircraftCard key={a.id} a={a} />)}
      </div>
      {!list.length && <p className="card mt-6 p-10 text-center text-mute">No aircraft match those filters.</p>}
    </div>
  );
}
