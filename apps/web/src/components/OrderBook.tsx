"use client";

import type { OrderBookEntry } from "@nexus/types";

type Props = { entries: OrderBookEntry[]; side: "bid" | "ask" };

export function OrderBookSide({ entries, side }: Props) {
  const total = entries.reduce((sum, e) => sum + Number(e.qty), 0);
  return (
    <div className="grid w-full grid-cols-3 gap-1 px-2 text-xs">
      {entries.map((entry) => {
        const pct = total > 0 ? (Number(entry.qty) / total) * 100 : 0;
        const colorClass = side === "bid" ? "text-nexus-up" : "text-nexus-down";
        return (
          <div key={entry.price} className={`flex items-center justify-between ${colorClass}`}>
            <span className="text-right font-mono">{entry.price}</span>
            <div className="w-full h-3 mx-2 bg-[#222226] rounded overflow-hidden">
              <div
                className={`h-full ${side === "bid" ? "bg-nexus-accent/30" : "bg-nexus-down/30"}`}
                style={{ width: `${Math.min(pct, 100)}%` }}
              />
            </div>
            <span className="text-left font-mono">{entry.qty}</span>
          </div>
        );
      })}
    </div>
  );
}

export function OrderBook({ book }: { book: { bids: OrderBookEntry[]; asks: OrderBookEntry[] } | null }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between text-xs text-nexus-muted mb-1">
        <span className="text-nexus-up">Bids</span>
        <span className="text-nexus-down">Asks</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <OrderBookSide entries={book?.bids ?? []} side="bid" />
        <OrderBookSide entries={book?.asks ?? []} side="ask" />
      </div>
    </div>
  );
}
