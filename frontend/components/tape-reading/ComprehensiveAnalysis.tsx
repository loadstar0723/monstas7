'use client'

import { useState, useEffect } from 'react'
import { safeFixed, safePrice, safeAmount, safePercent, safeMillion, safeThousand } from '@/lib/safeFormat'
import { FaChartPie, FaBalanceScale, FaBrain, FaExclamationTriangle } from 'react-icons/fa'

interface ComprehensiveAnalysisProps {
  symbol: string
  currentPrice: number
  priceChange: number
  volume24h: number
}

export default function ComprehensiveAnalysis({ 
  symbol, 
  currentPrice, 
  priceChange, 
  volume24h 
}: ComprehensiveAnalysisProps) {
  const [analysis, setAnalysis] = useState({
    marketPhase: '축적',
    sentiment: '중립',
    riskLevel: '보통',
    recommendation: '관망',
    keyLevels: {
      strongResistance: 0,
      resistance: 0,
      support: 0,
      strongSupport: 0
    },
    strategies: {
      scalping: { score: 0, action: '대기' },
      dayTrading: { score: 0, action: '대기' },
      swing: { score: 0, action: '대기' }
    }
  })

  useEffect(() => {
    analyzeMarket()
    const interval = setInterval(analyzeMarket, 60000)
    return () => clearInterval(interval)
  }, [symbol, currentPrice, priceChange])

  const analyzeMarket = async () => {
    try {
      // 더 많은 데이터로 정확한 분석
      const [hourlyRes, dailyRes] = await Promise.all([
        fetch(`/api/binance/klines?symbol=${symbol}&interval=1h&limit=48`),
        fetch(`/api/binance/klines?symbol=${symbol}&interval=1d&limit=14`)
      ])
      const hourlyKlines = await hourlyRes.json()
      const dailyKlines = await dailyRes.json()
      
      const klines = hourlyKlines
      
      if (Array.isArray(klines) && klines.length > 0) {
        const prices = klines.map((k: number[]) => parseFloat(k[4]))
        const volumes = klines.map((k: number[]) => parseFloat(k[5]))
        
        // 시장 단계 분석
        const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length
        const avgVolume = volumes.reduce((a, b) => a + b, 0) / volumes.length
        const volatility = calculateVolatility(prices)
        
        let marketPhase = '축적'
        if (currentPrice > avgPrice * 1.05 && volume24h > avgVolume * 1.5) {
          marketPhase = '상승'
        } else if (currentPrice < avgPrice * 0.95 && volume24h > avgVolume * 1.5) {
          marketPhase = '분산'
        } else if (volatility < 0.02) {
          marketPhase = '횡보'
        }
        
        // 센티먼트 분석
        let sentiment = '중립'
        if (priceChange > 3) sentiment = '매우 긍정'
        else if (priceChange > 1) sentiment = '긍정'
        else if (priceChange < -3) sentiment = '매우 부정'
        else if (priceChange < -1) sentiment = '부정'
        
        // 리스크 레벨
        let riskLevel = '보통'
        if (volatility > 0.1) riskLevel = '매우 높음'
        else if (volatility > 0.05) riskLevel = '높음'
        else if (volatility < 0.02) riskLevel = '낮음'
        
        // 추천 액션
        let recommendation = '관망'
        if (marketPhase === '상승' && sentiment === '긍정') {
          recommendation = '매수 고려'
        } else if (marketPhase === '분산' && sentiment === '부정') {
          recommendation = '매도 고려'
        } else if (marketPhase === '축적' && riskLevel === '낮음') {
          recommendation = '분할 매수'
        }
        
        // 주요 가격 레벨
        const maxPrice = Math.max(...prices)
        const minPrice = Math.min(...prices)
        const range = maxPrice - minPrice
        
        const keyLevels = {
          strongResistance: maxPrice + range * 0.1,
          resistance: maxPrice,
          support: minPrice,
          strongSupport: minPrice - range * 0.1
        }
        
        // 전략별 점수
        const strategies = {
          scalping: {
            score: volatility > 0.03 ? 80 : 40,
            action: volatility > 0.03 ? '적극 활용' : '제한적'
          },
          dayTrading: {
            score: marketPhase === '상승' || marketPhase === '분산' ? 75 : 45,
            action: marketPhase === '상승' ? '롱 위주' : marketPhase === '분산' ? '숏 위주' : '양방향'
          },
          swing: {
            score: marketPhase === '축적' ? 85 : 50,
            action: marketPhase === '축적' ? '포지션 구축' : '대기'
          }
        }
        
        setAnalysis({
          marketPhase,
          sentiment,
          riskLevel,
          recommendation,
          keyLevels,
          strategies
        })
      }
    } catch (error) {
      console.error('종합 분석 실패:', error)
    }
  }

  const calculateVolatility = (prices: number[]) => {
    const returns = prices.slice(1).map((price, i) => (price - prices[i]) / prices[i])
    const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length
    return Math.sqrt(variance)
  }

  return (
    <div className="bg-gray-800/50 rounded-xl border border-gray-700">
      <div className="p-4 border-b border-gray-700">
        <h3 className="text-xl font-bold text-white mb-4">🧠 AI 종합 분석 대시보드</h3>
        
        {/* 시장 상태 요약 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <FaChartPie className="text-purple-400" />
              <p className="text-purple-400 text-sm">시장 단계</p>
            </div>
            <p className="text-white font-bold">{analysis.marketPhase}</p>
          </div>
          
          <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <FaBrain className="text-blue-400" />
              <p className="text-blue-400 text-sm">센티먼트</p>
            </div>
            <p className="text-white font-bold">{analysis.sentiment}</p>
          </div>
          
          <div className={`bg-gradient-to-br rounded-lg p-3 ${
            analysis.riskLevel === '매우 높음' ? 'from-red-900/30 to-red-800/30' :
            analysis.riskLevel === '높음' ? 'from-orange-900/30 to-orange-800/30' :
            analysis.riskLevel === '낮음' ? 'from-green-900/30 to-green-800/30' :
            'from-yellow-900/30 to-yellow-800/30'
          }`}>
            <div className="flex items-center gap-2 mb-1">
              <FaExclamationTriangle className={
                analysis.riskLevel === '매우 높음' ? 'text-red-400' :
                analysis.riskLevel === '높음' ? 'text-orange-400' :
                analysis.riskLevel === '낮음' ? 'text-green-400' :
                'text-yellow-400'
              } />
              <p className={`text-sm ${
                analysis.riskLevel === '매우 높음' ? 'text-red-400' :
                analysis.riskLevel === '높음' ? 'text-orange-400' :
                analysis.riskLevel === '낮음' ? 'text-green-400' :
                'text-yellow-400'
              }`}>리스크</p>
            </div>
            <p className="text-white font-bold">{analysis.riskLevel}</p>
          </div>
          
          <div className="bg-gradient-to-br from-green-900/30 to-green-800/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <FaBalanceScale className="text-green-400" />
              <p className="text-green-400 text-sm">추천</p>
            </div>
            <p className="text-white font-bold">{analysis.recommendation}</p>
          </div>
        </div>
      </div>
      
      <div className="p-4 space-y-4">
        {/* 주요 가격 레벨 */}
        <div className="bg-gray-900/50 rounded-lg p-4">
          <h4 className="text-white font-bold mb-3">📍 주요 가격 레벨</h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-red-500 text-sm">강한 저항</span>
              <span className="text-white font-medium">${safeFixed(analysis.keyLevels.strongResistance, 2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-red-400 text-sm">저항선</span>
              <span className="text-white font-medium">${safeFixed(analysis.keyLevels.resistance, 2)}</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-yellow-900/30 rounded">
              <span className="text-yellow-400 text-sm font-medium">현재가</span>
              <span className="text-yellow-400 font-bold">${safePrice(currentPrice, 2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-green-400 text-sm">지지선</span>
              <span className="text-white font-medium">${safeFixed(analysis.keyLevels.support, 2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-green-500 text-sm">강한 지지</span>
              <span className="text-white font-medium">${safeFixed(analysis.keyLevels.strongSupport, 2)}</span>
            </div>
          </div>
        </div>
        
        {/* 전략별 추천 */}
        <div className="bg-gray-900/50 rounded-lg p-4">
          <h4 className="text-white font-bold mb-3">🎯 전략별 추천</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
              <div>
                <p className="text-white font-medium">스캘핑</p>
                <p className="text-gray-400 text-sm">{analysis.strategies.scalping.action}</p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-purple-500 h-2 rounded-full"
                      style={{ width: `${analysis.strategies.scalping.score}%` }}
                    ></div>
                  </div>
                  <span className="text-purple-400 font-bold text-sm">
                    {analysis.strategies.scalping.score}%
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
              <div>
                <p className="text-white font-medium">데이 트레이딩</p>
                <p className="text-gray-400 text-sm">{analysis.strategies.dayTrading.action}</p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${analysis.strategies.dayTrading.score}%` }}
                    ></div>
                  </div>
                  <span className="text-blue-400 font-bold text-sm">
                    {analysis.strategies.dayTrading.score}%
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
              <div>
                <p className="text-white font-medium">스윙 트레이딩</p>
                <p className="text-gray-400 text-sm">{analysis.strategies.swing.action}</p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${analysis.strategies.swing.score}%` }}
                    ></div>
                  </div>
                  <span className="text-green-400 font-bold text-sm">
                    {analysis.strategies.swing.score}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* AI 인사이트 */}
        <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-lg p-4 border border-purple-500/30">
          <h4 className="text-white font-bold mb-2">💡 AI 인사이트</h4>
          <p className="text-gray-300 text-sm leading-relaxed">
            현재 {symbol} 시장은 <span className="text-yellow-400 font-medium">{analysis.marketPhase}</span> 단계에 있으며, 
            센티먼트는 <span className="text-yellow-400 font-medium">{analysis.sentiment}</span>입니다. 
            리스크 수준이 <span className="text-yellow-400 font-medium">{analysis.riskLevel}</span>이므로, 
            <span className="text-green-400 font-medium">{analysis.recommendation}</span>을 권장합니다. 
            단기 트레이더는 {analysis.strategies.scalping.score > 60 ? '스캘핑' : '데이 트레이딩'}에 집중하고, 
            중장기 투자자는 {analysis.strategies.swing.score > 60 ? '현재 포지션 구축' : '추가 신호 대기'}를 고려하세요.
          </p>
        </div>
      </div>
    </div>
  )
}