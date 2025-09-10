'use client'

import React from 'react'

interface GaugeChartProps {
  value: number
  label: string
  color?: string
  min?: number
  max?: number
}

export function GaugeChart({ 
  value, 
  label, 
  color = '#8b5cf6',
  min = 0, 
  max = 100 
}: GaugeChartProps) {
  // 값을 0-180도 범위로 변환
  const angle = ((value - min) / (max - min)) * 180
  
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <svg viewBox="0 0 200 120" className="w-full h-full">
        {/* 배경 아크 */}
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke="#374151"
          strokeWidth="12"
          strokeLinecap="round"
        />
        
        {/* 값 아크 */}
        <path
          d={`M 20 100 A 80 80 0 ${angle > 90 ? '1' : '0'} 1 ${
            20 + 160 * Math.cos((180 - angle) * Math.PI / 180)
          } ${
            100 - 80 * Math.sin((180 - angle) * Math.PI / 180)
          }`}
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeLinecap="round"
          style={{
            filter: 'drop-shadow(0 0 8px ' + color + '40)'
          }}
        />
        
        {/* 중심 텍스트 */}
        <text
          x="100"
          y="90"
          textAnchor="middle"
          className="fill-white text-3xl font-bold"
        >
          {value.toFixed(0)}%
        </text>
        
        <text
          x="100"
          y="110"
          textAnchor="middle"
          className="fill-gray-400 text-sm"
        >
          {label}
        </text>
        
        {/* 눈금 */}
        <text x="20" y="110" textAnchor="middle" className="fill-gray-500 text-xs">
          {min}
        </text>
        <text x="180" y="110" textAnchor="middle" className="fill-gray-500 text-xs">
          {max}
        </text>
        <text x="100" y="20" textAnchor="middle" className="fill-gray-500 text-xs">
          {(min + max) / 2}
        </text>
      </svg>
    </div>
  )
}