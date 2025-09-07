'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaTimes, FaBell, FaTelegram, FaEnvelope, FaMobile, FaCheck } from 'react-icons/fa'
import { MdNotifications, MdNotificationsActive } from 'react-icons/md'
import PriceMonitorService from '@/lib/priceMonitor'
import NotificationService from '@/lib/notificationService'
import { config } from '@/lib/config'

interface PriceAlertModalProps {
  isOpen: boolean
  onClose: () => void
  symbol: string
  currentPrice: number
  entryPrice?: number
  stopLoss?: number
  targets?: number[]
}

interface AlertSettings {
  priceAbove: string
  priceBelow: string
  percentChange: string
  volumeSpike: boolean
  whaleAlert: boolean
  notificationChannels: {
    telegram: boolean
    email: boolean
    push: boolean
  }
}

export default function PriceAlertModal({
  isOpen,
  onClose,
  symbol,
  currentPrice,
  entryPrice,
  stopLoss,
  targets = []
}: PriceAlertModalProps) {
  const [settings, setSettings] = useState<AlertSettings>({
    priceAbove: entryPrice?.toString() || '',
    priceBelow: stopLoss?.toString() || '',
    percentChange: '5',
    volumeSpike: true,
    whaleAlert: true,
    notificationChannels: {
      telegram: true,
      email: false,  // 비활성화
      push: true
    }
  })

  const [activeTab, setActiveTab] = useState<'price' | 'activity' | 'channels'>('price')
  const [savedAlerts, setSavedAlerts] = useState<any[]>([])
  const [priceMonitor, setPriceMonitor] = useState<PriceMonitorService | null>(null)
  const [notificationService, setNotificationService] = useState<NotificationService | null>(null)
  const [hasPermission, setHasPermission] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const monitor = PriceMonitorService.getInstance()
      const notif = NotificationService.getInstance()
      setPriceMonitor(monitor)
      setNotificationService(notif)
      setHasPermission(notif.isPermissionGranted())
      
      // 기존 알림 로드
      const alerts = monitor.getAlerts()
      setSavedAlerts(alerts)
    }
  }, [])

  const handleSaveAlert = async () => {
    if (!priceMonitor) return

    // Push 알림 권한 확인
    if (settings.notificationChannels.push && !hasPermission && notificationService) {
      const granted = await notificationService.requestPermission()
      setHasPermission(granted)
      
      if (!granted) {
        alert('⚠️ 브라우저 알림 권한이 필요합니다.\n브라우저 설정에서 알림을 허용해주세요.')
      }
    }

    // 알림 추가
    const newAlert = priceMonitor.addAlert({
      symbol,
      settings: { ...settings }
    })
    
    // 즉시 테스트 알림 발송 (Push가 활성화된 경우)
    if (settings.notificationChannels.push && notificationService && hasPermission) {
      notificationService.showNotification(
        '✅ 알림 설정 완료',
        {
          body: `${symbol} 가격 알림이 활성화되었습니다.\n설정된 조건에 도달하면 알림을 받으실 수 있습니다.`,
          icon: '💰',
          tag: 'price-notification'
        }
      )
    }
    
    // 성공 메시지
    alert(`✅ ${symbol} 알림이 설정되었습니다!\n\n${hasPermission ? '브라우저 알림이 활성화되었습니다.' : '브라우저 알림을 받으려면 권한을 허용해주세요.'}`)
    onClose()
  }

  const handleQuickSet = (type: 'entry' | 'stop' | 'target1' | 'target2' | 'target3') => {
    switch(type) {
      case 'entry':
        setSettings({ ...settings, priceAbove: entryPrice?.toString() || '' })
        break
      case 'stop':
        setSettings({ ...settings, priceBelow: stopLoss?.toString() || '' })
        break
      case 'target1':
        setSettings({ ...settings, priceAbove: targets[0]?.toString() || '' })
        break
      case 'target2':
        setSettings({ ...settings, priceAbove: targets[1]?.toString() || '' })
        break
      case 'target3':
        setSettings({ ...settings, priceAbove: targets[2]?.toString() || '' })
        break
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* 배경 오버레이 */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        />
        
        {/* 모달 컨텐츠 */}
        <motion.div
          initial={{ opacity: 0, scale: config.decimals.value95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: config.decimals.value95, y: 20 }}
          className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl 
            border border-purple-500/30 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* 헤더 */}
          <div className="sticky top-0 bg-gray-900/95 backdrop-blur-sm p-6 border-b border-gray-700 z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MdNotificationsActive className="text-purple-400 text-2xl animate-pulse" />
                <div>
                  <h2 className="text-2xl font-bold text-white">알림 설정</h2>
                  <p className="text-sm text-gray-400 mt-1">{symbol} 실시간 알림 받기</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-all"
              >
                <FaTimes className="text-gray-400" />
              </button>
            </div>
          </div>

          {/* 탭 메뉴 */}
          <div className="flex border-b border-gray-700">
            <button
              onClick={() => setActiveTab('price')}
              className={`flex-1 py-3 px-4 text-sm font-medium transition-all ${
                activeTab === 'price' 
                  ? 'text-purple-400 border-b-2 border-purple-400 bg-purple-900/20' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              💰 가격 알림
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`flex-1 py-3 px-4 text-sm font-medium transition-all ${
                activeTab === 'activity' 
                  ? 'text-purple-400 border-b-2 border-purple-400 bg-purple-900/20' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              📊 활동 알림
            </button>
            <button
              onClick={() => setActiveTab('channels')}
              className={`flex-1 py-3 px-4 text-sm font-medium transition-all ${
                activeTab === 'channels' 
                  ? 'text-purple-400 border-b-2 border-purple-400 bg-purple-900/20' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              📱 알림 채널
            </button>
          </div>

          {/* 본문 */}
          <div className="p-6">
            {/* 현재가 표시 */}
            <div className="bg-gray-800/50 rounded-lg p-4 mb-6 border border-gray-700">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">현재가</span>
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">${currentPrice.toLocaleString()}</div>
                  <div className="text-xs text-gray-500">{symbol}/USDT</div>
                </div>
              </div>
            </div>

            {activeTab === 'price' && (
              <div className="space-y-6">
                {/* 빠른 설정 버튼 */}
                <div>
                  <h3 className="text-sm font-bold text-gray-400 mb-3">빠른 설정</h3>
                  <div className="flex flex-wrap gap-2">
                    {entryPrice && (
                      <button
                        onClick={() => handleQuickSet('entry')}
                        className="px-3 py-1.5 bg-green-900/30 border border-green-500/30 rounded-lg text-sm text-green-400 hover:bg-green-900/50"
                      >
                        진입가 ${entryPrice.toLocaleString()}
                      </button>
                    )}
                    {stopLoss && (
                      <button
                        onClick={() => handleQuickSet('stop')}
                        className="px-3 py-1.5 bg-red-900/30 border border-red-500/30 rounded-lg text-sm text-red-400 hover:bg-red-900/50"
                      >
                        손절가 ${stopLoss.toLocaleString()}
                      </button>
                    )}
                    {targets.map((target, i) => (
                      <button
                        key={i}
                        onClick={() => handleQuickSet(`target${i + 1}` as any)}
                        className="px-3 py-1.5 bg-blue-900/30 border border-blue-500/30 rounded-lg text-sm text-blue-400 hover:bg-blue-900/50"
                      >
                        목표{i + 1} ${target.toLocaleString()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 가격 상승 알림 */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    가격 상승 알림 (이상)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={settings.priceAbove}
                      onChange={(e) => setSettings({ ...settings, priceAbove: e.target.value })}
                      placeholder="예: 100000"
                      className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                    />
                    <span className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-400">
                      USDT
                    </span>
                  </div>
                </div>

                {/* 가격 하락 알림 */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    가격 하락 알림 (이하)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={settings.priceBelow}
                      onChange={(e) => setSettings({ ...settings, priceBelow: e.target.value })}
                      placeholder="예: 90000"
                      className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                    />
                    <span className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-400">
                      USDT
                    </span>
                  </div>
                </div>

                {/* 변동률 알림 */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    급등/급락 알림 (%)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={settings.percentChange}
                      onChange={(e) => setSettings({ ...settings, percentChange: e.target.value })}
                      placeholder="5"
                      className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                    />
                    <span className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-400">
                      % 이상 변동 시
                    </span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'activity' && (
              <div className="space-y-4">
                {/* 거래량 급증 알림 */}
                <label className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700 cursor-pointer hover:bg-gray-800/70">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">📈</div>
                    <div>
                      <div className="font-medium text-white">거래량 급증 알림</div>
                      <div className="text-xs text-gray-400">평균 대비 ${config.percentage.value200} 이상 거래량</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.volumeSpike}
                    onChange={(e) => setSettings({ ...settings, volumeSpike: e.target.checked })}
                    className="w-5 h-5 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                  />
                </label>

                {/* 고래 활동 알림 */}
                <label className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700 cursor-pointer hover:bg-gray-800/70">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">🐋</div>
                    <div>
                      <div className="font-medium text-white">고래 활동 알림</div>
                      <div className="text-xs text-gray-400">$100만 이상 대규모 거래</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.whaleAlert}
                    onChange={(e) => setSettings({ ...settings, whaleAlert: e.target.checked })}
                    className="w-5 h-5 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                  />
                </label>
              </div>
            )}

            {activeTab === 'channels' && (
              <div className="space-y-4">
                {/* 텔레그램 */}
                <label className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700 cursor-pointer hover:bg-gray-800/70">
                  <div className="flex items-center gap-3">
                    <FaTelegram className="text-2xl text-blue-400" />
                    <div>
                      <div className="font-medium text-white">텔레그램</div>
                      <div className="text-xs text-gray-400">@MonstaBot으로 실시간 알림</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.notificationChannels.telegram}
                    onChange={(e) => setSettings({ 
                      ...settings, 
                      notificationChannels: { 
                        ...settings.notificationChannels, 
                        telegram: e.target.checked 
                      }
                    })}
                    className="w-5 h-5 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                  />
                </label>

                {/* 이메일 */}
                <label className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700 cursor-pointer hover:bg-gray-800/70">
                  <div className="flex items-center gap-3">
                    <FaEnvelope className="text-2xl text-yellow-400" />
                    <div>
                      <div className="font-medium text-white">이메일</div>
                      <div className="text-xs text-gray-400">등록된 이메일로 알림</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.notificationChannels.email}
                    onChange={(e) => setSettings({ 
                      ...settings, 
                      notificationChannels: { 
                        ...settings.notificationChannels, 
                        email: e.target.checked 
                      }
                    })}
                    className="w-5 h-5 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                  />
                </label>

                {/* 푸시 알림 */}
                <label className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700 cursor-pointer hover:bg-gray-800/70">
                  <div className="flex items-center gap-3">
                    <FaMobile className="text-2xl text-green-400" />
                    <div>
                      <div className="font-medium text-white">브라우저 푸시</div>
                      <div className="text-xs text-gray-400">브라우저 알림 팝업</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.notificationChannels.push}
                    onChange={(e) => setSettings({ 
                      ...settings, 
                      notificationChannels: { 
                        ...settings.notificationChannels, 
                        push: e.target.checked 
                      }
                    })}
                    className="w-5 h-5 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                  />
                </label>
              </div>
            )}
          </div>

          {/* 푸터 */}
          <div className="sticky bottom-0 bg-gray-900/95 backdrop-blur-sm p-6 border-t border-gray-700">
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg font-medium transition-all"
              >
                취소
              </button>
              <button
                onClick={handleSaveAlert}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 
                  rounded-lg font-medium transition-all flex items-center justify-center gap-2"
              >
                <FaBell />
                알림 설정 완료
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}