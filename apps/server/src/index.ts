import express from "express";
import { createServer } from "http";
import { Server as IOServer } from "socket.io";
import cors from "cors";
import { MatchingEngine } from "./matching-engine";
import { createRouter } from "./routes";
import { setupWS } from "./ws";
import { store } from "./store";

const app = express();
const httpServer = createServer(app);
const io = new IOServer(httpServer, {
  cors: {
    origin: process.env.NEXUS_CORS_ORIGIN ?? "*",
    methods: ["GET", "POST"],
    credentials: true
  }
});

app.use(cors({ origin: process.env.NEXUS_CORS_ORIGIN ?? "*", credentials: true }));
app.use(express.json());

const engine = new MatchingEngine((type, data) => {
  io.of("/api/ws").emit(type, data);
});

app.use(createRouter(engine));
setupWS(io, engine);

const PORT = Number(process.env.PORT ?? 4000);
httpServer.listen(PORT, () => {
  console.log(`Nexus Exchange server listening on http://localhost:${PORT}`);
  console.log(`WebSocket namespace: /api/ws`);
  console.log(`Seed markets: ${store.getMarkets().map((m) => m.symbol).join(", ")}`);
});
