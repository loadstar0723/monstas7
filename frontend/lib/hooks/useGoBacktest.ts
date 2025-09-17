import { useState, useEffect, useCallback } from 'react';
import { goTradingEngine } from '@/lib/api/goTradingEngine';

interface BacktestResult {
  date: string;
  actual: number;
  predicted: number;
  profit: number;
  cumProfit: number;
  drawdown: number;
  signal: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
}

interface BacktestMetrics {
  totalTrades: number;
  winRate: number;
  totalReturn: number;
  maxDrawdown: number;
  sharpeRatio: number;
  avgProfit: number;
  avgLoss: number;
  profitFactor: number;
}

interface UseGoBacktestOptions {
  symbol: string;
  startDate: Date;
  endDate: Date;
  model?: string;
}

export function useGoBacktest({ symbol, startDate, endDate, model = 'lstm' }: UseGoBacktestOptions) {
  const [results, setResults] = useState<BacktestResult[]>([]);
  const [metrics, setMetrics] = useState<BacktestMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runBacktest = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Go 엔진에 백테스트 요청
      const response = await fetch(`http://localhost:8080/api/backtest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          symbol,
          model,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('백테스트 실행 실패');
      }

      const data = await response.json();

      // 결과 처리
      const backtestResults: BacktestResult[] = data.results.map((r: any) => ({
        date: r.timestamp,
        actual: r.actualPrice,
        predicted: r.predictedPrice,
        profit: r.profit,
        cumProfit: r.cumulativeProfit,
        drawdown: r.drawdown,
        signal: r.signal,
        confidence: r.confidence,
      }));

      setResults(backtestResults);

      // 메트릭스 설정
      setMetrics({
        totalTrades: data.metrics.totalTrades,
        winRate: data.metrics.winRate,
        totalReturn: data.metrics.totalReturn,
        maxDrawdown: data.metrics.maxDrawdown,
        sharpeRatio: data.metrics.sharpeRatio,
        avgProfit: data.metrics.avgProfit,
        avgLoss: data.metrics.avgLoss,
        profitFactor: data.metrics.profitFactor,
      });

      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : '백테스트 실패');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [symbol, model, startDate, endDate]);

  // 시장 상황별 분석
  const analyzeByMarketCondition = useCallback(() => {
    if (!results.length) return null;

    // 시장 상황 판단 로직
    const bullPeriods = results.filter(r => {
      const idx = results.indexOf(r);
      if (idx < 20) return false;
      const avg20 = results.slice(idx - 20, idx).reduce((sum, r) => sum + r.actual, 0) / 20;
      return r.actual > avg20 * 1.05;
    });

    const bearPeriods = results.filter(r => {
      const idx = results.indexOf(r);
      if (idx < 20) return false;
      const avg20 = results.slice(idx - 20, idx).reduce((sum, r) => sum + r.actual, 0) / 20;
      return r.actual < avg20 * 0.95;
    });

    const sidewaysPeriods = results.length - bullPeriods.length - bearPeriods.length;

    return {
      bull: {
        count: bullPeriods.length,
        winRate: bullPeriods.filter(r => r.profit > 0).length / bullPeriods.length * 100,
        avgProfit: bullPeriods.reduce((sum, r) => sum + r.profit, 0) / bullPeriods.length,
      },
      bear: {
        count: bearPeriods.length,
        winRate: bearPeriods.filter(r => r.profit > 0).length / bearPeriods.length * 100,
        avgProfit: bearPeriods.reduce((sum, r) => sum + r.profit, 0) / bearPeriods.length,
      },
      sideways: {
        count: sidewaysPeriods,
        winRate: 65, // 계산 필요
        avgProfit: 0, // 계산 필요
      }
    };
  }, [results]);

  return {
    // 상태
    results,
    metrics,
    isLoading,
    error,

    // 액션
    runBacktest,
    analyzeByMarketCondition,

    // 헬퍼
    hasResults: results.length > 0,
  };
}