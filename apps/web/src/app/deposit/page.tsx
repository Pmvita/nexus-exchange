"use client";

import Link from "next/link";
import { useState } from "react";
import { api } from "@/lib/api";

const DEPOSIT_ASSETS = ["USDT", "BTC", "ETH", "SOL", "XRP", "ADA"];

export default function DepositPage() {
  const [asset, setAsset] = useState("USDT");
  const [amount, setAmount] = useState("");
  const [msg, setMsg] = useState({ text: "", kind: "info" as "info" | "success" | "error" });
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState("");

  async function generateAddress() {
    setMsg({ text: "", kind: "info" });
    try {
      const res = await api<{ address: string }>("/api/deposit-address", {
        method: "POST",
        body: JSON.stringify({ asset })
      });
      setAddress(res.address);
      setMsg({ text: "Deposit address generated", kind: "success" });
    } catch (err: any) {
      setMsg({ text: err.message ?? "Failed to generate address", kind: "error" });
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg({ text: "", kind: "info" });
    try {
      await api("/api/deposit", {
        method: "POST",
        body: JSON.stringify({ asset, amount })
      });
      setMsg({ text: `Deposit of ${amount} ${asset} credited`, kind: "success" });
      setAmount("");
    } catch (err: any) {
      setMsg({ text: err.message ?? "Deposit failed", kind: "error" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0c]">
      <div className="px-4 py-8 md:py-12 mx-auto max-w-3xl">
        <div className="mb-8">
          <Link href="/" className="text-xs text-nexus-muted hover:text-white">← Back to home</Link>
          <h1 className="text-2xl font-bold text-white mt-2 mb-2">Deposit</h1>
          <p className="text-nexus-muted text-sm">Credit your account to start trading.</p>
        </div>

        <div className="bg-[#111114] border border-[#222226] rounded-lg p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-xs font-medium text-nexus-muted">Asset</label>
              <select
                value={asset}
                onChange={(e) => setAsset(e.target.value)}
                className="w-full bg-[#0a0a0c] border border-[#222226] rounded px-3 py-2 text-white focus:border-nexus-accent focus:outline-none"
              >
                {DEPOSIT_ASSETS.map((a) => (
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
          </div>

          <div className="flex gap-3">
            <button
              onClick={generateAddress}
              disabled={loading}
              className="flex-1 bg-[#1a1a1e] border border-[#222226] text-white px-4 py-2.5 rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-[#222226] transition"
            >
              {loading ? "Generating..." : "Get deposit address"}
            </button>
          </div>

          {address && (
            <div className="bg-[#0a0a0c] border border-[#222226] rounded p-4">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-medium text-nexus-muted">Deposit address ({asset})</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(address);
                    setMsg({ text: "Address copied", kind: "success" });
                  }}
                  className="text-xs text-nexus-accent hover:underline"
                >
                  Copy
                </button>
              </div>
              <div className="font-mono text-xs text-truncate text-white bg-[#1a1a1e] px-3 py-2 rounded border border-[#222226]">
                {address}
              </div>
              <p className="mt-2 text-xs text-[#66666e]">
                Send only {asset} to this address. Deposits may take several minutes to confirm.
              </p>
            </div>
          )}

          <form onSubmit={submit} className="pt-4 border-t border-[#222226]">
            <label className="text-xs font-medium text-nexus-muted mb-2 block">Confirm deposit amount</label>
            <div className="flex gap-3">
              <input
                type="number"
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="flex-1 bg-[#0a0a0c] border border-[#222226] rounded px-3 py-2 text-white focus:border-nexus-accent focus:outline-none"
                placeholder="Amount"
              />
              <button
                type="submit"
                disabled={loading || !amount}
                className="bg-nexus-accent text-black font-bold px-4 py-2.5 rounded-lg disabled:opacity-50 hover:bg-[#00bf8c] transition"
              >
                {loading ? "Processing..." : "Deposit"}
              </button>
            </div>
          </form>

          {msg.text && (
            <div className={`mt-3 p-3 rounded text-xs ${
              msg.kind === "error" ? "bg-[#3a1a1a] border border-[#5a2a2a] text-red-400" :
              "bg-[#1a3a1a] border border-[#2a5a2a] text-nexus-up"
            }`}>{msg.text}</div>
          )}
        </div>
      </div>
    </div>
  );
}
