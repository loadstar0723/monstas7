'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  FaShieldAlt, FaExclamationTriangle, FaChartLine, 
  FaBell, FaLock, FaTachometerAlt, FaHistory,
  FaBalanceScale
} from 'react-icons/fa'
import { GiArtificialIntelligence } from 'react-icons/gi'
import dynamic from 'next/dynamic'

// 동적 임포트
const RealTimeRiskMonitor = dynamic(() => import('./RealTimeRiskMonitor'), { ssr: false })
const PositionRiskAnalyzer = dynamic(() => import('./PositionRiskAnalyzer'), { ssr: false })
const MarketRiskDashboard = dynamic(() => import('./MarketRiskDashboard'), { ssr: false })
const VaRCalculator = dynamic(() => import('./VaRCalculator'), { ssr: false })
const StressTestingModule = dynamic(() => import('./StressTestingModule'), { ssr: false })
const RiskAlertSystem = dynamic(() => import('./RiskAlertSystem'), { ssr: false })
const DrawdownAnalysis = dynamic(() => import('./DrawdownAnalysis'), { ssr: false })
const HedgingStrategies = dynamic(() => import('./HedgingStrategies'), { ssr: false })

interface RiskMetrics {
  totalRisk: number
  marketRisk: number
  liquidityRisk: number
  operationalRisk: number
  creditRisk: number
  var95: number
  cvar95: number
  maxDrawdown: number
  currentDrawdown: number
  sharpeRatio: number
  beta: number
  correlation: number
}

interface Position {
  id: string
  symbol: string
  type: 'long' | 'short'
  size: number
  entryPrice: number
  currentPrice: number
  pnl: number
  risk: number
  stopLoss: number
  takeProfit: number
  leverage: number
}

export default function RiskManagementSuite() {
  const [activeTab, setActiveTab] = useState('monitor')
  const [riskMetrics, setRiskMetrics] = useState<RiskMetrics>({
    totalRisk: 0,
    marketRisk: 0,
    liquidityRisk: 0,
    operationalRisk: 0,
    creditRisk: 0,
    var95: 0,
    cvar95: 0,
    maxDrawdown: 0,
    currentDrawdown: 0,
    sharpeRatio: 0,
    beta: 0,
    correlation: 0
  })
  const [positions, setPositions] = useState<Position[]>([])
  const [riskLevel, setRiskLevel] = useState<'low' | 'medium' | 'high' | 'critical'>('medium')
  const [alerts, setAlerts] = useState<any[]>([])

  // 리스크 메트릭 계산
  useEffect(() => {
    const calculateRiskMetrics = () => {
      // 시뮬레이션된 리스크 데이터
      const metrics: RiskMetrics = {
        totalRisk: 65 + Math.random() * 20,
        marketRisk: 30 + Math.random() * 15,
        liquidityRisk: 15 + Math.random() * 10,
        operationalRisk: 10 + Math.random() * 5,
        creditRisk: 5 + Math.random() * 5,
        var95: -12.5 + Math.random() * 5,
        cvar95: -18.3 + Math.random() * 7,
        maxDrawdown: -25.6,
        currentDrawdown: -8.4 + Math.random() * 5,
        sharpeRatio: 1.2 + Math.random() * 0.5,
        beta: 1.1 + Math.random() * 0.3,
        correlation: 0.85 + Math.random() * 0.1
      }

      setRiskMetrics(metrics)

      // 리스크 레벨 결정
      if (metrics.totalRisk > 80) setRiskLevel('critical')
      else if (metrics.totalRisk > 60) setRiskLevel('high')
      else if (metrics.totalRisk > 40) setRiskLevel('medium')
      else setRiskLevel('low')
    }

    // 샘플 포지션 생성
    const samplePositions: Position[] = [
      {
        id: 'pos_1',
        symbol: 'BTCUSDT',
        type: 'long',
        size: 2.5,
        entryPrice: 63500,
        currentPrice: 65200,
        pnl: 4250,
        risk: 15,
        stopLoss: 61000,
        takeProfit: 70000,
        leverage: 3
      },
      {
        id: 'pos_2',
        symbol: 'ETHUSDT',
        type: 'long',
        size: 15,
        entryPrice: 3450,
        currentPrice: 3520,
        pnl: 1050,
        risk: 12,
        stopLoss: 3300,
        takeProfit: 3800,
        leverage: 2
      },
      {
        id: 'pos_3',
        symbol: 'SOLUSDT',
        type: 'short',
        size: 100,
        entryPrice: 155,
        currentPrice: 152,
        pnl: 300,
        risk: 18,
        stopLoss: 160,
        takeProfit: 145,
        leverage: 5
      }
    ]

    setPositions(samplePositions)
    calculateRiskMetrics()

    const interval = setInterval(calculateRiskMetrics, 5000)
    return () => clearInterval(interval)
  }, [])

  // 리스크 레벨별 색상
  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-400 bg-green-500/20'
      case 'medium': return 'text-yellow-400 bg-yellow-500/20'
      case 'high': return 'text-orange-400 bg-orange-500/20'
      case 'critical': return 'text-red-400 bg-red-500/20'
      default: return 'text-gray-400 bg-gray-500/20'
    }
  }

  return (
    <div className="w-full min-h-screen bg-gray-900 p-6">
      {/* 헤더 */}
      <div className="bg-gradient-to-r from-red-900/20 to-orange-900/20 rounded-lg p-6 mb-6 border border-red-500/30">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-600 rounded-lg">
              <FaShieldAlt className="text-3xl text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">리스크 관리 스위트</h2>
              <p className="text-gray-400">실시간 리스크 모니터링 및 관리 시스템</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* 전체 리스크 레벨 */}
            <div className={`px-6 py-3 rounded-lg ${getRiskColor(riskLevel)}`}>
              <div className="text-xs opacity-70">리스크 레벨</div>
              <div className="text-2xl font-bold uppercase">{riskLevel}</div>
            </div>

            {/* 리스크 점수 */}
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="text-gray-400 text-xs">총 리스크 점수</div>
              <div className="text-2xl font-bold text-white flex items-center gap-2">
                <FaTachometerAlt className="text-red-400" />
                {riskMetrics.totalRisk.toFixed(0)}/100
              </div>
            </div>
          </div>
        </div>

        {/* 주요 리스크 지표 */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <div className="bg-gray-800/50 rounded-lg p-3">
            <div className="text-gray-400 text-sm">VaR (95%)</div>
            <div className="text-xl font-bold text-orange-400">
              {riskMetrics.var95.toFixed(1)}%
            </div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3">
            <div className="text-gray-400 text-sm">CVaR (95%)</div>
            <div className="text-xl font-bold text-red-400">
              {riskMetrics.cvar95.toFixed(1)}%
            </div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3">
            <div className="text-gray-400 text-sm">최대 손실</div>
            <div className="text-xl font-bold text-red-500">
              {riskMetrics.maxDrawdown.toFixed(1)}%
            </div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3">
            <div className="text-gray-400 text-sm">현재 손실</div>
            <div className="text-xl font-bold text-yellow-400">
              {riskMetrics.currentDrawdown.toFixed(1)}%
            </div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3">
            <div className="text-gray-400 text-sm">샤프 비율</div>
            <div className="text-xl font-bold text-blue-400">
              {riskMetrics.sharpeRatio.toFixed(2)}
            </div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3">
            <div className="text-gray-400 text-sm">베타</div>
            <div className="text-xl font-bold text-purple-400">
              {riskMetrics.beta.toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {/* 리스크 경고 */}
      {riskLevel === 'high' || riskLevel === 'critical' ? (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-6 p-4 rounded-lg border ${
            riskLevel === 'critical' 
              ? 'bg-red-900/20 border-red-500/50' 
              : 'bg-orange-900/20 border-orange-500/50'
          }`}
        >
          <div className="flex items-start gap-3">
            <FaExclamationTriangle className={`text-xl mt-1 ${
              riskLevel === 'critical' ? 'text-red-400' : 'text-orange-400'
            }`} />
            <div className="flex-1">
              <h4 className={`font-bold mb-1 ${
                riskLevel === 'critical' ? 'text-red-400' : 'text-orange-400'
              }`}>
                {riskLevel === 'critical' ? '긴급 리스크 경고' : '높은 리스크 감지'}
              </h4>
              <p className="text-gray-300 text-sm">
                포트폴리오의 리스크 수준이 {riskLevel === 'critical' ? '위험' : '높은'} 수준에 도달했습니다. 
                즉시 포지션 조정이나 헤징 전략 실행을 권장합니다.
              </p>
              <div className="flex gap-3 mt-3">
                <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm">
                  긴급 리스크 감소
                </button>
                <button className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm">
                  헤징 전략 실행
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      ) : null}

      {/* 메인 탭 */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-8 w-full bg-gray-800/50 p-1">
          <TabsTrigger value="monitor" className="flex items-center gap-2">
            <FaTachometerAlt className="text-sm" />
            실시간 모니터
          </TabsTrigger>
          <TabsTrigger value="positions" className="flex items-center gap-2">
            <FaBalanceScale className="text-sm" />
            포지션 분석
          </TabsTrigger>
          <TabsTrigger value="market" className="flex items-center gap-2">
            <FaChartLine className="text-sm" />
            시장 리스크
          </TabsTrigger>
          <TabsTrigger value="var" className="flex items-center gap-2">
            <FaShieldAlt className="text-sm" />
            VaR 계산기
          </TabsTrigger>
          <TabsTrigger value="stress" className="flex items-center gap-2">
            <FaExclamationTriangle className="text-sm" />
            스트레스 테스트
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex items-center gap-2">
            <FaBell className="text-sm" />
            알림 시스템
          </TabsTrigger>
          <TabsTrigger value="drawdown" className="flex items-center gap-2">
            <FaHistory className="text-sm" />
            손실 분석
          </TabsTrigger>
          <TabsTrigger value="hedging" className="flex items-center gap-2">
            <FaLock className="text-sm" />
            헤징 전략
          </TabsTrigger>
        </TabsList>

        <TabsContent value="monitor" className="mt-6">
          <RealTimeRiskMonitor 
            riskMetrics={riskMetrics}
            positions={positions}
          />
        </TabsContent>

        <TabsContent value="positions" className="mt-6">
          <PositionRiskAnalyzer 
            positions={positions}
            totalCapital={100000}
          />
        </TabsContent>

        <TabsContent value="market" className="mt-6">
          <MarketRiskDashboard />
        </TabsContent>

        <TabsContent value="var" className="mt-6">
          <VaRCalculator 
            positions={positions}
            confidence={95}
          />
        </TabsContent>

        <TabsContent value="stress" className="mt-6">
          <StressTestingModule 
            portfolio={positions}
          />
        </TabsContent>

        <TabsContent value="alerts" className="mt-6">
          <RiskAlertSystem 
            alerts={alerts}
            onUpdateAlerts={setAlerts}
          />
        </TabsContent>

        <TabsContent value="drawdown" className="mt-6">
          <DrawdownAnalysis />
        </TabsContent>

        <TabsContent value="hedging" className="mt-6">
          <HedgingStrategies 
            positions={positions}
            riskMetrics={riskMetrics}
          />
        </TabsContent>
      </Tabs>

      {/* AI 추천 섹션 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-6 bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-lg p-6 border border-purple-500/30"
      >
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <GiArtificialIntelligence className="text-purple-400" />
          AI 리스크 관리 추천
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h4 className="text-purple-400 font-semibold mb-2">포지션 조정</h4>
            <p className="text-gray-400 text-sm">
              SOLUSDT 숏 포지션의 레버리지를 5x에서 3x로 낮추어 리스크를 20% 감소시키세요.
            </p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h4 className="text-blue-400 font-semibold mb-2">헤징 권장</h4>
            <p className="text-gray-400 text-sm">
              포트폴리오 베타가 1.1로 높습니다. S&P 500 인버스 ETF로 시장 리스크를 헤징하세요.
            </p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h4 className="text-green-400 font-semibold mb-2">분산 투자</h4>
            <p className="text-gray-400 text-sm">
              암호화폐 비중이 90%입니다. 전통 자산을 10-20% 추가하여 포트폴리오를 다각화하세요.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}