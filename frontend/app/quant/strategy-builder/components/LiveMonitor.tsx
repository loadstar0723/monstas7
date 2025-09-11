'use client'

import { useState, useEffect, useRef } from 'react'
import { safeFixed, safePrice, safeAmount, safePercent, safeMillion, safeThousand } from '@/lib/safeFormat'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FaPlay, FaPause, FaStop, FaCircle, FaExclamationTriangle,
  FaCheckCircle, FaClock, FaChartLine, FaDollarSign
} from 'react-icons/fa'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface LiveMonitorProps {
  symbol: string
}

interface ExecutionLog {
  id: string
  timestamp: Date
  type: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS'
  message: string
}

interface LiveStats {
  status: 'running' | 'paused' | 'stopped'
  uptime: number
  totalSignals: number
  executedTrades: number
  currentPosition: 'LONG' | 'SHORT' | 'NONE'
  unrealizedPnL: number
  realizedPnL: number
}

export default function LiveMonitor({ symbol }: LiveMonitorProps) {
  const [isRunning, setIsRunning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [logs, setLogs] = useState<ExecutionLog[]>([])
  const [liveData, setLiveData] = useState<any[]>([])
  const [stats, setStats] = useState<LiveStats>({
    status: 'stopped',
    uptime: 0,
    totalSignals: 0,
    executedTrades: 0,
    currentPosition: 'NONE',
    unrealizedPnL: 0,
    realizedPnL: 0
  })
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const uptimeRef = useRef<NodeJS.Timeout | null>(null)
  
  // 전략 시작
  const startStrategy = () => {
    setIsRunning(true)
    setIsPaused(false)
    setStats(prev => ({ ...prev, status: 'running' }))
    
    addLog('INFO', `전략 실행 시작 - ${symbol}`)
    addLog('SUCCESS', 'WebSocket 연결 성공')
    
    // 실시간 데이터 시뮬레이션
    intervalRef.current = setInterval(() => {
      const newDataPoint = {
        time: new Date().toLocaleTimeString(),
        price: 45000 + Math.random() * 2000,
        signal: Math.random() > 0.8 ? (Math.random() > 0.5 ? 'BUY' : 'SELL') : null
      }
      
      setLiveData(prev => [...prev.slice(-50), newDataPoint])
      
      if (newDataPoint.signal) {
        setStats(prev => ({
          ...prev,
          totalSignals: prev.totalSignals + 1,
          executedTrades: Math.random() > 0.3 ? prev.executedTrades + 1 : prev.executedTrades
        }))
        
        addLog('SUCCESS', `${newDataPoint.signal} 신호 발생 @ $${safePrice(newDataPoint.price, 2)}`)
        
        if (Math.random() > 0.7) {
          addLog('INFO', '거래 실행됨')
          setStats(prev => ({
            ...prev,
            currentPosition: newDataPoint.signal === 'BUY' ? 'LONG' : 'SHORT',
            unrealizedPnL: (Math.random() - 0.5) * 1000
          }))
        }
      }
    }, 2000)
    
    // 업타임 카운터
    uptimeRef.current = setInterval(() => {
      setStats(prev => ({ ...prev, uptime: prev.uptime + 1 }))
    }, 1000)
  }
  
  // 일시정지
  const pauseStrategy = () => {
    setIsPaused(true)
    setStats(prev => ({ ...prev, status: 'paused' }))
    addLog('WARNING', '전략 일시정지')
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    if (uptimeRef.current) {
      clearInterval(uptimeRef.current)
    }
  }
  
  // 재개
  const resumeStrategy = () => {
    if (isPaused) {
      startStrategy()
      addLog('INFO', '전략 재개')
    }
  }
  
  // 정지
  const stopStrategy = () => {
    setIsRunning(false)
    setIsPaused(false)
    setStats(prev => ({ ...prev, status: 'stopped', currentPosition: 'NONE' }))
    addLog('ERROR', '전략 정지')
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    if (uptimeRef.current) {
      clearInterval(uptimeRef.current)
    }
  }
  
  // 로그 추가
  const addLog = (type: ExecutionLog['type'], message: string) => {
    const newLog: ExecutionLog = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      type,
      message
    }
    setLogs(prev => [newLog, ...prev].slice(0, 100))
  }
  
  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (uptimeRef.current) clearInterval(uptimeRef.current)
    }
  }, [])
  
  // 업타임 포맷
  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* 왼쪽: 컨트롤 패널 */}
      <div className="lg:col-span-1 space-y-4">
        {/* 실행 컨트롤 */}
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">실행 제어</h3>
          
          <div className="space-y-3">
            {!isRunning ? (
              <button
                onClick={startStrategy}
                className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                <FaPlay />
                전략 시작
              </button>
            ) : (
              <>
                {!isPaused ? (
                  <button
                    onClick={pauseStrategy}
                    className="w-full px-4 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg flex items-center justify-center gap-2 transition-colors"
                  >
                    <FaPause />
                    일시정지
                  </button>
                ) : (
                  <button
                    onClick={resumeStrategy}
                    className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center gap-2 transition-colors"
                  >
                    <FaPlay />
                    재개
                  </button>
                )}
                <button
                  onClick={stopStrategy}
                  className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  <FaStop />
                  정지
                </button>
              </>
            )}
          </div>
          
          {/* 상태 표시 */}
          <div className="mt-4 p-3 bg-gray-900/50 rounded-lg">
            <div className="flex items-center gap-2">
              <FaCircle className={`text-xs ${
                stats.status === 'running' ? 'text-green-400 animate-pulse' :
                stats.status === 'paused' ? 'text-yellow-400' :
                'text-gray-500'
              }`} />
              <span className="text-white font-semibold">
                {stats.status === 'running' ? '실행 중' :
                 stats.status === 'paused' ? '일시정지' :
                 '정지됨'}
              </span>
            </div>
            <div className="mt-2 text-sm text-gray-400">
              <FaClock className="inline mr-1" />
              업타임: {formatUptime(stats.uptime)}
            </div>
          </div>
        </div>
        
        {/* 실시간 통계 */}
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">실시간 통계</h3>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">총 신호</span>
              <span className="text-white font-semibold">{stats.totalSignals}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">실행 거래</span>
              <span className="text-white font-semibold">{stats.executedTrades}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">현재 포지션</span>
              <span className={`font-semibold ${
                stats.currentPosition === 'LONG' ? 'text-green-400' :
                stats.currentPosition === 'SHORT' ? 'text-red-400' :
                'text-gray-400'
              }`}>
                {stats.currentPosition}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">미실현 손익</span>
              <span className={`font-semibold ${
                stats.unrealizedPnL >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                ${safeFixed(stats.unrealizedPnL, 2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">실현 손익</span>
              <span className={`font-semibold ${
                stats.realizedPnL >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                ${safeFixed(stats.realizedPnL, 2)}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* 오른쪽: 차트 & 로그 */}
      <div className="lg:col-span-2 space-y-4">
        {/* 실시간 차트 */}
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">실시간 가격 & 신호</h3>
          
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={liveData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="time" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" domain={['dataMin - 100', 'dataMax + 100']} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                labelStyle={{ color: '#F3F4F6' }}
              />
              <Line 
                type="monotone" 
                dataKey="price" 
                stroke="#A855F7" 
                strokeWidth={2}
                dot={(props) => {
                  const { payload, index } = props
                  if (payload.signal) {
                    return (
                      <circle
                        key={`dot-${index}`}
                        cx={props.cx}
                        cy={props.cy}
                        r={6}
                        fill={payload.signal === 'BUY' ? '#10B981' : '#EF4444'}
                      />
                    )
                  }
                  return null
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        {/* 실행 로그 */}
        <div className="bg-gray-800/50 rounded-xl border border-gray-700">
          <div className="px-6 py-4 border-b border-gray-700">
            <h3 className="text-lg font-semibold text-white">실행 로그</h3>
          </div>
          
          <div className="h-[300px] overflow-y-auto p-4">
            <AnimatePresence>
              {logs.map((log) => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-start gap-3 mb-2 text-sm"
                >
                  <span className="text-gray-500 text-xs mt-0.5">
                    {log.timestamp.toLocaleTimeString()}
                  </span>
                  {log.type === 'SUCCESS' && <FaCheckCircle className="text-green-400 mt-0.5" />}
                  {log.type === 'WARNING' && <FaExclamationTriangle className="text-yellow-400 mt-0.5" />}
                  {log.type === 'ERROR' && <FaExclamationTriangle className="text-red-400 mt-0.5" />}
                  {log.type === 'INFO' && <FaCircle className="text-blue-400 text-xs mt-1" />}
                  <span className={`flex-1 ${
                    log.type === 'SUCCESS' ? 'text-green-400' :
                    log.type === 'WARNING' ? 'text-yellow-400' :
                    log.type === 'ERROR' ? 'text-red-400' :
                    'text-gray-300'
                  }`}>
                    {log.message}
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {logs.length === 0 && (
              <div className="text-center text-gray-500 mt-8">
                전략을 시작하면 로그가 여기에 표시됩니다
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}