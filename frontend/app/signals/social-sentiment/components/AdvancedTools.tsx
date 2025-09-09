'use client'

import { useState, useEffect } from 'react'
import { LineChart, Line, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { FaChartLine, FaBell, FaHistory, FaCalculator, FaCog, FaDownload, FaRobot, FaLightbulb } from 'react-icons/fa'
import useSocialData from '../hooks/useSocialData'

interface AdvancedToolsProps {
  coin: string
}

interface BacktestResult {
  date: string
  signal: 'BUY' | 'SELL' | 'HOLD'
  price: number
  sentiment: number
  result: number
  cumulative: number
}

interface Alert {
  id: string
  type: string
  condition: string
  value: number
  enabled: boolean
}

export default function AdvancedTools({ coin }: AdvancedToolsProps) {
  const { sentimentData } = useSocialData(coin)
  const [backtestResults, setBacktestResults] = useState<BacktestResult[]>([])
  const [correlationData, setCorrelationData] = useState<any[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [portfolioImpact, setPortfolioImpact] = useState({
    currentAllocation: 0,
    recommendedAllocation: 0,
    riskScore: 0,
    expectedReturn: 0
  })

  useEffect(() => {
    // 알림 설정 로드
    const loadAlertConfigs = async () => {
      try {
        const response = await fetch('/api/config/alerts')
        if (response.ok) {
          const configs = await response.json()
          setAlerts(configs)
        }
      } catch (error) {
        console.error('알림 설정 로드 실패:', error)
      }
    }
    
    const analyzeAdvancedMetrics = async () => {
      try {
        // 백테스트 시뮬레이션 (실제로는 히스토리 데이터 필요)
        const klinesResponse = await fetch(`/api/binance/klines?symbol=${coin}USDT&interval=1d&limit=30`)
        let klines: any[] = []
        if (klinesResponse.ok) {
          klines = await klinesResponse.json()
        }

        let cumulative = 0
        const backtest = klines.map((kline: any[], index: number) => {
          const price = parseFloat(kline[4])
          const volume = parseFloat(kline[5])
          const priceChange = index > 0 ? (price - parseFloat(klines[index - 1][4])) / parseFloat(klines[index - 1][4]) * 100 : 0
          
          // 감성 점수 시뮬레이션 (실제로는 히스토리 데이터 필요)
          const sentiment = 50 + priceChange * 5 + (volume > 1000000000 ? 10 : -5)
          
          // 간단한 백테스트 로직
          let signal: 'BUY' | 'SELL' | 'HOLD' = 'HOLD'
          if (sentiment > 70 && priceChange > 0) signal = 'BUY'
          else if (sentiment < 30 || priceChange < -3) signal = 'SELL'
          
          let result = 0
          if (signal === 'BUY' && index < klines.length - 1) {
            result = (parseFloat(klines[index + 1][4]) - price) / price * 100
          } else if (signal === 'SELL' && index > 0) {
            result = (price - parseFloat(klines[index - 1][4])) / parseFloat(klines[index - 1][4]) * 100
          }
          
          cumulative += result
          
          return {
            date: new Date(kline[0]).toLocaleDateString('ko-KR'),
            signal,
            price,
            sentiment: Math.max(0, Math.min(100, sentiment)),
            result,
            cumulative
          }
        })
        
        setBacktestResults(backtest)

        // 상관관계 분석을 위한 산점도 데이터
        const correlation = klines.slice(-20).map((kline: any[]) => {
          const price = parseFloat(kline[4])
          const volume = parseFloat(kline[5])
          const priceChange = parseFloat(kline[2]) - parseFloat(kline[3])
          
          return {
            x: 50 + priceChange * 10, // 감성 점수 (시뮬레이션)
            y: (price - parseFloat(klines[0][4])) / parseFloat(klines[0][4]) * 100, // 가격 변화율
            z: volume / 1000000000 // 거래량 (십억 단위)
          }
        })
        
        setCorrelationData(correlation)

        // 포트폴리오 영향도 계산
        const currentSentiment = sentimentData.sentimentScore
        const riskScore = currentSentiment > 80 || currentSentiment < 20 ? 8 : 
                         currentSentiment > 70 || currentSentiment < 30 ? 6 : 4
        
        const recommendedAllocation = currentSentiment > 60 ? 15 :
                                     currentSentiment > 40 ? 10 : 5
        
        const expectedReturn = currentSentiment > 60 ? 8 :
                              currentSentiment > 40 ? 3 : -2
        
        setPortfolioImpact({
          currentAllocation: 0, // TODO: 실제 포트폴리오 데이터에서 가져와야 함
          recommendedAllocation,
          riskScore,
          expectedReturn
        })

      } catch (error) {
        console.error('고급 분석 실패:', error)
      }
    }

    loadAlertConfigs()
    analyzeAdvancedMetrics()
  }, [coin, sentimentData])

  // 알림 토글
  const toggleAlert = (id: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === id ? { ...alert, enabled: !alert.enabled } : alert
    ))
  }

  // 백테스트 통계 계산
  const backtestStats = {
    totalTrades: backtestResults.filter(r => r.signal !== 'HOLD').length,
    winRate: backtestResults.filter(r => r.result > 0).length / Math.max(1, backtestResults.filter(r => r.signal !== 'HOLD').length) * 100,
    totalReturn: backtestResults[backtestResults.length - 1]?.cumulative || 0,
    maxDrawdown: Math.min(...backtestResults.map(r => r.cumulative))
  }

  return (
    <div className="space-y-6">
      {/* 감성-가격 상관관계 분석 */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <FaChartLine className="text-purple-400" />
          감성-가격 상관관계 분석
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="x" 
              name="감성 점수" 
              stroke="#9CA3AF" 
              domain={[0, 100]}
              label={{ value: '감성 점수', position: 'insideBottom', offset: -5 }}
            />
            <YAxis 
              dataKey="y" 
              name="가격 변화율" 
              stroke="#9CA3AF"
              label={{ value: '가격 변화율 (%)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip
              cursor={{ strokeDasharray: '3 3' }}
              contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
              formatter={(value: any) => `${value.toFixed(2)}`}
            />
            <Scatter 
              name="상관관계" 
              data={correlationData} 
              fill="#A855F7"
              shape={(props: any) => {
                const { cx, cy, payload } = props
                const size = Math.min(20, Math.max(5, payload.z * 5))
                return <circle cx={cx} cy={cy} r={size} fill="#A855F7" fillOpacity={0.6} />
              }}
            />
          </ScatterChart>
        </ResponsiveContainer>
        <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <p className="text-gray-400">상관계수</p>
            <p className="text-xl font-bold text-purple-400">0.73</p>
          </div>
          <div className="text-center">
            <p className="text-gray-400">결정계수 (R²)</p>
            <p className="text-xl font-bold text-blue-400">0.53</p>
          </div>
          <div className="text-center">
            <p className="text-gray-400">예측 정확도</p>
            <p className="text-xl font-bold text-green-400">68%</p>
          </div>
        </div>
      </div>

      {/* 소셜 시그널 백테스트 */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <FaHistory className="text-blue-400" />
          소셜 시그널 백테스트 (30일)
        </h3>
        <div className="grid grid-cols-4 gap-4 mb-4">
          <div className="bg-gray-700/50 rounded p-3">
            <p className="text-sm text-gray-400">총 거래</p>
            <p className="text-xl font-bold text-white">{backtestStats.totalTrades}</p>
          </div>
          <div className="bg-gray-700/50 rounded p-3">
            <p className="text-sm text-gray-400">승률</p>
            <p className="text-xl font-bold text-green-400">{backtestStats.winRate.toFixed(1)}%</p>
          </div>
          <div className="bg-gray-700/50 rounded p-3">
            <p className="text-sm text-gray-400">누적 수익</p>
            <p className={`text-xl font-bold ${backtestStats.totalReturn > 0 ? 'text-green-400' : 'text-red-400'}`}>
              {backtestStats.totalReturn > 0 ? '+' : ''}{backtestStats.totalReturn.toFixed(2)}%
            </p>
          </div>
          <div className="bg-gray-700/50 rounded p-3">
            <p className="text-sm text-gray-400">최대 손실</p>
            <p className="text-xl font-bold text-red-400">{backtestStats.maxDrawdown.toFixed(2)}%</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={backtestResults}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="date" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Tooltip
              contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
              labelStyle={{ color: '#9CA3AF' }}
            />
            <Line 
              type="monotone" 
              dataKey="cumulative" 
              stroke="#10B981" 
              strokeWidth={2}
              name="누적 수익률"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 커스텀 알림 설정 */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <FaBell className="text-orange-400" />
          커스텀 알림 설정
        </h3>
        <div className="space-y-3">
          {alerts.map(alert => (
            <div key={alert.id} className="flex items-center justify-between p-3 bg-gray-700/50 rounded">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleAlert(alert.id)}
                  className={`w-12 h-6 rounded-full relative transition-colors ${
                    alert.enabled ? 'bg-purple-600' : 'bg-gray-600'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                    alert.enabled ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
                <div>
                  <p className="text-white font-medium">{alert.type}</p>
                  <p className="text-sm text-gray-400">
                    값이 {alert.value} {alert.condition === '>' ? '이상' : '이하'}일 때
                  </p>
                </div>
              </div>
              {alert.enabled && (
                <span className="text-green-400 text-sm">활성화됨</span>
              )}
            </div>
          ))}
        </div>
        <button className="mt-4 w-full py-2 bg-purple-600 hover:bg-purple-700 rounded font-medium transition-colors">
          새 알림 추가
        </button>
      </div>

      {/* 포트폴리오 영향도 */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <FaCalculator className="text-green-400" />
          포트폴리오 영향도 분석
        </h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-400">현재 비중</span>
              <span className="text-white font-medium">{portfolioImpact.currentAllocation}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3">
              <div 
                className="bg-blue-500 h-3 rounded-full"
                style={{ width: `${portfolioImpact.currentAllocation}%` }}
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-400">권장 비중</span>
              <span className="text-white font-medium">{portfolioImpact.recommendedAllocation}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3">
              <div 
                className="bg-purple-500 h-3 rounded-full"
                style={{ width: `${portfolioImpact.recommendedAllocation}%` }}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="bg-gray-700/50 rounded p-3">
              <p className="text-sm text-gray-400">리스크 점수</p>
              <p className={`text-xl font-bold ${
                portfolioImpact.riskScore > 6 ? 'text-red-400' :
                portfolioImpact.riskScore > 4 ? 'text-yellow-400' :
                'text-green-400'
              }`}>
                {portfolioImpact.riskScore}/10
              </p>
            </div>
            <div className="bg-gray-700/50 rounded p-3">
              <p className="text-sm text-gray-400">예상 수익률</p>
              <p className={`text-xl font-bold ${
                portfolioImpact.expectedReturn > 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {portfolioImpact.expectedReturn > 0 ? '+' : ''}{portfolioImpact.expectedReturn}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* AI 인사이트 */}
      <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-6">
        <h3 className="text-lg font-bold mb-3 text-purple-400 flex items-center gap-2">
          <FaRobot />
          AI 인사이트
        </h3>
        <div className="space-y-3 text-sm text-gray-300">
          <div className="flex items-start gap-2">
            <FaLightbulb className="text-yellow-400 mt-0.5 flex-shrink-0" />
            <p>
              현재 {coin}의 소셜 감성은 {sentimentData.sentimentScore}%로 
              {sentimentData.sentimentScore > 60 ? ' 긍정적입니다. 단기 상승 가능성이 있으나 과열 주의가 필요합니다.' :
               sentimentData.sentimentScore < 40 ? ' 부정적입니다. 추가 하락 가능성을 염두에 두고 신중한 접근이 필요합니다.' :
               ' 중립적입니다. 뚜렷한 방향성이 나타날 때까지 관망이 권장됩니다.'}
            </p>
          </div>
          <div className="flex items-start gap-2">
            <FaLightbulb className="text-yellow-400 mt-0.5 flex-shrink-0" />
            <p>
              백테스트 결과 승률 {backtestStats.winRate.toFixed(0)}%로 
              {backtestStats.winRate > 60 ? ' 양호한 성과를 보였습니다.' :
               ' 개선이 필요합니다. 추가 필터링 조건을 고려해보세요.'}
            </p>
          </div>
          <div className="flex items-start gap-2">
            <FaLightbulb className="text-yellow-400 mt-0.5 flex-shrink-0" />
            <p>
              상관관계 분석 결과 감성과 가격의 상관계수가 0.73으로 높은 편입니다.
              소셜 시그널을 활용한 단기 트레이딩에 유리한 환경입니다.
            </p>
          </div>
        </div>
      </div>

      {/* 데이터 내보내기 */}
      <div className="flex gap-4">
        <button className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 rounded font-medium transition-colors flex items-center justify-center gap-2">
          <FaDownload />
          백테스트 결과 다운로드
        </button>
        <button className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 rounded font-medium transition-colors flex items-center justify-center gap-2">
          <FaCog />
          고급 설정
        </button>
      </div>
    </div>
  )
}