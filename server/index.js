const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const yahooFinance = require('yahoo-finance2').default;

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // In production, restrict this to your frontend URL
    methods: ["GET", "POST"]
  }
});

// Master list of all assets to track
const ASSETS_TO_TRACK = [
  '^NSEI', '^BSESN', '^NSEBANK', '^INDIAVIX', // Indices
  '^CNXAUTO', '^CNXFMCG', '^CNXMETAL', '^CNXPHARMA', '^CNXIT', // Sectors
  'RELIANCE.NS', 'TCS.NS', 'HDFCBANK.NS', 'INFY.NS', 'ITC.NS', 'SBIN.NS', // Stocks
  'NIFTYBEES.NS', 'GOLDBEES.NS', 'BANKBEES.NS', 'LIQUIDBEES.NS', // ETFs
  '0P00005WLZ.BO', '0P00005V1W.BO' // Mutual Funds
];

// In-memory cache to prevent spamming Yahoo Finance
let marketDataCache = [];

// Fetch data from Yahoo Finance cleanly and store in cache
const fetchMarketData = async () => {
  try {
    const results = await yahooFinance.quote(ASSETS_TO_TRACK);
    
    marketDataCache = results.map(quote => ({
      symbol: quote.symbol,
      name: quote.shortName || quote.longName || quote.symbol,
      price: quote.regularMarketPrice,
      change: quote.regularMarketChange,
      changePercent: Number((quote.regularMarketChangePercent).toFixed(2))
    }));

    // Broadcast the fresh data to all connected users
    io.emit('marketUpdate', marketDataCache);
    console.log(`[${new Date().toLocaleTimeString()}] Market data refreshed and broadcasted to ${io.engine.clientsCount} clients.`);

  } catch (error) {
    console.error("Error fetching market data from Yahoo:", error.message);
  }
};

// Polling Loop: Fetch new data every 10 seconds.
// We use 10 seconds to avoid Yahoo rate limits. The WebSocket will push it instantly.
setInterval(fetchMarketData, 10000);

// Perform an initial fetch immediately
fetchMarketData();

// Socket.io Connection Handler
io.on('connection', (socket) => {
  console.log('A client connected:', socket.id);
  
  // Instantly send the cached data so they don't have to wait for the next 10s tick
  if (marketDataCache.length > 0) {
    socket.emit('marketUpdate', marketDataCache);
  }

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Basic REST endpoint for initial load or health check
app.get('/api/market-data', (req, res) => {
  res.json(marketDataCache);
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Node.js Market Backend running on port ${PORT}`);
});
