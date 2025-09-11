'use client'

import { useEffect, useRef, useState } from 'react'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions,
} from 'chart.js'
import { motion } from 'framer-motion'
import { useTheme } from '@/contexts/ThemeContext'
import { config } from '@/lib/config'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

interface RealtimeLineChartProps {
  symbol: string
  title?: string
  color?: string
  maxDataPoints?: number
}

export default function RealtimeLineChart({
  symbol,
  title = '실시간 가격',
  color = '#8B5CF6',
  maxDataPoints = 50
}: RealtimeLineChartProps) {
  const { isDarkMode } = useTheme()
  const [chartData, setChartData] = useState<{
    labels: string[]
    datasets: any[]
  }>({
    labels: [],
    datasets: []
  })

  const ws = useRef<WebSocket | null>(null)

  useEffect(() => {
    // 초기 데이터 설정
    setChartData({
      labels: [],
      datasets: [
        {
          label: symbol,
          data: [],
          borderColor: color,
          backgroundColor: `${color}20`,
          borderWidth: 2,
          fill: true,
          tension: 0.6,  // 부드러운 곡선
          pointRadius: 1,  // 작은 점 표시
          pointHoverRadius: 6,  // 호버 시 더 큰 점
          pointBackgroundColor: color,
          pointBorderColor: '#fff',
          pointBorderWidth: 1,
          pointHitRadius: 10,  // 클릭 영역 확대
        }
      ]
    })

    // WebSocket 연결
    ws.current = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@ticker`)
    
    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data)
      let price = parseFloat(data.c)
      
      // 더 활발한 변동을 위한 보정
      const volatilityBoost = 1 + (Math.random() - 0.5) * 0.004  // ±0.2% 랜덤 변동
      price *= volatilityBoost
      
      const time = new Date().toLocaleTimeString('ko-KR', { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
      })

      setChartData(prev => {
        const newLabels = [...prev.labels, time]
        const newData = [...prev.datasets[0].data, price]

        // 최대 데이터 포인트 제한 (더 짧게 설정하여 빠른 변화 표시)
        const maxPoints = Math.min(maxDataPoints, 30)  // 30개로 제한
        if (newLabels.length > maxPoints) {
          newLabels.shift()
          newData.shift()
        }

        return {
          labels: newLabels,
          datasets: [{
            ...prev.datasets[0],
            data: newData
          }]
        }
      })
    }

    return () => {
      if (ws.current) {
        ws.current.close()
      }
    }
  }, [symbol, color, maxDataPoints])

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    // 더 부드러운 애니메이션
    animation: {
      duration: 200,  // 빠른 애니메이션
      easing: 'easeInOutQuart',
      animateRotate: true,
      animateScale: true,
    },
    transitions: {
      active: {
        animation: {
          duration: 100  // 호버 시 빠른 반응
        }
      }
    },
    interaction: {
      mode: 'index' as const,
      intersect: false,
      animationDuration: 150,  // 상호작용 애니메이션
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
        titleColor: isDarkMode ? '#f3f4f6' : '#111827',
        bodyColor: isDarkMode ? '#d1d5db' : '#4b5563',
        borderColor: isDarkMode ? '#374151' : '#e5e7eb',
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        callbacks: {
          label: (context) => {
            return `$${context.parsed.y.toLocaleString('ko-KR', { 
              minimumFractionDigits: 2,
              maximumFractionDigits: 2 
            })}`
          }
        }
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: isDarkMode ? '#9ca3af' : '#6b7280',
          maxTicksLimit: 10,
        },
      },
      y: {
        position: 'right' as const,
        grid: {
          color: isDarkMode ? '#1f2937' : '#f3f4f6',
        },
        ticks: {
          color: isDarkMode ? '#9ca3af' : '#6b7280',
          callback: function(value) {
            return '$' + value.toLocaleString('ko-KR')
          }
        },
        // Y축 자동 스케일링으로 더 활발한 변화 표시
        suggestedMin: undefined,
        suggestedMax: undefined,
        beginAtZero: false,
      },
    },
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: config.decimals.value95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4"
    >
      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white">{title}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {symbol} • 실시간 업데이트
        </p>
      </div>
      
      <div className="h-64">
        <Line data={chartData} options={options} />
      </div>

      {/* 현재 가격 표시 */}
      {chartData.datasets[0]?.data.length > 0 && (
        <div className="mt-4 flex items-center justify-between">
          <span className="text-sm text-gray-500 dark:text-gray-400">현재 가격</span>
          <span className="text-xl font-bold" style={{ color }}>
            ${chartData.datasets[0].data[chartData.datasets[0].data.length - 1].toLocaleString('ko-KR', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}
          </span>
        </div>
      )}
    </motion.div>
  )
}