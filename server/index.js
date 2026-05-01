const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const marketApi = require('./services/marketApi');

// Route imports
const aiRoutes = require('./routes/ai');
const authRoutes = require('./routes/auth');
const paperTradingRoutes = require('./routes/paperTrading');

const app = express();
app.use(cors());
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

app.get('/api/market/option-chain', async (req, res) => {
  try {
    const { symbol } = req.query;
    const data = await marketApi.getOptionChain(symbol);
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
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

// Mock data for demo
const mockData = [
  { symbol: '^NSEI', name: 'NIFTY 50', price: 22450.25, change: 125.45, changePercent: 0.56 },
  { symbol: '^BSESN', name: 'SENSEX', price: 73800.75, change: 320.20, changePercent: 0.43 },
  { symbol: '^NSEBANK', name: 'BANK NIFTY', price: 48200.50, change: -85.30, changePercent: -0.18 },
  { symbol: '^INDIAVIX', name: 'INDIA VIX', price: 12.50, change: -0.30, changePercent: -2.34 },
  { symbol: '^CNXAUTO', name: 'NIFTY AUTO', price: 0, change: 0, changePercent: 1.2 },
  { symbol: '^CNXFMCG', name: 'NIFTY FMCG', price: 0, change: 0, changePercent: 0.8 },
  { symbol: '^CNXMETAL', name: 'NIFTY METAL', price: 0, change: 0, changePercent: -0.5 },
  { symbol: '^CNXPHARMA', name: 'NIFTY PHARMA', price: 0, change: 0, changePercent: 1.5 },
  { symbol: '^CNXIT', name: 'NIFTY IT', price: 0, change: 0, changePercent: 2.1 },
  { symbol: 'RELIANCE.NS', name: 'Reliance Industries', price: 2450.35, change: 25.10, changePercent: 1.03 },
  { symbol: 'TCS.NS', name: 'Tata Consultancy', price: 4100.80, change: -15.25, changePercent: -0.36 },
  { symbol: 'HDFCBANK.NS', name: 'HDFC Bank', price: 1680.45, change: 12.15, changePercent: 0.72 },
  { symbol: 'INFY.NS', name: 'Infosys', price: 1520.60, change: 18.30, changePercent: 1.20 },
  { symbol: 'ITC.NS', name: 'ITC Ltd', price: 445.75, change: -3.20, changePercent: -0.67 },
  { symbol: 'SBIN.NS', name: 'State Bank of India', price: 585.90, change: 8.45, changePercent: 1.39 },
];

// Emit mock data every 10 seconds
setInterval(() => {
  const variedData = mockData.map(item => ({
    ...item,
    price: item.price > 0 ? parseFloat((item.price + (Math.random() - 0.5) * 10).toFixed(2)) : 0,
    change: parseFloat(((Math.random() - 0.5) * 50).toFixed(2)),
    changePercent: parseFloat(((Math.random() - 0.5) * 2).toFixed(2))
  }));
  io.emit('marketUpdate', variedData);
}, 10000);

// Socket.io
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  socket.emit('marketUpdate', mockData);
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
