"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Order, Balance, Trade, Market, OrderBook } from "@nexus/types";

interface AppState {
  symbol: string;
  setSymbol: (s: string) => void;
  markets: Market[];
  setMarkets: (m: Market[]) => void;
  ticker: { [symbol: string]: { price: string; bid: string; ask: string; volume24h: string; change24h: string; changePercent24h: string; count: number } };
  setTicker: (symbol: string, t: any) => void;
  orderBook: OrderBook | null;
  setOrderBook: (b: OrderBook | null) => void;
  recentTrades: Trade[];
  addTrades: (symbol: string, trades: Trade[]) => void;
  balances: Balance[];
  setBalances: (b: Balance[]) => void;
  openOrders: Order[];
  setOpenOrders: (o: Order[]) => void;
  orderHistory: Order[];
  setOrderHistory: (o: Order[]) => void;
  connected: boolean;
  setConnected: (c: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      symbol: "BTCUSDT",
      setSymbol: (s) => set({ symbol: s }),
      markets: [],
      setMarkets: (m) => set({ markets: m }),
      ticker: {},
      setTicker: (symbol, t) => set((s) => ({ ticker: { ...s.ticker, [symbol]: t } })),
      orderBook: null,
      setOrderBook: (b) => set({ orderBook: b }),
      recentTrades: [],
      addTrades: (symbol, trades) => set((s) => {
        const filtered = trades.filter((t) => t.symbol === symbol);
        return { recentTrades: [...filtered, ...s.recentTrades].slice(0, 200) };
      }),
      balances: [],
      setBalances: (b) => set({ balances: b }),
      openOrders: [],
      setOpenOrders: (o) => set({ openOrders: o }),
      orderHistory: [],
      setOrderHistory: (o) => set({ orderHistory: o }),
      connected: false,
      setConnected: (c) => set({ connected: c })
    }),
    { name: "nexus-storage" }
  )
);
