"use client";

import Link from "next/link";
import { useState } from "react";
import { api } from "@/lib/api";

const WITHDRAW_ASSETS = ["USDT", "BTC", "ETH", "SOL", "XRP", "ADA"];

export default function WithdrawPage() {
  const [asset, setAsset] = useState("USDT");
  const [amount, setAmount] = useState("");
  const [address, setAddress] = useState("");
  const [msg, setMsg] = useState({ text: "", kind: "info" as "info" | "success" | "error" });
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg({ text: "", kind: "info" });
    try {
      await api("/api/withdraw", {
        method: "POST",
        body: JSON.stringify({ asset, amount, address })
      });
      setMsg({ text: `Withdrawal of ${amount} ${asset} requested`, kind: "success" });
      setAmount("");
      setAddress("");
    } catch (err: any) {
      setMsg({ text: err.message ?? "Withdrawal failed", kind: "error" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0c]">
      <div className="px-4 py-8 md:py-12 mx-auto max-w-md">
        <div className="mb-8">
          <Link href="/" className="text-xs text-nexus-muted hover:text-white">← Back to home</Link>
          <h1 className="text-2xl font-bold text-white mt-2 mb-2">Withdraw</h1>
          <p className="text-nexus-muted text-sm">Send funds from your account to an external address.</p>
        </div>

        <div className="bg-[#111114] border border-[#222226] rounded-lg p-6 space-y-4">
          <div className="space-y-3">
            <label className="text-xs font-medium text-nexus-muted">Asset</label>
            <select
              value={asset}
              onChange={(e) => setAsset(e.target.value)}
              className="w-full bg-[#0a0a0c] border border-[#222226] rounded px-3 py-2 text-white focus:border-nexus-accent focus:outline-none"
            >
              {WITHDRAW_ASSETS.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>
          <div className="space-y-3">
            <label className="text-xs font-medium text-nexus-muted">Amount</label>
            <input
              type="number"
              step="any"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-[#0a0a0c] border border-[#222226] rounded px-3 py-2 text-white focus:border-nexus-accent focus:outline-none"
              placeholder="0.00"
            />
          </div>
          <div className="space-y-3">
            <label className="text-xs font-medium text-nexus-muted">Destination address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full bg-[#0a0a0c] border border-[#222226] rounded px-3 py-2 text-white focus:border-nexus-accent focus:outline-none font-mono"
              placeholder="0x..."
            />
          </div>

          <button
            onClick={submit}
            disabled={loading || !amount || !address}
            className="w-full bg-nexus-accent text-black font-bold py-3 rounded-lg disabled:opacity-50 hover:bg-[#00bf8c] transition"
          >
            {loading ? "Processing..." : "Request withdrawal"}
          </button>

          {msg.text && (
            <div className={`mt-4 p-3 rounded text-xs ${
              msg.kind === "error" ? "bg-[#3a1a1a] border border-[#5a2a2a] text-red-400" :
              "bg-[#1a3a1a] border border-[#2a5a2a] text-nexus-up"
            }`}>{msg.text}</div>
          )}
        </div>

        <div className="mt-8 p-4 bg-[#111114] border border-[#222226] rounded">
          <p className="text-xs text-nexus-muted mb-2">Important notes</p>
          <ul className="text-xs text-[#66666e] space-y-1 list-disc list-inside">
            <li>Withdrawals are processed manually in this demo environment.</li>
            <li>Double-check the destination address before submitting.</li>
            <li>Network fees may apply and are deducted from the amount.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
