import FleetBrowser from "@/components/FleetBrowser";
import { getAircraft } from "@/lib/queries";

export const dynamic = "force-dynamic";
export const metadata = { title: "The Fleet — Steller Journeys" };

export default async function FleetPage({
  searchParams,
}: {
  searchParams: Promise<{ kind?: string; seats?: string }>;
}) {
  const sp = await searchParams;
  const items = await getAircraft();
  const kind = sp.kind === "jet" || sp.kind === "helicopter" ? sp.kind : "all";
  return (
    <div className="mx-auto max-w-7xl px-5 pb-28 pt-36 sm:px-8">
      <p className="eyebrow">The Fleet</p>
      <h1 className="section-title mt-4 max-w-3xl">
        Choose your <span className="gold-text">aircraft.</span>
      </h1>
      <p className="mt-5 max-w-2xl text-mute">
        Every jet and helicopter is operated by a certified crew. Published fares include aircraft, pilots, fuel and
        standard landing fees — add perks at checkout.
      </p>
      <div className="mt-12">
        <FleetBrowser items={items} initialKind={kind} initialSeats={sp.seats ?? "all"} />
      </div>
    </div>
  );
}
