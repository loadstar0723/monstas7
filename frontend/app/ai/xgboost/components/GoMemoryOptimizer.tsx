'use client'

import React, { useState, useEffect } from 'react'
import { FaMemory, FaRecycle, FaDatabase, FaChartPie } from 'react-icons/fa'
import { PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function GoMemoryOptimizer() {
  const [memoryData, setMemoryData] = useState<any[]>([])
  const [gcStats, setGcStats] = useState<any>({
    collections: 0,
    pauseTime: 0,
    heapSize: 0,
    allocated: 0
  })

  useEffect(() => {
    // 메모리 사용 패턴 데이터
    const memData = Array.from({ length: 30 }, (_, i) => ({
      time: `${i}s`,
      heap: 256 + Math.sin(i / 5) * 50,
      stack: 32 + Math.cos(i / 7) * 10,
      gc: i % 5 === 0 ? 15 : 0
    }))
    setMemoryData(memData)

    // GC 통계
    setGcStats({
      collections: 127,
      pauseTime: 0.8,
      heapSize: 512,
      allocated: 287
    })
  }, [])

  const memoryDistribution = [
    { name: '트리 구조', value: 45, color: '#10b981' },
    { name: '특징 데이터', value: 30, color: '#3b82f6' },
    { name: '예측 버퍼', value: 15, color: '#f59e0b' },
    { name: '시스템', value: 10, color: '#8b5cf6' }
  ]

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 backdrop-blur-sm rounded-xl p-6 border border-purple-500/30">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <FaMemory className="text-purple-400" />
          Go 메모리 최적화
        </h3>

        {/* 메모리 상태 */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
              <FaDatabase className="text-blue-400" />
              힙 크기
            </div>
            <div className="text-2xl font-bold text-blue-400">{gcStats.heapSize} MB</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="text-gray-400 text-sm mb-2">할당됨</div>
            <div className="text-2xl font-bold text-green-400">{gcStats.allocated} MB</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
              <FaRecycle className="text-yellow-400" />
              GC 횟수
            </div>
            <div className="text-2xl font-bold text-yellow-400">{gcStats.collections}</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="text-gray-400 text-sm mb-2">일시정지</div>
            <div className="text-2xl font-bold text-purple-400">{gcStats.pauseTime} ms</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 메모리 사용 추이 */}
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h4 className="text-white font-semibold mb-3">메모리 사용 패턴</h4>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={memoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="time" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #8b5cf6' }} />
                <Area type="monotone" dataKey="heap" stackId="1" stroke="#3b82f6" fill="#3b82f6" name="힙" />
                <Area type="monotone" dataKey="stack" stackId="1" stroke="#10b981" fill="#10b981" name="스택" />
                <Area type="monotone" dataKey="gc" stackId="1" stroke="#f59e0b" fill="#f59e0b" name="GC" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* 메모리 분포 */}
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h4 className="text-white font-semibold mb-3">메모리 할당 분포</h4>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={memoryDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {memoryDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 최적화 기법 */}
        <div className="mt-6 bg-gray-800/50 rounded-lg p-4">
          <h4 className="text-white font-semibold mb-3">메모리 최적화 기법</h4>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gray-900/50 rounded p-3">
              <div className="text-green-400 text-lg font-bold mb-1">객체 풀링</div>
              <div className="text-gray-400 text-xs">재사용 가능한 객체 관리</div>
              <div className="mt-2 h-1 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-green-500" style={{ width: '85%' }} />
              </div>
            </div>
            <div className="bg-gray-900/50 rounded p-3">
              <div className="text-blue-400 text-lg font-bold mb-1">슬라이스 재활용</div>
              <div className="text-gray-400 text-xs">메모리 재할당 최소화</div>
              <div className="mt-2 h-1 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500" style={{ width: '92%' }} />
              </div>
            </div>
            <div className="bg-gray-900/50 rounded p-3">
              <div className="text-purple-400 text-lg font-bold mb-1">구조체 정렬</div>
              <div className="text-gray-400 text-xs">메모리 패딩 최적화</div>
              <div className="mt-2 h-1 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500" style={{ width: '78%' }} />
              </div>
            </div>
            <div className="bg-gray-900/50 rounded p-3">
              <div className="text-yellow-400 text-lg font-bold mb-1">GC 튜닝</div>
              <div className="text-gray-400 text-xs">GOGC 파라미터 최적화</div>
              <div className="mt-2 h-1 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-yellow-500" style={{ width: '88%' }} />
              </div>
            </div>
          </div>
        </div>

        {/* 메모리 절감 효과 */}
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="bg-gradient-to-r from-green-600/20 to-green-400/20 p-4 rounded-lg border border-green-500/30">
            <h5 className="text-white font-semibold">60% 메모리 절감</h5>
            <p className="text-gray-400 text-sm mt-1">Python 대비 메모리 사용량</p>
          </div>
          <div className="bg-gradient-to-r from-blue-600/20 to-blue-400/20 p-4 rounded-lg border border-blue-500/30">
            <h5 className="text-white font-semibold">제로 할당 경로</h5>
            <p className="text-gray-400 text-sm mt-1">핫패스 메모리 할당 제거</p>
          </div>
          <div className="bg-gradient-to-r from-purple-600/20 to-purple-400/20 p-4 rounded-lg border border-purple-500/30">
            <h5 className="text-white font-semibold">예측 가능한 GC</h5>
            <p className="text-gray-400 text-sm mt-1">일정한 지연시간 보장</p>
          </div>
        </div>
      </div>
    </div>
  )
}