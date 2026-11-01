import { API_BASE_URL, WS_URL } from "@nexus/config";

export async function api<T = unknown>(path: string, opts: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json", ...(opts.headers as Record<string, string> | undefined) ?? {} };
  const token = typeof document !== "undefined" ? localStorage.getItem("nexus_token") : null;
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${API_BASE_URL}${path}`, { ...opts, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error ?? `Request failed ${res.status}`);
  }
  return res.json();
}

export function wsConnect(onMessage: (data: any) => void, onError?: (err: any) => void) {
  const wsURL = WS_URL.replace(/^http/, "ws");
  const socket = new (require("socket.io-client").io)(wsURL, {
    transports: ["websocket", "polling"],
    auth: { token: typeof document !== "undefined" ? localStorage.getItem("nexus_token") : undefined }
  });
  socket.on("connect", () => onMessage({ type: "connected" }));
  socket.on("disconnect", () => onMessage({ type: "disconnected" }));
  socket.on("trade", (data: any) => onMessage({ type: "trade", data }));
  socket.on("order", (data: any) => onMessage({ type: "order", data }));
  socket.on("depth", (data: any) => onMessage({ type: "depth", data }));
  socket.on("ticker", (data: any) => onMessage({ type: "ticker", data }));
  socket.on("ticker-snapshot", (data: any) => onMessage({ type: "ticker-snapshot", data }));
  socket.on("balance", (data: any) => onMessage({ type: "balance", data }));
  socket.on("connect_error", (err: any) => onError?.(err));
  return socket;
}
