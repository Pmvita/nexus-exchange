"use client";

import type { Trade } from "@nexus/types";

type Props = { trades: Trade[] };

export function TradeList({ trades }: Props) {
  return (
    <div className="overflow-hidden">
      <table className="w-full text-left text-xs border-collapse">
        <thead>
          <tr className="text-nexus-muted border-b border-[#222226]">
            <th className="pb-1 font-mono">Time</th>
            <th className="pb-1 font-mono text-right">Price</th>
            <th className="pb-1 font-mono text-right">Qty</th>
            <th className="pb-1 font-mono text-right">Side</th>
          </tr>
        </thead>
        <tbody>
          {trades.slice(0, 50).map((t) => (
            <tr key={t.id} className="border-b border-[#1a1a1e] hover:bg-[#151518]">
              <td className="py-1 font-mono text-nexus-muted">
                {new Date(t.createdAt).toLocaleTimeString([], { hour12: false })}
              </td>
              <td className="py-1 font-mono text-right">{t.price}</td>
              <td className="py-1 font-mono text-right">{t.qty}</td>
              <td className="py-1 font-mono text-right">
                <span className={t.side === "BUY" ? "text-nexus-up" : "text-nexus-down"}>
                  {t.side === "BUY" ? "Buy" : "Sell"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
