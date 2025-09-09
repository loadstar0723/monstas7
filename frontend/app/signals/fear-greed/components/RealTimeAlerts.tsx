'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { FaBell, FaTelegram, FaEnvelope, FaMobile } from 'react-icons/fa'

interface RealTimeAlertsProps {
  coin: string
  currentIndex: number
}

export default function RealTimeAlerts({ coin, currentIndex }: RealTimeAlertsProps) {
  const [alertSettings, setAlertSettings] = useState({
    extremeFear: true,
    fear: false,
    neutral: false,
    greed: false,
    extremeGreed: true,
    priceChange: true,
    volumeSpike: true
  })

  const [notificationMethod, setNotificationMethod] = useState<'telegram' | 'email' | 'sms'>('telegram')

  const alertLevels = [
    { name: 'extremeFear', label: '극공포 (0-20)', value: 20, color: 'text-red-500', bg: 'bg-red-900/20' },
    { name: 'fear', label: '공포 (20-40)', value: 40, color: 'text-orange-400', bg: 'bg-orange-900/20' },
    { name: 'neutral', label: '중립 (40-60)', value: 60, color: 'text-yellow-400', bg: 'bg-yellow-900/20' },
    { name: 'greed', label: '탐욕 (60-80)', value: 80, color: 'text-lime-400', bg: 'bg-lime-900/20' },
    { name: 'extremeGreed', label: '극탐욕 (80-100)', value: 100, color: 'text-green-500', bg: 'bg-green-900/20' }
  ]

  const additionalAlerts = [
    { name: 'priceChange', label: '급격한 가격 변동 (±5%)', icon: '📈' },
    { name: 'volumeSpike', label: '거래량 급증 (평균 대비 200%)', icon: '📊' }
  ]

  return (
    <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <FaBell className="text-yellow-400" />
          실시간 알림 설정
        </h2>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-400">알림 활성화</span>
        </div>
      </div>

      {/* 현재 상태 */}
      <motion.div
        className="bg-gray-900/50 rounded-xl p-4 mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-400 mb-1">현재 {coin} 지수</p>
            <p className="text-2xl font-bold text-white">{currentIndex}</p>
          </div>
          <div className={`px-4 py-2 rounded-lg ${
            currentIndex <= 20 ? 'bg-red-900/30 text-red-400' :
            currentIndex <= 40 ? 'bg-orange-900/30 text-orange-400' :
            currentIndex <= 60 ? 'bg-yellow-900/30 text-yellow-400' :
            currentIndex <= 80 ? 'bg-lime-900/30 text-lime-400' :
            'bg-green-900/30 text-green-400'
          }`}>
            {currentIndex <= 20 ? '극공포' :
             currentIndex <= 40 ? '공포' :
             currentIndex <= 60 ? '중립' :
             currentIndex <= 80 ? '탐욕' :
             '극탐욕'}
          </div>
        </div>
      </motion.div>

      {/* 알림 레벨 설정 */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-4">공포탐욕 알림 레벨</h3>
        <div className="space-y-2">
          {alertLevels.map((level, index) => (
            <motion.div
              key={level.name}
              className={`flex items-center justify-between p-3 rounded-lg ${level.bg} border border-gray-700`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setAlertSettings(prev => ({
                    ...prev,
                    [level.name]: !prev[level.name as keyof typeof alertSettings]
                  }))}
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                    alertSettings[level.name as keyof typeof alertSettings]
                      ? 'bg-yellow-500 border-yellow-500'
                      : 'border-gray-500'
                  }`}
                >
                  {alertSettings[level.name as keyof typeof alertSettings] && (
                    <span className="text-black text-xs">✓</span>
                  )}
                </button>
                <span className={`font-medium ${level.color}`}>{level.label}</span>
              </div>
              {(level.name === 'extremeFear' || level.name === 'extremeGreed') && (
                <span className="text-xs bg-yellow-900/30 text-yellow-400 px-2 py-1 rounded">
                  추천
                </span>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* 추가 알림 */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-4">추가 알림</h3>
        <div className="space-y-2">
          {additionalAlerts.map((alert, index) => (
            <motion.div
              key={alert.name}
              className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.05 }}
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setAlertSettings(prev => ({
                    ...prev,
                    [alert.name]: !prev[alert.name as keyof typeof alertSettings]
                  }))}
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                    alertSettings[alert.name as keyof typeof alertSettings]
                      ? 'bg-blue-500 border-blue-500'
                      : 'border-gray-500'
                  }`}
                >
                  {alertSettings[alert.name as keyof typeof alertSettings] && (
                    <span className="text-black text-xs">✓</span>
                  )}
                </button>
                <span className="text-sm text-gray-300">
                  {alert.icon} {alert.label}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* 알림 방법 선택 */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-4">알림 방법</h3>
        <div className="grid grid-cols-3 gap-3">
          <motion.button
            onClick={() => setNotificationMethod('telegram')}
            className={`p-4 rounded-lg border transition-all ${
              notificationMethod === 'telegram'
                ? 'bg-blue-900/30 border-blue-500 text-blue-400'
                : 'bg-gray-900/50 border-gray-700 text-gray-400 hover:border-gray-600'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <FaTelegram className="text-2xl mx-auto mb-2" />
            <p className="text-sm font-medium">텔레그램</p>
          </motion.button>
          
          <motion.button
            onClick={() => setNotificationMethod('email')}
            className={`p-4 rounded-lg border transition-all ${
              notificationMethod === 'email'
                ? 'bg-blue-900/30 border-blue-500 text-blue-400'
                : 'bg-gray-900/50 border-gray-700 text-gray-400 hover:border-gray-600'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <FaEnvelope className="text-2xl mx-auto mb-2" />
            <p className="text-sm font-medium">이메일</p>
          </motion.button>
          
          <motion.button
            onClick={() => setNotificationMethod('sms')}
            className={`p-4 rounded-lg border transition-all ${
              notificationMethod === 'sms'
                ? 'bg-blue-900/30 border-blue-500 text-blue-400'
                : 'bg-gray-900/50 border-gray-700 text-gray-400 hover:border-gray-600'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <FaMobile className="text-2xl mx-auto mb-2" />
            <p className="text-sm font-medium">SMS</p>
          </motion.button>
        </div>
      </div>

      {/* 알림 활성화 버튼 */}
      <motion.button
        className="w-full py-4 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-xl font-bold text-white hover:from-yellow-700 hover:to-orange-700 transition-all"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        알림 설정 저장하기
      </motion.button>

      {/* 프리미엄 안내 */}
      <motion.div
        className="mt-6 p-4 bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-xl border border-purple-500/20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="flex items-start gap-3">
          <span className="text-2xl">👑</span>
          <div>
            <p className="text-sm font-bold text-purple-400 mb-1">프리미엄 알림 서비스</p>
            <p className="text-xs text-gray-300 mb-2">
              • 극단값 도달 시 즉시 알림<br/>
              • AI 기반 매매 타이밍 제안<br/>
              • 10개 코인 동시 모니터링<br/>
              • 24시간 실시간 알림
            </p>
            <button className="text-xs text-purple-400 hover:text-purple-300 font-medium">
              프리미엄 업그레이드 →
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}