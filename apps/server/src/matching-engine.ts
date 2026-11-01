import { randomUUID } from "crypto";
import type { Order, OrderSide, OrderStatus, Trade } from "@nexus/types";
import { store } from "./store";
import { addLevel, bestAsk, bestBid, getBook, removeOrderFromLevel, reduceLevelQty, snapshot } from "./order-book";
import { toFixed8 } from "@nexus/types";

const nowISO = () => new Date().toISOString();

function createTrade(symbol: string, buyerId: string, sellerId: string, buyerOrderId: string, sellerOrderId: string, price: string, qty: string, side: OrderSide): Trade {
  return {
    id: "t_" + randomUUID().replace(/-/g, ""),
    symbol,
    price: toFixed8(price),
    qty: toFixed8(qty),
    buyerId,
    sellerId,
    buyerOrderId,
    sellerOrderId,
    side,
    createdAt: nowISO()
  };
}

function notional(price: string, qty: string): string {
  return (Number(price) * Number(qty)).toFixed(8);
}

function matchAgainst(book: ReturnType<typeof getBook>, symbol: string, side: OrderSide, taker: Order, maxPrice: string | null, onTrade: (trade: Trade) => void) {
  const remaining = { qty: taker.qty };
  const trades: Trade[] = [];
  const makerIds: string[] = [];

  const opposite = side === "BUY" ? "SELL" : "BUY";
  const levels = opposite === "SELL" ? book.asks : book.bids;
  const prices = opposite === "SELL" ? book.askPrices : book.bidPrices;

  let i = 0;
  while (Number(remaining.qty) > 0 && i < prices.length) {
    const price = prices[i];
    if (maxPrice !== null) {
      const takerNum = Number(taker.price ?? "0");
      const levelNum = Number(price);
      const crosses = side === "BUY" ? levelNum <= takerNum : levelNum >= takerNum;
      if (!crosses) break;
    }

    const level = levels.get(price);
    if (!level) { i++; continue; }

    const makerOrders = [...level.orders];
    let j = 0;
    while (Number(remaining.qty) > 0 && j < makerOrders.length) {
      const maker = makerOrders[j];
      const makerRemaining = (Number(maker.qty) - Number(maker.filled)).toFixed(8);
      if (Number(makerRemaining) <= 0) { j++; continue; }
      const tradeQty = Math.min(Number(remaining.qty), Number(makerRemaining)).toFixed(8);
      const tradePrice = maker.price!;

      const trade = createTrade(
        symbol,
        side === "BUY" ? taker.userId : maker.userId,
        side === "BUY" ? maker.userId : taker.userId,
        side === "BUY" ? taker.id : maker.id,
        side === "BUY" ? maker.id : taker.id,
        tradePrice,
        tradeQty,
        side
      );
      trades.push(trade);
      onTrade(trade);

      const buyer = side === "BUY" ? taker : maker;
      const seller = side === "BUY" ? maker : taker;
      const buyerOrderId = side === "BUY" ? taker.id : maker.id;
      const sellerOrderId = side === "BUY" ? maker.id : taker.id;

      const baseAsset = symbol.slice(0, -4);
      const quoteAsset = symbol.slice(-4);
      const notionalVal = notional(tradePrice, tradeQty);

      store.credit(buyer.userId, baseAsset, tradeQty);
      store.debit(buyer.userId, "LOCKED_" + quoteAsset, notionalVal);
      store.credit(seller.userId, quoteAsset, notionalVal);
      store.debit(seller.userId, "LOCKED_" + baseAsset, tradeQty);

      updateFilled(maker, Number(tradeQty), bookState(book), opposite, price);
      updateFilled(taker, Number(tradeQty), bookState(book), side, taker.price ?? price);

      remaining.qty = (Number(remaining.qty) - Number(tradeQty)).toFixed(8);
      makerIds.push(maker.id);

      if (Number(makerRemaining) === Number(tradeQty)) j++;
    }
    i++;
  }

  return { remainingQty: remaining.qty, trades, makerIds };
}

function bookState(book: ReturnType<typeof getBook>) { return book; }

function updateFilled(order: Order, fillQty: number, book: ReturnType<typeof getBook>, orderSide: OrderSide, price: string) {
  const newFilled = (Number(order.filled) + fillQty).toFixed(8);
  order.filled = newFilled;
  if (Number(newFilled) >= Number(order.qty)) {
    order.status = "FILLED";
    removeOrderFromLevel(book, order.id);
  } else {
    order.status = "PARTIALLY_FILLED";
    reduceLevelQty(book, order.id, fillQty.toString());
  }
  store.updateOrder(order);
}

function lockForOrder(userId: string, symbol: string, side: OrderSide, type: string, price: string | undefined, qty: string): { asset: string; amount: string } | null {
  const baseAsset = symbol.slice(0, -4);
  const quoteAsset = symbol.slice(-4);
  if (side === "BUY") {
    let amount: string;
    if (type === "LIMIT" && price) {
      amount = notional(price, qty);
    } else {
      const book = getBook(symbol);
      const ask = bestAsk(book);
      const refPrice = ask ? ask.price : price ?? "0";
      amount = (Number(notional(refPrice, qty)) * 1.02).toFixed(8);
    }
    if (!store.lock(userId, quoteAsset, amount)) return null;
    store.credit(userId, "LOCKED_" + quoteAsset, amount);
    return { asset: quoteAsset, amount };
  } else {
    if (!store.lock(userId, baseAsset, qty)) return null;
    store.credit(userId, "LOCKED_" + baseAsset, qty);
    return { asset: baseAsset, amount: qty };
  }
}

function releaseLock(userId: string, symbol: string, side: OrderSide, remainingQty: string, price: string | undefined) {
  if (Number(remainingQty) <= 0) return;
  const baseAsset = symbol.slice(0, -4);
  const quoteAsset = symbol.slice(-4);
  if (side === "BUY") {
    const amount = notional(price ?? "0", remainingQty);
    store.debit(userId, "LOCKED_" + quoteAsset, amount);
    store.credit(userId, quoteAsset, amount);
  } else {
    store.debit(userId, "LOCKED_" + baseAsset, remainingQty);
    store.credit(userId, baseAsset, remainingQty);
  }
}

export class MatchingEngine {
  private onEvent: (type: string, data: unknown) => void;

  constructor(onEvent: (type: string, data: unknown) => void) {
    this.onEvent = onEvent;
  }

  placeOrder(input: { userId: string; symbol: string; side: OrderSide; type: "LIMIT" | "MARKET"; price?: string; qty: string }): { order: Order; trades: Trade[]; status: OrderStatus } {
    const { userId, symbol, side, type, price, qty } = input;
    const market = store.getMarket(symbol);
    if (!market || !market.active) throw new Error("Symbol not found or inactive");
    if (Number(qty) <= 0) throw new Error("Invalid quantity");
    if (type === "LIMIT" && (!price || Number(price) <= 0)) throw new Error("Invalid price");

    const user = store.getUser(userId);
    if (!user) throw new Error("User not found");

    const locked = lockForOrder(userId, symbol, side, type, price, qty);
    if (!locked) throw new Error("Insufficient balance");

    const order: Order = {
      id: "o_" + randomUUID().replace(/-/g, ""),
      userId,
      symbol,
      side,
      type,
      price: type === "LIMIT" ? price : undefined,
      qty,
      filled: "0",
      status: "OPEN",
      createdAt: nowISO()
    };

    const book = getBook(symbol);
    const maxPrice = type === "LIMIT" ? (price ?? null) : null;
    const { remainingQty, trades } = matchAgainst(book, symbol, side, order, maxPrice, (t) => {
      this.onEvent("trade", t);
      store.addTrade(t);
    });

    order.filled = (Number(order.qty) - Number(remainingQty)).toFixed(8);
    if (Number(remainingQty) >= Number(order.qty)) order.status = "FILLED";
    else if (Number(order.filled) > 0) order.status = "PARTIALLY_FILLED";

    store.createOrder(order);
    this.onEvent("order", order);

    const restingQty = (Number(order.qty) - Number(order.filled)).toFixed(8);
    if (order.status !== "FILLED" && type === "LIMIT" && Number(restingQty) > 0) {
      const restingOrder: Order = { ...order, qty: restingQty, filled: "0", status: "OPEN" };
      addLevel(book, side, restingOrder);
      this.onEvent("depth", snapshot(book, symbol));
    } else if (order.status !== "FILLED" && type === "MARKET") {
      releaseLock(userId, symbol, side, remainingQty, order.price);
      order.status = "FILLED";
      store.updateOrder(order);
      this.onEvent("order", order);
    } else if (order.status === "FILLED" || order.status === "PARTIALLY_FILLED") {
      releaseLock(userId, symbol, side, remainingQty, order.price);
    }

    if (trades.length > 0) {
      this.onEvent("ticker", { symbol, trades });
      const m = store.getMarket(symbol);
      if (m && trades[0]) {
        this.onEvent("ticker-snapshot", {
          symbol: m.symbol,
          price: m.price,
          bid: m.bid,
          ask: m.ask,
          volume24h: m.volume24h,
          change24h: m.change24h,
          changePercent24h: m.changePercent24h,
          count: m.count
        });
      }
    }
    this.onEvent("balance", { userId, balances: store.getBalances(userId) });

    return { order, trades, status: order.status };
  }

  cancelOrder(orderId: string, userId: string): Order {
    const order = store.getOrder(orderId);
    if (!order) throw new Error("Order not found");
    if (order.userId !== userId) throw new Error("Not authorized");
    if (order.status !== "OPEN" && order.status !== "PARTIALLY_FILLED") throw new Error("Order cannot be cancelled");

    const book = getBook(order.symbol);
    removeOrderFromLevel(book, order.id);

    const remainingQty = (Number(order.qty) - Number(order.filled)).toFixed(8);
    releaseLock(userId, order.symbol, order.side, remainingQty, order.price);

    order.status = "CANCELLED";
    store.updateOrder(order);
    this.onEvent("order", order);
    this.onEvent("depth", snapshot(book, order.symbol));
    this.onEvent("balance", { userId, balances: store.getBalances(userId) });
    return order;
  }

  getBookSnapshot(symbol: string) {
    return snapshot(getBook(symbol), symbol);
  }

  getBestBidAsk(symbol: string) {
    const book = getBook(symbol);
    return { bid: bestBid(book), ask: bestAsk(book) };
  }
}
