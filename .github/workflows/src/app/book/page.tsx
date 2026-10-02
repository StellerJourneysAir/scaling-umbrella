import BookingWizard from "@/components/BookingWizard";
import { getAircraft, getPerks } from "@/lib/queries";

export const dynamic = "force-dynamic";
export const metadata = { title: "Book a Flight — Steller Journeys" };

export default async function BookPage({ searchParams }: { searchParams: Promise<{ aircraft?: string }> }) {
  const sp = await searchParams;
  const [aircraft, perks] = await Promise.all([getAircraft(), getPerks()]);
  return (
    <div className="mx-auto max-w-7xl px-5 pb-28 pt-36 sm:px-8">
      <p className="eyebrow">Reservations</p>
      <h1 className="section-title mt-4 max-w-3xl">
        Book your <span className="gold-text">private flight.</span>
      </h1>
      <p className="mt-5 max-w-2xl text-mute">
        Select your aircraft, route and perks. Payment is made in USDT (TRC-20), USDT (BEP-20) or Bitcoin.
      </p>
      <div className="mt-12">
        <BookingWizard aircraft={aircraft} perks={perks} initialSlug={sp.aircraft ?? ""} />
      </div>
    </div>
  );
}
