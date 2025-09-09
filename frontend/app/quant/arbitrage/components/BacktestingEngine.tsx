'use client'

import { useState } from 'react'
import type { BotConfig } from '../ArbitrageBotModule'

interface BacktestingEngineProps {
  selectedCoin: {
    symbol: string
    name: string
    color: string
    bgColor: string
  }
  botConfig: BotConfig
}

interface BacktestResult {
  period: string
  totalTrades: number
  winningTrades: number
  losingTrades: number
  winRate: number
  totalProfit: number
  totalLoss: number
  netProfit: number
  avgProfit: number
  avgLoss: number
  profitFactor: number
  maxDrawdown: number
  sharpeRatio: number
  calmarRatio: number
  roi: number
}

export default function BacktestingEngine({ selectedCoin, botConfig }: BacktestingEngineProps) {
  const [isRunning, setIsRunning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [selectedPeriod, setSelectedPeriod] = useState<'1w' | '1m' | '3m' | '6m' | '1y'>('1m')
  const [results, setResults] = useState<BacktestResult | null>(null)
  const [monthlyResults, setMonthlyResults] = useState<{month: string, profit: number}[]>([])
  
  const periods = [
    { value: '1w' as const, label: '1주일' },
    { value: '1m' as const, label: '1개월' },
    { value: '3m' as const, label: '3개월' },
    { value: '6m' as const, label: '6개월' },
    { value: '1y' as const, label: '1년' }
  ]
  
  const runBacktest = async () => {
    setIsRunning(true)
    setProgress(0)
    
    try {
      // 실제 백테스트 API 호출
      const response = await fetch('/api/arbitrage/backtest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          symbol: selectedCoin.symbol,
          period: selectedPeriod,
          config: botConfig
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        
        // 진행률 시뮬레이션
        const progressInterval = setInterval(() => {
          setProgress(prev => {
            if (prev >= 90) {
              clearInterval(progressInterval)
              return 90
            }
            return prev + 15
          })
        }, 300)
        
        // API 결과가 와도 처리
        if (data && data.results) {
          setResults(data.results)
          
          if (data.monthlyResults && Array.isArray(data.monthlyResults)) {
            setMonthlyResults(data.monthlyResults)
          } else {
            setMonthlyResults([])
          }
        } else {
          // 데이터가 없으면 null 설정
          setResults(null)
          setMonthlyResults([])
        }
        
        clearInterval(progressInterval)
        setProgress(100)
      } else {
        // API 실패 시 에러 처리
        console.error('백테스트 API 실패')
        setResults(null)
        setMonthlyResults([])
        setProgress(0)
      }
      
      setIsRunning(false)
    } catch (error) {
      console.error('백테스트 실행 오류:', error)
      setResults(null)
      setMonthlyResults([])
      setIsRunning(false)
      setProgress(0)
    }
  }
  
  return (
    <div className="space-y-6">
      {/* 백테스트 설정 */}
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-gray-300 mb-4">백테스트 설정</h3>
        
        <div className="space-y-4">
          {/* 기간 선택 */}
          <div>
            <label className="text-sm text-gray-400 mb-2 block">테스트 기간</label>
            <div className="grid grid-cols-5 gap-2">
              {periods.map(period => (
                <button
                  key={period.value}
                  onClick={() => setSelectedPeriod(period.value)}
                  className={`py-2 px-3 rounded-lg font-medium transition-all ${
                    selectedPeriod === period.value
                      ? `${selectedCoin.bgColor} ${selectedCoin.color} border border-current`
                      : 'bg-gray-900/50 text-gray-400 hover:bg-gray-800'
                  }`}
                >
                  {period.label}
                </button>
              ))}
            </div>
          </div>
          
          {/* 현재 봇 설정 요약 */}
          <div className="bg-gray-900/50 rounded-lg p-4">
            <div className="text-sm text-gray-400 mb-2">현재 봇 설정</div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-gray-500">전략</span>
                <div className="text-white">
                  {botConfig.strategy === 'triangular' ? '삼각 차익' :
                   botConfig.strategy === 'statistical' ? '통계적 차익' :
                   botConfig.strategy === 'cross-exchange' ? '거래소 간' :
                   'DEX-CEX'}
                </div>
              </div>
              <div>
                <span className="text-gray-500">최소 수익률</span>
                <div className="text-green-400">{botConfig.minProfit}%</div>
              </div>
              <div>
                <span className="text-gray-500">최대 포지션</span>
                <div className="text-yellow-400">${botConfig.maxPosition}</div>
              </div>
              <div>
                <span className="text-gray-500">손절/익절</span>
                <div className="text-white">-{botConfig.stopLoss}% / +{botConfig.takeProfit}%</div>
              </div>
            </div>
          </div>
          
          {/* 실행 버튼 */}
          <button
            onClick={runBacktest}
            disabled={isRunning}
            className={`w-full py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
              isRunning
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                : 'bg-green-500/20 hover:bg-green-500/30 text-green-400'
            }`}
          >
            {isRunning ? (
              <>
                <div className="w-5 h-5 border-2 border-green-400 border-t-transparent rounded-full animate-spin"></div>
                <span>백테스트 실행 중... {progress}%</span>
              </>
            ) : (
              <>
                <span>⚡</span>
                <span>백테스트 시작</span>
              </>
            )}
          </button>
        </div>
      </div>
      
      {/* 진행 상태 */}
      {isRunning && (
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">진행률</span>
              <span className="text-white">{progress}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-green-400 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="text-xs text-gray-500">
              {progress < 30 ? '히스토리컬 데이터 로드 중...' :
               progress < 60 ? '거래 시뮬레이션 실행 중...' :
               progress < 90 ? '성과 지표 계산 중...' :
               '결과 생성 중...'}
            </div>
          </div>
        </div>
      )}
      
      {/* 백테스트 결과 */}
      {results && !isRunning && (
        <>
          {/* 핵심 지표 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
              <div className="text-xs text-gray-400 mb-1">총 거래</div>
              <div className="text-2xl font-bold text-white">{results.totalTrades}</div>
              <div className="text-xs text-gray-500 mt-1">
                승: {results.winningTrades} | 패: {results.losingTrades}
              </div>
            </div>
            
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
              <div className="text-xs text-gray-400 mb-1">승률</div>
              <div className={`text-2xl font-bold ${
                results.winRate >= 60 ? 'text-green-400' :
                results.winRate >= 50 ? 'text-yellow-400' :
                'text-red-400'
              }`}>
                {results.winRate.toFixed(1)}%
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Profit Factor: {results.profitFactor.toFixed(2)}
              </div>
            </div>
            
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
              <div className="text-xs text-gray-400 mb-1">순수익</div>
              <div className={`text-2xl font-bold ${
                results.netProfit > 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                ${results.netProfit.toFixed(0)}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                ROI: {results.roi.toFixed(1)}%
              </div>
            </div>
            
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
              <div className="text-xs text-gray-400 mb-1">최대 낙폭</div>
              <div className="text-2xl font-bold text-red-400">
                -{results.maxDrawdown.toFixed(1)}%
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Sharpe: {results.sharpeRatio.toFixed(2)}
              </div>
            </div>
          </div>
          
          {/* 상세 통계 */}
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            <h4 className="font-semibold text-gray-300 mb-4">상세 통계</h4>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-gray-700">
                  <span className="text-sm text-gray-400">평균 수익 (거래당)</span>
                  <span className="text-sm text-green-400">+{results.avgProfit.toFixed(2)}%</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-700">
                  <span className="text-sm text-gray-400">평균 손실 (거래당)</span>
                  <span className="text-sm text-red-400">-{results.avgLoss.toFixed(2)}%</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-700">
                  <span className="text-sm text-gray-400">총 수익</span>
                  <span className="text-sm text-white">${results.totalProfit.toFixed(0)}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-sm text-gray-400">총 손실</span>
                  <span className="text-sm text-white">${results.totalLoss.toFixed(0)}</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-gray-700">
                  <span className="text-sm text-gray-400">Profit Factor</span>
                  <span className={`text-sm ${
                    results.profitFactor >= 1.5 ? 'text-green-400' :
                    results.profitFactor >= 1.2 ? 'text-yellow-400' :
                    'text-red-400'
                  }`}>
                    {results.profitFactor.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-700">
                  <span className="text-sm text-gray-400">Sharpe Ratio</span>
                  <span className="text-sm text-purple-400">{results.sharpeRatio.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-700">
                  <span className="text-sm text-gray-400">Calmar Ratio</span>
                  <span className="text-sm text-blue-400">{results.calmarRatio.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-sm text-gray-400">일평균 거래</span>
                  <span className="text-sm text-white">
                    {(results.totalTrades / (selectedPeriod === '1w' ? 7 : 
                                              selectedPeriod === '1m' ? 30 :
                                              selectedPeriod === '3m' ? 90 :
                                              selectedPeriod === '6m' ? 180 :
                                              365)).toFixed(1)}회
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* 월별 수익 차트 */}
          {monthlyResults.length > 0 && (
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <h4 className="font-semibold text-gray-300 mb-4">월별 수익 추이</h4>
              
              <div className="space-y-3">
                {monthlyResults.map((month, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <span className="text-sm text-gray-400 w-12">{month.month}</span>
                    <div className="flex-1 bg-gray-900/50 rounded-full h-6 relative">
                      <div
                        className={`h-full rounded-full ${
                          month.profit > 0 ? 'bg-green-500/30' : 'bg-red-500/30'
                        }`}
                        style={{ 
                          width: `${Math.abs(month.profit) / 20}%`,
                          marginLeft: month.profit < 0 ? 'auto' : '0',
                          marginRight: month.profit < 0 ? '0' : 'auto'
                        }}
                      />
                    </div>
                    <span className={`text-sm font-mono w-20 text-right ${
                      month.profit > 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      ${month.profit.toFixed(0)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}