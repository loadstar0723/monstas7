import { useEffect, useState, useCallback } from 'react';
import { goTradingEngine, Prediction } from '@/lib/api/goTradingEngine';

interface LSTMPrediction extends Prediction {
  features?: {
    rsi: number;
    macd: number;
    bollingerUpper: number;
    bollingerLower: number;
    volume24h: number;
    volatility: number;
  };
}

interface UseGoLSTMOptions {
  symbol: string;
  autoPredict?: boolean;
  interval?: number; // 예측 간격 (ms)
}

export function useGoLSTM({ symbol, autoPredict = true, interval = 5000 }: UseGoLSTMOptions) {
  const [prediction, setPrediction] = useState<LSTMPrediction | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [performance, setPerformance] = useState({
    latency: 0,
    confidence: 0,
    accuracy: 0,
  });

  // 예측 요청
  const getPrediction = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const startTime = Date.now();

    try {
      const result = await goTradingEngine.getPrediction(symbol, 'lstm');

      const latency = Date.now() - startTime;

      setPrediction(result as LSTMPrediction);
      setPerformance(prev => ({
        ...prev,
        latency,
        confidence: result.confidence * 100,
      }));

      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : '예측 실패');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [symbol]);

  // WebSocket 연결 및 실시간 예측
  useEffect(() => {
    if (!autoPredict) return;

    let intervalId: NodeJS.Timeout;

    const connectAndSubscribe = async () => {
      try {
        // WebSocket 연결
        await goTradingEngine.connectWebSocket();
        setIsConnected(true);

        // 예측 구독
        const unsubscribe = goTradingEngine.subscribe('prediction', (data: any) => {
          if (data.symbol === symbol) {
            setPrediction(data);
            setPerformance(prev => ({
              ...prev,
              confidence: data.confidence * 100,
            }));
          }
        });

        // 주기적 예측 요청
        intervalId = setInterval(() => {
          getPrediction();
        }, interval);

        return () => {
          unsubscribe();
          clearInterval(intervalId);
        };
      } catch (err) {
        console.error('Go Engine 연결 실패:', err);
        setIsConnected(false);
        setError('엔진 연결 실패');
      }
    };

    connectAndSubscribe();

    return () => {
      if (intervalId) clearInterval(intervalId);
      goTradingEngine.disconnect();
    };
  }, [symbol, autoPredict, interval, getPrediction]);

  // 거래 신호 생성
  const getTradingSignal = useCallback(() => {
    if (!prediction) return null;

    const { direction, confidence, features } = prediction;

    // 종합 신호 강도 계산
    let signalStrength = confidence;

    if (features) {
      // RSI 신호
      if (features.rsi > 70) signalStrength *= 0.8; // 과매수
      else if (features.rsi < 30) signalStrength *= 1.2; // 과매도

      // 변동성 조정
      if (features.volatility > 5) signalStrength *= 0.9;

      // MACD 신호
      if (Math.abs(features.macd) > 100) signalStrength *= 1.1;
    }

    return {
      action: direction,
      strength: Math.min(signalStrength * 100, 100),
      recommendation: signalStrength > 0.7 ? 'STRONG' : signalStrength > 0.5 ? 'MODERATE' : 'WEAK',
    };
  }, [prediction]);

  // 백테스트 결과
  const getBacktestMetrics = useCallback(() => {
    // TODO: 실제 백테스트 결과는 Go 엔진에서 계산
    return {
      winRate: 65.3,
      avgProfit: 2.4,
      avgLoss: 1.2,
      sharpeRatio: 1.8,
      maxDrawdown: 12.5,
    };
  }, []);

  return {
    // 상태
    prediction,
    isLoading,
    error,
    isConnected,
    performance,

    // 액션
    getPrediction,
    getTradingSignal,
    getBacktestMetrics,

    // 헬퍼
    refresh: getPrediction,
  };
}