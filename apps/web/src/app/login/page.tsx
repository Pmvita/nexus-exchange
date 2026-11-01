"use client";

import Link from "next/link";
import { useState } from "react";
import { api } from "@/lib/api";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState({ text: "", kind: "info" as "info" | "success" | "error" });
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg({ text: "", kind: "info" });
    try {
      await api("/api/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
      localStorage.setItem("nexus_token", "demo");
      setMsg({ text: "Logged in successfully", kind: "success" });
      setTimeout(() => (window.location.href = "/trade"), 800);
    } catch (err: any) {
      setMsg({ text: err.message ?? "Login failed", kind: "error" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0c]">
      <div className="w-full max-w-md px-4">
        <div className="bg-[#111114] border border-[#222226] rounded-xl p-8">
          <Link href="/" className="flex items-center gap-2 mb-6">
            <span className="rounded bg-nexus-accent text-black px-2 py-0.5 text-xs font-bold">N</span>
            <span className="font-bold text-xl tracking-tight text-white">Nexus Exchange</span>
          </Link>
          <h1 className="text-2xl font-bold text-white mb-2">Welcome back</h1>
          <p className="text-nexus-muted text-sm mb-8">Sign in to your account to start trading.</p>

          {msg.text && (
            <div className={`mb-4 p-3 rounded text-xs ${
              msg.kind === "error" ? "bg-[#3a1a1a] border border-[#5a2a2a] text-red-400" :
              msg.kind === "success" ? "bg-[#1a3a1a] border border-[#2a5a2a] text-nexus-up" :
              "bg-[#1a1a1e] border border-[#222226] text-nexus-muted"
            }`}>{msg.text}</div>
          )}

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-nexus-muted mb-1">Email address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#0a0a0c] border border-[#222226] rounded px-3 py-2 text-white focus:border-nexus-accent focus:outline-none"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-nexus-muted mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#0a0a0c] border border-[#222226] rounded px-3 py-2 text-white focus:border-nexus-accent focus:outline-none"
                placeholder="••••••••"
              />
            </div>
            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-1 cursor-pointer">
                <input type="checkbox" className="rounded border-[#222226] text-nexus-accent" />
                <span className="text-nexus-muted">Remember me</span>
              </label>
              <Link href="/forgot-password" className="text-nexus-accent hover:underline">
                Forgot password?
              </Link>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-nexus-accent text-black font-bold py-3 rounded-lg disabled:opacity-50 hover:bg-[#00bf8c] transition"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-nexus-muted">
            Dont have an account? Create one when you start trading.{" "}
            <Link href="/trade" className="text-nexus-accent hover:underline font-medium">
              Start trading
            </Link>
          </p>
        </div>
        <p className="mt-6 text-center text-xs text-[#66666e]">
          Nexus Exchange — demo environment. Not financial advice.
        </p>
      </div>
    </div>
  );
}
