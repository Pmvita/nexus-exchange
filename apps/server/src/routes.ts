import express, { type Request, type Response } from "express";
import { z } from "zod";
import { store } from "./store";
import { authMiddleware, apiKeyMiddleware, signToken } from "./auth";
import { MatchingEngine } from "./matching-engine";
import type { OrderSide, OrderType, PlaceOrderRequest, CancelOrderRequest } from "@nexus/types";
import { PlaceOrderRequestSchema, CancelOrderRequestSchema } from "@nexus/types";

export function createRouter(engine: MatchingEngine) {
  const router = express.Router();
  router.use(express.json());

  router.get("/health", (_req: Request, res: Response) => {
    res.json({ status: "ok", time: new Date().toISOString() });
  });

  router.get("/api/markets", (_req: Request, res: Response) => {
    res.json(store.getMarkets());
  });

  router.get("/api/markets/:symbol", (req: Request, res: Response) => {
    const market = store.getMarket(req.params.symbol);
    if (!market) return res.status(404).json({ error: "Market not found" });
    res.json(market);
  });

  router.get("/api/ticker/:symbol", (req: Request, res: Response) => {
    const market = store.getMarket(req.params.symbol);
    if (!market) return res.status(404).json({ error: "Market not found" });
    res.json({
      symbol: market.symbol,
      price: market.price,
      bid: market.bid ?? market.price,
      ask: market.ask ?? market.price,
      volume24h: market.volume24h,
      change24h: market.change24h,
      changePercent24h: market.changePercent24h,
      high24h: market.high24h,
      low24h: market.low24h,
      count: market.count,
      createdAt: new Date().toISOString()
    });
  });

  router.get("/api/tickers", (_req: Request, res: Response) => {
    res.json(
      store.getMarkets().map((m) => ({
        symbol: m.symbol,
        price: m.price,
        bid: m.bid ?? m.price,
        ask: m.ask ?? m.price,
        volume24h: m.volume24h,
        change24h: m.change24h,
        changePercent24h: m.changePercent24h,
        high24h: m.high24h,
        low24h: m.low24h,
        count: m.count,
        createdAt: new Date().toISOString()
      }))
    );
  });

  router.get("/api/orderbook/:symbol", (req: Request, res: Response) => {
    const depth = Number(req.query.depth ?? 50);
    res.json(engine.getBookSnapshot(req.params.symbol));
  });

  router.get("/api/trades/:symbol", (req: Request, res: Response) => {
    const limit = Number(req.query.limit ?? 50);
    res.json(store.getRecentTrades(req.params.symbol, limit));
  });

  router.get("/api/candles/:symbol/:interval", (req: Request, res: Response) => {
    const limit = Number(req.query.limit ?? 200);
    res.json(store.getCandles(req.params.symbol, req.params.interval, limit));
  });

  router.post("/api/auth/register", (req: Request, res: Response) => {
    const schema = z.object({ email: z.string().email(), username: z.string().min(3), password: z.string().min(6) });
    const parse = schema.safeParse(req.body);
    if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });
    if (store.getUserByEmail(parse.data.email)) return res.status(409).json({ error: "Email already registered" });
    const userId = "u_" + require("crypto").randomUUID().replace(/-/g, "");
    const user = {
      id: userId,
      email: parse.data.email,
      username: parse.data.username,
      passwordHash: "hashed_" + parse.data.password,
      createdAt: new Date().toISOString()
    };
    store.createUser(user);
    const token = signToken(user);
    res.json({ user: { id: user.id, email: user.email, username: user.username }, token });
  });

  router.post("/api/auth/login", (req: Request, res: Response) => {
    const schema = z.object({ email: z.string().email(), password: z.string() });
    const parse = schema.safeParse(req.body);
    if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });
    const user = store.getUserByEmail(parse.data.email);
    if (!user || user.passwordHash !== "hashed_" + parse.data.password) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = signToken(user);
    res.json({ user: { id: user.id, email: user.email, username: user.username }, token });
  });

  router.get("/api/auth/me", authMiddleware, (req: Request, res: Response) => {
    const user = (req as any).user;
    res.json({ id: user.id, email: user.email, username: user.username });
  });

  router.post("/api/orders", authMiddleware, (req: Request, res: Response) => {
    const parse = PlaceOrderRequestSchema.safeParse(req.body);
    if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });
    try {
      const result = engine.placeOrder({ userId: (req as any).user.id, ...parse.data });
      res.status(201).json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  router.get("/api/orders", authMiddleware, (_req: Request, res: Response) => {
    const open = store.getOpenOrders((_req as any).user.id);
    res.json(open);
  });

  router.get("/api/orders/history", authMiddleware, (_req: Request, res: Response) => {
    res.json(store.getOrderHistory((_req as any).user.id));
  });

  router.get("/api/orders/:orderId", authMiddleware, (req: Request, res: Response) => {
    const order = store.getOrder(req.params.orderId);
    if (!order) return res.status(404).json({ error: "Order not found" });
    if (order.userId !== (req as any).user.id) return res.status(403).json({ error: "Forbidden" });
    res.json(order);
  });

  router.delete("/api/orders/:orderId", authMiddleware, (req: Request, res: Response) => {
    try {
      const order = engine.cancelOrder(req.params.orderId, (req as any).user.id);
      res.json(order);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  router.get("/api/balances", authMiddleware, (_req: Request, res: Response) => {
    res.json(store.getBalances((_req as any).user.id));
  });

  router.post("/api/deposit", authMiddleware, (req: Request, res: Response) => {
    const schema = z.object({ asset: z.string().min(1), amount: z.string().min(1) });
    const parse = schema.safeParse(req.body);
    if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });
    store.credit((req as any).user.id, parse.data.asset, parse.data.amount);
    res.json({ asset: parse.data.asset, amount: parse.data.amount, balances: store.getBalances((req as any).user.id) });
  });

  router.post("/api/deposit-address", authMiddleware, (_req: Request, res: Response) => {
    const asset = (_req as any).body?.asset ?? "USDT";
    const address = "0x" + require("crypto").randomBytes(20).toString("hex");
    res.json({ asset, address });
  });

  router.post("/api/withdraw", authMiddleware, (req: Request, res: Response) => {
    const schema = z.object({ asset: z.string().min(1), amount: z.string().min(1), address: z.string().min(1) });
    const parse = schema.safeParse(req.body);
    if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });
    try {
      store.debit((req as any).user.id, parse.data.asset, parse.data.amount);
      res.json({ asset: parse.data.asset, amount: parse.data.amount, address: parse.data.address, status: "pending" });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  router.post("/api/api-key", authMiddleware, (_req: Request, res: Response) => {
    const key = store.createApiKey((_req as any).user.id);
    res.json(key);
  });

  router.get("/api/api-key/validate", apiKeyMiddleware, (_req: Request, res: Response) => {
    res.json({ valid: true, userId: (_req as any).user.id });
  });

  return router;
}
