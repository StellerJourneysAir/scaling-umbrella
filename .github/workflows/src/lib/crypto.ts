import type { PayMethod } from "@/lib/payments";

/** Deposit wallets come from environment variables — never hard-code them. */
export function walletFor(method: PayMethod): string {
  const map: Record<PayMethod, string | undefined> = {
    USDT_TRC20: process.env.WALLET_USDT_TRC20,
    USDT_BEP20: process.env.WALLET_USDT_BEP20,
    BTC: process.env.WALLET_BTC,
  };
  return (map[method] ?? "").trim();
}

const g = globalThis as typeof globalThis & { __btcRate?: { rate: number; at: number } };

/** Live BTC/USD spot rate (cached 60s). Returns null if no provider is reachable. */
export async function getBtcUsd(): Promise<number | null> {
  if (g.__btcRate && Date.now() - g.__btcRate.at < 60_000) return g.__btcRate.rate;
  const sources: (() => Promise<number>)[] = [
    async () => {
      const r = await fetch("https://api.coinbase.com/v2/prices/BTC-USD/spot", { cache: "no-store", signal: AbortSignal.timeout(4000) });
      const j = (await r.json()) as { data: { amount: string } };
      return parseFloat(j.data.amount);
    },
    async () => {
      const r = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd", { cache: "no-store", signal: AbortSignal.timeout(4000) });
      const j = (await r.json()) as { bitcoin: { usd: number } };
      return j.bitcoin.usd;
    },
  ];
  for (const s of sources) {
    try {
      const rate = await s();
      if (rate > 0 && Number.isFinite(rate)) {
        g.__btcRate = { rate, at: Date.now() };
        return rate;
      }
    } catch {
      /* try next */
    }
  }
  return g.__btcRate?.rate ?? null;
}
