import { sign, verify, type JwtPayload } from "jsonwebtoken";
import type { User } from "@nexus/types";
import { store } from "./store";

const JWT_SECRET = process.env.NEXUS_JWT_SECRET ?? "nexus-dev-secret-change-me";
const JWT_EXPIRES_IN = "7d";

export interface TokenPayload extends JwtPayload {
  userId: string;
  email: string;
}

export function signToken(user: User): string {
  return sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

export function authMiddleware(req: any, res: any, next: any) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or invalid Authorization header" });
  }
  const token = header.slice(7);
  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
  const user = store.getUser(payload.userId);
  if (!user) {
    return res.status(401).json({ error: "User not found" });
  }
  (req as any).user = user;
  next();
}

export function apiKeyMiddleware(req: any, res: any, next: any) {
  const key = req.headers["x-api-key"] as string | undefined;
  const secret = req.headers["x-api-secret"] as string | undefined;
  if (!key || !secret) {
    return res.status(401).json({ error: "Missing API key credentials" });
  }
  const entry = store.getApiKeyUser(key);
  if (!entry || entry.secret !== secret) {
    return res.status(401).json({ error: "Invalid API key credentials" });
  }
  const user = store.getUser(entry.userId);
  if (!user) return res.status(401).json({ error: "User not found" });
  (req as any).user = user;
  next();
}
