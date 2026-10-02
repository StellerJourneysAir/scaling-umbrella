import Link from "next/link";

const NAV = [
  { href: "/#fleet", label: "Fleet" },
  { href: "/#perks", label: "Perks" },
  { href: "/#pricing", label: "Trips" },
  { href: "/#payments", label: "Pay with Crypto" },
  { href: "/manage", label: "My Booking" },
];

export default function SiteHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-ink/70 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8">
        <Link href="/" aria-label="Steller Journeys home" className="flex items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/logo.png" alt="Steller Journeys" className="h-12 w-auto" />
        </Link>
        <nav className="hidden items-center gap-8 lg:flex">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="font-display text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-cream/80 transition hover:text-amber"
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/fleet" className="hidden text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-cream/80 hover:text-amber sm:block font-display">
            View Fleet
          </Link>
          <Link href="/book" className="btn-gold !px-5 !py-3">
            Book a Flight
          </Link>
        </div>
      </div>
    </header>
  );
}
