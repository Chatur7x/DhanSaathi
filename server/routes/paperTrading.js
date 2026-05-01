const express = require('express');
const sqlite3 = require('better-sqlite3');
const path = require('path');

const router = express.Router();
const db = new sqlite3(path.join(__dirname, '..', 'dhansaathi.db'));

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS paper_trades (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL,
    symbol TEXT NOT NULL,
    action TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    price REAL NOT NULL,
    total REAL NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS paper_sessions (
    id TEXT PRIMARY KEY,
    name TEXT DEFAULT 'My Session',
    initial_balance REAL DEFAULT 1000000,
    current_balance REAL DEFAULT 1000000,
    total_pnl REAL DEFAULT 0,
    total_trades INTEGER DEFAULT 0,
    win_count INTEGER DEFAULT 0,
    loss_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS paper_holdings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL,
    symbol TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    avg_price REAL NOT NULL,
    FOREIGN KEY (session_id) REFERENCES paper_sessions(id)
  );
`);

// GET /api/paper-trading/sessions — Get all sessions
router.get('/sessions', (req, res) => {
  try {
    const sessions = db.prepare('SELECT * FROM paper_sessions ORDER BY updated_at DESC').all();
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/paper-trading/sessions — Create new session
router.post('/sessions', (req, res) => {
  try {
    const { name, initialBalance } = req.body;
    const id = 'ps_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    const balance = initialBalance || 1000000;

    db.prepare('INSERT INTO paper_sessions (id, name, initial_balance, current_balance) VALUES (?, ?, ?, ?)')
      .run(id, name || 'My Session', balance, balance);

    const session = db.prepare('SELECT * FROM paper_sessions WHERE id = ?').get(id);
    res.json(session);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/paper-trading/sessions/:id — Get session details with holdings
router.get('/sessions/:id', (req, res) => {
  try {
    const session = db.prepare('SELECT * FROM paper_sessions WHERE id = ?').get(req.params.id);
    if (!session) return res.status(404).json({ error: 'Session not found' });

    const holdings = db.prepare('SELECT * FROM paper_holdings WHERE session_id = ?').all(req.params.id);
    const trades = db.prepare('SELECT * FROM paper_trades WHERE session_id = ? ORDER BY created_at DESC LIMIT 50').all(req.params.id);

    res.json({ ...session, holdings, trades });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/paper-trading/trade — Execute a paper trade
router.post('/trade', (req, res) => {
  try {
    const { sessionId, symbol, action, quantity, price } = req.body;
    if (!sessionId || !symbol || !action || !quantity || !price) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const session = db.prepare('SELECT * FROM paper_sessions WHERE id = ?').get(sessionId);
    if (!session) return res.status(404).json({ error: 'Session not found' });

    const total = quantity * price;

    if (action === 'BUY') {
      if (total > session.current_balance) {
        return res.status(400).json({ error: 'Insufficient balance' });
      }

      // Deduct balance
      db.prepare('UPDATE paper_sessions SET current_balance = current_balance - ?, total_trades = total_trades + 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
        .run(total, sessionId);

      // Update or create holding
      const existing = db.prepare('SELECT * FROM paper_holdings WHERE session_id = ? AND symbol = ?').get(sessionId, symbol);
      if (existing) {
        const newQty = existing.quantity + quantity;
        const newAvg = ((existing.quantity * existing.avg_price) + total) / newQty;
        db.prepare('UPDATE paper_holdings SET quantity = ?, avg_price = ? WHERE id = ?')
          .run(newQty, parseFloat(newAvg.toFixed(2)), existing.id);
      } else {
        db.prepare('INSERT INTO paper_holdings (session_id, symbol, quantity, avg_price) VALUES (?, ?, ?, ?)')
          .run(sessionId, symbol, quantity, price);
      }
    } else if (action === 'SELL') {
      const existing = db.prepare('SELECT * FROM paper_holdings WHERE session_id = ? AND symbol = ?').get(sessionId, symbol);
      if (!existing || existing.quantity < quantity) {
        return res.status(400).json({ error: 'Insufficient holdings' });
      }

      // Add balance
      db.prepare('UPDATE paper_sessions SET current_balance = current_balance + ?, total_trades = total_trades + 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
        .run(total, sessionId);

      // Calculate P&L
      const pnl = (price - existing.avg_price) * quantity;
      db.prepare('UPDATE paper_sessions SET total_pnl = total_pnl + ?, win_count = win_count + ?, loss_count = loss_count + ? WHERE id = ?')
        .run(pnl, pnl > 0 ? 1 : 0, pnl <= 0 ? 1 : 0, sessionId);

      // Update holdings
      const newQty = existing.quantity - quantity;
      if (newQty === 0) {
        db.prepare('DELETE FROM paper_holdings WHERE id = ?').run(existing.id);
      } else {
        db.prepare('UPDATE paper_holdings SET quantity = ? WHERE id = ?').run(newQty, existing.id);
      }
    }

    // Record trade
    db.prepare('INSERT INTO paper_trades (session_id, symbol, action, quantity, price, total) VALUES (?, ?, ?, ?, ?, ?)')
      .run(sessionId, symbol, action, quantity, price, total);

    // Return updated session
    const updated = db.prepare('SELECT * FROM paper_sessions WHERE id = ?').get(sessionId);
    const holdings = db.prepare('SELECT * FROM paper_holdings WHERE session_id = ?').all(sessionId);
    const trades = db.prepare('SELECT * FROM paper_trades WHERE session_id = ? ORDER BY created_at DESC LIMIT 20').all(sessionId);

    res.json({ ...updated, holdings, trades });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/paper-trading/sessions/:id — Delete session
router.delete('/sessions/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM paper_trades WHERE session_id = ?').run(req.params.id);
    db.prepare('DELETE FROM paper_holdings WHERE session_id = ?').run(req.params.id);
    db.prepare('DELETE FROM paper_sessions WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
