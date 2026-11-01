"use client";

import { useEffect, useCallback, useState } from "react";
import Link from "next/link";
import { useAppStore } from "@/lib/store";
import { wsConnect } from "@/lib/api";
import { api } from "@/lib/api";
import { Ticker } from "@/components/Ticker";
import { OrderBook } from "@/components/OrderBook";
import { TradeList } from "@/components/TradeList";
import { Chart } from "@/components/Chart";
import { BalancePanel } from "@/components/BalancePanel";
import { OrderPanel } from "@/components/OrderPanel";
import { OrderForm } from "@/components/OrderForm";
import { AuthForm } from "@/components/AuthForm";
import type { Market, OrderBook as OrderBookType, Trade } from "@nexus/types";
import { SYMBOLS } from "@nexus/config";

export default function TradePage() {
  const symbol = useAppStore((s) => s.symbol);
  const setSymbol = useAppStore((s) => s.setSymbol);
  const markets = useAppStore((s) => s.markets);
  const setMarkets = useAppStore((s) => s.setMarkets);
  const ticker = useAppStore((s) => s.ticker);
  const setTicker = useAppStore((s) => s.setTicker);
  const orderBook = useAppStore((s) => s.orderBook);
  const setOrderBook = useAppStore((s) => s.setOrderBook);
  const recentTrades = useAppStore((s) => s.recentTrades);
  const addTrades = useAppStore((s) => s.addTrades);
  const balances = useAppStore((s) => s.balances);
  const setBalances = useAppStore((s) => s.setBalances);
  const openOrders = useAppStore((s) => s.openOrders);
  const orderHistory = useAppStore((s) => s.orderHistory);
  const connected = useAppStore((s) => s.connected);
  const setConnected = useAppStore((s) => s.setConnected);

  const [candles, setCandles] = useState<any[]>([]);
  const [ws, setWs] = useState<any>(null);

  const handleMessage = useCallback((data: any) => {
    if (data.type === "connected") setConnected(true);
    if (data.type === "disconnected") setConnected(false);
    if (data.type === "trade" && data.data && data.data.symbol === symbol) {
      addTrades(symbol, [data.data]);
      const m = markets.find((x) => x.symbol === symbol);
      if (m && data.data.price) {
        setTicker(symbol, {
          price: data.data.price,
          bid: m.bid,
          ask: m.ask,
          volume24h: m.volume24h,
          change24h: m.change24h,
          changePercent24h: m.changePercent24h,
          count: m.count
        });
      }
    }
    if (data.type === "depth" && data.data && data.data.symbol === symbol) setOrderBook(data.data);
    if (data.type === "ticker-snapshot" && data.data && data.data.symbol === symbol) setTicker(symbol, data.data);
    if (data.type === "balance") setBalances(data.data.balances);
  }, [symbol, markets, setConnected, setOrderBook, setTicker, setBalances, addTrades]);

  useEffect(() => {
    const socket = wsConnect(handleMessage);
    setWs(socket);
    socket.emit("subscribe:ticker", symbol);
    socket.emit("subscribe:depth", symbol);
    socket.emit("subscribe:trades", symbol);
    return () => {
      socket.emit("unsubscribe:ticker", symbol);
      socket.emit("unsubscribe:depth", symbol);
      socket.emit("unsubscribe:trades", symbol);
      socket.disconnect();
    };
  }, [symbol, handleMessage]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [mkt, tk, ob, tr, cd] = await Promise.all([
          api<Market[]>("/api/markets"),
          api<{ symbol: string; price: string; bid: string; ask: string; volume24h: string; change24h: string; changePercent24h: string; count: number }[]>(`/api/tickers`),
          api<OrderBookType>(`/api/orderbook/${symbol}?depth=50`),
          api<Trade[]>(`/api/trades/${symbol}?limit=50`),
          api<any[]>(`/api/candles/${symbol}/1m?limit=200`)
        ]);
        if (!mounted) return;
        setMarkets(mkt);
        tk.forEach((t) => setTicker(t.symbol, t));
        setOrderBook(ob);
        addTrades(symbol, tr);
        setCandles(cd);
      } catch (e) {
        console.error("init error", e);
      }
    })();
    return () => { mounted = false; };
  }, [symbol, setMarkets, setTicker, setOrderBook, addTrades, setCandles]);

  const market = markets.find((m) => m.symbol === symbol);
  const symTicker = ticker[symbol];

  return (
    <div className="container mx-auto px-4 py-6 max-w-[1400px]">
      <div className="flex flex-col lg:flex-row gap-6">
        <aside className="w-full lg:w-72 flex-shrink-0 flex flex-col gap-4">
          <AuthForm />
          <div className="bg-[#111114] border border-[#222226] rounded p-3">
            <span className="font-bold text-xs text-nexus-muted mb-2 block">Markets</span>
            <div className="space-y-1">
              {SYMBOLS.map((s) => (
                <button
                  key={s}
                  onClick={() => setSymbol(s)}
                  className={`w-full text-left px-3 py-2 text-xs rounded border ${symbol === s ? "bg-nexus-accent text-black border-nexus-accent font-bold" : "border-transparent text-nexus-muted hover:bg-[#1a1a1e]"}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <OrderForm symbol={symbol} />
          <OrderPanel orders={openOrders} title="Open Orders" />
          <OrderPanel orders={orderHistory} title="Order History" />
        </aside>

        <main className="flex-1 min-w-0 flex flex-col gap-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold">Nexus Exchange</h1>
              <p className="text-xs text-nexus-muted">Spot trading • Matching engine • Real-time WS</p>
            </div>
            <div className={`flex items-center gap-2 px-2 py-1 rounded border ${connected ? "bg-[#151518] border-nexus-up/30 text-nexus-up" : "bg-[#1a1a1e] border-[#222226] text-nexus-muted"}`}>
              <span className={`w-2 h-2 rounded-full ${connected ? "bg-nexus-up animate-pulse" : "bg-[#444444]"}`} />
              <span className="text-xs font-mono">{connected ? "Connected" : "Disconnected"}</span>
            </div>
          </div>

          <Ticker markets={markets.length ? markets : market ? [market] : []} />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <section className="lg:col-span-7 flex flex-col gap-4 min-w-0">
              <div className="bg-[#111114] border border-[#222226] rounded p-3 flex flex-col">
                <span className="font-bold text-sm mb-2">Chart — {symbol}</span>
                <Chart candles={candles} />
              </div>
              <div className="bg-[#111114] border border-[#222226] rounded p-3 flex-1 min-h-[200]">
                <span className="font-bold text-sm mb-2">Order Book</span>
                <OrderBook book={orderBook} />
              </div>
            </section>

            <section className="lg:col-span-5 flex flex-col gap-4 min-w-0">
              <div className="bg-[#111114] border border-[#222226] rounded p-3 flex flex-col">
                <span className="font-bold text-sm mb-2">Recent Trades</span>
                <div className="flex-1 overflow-y-auto max-h-[300]">
                  <TradeList trades={recentTrades.filter((t) => t.symbol === symbol)} />
                </div>
              </div>
              <div className="bg-[#111114] border border-[#222226] rounded p-3 flex flex-col">
                <span className="font-bold text-sm mb-2">Balances</span>
                <BalancePanel balances={balances} />
              </div>
            </section>
          </div>

          <div className="bg-[#111114] border border-[#222226] rounded p-3 mt-2">
            <span className="font-bold text-sm mb-2 block">Market Data</span>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div className="bg-[#0a0a0c] p-2 rounded border border-[#1a1a1e]">
                <span className="text-nexus-muted">Last Price</span>
                <div className="font-mono font-bold">{symTicker?.price ?? market?.price ?? "—"}</div>
              </div>
              <div className="bg-[#0a0a0c] p-2 rounded border border-[#1a1a1e]">
                <span className="text-nexus-muted">Bid / Ask</span>
                <div className="font-mono font-bold">
                  {symTicker?.bid ?? market?.bid ?? "—"} / {symTicker?.ask ?? market?.ask ?? "—"}
                </div>
              </div>
              <div className="bg-[#0a0a0c] p-2 rounded border border-[#1a1a1e]">
                <span className="text-nexus-muted">24h Change</span>
                <div className={`font-mono font-bold ${symTicker?.change24h?.startsWith("+") ? "text-nexus-up" : "text-nexus-down"}`}>
                  {symTicker?.change24h ?? market?.change24h ?? "—"} ({symTicker?.changePercent24h ?? market?.changePercent24h ?? "—"}%)
                </div>
              </div>
              <div className="bg-[#0a0a0c] p-2 rounded border border-[#1a1a1e]">
                <span className="text-nexus-muted">24h Volume</span>
                <div className="font-mono font-bold">{symTicker?.volume24h ?? market?.volume24h ?? "—"}</div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
