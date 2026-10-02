import Link from "next/link";
import type { Aircraft } from "@/db/schema";
import { km, usd } from "@/lib/pricing";

export default function AircraftCard({ a }: { a: Aircraft }) {
  return (
    <article className="card group flex flex-col overflow-hidden transition duration-300 hover:-translate-y-1 hover:border-brand/60">
      <div className="relative aspect-[16/10] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={a.image}
          alt={a.name}
          loading="lazy"
          className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-coal via-transparent to-transparent" />
        <span className="absolute left-4 top-4 bg-ink/80 px-3 py-1 font-display text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-amber backdrop-blur">
          {a.kind === "jet" ? "Jet" : "Helicopter"} · {a.tier}
        </span>
        {a.seats === 10 && a.kind === "jet" && (
          <span className="absolute right-4 top-4 bg-gradient-to-r from-amber to-brand px-3 py-1 font-display text-[0.62rem] font-bold uppercase tracking-[0.2em] text-[#1a0f00]">
            10-Seat Signature
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-6">
        <p className="text-xs uppercase tracking-[0.2em] text-mute">{a.maker}</p>
        <h3 className="mt-1 text-xl font-bold leading-snug">{a.name}</h3>
        <dl className="mt-5 grid grid-cols-3 gap-2 border-y border-line py-4 text-center">
          <div>
            <dt className="text-[0.6rem] uppercase tracking-[0.18em] text-mute">Seats</dt>
            <dd className="mt-1 font-display text-sm font-bold">{a.seats}</dd>
          </div>
          <div>
            <dt className="text-[0.6rem] uppercase tracking-[0.18em] text-mute">Range</dt>
            <dd className="mt-1 font-display text-sm font-bold">{km(a.rangeKm)}</dd>
          </div>
          <div>
            <dt className="text-[0.6rem] uppercase tracking-[0.18em] text-mute">Speed</dt>
            <dd className="mt-1 font-display text-sm font-bold">{a.speedKmh} km/h</dd>
          </div>
        </dl>
        <div className="mt-5 grid grid-cols-2 gap-4">
          <div>
            <p className="text-[0.6rem] uppercase tracking-[0.18em] text-mute">One-way</p>
            <p className="gold-text font-display text-xl font-bold">{usd(a.oneWayUsd)}</p>
          </div>
          <div>
            <p className="text-[0.6rem] uppercase tracking-[0.18em] text-mute">Round-trip</p>
            <p className="gold-text font-display text-xl font-bold">{usd(a.roundTripUsd)}</p>
          </div>
        </div>
        <Link href={`/book?aircraft=${a.slug}`} className="btn-gold mt-6 w-full">
          Book This {a.kind === "jet" ? "Jet" : "Helicopter"}
        </Link>
      </div>
    </article>
  );
}
