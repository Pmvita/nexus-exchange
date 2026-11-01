"use client";

import Link from "next/link";
import { useState } from "react";
import { api } from "@/lib/api";

const ASSETS = [
  { symbol: "BTC", name: "Bitcoin", price: "67,240.50", change: "+2.45%", volume: "12,450.32" },
  { symbol: "ETH", name: "Ethereum", price: "3,450.20", change: "-1.12%", volume: "89,000.00" },
  { symbol: "SOL", name: "Solana", price: "142.80", change: "+5.33%", volume: "450,000.00" },
  { symbol: "XRP", name: "XRP", price: "0.62", change: "-0.45%", volume: "250,000,000.00" },
  { symbol: "ADA", name: "Cardano", price: "0.89", change: "+0.78%", volume: "150,000,000.00" },
  { symbol: "DOT", name: "Polkadot", price: "6.45", change: "-0.92%", volume: "12,000,000.00" },
  { symbol: "LINK", name: "Chainlink", price: "18.90", change: "+1.34%", volume: "8,500,000.00" },
  { symbol: "MATIC", name: "Polygon", price: "0.74", change: "+0.21%", volume: "45,000,000.00" }
];

export default function AssetsPage() {
  const [search, setSearch] = useState("");

  const filtered = ASSETS.filter(
    (a) => a.symbol.toLowerCase().includes(search.toLowerCase()) || a.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0c]">
      <div className="px-4 py-8 md:py-12 mx-auto max-w-5xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="inline-block px-3 py-1 rounded-full bg-[#1a1a1e] border border-[#222226] text-xs text-nexus-accent font-mono mb-2">
              Markets
            </span>
            <h1 className="text-2xl font-bold text-white">Assets &amp; Tokens</h1>
            <p className="text-nexus-muted text-sm">Spot trading pairs and market data.</p>
          </div>
          <div className="w-full sm:w-96">
            <input
              type="text"
              placeholder="Search symbol or name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#0a0a0c] border border-[#222226] rounded px-3 py-2 text-white focus:border-nexus-accent focus:outline-none text-sm"
            />
          </div>
        </div>

        <div className="bg-[#111114] border border-[#222226] rounded-lg overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#222226]">
                <th className="px-4 py-3 text-xs font-medium text-nexus-muted">Symbol</th>
                <th className="px-4 py-3 text-xs font-medium text-nexus-muted">Name</th>
                <th className="px-4 py-3 text-xs font-medium text-nexus-muted text-right">Price</th>
                <th className="px-4 py-3 text-xs font-medium text-nexus-muted text-right">24h Change</th>
                <th className="px-4 py-3 text-xs font-medium text-nexus-muted text-right">24h Volume</th>
                <th className="px-4 py-3 text-xs font-medium text-nexus-muted text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#222226]">
              {filtered.map((a) => (
                <tr key={a.symbol} className="hover:bg-[#151518] transition">
                  <td className="px-4 py-3 font-mono font-bold text-sm text-white">{a.symbol}</td>
                  <td className="px-4 py-3 text-sm text-white">{a.name}</td>
                  <td className="px-4 py-3 text-sm font-mono text-right text-white">{a.price}</td>
                  <td className="px-4 py-3 text-sm font-mono text-right">
                    <span className={`px-2 py-0.5 rounded text-xs ${
                      a.change.startsWith("+") ? "bg-[#1a3a1a] text-nexus-up" : "bg-[#3a1a1a] text-nexus-down"
                    }`}>{a.change}</span>
                  </td>
                  <td className="px-4 py-3 text-sm font-mono text-right text-nexus-muted">{a.volume}</td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/trade?symbol=${a.symbol}USDT`}
                      className="text-xs text-nexus-accent underline hover:text-white"
                    >
                      Trade
                    </Link>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-nexus-muted text-sm">
                    No assets found matching <span className="font-mono">{search}</span>.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <p className="mt-6 text-xs text-[#66666e] text-center">
          Nexus Exchange — demo environment. Market data is simulated.
        </p>
      </div>
    </div>
  );
}
