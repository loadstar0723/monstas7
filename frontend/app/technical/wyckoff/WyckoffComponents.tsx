'use client'

import { motion } from 'framer-motion'
import { 
  FaExclamationCircle, FaCheckCircle, FaTimesCircle, FaInfoCircle,
  FaChartLine, FaChartBar, FaArrowUp, FaArrowDown, FaBullseye
} from 'react-icons/fa'
import { 
  WyckoffAnalysis, WyckoffEvent, WyckoffPhase, 
  WyckoffIndicators, OHLCVData 
} from './WyckoffTypes'
import { Line, Bar } from 'recharts'
import {
  LineChart, BarChart, ResponsiveContainer, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend
} from 'recharts'

// 이벤트 아이콘 매핑
const EVENT_ICONS: Record<WyckoffEvent, React.ReactNode> = {
  [WyckoffEvent.PS]: <FaInfoCircle className="text-blue-400" />,
  [WyckoffEvent.SC]: <FaTimesCircle className="text-red-500" />,
  [WyckoffEvent.AR]: <FaArrowUp className="text-green-400" />,
  [WyckoffEvent.ST]: <FaCheckCircle className="text-yellow-400" />,
  [WyckoffEvent.Spring]: <FaExclamationCircle className="text-purple-400" />,
  [WyckoffEvent.LPS]: <FaBullseye className="text-green-500" />,
  [WyckoffEvent.SOS]: <FaChartLine className="text-blue-500" />,
  [WyckoffEvent.UTAD]: <FaExclamationCircle className="text-orange-500" />,
  [WyckoffEvent.LPSY]: <FaArrowDown className="text-red-400" />,
  [WyckoffEvent.SOW]: <FaChartBar className="text-red-600" />
}

// 단계별 설명
const PHASE_DESCRIPTIONS = {
  [WyckoffPhase.Accumulation]: {
    title: '축적 단계 (Accumulation)',
    description: '스마트머니가 조용히 물량을 축적하는 단계입니다.',
    characteristics: [
      '가격이 일정 범위 내에서 횡보',
      '일반 투자자들의 관심이 낮음',
      '매도 압력이 점진적으로 감소',
      '거래량이 하락 시보다 상승 시 증가'
    ],
    signals: [
      'PS (Preliminary Support): 첫 지지 신호',
      'SC (Selling Climax): 패닉 매도의 정점',
      'AR (Automatic Rally): SC 후 자동 반등',
      'ST (Secondary Test): SC 저점 재테스트',
      'Spring: 지지선 하향 돌파 후 즉시 반등'
    ],
    strategy: '분할 매수로 포지션 구축, Spring 이후 본격 진입'
  },
  [WyckoffPhase.Markup]: {
    title: '마크업 단계 (Markup)',
    description: '가격이 본격적으로 상승하는 추세 단계입니다.',
    characteristics: [
      '지속적인 고점 경신',
      '거래량 증가와 함께 상승',
      '일반 투자자들의 관심 증가',
      '긍정적인 뉴스와 분석 증가'
    ],
    signals: [
      'LPS 돌파로 상승 시작',
      'Higher Highs & Higher Lows',
      'Backup to Creek: 지지선 테스트',
      '강한 모멘텀 지속'
    ],
    strategy: '추세 추종, 되돌림에서 추가 매수, 트레일링 스탑 활용'
  },
  [WyckoffPhase.Distribution]: {
    title: '분산 단계 (Distribution)',
    description: '스마트머니가 물량을 처분하는 단계입니다.',
    characteristics: [
      '고점 근처에서 횡보',
      '상승 시 거래량 감소',
      '하락 시 거래량 증가',
      '변동성 증가'
    ],
    signals: [
      'PSY (Preliminary Supply): 첫 공급 과잉',
      'BC (Buying Climax): 매수 절정',
      'AR (Automatic Reaction): BC 후 자동 하락',
      'UTAD: 가짜 돌파 후 급락'
    ],
    strategy: '수익 실현, 포지션 축소, 숏 포지션 고려'
  },
  [WyckoffPhase.Markdown]: {
    title: '마크다운 단계 (Markdown)',
    description: '가격이 본격적으로 하락하는 단계입니다.',
    characteristics: [
      '지속적인 저점 갱신',
      '패닉 매도와 손절',
      '부정적인 뉴스 증가',
      '극도의 공포심리'
    ],
    signals: [
      'LPSY 붕괴로 하락 시작',
      'Lower Lows & Lower Highs',
      'Dead Cat Bounce: 약한 반등',
      'Selling Climax로 바닥 형성'
    ],
    strategy: '현금 보유, 다음 축적 단계 대기, 역발상 투자 준비'
  },
  [WyckoffPhase.Unknown]: {
    title: '불명확 단계',
    description: '현재 시장 단계를 명확히 판단하기 어려운 상태입니다.',
    characteristics: [
      '혼재된 시그널',
      '방향성 부재',
      '낮은 신뢰도'
    ],
    signals: [],
    strategy: '관망, 추가 신호 대기'
  }
}

export default function WyckoffComponents({
  analysis,
  indicators,
  currentPrice,
  historicalData
}: {
  analysis: WyckoffAnalysis
  indicators: WyckoffIndicators | null
  currentPrice: number
  historicalData: OHLCVData[]
}) {
  const phaseInfo = PHASE_DESCRIPTIONS[analysis.phase]
  
  // 최근 이벤트 정렬
  const recentEvents = [...analysis.events].sort((a, b) => {
    const timeA = typeof a.time === 'string' ? new Date(a.time).getTime() : a.time
    const timeB = typeof b.time === 'string' ? new Date(b.time).getTime() : b.time
    return timeB - timeA
  }).slice(0, 5)
  
  // 단계별 진행 상황 차트 데이터
  const phaseProgressData = [
    { name: 'Accumulation', value: analysis.phase === WyckoffPhase.Accumulation ? analysis.phaseProgress : 0 },
    { name: 'Markup', value: analysis.phase === WyckoffPhase.Markup ? analysis.phaseProgress : 0 },
    { name: 'Distribution', value: analysis.phase === WyckoffPhase.Distribution ? analysis.phaseProgress : 0 },
    { name: 'Markdown', value: analysis.phase === WyckoffPhase.Markdown ? analysis.phaseProgress : 0 }
  ]
  
  return (
    <div className="space-y-6">
      {/* 현재 단계 상세 설명 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800/50 rounded-xl p-6"
      >
        <h3 className="text-2xl font-bold text-white mb-4">{phaseInfo.title}</h3>
        <p className="text-gray-300 mb-6">{phaseInfo.description}</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 특징 */}
          <div>
            <h4 className="text-lg font-semibold text-purple-400 mb-3">주요 특징</h4>
            <ul className="space-y-2">
              {phaseInfo.characteristics.map((char, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                  <span className="text-purple-400 mt-1">•</span>
                  <span>{char}</span>
                </li>
              ))}
            </ul>
          </div>
          
          {/* 신호 */}
          <div>
            <h4 className="text-lg font-semibold text-purple-400 mb-3">주요 신호</h4>
            <ul className="space-y-2">
              {phaseInfo.signals.map((signal, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                  <span className="text-purple-400 mt-1">•</span>
                  <span>{signal}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* 전략 */}
        <div className="mt-6 p-4 bg-purple-900/20 rounded-lg border border-purple-700/50">
          <h4 className="text-lg font-semibold text-purple-400 mb-2">추천 전략</h4>
          <p className="text-sm text-gray-300">{phaseInfo.strategy}</p>
        </div>
      </motion.div>
      
      {/* 최근 와이코프 이벤트 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gray-800/50 rounded-xl p-6"
      >
        <h3 className="text-xl font-bold text-white mb-4">최근 감지된 와이코프 이벤트</h3>
        {recentEvents.length > 0 ? (
          <div className="space-y-3">
            {recentEvents.map((event, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-start gap-4 p-4 bg-gray-700/50 rounded-lg"
              >
                <div className="text-2xl">{EVENT_ICONS[event.event]}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-lg font-semibold text-white">{event.event}</h4>
                    <span className="text-sm text-gray-400">
                      ${event.price.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-300 mb-1">{event.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">
                      {typeof event.time === 'string' ? event.time : new Date(event.time).toLocaleTimeString()}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      event.confidence >= 80 ? 'bg-green-900/50 text-green-400' :
                      event.confidence >= 60 ? 'bg-yellow-900/50 text-yellow-400' :
                      'bg-red-900/50 text-red-400'
                    }`}>
                      신뢰도 {event.confidence}%
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-center py-8">
            최근 감지된 와이코프 이벤트가 없습니다.
          </p>
        )}
      </motion.div>
      
      {/* 주요 가격 레벨 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gray-800/50 rounded-xl p-6"
      >
        <h3 className="text-xl font-bold text-white mb-4">주요 가격 레벨</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 저항선 */}
          <div>
            <h4 className="text-lg font-semibold text-red-400 mb-3">저항선 (Resistance)</h4>
            <div className="space-y-2">
              {analysis.keyLevels.resistance.length > 0 ? (
                analysis.keyLevels.resistance.map((level, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-red-900/20 rounded-lg">
                    <span className="text-sm text-gray-300">저항 {i + 1}</span>
                    <span className="font-semibold text-white">${level.toFixed(2)}</span>
                    <span className={`text-xs ${
                      currentPrice < level ? 'text-gray-400' : 'text-green-400'
                    }`}>
                      {((level - currentPrice) / currentPrice * 100).toFixed(1)}%
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-sm">저항선이 감지되지 않았습니다.</p>
              )}
            </div>
          </div>
          
          {/* 지지선 */}
          <div>
            <h4 className="text-lg font-semibold text-green-400 mb-3">지지선 (Support)</h4>
            <div className="space-y-2">
              {analysis.keyLevels.support.length > 0 ? (
                analysis.keyLevels.support.map((level, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-green-900/20 rounded-lg">
                    <span className="text-sm text-gray-300">지지 {i + 1}</span>
                    <span className="font-semibold text-white">${level.toFixed(2)}</span>
                    <span className={`text-xs ${
                      currentPrice > level ? 'text-gray-400' : 'text-red-400'
                    }`}>
                      {((level - currentPrice) / currentPrice * 100).toFixed(1)}%
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-sm">지지선이 감지되지 않았습니다.</p>
              )}
            </div>
          </div>
        </div>
        
        {/* 현재 레인지 */}
        <div className="mt-6 p-4 bg-gray-700/50 rounded-lg">
          <h4 className="text-sm font-semibold text-gray-400 mb-2">현재 거래 범위</h4>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-300">
              ${analysis.keyLevels.currentRange.low.toFixed(2)} - ${analysis.keyLevels.currentRange.high.toFixed(2)}
            </span>
            <span className="text-sm text-purple-400">
              범위: {((analysis.keyLevels.currentRange.high - analysis.keyLevels.currentRange.low) / 
                     analysis.keyLevels.currentRange.low * 100).toFixed(1)}%
            </span>
          </div>
          <div className="mt-2 relative h-2 bg-gray-600 rounded-full">
            <div 
              className="absolute h-2 bg-purple-500 rounded-full"
              style={{
                left: '0%',
                width: `${((currentPrice - analysis.keyLevels.currentRange.low) / 
                         (analysis.keyLevels.currentRange.high - analysis.keyLevels.currentRange.low) * 100)}%`
              }}
            />
            <div 
              className="absolute w-1 h-4 bg-white rounded -top-1"
              style={{
                left: `${((currentPrice - analysis.keyLevels.currentRange.low) / 
                        (analysis.keyLevels.currentRange.high - analysis.keyLevels.currentRange.low) * 100)}%`,
                transform: 'translateX(-50%)'
              }}
            />
          </div>
        </div>
      </motion.div>
      
      {/* 볼륨 분석 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gray-800/50 rounded-xl p-6"
      >
        <h3 className="text-xl font-bold text-white mb-4">볼륨 분석</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-700/50 rounded-lg text-center">
            <h4 className="text-sm font-semibold text-gray-400 mb-2">볼륨 추세</h4>
            <p className={`text-2xl font-bold ${
              analysis.volumeAnalysis.trend === 'increasing' ? 'text-green-400' :
              analysis.volumeAnalysis.trend === 'decreasing' ? 'text-red-400' : 'text-gray-400'
            }`}>
              {analysis.volumeAnalysis.trend === 'increasing' ? '증가 📈' :
               analysis.volumeAnalysis.trend === 'decreasing' ? '감소 📉' : '안정 ➡️'}
            </p>
          </div>
          
          <div className="p-4 bg-gray-700/50 rounded-lg text-center">
            <h4 className="text-sm font-semibold text-gray-400 mb-2">Effort vs Result</h4>
            <p className={`text-2xl font-bold ${
              analysis.volumeAnalysis.effortVsResult === 'aligned' ? 'text-green-400' : 'text-yellow-400'
            }`}>
              {analysis.volumeAnalysis.effortVsResult === 'aligned' ? '일치 ✅' : '다이버전스 ⚠️'}
            </p>
          </div>
          
          <div className="p-4 bg-gray-700/50 rounded-lg text-center">
            <h4 className="text-sm font-semibold text-gray-400 mb-2">스마트머니</h4>
            <p className={`text-2xl font-bold ${
              analysis.volumeAnalysis.smartMoneyFlow === 'accumulating' ? 'text-green-400' :
              analysis.volumeAnalysis.smartMoneyFlow === 'distributing' ? 'text-red-400' : 'text-gray-400'
            }`}>
              {analysis.volumeAnalysis.smartMoneyFlow === 'accumulating' ? '축적 💰' :
               analysis.volumeAnalysis.smartMoneyFlow === 'distributing' ? '분산 📤' : '중립 ⚖️'}
            </p>
          </div>
        </div>
        
        {/* 볼륨 해석 */}
        <div className="mt-4 p-4 bg-purple-900/20 rounded-lg border border-purple-700/50">
          <h4 className="text-sm font-semibold text-purple-400 mb-2">볼륨 해석</h4>
          <p className="text-sm text-gray-300">
            {analysis.volumeAnalysis.effortVsResult === 'divergent' 
              ? '⚠️ 주의: 볼륨과 가격 움직임이 일치하지 않습니다. 추세 전환 가능성이 있습니다.'
              : '✅ 정상: 볼륨과 가격 움직임이 일치하여 현재 추세가 건전합니다.'}
            {' '}
            {analysis.volumeAnalysis.smartMoneyFlow === 'accumulating' 
              ? '스마트머니가 축적 중이므로 상승 가능성이 있습니다.'
              : analysis.volumeAnalysis.smartMoneyFlow === 'distributing'
              ? '스마트머니가 물량을 처분 중이므로 하락 가능성이 있습니다.'
              : '스마트머니의 뚜렷한 방향성이 보이지 않습니다.'}
          </p>
        </div>
      </motion.div>
      
      {/* 다음 단계 예측 */}
      {analysis.nextPhasesPrediction && analysis.nextPhasesPrediction.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gray-800/50 rounded-xl p-6"
        >
          <h3 className="text-xl font-bold text-white mb-4">다음 단계 예측</h3>
          <div className="space-y-3">
            {analysis.nextPhasesPrediction.map((prediction, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                <div>
                  <h4 className="font-semibold text-white">
                    {PHASE_DESCRIPTIONS[prediction.phase].title.split(' ')[0]}
                  </h4>
                  <p className="text-sm text-gray-400">예상 기간: {prediction.timeframe}</p>
                </div>
                <div className="text-right">
                  <div className={`text-2xl font-bold ${
                    prediction.probability >= 70 ? 'text-green-400' :
                    prediction.probability >= 50 ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {prediction.probability}%
                  </div>
                  <p className="text-xs text-gray-400">확률</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
      
      {/* 단계별 진행 상황 시각화 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-gray-800/50 rounded-xl p-6"
      >
        <h3 className="text-xl font-bold text-white mb-4">와이코프 사이클 진행 상황</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={phaseProgressData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9ca3af" tick={{ fontSize: 12 }} />
              <YAxis stroke="#9ca3af" tick={{ fontSize: 12 }} domain={[0, 100]} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: '1px solid #374151',
                  borderRadius: '0.5rem'
                }}
                formatter={(value: any) => [`${value}%`, '진행도']}
              />
              <Bar dataKey="value" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  )
}