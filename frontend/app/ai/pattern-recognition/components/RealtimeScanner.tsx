'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  FaBroadcastTower, FaBell, FaCheckCircle, FaExclamationTriangle,
  FaClock, FaChartLine, FaSync, FaFilter
} from 'react-icons/fa'
import { BiPulse } from 'react-icons/bi'

interface RealtimeScannerProps {
  symbol: string
  timeframe: string
}

interface ScanResult {
  id: string
  symbol: string
  pattern: string
  confidence: number
  stage: string
  timestamp: Date
  price: number
  change: number
  volume: number
  alert: boolean
}

export default function RealtimeScanner({ symbol, timeframe }: RealtimeScannerProps) {
  const [scanResults, setScanResults] = useState<ScanResult[]>([])
  const [isScanning, setIsScanning] = useState(true)
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [alertSettings, setAlertSettings] = useState({
    minConfidence: 80,
    patterns: ['all'],
    notification: true
  })

  // 실시간 스캔 시뮬레이션
  useEffect(() => {
    const interval = setInterval(() => {
      const newResult: ScanResult = {
        id: Date.now().toString(),
        symbol: ['BTC/USDT', 'ETH/USDT', 'BNB/USDT', 'SOL/USDT', 'MATIC/USDT'][Math.floor(Math.random() * 5)],
        pattern: ['머리어깨형', '삼각형', '깃발형', '이중천정', '쐐기형', '해머', '도지'][Math.floor(Math.random() * 7)],
        confidence: 65 + Math.floor(Math.random() * 35),
        stage: ['형성 중', '완성', '돌파 대기', '확정'][Math.floor(Math.random() * 4)],
        timestamp: new Date(),
        price: 40000 + Math.random() * 20000,
        change: (Math.random() - 0.5) * 10,
        volume: Math.random() * 1000000000,
        alert: Math.random() > 0.7
      }

      if (newResult.confidence >= alertSettings.minConfidence) {
        setScanResults(prev => [newResult, ...prev].slice(0, 50))
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [alertSettings.minConfidence])

  const filteredResults = scanResults.filter(result => {
    if (selectedFilter === 'all') return true
    if (selectedFilter === 'high') return result.confidence >= 85
    if (selectedFilter === 'alerts') return result.alert
    if (selectedFilter === 'complete') return result.stage === '완성'
    return true
  })

  const patternStats = scanResults.reduce((acc, result) => {
    acc[result.pattern] = (acc[result.pattern] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const topPatterns = Object.entries(patternStats)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="text-center">
        <h3 className="text-2xl font-bold text-white mb-2 flex items-center justify-center gap-3">
          <FaBroadcastTower className="text-cyan-400" />
          실시간 패턴 스캐너
        </h3>
        <p className="text-gray-400">
          모든 암호화폐를 실시간으로 스캔하여 패턴을 자동 탐지합니다
        </p>
      </div>

      {/* 스캔 상태 */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`relative ${isScanning ? 'animate-pulse' : ''}`}>
              <BiPulse className="text-3xl text-cyan-400" />
              {isScanning && (
                <div className="absolute inset-0 bg-cyan-400 rounded-full opacity-30 animate-ping"></div>
              )}
            </div>
            <div>
              <p className="text-white font-semibold">실시간 스캔 중</p>
              <p className="text-gray-400 text-sm">
                {scanResults.length}개 패턴 탐지 | 마지막 업데이트: 방금 전
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsScanning(!isScanning)}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
              isScanning 
                ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
            }`}
          >
            {isScanning ? '일시정지' : '재개'}
          </button>
        </div>
      </div>

      {/* 필터 & 알림 설정 */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-2">
          {[
            { id: 'all', label: '전체', icon: FaFilter },
            { id: 'high', label: '고신뢰도', icon: FaCheckCircle },
            { id: 'alerts', label: '알림', icon: FaBell },
            { id: 'complete', label: '완성됨', icon: FaChartLine }
          ].map((filter) => (
            <button
              key={filter.id}
              onClick={() => setSelectedFilter(filter.id)}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                selectedFilter === filter.id
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50'
                  : 'bg-gray-800/50 text-gray-400 border border-gray-700/50 hover:bg-gray-700/50'
              }`}
            >
              <filter.icon className="text-sm" />
              {filter.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <label className="text-gray-400 text-sm">최소 신뢰도:</label>
          <input
            type="range"
            min="60"
            max="95"
            value={alertSettings.minConfidence}
            onChange={(e) => setAlertSettings({
              ...alertSettings,
              minConfidence: parseInt(e.target.value)
            })}
            className="w-24"
          />
          <span className="text-white font-semibold">{alertSettings.minConfidence}%</span>
        </div>
      </div>

      {/* 패턴 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {topPatterns.map(([pattern, count], index) => (
          <motion.div
            key={pattern}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700/50 text-center"
          >
            <p className="text-gray-400 text-sm">{pattern}</p>
            <p className="text-2xl font-bold text-white mt-1">{count}</p>
          </motion.div>
        ))}
      </div>

      {/* 실시간 스캔 결과 */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 overflow-hidden">
        <div className="p-4 border-b border-gray-700/50">
          <h4 className="text-lg font-bold text-white flex items-center gap-2">
            <FaClock className="text-cyan-400" />
            실시간 탐지 결과
          </h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700/50">
                <th className="text-left py-3 px-4 text-gray-400">시간</th>
                <th className="text-left py-3 px-4 text-gray-400">심볼</th>
                <th className="text-left py-3 px-4 text-gray-400">패턴</th>
                <th className="text-center py-3 px-4 text-gray-400">신뢰도</th>
                <th className="text-center py-3 px-4 text-gray-400">상태</th>
                <th className="text-right py-3 px-4 text-gray-400">가격</th>
                <th className="text-right py-3 px-4 text-gray-400">변화</th>
                <th className="text-center py-3 px-4 text-gray-400">알림</th>
              </tr>
            </thead>
            <tbody>
              {filteredResults.map((result, index) => (
                <motion.tr
                  key={result.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.02 }}
                  className={`border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors ${
                    result.alert ? 'bg-cyan-900/10' : ''
                  }`}
                >
                  <td className="py-3 px-4 text-gray-400">
                    {result.timestamp.toLocaleTimeString()}
                  </td>
                  <td className="py-3 px-4 text-white font-medium">
                    {result.symbol}
                  </td>
                  <td className="py-3 px-4 text-white">
                    {result.pattern}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`px-2 py-1 rounded text-xs ${
                      result.confidence >= 85 ? 'bg-green-500/20 text-green-400' :
                      result.confidence >= 75 ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {result.confidence}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`text-sm ${
                      result.stage === '완성' ? 'text-green-400' :
                      result.stage === '돌파 대기' ? 'text-yellow-400' :
                      'text-gray-400'
                    }`}>
                      {result.stage}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right text-white">
                    ${result.price.toLocaleString()}
                  </td>
                  <td className={`py-3 px-4 text-right font-semibold ${
                    result.change > 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {result.change > 0 ? '+' : ''}{result.change.toFixed(2)}%
                  </td>
                  <td className="py-3 px-4 text-center">
                    {result.alert && (
                      <FaBell className="text-yellow-400 mx-auto animate-pulse" />
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 알림 설정 */}
      <div className="bg-gradient-to-r from-cyan-900/20 to-blue-900/20 rounded-xl p-6 border border-cyan-500/30">
        <h4 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <FaBell className="text-cyan-400" />
          알림 설정
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h5 className="text-cyan-400 font-semibold mb-3">알림 받을 패턴</h5>
            <div className="space-y-2">
              {['머리어깨형', '삼각형', '깃발형', '이중천정'].map((pattern) => (
                <label key={pattern} className="flex items-center gap-2 text-gray-300">
                  <input type="checkbox" className="text-cyan-400" defaultChecked />
                  {pattern}
                </label>
              ))}
            </div>
          </div>
          <div>
            <h5 className="text-blue-400 font-semibold mb-3">알림 방법</h5>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-gray-300">
                <input type="checkbox" defaultChecked />
                브라우저 푸시 알림
              </label>
              <label className="flex items-center gap-2 text-gray-300">
                <input type="checkbox" defaultChecked />
                이메일 알림
              </label>
              <label className="flex items-center gap-2 text-gray-300">
                <input type="checkbox" />
                텔레그램 알림
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}