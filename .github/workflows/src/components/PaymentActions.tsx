"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      className="btn-ghost !px-4 !py-2"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setDone(true);
          setTimeout(() => setDone(false), 1800);
        } catch {
          /* ignore */
        }
      }}
    >
      {done ? "Copied ✓" : label}
    </button>
  );
}

export function TxForm({ reference, initial }: { reference: string; initial: string }) {
  const router = useRouter();
  const [tx, setTx] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    setMsg("");
    try {
      const r = await fetch(`/api/bookings/${reference}/payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ txHash: tx }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Could not submit.");
      setMsg("Thank you — your transaction hash was received. Our team is verifying the payment.");
      router.refresh();
    } catch (e2) {
      setErr(e2 instanceof Error ? e2.message : "Could not submit.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="label">Transaction hash (TXID)</label>
        <input className="field font-mono text-sm" required value={tx} onChange={(e) => setTx(e.target.value)} placeholder="Paste your transaction hash after sending" />
      </div>
      {err && <p className="text-sm text-red-300">{err}</p>}
      {msg && <p className="text-sm text-amber">{msg}</p>}
      <button className="btn-gold" disabled={busy}>{busy ? "Submitting…" : "I've Sent the Payment"}</button>
    </form>
  );
}
