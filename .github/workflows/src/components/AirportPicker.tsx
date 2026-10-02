"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type ApiAirport = {
  id: number;
  ident: string;
  name: string;
  city: string;
  region: string;
  regionCode: string;
  countryCode: string;
  country: string;
  iata: string;
  code: string;
  class: "international" | "local";
  type: string;
  lat: number;
  lon: number;
};

export type AirportMeta = {
  countries: { code: string; name: string; n: number }[];
  states: { code: string; name: string; n: number }[];
  totals: Record<string, number>;
};

const TYPE_LABEL: Record<string, string> = {
  large_airport: "Major airport",
  medium_airport: "Regional airport",
  small_airport: "Airfield",
  heliport: "Heliport",
  seaplane_base: "Seaplane base",
};

export default function AirportPicker({
  label,
  value,
  onChange,
  kind,
  meta,
}: {
  label: string;
  value: ApiAirport | null;
  onChange: (a: ApiAirport | null) => void;
  kind: "jet" | "helicopter" | null;
  meta: AirportMeta | null;
}) {
  const [open, setOpen] = useState(false);
  const [cls, setCls] = useState<"international" | "local">("international");
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("");
  const [items, setItems] = useState<ApiAirport[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const reqId = useRef(0);

  const fetchPage = useCallback(
    async (offset: number, append: boolean) => {
      const id = ++reqId.current;
      setLoading(true);
      const p = new URLSearchParams({ cls, q, limit: "40", offset: String(offset) });
      if (filter) p.set(cls === "local" ? "state" : "country", filter);
      if (kind) p.set("kind", kind);
      try {
        const r = await fetch(`/api/airports?${p}`);
        const j = (await r.json()) as { items: ApiAirport[]; total: number };
        if (id !== reqId.current) return;
        setItems((prev) => (append ? [...prev, ...j.items] : j.items));
        setTotal(j.total);
      } finally {
        if (id === reqId.current) setLoading(false);
      }
    },
    [cls, q, filter, kind],
  );

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => fetchPage(0, false), q ? 250 : 0);
    return () => clearTimeout(t);
  }, [open, fetchPage, q]);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (wrap.current && !wrap.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const selectedLabel = value
    ? `${value.city ? value.city + " — " : ""}${value.name} (${value.code})`
    : "";

  return (
    <div ref={wrap} className="relative">
      <label className="label">{label}</label>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="field flex min-h-[3rem] items-center justify-between gap-3 text-left"
      >
        <span className={value ? "" : "text-mute"}>{selectedLabel || "Select an airport…"}</span>
        <span className="text-brand">▾</span>
      </button>
      {value && (
        <p className="mt-1 text-xs text-mute">
          {value.class === "international" ? "International airport" : "Local airport"} · {value.region || value.country}, {value.country} ·{" "}
          {TYPE_LABEL[value.type] ?? value.type}
        </p>
      )}

      {open && (
        <div className="absolute left-0 right-0 z-30 mt-2 border border-brand/40 bg-panel shadow-2xl shadow-black/60 sm:min-w-[26rem]">
          <div className="grid grid-cols-2 border-b border-line">
            {(["international", "local"] as const).map((c) => (
              <button
                type="button"
                key={c}
                onClick={() => {
                  setCls(c);
                  setFilter("");
                }}
                className={`px-3 py-3 font-display text-[0.62rem] font-bold uppercase tracking-[0.16em] transition ${
                  cls === c ? "bg-gradient-to-r from-amber to-brand text-[#1a0f00]" : "text-cream/70 hover:text-amber"
                }`}
              >
                {c === "international"
                  ? `International (${meta?.totals.international?.toLocaleString() ?? "…"})`
                  : `Local · U.S. (${meta?.totals.local?.toLocaleString() ?? "…"})`}
              </button>
            ))}
          </div>
          <div className="grid gap-2 p-3 sm:grid-cols-2">
            <input
              autoFocus
              className="field !py-2.5"
              placeholder="Search city, name, IATA/ICAO…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <select className="field !py-2.5" value={filter} onChange={(e) => setFilter(e.target.value)}>
              {cls === "international" ? (
                <>
                  <option value="">All countries</option>
                  {meta?.countries.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.name} ({c.n})
                    </option>
                  ))}
                </>
              ) : (
                <>
                  <option value="">All U.S. states</option>
                  {meta?.states.map((s) => (
                    <option key={s.code} value={s.code}>
                      {s.name} ({s.n})
                    </option>
                  ))}
                </>
              )}
            </select>
          </div>
          {cls === "local" && (
            <div className="flex flex-wrap gap-2 px-3 pb-3">
              {[["MS", "Mississippi"], ["KY", "Kentucky"], ["TN", "Tennessee"]].map(([c, n]) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setFilter(c)}
                  className={`border px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.14em] ${
                    filter === c ? "border-brand bg-brand/20 text-amber" : "border-line text-mute hover:border-brand"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          )}
          <ul className="max-h-72 overflow-y-auto border-t border-line">
            {items.map((a) => (
              <li key={a.id}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(a);
                    setOpen(false);
                  }}
                  className="flex w-full items-start justify-between gap-3 border-b border-line/60 px-4 py-3 text-left transition hover:bg-brand/10"
                >
                  <span>
                    <span className="block text-sm font-semibold">{a.name}</span>
                    <span className="block text-xs text-mute">
                      {[a.city, a.region, a.country].filter(Boolean).join(", ")} · {TYPE_LABEL[a.type] ?? a.type}
                    </span>
                  </span>
                  <span className="shrink-0 font-display text-xs font-bold text-amber">{a.code}</span>
                </button>
              </li>
            ))}
            {!loading && !items.length && <li className="px-4 py-6 text-center text-sm text-mute">No airports found.</li>}
            {loading && <li className="px-4 py-4 text-center text-sm text-mute">Searching…</li>}
            {!loading && items.length < total && (
              <li className="p-3">
                <button type="button" className="btn-ghost w-full !py-2.5" onClick={() => fetchPage(items.length, true)}>
                  Load more ({total - items.length} remaining)
                </button>
              </li>
            )}
          </ul>
          <p className="border-t border-line px-4 py-2 text-[0.65rem] text-mute">{total.toLocaleString()} airports match</p>
        </div>
      )}
    </div>
  );
}
