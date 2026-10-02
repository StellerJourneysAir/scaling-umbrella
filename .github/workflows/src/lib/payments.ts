// Client-safe payment configuration (no secrets / wallet addresses here).

export type PayMethod = "USDT_TRC20" | "USDT_BEP20" | "BTC";

export const PAY_METHODS: {
  id: PayMethod;
  label: string;
  short: string;
  network: string;
  asset: "USDT" | "BTC";
  hint: string;
}[] = [
  { id: "USDT_TRC20", label: "USDT (TRC-20)", short: "USDT · TRC20", network: "TRON", asset: "USDT", hint: "Tether on the TRON network — low fees, fast settlement." },
  { id: "USDT_BEP20", label: "USDT (BEP-20)", short: "USDT · BEP20", network: "BNB Smart Chain", asset: "USDT", hint: "Tether on BNB Smart Chain (BEP-20)." },
  { id: "BTC", label: "Bitcoin (BTC)", short: "Bitcoin · BTC", network: "Bitcoin", asset: "BTC", hint: "Native Bitcoin on-chain payment." },
];

export const BUY_PROVIDERS = [
  {
    id: "moonpay",
    name: "MoonPay",
    domain: "moonpay.com",
    blurb: "Card, Apple Pay & bank transfer",
    links: [
      { label: "Buy Bitcoin", href: "https://www.moonpay.com/buy/btc" },
      { label: "Buy USDT", href: "https://www.moonpay.com/buy/usdt" },
    ],
  },
  {
    id: "bitcoincom",
    name: "Bitcoin.com",
    domain: "bitcoin.com",
    blurb: "Instant purchase, self-custody wallet",
    links: [
      { label: "Buy Bitcoin", href: "https://www.bitcoin.com/buy-bitcoin/" },
      { label: "Buy USDT", href: "https://www.bitcoin.com/buy-usdt/" },
    ],
  },
  {
    id: "changelly",
    name: "Changelly",
    domain: "changelly.com",
    blurb: "Buy or swap 500+ cryptocurrencies",
    links: [
      { label: "Buy Bitcoin", href: "https://changelly.com/buy/btc" },
      { label: "Buy USDT", href: "https://changelly.com/buy/usdt" },
    ],
  },
] as const;

export const STATUS_LABEL: Record<string, string> = {
  pending_payment: "Awaiting payment",
  payment_submitted: "Payment submitted — verifying",
  confirmed: "Confirmed",
  cancelled: "Cancelled",
};
