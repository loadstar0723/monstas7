'use client'

import { useState, useEffect } from 'react'
import { safeFixed, safePrice, safeAmount, safePercent, safeMillion, safeThousand } from '@/lib/safeFormat'
import type { BotConfig } from '../ArbitrageBotModule'

interface StatisticalArbitrageProps {
  selectedCoin: {
    symbol: string
    name: string
    color: string
    bgColor: string
  }
  botConfig: BotConfig
}

interface StatSignal {
  id: string
  type: 'bollinger' | 'rsi' | 'mean-reversion' | 'correlation'
  strength: number
  direction: 'buy' | 'sell'
  price: number
  targetPrice: number
  stopLoss: number
  confidence: number
  timeframe: string
}

export default function StatisticalArbitrage({ selectedCoin, botConfig }: StatisticalArbitrageProps) {
  const [signals, setSignals] = useState<StatSignal[]>([])
  const [indicators, setIndicators] = useState({
    rsi: 50,
    bollingerUpper: 0,
    bollingerLower: 0,
    bollingerMiddle: 0,
    sma20: 0,
    sma50: 0,
    correlation: 0,
    zscore: 0
  })
  const [backtestResults, setBacktestResults] = useState({
    winRate: 0,
    avgProfit: 0,
    maxDrawdown: 0,
    sharpeRatio: 0
  })
  
  useEffect(() => {
    // 통계적 지표 API에서 수신
    const fetchIndicators = async () => {
      try {
        const response = await fetch(`/api/technical-indicators?symbol=${selectedCoin.symbol}`)
        
        if (response.ok) {
          const data = await response.json()
          
          // API 데이터가 있으면 사용
          if (data) {
            setIndicators({
              rsi: data.rsi || 50,
              bollingerUpper: data.bollingerUpper || 0,
              bollingerLower: data.bollingerLower || 0,
              bollingerMiddle: data.bollingerMiddle || 0,
              sma20: data.sma20 || 0,
              sma50: data.sma50 || 0,
              correlation: data.correlation || 0,
              zscore: data.zscore || 0
            })
            
            // 백테스트 결과도 API에서 가져오기
            if (data.backtestResults) {
              setBacktestResults({
                winRate: data.backtestResults.winRate || 0,
                avgProfit: data.backtestResults.avgProfit || 0,
                maxDrawdown: data.backtestResults.maxDrawdown || 0,
                sharpeRatio: data.backtestResults.sharpeRatio || 0
              })
            }
          }
        } else {
          // API 실패 시 기본값 설정
          setIndicators({
            rsi: 50,
            bollingerUpper: 0,
            bollingerLower: 0,
            bollingerMiddle: 0,
            sma20: 0,
            sma50: 0,
            correlation: 0,
            zscore: 0
          })
        }
      } catch (error) {
        console.error('통계적 지표 데이터 조회 실패:', error)
        // 에러 시 기본값 설정
        setIndicators({
          rsi: 50,
          bollingerUpper: 0,
          bollingerLower: 0,
          bollingerMiddle: 0,
          sma20: 0,
          sma50: 0,
          correlation: 0,
          zscore: 0
        })
      }
    }
    
    fetchIndicators()
    const interval = setInterval(fetchIndicators, 30000) // 30초마다 업데이트
    
    return () => clearInterval(interval)
  }, [selectedCoin])
  
  useEffect(() => {
    // 시그널 생성
    const generateSignals = () => {
      const basePrice = selectedCoin.symbol === 'BTC' ? 98000 : 3500
      const newSignals: StatSignal[] = []
      
      // RSI 시그널
      if (indicators.rsi < 30) {
        newSignals.push({
          id: 'rsi-oversold',
          type: 'rsi',
          strength: (30 - indicators.rsi) / 30 * 100,
          direction: 'buy',
          price: basePrice,
          targetPrice: basePrice * 1.01,
          stopLoss: basePrice * 0.99,
          confidence: 70 + (30 - indicators.rsi),
          timeframe: '15m'
        })
      } else if (indicators.rsi > 70) {
        newSignals.push({
          id: 'rsi-overbought',
          type: 'rsi',
          strength: (indicators.rsi - 70) / 30 * 100,
          direction: 'sell',
          price: basePrice,
          targetPrice: basePrice * 0.99,
          stopLoss: basePrice * 1.01,
          confidence: 70 + (indicators.rsi - 70),
          timeframe: '15m'
        })
      }
      
      // 볼린저 밴드 시그널
      if (basePrice < indicators.bollingerLower) {
        newSignals.push({
          id: 'bollinger-lower',
          type: 'bollinger',
          strength: ((indicators.bollingerLower - basePrice) / indicators.bollingerLower) * 100,
          direction: 'buy',
          price: basePrice,
          targetPrice: indicators.bollingerMiddle,
          stopLoss: basePrice * 0.98,
          confidence: 75,
          timeframe: '1h'
        })
      } else if (basePrice > indicators.bollingerUpper) {
        newSignals.push({
          id: 'bollinger-upper',
          type: 'bollinger',
          strength: ((basePrice - indicators.bollingerUpper) / indicators.bollingerUpper) * 100,
          direction: 'sell',
          price: basePrice,
          targetPrice: indicators.bollingerMiddle,
          stopLoss: basePrice * 1.02,
          confidence: 75,
          timeframe: '1h'
        })
      }
      
      // Z-Score 평균 회귀
      if (Math.abs(indicators.zscore) > 2) {
        newSignals.push({
          id: 'mean-reversion',
          type: 'mean-reversion',
          strength: Math.min(Math.abs(indicators.zscore) * 25, 100),
          direction: indicators.zscore > 0 ? 'sell' : 'buy',
          price: basePrice,
          targetPrice: indicators.bollingerMiddle,
          stopLoss: basePrice * (indicators.zscore > 0 ? 1.02 : 0.98),
          confidence: 80,
          timeframe: '4h'
        })
      }
      
      setSignals(newSignals)
    }
    
    generateSignals()
  }, [indicators, selectedCoin])
  
  return (
    <div className="space-y-6">
      {/* 통계적 지표 대시보드 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
          <div className="text-xs text-gray-400 mb-1">RSI (14)</div>
          <div className={`text-2xl font-bold ${
            indicators.rsi < 30 ? 'text-green-400' :
            indicators.rsi > 70 ? 'text-red-400' :
            'text-yellow-400'
          }`}>
            {safeFixed(indicators.rsi, 1)}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {indicators.rsi < 30 ? '과매도' :
             indicators.rsi > 70 ? '과매수' :
             '중립'}
          </div>
        </div>
        
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
          <div className="text-xs text-gray-400 mb-1">Z-Score</div>
          <div className={`text-2xl font-bold ${
            Math.abs(indicators.zscore) > 2 ? 'text-red-400' :
            Math.abs(indicators.zscore) > 1 ? 'text-yellow-400' :
            'text-green-400'
          }`}>
            {safeFixed(indicators.zscore, 2)}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {Math.abs(indicators.zscore) > 2 ? '극단적' :
             Math.abs(indicators.zscore) > 1 ? '주의' :
             '정상'}
          </div>
        </div>
        
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
          <div className="text-xs text-gray-400 mb-1">상관계수</div>
          <div className="text-2xl font-bold text-blue-400">
            {safeFixed(indicators.correlation, 3)}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            BTC 상관성
          </div>
        </div>
        
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
          <div className="text-xs text-gray-400 mb-1">Sharpe Ratio</div>
          <div className="text-2xl font-bold text-purple-400">
            {safeFixed(backtestResults.sharpeRatio, 2)}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            위험조정수익률
          </div>
        </div>
      </div>
      
      {/* 볼린저 밴드 시각화 */}
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
        <h4 className="font-semibold text-gray-300 mb-4">볼린저 밴드 & 가격 위치</h4>
        
        <div className="relative h-32 bg-gray-900/50 rounded-lg p-4">
          <div className="absolute inset-x-4 top-4 h-px bg-red-500/50" style={{top: '20%'}}>
            <span className="absolute -top-5 left-0 text-xs text-red-400">
              Upper: ${safeFixed(indicators.bollingerUpper, 0)}
            </span>
          </div>
          <div className="absolute inset-x-4 top-1/2 h-px bg-yellow-500/50">
            <span className="absolute -top-5 left-0 text-xs text-yellow-400">
              Middle: ${safeFixed(indicators.bollingerMiddle, 0)}
            </span>
          </div>
          <div className="absolute inset-x-4 bottom-4 h-px bg-green-500/50" style={{bottom: '20%'}}>
            <span className="absolute -bottom-5 left-0 text-xs text-green-400">
              Lower: ${safeFixed(indicators.bollingerLower, 0)}
            </span>
          </div>
          
          {/* 현재 가격 포인트 */}
          <div 
            className="absolute w-4 h-4 bg-white rounded-full"
            style={{
              left: '50%',
              top: `${50 + (indicators.bollingerMiddle - (selectedCoin.symbol === 'BTC' ? 98000 : 3500)) / indicators.bollingerMiddle * 30}%`,
              transform: 'translateX(-50%)'
            }}
          >
            <span className="absolute -right-20 text-xs text-white whitespace-nowrap">
              현재: ${selectedCoin.symbol === 'BTC' ? '98,000' : '3,500'}
            </span>
          </div>
        </div>
      </div>
      
      {/* 통계적 시그널 */}
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
        <h4 className="font-semibold text-gray-300 mb-4">통계적 차익거래 시그널</h4>
        
        {signals.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            현재 유효한 통계적 시그널이 없습니다
          </div>
        ) : (
          <div className="space-y-3">
            {signals.map(signal => (
              <div
                key={signal.id}
                className={`p-4 rounded-lg border ${
                  signal.direction === 'buy'
                    ? 'bg-green-900/20 border-green-500/30'
                    : 'bg-red-900/20 border-red-500/30'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`text-lg font-bold ${
                        signal.direction === 'buy' ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {signal.direction === 'buy' ? '매수' : '매도'} 시그널
                      </span>
                      <span className="text-xs px-2 py-1 bg-gray-700 text-gray-300 rounded">
                        {signal.type === 'rsi' ? 'RSI' :
                         signal.type === 'bollinger' ? '볼린저밴드' :
                         signal.type === 'mean-reversion' ? '평균회귀' :
                         '상관관계'}
                      </span>
                      <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded">
                        {signal.timeframe}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
                      <div>
                        <span className="text-gray-500">진입가</span>
                        <div className="font-mono text-white">
                          ${safePrice(signal.price, 0)}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500">목표가</span>
                        <div className="font-mono text-green-400">
                          ${safeFixed(signal.targetPrice, 0)}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500">손절가</span>
                        <div className="font-mono text-red-400">
                          ${safeFixed(signal.stopLoss, 0)}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500">신호강도</span>
                        <div className="font-mono text-yellow-400">
                          {safeFixed(signal.strength, 0)}%
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500">신뢰도</span>
                        <div className="font-mono text-purple-400">
                          {safeFixed(signal.confidence, 0)}%
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {signal.confidence >= 75 && (
                    <button className="ml-4 px-3 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg text-sm transition-colors">
                      실행
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* 백테스트 결과 */}
      <div className="bg-gradient-to-r from-purple-900/20 to-indigo-900/20 rounded-xl p-6 border border-purple-500/30">
        <h4 className="font-semibold text-purple-400 mb-4">백테스트 성과 (최근 30일)</h4>
        
        <div className="grid md:grid-cols-4 gap-4">
          <div>
            <span className="text-sm text-gray-400">승률</span>
            <div className="text-2xl font-bold text-green-400">
              {safeFixed(backtestResults.winRate, 1)}%
            </div>
          </div>
          <div>
            <span className="text-sm text-gray-400">평균 수익</span>
            <div className="text-2xl font-bold text-yellow-400">
              {safeFixed(backtestResults.avgProfit, 2)}%
            </div>
          </div>
          <div>
            <span className="text-sm text-gray-400">최대 낙폭</span>
            <div className="text-2xl font-bold text-red-400">
              -{safeFixed(backtestResults.maxDrawdown, 1)}%
            </div>
          </div>
          <div>
            <span className="text-sm text-gray-400">샤프 비율</span>
            <div className="text-2xl font-bold text-purple-400">
              {safeFixed(backtestResults.sharpeRatio, 2)}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}