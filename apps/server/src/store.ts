import { v4 as uuidv4 } from "uuid";
import type {
  Balance,
  Candle,
  Market,
  Order,
  OrderBookEntry,
  Trade,
  User,
  ZERO
} from "@nexus/types";

export const SYMBOLS = ["BTCUSDT", "ETHUSDT", "SOLUSDT", "XRPUSDT", "ADAUSDT"];
export const INTERVALS = ["1m", "5m", "15m", "1h", "4h", "1d"];
export const BASE_ASSETS = ["BTC", "ETH", "SOL", "XRP", "ADA"];
export const QUOTE_ASSET = "USDT";
export const DEMO_USER_ID = "demo-user-0000";

const nowISO = () => new Date().toISOString();

export class Store {
  users = new Map<string, User>();
  balances = new Map<string, Map<string, Balance>>(); // userId -> asset -> balance
  orders = new Map<string, Order>();
  userOrders = new Map<string, Set<string>>(); // userId -> orderIds
  symbolOrders = new Map<string, Set<string>>(); // symbol -> orderIds
  trades = new Map<string, Trade[]>();
  symbolTrades = new Map<string, Trade[]>(); // symbol -> trades
  markets = new Map<string, Market>();
  candles = new Map<string, Map<string, Candle[]>>(); // symbol -> interval -> candles
  nextSequence = new Map<string, number>(); // symbol -> sequence
  apiKeys = new Map<string, { userId: string; key: string; secret: string }>();

  constructor() {
    this.seed();
  }

  private seed() {
    const demo: User = {
      id: DEMO_USER_ID,
      email: "demo@nexus.exchange",
      username: "demo",
      passwordHash: "$2b$10$demo",
      createdAt: nowISO()
    };
    this.users.set(demo.id, demo);

    const assets = ["USDT", "BTC", "ETH", "SOL", "XRP", "ADA"];
    const demoBalances: Record<string, string> = {
      USDT: "100000.00",
      BTC: "5.0",
      ETH: "20.0",
      SOL: "500.0",
      XRP: "20000.0",
      ADA: "50000.0"
    };
    const balMap = new Map<string, Balance>();
    for (const asset of assets) {
      balMap.set(asset, {
        userId: DEMO_USER_ID,
        asset,
        available: demoBalances[asset] ?? "0",
        locked: "0"
      });
    }
    this.balances.set(DEMO_USER_ID, balMap);

    const marketPrices: Record<string, { price: string; vol: string; change: string }> = {
      BTCUSDT: { price: "67240.50", vol: "12450.32", change: "+2.45" },
      ETHUSDT: { price: "3450.20", vol: "89000.00", change: "-1.12" },
      SOLUSDT: { price: "142.80", vol: "450000.00", change: "+5.33" },
      XRPUSDT: { price: "0.62", vol: "250000000.00", change: "-0.45" },
      ADAUSDT: { price: "0.89", vol: "150000000.00", change: "+0.78" }
    };

    for (const symbol of SYMBOLS) {
      const [base, quote] = [symbol.slice(0, -4), symbol.slice(-4)];
      const m = marketPrices[symbol];
      const price = m.price;
      const market: Market = {
        symbol,
        baseAsset: base,
        quoteAsset: quote,
        price,
        lastPrice: price,
        bid: (Number(price) * 0.999).toFixed(2),
        ask: (Number(price) * 1.001).toFixed(2),
        volume24h: m.vol,
        change24h: m.change,
        changePercent24h: m.change,
        high24h: (Number(price) * 1.05).toFixed(2),
        low24h: (Number(price) * 0.95).toFixed(2),
        open24h: price,
        count: 0,
        active: true
      };
      this.markets.set(symbol, market);
      this.symbolTrades.set(symbol, []);
      this.trades.set(symbol, []);
      this.nextSequence.set(symbol, 1);
      this.candles.set(symbol, new Map());
      this.seedCandles(symbol, price);
    }

    const key = "nexus_live_" + uuidv4().replace(/-/g, "").slice(0, 24);
    const secret = uuidv4().replace(/-/g, "");
    this.apiKeys.set(key, { userId: DEMO_USER_ID, key, secret });
  }

  private seedCandles(symbol: string, basePrice: string) {
    const price = Number(basePrice);
    for (const interval of INTERVALS) {
      const arr: Candle[] = [];
      const count = interval === "1m" ? 120 : 200;
      let close = price;
      for (let i = count - 1; i >= 0; i--) {
        const change = (Math.random() - 0.5) * 0.02;
        const open = close;
        close = Number((open * (1 + change)).toFixed(2));
        const high = Number((Math.max(open, close) * (1 + Math.random() * 0.005)).toFixed(2));
        const low = Number((Math.min(open, close) * (1 - Math.random() * 0.005)).toFixed(2));
        const vol = Number((Math.random() * 50 + 5).toFixed(4));
        const openTime = new Date(Date.now() - (count - i) * 60000).toISOString();
        const closeTime = new Date(Date.now() - (count - i - 1) * 60000).toISOString();
        arr.push({
          symbol,
          interval,
          openTime,
          open: open.toFixed(2),
          high: high.toFixed(2),
          low: low.toFixed(2),
          close: close.toFixed(2),
          volume: vol.toFixed(4),
          closeTime
        });
      }
      this.candles.get(symbol)?.set(interval, arr);
    }
  }

  getUser(userId: string): User | undefined {
    return this.users.get(userId);
  }

  getUserByEmail(email: string): User | undefined {
    for (const u of this.users.values()) {
      if (u.email === email) return u;
    }
    return undefined;
  }

  createUser(user: User) {
    this.users.set(user.id, user);
    const balMap = new Map<string, Balance>();
    for (const asset of ["USDT", "BTC", "ETH", "SOL", "XRP", "ADA"]) {
      balMap.set(asset, { userId: user.id, asset, available: "0", locked: "0" });
    }
    this.balances.set(user.id, balMap);
    this.userOrders.set(user.id, new Set());
  }

  getBalance(userId: string, asset: string): Balance | undefined {
    return this.balances.get(userId)?.get(asset);
  }

  getBalances(userId: string): Balance[] {
    return Array.from(this.balances.get(userId)?.values() ?? []);
  }

  credit(userId: string, asset: string, amount: string) {
    const b = this.getBalance(userId, asset);
    if (!b) return;
    b.available = (Number(b.available) + Number(amount)).toFixed(8);
  }

  debit(userId: string, asset: string, amount: string): boolean {
    const b = this.getBalance(userId, asset);
    if (!b) return false;
    if (Number(b.available) < Number(amount)) return false;
    b.available = (Number(b.available) - Number(amount)).toFixed(8);
    return true;
  }

  lock(userId: string, asset: string, amount: string): boolean {
    const b = this.getBalance(userId, asset);
    if (!b) return false;
    if (Number(b.available) < Number(amount)) return false;
    b.available = (Number(b.available) - Number(amount)).toFixed(8);
    b.locked = (Number(b.locked) + Number(amount)).toFixed(8);
    return true;
  }

  unlock(userId: string, asset: string, amount: string): boolean {
    const b = this.getBalance(userId, asset);
    if (!b) return false;
    if (Number(b.locked) < Number(amount)) return false;
    b.locked = (Number(b.locked) - Number(amount)).toFixed(8);
    b.available = (Number(b.available) + Number(amount)).toFixed(8);
    return true;
  }

  createOrder(order: Order) {
    this.orders.set(order.id, order);
    this.userOrders.get(order.userId)?.add(order.id);
    this.symbolOrders.get(order.symbol)?.add(order.id);
  }

  updateOrder(order: Order) {
    this.orders.set(order.id, order);
  }

  getOrder(orderId: string): Order | undefined {
    return this.orders.get(orderId);
  }

  getOpenOrders(userId: string): Order[] {
    return Array.from(this.userOrders.get(userId) ?? [])
      .map((id) => this.orders.get(id))
      .filter((o): o is Order => !!o && o.status === "OPEN")
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  getOrderHistory(userId: string): Order[] {
    return Array.from(this.userOrders.get(userId) ?? [])
      .map((id) => this.orders.get(id))
      .filter((o): o is Order => !!o)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  addTrade(trade: Trade) {
    const list = this.symbolTrades.get(trade.symbol);
    if (list) {
      list.unshift(trade);
      if (list.length > 500) list.length = 500;
    }
    const all = this.trades.get(trade.symbol);
    if (all) {
      all.unshift(trade);
      if (all.length > 500) all.length = 500;
    }
    const m = this.markets.get(trade.symbol);
    if (m) {
      m.price = trade.price;
      m.lastPrice = trade.price;
      m.count = (m.count ?? 0) + 1;
      m.volume24h = (Number(m.volume24h) + Number(trade.qty)).toFixed(4);
      const ch = ((Number(trade.price) - Number(m.open24h)) / Number(m.open24h)) * 100;
      m.change24h = ch >= 0 ? `+${ch.toFixed(2)}` : ch.toFixed(2);
      m.changePercent24h = m.change24h;
      m.bid = (Number(trade.price) * 0.999).toFixed(2);
      m.ask = (Number(trade.price) * 1.001).toFixed(2);
      this.markets.set(trade.symbol, m);
    }
  }

  getRecentTrades(symbol: string, limit = 50): Trade[] {
    return (this.symbolTrades.get(symbol) ?? []).slice(0, limit);
  }

  getMarket(symbol: string): Market | undefined {
    return this.markets.get(symbol);
  }

  getMarkets(): Market[] {
    return Array.from(this.markets.values()).filter((m) => m.active);
  }

  getCandles(symbol: string, interval: string, limit = 200): Candle[] {
    return (this.candles.get(symbol)?.get(interval) ?? []).slice(-limit);
  }

  nextSeq(symbol: string): number {
    const cur = this.nextSequence.get(symbol) ?? 1;
    this.nextSequence.set(symbol, cur + 1);
    return cur;
  }

  getApiKeyUser(key: string): { userId: string; key: string; secret: string } | undefined {
    return this.apiKeys.get(key);
  }

  createApiKey(userId: string) {
    const key = "nexus_live_" + uuidv4().replace(/-/g, "").slice(0, 24);
    const secret = uuidv4().replace(/-/g, "");
    this.apiKeys.set(key, { userId, key, secret });
    return { key, secret };
  }
}

export const store = new Store();
