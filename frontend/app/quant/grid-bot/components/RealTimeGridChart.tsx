'use client'

import { useState, useEffect, useRef } from 'react'
import { safeFixed, safePrice, safeAmount, safePercent, safeMillion, safeThousand } from '@/lib/safeFormat'
import { motion } from 'framer-motion'
import { FaChartLine, FaExpand, FaCompress, FaClock } from 'react-icons/fa'
import { binanceAPI, BINANCE_CONFIG } from '@/lib/binanceConfig'
import { ModuleWebSocket } from '@/lib/moduleUtils'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Dot
} from 'recharts'

interface CoinInfo {
  symbol: string
  fullSymbol: string
  name: string
  color: string
  bgColor: string
}

interface Props {
  selectedCoin: CoinInfo
}

interface PriceData {
  time: string
  price: number
  volume: number
}

interface GridLineData {
  price: number
  type: 'buy' | 'sell'
  active: boolean
}

export default function RealTimeGridChart({ selectedCoin }: Props) {
  const [priceHistory, setPriceHistory] = useState<PriceData[]>([])
  const [currentPrice, setCurrentPrice] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [timeframe, setTimeframe] = useState('5m')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const wsRef = useRef<ModuleWebSocket | null>(null)
  
  // 그리드 설정 (실제로는 GridSetupTool에서 가져와야 함)
  const [gridSettings] = useState({
    upperPrice: 0,
    lowerPrice: 0,
    gridCount: 20
  })
  
  const [gridLines, setGridLines] = useState<GridLineData[]>([])

  // 초기 데이터 로드 및 그리드 라인 계산
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // 현재 가격 및 24시간 데이터 가져오기
        const { data: ticker } = await binanceAPI.get24hrTicker(selectedCoin.fullSymbol)
        if (ticker) {
          const currentPrice = parseFloat(ticker.lastPrice)
          const high24h = parseFloat(ticker.highPrice)
          const low24h = parseFloat(ticker.lowPrice)
          
          setCurrentPrice(currentPrice)
          
          // 임시 그리드 설정 (실제로는 GridSetupTool에서 받아와야 함)
          const upperPrice = high24h * 1.1
          const lowerPrice = low24h * 0.9
          const gridCount = 20
          
          // 그리드 라인 계산
          const lines: GridLineData[] = []
          const gridInterval = (upperPrice - lowerPrice) / gridCount
          
          for (let i = 0; i <= gridCount; i++) {
            const price = lowerPrice + (gridInterval * i)
            lines.push({
              price,
              type: price > currentPrice ? 'sell' : 'buy',
              active: Math.abs(price - currentPrice) < gridInterval * 2
            })
          }
          
          setGridLines(lines)
        }
        
        // K라인 데이터 가져오기
        const { data: klines } = await binanceAPI.getKlines({
          symbol: selectedCoin.fullSymbol,
          interval: timeframe,
          limit: 100
        })
        
        if (klines) {
          const formattedData: PriceData[] = klines.map((kline: any) => ({
            time: new Date(kline[0]).toLocaleTimeString('ko-KR'),
            price: parseFloat(kline[4]), // 종가
            volume: parseFloat(kline[5])
          }))
          
          setPriceHistory(formattedData)
        }
        
        setIsLoading(false)
      } catch (error) {
        console.error('데이터 로드 실패:', error)
        setIsLoading(false)
      }
    }
    
    loadInitialData()
    
    // WebSocket 연결
    wsRef.current = new ModuleWebSocket('GridChart')
    const wsUrl = `${BINANCE_CONFIG.WS_BASE}/${selectedCoin.fullSymbol.toLowerCase()}@kline_1m`
    
    wsRef.current.connect(wsUrl, (data) => {
      if (data.k) {
        const kline = data.k
        const newPrice = parseFloat(kline.c)
        setCurrentPrice(newPrice)
        
        // 실시간 가격 히스토리 업데이트
        setPriceHistory(prev => {
          const newData: PriceData = {
            time: new Date(kline.t).toLocaleTimeString('ko-KR'),
            price: newPrice,
            volume: parseFloat(kline.v)
          }
          
          // 마지막 데이터가 같은 시간이면 업데이트, 아니면 추가
          if (prev.length > 0 && prev[prev.length - 1].time === newData.time) {
            return [...prev.slice(0, -1), newData]
          } else {
            // 최대 100개 유지
            return [...prev.slice(-99), newData]
          }
        })
        
        // 그리드 라인 업데이트 (현재 가격 기준으로 buy/sell 타입 변경)
        setGridLines(prev => prev.map(line => ({
          ...line,
          type: line.price > newPrice ? 'sell' : 'buy',
          active: Math.abs(line.price - newPrice) < (gridLines[1]?.price - gridLines[0]?.price || 100) * 2
        })))
      }
    })
    
    return () => {
      if (wsRef.current) {
        wsRef.current.disconnect()
      }
    }
  }, [selectedCoin, timeframe])

  // 전체화면 토글
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  // 커스텀 툴팁
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-3">
          <p className="text-xs text-gray-400">{payload[0].payload.time}</p>
          <p className="text-sm font-bold text-white">
            ${payload[0].value.toFixed(selectedCoin.symbol === 'BTC' ? 2 : 4)}
          </p>
        </div>
      )
    }
    return null
  }

  // 가격 범위 계산
  const prices = priceHistory.map(d => d.price)
  const minPrice = Math.min(...prices, ...gridLines.map(g => g.price))
  const maxPrice = Math.max(...prices, ...gridLines.map(g => g.price))
  const priceRange = maxPrice - minPrice
  const yAxisDomain = [minPrice - priceRange * 0.1, maxPrice + priceRange * 0.1]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">차트 데이터 로딩 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${isFullscreen ? 'fixed inset-0 z-50 bg-black p-4' : ''}`}>
      {/* 섹션 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 ${selectedCoin.bgColor} rounded-lg flex items-center justify-center`}>
            <FaChartLine className={`text-xl ${selectedCoin.color}`} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">실시간 그리드 차트</h2>
            <p className="text-gray-400">{selectedCoin.name} 그리드 봇 시각화</p>
          </div>
        </div>
        
        {/* 컨트롤 버튼 */}
        <div className="flex items-center gap-2">
          {/* 시간대 선택 */}
          <div className="flex gap-1 bg-gray-800 rounded-lg p-1">
            {['1m', '5m', '15m', '30m', '1h'].map(tf => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1 rounded text-sm font-medium transition-all ${
                  timeframe === tf
                    ? `${selectedCoin.bgColor} ${selectedCoin.color}`
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
          
          {/* 전체화면 토글 */}
          <button
            onClick={toggleFullscreen}
            className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
          >
            {isFullscreen ? <FaCompress className="text-gray-400" /> : <FaExpand className="text-gray-400" />}
          </button>
        </div>
      </div>

      {/* 현재 가격 표시 */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-gray-400 mb-1">현재가</p>
            <p className="text-3xl font-bold text-white">
              ${currentPrice.toFixed(selectedCoin.symbol === 'BTC' ? 2 : 4)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-400 mb-1">활성 그리드</p>
            <p className="text-2xl font-bold text-green-400">
              {gridLines.filter(g => g.active).length} / {gridLines.length}
            </p>
          </div>
        </div>
        
        {/* 그리드 정보 */}
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-gray-400">상한가</p>
            <p className="text-white font-medium">
              ${gridLines.length > 0 ? gridLines[gridLines.length - 1].safePrice(price, 2) : '0'}
            </p>
          </div>
          <div>
            <p className="text-gray-400">하한가</p>
            <p className="text-white font-medium">
              ${gridLines.length > 0 ? gridLines[0].safePrice(price, 2) : '0'}
            </p>
          </div>
          <div>
            <p className="text-gray-400">그리드 간격</p>
            <p className="text-white font-medium">
              ${gridLines.length > 1 ? (gridLines[1].price - gridLines[0].price).toFixed(2) : '0'}
            </p>
          </div>
        </div>
      </div>

      {/* 메인 차트 */}
      <div className={`bg-gray-800 rounded-xl p-6 border border-gray-700 ${isFullscreen ? 'h-[calc(100vh-300px)]' : ''}`}>
        <ResponsiveContainer width="100%" height={isFullscreen ? '100%' : 500}>
          <LineChart
            data={priceHistory}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              dataKey="time"
              stroke="#9CA3AF"
              tick={{ fontSize: 12 }}
              interval="preserveStartEnd"
            />
            <YAxis
              stroke="#9CA3AF"
              tick={{ fontSize: 12 }}
              domain={yAxisDomain}
              tickFormatter={(value) => `$${value.toFixed(selectedCoin.symbol === 'BTC' ? 0 : 2)}`}
            />
            <Tooltip content={<CustomTooltip />} />
            
            {/* 그리드 라인 */}
            {gridLines.map((gridLine, index) => (
              <ReferenceLine
                key={index}
                y={gridLine.price}
                stroke={gridLine.type === 'buy' ? '#10B981' : '#EF4444'}
                strokeDasharray={gridLine.active ? "0" : "3 3"}
                strokeOpacity={gridLine.active ? 0.8 : 0.3}
                strokeWidth={gridLine.active ? 2 : 1}
                label={{
                  value: gridLine.type === 'buy' ? '매수' : '매도',
                  position: "right",
                  fill: gridLine.type === 'buy' ? '#10B981' : '#EF4444',
                  fontSize: 10
                }}
              />
            ))}
            
            {/* 현재 가격 라인 */}
            <ReferenceLine
              y={currentPrice}
              stroke={selectedCoin.color.replace('text-', '#')}
              strokeWidth={2}
              label={{
                value: `현재: $${currentPrice.toFixed(selectedCoin.symbol === 'BTC' ? 2 : 4)}`,
                position: "left",
                fill: selectedCoin.color.replace('text-', '#'),
                fontSize: 12,
                fontWeight: 'bold'
              }}
            />
            
            {/* 가격 라인 */}
            <Line
              type="monotone"
              dataKey="price"
              stroke={selectedCoin.color.replace('text-', '#')}
              strokeWidth={2}
              dot={false}
              animationDuration={0}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 범례 */}
      <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
        <div className="flex items-center justify-center gap-8 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 bg-green-500"></div>
            <span className="text-gray-400">매수 그리드</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 bg-red-500"></div>
            <span className="text-gray-400">매도 그리드</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-4 h-1 ${selectedCoin.bgColor.replace('/20', '')}`}></div>
            <span className="text-gray-400">현재 가격</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 bg-gray-600 opacity-50"></div>
            <span className="text-gray-400">비활성 그리드</span>
          </div>
        </div>
      </div>

      {/* 차트 설명 */}
      <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-xl p-6 border border-purple-700/30">
        <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
          <FaClock className="text-purple-400" />
          실시간 그리드 봇 작동 상태
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="text-gray-300">
            <p>• 녹색 선: 매수 대기 주문 (가격이 하락하면 체결)</p>
            <p>• 빨간 선: 매도 대기 주문 (가격이 상승하면 체결)</p>
            <p>• 실선: 활성 그리드 (곧 체결될 수 있는 주문)</p>
          </div>
          <div className="text-gray-300">
            <p>• 점선: 비활성 그리드 (대기 중인 주문)</p>
            <p>• 가격이 그리드 라인을 터치하면 자동 체결</p>
            <p>• 체결 후 반대편에 새 주문 자동 생성</p>
          </div>
        </div>
      </div>
    </div>
  )
}