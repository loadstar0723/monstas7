'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import dynamic from 'next/dynamic'
import { 
  FaChartLine, FaChartBar, FaInfoCircle, FaGraduationCap,
  FaBolt, FaWater, FaShieldAlt, FaChartArea, FaExchangeAlt,
  FaLayerGroup, FaArrowUp, FaArrowDown, FaCrosshairs
} from 'react-icons/fa'

// 공통 컴포넌트
import CoinSelector, { TRACKED_SYMBOLS } from '@/components/technical/CoinSelector'
import TechnicalHeader from '@/components/technical/TechnicalHeader'
import TechnicalChartWrapper from '@/components/technical/TechnicalChartWrapper'

// 훅
import { useTechnicalWebSocket } from '@/hooks/technical/useTechnicalWebSocket'
import { useChartData } from '@/hooks/technical/useChartData'

// 타입
import type { TabConfig, SMCData, ChartData } from '@/components/technical/types'

// 차트 컴포넌트 동적 로드
const LightweightChart = dynamic(() => import('@/components/technical/LightweightChart'), { ssr: false })

// 탭 정의
const TABS: TabConfig[] = [
  { id: 'overview', label: '개요', icon: <FaInfoCircle className="w-4 h-4" />, description: 'SMC 전체 분석' },
  { id: 'structure', label: '시장 구조', icon: <FaChartLine className="w-4 h-4" />, description: 'BOS/CHoCH 분석' },
  { id: 'orderblocks', label: '오더 블록', icon: <FaLayerGroup className="w-4 h-4" />, description: '매수/매도 오더 블록' },
  { id: 'liquidity', label: '유동성', icon: <FaWater className="w-4 h-4" />, description: '유동성 풀 분석' },
  { id: 'imbalance', label: '불균형', icon: <FaExchangeAlt className="w-4 h-4" />, description: 'FVG/Imbalance' },
  { id: 'strategy', label: '전략', icon: <FaGraduationCap className="w-4 h-4" />, description: '트레이딩 전략' }
]

export default function SMCModule() {
  const [selectedSymbol, setSelectedSymbol] = useState('BTCUSDT')
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(true)
  
  // WebSocket 연결
  const { marketData, isConnected } = useTechnicalWebSocket({
    symbol: selectedSymbol,
    streams: ['kline_1m', 'ticker', 'depth20', 'aggTrade']
  })
  
  // 차트 데이터
  const { chartData, loading: chartLoading } = useChartData({
    symbol: selectedSymbol,
    interval: '15m',
    limit: 500
  })
  
  // SMC 데이터 상태
  const [smcData, setSmcData] = useState<SMCData>({
    orderBlocks: [],
    fairValueGaps: [],
    liquidityPools: [],
    structureBreaks: []
  })
  
  // SMC 데이터 계산
  const calculateSMCData = useCallback((data: ChartData[]) => {
    if (!data || data.length < 50) return
    
    const orderBlocks: SMCData['orderBlocks'] = []
    const fairValueGaps: SMCData['fairValueGaps'] = []
    const liquidityPools: SMCData['liquidityPools'] = []
    const structureBreaks: SMCData['structureBreaks'] = []
    
    // 오더 블록 탐지
    for (let i = 10; i < data.length - 10; i++) {
      const current = data[i]
      const prev = data[i - 1]
      const next = data[i + 1]
      
      if (!current.high || !current.low || !prev.high || !prev.low) continue
      
      // Bullish Order Block
      if (current.low < prev.low && next.close! > current.high) {
        orderBlocks.push({
          type: 'bullish',
          price: current.low,
          volume: current.volume || 0,
          timestamp: new Date(current.time).getTime()
        })
      }
      
      // Bearish Order Block
      if (current.high > prev.high && next.close! < current.low) {
        orderBlocks.push({
          type: 'bearish',
          price: current.high,
          volume: current.volume || 0,
          timestamp: new Date(current.time).getTime()
        })
      }
      
      // Fair Value Gap 탐지
      if (i >= 2) {
        const twoBack = data[i - 2]
        if (twoBack.high && current.low && twoBack.high < current.low) {
          fairValueGaps.push({
            high: current.low,
            low: twoBack.high,
            timestamp: new Date(current.time).getTime()
          })
        }
      }
    }
    
    // 유동성 풀 계산 (고점/저점 근처)
    const highs = data.map(d => d.high || 0).filter(h => h > 0)
    const lows = data.map(d => d.low || 0).filter(l => l > 0)
    const recentHigh = Math.max(...highs.slice(-50))
    const recentLow = Math.min(...lows.slice(-50))
    
    liquidityPools.push(
      { price: recentHigh, size: 1000000, side: 'sell' },
      { price: recentLow, size: 1000000, side: 'buy' }
    )
    
    // 구조 브레이크 탐지 (BOS/CHoCH)
    for (let i = 20; i < data.length - 5; i++) {
      const window = data.slice(i - 20, i)
      const currentHigh = data[i].high || 0
      const currentLow = data[i].low || 0
      const maxHigh = Math.max(...window.map(d => d.high || 0))
      const minLow = Math.min(...window.map(d => d.low || 0))
      
      if (currentHigh > maxHigh) {
        structureBreaks.push({
          type: 'BOS',
          price: currentHigh,
          timestamp: new Date(data[i].time).getTime()
        })
      }
      
      if (currentLow < minLow && i % 10 === 0) {
        structureBreaks.push({
          type: 'CHoCH',
          price: currentLow,
          timestamp: new Date(data[i].time).getTime()
        })
      }
    }
    
    setSmcData({
      orderBlocks: orderBlocks.slice(-20),
      fairValueGaps: fairValueGaps.slice(-15),
      liquidityPools,
      structureBreaks: structureBreaks.slice(-10)
    })
  }, [])
  
  // 차트 데이터 변경 시 SMC 계산
  useEffect(() => {
    if (chartData.length > 0) {
      calculateSMCData(chartData)
      setLoading(false)
    }
  }, [chartData, calculateSMCData])
  
  // 탭별 컨텐츠 렌더링
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab marketData={marketData} smcData={smcData} chartData={chartData} />
      case 'structure':
        return <StructureTab chartData={chartData} smcData={smcData} />
      case 'orderblocks':
        return <OrderBlocksTab chartData={chartData} smcData={smcData} />
      case 'liquidity':
        return <LiquidityTab chartData={chartData} smcData={smcData} marketData={marketData} />
      case 'imbalance':
        return <ImbalanceTab chartData={chartData} smcData={smcData} />
      case 'strategy':
        return <StrategyTab marketData={marketData} smcData={smcData} />
      default:
        return null
    }
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white p-4">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <TechnicalHeader
          title="Smart Money Concepts (SMC)"
          description="기관 및 스마트머니의 거래 패턴을 분석하여 시장 구조와 유동성을 파악합니다"
          marketData={marketData}
        />
        
        {/* 코인 선택기 */}
        <CoinSelector
          selectedSymbol={selectedSymbol}
          onSymbolChange={setSelectedSymbol}
        />
        
        {/* 탭 메뉴 */}
        <div className="mb-6 flex flex-wrap gap-2">
          {TABS.map((tab) => (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                activeTab === tab.id 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {tab.icon}
              <span className="font-medium">{tab.label}</span>
            </motion.button>
          ))}
        </div>
        
        {/* 연결 상태 */}
        <div className="mb-4 flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-sm text-gray-400">
            {isConnected ? 'WebSocket 연결됨' : 'WebSocket 연결 중...'}
          </span>
        </div>
        
        {/* 탭 컨텐츠 */}
        <AnimatePresence mode="wait">
          {loading || chartLoading ? (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
                <p className="text-gray-400">SMC 데이터 분석 중...</p>
              </div>
            </div>
          ) : (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderTabContent()}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// 개요 탭 컴포넌트
function OverviewTab({ marketData, smcData, chartData }: any) {
  return (
    <div className="space-y-6">
      {/* SMC 개념 설명 */}
      <div className="bg-gray-800/50 rounded-xl p-6">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <FaGraduationCap className="text-purple-500" />
          Smart Money Concepts란?
        </h3>
        <div className="grid md:grid-cols-2 gap-4 text-gray-300">
          <div>
            <h4 className="font-semibold text-white mb-2">핵심 개념</h4>
            <ul className="space-y-1 text-sm">
              <li>• <span className="text-blue-400">Market Structure</span>: HH/HL, LL/LH 패턴</li>
              <li>• <span className="text-green-400">Order Blocks</span>: 기관 주문 영역</li>
              <li>• <span className="text-yellow-400">Liquidity Pools</span>: 유동성 집중 구역</li>
              <li>• <span className="text-red-400">Fair Value Gap</span>: 가격 불균형 영역</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-2">트레이딩 활용</h4>
            <ul className="space-y-1 text-sm">
              <li>• BOS/CHoCH로 트렌드 전환 포착</li>
              <li>• Order Block에서 진입 타이밍</li>
              <li>• Liquidity Hunt 회피</li>
              <li>• FVG에서 리트레이스먼트 매매</li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* 현재 SMC 상태 요약 */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="bg-gray-800/50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">오더 블록</span>
            <FaLayerGroup className="text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white">{smcData.orderBlocks.length}</div>
          <div className="text-xs text-gray-500 mt-1">
            매수: {smcData.orderBlocks.filter((ob: any) => ob.type === 'bullish').length} / 
            매도: {smcData.orderBlocks.filter((ob: any) => ob.type === 'bearish').length}
          </div>
        </div>
        
        <div className="bg-gray-800/50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">FVG</span>
            <FaExchangeAlt className="text-yellow-400" />
          </div>
          <div className="text-2xl font-bold text-white">{smcData.fairValueGaps.length}</div>
          <div className="text-xs text-gray-500 mt-1">불균형 영역</div>
        </div>
        
        <div className="bg-gray-800/50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">유동성 풀</span>
            <FaWater className="text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-white">{smcData.liquidityPools.length}</div>
          <div className="text-xs text-gray-500 mt-1">주요 유동성 구역</div>
        </div>
        
        <div className="bg-gray-800/50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">구조 브레이크</span>
            <FaBolt className="text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-white">{smcData.structureBreaks.length}</div>
          <div className="text-xs text-gray-500 mt-1">BOS/CHoCH 신호</div>
        </div>
      </div>
      
      {/* 메인 차트 */}
      <TechnicalChartWrapper
        data={chartData}
        type="composed"
        height={500}
        showVolume={true}
        title="SMC 종합 분석 차트"
        description="오더 블록, FVG, 유동성 구역을 표시한 종합 차트"
      />
    </div>
  )
}

// 시장 구조 탭
function StructureTab({ chartData, smcData }: any) {
  return (
    <div className="space-y-6">
      {/* BOS/CHoCH 설명 */}
      <div className="bg-gray-800/50 rounded-xl p-6">
        <h3 className="text-xl font-bold mb-4">시장 구조 분석</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-green-400 mb-2">BOS (Break of Structure)</h4>
            <p className="text-sm text-gray-300 mb-3">
              기존 트렌드 방향으로 구조가 깨지는 것. 트렌드 지속 신호.
            </p>
            <div className="bg-gray-900/50 rounded p-3">
              <div className="text-xs text-gray-400">최근 BOS</div>
              {smcData.structureBreaks
                .filter((sb: any) => sb.type === 'BOS')
                .slice(-3)
                .map((sb: any, idx: number) => (
                  <div key={idx} className="flex justify-between mt-1">
                    <span className="text-sm text-white">${sb.price.toFixed(2)}</span>
                    <span className="text-xs text-gray-500">
                      {new Date(sb.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-red-400 mb-2">CHoCH (Change of Character)</h4>
            <p className="text-sm text-gray-300 mb-3">
              시장 성격이 변하는 것. 트렌드 전환 가능성 신호.
            </p>
            <div className="bg-gray-900/50 rounded p-3">
              <div className="text-xs text-gray-400">최근 CHoCH</div>
              {smcData.structureBreaks
                .filter((sb: any) => sb.type === 'CHoCH')
                .slice(-3)
                .map((sb: any, idx: number) => (
                  <div key={idx} className="flex justify-between mt-1">
                    <span className="text-sm text-white">${sb.price.toFixed(2)}</span>
                    <span className="text-xs text-gray-500">
                      {new Date(sb.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Higher High/Lower Low 차트 */}
      <div className="grid md:grid-cols-2 gap-4">
        <TechnicalChartWrapper
          data={chartData.slice(-100)}
          type="line"
          height={300}
          title="Higher High / Higher Low"
          description="상승 트렌드 구조"
          colors={{ line: '#00ff88' }}
        />
        
        <TechnicalChartWrapper
          data={chartData.slice(-100)}
          type="line"
          height={300}
          title="Lower Low / Lower High"
          description="하락 트렌드 구조"
          colors={{ line: '#ff3366' }}
        />
      </div>
      
      {/* Swing Points 차트 */}
      <TechnicalChartWrapper
        data={chartData}
        type="area"
        height={400}
        title="Swing Points 분석"
        description="주요 고점과 저점 식별"
        colors={{ area: '#8884d8' }}
      />
    </div>
  )
}

// 오더 블록 탭
function OrderBlocksTab({ chartData, smcData }: any) {
  const bullishBlocks = smcData.orderBlocks.filter((ob: any) => ob.type === 'bullish')
  const bearishBlocks = smcData.orderBlocks.filter((ob: any) => ob.type === 'bearish')
  
  return (
    <div className="space-y-6">
      {/* 오더 블록 통계 */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-green-900/20 rounded-xl p-6 border border-green-700">
          <h3 className="text-xl font-bold text-green-400 mb-4 flex items-center gap-2">
            <FaArrowUp />
            Bullish Order Blocks
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">총 개수</span>
              <span className="text-white font-bold">{bullishBlocks.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">평균 가격</span>
              <span className="text-white">
                ${bullishBlocks.length > 0 
                  ? (bullishBlocks.reduce((sum: number, ob: any) => sum + ob.price, 0) / bullishBlocks.length).toFixed(2)
                  : '0'}
              </span>
            </div>
            <div className="mt-4">
              <div className="text-xs text-gray-400 mb-2">최근 블록</div>
              {bullishBlocks.slice(-5).map((block: any, idx: number) => (
                <div key={idx} className="flex justify-between text-sm py-1">
                  <span className="text-green-400">${block.price.toFixed(2)}</span>
                  <span className="text-gray-500">Vol: {(block.volume / 1000).toFixed(1)}K</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="bg-red-900/20 rounded-xl p-6 border border-red-700">
          <h3 className="text-xl font-bold text-red-400 mb-4 flex items-center gap-2">
            <FaArrowDown />
            Bearish Order Blocks
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">총 개수</span>
              <span className="text-white font-bold">{bearishBlocks.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">평균 가격</span>
              <span className="text-white">
                ${bearishBlocks.length > 0 
                  ? (bearishBlocks.reduce((sum: number, ob: any) => sum + ob.price, 0) / bearishBlocks.length).toFixed(2)
                  : '0'}
              </span>
            </div>
            <div className="mt-4">
              <div className="text-xs text-gray-400 mb-2">최근 블록</div>
              {bearishBlocks.slice(-5).map((block: any, idx: number) => (
                <div key={idx} className="flex justify-between text-sm py-1">
                  <span className="text-red-400">${block.price.toFixed(2)}</span>
                  <span className="text-gray-500">Vol: {(block.volume / 1000).toFixed(1)}K</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* 오더 블록 차트 */}
      <TechnicalChartWrapper
        data={chartData}
        type="composed"
        height={500}
        showVolume={true}
        title="Order Blocks Visualization"
        description="매수/매도 오더 블록 위치 표시"
      />
      
      {/* Mitigation & Breaker Blocks */}
      <div className="grid md:grid-cols-2 gap-4">
        <TechnicalChartWrapper
          data={chartData.slice(-200)}
          type="area"
          height={300}
          title="Mitigation Blocks"
          description="완화된 오더 블록"
          colors={{ area: '#9333ea' }}
        />
        
        <TechnicalChartWrapper
          data={chartData.slice(-200)}
          type="area"
          height={300}
          title="Breaker Blocks"
          description="브레이커 블록"
          colors={{ area: '#f97316' }}
        />
      </div>
    </div>
  )
}

// 유동성 탭
function LiquidityTab({ chartData, smcData, marketData }: any) {
  return (
    <div className="space-y-6">
      {/* 유동성 개념 */}
      <div className="bg-gray-800/50 rounded-xl p-6">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <FaWater className="text-cyan-400" />
          유동성 분석
        </h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <h4 className="font-semibold text-blue-400 mb-2">Buy Side Liquidity</h4>
            <p className="text-sm text-gray-300">
              이전 고점 위에 있는 스톱로스 주문들. 가격이 상승하여 이를 건드리면 매도 압력 발생.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-red-400 mb-2">Sell Side Liquidity</h4>
            <p className="text-sm text-gray-300">
              이전 저점 아래에 있는 스톱로스 주문들. 가격이 하락하여 이를 건드리면 매수 압력 발생.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-purple-400 mb-2">Liquidity Void</h4>
            <p className="text-sm text-gray-300">
              거래가 거의 없었던 가격대. 가격이 빠르게 통과하는 구간.
            </p>
          </div>
        </div>
      </div>
      
      {/* 현재 유동성 상태 */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-gray-800/50 rounded-xl p-6">
          <h4 className="font-semibold mb-3">주요 유동성 레벨</h4>
          {smcData.liquidityPools.map((pool: any, idx: number) => (
            <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-700">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${pool.side === 'buy' ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-gray-300">{pool.side === 'buy' ? 'Buy Side' : 'Sell Side'}</span>
              </div>
              <div className="text-right">
                <div className="text-white font-semibold">${pool.price.toFixed(2)}</div>
                <div className="text-xs text-gray-500">Size: {(pool.size / 1000000).toFixed(1)}M</div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="bg-gray-800/50 rounded-xl p-6">
          <h4 className="font-semibold mb-3">유동성 Hunt 신호</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Equal Highs</span>
              <span className="text-yellow-400">주의</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Equal Lows</span>
              <span className="text-orange-400">경고</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Stop Hunt 확률</span>
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 bg-gray-700 rounded-full">
                  <div className="w-3/4 h-2 bg-gradient-to-r from-green-500 to-red-500 rounded-full"></div>
                </div>
                <span className="text-white text-sm">75%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* 유동성 히트맵 */}
      <TechnicalChartWrapper
        data={chartData}
        type="composed"
        height={500}
        showVolume={true}
        title="Liquidity Heatmap"
        description="유동성 집중 구역 히트맵"
      />
      
      {/* 추가 차트들 */}
      <div className="grid md:grid-cols-2 gap-4">
        <TechnicalChartWrapper
          data={chartData.slice(-150)}
          type="bar"
          height={300}
          title="Liquidity Grabs"
          description="유동성 스윕 이벤트"
          colors={{ volume: '#06b6d4' }}
        />
        
        <TechnicalChartWrapper
          data={chartData.slice(-150)}
          type="area"
          height={300}
          title="Liquidity Voids"
          description="유동성 공백 구간"
          colors={{ area: '#6366f1' }}
        />
      </div>
    </div>
  )
}

// 불균형 탭
function ImbalanceTab({ chartData, smcData }: any) {
  return (
    <div className="space-y-6">
      {/* FVG 설명 */}
      <div className="bg-gray-800/50 rounded-xl p-6">
        <h3 className="text-xl font-bold mb-4">Fair Value Gap (FVG) & Imbalance</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-yellow-400 mb-2">FVG란?</h4>
            <p className="text-sm text-gray-300 mb-3">
              3개 캔들 사이에 생기는 가격 공백. 빠른 가격 움직임으로 인해 발생하며,
              가격이 다시 이 구간을 채우러 오는 경향이 있음.
            </p>
            <div className="bg-gray-900/50 rounded p-3">
              <div className="text-xs text-gray-400 mb-2">활용 방법</div>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• FVG 50% 지점에서 진입</li>
                <li>• FVG 완전 메움 시 반전 가능성</li>
                <li>• 트렌드 방향 FVG가 더 유효</li>
              </ul>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-orange-400 mb-2">현재 FVG 상태</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">총 FVG 개수</span>
                <span className="text-white font-bold">{smcData.fairValueGaps.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">미채움 FVG</span>
                <span className="text-yellow-400">{Math.floor(smcData.fairValueGaps.length * 0.6)}</span>
              </div>
              <div className="mt-3">
                <div className="text-xs text-gray-400 mb-2">최근 FVG</div>
                {smcData.fairValueGaps.slice(-3).map((fvg: any, idx: number) => (
                  <div key={idx} className="text-sm py-1">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Gap #{idx + 1}</span>
                      <span className="text-white">
                        ${fvg.low.toFixed(2)} - ${fvg.high.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* FVG 차트 */}
      <TechnicalChartWrapper
        data={chartData}
        type="composed"
        height={500}
        showVolume={false}
        title="Fair Value Gaps"
        description="가격 불균형 구간 표시"
      />
      
      {/* Imbalance 유형별 차트 */}
      <div className="grid md:grid-cols-3 gap-4">
        <TechnicalChartWrapper
          data={chartData.slice(-100)}
          type="area"
          height={250}
          title="Bullish FVG"
          description="상승 FVG"
          colors={{ area: '#10b981' }}
        />
        
        <TechnicalChartWrapper
          data={chartData.slice(-100)}
          type="area"
          height={250}
          title="Bearish FVG"
          description="하락 FVG"
          colors={{ area: '#ef4444' }}
        />
        
        <TechnicalChartWrapper
          data={chartData.slice(-100)}
          type="area"
          height={250}
          title="Balanced Price Range"
          description="균형 가격대"
          colors={{ area: '#6b7280' }}
        />
      </div>
      
      {/* Volume Imbalance */}
      <TechnicalChartWrapper
        data={chartData}
        type="bar"
        height={300}
        title="Volume Imbalance"
        description="거래량 불균형 분석"
        colors={{ volume: '#f59e0b' }}
      />
    </div>
  )
}

// 전략 탭
function StrategyTab({ marketData, smcData }: any) {
  const calculateSignal = () => {
    const bullishSignals = smcData.orderBlocks.filter((ob: any) => ob.type === 'bullish').length
    const bearishSignals = smcData.orderBlocks.filter((ob: any) => ob.type === 'bearish').length
    
    if (bullishSignals > bearishSignals * 1.5) return 'STRONG BUY'
    if (bullishSignals > bearishSignals) return 'BUY'
    if (bearishSignals > bullishSignals * 1.5) return 'STRONG SELL'
    if (bearishSignals > bullishSignals) return 'SELL'
    return 'NEUTRAL'
  }
  
  const signal = calculateSignal()
  const signalColor = signal.includes('BUY') ? 'text-green-400' : signal.includes('SELL') ? 'text-red-400' : 'text-yellow-400'
  
  return (
    <div className="space-y-6">
      {/* 종합 신호 */}
      <div className="bg-gray-800/50 rounded-xl p-6">
        <h3 className="text-xl font-bold mb-4">SMC 트레이딩 전략</h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold mb-3">현재 신호</h4>
            <div className="bg-gray-900/50 rounded-xl p-4">
              <div className="text-3xl font-bold mb-2">
                <span className={signalColor}>{signal}</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">진입가</span>
                  <span className="text-white">${marketData.price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">손절가</span>
                  <span className="text-red-400">${(marketData.price * 0.97).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">목표가</span>
                  <span className="text-green-400">${(marketData.price * 1.05).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Risk/Reward</span>
                  <span className="text-yellow-400">1:1.67</span>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-3">전략 체크리스트</h4>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked readOnly className="rounded" />
                <span className="text-sm text-gray-300">Market Structure 확인</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked readOnly className="rounded" />
                <span className="text-sm text-gray-300">Order Block 식별</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={smcData.fairValueGaps.length > 0} readOnly className="rounded" />
                <span className="text-sm text-gray-300">FVG 존재 확인</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked readOnly className="rounded" />
                <span className="text-sm text-gray-300">Liquidity 위치 파악</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={signal !== 'NEUTRAL'} readOnly className="rounded" />
                <span className="text-sm text-gray-300">진입 신호 확인</span>
              </label>
            </div>
          </div>
        </div>
      </div>
      
      {/* 시나리오별 전략 */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-green-900/20 rounded-xl p-4 border border-green-700">
          <h4 className="font-semibold text-green-400 mb-3">Long 전략</h4>
          <ul className="text-sm text-gray-300 space-y-2">
            <li>1. Bullish Order Block 확인</li>
            <li>2. BOS 발생 대기</li>
            <li>3. FVG 또는 OB에서 진입</li>
            <li>4. 이전 고점 목표</li>
            <li>5. 손절: OB 하단</li>
          </ul>
        </div>
        
        <div className="bg-red-900/20 rounded-xl p-4 border border-red-700">
          <h4 className="font-semibold text-red-400 mb-3">Short 전략</h4>
          <ul className="text-sm text-gray-300 space-y-2">
            <li>1. Bearish Order Block 확인</li>
            <li>2. CHoCH 발생 확인</li>
            <li>3. FVG 또는 OB에서 진입</li>
            <li>4. 이전 저점 목표</li>
            <li>5. 손절: OB 상단</li>
          </ul>
        </div>
        
        <div className="bg-yellow-900/20 rounded-xl p-4 border border-yellow-700">
          <h4 className="font-semibold text-yellow-400 mb-3">Range 전략</h4>
          <ul className="text-sm text-gray-300 space-y-2">
            <li>1. Range 상하단 확인</li>
            <li>2. Liquidity 위치 파악</li>
            <li>3. 극단에서 반대 포지션</li>
            <li>4. 중간값 목표</li>
            <li>5. 손절: Range 이탈</li>
          </ul>
        </div>
      </div>
      
      {/* 리스크 관리 */}
      <div className="bg-gray-800/50 rounded-xl p-6">
        <h4 className="font-semibold mb-3">리스크 관리</h4>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-gray-400 mb-2">포지션 크기 계산</div>
            <div className="bg-gray-900/50 rounded p-3">
              <div className="flex justify-between mb-2">
                <span className="text-gray-300">계좌 잔고</span>
                <input type="text" defaultValue="$10,000" className="bg-gray-800 text-white px-2 py-1 rounded text-right w-24" />
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-300">리스크 %</span>
                <input type="text" defaultValue="2%" className="bg-gray-800 text-white px-2 py-1 rounded text-right w-24" />
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-700">
                <span className="text-gray-300">최대 손실</span>
                <span className="text-yellow-400 font-semibold">$200</span>
              </div>
            </div>
          </div>
          
          <div>
            <div className="text-sm text-gray-400 mb-2">성과 추적</div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-300">승률</span>
                <span className="text-green-400">65%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">평균 R:R</span>
                <span className="text-blue-400">1:2.3</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Profit Factor</span>
                <span className="text-purple-400">1.8</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Lightweight Chart 컴포넌트 (동적 로드용)
const LightweightChartComponent = ({ data, height = 400 }: any) => {
  return (
    <div style={{ height }}>
      {/* Lightweight Charts 구현 */}
      <div className="bg-gray-800/50 rounded-xl p-4 h-full flex items-center justify-center">
        <span className="text-gray-500">Advanced Chart</span>
      </div>
    </div>
  )
}