// Go Trading Engine API 클라이언트

const GO_ENGINE_URL = process.env.NEXT_PUBLIC_GO_ENGINE_URL || 'http://localhost:8080';

export interface MarketData {
  symbol: string;
  price: number;
  volume: number;
  timestamp: Date;
}

export interface Prediction {
  symbol: string;
  direction: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  target: number;
  stopLoss: number;
  timestamp: Date;
}

export interface PerformanceMetrics {
  processedPerSecond: number;
  activeConnections: number;
  memoryUsageMB: number;
  cpuUsagePercent: number;
  latencyMs: number;
}

class GoTradingEngineAPI {
  private ws: WebSocket | null = null;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private listeners: Map<string, Set<(data: any) => void>> = new Map();

  // WebSocket 연결
  connectWebSocket(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const wsUrl = GO_ENGINE_URL.replace('http', 'ws') + '/ws';
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          console.log('✅ Go Trading Engine WebSocket 연결 성공');
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            this.notifyListeners(data);
          } catch (error) {
            console.error('WebSocket 메시지 파싱 실패:', error);
          }
        };

        this.ws.onerror = (error) => {
          console.error('❌ WebSocket 에러:', error);
          this.scheduleReconnect();
        };

        this.ws.onclose = () => {
          console.log('WebSocket 연결 종료');
          this.scheduleReconnect();
        };

      } catch (error) {
        reject(error);
      }
    });
  }

  // 재연결 스케줄링
  private scheduleReconnect() {
    if (this.reconnectTimeout) return;

    this.reconnectTimeout = setTimeout(() => {
      console.log('🔄 WebSocket 재연결 시도...');
      this.connectWebSocket();
      this.reconnectTimeout = null;
    }, 5000);
  }

  // 리스너 등록
  subscribe(event: string, callback: (data: any) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    // 구독 해제 함수 반환
    return () => {
      const listeners = this.listeners.get(event);
      if (listeners) {
        listeners.delete(callback);
      }
    };
  }

  // 리스너 알림
  private notifyListeners(data: any) {
    const event = data.type || 'data';
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.forEach(callback => callback(data));
    }

    // 'all' 이벤트 리스너에게도 알림
    const allListeners = this.listeners.get('all');
    if (allListeners) {
      allListeners.forEach(callback => callback(data));
    }
  }

  // 시장 데이터 조회
  async getMarketData(symbol: string): Promise<MarketData> {
    const response = await fetch(`${GO_ENGINE_URL}/api/market/${symbol}`);
    if (!response.ok) {
      throw new Error('시장 데이터 조회 실패');
    }
    return response.json();
  }

  // AI 예측 요청
  async getPrediction(symbol: string, model: string = 'lstm'): Promise<Prediction> {
    const response = await fetch(`${GO_ENGINE_URL}/api/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ symbol, model }),
    });

    if (!response.ok) {
      throw new Error('예측 요청 실패');
    }
    return response.json();
  }

  // 성능 메트릭 조회
  async getPerformance(): Promise<PerformanceMetrics> {
    const response = await fetch(`${GO_ENGINE_URL}/api/performance`);
    if (!response.ok) {
      throw new Error('성능 메트릭 조회 실패');
    }

    const data = await response.json();
    return {
      processedPerSecond: data.processed_per_second,
      activeConnections: data.active_connections,
      memoryUsageMB: data.memory_usage_mb,
      cpuUsagePercent: data.cpu_usage_percent,
      latencyMs: data.latency_ms,
    };
  }

  // 헬스 체크
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${GO_ENGINE_URL}/health`);
      return response.ok;
    } catch {
      return false;
    }
  }

  // WebSocket 연결 종료
  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }
}

// 싱글톤 인스턴스
export const goTradingEngine = new GoTradingEngineAPI();