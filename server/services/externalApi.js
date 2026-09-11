const axios = require('axios');
require('dotenv').config();

const COINLAYER_API_KEY = process.env.COINLAYER_API_KEY;
const FIXER_API_KEY = process.env.FIXER_API_KEY;

exports.getCryptoPrices = async (symbols = 'BTC,ETH,SOL,XRP') => {
  try {
    const res = await axios.get(`http://api.coinlayer.com/api/live`, {
      params: {
        access_key: COINLAYER_API_KEY,
        symbols: symbols,
        target: 'USD'
      }
    });

    if (res.data.success) {
      const rates = res.data.rates;
      return Object.keys(rates).map(symbol => ({
        symbol: symbol,
        price: rates[symbol],
        change: 0,
        changePercent: (Math.random() * 4 - 2).toFixed(2)
      }));
    }
    return [];
  } catch (error) {
    console.error('Coinlayer API Error:', error.message);
    return [];
  }
};

exports.getForexRates = async (symbols = 'INR,EUR,GBP,JPY') => {
  try {
    const res = await axios.get(`http://data.fixer.io/api/latest`, {
      params: {
        access_key: FIXER_API_KEY,
        base: 'USD',
        symbols: symbols
      }
    });

    if (res.data.success) {
      const rates = res.data.rates;
      return Object.keys(rates).map(symbol => ({
        symbol: `USD/${symbol}`,
        price: rates[symbol],
        changePercent: (Math.random() * 0.5 - 0.25).toFixed(2)
      }));
    }
    return [];
  } catch (error) {
    console.error('Fixer API Error:', error.message);
    return [];
  }
};
