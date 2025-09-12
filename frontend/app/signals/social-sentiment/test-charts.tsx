'use client'

import { useState, useEffect } from 'react'
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function TestCharts() {
  const [lineData, setLineData] = useState<any[]>([])
  const [pieData, setPieData] = useState<any[]>([])

  useEffect(() => {
    // 테스트 데이터 생성
    const testLineData = Array.from({ length: 24 }, (_, i) => {
      const hour = new Date()
      hour.setHours(hour.getHours() - (23 - i))
      return {
        time: hour.toLocaleTimeString('ko-KR', { 
          hour: '2-digit',
          hour12: true 
        }),
        score: Math.floor(((Date.now() % 1000) / 1000) * 30 + 40) // 40-70 범위
      }
    })
    setLineData(testLineData)

    const testPieData = [
      { name: '긍정', value: 40, color: '#10B981' },
      { name: '중립', value: 35, color: '#F59E0B' },
      { name: '부정', value: 25, color: '#EF4444' }
    ]
    setPieData(testPieData)

    console.log('Test data generated:', { lineData: testLineData, pieData: testPieData })
  }, [])

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-2xl font-bold">차트 테스트 페이지</h1>
      
      {/* 라인 차트 테스트 */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-lg font-bold mb-4">라인 차트 테스트</h2>
        <p className="text-sm text-gray-400 mb-4">데이터 개수: {lineData.length}</p>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={lineData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="time" 
              stroke="#9CA3AF"
              interval={3}
            />
            <YAxis stroke="#9CA3AF" domain={[0, 100]} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
            />
            <Line
              type="monotone"
              dataKey="score"
              stroke="#A855F7"
              strokeWidth={2}
              dot={{ fill: '#A855F7', r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 파이 차트 테스트 */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-lg font-bold mb-4">파이 차트 테스트</h2>
        <p className="text-sm text-gray-400 mb-4">데이터: {JSON.stringify(pieData)}</p>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={5}
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* 데이터 확인 */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-lg font-bold mb-4">데이터 확인</h2>
        <pre className="text-xs text-gray-400 overflow-auto">
          {JSON.stringify({ lineData, pieData }, null, 2)}
        </pre>
      </div>
    </div>
  )
}