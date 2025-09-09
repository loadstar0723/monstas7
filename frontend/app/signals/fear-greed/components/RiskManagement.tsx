'use client'

import { motion } from 'framer-motion'
import { FearGreedData } from '../hooks/useFearGreedData'
import { FaShieldAlt, FaExclamationTriangle, FaChartPie, FaBalanceScale } from 'react-icons/fa'

interface RiskManagementProps {
  coin: string
  fearGreedData: FearGreedData | null
}

export default function RiskManagement({ coin, fearGreedData }: RiskManagementProps) {
  const value = fearGreedData?.value || 50
  
  const getRiskProfile = () => {
    if (value <= 20) {
      return {
        level: '낮음',
        score: 20,
        color: 'text-green-400',
        bg: 'bg-green-900/20',
        description: '시장 패닉 상태 - 리스크는 낮지만 변동성 주의',
        allocation: {
          spot: 70,
          futures: 20,
          cash: 10
        },
        maxLeverage: 2,
        suggestions: [
          '현물 위주 포지션 구축',
          '분할 매수로 평단가 관리',
          '장기 보유 전략 수립',
          '추가 하락 대비 여유 자금 확보'
        ]
      }
    } else if (value <= 40) {
      return {
        level: '중간',
        score: 40,
        color: 'text-yellow-400',
        bg: 'bg-yellow-900/20',
        description: '시장 불안 지속 - 신중한 접근 필요',
        allocation: {
          spot: 50,
          futures: 10,
          cash: 40
        },
        maxLeverage: 1,
        suggestions: [
          '소액 테스트 포지션',
          '명확한 손절선 설정',
          '단기 반등 노리기',
          '현금 비중 유지'
        ]
      }
    } else if (value <= 60) {
      return {
        level: '보통',
        score: 50,
        color: 'text-gray-400',
        bg: 'bg-gray-900/20',
        description: '중립 구간 - 방향성 확인 필요',
        allocation: {
          spot: 30,
          futures: 0,
          cash: 70
        },
        maxLeverage: 0,
        suggestions: [
          '신규 진입 보류',
          '기존 포지션 유지',
          '브레이크아웃 대기',
          '현금 보유 우선'
        ]
      }
    } else if (value <= 80) {
      return {
        level: '높음',
        score: 70,
        color: 'text-orange-400',
        bg: 'bg-orange-900/20',
        description: '과열 징후 - 리스크 관리 강화',
        allocation: {
          spot: 20,
          futures: 0,
          cash: 80
        },
        maxLeverage: 0,
        suggestions: [
          '수익 실현 시작',
          '포지션 축소',
          '숏 헤지 고려',
          '현금 비중 확대'
        ]
      }
    } else {
      return {
        level: '매우 높음',
        score: 90,
        color: 'text-red-400',
        bg: 'bg-red-900/20',
        description: '극도의 탐욕 - 즉시 리스크 축소',
        allocation: {
          spot: 10,
          futures: 0,
          cash: 90
        },
        maxLeverage: 0,
        suggestions: [
          '즉시 포지션 청산',
          '숏 포지션 고려',
          '현금 90% 이상 보유',
          '다음 사이클 대기'
        ]
      }
    }
  }

  const risk = getRiskProfile()

  return (
    <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <FaShieldAlt className="text-blue-400" />
          리스크 관리
        </h2>
        <div className={`px-3 py-1 rounded-lg font-bold ${risk.color} ${risk.bg}`}>
          리스크: {risk.level}
        </div>
      </div>

      {/* 리스크 게이지 */}
      <motion.div
        className="mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-400">리스크 레벨</span>
          <span className={`text-lg font-bold ${risk.color}`}>{risk.score}/100</span>
        </div>
        <div className="h-4 bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            className={`h-full bg-gradient-to-r ${
              risk.score <= 30 ? 'from-green-500 to-green-400' :
              risk.score <= 50 ? 'from-yellow-500 to-yellow-400' :
              risk.score <= 70 ? 'from-orange-500 to-orange-400' :
              'from-red-500 to-red-400'
            }`}
            initial={{ width: 0 }}
            animate={{ width: `${risk.score}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
        <p className="text-sm text-gray-400 mt-2">{risk.description}</p>
      </motion.div>

      {/* 자산 배분 제안 */}
      <motion.div
        className="bg-gray-900/50 rounded-xl p-4 mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <FaChartPie className="text-purple-400" />
          권장 자산 배분
        </h3>
        
        <div className="space-y-3">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-gray-400">현물 (Spot)</span>
              <span className="text-sm font-bold text-white">{risk.allocation.spot}%</span>
            </div>
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-blue-500"
                initial={{ width: 0 }}
                animate={{ width: `${risk.allocation.spot}%` }}
                transition={{ duration: 0.8, delay: 0.3 }}
              />
            </div>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-gray-400">선물 (Futures)</span>
              <span className="text-sm font-bold text-white">{risk.allocation.futures}%</span>
            </div>
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-purple-500"
                initial={{ width: 0 }}
                animate={{ width: `${risk.allocation.futures}%` }}
                transition={{ duration: 0.8, delay: 0.4 }}
              />
            </div>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-gray-400">현금 (Cash)</span>
              <span className="text-sm font-bold text-white">{risk.allocation.cash}%</span>
            </div>
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-green-500"
                initial={{ width: 0 }}
                animate={{ width: `${risk.allocation.cash}%` }}
                transition={{ duration: 0.8, delay: 0.5 }}
              />
            </div>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-gray-800/50 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">최대 레버리지</span>
            <span className="text-lg font-bold text-yellow-400">
              {risk.maxLeverage}x {risk.maxLeverage === 0 && '(사용 금지)'}
            </span>
          </div>
        </div>
      </motion.div>

      {/* 리스크 관리 제안 */}
      <motion.div
        className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-xl p-4 border border-blue-500/20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
          <FaBalanceScale className="text-blue-400" />
          리스크 관리 전략
        </h3>
        
        <ul className="space-y-2">
          {risk.suggestions.map((suggestion, index) => (
            <motion.li
              key={index}
              className="flex items-start gap-2 text-sm text-gray-300"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 + index * 0.1 }}
            >
              <span className="text-blue-400 mt-1">•</span>
              <span>{suggestion}</span>
            </motion.li>
          ))}
        </ul>
      </motion.div>

      {/* 경고 메시지 */}
      {value > 75 && (
        <motion.div
          className="mt-6 p-4 bg-red-900/20 rounded-xl border border-red-500/30"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1 }}
        >
          <div className="flex items-start gap-3">
            <FaExclamationTriangle className="text-red-400 text-xl mt-1" />
            <div>
              <p className="text-sm font-bold text-red-400 mb-1">⚠️ 고위험 경고</p>
              <p className="text-xs text-gray-300">
                현재 시장은 극도의 탐욕 상태입니다. 역사적으로 이 구간에서 큰 조정이 발생했습니다.
                포지션을 즉시 축소하고 리스크 관리를 강화하세요.
              </p>
            </div>
          </div>
        </motion.div>
      )}
      
      {value < 25 && (
        <motion.div
          className="mt-6 p-4 bg-green-900/20 rounded-xl border border-green-500/30"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1 }}
        >
          <div className="flex items-start gap-3">
            <FaShieldAlt className="text-green-400 text-xl mt-1" />
            <div>
              <p className="text-sm font-bold text-green-400 mb-1">✅ 기회 포착</p>
              <p className="text-xs text-gray-300">
                극도의 공포는 역사적으로 최고의 매수 기회였습니다.
                단, 분할 매수와 충분한 현금 보유로 추가 하락에 대비하세요.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}