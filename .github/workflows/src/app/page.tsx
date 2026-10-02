import Link from "next/link";
import AircraftCard from "@/components/AircraftCard";
import BuyCrypto from "@/components/BuyCrypto";
import { getAircraft, getAirportStats, getPerks } from "@/lib/queries";
import { usd } from "@/lib/pricing";

export const dynamic = "force-dynamic";

const num = (n: number) => new Intl.NumberFormat("en-US").format(n);

const STEPS = [
  { t: "Choose your aircraft", d: "Browse 28 jets and 28 helicopters, from nimble light jets to flagship long-range cabins." },
  { t: "Set your route", d: "Pick any international or local U.S. airport — one-way or round-trip, on your schedule." },
  { t: "Curate your perks", d: "Add chef service, ground transfers, Starlink Wi-Fi, security and more." },
  { t: "Pay in crypto", d: "Settle in USDT (TRC-20 / BEP-20) or Bitcoin. Need coins? Buy instantly via MoonPay, Bitcoin.com or Changelly." },
];

export default async function Home() {
  const [jets, helis, perks, stats] = await Promise.all([
    getAircraft("jet"),
    getAircraft("helicopter"),
    getPerks(),
    getAirportStats(),
  ]);
  const tenSeaters = jets.filter((j) => j.seats === 10);
  const minTen = Math.min(...tenSeaters.map((j) => j.roundTripUsd));
  const maxTen = Math.max(...tenSeaters.map((j) => j.roundTripUsd));
  const featJets = jets.filter((j) => j.featured).slice(0, 6);
  const featHelis = helis.filter((j) => j.featured).slice(0, 3);
  const ms = stats.states["MS"] ?? 0;
  const ky = stats.states["KY"] ?? 0;
  const tn = stats.states["TN"] ?? 0;

  return (
    <>
      {/* HERO */}
      <section className="relative flex min-h-[100svh] items-center overflow-hidden">
        <video
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          poster="https://images.pexels.com/videos/30626114/aviation-aviation-hub-aviation-industry-aviation-photography-30626114.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=630&w=1200"
        >
          <source src="https://videos.pexels.com/video-files/30626114/13110498_3840_2160_30fps.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-ink/80 via-ink/55 to-ink" />
        <div className="absolute inset-0 bg-[radial-gradient(60%_50%_at_20%_40%,rgba(245,124,0,0.18),transparent)]" />
        <div className="relative mx-auto w-full max-w-7xl px-5 pb-24 pt-36 sm:px-8">
          <p className="eyebrow rise">Steller Journeys · Private Aviation</p>
          <h1 className="rise rise-2 mt-6 max-w-4xl text-5xl font-extrabold leading-[1.02] tracking-tight sm:text-7xl">
            The sky, <span className="gold-text">reserved</span> for you.
          </h1>
          <p className="rise rise-3 mt-8 max-w-xl text-lg leading-relaxed text-cream/80">
            Private jets and helicopters to any airport on earth. One-way or round-trip, curated
            perks, and effortless settlement in USDT or Bitcoin.
          </p>
          <div className="rise rise-3 mt-10 flex flex-wrap gap-4">
            <Link href="/book" className="btn-gold">Book a Flight</Link>
            <Link href="/fleet" className="btn-ghost">Explore the Fleet</Link>
          </div>
          <div className="rise rise-3 mt-20 grid max-w-4xl grid-cols-2 gap-px border border-white/10 bg-white/10 sm:grid-cols-4">
            {[
              [String(jets.length), "Private jets"],
              [String(helis.length), "Helicopters"],
              [num(stats.intl + stats.local), "Airports served"],
              ["24/7", "Flight concierge"],
            ].map(([n, l]) => (
              <div key={l} className="bg-ink/70 px-6 py-5 backdrop-blur">
                <p className="gold-text font-display text-3xl font-extrabold">{n}</p>
                <p className="mt-1 text-[0.65rem] uppercase tracking-[0.22em] text-mute">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TRIPS / PRICING */}
      <section id="pricing" className="mx-auto max-w-7xl px-5 py-28 sm:px-8">
        <div className="max-w-2xl">
          <p className="eyebrow">One-way · Round-trip</p>
          <h2 className="section-title mt-4">Fly your way, <span className="gold-text">priced transparently.</span></h2>
          <p className="mt-5 text-mute">
            Every aircraft carries a published fare — no surprise fuel surcharges or hidden fees. Round-trip bookings
            save you roughly 40% against two one-way flights.
          </p>
        </div>
        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          <div className="card p-8">
            <p className="eyebrow">One-Way</p>
            <p className="mt-4 font-display text-2xl font-bold">Single journey</p>
            <p className="mt-3 text-sm leading-relaxed text-mute">Perfect for relocations, one-off meetings or open-ended itineraries. Pay only for the leg you fly.</p>
            <p className="mt-6 text-xs uppercase tracking-[0.2em] text-mute">Light jets from</p>
            <p className="gold-text font-display text-3xl font-extrabold">{usd(Math.min(...jets.map((j) => j.oneWayUsd)))}</p>
          </div>
          <div className="card p-8">
            <p className="eyebrow">Round-Trip</p>
            <p className="mt-4 font-display text-2xl font-bold">There and back</p>
            <p className="mt-3 text-sm leading-relaxed text-mute">Your aircraft and crew are held for your return. Choose your return date and time at booking.</p>
            <p className="mt-6 text-xs uppercase tracking-[0.2em] text-mute">Light jets from</p>
            <p className="gold-text font-display text-3xl font-extrabold">{usd(Math.min(...jets.map((j) => j.roundTripUsd)))}</p>
          </div>
          <div className="relative overflow-hidden border border-brand/60 bg-gradient-to-br from-brand/20 via-panel to-coal p-8">
            <p className="eyebrow !text-amber">10-Seat Signature Jets</p>
            <p className="mt-4 font-display text-2xl font-bold">{tenSeaters.length} cabins, one price band</p>
            <p className="mt-3 text-sm leading-relaxed text-cream/75">Our most-booked 10-seat jets, all round-trip between {usd(minTen)} and {usd(maxTen)}.</p>
            <p className="mt-6 text-xs uppercase tracking-[0.2em] text-mute">Round-trip from</p>
            <p className="gold-text font-display text-3xl font-extrabold">{usd(minTen)} – {usd(maxTen)}</p>
            <Link href="/fleet?seats=10" className="btn-gold mt-6">View 10-Seaters</Link>
          </div>
        </div>
      </section>

      {/* FLEET */}
      <section id="fleet" className="border-y border-line bg-coal py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-2xl">
              <p className="eyebrow">The Fleet</p>
              <h2 className="section-title mt-4">{jets.length} jets. {helis.length} helicopters. <span className="gold-text">Zero compromise.</span></h2>
            </div>
            <Link href="/fleet" className="btn-ghost">See Entire Fleet</Link>
          </div>
          <h3 className="mt-14 font-display text-sm font-semibold uppercase tracking-[0.25em] text-amber">Featured Jets</h3>
          <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featJets.map((a) => <AircraftCard key={a.id} a={a} />)}
          </div>
          <h3 className="mt-16 font-display text-sm font-semibold uppercase tracking-[0.25em] text-amber">Featured Helicopters</h3>
          <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featHelis.map((a) => <AircraftCard key={a.id} a={a} />)}
          </div>
        </div>
      </section>

      {/* AIRPORTS */}
      <section className="mx-auto max-w-7xl px-5 py-28 sm:px-8">
        <div className="max-w-2xl">
          <p className="eyebrow">Global Reach</p>
          <h2 className="section-title mt-4">Every airport. <span className="gold-text">Two classes.</span></h2>
          <p className="mt-5 text-mute">
            Our directory covers the world&apos;s international airports and every local airfield across the United States —
            including heliports for helicopter charters.
          </p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <div className="card p-8">
            <p className="eyebrow">Class I</p>
            <h3 className="mt-3 text-2xl font-bold">International Airports</h3>
            <p className="gold-text mt-4 font-display text-5xl font-extrabold">{num(stats.intl)}</p>
            <p className="mt-2 text-sm text-mute">
              across {stats.countries} countries — including {num(stats.intlUs)} in the United States.
            </p>
          </div>
          <div className="card p-8">
            <p className="eyebrow">Class II</p>
            <h3 className="mt-3 text-2xl font-bold">Local Airports · United States</h3>
            <p className="gold-text mt-4 font-display text-5xl font-extrabold">{num(stats.local)}</p>
            <p className="mt-2 text-sm text-mute">
              Every local airfield, strip &amp; heliport — with deep coverage of{" "}
              <span className="text-amber">Mississippi ({num(ms)})</span>,{" "}
              <span className="text-amber">Kentucky ({num(ky)})</span> and{" "}
              <span className="text-amber">Tennessee ({num(tn)})</span>.
            </p>
          </div>
        </div>
      </section>

      {/* PERKS */}
      <section id="perks" className="border-y border-line bg-coal py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="max-w-2xl">
            <p className="eyebrow">Special Perks</p>
            <h2 className="section-title mt-4">Indulgences, <span className="gold-text">tailored to you.</span></h2>
            <p className="mt-5 text-mute">Add any combination at checkout. Perk prices are per flight leg.</p>
          </div>
          <div className="mt-14 grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
            {perks.map((p) => (
              <div key={p.id} className="group bg-coal p-8 transition hover:bg-panel">
                <div className="flex items-start justify-between">
                  <span className="gold-text font-display text-3xl font-extrabold">{p.icon}</span>
                  <span className="font-display text-sm font-semibold text-amber">{usd(p.priceUsd)}</span>
                </div>
                <h3 className="mt-5 text-lg font-bold">{p.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-mute">{p.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="mx-auto max-w-7xl px-5 py-28 sm:px-8">
        <p className="eyebrow">How it works</p>
        <h2 className="section-title mt-4 max-w-2xl">From idea to wheels-up in <span className="gold-text">four steps.</span></h2>
        <div className="mt-14 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <div key={s.t} className="relative border-t border-brand/60 pt-6">
              <p className="font-display text-sm font-bold text-brand">0{i + 1}</p>
              <h3 className="mt-3 text-lg font-bold">{s.t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-mute">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PAYMENTS */}
      <section id="payments" className="border-y border-line bg-coal py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="max-w-2xl">
            <p className="eyebrow">Settle in Crypto</p>
            <h2 className="section-title mt-4">Pay with <span className="gold-text">USDT or Bitcoin.</span></h2>
            <p className="mt-5 text-mute">
              All bookings are paid in USDT (TRC-20), USDT (BEP-20) or Bitcoin (BTC). Don&apos;t hold crypto yet? Buy it
              directly with a card or bank transfer through one of our trusted partners.
            </p>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-3">
            {[
              ["USDT", "TRC-20 · TRON"],
              ["USDT", "BEP-20 · BNB Smart Chain"],
              ["BTC", "Bitcoin network"],
            ].map(([a, n]) => (
              <div key={n} className="card flex items-center gap-4 p-6">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-amber to-ember font-display text-xs font-extrabold text-[#1a0f00]">{a}</span>
                <span className="text-sm font-semibold">{n}</span>
              </div>
            ))}
          </div>
          <h3 className="mt-16 font-display text-sm font-semibold uppercase tracking-[0.25em] text-amber">Buy crypto instantly</h3>
          <div className="mt-6">
            <BuyCrypto />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden py-28">
        <div className="absolute inset-0 bg-[radial-gradient(50%_80%_at_50%_100%,rgba(245,124,0,0.25),transparent)]" />
        <div className="relative mx-auto max-w-3xl px-5 text-center">
          <h2 className="section-title">Your journey begins <span className="gold-text">the moment you decide.</span></h2>
          <p className="mt-5 text-mute">Reserve your aircraft in minutes. A flight concierge confirms every detail.</p>
          <Link href="/book" className="btn-gold mt-10">Book a Flight</Link>
        </div>
      </section>
    </>
  );
}
