import { NextResponse } from 'next/server';

// 고래 거래 임계값 (USD)
const WHALE_THRESHOLDS: Record<string, number> = {
  BTC: 100000,    // $100,000
  ETH: 50000,     // $50,000
  BNB: 30000,     // $30,000
  SOL: 20000,     // $20,000
  XRP: 20000,     // $20,000
  ADA: 15000,     // $15,000
  DOGE: 15000,    // $15,000
  AVAX: 15000,    // $15,000
};

// Binance WebSocket 연결 관리
class BinanceWhaleTracker {
  private ws: WebSocket | null = null;
  private trades: Map<string, any[]> = new Map();
  private prices: Map<string, number> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  constructor() {
    this.initializeWebSocket();
  }

  private initializeWebSocket() {
    try {
      // Binance 실시간 거래 스트림
      const symbols = Object.keys(WHALE_THRESHOLDS).map(s => `${s.toLowerCase()}usdt@aggTrade`).join('/');
      this.ws = new WebSocket(`wss://stream.binance.com:9443/stream?streams=${symbols}`);

      this.ws.onopen = () => {
        console.log('Binance WebSocket connected for whale tracking');
        this.reconnectAttempts = 0;
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.stream && data.data) {
            this.processTradeData(data.data);
          }
        } catch (error) {
          console.error('Error processing WebSocket message:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.handleReconnect();
      };
    } catch (error) {
      console.error('Failed to initialize WebSocket:', error);
    }
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Reconnecting... Attempt ${this.reconnectAttempts}`);
      setTimeout(() => this.initializeWebSocket(), 3000);
    }
  }

  private processTradeData(data: any) {
    const symbol = data.s.replace('USDT', '');
    const price = parseFloat(data.p);
    const quantity = parseFloat(data.q);
    const tradeValue = price * quantity;

    // 가격 업데이트
    this.prices.set(symbol, price);

    // 고래 거래인지 확인
    const threshold = WHALE_THRESHOLDS[symbol];
    if (threshold && tradeValue >= threshold) {
      const trade = {
        id: data.a,
        symbol: symbol,
        price: price,
        quantity: quantity,
        value: tradeValue,
        time: data.T,
        isBuyerMaker: data.m,
        type: data.m ? 'SELL' : 'BUY'
      };

      // 심볼별 거래 저장 (최대 100개)
      if (!this.trades.has(symbol)) {
        this.trades.set(symbol, []);
      }
      const symbolTrades = this.trades.get(symbol)!;
      symbolTrades.unshift(trade);
      if (symbolTrades.length > 100) {
        symbolTrades.pop();
      }
    }
  }

  public getTrades(symbol?: string): any[] {
    if (symbol) {
      return this.trades.get(symbol) || [];
    }
    // 모든 거래 반환
    const allTrades: any[] = [];
    this.trades.forEach((trades) => {
      allTrades.push(...trades);
    });
    return allTrades.sort((a, b) => b.time - a.time).slice(0, 100);
  }

  public getStatistics(symbol: string) {
    const trades = this.trades.get(symbol) || [];
    const currentPrice = this.prices.get(symbol) || 0;

    if (trades.length === 0) {
      return {
        totalWhales: 0,
        buyCount: 0,
        sellCount: 0,
        totalVolume: 0,
        largestTrade: 0,
        avgTradeSize: 0,
        buyVolume: 0,
        sellVolume: 0,
        netFlow: 0,
        currentPrice
      };
    }

    const buyTrades = trades.filter(t => t.type === 'BUY');
    const sellTrades = trades.filter(t => t.type === 'SELL');

    const totalVolume = trades.reduce((sum, t) => sum + t.value, 0);
    const buyVolume = buyTrades.reduce((sum, t) => sum + t.value, 0);
    const sellVolume = sellTrades.reduce((sum, t) => sum + t.value, 0);

    return {
      totalWhales: trades.length,
      buyCount: buyTrades.length,
      sellCount: sellTrades.length,
      totalVolume,
      largestTrade: Math.max(...trades.map(t => t.value)),
      avgTradeSize: totalVolume / trades.length,
      buyVolume,
      sellVolume,
      netFlow: buyVolume - sellVolume,
      currentPrice
    };
  }

  public close() {
    if (this.ws) {
      this.ws.close();
    }
  }
}

// 싱글톤 인스턴스
let tracker: BinanceWhaleTracker | null = null;

// GET 요청 처리
export async function GET(request: Request) {
  try {
    // 트래커 초기화
    if (!tracker) {
      tracker = new BinanceWhaleTracker();
      // WebSocket 연결 대기
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol');
    const type = searchParams.get('type');

    // 통계 요청
    if (type === 'stats' && symbol) {
      const stats = tracker.getStatistics(symbol);
      return NextResponse.json(stats);
    }

    // 거래 목록 요청
    const trades = tracker.getTrades(symbol || undefined);
    
    return NextResponse.json({
      success: true,
      trades: trades,
      timestamp: Date.now()
    });

  } catch (error) {
    console.error('Whale API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch whale trades' },
      { status: 500 }
    );
  }
}

// Binance REST API를 통한 최근 거래 조회 (폴백)
async function fetchRecentTrades(symbol: string) {
  try {
    const response = await fetch(
      `https://api.binance.com/api/v3/aggTrades?symbol=${symbol}USDT&limit=500`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch from Binance');
    }

    const trades = await response.json();
    const price = await fetchCurrentPrice(symbol);
    
    // 고래 거래만 필터링
    const threshold = WHALE_THRESHOLDS[symbol];
    const whaleTrades = trades
      .map((t: any) => ({
        id: t.a,
        symbol: symbol,
        price: parseFloat(t.p),
        quantity: parseFloat(t.q),
        value: parseFloat(t.p) * parseFloat(t.q),
        time: t.T,
        isBuyerMaker: t.m,
        type: t.m ? 'SELL' : 'BUY'
      }))
      .filter((t: any) => t.value >= threshold)
      .slice(0, 50);

    return whaleTrades;
  } catch (error) {
    console.error('Error fetching recent trades:', error);
    return [];
  }
}

async function fetchCurrentPrice(symbol: string) {
  try {
    const response = await fetch(
      `https://api.binance.com/api/v3/ticker/price?symbol=${symbol}USDT`
    );
    const data = await response.json();
    return parseFloat(data.price);
  } catch (error) {
    console.error('Error fetching price:', error);
    return 0;
  }
}