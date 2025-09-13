'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FaBell, FaTelegramPlane, FaEnvelope, FaMobile } from 'react-icons/fa'
import { MdNotifications, MdNotificationsActive, MdNotificationsOff } from 'react-icons/md'
import { apiClient } from '../../lib/api'
import WebSocketManager from '../../lib/websocketManager'
import { config } from '@/lib/config'

interface Alert {
  id: string
  type: 'price' | 'pattern' | 'volume' | 'indicator' | 'news'
  name: string
  description: string
  condition: string
  value?: number
  enabled: boolean
  channels: ('telegram' | 'email' | 'push' | 'sms')[]
  priority: 'high' | 'medium' | 'low'
}

interface AlertSettingsProps {
  symbol?: string
  userId?: string
}

/**
 * 실시간 알림 설정 컴포넌트
 * 실제 가격 데이터와 데이터베이스 연동
 */
export default function AlertSettings({ 
  symbol = 'BTC',
  userId
}: AlertSettingsProps) {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [currentPrice, setCurrentPrice] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const wsManager = WebSocketManager.getInstance()
    
    const handleWebSocketData = (data: any) => {
      const symbolData = data.prices.find((p: any) => p.symbol === symbol)
      if (symbolData) {
        setCurrentPrice(symbolData.price)
        setLoading(false)
      }
    }

    wsManager.subscribe(handleWebSocketData)
    
    if (userId) {
      loadUserAlerts()
    }

    return () => {
      wsManager.unsubscribe(handleWebSocketData)
    }
  }, [symbol, userId])

  const loadUserAlerts = async () => {
    if (!userId) return
    
    try {
      const userAlerts = await apiClient.getAlerts(userId)
      setAlerts(userAlerts)
    } catch (err) {
      console.error('알림 설정 로드 실패:', err)
      // 기본 알림 설정으로 초기화
      initializeDefaultAlerts()
    }
  }

  const initializeDefaultAlerts = () => {
    if (currentPrice > 0) {
      setAlerts([
        {
          id: '1',
          type: 'price',
          name: '진입가 도달',
          description: `${symbol} 가격이 설정값에 도달 시 알림`,
          condition: 'crosses',
          value: currentPrice * config.decimals.value995,
          enabled: true,
          channels: ['telegram'],
          priority: 'high'
        },
    {
      id: '2',
      type: 'price',
      name: '손절가 도달',
      description: '손절 가격 도달 시 긴급 알림',
      condition: 'below',
      value: currentPrice * config.decimals.value95,
      enabled: true,
      channels: ['telegram', 'push'],
      priority: 'high'
    },
    {
      id: '3',
      type: 'price',
      name: '목표가 도달',
      description: '목표 가격 도달 시 차익실현 알림',
      condition: 'above',
      value: currentPrice * 1.05,
      enabled: true,
      channels: ['telegram'],
      priority: 'medium'
    },
    {
      id: '4',
      type: 'pattern',
      name: '패턴 완성',
      description: '헤드앤숄더, 삼각수렴 등 패턴 완성',
      condition: 'completed',
      enabled: false,
      channels: ['telegram'],
      priority: 'medium'
    },
    {
      id: '5',
      type: 'volume',
      name: '대량 거래 감지',
      description: '평균 대비 ${config.percentage.value300} 이상 거래량',
      condition: 'spike',
      value: 300,
      enabled: true,
      channels: ['telegram'],
      priority: 'high'
    },
    {
      id: '6',
      type: 'indicator',
      name: 'RSI 과매수/과매도',
      description: 'RSI 30 이하 또는 70 이상',
      condition: 'extreme',
      enabled: false,
      channels: ['telegram'],
      priority: 'low'
    }
  ])
    }
  }

  const toggleAlert = (id: string) => {
    setAlerts(alerts.map(alert => 
      alert.id === id ? { ...alert, enabled: !alert.enabled } : alert
    ))
  }

  const toggleChannel = (alertId: string, channel: 'telegram' | 'email' | 'push' | 'sms') => {
    setAlerts(alerts.map(alert => {
      if (alert.id === alertId) {
        const channels = alert.channels.includes(channel)
          ? alert.channels.filter(c => c !== channel)
          : [...alert.channels, channel]
        return { ...alert, channels }
      }
      return alert
    }))
  }

  const updateAlertValue = (id: string, value: number) => {
    setAlerts(alerts.map(alert => 
      alert.id === id ? { ...alert, value } : alert
    ))
  }

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'high': return 'text-red-400 bg-red-400/10'
      case 'medium': return 'text-yellow-400 bg-yellow-400/10'
      case 'low': return 'text-green-400 bg-green-400/10'
      default: return 'text-gray-400 bg-gray-400/10'
    }
  }

  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'price': return '💰'
      case 'pattern': return '📊'
      case 'volume': return '📈'
      case 'indicator': return '📉'
      case 'news': return '📰'
      default: return '🔔'
    }
  }

  const activeAlertCount = alerts.filter(a => a.enabled).length

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 border border-purple-500/30">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FaBell className="text-purple-400 text-2xl" />
          <h3 className="text-xl font-bold text-white">알림 설정</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">활성 알림:</span>
          <span className="px-2 py-1 bg-purple-600 rounded-full text-white text-sm font-bold">
            {activeAlertCount}
          </span>
        </div>
      </div>

      {/* 알림 채널 설정 */}
      <div className="bg-gray-800/50 rounded-lg p-4 mb-6 border border-gray-700">
        <h4 className="text-sm font-bold text-gray-400 mb-3">기본 알림 채널</h4>
        <div className="flex gap-4">
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-lg text-white">
            <FaTelegramPlane />
            <span className="text-sm">텔레그램</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-700 rounded-lg text-gray-400 hover:bg-gray-600">
            <FaEnvelope />
            <span className="text-sm">이메일</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-700 rounded-lg text-gray-400 hover:bg-gray-600">
            <MdNotifications />
            <span className="text-sm">푸시</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-700 rounded-lg text-gray-400 hover:bg-gray-600">
            <FaMobile />
            <span className="text-sm">SMS</span>
          </button>
        </div>
      </div>

      {/* 알림 목록 */}
      <div className="space-y-3 mb-6">
        {alerts.map((alert, index) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * config.decimals.value05 }}
            className={`bg-gray-800/30 rounded-lg p-4 border ${
              alert.enabled ? 'border-purple-500/30' : 'border-gray-700'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start gap-3">
                <div className="text-2xl">{getTypeIcon(alert.type)}</div>
                <div>
                  <div className="flex items-center gap-2">
                    <h5 className="font-bold text-white">{alert.name}</h5>
                    <span className={`px-2 py-config.decimals.value5 rounded-full text-xs font-medium ${getPriorityColor(alert.priority)}`}>
                      {alert.priority === 'high' ? '높음' : alert.priority === 'medium' ? '보통' : '낮음'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mt-1">{alert.description}</p>
                </div>
              </div>
              
              <button
                onClick={() => toggleAlert(alert.id)}
                className={`p-2 rounded-lg transition-all ${
                  alert.enabled 
                    ? 'bg-purple-600 text-white hover:bg-purple-700' 
                    : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                }`}
              >
                {alert.enabled ? <MdNotificationsActive /> : <MdNotificationsOff />}
              </button>
            </div>

            {/* 조건 설정 */}
            {alert.value !== undefined && alert.enabled && (
              <div className="mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-400">조건값:</span>
                  <input
                    type="number"
                    value={alert.value}
                    onChange={(e) => updateAlertValue(alert.id, Number(e.target.value))}
                    className="px-3 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:border-purple-500 focus:outline-none"
                    step={alert.type === 'price' ? 100 : 1}
                  />
                  <span className="text-sm text-gray-400">
                    {alert.type === 'price' ? 'USDT' : alert.type === 'volume' ? '%' : ''}
                  </span>
                </div>
              </div>
            )}

            {/* 알림 채널 선택 */}
            {alert.enabled && (
              <div className="flex gap-2">
                {(['telegram', 'email', 'push', 'sms'] as const).map(channel => (
                  <button
                    key={channel}
                    onClick={() => toggleChannel(alert.id, channel)}
                    className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                      alert.channels.includes(channel)
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                    }`}
                  >
                    {channel === 'telegram' ? '텔레그램' :
                     channel === 'email' ? '이메일' :
                     channel === 'push' ? '푸시' : 'SMS'}
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* 고급 설정 */}
      <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-500/30 mb-6">
        <h4 className="text-sm font-bold text-blue-400 mb-3">🎯 스마트 알림</h4>
        <div className="space-y-3">
          <label className="flex items-center justify-between">
            <span className="text-sm text-gray-300">AI 예측 알림</span>
            <input type="checkbox" className="w-4 h-4 text-purple-600 rounded" defaultChecked />
          </label>
          <label className="flex items-center justify-between">
            <span className="text-sm text-gray-300">중복 알림 방지 (5분)</span>
            <input type="checkbox" className="w-4 h-4 text-purple-600 rounded" defaultChecked />
          </label>
          <label className="flex items-center justify-between">
            <span className="text-sm text-gray-300">야간 알림 (22:00 - 08:00)</span>
            <input type="checkbox" className="w-4 h-4 text-purple-600 rounded" />
          </label>
          <label className="flex items-center justify-between">
            <span className="text-sm text-gray-300">긴급 알림만 받기</span>
            <input type="checkbox" className="w-4 h-4 text-purple-600 rounded" />
          </label>
        </div>
      </div>

      {/* 액션 버튼 */}
      <div className="flex gap-3">
        <button 
          onClick={async () => {
            // API를 통한 알림 설정 저장
            if (userId) {
              try {
                await apiClient.saveAlerts(userId, alerts.filter(a => a.enabled))
                } catch (err) {
                console.error('알림 설정 저장 실패:', err)
              }
            }
          }}
          className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-bold transition-all"
        >
          설정 저장
        </button>
        <button className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-bold transition-all">
          테스트 알림
        </button>
      </div>

      {/* 텔레그램 연동 안내 */}
      <div className="mt-4 p-3 bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-lg border border-purple-500/30">
        <div className="flex items-center gap-3">
          <FaTelegramPlane className="text-blue-400 text-xl" />
          <div className="flex-1">
            <p className="text-sm text-gray-300">
              텔레그램 봇 <span className="text-white font-bold">@MonstaTradeBot</span>을 추가하고
              <span className="text-purple-400 font-bold"> /start</span> 명령어로 연동하세요.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}