import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-coal">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:px-8 md:grid-cols-4">
        <div className="md:col-span-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/logo-footer.png" alt="Steller Journeys" className="h-14 w-auto" />
          <p className="mt-6 max-w-md text-sm leading-relaxed text-mute">
            Steller Journeys brings the precision of our global logistics network to the skies —
            private jets and helicopters, tailored perks and seamless crypto settlement, door to door.
          </p>
          <p className="mt-6 text-xs text-mute">
            Part of the Steller Journeys family ·{" "}
            <a href="https://stellerjourneys.com" target="_blank" rel="noopener noreferrer" className="text-amber hover:underline">
              stellerjourneys.com
            </a>
          </p>
        </div>
        <div>
          <h4 className="eyebrow mb-5">Explore</h4>
          <ul className="space-y-3 text-sm text-cream/80">
            <li><Link href="/fleet" className="hover:text-amber">Jets & Helicopters</Link></li>
            <li><Link href="/#perks" className="hover:text-amber">Special Perks</Link></li>
            <li><Link href="/book" className="hover:text-amber">Book a Flight</Link></li>
            <li><Link href="/manage" className="hover:text-amber">Find My Booking</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="eyebrow mb-5">Payments</h4>
          <ul className="space-y-3 text-sm text-cream/80">
            <li>USDT · TRC-20</li>
            <li>USDT · BEP-20</li>
            <li>Bitcoin · BTC</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-6 text-center text-xs text-mute">
        © {new Date().getFullYear()} Steller Journeys. All rights reserved. Aircraft are operated by licensed
        third-party air carriers. Cryptocurrency payments are final once confirmed on-chain.
      </div>
    </footer>
  );
}
