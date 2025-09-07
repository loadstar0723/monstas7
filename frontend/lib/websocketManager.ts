// WebSocket 연결 관리를 위한 싱글톤 클래스
export interface CryptoPrice {
  symbol: string;
  price: number;
  change24h: number;
  volume24h: number;
  lastUpdate: number;
}

// Named export 추가
export { CryptoPrice as CryptoPriceType }

interface BinanceStreamData {
  s: string;  // Symbol
  c: string;  // Current price
  P: string;  // Price change percent
  v: string;  // Volume
}

const SYMBOLS = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'XRPUSDT', 'ADAUSDT', 'DOGEUSDT', 'AVAXUSDT'];

class WebSocketManager {
  private static instance: WebSocketManager;
  private ws: WebSocket | null = null;
  private prices: Map<string, CryptoPrice> = new Map();
  private isConnected: boolean = false;
  private error: string | null = null;
  private listeners: Set<(data: { prices: CryptoPrice[], isConnected: boolean, error: string | null }) => void> = new Set();
  private reconnectTimer: NodeJS.Timeout | null = null;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;

  private constructor() {
    // 브라우저 환경에서만 연결 초기화
    if (typeof window !== 'undefined') {
      this.initializeConnection();
    }
  }

  static getInstance(): WebSocketManager {
    if (!WebSocketManager.instance) {
      WebSocketManager.instance = new WebSocketManager();
    }
    return WebSocketManager.instance;
  }

  private async fetchInitialPrices() {
    try {
      const responses = await Promise.all(
        SYMBOLS.map(symbol =>
          fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`)
            .then(res => res.json())
        )
      );

      responses.forEach((data) => {
        const displaySymbol = data.symbol.replace('USDT', '');
        this.prices.set(displaySymbol, {
          symbol: displaySymbol,
          price: parseFloat(data.lastPrice),
          change24h: parseFloat(data.priceChangePercent),
          volume24h: parseFloat(data.volume),
          lastUpdate: Date.now()
        });
      });

      this.notifyListeners();
    } catch (err) {
      console.error('Failed to fetch initial prices:', err);
      this.error = 'Failed to load prices';
      this.notifyListeners();
    }
  }

  private initializeConnection() {
    // 브라우저 환경 체크
    if (typeof window === 'undefined') {
      return;
    }

    // 초기 가격 로드
    this.fetchInitialPrices();

    // WebSocket 연결
    const streams = SYMBOLS.map(s => `${s.toLowerCase()}@ticker`).join('/');
    try {
      this.ws = new WebSocket(`wss://stream.binance.com:9443/ws/${streams}`);

    this.ws.onopen = () => {
      console.log('Binance WebSocket connected');
      this.isConnected = true;
      this.error = null;
      this.reconnectAttempts = 0;
      this.notifyListeners();
    };

    this.ws.onmessage = (event) => {
      try {
        const data: BinanceStreamData = JSON.parse(event.data);
        const symbol = data.s.replace('USDT', '');
        
        this.prices.set(symbol, {
          symbol,
          price: parseFloat(data.c),
          change24h: parseFloat(data.P),
          volume24h: parseFloat(data.v),
          lastUpdate: Date.now()
        });
        
        this.notifyListeners();
      } catch (err) {
        console.error('Failed to parse WebSocket message:', err);
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.error = 'Connection error';
      this.isConnected = false;
      this.notifyListeners();
    };

    this.ws.onclose = () => {
      console.log('WebSocket disconnected');
      this.isConnected = false;
      this.notifyListeners();
      this.attemptReconnect();
    };
    } catch (err) {
      console.error('Failed to create WebSocket:', err);
      this.error = 'Failed to establish connection';
      this.notifyListeners();
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.error = 'Max reconnection attempts reached';
      this.notifyListeners();
      return;
    }

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    this.reconnectAttempts++;

    this.reconnectTimer = setTimeout(() => {
      console.log(`Attempting to reconnect... (attempt ${this.reconnectAttempts})`);
      this.initializeConnection();
    }, delay);
  }

  private notifyListeners() {
    const data = {
      prices: Array.from(this.prices.values()),
      isConnected: this.isConnected,
      error: this.error
    };
    this.listeners.forEach(listener => listener(data));
  }

  public subscribe(listener: (data: { prices: CryptoPrice[], isConnected: boolean, error: string | null }) => void) {
    this.listeners.add(listener);
    // 즉시 현재 데이터 전송
    listener({
      prices: Array.from(this.prices.values()),
      isConnected: this.isConnected,
      error: this.error
    });
  }

  public unsubscribe(listener: (data: { prices: CryptoPrice[], isConnected: boolean, error: string | null }) => void) {
    this.listeners.delete(listener);
  }

  public disconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.close();
    }
    this.ws = null;
  }
}

export default WebSocketManager;