import type { AcademyModule } from '../store/academyStore';

export const ACADEMY_COURSES: AcademyModule[] = [
  {
    id: 'investing-101', title: 'First Steps to Investing',
    description: 'Complete beginner guide to Indian stock market, mutual funds, and building your first portfolio.',
    difficulty: 'beginner', icon: '🌱', color: '#10b981', totalXP: 400,
    lessons: [
      {
        id: 'inv-1', title: 'Why Invest? The Power of Compounding', xp: 50,
        content: 'Money loses value due to inflation (~6% in India). ₹100 today = ₹55 in 10 years. Investing makes money grow FASTER than inflation.\n\n**Rule of 72:** Divide 72 by return rate to find doubling time.\n• FD at 6%: 72÷6 = 12 years\n• Equity at 12%: 72÷12 = 6 years\n• Small Cap at 15%: 72÷15 = 4.8 years\n\n₹10,000 in Nifty 50 in 2005 → ₹1,20,000+ today — a 12x return!',
        keyTakeaways: ['Inflation erodes purchasing power at ~6%/year', 'Rule of 72 estimates doubling time', 'Starting early is the biggest advantage'],
        quiz: [
          { question: 'At 12% return, how many years to double your money?', options: ['4 years', '6 years', '8 years', '12 years'], correct: 1, explanation: 'Rule of 72: 72 ÷ 12 = 6 years' },
          { question: 'Average annual inflation rate in India?', options: ['2%', '4%', '6%', '10%'], correct: 2, explanation: 'India CPI inflation averages ~6% over the last decade.' }
        ]
      },
      {
        id: 'inv-2', title: 'Types of Investments in India', xp: 50,
        content: '**Safe (Low Risk):** FD (6-7%), PPF (7.1% tax-free), Government Bonds, Sovereign Gold Bonds\n\n**Growth (Medium-High Risk):** Mutual Funds, ETFs, Direct Stocks via Demat account\n\n**Speculative (Very High Risk):** F&O (Futures & Options), Crypto (30% flat tax)',
        keyTakeaways: ['Risk and return are directly proportional', 'Start with mutual funds before direct stocks', 'Never invest more than you can lose in speculative instruments'],
        quiz: [
          { question: 'Which has DICGC insurance protection?', options: ['Mutual Funds', 'Fixed Deposits', 'Stocks', 'PPF'], correct: 1, explanation: 'Bank FDs insured up to ₹5 Lakh by DICGC.' }
        ]
      },
      {
        id: 'inv-3', title: 'SIP — The Easiest Way to Start', xp: 50,
        content: '**SIP** lets you invest a fixed amount every month in mutual funds.\n\n1. **Rupee Cost Averaging:** Buy more when prices low, fewer when high\n2. **Discipline:** Auto monthly debit removes emotion\n3. **No Timing Needed:** Don\'t need to predict markets\n4. **Start Small:** Begin with just ₹500/month',
        keyTakeaways: ['SIP removes need to time the market', 'Start with ₹500/month — just START', 'SIP works best over 5+ year horizons'],
        quiz: [
          { question: 'Minimum SIP amount for most mutual funds?', options: ['₹100', '₹500', '₹1,000', '₹5,000'], correct: 1, explanation: 'Most AMCs allow SIP from ₹500/month.' }
        ]
      },
      {
        id: 'inv-4', title: 'Understanding Risk & Asset Allocation', xp: 50,
        content: '**Golden Rule:** Never put all eggs in one basket.\n\n**Equity % = 100 - Your Age**\n• 25-year-old: 75% equity, 25% debt\n• 50-year-old: 50% equity, 50% debt\n\n**Risk Profiles:**\n• Conservative: 30% Equity, 50% Debt, 20% Gold → 8-10%\n• Balanced: 60% Equity, 25% Debt, 15% Gold → 10-13%\n• Aggressive: 80% Equity, 10% Debt, 10% Gold → 12-16%',
        keyTakeaways: ['Equity % ≈ 100 - your age', 'Goal timeline determines risk capacity', 'Rebalance every 6-12 months'],
        quiz: [
          { question: '30-year-old should have ~what % in equity?', options: ['30%', '50%', '70%', '90%'], correct: 2, explanation: '100 - 30 = 70% equity allocation.' }
        ]
      }
    ]
  },
  {
    id: 'sip-mastery', title: 'SIP Mastery & MF Selection',
    description: 'Master SIP investing, mutual fund selection, and building a high-performance MF portfolio.',
    difficulty: 'intermediate', icon: '📈', color: '#3b82f6', totalXP: 600,
    lessons: [
      {
        id: 'sip-1', title: 'Direct vs Regular Plans', xp: 50,
        content: '**Regular Plan:** Includes distributor commission (0.5-1.5% extra expense ratio)\n**Direct Plan:** No commission — lower expense, higher returns\n\n**20-year Impact (₹10K SIP):**\n• Regular (12%): ₹98.9 Lakhs\n• Direct (13%): ₹1.13 Crores\n• Difference: ₹14.4 Lakhs!\n\nBuy Direct via: Kuvera, Zerodha Coin, Groww, MF Utility',
        keyTakeaways: ['Always choose Direct over Regular', '1% expense difference = lakhs over 20 years', 'Use platforms like Kuvera or Zerodha Coin'],
        quiz: [
          { question: 'Savings from Direct vs Regular over 20 years?', options: ['₹5,000', '₹50,000', '₹5 Lakhs', '₹14+ Lakhs'], correct: 3, explanation: '1% compounding difference = ₹14+ Lakhs on ₹10K SIP over 20 years.' }
        ]
      },
      {
        id: 'sip-2', title: 'Step-Up SIP — Accelerate Wealth', xp: 50,
        content: '**Step-Up SIP** increases amount annually (10-15%).\n\n**15 years at 12%:**\n• Regular ₹10K SIP → ₹50.4L\n• 10% Step-Up → ₹1.02 Cr\n• 15% Step-Up → ₹1.47 Cr\n\nStep-Up nearly TRIPLES the final corpus!',
        keyTakeaways: ['Step-Up by at least 10% annually', 'Align with salary increments', 'Exponential growth effect'],
      },
      {
        id: 'sip-3', title: 'Selecting Winning Mutual Funds', xp: 50,
        content: '**5-Point Framework:**\n1. Category Match (Large/Mid/Small Cap)\n2. Track Record (3Y, 5Y, 10Y vs benchmark)\n3. Expense Ratio (under 1% for equity)\n4. Fund Manager (5+ year tenure)\n5. AUM Size (₹500Cr-₹50,000Cr)\n\n**Red Flags:** Consistent underperformance, frequent manager changes, NFOs.',
        keyTakeaways: ['Use 5-point framework for every fund', 'Don\'t chase last year\'s top performer', 'Index funds beat 80% of active funds over 10+ years'],
      }
    ]
  },
  {
    id: 'technical-analysis', title: 'Technical Analysis',
    description: 'Read charts, identify patterns, and use indicators for better trading decisions.',
    difficulty: 'advanced', icon: '📊', color: '#f59e0b', totalXP: 800,
    lessons: [
      {
        id: 'ta-1', title: 'Candlestick Charts', xp: 60,
        content: '**Anatomy:** Body (Open→Close), Upper Wick (High), Lower Wick (Low)\nGreen = bullish, Red = bearish\n\n**Key Patterns:**\n• Doji: Indecision → possible reversal\n• Hammer: Long lower wick at bottom → bullish\n• Engulfing: Second candle engulfs first → strong reversal\n• Morning/Evening Star: 3-candle reversal patterns',
        keyTakeaways: ['Confirm patterns with volume', 'Multi-candle > single candle patterns', 'Context (support/resistance) matters'],
        quiz: [
          { question: 'Hammer at support indicates?', options: ['Strong selling', 'Possible bullish reversal', 'Downtrend continuation', 'Nothing'], correct: 1, explanation: 'Hammer at support = buyers stepped in → bullish reversal.' }
        ]
      },
      {
        id: 'ta-2', title: 'Support, Resistance & Trends', xp: 60,
        content: '**Support:** Buying pressure prevents decline\n**Resistance:** Selling pressure prevents rise\n\n**Breakout Rule:**\n• Price breaks resistance → becomes NEW support\n• Price breaks support → becomes NEW resistance\n• Volume confirms genuine breakouts\n\n**Trends:** Connect higher lows (uptrend), lower highs (downtrend)',
        keyTakeaways: ['S/R are zones, not exact prices', 'More touches = stronger level', 'Volume confirms breakouts'],
      }
    ]
  },
  {
    id: 'options-trading', title: 'Options Trading Strategies',
    description: 'From calls and puts to advanced multi-leg strategies on NSE.',
    difficulty: 'expert', icon: '⚡', color: '#ef4444', totalXP: 1000,
    lessons: [
      {
        id: 'opt-1', title: 'Calls & Puts Fundamentals', xp: 60,
        content: '**Call (CE):** Right to BUY at strike\n**Put (PE):** Right to SELL at strike\n\n**Moneyness:** ITM (profitable), ATM (breakeven), OTM (not yet profitable)\n\n**Buyer:** Limited loss (premium), unlimited profit\n**Seller:** Limited profit (premium), unlimited loss\n\nNifty lot = 25, BankNifty lot = 15',
        keyTakeaways: ['Buyer risk limited, seller risk unlimited', 'OTM cheaper but expires worthless more often', 'Theta works AGAINST buyers'],
        quiz: [
          { question: 'Nifty at 22,000 — a 22,500 CE is?', options: ['ITM', 'ATM', 'OTM', 'Expired'], correct: 2, explanation: 'Spot 22,000 < Strike 22,500 → Call is OTM.' }
        ]
      },
      {
        id: 'opt-2', title: 'The Greeks', xp: 80,
        content: '**Delta:** Price change per ₹1 underlying move (Calls: 0 to +1, Puts: -1 to 0)\n**Gamma:** Rate of delta change — highest ATM near expiry\n**Theta:** Daily time decay — sellers earn, buyers lose\n**Vega:** Sensitivity to IV — sell when VIX high, buy when low',
        keyTakeaways: ['Delta = direction risk', 'Theta = option seller\'s best friend', 'Check India VIX before options trading'],
      }
    ]
  }
];
