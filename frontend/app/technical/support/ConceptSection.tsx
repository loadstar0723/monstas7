'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { 
  FaGraduationCap, FaLightbulb, FaChartLine, FaBalanceScale,
  FaExclamationTriangle, FaCheckCircle, FaBook, FaTrophy
} from 'react-icons/fa'

interface ConceptCardProps {
  title: string
  icon: React.ReactNode
  description: string
  points: string[]
  color: string
}

const ConceptCard: React.FC<ConceptCardProps> = ({ title, icon, description, points, color }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-all"
    >
      <div className={`flex items-center gap-3 mb-4 text-${color}-400`}>
        {icon}
        <h3 className="text-xl font-bold text-white">{title}</h3>
      </div>
      <p className="text-gray-300 mb-4">{description}</p>
      <ul className="space-y-2">
        {points.map((point, index) => (
          <li key={index} className="flex items-start gap-2">
            <span className={`text-${color}-400 mt-1`}>▸</span>
            <span className="text-gray-400 text-sm">{point}</span>
          </li>
        ))}
      </ul>
    </motion.div>
  )
}

export const ConceptSection: React.FC<{ currentPrice: number }> = ({ currentPrice }) => {
  // 동적 분석 생성
  const getDynamicAnalysis = () => {
    const hour = new Date().getHours()
    const isAsianSession = hour >= 0 && hour < 8
    const isEuropeanSession = hour >= 8 && hour < 16
    const isAmericanSession = hour >= 16 && hour < 24

    let sessionAnalysis = ''
    if (isAsianSession) sessionAnalysis = '아시아 세션: 낮은 변동성으로 레벨 형성 중'
    else if (isEuropeanSession) sessionAnalysis = '유럽 세션: 중간 변동성으로 레벨 테스트 활발'
    else sessionAnalysis = '미국 세션: 높은 변동성으로 돌파 가능성 증가'

    return {
      session: sessionAnalysis,
      priceAction: currentPrice > 50000 ? '강세 구간에서 저항 돌파 시도' : '조정 구간에서 지지선 방어 중요',
      recommendation: '현재 레벨 근처에서 거래량 증가 관찰 필요'
    }
  }

  const analysis = getDynamicAnalysis()

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 p-6 rounded-xl border border-purple-500/30"
      >
        <h2 className="text-2xl font-bold text-white mb-3 flex items-center gap-2">
          <FaGraduationCap className="text-purple-400" />
          지지/저항 개념 완벽 이해
        </h2>
        <p className="text-gray-300">
          지지선과 저항선은 기술적 분석의 핵심 개념으로, 가격이 반전되거나 정체되는 중요한 가격대를 의미합니다.
        </p>
      </motion.div>

      {/* 동적 분석 알림 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4"
      >
        <div className="flex items-center gap-2 mb-2">
          <FaLightbulb className="text-yellow-400" />
          <span className="text-white font-semibold">실시간 시장 분석</span>
        </div>
        <div className="space-y-1 text-sm">
          <p className="text-gray-300">• {analysis.session}</p>
          <p className="text-gray-300">• {analysis.priceAction}</p>
          <p className="text-yellow-400">• {analysis.recommendation}</p>
        </div>
      </motion.div>

      {/* 개념 카드 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ConceptCard
          title="지지선 (Support)"
          icon={<FaBalanceScale className="text-2xl" />}
          color="green"
          description="가격이 하락을 멈추고 반등하는 가격대"
          points={[
            "매수 세력이 강한 구간",
            "이전 저점이나 심리적 가격대에 형성",
            "여러 번 테스트될수록 강도 증가",
            "돌파 시 저항선으로 역할 전환"
          ]}
        />

        <ConceptCard
          title="저항선 (Resistance)"
          icon={<FaChartLine className="text-2xl" />}
          color="red"
          description="가격 상승이 제한되고 하락 전환되는 가격대"
          points={[
            "매도 압력이 집중되는 구간",
            "이전 고점이나 라운드 넘버에 형성",
            "돌파 시 추가 상승 모멘텀 발생",
            "돌파 후 지지선으로 전환 가능"
          ]}
        />

        <ConceptCard
          title="레벨 강도 측정"
          icon={<FaTrophy className="text-2xl" />}
          color="purple"
          description="지지/저항 레벨의 신뢰도 평가 방법"
          points={[
            "터치 횟수: 많을수록 강함",
            "거래량: 높을수록 중요",
            "시간: 오래될수록 의미 있음",
            "반응 정도: 큰 반등/하락일수록 강함"
          ]}
        />

        <ConceptCard
          title="돌파 신호"
          icon={<FaCheckCircle className="text-2xl" />}
          color="blue"
          description="레벨 돌파를 확인하는 핵심 신호"
          points={[
            "거래량 급증과 함께 돌파",
            "종가 기준 확실한 돌파",
            "재테스트 후 지지/저항 전환",
            "이동평균선과 함께 돌파"
          ]}
        />

        <ConceptCard
          title="거짓 돌파 구별"
          icon={<FaExclamationTriangle className="text-2xl" />}
          color="yellow"
          description="속임수 돌파를 피하는 방법"
          points={[
            "낮은 거래량 돌파는 의심",
            "빠른 회귀는 거짓 신호",
            "뉴스 없는 급변동 주의",
            "여러 시간대 확인 필수"
          ]}
        />

        <ConceptCard
          title="트레이딩 전략"
          icon={<FaBook className="text-2xl" />}
          color="indigo"
          description="지지/저항을 활용한 실전 매매"
          points={[
            "지지선 근처 매수, 저항선 근처 매도",
            "돌파 시 추세 추종 진입",
            "손절선은 레벨 바로 아래/위",
            "Risk/Reward 최소 1:2 이상"
          ]}
        />
      </div>

      {/* 핵심 원리 설명 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
      >
        <h3 className="text-xl font-bold text-white mb-4">📚 핵심 원리</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-lg font-semibold text-purple-400 mb-2">심리적 요인</h4>
            <p className="text-gray-400 text-sm">
              트레이더들이 특정 가격대를 중요하게 인식하면서 자연스럽게 매수/매도가 집중됩니다. 
              라운드 넘버($100,000 등)나 이전 고점/저점이 심리적 장벽이 됩니다.
            </p>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-blue-400 mb-2">수급 원리</h4>
            <p className="text-gray-400 text-sm">
              특정 가격대에서 대량 거래가 발생했던 구간은 미체결 주문이나 
              손실 포지션의 본전 심리로 인해 강한 지지/저항으로 작용합니다.
            </p>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-green-400 mb-2">역할 전환</h4>
            <p className="text-gray-400 text-sm">
              저항선이 돌파되면 지지선이 되고, 지지선이 붕괴되면 저항선이 됩니다. 
              이는 시장 참여자들의 인식 변화와 포지션 전환 때문입니다.
            </p>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-yellow-400 mb-2">시간대별 차이</h4>
            <p className="text-gray-400 text-sm">
              단기(1시간), 중기(일봉), 장기(주봉) 차트의 지지/저항은 각각 다른 의미를 가집니다. 
              장기 레벨일수록 더 강력하고 신뢰할 수 있습니다.
            </p>
          </div>
        </div>
      </motion.div>

      {/* 실전 팁 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-green-900/20 to-blue-900/20 p-6 rounded-xl border border-green-500/30"
      >
        <h3 className="text-xl font-bold text-white mb-4">💡 실전 트레이딩 팁</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-gray-800/50 p-3 rounded-lg">
            <p className="text-green-400 font-semibold mb-1">진입 타이밍</p>
            <p className="text-gray-400 text-sm">
              레벨 첫 터치보다는 2-3번째 테스트 시 진입이 안전
            </p>
          </div>
          <div className="bg-gray-800/50 p-3 rounded-lg">
            <p className="text-blue-400 font-semibold mb-1">포지션 크기</p>
            <p className="text-gray-400 text-sm">
              레벨 강도에 따라 포지션 크기 조절 (강할수록 증가)
            </p>
          </div>
          <div className="bg-gray-800/50 p-3 rounded-lg">
            <p className="text-purple-400 font-semibold mb-1">손절 설정</p>
            <p className="text-gray-400 text-sm">
              레벨 기준 1-2% 아래/위에 타이트하게 설정
            </p>
          </div>
          <div className="bg-gray-800/50 p-3 rounded-lg">
            <p className="text-yellow-400 font-semibold mb-1">목표가 설정</p>
            <p className="text-gray-400 text-sm">
              다음 주요 레벨까지 거리의 70-80% 지점
            </p>
          </div>
          <div className="bg-gray-800/50 p-3 rounded-lg">
            <p className="text-red-400 font-semibold mb-1">거래량 확인</p>
            <p className="text-gray-400 text-sm">
              돌파 시 평균 거래량의 1.5배 이상 확인
            </p>
          </div>
          <div className="bg-gray-800/50 p-3 rounded-lg">
            <p className="text-indigo-400 font-semibold mb-1">복합 확인</p>
            <p className="text-gray-400 text-sm">
              RSI, MACD 등 보조지표와 함께 확인
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}