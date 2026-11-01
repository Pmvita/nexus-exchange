"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { useAppStore } from "@/lib/store";

export function AuthForm() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("demo");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState({ text: "", kind: "info" as "info" | "success" | "error" });
  const setBalances = useAppStore((s) => s.setBalances);
  const setOpenOrders = useAppStore((s) => s.setOpenOrders);
  const setOrderHistory = useAppStore((s) => s.setOrderHistory);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg({ text: "Authenticating...", kind: "info" });
    try {
      if (mode === "login") {
        await api("/api/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
      } else {
        await api("/api/auth/register", { method: "POST", body: JSON.stringify({ email, username, password }) });
      }
      const res = await api<{ token: string }>("/api/auth/me");
      localStorage.setItem("nexus_token", res.token);
      await api<{ token: string }>("/api/auth/me").then(async (me) => {
        const token = localStorage.getItem("nexus_token");
        const r = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000"}/api/balances`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (r.ok) setBalances(await r.json());
        const o = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000"}/api/orders`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (o.ok) setOpenOrders(await o.json());
        const h = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000"}/api/orders/history`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (h.ok) setOrderHistory(await h.json());
      });
      setMsg({ text: "Logged in", kind: "success" });
    } catch (err: any) {
      setMsg({ text: err.message, kind: "error" });
    }
  }

  return (
    <div className="bg-[#111114] border border-[#222226] rounded p-3 space-y-2">
      <div className="flex items-center justify-between mb-1">
        <span className="font-bold text-sm">Connect</span>
        <button onClick={() => setMode(mode === "login" ? "register" : "login")} className="text-xs text-nexus-accent underline">
          {mode === "login" ? "Create account" : "Sign in"}
        </button>
      </div>
      <form onSubmit={submit} className="grid grid-cols-2 gap-2">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="bg-[#0a0a0c] border border-[#222226] rounded px-2 py-1 text-xs text-white focus:border-nexus-accent"
        />
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="bg-[#0a0a0c] border border-[#222226] rounded px-2 py-1 text-xs text-white focus:border-nexus-accent"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="bg-[#0a0a0c] border border-[#222226] rounded px-2 py-1 text-xs text-white focus:border-nexus-accent"
        />
        <button
          type="submit"
          className="bg-nexus-accent text-black font-bold text-xs rounded px-3 py-1.5 hover:bg-[#00bf8c]"
        >
          {mode === "login" ? "Login" : "Register"}
        </button>
      </form>
      <p className="text-[10px] text-nexus-muted">{msg.text}</p>
    </div>
  );
}
