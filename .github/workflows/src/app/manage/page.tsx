"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ManagePage() {
  const router = useRouter();
  const [ref, setRef] = useState("");
  return (
    <div className="mx-auto max-w-xl px-5 pb-28 pt-36 sm:px-8">
      <p className="eyebrow">My Booking</p>
      <h1 className="section-title mt-4">Find your <span className="gold-text">reservation.</span></h1>
      <p className="mt-5 text-mute">Enter the booking reference you received after reserving (e.g. SJ-ABCD2345).</p>
      <form
        className="mt-10 space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          if (ref.trim()) router.push(`/booking/${encodeURIComponent(ref.trim().toUpperCase())}`);
        }}
      >
        <div>
          <label className="label">Booking reference</label>
          <input className="field font-mono uppercase" required value={ref} onChange={(e) => setRef(e.target.value)} placeholder="SJ-XXXXXXXX" />
        </div>
        <button className="btn-gold">View Booking</button>
      </form>
    </div>
  );
}
