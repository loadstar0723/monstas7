'use client'

import React, { useState, useEffect, useRef } from 'react'
import { FaStream, FaWifi, FaExchangeAlt, FaClock } from 'react-icons/fa'
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function GoRealtimeStream() {
  const [streamData, setStreamData] = useState<any[]>([])
  const [throughput, setThroughput] = useState(0)
  const [latency, setLatency] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    // 실시간 스트리밍 데이터 시뮬레이션
    const initialData = Array.from({ length: 50 }, (_, i) => ({
      time: new Date(Date.now() - (50 - i) * 1000).toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }),
      predictions: 50000 + Math.sin(i / 10) * 2000,
      confidence: 75 + Math.sin(i / 7) * 15,
      throughput: 1000 + Math.sin(i / 5) * 200
    }))
    setStreamData(initialData)

    // 실시간 업데이트
    intervalRef.current = setInterval(() => {
      const time = Date.now() / 1000
      setStreamData(prev => {
        const newData = [...prev.slice(-49), {
          time: new Date().toLocaleTimeString('ko-KR', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          }),
          predictions: 50000 + Math.sin(time / 10) * 2000,
          confidence: 75 + Math.sin(time / 7) * 15,
          throughput: 1000 + Math.sin(time / 5) * 200
        }]
        return newData
      })
      setThroughput(1000 + Math.sin(time / 5) * 200)
      setLatency(5 + Math.sin(time / 3) * 2)
    }, 1000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 backdrop-blur-sm rounded-xl p-6 border border-blue-500/30">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <FaStream className="text-blue-400" />
          실시간 예측 스트리밍
        </h3>

        {/* 스트리밍 메트릭 */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
              <FaWifi className="text-green-400" />
              연결 상태
            </div>
            <div className="text-2xl font-bold text-green-400">활성</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
              <FaExchangeAlt className="text-blue-400" />
              처리량
            </div>
            <div className="text-2xl font-bold text-blue-400">{throughput.toFixed(0)}/s</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
              <FaClock className="text-yellow-400" />
              지연시간
            </div>
            <div className="text-2xl font-bold text-yellow-400">{latency.toFixed(1)}ms</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="text-gray-400 text-sm mb-2">버퍼 크기</div>
            <div className="text-2xl font-bold text-purple-400">512KB</div>
          </div>
        </div>

        {/* 실시간 차트 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h4 className="text-white font-semibold mb-3">예측값 스트림</h4>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={streamData}>
                <defs>
                  <linearGradient id="predGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="time"
                  stroke="#9ca3af"
                  tick={{ fontSize: 10 }}
                  interval={10}
                />
                <YAxis stroke="#9ca3af" />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #3b82f6' }} />
                <Area type="monotone" dataKey="predictions" stroke="#3b82f6" fillOpacity={1} fill="url(#predGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-gray-800/50 rounded-lg p-4">
            <h4 className="text-white font-semibold mb-3">신뢰도 & 처리량</h4>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={streamData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="time"
                  stroke="#9ca3af"
                  tick={{ fontSize: 10 }}
                  interval={10}
                />
                <YAxis stroke="#9ca3af" />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #10b981' }} />
                <Line type="monotone" dataKey="confidence" stroke="#10b981" strokeWidth={2} name="신뢰도(%)" />
                <Line type="monotone" dataKey="throughput" stroke="#f59e0b" strokeWidth={2} name="처리량" yAxisId="right" />
                <YAxis yAxisId="right" orientation="right" stroke="#9ca3af" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* WebSocket 상태 */}
        <div className="mt-6 bg-gray-800/50 rounded-lg p-4">
          <h4 className="text-white font-semibold mb-3">WebSocket 스트리밍 상태</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">메시지 큐</span>
              <div className="flex-1 mx-4 bg-gray-700 rounded-full h-2 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-green-500 to-green-400" style={{ width: '35%' }} />
              </div>
              <span className="text-green-400">35%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">CPU 사용률</span>
              <div className="flex-1 mx-4 bg-gray-700 rounded-full h-2 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-500 to-blue-400" style={{ width: '62%' }} />
              </div>
              <span className="text-blue-400">62%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">네트워크 I/O</span>
              <div className="flex-1 mx-4 bg-gray-700 rounded-full h-2 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-purple-500 to-purple-400" style={{ width: '78%' }} />
              </div>
              <span className="text-purple-400">78%</span>
            </div>
          </div>
        </div>

        {/* 스트리밍 특징 */}
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="bg-gradient-to-r from-blue-600/20 to-blue-400/20 p-4 rounded-lg border border-blue-500/30">
            <h5 className="text-white font-semibold">백프레셔 제어</h5>
            <p className="text-gray-400 text-sm mt-1">자동 흐름 제어로 안정성 보장</p>
          </div>
          <div className="bg-gradient-to-r from-green-600/20 to-green-400/20 p-4 rounded-lg border border-green-500/30">
            <h5 className="text-white font-semibold">제로카피 전송</h5>
            <p className="text-gray-400 text-sm mt-1">메모리 복사 없는 빠른 전달</p>
          </div>
          <div className="bg-gradient-to-r from-purple-600/20 to-purple-400/20 p-4 rounded-lg border border-purple-500/30">
            <h5 className="text-white font-semibold">자동 재연결</h5>
            <p className="text-gray-400 text-sm mt-1">연결 끊김 시 자동 복구</p>
          </div>
        </div>
      </div>
    </div>
  )
}