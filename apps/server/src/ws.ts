import { Server as IOServer, type Socket } from "socket.io";
import { MatchingEngine } from "./matching-engine";
import { store } from "./store";

export function setupWS(io: IOServer, engine: MatchingEngine) {
  const authNamespace = io.of("/api/ws");
  authNamespace.use((socket, next) => {
    const token = (socket.handshake.auth?.token as string) || (socket.handshake.query?.token as string);
    if (!token) return next(new Error("Authentication required"));
    try {
      const jwt = require("jsonwebtoken");
      const secret = process.env.NEXUS_JWT_SECRET ?? "nexus-dev-secret-change-me";
      const payload = jwt.verify(token, secret) as { userId: string };
      const user = store.getUser(payload.userId);
      if (!user) return next(new Error("User not found"));
      (socket as any).user = user;
      next();
    } catch {
      next(new Error("Invalid token"));
    }
  });

  authNamespace.on("connection", (socket: Socket) => {
    const userId = (socket as any).user.id;
    socket.join(`user:${userId}`);

    socket.on("subscribe:ticker", (symbol: string) => {
      socket.join(`ticker:${symbol}`);
    });
    socket.on("unsubscribe:ticker", (symbol: string) => {
      socket.leave(`ticker:${symbol}`);
    });
    socket.on("subscribe:depth", (symbol: string) => {
      socket.join(`depth:${symbol}`);
      socket.emit("depth", engine.getBookSnapshot(symbol));
    });
    socket.on("unsubscribe:depth", (symbol: string) => {
      socket.leave(`depth:${symbol}`);
    });
    socket.on("subscribe:trades", (symbol: string) => {
      socket.join(`trades:${symbol}`);
      socket.emit("trades", store.getRecentTrades(symbol, 50));
    });
    socket.on("unsubscribe:trades", (symbol: string) => {
      socket.leave(`trades:${symbol}`);
    });

    socket.emit("connected", { userId });
  });

  return authNamespace;
}

export function bindEngineEvents(io: IOServer, engine: MatchingEngine) {
  const nsp = io.of("/api/ws");

  engine = engine;
  const origPlaceOrder = engine.placeOrder.bind(engine);

  return nsp;
}
