// 공통 타입 정의
export interface RealTimePrice {
  symbol: string;
  price: number;
  change24h: number;
  volume24h: number;
  timestamp: number;
}

export interface TradingSignal {
  id: string;
  symbol: string;
  type: 'long' | 'short';
  entryPrice: number;
  stopLoss: number;
  targets: number[];
  confidence: number;
  strategy: string;
  timestamp: number;
  status: 'active' | 'filled' | 'cancelled';
}

export interface BacktestData {
  pattern: string;
  totalTrades: number;
  winRate: number;
  avgProfit: number;
  maxProfit: number;
  maxLoss: number;
  profitFactor: number;
  sharpeRatio: number;
  maxDrawdown: number;
  recentTrades: BacktestTrade[];
}

export interface BacktestTrade {
  date: string;
  entry: number;
  exit: number;
  profit: number;
  duration: string;
  result: 'win' | 'loss';
}

export interface Portfolio {
  id: string;
  userId: string;
  assets: PortfolioAsset[];
  totalValue: number;
  totalPnL: number;
  createdAt: string;
  updatedAt: string;
}

export interface PortfolioAsset {
  symbol: string;
  amount: number;
  avgBuyPrice: number;
  currentPrice: number;
  allocation: number;
}

export interface AlertCondition {
  id: string;
  userId: string;
  symbol: string;
  type: 'price' | 'pattern' | 'volume' | 'indicator';
  condition: string;
  value?: number;
  enabled: boolean;
  channels: string[];
  createdAt: string;
}

export interface MarketData {
  symbol: string;
  price: number;
  volume: number;
  marketCap: number;
  dominance?: number;
  fearGreedIndex?: number;
  technicalIndicators: {
    rsi: number;
    macd: number;
    bollinger: {
      upper: number;
      middle: number;
      lower: number;
    };
  };
  onchainMetrics?: {
    exchangeBalance: number;
    whaleMovements: number;
    hashRate?: number;
    activeAddresses: number;
  };
}

export interface AIAnalysis {
  symbol: string;
  timestamp: number;
  technicalAnalysis: {
    confidence: number;
    factors: string[];
    content: string;
  };
  onchainAnalysis: {
    confidence: number;
    factors: string[];
    content: string;
  };
  sentimentAnalysis: {
    confidence: number;
    factors: string[];
    content: string;
  };
  scenarios: TradingScenario[];
  recommendations: {
    action: string;
    reasoning: string;
    riskLevel: 'low' | 'medium' | 'high';
  }[];
}

export interface TradingScenario {
  name: string;
  probability: number;
  target: number;
  timeline: string;
  rationale: string;
}

export interface TimeframePlan {
  timeframe: 'scalp' | 'short' | 'medium' | 'long';
  label: string;
  duration: string;
  entry: number;
  stopLoss: number;
  targets: number[];
  strategy: string;
  riskLevel: 'low' | 'medium' | 'high';
  confidence: number;
}

export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
}