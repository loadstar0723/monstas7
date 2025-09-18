// Go Backend API Service
// 실제 Go 서버와 통신하는 서비스 레이어

const GO_BACKEND_URL = process.env.NEXT_PUBLIC_GO_BACKEND_URL || 'http://localhost:8092';

export interface AIPredictionRequest {
  symbol: string;
  timeframe?: string;
  historical: number[];
  features?: Record<string, any>;
}

export interface AIPredictionResponse {
  model: string;
  symbol: string;
  prediction: number;
  confidence: number;
  direction: 'UP' | 'DOWN' | 'NEUTRAL';
  signal: 'STRONG_BUY' | 'BUY' | 'HOLD' | 'SELL' | 'STRONG_SELL';
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface MarketDataResponse {
  symbol: string;
  price: number;
  change24h: number;
  volume: number;
  high24h: number;
  low24h: number;
}

export interface PortfolioOptimizationRequest {
  assets: string[];
  capital: number;
  risk_level: 'conservative' | 'moderate' | 'aggressive';
  timeframe?: string;
}

export interface StrategyGenerateRequest {
  symbol: string;
  capital?: number;
  risk_level?: string;
  timeframe?: string;
  indicators?: string[];
  parameters?: Record<string, any>;
}

class GoBackendService {
  private baseUrl: string;
  private wsConnection: WebSocket | null = null;

  constructor() {
    // 프록시를 통해 CORS 문제 해결
    // 클라이언트에서는 프록시 경로 사용, 서버에서는 직접 연결
    this.baseUrl = typeof window !== 'undefined' ? '' : GO_BACKEND_URL;
  }

  // AI Prediction APIs
  async getNeuralPrediction(request: AIPredictionRequest): Promise<AIPredictionResponse> {
    try {
      const url = this.baseUrl ? `${this.baseUrl}/api/v1/ai/neural/predict` : '/api/go-backend/ai/neural/predict';
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`Neural prediction failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Neural prediction error:', error);
      throw error;
    }
  }

  async getLightGBMPrediction(request: AIPredictionRequest): Promise<AIPredictionResponse> {
    try {
      const url = this.baseUrl ? `${this.baseUrl}/api/v1/ai/lightgbm/predict` : '/api/go-backend/ai/lightgbm/predict';
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`LightGBM prediction failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('LightGBM prediction error:', error);
      throw error;
    }
  }

  async getRandomForestPrediction(request: AIPredictionRequest): Promise<AIPredictionResponse> {
    try {
      const url = this.baseUrl ? `${this.baseUrl}/api/v1/ai/randomforest/predict` : '/api/go-backend/ai/randomforest/predict';
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`RandomForest prediction failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('RandomForest prediction error:', error);
      throw error;
    }
  }

  async getEnsemblePrediction(request: AIPredictionRequest): Promise<AIPredictionResponse> {
    try {
      const url = this.baseUrl ? `${this.baseUrl}/api/v1/ai/ensemble/predict` : '/api/go-backend/ai/ensemble/predict';
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`Ensemble prediction failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Ensemble prediction error:', error);
      throw error;
    }
  }

  async recognizePatterns(symbol: string, candles: any[]): Promise<any> {
    try {
      const url = this.baseUrl ? `${this.baseUrl}/api/v1/ai/pattern/recognize` : '/api/go-backend/ai/pattern/recognize';
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ symbol, candles }),
      });

      if (!response.ok) {
        throw new Error(`Pattern recognition failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Pattern recognition error:', error);
      throw error;
    }
  }

  async optimizePortfolio(request: PortfolioOptimizationRequest): Promise<any> {
    try {
      const url = this.baseUrl ? `${this.baseUrl}/api/v1/ai/portfolio/optimize` : '/api/go-backend/ai/portfolio/optimize';
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`Portfolio optimization failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Portfolio optimization error:', error);
      throw error;
    }
  }

  async generateStrategy(request: StrategyGenerateRequest): Promise<any> {
    try {
      const url = this.baseUrl ? `${this.baseUrl}/api/v1/ai/strategy/generate` : '/api/go-backend/ai/strategy/generate';
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`Strategy generation failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Strategy generation error:', error);
      throw error;
    }
  }

  // Market Data APIs
  async getPrice(symbol: string): Promise<any> {
    try {
      const url = this.baseUrl ? `${this.baseUrl}/api/v1/market/price/${symbol}` : `/api/go-backend/market/price/${symbol}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Price fetch failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Price fetch error:', error);
      throw error;
    }
  }

  async getOrderBook(symbol: string, limit: number = 100): Promise<any> {
    try {
      const url = this.baseUrl
        ? `${this.baseUrl}/api/v1/market/orderbook/${symbol}?limit=${limit}`
        : `/api/go-backend/market/orderbook/${symbol}?limit=${limit}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Order book fetch failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Order book fetch error:', error);
      throw error;
    }
  }

  async getTrades(symbol: string, limit: number = 500): Promise<any> {
    try {
      const url = this.baseUrl
        ? `${this.baseUrl}/api/v1/market/trades/${symbol}?limit=${limit}`
        : `/api/go-backend/market/trades/${symbol}?limit=${limit}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Trades fetch failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Trades fetch error:', error);
      throw error;
    }
  }

  async getKlines(symbol: string, interval: string = '1h', limit: number = 100): Promise<any> {
    try {
      const url = this.baseUrl
        ? `${this.baseUrl}/api/v1/market/klines/${symbol}?interval=${interval}&limit=${limit}`
        : `/api/go-backend/market/klines/${symbol}?interval=${interval}&limit=${limit}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Klines fetch failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Klines fetch error:', error);
      throw error;
    }
  }

  async get24hrTicker(symbol?: string): Promise<any> {
    try {
      const url = this.baseUrl
        ? (symbol ? `${this.baseUrl}/api/v1/market/ticker/24hr?symbol=${symbol}` : `${this.baseUrl}/api/v1/market/ticker/24hr`)
        : (symbol ? `/api/go-backend/market/ticker/24hr?symbol=${symbol}` : `/api/go-backend/market/ticker/24hr`);

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`24hr ticker fetch failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('24hr ticker fetch error:', error);
      throw error;
    }
  }

  // System APIs
  system = {
    getStatus: async (): Promise<any> => {
      try {
        const url = this.baseUrl ? `${this.baseUrl}/api/v1/ai/models/status` : '/api/go-backend/ai/models/status';
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`Model status fetch failed: ${response.statusText}`);
        }

        return await response.json();
      } catch (error) {
        console.error('Model status fetch error:', error);
        throw error;
      }
    },
    getHealth: async (): Promise<any> => {
      return this.getHealth();
    },
    getMetrics: async (): Promise<any> => {
      return this.getMetrics();
    },
    getSystemStatus: async (): Promise<any> => {
      return this.getSystemStatus();
    }
  };

  async getHealth(): Promise<any> {
    try {
      const url = this.baseUrl ? `${this.baseUrl}/api/v1/system/health` : '/api/go-backend/system/health';
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Health check failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Health check error:', error);
      throw error;
    }
  }

  async getMetrics(): Promise<any> {
    try {
      const url = this.baseUrl ? `${this.baseUrl}/api/v1/system/metrics` : '/api/go-backend/system/metrics';
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Metrics fetch failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Metrics fetch error:', error);
      throw error;
    }
  }

  async getSystemStatus(): Promise<any> {
    try {
      const url = this.baseUrl ? `${this.baseUrl}/api/v1/system/status` : '/api/go-backend/system/status';
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`System status fetch failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('System status fetch error:', error);
      throw error;
    }
  }

  // WebSocket connection
  connectWebSocket(
    onMessage: (data: any) => void,
    onError?: (error: Event) => void,
    onClose?: (event: CloseEvent) => void
  ): void {
    const wsUrl = this.baseUrl.replace('http', 'ws') + '/api/v1/ws/stream';

    try {
      this.wsConnection = new WebSocket(wsUrl);

      this.wsConnection.onopen = () => {
        console.log('Go backend WebSocket connected');
      };

      this.wsConnection.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          onMessage(data);
        } catch (error) {
          console.error('WebSocket message parse error:', error);
        }
      };

      this.wsConnection.onerror = (error) => {
        console.error('WebSocket error:', error);
        if (onError) onError(error);
      };

      this.wsConnection.onclose = (event) => {
        console.log('WebSocket closed');
        if (onClose) onClose(event);

        // Auto-reconnect after 3 seconds
        setTimeout(() => {
          console.log('Attempting to reconnect WebSocket...');
          this.connectWebSocket(onMessage, onError, onClose);
        }, 3000);
      };
    } catch (error) {
      console.error('WebSocket connection error:', error);
    }
  }

  subscribeToSymbol(symbol: string): void {
    if (this.wsConnection && this.wsConnection.readyState === WebSocket.OPEN) {
      this.wsConnection.send(JSON.stringify({
        type: 'subscribe',
        symbol: symbol
      }));
    }
  }

  unsubscribeFromSymbol(symbol: string): void {
    if (this.wsConnection && this.wsConnection.readyState === WebSocket.OPEN) {
      this.wsConnection.send(JSON.stringify({
        type: 'unsubscribe',
        symbol: symbol
      }));
    }
  }

  disconnectWebSocket(): void {
    if (this.wsConnection) {
      this.wsConnection.close();
      this.wsConnection = null;
    }
  }

  // Helper method to get all AI predictions at once
  async getAllPredictions(request: AIPredictionRequest): Promise<{
    neural?: AIPredictionResponse;
    lightgbm?: AIPredictionResponse;
    randomforest?: AIPredictionResponse;
    ensemble?: AIPredictionResponse;
  }> {
    const results: any = {};

    // Run all predictions in parallel
    const promises = [
      this.getNeuralPrediction(request).then(r => results.neural = r).catch(e => console.error('Neural failed:', e)),
      this.getLightGBMPrediction(request).then(r => results.lightgbm = r).catch(e => console.error('LightGBM failed:', e)),
      this.getRandomForestPrediction(request).then(r => results.randomforest = r).catch(e => console.error('RandomForest failed:', e)),
      this.getEnsemblePrediction(request).then(r => results.ensemble = r).catch(e => console.error('Ensemble failed:', e)),
    ];

    await Promise.allSettled(promises);

    return results;
  }
}

// Export singleton instance
export const goBackendService = new GoBackendService();

// Export types
export type { GoBackendService };