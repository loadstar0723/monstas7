'use client'

import React, { useState, useEffect } from 'react'
import { FaMemory, FaRecycle, FaDatabase, FaChartPie } from 'react-icons/fa'
import { PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

export default function GoMemoryGRU() {
  const [memoryData, setMemoryData] = useState<any[]>([])
  const [gcStats, setGcStats] = useState<any>({})
  const [memoryDistribution, setMemoryDistribution] = useState<any[]>([])

  useEffect(() => {
    // 메모리 사용 패턴 (결정론적)
    const mData = Array.from({ length: 30 }, (_, i) => ({
      time: `${i}s`,
      heap: 320 + Math.sin(i * 0.35) * 50 + Math.cos(i * 0.25) * 35,
      stack: 42 + Math.sin(i * 0.45) * 12 + Math.cos(i * 0.65) * 8,
      gc: i % 5 === 0 ? 18 : 0
    }))
    setMemoryData(mData)

    // GC 통계
    setGcStats({
      collections: 118,
      pauseTime: 0.5,
      heapSize: 640,
      allocated: 352,
      efficiency: 94
    })

    // GRU 메모리 분포
    const distData = [
      { name: '리셋 게이트', value: 28, color: '#10b981' },
      { name: '업데이트 게이트', value: 26, color: '#3b82f6' },
      { name: '후보 상태', value: 22, color: '#f59e0b' },
      { name: '은닉 상태', value: 18, color: '#8b5cf6' },
      { name: '시스템', value: 6, color: '#ef4444' }
    ]
    setMemoryDistribution(distData)
  }, [])

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 backdrop-blur-sm rounded-xl p-6 border border-purple-500/30">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <FaMemory className="text-purple-400" />
          Go GRU 메모리 최적화
        </h3>

        {/* GC 메트릭 */}
        <div className="grid grid-cols-5 gap-4 mb-6">
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
              <FaDatabase className="text-blue-400" />
              힙 크기
            </div>
            <div className="text-2xl font-bold text-blue-400">{gcStats.heapSize} MB</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="text-gray-400 text-sm mb-2">사용 중</div>
            <div className="text-2xl font-bold text-green-400">{gcStats.allocated} MB</div>
            <div className="text-xs text-gray-500">55% 사용</div>
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
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="text-gray-400 text-sm mb-2">효율성</div>
            <div className="text-2xl font-bold text-red-400">{gcStats.efficiency}%</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 메모리 사용 추이 */}
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h4 className="text-white font-semibold mb-3">GRU 메모리 사용 패턴</h4>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={memoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="time" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #8b5cf6' }} />
                <Legend />
                <Area type="monotone" dataKey="heap" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} name="힙" />
                <Area type="monotone" dataKey="stack" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} name="스택" />
                <Area type="monotone" dataKey="gc" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.6} name="GC" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* GRU 메모리 분포 */}
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h4 className="text-white font-semibold mb-3">GRU 게이트별 메모리 할당</h4>
            <ResponsiveContainer width="100%" height={250}>
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

        {/* GRU 메모리 최적화 기법 */}
        <div className="mt-6 bg-gray-800/50 rounded-lg p-4">
          <h4 className="text-white font-semibold mb-3">GRU 전용 메모리 최적화</h4>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gray-900/50 rounded p-3">
              <div className="text-green-400 text-lg font-bold mb-1">게이트 풀링</div>
              <div className="text-gray-400 text-xs">게이트 메모리 재사용</div>
              <div className="mt-2 h-1 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-green-500" style={{ width: '91%' }} />
              </div>
              <div className="text-xs text-gray-500 mt-1">91% 절감</div>
            </div>
            <div className="bg-gray-900/50 rounded p-3">
              <div className="text-blue-400 text-lg font-bold mb-1">상태 압축</div>
              <div className="text-gray-400 text-xs">은닉 상태 최적화</div>
              <div className="mt-2 h-1 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500" style={{ width: '87%' }} />
              </div>
              <div className="text-xs text-gray-500 mt-1">87% 절감</div>
            </div>
            <div className="bg-gray-900/50 rounded p-3">
              <div className="text-purple-400 text-lg font-bold mb-1">인플레이스 연산</div>
              <div className="text-gray-400 text-xs">복사 없는 업데이트</div>
              <div className="mt-2 h-1 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500" style={{ width: '83%' }} />
              </div>
              <div className="text-xs text-gray-500 mt-1">83% 절감</div>
            </div>
            <div className="bg-gray-900/50 rounded p-3">
              <div className="text-yellow-400 text-lg font-bold mb-1">메모리 정렬</div>
              <div className="text-gray-400 text-xs">캐시 친화적 배치</div>
              <div className="mt-2 h-1 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-yellow-500" style={{ width: '76%' }} />
              </div>
              <div className="text-xs text-gray-500 mt-1">76% 절감</div>
            </div>
          </div>
        </div>

        {/* Python vs Go 비교 */}
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="bg-gradient-to-r from-green-600/20 to-green-400/20 p-4 rounded-lg border border-green-500/30">
            <h5 className="text-white font-semibold">70% 메모리 절감</h5>
            <p className="text-gray-400 text-sm mt-1">Python GRU 대비</p>
          </div>
          <div className="bg-gradient-to-r from-blue-600/20 to-blue-400/20 p-4 rounded-lg border border-blue-500/30">
            <h5 className="text-white font-semibold">제로카피 게이트</h5>
            <p className="text-gray-400 text-sm mt-1">게이트 간 직접 전달</p>
          </div>
          <div className="bg-gradient-to-r from-purple-600/20 to-purple-400/20 p-4 rounded-lg border border-purple-500/30">
            <h5 className="text-white font-semibold">스마트 GC</h5>
            <p className="text-gray-400 text-sm mt-1">예측 가능한 정지시간</p>
          </div>
        </div>
      </div>
    </div>
  )
}