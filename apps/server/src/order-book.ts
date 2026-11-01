import type { Order, OrderSide } from "@nexus/types";
import { store } from "./store";
import { cmpPrice } from "@nexus/types";

type LevelOrders = { orders: Order[]; totalQty: string };

class LevelMap {
  private map = new Map<string, LevelOrders>();
  get(price: string): LevelOrders | undefined {
    return this.map.get(price);
  }
  set(price: string, value: LevelOrders) {
    this.map.set(price, value);
  }
  delete(price: string) {
    this.map.delete(price);
  }
  has(price: string) {
    return this.map.has(price);
  }
  forEach(fn: (value: LevelOrders, price: string) => void) {
    this.map.forEach(fn);
  }
  size() {
    return this.map.size;
  }
  clear() {
    this.map.clear();
  }
  toArray(sorted: string[]): LevelOrders[] {
    return sorted.map((p) => this.map.get(p)!).filter(Boolean);
  }
}

interface BookState {
  bids: LevelMap; // price desc
  asks: LevelMap; // price asc
  bidPrices: string[];
  askPrices: string[];
  byId: Map<string, { side: OrderSide; price: string }>;
}

function addLevel(book: BookState, side: OrderSide, order: Order) {
  const map = side === "BUY" ? book.bids : book.asks;
  const prices = side === "BUY" ? book.bidPrices : book.askPrices;
  const price = order.price!;
  const existing = map.get(price);
  if (existing) {
    existing.orders.push(order);
    existing.totalQty = (Number(existing.totalQty) + Number(order.qty)).toFixed(8);
  } else {
    map.set(price, { orders: [order], totalQty: order.qty });
    prices.push(price);
    if (side === "BUY") {
      prices.sort((a, b) => cmpPrice(b, a));
    } else {
      prices.sort((a, b) => cmpPrice(a, b));
    }
  }
  book.byId.set(order.id, { side, price });
}

function removeOrderFromLevel(book: BookState, orderId: string) {
  const ref = book.byId.get(orderId);
  if (!ref) return false;
  const map = ref.side === "BUY" ? book.bids : book.asks;
  const prices = ref.side === "BUY" ? book.bidPrices : book.askPrices;
  const level = map.get(ref.price);
  if (!level) {
    book.byId.delete(orderId);
    return false;
  }
  const idx = level.orders.findIndex((o) => o.id === orderId);
  if (idx < 0) {
    book.byId.delete(orderId);
    return false;
  }
  const removed = level.orders.splice(idx, 1)[0];
  level.totalQty = (Number(level.totalQty) - Number(removed.qty)).toFixed(8);
  if (level.orders.length === 0) {
    map.delete(ref.price);
    const pIdx = prices.indexOf(ref.price);
    if (pIdx >= 0) prices.splice(pIdx, 1);
  }
  book.byId.delete(orderId);
  return true;
}

function reduceLevelQty(book: BookState, orderId: string, filled: string) {
  const ref = book.byId.get(orderId);
  if (!ref) return;
  const map = ref.side === "BUY" ? book.bids : book.asks;
  const level = map.get(ref.price);
  if (!level) return;
  const order = level.orders.find((o) => o.id === orderId);
  if (!order) return;
  level.totalQty = (Number(level.totalQty) - Number(filled)).toFixed(8);
  if (Number(level.totalQty) <= 0) {
    map.delete(ref.price);
    const pIdx = (ref.side === "BUY" ? book.bidPrices : book.askPrices).indexOf(ref.price);
    if (pIdx >= 0) (ref.side === "BUY" ? book.bidPrices : book.askPrices).splice(pIdx, 1);
  }
}

function bestBid(book: BookState): { price: string; qty: string; count: number } | undefined {
  const p = book.bidPrices[0];
  if (!p) return undefined;
  const l = book.bids.get(p);
  return l ? { price: p, qty: l.totalQty, count: l.orders.length } : undefined;
}

function bestAsk(book: BookState): { price: string; qty: string; count: number } | undefined {
  const p = book.askPrices[0];
  if (!p) return undefined;
  const l = book.asks.get(p);
  return l ? { price: p, qty: l.totalQty, count: l.orders.length } : undefined;
}

function snapshot(book: BookState, symbol: string, depth = 50) {
  const bids = book.bids
    .toArray(book.bidPrices)
    .slice(0, depth)
    .map((l) => ({ price: l.orders[0].price, qty: l.totalQty, count: l.orders.length }));
  const asks = book.asks
    .toArray(book.askPrices)
    .slice(0, depth)
    .map((l) => ({ price: l.orders[0].price, qty: l.totalQty, count: l.orders.length }));
  return { symbol, bids, asks, sequence: store.nextSeq(symbol) };
}

const books = new Map<string, BookState>();

function getBook(symbol: string): BookState {
  let book = books.get(symbol);
  if (!book) {
    book = {
      bids: new LevelMap(),
      asks: new LevelMap(),
      bidPrices: [],
      askPrices: [],
      byId: new Map()
    };
    books.set(symbol, book);
  }
  return book;
}

export type { BookState, LevelMap };
export {
  addLevel,
  removeOrderFromLevel,
  reduceLevelQty,
  bestBid,
  bestAsk,
  snapshot,
  getBook,
  books
};
