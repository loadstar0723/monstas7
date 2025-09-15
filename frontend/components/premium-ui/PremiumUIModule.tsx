'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import dynamic from 'next/dynamic'
import { 
  FaDesktop, FaCube, FaChartLine, FaNetworkWired, 
  FaBrain, FaWaveSquare, FaGlobe, FaMagic 
} from 'react-icons/fa'

// Dynamic imports for 3D components
const BloombergLayout = dynamic(() => import('./BloombergLayout'), { 
  ssr: false,
  loading: () => <div className="h-screen bg-black flex items-center justify-center"><div className="text-white">Loading Terminal...</div></div>
})
const Chart3D = dynamic(() => import('./Chart3D'), { ssr: false })
const ParticleFlow = dynamic(() => import('./ParticleFlow'), { ssr: false })
const VolumeProfile3D = dynamic(() => import('./VolumeProfile3D'), { ssr: false })
const CorrelationNetwork3D = dynamic(() => import('./CorrelationNetwork3D'), { ssr: false })
const AIThinkingAnimation = dynamic(() => import('./AIThinkingAnimation'), { ssr: false })

export default function PremiumUIModule() {
  const [activeDemo, setActiveDemo] = useState<string>('terminal')
  const [sampleData, setSampleData] = useState<any>({
    candles: [],
    trades: [],
    volumeProfile: [],
    assets: [],
    correlations: [],
    neuralActivity: []
  })

  useEffect(() => {
    // Generate sample data
    generateSampleData()
    const interval = setInterval(generateRealtimeData, 1000)
    return () => clearInterval(interval)
  }, [])

  const generateSampleData = () => {
    // Candle data for 3D chart
    const candles = Array.from({ length: 50 }, (_, i) => {
      const basePrice = 50000 + Math.sin(i * 0.1) * 5000
      const open = basePrice + (Math.random() - 0.5) * 1000
      const close = open + (Math.random() - 0.5) * 1000
      const high = Math.max(open, close) + Math.random() * 500
      const low = Math.min(open, close) - Math.random() * 500
      
      return {
        time: new Date(Date.now() - (50 - i) * 60000),
        open,
        high,
        low,
        close,
        volume: Math.random() * 1000000
      }
    })

    // Volume profile data
    const volumeProfile = Array.from({ length: 30 }, (_, i) => {
      const price = 48000 + i * 200
      const volume = Math.random() * 1000000
      const buyRatio = 0.3 + Math.random() * 0.4
      
      return {
        price,
        volume,
        buyVolume: volume * buyRatio,
        sellVolume: volume * (1 - buyRatio)
      }
    })

    // Assets for correlation network
    const assets = [
      { id: 'btc', name: 'BTC', category: 'crypto' as const, value: 50000, change: 2.5 },
      { id: 'eth', name: 'ETH', category: 'crypto' as const, value: 3000, change: -1.2 },
      { id: 'sol', name: 'SOL', category: 'crypto' as const, value: 100, change: 5.3 },
      { id: 'spy', name: 'SPY', category: 'stock' as const, value: 450, change: 0.8 },
      { id: 'qqq', name: 'QQQ', category: 'stock' as const, value: 380, change: 1.1 },
      { id: 'gold', name: 'GOLD', category: 'commodity' as const, value: 2000, change: -0.3 },
      { id: 'oil', name: 'OIL', category: 'commodity' as const, value: 80, change: 2.1 },
      { id: 'eur', name: 'EUR/USD', category: 'forex' as const, value: 1.08, change: -0.5 }
    ]

    // Correlations
    const correlations = [
      { source: 'btc', target: 'eth', value: 0.85 },
      { source: 'btc', target: 'sol', value: 0.72 },
      { source: 'eth', target: 'sol', value: 0.68 },
      { source: 'spy', target: 'qqq', value: 0.92 },
      { source: 'btc', target: 'spy', value: 0.45 },
      { source: 'gold', target: 'btc', value: -0.32 },
      { source: 'oil', target: 'spy', value: 0.55 },
      { source: 'eur', target: 'gold', value: 0.28 }
    ]

    setSampleData({
      candles,
      trades: [],
      volumeProfile,
      assets,
      correlations,
      neuralActivity: []
    })
  }

  const generateRealtimeData = () => {
    // Generate trades
    const newTrade = {
      id: Date.now().toString(),
      price: 50000 + (Math.random() - 0.5) * 1000,
      volume: Math.random() * 10,
      side: Math.random() > 0.5 ? 'buy' as const : 'sell' as const,
      timestamp: new Date()
    }

    // Generate neural activity
    const newActivity = Array.from({ length: 5 }, () => ({
      layer: Math.floor(Math.random() * 6),
      neuron: Math.floor(Math.random() * 32),
      activation: Math.random(),
      timestamp: Date.now()
    }))

    setSampleData((prev: any) => ({
      ...prev,
      trades: [...prev.trades.slice(-99), newTrade],
      neuralActivity: [...prev.neuralActivity.slice(-50), ...newActivity]
    }))
  }

  const demos = [
    {
      id: 'terminal',
      name: 'Bloomberg Terminal',
      icon: FaDesktop,
      description: '멀티 모니터 레이아웃 시스템'
    },
    {
      id: 'chart3d',
      name: '3D 캔들스틱',
      icon: FaCube,
      description: '입체적 차트 시각화'
    },
    {
      id: 'particles',
      name: '거래 흐름 파티클',
      icon: FaWaveSquare,
      description: '실시간 거래 시각화'
    },
    {
      id: 'volume',
      name: '3D 볼륨 프로파일',
      icon: FaChartLine,
      description: '가격별 거래량 분석'
    },
    {
      id: 'network',
      name: '상관관계 네트워크',
      icon: FaNetworkWired,
      description: '자산간 관계 시각화'
    },
    {
      id: 'ai',
      name: 'AI 사고 과정',
      icon: FaBrain,
      description: '신경망 활동 애니메이션'
    }
  ]

  return (
    <div className="min-h-screen bg-black text-white">
      {activeDemo === 'terminal' ? (
        <BloombergLayout />
      ) : (
        <>
          {/* Header */}
          <div className="bg-gray-900 border-b border-gray-800 px-6 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
                Premium UI/UX 데모
              </h1>
              <button
                onClick={() => setActiveDemo('terminal')}
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <FaDesktop /> Terminal 모드
              </button>
            </div>
          </div>

          {/* Demo selector */}
          <div className="border-b border-gray-800">
            <div className="flex overflow-x-auto">
              {demos.map(demo => (
                <button
                  key={demo.id}
                  onClick={() => setActiveDemo(demo.id)}
                  className={`px-6 py-4 flex items-center gap-3 border-b-2 transition-all whitespace-nowrap ${
                    activeDemo === demo.id
                      ? 'border-blue-500 bg-gray-900/50'
                      : 'border-transparent hover:bg-gray-900/30'
                  }`}
                >
                  <demo.icon className={activeDemo === demo.id ? 'text-blue-400' : 'text-gray-400'} />
                  <div className="text-left">
                    <div className={activeDemo === demo.id ? 'text-white' : 'text-gray-300'}>
                      {demo.name}
                    </div>
                    <div className="text-xs text-gray-500">{demo.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Demo content */}
          <div className="p-6">
            {activeDemo === 'chart3d' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-900 rounded-lg p-6"
              >
                <h2 className="text-xl font-bold mb-4">3D 캔들스틱 차트</h2>
                <Chart3D data={sampleData.candles} width={1200} height={600} />
              </motion.div>
            )}

            {activeDemo === 'particles' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-900 rounded-lg p-6"
              >
                <h2 className="text-xl font-bold mb-4">실시간 거래 흐름</h2>
                <ParticleFlow trades={sampleData.trades} width={1200} height={600} />
              </motion.div>
            )}

            {activeDemo === 'volume' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-900 rounded-lg p-6"
              >
                <h2 className="text-xl font-bold mb-4">3D 볼륨 프로파일</h2>
                <VolumeProfile3D 
                  data={sampleData.volumeProfile} 
                  currentPrice={50000}
                  width={1200} 
                  height={600} 
                />
              </motion.div>
            )}

            {activeDemo === 'network' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-900 rounded-lg p-6"
              >
                <h2 className="text-xl font-bold mb-4">자산 상관관계 네트워크</h2>
                <CorrelationNetwork3D 
                  assets={sampleData.assets}
                  correlations={sampleData.correlations}
                  width={1200} 
                  height={600} 
                />
              </motion.div>
            )}

            {activeDemo === 'ai' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-900 rounded-lg p-6"
              >
                <h2 className="text-xl font-bold mb-4">AI 신경망 사고 과정</h2>
                <AIThinkingAnimation 
                  activity={sampleData.neuralActivity}
                  width={1200} 
                  height={600} 
                />
              </motion.div>
            )}
          </div>
        </>
      )}
    </div>
  )
}