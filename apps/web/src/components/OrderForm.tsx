"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { api } from "@/lib/api";
import type { Balance, Order, OrderSide, OrderStatus, OrderType, PlaceOrderRequest } from "@nexus/types";

type Props = { symbol: string };

export function OrderForm({ symbol }: Props) {
  const setOpenOrders = useAppStore((s) => s.setOpenOrders);
  const setOrderHistory = useAppStore((s) => s.setOrderHistory);
  const setBalances = useAppStore((s) => s.setBalances);
  const [type, setType] = useState<OrderType>("LIMIT");
  const [side, setSide] = useState<OrderSide>("BUY");
  const [price, setPrice] = useState("");
  const [qty, setQty] = useState("");
  const [msg, setMsg] = useState({ text: "", kind: "info" as "info" | "success" | "error" });

  async function place(e: React.FormEvent) {
    e.preventDefault();
    setMsg({ text: "Placing...", kind: "info" });
    try {
      const body: PlaceOrderRequest = { symbol, side, type, qty };
      if (type === "LIMIT") body.price = price;
      const res = await api<{ order: Order; status: OrderStatus }>("/api/orders", { method: "POST", body: JSON.stringify(body) });
      setMsg({ text: `Order placed ${res.order.id.slice(-6)} (${res.status})`, kind: "success" });
      setPrice(""); setQty("");
      await load();
    } catch (err: any) {
      setMsg({ text: err.message, kind: "error" });
    }
  }

  async function load() {
    try {
      const [orders, history, balances] = await Promise.all([
        api<Order[]>("/api/orders"),
        api<Order[]>("/api/orders/history"),
        api<Balance[]>("/api/balances")
      ]);
      setOpenOrders(orders);
      setOrderHistory(history);
      setBalances(balances);
    } catch {}
  }

  return (
    <div className="bg-[#111114] border border-[#222226] rounded p-3 space-y-3">
      <div className="flex items-center justify-between mb-1">
        <span className="font-bold text-sm">Place Order</span>
        <span className={`text-xs font-bold ${msg.kind === "success" ? "text-nexus-up" : msg.kind === "error" ? "text-nexus-down" : "text-nexus-accent"}`}>{msg.text}</span>
      </div>
      <form onSubmit={place} className="grid grid-cols-4 gap-2">
        <select
          value={side}
          onChange={(e) => setSide(e.target.value as OrderSide)}
          className="bg-[#0a0a0c] border border-[#222226] rounded px-2 py-1 text-xs text-white focus:border-nexus-accent"
        >
          <option value="BUY">Buy</option>
          <option value="SELL">Sell</option>
        </select>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as OrderType)}
          className="bg-[#0a0a0c] border border-[#222226] rounded px-2 py-1 text-xs text-white focus:border-nexus-accent"
        >
          <option value="LIMIT">Limit</option>
          <option value="MARKET">Market</option>
        </select>
        <input
          type="text"
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          disabled={type === "MARKET"}
          className="bg-[#0a0a0c] border border-[#222226] rounded px-2 py-1 text-xs font-mono text-white focus:border-nexus-accent"
        />
        <input
          type="text"
          placeholder="Qty"
          value={qty}
          onChange={(e) => setQty(e.target.value)}
          className="bg-[#0a0a0c] border border-[#222226] rounded px-2 py-1 text-xs font-mono text-white focus:border-nexus-accent"
        />
        <button
          type="submit"
          className="bg-nexus-accent text-black font-bold text-xs rounded px-3 py-1.5 hover:bg-[#00bf8c] disabled:opacity-50"
          disabled={!qty || (type === "LIMIT" && !price)}
        >
          Place
        </button>
      </form>
    </div>
  );
}
