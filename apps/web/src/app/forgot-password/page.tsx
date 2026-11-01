"use client";

import Link from "next/link";
import { useState } from "react";
import { api } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [msg, setMsg] = useState({ text: "", kind: "info" as "info" | "success" | "error" });
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg({ text: "", kind: "info" });
    try {
      await api("/api/auth/password-reset", { method: "POST", body: JSON.stringify({ email }) });
      setSent(true);
      setMsg({ text: "If an account exists, a reset link has been sent.", kind: "success" });
    } catch (err: any) {
      setMsg({ text: err.message ?? "Request failed", kind: "error" });
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
          <h1 className="text-2xl font-bold text-white mb-2">{sent ? "Reset email sent" : "Forgot password"}</h1>
          <p className="text-nexus-muted text-sm mb-8">
            {sent
              ? "Check your inbox for a password reset link."
              : "Enter your email and we'll send instructions to reset your password."}
          </p>

          {msg.text && (
            <div className={`mb-4 p-3 rounded text-xs ${
              msg.kind === "error" ? "bg-[#3a1a1a] border border-[#5a2a2a] text-red-400" :
              "bg-[#1a3a1a] border border-[#2a5a2a] text-nexus-up"
            }`}>{msg.text}</div>
          )}

          {!sent && (
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
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-nexus-accent text-black font-bold py-3 rounded-lg disabled:opacity-50 hover:bg-[#00bf8c] transition"
              >
                {loading ? "Sending..." : "Send reset link"}
              </button>
            </form>
          )}
          {sent && (
            <div className="text-center">
              <Link href="/login" className="text-xs text-nexus-accent hover:underline">
                Back to sign in
              </Link>
            </div>
          )}
        </div>
        <p className="mt-6 text-center text-xs text-[#66666e]">
          Nexus Exchange — demo environment. Not financial advice.
        </p>
      </div>
    </div>
  );
}
