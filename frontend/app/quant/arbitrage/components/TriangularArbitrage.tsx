'use client'

import { useState, useEffect } from 'react'
import type { BotConfig } from '../ArbitrageBotModule'

interface TriangularArbitrageProps {
  selectedCoin: {
    symbol: string
    name: string
    color: string
    bgColor: string
  }
  botConfig: BotConfig
}

interface TriangularPath {
  id: string
  path: string[]
  exchanges: string[]
  prices: number[]
  fees: number[]
  netProfit: number
  profitPercent: number
  estimatedTime: number
  riskLevel: 'low' | 'medium' | 'high'
}

export default function TriangularArbitrage({ selectedCoin, botConfig }: TriangularArbitrageProps) {
  const [paths, setPaths] = useState<TriangularPath[]>([])
  const [selectedPath, setSelectedPath] = useState<TriangularPath | null>(null)
  const [scanning, setScanning] = useState(false)
  const [lastScan, setLastScan] = useState<Date | null>(null)
  
  // 삼각 차익거래 경로 스캔
  const scanTriangularPaths = async () => {
    setScanning(true)
    
    try {
      // 실제 API에서 삼각 차익거래 기회 조회
      const response = await fetch(`/api/arbitrage/triangular?symbol=${selectedCoin.symbol}`)
      
      if (!response.ok) {
        // API 실패 시 빈 배열 설정
        setPaths([])
        setLastScan(new Date())
        setScanning(false)
        return
      }
      
      const data = await response.json()
      
      // API 응답이 있으면 사용, 없으면 빈 배열
      if (data && data.paths && Array.isArray(data.paths)) {
        setPaths(data.paths)
      } else {
        setPaths([])
      }
      
      setLastScan(new Date())
      setScanning(false)
    } catch (error) {
      console.error('삼각 차익거래 데이터 조회 실패:', error)
      // 에러 시 빈 배열 설정
      setPaths([])
      setLastScan(new Date())
      setScanning(false)
    }
  }
  
  useEffect(() => {
    scanTriangularPaths()
    const interval = setInterval(scanTriangularPaths, 30000) // 30초마다 재스캔
    return () => clearInterval(interval)
  }, [selectedCoin])
  
  return (
    <div className="space-y-6">
      {/* 헤더 및 제어 */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-300">삼각 차익거래 경로 분석</h3>
          <p className="text-sm text-gray-500 mt-1">
            3개의 통화쌍을 순환하며 발생하는 가격 불일치를 활용합니다
          </p>
        </div>
        <button
          onClick={scanTriangularPaths}
          disabled={scanning}
          className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
            scanning
              ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
              : 'bg-green-500/20 hover:bg-green-500/30 text-green-400'
          }`}
        >
          {scanning ? (
            <>
              <div className="w-4 h-4 border-2 border-green-400 border-t-transparent rounded-full animate-spin"></div>
              <span>스캔 중...</span>
            </>
          ) : (
            <>
              <span>🔍</span>
              <span>재스캔</span>
            </>
          )}
        </button>
      </div>
      
      {/* 삼각 차익거래 다이어그램 */}
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
        <div className="flex items-center justify-center">
          <svg viewBox="0 0 400 400" className="w-full max-w-md">
            {/* 삼각형 경로 */}
            <path
              d="M 200 50 L 350 300 L 50 300 Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-gray-600"
              strokeDasharray="5,5"
            />
            
            {/* 화살표 */}
            <defs>
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="7"
                refX="9"
                refY="3.5"
                orient="auto"
              >
                <polygon
                  points="0 0, 10 3.5, 0 7"
                  fill="currentColor"
                  className="text-green-400"
                />
              </marker>
            </defs>
            
            {/* 경로 화살표 */}
            <line x1="200" y1="60" x2="340" y2="290" stroke="currentColor" className="text-green-400" strokeWidth="2" markerEnd="url(#arrowhead)" />
            <line x1="340" y1="300" x2="60" y2="300" stroke="currentColor" className="text-green-400" strokeWidth="2" markerEnd="url(#arrowhead)" />
            <line x1="60" y1="290" x2="195" y2="60" stroke="currentColor" className="text-green-400" strokeWidth="2" markerEnd="url(#arrowhead)" />
            
            {/* 노드 */}
            <circle cx="200" cy="50" r="40" fill="currentColor" className="text-orange-500/20" />
            <circle cx="350" cy="300" r="40" fill="currentColor" className="text-blue-500/20" />
            <circle cx="50" cy="300" r="40" fill="currentColor" className="text-green-500/20" />
            
            {/* 라벨 */}
            <text x="200" y="55" textAnchor="middle" className="fill-white text-sm font-bold">
              {selectedCoin.symbol}
            </text>
            <text x="350" y="305" textAnchor="middle" className="fill-white text-sm font-bold">
              USDT
            </text>
            <text x="50" y="305" textAnchor="middle" className="fill-white text-sm font-bold">
              EUR
            </text>
            
            {/* 경로 라벨 */}
            <text x="270" y="170" className="fill-gray-400 text-xs" transform="rotate(60 270 170)">
              Step 1: {selectedCoin.symbol}→USDT
            </text>
            <text x="200" y="320" className="fill-gray-400 text-xs" textAnchor="middle">
              Step 2: USDT→EUR
            </text>
            <text x="100" y="170" className="fill-gray-400 text-xs" transform="rotate(-60 100 170)">
              Step 3: EUR→{selectedCoin.symbol}
            </text>
          </svg>
        </div>
        
        <div className="mt-4 text-center text-sm text-gray-400">
          {lastScan && (
            <span>마지막 스캔: {lastScan.toLocaleTimeString()}</span>
          )}
        </div>
      </div>
      
      {/* 발견된 경로 목록 */}
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
        <h4 className="font-semibold text-gray-300 mb-4">발견된 차익거래 경로</h4>
        
        {paths.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            경로를 스캔하고 있습니다...
          </div>
        ) : (
          <div className="space-y-3">
            {paths.map(path => (
              <div
                key={path.id}
                onClick={() => setSelectedPath(path)}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                  selectedPath?.id === path.id
                    ? `${selectedCoin.bgColor} border-current`
                    : 'bg-gray-900/50 border-gray-700 hover:bg-gray-800'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium text-white">
                        {path.path || path.coins?.join(' → ') || 'N/A'}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        path.riskLevel === 'low' 
                          ? 'bg-green-500/20 text-green-400'
                          : path.riskLevel === 'medium'
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {path.riskLevel === 'low' ? '낮은 리스크' :
                         path.riskLevel === 'medium' ? '중간 리스크' :
                         '높은 리스크'}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                      <div>
                        <span className="text-gray-500">순수익</span>
                        <div className="font-mono text-green-400">
                          ${path.netProfit?.toFixed(2) || '0.00'}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500">수익률</span>
                        <div className="font-mono text-green-400">
                          {path.profitPercent?.toFixed(3) || '0.000'}%
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500">예상 시간</span>
                        <div className="font-mono text-white">
                          {path.estimatedTime?.toFixed(0) || '0'}초
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500">거래소</span>
                        <div className="text-white">
                          {path.exchanges?.join(', ') || 'N/A'}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {path.profitPercent && path.profitPercent >= botConfig.minProfit && (
                    <button className="ml-4 px-3 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg text-sm transition-colors">
                      실행
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* 선택된 경로 상세 정보 */}
      {selectedPath && (
        <div className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 rounded-xl p-6 border border-green-500/30">
          <h4 className="font-semibold text-green-400 mb-4">경로 상세 분석</h4>
          
          <div className="space-y-4">
            {selectedPath.path.map((step, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 font-bold">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-white">{step}</div>
                  <div className="text-sm text-gray-400">
                    거래소: {selectedPath.exchanges?.[index] || 'N/A'} | 
                    가격: ${selectedPath.prices?.[index]?.toFixed(2) || '0.00'} | 
                    수수료: {selectedPath.fees?.[index] || 0}%
                  </div>
                </div>
              </div>
            ))}
            
            <div className="pt-4 border-t border-gray-700">
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <span className="text-sm text-gray-400">총 수수료</span>
                  <div className="text-lg font-mono text-yellow-400">
                    {selectedPath.fees?.reduce((a, b) => a + b, 0).toFixed(3) || '0.000'}%
                  </div>
                </div>
                <div>
                  <span className="text-sm text-gray-400">순수익</span>
                  <div className="text-lg font-mono text-green-400">
                    ${selectedPath.netProfit?.toFixed(2) || '0.00'}
                  </div>
                </div>
                <div>
                  <span className="text-sm text-gray-400">ROI</span>
                  <div className="text-lg font-mono text-green-400">
                    {selectedPath.profitPercent?.toFixed(3) || '0.000'}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}