"use client";

import type { Order } from "@nexus/types";

type Props = { orders: Order[]; title: "Open Orders" | "Order History" };

export function OrderPanel({ orders, title }: Props) {
  return (
    <div className="bg-[#111114] border border-[#222226] rounded p-3">
      <div className="flex items-center justify-between mb-3">
        <span className="font-bold text-sm">{title}</span>
        <span className="text-xs text-nexus-muted">{orders.length}</span>
      </div>
      <table className="w-full text-left text-xs border-collapse">
        <thead>
          <tr className="text-nexus-muted border-b border-[#222226]">
            <th className="pb-1 font-mono">ID</th>
            <th className="pb-1 font-mono">Symbol</th>
            <th className="pb-1 font-mono text-right">Type</th>
            <th className="pb-1 font-mono text-right">Price</th>
            <th className="pb-1 font-mono text-right">Qty</th>
            <th className="pb-1 font-mono text-right">Filled</th>
            <th className="pb-1 font-mono text-right">Status</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id} className="border-b border-[#1a1a1e] hover:bg-[#151518]">
              <td className="py-1 font-mono text-nexus-muted">{o.id.slice(-6)}</td>
              <td className="py-1 font-mono">{o.symbol}</td>
              <td className="py-1 font-mono text-right">{o.side === "BUY" ? "Buy" : "Sell"} {o.type}</td>
              <td className="py-1 font-mono text-right">{o.price ?? "—"}</td>
              <td className="py-1 font-mono text-right">{o.qty}</td>
              <td className="py-1 font-mono text-right">{o.filled}</td>
              <td className="py-1 font-mono text-right">
                <span className={o.status === "FILLED" ? "text-nexus-up" : o.status === "CANCELLED" ? "text-nexus-muted" : "text-nexus-accent"}>
                  {o.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
