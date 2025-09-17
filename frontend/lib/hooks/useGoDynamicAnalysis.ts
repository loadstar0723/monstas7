import { useState, useEffect, useCallback } from 'react';
import { goTradingEngine } from '@/lib/api/goTradingEngine';

interface AnalysisInsight {
  title: string;
  description: string;
  severity: 'info' | 'success' | 'warning' | 'error';
  recommendation: string;
  confidence?: number;
  metrics?: {
    [key: string]: number;
  };
}

interface MarketAnalysis {
  trend: 'UP' | 'DOWN' | 'NEUTRAL';
  strength: number;
  volatility: number;
  support: number;
  resistance: number;
  rsi: number;
  macd: number;
}

interface UseGoDynamicAnalysisOptions {
  symbol: string;
  type: 'architecture' | 'performance' | 'backtesting' | 'realtime';
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function useGoDynamicAnalysis({
  symbol,
  type,
  autoRefresh = true,
  refreshInterval = 5000
}: UseGoDynamicAnalysisOptions) {
  const [insights, setInsights] = useState<AnalysisInsight[]>([]);
  const [marketAnalysis, setMarketAnalysis] = useState<MarketAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 분석 데이터 가져오기
  const fetchAnalysis = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Go 엔진에서 동적 분석 데이터 가져오기
      const response = await fetch(`http://localhost:8080/api/analysis/${type}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          symbol,
          type,
        }),
      });

      if (!response.ok) {
        throw new Error('분석 데이터 가져오기 실패');
      }

      const data = await response.json();

      // 인사이트 생성
      const newInsights: AnalysisInsight[] = [];

      if (type === 'architecture') {
        // LSTM 아키텍처 분석
        newInsights.push({
          title: "게이트 활성화 패턴",
          description: `Forget Gate ${data.gates?.forget || 78}% 활성화 - 이전 정보 선택적 유지`,
          severity: data.gates?.forget > 70 ? 'success' : 'warning',
          recommendation: "단기 변동성 높은 시장에서 효과적",
          confidence: data.confidence,
          metrics: data.gates
        });

        newInsights.push({
          title: "메모리 셀 사용률",
          description: `메모리 사용률 ${data.memory?.usage || 65}% - ${data.memory?.usage > 80 ? '포화 상태' : '최적 범위'}`,
          severity: data.memory?.usage > 80 ? 'warning' : 'success',
          recommendation: data.memory?.usage > 80 ? '메모리 정리 필요' : '현재 설정 유지',
          confidence: data.confidence
        });
      } else if (type === 'performance') {
        // 성능 분석
        const accuracy = data.metrics?.accuracy || 0;
        const trend = accuracy > 85 ? '상승' : accuracy > 75 ? '유지' : '하락';

        newInsights.push({
          title: "예측 정확도 추세",
          description: `최근 24시간 정확도 ${accuracy.toFixed(1)}% (${trend} 추세)`,
          severity: accuracy > 80 ? 'success' : accuracy > 70 ? 'info' : 'warning',
          recommendation: accuracy > 80 ? '모델 성능 우수' : '파라미터 조정 고려',
          confidence: data.confidence,
          metrics: { accuracy }
        });

        const drawdown = data.metrics?.maxDrawdown || 0;
        newInsights.push({
          title: "리스크 지표",
          description: `최대 낙폭 ${drawdown.toFixed(1)}%`,
          severity: Math.abs(drawdown) > 10 ? 'error' : Math.abs(drawdown) > 5 ? 'warning' : 'success',
          recommendation: Math.abs(drawdown) > 10 ? '포지션 축소 권장' : '리스크 관리 양호',
          metrics: { drawdown }
        });
      } else if (type === 'backtesting') {
        // 백테스팅 분석
        const winRate = data.metrics?.winRate || 0;
        const sharpeRatio = data.metrics?.sharpeRatio || 0;

        newInsights.push({
          title: "백테스트 승률",
          description: `전체 승률 ${winRate.toFixed(1)}%`,
          severity: winRate > 60 ? 'success' : winRate > 50 ? 'info' : 'warning',
          recommendation: winRate > 60 ? '전략 신뢰도 높음' : '전략 개선 필요',
          metrics: { winRate }
        });

        newInsights.push({
          title: "샤프 비율",
          description: `위험 조정 수익률 ${sharpeRatio.toFixed(2)}`,
          severity: sharpeRatio > 2 ? 'success' : sharpeRatio > 1 ? 'info' : 'warning',
          recommendation: sharpeRatio > 2 ? '우수한 위험/수익 비율' : '리스크 관리 강화 필요',
          metrics: { sharpeRatio }
        });
      } else if (type === 'realtime') {
        // 실시간 분석
        const signal = data.signal || { action: 'NEUTRAL', strength: 0 };

        newInsights.push({
          title: "실시간 거래 신호",
          description: `${signal.action} 신호 - 강도 ${signal.strength.toFixed(1)}%`,
          severity: signal.strength > 70 ? 'success' : signal.strength > 40 ? 'info' : 'warning',
          recommendation: signal.strength > 70 ? '신호 따라 거래 고려' : '관망 권장',
          confidence: signal.strength,
          metrics: { signalStrength: signal.strength }
        });

        const volatility = data.volatility || 0;
        newInsights.push({
          title: "시장 변동성",
          description: `현재 변동성 ${volatility.toFixed(2)}%`,
          severity: volatility > 3 ? 'warning' : volatility > 1.5 ? 'info' : 'success',
          recommendation: volatility > 3 ? '포지션 축소, 손절 타이트하게' : '정상 거래 가능',
          metrics: { volatility }
        });
      }

      setInsights(newInsights);

      // 시장 분석 업데이트
      if (data.market) {
        setMarketAnalysis({
          trend: data.market.trend || 'NEUTRAL',
          strength: data.market.strength || 50,
          volatility: data.market.volatility || 1.5,
          support: data.market.support || 0,
          resistance: data.market.resistance || 0,
          rsi: data.market.rsi || 50,
          macd: data.market.macd || 0,
        });
      }

      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : '분석 실패');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [symbol, type]);

  // 자동 새로고침
  useEffect(() => {
    if (autoRefresh) {
      fetchAnalysis();
      const interval = setInterval(fetchAnalysis, refreshInterval);
      return () => clearInterval(interval);
    } else {
      fetchAnalysis();
    }
  }, [symbol, type, autoRefresh, refreshInterval, fetchAnalysis]);

  // 긴급 알림 확인
  const getUrgentAlerts = useCallback(() => {
    return insights.filter(i => i.severity === 'error' || i.severity === 'warning');
  }, [insights]);

  // 추천 액션 가져오기
  const getRecommendedActions = useCallback(() => {
    return insights
      .filter(i => i.recommendation)
      .map(i => ({
        title: i.title,
        action: i.recommendation,
        priority: i.severity === 'error' ? 'high' : i.severity === 'warning' ? 'medium' : 'low',
      }));
  }, [insights]);

  return {
    // 상태
    insights,
    marketAnalysis,
    isLoading,
    error,

    // 액션
    fetchAnalysis,
    getUrgentAlerts,
    getRecommendedActions,

    // 헬퍼
    hasInsights: insights.length > 0,
    urgentCount: getUrgentAlerts().length,
  };
}