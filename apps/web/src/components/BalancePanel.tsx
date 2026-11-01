"use client";

import type { Balance } from "@nexus/types";

type Props = { balances: Balance[] };

export function BalancePanel({ balances }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {balances.map((b) => (
        <div key={b.asset} className="bg-[#111114] border border-[#222226] rounded p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="font-bold text-sm">{b.asset}</span>
            <span className="text-xs text-nexus-muted">Available</span>
          </div>
          <div className="text-sm font-mono">{b.available}</div>
          <div className="text-[10px] text-nexus-muted mt-1">Locked {b.locked}</div>
        </div>
      ))}
    </div>
  );
}
