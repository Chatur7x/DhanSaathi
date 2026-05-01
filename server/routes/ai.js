const express = require('express');
const aiService = require('../services/aiService');
const newsAgentService = require('../services/newsAgentService');

const router = express.Router();

// POST /api/ai/chat — Conversational AI chatbot
router.post('/chat', async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message) return res.status(400).json({ error: 'Message is required' });

    const response = await aiService.chat(message, history || []);
    res.json({ response, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'AI service temporarily unavailable' });
  }
});

// POST /api/ai/portfolio-doctor — Analyze portfolio health
router.post('/portfolio-doctor', async (req, res) => {
  try {
    const { holdings } = req.body;
    if (!holdings || !Array.isArray(holdings)) {
      return res.status(400).json({ error: 'Holdings array is required' });
    }

    const analysis = await aiService.analyzePortfolio(holdings);
    res.json(analysis);
  } catch (error) {
    console.error('Portfolio doctor error:', error);
    res.status(500).json({ error: 'Analysis service temporarily unavailable' });
  }
});

// GET /api/ai/trade-signals — AI-generated trade signals from news
router.get('/trade-signals', async (req, res) => {
  try {
    const signals = await newsAgentService.getTradeSignals();
    res.json(signals);
  } catch (error) {
    console.error('Trade signals error:', error);
    res.status(500).json({ error: 'Signal generation failed' });
  }
});

// GET /api/ai/news — Sentiment-enriched news feed
router.get('/news', async (req, res) => {
  try {
    const news = await newsAgentService.getEnrichedNews();
    res.json(news);
  } catch (error) {
    console.error('News error:', error);
    res.status(500).json({ error: 'News service failed' });
  }
});

// POST /api/ai/sentiment — Analyze single text sentiment
router.post('/sentiment', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'Text is required' });

    const sentiment = await aiService.analyzeSentiment(text);
    res.json(sentiment);
  } catch (error) {
    res.status(500).json({ error: 'Sentiment analysis failed' });
  }
});

module.exports = router;
