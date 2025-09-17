'use client'

import React, { useState, useEffect } from 'react'
import { FaStream, FaExchangeAlt, FaClock, FaChartLine } from 'react-icons/fa'
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

export default function GoStreamProcessing() {
  const [streamData, setStreamData] = useState<any[]>([])
  const [bufferStatus, setBufferStatus] = useState<any>({
    input: 0,
    processing: 0,
    output: 0
  })
  const [throughputComparison, setThroughputComparison] = useState<any[]>([])

  useEffect(() => {
    // 스트림 처리 데이터 (결정론적)
    const sData = Array.from({ length: 30 }, (_, i) => ({
      time: `${i}s`,
      inputRate: 1000 + Math.sin(i * 0.3) * 300 + Math.cos(i * 0.5) * 200,
      processRate: 980 + Math.sin(i * 0.4) * 280 + Math.cos(i * 0.6) * 190,
      outputRate: 960 + Math.sin(i * 0.5) * 260 + Math.cos(i * 0.7) * 180,
      backpressure: Math.max(0, Math.sin(i * 0.2) * 20)
    }))
    setStreamData(sData)

    // 버퍼 상태
    setBufferStatus({
      input: 42,
      processing: 28,
      output: 15
    })

    // 처리량 비교 데이터
    const tData = [
      { batch: '100', go: 0.8, python: 3.2, tensorflow: 1.5 },
      { batch: '500', go: 2.1, python: 12.5, tensorflow: 5.8 },
      { batch: '1000', go: 3.8, python: 28.4, tensorflow: 11.2 },
      { batch: '5000', go: 15.2, python: 145.3, tensorflow: 52.7 },
      { batch: '10000', go: 28.5, python: 312.8, tensorflow: 108.4 }
    ]
    setThroughputComparison(tData)
  }, [])

  return (
    <div className="space-y-6">
      {/* 실시간 스트림 처리 */}
      <div className="bg-gradient-to-r from-blue-900/20 to-cyan-900/20 backdrop-blur-sm rounded-xl p-6 border border-blue-500/30">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <FaStream className="text-blue-400" />
          Go 실시간 스트림 처리
        </h3>

        {/* 스트림 메트릭 */}
        <div className="grid grid-cols-5 gap-4 mb-6">
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="text-gray-400 text-sm mb-1">입력 속도</div>
            <div className="text-2xl font-bold text-green-400">1.2K/s</div>
            <div className="text-xs text-gray-500">시퀀스/초</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="text-gray-400 text-sm mb-1">처리 속도</div>
            <div className="text-2xl font-bold text-blue-400">1.18K/s</div>
            <div className="text-xs text-gray-500">LSTM/초</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="text-gray-400 text-sm mb-1">출력 속도</div>
            <div className="text-2xl font-bold text-purple-400">1.15K/s</div>
            <div className="text-xs text-gray-500">예측/초</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="text-gray-400 text-sm mb-1">백프레셔</div>
            <div className="text-2xl font-bold text-yellow-400">2%</div>
            <div className="text-xs text-gray-500">버퍼 압력</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="text-gray-400 text-sm mb-1">레이턴시</div>
            <div className="text-2xl font-bold text-red-400">0.8ms</div>
            <div className="text-xs text-gray-500">E2E</div>
          </div>
        </div>

        {/* 스트림 플로우 차트 */}
        <div className="bg-gray-800/50 rounded-lg p-4 mb-6">
          <h4 className="text-white font-semibold mb-3">실시간 스트림 플로우</h4>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={streamData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="time" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #3b82f6' }} />
              <Legend />
              <Area type="monotone" dataKey="inputRate" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} name="입력" />
              <Area type="monotone" dataKey="processRate" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} name="처리" />
              <Area type="monotone" dataKey="outputRate" stackId="1" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} name="출력" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* 버퍼 상태와 처리량 비교 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 버퍼 상태 시각화 */}
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h4 className="text-white font-semibold mb-3">버퍼 파이프라인 상태</h4>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">입력 버퍼</span>
                  <span className="text-green-400">{bufferStatus.input}%</span>
                </div>
                <div className="h-4 bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-green-500 to-green-400" style={{ width: `${bufferStatus.input}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">처리 버퍼</span>
                  <span className="text-blue-400">{bufferStatus.processing}%</span>
                </div>
                <div className="h-4 bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-blue-400" style={{ width: `${bufferStatus.processing}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">출력 버퍼</span>
                  <span className="text-purple-400">{bufferStatus.output}%</span>
                </div>
                <div className="h-4 bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-purple-500 to-purple-400" style={{ width: `${bufferStatus.output}%` }} />
                </div>
              </div>
            </div>

            {/* 스트림 제어 */}
            <div className="mt-4 grid grid-cols-3 gap-2">
              <button className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded transition-colors">
                Resume
              </button>
              <button className="px-2 py-1 bg-yellow-600 hover:bg-yellow-700 text-white text-xs rounded transition-colors">
                Pause
              </button>
              <button className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition-colors">
                Flush
              </button>
            </div>
          </div>

          {/* 배치 처리 시간 비교 */}
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h4 className="text-white font-semibold mb-3">배치 처리 시간 비교 (초)</h4>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={throughputComparison}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="batch" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" scale="log" domain={[0.1, 1000]} />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #3b82f6' }} />
                <Legend />
                <Line type="monotone" dataKey="go" stroke="#10b981" strokeWidth={2} name="Go LSTM" />
                <Line type="monotone" dataKey="python" stroke="#f59e0b" strokeWidth={2} name="Python" />
                <Line type="monotone" dataKey="tensorflow" stroke="#ef4444" strokeWidth={2} name="TensorFlow" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 스트림 처리 특징 */}
        <div className="mt-6 grid grid-cols-4 gap-4">
          <div className="bg-gray-900/50 rounded p-3">
            <FaClock className="text-xl text-blue-400 mb-2" />
            <div className="text-sm font-semibold text-white">Zero-Copy</div>
            <div className="text-xs text-gray-400">메모리 복사 없음</div>
          </div>
          <div className="bg-gray-900/50 rounded p-3">
            <FaExchangeAlt className="text-xl text-green-400 mb-2" />
            <div className="text-sm font-semibold text-white">백프레셔 제어</div>
            <div className="text-xs text-gray-400">자동 속도 조절</div>
          </div>
          <div className="bg-gray-900/50 rounded p-3">
            <FaChartLine className="text-xl text-purple-400 mb-2" />
            <div className="text-sm font-semibold text-white">파이프라이닝</div>
            <div className="text-xs text-gray-400">단계별 병렬 처리</div>
          </div>
          <div className="bg-gray-900/50 rounded p-3">
            <FaStream className="text-xl text-yellow-400 mb-2" />
            <div className="text-sm font-semibold text-white">무한 스트림</div>
            <div className="text-xs text-gray-400">메모리 제한 없음</div>
          </div>
        </div>
      </div>
    </div>
  )
}