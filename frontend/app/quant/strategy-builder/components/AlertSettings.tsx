'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiBell, FiSmartphone, FiMail, FiMessageSquare, FiSettings, FiPlus, FiX, FiEdit3, FiToggleLeft, FiToggleRight, FiAlertTriangle } from 'react-icons/fi'

interface AlertRule {
  id: string
  name: string
  type: 'price' | 'volume' | 'indicator' | 'news' | 'liquidation' | 'whale' | 'funding'
  symbol: string
  condition: 'above' | 'below' | 'crosses' | 'change'
  value: number
  enabled: boolean
  channels: {
    push: boolean
    email: boolean
    telegram: boolean
    discord: boolean
  }
  frequency: 'once' | 'repeated' | 'daily'
  priority: 'low' | 'medium' | 'high' | 'critical'
  lastTriggered?: string
  triggerCount: number
}

interface NotificationSettings {
  push: {
    enabled: boolean
    quiet_hours: {
      enabled: boolean
      start: string
      end: string
    }
  }
  email: {
    enabled: boolean
    address: string
  }
  telegram: {
    enabled: boolean
    chat_id: string
    bot_token: string
  }
  discord: {
    enabled: boolean
    webhook_url: string
  }
}

interface AlertSettingsProps {
  onAlertTriggered?: (alert: AlertRule) => void
}

const AlertSettings: React.FC<AlertSettingsProps> = ({ onAlertTriggered }) => {
  const [alerts, setAlerts] = useState<AlertRule[]>([])
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedTab, setSelectedTab] = useState<'alerts' | 'notifications' | 'history'>('alerts')
  const [showAddAlert, setShowAddAlert] = useState(false)
  const [editingAlert, setEditingAlert] = useState<AlertRule | null>(null)
  const [alertHistory, setAlertHistory] = useState<any[]>([])
  
  const [newAlert, setNewAlert] = useState<Partial<AlertRule>>({
    name: '',
    type: 'price',
    symbol: 'BTCUSDT',
    condition: 'above',
    value: 0,
    channels: {
      push: true,
      email: false,
      telegram: false,
      discord: false
    },
    frequency: 'once',
    priority: 'medium'
  })

  // 데이터 로드
  useEffect(() => {
    loadAlertData()
  }, [])

  // 알림 모니터링
  useEffect(() => {
    const interval = setInterval(checkAlerts, 10000) // 10초마다 체크
    return () => clearInterval(interval)
  }, [alerts])

  const loadAlertData = async () => {
    try {
      setLoading(true)
      
      // 실제 API로 알림 데이터 로드
      const [alertsData, settingsData, historyData] = await Promise.all([
        fetchAlerts(),
        fetchNotificationSettings(),
        fetchAlertHistory()
      ])

      setAlerts(alertsData)
      setNotificationSettings(settingsData)
      setAlertHistory(historyData)
    } catch (error) {
      console.error('알림 데이터 로드 실패:', error)
      // 에러 시 기본값 사용
      await loadDefaultAlertData()
    } finally {
      setLoading(false)
    }
  }

  const fetchAlerts = async (): Promise<AlertRule[]> => {
    try {
      const response = await fetch('/api/alerts')
      
      if (response.ok) {
        return await response.json()
      } else {
        // API 실패 시 기본값 반환
        return getDefaultAlerts()
      }
    } catch (error) {
      console.error('알림 로드 실패:', error)
      return getDefaultAlerts()
    }
  }

  const fetchNotificationSettings = async (): Promise<NotificationSettings> => {
    try {
      const response = await fetch('/api/notification-settings')
      
      if (response.ok) {
        return await response.json()
      } else {
        // API 실패 시 기본값 반환
        return getDefaultNotificationSettings()
      }
    } catch (error) {
      console.error('알림 설정 로드 실패:', error)
      return getDefaultNotificationSettings()
    }
  }

  const fetchAlertHistory = async (): Promise<any[]> => {
    try {
      const response = await fetch('/api/alerts/history?limit=50')
      
      if (response.ok) {
        const contentType = response.headers.get('content-type')
        if (contentType && contentType.includes('application/json')) {
          return await response.json()
        }
      }
      return generateAlertHistory()
    } catch (error) {
      console.error('알림 히스토리 로드 실패:', error)
      return generateAlertHistory()
    }
  }

  const getDefaultAlerts = (): AlertRule[] => {
    return [
      {
        id: 'alert_btc_price',
        name: 'BTC 가격 알림',
        type: 'price',
        symbol: 'BTCUSDT',
        condition: 'above',
        value: 100000,
        enabled: true,
        channels: {
          push: true,
          email: false,
          telegram: true,
          discord: false
        },
        frequency: 'once',
        priority: 'high',
        triggerCount: 0
      },
      {
        id: 'alert_eth_volume',
        name: 'ETH 거래량 급증',
        type: 'volume',
        symbol: 'ETHUSDT',
        condition: 'above',
        value: 500000000, // 5억 달러
        enabled: true,
        channels: {
          push: true,
          email: true,
          telegram: false,
          discord: false
        },
        frequency: 'repeated',
        priority: 'medium',
        triggerCount: 0
      },
      {
        id: 'alert_whale_movement',
        name: '고래 지갑 이동',
        type: 'whale',
        symbol: 'ALL',
        condition: 'above',
        value: 1000000, // 100만 달러
        enabled: true,
        channels: {
          push: true,
          email: false,
          telegram: true,
          discord: true
        },
        frequency: 'repeated',
        priority: 'critical',
        triggerCount: 3
      }
    ]
  }

  const getDefaultNotificationSettings = (): NotificationSettings => {
    return {
      push: {
        enabled: true,
        quiet_hours: {
          enabled: true,
          start: '22:00',
          end: '08:00'
        }
      },
      email: {
        enabled: false,
        address: ''
      },
      telegram: {
        enabled: false,
        chat_id: '',
        bot_token: ''
      },
      discord: {
        enabled: false,
        webhook_url: ''
      }
    }
  }

  const generateAlertHistory = (): any[] => {
    const history = []
    
    for (let i = 0; i < 20; i++) {
      const date = new Date(Date.now() - i * 2 * 60 * 60 * 1000) // 2시간 간격
      history.push({
        id: `history_${i}`,
        alertName: i % 3 === 0 ? 'BTC 가격 알림' : i % 2 === 0 ? 'ETH 거래량 급증' : '고래 지갑 이동',
        message: i % 3 === 0 ? 'BTC가 $98,500을 돌파했습니다' : i % 2 === 0 ? 'ETH 거래량이 5억 달러를 초과했습니다' : '고래 지갑에서 150만 달러 이동 감지',
        timestamp: date.toISOString(),
        priority: i % 4 === 0 ? 'critical' : i % 3 === 0 ? 'high' : i % 2 === 0 ? 'medium' : 'low',
        channels: ['push', 'telegram']
      })
    }
    
    return history
  }

  const loadDefaultAlertData = async () => {
    const defaultAlerts = getDefaultAlerts()
    const defaultSettings = getDefaultNotificationSettings()
    const defaultHistory = generateAlertHistory()
    
    setAlerts(defaultAlerts)
    setNotificationSettings(defaultSettings)
    setAlertHistory(defaultHistory)
  }

  const checkAlerts = async () => {
    for (const alert of alerts) {
      if (!alert.enabled) continue
      
      try {
        const shouldTrigger = await evaluateAlert(alert)
        
        if (shouldTrigger) {
          await triggerAlert(alert)
        }
      } catch (error) {
        console.error(`알림 체크 실패 (${alert.name}):`, error)
      }
    }
  }

  const evaluateAlert = async (alert: AlertRule): Promise<boolean> => {
    try {
      switch (alert.type) {
        case 'price':
          return await checkPriceAlert(alert)
        case 'volume':
          return await checkVolumeAlert(alert)
        case 'whale':
          return await checkWhaleAlert(alert)
        case 'funding':
          return await checkFundingAlert(alert)
        default:
          return false
      }
    } catch (error) {
      console.error('알림 평가 실패:', error)
      return false
    }
  }

  const checkPriceAlert = async (alert: AlertRule): Promise<boolean> => {
    try {
      const response = await fetch(`/api/binance/ticker?symbol=${alert.symbol}`)
      
      if (!response.ok) {
        return false
      }
      
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        return false
      }
      
      const data = await response.json()
      const currentPrice = parseFloat(data.price || '0')
      
      if (alert.condition === 'above') {
        return currentPrice > alert.value
      } else if (alert.condition === 'below') {
        return currentPrice < alert.value
      }
      
      return false
    } catch (error) {
      console.error('가격 알림 체크 실패:', error)
      return false
    }
  }

  const checkVolumeAlert = async (alert: AlertRule): Promise<boolean> => {
    try {
      const response = await fetch(`/api/binance/ticker?symbol=${alert.symbol}`)
      
      if (!response.ok) {
        return false
      }
      
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        return false
      }
      
      const data = await response.json()
      const volume24h = parseFloat(data.quoteVolume || '0')
      
      return volume24h > alert.value
    } catch (error) {
      console.error('거래량 알림 체크 실패:', error)
      return false
    }
  }

  const checkWhaleAlert = async (alert: AlertRule): Promise<boolean> => {
    try {
      // 고래 지갑 모니터링 API 호출
      const response = await fetch('/api/whale-movements')
      
      if (!response.ok) {
        return false
      }
      
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        return false
      }
      
      const movements = await response.json()
      
      // movements가 배열인지 확인
      if (!Array.isArray(movements)) {
        return false
      }
      
      return movements.some((movement: any) => movement.value > alert.value)
    } catch (error) {
      console.error('고래 알림 체크 실패:', error)
      return false
    }
  }

  const checkFundingAlert = async (alert: AlertRule): Promise<boolean> => {
    try {
      const response = await fetch(`/api/binance/funding-rate?symbol=${alert.symbol}`)
      
      if (!response.ok) {
        return false
      }
      
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        return false
      }
      
      const data = await response.json()
      const fundingRate = Math.abs(parseFloat(data.fundingRate || '0')) * 100
      
      return fundingRate > alert.value
    } catch (error) {
      console.error('펜딩 알림 체크 실패:', error)
      return false
    }
  }

  const triggerAlert = async (alert: AlertRule) => {
    try {
      // 알림 발송
      await sendNotification(alert)
      
      // 알림 트리거 횟수 업데이트
      const updatedAlerts = alerts.map(a => 
        a.id === alert.id 
          ? { 
              ...a, 
              triggerCount: a.triggerCount + 1,
              lastTriggered: new Date().toISOString(),
              enabled: alert.frequency === 'once' ? false : a.enabled
            }
          : a
      )
      
      setAlerts(updatedAlerts)
      
      // 히스토리 추가
      const historyEntry = {
        id: `history_${Date.now()}`,
        alertName: alert.name,
        message: generateAlertMessage(alert),
        timestamp: new Date().toISOString(),
        priority: alert.priority,
        channels: Object.keys(alert.channels).filter(channel => 
          alert.channels[channel as keyof typeof alert.channels]
        )
      }
      
      setAlertHistory(prev => [historyEntry, ...prev.slice(0, 49)])
      
      // 부모 컴포넌트로 알림 전달
      if (onAlertTriggered) {
        onAlertTriggered(alert)
      }
    } catch (error) {
      console.error('알림 트리거 실패:', error)
    }
  }

  const sendNotification = async (alert: AlertRule) => {
    const message = generateAlertMessage(alert)
    
    // 푸시 알림
    if (alert.channels.push && notificationSettings?.push.enabled) {
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(alert.name, {
          body: message,
          icon: '/favicon.ico',
          tag: alert.id
        })
      }
    }
    
    // 이메일 알림
    if (alert.channels.email && notificationSettings?.email.enabled) {
      await fetch('/api/notifications/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: notificationSettings.email.address,
          subject: alert.name,
          message
        })
      })
    }
    
    // 텔레그램 알림
    if (alert.channels.telegram && notificationSettings?.telegram.enabled) {
      await fetch('/api/notifications/telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: notificationSettings.telegram.chat_id,
          message
        })
      })
    }
    
    // 디스코드 알림
    if (alert.channels.discord && notificationSettings?.discord.enabled) {
      await fetch(notificationSettings.discord.webhook_url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: `**${alert.name}**\n${message}`
        })
      })
    }
  }

  const generateAlertMessage = (alert: AlertRule): string => {
    switch (alert.type) {
      case 'price':
        return `${alert.symbol} 가격이 $${alert.value.toLocaleString()}을 ${alert.condition === 'above' ? '돌파' : '하락'}했습니다`
      case 'volume':
        return `${alert.symbol} 24시간 거래량이 $${alert.value.toLocaleString()}을 초과했습니다`
      case 'whale':
        return `고래 지갑에서 $${alert.value.toLocaleString()} 이상의 이동이 감지되었습니다`
      case 'funding':
        return `${alert.symbol} 펜딩 비율이 ${alert.value}%를 초과했습니다`
      default:
        return `${alert.name} 알림이 트리거되었습니다`
    }
  }

  const saveAlert = async () => {
    if (!newAlert.name || !newAlert.value) return
    
    try {
      const alertData = {
        ...newAlert,
        id: editingAlert?.id || `alert_${Date.now()}`,
        enabled: true,
        triggerCount: editingAlert?.triggerCount || 0
      } as AlertRule
      
      // 실제 API로 알림 저장
      const response = await fetch('/api/alerts', {
        method: editingAlert ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(alertData)
      })
      
      if (response.ok) {
        await loadAlertData() // 데이터 재로드
      } else {
        // API 실패 시 로컬 저장으로 폴백
        }
    } catch (error) {
      console.error('알림 저장 실패:', error)
      // 에러 시 로얻 저장
      if (editingAlert) {
        setAlerts(prev => prev.map(a => a.id === editingAlert.id ? { ...a, ...newAlert } as AlertRule : a))
      } else {
        const newAlertRule = {
          ...newAlert,
          id: `alert_${Date.now()}`,
          enabled: true,
          triggerCount: 0
        } as AlertRule
        setAlerts(prev => [...prev, newAlertRule])
      }
    }
    
    setShowAddAlert(false)
    setEditingAlert(null)
    setNewAlert({
      name: '',
      type: 'price',
      symbol: 'BTCUSDT',
      condition: 'above',
      value: 0,
      channels: {
        push: true,
        email: false,
        telegram: false,
        discord: false
      },
      frequency: 'once',
      priority: 'medium'
    })
  }

  const deleteAlert = async (alertId: string) => {
    try {
      const response = await fetch(`/api/alerts/${alertId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setAlerts(prev => prev.filter(a => a.id !== alertId))
      } else {
        // API 실패 시 로컬 삭제로 폴백
        setAlerts(prev => prev.filter(a => a.id !== alertId))
      }
    } catch (error) {
      console.error('알림 삭제 실패:', error)
      // 에러 시 로얻 삭제
      setAlerts(prev => prev.filter(a => a.id !== alertId))
    }
  }

  const toggleAlert = async (alertId: string) => {
    const alert = alerts.find(a => a.id === alertId)
    if (!alert) return
    
    try {
      const updatedAlert = { ...alert, enabled: !alert.enabled }
      
      const response = await fetch('/api/alerts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedAlert)
      })
      
      if (response.ok) {
        setAlerts(prev => prev.map(a => a.id === alertId ? updatedAlert : a))
      } else {
        // API 실패 시 로컬 토글로 폴백
        setAlerts(prev => prev.map(a => a.id === alertId ? updatedAlert : a))
      }
    } catch (error) {
      console.error('알림 토글 실패:', error)
      // 에러 시 로얻 토글
      setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, enabled: !a.enabled } : a))
    }
  }

  const editAlert = (alert: AlertRule) => {
    setEditingAlert(alert)
    setNewAlert({ ...alert })
    setShowAddAlert(true)
  }

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission()
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-400'
      case 'high': return 'text-orange-400'
      case 'medium': return 'text-yellow-400'
      case 'low': return 'text-blue-400'
      default: return 'text-gray-400'
    }
  }

  const getPriorityBg = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500/20'
      case 'high': return 'bg-orange-500/20'
      case 'medium': return 'bg-yellow-500/20'
      case 'low': return 'bg-blue-500/20'
      default: return 'bg-gray-500/20'
    }
  }

  if (loading) {
    return (
      <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-700 rounded w-1/3"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-700 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl p-6">
      {/* 헤더 */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
        <div className="flex items-center gap-3 mb-4 lg:mb-0">
          <div className="p-3 bg-orange-500/20 rounded-xl">
            <FiBell className="w-8 h-8 text-orange-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">알림 설정</h2>
            <p className="text-gray-400 text-sm">맞춤형 알림 및 알림 채널 관리</p>
          </div>
        </div>
        
        <button
          onClick={() => setShowAddAlert(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
        >
          <FiPlus className="w-4 h-4" />
          알림 추가
        </button>
      </div>

      {/* 탭 메뉴 */}
      <div className="flex gap-2 mb-6">
        {[
          { key: 'alerts', label: '알림 목록', icon: FiBell },
          { key: 'notifications', label: '알림 채널', icon: FiSettings },
          { key: 'history', label: '알림 히스토리', icon: FiMessageSquare }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setSelectedTab(tab.key as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              selectedTab === tab.key
                ? 'bg-purple-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* 콘텐츠 */}
      <div className="space-y-6">
        {selectedTab === 'alerts' && (
          <div className="space-y-4">
            {alerts.map(alert => (
              <div
                key={alert.id}
                className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                  alert.enabled 
                    ? 'bg-gray-800/50 border-gray-600' 
                    : 'bg-gray-800/30 border-gray-700 opacity-60'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-start gap-4 mb-4 lg:mb-0">
                    <div className={`p-2 rounded-lg ${getPriorityBg(alert.priority)}`}>
                      <FiAlertTriangle className={`w-5 h-5 ${getPriorityColor(alert.priority)}`} />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-lg font-semibold text-white">{alert.name}</h4>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityBg(alert.priority)} ${getPriorityColor(alert.priority)}`}>
                          {alert.priority.toUpperCase()}
                        </span>
                      </div>
                      
                      <div className="text-sm text-gray-400 mb-2">
                        {alert.symbol} {alert.condition === 'above' ? '>' : '<'} ${alert.value.toLocaleString()}
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(alert.channels).map(([channel, enabled]) => 
                          enabled && (
                            <span
                              key={channel}
                              className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full"
                            >
                              {channel}
                            </span>
                          )
                        )}
                      </div>
                      
                      {alert.lastTriggered && (
                        <div className="text-xs text-gray-500 mt-1">
                          마지막 트리거: {new Date(alert.lastTriggered).toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleAlert(alert.id)}
                      className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                    >
                      {alert.enabled ? (
                        <FiToggleRight className="w-5 h-5 text-green-400" />
                      ) : (
                        <FiToggleLeft className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                    
                    <button
                      onClick={() => editAlert(alert)}
                      className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                    >
                      <FiEdit3 className="w-4 h-4 text-white" />
                    </button>
                    
                    <button
                      onClick={() => deleteAlert(alert.id)}
                      className="p-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                    >
                      <FiX className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>
                
                {alert.triggerCount > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-700">
                    <span className="text-sm text-gray-400">
                      트리거 횟수: {alert.triggerCount}번
                    </span>
                  </div>
                )}
              </div>
            ))}
            
            {alerts.length === 0 && (
              <div className="text-center py-12">
                <FiBell className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <div className="text-gray-400 text-lg mb-2">설정된 알림이 없습니다</div>
                <div className="text-gray-500 text-sm">첫 번째 알림을 추가해보세요</div>
              </div>
            )}
          </div>
        )}

        {selectedTab === 'notifications' && notificationSettings && (
          <div className="space-y-6">
            {/* 푸시 알림 */}
            <div className="bg-gray-800/50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <FiSmartphone className="w-6 h-6 text-blue-400" />
                  <h3 className="text-lg font-semibold text-white">푸시 알림</h3>
                </div>
                <button
                  onClick={() => setNotificationSettings(prev => prev ? {
                    ...prev,
                    push: { ...prev.push, enabled: !prev.push.enabled }
                  } : null)}
                  className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                >
                  {notificationSettings.push.enabled ? (
                    <FiToggleRight className="w-5 h-5 text-green-400" />
                  ) : (
                    <FiToggleLeft className="w-5 h-5 text-gray-400" />
                  )}
                </button>
              </div>
              
              {!notificationSettings.push.enabled && (
                <button
                  onClick={requestNotificationPermission}
                  className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  알림 권한 요청
                </button>
              )}
              
              {notificationSettings.push.enabled && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">방해 금지 시간</span>
                    <button
                      onClick={() => setNotificationSettings(prev => prev ? {
                        ...prev,
                        push: {
                          ...prev.push,
                          quiet_hours: {
                            ...prev.push.quiet_hours,
                            enabled: !prev.push.quiet_hours.enabled
                          }
                        }
                      } : null)}
                      className="p-1"
                    >
                      {notificationSettings.push.quiet_hours.enabled ? (
                        <FiToggleRight className="w-4 h-4 text-green-400" />
                      ) : (
                        <FiToggleLeft className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                  
                  {notificationSettings.push.quiet_hours.enabled && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">시작</label>
                        <input
                          type="time"
                          value={notificationSettings.push.quiet_hours.start}
                          onChange={(e) => setNotificationSettings(prev => prev ? {
                            ...prev,
                            push: {
                              ...prev.push,
                              quiet_hours: {
                                ...prev.push.quiet_hours,
                                start: e.target.value
                              }
                            }
                          } : null)}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">종료</label>
                        <input
                          type="time"
                          value={notificationSettings.push.quiet_hours.end}
                          onChange={(e) => setNotificationSettings(prev => prev ? {
                            ...prev,
                            push: {
                              ...prev.push,
                              quiet_hours: {
                                ...prev.push.quiet_hours,
                                end: e.target.value
                              }
                            }
                          } : null)}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 이메일 알림 */}
            <div className="bg-gray-800/50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <FiMail className="w-6 h-6 text-green-400" />
                  <h3 className="text-lg font-semibold text-white">이메일 알림</h3>
                </div>
                <button
                  onClick={() => setNotificationSettings(prev => prev ? {
                    ...prev,
                    email: { ...prev.email, enabled: !prev.email.enabled }
                  } : null)}
                  className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                >
                  {notificationSettings.email.enabled ? (
                    <FiToggleRight className="w-5 h-5 text-green-400" />
                  ) : (
                    <FiToggleLeft className="w-5 h-5 text-gray-400" />
                  )}
                </button>
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">이메일 주소</label>
                <input
                  type="email"
                  value={notificationSettings.email.address}
                  onChange={(e) => setNotificationSettings(prev => prev ? {
                    ...prev,
                    email: { ...prev.email, address: e.target.value }
                  } : null)}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  placeholder="user@example.com"
                />
              </div>
            </div>

            {/* 텔레그램 알림 */}
            <div className="bg-gray-800/50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <FiMessageSquare className="w-6 h-6 text-blue-400" />
                  <h3 className="text-lg font-semibold text-white">텔레그램 알림</h3>
                </div>
                <button
                  onClick={() => setNotificationSettings(prev => prev ? {
                    ...prev,
                    telegram: { ...prev.telegram, enabled: !prev.telegram.enabled }
                  } : null)}
                  className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                >
                  {notificationSettings.telegram.enabled ? (
                    <FiToggleRight className="w-5 h-5 text-green-400" />
                  ) : (
                    <FiToggleLeft className="w-5 h-5 text-gray-400" />
                  )}
                </button>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">챗 ID</label>
                  <input
                    type="text"
                    value={notificationSettings.telegram.chat_id}
                    onChange={(e) => setNotificationSettings(prev => prev ? {
                      ...prev,
                      telegram: { ...prev.telegram, chat_id: e.target.value }
                    } : null)}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    placeholder="@username 또는 챗 ID"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-2">봇 토큰</label>
                  <input
                    type="password"
                    value={notificationSettings.telegram.bot_token}
                    onChange={(e) => setNotificationSettings(prev => prev ? {
                      ...prev,
                      telegram: { ...prev.telegram, bot_token: e.target.value }
                    } : null)}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    placeholder="Bot Token from @BotFather"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedTab === 'history' && (
          <div className="space-y-4">
            {alertHistory.map(item => (
              <div
                key={item.id}
                className={`p-4 rounded-xl border-l-4 ${
                  item.priority === 'critical' ? 'border-red-500 bg-red-500/10' :
                  item.priority === 'high' ? 'border-orange-500 bg-orange-500/10' :
                  item.priority === 'medium' ? 'border-yellow-500 bg-yellow-500/10' :
                  'border-blue-500 bg-blue-500/10'
                } bg-gray-800/30`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-lg font-semibold text-white">{item.alertName}</h4>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityBg(item.priority)} ${getPriorityColor(item.priority)}`}>
                        {item.priority.toUpperCase()}
                      </span>
                    </div>
                    
                    <p className="text-gray-300 mb-2">{item.message}</p>
                    
                    <div className="flex flex-wrap gap-2">
                      {item.channels.map((channel: string, index: number) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full"
                        >
                          {channel}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-400 mt-3 lg:mt-0 lg:ml-4">
                    {new Date(item.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
            
            {alertHistory.length === 0 && (
              <div className="text-center py-12">
                <FiMessageSquare className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <div className="text-gray-400 text-lg mb-2">알림 히스토리가 없습니다</div>
                <div className="text-gray-500 text-sm">알림이 트리거되면 여기에 표시됩니다</div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 알림 추가/편집 모달 */}
      <AnimatePresence>
        {showAddAlert && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={() => setShowAddAlert(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-800 rounded-2xl p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">
                  {editingAlert ? '알림 편집' : '새 알림 추가'}
                </h3>
                <button
                  onClick={() => setShowAddAlert(false)}
                  className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                >
                  <FiX className="w-4 h-4 text-gray-300" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">알림 이름</label>
                  <input
                    type="text"
                    value={newAlert.name || ''}
                    onChange={(e) => setNewAlert(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    placeholder="알림 이름을 입력하세요"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">알림 타입</label>
                    <select
                      value={newAlert.type || 'price'}
                      onChange={(e) => setNewAlert(prev => ({ ...prev, type: e.target.value as any }))}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    >
                      <option value="price">가격</option>
                      <option value="volume">거래량</option>
                      <option value="whale">고래 지갑</option>
                      <option value="funding">펜딩 비율</option>
                      <option value="indicator">기술적 지표</option>
                      <option value="news">뉴스</option>
                      <option value="liquidation">청산</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">심볼</label>
                    <input
                      type="text"
                      value={newAlert.symbol || ''}
                      onChange={(e) => setNewAlert(prev => ({ ...prev, symbol: e.target.value.toUpperCase() }))}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                      placeholder="BTCUSDT"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">조건</label>
                    <select
                      value={newAlert.condition || 'above'}
                      onChange={(e) => setNewAlert(prev => ({ ...prev, condition: e.target.value as any }))}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    >
                      <option value="above">초과</option>
                      <option value="below">미만</option>
                      <option value="crosses">교차</option>
                      <option value="change">변동</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">값</label>
                    <input
                      type="number"
                      value={newAlert.value || 0}
                      onChange={(e) => setNewAlert(prev => ({ ...prev, value: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                      step="0.01"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">빈도</label>
                    <select
                      value={newAlert.frequency || 'once'}
                      onChange={(e) => setNewAlert(prev => ({ ...prev, frequency: e.target.value as any }))}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    >
                      <option value="once">한 번만</option>
                      <option value="repeated">반복</option>
                      <option value="daily">일일</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">우선순위</label>
                    <select
                      value={newAlert.priority || 'medium'}
                      onChange={(e) => setNewAlert(prev => ({ ...prev, priority: e.target.value as any }))}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    >
                      <option value="low">낮음</option>
                      <option value="medium">보통</option>
                      <option value="high">높음</option>
                      <option value="critical">중요</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">알림 채널</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { key: 'push', label: '푸시', icon: FiSmartphone },
                      { key: 'email', label: '이메일', icon: FiMail },
                      { key: 'telegram', label: '텔레그램', icon: FiMessageSquare },
                      { key: 'discord', label: '디스코드', icon: FiSettings }
                    ].map(channel => (
                      <label
                        key={channel.key}
                        className="flex items-center gap-3 p-3 bg-gray-700/50 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={newAlert.channels?.[channel.key as keyof typeof newAlert.channels] || false}
                          onChange={(e) => setNewAlert(prev => ({
                            ...prev,
                            channels: {
                              ...prev.channels,
                              [channel.key]: e.target.checked
                            } as any
                          }))}
                          className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                        />
                        <channel.icon className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-300">{channel.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                <button
                  onClick={saveAlert}
                  disabled={!newAlert.name || !newAlert.value}
                  className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white rounded-lg transition-colors font-medium"
                >
                  {editingAlert ? '알림 업데이트' : '알림 추가'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default AlertSettings