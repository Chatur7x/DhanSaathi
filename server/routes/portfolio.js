const express = require('express');
const sqlite3 = require('better-sqlite3');
const jwt = require('jsonwebtoken');

const router = express.Router();
const db = new sqlite3('dhansaathi.db');

// Middleware to protect routes
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token || token === 'null') {
    // Demo mode: default to user 1 if not logged in
    req.userId = 1;
    // ensure user 1 exists
    db.prepare('INSERT OR IGNORE INTO users (id, email, password, name) VALUES (1, "demo@demo.com", "demo", "Demo User")').run();
    return next();
  }
  try {
    const decoded = jwt.verify(token, 'dhansaathi-secret');
    req.userId = decoded.id;
    next();
  } catch (error) {
    req.userId = 1; // Fallback for demo
    next();
  }
};

// Get user's portfolio
router.get('/', authMiddleware, (req, res) => {
  try {
    const portfolios = db.prepare('SELECT * FROM portfolios WHERE user_id = ?').all(req.userId);
    res.json(portfolios);
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

// Add new holding
router.post('/', authMiddleware, (req, res) => {
  try {
    const { symbol, quantity, buy_price, asset_type } = req.body;
    
    // Check if exists, then update or insert
    const existing = db.prepare('SELECT * FROM portfolios WHERE user_id = ? AND symbol = ?').get(req.userId, symbol);
    
    if (existing) {
      // Average price logic
      const totalQty = existing.quantity + quantity;
      const avgPrice = ((existing.buy_price * existing.quantity) + (buy_price * quantity)) / totalQty;
      const stmt = db.prepare('UPDATE portfolios SET quantity = ?, buy_price = ? WHERE id = ?');
      stmt.run(totalQty, avgPrice, existing.id);
    } else {
      const stmt = db.prepare('INSERT INTO portfolios (user_id, symbol, quantity, buy_price, asset_type) VALUES (?, ?, ?, ?, ?)');
      stmt.run(req.userId, symbol, quantity, buy_price, asset_type || 'Stocks');
    }
    
    // Log transaction
    db.prepare('INSERT INTO transactions (user_id, type, amount, description) VALUES (?, ?, ?, ?)')
      .run(req.userId, 'BUY', quantity * buy_price, `Bought ${quantity} shares of ${symbol}`);
      
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

// Sell holding
router.post('/sell', authMiddleware, (req, res) => {
  try {
    const { symbol, quantity, sell_price } = req.body;
    const existing = db.prepare('SELECT * FROM portfolios WHERE user_id = ? AND symbol = ?').get(req.userId, symbol);
    
    if (!existing || existing.quantity < quantity) {
      return res.status(400).json({ error: 'Not enough shares' });
    }
    
    if (existing.quantity === quantity) {
      db.prepare('DELETE FROM portfolios WHERE id = ?').run(existing.id);
    } else {
      db.prepare('UPDATE portfolios SET quantity = quantity - ? WHERE id = ?').run(quantity, existing.id);
    }
    
    // Log transaction
    db.prepare('INSERT INTO transactions (user_id, type, amount, description) VALUES (?, ?, ?, ?)')
      .run(req.userId, 'SELL', quantity * sell_price, `Sold ${quantity} shares of ${symbol}`);
      
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

// Get transactions
router.get('/transactions', authMiddleware, (req, res) => {
  try {
    const tx = db.prepare('SELECT * FROM transactions WHERE user_id = ? ORDER BY created_at DESC').all(req.userId);
    res.json(tx);
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;
