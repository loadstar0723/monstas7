'use client'

import React, { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { FaRobot } from 'react-icons/fa'
import * as FibAnalysis from '@/lib/fibonacciAnalysis'

// Props 타입 정의
interface TabProps {
  fibonacciData: FibAnalysis.FibonacciData | null
  tradingStrategy: FibAnalysis.FibonacciTradingStrategy | null
  currentPrice: number
  priceHistory: number[]
  volumeHistory: number[]
  candleData: any[]
  historicalData: any[]
  selectedSymbol: string
  swingHigh: number
  swingLow: number
  swing3: number
}

// ==================== 개념 설명 탭 ====================
export const ConceptTab: React.FC<TabProps> = ({
  fibonacciData,
  tradingStrategy,
  currentPrice,
  priceHistory,
  swingHigh,
  swingLow
}) => {
  const [selectedConcept, setSelectedConcept] = useState('golden_ratio')
  
  // AI 예측 데이터 계산
  const aiPredictions = useMemo(() => {
    if (!fibonacciData || !tradingStrategy) return null
    
    // 패턴 인식 스코어
    const patternScore = fibonacciData.confidence
    
    // 트렌드 강도
    const trendStrength = fibonacciData.trend === 'bullish' ? 
      ((currentPrice - swingLow) / (swingHigh - swingLow)) * 100 :
      ((swingHigh - currentPrice) / (swingHigh - swingLow)) * 100
    
    // 예측 목표가
    const predictedTargets = tradingStrategy.targets.map((target, idx) => ({
      level: `목표 ${idx + 1}`,
      price: target,
      probability: Math.max(20, 90 - (idx * 20)),
      timeframe: `${(idx + 1) * 24}시간`
    }))
    
    // 리스크 평가
    const riskLevel = tradingStrategy.riskReward < 1.5 ? 'high' :
                      tradingStrategy.riskReward < 2.5 ? 'medium' : 'low'
    
    // 시장 심리
    const marketSentiment = fibonacciData.trend === 'bullish' ? 
      '긍정적' : fibonacciData.trend === 'bearish' ? 
      '부정적' : '중립적'
    
    // 지지/저항 강도
    const supportResistance = fibonacciData.retracements.map(level => ({
      price: level.price,
      strength: level.level === 0.618 ? 95 :
                level.level === 0.5 ? 85 :
                level.level === 0.382 ? 75 :
                level.level === 0.786 ? 70 : 60,
      type: level.price < currentPrice ? '지지' : '저항'
    }))
    
    return {
      patternScore,
      trendStrength,
      predictedTargets,
      riskLevel,
      marketSentiment,
      supportResistance,
      volatility: ((swingHigh - swingLow) / swingLow * 100).toFixed(1),
      momentum: fibonacciData.trend === 'bullish' ? 'positive' : 
                fibonacciData.trend === 'bearish' ? 'negative' : 'neutral'
    }
  }, [fibonacciData, tradingStrategy, currentPrice, swingHigh, swingLow])
  
  const concepts = {
    golden_ratio: {
      title: '황금비율 (1.618)',
      description: '자연과 예술에서 발견되는 완벽한 비율',
      details: [
        '피보나치 수열에서 나타나는 극한값',
        '금융시장에서 가장 중요한 되돌림 레벨',
        '61.8% 되돌림은 강력한 지지/저항선',
        '많은 트레이더가 주목하는 심리적 가격대'
      ]
    },
    retracement: {
      title: '되돌림 (Retracement)',
      description: '추세 움직임 후 일시적 반대 방향 움직임',
      details: [
        '상승 후 하락 조정, 하락 후 반등',
        '건전한 추세에서는 38.2-61.8% 되돌림',
        '78.6% 이상 되돌림은 추세 전환 신호',
        '여러 시간대 되돌림이 겹치면 강력한 레벨'
      ]
    },
    extension: {
      title: '확장 (Extension)',
      description: '되돌림 후 원래 추세 방향으로의 확장',
      details: [
        '127.2%, 161.8%, 261.8% 주요 확장 레벨',
        '목표가 설정에 활용',
        '이익 실현 지점 결정',
        'Elliott Wave와 결합하여 파동 목표 예측'
      ]
    },
    cluster: {
      title: '클러스터 (Cluster)',
      description: '여러 피보나치 레벨이 겹치는 가격대',
      details: [
        '다중 시간대 피보나치 레벨 중첩',
        '강력한 지지/저항 영역 형성',
        '돌파 시 강한 모멘텀 발생',
        '리스크/리워드 비율이 좋은 진입점'
      ]
    },
    time_zones: {
      title: '시간대 (Time Zones)',
      description: '피보나치 수열을 시간축에 적용',
      details: [
        '중요한 전환점 시기 예측',
        '1, 2, 3, 5, 8, 13, 21일 주기',
        '추세 전환 타이밍 파악',
        '시간과 가격의 교차점 분석'
      ]
    },
    spiral: {
      title: '나선 (Spiral)',
      description: '황금 나선 패턴의 시장 적용',
      details: [
        '자연의 성장 패턴 반영',
        '가격 움직임의 가속/감속',
        '파동 크기와 시간 관계',
        '프랙탈 패턴 인식'
      ]
    }
  }
  
  return (
    <div className="space-y-6">
      {/* 상단 개념 선택 버튼 */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(concepts).map(([key, concept]) => (
          <button
            key={key}
            onClick={() => setSelectedConcept(key)}
            className={`px-4 py-2 rounded-lg transition-all ${
              selectedConcept === key
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {concept.title.split(' ')[0]}
          </button>
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 왼쪽: 개념 설명 */}
        <motion.div
          key={selectedConcept}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
        >
          <h3 className="text-xl font-bold text-white mb-2">
            {concepts[selectedConcept].title}
          </h3>
          <p className="text-gray-400 mb-4">
            {concepts[selectedConcept].description}
          </p>
          
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-purple-400">핵심 개념</h4>
            <ul className="space-y-2">
              {concepts[selectedConcept].details.map((detail, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-purple-500 mt-1">•</span>
                  <span className="text-sm text-gray-300">{detail}</span>
                </li>
              ))}
            </ul>
          </div>
          
          {/* 실전 활용 팁 */}
          <div className="mt-6 p-4 bg-purple-900/20 rounded-lg border border-purple-700/30">
            <h4 className="text-sm font-bold text-purple-400 mb-2">
              💡 실전 활용 팁
            </h4>
            {selectedConcept === 'golden_ratio' && (
              <p className="text-xs text-gray-300">
                61.8% 레벨에서 가격 반응을 주의 깊게 관찰하세요. 
                이 레벨에서 반등하면 추세 지속, 돌파하면 추세 전환 가능성이 높습니다.
              </p>
            )}
            {selectedConcept === 'retracement' && (
              <p className="text-xs text-gray-300">
                상승 추세에서는 38.2-50% 되돌림을 매수 기회로, 
                하락 추세에서는 38.2-50% 반등을 매도 기회로 활용하세요.
              </p>
            )}
            {selectedConcept === 'extension' && (
              <p className="text-xs text-gray-300">
                161.8% 확장 레벨은 강력한 목표가입니다. 
                이 레벨 근처에서는 부분 익절을 고려하세요.
              </p>
            )}
            {selectedConcept === 'cluster' && (
              <p className="text-xs text-gray-300">
                3개 이상의 레벨이 겹치는 클러스터는 매우 강력합니다. 
                이런 영역에서는 포지션 크기를 늘려도 좋습니다.
              </p>
            )}
            {selectedConcept === 'time_zones' && (
              <p className="text-xs text-gray-300">
                피보나치 시간대가 가격 레벨과 만나는 지점은 매우 중요합니다.
                이런 교차점에서 큰 변동성이 발생할 가능성이 높습니다.
              </p>
            )}
            {selectedConcept === 'spiral' && (
              <p className="text-xs text-gray-300">
                황금 나선 패턴은 장기 추세 분석에 유용합니다.
                나선의 확장 방향이 가격 움직임의 가속도를 나타냅니다.
              </p>
            )}
          </div>
          
          {/* 수학적 배경 */}
          <div className="mt-4 p-3 bg-gray-900/50 rounded">
            <h4 className="text-xs font-bold text-gray-400 mb-2">수학적 배경</h4>
            <p className="text-xs text-gray-500">
              피보나치 수열: F(n) = F(n-1) + F(n-2)
              <br />
              황금비: lim(n→∞) F(n+1)/F(n) = 1.618...
            </p>
          </div>
        </motion.div>
        
        {/* 오른쪽: AI 예측 (확장된 내용) */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
        >
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <FaRobot className="text-cyan-400" />
            AI 피보나치 예측 분석
          </h3>
          
          {aiPredictions && (
            <div className="space-y-4">
              {/* 패턴 인식 스코어 */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-400">패턴 인식 정확도</span>
                  <span className="text-sm font-bold text-white">
                    {aiPredictions.patternScore.toFixed(0)}%
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-cyan-500 h-2 rounded-full transition-all"
                    style={{ width: `${aiPredictions.patternScore}%` }}
                  />
                </div>
              </div>
              
              {/* 트렌드 강도 */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-400">트렌드 강도</span>
                  <span className="text-sm font-bold text-white">
                    {aiPredictions.trendStrength.toFixed(0)}%
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all ${
                      fibonacciData?.trend === 'bullish' 
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                        : fibonacciData?.trend === 'bearish'
                        ? 'bg-gradient-to-r from-red-500 to-pink-500'
                        : 'bg-gradient-to-r from-gray-500 to-gray-400'
                    }`}
                    style={{ width: `${aiPredictions.trendStrength}%` }}
                  />
                </div>
              </div>
              
              {/* 시장 지표 */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-gray-900/50 rounded">
                  <p className="text-xs text-gray-400">시장 심리</p>
                  <p className={`text-sm font-bold ${
                    aiPredictions.marketSentiment === '긍정적' ? 'text-green-400' :
                    aiPredictions.marketSentiment === '부정적' ? 'text-red-400' :
                    'text-gray-400'
                  }`}>
                    {aiPredictions.marketSentiment}
                  </p>
                </div>
                <div className="p-3 bg-gray-900/50 rounded">
                  <p className="text-xs text-gray-400">변동성</p>
                  <p className="text-sm font-bold text-yellow-400">
                    {aiPredictions.volatility}%
                  </p>
                </div>
              </div>
              
              {/* 예측 목표가 */}
              <div>
                <h4 className="text-sm font-bold text-cyan-400 mb-2">AI 예측 목표가</h4>
                <div className="space-y-2">
                  {aiPredictions.predictedTargets.slice(0, 3).map((target, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-gray-900/50 rounded">
                      <span className="text-xs text-gray-400">{target.level}</span>
                      <span className="text-sm font-bold text-white">
                        ${target.price.toFixed(2)}
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-700 rounded-full h-1.5">
                          <div 
                            className="bg-cyan-500 h-1.5 rounded-full"
                            style={{ width: `${target.probability}%` }}
                          />
                        </div>
                        <span className="text-xs text-cyan-400">
                          {target.probability}%
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {target.timeframe}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* 주요 지지/저항 */}
              <div>
                <h4 className="text-sm font-bold text-purple-400 mb-2">AI 감지 지지/저항</h4>
                <div className="space-y-1">
                  {aiPredictions.supportResistance.slice(0, 4).map((level, idx) => (
                    <div key={idx} className="flex items-center justify-between p-1.5 bg-gray-900/50 rounded text-xs">
                      <span className={level.type === '지지' ? 'text-green-400' : 'text-red-400'}>
                        {level.type}
                      </span>
                      <span className="text-white font-bold">
                        ${level.price.toFixed(2)}
                      </span>
                      <div className="flex items-center gap-1">
                        <span className="text-gray-400">강도</span>
                        <span className={`font-bold ${
                          level.strength > 80 ? 'text-purple-400' :
                          level.strength > 60 ? 'text-blue-400' :
                          'text-gray-400'
                        }`}>
                          {level.strength}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* 리스크 평가 */}
              <div className="p-3 bg-gradient-to-r from-red-900/20 to-orange-900/20 rounded border border-red-700/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-red-400">리스크 레벨</span>
                  <span className={`text-sm font-bold px-2 py-1 rounded ${
                    aiPredictions.riskLevel === 'low' ? 'bg-green-900/50 text-green-400' :
                    aiPredictions.riskLevel === 'medium' ? 'bg-yellow-900/50 text-yellow-400' :
                    'bg-red-900/50 text-red-400'
                  }`}>
                    {aiPredictions.riskLevel === 'low' ? '낮음' :
                     aiPredictions.riskLevel === 'medium' ? '중간' : '높음'}
                  </span>
                </div>
                <p className="text-xs text-gray-400">
                  현재 R:R 비율 {tradingStrategy?.riskReward.toFixed(2) || '-'} 기준
                </p>
              </div>
              
              {/* AI 추천 */}
              <div className="p-3 bg-gradient-to-r from-cyan-900/20 to-blue-900/20 rounded border border-cyan-700/30">
                <h4 className="text-sm font-bold text-cyan-400 mb-2">🤖 AI 트레이딩 추천</h4>
                <ul className="space-y-1 text-xs text-gray-300">
                  <li>• {fibonacciData?.trend === 'bullish' ? '상승 추세 지속 예상' : 
                         fibonacciData?.trend === 'bearish' ? '하락 추세 지속 예상' :
                         '횡보 구간 예상'}</li>
                  <li>• 최적 진입: ${tradingStrategy?.entry[0]?.toFixed(2) || '-'}</li>
                  <li>• 손절: ${tradingStrategy?.stopLoss?.toFixed(2) || '-'}</li>
                  <li>• 포지션 크기: 자본의 {aiPredictions.riskLevel === 'low' ? '5-10%' :
                                       aiPredictions.riskLevel === 'medium' ? '3-5%' : '1-3%'}</li>
                  <li>• 예상 수익률: {(tradingStrategy?.riskReward * 100 || 0).toFixed(0)}%</li>
                </ul>
              </div>
              
              {/* 추가 인사이트 */}
              <div className="p-3 bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded border border-purple-700/30">
                <h4 className="text-sm font-bold text-purple-400 mb-2">📊 추가 인사이트</h4>
                <div className="space-y-2 text-xs text-gray-300">
                  <div className="flex justify-between">
                    <span>모멘텀 상태:</span>
                    <span className={aiPredictions.momentum === 'positive' ? 'text-green-400' :
                                     aiPredictions.momentum === 'negative' ? 'text-red-400' :
                                     'text-gray-400'}>
                      {aiPredictions.momentum === 'positive' ? '긍정적' :
                       aiPredictions.momentum === 'negative' ? '부정적' : '중립'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>황금 포켓 근접도:</span>
                    <span className="text-yellow-400">
                      {Math.abs(currentPrice - (fibonacciData?.goldenPocket.low || 0)) < 100 ? '매우 가까움' :
                       Math.abs(currentPrice - (fibonacciData?.goldenPocket.low || 0)) < 500 ? '가까움' :
                       '멀어짐'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>다음 저항선:</span>
                    <span className="text-red-400">
                      ${aiPredictions.supportResistance.find(l => l.type === '저항')?.price.toFixed(2) || '-'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>다음 지지선:</span>
                    <span className="text-green-400">
                      ${aiPredictions.supportResistance.find(l => l.type === '지지')?.price.toFixed(2) || '-'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
      
      {/* 하단 피보나치 수열 시각화 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
      >
        <h3 className="text-xl font-bold text-white mb-4">피보나치 수열 시각화</h3>
        <div className="flex flex-wrap gap-3">
          {[0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89].map((num, idx) => (
            <div
              key={idx}
              className="relative"
              style={{
                width: `${Math.min(num * 2 + 30, 100)}px`,
                height: `${Math.min(num * 2 + 30, 100)}px`
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-blue-600/20 rounded-lg border border-purple-500/30 flex items-center justify-center">
                <span className="text-white font-bold">{num}</span>
              </div>
              {idx > 1 && (
                <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-500">
                  {((num / [0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89][idx - 1]) || 0).toFixed(3)}
                </div>
              )}
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}