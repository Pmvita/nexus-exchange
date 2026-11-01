import { z } from "zod";

export const OrderSideSchema = z.enum(["BUY", "SELL"]);
export type OrderSide = z.infer<typeof OrderSideSchema>;

export const OrderTypeSchema = z.enum(["LIMIT", "MARKET"]);
export type OrderType = z.infer<typeof OrderTypeSchema>;

export const OrderStatusSchema = z.enum([
  "OPEN",
  "PARTIALLY_FILLED",
  "FILLED",
  "CANCELLED",
  "REJECTED"
]);
export type OrderStatus = z.infer<typeof OrderStatusSchema>;

export const TradeSchema = z.object({
  id: z.string(),
  symbol: z.string(),
  price: z.string(),
  qty: z.string(),
  buyerId: z.string(),
  sellerId: z.string(),
  buyerOrderId: z.string(),
  sellerOrderId: z.string(),
  side: OrderSideSchema,
  createdAt: z.string()
});
export type Trade = z.infer<typeof TradeSchema>;

export const OrderSchema = z.object({
  id: z.string(),
  userId: z.string(),
  symbol: z.string(),
  side: OrderSideSchema,
  type: OrderTypeSchema,
  price: z.string().optional(),
  qty: z.string(),
  filled: z.string().default("0"),
  status: OrderStatusSchema,
  createdAt: z.string()
});
export type Order = z.infer<typeof OrderSchema>;

export const OrderBookEntrySchema = z.object({
  price: z.string(),
  qty: z.string(),
  count: z.number()
});
export type OrderBookEntry = z.infer<typeof OrderBookEntrySchema>;

export const OrderBookSchema = z.object({
  symbol: z.string(),
  bids: z.array(OrderBookEntrySchema),
  asks: z.array(OrderBookEntrySchema),
  sequence: z.number()
});
export type OrderBook = z.infer<typeof OrderBookSchema>;

export const BalanceSchema = z.object({
  userId: z.string(),
  asset: z.string(),
  available: z.string(),
  locked: z.string()
});
export type Balance = z.infer<typeof BalanceSchema>;

export const MarketSchema = z.object({
  symbol: z.string(),
  baseAsset: z.string(),
  quoteAsset: z.string(),
  price: z.string(),
  lastPrice: z.string(),
  bid: z.string().optional(),
  ask: z.string().optional(),
  volume24h: z.string(),
  change24h: z.string(),
  changePercent24h: z.string(),
  high24h: z.string(),
  low24h: z.string(),
  open24h: z.string(),
  count: z.number(),
  active: z.boolean()
});
export type Market = z.infer<typeof MarketSchema>;

export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  username: z.string(),
  passwordHash: z.string(),
  apiKey: z.string().optional(),
  apiSecret: z.string().optional(),
  createdAt: z.string()
});
export type User = z.infer<typeof UserSchema>;

export const TickerSchema = z.object({
  symbol: z.string(),
  price: z.string(),
  bid: z.string(),
  ask: z.string(),
  volume24h: z.string(),
  change24h: z.string(),
  changePercent24h: z.string(),
  high24h: z.string(),
  low24h: z.string(),
  count: z.number(),
  createdAt: z.string()
});
export type Ticker = z.infer<typeof TickerSchema>;

export const CandleSchema = z.object({
  symbol: z.string(),
  interval: z.string(),
  openTime: z.string(),
  open: z.string(),
  high: z.string(),
  low: z.string(),
  close: z.string(),
  volume: z.string(),
  closeTime: z.string()
});
export type Candle = z.infer<typeof CandleSchema>;

export const PlaceOrderRequestSchema = z.object({
  symbol: z.string(),
  side: OrderSideSchema,
  type: OrderTypeSchema,
  price: z.string().optional(),
  qty: z.string()
});
export type PlaceOrderRequest = z.infer<typeof PlaceOrderRequestSchema>;

export const CancelOrderRequestSchema = z.object({
  orderId: z.string()
});
export type CancelOrderRequest = z.infer<typeof CancelOrderRequestSchema>;

export const WSMessageSchema = z.object({
  type: z.string(),
  channel: z.string().optional(),
  data: z.unknown(),
  ts: z.string()
});
export type WSMessage = z.infer<typeof WSMessageSchema>;

export const DepthEventSchema = z.object({
  symbol: z.string(),
  bids: z.array(OrderBookEntrySchema),
  asks: z.array(OrderBookEntrySchema),
  sequence: z.number()
});
export type DepthEvent = z.infer<typeof DepthEventSchema>;

export const TradeEventSchema = z.object({
  symbol: z.string(),
  trades: z.array(TradeSchema)
});
export type TradeEvent = z.infer<typeof TradeEventSchema>;

export const TickerEventSchema = z.object({
  symbol: z.string(),
  tickers: z.array(TickerSchema)
});
export type TickerEvent = z.infer<typeof TickerEventSchema>;

export const BalanceEventSchema = z.object({
  userId: z.string(),
  balances: z.array(BalanceSchema)
});
export type BalanceEvent = z.infer<typeof BalanceEventSchema>;

export const OrderEventSchema = z.object({
  userId: z.string(),
  order: OrderSchema
});
export type OrderEvent = z.infer<typeof OrderEventSchema>;

export const emptyOrderBook: OrderBookEntry[] = [];

export const ZERO = "0";

export function toFixed8(value: string): string {
  const num = Number(value);
  if (!Number.isFinite(num)) return "0";
  return num.toFixed(8);
}

export function toFixed2(value: string): string {
  const num = Number(value);
  if (!Number.isFinite(num)) return "0.00";
  return num.toFixed(2);
}

export function cmpPrice(a: string, b: string): number {
  return Number(a) - Number(b);
}
