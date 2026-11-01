"use client";

import type { Market } from "@nexus/types";

type Props = { markets: Market[] };

export function Ticker({ markets }: Props) {
  return (
    <div className="flex flex-wrap gap-4 overflow-x-auto pb-1 border-b border-[#222226]">
      {markets.map((m) => {
        const up = m.change24h.startsWith("+") || (Number(m.change24h) >= 0);
        return (
          <div key={m.symbol} className="flex flex-col gap-1 whitespace-nowrap">
            <span className="text-xs font-mono text-nexus-muted">{m.symbol}</span>
            <div className="flex items-baseline gap-1">
              <span className="text-sm font-bold font-mono">{m.price}</span>
              <span className={`text-xs font-bold ${up ? "text-nexus-up" : "text-nexus-down"}`}>
                {m.change24h} ({m.changePercent24h}%)
              </span>
            </div>
            <span className="text-xs text-nexus-muted font-mono">V {m.volume24h}</span>
          </div>
        );
      })}
    </div>
  );
}
