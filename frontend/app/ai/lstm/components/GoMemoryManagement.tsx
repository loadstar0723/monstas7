'use client'

import React, { useState, useEffect } from 'react'
import { FaMemory, FaRecycle, FaDatabase, FaChartPie } from 'react-icons/fa'
import { PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

export default function GoMemoryManagement() {
  const [memoryData, setMemoryData] = useState<any[]>([])
  const [gcStats, setGcStats] = useState<any>({
    collections: 0,
    pauseTime: 0,
    heapSize: 0,
    allocated: 0
  })
  const [memoryDistribution, setMemoryDistribution] = useState<any[]>([])

  useEffect(() => {
    // 메모리 사용 패턴 데이터 (결정론적)
    const mData = Array.from({ length: 30 }, (_, i) => ({
      time: `${i}s`,
      heap: 384 + Math.sin(i * 0.4) * 60 + Math.cos(i * 0.3) * 40,
      stack: 48 + Math.sin(i * 0.5) * 15 + Math.cos(i * 0.7) * 10,
      gc: i % 6 === 0 ? 20 : 0
    }))
    setMemoryData(mData)

    // GC 통계
    setGcStats({
      collections: 142,
      pauseTime: 0.6,
      heapSize: 768,
      allocated: 421
    })

    // 메모리 분포
    const distData = [
      { name: 'LSTM 셀 상태', value: 35, color: '#10b981' },
      { name: '가중치 행렬', value: 28, color: '#3b82f6' },
      { name: '활성화 버퍼', value: 18, color: '#f59e0b' },
      { name: '그래디언트', value: 12, color: '#8b5cf6' },
      { name: '시스템', value: 7, color: '#ef4444' }
    ]
    setMemoryDistribution(distData)
  }, [])

  return (
    <div className="space-y-6">
      {/* 메모리 최적화 대시보드 */}
      <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 backdrop-blur-sm rounded-xl p-6 border border-purple-500/30">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <FaMemory className="text-purple-400" />
          Go LSTM 메모리 최적화
        </h3>

        {/* GC 통계 */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
              <FaDatabase className="text-blue-400" />
              힙 크기
            </div>
            <div className="text-2xl font-bold text-blue-400">{gcStats.heapSize} MB</div>
            <div className="text-xs text-gray-500">최대 할당</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="text-gray-400 text-sm mb-2">사용 중</div>
            <div className="text-2xl font-bold text-green-400">{gcStats.allocated} MB</div>
            <div className="text-xs text-gray-500">54.8% 사용</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
              <FaRecycle className="text-yellow-400" />
              GC 횟수
            </div>
            <div className="text-2xl font-bold text-yellow-400">{gcStats.collections}</div>
            <div className="text-xs text-gray-500">수집 완료</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="text-gray-400 text-sm mb-2">일시정지</div>
            <div className="text-2xl font-bold text-purple-400">{gcStats.pauseTime} ms</div>
            <div className="text-xs text-gray-500">평균 시간</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 메모리 사용 추이 */}
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h4 className="text-white font-semibold mb-3">LSTM 메모리 사용 패턴</h4>
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

          {/* 메모리 할당 분포 */}
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h4 className="text-white font-semibold mb-3">LSTM 메모리 할당 분포</h4>
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

        {/* 메모리 최적화 기법 */}
        <div className="mt-6 bg-gray-800/50 rounded-lg p-4">
          <h4 className="text-white font-semibold mb-3">LSTM 메모리 최적화 기법</h4>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gray-900/50 rounded p-3">
              <div className="text-green-400 text-lg font-bold mb-1">셀 상태 풀링</div>
              <div className="text-gray-400 text-xs">LSTM 셀 재사용</div>
              <div className="mt-2 h-1 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-green-500" style={{ width: '88%' }} />
              </div>
              <div className="text-xs text-gray-500 mt-1">88% 효율</div>
            </div>
            <div className="bg-gray-900/50 rounded p-3">
              <div className="text-blue-400 text-lg font-bold mb-1">가중치 공유</div>
              <div className="text-gray-400 text-xs">레이어 간 공유</div>
              <div className="mt-2 h-1 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500" style={{ width: '92%' }} />
              </div>
              <div className="text-xs text-gray-500 mt-1">92% 효율</div>
            </div>
            <div className="bg-gray-900/50 rounded p-3">
              <div className="text-purple-400 text-lg font-bold mb-1">스트라이드 정렬</div>
              <div className="text-gray-400 text-xs">캐시 친화적</div>
              <div className="mt-2 h-1 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500" style={{ width: '85%' }} />
              </div>
              <div className="text-xs text-gray-500 mt-1">85% 효율</div>
            </div>
            <div className="bg-gray-900/50 rounded p-3">
              <div className="text-yellow-400 text-lg font-bold mb-1">게이트 압축</div>
              <div className="text-gray-400 text-xs">비트 패킹</div>
              <div className="mt-2 h-1 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-yellow-500" style={{ width: '79%' }} />
              </div>
              <div className="text-xs text-gray-500 mt-1">79% 효율</div>
            </div>
          </div>
        </div>

        {/* Python vs Go 비교 */}
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="bg-gradient-to-r from-green-600/20 to-green-400/20 p-4 rounded-lg border border-green-500/30">
            <h5 className="text-white font-semibold">75% 메모리 절감</h5>
            <p className="text-gray-400 text-sm mt-1">Python 대비 LSTM 메모리</p>
          </div>
          <div className="bg-gradient-to-r from-blue-600/20 to-blue-400/20 p-4 rounded-lg border border-blue-500/30">
            <h5 className="text-white font-semibold">제로 카피 전파</h5>
            <p className="text-gray-400 text-sm mt-1">역전파 메모리 최적화</p>
          </div>
          <div className="bg-gradient-to-r from-purple-600/20 to-purple-400/20 p-4 rounded-lg border border-purple-500/30">
            <h5 className="text-white font-semibold">컴파일 타임 최적화</h5>
            <p className="text-gray-400 text-sm mt-1">불필요 할당 제거</p>
          </div>
        </div>
      </div>
    </div>
  )
}