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

// Latest known quotes (fresh or stale-marked), keyed by display ticker.
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

// Day-2 helpers for testing / debugging (read-only).
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

// --- Scheduler wiring -------------------------------------------------

const scheduler = new TickerScheduler(getEnabledTickers(), {
  onQuote: (quote) => {
    latestQuotes.set(quote.ticker, quote);
    lastUpdate = new Date().toISOString();

    if (quote.stale) {
      staleCount += 1;
    } else {
      freshCount += 1;
    }

    // Preserve Day-1 per-ticker + aggregate events.
    io.emit(`market:tick:${quote.ticker}`, quote);
    emitSnapshot();

    console.log(
      `[MarketService] ${quote.ticker} ${quote.price} source=${quote.source} stale=${quote.stale} ageMs=${quote.ageMs}`
    );
  },
  onError: (ticker, error) => {
    // No cache to fall back to → proper error, never an invented price.
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

  socket.emit("market:status", {
    status: "connected",
    timestamp: new Date().toISOString(),
    message: "Connected to market-service",
  });

  // Immediately push the last snapshot so new clients don't wait.
  if (latestQuotes.size > 0) {
    socket.emit("market:tick", {
      quotes: snapshot(),
      timestamp: lastUpdate ?? new Date().toISOString(),
      count: latestQuotes.size,
    });
  }

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

  // Periodic aggregate status (Day-1 clients rely on market:status).
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
