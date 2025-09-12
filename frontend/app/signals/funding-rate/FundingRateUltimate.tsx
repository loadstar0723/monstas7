'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRealtimePrice, useMultipleRealtimePrices, fetchKlines, fetchOrderBook, fetch24hrTicker } from '@/lib/hooks/useRealtimePrice'
import { dataService } from '@/lib/services/finalDataService'
import { safeFixed, safePrice, safeAmount, safePercent, safeMillion, safeThousand } from '@/lib/safeFormat'
import { 
  FaPercent, FaClock, FaChartLine, FaExclamationTriangle, 
  FaArrowUp, FaArrowDown, FaDollarSign, FaExchangeAlt,
  FaBitcoin, FaEthereum, FaCoins, FaChartBar, FaHistory,
  FaRobot, FaCalculator, FaBalanceScale, FaFireAlt,
  FaWater, FaChartArea, FaInfoCircle, FaTrophy,
  FaGraduationCap, FaLightbulb, FaUserGraduate
} from 'react-icons/fa'
import { SiBinance, SiSolana, SiRipple, SiDogecoin } from 'react-icons/si'
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, Cell, PieChart, Pie, RadarChart, 
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts'

// 코인 설정
const COINS = [
  { symbol: 'BTCUSDT', name: 'BTC', icon: FaBitcoin, color: '#F7931A' },
  { symbol: 'ETHUSDT', name: 'ETH', icon: FaEthereum, color: '#627EEA' },
  { symbol: 'BNBUSDT', name: 'BNB', icon: SiBinance, color: '#F3BA2F' },
  { symbol: 'SOLUSDT', name: 'SOL', icon: SiSolana, color: '#9945FF' },
  { symbol: 'XRPUSDT', name: 'XRP', icon: SiRipple, color: '#23292F' },
  { symbol: 'ADAUSDT', name: 'ADA', icon: FaCoins, color: '#0033AD' },
  { symbol: 'DOGEUSDT', name: 'DOGE', icon: SiDogecoin, color: '#C2A633' },
  { symbol: 'AVAXUSDT', name: 'AVAX', icon: FaCoins, color: '#E84142' },
  { symbol: 'MATICUSDT', name: 'MATIC', icon: FaCoins, color: '#8247E5' },
  { symbol: 'ARBUSDT', name: 'ARB', icon: FaCoins, color: '#28A0F0' }
]

interface FundingData {
  current: {
    symbol: string
    fundingRate: number
    nextFundingRate: number
    lastFundingRate: number
    fundingTime: number
    nextFundingTime: number
    countdown: string
    countdownMs: number
    markPrice: number
    indexPrice: number
    premium: number
    annualizedRate: number
  }
  statistics: {
    avgRate: number
    maxRate: number
    minRate: number
    trend: string
    sentiment: string
    dataPoints: number
  }
  history: Array<{
    time: number
    rate: number
    symbol: string
  }>
  recommendation: {
    action: string
    confidence: number
    reason: string
  }
}

export default function FundingRateUltimate() {
  const [selectedCoin, setSelectedCoin] = useState('BTCUSDT')
  const [fundingData, setFundingData] = useState<FundingData | null>(null)
  const [historyData, setHistoryData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [currentPrice, setCurrentPrice] = useState(0)
  const wsRef = useRef<WebSocket | null>(null)
  const intervalRef = useRef<NodeJS.Timeout>()

  // WebSocket 연결
  const connectWebSocket = useCallback((symbol: string) => {
    if (wsRef.current) {
      wsRef.current.close()
    }

    const streamName = symbol.toLowerCase().replace('usdt', '') + 'usdt@markPrice@1s'