import "dotenv/config";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { getEnabledTickers } from "./tickers.js";
import type { MarketQuote } from "./feeds/yahoo.js";
import { quoteCache, getStaleThresholdMs } from "./cache.js";
import { TickerScheduler } from "./scheduler.js";
import { getRetryConfig } from "./retry.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
app.use(express.static(path.join(__dirname, "public")));

const latestQuotes = new Map<string, MarketQuote>();
let lastUpdate: string | null = null;
let freshCount = 0;
let staleCount = 0;

function snapshot(): MarketQuote[] {
  return [...latestQuotes.values()];
}

function emitSnapshot(): void {
  const quotes = snapshot();
  if (quotes.length === 0) return;
  io.emit("market:tick", {
    quotes,
    timestamp: lastUpdate ?? new Date().toISOString(),
    count: quotes.length,
  });
}

function roomFor(ticker: string): string {
  return `ticker:${ticker}`;
}

function resolveTicker(input: unknown): string | null {
  if (typeof input !== "string") return null;
  const needle = input.trim().toUpperCase();
  if (!needle) return null;
  const found = getEnabledTickers().find(
    (t) => t.symbol.toUpperCase() === needle || t.yahooSymbol.toUpperCase() === needle
  );
  return found ? found.symbol : null;
}

app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    service: "market-service",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    tickers: getEnabledTickers().length,
    cachedQuotes: quoteCache.size(),
    liveQuotes: latestQuotes.size,
    fresh: freshCount,
    stale: staleCount,
    lastUpdate,
  });
});

app.get("/quotes", (req, res) => {
  res.json({
    quotes: snapshot(),
    timestamp: lastUpdate ?? new Date().toISOString(),
    count: latestQuotes.size,
  });
});

app.get("/quotes/:symbol", (req, res) => {
  const symbol = req.params.symbol.toUpperCase();
  const quote =
    latestQuotes.get(symbol) ?? quoteCache.getStaleQuote(symbol) ?? quoteCache.get(symbol);
  if (!quote) {
    res.status(404).json({ error: `No quote known for ${symbol}` });
    return;
  }
  res.json(quote);
});

app.get("/cache", (req, res) => {
  const now = Date.now();
  res.json({
    size: quoteCache.size(),
    staleAfterMs: getStaleThresholdMs(),
    entries: quoteCache.keys().map((key) => {
      const entry = quoteCache.getEntry(key)!;
      return {
        ticker: key,
        ageMs: Math.max(0, now - entry.cachedAt),
        stale: quoteCache.isStale(key),
        source: entry.quote.source,
      };
    }),
  });
});

app.get("/schedule", (req, res) => {
  res.json({
    retry: getRetryConfig(),
    staleAfterMs: getStaleThresholdMs(),
    jobs: scheduler.getSchedule(),
  });
});

const scheduler = new TickerScheduler(getEnabledTickers(), {
  onQuote: (quote) => {
    latestQuotes.set(quote.ticker, quote);
    lastUpdate = new Date().toISOString();

    if (quote.stale) {
      staleCount += 1;
    } else {
      freshCount += 1;
    }

    io.to(roomFor(quote.ticker)).emit(`market:tick:${quote.ticker}`, quote);
    emitSnapshot();

    console.log(
      `[MarketService] ${quote.ticker} ${quote.price} source=${quote.source} stale=${quote.stale} ageMs=${quote.ageMs}`
    );
  },
  onError: (ticker, error) => {

    const payload = {
      failed: [{ yahooSymbol: ticker.yahooSymbol, ticker: ticker.symbol, error }],
      timestamp: new Date().toISOString(),
    };
    io.emit("market:error", payload);
    console.warn(`[MarketService] ${ticker.symbol} failed with no cache: ${error}`);
  },
});

function emitStatus(status: string, extra: Record<string, unknown> = {}): void {
  io.emit("market:status", {
    status,
    lastUpdate,
    totalSymbols: getEnabledTickers().length,
    liveQuotes: latestQuotes.size,
    cachedQuotes: quoteCache.size(),
    timestamp: new Date().toISOString(),
    ...extra,
  });
}

io.on("connection", (socket) => {
  console.log(`[Socket.io] Client connected: ${socket.id}`);

  const subscriptions = new Set<string>();

  const joinTickers = (tickers: string[]): void => {
    for (const ticker of tickers) {
      if (subscriptions.has(ticker)) continue;
      subscriptions.add(ticker);
      void socket.join(roomFor(ticker));
    }
  };

  const leaveTickers = (tickers: string[]): void => {
    for (const ticker of tickers) {
      if (!subscriptions.has(ticker)) continue;
      subscriptions.delete(ticker);
      void socket.leave(roomFor(ticker));
    }
  };

  const sendStatus = (status: string): void => {
    socket.emit("market:status", {
      status,
      lastUpdate,
      totalSymbols: getEnabledTickers().length,
      liveQuotes: latestQuotes.size,
      cachedQuotes: quoteCache.size(),
      subscriptions: [...subscriptions],
      timestamp: new Date().toISOString(),
      message: status === "connected" ? "Connected to market-service" : undefined,
    });
  };

  sendStatus("connected");

  if (latestQuotes.size > 0) {
    socket.emit("market:tick", {
      quotes: snapshot(),
      timestamp: lastUpdate ?? new Date().toISOString(),
      count: latestQuotes.size,
    });
  }

  socket.on("market:subscribe", (data: { tickers?: unknown; symbols?: unknown }) => {

    const raw = Array.isArray(data?.tickers)
      ? data.tickers
      : Array.isArray(data?.symbols)
        ? data.symbols
        : [];
    const valid: string[] = [];
    const rejected: string[] = [];
    for (const entry of raw) {
      const resolved = resolveTicker(entry);
      if (resolved) {
        if (!valid.includes(resolved)) valid.push(resolved);
      } else {
        rejected.push(String(entry));
      }
    }

    joinTickers(valid);

    socket.emit("market:subscribed", {
      symbols: [...subscriptions],
      timestamp: new Date().toISOString(),
    });
    console.log(
      `[Socket.io] Client ${socket.id} subscribed to:`,
      valid.length > 0 ? valid.join(", ") : "(none)"
    );
    if (rejected.length > 0) {
      console.warn(`[Socket.io] Client ${socket.id} sent invalid tickers:`, rejected.join(", "));
    }
  });

  socket.on("market:unsubscribe", (data: { tickers?: unknown; symbols?: unknown }) => {
    const raw = Array.isArray(data?.tickers)
      ? data.tickers
      : Array.isArray(data?.symbols)
        ? data.symbols
        : [];
    const resolved = raw
      .map((entry) => resolveTicker(entry))
      .filter((t): t is string => t !== null);

    leaveTickers(resolved);

    socket.emit("market:unsubscribed", {
      symbols: [...subscriptions],
      timestamp: new Date().toISOString(),
    });
  });

  socket.on("disconnect", (reason) => {

    for (const ticker of subscriptions) {
      void socket.leave(roomFor(ticker));
    }
    subscriptions.clear();
    socket.removeAllListeners("market:subscribe");
    socket.removeAllListeners("market:unsubscribe");
    console.log(`[Socket.io] Client disconnected: ${socket.id}, reason: ${reason}`);
  });
});

const PORT = Number(process.env.PORT || 5001);

httpServer.listen(PORT, () => {
  const retry = getRetryConfig();
  console.log(`[MarketService] Server running on port ${PORT}`);
  console.log(`[MarketService] Health endpoint: http://localhost:${PORT}/health`);
  console.log(`[MarketService] WebSocket server ready`);
  console.log(`[MarketService] Configured tickers: ${getEnabledTickers().length}`);
  console.log(
    `[MarketService] Retry: maxRetries=${retry.maxRetries} initialBackoff=${retry.initialBackoffMs}ms maxBackoff=${retry.maxBackoffMs}ms`
  );
  console.log(`[MarketService] Stale threshold: ${getStaleThresholdMs()}ms`);

  scheduler.start();

  const statusTimer = setInterval(() => emitStatus("updating"), 15000);
  if (typeof statusTimer.unref === "function") statusTimer.unref();

  emitStatus("started");
});

function shutdown(signal: string): void {
  console.log(`[MarketService] ${signal} received, shutting down gracefully`);
  scheduler.stop();
  httpServer.close(() => {
    console.log("[MarketService] Server closed");
    process.exit(0);
  });
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

export { io, scheduler, latestQuotes };
