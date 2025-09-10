'use client'

import { useState } from 'react'
import { FaBell, FaPlus, FaTrash, FaToggleOn, FaToggleOff } from 'react-icons/fa'

interface PinBarAlertsProps {
  symbol: string
  timeframe: string
}

interface Alert {
  id: string
  symbol: string
  timeframe: string
  type: 'bullish' | 'bearish' | 'both'
  minStrength: number
  enabled: boolean
  createdAt: string
}

export default function PinBarAlerts({ symbol, timeframe }: PinBarAlertsProps) {
  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: '1',
      symbol: 'BTCUSDT',
      timeframe: '15m',
      type: 'both',
      minStrength: 70,
      enabled: true,
      createdAt: new Date().toLocaleString('ko-KR')
    }
  ])
  
  const [newAlert, setNewAlert] = useState({
    type: 'both' as 'bullish' | 'bearish' | 'both',
    minStrength: 60
  })

  const addAlert = () => {
    const alert: Alert = {
      id: Date.now().toString(),
      symbol,
      timeframe,
      type: newAlert.type,
      minStrength: newAlert.minStrength,
      enabled: true,
      createdAt: new Date().toLocaleString('ko-KR')
    }
    setAlerts([...alerts, alert])
  }

  const toggleAlert = (id: string) => {
    setAlerts(alerts.map(alert => 
      alert.id === id ? { ...alert, enabled: !alert.enabled } : alert
    ))
  }

  const deleteAlert = (id: string) => {
    setAlerts(alerts.filter(alert => alert.id !== id))
  }

  return (
    <div className="bg-gray-800/50 rounded-xl border border-gray-700">
      <div className="p-4 border-b border-gray-700">
        <h3 className="text-lg font-bold text-white mb-3">⚡ 핀 바 알림 설정</h3>
        
        {/* 새 알림 추가 */}
        <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4">
          <h4 className="text-purple-400 font-medium mb-3">새 알림 만들기</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-gray-400 text-sm mb-1 block">패턴 유형</label>
              <select 
                value={newAlert.type}
                onChange={(e) => setNewAlert({...newAlert, type: e.target.value as any})}
                className="w-full bg-gray-900 text-white rounded-lg px-3 py-2 border border-gray-700 focus:border-purple-500 outline-none"
              >
                <option value="both">모든 패턴</option>
                <option value="bullish">Bullish만</option>
                <option value="bearish">Bearish만</option>
              </select>
            </div>
            <div>
              <label className="text-gray-400 text-sm mb-1 block">최소 강도 (%)</label>
              <input 
                type="number"
                min="30"
                max="100"
                value={newAlert.minStrength}
                onChange={(e) => setNewAlert({...newAlert, minStrength: parseInt(e.target.value)})}
                className="w-full bg-gray-900 text-white rounded-lg px-3 py-2 border border-gray-700 focus:border-purple-500 outline-none"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={addAlert}
                className="w-full px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition flex items-center justify-center gap-2"
              >
                <FaPlus /> 알림 추가
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-4">
        <h4 className="text-sm font-bold text-gray-400 mb-3">활성 알림 목록</h4>
        {alerts.length > 0 ? (
          <div className="space-y-2">
            {alerts.map((alert) => (
              <div 
                key={alert.id}
                className={`rounded-lg p-3 border ${
                  alert.enabled 
                    ? 'bg-gray-900/50 border-gray-700' 
                    : 'bg-gray-900/30 border-gray-800 opacity-50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleAlert(alert.id)}
                      className={`text-xl ${
                        alert.enabled ? 'text-green-400' : 'text-gray-500'
                      }`}
                    >
                      {alert.enabled ? <FaToggleOn /> : <FaToggleOff />}
                    </button>
                    <div>
                      <p className="text-white font-medium">{alert.symbol} - {alert.timeframe}</p>
                      <p className="text-gray-400 text-xs">{alert.createdAt}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteAlert(alert.id)}
                    className="text-red-400 hover:text-red-300 transition"
                  >
                    <FaTrash />
                  </button>
                </div>
                
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-500">패턴 유형: </span>
                    <span className={`font-medium ${
                      alert.type === 'bullish' ? 'text-green-400' : 
                      alert.type === 'bearish' ? 'text-red-400' : 'text-purple-400'
                    }`}>
                      {alert.type === 'both' ? '모든 패턴' : 
                       alert.type === 'bullish' ? 'Bullish' : 'Bearish'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">최소 강도: </span>
                    <span className="text-white font-medium">{alert.minStrength}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <FaBell className="text-gray-500 text-3xl mx-auto mb-3" />
            <p className="text-gray-400">설정된 알림이 없습니다</p>
            <p className="text-gray-500 text-sm mt-1">위에서 새 알림을 추가해주세요</p>
          </div>
        )}
      </div>
      
      {/* 알림 설명 */}
      <div className="p-4 border-t border-gray-700">
        <div className="bg-gray-900/50 rounded-lg p-4">
          <h4 className="text-yellow-400 font-medium mb-2 flex items-center gap-2">
            <FaBell /> 알림 작동 방식
          </h4>
          <ul className="text-gray-400 text-sm space-y-1">
            <li>• 핀 바 패턴이 감지되면 실시간으로 알림을 받습니다</li>
            <li>• 설정한 최소 강도 이상의 패턴만 알림이 옵니다</li>
            <li>• 브라우저 알림 권한이 필요합니다</li>
            <li>• 텔레그램 봇 연동 시 모바일 알림도 가능합니다</li>
          </ul>
        </div>
      </div>
    </div>
  )
}