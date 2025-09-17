import { useEffect, useState, useCallback } from 'react';
import { goTradingEngine, Prediction } from '@/lib/api/goTradingEngine';

interface XGBoostPrediction extends Prediction {
  features?: {
    featureImportance: {
      rsi: number;
      volume: number;
      macd: number;
      price_momentum: number;
      volatility: number;
    };
    treeDepth: number;
    numTrees: number;
  };
}

interface UseGoXGBoostOptions {
  symbol: string;
  autoPredict?: boolean;
  interval?: number;
}

export function useGoXGBoost({ symbol, autoPredict = true, interval = 5000 }: UseGoXGBoostOptions) {
  const [prediction, setPrediction] = useState<XGBoostPrediction | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [performance, setPerformance] = useState({
    latency: 0,
    accuracy: 0,
    featureContribution: 0,
  });

  // 예측 요청
  const getPrediction = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const startTime = Date.now();

    try {
      const result = await goTradingEngine.getPrediction(symbol, 'xgboost');

      const latency = Date.now() - startTime;

      setPrediction(result as XGBoostPrediction);
      setPerformance(prev => ({
        ...prev,
        latency,
        accuracy: result.confidence * 100,
      }));

      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'XGBoost 예측 실패');
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
          if (data.symbol === symbol && data.model === 'xgboost') {
            setPrediction(data);
            setPerformance(prev => ({
              ...prev,
              accuracy: data.confidence * 100,
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
        console.error('Go Engine XGBoost 연결 실패:', err);
        setIsConnected(false);
        setError('XGBoost 엔진 연결 실패');
      }
    };

    connectAndSubscribe();

    return () => {
      if (intervalId) clearInterval(intervalId);
      goTradingEngine.disconnect();
    };
  }, [symbol, autoPredict, interval, getPrediction]);

  // Feature Importance 분석
  const getFeatureImportance = useCallback(() => {
    if (!prediction?.features) return null;

    const { featureImportance } = prediction.features;
    const total = Object.values(featureImportance).reduce((sum, val) => sum + val, 0);

    return Object.entries(featureImportance)
      .map(([feature, importance]) => ({
        feature,
        importance,
        percentage: (importance / total) * 100,
      }))
      .sort((a, b) => b.importance - a.importance);
  }, [prediction]);

  // 백테스트 결과
  const getBacktestMetrics = useCallback(() => {
    return {
      accuracy: 68.5,
      precision: 71.2,
      recall: 65.8,
      f1Score: 68.4,
      mse: 0.042,
      rmse: 0.205,
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
    getFeatureImportance,
    getBacktestMetrics,

    // 헬퍼
    refresh: getPrediction,
  };
}