import "dotenv/config";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import { getEnabledTickers, getYahooSymbols } from "./tickers";
import { fetchQuotes, filterSuccessfulQuotes, BatchQuoteResult, MarketQuote } from "./feeds/yahoo";

const app = express();
const httpServer = createServer(app);

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5000",
  "http://localhost:5001",
  "https://dhan-saathi.vercel.app",
];

const io = new Server(httpServer, {
  cors: {
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || origin.endsWith(".vercel.app")) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    service: "market-service",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

let isFetching = false;

async function emitMarketTick(): Promise<void> {
  if (isFetching) {
    console.log("[MarketService] Previous fetch still in progress, skipping");
    return;
  }

  isFetching = true;

  try {
    const symbols = getYahooSymbols();
    console.log(`[MarketService] Fetching quotes for ${symbols.length} symbols`);

    const batchResult: BatchQuoteResult = await fetchQuotes(symbols);
    const successfulQuotes: MarketQuote[] = filterSuccessfulQuotes(batchResult);
    const failedQuotes = batchResult.results.filter((r) => !r.success);

    if (successfulQuotes.length > 0) {
      const tickPayload = {
        quotes: successfulQuotes,
        timestamp: batchResult.timestamp,
        count: successfulQuotes.length,
      };

      io.emit("market:tick", tickPayload);

      successfulQuotes.forEach((quote) => {
        io.emit(`market:tick:${quote.ticker}`, quote);
      });

      console.log(
        `[MarketService] Emitted market:tick with ${successfulQuotes.length} quotes`
      );
    }

    if (failedQuotes.length > 0) {
      const errorPayload = {
        failed: failedQuotes.map((f) => ({
          yahooSymbol: f.yahooSymbol,
          error: f.error,
        })),
        timestamp: new Date().toISOString(),
      };
      io.emit("market:error", errorPayload);
      console.warn(
        `[MarketService] ${failedQuotes.length} quotes failed:`,
        failedQuotes.map((f) => f.yahooSymbol).join(", ")
      );
    }

    io.emit("market:status", {
      status: "updating",
      lastUpdate: new Date().toISOString(),
      totalSymbols: symbols.length,
      successful: successfulQuotes.length,
      failed: failedQuotes.length,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[MarketService] Fatal error in emitMarketTick:", message);
    io.emit("market:error", {
      error: message,
      timestamp: new Date().toISOString(),
    });
    io.emit("market:status", {
      status: "error",
      error: message,
      timestamp: new Date().toISOString(),
    });
  } finally {
    isFetching = false;
  }
}

io.on("connection", (socket) => {
  console.log(`[Socket.io] Client connected: ${socket.id}`);

  socket.emit("market:status", {
    status: "connected",
    timestamp: new Date().toISOString(),
    message: "Connected to market-service",
  });

  socket.on("market:subscribe", (data: { symbols?: string[] }) => {
    const requestedSymbols = data?.symbols || [];
    const validSymbols = requestedSymbols.filter((s) =>
      getEnabledTickers().some((t) => t.yahooSymbol === s || t.symbol === s)
    );

    socket.emit("market:subscribed", {
      symbols: validSymbols,
      timestamp: new Date().toISOString(),
    });
    console.log(`[Socket.io] Client ${socket.id} subscribed to:`, validSymbols);
  });

  socket.on("disconnect", (reason) => {
    console.log(`[Socket.io] Client disconnected: ${socket.id}, reason: ${reason}`);
  });
});

const PORT = process.env.PORT || 5001;
const FETCH_INTERVAL_MS = parseInt(process.env.FETCH_INTERVAL_MS || "15000", 10);

httpServer.listen(PORT, () => {
  console.log(`[MarketService] Server running on port ${PORT}`);
  console.log(`[MarketService] Health endpoint: http://localhost:${PORT}/health`);
  console.log(`[MarketService] WebSocket server ready`);
  console.log(`[MarketService] Configured tickers: ${getEnabledTickers().length}`);
  console.log(`[MarketService] Fetch interval: ${FETCH_INTERVAL_MS}ms`);

  emitMarketTick();

  setInterval(emitMarketTick, FETCH_INTERVAL_MS);
});

process.on("SIGTERM", () => {
  console.log("[MarketService] SIGTERM received, shutting down gracefully");
  httpServer.close(() => {
    console.log("[MarketService] Server closed");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.log("[MarketService] SIGINT received, shutting down gracefully");
  httpServer.close(() => {
    console.log("[MarketService] Server closed");
    process.exit(0);
  });
});