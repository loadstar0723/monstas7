'use client'

import React, { useState, useEffect } from 'react'
import { FaBolt, FaServer, FaCogs, FaChartLine } from 'react-icons/fa'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function GoParallelBoost() {
  const [goroutines, setGoroutines] = useState(8)
  const [performance, setPerformance] = useState<any[]>([])

  useEffect(() => {
    // 고루틴 성능 데이터 생성
    const perfData = Array.from({ length: 20 }, (_, i) => ({
      goroutines: (i + 1) * 4,
      speedup: Math.min((i + 1) * 3.5, 25),
      efficiency: Math.max(95 - i * 2, 60)
    }))
    setPerformance(perfData)
  }, [])

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-green-900/20 to-blue-900/20 backdrop-blur-sm rounded-xl p-6 border border-green-500/30">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <FaBolt className="text-green-400" />
          Goroutines 병렬 부스팅
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 고루틴 설정 */}
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h4 className="text-white font-semibold mb-3">병렬 처리 설정</h4>
            <div className="space-y-4">
              <div>
                <label className="text-gray-400 text-sm">고루틴 수: {goroutines}</label>
                <input
                  type="range"
                  min="1"
                  max="32"
                  value={goroutines}
                  onChange={(e) => setGoroutines(Number(e.target.value))}
                  className="w-full mt-2"
                />
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-gray-900/50 p-3 rounded">
                  <div className="text-gray-500">CPU 활용률</div>
                  <div className="text-xl text-green-400">{(goroutines * 3.125).toFixed(1)}%</div>
                </div>
                <div className="bg-gray-900/50 p-3 rounded">
                  <div className="text-gray-500">메모리 사용</div>
                  <div className="text-xl text-blue-400">{(goroutines * 12).toFixed(0)} MB</div>
                </div>
              </div>
            </div>
          </div>

          {/* 성능 차트 */}
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h4 className="text-white font-semibold mb-3">속도 향상</h4>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={performance}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="goroutines" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #10b981' }} />
                <Line type="monotone" dataKey="speedup" stroke="#10b981" strokeWidth={2} name="속도 향상(x)" />
                <Line type="monotone" dataKey="efficiency" stroke="#3b82f6" strokeWidth={2} name="효율성(%)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 트리 병렬 처리 */}
        <div className="mt-6 bg-gray-800/50 rounded-lg p-4">
          <h4 className="text-white font-semibold mb-3">트리 병렬 학습</h4>
          <div className="grid grid-cols-4 gap-3">
            {[0, 1, 2, 3].map((batch) => (
              <div key={batch} className="bg-gray-900/50 rounded p-3">
                <div className="text-xs text-gray-500 mb-2">배치 {batch + 1}</div>
                <div className="space-y-1">
                  {[0, 1, 2].map((tree) => (
                    <div
                      key={tree}
                      className="h-2 bg-gradient-to-r from-green-600 to-green-400 rounded-full"
                      style={{
                        width: `${80 + Math.sin((batch + tree) * 0.5) * 20}%`,
                        opacity: 0.7 + Math.cos((batch + tree) * 0.3) * 0.3
                      }}
                    />
                  ))}
                </div>
                <div className="text-xs text-green-400 mt-2">
                  {(25 * (batch + 1)).toFixed(0)}% 완료
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Go 최적화 특징 */}
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="bg-gradient-to-r from-green-600/20 to-green-400/20 p-4 rounded-lg border border-green-500/30">
            <FaServer className="text-2xl text-green-400 mb-2" />
            <h5 className="text-white font-semibold">채널 통신</h5>
            <p className="text-gray-400 text-sm mt-1">락 프리 데이터 전달</p>
          </div>
          <div className="bg-gradient-to-r from-blue-600/20 to-blue-400/20 p-4 rounded-lg border border-blue-500/30">
            <FaCogs className="text-2xl text-blue-400 mb-2" />
            <h5 className="text-white font-semibold">동시성 제어</h5>
            <p className="text-gray-400 text-sm mt-1">세마포어 최적화</p>
          </div>
          <div className="bg-gradient-to-r from-purple-600/20 to-purple-400/20 p-4 rounded-lg border border-purple-500/30">
            <FaChartLine className="text-2xl text-purple-400 mb-2" />
            <h5 className="text-white font-semibold">선형 확장성</h5>
            <p className="text-gray-400 text-sm mt-1">코어 수 대비 성능</p>
          </div>
        </div>
      </div>
    </div>
  )
}