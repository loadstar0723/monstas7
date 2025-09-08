'use client'

import React from 'react'

interface VCAnalysisProps {
  data: any
  symbol?: string
  currentPrice?: number
}

export function getVCAnalysis(data: any, symbol: string = 'BTC', currentPrice: number = 0) {
  // 실제 데이터 추출
  const institutionalFlows = data?.institutionalFlows || []
  const priceChange = data?.priceChange || 0
  const volume24h = data?.volume24h || 0
  const selectedSymbol = data?.symbol || symbol
  
  // 코인별 VC/기관 거래 필터링 기준 
  const vcThreshold = selectedSymbol === 'BTC' ? 100000 :   // BTC: $100K 이상
                      selectedSymbol === 'ETH' ? 50000 :     // ETH: $50K 이상
                      selectedSymbol === 'SOL' ? 20000 :     // SOL: $20K 이상
                      selectedSymbol === 'BNB' ? 30000 :     // BNB: $30K 이상
                      10000                                   // 기타: $10K 이상
  
  const vcTransactions = institutionalFlows.filter((f: any) => 
    f.value > vcThreshold || 
    f.institution?.includes('Fund') || 
    f.institution?.includes('Institution') ||
    f.institution?.includes('Whale')
  )
  
  // 실제 매수/매도 분류
  const buyTransactions = vcTransactions.filter((t: any) => 
    t.type === 'accumulation' || t.type === 'buy'
  )
  const sellTransactions = vcTransactions.filter((t: any) => 
    t.type === 'distribution' || t.type === 'sell'
  )
  
  // 실제 메트릭 계산
  const totalVCVolume = vcTransactions.reduce((sum: number, t: any) => sum + (t.value || 0), 0)
  const avgVCTradeSize = vcTransactions.length > 0 ? totalVCVolume / vcTransactions.length : 0
  const vcBuyRatio = vcTransactions.length > 0 ? buyTransactions.length / vcTransactions.length : 0.5
  
  // 최근 1시간 추세 분석
  const lastHour = Date.now() - 3600000
  const recentTransactions = vcTransactions.filter((t: any) => t.timestamp > lastHour)
  const recentBuyVolume = recentTransactions
    .filter((t: any) => t.type === 'accumulation')
    .reduce((sum: number, t: any) => sum + t.value, 0)
  const recentSellVolume = recentTransactions
    .filter((t: any) => t.type === 'distribution')
    .reduce((sum: number, t: any) => sum + t.value, 0)
  
  // 코인별 개별 센티먼트 계산
  let vcSentimentScore = 50
  
  // 가격 변화 반영 (실시간)
  if (priceChange > 5) vcSentimentScore += 20
  else if (priceChange > 2) vcSentimentScore += 10
  else if (priceChange < -5) vcSentimentScore -= 20
  else if (priceChange < -2) vcSentimentScore -= 10
  
  // 실제 매수/매도 비율 반영
  if (vcBuyRatio > 0.7) vcSentimentScore += 25
  else if (vcBuyRatio > 0.6) vcSentimentScore += 15
  else if (vcBuyRatio < 0.3) vcSentimentScore -= 25
  else if (vcBuyRatio < 0.4) vcSentimentScore -= 15
  
  // 코인별 거래량 기준 (각 코인마다 다름)
  const volumeThreshold = selectedSymbol === 'BTC' ? 10000000 : 
                         selectedSymbol === 'ETH' ? 5000000 : 
                         selectedSymbol === 'SOL' ? 2000000 : 
                         selectedSymbol === 'BNB' ? 3000000 : 1000000
  
  if (totalVCVolume > volumeThreshold * 2) vcSentimentScore += 15
  else if (totalVCVolume > volumeThreshold) vcSentimentScore += 10
  else if (totalVCVolume < volumeThreshold / 2) vcSentimentScore -= 10
  
  // 최근 추세 반영
  if (recentBuyVolume > recentSellVolume * 2) vcSentimentScore += 15
  else if (recentBuyVolume > recentSellVolume * 1.5) vcSentimentScore += 10
  else if (recentSellVolume > recentBuyVolume * 2) vcSentimentScore -= 15
  else if (recentSellVolume > recentBuyVolume * 1.5) vcSentimentScore -= 10
  
  // 거래 활동 수준에 따른 조정
  if (vcTransactions.length > 20) vcSentimentScore += 10
  else if (vcTransactions.length > 10) vcSentimentScore += 5
  else if (vcTransactions.length < 5) vcSentimentScore -= 10
  
  vcSentimentScore = Math.max(0, Math.min(100, vcSentimentScore))
  
  // 투자 단계 판단
  const investmentPhase = vcSentimentScore > 70 ? '적극 매집' :
                         vcSentimentScore > 50 ? '점진적 매집' :
                         vcSentimentScore > 30 ? '관망' : '매도/이탈'
  
  // 거래 활동 수준
  const activityLevel = vcTransactions.length > 20 ? '매우 활발' :
                       vcTransactions.length > 10 ? '활발' :
                       vcTransactions.length > 5 ? '보통' : '저조'
  
  // 예측 신뢰도 계산 (실제 거래 수 기반)
  const predictionConfidence = vcTransactions.length > 30 ? '매우 높음' :
                              vcTransactions.length > 15 ? '높음' :
                              vcTransactions.length > 5 ? '중간' : '낮음'
  
  // 거래량 추세
  const volumeTrend = recentBuyVolume > recentSellVolume ? '상승' : 
                     recentSellVolume > recentBuyVolume ? '하락' : '중립'
  
  // 주요 거래 기관 식별
  const topInstitutions = vcTransactions
    .sort((a: any, b: any) => b.value - a.value)
    .slice(0, 3)
    .map((t: any) => t.institution || 'Unknown')
  
  return {
    title: `💼 ${selectedSymbol} VC/헤지펀드 실시간 분석`,
    mainInsight: `${selectedSymbol} VC 센티먼트: ${vcSentimentScore}/100 - ${investmentPhase} 단계\n` +
      `실시간: ${vcTransactions.length}건 대규모 거래 포착, ${(vcBuyRatio * 100).toFixed(0)}% 매수\n` +
      `현재가: $${currentPrice.toLocaleString()} (${priceChange >= 0 ? '+' : ''}${priceChange.toFixed(2)}%)\n` +
      `VC 거래량: $${(totalVCVolume/1000000).toFixed(1)}M (${activityLevel})`,
    
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
        color: volumeTrend === '상승' ? 'green' : volumeTrend === '하락' ? 'red' : 'gray'
      },
      {
        icon: 'ratio',
        label: '매수/매도 비율',
        value: `${(vcBuyRatio * 100).toFixed(0)}%/${((1-vcBuyRatio) * 100).toFixed(0)}%`,
        color: vcBuyRatio > 0.6 ? 'green' : vcBuyRatio < 0.4 ? 'red' : 'yellow'
      },
      {
        icon: 'activity',
        label: '거래 활동',
        value: activityLevel,
        color: vcTransactions.length > 20 ? 'purple' : vcTransactions.length > 10 ? 'blue' : 'gray'
      },
      {
        icon: 'confidence',
        label: '예측 신뢰도',
        value: predictionConfidence,
        color: predictionConfidence === '매우 높음' ? 'green' : predictionConfidence === '높음' ? 'blue' : predictionConfidence === '중간' ? 'yellow' : 'gray'
      },
      {
        icon: 'trend',
        label: '실시간 추세',
        value: volumeTrend,
        color: volumeTrend === '상승' ? 'green' : volumeTrend === '하락' ? 'red' : 'yellow'
      },
      {
        icon: 'average',
        label: '평균 거래 규모',
        value: avgVCTradeSize > 0 ? `$${(avgVCTradeSize/1000000).toFixed(2)}M` : '-',
        color: avgVCTradeSize > 5000000 ? 'purple' : avgVCTradeSize > 1000000 ? 'blue' : 'gray'
      }
    ],
    
    interpretation: `📊 ${selectedSymbol} 종합 분석:\n\n` +
      `💰 실시간 거래 패턴:\n` +
      `• 평균 거래 규모: $${avgVCTradeSize > 0 ? (avgVCTradeSize/1000000).toFixed(2) : '0.00'}M\n` +
      `• ${avgVCTradeSize > 5000000 ? '초대형 펀드 위주' : avgVCTradeSize > 1000000 ? '대형 펀드 활동' : '중소형 펀드 중심'}의 거래\n` +
      `• 최근 1시간: ${recentTransactions.length}건의 VC 거래 발생\n` +
      `• 1시간 매수량: $${(recentBuyVolume/1000000).toFixed(1)}M vs 매도량: $${(recentSellVolume/1000000).toFixed(1)}M\n\n` +
      
      `🏦 주요 활동 기관:\n` +
      (topInstitutions.length > 0 ? 
        topInstitutions.map((inst, idx) => `• ${idx + 1}. ${inst}`).join('\n') + '\n\n' :
        '• 현재 식별된 주요 기관 없음\n\n') +
      
      `📈 ${selectedSymbol} VC 행동 예측 (신뢰도: ${predictionConfidence}):\n` +
      (vcSentimentScore > 70 ? 
        `• 🚀 강력한 매집 신호 - 대규모 펀드들이 적극 매수 중\n` +
        `• 단기 목표가: $${(currentPrice * 1.15).toFixed(0)} (+15%)\n` +
        `• 중기 목표가: $${(currentPrice * 1.30).toFixed(0)} (+30%)` :
       vcSentimentScore > 50 ?
        `• ✅ 점진적 매집 - VC들이 조심스럽게 포지션 구축\n` +
        `• 단기 목표가: $${(currentPrice * 1.07).toFixed(0)} (+7%)\n` +
        `• 중기 목표가: $${(currentPrice * 1.15).toFixed(0)} (+15%)` :
       vcSentimentScore > 30 ?
        `• ⏳ 관망 단계 - VC들이 시장 방향성 관찰 중\n` +
        `• 예상 변동폭: $${(currentPrice * 0.95).toFixed(0)} ~ $${(currentPrice * 1.05).toFixed(0)}\n` +
        `• 추세 확인 후 진입 권장` :
        `• ⚠️ VC 이탈 신호 - 매도 압력 증가\n` +
        `• 하방 지지선: $${(currentPrice * 0.90).toFixed(0)} (-10%)\n` +
        `• 손절가: $${(currentPrice * 0.85).toFixed(0)} (-15%)`),
    
    actionItems: [
      // VC 센티먼트 기반 추천
      vcSentimentScore > 70 ? 
        `🚀 ${selectedSymbol} 적극 매수 - VC 따라하기 전략 즉시 실행` :
      vcSentimentScore > 50 ? 
        `✅ ${selectedSymbol} 점진적 매수 - 3-5회 분할 매수` :
      vcSentimentScore > 30 ? 
        `⏳ ${selectedSymbol} 관망 유지 - 추가 신호 확인 필요` :
        `⚠️ ${selectedSymbol} 매도/숏 포지션 - VC 이탈 진행 중`,
      
      // 거래량 기반 추천
      volumeTrend === '상승' ? 
        `📈 ${selectedSymbol} VC 자금 유입 증가 - 추세 추종` :
      volumeTrend === '하락' ?
        `📉 ${selectedSymbol} VC 자금 유출 - 리스크 관리 강화` :
        `➡️ ${selectedSymbol} 횡보 중 - 방향성 확인 대기`,
      
      // 구체적 포지션 전략
      vcBuyRatio > 0.7 ? 
        `💎 ${selectedSymbol} 장기 보유 포지션 80% 구축` :
      vcBuyRatio > 0.5 ?
        `⚖️ ${selectedSymbol} 중립 포지션 50% 유지` :
        `🛡️ ${selectedSymbol} 방어적 포지션 30% 이하`,
      
      // 리스크 관리
      `📊 손절가: $${(currentPrice * 0.95).toFixed(0)} (-5%) 설정`,
      
      // 실시간 모니터링
      activityLevel === '매우 활발' ?
        `🔥 ${selectedSymbol} VC 활동 급증 - 변동성 대비 필수` :
      activityLevel === '저조' ?
        `💤 ${selectedSymbol} VC 활동 저조 - 대기 모드` :
        `👀 ${selectedSymbol} 정상 활동 - 지속 모니터링`
    ]
  }
}