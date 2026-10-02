import { BUY_PROVIDERS } from "@/lib/payments";

export default function BuyCrypto({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`grid gap-5 ${compact ? "sm:grid-cols-3" : "md:grid-cols-3"}`}>
      {BUY_PROVIDERS.map((p) => (
        <div key={p.id} className="card flex flex-col p-6">
          <p className="font-display text-lg font-bold">{p.name}</p>
          <p className="text-xs uppercase tracking-[0.18em] text-brand">{p.domain}</p>
          <p className="mt-3 flex-1 text-sm text-mute">{p.blurb}</p>
          <div className="mt-5 flex flex-col gap-3">
            {p.links.map((l, i) => (
              <a
                key={l.href}
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                className={i === 0 ? "btn-gold !py-3" : "btn-ghost !py-3"}
              >
                {l.label} ↗
              </a>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
