"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import type { Candle } from "@nexus/types";

type Props = { candles: Candle[] };

export function Chart({ candles }: Props) {
  if (!candles.length) return <div className="h-64 flex items-center justify-center text-nexus-muted text-sm">No chart data</div>;
  return (
    <div className="h-96">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={candles}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#222226" />
          <XAxis dataKey="openTime" stroke="#8a8a96" tick={{ fontSize: 10 }} />
          <YAxis stroke="#8a8a96" tick={{ fontSize: 10 }} />
          <Tooltip />
          <Line type="monotone" dataKey="close" stroke="#00d9a5" strokeWidth={2} dot={false} />
          <ReferenceLine y={candles[candles.length - 1].close} stroke="#00d9a5" strokeDasharray="3 3" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
