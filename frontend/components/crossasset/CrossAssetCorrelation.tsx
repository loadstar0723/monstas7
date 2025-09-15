'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { FaChartPie, FaLink, FaExchangeAlt, FaGlobeAmericas } from 'react-icons/fa'
import { GiRadarSweep } from 'react-icons/gi'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, Legend,
  ComposedChart, Line, Bar, Area
} from 'recharts'
import * as d3 from 'd3'

interface AssetData {
  symbol: string
  name: string
  price: number
  change24h: number
  volume: number
  marketCap: number
  category: 'crypto' | 'stock' | 'commodity' | 'forex'
}

interface CorrelationData {
  asset1: string
  asset2: string
  correlation: number
  pValue: number
  timeframe: string
  strength: 'strong' | 'moderate' | 'weak' | 'none'
}

interface CorrelationMatrix {
  assets: string[]
  matrix: number[][]
  timestamp: number
}

interface Props {
  primaryAsset: string
  assets?: string[]
  includeTraditional?: boolean
  onCorrelationChange?: (data: CorrelationData[]) => void
}

export default function CrossAssetCorrelation({
  primaryAsset,
  assets = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'ADAUSDT'],
  includeTraditional = true,
  onCorrelationChange
}: Props) {
  const [assetData, setAssetData] = useState<Record<string, AssetData>>({})
  const [correlationMatrix, setCorrelationMatrix] = useState<CorrelationMatrix | null>(null)
  const [correlations, setCorrelations] = useState<CorrelationData[]>([])
  const [timeframe, setTimeframe] = useState<'1h' | '24h' | '7d' | '30d'>('24h')
  const [networkData, setNetworkData] = useState<any>(null)
  const [selectedPair, setSelectedPair] = useState<[string, string] | null>(null)
  const [historicalCorrelation, setHistoricalCorrelation] = useState<any[]>([])
  
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const wsConnections = useRef<Record<string, WebSocket>>({})

  // 전통 자산 포함 시 추가 심볼
  const traditionalAssets = includeTraditional ? [
    'SPX500', // S&P 500
    'DXY', // 달러 인덱스
    'GOLD', // 금
    'OIL', // 원유
    'VIX' // 변동성 지수
  ] : []

  const allAssets = [...assets, ...traditionalAssets]

  // WebSocket 연결 및 실시간 데이터
  useEffect(() => {
    // 암호화폐 데이터
    assets.forEach(symbol => {
      const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@ticker`)
      
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data)
        setAssetData(prev => ({
          ...prev,
          [symbol]: {
            symbol,
            name: symbol.replace('USDT', ''),
            price: parseFloat(data.c),
            change24h: parseFloat(data.P),
            volume: parseFloat(data.v) * parseFloat(data.c),
            marketCap: 0, // 별도 API 필요
            category: 'crypto'
          }
        }))
      }
      
      wsConnections.current[symbol] = ws
    })

    // 전통 자산 데이터 (시뮬레이션 - 실제로는 다른 API 사용)
    if (includeTraditional) {
      traditionalAssets.forEach(symbol => {
        // 시뮬레이션 데이터
        setAssetData(prev => ({
          ...prev,
          [symbol]: {
            symbol,
            name: symbol,
            price: getSimulatedPrice(symbol),
            change24h: (Math.random() - 0.5) * 5,
            volume: Math.random() * 1000000000,
            marketCap: 0,
            category: getAssetCategory(symbol)
          }
        }))
      })
    }

    // 상관관계 계산 인터벌
    const correlationInterval = setInterval(() => {
      calculateCorrelations()
    }, 5000) // 5초마다

    return () => {
      Object.values(wsConnections.current).forEach(ws => ws.close())
      clearInterval(correlationInterval)
    }
  }, [assets, includeTraditional, timeframe])

  // 시뮬레이션 가격 (실제로는 API 사용)
  const getSimulatedPrice = (symbol: string): number => {
    const prices: Record<string, number> = {
      'SPX500': 4500 + Math.random() * 100,
      'DXY': 103 + Math.random() * 2,
      'GOLD': 1950 + Math.random() * 50,
      'OIL': 80 + Math.random() * 10,
      'VIX': 15 + Math.random() * 10
    }
    return prices[symbol] || 100
  }

  // 자산 카테고리 결정
  const getAssetCategory = (symbol: string): AssetData['category'] => {
    if (symbol.includes('USDT')) return 'crypto'
    if (['SPX500', 'VIX'].includes(symbol)) return 'stock'
    if (['GOLD', 'OIL'].includes(symbol)) return 'commodity'
    if (['DXY'].includes(symbol)) return 'forex'
    return 'crypto'
  }

  // 상관관계 계산
  const calculateCorrelations = async () => {
    try {
      // 실제로는 서버에서 계산하거나 API 호출
      const response = await fetch(`/api/correlation?assets=${allAssets.join(',')}&timeframe=${timeframe}`)
      const data = await response.json()
      
      // 시뮬레이션 데이터
      const mockMatrix = generateMockCorrelationMatrix(allAssets)
      setCorrelationMatrix(mockMatrix)
      
      // 상관관계 추출
      const correlationPairs: CorrelationData[] = []
      for (let i = 0; i < allAssets.length; i++) {
        for (let j = i + 1; j < allAssets.length; j++) {
          const correlation = mockMatrix.matrix[i][j]
          correlationPairs.push({
            asset1: allAssets[i],
            asset2: allAssets[j],
            correlation,
            pValue: Math.random() * 0.05, // 시뮬레이션
            timeframe,
            strength: getCorrelationStrength(correlation)
          })
        }
      }
      
      setCorrelations(correlationPairs)
      
      // 네트워크 데이터 생성
      generateNetworkData(correlationPairs)
      
      // 콜백 실행
      if (onCorrelationChange) {
        onCorrelationChange(correlationPairs)
      }
    } catch (error) {
      console.error('Correlation calculation error:', error)
      // 폴백으로 시뮬레이션 데이터 사용
      const mockMatrix = generateMockCorrelationMatrix(allAssets)
      setCorrelationMatrix(mockMatrix)
    }
  }

  // 모의 상관계수 행렬 생성
  const generateMockCorrelationMatrix = (assets: string[]): CorrelationMatrix => {
    const n = assets.length
    const matrix: number[][] = Array(n).fill(null).map(() => Array(n).fill(0))
    
    // 대각선은 1
    for (let i = 0; i < n; i++) {
      matrix[i][i] = 1
    }
    
    // 상관계수 생성 (대칭 행렬)
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        // 같은 카테고리는 높은 상관관계
        const cat1 = getAssetCategory(assets[i])
        const cat2 = getAssetCategory(assets[j])
        
        let baseCorrelation = Math.random() * 0.6 - 0.3 // -0.3 ~ 0.3
        if (cat1 === cat2) {
          baseCorrelation += 0.4 // 같은 카테고리는 더 높은 상관관계
        }
        
        // BTC와 다른 암호화폐는 높은 상관관계
        if (assets[i] === 'BTCUSDT' && cat2 === 'crypto') {
          baseCorrelation = 0.6 + Math.random() * 0.3
        }
        
        const correlation = Math.max(-1, Math.min(1, baseCorrelation))
        matrix[i][j] = correlation
        matrix[j][i] = correlation
      }
    }
    
    return {
      assets,
      matrix,
      timestamp: Date.now()
    }
  }

  // 상관관계 강도 판단
  const getCorrelationStrength = (correlation: number): CorrelationData['strength'] => {
    const abs = Math.abs(correlation)
    if (abs > 0.7) return 'strong'
    if (abs > 0.4) return 'moderate'
    if (abs > 0.2) return 'weak'
    return 'none'
  }

  // 네트워크 데이터 생성 (D3.js용)
  const generateNetworkData = (correlations: CorrelationData[]) => {
    const nodes = allAssets.map(asset => ({
      id: asset,
      name: asset,
      group: getAssetCategory(asset),
      value: assetData[asset]?.marketCap || 1000000
    }))
    
    const links = correlations
      .filter(c => Math.abs(c.correlation) > 0.3) // 중요한 상관관계만
      .map(c => ({
        source: c.asset1,
        target: c.asset2,
        value: Math.abs(c.correlation),
        correlation: c.correlation
      }))
    
    setNetworkData({ nodes, links })
  }

  // 네트워크 시각화 (Canvas)
  useEffect(() => {
    if (!canvasRef.current || !networkData) return
    
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    // Canvas 크기 설정
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight
    
    // 간단한 force-directed 레이아웃
    const width = canvas.width
    const height = canvas.height
    const centerX = width / 2
    const centerY = height / 2
    
    // 노드 위치 계산
    const angleStep = (2 * Math.PI) / networkData.nodes.length
    const radius = Math.min(width, height) * 0.3
    
    networkData.nodes.forEach((node: any, i: number) => {
      node.x = centerX + radius * Math.cos(i * angleStep)
      node.y = centerY + radius * Math.sin(i * angleStep)
    })
    
    // 애니메이션 루프
    const animate = () => {
      ctx.clearRect(0, 0, width, height)
      
      // 링크 그리기
      networkData.links.forEach((link: any) => {
        const source = networkData.nodes.find((n: any) => n.id === link.source)
        const target = networkData.nodes.find((n: any) => n.id === link.target)
        
        if (source && target) {
          ctx.beginPath()
          ctx.moveTo(source.x, source.y)
          ctx.lineTo(target.x, target.y)
          ctx.strokeStyle = link.correlation > 0 
            ? `rgba(34, 197, 94, ${link.value})` // 녹색: 양의 상관관계
            : `rgba(239, 68, 68, ${link.value})` // 빨간색: 음의 상관관계
          ctx.lineWidth = link.value * 5
          ctx.stroke()
        }
      })
      
      // 노드 그리기
      networkData.nodes.forEach((node: any) => {
        // 노드 원
        ctx.beginPath()
        ctx.arc(node.x, node.y, 20, 0, 2 * Math.PI)
        ctx.fillStyle = getCategoryColor(node.group)
        ctx.fill()
        ctx.strokeStyle = '#fff'
        ctx.lineWidth = 2
        ctx.stroke()
        
        // 노드 레이블
        ctx.fillStyle = '#fff'
        ctx.font = '12px sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(node.name.replace('USDT', ''), node.x, node.y)
      })
    }
    
    animate()
  }, [networkData])

  // 카테고리별 색상
  const getCategoryColor = (category: string): string => {
    const colors: Record<string, string> = {
      crypto: '#8B5CF6',
      stock: '#10B981',
      commodity: '#F59E0B',
      forex: '#3B82F6'
    }
    return colors[category] || '#6B7280'
  }

  // 선택된 페어의 히스토리컬 상관관계
  useEffect(() => {
    if (!selectedPair) return
    
    // 시뮬레이션 데이터 생성
    const historical = Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
      correlation: Math.sin(i / 5) * 0.3 + 0.5 + (Math.random() - 0.5) * 0.2,
      volume1: Math.random() * 1000000,
      volume2: Math.random() * 1000000
    }))
    
    setHistoricalCorrelation(historical)
  }, [selectedPair])

  return (
    <div className="w-full space-y-6">
      {/* 헤더 */}
      <div className="bg-gradient-to-r from-purple-900/20 to-indigo-900/20 p-6 rounded-lg border border-purple-500/30">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-bold text-white flex items-center gap-3">
            <FaLink className="text-purple-400" />
            Cross-Asset 상관관계 분석
          </h3>
          <div className="flex items-center gap-4">
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value as any)}
              className="bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700"
            >
              <option value="1h">1시간</option>
              <option value="24h">24시간</option>
              <option value="7d">7일</option>
              <option value="30d">30일</option>
            </select>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={includeTraditional}
                onChange={(e) => window.location.reload()} // 간단히 리로드
                className="rounded border-gray-600"
              />
              <span className="text-gray-300 text-sm">전통자산 포함</span>
            </label>
          </div>
        </div>

        {/* 주요 통계 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="p-3 bg-gray-800/50 rounded-lg"
          >
            <div className="text-gray-400 text-sm mb-1">강한 상관관계</div>
            <div className="text-xl font-bold text-green-400">
              {correlations.filter(c => c.strength === 'strong').length}
            </div>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="p-3 bg-gray-800/50 rounded-lg"
          >
            <div className="text-gray-400 text-sm mb-1">역상관관계</div>
            <div className="text-xl font-bold text-red-400">
              {correlations.filter(c => c.correlation < -0.3).length}
            </div>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="p-3 bg-gray-800/50 rounded-lg"
          >
            <div className="text-gray-400 text-sm mb-1">평균 상관계수</div>
            <div className="text-xl font-bold text-purple-400">
              {correlations.length > 0 
                ? (correlations.reduce((sum, c) => sum + Math.abs(c.correlation), 0) / correlations.length).toFixed(3)
                : '0.000'}
            </div>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="p-3 bg-gray-800/50 rounded-lg"
          >
            <div className="text-gray-400 text-sm mb-1">분석 자산</div>
            <div className="text-xl font-bold text-blue-400">
              {allAssets.length}
            </div>
          </motion.div>
        </div>
      </div>

      {/* 상관관계 네트워크 */}
      <div className="bg-gray-800/50 rounded-lg p-4">
        <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <GiRadarSweep className="text-purple-400" />
          상관관계 네트워크
        </h4>
        <div className="relative">
          <canvas
            ref={canvasRef}
            className="w-full h-[400px] rounded-lg bg-gray-900/50"
          />
          <div className="absolute top-4 right-4 bg-gray-800/90 p-3 rounded-lg text-xs">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-3 h-1 bg-green-500"></div>
              <span className="text-gray-300">양의 상관관계</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-1 bg-red-500"></div>
              <span className="text-gray-300">음의 상관관계</span>
            </div>
          </div>
        </div>
      </div>

      {/* 상관계수 히트맵 */}
      <div className="bg-gray-800/50 rounded-lg p-4">
        <h4 className="text-lg font-bold text-white mb-4">상관계수 매트릭스</h4>
        {correlationMatrix && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="p-2 text-gray-400"></th>
                  {correlationMatrix.assets.map(asset => (
                    <th key={asset} className="p-2 text-gray-300 font-normal">
                      {asset.replace('USDT', '')}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {correlationMatrix.assets.map((asset1, i) => (
                  <tr key={asset1}>
                    <td className="p-2 text-gray-300 font-semibold">
                      {asset1.replace('USDT', '')}
                    </td>
                    {correlationMatrix.assets.map((asset2, j) => {
                      const correlation = correlationMatrix.matrix[i][j]
                      const color = correlation > 0 
                        ? `rgba(34, 197, 94, ${Math.abs(correlation)})`
                        : `rgba(239, 68, 68, ${Math.abs(correlation)})`
                      
                      return (
                        <td 
                          key={asset2} 
                          className="p-2 text-center cursor-pointer hover:ring-2 hover:ring-purple-500"
                          style={{ backgroundColor: i === j ? '#374151' : color }}
                          onClick={() => i !== j && setSelectedPair([asset1, asset2])}
                        >
                          <span className={i === j ? 'text-gray-500' : 'text-white font-semibold'}>
                            {correlation.toFixed(2)}
                          </span>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Top 상관관계 페어 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800/50 rounded-lg p-4">
          <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <FaArrowUp className="text-green-400" />
            높은 양의 상관관계
          </h4>
          <div className="space-y-2">
            {correlations
              .filter(c => c.correlation > 0)
              .sort((a, b) => b.correlation - a.correlation)
              .slice(0, 5)
              .map((corr, index) => (
                <motion.div
                  key={`${corr.asset1}-${corr.asset2}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg hover:bg-gray-700/70 cursor-pointer"
                  onClick={() => setSelectedPair([corr.asset1, corr.asset2])}
                >
                  <div className="flex items-center gap-3">
                    <FaExchangeAlt className="text-green-400" />
                    <span className="text-white">
                      {corr.asset1.replace('USDT', '')} ↔ {corr.asset2.replace('USDT', '')}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-green-400 font-bold">
                      {(corr.correlation * 100).toFixed(1)}%
                    </div>
                    <div className="text-xs text-gray-400">
                      {corr.strength}
                    </div>
                  </div>
                </motion.div>
              ))}
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-4">
          <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <FaArrowDown className="text-red-400" />
            높은 음의 상관관계
          </h4>
          <div className="space-y-2">
            {correlations
              .filter(c => c.correlation < 0)
              .sort((a, b) => a.correlation - b.correlation)
              .slice(0, 5)
              .map((corr, index) => (
                <motion.div
                  key={`${corr.asset1}-${corr.asset2}`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg hover:bg-gray-700/70 cursor-pointer"
                  onClick={() => setSelectedPair([corr.asset1, corr.asset2])}
                >
                  <div className="flex items-center gap-3">
                    <FaExchangeAlt className="text-red-400" />
                    <span className="text-white">
                      {corr.asset1.replace('USDT', '')} ↔ {corr.asset2.replace('USDT', '')}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-red-400 font-bold">
                      {(corr.correlation * 100).toFixed(1)}%
                    </div>
                    <div className="text-xs text-gray-400">
                      {corr.strength}
                    </div>
                  </div>
                </motion.div>
              ))}
          </div>
        </div>
      </div>

      {/* 선택된 페어 상세 분석 */}
      {selectedPair && (
        <div className="bg-gray-800/50 rounded-lg p-4">
          <h4 className="text-lg font-bold text-white mb-4">
            {selectedPair[0].replace('USDT', '')} - {selectedPair[1].replace('USDT', '')} 상관관계 추이
          </h4>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={historicalCorrelation}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9CA3AF" />
              <YAxis yAxisId="left" stroke="#9CA3AF" domain={[-1, 1]} />
              <YAxis yAxisId="right" orientation="right" stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
                labelStyle={{ color: '#9CA3AF' }}
              />
              <Legend />
              
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="correlation"
                stroke="#8B5CF6"
                fill="#8B5CF6"
                fillOpacity={0.3}
                name="상관계수"
              />
              
              <Bar yAxisId="right" dataKey="volume1" fill="#10B981" opacity={0.3} name={`${selectedPair[0]} 거래량`} />
              <Bar yAxisId="right" dataKey="volume2" fill="#F59E0B" opacity={0.3} name={`${selectedPair[1]} 거래량`} />
              
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="correlation"
                stroke="#8B5CF6"
                strokeWidth={3}
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* 카테고리별 상관관계 요약 */}
      <div className="bg-gray-800/50 rounded-lg p-4">
        <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <FaChartPie className="text-yellow-400" />
          카테고리별 평균 상관관계
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['crypto', 'stock', 'commodity', 'forex'].map(category => {
            const categoryCorrelations = correlations.filter(c => 
              getAssetCategory(c.asset1) === category || getAssetCategory(c.asset2) === category
            )
            const avgCorr = categoryCorrelations.length > 0
              ? categoryCorrelations.reduce((sum, c) => sum + Math.abs(c.correlation), 0) / categoryCorrelations.length
              : 0
            
            return (
              <motion.div
                key={category}
                whileHover={{ scale: 1.05 }}
                className="p-4 bg-gray-700/50 rounded-lg text-center"
              >
                <div className={`text-2xl mb-2 ${getCategoryColor(category)}`}>
                  {category === 'crypto' && '🪙'}
                  {category === 'stock' && '📈'}
                  {category === 'commodity' && '🛢️'}
                  {category === 'forex' && '💱'}
                </div>
                <div className="text-gray-400 text-sm capitalize mb-1">{category}</div>
                <div className="text-xl font-bold text-white">
                  {(avgCorr * 100).toFixed(1)}%
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// 더미 가격 함수
function FaArrowUp(props: any) {
  return <FaChartLine {...props} />
}

function FaArrowDown(props: any) {
  return <FaChartLine {...props} style={{ transform: 'rotate(180deg)' }} />
}