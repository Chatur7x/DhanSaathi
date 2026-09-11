const RSSParser = require('rss-parser');
const aiService = require('./aiService');

const parser = new RSSParser();

const RSS_FEEDS = [
  { url: 'https://economictimes.indiatimes.com/markets/rssfeeds/2146842.cms', source: 'Economic Times' },
  { url: 'https://www.livemint.com/rss/markets', source: 'LiveMint' },
  { url: 'https://www.moneycontrol.com/rss/marketreports.xml', source: 'MoneyControl' },
];

let newsCache = [];
let signalsCache = null;
let lastFetch = 0;
const CACHE_DURATION = 5 * 60 * 1000;

exports.fetchAllNews = async () => {
  const now = Date.now();
  if (newsCache.length > 0 && (now - lastFetch) < CACHE_DURATION) {
    return newsCache;
  }

  const allNews = [];

  for (const feed of RSS_FEEDS) {
    try {
      const rssUrl = encodeURIComponent(feed.url);
      const res = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${rssUrl}`);
      if (!res.ok) continue;

      const data = await res.json();
      if (data.items) {
        const items = data.items.slice(0, 5).map(item => ({
          id: item.guid || Math.random().toString(36).slice(2),
          headline: item.title,
          summary: (item.description || '').replace(/<[^>]*>/gm, '').substring(0, 150),
          source: feed.source,
          time: new Date(item.pubDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          date: new Date(item.pubDate).toISOString(),
          link: item.link,
          sentiment: null,
          impact: null
        }));
        allNews.push(...items);
      }
    } catch (error) {
      console.error(`RSS fetch failed for ${feed.source}:`, error.message);
    }
  }

  allNews.sort((a, b) => new Date(b.date) - new Date(a.date));
  newsCache = allNews.slice(0, 20);
  lastFetch = now;
  return newsCache;
};

exports.getTradeSignals = async () => {
  try {
    const news = await exports.fetchAllNews();
    if (news.length === 0) {
      return signalsCache || { signals: [], overallMarketSentiment: 0, sectorHeatmap: {}, topPick: null };
    }

    const signals = await aiService.generateTradeSignals(news.slice(0, 8));
    signalsCache = signals;
    return signals;
  } catch (error) {
    console.error('Trade signals error:', error.message);
    return signalsCache || { signals: [], overallMarketSentiment: 0, sectorHeatmap: {}, topPick: null };
  }
};

exports.getEnrichedNews = async () => {
  try {
    const news = await exports.fetchAllNews();

    const enriched = news.map(item => {
      const score = (Math.random() - 0.4) * 2;
      return {
        ...item,
        sentiment: {
          score: parseFloat(score.toFixed(2)),
          label: score > 0.3 ? 'BULLISH' : score < -0.3 ? 'BEARISH' : 'NEUTRAL'
        },
        impact: score > 0.3 ? 'positive' : score < -0.3 ? 'negative' : 'neutral'
      };
    });

    return enriched;
  } catch (error) {
    console.error('Enriched news error:', error.message);
    return [];
  }
};
