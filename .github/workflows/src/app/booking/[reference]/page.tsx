import { notFound } from "next/navigation";
import Link from "next/link";
import QRCode from "qrcode";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { ensureDb } from "@/db/bootstrap";
import { bookings } from "@/db/schema";
import BuyCrypto from "@/components/BuyCrypto";
import { CopyButton, TxForm } from "@/components/PaymentActions";
import { PAY_METHODS, STATUS_LABEL, type PayMethod } from "@/lib/payments";
import { walletFor } from "@/lib/crypto";
import { km, usd } from "@/lib/pricing";

export const dynamic = "force-dynamic";
export const metadata = { title: "Your Booking — Steller Journeys" };

export default async function BookingPage({ params }: { params: Promise<{ reference: string }> }) {
  const { reference } = await params;
  await ensureDb();
  const [b] = await db.select().from(bookings).where(eq(bookings.reference, reference.toUpperCase()));
  if (!b) notFound();

  const method = PAY_METHODS.find((m) => m.id === (b.payMethod as PayMethod))!;
  const address = b.payAddress || walletFor(b.payMethod as PayMethod);
  const amount = b.payAmount ? Number(b.payAmount) : null;
  const amountText = amount === null ? "To be confirmed by concierge" : method.asset === "BTC" ? `${amount.toFixed(8)} BTC` : `${amount.toLocaleString("en-US", { minimumFractionDigits: 2 })} USDT`;
  const qrValue = address ? (method.asset === "BTC" && amount ? `bitcoin:${address}?amount=${amount.toFixed(8)}` : address) : "";
  const qrSvg = qrValue ? await QRCode.toString(qrValue, { type: "svg", margin: 1, color: { dark: "#09090b", light: "#ffffff" } }) : "";
  const open = b.status === "pending_payment" || b.status === "payment_submitted";

  return (
    <div className="mx-auto max-w-5xl px-5 pb-28 pt-36 sm:px-8">
      <p className="eyebrow">Booking Reserved</p>
      <h1 className="section-title mt-4">
        Reference <span className="gold-text">{b.reference}</span>
      </h1>
      <p className="mt-4 inline-block border border-brand/50 bg-brand/10 px-4 py-2 font-display text-xs font-semibold uppercase tracking-[0.18em] text-amber">
        {STATUS_LABEL[b.status] ?? b.status}
      </p>
      <p className="mt-4 max-w-2xl text-sm text-mute">Save this reference — you can return to this page anytime from “My Booking”.</p>

      <div className="mt-12 grid gap-8 lg:grid-cols-2">
        <section className="card p-8">
          <h2 className="eyebrow">Itinerary</h2>
          <p className="mt-4 font-display text-xl font-bold">{b.aircraftName}</p>
          <dl className="mt-5 space-y-3 text-sm">
            <Row k="Trip" v={b.tripType === "round-trip" ? "Round-trip" : "One-way"} />
            <Row k="From" v={b.originLabel} />
            <Row k="To" v={b.destinationLabel} />
            <Row k="Distance" v={km(b.distanceKm)} />
            <Row k="Departure" v={`${b.departDate} ${b.departTime}`} />
            {b.returnDate && <Row k="Return" v={`${b.returnDate} ${b.returnTime ?? ""}`} />}
            <Row k="Passengers" v={String(b.passengers)} />
            <Row k="Passenger name" v={b.fullName} />
            {b.perkSlugs.length > 0 && <Row k="Perks" v={b.perkSlugs.join(", ")} />}
          </dl>
          <div className="mt-6 space-y-2 border-t border-line pt-5 text-sm">
            <div className="flex justify-between"><span className="text-mute">Aircraft</span><span>{usd(b.baseUsd)}</span></div>
            <div className="flex justify-between"><span className="text-mute">Perks</span><span>{usd(b.perksUsd)}</span></div>
            <div className="flex items-baseline justify-between pt-2"><span className="font-display text-xs font-bold uppercase tracking-[0.2em]">Total</span><span className="gold-text font-display text-3xl font-extrabold">{usd(b.totalUsd)}</span></div>
          </div>
        </section>

        <section className="card border-brand/40 p-8">
          <h2 className="eyebrow">Pay with {method.label}</h2>
          <p className="gold-text mt-4 font-display text-3xl font-extrabold">{amountText}</p>
          <p className="mt-1 text-xs text-mute">
            Network: <span className="text-cream">{method.network}</span>
            {b.btcRateUsd && <> · 1 BTC = {usd(Number(b.btcRateUsd))} at booking</>}
          </p>

          {address ? (
            <div className="mt-6">
              <div className="flex flex-col items-center gap-6 sm:flex-row">
                <div className="h-40 w-40 shrink-0 bg-white p-2" dangerouslySetInnerHTML={{ __html: qrSvg }} />
                <div className="min-w-0 flex-1">
                  <p className="label">Deposit address</p>
                  <p className="break-all bg-coal p-3 font-mono text-sm">{address}</p>
                  <div className="mt-3"><CopyButton text={address} label="Copy address" /></div>
                </div>
              </div>
              <p className="mt-5 border border-amber/30 bg-amber/5 p-3 text-xs text-amber/90">
                Send only <strong>{method.label}</strong> on the <strong>{method.network}</strong> network to this address. Funds sent on
                the wrong network cannot be recovered.
              </p>
            </div>
          ) : (
            <p className="mt-6 border border-amber/30 bg-amber/5 p-4 text-sm text-amber/90">
              Your deposit address for {method.label} is being issued by our concierge team and will be emailed to {b.email}.
              <strong> Please do not send any funds until you receive it.</strong>
            </p>
          )}

          {open && (
            <div className="mt-8 border-t border-line pt-6">
              <TxForm reference={b.reference} initial={b.txHash ?? ""} />
            </div>
          )}
        </section>
      </div>

      {open && (
        <section className="mt-12">
          <h2 className="font-display text-sm font-semibold uppercase tracking-[0.25em] text-amber">Need crypto to pay? Buy it now</h2>
          <div className="mt-6"><BuyCrypto /></div>
        </section>
      )}

      <div className="mt-12"><Link href="/fleet" className="btn-ghost">Browse the Fleet</Link></div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-6">
      <dt className="shrink-0 text-mute">{k}</dt>
      <dd className="text-right">{v}</dd>
    </div>
  );
}
