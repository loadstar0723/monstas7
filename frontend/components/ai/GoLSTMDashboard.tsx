'use client';

import React from 'react';
import { useGoLSTM } from '@/lib/hooks/useGoLSTM';
import GoEngineStatus from '@/components/GoEngineStatus';

interface GoLSTMDashboardProps {
  symbol: string;
}

export default function GoLSTMDashboard({ symbol = 'BTCUSDT' }: GoLSTMDashboardProps) {
  const {
    prediction,
    isLoading,
    error,
    isConnected,
    performance,
    getTradingSignal,
    getBacktestMetrics,
    refresh,
  } = useGoLSTM({ symbol });

  const signal = getTradingSignal();
  const backtest = getBacktestMetrics();

  return (
    <div className="space-y-6">
      {/* Go 엔진 상태 */}
      <div>
        <h3 className="text-lg font-semibold text-gray-200 mb-3">
          🚀 Go Trading Engine 통합
        </h3>
        <GoEngineStatus />
      </div>

      {/* LSTM 예측 결과 */}
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-6 border border-gray-800">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-blue-400">
            🤖 LSTM AI 예측 (Go 엔진)
          </h3>
          <button
            onClick={refresh}
            disabled={isLoading}
            className="px-3 py-1 bg-blue-900/30 hover:bg-blue-900/50 text-blue-300 rounded text-sm transition-colors disabled:opacity-50"
          >
            {isLoading ? '예측 중...' : '새로고침'}
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-900/30 border border-red-800 rounded">
            <p className="text-red-400 text-sm">⚠️ {error}</p>
          </div>
        )}

        {prediction && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* 예측 정보 */}
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-400 mb-1">예측 방향</p>
                <div className={`text-2xl font-bold ${
                  prediction.direction === 'UP' ? 'text-green-400' :
                  prediction.direction === 'DOWN' ? 'text-red-400' :
                  'text-yellow-400'
                }`}>
                  {prediction.direction === 'UP' ? '📈 상승' :
                   prediction.direction === 'DOWN' ? '📉 하락' :
                   '➡️ 횡보'}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-400 mb-1">현재가</p>
                  <p className="text-lg font-semibold text-gray-200">
                    ${prediction.currentPrice?.toLocaleString() || '0'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">예측가</p>
                  <p className="text-lg font-semibold text-blue-400">
                    ${prediction.predictedPrice?.toLocaleString() || '0'}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-400 mb-1">신뢰도</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-700 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                      style={{ width: `${(prediction.confidence || 0) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-gray-300">
                    {((prediction.confidence || 0) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>

            {/* 기술적 지표 */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-300">기술적 지표</h4>

              {prediction.features && (
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-gray-800/50 rounded p-2">
                    <p className="text-xs text-gray-400">RSI</p>
                    <p className={`font-semibold ${
                      prediction.features.rsi > 70 ? 'text-red-400' :
                      prediction.features.rsi < 30 ? 'text-green-400' :
                      'text-gray-300'
                    }`}>
                      {prediction.features.rsi?.toFixed(1) || '0'}
                    </p>
                  </div>

                  <div className="bg-gray-800/50 rounded p-2">
                    <p className="text-xs text-gray-400">MACD</p>
                    <p className={`font-semibold ${
                      prediction.features.macd > 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {prediction.features.macd?.toFixed(2) || '0'}
                    </p>
                  </div>

                  <div className="bg-gray-800/50 rounded p-2">
                    <p className="text-xs text-gray-400">변동성</p>
                    <p className="font-semibold text-yellow-400">
                      {prediction.features.volatility?.toFixed(1) || '0'}%
                    </p>
                  </div>

                  <div className="bg-gray-800/50 rounded p-2">
                    <p className="text-xs text-gray-400">24h 거래량</p>
                    <p className="font-semibold text-blue-400">
                      {(prediction.features.volume24h / 1000000).toFixed(1)}M
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 거래 신호 */}
        {signal && (
          <div className="mt-6 p-4 bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-lg">
            <h4 className="text-sm font-semibold text-gray-300 mb-3">거래 신호</h4>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className={`text-2xl font-bold ${
                  signal.recommendation === 'STRONG' ? 'text-green-400' :
                  signal.recommendation === 'MODERATE' ? 'text-yellow-400' :
                  'text-gray-400'
                }`}>
                  {signal.recommendation}
                </span>
                <span className="text-sm text-gray-300">
                  신호 강도: {signal.strength.toFixed(1)}%
                </span>
              </div>
              <button className={`px-4 py-2 rounded font-semibold text-sm ${
                signal.action === 'UP' ? 'bg-green-900/50 text-green-300' :
                signal.action === 'DOWN' ? 'bg-red-900/50 text-red-300' :
                'bg-gray-900/50 text-gray-300'
              }`}>
                {signal.action === 'UP' ? '매수' :
                 signal.action === 'DOWN' ? '매도' :
                 '대기'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 성능 메트릭 */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Go 엔진 성능 */}
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-6 border border-gray-800">
          <h3 className="text-lg font-semibold text-green-400 mb-4">
            ⚡ Go 엔진 성능
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-400">레이턴시</span>
              <span className="text-sm font-semibold text-green-400">
                {performance.latency} ms
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-400">예측 신뢰도</span>
              <span className="text-sm font-semibold text-blue-400">
                {performance.confidence.toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-400">연결 상태</span>
              <span className={`text-sm font-semibold ${
                isConnected ? 'text-green-400' : 'text-red-400'
              }`}>
                {isConnected ? '연결됨' : '끊김'}
              </span>
            </div>
          </div>
        </div>

        {/* 백테스트 결과 */}
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-6 border border-gray-800">
          <h3 className="text-lg font-semibold text-purple-400 mb-4">
            📊 백테스트 성과
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-400">승률</span>
              <span className="text-sm font-semibold text-green-400">
                {backtest.winRate}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-400">평균 수익</span>
              <span className="text-sm font-semibold text-green-400">
                +{backtest.avgProfit}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-400">평균 손실</span>
              <span className="text-sm font-semibold text-red-400">
                -{backtest.avgLoss}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-400">샤프 비율</span>
              <span className="text-sm font-semibold text-blue-400">
                {backtest.sharpeRatio}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-400">최대 손실</span>
              <span className="text-sm font-semibold text-yellow-400">
                -{backtest.maxDrawdown}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Go vs Python 비교 */}
      <div className="bg-gradient-to-r from-green-900/20 to-blue-900/20 rounded-lg p-6 border border-green-800/50">
        <h3 className="text-lg font-semibold text-green-400 mb-4">
          🚀 Go 하이브리드 장점
        </h3>
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <p className="text-3xl font-bold text-green-400">10x</p>
            <p className="text-xs text-gray-400 mt-1">처리 속도 향상</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-400">80%</p>
            <p className="text-xs text-gray-400 mt-1">메모리 절감</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-purple-400">1000+</p>
            <p className="text-xs text-gray-400 mt-1">동시 심볼 처리</p>
          </div>
        </div>
      </div>
    </div>
  );
}