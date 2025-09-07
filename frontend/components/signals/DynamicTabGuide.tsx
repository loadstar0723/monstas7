'use client'

import { FaLightbulb, FaChartLine, FaExclamationTriangle, FaCheckCircle, FaArrowUp, FaArrowDown } from 'react-icons/fa'
import { useMemo } from 'react'

interface DynamicTabGuideProps {
  tabType: 'wallets' | 'flows' | 'patterns' | 'history' | 'alerts' | 'backtest'
  transactions?: any[]
  stats?: any
  patterns?: any
  exchangeFlows?: any[]
  whaleWallets?: any[]
}

export default function DynamicTabGuide({ 
  tabType,
  transactions = [],
  stats,
  patterns,
  exchangeFlows = [],
  whaleWallets = []
}: DynamicTabGuideProps) {
  
  // 동적 분석 생성
  const dynamicAnalysis = useMemo(() => {
    const recentTransactions = transactions.slice(0, 100)
    const buyVolume = recentTransactions.filter(t => t.type === 'buy').reduce((sum, t) => sum + t.value, 0)
    const sellVolume = recentTransactions.filter(t => t.type === 'sell').reduce((sum, t) => sum + t.value, 0)
    const netFlow = buyVolume - sellVolume
    const dominantSide = buyVolume > sellVolume ? 'buy' : 'sell'
    const flowRatio = buyVolume > 0 ? (buyVolume / (buyVolume + sellVolume) * 100) : 50
    
    // 고래 활동 분석
    const activeWhales = new Set(recentTransactions.map(t => t.wallet)).size
    const avgTradeSize = recentTransactions.length > 0 
      ? recentTransactions.reduce((sum, t) => sum + t.value, 0) / recentTransactions.length / 1000000
      : 0
    const largestTrade = recentTransactions.length > 0
      ? Math.max(...recentTransactions.map(t => t.value)) / 1000000
      : 0
      
    // 시간대별 분석
    const lastHourTrades = recentTransactions.filter(t => 
      Date.now() - t.timestamp < 3600000
    ).length
    
    // 거래소 플로우 분석
    const totalInflow = exchangeFlows.reduce((sum, f) => sum + f.inflow, 0)
    const totalOutflow = exchangeFlows.reduce((sum, f) => sum + f.outflow, 0)
    const exchangeNetFlow = totalOutflow - totalInflow
    
    return {
      buyVolume,
      sellVolume,
      netFlow,
      dominantSide,
      flowRatio,
      activeWhales,
      avgTradeSize,
      largestTrade,
      lastHourTrades,
      totalInflow,
      totalOutflow,
      exchangeNetFlow
    }
  }, [transactions, exchangeFlows])
  
  // 탭별 동적 가이드 생성
  const generateDynamicGuide = () => {
    switch(tabType) {
      case 'wallets':
        // 실전 트레이딩 시그널 계산
        const buySignalStrength = Math.min(100, (dynamicAnalysis.flowRatio - 50) * 2)
        const entryPrice = stats?.currentPrice || 0
        const stopLoss = entryPrice * (dynamicAnalysis.netFlow > 0 ? 0.97 : 0.98)
        const takeProfit1 = entryPrice * (dynamicAnalysis.netFlow > 0 ? 1.03 : 1.02)
        const takeProfit2 = entryPrice * (dynamicAnalysis.netFlow > 0 ? 1.05 : 1.03)
        const positionSize = dynamicAnalysis.lastHourTrades > 20 ? '자본의 3-5%' : '자본의 5-10%'
        
        return {
          title: "💰 실전 고래 추종 트레이딩 전략",
          description: `📊 시그널 강도: ${Math.abs(buySignalStrength).toFixed(0)}% | 진입 방향: ${dynamicAnalysis.netFlow > 0 ? '🟢 롱' : '🔴 숏'} | 리스크: ${dynamicAnalysis.lastHourTrades > 20 ? '높음' : '보통'}`,
          keyPoints: [
            {
              icon: dynamicAnalysis.netFlow > 0 ? 'success' : 'warning',
              title: `🎯 즉시 실행 전략: ${dynamicAnalysis.netFlow > 0 ? '매수' : '매도'} 포지션`,
              content: `진입가: $${entryPrice.toFixed(2)} | 손절: $${stopLoss.toFixed(2)} (-${dynamicAnalysis.netFlow > 0 ? '3%' : '2%'}) | 목표가: $${takeProfit1.toFixed(2)} (+${dynamicAnalysis.netFlow > 0 ? '3%' : '2%'})`,
              trend: dynamicAnalysis.netFlow > 0 ? 'up' : 'down'
            },
            {
              icon: 'tip',
              title: `📈 포지션 관리 전략`,
              content: `추천 크기: ${positionSize} | 분할 진입: 3회 | 분할 청산: TP1(50%) $${takeProfit1.toFixed(2)}, TP2(50%) $${takeProfit2.toFixed(2)}`,
              trend: 'neutral'
            },
            {
              icon: dynamicAnalysis.largestTrade > 10 ? 'warning' : 'info',
              title: `⚡ 고래 시그널: $${dynamicAnalysis.largestTrade.toFixed(2)}M 거래 감지`,
              content: dynamicAnalysis.largestTrade > 10 
                ? `초대형 고래 출현! 즉시 같은 방향 진입, 트레일링 스탑 설정`
                : `중형 고래 활동, 분할 진입으로 리스크 관리`,
              trend: dynamicAnalysis.largestTrade > 10 ? 'up' : 'neutral'
            },
            {
              icon: 'success',
              title: `🔄 실시간 전환 시점`,
              content: dynamicAnalysis.flowRatio > 70 
                ? `강한 매수 신호 - 풀 포지션 진입`
                : dynamicAnalysis.flowRatio > 60
                ? `매수 우세 - 70% 포지션 진입`
                : dynamicAnalysis.flowRatio > 40
                ? `중립 구간 - 관망 또는 스캘핑`
                : dynamicAnalysis.flowRatio > 30
                ? `매도 우세 - 숏 포지션 고려`
                : `강한 매도 신호 - 풀 숏 포지션`,
              trend: 'neutral'
            }
          ],
          tradingTips: [
            `🎯 진입: 고래 거래 > $${dynamicAnalysis.avgTradeSize.toFixed(2)}M 시 즉시 진입`,
            `💹 손절: -${dynamicAnalysis.netFlow > 0 ? '3%' : '2%'} 철저히 지킬 것 (예외 없음)`,
            `💰 익절: 1차 ${dynamicAnalysis.netFlow > 0 ? '+3%' : '+2%'}에서 50%, 2차 ${dynamicAnalysis.netFlow > 0 ? '+5%' : '+3%'}에서 50%`,
            `⏰ 홀딩: ${dynamicAnalysis.netFlow > 0 ? '4-8시간' : '2-4시간'} (${dynamicAnalysis.dominantSide} 우세 지속 시)`,
            `📊 추가 진입: 수익 +1% 이상 시 피라미딩 (최대 2회)`,
            `🛡️ 방어: 손익분기점 도달 시 스탑로스를 진입가로 이동`
          ],
          warnings: dynamicAnalysis.lastHourTrades > 30 ? [
            "🚨 과열 경고: 변동성 극심, 포지션 50% 축소",
            "⚠️ 휩소 위험: 타이트한 손절 금지, -5%로 확대",
            "📉 청산 주의: 레버리지 3배 이하 유지"
          ] : dynamicAnalysis.flowRatio > 40 && dynamicAnalysis.flowRatio < 60 ? [
            "😐 방향성 불명확: 스캘핑만 권장",
            "🔄 추세 전환 가능: 양방향 주문 준비"
          ] : undefined
        }
        
      case 'flows':
        return {
          title: "💱 실시간 거래소 플로우 분석",
          description: `거래소 순유출 $${(dynamicAnalysis.exchangeNetFlow/1000000).toFixed(2)}M - ${dynamicAnalysis.exchangeNetFlow > 0 ? '강세' : '약세'} 신호`,
          keyPoints: [
            {
              icon: dynamicAnalysis.exchangeNetFlow > 0 ? 'success' : 'warning',
              title: `${dynamicAnalysis.exchangeNetFlow > 0 ? '거래소 유출' : '거래소 유입'} 우세`,
              content: `유입 $${(dynamicAnalysis.totalInflow/1000000).toFixed(2)}M vs 유출 $${(dynamicAnalysis.totalOutflow/1000000).toFixed(2)}M`,
              trend: dynamicAnalysis.exchangeNetFlow > 0 ? 'up' : 'down'
            },
            {
              icon: 'info',
              title: "거래소 보유량 변화",
              content: `${Math.abs(dynamicAnalysis.exchangeNetFlow/1000000).toFixed(2)}M ${dynamicAnalysis.exchangeNetFlow > 0 ? '감소' : '증가'}`,
              trend: dynamicAnalysis.exchangeNetFlow > 0 ? 'up' : 'down'
            },
            {
              icon: exchangeFlows.some(f => f.trend === 'accumulation') ? 'success' : 'warning',
              title: "주요 거래소 트렌드",
              content: `${exchangeFlows.filter(f => f.trend === 'accumulation').length}개 거래소 축적 중`,
              trend: 'neutral'
            },
            {
              icon: 'tip',
              title: "플로우 기반 전략",
              content: dynamicAnalysis.exchangeNetFlow > 0
                ? "공급 감소 → 가격 상승 압력 증가"
                : "공급 증가 → 매도 압력 증가",
              trend: 'neutral'
            }
          ],
          tradingTips: [
            `순유출 ${dynamicAnalysis.exchangeNetFlow > 0 ? '발생' : '없음'} - ${dynamicAnalysis.exchangeNetFlow > 0 ? '매수' : '매도'} 신호`,
            `거래소 보유량 ${dynamicAnalysis.exchangeNetFlow > 0 ? '감소' : '증가'} 추세`,
            "스테이블코인 유입 확인 필요",
            "거래소간 차익거래 기회 모니터링"
          ]
        }
        
      case 'patterns':
        return {
          title: "📊 실시간 패턴 분석",
          description: `현재 ${patterns?.wyckoff || 'Phase C'} 단계 - ${patterns?.trend || 'sideways'} 추세`,
          keyPoints: [
            {
              icon: patterns?.accumulation ? 'success' : patterns?.distribution ? 'warning' : 'info',
              title: patterns?.accumulation ? "매집 패턴 감지" : patterns?.distribution ? "분산 패턴 감지" : "횡보 구간",
              content: `지지선 $${patterns?.support || 0}, 저항선 $${patterns?.resistance || 0}`,
              trend: patterns?.accumulation ? 'up' : patterns?.distribution ? 'down' : 'neutral'
            },
            {
              icon: 'info',
              title: `RSI ${patterns?.rsi || 50}`,
              content: patterns?.rsi > 70 ? "과매수 구간" : patterns?.rsi < 30 ? "과매도 구간" : "중립 구간",
              trend: patterns?.rsi > 70 ? 'down' : patterns?.rsi < 30 ? 'up' : 'neutral'
            },
            {
              icon: patterns?.breakoutProbability > 60 ? 'warning' : 'info',
              title: `돌파 확률 ${patterns?.breakoutProbability || 45}%`,
              content: patterns?.breakoutProbability > 60 ? "돌파 임박" : "추가 모멘텀 필요",
              trend: patterns?.breakoutProbability > 60 ? 'up' : 'neutral'
            },
            {
              icon: 'tip',
              title: "패턴 기반 전략",
              content: patterns?.accumulation ? "매집 완료 대기 → 상승 진입"
                : patterns?.distribution ? "분산 신호 → 포지션 정리"
                : "추세 확인 대기",
              trend: 'neutral'
            }
          ],
          tradingTips: [
            `Wyckoff ${patterns?.wyckoff} - ${patterns?.wyckoff === 'Phase D' ? '추세 시작' : '준비 단계'}`,
            `볼륨 프로파일: ${patterns?.volumeProfile}`,
            `MACD 히스토그램: ${patterns?.macd?.histogram > 0 ? '상승' : '하락'}`,
            `볼린저밴드 ${patterns?.bollingerBands ? `상단 $${patterns.bollingerBands.upper}` : '계산 중'}`
          ]
        }
        
      case 'history':
        const recentBuyCount = transactions.filter(t => t.type === 'buy').length
        const recentSellCount = transactions.filter(t => t.type === 'sell').length
        const largeTradeCount = transactions.filter(t => t.impact === 'high').length
        
        return {
          title: "📜 거래 내역 통계 분석",
          description: `총 ${transactions.length}건 거래 기록 - 매수 ${recentBuyCount}건, 매도 ${recentSellCount}건`,
          keyPoints: [
            {
              icon: recentBuyCount > recentSellCount ? 'success' : 'warning',
              title: `매수/매도 비율 ${((recentBuyCount/(recentBuyCount+recentSellCount))*100).toFixed(1)}%`,
              content: `매수 ${recentBuyCount}건 vs 매도 ${recentSellCount}건`,
              trend: recentBuyCount > recentSellCount ? 'up' : 'down'
            },
            {
              icon: largeTradeCount > 10 ? 'warning' : 'info',
              title: `대형 거래 ${largeTradeCount}건`,
              content: `전체 거래의 ${((largeTradeCount/transactions.length)*100).toFixed(1)}%`,
              trend: largeTradeCount > 10 ? 'up' : 'neutral'
            },
            {
              icon: 'info',
              title: `평균 거래액 $${dynamicAnalysis.avgTradeSize.toFixed(2)}M`,
              content: `최대 $${dynamicAnalysis.largestTrade.toFixed(2)}M`,
              trend: 'neutral'
            },
            {
              icon: 'tip',
              title: "과거 패턴 인사이트",
              content: recentBuyCount > recentSellCount 
                ? "매수 우세 지속 - 상승 모멘텀"
                : "매도 우세 지속 - 조정 가능성",
              trend: 'neutral'
            }
          ],
          tradingTips: [
            `최근 추세: ${recentBuyCount > recentSellCount ? '매수' : '매도'} 우세`,
            `대형 거래 빈도: ${largeTradeCount > 10 ? '높음' : '보통'}`,
            `평균 거래 규모: $${dynamicAnalysis.avgTradeSize.toFixed(2)}M`,
            "과거 패턴 반복 여부 확인"
          ]
        }
        
      case 'alerts':
        return {
          title: "🔔 알림 최적화 가이드",
          description: `현재 시장 상황에 맞는 알림 설정을 추천합니다.`,
          keyPoints: [
            {
              icon: 'tip',
              title: "추천 임계값",
              content: `현재 평균 거래액($${dynamicAnalysis.avgTradeSize.toFixed(2)}M) 기준 ${(dynamicAnalysis.avgTradeSize * 2).toFixed(2)}M 이상`,
              trend: 'neutral'
            },
            {
              icon: dynamicAnalysis.lastHourTrades > 20 ? 'warning' : 'info',
              title: "알림 빈도 조정",
              content: dynamicAnalysis.lastHourTrades > 20 
                ? "높은 활동성 - 임계값 상향 권장"
                : "보통 활동성 - 현재 설정 유지",
              trend: 'neutral'
            },
            {
              icon: 'success',
              title: "중요 알림 타이밍",
              content: `${dynamicAnalysis.activeWhales}개 이상 고래 동시 거래 시`,
              trend: 'neutral'
            },
            {
              icon: 'info',
              title: "패턴 알림",
              content: patterns?.wyckoff === 'Phase D' ? "추세 전환 알림 활성화" : "축적/분산 알림 활성화",
              trend: 'neutral'
            }
          ],
          tradingTips: [
            `고래 거래 임계값: $${(dynamicAnalysis.avgTradeSize * 2).toFixed(2)}M 추천`,
            `거래소 플로우: ${Math.abs(dynamicAnalysis.exchangeNetFlow/1000000).toFixed(2)}M 이상 변동 시`,
            "휴면 고래 활성화 알림 필수",
            "가격 브레이크아웃 알림 설정"
          ]
        }
        
      case 'backtest':
        return {
          title: "📈 백테스트 전략 추천",
          description: `현재 시장 데이터 기반 최적 전략을 제안합니다.`,
          keyPoints: [
            {
              icon: 'success',
              title: "추천 진입 조건",
              content: `고래 매수 > $${dynamicAnalysis.avgTradeSize.toFixed(2)}M 시 진입`,
              trend: 'up'
            },
            {
              icon: 'warning',
              title: "추천 손절 기준",
              content: `-${(dynamicAnalysis.avgTradeSize > 5 ? 3 : 5)}% 손절, +${(dynamicAnalysis.avgTradeSize > 5 ? 10 : 15)}% 익절`,
              trend: 'neutral'
            },
            {
              icon: 'info',
              title: "최적 홀딩 기간",
              content: dynamicAnalysis.netFlow > 0 ? "3-7일 단기" : "1-3일 초단기",
              trend: 'neutral'
            },
            {
              icon: 'tip',
              title: "현재 시장 최적 전략",
              content: dynamicAnalysis.netFlow > 0 
                ? "고래 추종 전략 (따라 매수)"
                : "역추세 전략 (반대 포지션)",
              trend: 'neutral'
            }
          ],
          tradingTips: [
            `진입 신호: 고래 ${dynamicAnalysis.dominantSide} > $${dynamicAnalysis.avgTradeSize.toFixed(2)}M`,
            `포지션 크기: 자본의 ${dynamicAnalysis.lastHourTrades > 20 ? '5%' : '10%'}`,
            `리스크 관리: 최대 낙폭 20% 이내`,
            "승률 목표: 60% 이상"
          ]
        }
        
      default:
        return {
          title: "📊 실시간 분석",
          description: "데이터를 분석 중입니다...",
          keyPoints: [],
          tradingTips: []
        }
    }
  }
  
  const guide = generateDynamicGuide()
  
  const getIcon = (type: string) => {
    switch(type) {
      case 'success': return <FaCheckCircle className="text-green-400" />
      case 'warning': return <FaExclamationTriangle className="text-yellow-400" />
      case 'tip': return <FaLightbulb className="text-blue-400" />
      default: return <FaChartLine className="text-purple-400" />
    }
  }
  
  const getTrendIcon = (trend: string) => {
    switch(trend) {
      case 'up': return <FaArrowUp className="text-green-400 text-xs ml-1" />
      case 'down': return <FaArrowDown className="text-red-400 text-xs ml-1" />
      default: return null
    }
  }
  
  return (
    <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 backdrop-blur rounded-xl p-6 border border-blue-500/20 mb-6">
      <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
        <FaLightbulb className="text-yellow-400" />
        {guide.title}
      </h3>
      
      <p className="text-sm text-gray-300 mb-4 leading-relaxed">
        {guide.description}
      </p>
      
      {/* 핵심 포인트 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        {guide.keyPoints.map((point, idx) => (
          <div key={idx} className="bg-gray-900/50 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <div className="mt-1">{getIcon(point.icon)}</div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-white mb-1 flex items-center">
                  {point.title}
                  {(point as any).trend && getTrendIcon((point as any).trend)}
                </h4>
                <p className="text-xs text-gray-400 leading-relaxed">{point.content}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* 트레이딩 팁 */}
      <div className="bg-blue-900/30 rounded-lg p-3 mb-3">
        <h4 className="text-xs font-semibold text-blue-300 mb-2 flex items-center gap-1">
          💡 실시간 트레이딩 인사이트
        </h4>
        <ul className="text-xs text-gray-300 space-y-1">
          {guide.tradingTips.map((tip, idx) => (
            <li key={idx} className="flex items-start gap-1">
              <span className="text-blue-400 mt-0.5">•</span>
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </div>
      
      {/* 주의사항 */}
      {guide.warnings && guide.warnings.length > 0 && (
        <div className="bg-red-900/20 rounded-lg p-3 border border-red-500/30">
          <h4 className="text-xs font-semibold text-red-400 mb-2 flex items-center gap-1">
            ⚠️ 실시간 경고
          </h4>
          <ul className="text-xs text-red-300 space-y-1">
            {guide.warnings.map((warning, idx) => (
              <li key={idx} className="flex items-start gap-1">
                <span className="text-red-400 mt-0.5">!</span>
                <span>{warning}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* 실시간 업데이트 표시 */}
      <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span>실시간 데이터 기반 분석</span>
        </div>
        <span>마지막 업데이트: {new Date().toLocaleTimeString('ko-KR')}</span>
      </div>
    </div>
  )
}