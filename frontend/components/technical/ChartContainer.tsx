'use client'

import React from 'react'

interface ChartContainerProps {
  title?: string
  description?: string
  height?: number
  className?: string
  children: React.ReactNode
  loading?: boolean
}

const ChartContainer: React.FC<ChartContainerProps> = ({
  title,
  description,
  height = 400,
  className = '',
  children,
  loading = false
}) => {
  if (loading) {
    return (
      <div className={`bg-gray-800/50 rounded-xl p-6 ${className}`}>
        <div className="animate-pulse">
          {title && <div className="h-8 bg-gray-700 rounded mb-4 w-1/3"></div>}
          <div className={`bg-gray-700 rounded`} style={{ height }}></div>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-gray-800/50 rounded-xl p-6 ${className}`}>
      {/* 헤더 */}
      {(title || description) && (
        <div className="mb-4">
          {title && <h3 className="text-lg font-bold text-white mb-1">{title}</h3>}
          {description && <p className="text-sm text-gray-400">{description}</p>}
        </div>
      )}

      {/* 차트 컨텐츠 */}
      <div style={{ height }}>
        {children}
      </div>
    </div>
  )
}

export default ChartContainer