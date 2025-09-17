'use client'

import React, { useState, useEffect } from 'react'
import { FaBolt, FaServer, FaNetworkWired, FaMicrochip } from 'react-icons/fa'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

export default function GoParallelProcessing() {
  const [goroutineData, setGoroutineData] = useState<any[]>([])
  const [cpuData, setCpuData] = useState<any[]>([])
  const [memoryData, setMemoryData] = useState<any[]>([])

  useEffect(() => {
    // Goroutine 처리 데이터 (결정론적 생성)
    const gData = Array.from({ length: 20 }, (_, i) => ({
      time: `${i}s`,
      goroutines: 100 + Math.sin(i * 0.5) * 30 + Math.cos(i * 0.3) * 20,
      throughput: 5000 + Math.sin(i * 0.4) * 1500 + Math.cos(i * 0.6) * 1000,
      latency: 2 + Math.sin(i * 0.3) * 0.5
    }))
    setGoroutineData(gData)

    // CPU 사용률 데이터
    const cData = Array.from({ length: 8 }, (_, i) => ({
      core: `Core ${i + 1}`,
      python: 45 + ((i * 17) % 30),
      go: 85 + ((i * 13) % 10)
    }))
    setCpuData(cData)

    // 메모리 효율성 데이터
    const mData = [
      { metric: 'LSTM 레이어', python: 512, go: 128 },
      { metric: '가중치 행렬', python: 256, go: 64 },
      { metric: '활성화 함수', python: 128, go: 32 },
      { metric: '그래디언트', python: 256, go: 48 },
      { metric: '버퍼', python: 64, go: 16 }
    ]
    setMemoryData(mData)
  }, [])

  return (
    <div className="space-y-6">
      {/* Goroutines 병렬 처리 현황 */}
      <div className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 backdrop-blur-sm rounded-xl p-6 border border-green-500/30">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <FaBolt className="text-green-400" />
          Goroutines 병렬 LSTM 처리
        </h3>

        {/* 실시간 상태 */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="text-gray-400 text-sm mb-1">활성 Goroutines</div>
            <div className="text-3xl font-bold text-green-400">127</div>
            <div className="text-xs text-gray-500">동시 실행</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="text-gray-400 text-sm mb-1">처리량</div>
            <div className="text-3xl font-bold text-blue-400">6.5K/s</div>
            <div className="text-xs text-gray-500">시퀀스/초</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="text-gray-400 text-sm mb-1">평균 레이턴시</div>
            <div className="text-3xl font-bold text-purple-400">1.8ms</div>
            <div className="text-xs text-gray-500">예측 시간</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="text-gray-400 text-sm mb-1">병렬 효율</div>
            <div className="text-3xl font-bold text-yellow-400">94%</div>
            <div className="text-xs text-gray-500">최적화율</div>
          </div>
        </div>

        {/* Goroutine 처리량 차트 */}
        <div className="bg-gray-800/50 rounded-lg p-4 mb-6">
          <h4 className="text-white font-semibold mb-3">실시간 Goroutine 처리 현황</h4>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={goroutineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="time" stroke="#9ca3af" />
              <YAxis yAxisId="left" stroke="#9ca3af" />
              <YAxis yAxisId="right" orientation="right" stroke="#9ca3af" />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #10b981' }} />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="goroutines" stroke="#10b981" name="Goroutines" strokeWidth={2} />
              <Line yAxisId="right" type="monotone" dataKey="throughput" stroke="#3b82f6" name="처리량" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* CPU 코어별 사용률 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h4 className="text-white font-semibold mb-3">CPU 코어별 사용률 비교</h4>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={cpuData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="core" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #10b981' }} />
                <Legend />
                <Bar dataKey="python" fill="#f59e0b" name="Python LSTM" />
                <Bar dataKey="go" fill="#10b981" name="Go LSTM" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* 메모리 효율성 비교 */}
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h4 className="text-white font-semibold mb-3">메모리 사용량 비교 (MB)</h4>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={memoryData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis type="number" stroke="#9ca3af" />
                <YAxis type="category" dataKey="metric" stroke="#9ca3af" />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #10b981' }} />
                <Legend />
                <Bar dataKey="python" fill="#f59e0b" name="Python" />
                <Bar dataKey="go" fill="#10b981" name="Go" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 병렬 처리 최적화 기법 */}
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="bg-gradient-to-r from-green-600/20 to-green-400/20 p-4 rounded-lg border border-green-500/30">
            <FaMicrochip className="text-2xl text-green-400 mb-2" />
            <h5 className="text-white font-semibold">SIMD 벡터화</h5>
            <p className="text-gray-400 text-sm mt-1">행렬 연산 4x 가속</p>
          </div>
          <div className="bg-gradient-to-r from-blue-600/20 to-blue-400/20 p-4 rounded-lg border border-blue-500/30">
            <FaServer className="text-2xl text-blue-400 mb-2" />
            <h5 className="text-white font-semibold">채널 통신</h5>
            <p className="text-gray-400 text-sm mt-1">락프리 데이터 전달</p>
          </div>
          <div className="bg-gradient-to-r from-purple-600/20 to-purple-400/20 p-4 rounded-lg border border-purple-500/30">
            <FaNetworkWired className="text-2xl text-purple-400 mb-2" />
            <h5 className="text-white font-semibold">워크 스틸링</h5>
            <p className="text-gray-400 text-sm mt-1">자동 부하 분산</p>
          </div>
        </div>
      </div>
    </div>
  )
}