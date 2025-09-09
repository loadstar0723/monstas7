'use client'

import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js'

// Chart.js 등록
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

interface VolumeChartProps {
  volumeHistory: any[]
}

export default function VolumeChart({ volumeHistory }: VolumeChartProps) {
  const chartData = {
    labels: volumeHistory.map(v => v.time),
    datasets: [
      {
        label: 'Call Volume',
        data: volumeHistory.map(v => v.call),
        backgroundColor: '#10b981',
        borderColor: '#10b981',
        borderWidth: 1
      },
      {
        label: 'Put Volume',
        data: volumeHistory.map(v => v.put),
        backgroundColor: '#ef4444',
        borderColor: '#ef4444',
        borderWidth: 1
      }
    ]
  }

  const chartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#9CA3AF'
        }
      },
      tooltip: {
        backgroundColor: '#1F2937',
        titleColor: '#F3F4F6',
        bodyColor: '#D1D5DB'
      }
    },
    scales: {
      x: {
        ticks: { color: '#9CA3AF' },
        grid: { color: '#374151' }
      },
      y: {
        ticks: { color: '#9CA3AF' },
        grid: { color: '#374151' }
      }
    }
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <h3 className="text-lg font-bold mb-4 text-purple-400">
        📈 실시간 볼륨 추이
      </h3>
      <div style={{ height: '250px' }}>
        <Bar data={chartData} options={chartOptions} />
      </div>
    </div>
  )
}