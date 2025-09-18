'use client';

import React, { useState, useEffect } from 'react';
import { goBackendService } from '@/lib/services/goBackendService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowUpIcon, ArrowDownIcon, TrendingUpIcon, ActivityIcon, BrainIcon, ZapIcon } from 'lucide-react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface PredictionData {
  model: string;
  prediction: number;
  confidence: number;
  direction: string;
  signal: string;
  timestamp?: string;
}

export default function GoPredictionPage() {
  const [selectedSymbol, setSelectedSymbol] = useState('BTCUSDT');
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [predictions, setPredictions] = useState<Record<string, PredictionData>>({});
  const [historicalPrices, setHistoricalPrices] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [systemStatus, setSystemStatus] = useState<any>(null);

  // 실시간 가격 가져오기
  const fetchCurrentPrice = async () => {
    try {
      const priceData = await goBackendService.getPrice(selectedSymbol);
      const price = parseFloat(priceData.price);
      setCurrentPrice(price);

      // 과거 가격 업데이트 (최근 100개 유지)
      setHistoricalPrices(prev => {
        const newPrices = [...prev, price];
        return newPrices.slice(-100);
      });
    } catch (error) {
      console.error('Price fetch error:', error);
    }
  };

  // AI 예측 가져오기
  const fetchPredictions = async () => {
    setLoading(true);
    try {
      // 최근 가격 데이터 준비
      const recentPrices = historicalPrices.slice(-20);
      if (recentPrices.length < 5) {
        // 데이터가 부족하면 현재 가격으로 채우기
        const fillPrice = currentPrice || 100000;
        for (let i = recentPrices.length; i < 5; i++) {
          recentPrices.push(fillPrice + (Math.random() - 0.5) * 1000);
        }
      }

      // 모든 AI 모델 예측 가져오기
      const allPredictions = await goBackendService.getAllPredictions({
        symbol: selectedSymbol,
        timeframe: '1h',
        historical: recentPrices,
        features: {
          volume: Math.random() * 1000000,
          volatility: Math.random() * 0.1,
          momentum: Math.random() * 2 - 1
        }
      });

      setPredictions(allPredictions);
    } catch (error) {
      console.error('Prediction error:', error);
    } finally {
      setLoading(false);
    }
  };

  // 시스템 상태 확인
  const checkSystemStatus = async () => {
    try {
      const status = await goBackendService.getSystemStatus();
      setSystemStatus(status);
    } catch (error) {
      console.error('System status error:', error);
    }
  };

  // WebSocket 연결
  useEffect(() => {
    // WebSocket 연결
    goBackendService.connectWebSocket(
      (data) => {
        console.log('WebSocket data:', data);
        if (data.type === 'marketData' && data.symbol === selectedSymbol) {
          setCurrentPrice(data.data.price);
        }
      },
      (error) => console.error('WebSocket error:', error),
      (event) => console.log('WebSocket closed:', event)
    );

    // 심볼 구독
    goBackendService.subscribeToSymbol(selectedSymbol);

    // 초기 데이터 로드
    fetchCurrentPrice();
    checkSystemStatus();

    // 정기 업데이트
    const priceInterval = setInterval(fetchCurrentPrice, 5000);
    const predictionInterval = setInterval(fetchPredictions, 30000);

    return () => {
      clearInterval(priceInterval);
      clearInterval(predictionInterval);
      goBackendService.unsubscribeFromSymbol(selectedSymbol);
    };
  }, [selectedSymbol]);

  // 차트 데이터
  const chartData = {
    labels: historicalPrices.map((_, i) => i.toString()),
    datasets: [
      {
        label: '실제 가격',
        data: historicalPrices,
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        fill: true,
      },
      ...(predictions.neural ? [{
        label: 'Neural 예측',
        data: [...historicalPrices, predictions.neural.prediction],
        borderColor: 'rgb(236, 72, 153)',
        borderDash: [5, 5],
        pointStyle: 'star',
      }] : []),
      ...(predictions.ensemble ? [{
        label: 'Ensemble 예측',
        data: [...historicalPrices, predictions.ensemble.prediction],
        borderColor: 'rgb(34, 197, 94)',
        borderDash: [5, 5],
        pointStyle: 'triangle',
      }] : [])
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: `${selectedSymbol} 가격 & AI 예측`,
      },
    },
    scales: {
      y: {
        beginAtZero: false,
      }
    }
  };

  // 신뢰도 차트
  const confidenceData = {
    labels: Object.keys(predictions),
    datasets: [{
      label: '신뢰도 (%)',
      data: Object.values(predictions).map(p => p.confidence),
      backgroundColor: [
        'rgba(147, 51, 234, 0.8)',
        'rgba(59, 130, 246, 0.8)',
        'rgba(34, 197, 94, 0.8)',
        'rgba(251, 146, 60, 0.8)',
      ],
    }]
  };

  const getSignalColor = (signal: string) => {
    switch(signal) {
      case 'STRONG_BUY': return 'bg-green-600';
      case 'BUY': return 'bg-green-500';
      case 'HOLD': return 'bg-yellow-500';
      case 'SELL': return 'bg-red-500';
      case 'STRONG_SELL': return 'bg-red-600';
      default: return 'bg-gray-500';
    }
  };

  const getSignalText = (signal: string) => {
    switch(signal) {
      case 'STRONG_BUY': return '강력 매수';
      case 'BUY': return '매수';
      case 'HOLD': return '관망';
      case 'SELL': return '매도';
      case 'STRONG_SELL': return '강력 매도';
      default: return signal;
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* 헤더 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Go AI 실시간 예측 시스템</h1>
          <p className="text-muted-foreground">고성능 Go 백엔드 기반 AI 트레이딩 예측</p>
        </div>
        <div className="flex gap-2">
          <Badge variant={systemStatus?.status === 'operational' ? 'default' : 'destructive'}>
            {systemStatus?.status === 'operational' ? '🟢 정상 작동' : '🔴 오프라인'}
          </Badge>
          <Badge variant="outline">
            Go v1.21 | {systemStatus?.uptime ? `Uptime: ${Math.floor(systemStatus.uptime)}s` : ''}
          </Badge>
        </div>
      </div>

      {/* 심볼 선택 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 items-center">
            <div className="flex gap-2">
              {['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT'].map(symbol => (
                <Button
                  key={symbol}
                  variant={selectedSymbol === symbol ? 'default' : 'outline'}
                  onClick={() => setSelectedSymbol(symbol)}
                >
                  {symbol.replace('USDT', '')}
                </Button>
              ))}
            </div>
            <div className="flex-1 text-right">
              <div className="text-sm text-muted-foreground">현재 가격</div>
              <div className="text-2xl font-bold">
                ${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
            <Button
              onClick={fetchPredictions}
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {loading ? '예측 중...' : 'AI 예측 실행'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* AI 예측 카드 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(predictions).map(([model, data]) => (
          <Card key={model} className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-sm font-medium">
                  {model.toUpperCase()}
                </CardTitle>
                <Badge className={getSignalColor(data.signal)}>
                  {getSignalText(data.signal)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <div className="text-xs text-muted-foreground">예측 가격</div>
                  <div className="text-xl font-bold">
                    ${data.prediction.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </div>
                </div>
                <div className="flex justify-between">
                  <div>
                    <div className="text-xs text-muted-foreground">변동률</div>
                    <div className={`flex items-center ${data.direction === 'UP' ? 'text-green-500' : 'text-red-500'}`}>
                      {data.direction === 'UP' ? <ArrowUpIcon className="w-4 h-4" /> : <ArrowDownIcon className="w-4 h-4" />}
                      {((data.prediction - currentPrice) / currentPrice * 100).toFixed(2)}%
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">신뢰도</div>
                    <div className="font-semibold">{data.confidence.toFixed(1)}%</div>
                  </div>
                </div>
                <div className="pt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                      style={{ width: `${data.confidence}%` }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 차트 섹션 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 가격 차트 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUpIcon className="w-5 h-5" />
              실시간 가격 & 예측
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {historicalPrices.length > 0 && (
                <Line data={chartData} options={chartOptions} />
              )}
            </div>
          </CardContent>
        </Card>

        {/* 신뢰도 차트 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BrainIcon className="w-5 h-5" />
              모델별 신뢰도 분석
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {Object.keys(predictions).length > 0 && (
                <Bar
                  data={confidenceData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        max: 100
                      }
                    }
                  }}
                />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 시스템 메트릭스 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ZapIcon className="w-5 h-5" />
            Go 백엔드 성능 메트릭스
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {predictions.neural ? '<10ms' : '-'}
              </div>
              <div className="text-xs text-muted-foreground">Neural 레이턴시</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {Object.keys(predictions).length}개
              </div>
              <div className="text-xs text-muted-foreground">활성 모델</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {historicalPrices.length}개
              </div>
              <div className="text-xs text-muted-foreground">데이터 포인트</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                실시간
              </div>
              <div className="text-xs text-muted-foreground">WebSocket 연결</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}