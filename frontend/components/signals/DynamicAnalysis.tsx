'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { 
  FaLightbulb, FaChartLine, FaExclamationTriangle, 
  FaCheckCircle, FaArrowUp, FaArrowDown, FaInfoCircle,
  FaBrain, FaRocket, FaShieldAlt
} from 'react-icons/fa'
import { getVCAnalysis as getVCAnalysisNew } from './DynamicAnalysisVC'

interface DynamicAnalysisProps {
  tabType: string
  data: any
  symbol?: string
  currentPrice?: number
}

export default function DynamicAnalysis({ 
  tabType, 
  data, 
  symbol = 'BTC',
  currentPrice = 0 
}: DynamicAnalysisProps) {

  const getAnalysis = () => {
    switch(tabType) {
      case 'institutional':
        return getInstitutionalAnalysis()
      case 'marketmakers':
        return getMarketMakerAnalysis()
      case 'vctracking':
        return getVCAnalysisNew(data, symbol, currentPrice)
      case 'accumulation':
        return getAccumulationAnalysis()
      case 'distribution':
        return getDistributionAnalysis()
      case 'strategy':
        return getStrategyAnalysis()
      case 'risk':
        return getRiskAnalysis()
      case 'backtest':
        return getBacktestAnalysis()
      default:
        return getDefaultAnalysis()
    }
  }

  const getInstitutionalAnalysis = () => {
    const flows = data?.flows || []
    const netFlow = data?.netFlow || 0
    const buyCount = flows.filter((f: any) => f.type === 'buy').length
    const sellCount = flows.filter((f: any) => f.type === 'sell').length
    
    return {
      title: '🏦 기관 플로우 실시간 분석',
      mainInsight: netFlow > 0 
        ? `기관들이 ${symbol}를 적극 매집 중입니다. 순매수 $${Math.abs(netFlow).toLocaleString()}`
        : netFlow < 0
        ? `기관들이 ${symbol}를 매도 중입니다. 순매도 $${Math.abs(netFlow).toLocaleString()}`
        : '기관들이 관망 중입니다.',
      
      keyPoints: [
        {
          icon: 'trend',
          label: '현재 트렌드',
          value: buyCount > sellCount ? '매집 우세' : sellCount > buyCount ? '분산 우세' : '중립',
          color: buyCount > sellCount ? 'green' : sellCount > buyCount ? 'red' : 'yellow'
        },
        {
          icon: 'volume',
          label: '거래 강도',
          value: Math.abs(netFlow) > 1000000 ? '매우 강함' : Math.abs(netFlow) > 100000 ? '강함' : '보통',
          color: Math.abs(netFlow) > 1000000 ? 'purple' : Math.abs(netFlow) > 100000 ? 'blue' : 'gray'
        },
        {
          icon: 'institution',
          label: '주요 기관',
          value: flows[0]?.institution || '대기 중',
          color: 'cyan'
        }
      ],
      
      interpretation: `현재 ${buyCount}건의 매수와 ${sellCount}건의 매도가 발생했습니다. ` +
        (netFlow > 100000 ? '기관의 강한 매수세로 상승 압력이 형성되고 있습니다.' :
         netFlow < -100000 ? '기관의 매도세로 하락 압력이 있습니다.' :
         '기관들이 신중한 자세를 보이고 있습니다.'),
      
      actionItems: [
        netFlow > 100000 ? '✅ 기관 매집 구간 - 중장기 보유 고려' : 
        netFlow < -100000 ? '⚠️ 기관 매도 구간 - 리스크 관리 필요' :
        '⏳ 관망 구간 - 추가 신호 대기',
        
        Math.abs(netFlow) > 500000 ? '🚨 대규모 자금 이동 - 변동성 대비' :
        '📊 정상 거래량 - 기술적 분석 병행',
        
        '🔍 개별 기관 동향 지속 모니터링 필요'
      ]
    }
  }

  const getMarketMakerAnalysis = () => {
    const makers = data?.marketMakers || []
    const avgSpread = makers.reduce((sum: number, m: any) => sum + (m.spread || 0), 0) / Math.max(1, makers.length)
    const totalDepth = makers.reduce((sum: number, m: any) => sum + (m.depth || 0), 0)
    
    return {
      title: '🔄 마켓 메이커 활동 분석',
      mainInsight: avgSpread < 10 
        ? '스프레드가 좁아 유동성이 풍부합니다.'
        : avgSpread > 50
        ? '스프레드가 넓어 변동성이 예상됩니다.'
        : '정상적인 마켓 메이킹 활동입니다.',
      
      keyPoints: [
        {
          icon: 'spread',
          label: '평균 스프레드',
          value: `$${avgSpread.toFixed(2)}`,
          color: avgSpread < 10 ? 'green' : avgSpread > 50 ? 'red' : 'yellow'
        },
        {
          icon: 'depth',
          label: '총 유동성',
          value: totalDepth > 10000000 ? `$${(totalDepth/1000000).toFixed(1)}M` : `$${(totalDepth/1000).toFixed(0)}K`,
          color: totalDepth > 10000000 ? 'green' : 'yellow'
        },
        {
          icon: 'activity',
          label: '활동 수준',
          value: makers.filter((m: any) => m.activity === 'active').length > makers.length/2 ? '활발' : '보통',
          color: 'blue'
        }
      ],
      
      interpretation: `${makers.length}개의 마켓 메이커가 활동 중이며, ` +
        (avgSpread < 10 ? '좁은 스프레드로 거래가 용이합니다.' :
         avgSpread > 50 ? '넓은 스프레드로 슬리피지 주의가 필요합니다.' :
         '적정 수준의 유동성을 제공하고 있습니다.'),
      
      actionItems: [
        avgSpread < 10 ? '✅ 거래 최적 타이밍' : '⚠️ 대량 거래 시 분할 주문',
        totalDepth > 10000000 ? '💰 충분한 유동성 확보' : '📊 유동성 부족 - 소액 거래 권장',
        '🔄 지정가 주문 활용으로 슬리피지 최소화'
      ]
    }
  }

  const getVCAnalysis = () => {
    const vcActivity = data?.vcActivity || []
    const recentFunds = data?.recentFunds || []
    const historicalData = data?.historicalVCData || {}
    const tokenUnlocks = data?.tokenUnlocks || []
    const institutionalFlows = data?.institutionalFlows || []
    
    // VC 활동 심층 분석
    const totalVCVolume = vcActivity.reduce((sum: number, v: any) => sum + (v.value || 0), 0)
    const avgVCTradeSize = vcActivity.length > 0 ? totalVCVolume / vcActivity.length : 0
    const vcBuyRatio = vcActivity.filter((v: any) => v.type === 'accumulation').length / Math.max(1, vcActivity.length)
    
    // 과거 데이터 기반 패턴 분석
    const historicalMonthly = historicalData.monthlyData || []
    const avgMonthlyVolume = historicalMonthly.reduce((sum: number, m: any) => sum + (m.totalVolume || 0), 0) / Math.max(1, historicalMonthly.length)
    const currentMonthVolume = historicalMonthly[historicalMonthly.length - 1]?.totalVolume || 0
    const volumeTrend = currentMonthVolume > avgMonthlyVolume ? '상승' : '하락'
    
    // 토큰 언락 영향도 예측
    const now = new Date()
    const upcomingUnlocks = tokenUnlocks.filter((u: any) => new Date(u.date) > now)
    const next7DaysUnlocks = upcomingUnlocks.filter((u: any) => {
      const daysDiff = (new Date(u.date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      return daysDiff <= 7
    })
    const next30DaysUnlocks = upcomingUnlocks.filter((u: any) => {
      const daysDiff = (new Date(u.date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      return daysDiff <= 30
    })
    const totalUnlock7Days = next7DaysUnlocks.reduce((sum: number, u: any) => sum + (u.unlockValueUSD || 0), 0)
    const totalUnlock30Days = next30DaysUnlocks.reduce((sum: number, u: any) => sum + (u.unlockValueUSD || 0), 0)
    
    // VC 지갑 활동 분석
    const largeTransactions = institutionalFlows.filter((f: any) => f.value > 1000000)
    const vcTransactions = largeTransactions.filter((t: any) => 
      t.institution?.includes('Capital') || 
      t.institution?.includes('Ventures') || 
      t.institution?.includes('Fund')
    )
    
    // VC 행동 예측 점수 계산 (0-100)
    let vcSentimentScore = 50 // 기본 중립
    if (vcBuyRatio > 0.7) vcSentimentScore += 25
    else if (vcBuyRatio > 0.6) vcSentimentScore += 15
    else if (vcBuyRatio < 0.3) vcSentimentScore -= 25
    else if (vcBuyRatio < 0.4) vcSentimentScore -= 15
    
    if (volumeTrend === '상승') vcSentimentScore += 15
    else vcSentimentScore -= 10
    
    if (vcActivity.length > 10) vcSentimentScore += 15
    else if (vcActivity.length > 5) vcSentimentScore += 10
    else if (vcActivity.length < 2) vcSentimentScore -= 10
    
    if (totalUnlock7Days > 1000000000) vcSentimentScore -= 30
    else if (totalUnlock7Days > 500000000) vcSentimentScore -= 20
    else if (totalUnlock7Days > 100000000) vcSentimentScore -= 10
    
    vcSentimentScore = Math.max(0, Math.min(100, vcSentimentScore))
    
    // 시장 영향도 레벨 계산
    const impactLevel = totalUnlock7Days > 1000000000 ? '극도로 높음' :
                       totalUnlock7Days > 500000000 ? '높음' :
                       totalUnlock7Days > 100000000 ? '중간' : '낮음'
    
    // VC 투자 단계 판단
    const investmentPhase = vcSentimentScore > 70 ? '적극 매집' :
                           vcSentimentScore > 50 ? '점진적 매집' :
                           vcSentimentScore > 30 ? '관망' : '매도/이탈'
    
    // 예측 신뢰도 계산
    const predictionConfidence = vcTransactions.length > 50 ? '매우 높음' :
                                vcTransactions.length > 20 ? '높음' :
                                vcTransactions.length > 10 ? '중간' : '낮음'
    
    return {
      title: '💼 VC/헤지펀드 고급 예측 분석',
      mainInsight: `VC 센티먼트 점수 ${vcSentimentScore}/100 - ${investmentPhase} 단계\n` +
        `${vcActivity.length}개 펀드 활동 중, ${(vcBuyRatio * 100).toFixed(0)}% 매수 포지션\n` +
        (totalUnlock7Days > 100000000 ? 
          `⚠️ 주의: 7일 내 $${(totalUnlock7Days/1000000).toFixed(0)}M 언락 예정` : 
          '✅ 단기 언락 압력 낮음'),
      
      keyPoints: [
        {
          icon: 'sentiment',
          label: 'VC 센티먼트',
          value: `${vcSentimentScore}/100`,
          color: vcSentimentScore > 70 ? 'green' : vcSentimentScore > 30 ? 'yellow' : 'red'
        },
        {
          icon: 'phase',
          label: '투자 단계',
          value: investmentPhase,
          color: vcSentimentScore > 70 ? 'purple' : vcSentimentScore > 50 ? 'blue' : vcSentimentScore > 30 ? 'yellow' : 'red'
        },
        {
          icon: 'volume',
          label: '24h VC 거래량',
          value: totalVCVolume > 1000000 ? `$${(totalVCVolume/1000000).toFixed(1)}M` : `$${(totalVCVolume/1000).toFixed(0)}K`,
          color: volumeTrend === '상승' ? 'green' : 'red'
        },
        {
          icon: 'ratio',
          label: '매수/매도 비율',
          value: `${(vcBuyRatio * 100).toFixed(0)}%/${((1-vcBuyRatio) * 100).toFixed(0)}%`,
          color: vcBuyRatio > 0.6 ? 'green' : vcBuyRatio < 0.4 ? 'red' : 'yellow'
        },
        {
          icon: 'unlock7',
          label: '7일 언락',
          value: totalUnlock7Days > 0 ? `$${(totalUnlock7Days/1000000).toFixed(0)}M` : '없음',
          color: totalUnlock7Days > 500000000 ? 'red' : totalUnlock7Days > 100000000 ? 'orange' : 'green'
        },
        {
          icon: 'unlock30',
          label: '30일 언락',
          value: totalUnlock30Days > 0 ? `$${(totalUnlock30Days/1000000).toFixed(0)}M` : '없음',
          color: totalUnlock30Days > 1000000000 ? 'red' : totalUnlock30Days > 500000000 ? 'orange' : 'green'
        },
        {
          icon: 'funds',
          label: '활동 VC',
          value: `${vcActivity.length}개`,
          color: vcActivity.length > 10 ? 'purple' : vcActivity.length > 5 ? 'blue' : 'gray'
        },
        {
          icon: 'confidence',
          label: '예측 신뢰도',
          value: predictionConfidence,
          color: predictionConfidence === '매우 높음' ? 'green' : predictionConfidence === '높음' ? 'blue' : predictionConfidence === '중간' ? 'yellow' : 'gray'
        },
        {
          icon: 'trend',
          label: '월간 트렌드',
          value: volumeTrend,
          color: volumeTrend === '상승' ? 'green' : 'red'
        }
      ],
      
      interpretation: `📊 종합 분석: ${symbol || 'BTC'}의 VC 활동이 ${investmentPhase} 단계에 있습니다.\n\n` +
        `💰 거래 패턴 분석:\n` +
        `• 평균 거래 규모: $${avgVCTradeSize > 0 ? (avgVCTradeSize/1000000).toFixed(2) : '0.00'}M\n` +
        `• ${avgVCTradeSize > 1000000 ? '대형 펀드 위주' : avgVCTradeSize > 100000 ? '중형 펀드 활동' : '소형 펀드 중심'}의 거래\n` +
        `• 최근 24시간: ${vcTransactions.length}건의 대규모 VC 거래 포착\n\n` +
        
        `🔓 토큰 언락 영향 예측:\n` +
        `• 7일 내: $${(totalUnlock7Days/1000000).toFixed(0)}M (${impactLevel} 영향)\n` +
        `• 30일 내: $${(totalUnlock30Days/1000000).toFixed(0)}M 예정\n` +
        (totalUnlock7Days > 500000000 ? 
          `⚠️ 대규모 언락으로 강한 매도압력 예상! 단기 하락 가능성 높음\n` :
         totalUnlock7Days > 100000000 ?
          `📊 중간 규모 언락 - 일시적 조정 가능\n` :
          `✅ 언락 압력 최소 - 정상 거래 가능\n`) +
        (next7DaysUnlocks[0] ? 
          `• 다음 언락: ${new Date(next7DaysUnlocks[0].date).toLocaleDateString('ko-KR')} - ${next7DaysUnlocks[0].tokenName}\n` : '') +
        `\n` +
        
        `📈 VC 행동 예측 (신뢰도: ${predictionConfidence}):\n` +
        (vcSentimentScore > 70 ? 
          `• 강력한 매집 신호 - 중장기 상승 가능성 매우 높음\n` +
          `• VC들이 적극적으로 포지션 구축 중\n` +
          `• 예상 상승폭: +15-30% (1-3개월)` :
         vcSentimentScore > 50 ?
          `• 점진적 매집 진행 - 완만한 상승 예상\n` +
          `• VC들이 조심스럽게 포지션 늘리는 중\n` +
          `• 예상 변동: +5-15% (1-2개월)` :
         vcSentimentScore > 30 ?
          `• 관망 단계 - 방향성 불분명\n` +
          `• VC들이 시장 상황 지켜보는 중\n` +
          `• 예상 변동: -5% ~ +5% (횡보)` :
          `• VC 이탈 신호 - 하락 위험 높음\n` +
          `• 대규모 매도 가능성\n` +
          `• 예상 하락폭: -10-20% (단기)`),
      
      actionItems: [
        // VC 센티먼트 기반 추천
        vcSentimentScore > 70 ? 
          '🚀 적극 매수 - VC 따라하기 전략 즉시 실행' :
        vcSentimentScore > 50 ? 
          '✅ 점진적 매수 - 3-5회 분할 매수' :
        vcSentimentScore > 30 ? 
          '⏳ 관망 유지 - 추가 신호 확인 필요' :
          '⚠️ 매도/숏 포지션 - VC 이탈 진행 중',
        
        // 언락 대응 전략
        totalUnlock7Days > 500000000 ? 
          `🔓 ${new Date(next7DaysUnlocks[0]?.date).toLocaleDateString('ko-KR')} 초대규모 언락 대비 - 포지션 축소 필수` :
        totalUnlock7Days > 100000000 ?
          `📅 언락 일정 주시 - 일시적 조정 대비` :
          '✅ 언락 리스크 낮음 - 정상 거래',
        
        // 거래량 기반 추천
        volumeTrend === '상승' ? 
          '📈 VC 자금 유입 증가 중 - 추세 추종' :
          '📉 VC 자금 유출 - 리스크 관리 강화',
        
        // 구체적 포지션 전략
        vcBuyRatio > 0.7 ? 
          '💎 장기 보유 포지션 80% 구축' :
        vcBuyRatio > 0.5 ?
          '⚖️ 중립 포지션 50% 유지' :
          '🛡️ 방어적 포지션 20% 이하',
        
        // 모니터링 포인트
        `🔍 주요 VC 지갑 실시간 추적 중`,
        vcTransactions.length > 0 ?
          `📊 최근 대규모 거래: ${vcTransactions[0]?.institution || 'Unknown'} - $${(vcTransactions[0]?.value/1000000).toFixed(1)}M` :
          '📊 대규모 거래 모니터링 중',
        
        // 위험 관리
        impactLevel === '극도로 높음' || impactLevel === '높음' ?
          '🚨 언락 임박 - 손절선 타이트하게 설정' :
          '📍 정상 손절선 유지 (5-7%)',
        
        // 추가 분석 필요 항목
        predictionConfidence === '낮음' ?
          '⚠️ 데이터 부족 - 추가 확인 후 진입' :
          `✅ 예측 신뢰도 ${predictionConfidence} - 전략 실행 가능`
      ],
      
      // 추가 예측 정보
      predictions: {
        shortTerm: vcSentimentScore > 60 ? `단기 상승 (1주)` : vcSentimentScore < 40 ? `단기 하락 (1주)` : `횡보 (1주)`,
        mediumTerm: volumeTrend === '상승' && vcBuyRatio > 0.6 ? `중기 강세 (1개월)` : `중기 약세 (1개월)`,
        longTerm: vcSentimentScore > 70 ? `장기 강세 (3개월+)` : vcSentimentScore < 30 ? `장기 약세 (3개월+)` : `중립 (3개월)`,
        nextUnlock: next7DaysUnlocks[0] ? `${new Date(next7DaysUnlocks[0].date).toLocaleDateString('ko-KR')} - ${next7DaysUnlocks[0].tokenName}` : '없음',
        unlockImpact: impactLevel,
        confidence: predictionConfidence,
        riskLevel: vcSentimentScore < 30 || totalUnlock7Days > 500000000 ? '높음' : vcSentimentScore > 70 && totalUnlock7Days < 100000000 ? '낮음' : '중간'
      }
    }
  }

  const getAccumulationAnalysis = () => {
    const flows = data?.institutionalFlows || []
    const accumulationFlows = flows.filter((f: any) => f.type === 'accumulation')
    const distributionFlows = flows.filter((f: any) => f.type === 'distribution')
    const netFlow = data?.netFlow || 0
    const currentPrice = data?.currentPrice || 0
    const symbol = data?.symbol || 'BTCUSDT'
    
    // 실제 데이터 기반 매집 강도 계산
    const accumulationVolume = accumulationFlows.reduce((sum: number, f: any) => sum + f.value, 0)
    const distributionVolume = distributionFlows.reduce((sum: number, f: any) => sum + f.value, 0)
    const ratio = accumulationVolume > 0 ? (accumulationVolume / (accumulationVolume + distributionVolume)) : 0.5
    
    // 참여 기관 분석
    const uniqueInstitutions = [...new Set(accumulationFlows.map((f: any) => f.institution))]
    const topInstitutions = uniqueInstitutions.slice(0, 3)
    
    // 매집 구간 강도 판단
    const strength = ratio > 0.7 ? 'strong' : ratio > 0.55 ? 'moderate' : 'weak'
    const priceRange = {
      min: currentPrice * 0.95,
      max: currentPrice * 1.05
    }
    
    return {
      title: '🎯 매집 구간 실시간 분석',
      mainInsight: accumulationFlows.length > distributionFlows.length * 2
        ? `강력한 매집 신호! ${uniqueInstitutions.length}개 기관이 ${symbol.replace('USDT', '')}를 적극 매집 중입니다.`
        : accumulationFlows.length > distributionFlows.length
        ? `${uniqueInstitutions.length}개 기관이 조용히 포지션을 늘리고 있습니다.`
        : '현재 뚜렷한 매집 신호는 포착되지 않았습니다.',
      
      keyPoints: [
        {
          icon: 'accumulation',
          label: '매집 거래',
          value: `${accumulationFlows.length}건`,
          color: accumulationFlows.length > 100 ? 'green' : accumulationFlows.length > 50 ? 'yellow' : 'gray'
        },
        {
          icon: 'volume',
          label: '매집 규모',
          value: `$${(accumulationVolume / 1000000).toFixed(2)}M`,
          color: accumulationVolume > 10000000 ? 'purple' : accumulationVolume > 5000000 ? 'blue' : 'gray'
        },
        {
          icon: 'institutions',
          label: '참여 기관',
          value: `${uniqueInstitutions.length}개`,
          color: uniqueInstitutions.length > 10 ? 'green' : uniqueInstitutions.length > 5 ? 'yellow' : 'gray'
        },
        {
          icon: 'ratio',
          label: '매집 비율',
          value: `${(ratio * 100).toFixed(1)}%`,
          color: ratio > 0.7 ? 'green' : ratio > 0.55 ? 'yellow' : 'red'
        },
        {
          icon: 'priceRange',
          label: '매집 가격대',
          value: `$${priceRange.min.toFixed(0)}-${priceRange.max.toFixed(0)}`,
          color: 'blue'
        },
        {
          icon: 'phase',
          label: '매집 단계',
          value: accumulationFlows.length > 200 ? '매집 후기' : accumulationFlows.length > 100 ? '매집 중기' : '매집 초기',
          color: accumulationFlows.length > 200 ? 'purple' : 'blue'
        }
      ],
      
      interpretation: `현재 ${symbol.replace('USDT', '')}는 ${strength === 'strong' ? '강력한' : strength === 'moderate' ? '중간 강도의' : '약한'} 매집 구간에 있습니다. ` +
        (ratio > 0.7 
          ? `매집 비율이 ${(ratio * 100).toFixed(1)}%로 매우 높아, 기관들이 적극적으로 포지션을 늘리고 있습니다. 상승 전환 가능성이 높습니다.`
          : ratio > 0.55
          ? `매집 비율이 ${(ratio * 100).toFixed(1)}%로 긍정적이나, 좀 더 명확한 신호를 기다려야 합니다.`
          : `매집 비율이 ${(ratio * 100).toFixed(1)}%로 낮아, 아직은 관망하는 것이 안전합니다.`) +
        (topInstitutions.length > 0 ? ` 주요 참여 기관: ${topInstitutions.join(', ')}.` : ''),
      
      actionItems: [
        ratio > 0.7 ? '🔥 매집 구간 근처에서 적극 진입' : ratio > 0.55 ? '✅ 분할 매수로 신중한 진입' : '⏳ 추가 매집 신호 대기',
        accumulationVolume > 10000000 ? '💎 대규모 매집 진행 중 - 중장기 보유 전략' : '📊 거래량 증가 모니터링',
        uniqueInstitutions.length > 10 ? '🏦 다수 기관 참여 - 강한 상승 모멘텀' : '🔍 추가 기관 진입 관찰',
        `📍 주요 지지선: $${priceRange.min.toFixed(0)} / 저항선: $${priceRange.max.toFixed(0)}`,
        strength === 'strong' ? '🚀 매집 완료 단계 - 상승 전환 임박' : '⚠️ 매집 진행 중 - 변동성 주의'
      ]
    }
  }

  const getDistributionAnalysis = () => {
    const flows = data?.institutionalFlows || []
    const distributionFlows = flows.filter((f: any) => f.type === 'distribution')
    const accumulationFlows = flows.filter((f: any) => f.type === 'accumulation')
    const currentPrice = data?.currentPrice || 0
    const symbol = data?.symbol || 'BTCUSDT'
    
    // 실제 데이터 기반 분산 강도 계산
    const distributionVolume = distributionFlows.reduce((sum: number, f: any) => sum + f.value, 0)
    const accumulationVolume = accumulationFlows.reduce((sum: number, f: any) => sum + f.value, 0)
    const totalVolume = distributionVolume + accumulationVolume
    const distributionRatio = totalVolume > 0 ? (distributionVolume / totalVolume) : 0
    
    // 최근 1시간 데이터 분석
    const recentHour = Date.now() - (60 * 60 * 1000)
    const recentDistribution = distributionFlows.filter((f: any) => f.timestamp > recentHour)
    const recentAccumulation = accumulationFlows.filter((f: any) => f.timestamp > recentHour)
    
    // 매도 기관 분석
    const sellingInstitutions = [...new Set(distributionFlows.map((f: any) => f.institution))]
    const topSellers = sellingInstitutions.slice(0, 3)
    
    // 분산 단계 판단
    const distributionPhase = distributionRatio > 0.7 ? 'panic' : 
                             distributionRatio > 0.55 ? 'distribution' : 
                             distributionRatio > 0.4 ? 'mixed' : 'accumulation'
    
    // 위험도 계산
    const riskLevel = distributionRatio > 0.7 ? 'extreme' :
                     distributionRatio > 0.55 ? 'high' :
                     distributionRatio > 0.4 ? 'medium' : 'low'
    
    return {
      title: '📉 분산 매도 실시간 분석',
      mainInsight: distributionFlows.length > accumulationFlows.length * 1.5
        ? `⚠️ 강력한 분산 신호! ${sellingInstitutions.length}개 기관이 ${symbol.replace('USDT', '')}를 매도 중입니다.`
        : distributionFlows.length > accumulationFlows.length
        ? `주의: ${sellingInstitutions.length}개 기관이 포지션을 줄이고 있습니다.`
        : '현재 분산 매도 압력은 낮은 수준입니다.',
      
      keyPoints: [
        {
          icon: 'distribution',
          label: '분산 거래',
          value: `${distributionFlows.length}건`,
          color: distributionFlows.length > 100 ? 'red' : distributionFlows.length > 50 ? 'yellow' : 'gray'
        },
        {
          icon: 'volume',
          label: '매도 규모',
          value: `$${(distributionVolume / 1000000).toFixed(2)}M`,
          color: distributionVolume > 10000000 ? 'red' : distributionVolume > 5000000 ? 'yellow' : 'gray'
        },
        {
          icon: 'institutions',
          label: '매도 기관',
          value: `${sellingInstitutions.length}개`,
          color: sellingInstitutions.length > 10 ? 'red' : sellingInstitutions.length > 5 ? 'yellow' : 'gray'
        },
        {
          icon: 'ratio',
          label: '분산 비율',
          value: `${(distributionRatio * 100).toFixed(1)}%`,
          color: distributionRatio > 0.6 ? 'red' : distributionRatio > 0.4 ? 'yellow' : 'green'
        },
        {
          icon: 'recent',
          label: '1시간 매도',
          value: `${recentDistribution.length}건`,
          color: recentDistribution.length > 20 ? 'red' : recentDistribution.length > 10 ? 'yellow' : 'gray'
        },
        {
          icon: 'risk',
          label: '위험 수준',
          value: riskLevel === 'extreme' ? '극도로 높음' : 
                riskLevel === 'high' ? '높음' : 
                riskLevel === 'medium' ? '중간' : '낮음',
          color: riskLevel === 'extreme' ? 'red' : 
                riskLevel === 'high' ? 'orange' : 
                riskLevel === 'medium' ? 'yellow' : 'green'
        }
      ],
      
      interpretation: `현재 ${symbol.replace('USDT', '')}는 ${
        distributionPhase === 'panic' ? '패닉 매도' : 
        distributionPhase === 'distribution' ? '분산 매도' : 
        distributionPhase === 'mixed' ? '혼재' : '매집'
      } 단계에 있습니다. ` +
        (distributionRatio > 0.7 
          ? `분산 비율이 ${(distributionRatio * 100).toFixed(1)}%로 극도로 높아, 대규모 하락이 임박했을 수 있습니다. 즉시 포지션 정리를 고려하세요.`
          : distributionRatio > 0.55
          ? `분산 비율이 ${(distributionRatio * 100).toFixed(1)}%로 높아, 단기 조정이 예상됩니다. 리스크 관리가 필요합니다.`
          : distributionRatio > 0.4
          ? `분산과 매집이 혼재되어 있습니다. 방향성이 불분명하므로 관망하는 것이 안전합니다.`
          : `매집 비율이 ${((1 - distributionRatio) * 100).toFixed(1)}%로 높아, 하락 리스크는 제한적입니다.`) +
        (topSellers.length > 0 ? ` 주요 매도 기관: ${topSellers.join(', ')}.` : ''),
      
      actionItems: [
        distributionRatio > 0.7 ? '🚨 즉시 포지션 청산 또는 강력한 손절' : 
        distributionRatio > 0.55 ? '⚠️ 포지션 50% 이상 축소' : 
        distributionRatio > 0.4 ? '📊 추가 매수 중단, 관망' : 
        '✅ 현재 포지션 유지 가능',
        
        recentDistribution.length > 20 ? '🔴 최근 1시간 매도 급증 - 단기 하락 주의' : 
        recentDistribution.length > 10 ? '🟡 매도 압력 증가 중 - 모니터링 강화' : 
        '🟢 매도 압력 안정적',
        
        sellingInstitutions.length > 10 ? '🏦 다수 기관 이탈 - 트렌드 전환 가능성' : 
        sellingInstitutions.length > 5 ? '👀 일부 기관 이탈 - 추이 관찰' : 
        '💎 기관 보유 안정적',
        
        `📍 손절가: $${(currentPrice * 0.95).toFixed(0)} / 관망 구간: $${(currentPrice * 0.98).toFixed(0)}-${(currentPrice * 1.02).toFixed(0)}`,
        
        distributionPhase === 'panic' ? '🆘 패닉 매도 진행 중 - 추가 하락 대비' : 
        distributionPhase === 'distribution' ? '📉 분산 진행 중 - 반등 매수 자제' : 
        '⏳ 명확한 방향성 확인 대기'
      ]
    }
  }

  const getStrategyAnalysis = () => {
    const flows = data?.institutionalFlows || []
    const accumulationFlows = flows.filter((f: any) => f.type === 'accumulation')
    const distributionFlows = flows.filter((f: any) => f.type === 'distribution')
    const netFlow = data?.netFlow || 0
    const currentPrice = data?.currentPrice || 0
    const symbol = data?.symbol || 'BTCUSDT'
    const fearGreedIndex = data?.fearGreedIndex || 50
    const priceChange24h = data?.priceChange24h || 0
    const volume24h = data?.volume24h || 0
    const orderBookData = data?.orderBookData || {}
    
    // 실제 데이터 기반 시장 강도 계산
    const buyVolume = accumulationFlows.reduce((sum: number, f: any) => sum + f.value, 0)
    const sellVolume = distributionFlows.reduce((sum: number, f: any) => sum + f.value, 0)
    const volumeRatio = buyVolume > 0 ? (buyVolume / (buyVolume + sellVolume)) : 0.5
    
    // 오더북 불균형 계산 (Binance depth API는 [[price, quantity], ...] 형식)
    const bidVolume = orderBookData?.bids?.reduce((sum: number, bid: any) => {
      if (Array.isArray(bid) && bid.length >= 2) {
        return sum + (parseFloat(bid[0]) * parseFloat(bid[1])) // price * quantity
      }
      return sum + (bid.total || 0) // fallback for other format
    }, 0) || 0
    
    const askVolume = orderBookData?.asks?.reduce((sum: number, ask: any) => {
      if (Array.isArray(ask) && ask.length >= 2) {
        return sum + (parseFloat(ask[0]) * parseFloat(ask[1])) // price * quantity
      }
      return sum + (ask.total || 0) // fallback for other format
    }, 0) || 0
    
    const orderBookImbalance = (bidVolume - askVolume) / Math.max(1, bidVolume + askVolume)
    
    // 종합 시장 점수 계산 (0-100)
    const marketScore = Math.round(
      (volumeRatio * 30) +                           // 매집/분산 비율 (30%)
      (fearGreedIndex / 100 * 20) +                  // 공포탐욕지수 (20%)
      ((priceChange24h > 0 ? 1 : 0) * 20) +         // 24시간 가격 변화 (20%)
      ((orderBookImbalance + 1) / 2 * 20) +         // 오더북 불균형 (20%)
      (volume24h > 1000000000 ? 10 : volume24h / 100000000) // 거래량 (10%)
    )
    
    // AI 신호 결정
    const aiSignal = marketScore > 70 ? 'STRONG_BUY' :
                    marketScore > 55 ? 'BUY' :
                    marketScore > 45 ? 'HOLD' :
                    marketScore > 30 ? 'SELL' : 'STRONG_SELL'
    
    // 포지션 크기 계산 (Kelly Criterion 변형)
    const winProbability = marketScore / 100
    const lossRatio = 1 - winProbability
    const payoffRatio = 2 // 목표 수익/손실 비율
    const kellyPercentage = Math.max(0, Math.min(25, 
      ((winProbability * payoffRatio - lossRatio) / payoffRatio) * 100
    ))
    
    // 최적 레버리지 계산
    const volatilityFactor = Math.abs(priceChange24h) / 100
    const safeLeverage = Math.max(1, Math.min(5, 
      marketScore > 60 ? 3 / (1 + volatilityFactor) : 1
    ))
    
    // 진입/손절/목표가 계산
    const entryPrice = currentPrice
    const stopLossPercent = marketScore > 60 ? 3 : marketScore > 40 ? 5 : 7
    const stopLoss = entryPrice * (1 - stopLossPercent / 100)
    const target1 = entryPrice * (1 + stopLossPercent * 1.5 / 100)
    const target2 = entryPrice * (1 + stopLossPercent * 3 / 100)
    const target3 = entryPrice * (1 + stopLossPercent * 5 / 100)
    
    // 시간대별 전략
    const timeframeStrategy = marketScore > 70 ? '단기 스윙 (1-3일)' :
                             marketScore > 55 ? '중기 포지션 (3-7일)' :
                             marketScore > 45 ? '관망 또는 스캘핑' :
                             '방어적 전략 필요'
    
    return {
      title: '🤖 AI 트레이딩 전략 실시간 분석',
      mainInsight: `현재 ${symbol.replace('USDT', '')}는 AI 종합 점수 ${marketScore}점으로 ${
        aiSignal === 'STRONG_BUY' ? '강력 매수' :
        aiSignal === 'BUY' ? '매수' :
        aiSignal === 'HOLD' ? '중립/관망' :
        aiSignal === 'SELL' ? '매도' : '강력 매도'
      } 신호입니다. 권장 포지션 크기는 자본의 ${kellyPercentage.toFixed(1)}%입니다.`,
      
      keyPoints: [
        {
          icon: 'signal',
          label: 'AI 신호',
          value: aiSignal === 'STRONG_BUY' ? '강력 매수' :
                aiSignal === 'BUY' ? '매수' :
                aiSignal === 'HOLD' ? '홀드' :
                aiSignal === 'SELL' ? '매도' : '강력 매도',
          color: aiSignal.includes('BUY') ? 'green' : 
                aiSignal === 'HOLD' ? 'yellow' : 'red'
        },
        {
          icon: 'score',
          label: '시장 점수',
          value: `${marketScore}/100`,
          color: marketScore > 70 ? 'green' : marketScore > 40 ? 'yellow' : 'red'
        },
        {
          icon: 'position',
          label: '권장 포지션',
          value: `${kellyPercentage.toFixed(1)}%`,
          color: kellyPercentage > 15 ? 'purple' : kellyPercentage > 10 ? 'blue' : 'gray'
        },
        {
          icon: 'leverage',
          label: '안전 레버리지',
          value: `${safeLeverage.toFixed(1)}x`,
          color: safeLeverage > 2 ? 'yellow' : 'green'
        },
        {
          icon: 'entry',
          label: '진입가',
          value: `$${entryPrice.toFixed(0)}`,
          color: 'blue'
        },
        {
          icon: 'stoploss',
          label: '손절가',
          value: `$${stopLoss.toFixed(0)} (-${stopLossPercent}%)`,
          color: 'red'
        },
        {
          icon: 'target',
          label: '목표가',
          value: `$${target1.toFixed(0)}/${target2.toFixed(0)}/${target3.toFixed(0)}`,
          color: 'green'
        },
        {
          icon: 'timeframe',
          label: '권장 전략',
          value: timeframeStrategy,
          color: 'purple'
        }
      ],
      
      interpretation: `📊 종합 분석: ${symbol.replace('USDT', '')}의 시장 점수는 ${marketScore}점입니다.\n\n` +
        `💰 자금 플로우: ${netFlow > 0 ? `순매수 $${(netFlow/1000000).toFixed(2)}M` : `순매도 $${(Math.abs(netFlow)/1000000).toFixed(2)}M`} (${accumulationFlows.length}건 매수 vs ${distributionFlows.length}건 매도)\n` +
        `📈 가격 모멘텀: 24시간 ${priceChange24h > 0 ? '+' : ''}${priceChange24h.toFixed(2)}% 변동\n` +
        `📊 오더북 상태: ${orderBookImbalance > 0 ? `매수 우세 (${(orderBookImbalance * 100).toFixed(1)}%)` : `매도 우세 (${(Math.abs(orderBookImbalance) * 100).toFixed(1)}%)`}\n` +
        `😱 시장 심리: Fear & Greed ${fearGreedIndex} (${fearGreedIndex > 70 ? '극도의 탐욕' : fearGreedIndex > 50 ? '탐욕' : fearGreedIndex > 30 ? '공포' : '극도의 공포'})\n\n` +
        `🎯 트레이딩 전략:\n` +
        `• 진입: $${entryPrice.toFixed(0)} 근처에서 분할 매수\n` +
        `• 손절: $${stopLoss.toFixed(0)} (${stopLossPercent}% 손실 제한)\n` +
        `• 1차 목표: $${target1.toFixed(0)} (+${(stopLossPercent * 1.5).toFixed(1)}%)\n` +
        `• 2차 목표: $${target2.toFixed(0)} (+${(stopLossPercent * 3).toFixed(1)}%)\n` +
        `• 3차 목표: $${target3.toFixed(0)} (+${(stopLossPercent * 5).toFixed(1)}%)\n\n` +
        `⚖️ 리스크 관리:\n` +
        `• 권장 포지션: 전체 자본의 ${kellyPercentage.toFixed(1)}%\n` +
        `• 최대 레버리지: ${safeLeverage.toFixed(1)}x\n` +
        `• 손익비: 1:${((stopLossPercent * 3) / stopLossPercent).toFixed(1)}\n` +
        `• 시간대: ${timeframeStrategy}`,
      
      actionItems: [
        marketScore > 70 ? '🔥 즉시 진입 - 강한 상승 모멘텀' :
        marketScore > 55 ? '✅ 분할 매수 시작 - 긍정적 신호' :
        marketScore > 45 ? '⏳ 추가 확인 대기 - 중립 구간' :
        marketScore > 30 ? '⚠️ 매수 자제 - 약세 신호' :
        '🚨 포지션 정리 - 강한 하락 위험',
        
        `💰 포지션 크기: 자본의 ${kellyPercentage.toFixed(1)}% (최대 ${(kellyPercentage * 1.5).toFixed(1)}%)`,
        
        `📍 진입 전략: $${(entryPrice * 0.99).toFixed(0)}-${(entryPrice * 1.01).toFixed(0)} 구간에서 3분할 매수`,
        
        `🛡️ 리스크 관리: 손절가 $${stopLoss.toFixed(0)} 엄격 준수 (${stopLossPercent}% 손실 제한)`,
        
        `🎯 수익 실현: 1차 ${target1.toFixed(0)} (30% 매도) → 2차 ${target2.toFixed(0)} (40% 매도) → 3차 ${target3.toFixed(0)} (30% 매도)`,
        
        orderBookImbalance > 0.1 ? '📗 오더북 매수 우세 - 상승 지지' :
        orderBookImbalance < -0.1 ? '📕 오더북 매도 우세 - 하락 압력' :
        '📙 오더북 균형 - 방향성 대기',
        
        fearGreedIndex > 70 ? '😱 극도의 탐욕 - 조정 대비 필요' :
        fearGreedIndex < 30 ? '🔥 극도의 공포 - 역발상 매수 기회' :
        '📊 중립적 심리 - 기술적 분석 중시',
        
        `⏰ 모니터링: ${timeframeStrategy} 기준으로 포지션 관리`
      ]
    }
  }

  const getRiskAnalysis = () => {
    const riskLevel = data?.level || 'medium'
    const riskScore = data?.score || 50
    
    return {
      title: '⚠️ 리스크 종합 평가',
      mainInsight: `현재 리스크 수준: ${riskLevel.toUpperCase()} (${riskScore}/100)`,
      
      keyPoints: [
        {
          icon: 'risk',
          label: '리스크 레벨',
          value: riskLevel.toUpperCase(),
          color: riskLevel === 'low' ? 'green' : riskLevel === 'high' ? 'red' : 'yellow'
        },
        {
          icon: 'score',
          label: '리스크 점수',
          value: `${riskScore}/100`,
          color: riskScore < 40 ? 'green' : riskScore > 70 ? 'red' : 'yellow'
        },
        {
          icon: 'volatility',
          label: '변동성',
          value: data?.volatility > 0.03 ? '높음' : '정상',
          color: data?.volatility > 0.03 ? 'red' : 'green'
        }
      ],
      
      interpretation: '리스크 관리는 성공적인 트레이딩의 핵심입니다. ' +
        (riskLevel === 'high' ? '현재 높은 리스크로 보수적 접근이 필요합니다.' :
         riskLevel === 'low' ? '낮은 리스크로 적극적 포지션 가능합니다.' :
         '적정 리스크 수준으로 계획대로 진행하세요.'),
      
      actionItems: [
        riskLevel === 'high' ? '🛡️ 포지션 축소 및 손절선 강화' : '✅ 현재 전략 유지',
        '📊 포트폴리오 분산 고려',
        '⚡ 급변 상황 대비 계획 수립'
      ]
    }
  }

  const getBacktestAnalysis = () => {
    const winRate = data?.winRate || 0
    const avgProfit = data?.avgProfit || 0
    
    return {
      title: '📊 백테스트 결과 분석',
      mainInsight: `과거 데이터 기준 승률 ${winRate}%, 평균 수익 ${avgProfit}%`,
      
      keyPoints: [
        {
          icon: 'winrate',
          label: '승률',
          value: `${winRate}%`,
          color: winRate > 60 ? 'green' : winRate > 40 ? 'yellow' : 'red'
        },
        {
          icon: 'profit',
          label: '평균 수익',
          value: `${avgProfit}%`,
          color: avgProfit > 0 ? 'green' : 'red'
        },
        {
          icon: 'trades',
          label: '테스트 횟수',
          value: `${data?.totalTrades || 0}회`,
          color: 'blue'
        }
      ],
      
      interpretation: '백테스트는 과거 데이터 기반이며 미래를 보장하지 않습니다. ' +
        (winRate > 60 ? '높은 승률로 신뢰할 만한 전략입니다.' :
         '승률이 낮아 전략 개선이 필요합니다.'),
      
      actionItems: [
        winRate > 60 ? '✅ 전략 적용 고려' : '⚠️ 전략 재검토 필요',
        '📊 실전과 백테스트 결과 비교',
        '🔄 주기적 전략 업데이트'
      ]
    }
  }

  const getDefaultAnalysis = () => {
    return {
      title: '📈 시장 종합 분석',
      mainInsight: '실시간 데이터를 기반으로 분석 중입니다.',
      keyPoints: [],
      interpretation: '데이터가 수집되면 상세 분석이 제공됩니다.',
      actionItems: ['데이터 로딩 중...']
    }
  }

  const analysis = getAnalysis()

  const getIconComponent = (icon: string) => {
    switch(icon) {
      case 'trend': return <FaChartLine />
      case 'volume': return <FaArrowUp />
      case 'institution': return <FaCheckCircle />
      case 'spread': return <FaExchangeAlt />
      case 'depth': return <FaDatabase />
      case 'activity': return <FaRocket />
      default: return <FaInfoCircle />
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 backdrop-blur rounded-xl p-6 border border-purple-500/30 mt-6"
    >
      {/* 제목 */}
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <FaBrain className="text-purple-400" />
        {analysis.title}
      </h3>

      {/* 주요 인사이트 */}
      <div className="bg-gray-800/50 rounded-lg p-4 mb-4">
        <p className="text-lg text-white font-medium">
          {analysis.mainInsight}
        </p>
      </div>

      {/* 핵심 지표 */}
      {analysis.keyPoints.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {analysis.keyPoints.map((point, idx) => (
            <div key={idx} className="bg-gray-900/50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">{point.label}</span>
                <span className={`text-${point.color}-400`}>
                  {getIconComponent(point.icon)}
                </span>
              </div>
              <p className={`text-lg font-bold text-${point.color}-400`}>
                {point.value}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* 해석 */}
      <div className="bg-blue-900/20 rounded-lg p-4 mb-4 border border-blue-500/30">
        <div className="flex items-start gap-2">
          <FaLightbulb className="text-yellow-400 mt-1" />
          <div>
            <p className="text-sm font-semibold text-blue-300 mb-1">전문가 해석</p>
            <p className="text-sm text-gray-300 leading-relaxed">
              {analysis.interpretation}
            </p>
          </div>
        </div>
      </div>

      {/* 실행 권장사항 */}
      <div className="bg-gray-900/50 rounded-lg p-4">
        <p className="text-sm font-semibold text-gray-400 mb-2">💡 실행 권장사항</p>
        <div className="space-y-2">
          {analysis.actionItems.map((item, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <span className="text-xs text-gray-500 mt-0.5">•</span>
              <p className="text-sm text-gray-300">{item}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

// 필요한 아이콘 import 추가
import { FaExchangeAlt, FaDatabase } from 'react-icons/fa'