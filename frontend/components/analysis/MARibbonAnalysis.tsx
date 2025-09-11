'use client'

import React, { useMemo } from 'react'
import { TrendingUp, TrendingDown, Activity, AlertTriangle, CheckCircle } from 'lucide-react'

interface MARibbonAnalysisProps {
  ma5: number
  ma20: number
  ma50: number
  ma200: number
  currentPrice: number
  historicalData?: any[]
}

export default function MARibbonAnalysis({ 
  ma5, 
  ma20, 
  ma50, 
  ma200,
  currentPrice,
  historicalData = []
}: MARibbonAnalysisProps) {
  
  const analysis = useMemo(() => {
    const price = currentPrice || 0
    
    // 리본 상태 분석
    const analyzeRibbonState = () => {
      const mas = [
        { name: 'MA5', value: ma5 || price },
        { name: 'MA20', value: ma20 || price },
        { name: 'MA50', value: ma50 || price },
        { name: 'MA200', value: ma200 || price }
      ]
      
      // 완벽한 정배열 체크 (MA5 > MA20 > MA50 > MA200)
      const isPerfectBullish = mas[0].value > mas[1].value && 
                               mas[1].value > mas[2].value && 
                               mas[2].value > mas[3].value
      
      // 완벽한 역배열 체크 (MA5 < MA20 < MA50 < MA200)
      const isPerfectBearish = mas[0].value < mas[1].value && 
                              mas[1].value < mas[2].value && 
                              mas[2].value < mas[3].value
      
      if (isPerfectBullish) {
        return {
          alignment: '완벽한 정배열',
          signal: '강력한 상승 추세',
          color: 'text-green-500',
          score: 100
        }
      }
      
      if (isPerfectBearish) {
        return {
          alignment: '완벽한 역배열',
          signal: '강력한 하락 추세',
          color: 'text-red-500',
          score: -100
        }
      }
      
      // 부분 정배열/역배열 계산
      let bullishCount = 0
      if (mas[0].value > mas[1].value) bullishCount++
      if (mas[1].value > mas[2].value) bullishCount++
      if (mas[2].value > mas[3].value) bullishCount++
      
      if (bullishCount >= 2) {
        return {
          alignment: '부분 정배열',
          signal: '상승 추세 형성 중',
          color: 'text-blue-400',
          score: 50
        }
      }
      
      if (bullishCount <= 1) {
        return {
          alignment: '부분 역배열',
          signal: '하락 추세 형성 중',
          color: 'text-orange-400',
          score: -50
        }
      }
      
      return {
        alignment: '혼조 상태',
        signal: '추세 불명확',
        color: 'text-gray-400',
        score: 0
      }
    }
    
    // 리본 확산/수렴 분석
    const analyzeRibbonSpread = () => {
      // MA 간격 계산
      const spread5_20 = Math.abs(ma5 - ma20)
      const spread20_50 = Math.abs(ma20 - ma50)
      const spread50_200 = Math.abs(ma50 - ma200)
      
      // 평균 간격 대비 현재 간격 비율
      const avgSpread = (spread5_20 + spread20_50 + spread50_200) / 3
      const pricePercent = avgSpread / price * 100
      
      // 과거 데이터가 있으면 확산/수렴 추세 판단
      if (historicalData.length > 10) {
        const recentData = historicalData.slice(-10)
        const pastSpread = recentData.map(d => {
          const s1 = Math.abs((d.ma5 || price) - (d.ma20 || price))
          const s2 = Math.abs((d.ma20 || price) - (d.ma50 || price))
          const s3 = Math.abs((d.ma50 || price) - (d.ma200 || price))
          return (s1 + s2 + s3) / 3
        })
        
        const avgPastSpread = pastSpread.reduce((a, b) => a + b, 0) / pastSpread.length
        
        if (avgSpread > avgPastSpread * 1.2) {
          return { state: '확산', trend: '추세 강화 중', score: 20 }
        }
        if (avgSpread < avgPastSpread * 0.8) {
          return { state: '수렴', trend: '추세 약화 중', score: -20 }
        }
      }
      
      // 간격이 크면 확산, 작으면 수렴
      if (pricePercent > 3) {
        return { state: '확산', trend: '강한 추세', score: 15 }
      }
      if (pricePercent < 1) {
        return { state: '수렴', trend: '변곡점 임박', score: -15 }
      }
      
      return { state: '유지', trend: '안정적 추세', score: 0 }
    }
    
    // MA 크로스 분석
    const analyzeCrosses = () => {
      const crosses = []
      
      // 과거 데이터로 실제 크로스 감지
      if (historicalData.length > 1) {
        const current = historicalData[historicalData.length - 1]
        const previous = historicalData[historicalData.length - 2]
        
        if (current && previous) {
          // MA5/MA20 크로스 체크
          if (current.ma5 && current.ma20 && previous.ma5 && previous.ma20) {
            if ((previous.ma5 <= previous.ma20 && current.ma5 > current.ma20)) {
              crosses.push({
                type: '골든크로스',
                pair: 'MA5/MA20',
                signal: '단기 상승 크로스'
              })
            } else if ((previous.ma5 >= previous.ma20 && current.ma5 < current.ma20)) {
              crosses.push({
                type: '데드크로스',
                pair: 'MA5/MA20',
                signal: '단기 하락 크로스'
              })
            }
          }
          
          // MA20/MA50 크로스 체크
          if (current.ma20 && current.ma50 && previous.ma20 && previous.ma50) {
            if ((previous.ma20 <= previous.ma50 && current.ma20 > current.ma50)) {
              crosses.push({
                type: '골든크로스',
                pair: 'MA20/MA50',
                signal: '중기 상승 크로스'
              })
            } else if ((previous.ma20 >= previous.ma50 && current.ma20 < current.ma50)) {
              crosses.push({
                type: '데드크로스',
                pair: 'MA20/MA50',
                signal: '중기 하락 크로스'
              })
            }
          }
          
          // MA50/MA200 크로스 체크
          if (current.ma50 && current.ma200 && previous.ma50 && previous.ma200) {
            if ((previous.ma50 <= previous.ma200 && current.ma50 > current.ma200)) {
              crosses.push({
                type: '골든크로스',
                pair: 'MA50/MA200',
                signal: '장기 상승 크로스'
              })
            } else if ((previous.ma50 >= previous.ma200 && current.ma50 < current.ma200)) {
              crosses.push({
                type: '데드크로스',
                pair: 'MA50/MA200',
                signal: '장기 하락 크로스'
              })
            }
          }
        }
      }
      
      // 항상 MA 관계를 계산하여 표시
      const maRelations = []
      
      // MA5/MA20 관계 - 무조건 계산
      const ma5_20_spread = ((ma5 - ma20) / ma20 * 100)
      maRelations.push({
        pair: 'MA5/MA20',
        relation: ma5 > ma20 ? '상승 정렬' : '하락 정렬',
        spread: isFinite(ma5_20_spread) ? `${ma5_20_spread.toFixed(2)}%` : '0.00%',
        signal: ma5 > ma20 ? '단기 매수 우위' : '단기 매도 우위'
      })
      
      // MA20/MA50 관계 - 무조건 계산
      const ma20_50_spread = ((ma20 - ma50) / ma50 * 100)
      maRelations.push({
        pair: 'MA20/MA50',
        relation: ma20 > ma50 ? '상승 정렬' : '하락 정렬',
        spread: isFinite(ma20_50_spread) ? `${ma20_50_spread.toFixed(2)}%` : '0.00%',
        signal: ma20 > ma50 ? '중기 매수 우위' : '중기 매도 우위'
      })
      
      // MA50/MA200 관계 - 무조건 계산
      const ma50_200_spread = ((ma50 - ma200) / ma200 * 100)
      maRelations.push({
        pair: 'MA50/MA200',
        relation: ma50 > ma200 ? '상승 정렬' : '하락 정렬',
        spread: isFinite(ma50_200_spread) ? `${ma50_200_spread.toFixed(2)}%` : '0.00%',
        signal: ma50 > ma200 ? '장기 매수 우위' : '장기 매도 우위'
      })
      
      // 크로스가 있으면 크로스를 우선 반환, 없으면 관계를 반환
      return { 
        crosses: crosses, 
        relations: crosses.length > 0 ? [] : maRelations 
      }
    }
    
    // 가격 위치 분석
    const analyzePricePosition = () => {
      if (price > ma5 && price > ma20 && price > ma50 && price > ma200) {
        return { position: 'MA 리본 위', signal: '강세', color: 'text-green-500' }
      }
      if (price < ma5 && price < ma20 && price < ma50 && price < ma200) {
        return { position: 'MA 리본 아래', signal: '약세', color: 'text-red-500' }
      }
      if (price > ma50 && price > ma200) {
        return { position: 'MA 리본 중간', signal: '중립-강세', color: 'text-blue-400' }
      }
      if (price < ma50 && price < ma200) {
        return { position: 'MA 리본 중간', signal: '중립-약세', color: 'text-orange-400' }
      }
      return { position: 'MA 리본 내부', signal: '혼조', color: 'text-gray-400' }
    }
    
    // 트레이딩 제안 생성
    const getTradingSuggestion = () => {
      const ribbonState = analyzeRibbonState()
      const spread = analyzeRibbonSpread()
      const pricePos = analyzePricePosition()
      
      // 총 점수 계산
      const totalScore = ribbonState.score + spread.score
      
      // 동적 신뢰도 계산
      const calculateConfidence = () => {
        let baseConfidence = 50
        
        // 리본 상태에 따른 보정
        if (Math.abs(ribbonState.score) === 100) baseConfidence += 30
        else if (Math.abs(ribbonState.score) === 50) baseConfidence += 15
        
        // 확산/수렴에 따른 보정
        if (spread.state === '확산' && Math.abs(ribbonState.score) > 0) baseConfidence += 10
        if (spread.state === '수렴') baseConfidence -= 10
        
        // 가격 위치에 따른 보정
        if ((pricePos.signal === '강세' && ribbonState.score > 0) ||
            (pricePos.signal === '약세' && ribbonState.score < 0)) {
          baseConfidence += 10
        }
        
        return Math.max(10, Math.min(90, baseConfidence))
      }
      
      const confidence = calculateConfidence()
      
      // 변동성 기반 목표가/손절가 계산
      const calculateTargets = (direction: 'long' | 'short') => {
        const volatility = historicalData.length > 10
          ? historicalData.slice(-10).reduce((sum, d, i, arr) => {
              if (i === 0) return sum
              const change = Math.abs(d.close - arr[i-1].close) / arr[i-1].close
              return sum + change
            }, 0) / 10 || 0.02
          : 0.02
        
        const targetPercent = volatility * 100 * (confidence > 70 ? 3 : confidence > 50 ? 2 : 1.5)
        const stopPercent = volatility * 100 * 1.5
        
        if (direction === 'long') {
          return {
            target: price * (1 + targetPercent / 100),
            stopLoss: ma20 < price ? ma20 : price * (1 - stopPercent / 100),
            targetPct: targetPercent.toFixed(1),
            stopPct: stopPercent.toFixed(1)
          }
        } else {
          return {
            target: price * (1 - targetPercent / 100),
            stopLoss: ma20 > price ? ma20 : price * (1 + stopPercent / 100),
            targetPct: targetPercent.toFixed(1),
            stopPct: stopPercent.toFixed(1)
          }
        }
      }
      
      // 레버리지 계산
      const leverage = confidence > 70 ? '2-3x' : confidence > 50 ? '1-2x' : '1x'
      
      if (totalScore > 70 && pricePos.signal === '강세') {
        const targets = calculateTargets('long')
        return {
          action: '롱 포지션',
          reason: `${ribbonState.alignment} + ${pricePos.position}`,
          entry: `진입가: ${price.toFixed(2)} USDT`,
          target: `목표가: ${targets.target.toFixed(2)} USDT (+${targets.targetPct}%)`,
          stopLoss: `손절가: ${targets.stopLoss.toFixed(2)} USDT (${targets.stopLoss < price ? '-' : '+'}${targets.stopPct}%)`,
          leverage: `레버리지: ${leverage} 권장`,
          confidence
        }
      }
      
      if (totalScore < -70 && pricePos.signal === '약세') {
        const targets = calculateTargets('short')
        return {
          action: '숏 포지션',
          reason: `${ribbonState.alignment} + ${pricePos.position}`,
          entry: `진입가: ${price.toFixed(2)} USDT`,
          target: `목표가: ${targets.target.toFixed(2)} USDT (-${targets.targetPct}%)`,
          stopLoss: `손절가: ${targets.stopLoss.toFixed(2)} USDT (${targets.stopLoss > price ? '+' : '-'}${targets.stopPct}%)`,
          leverage: `레버리지: ${leverage} 권장`,
          confidence
        }
      }
      
      if (spread.state === '수렴') {
        return {
          action: '관망',
          reason: `리본 ${spread.state} - ${spread.trend}`,
          entry: '진입 대기',
          target: '추세 확인 필요',
          stopLoss: '포지션 없음',
          leverage: '0x',
          confidence: 30
        }
      }
      
      return {
        action: '중립',
        reason: '명확한 신호 부재',
        entry: '진입 대기',
        target: '추가 확인 필요',
        stopLoss: '포지션 없음',
        leverage: '0x',
        confidence: 40
      }
    }
    
    const ribbonState = analyzeRibbonState()
    const spread = analyzeRibbonSpread()
    const crossData = analyzeCrosses() || { crosses: [], relations: [] }
    const pricePosition = analyzePricePosition()
    const suggestion = getTradingSuggestion()
    
    // 디버깅 로그 추가
    if (typeof window !== 'undefined') {
      console.log('MA Ribbon Debug:', {
        ma5, ma20, ma50, ma200,
        crossData,
        hasRelations: crossData?.relations?.length > 0,
        relationData: crossData?.relations
      })
    }
    
    // 주요 지지/저항 레벨
    const supportResistance = {
      primary: { level: ma20, label: 'MA20 (1차 지지)' },
      secondary: { level: ma50, label: 'MA50 (2차 지지)' },
      major: { level: ma200, label: 'MA200 (주요 지지)' }
    }
    
    return {
      ribbonState,
      spread,
      crossData,
      pricePosition,
      suggestion,
      supportResistance
    }
  }, [ma5, ma20, ma50, ma200, currentPrice, historicalData])
  
  return (
    <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          📈 MA 리본 실시간 분석
          <Activity className="w-4 h-4 text-purple-400" />
        </h3>
        <div className="text-right">
          <div className="text-xs text-gray-400">리본 상태</div>
          <div className={`text-sm font-bold ${analysis.ribbonState.color}`}>
            {analysis.ribbonState.alignment}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {/* MA 크로스 또는 관계 상태 표시 */}
        <div className="bg-gray-800/30 rounded p-3">
          <div className="text-sm text-gray-400 mb-2">MA 크로스 신호</div>
          {(() => {
            // 실제 크로스가 있는 경우
            if (analysis.crossData?.crosses?.length > 0) {
              return (
                <div className="space-y-2">
                  {analysis.crossData.crosses.map((cross, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        {cross.type === '골든크로스' ? 
                          <TrendingUp className="w-4 h-4 text-green-400" /> :
                          <TrendingDown className="w-4 h-4 text-red-400" />
                        }
                        <span className="font-bold text-white">{cross.pair}</span>
                      </div>
                      <span className="text-gray-300">{cross.signal}</span>
                    </div>
                  ))}
                </div>
              )
            }
            // 크로스가 없고 관계 상태가 있는 경우
            else if (analysis.crossData?.relations?.length > 0) {
              return (
                <div className="space-y-2">
                  {analysis.crossData.relations.map((relation, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">{relation.pair}:</span>
                        <span className={relation.relation === '상승 정렬' ? 'text-green-400' : 'text-red-400'}>
                          {relation.relation}
                        </span>
                        <span className="text-gray-400">({relation.spread})</span>
                      </div>
                      <span className={relation.signal?.includes('매수') ? 'text-blue-400' : 'text-orange-400'}>
                        {relation.signal}
                      </span>
                    </div>
                  ))}
                </div>
              )
            }
            // 데이터가 없는 경우
            else {
              return <div className="text-xs text-gray-500">크로스 신호 감지 중...</div>
            }
          })()}
        </div>

        {/* 리본 상태 */}
        <div className="bg-gray-800/30 rounded p-3">
          <div className="text-sm text-gray-400 mb-2">리본 상태</div>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-gray-500">정렬:</span>
              <span className={`ml-2 font-bold ${analysis.ribbonState.color}`}>
                {analysis.ribbonState.alignment}
              </span>
            </div>
            <div>
              <span className="text-gray-500">신호:</span>
              <span className="text-white ml-2">{analysis.ribbonState.signal}</span>
            </div>
            <div>
              <span className="text-gray-500">확산:</span>
              <span className="text-white ml-2">{analysis.spread.state}</span>
            </div>
            <div>
              <span className="text-gray-500">가격 위치:</span>
              <span className={`ml-2 ${analysis.pricePosition.color}`}>
                {analysis.pricePosition.position}
              </span>
            </div>
          </div>
        </div>

        {/* MA 리본 해석 */}
        <div className="bg-blue-900/20 border border-blue-500/30 rounded p-3">
          <div className="text-sm text-blue-400 mb-1">MA 리본 해석</div>
          <div className="text-xs text-gray-300 space-y-1">
            <div>• 정배열: 단기MA &gt; 장기MA (상승추세)</div>
            <div>• 역배열: 단기MA &lt; 장기MA (하락추세)</div>
            <div>• 리본 확산: 추세 강화</div>
            <div>• 리본 수렴: 추세 약화 또는 전환</div>
            <div>• 골든크로스: MA50 &gt; MA200 돌파</div>
          </div>
        </div>

        {/* 트레이딩 제안 */}
        <div className={`bg-gradient-to-r ${
          analysis.suggestion.confidence > 60 ? 'from-green-900/30' :
          analysis.suggestion.confidence > 40 ? 'from-yellow-900/30' :
          'from-gray-900/30'
        } to-transparent rounded p-3 border ${
          analysis.suggestion.confidence > 60 ? 'border-green-500/30' :
          analysis.suggestion.confidence > 40 ? 'border-yellow-500/30' :
          'border-gray-500/30'
        }`}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs text-gray-400">트레이딩 제안</span>
                <span className="text-xs text-gray-400">신뢰도</span>
                <span className={`text-sm font-bold ${
                  analysis.suggestion.confidence > 60 ? 'text-green-400' :
                  analysis.suggestion.confidence > 40 ? 'text-yellow-400' :
                  'text-gray-400'
                }`}>
                  {analysis.suggestion.confidence}%
                </span>
              </div>
              <div className="text-sm font-bold text-white mb-1">
                {analysis.suggestion.action}
              </div>
              <div className="text-xs text-gray-400 space-y-1">
                <div>• 근거: {analysis.suggestion.reason}</div>
                <div>• {analysis.suggestion.entry}</div>
                <div>• {analysis.suggestion.target}</div>
                <div>• {analysis.suggestion.stopLoss}</div>
                <div>• {analysis.suggestion.leverage}</div>
              </div>
            </div>
          </div>
        </div>

        {/* 주요 지지/저항 */}
        <div className="bg-gray-800/30 rounded p-3">
          <div className="text-sm text-gray-400 mb-2">주요 지지/저항</div>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-500">{analysis.supportResistance.primary.label}</span>
              <span className="text-white">{analysis.supportResistance.primary.level.toFixed(2)} USDT</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">{analysis.supportResistance.secondary.label}</span>
              <span className="text-white">{analysis.supportResistance.secondary.level.toFixed(2)} USDT</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">{analysis.supportResistance.major.label}</span>
              <span className="text-white">{analysis.supportResistance.major.level.toFixed(2)} USDT</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}