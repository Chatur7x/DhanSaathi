require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const axios = require('axios');
const marketApi = require('./services/marketApi');
const { NseIndia } = require('stock-nse-india');

const nseIndia = new NseIndia();

// Route imports
const aiRoutes = require('./routes/ai');
const authRoutes = require('./routes/auth');
const paperTradingRoutes = require('./routes/paperTrading');
const portfolioRoutes = require('./routes/portfolio');

const app = express();

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5000',
  'https://dhan-saathi.vercel.app',
  'https://dhan-saathi-mmm5chgba-chatur7xs-projects.vercel.app'
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, or server-to-server)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
};

app.use(cors(corsOptions));
app.use(express.json());

const clientDist = path.join(__dirname, '../client/dist');
app.use(express.static(clientDist));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ============================================
// Mounted API Routes
// ============================================
app.use('/api/ai', aiRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/paper-trading', paperTradingRoutes);
app.use('/api/portfolio', portfolioRoutes);

// ============================================
// Market Data Routes (inline)
// ============================================
app.get('/api/market/quotes', async (req, res) => {
  try {
    const symbols = (req.query.symbols || '').split(',').filter(Boolean);
    const quotes = await marketApi.getQuotes(symbols);
    res.json(quotes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/market/historical', async (req, res) => {
  try {
    const { symbol, period = '1M' } = req.query;
    const data = await marketApi.getHistoricalData(symbol, period);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/market/indices', async (req, res) => {
  try {
    const indices = ['^NSEI', '^BSESN', '^NSEBANK', '^CNXIT'];
    const quotes = await marketApi.getQuotes(indices);
    res.json(quotes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/market/movers', async (req, res) => {
  try {
    const symbols = ['RELIANCE.NS', 'TCS.NS', 'HDFCBANK.NS', 'INFY.NS', 'ITC.NS', 'TATAMOTORS.NS', 'SBIN.NS'];
    const quotes = await marketApi.getQuotes(symbols);
    // Sort by absolute change percentage
    quotes.sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent));
    res.json(quotes.slice(0, 6));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const externalApi = require('./services/externalApi');

app.get('/api/market/option-chain', async (req, res) => {
  try {
    const { symbol } = req.query;
    const data = await marketApi.getOptionChain(symbol);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/market/crypto', async (req, res) => {
  try {
    const symbols = req.query.symbols || 'BTC,ETH,SOL,XRP';
    const data = await externalApi.getCryptoPrices(symbols);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/market/forex', async (req, res) => {
  try {
    const symbols = req.query.symbols || 'INR,EUR,GBP,JPY';
    const data = await externalApi.getForexRates(symbols);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// SPA fallback
app.use((req, res) => {
  res.sendFile(path.join(clientDist, 'index.html'));
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: { 
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST'] 
  }
});

// Emit Real Market Data every 15 seconds to avoid IP block
setInterval(async () => {
  try {
    const indicesData = await nseIndia.getEquityStockIndices('NIFTY 50');
    // Map NSE real data to the expected format
    if (indicesData && indicesData.data) {
      const realData = indicesData.data.slice(0, 15).map(item => ({
        symbol: item.symbol,
        name: item.symbol, // or map to full name if needed
        price: item.lastPrice,
        change: item.change,
        changePercent: item.pChange
      }));
      
      // Add custom Nifty entry to match frontend
      realData.unshift({
        symbol: '^NSEI',
        name: 'NIFTY 50',
        price: indicesData.metadata?.last || 0,
        change: indicesData.metadata?.change || 0,
        changePercent: indicesData.metadata?.percChange || 0
      });

      io.emit('marketUpdate', realData);
    }
  } catch (error) {
    console.error('Failed to fetch real market data:', error.message);
  }
}, 15000);

// Emit Real AI News periodically
let lastNewsId = null;
setInterval(async () => {
  try {
    const rssUrl = encodeURIComponent('https://economictimes.indiatimes.com/markets/rssfeeds/2146842.cms');
    const res = await axios.get(`https://api.rss2json.com/v1/api.json?rss_url=${rssUrl}`);
    
    if (res.data && res.data.items && res.data.items.length > 0) {
      const latestItem = res.data.items[Math.floor(Math.random() * 5)]; // pick one of top 5 randomly to simulate flow
      
      // Simple mock sentiment analysis fallback (In production, use Gemini here)
      const sentiment = latestItem.title.toLowerCase().includes('fall') || latestItem.title.toLowerCase().includes('loss') ? 'Bearish' : 'Bullish';
      
      io.emit('aiNewsUpdate', {
        id: latestItem.guid || Date.now(),
        headline: latestItem.title,
        sentiment: sentiment,
        impact: Math.floor(Math.random() * 100) + '%',
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Failed to fetch live AI news:', error.message);
  }
}, 10000); // Emits real scraped news every 10 seconds

// Socket.io
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  socket.on('disconnect', () => console.log('Client disconnected:', socket.id));
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`DhanSaathi Server running on port ${PORT}`);
  console.log(`  → AI Routes:       /api/ai/*`);
  console.log(`  → Auth Routes:     /api/auth/*`);
  console.log(`  → Paper Trading:   /api/paper-trading/*`);
  console.log(`  → Market Data:     /api/market/*`);
});
