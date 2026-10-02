"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Aircraft, Perk } from "@/db/schema";
import AirportPicker, { type AirportMeta, type ApiAirport } from "@/components/AirportPicker";
import BuyCrypto from "@/components/BuyCrypto";
import { PAY_METHODS, type PayMethod } from "@/lib/payments";
import { computeTotals, haversineKm, JET_EXCLUDED_TYPES, km, legsFor, usd, type TripType } from "@/lib/pricing";

const today = () => new Date().toISOString().slice(0, 10);

function Section({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <section className="card p-6 sm:p-8">
      <div className="mb-6 flex items-center gap-4">
        <span className="gold-text font-display text-2xl font-extrabold">{n}</span>
        <h2 className="font-display text-lg font-bold uppercase tracking-[0.12em]">{title}</h2>
      </div>
      {children}
    </section>
  );
}

export default function BookingWizard({
  aircraft,
  perks,
  initialSlug,
}: {
  aircraft: Aircraft[];
  perks: Perk[];
  initialSlug: string;
}) {
  const router = useRouter();
  const initial = aircraft.find((a) => a.slug === initialSlug) ?? aircraft.find((a) => a.slug.includes("gulfstream-gulfstream-g280")) ?? aircraft[0];
  const [kind, setKind] = useState<"jet" | "helicopter">(initial.kind as "jet" | "helicopter");
  const [aircraftId, setAircraftId] = useState(initial.id);
  const [trip, setTrip] = useState<TripType>("round-trip");
  const [origin, setOrigin] = useState<ApiAirport | null>(null);
  const [dest, setDest] = useState<ApiAirport | null>(null);
  const [departDate, setDepartDate] = useState("");
  const [departTime, setDepartTime] = useState("09:00");
  const [returnDate, setReturnDate] = useState("");
  const [returnTime, setReturnTime] = useState("17:00");
  const [pax, setPax] = useState(2);
  const [perkSet, setPerkSet] = useState<string[]>([]);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [pay, setPay] = useState<PayMethod>("USDT_TRC20");
  const [meta, setMeta] = useState<AirportMeta | null>(null);
  const [btcUsd, setBtcUsd] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/airports/meta").then((r) => r.json()).then(setMeta).catch(() => {});
    fetch("/api/rates").then((r) => r.json()).then((j) => setBtcUsd(j.btcUsd ?? null)).catch(() => {});
  }, []);

  const craft = aircraft.find((a) => a.id === aircraftId)!;
  const options = aircraft.filter((a) => a.kind === kind);

  const tiers = useMemo(() => {
    const m = new Map<string, Aircraft[]>();
    options.forEach((a) => m.set(a.tier, [...(m.get(a.tier) ?? []), a]));
    return [...m.entries()];
  }, [options]);

  function chooseKind(k: "jet" | "helicopter") {
    setKind(k);
    const first = aircraft.find((a) => a.kind === k)!;
    pickAircraft(first.id);
  }
  function pickAircraft(id: number) {
    const a = aircraft.find((x) => x.id === id)!;
    setAircraftId(id);
    setPax((p) => Math.min(p, a.seats));
    if (a.kind === "jet") {
      if (origin && JET_EXCLUDED_TYPES.includes(origin.type)) setOrigin(null);
      if (dest && JET_EXCLUDED_TYPES.includes(dest.type)) setDest(null);
    }
  }

  const distance = origin && dest ? haversineKm(origin.lat, origin.lon, dest.lat, dest.lon) : null;
  const outOfRange = distance !== null && distance > craft.rangeKm;
  const sameAirport = !!origin && !!dest && origin.id === dest.id;
  const chosenPerks = perks.filter((p) => perkSet.includes(p.slug));
  const totals = computeTotals({
    trip,
    oneWayUsd: craft.oneWayUsd,
    roundTripUsd: craft.roundTripUsd,
    perkPrices: chosenPerks.map((p) => p.priceUsd),
  });
  const method = PAY_METHODS.find((m) => m.id === pay)!;
  const cryptoAmount =
    pay === "BTC" ? (btcUsd ? (totals.total / btcUsd).toFixed(8) + " BTC" : "Rate at checkout") : `${totals.total.toLocaleString("en-US", { minimumFractionDigits: 2 })} USDT`;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!origin || !dest) return setError("Please select both an origin and a destination airport.");
    if (sameAirport) return setError("Origin and destination must be different.");
    if (outOfRange) return setError(`This route exceeds the aircraft's ${km(craft.rangeKm)} range. Choose a longer-range aircraft.`);
    setBusy(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          aircraftId, tripType: trip, originId: origin.id, destinationId: dest.id,
          departDate, departTime, returnDate, returnTime, passengers: pax, perkSlugs: perkSet,
          fullName, email, phone, notes, payMethod: pay,
        }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Something went wrong.");
      router.push(`/booking/${j.reference}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-8 lg:grid-cols-[1fr_24rem]">
      <div className="space-y-8">
        <Section n="01" title="Aircraft">
          <div className="mb-5 flex gap-2">
            {(["jet", "helicopter"] as const).map((k) => (
              <button
                type="button"
                key={k}
                onClick={() => chooseKind(k)}
                className={`flex-1 px-4 py-3 font-display text-[0.7rem] font-semibold uppercase tracking-[0.2em] transition ${
                  kind === k ? "bg-gradient-to-r from-amber to-brand text-[#1a0f00]" : "border border-line text-cream/80 hover:border-brand"
                }`}
              >
                {k === "jet" ? "Private Jets" : "Helicopters"}
              </button>
            ))}
          </div>
          <label className="label">Select model</label>
          <select className="field" value={aircraftId} onChange={(e) => pickAircraft(Number(e.target.value))}>
            {tiers.map(([tier, list]) => (
              <optgroup key={tier} label={tier}>
                {list.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} · {a.seats} seats · {usd(a.roundTripUsd)} round-trip
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          <div className="mt-5 grid gap-5 sm:grid-cols-[14rem_1fr]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={craft.image} alt={craft.name} className="aspect-[16/10] w-full object-cover" />
            <div>
              <p className="font-display text-lg font-bold">{craft.name}</p>
              <p className="mt-1 text-sm text-mute">{craft.description}</p>
              <p className="mt-3 text-xs uppercase tracking-[0.16em] text-amber">
                {craft.seats} seats · {km(craft.rangeKm)} range · {craft.speedKmh} km/h
              </p>
            </div>
          </div>
        </Section>

        <Section n="02" title="Trip & Route">
          <div className="mb-6 grid grid-cols-2 gap-3">
            {([
              ["one-way", "One-Way", craft.oneWayUsd],
              ["round-trip", "Round-Trip", craft.roundTripUsd],
            ] as [TripType, string, number][]).map(([t, l, price]) => (
              <button
                type="button"
                key={t}
                onClick={() => setTrip(t)}
                className={`border p-4 text-left transition ${trip === t ? "border-brand bg-brand/15" : "border-line hover:border-brand/60"}`}
              >
                <span className="block font-display text-xs font-bold uppercase tracking-[0.2em]">{l}</span>
                <span className="gold-text block font-display text-xl font-extrabold">{usd(price)}</span>
              </button>
            ))}
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <AirportPicker label="From" value={origin} onChange={setOrigin} kind={kind} meta={meta} />
            <AirportPicker label="To" value={dest} onChange={setDest} kind={kind} meta={meta} />
          </div>
          {distance !== null && (
            <p className={`mt-4 text-sm ${outOfRange || sameAirport ? "text-red-400" : "text-amber"}`}>
              {sameAirport
                ? "Origin and destination must be different."
                : outOfRange
                  ? `Route distance ${km(distance)} exceeds the ${craft.name} range of ${km(craft.rangeKm)}.`
                  : `Great-circle distance ${km(distance)} · within aircraft range.`}
            </p>
          )}
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="label">Departure date</label>
              <input type="date" required min={today()} className="field" value={departDate} onChange={(e) => setDepartDate(e.target.value)} />
            </div>
            <div>
              <label className="label">Departure time</label>
              <input type="time" required className="field" value={departTime} onChange={(e) => setDepartTime(e.target.value)} />
            </div>
            {trip === "round-trip" && (
              <>
                <div>
                  <label className="label">Return date</label>
                  <input type="date" required min={departDate || today()} className="field" value={returnDate} onChange={(e) => setReturnDate(e.target.value)} />
                </div>
                <div>
                  <label className="label">Return time</label>
                  <input type="time" required className="field" value={returnTime} onChange={(e) => setReturnTime(e.target.value)} />
                </div>
              </>
            )}
          </div>
          <div className="mt-6 max-w-xs">
            <label className="label">Passengers (max {craft.seats})</label>
            <input type="number" min={1} max={craft.seats} required className="field" value={pax} onChange={(e) => setPax(Math.min(craft.seats, Math.max(1, Number(e.target.value) || 1)))} />
          </div>
        </Section>

        <Section n="03" title="Special Perks">
          <p className="mb-5 text-sm text-mute">Priced per flight leg{trip === "round-trip" ? " (applied to both legs of your round-trip)" : ""}.</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {perks.map((p) => {
              const on = perkSet.includes(p.slug);
              return (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => setPerkSet((s) => (on ? s.filter((x) => x !== p.slug) : [...s, p.slug]))}
                  className={`flex items-start gap-4 border p-4 text-left transition ${on ? "border-brand bg-brand/15" : "border-line hover:border-brand/60"}`}
                >
                  <span className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center border text-xs ${on ? "border-brand bg-brand text-[#1a0f00]" : "border-mute"}`}>
                    {on ? "✓" : ""}
                  </span>
                  <span className="flex-1">
                    <span className="flex justify-between gap-3">
                      <span className="text-sm font-bold">{p.name}</span>
                      <span className="shrink-0 font-display text-xs font-semibold text-amber">{usd(p.priceUsd)}</span>
                    </span>
                    <span className="mt-1 block text-xs text-mute">{p.description}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </Section>

        <Section n="04" title="Your Details">
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className="label">Full name</label>
              <input required className="field" value={fullName} onChange={(e) => setFullName(e.target.value)} autoComplete="name" />
            </div>
            <div>
              <label className="label">Email</label>
              <input required type="email" className="field" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
            </div>
            <div>
              <label className="label">Phone / WhatsApp</label>
              <input required type="tel" className="field" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Special requests (optional)</label>
              <textarea rows={3} className="field" value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={1000} />
            </div>
          </div>
        </Section>

        <Section n="05" title="Payment Method">
          <div className="grid gap-3 sm:grid-cols-3">
            {PAY_METHODS.map((m) => (
              <button
                type="button"
                key={m.id}
                onClick={() => setPay(m.id)}
                className={`border p-4 text-left transition ${pay === m.id ? "border-brand bg-brand/15" : "border-line hover:border-brand/60"}`}
              >
                <span className="block font-display text-sm font-bold">{m.label}</span>
                <span className="mt-1 block text-xs text-mute">{m.hint}</span>
              </button>
            ))}
          </div>
          <h3 className="mb-4 mt-8 font-display text-xs font-semibold uppercase tracking-[0.25em] text-amber">Need crypto? Buy it directly</h3>
          <BuyCrypto compact />
        </Section>
      </div>

      {/* SUMMARY */}
      <aside className="lg:sticky lg:top-28 lg:self-start">
        <div className="card border-brand/40 p-6">
          <p className="eyebrow">Your Itinerary</p>
          <p className="mt-3 font-display text-lg font-bold">{craft.name}</p>
          <p className="text-xs uppercase tracking-[0.16em] text-mute">{trip === "round-trip" ? "Round-trip" : "One-way"} · {pax} passenger{pax > 1 ? "s" : ""}</p>
          <div className="mt-5 space-y-2 border-y border-line py-4 text-sm">
            <p><span className="text-mute">From </span>{origin ? `${origin.city || origin.name} (${origin.code})` : "—"}</p>
            <p><span className="text-mute">To </span>{dest ? `${dest.city || dest.name} (${dest.code})` : "—"}</p>
            <p><span className="text-mute">Depart </span>{departDate || "—"} {departDate && departTime}</p>
            {trip === "round-trip" && <p><span className="text-mute">Return </span>{returnDate || "—"} {returnDate && returnTime}</p>}
          </div>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-mute">Aircraft ({trip === "round-trip" ? "round-trip" : "one-way"})</dt><dd>{usd(totals.base)}</dd></div>
            {chosenPerks.map((p) => (
              <div key={p.id} className="flex justify-between text-xs"><dt className="text-mute">{p.name} ×{legsFor(trip)}</dt><dd>{usd(p.priceUsd * legsFor(trip))}</dd></div>
            ))}
            <div className="flex items-baseline justify-between border-t border-line pt-4">
              <dt className="font-display text-xs font-bold uppercase tracking-[0.2em]">Total</dt>
              <dd className="gold-text font-display text-3xl font-extrabold">{usd(totals.total)}</dd>
            </div>
          </dl>
          <div className="mt-5 bg-coal p-4 text-sm">
            <p className="text-[0.62rem] uppercase tracking-[0.2em] text-mute">Pay with {method.label}</p>
            <p className="mt-1 font-display text-lg font-bold text-amber">{cryptoAmount}</p>
            {pay === "BTC" && btcUsd && <p className="mt-1 text-xs text-mute">1 BTC ≈ {usd(btcUsd)} · locked at booking</p>}
          </div>
          {error && <p className="mt-4 border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}
          <button type="submit" disabled={busy || outOfRange || sameAirport} className="btn-gold mt-5 w-full">
            {busy ? "Reserving…" : "Reserve & Pay in Crypto"}
          </button>
          <p className="mt-3 text-center text-[0.68rem] text-mute">You&apos;ll receive deposit instructions on the next screen.</p>
        </div>
      </aside>
    </form>
  );
}
