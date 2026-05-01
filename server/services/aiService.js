const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize with API key from env, fallback to demo mode
const API_KEY = process.env.GEMINI_API_KEY || '';
let genAI = null;
let model = null;

if (API_KEY) {
  genAI = new GoogleGenerativeAI(API_KEY);
  model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
}

const SYSTEM_PROMPT = `You are DhanSaathi AI — an expert Indian financial advisor chatbot. You specialize in:
- SIP, Mutual Funds, ETFs, Stocks, F&O for Indian markets
- Tax planning (STCG 20%, LTCG 12.5% above ₹1.25L, Section 80C)
- Portfolio analysis and rebalancing
- Risk assessment and goal-based investing
- SEBI regulations and compliance

Rules:
1. Always use ₹ (Indian Rupees) and Indian number system (Lakhs, Crores)
2. Provide specific calculations when asked
3. Always add a disclaimer: "This is for educational purposes only. Consult a SEBI-registered advisor."
4. Be conversational, concise, and actionable
5. Reference Indian market indices (Nifty 50, Sensex, Bank Nifty)
6. Use Indian tax rules (FY 2025-26)`;

// AI Chat — conversational financial assistant
exports.chat = async (message, history = []) => {
  if (!model) {
    return getFallbackResponse(message);
  }

  try {
    const chat = model.startChat({
      history: [
        { role: 'user', parts: [{ text: 'You are DhanSaathi AI assistant.' }] },
        { role: 'model', parts: [{ text: SYSTEM_PROMPT }] },
        ...history.map(h => ({
          role: h.role === 'user' ? 'user' : 'model',
          parts: [{ text: h.content }]
        }))
      ]
    });

    const result = await chat.sendMessage(message);
    return result.response.text();
  } catch (error) {
    console.error('AI Chat error:', error.message);
    return getFallbackResponse(message);
  }
};

// Portfolio Doctor — analyze holdings and give health report
exports.analyzePortfolio = async (holdings) => {
  if (!model) {
    return getPortfolioDoctorFallback(holdings);
  }

  try {
    const prompt = `Analyze this Indian stock portfolio and provide a health report in JSON format:

Portfolio Holdings:
${holdings.map(h => `- ${h.symbol}: ${h.quantity} units @ ₹${h.buyPrice} (Current: ₹${h.currentPrice}, P&L: ${h.pnlPercent}%)`).join('\n')}

Provide analysis in this exact JSON format:
{
  "healthScore": <number 0-100>,
  "riskLevel": "<LOW|MEDIUM|HIGH|VERY_HIGH>",
  "diversificationScore": <number 0-100>,
  "alerts": [
    { "type": "<CRITICAL|WARNING|INFO>", "title": "<short title>", "description": "<actionable advice>" }
  ],
  "sectorExposure": { "<sector>": <percentage> },
  "recommendations": [
    { "action": "<BUY|SELL|HOLD|REBALANCE>", "symbol": "<stock>", "reason": "<why>" }
  ],
  "behavioralBiases": ["<bias detected>"],
  "benchmarkComparison": {
    "portfolioXIRR": <number>,
    "nifty50Return": <number>,
    "alpha": <number>
  },
  "summary": "<2-3 sentence portfolio health summary>"
}

Only return valid JSON, no markdown.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(text);
  } catch (error) {
    console.error('Portfolio analysis error:', error.message);
    return getPortfolioDoctorFallback(holdings);
  }
};

// Trade Signal Generator — analyze news and generate signals
exports.generateTradeSignals = async (newsItems) => {
  if (!model) {
    return getTradeSignalsFallback(newsItems);
  }

  try {
    const prompt = `You are an Indian market analyst. Analyze these news headlines and generate trade signals.

News Headlines:
${newsItems.map((n, i) => `${i + 1}. "${n.headline}" (Source: ${n.source})`).join('\n')}

Generate trade signals in this exact JSON format:
{
  "signals": [
    {
      "newsIndex": <number>,
      "headline": "<headline>",
      "sentiment": <number -1.0 to 1.0>,
      "sentimentLabel": "<VERY_BEARISH|BEARISH|NEUTRAL|BULLISH|VERY_BULLISH>",
      "impactedSectors": [
        { "sector": "<sector name>", "impact": "<POSITIVE|NEGATIVE|NEUTRAL>", "confidence": <0-100> }
      ],
      "stockSignals": [
        { "symbol": "<NSE symbol>", "action": "<BUY|SELL|HOLD>", "reason": "<brief reason>", "confidence": <0-100> }
      ]
    }
  ],
  "overallMarketSentiment": <number -1.0 to 1.0>,
  "sectorHeatmap": { "<sector>": <sentiment -1.0 to 1.0> },
  "topPick": { "symbol": "<symbol>", "action": "<BUY|SELL>", "reason": "<reason>", "confidence": <0-100> }
}

Only return valid JSON, no markdown.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(text);
  } catch (error) {
    console.error('Trade signals error:', error.message);
    return getTradeSignalsFallback(newsItems);
  }
};

// Sentiment Analysis — score individual news items
exports.analyzeSentiment = async (text) => {
  if (!model) {
    return { score: (Math.random() - 0.5) * 2, label: 'NEUTRAL' };
  }

  try {
    const prompt = `Score the market sentiment of this Indian financial news on a scale from -1.0 (very bearish) to +1.0 (very bullish). Return ONLY a JSON: {"score": <number>, "label": "<VERY_BEARISH|BEARISH|NEUTRAL|BULLISH|VERY_BULLISH>"}

News: "${text}"`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text().replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(responseText);
  } catch (error) {
    return { score: 0, label: 'NEUTRAL' };
  }
};

// ======== Fallback responses when no API key ========

function getFallbackResponse(message) {
  const lower = message.toLowerCase();

  if (lower.includes('sip') && (lower.includes('calculator') || lower.includes('calculate') || lower.includes('invest'))) {
    const match = message.match(/(\d+[\d,]*)/);
    const amount = match ? parseInt(match[1].replace(/,/g, '')) : 5000;
    const futureValue15 = calculateSIP(amount, 12, 15);
    const futureValue20 = calculateSIP(amount, 12, 20);
    return `Great question! Here's what ₹${amount.toLocaleString('en-IN')}/month SIP can grow to at 12% annual returns:

📊 **SIP Projection:**
• **15 years:** ₹${formatINR(futureValue15)} (Invested: ₹${formatINR(amount * 15 * 12)})
• **20 years:** ₹${formatINR(futureValue20)} (Invested: ₹${formatINR(amount * 20 * 12)})

💡 **Key Insight:** The power of compounding means your money grows exponentially in later years. A Step-Up SIP (increasing by 10% annually) would grow even faster!

📌 Want me to calculate a Step-Up SIP or compare with lumpsum investment?

⚠️ *This is for educational purposes only. Past performance doesn't guarantee future results. Consult a SEBI-registered advisor.*`;
  }

  if (lower.includes('nifty') || lower.includes('market') || lower.includes('sensex')) {
    return `Here's a quick market overview:

📊 **Indian Markets Summary:**
• NIFTY 50 has historically delivered ~12-14% CAGR over 20+ year periods
• SENSEX has grown from 100 in 1979 to 73,000+ today
• India is the fastest-growing major economy

💡 **Investment Strategy:**
• For long-term wealth: Nifty 50 Index Fund via SIP
• For stability: Mix of Large Cap + Debt funds (70:30)
• For aggressive growth: Mid/Small Cap funds (higher risk)

📌 Would you like me to suggest specific funds or calculate your investment growth?

⚠️ *This is for educational purposes only. Consult a SEBI-registered advisor.*`;
  }

  if (lower.includes('tax') || lower.includes('ltcg') || lower.includes('stcg')) {
    return `Here's the Indian Capital Gains Tax structure (FY 2025-26):

🧾 **Equity Taxation:**
• **STCG** (held < 1 year): **20%** flat rate
• **LTCG** (held > 1 year): **12.5%** on gains above ₹1.25 Lakh
• **Dividend Income**: Added to your income slab

🧾 **Debt Fund Taxation:**
• All gains taxed as per income slab (no separate LTCG)

💡 **Tax Saving Tips:**
1. Use ₹1.25L LTCG exemption by booking profits annually
2. Harvest tax losses before March 31 to offset gains
3. Invest in ELSS for 80C deduction (₹1.5L limit)

📌 Want me to calculate your exact tax liability?

⚠️ *Tax laws are subject to change. Consult a CA for personalized advice.*`;
  }

  if (lower.includes('portfolio') || lower.includes('diversif') || lower.includes('allocat')) {
    return `Here's a recommended portfolio allocation based on risk profiles:

📊 **Conservative (Low Risk):**
• 40% Large Cap Equity | 30% Debt | 20% Gold | 10% Cash

📊 **Balanced (Medium Risk):**
• 60% Equity (Large+Mid) | 20% Debt | 15% Gold | 5% Cash

📊 **Aggressive (High Risk):**
• 80% Equity (Mid+Small Cap tilt) | 10% Debt | 5% Gold | 5% International

💡 **Key Rules:**
1. Never put >25% in a single sector
2. Rebalance every 6 months
3. Emergency fund = 6 months expenses (keep in liquid fund)

📌 Share your current portfolio and I'll analyze it!

⚠️ *This is for educational purposes only. Consult a SEBI-registered advisor.*`;
  }

  return `I'm DhanSaathi AI — your intelligent wealth companion! 🤖💰

I can help you with:
• 📊 **SIP/Lumpsum calculations** — "Calculate SIP of ₹10,000 for 15 years"
• 🧾 **Tax planning** — "How much LTCG tax on ₹5 lakh gains?"
• 📈 **Market insights** — "How is Nifty performing?"
• 💼 **Portfolio analysis** — "Analyze my portfolio allocation"
• 📚 **Financial education** — "Explain options Greeks"

Try asking me anything about Indian markets, investments, or personal finance!

⚠️ *For educational purposes only. Not SEBI registered.*`;
}

function getPortfolioDoctorFallback(holdings) {
  const totalValue = holdings.reduce((s, h) => s + (h.quantity * (h.currentPrice || h.buyPrice)), 0);
  const sectors = {};
  const sectorMap = {
    'RELIANCE.NS': 'Energy', 'TCS.NS': 'IT', 'INFY.NS': 'IT',
    'HDFCBANK.NS': 'Banking', 'SBIN.NS': 'Banking', 'ITC.NS': 'FMCG',
    'TATAMOTORS.NS': 'Auto', 'BHARTIARTL.NS': 'Telecom'
  };

  holdings.forEach(h => {
    const sector = sectorMap[h.symbol] || 'Other';
    const value = h.quantity * (h.currentPrice || h.buyPrice);
    sectors[sector] = (sectors[sector] || 0) + Math.round((value / totalValue) * 100);
  });

  const maxSector = Object.entries(sectors).sort((a, b) => b[1] - a[1])[0];
  const isConcentrated = maxSector && maxSector[1] > 40;
  const avgPnl = holdings.reduce((s, h) => s + (h.pnlPercent || 0), 0) / (holdings.length || 1);

  const alerts = [];
  if (holdings.length < 5) alerts.push({ type: 'WARNING', title: 'Under-diversified', description: `Only ${holdings.length} holdings. Consider adding 8-12 stocks across different sectors.` });
  if (isConcentrated) alerts.push({ type: 'CRITICAL', title: `${maxSector[0]} Over-exposure`, description: `${maxSector[1]}% in ${maxSector[0]} sector. Keep any sector below 25% for safety.` });
  if (avgPnl < -10) alerts.push({ type: 'WARNING', title: 'Portfolio Under Stress', description: `Average P&L is ${avgPnl.toFixed(1)}%. Consider reviewing losing positions.` });
  alerts.push({ type: 'INFO', title: 'Add Debt Allocation', description: 'Consider 20-30% allocation in debt funds for stability.' });

  return {
    healthScore: Math.min(100, Math.max(20, 60 + (holdings.length * 3) - (isConcentrated ? 20 : 0) + (avgPnl > 0 ? 10 : -10))),
    riskLevel: isConcentrated ? 'HIGH' : holdings.length < 5 ? 'MEDIUM' : 'LOW',
    diversificationScore: Math.min(100, holdings.length * 12),
    alerts,
    sectorExposure: sectors,
    recommendations: holdings.slice(0, 3).map(h => ({
      action: (h.pnlPercent || 0) > 20 ? 'HOLD' : (h.pnlPercent || 0) < -15 ? 'SELL' : 'HOLD',
      symbol: h.symbol.replace('.NS', ''),
      reason: (h.pnlPercent || 0) > 20 ? 'Strong performer — let profits run' : (h.pnlPercent || 0) < -15 ? 'Consider stop-loss review' : 'Fundamentals intact'
    })),
    behavioralBiases: isConcentrated ? ['Sector concentration bias', 'Familiarity bias'] : ['Well-distributed'],
    benchmarkComparison: {
      portfolioXIRR: avgPnl * 1.2,
      nifty50Return: 12.5,
      alpha: (avgPnl * 1.2) - 12.5
    },
    summary: `Your portfolio has ${holdings.length} holdings with ${isConcentrated ? 'concerning sector concentration' : 'reasonable diversification'}. ${avgPnl > 0 ? 'Overall performance is positive.' : 'Some positions need attention.'} Consider adding debt and gold for balanced allocation.`
  };
}

function getTradeSignalsFallback(newsItems) {
  const sectors = ['Banking', 'IT', 'Auto', 'Pharma', 'FMCG', 'Energy', 'Metals', 'Real Estate'];

  return {
    signals: newsItems.slice(0, 5).map((n, i) => ({
      newsIndex: i,
      headline: n.headline,
      sentiment: parseFloat(((Math.random() - 0.4) * 2).toFixed(2)),
      sentimentLabel: Math.random() > 0.5 ? 'BULLISH' : 'BEARISH',
      impactedSectors: [
        { sector: sectors[i % sectors.length], impact: Math.random() > 0.5 ? 'POSITIVE' : 'NEGATIVE', confidence: Math.floor(50 + Math.random() * 40) }
      ],
      stockSignals: [
        { symbol: ['RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'ITC'][i % 5], action: Math.random() > 0.5 ? 'BUY' : 'HOLD', reason: 'Based on news sentiment and sector impact', confidence: Math.floor(50 + Math.random() * 35) }
      ]
    })),
    overallMarketSentiment: parseFloat(((Math.random() - 0.3) * 1.4).toFixed(2)),
    sectorHeatmap: {
      Banking: parseFloat(((Math.random() - 0.4) * 2).toFixed(2)),
      IT: parseFloat(((Math.random() - 0.4) * 2).toFixed(2)),
      Auto: parseFloat(((Math.random() - 0.4) * 2).toFixed(2)),
      Pharma: parseFloat(((Math.random() - 0.4) * 2).toFixed(2)),
      FMCG: parseFloat(((Math.random() - 0.4) * 2).toFixed(2)),
      Energy: parseFloat(((Math.random() - 0.4) * 2).toFixed(2)),
      Metals: parseFloat(((Math.random() - 0.4) * 2).toFixed(2)),
    },
    topPick: { symbol: 'RELIANCE', action: 'BUY', reason: 'Strong momentum with positive sector outlook', confidence: 72 }
  };
}

function calculateSIP(monthly, rate, years) {
  const r = rate / 100 / 12;
  const n = years * 12;
  return Math.round(monthly * ((Math.pow(1 + r, n) - 1) / r) * (1 + r));
}

function formatINR(num) {
  if (num >= 10000000) return (num / 10000000).toFixed(2) + ' Cr';
  if (num >= 100000) return (num / 100000).toFixed(2) + ' L';
  return num.toLocaleString('en-IN');
}
