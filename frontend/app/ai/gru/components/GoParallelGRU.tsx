'use client'

import React, { useState, useEffect } from 'react'
import { FaBolt, FaServer, FaNetworkWired, FaMicrochip } from 'react-icons/fa'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

export default function GoParallelGRU() {
  const [goroutineData, setGoroutineData] = useState<any[]>([])
  const [gateData, setGateData] = useState<any[]>([])
  const [cpuUtilization, setCpuUtilization] = useState<any[]>([])

  useEffect(() => {
    // Goroutine 처리 데이터
    const gData = Array.from({ length: 20 }, (_, i) => ({
      time: `${i}s`,
      goroutines: 80 + Math.sin(i * 0.4) * 25 + Math.cos(i * 0.3) * 15,
      throughput: 4500 + Math.sin(i * 0.5) * 1200 + Math.cos(i * 0.4) * 800,
      latency: 1.5 + Math.sin(i * 0.3) * 0.4
    }))
    setGoroutineData(gData)

    // GRU 게이트별 병렬 처리
    const gates = [
      { gate: '리셋 게이트', python: 45, go: 92 },
      { gate: '업데이트 게이트', python: 48, go: 94 },
      { gate: '후보 상태', python: 52, go: 91 },
      { gate: '최종 출력', python: 42, go: 89 }
    ]
    setGateData(gates)

    // CPU 코어별 사용률
    const cpuData = Array.from({ length: 8 }, (_, i) => ({
      core: `Core ${i + 1}`,
      usage: 75 + ((i * 19) % 20),
      goroutines: 12 + ((i * 7) % 8)
    }))
    setCpuUtilization(cpuData)
  }, [])

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 backdrop-blur-sm rounded-xl p-6 border border-green-500/30">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <FaBolt className="text-green-400" />
          Go 병렬 GRU 처리 엔진
        </h3>

        {/* 실시간 메트릭 */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="text-gray-400 text-sm mb-1">활성 Goroutines</div>
            <div className="text-3xl font-bold text-green-400">108</div>
            <div className="text-xs text-gray-500">동시 실행</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="text-gray-400 text-sm mb-1">처리량</div>
            <div className="text-3xl font-bold text-blue-400">5.8K/s</div>
            <div className="text-xs text-gray-500">시퀀스/초</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="text-gray-400 text-sm mb-1">평균 레이턴시</div>
            <div className="text-3xl font-bold text-purple-400">1.2ms</div>
            <div className="text-xs text-gray-500">게이트당</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="text-gray-400 text-sm mb-1">병렬 효율</div>
            <div className="text-3xl font-bold text-yellow-400">96%</div>
            <div className="text-xs text-gray-500">최적화율</div>
          </div>
        </div>

        {/* Goroutine 처리 현황 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h4 className="text-white font-semibold mb-3">GRU Goroutine 처리 현황</h4>
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

          {/* 게이트별 성능 비교 */}
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h4 className="text-white font-semibold mb-3">GRU 게이트 병렬 처리 효율 (%)</h4>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={gateData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="gate" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #10b981' }} />
                <Legend />
                <Bar dataKey="python" fill="#f59e0b" name="Python GRU" />
                <Bar dataKey="go" fill="#10b981" name="Go GRU" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CPU 코어 활용도 */}
        <div className="mt-6 bg-gray-800/50 rounded-lg p-4">
          <h4 className="text-white font-semibold mb-3">CPU 코어별 GRU 작업 분배</h4>
          <div className="grid grid-cols-8 gap-2">
            {cpuUtilization.map((cpu, i) => (
              <div key={i} className="bg-gray-900/50 rounded p-2 text-center">
                <div className="text-xs text-gray-500 mb-1">{cpu.core}</div>
                <div className="text-lg font-bold text-green-400">{cpu.usage}%</div>
                <div className="text-xs text-gray-400">{cpu.goroutines} GRs</div>
                <div className="mt-1 h-1 bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500" style={{ width: `${cpu.usage}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* GRU 병렬 최적화 기법 */}
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="bg-gradient-to-r from-green-600/20 to-green-400/20 p-4 rounded-lg border border-green-500/30">
            <FaMicrochip className="text-2xl text-green-400 mb-2" />
            <h5 className="text-white font-semibold">게이트 벡터화</h5>
            <p className="text-gray-400 text-sm mt-1">SIMD로 게이트 연산 4x 가속</p>
          </div>
          <div className="bg-gradient-to-r from-blue-600/20 to-blue-400/20 p-4 rounded-lg border border-blue-500/30">
            <FaServer className="text-2xl text-blue-400 mb-2" />
            <h5 className="text-white font-semibold">파이프라이닝</h5>
            <p className="text-gray-400 text-sm mt-1">게이트 간 병렬 처리</p>
          </div>
          <div className="bg-gradient-to-r from-purple-600/20 to-purple-400/20 p-4 rounded-lg border border-purple-500/30">
            <FaNetworkWired className="text-2xl text-purple-400 mb-2" />
            <h5 className="text-white font-semibold">워크 스틸링</h5>
            <p className="text-gray-400 text-sm mt-1">동적 부하 분산</p>
          </div>
        </div>
      </div>
    </div>
  )
}