export interface GlossaryTerm {
  term: string;
  definition: string;
  category: 'SIP' | 'MF' | 'ETF' | 'Stocks' | 'F&O' | 'General';
}

export interface Topic {
  id: string;
  title: string;
  description: string;
  icon: string; // We'll map this to a Lucide icon in the component
  content: string[]; // Paragraphs
  color: string;
}

export const KNOWLEDGE_TOPICS: Topic[] = [
  {
    id: 'sip',
    title: 'Systematic Investment Plan (SIP)',
    description: 'The power of compounding through disciplined investing.',
    icon: 'RefreshCcw',
    color: '#0a84ff',
    content: [
      'A Systematic Investment Plan (SIP) allows you to invest a fixed amount regularly in a mutual fund scheme.',
      'It brings financial discipline and helps you average out the cost of your investments (Rupee Cost Averaging).',
      'The true power of SIPs lies in compounding—the earlier you start, the more your money grows exponentially.'
    ]
  },
  {
    id: 'mf',
    title: 'Mutual Funds',
    description: 'Professionally managed investment pools.',
    icon: 'Briefcase',
    color: '#34c759',
    content: [
      'A Mutual Fund pools money from many investors to purchase securities like stocks, bonds, or short-term debt.',
      'They are managed by professional fund managers.',
      'Key terms include NAV (Net Asset Value), Expense Ratio (the fee charged by the fund house), and Exit Load.'
    ]
  },
  {
    id: 'etf',
    title: 'Exchange Traded Funds (ETFs)',
    description: 'Index funds that trade like stocks.',
    icon: 'Layers',
    color: '#bf5af2',
    content: [
      'ETFs track a specific index (like Nifty 50), commodity (like Gold), or sector.',
      'Unlike regular mutual funds, ETFs can be bought and sold on the stock exchange throughout the trading day.',
      'They generally have a lower expense ratio compared to actively managed mutual funds.'
    ]
  },
  {
    id: 'stocks',
    title: 'Stocks & Equities',
    description: 'Owning a piece of a publicly traded company.',
    icon: 'TrendingUp',
    color: '#ff9f0a',
    content: [
      'When you buy a stock, you are buying a small ownership stake in a company.',
      'Returns come from capital appreciation (the stock price going up) and dividends (company sharing profits).',
      'Investors use Fundamental Analysis (studying financials) and Technical Analysis (studying price charts) to pick stocks.'
    ]
  },
  {
    id: 'fno',
    title: 'Futures & Options (F&O)',
    description: 'Advanced derivative contracts.',
    icon: 'Activity',
    color: '#ff3b30',
    content: [
      'F&O are derivative instruments whose value is derived from an underlying asset (like a stock or index).',
      'Futures obligate you to buy/sell an asset at a future date at a set price.',
      'Options give you the right (but not obligation) to buy (Call) or sell (Put) an asset. Options trading involves understanding Greeks like Delta, Theta, and Vega.'
    ]
  }
];

export const GLOSSARY: GlossaryTerm[] = [
  { term: 'NAV', definition: 'Net Asset Value. The per-unit market value of a mutual fund.', category: 'MF' },
  { term: 'Expense Ratio', definition: 'The annual fee that all funds or ETFs charge their shareholders.', category: 'MF' },
  { term: 'Bluechip', definition: 'Nationally recognized, well-established, and financially sound companies.', category: 'Stocks' },
  { term: 'Market Cap', definition: 'Total market value of a company\'s outstanding shares.', category: 'Stocks' },
  { term: 'Call Option (CE)', definition: 'A contract giving the buyer the right to buy the underlying asset at a specific price.', category: 'F&O' },
  { term: 'Put Option (PE)', definition: 'A contract giving the buyer the right to sell the underlying asset at a specific price.', category: 'F&O' },
  { term: 'Rupee Cost Averaging', definition: 'Investing a fixed amount at regular intervals to average out the purchase cost.', category: 'SIP' },
  { term: 'Liquidity', definition: 'How easily an asset or security can be bought or sold without affecting its price.', category: 'General' },
  { term: 'NIFTY 50', definition: 'A benchmark Indian stock market index representing the weighted average of 50 of the largest Indian companies.', category: 'General' }
];
