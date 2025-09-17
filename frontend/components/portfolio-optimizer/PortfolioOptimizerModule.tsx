'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FaChartPie, FaChartLine, FaCog, FaRocket, FaShieldAlt, FaBalanceScale, FaBrain, FaDownload } from 'react-icons/fa'
import { GiArtificialIntelligence } from 'react-icons/gi'
import dynamic from 'next/dynamic'

// 동적 임포트
const EfficientFrontier3D = dynamic(() => import('./EfficientFrontier3D'), { ssr: false })
const RiskParityOptimizer = dynamic(() => import('./RiskParityOptimizer'), { ssr: false })
const BlackLittermanModel = dynamic(() => import('./BlackLittermanModel'), { ssr: false })
const KellyCriterionCalculator = dynamic(() => import('./KellyCriterionCalculator'), { ssr: false })
const PortfolioAnalytics = dynamic(() => import('./PortfolioAnalytics'), { ssr: false })
const CorrelationMatrix = dynamic(() => import('./CorrelationMatrix'), { ssr: false })
const MonteCarloSimulation = dynamic(() => import('./MonteCarloSimulation'), { ssr: false })
const AssetAllocationChart = dynamic(() => import('./AssetAllocationChart'), { ssr: false })

interface Asset {
  symbol: string
  name: string
  category: 'crypto' | 'stock' | 'commodity' | 'bond' | 'forex'
  price: number
  weight: number
  expectedReturn: number
  volatility: number
  sharpeRatio: number
  beta: number
  correlation: Record<string, number>
}

interface Portfolio {
  id: string
  name: string
  assets: Asset[]
  totalValue: number
  expectedReturn: number
  volatility: number
  sharpeRatio: number
  maxDrawdown: number
  var95: number
  cvar95: number
  lastRebalance: Date
}

interface OptimizationResult {
  weights: Record<string, number>
  expectedReturn: number
  volatility: number
  sharpeRatio: number
  diversificationRatio: number
}

export default function PortfolioOptimizerModule() {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [optimizationMethod, setOptimizationMethod] = useState<'markowitz' | 'riskParity' | 'blackLitterman' | 'kelly'>('markowitz')
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | null>(null)
  const [riskTolerance, setRiskTolerance] = useState<'conservative' | 'moderate' | 'aggressive'>('moderate')
  const [targetReturn, setTargetReturn] = useState(15)
  const [constraints, setConstraints] = useState({
    minWeight: 0.05,
    maxWeight: 0.40,
    maxVolatility: 25,
    minSharpe: 1.0
  })

  // 샘플 포트폴리오 데이터
  useEffect(() => {
    const samplePortfolio: Portfolio = {
      id: 'portfolio_1',
      name: 'Balanced Crypto Portfolio',
      assets: [
        {
          symbol: 'BTC',
          name: 'Bitcoin',
          category: 'crypto',
          price: 65000,
          weight: 0.35,
          expectedReturn: 45,
          volatility: 65,
          sharpeRatio: 0.69,
          beta: 1.0,
          correlation: { BTC: 1, ETH: 0.85, BNB: 0.75, SOL: 0.8, ADA: 0.7, MATIC: 0.72 }
        },
        {
          symbol: 'ETH',
          name: 'Ethereum',
          category: 'crypto',
          price: 3500,
          weight: 0.25,
          expectedReturn: 55,
          volatility: 75,
          sharpeRatio: 0.73,
          beta: 1.2,
          correlation: { BTC: 0.85, ETH: 1, BNB: 0.82, SOL: 0.88, ADA: 0.8, MATIC: 0.85 }
        },
        {
          symbol: 'BNB',
          name: 'Binance Coin',
          category: 'crypto',
          price: 450,
          weight: 0.15,
          expectedReturn: 35,
          volatility: 55,
          sharpeRatio: 0.64,
          beta: 0.9,
          correlation: { BTC: 0.75, ETH: 0.82, BNB: 1, SOL: 0.78, ADA: 0.72, MATIC: 0.76 }
        },
        {
          symbol: 'SOL',
          name: 'Solana',
          category: 'crypto',
          price: 150,
          weight: 0.10,
          expectedReturn: 65,
          volatility: 85,
          sharpeRatio: 0.76,
          beta: 1.4,
          correlation: { BTC: 0.8, ETH: 0.88, BNB: 0.78, SOL: 1, ADA: 0.82, MATIC: 0.86 }
        },
        {
          symbol: 'ADA',
          name: 'Cardano',
          category: 'crypto',
          price: 0.65,
          weight: 0.10,
          expectedReturn: 40,
          volatility: 70,
          sharpeRatio: 0.57,
          beta: 1.1,
          correlation: { BTC: 0.7, ETH: 0.8, BNB: 0.72, SOL: 0.82, ADA: 1, MATIC: 0.78 }
        },
        {
          symbol: 'MATIC',
          name: 'Polygon',
          category: 'crypto',
          price: 1.2,
          weight: 0.05,
          expectedReturn: 50,
          volatility: 80,
          sharpeRatio: 0.63,
          beta: 1.3,
          correlation: { BTC: 0.72, ETH: 0.85, BNB: 0.76, SOL: 0.86, ADA: 0.78, MATIC: 1 }
        }
      ],
      totalValue: 100000,
      expectedReturn: 47.5,
      volatility: 68.3,
      sharpeRatio: 0.70,
      maxDrawdown: -35.2,
      var95: -15.8,
      cvar95: -22.4,
      lastRebalance: new Date()
    }

    setPortfolio(samplePortfolio)
  }, [])

  // 포트폴리오 최적화
  const optimizePortfolio = async () => {
    if (!portfolio) return

    setIsOptimizing(true)
    
    // 시뮬레이션된 최적화 프로세스
    setTimeout(() => {
      const result: OptimizationResult = {
        weights: {},
        expectedReturn: 0,
        volatility: 0,
        sharpeRatio: 0,
        diversificationRatio: 0
      }

      // 최적화 방법에 따른 가중치 계산
      if (optimizationMethod === 'markowitz') {
        // Modern Portfolio Theory
        result.weights = {
          BTC: 0.28,
          ETH: 0.22,
          BNB: 0.18,
          SOL: 0.15,
          ADA: 0.12,
          MATIC: 0.05
        }
        result.expectedReturn = 48.5
        result.volatility = 62.1
        result.sharpeRatio = 0.78
      } else if (optimizationMethod === 'riskParity') {
        // Risk Parity
        result.weights = {
          BTC: 0.15,
          ETH: 0.13,
          BNB: 0.18,
          SOL: 0.12,
          ADA: 0.14,
          MATIC: 0.28
        }
        result.expectedReturn = 44.2
        result.volatility = 58.5
        result.sharpeRatio = 0.76
      } else if (optimizationMethod === 'blackLitterman') {
        // Black-Litterman
        result.weights = {
          BTC: 0.32,
          ETH: 0.25,
          BNB: 0.15,
          SOL: 0.12,
          ADA: 0.10,
          MATIC: 0.06
        }
        result.expectedReturn = 49.8
        result.volatility = 64.3
        result.sharpeRatio = 0.77
      } else {
        // Kelly Criterion
        result.weights = {
          BTC: 0.30,
          ETH: 0.25,
          BNB: 0.20,
          SOL: 0.10,
          ADA: 0.10,
          MATIC: 0.05
        }
        result.expectedReturn = 47.8
        result.volatility = 63.5
        result.sharpeRatio = 0.75
      }

      result.diversificationRatio = 1.85

      setOptimizationResult(result)
      setIsOptimizing(false)
    }, 3000)
  }

  // 포트폴리오 리밸런싱 실행
  const executeRebalancing = () => {
    if (!optimizationResult || !portfolio) return

    // 새로운 가중치 적용
    const updatedAssets = portfolio.assets.map(asset => ({
      ...asset,
      weight: optimizationResult.weights[asset.symbol] || 0
    }))

    setPortfolio({
      ...portfolio,
      assets: updatedAssets,
      expectedReturn: optimizationResult.expectedReturn,
      volatility: optimizationResult.volatility,
      sharpeRatio: optimizationResult.sharpeRatio,
      lastRebalance: new Date()
    })

    // 알림
    alert('포트폴리오 리밸런싱이 완료되었습니다!')
  }

  return (
    <div className="w-full min-h-screen bg-gray-900 p-6">
      {/* 헤더 */}
      <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-lg p-6 mb-6 border border-blue-500/30">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600 rounded-lg">
              <FaChartPie className="text-3xl text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">포트폴리오 옵티마이저</h2>
              <p className="text-gray-400">AI 기반 최적 자산 배분 및 리스크 관리</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <select
              value={riskTolerance}
              onChange={(e) => setRiskTolerance(e.target.value as any)}
              className="bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700"
            >
              <option value="conservative">보수적</option>
              <option value="moderate">중도적</option>
              <option value="aggressive">공격적</option>
            </select>
            
            <button
              onClick={optimizePortfolio}
              disabled={isOptimizing}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50"
            >
              <FaRocket className={isOptimizing ? 'animate-pulse' : ''} />
              {isOptimizing ? '최적화 중...' : 'AI 최적화'}
            </button>
          </div>
        </div>

        {/* 포트폴리오 요약 */}
        {portfolio && (
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div className="bg-gray-800/50 rounded-lg p-3">
              <div className="text-gray-400 text-sm">총 자산</div>
              <div className="text-xl font-bold text-white">
                ${portfolio.totalValue.toLocaleString()}
              </div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3">
              <div className="text-gray-400 text-sm">예상 수익률</div>
              <div className="text-xl font-bold text-green-400">
                {portfolio.expectedReturn.toFixed(1)}%
              </div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3">
              <div className="text-gray-400 text-sm">변동성</div>
              <div className="text-xl font-bold text-yellow-400">
                {portfolio.volatility.toFixed(1)}%
              </div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3">
              <div className="text-gray-400 text-sm">샤프 비율</div>
              <div className="text-xl font-bold text-blue-400">
                {portfolio.sharpeRatio.toFixed(2)}
              </div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3">
              <div className="text-gray-400 text-sm">최대 손실</div>
              <div className="text-xl font-bold text-red-400">
                {portfolio.maxDrawdown.toFixed(1)}%
              </div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3">
              <div className="text-gray-400 text-sm">VaR(95%)</div>
              <div className="text-xl font-bold text-orange-400">
                {portfolio.var95.toFixed(1)}%
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 최적화 결과 */}
      {optimizationResult && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-green-900/20 to-blue-900/20 rounded-lg p-6 mb-6 border border-green-500/30"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <GiArtificialIntelligence className="text-green-400" />
              최적화 결과
            </h3>
            <button
              onClick={executeRebalancing}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <FaBalanceScale />
              리밸런싱 실행
            </button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <div className="text-gray-400 text-sm">예상 수익률</div>
              <div className="text-lg font-bold text-green-400">
                {optimizationResult.expectedReturn.toFixed(1)}%
              </div>
            </div>
            <div>
              <div className="text-gray-400 text-sm">변동성</div>
              <div className="text-lg font-bold text-yellow-400">
                {optimizationResult.volatility.toFixed(1)}%
              </div>
            </div>
            <div>
              <div className="text-gray-400 text-sm">샤프 비율</div>
              <div className="text-lg font-bold text-blue-400">
                {optimizationResult.sharpeRatio.toFixed(2)}
              </div>
            </div>
            <div>
              <div className="text-gray-400 text-sm">다각화 비율</div>
              <div className="text-lg font-bold text-purple-400">
                {optimizationResult.diversificationRatio.toFixed(2)}
              </div>
            </div>
            <div>
              <div className="text-gray-400 text-sm">최적화 방법</div>
              <div className="text-lg font-bold text-white capitalize">
                {optimizationMethod}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* 메인 탭 */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-8 w-full bg-gray-800/50 p-1">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <FaChartPie className="text-sm" />
            개요
          </TabsTrigger>
          <TabsTrigger value="frontier" className="flex items-center gap-2">
            <FaChartLine className="text-sm" />
            효율적 프론티어
          </TabsTrigger>
          <TabsTrigger value="correlation" className="flex items-center gap-2">
            <FaCog className="text-sm" />
            상관관계
          </TabsTrigger>
          <TabsTrigger value="riskparity" className="flex items-center gap-2">
            <FaBalanceScale className="text-sm" />
            리스크 패리티
          </TabsTrigger>
          <TabsTrigger value="blacklitterman" className="flex items-center gap-2">
            <FaBrain className="text-sm" />
            블랙-리터만
          </TabsTrigger>
          <TabsTrigger value="kelly" className="flex items-center gap-2">
            <FaRocket className="text-sm" />
            켈리 기준
          </TabsTrigger>
          <TabsTrigger value="montecarlo" className="flex items-center gap-2">
            <FaShieldAlt className="text-sm" />
            몬테카를로
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <FaChartLine className="text-sm" />
            분석
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <AssetAllocationChart 
            portfolio={portfolio} 
            optimizationResult={optimizationResult}
          />
        </TabsContent>

        <TabsContent value="frontier" className="mt-4">
          <EfficientFrontier3D 
            assets={portfolio?.assets || []}
            currentPortfolio={portfolio}
            optimizationResult={optimizationResult}
            constraints={constraints}
          />
        </TabsContent>

        <TabsContent value="correlation" className="mt-4">
          <CorrelationMatrix 
            assets={portfolio?.assets || []}
          />
        </TabsContent>

        <TabsContent value="riskparity" className="mt-4">
          <RiskParityOptimizer 
            portfolio={portfolio}
            onOptimize={setOptimizationResult}
          />
        </TabsContent>

        <TabsContent value="blacklitterman" className="mt-4">
          <BlackLittermanModel 
            portfolio={portfolio}
            marketViews={{}}
            onOptimize={setOptimizationResult}
          />
        </TabsContent>

        <TabsContent value="kelly" className="mt-4">
          <KellyCriterionCalculator 
            assets={portfolio?.assets || []}
            bankroll={portfolio?.totalValue || 100000}
          />
        </TabsContent>

        <TabsContent value="montecarlo" className="mt-4">
          <MonteCarloSimulation 
            portfolio={portfolio}
            timeHorizon={5}
            simulations={10000}
          />
        </TabsContent>

        <TabsContent value="analytics" className="mt-4">
          <PortfolioAnalytics 
            portfolio={portfolio}
          />
        </TabsContent>
      </Tabs>

      {/* 최적화 방법 선택 */}
      <div className="fixed bottom-6 right-6 bg-gray-800/90 backdrop-blur-sm rounded-lg p-4 border border-gray-700">
        <h4 className="text-white font-semibold mb-3">최적화 방법</h4>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              value="markowitz"
              checked={optimizationMethod === 'markowitz'}
              onChange={(e) => setOptimizationMethod(e.target.value as any)}
              className="text-blue-600"
            />
            <span className="text-gray-300">Markowitz (MPT)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              value="riskParity"
              checked={optimizationMethod === 'riskParity'}
              onChange={(e) => setOptimizationMethod(e.target.value as any)}
              className="text-blue-600"
            />
            <span className="text-gray-300">Risk Parity</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              value="blackLitterman"
              checked={optimizationMethod === 'blackLitterman'}
              onChange={(e) => setOptimizationMethod(e.target.value as any)}
              className="text-blue-600"
            />
            <span className="text-gray-300">Black-Litterman</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              value="kelly"
              checked={optimizationMethod === 'kelly'}
              onChange={(e) => setOptimizationMethod(e.target.value as any)}
              className="text-blue-600"
            />
            <span className="text-gray-300">Kelly Criterion</span>
          </label>
        </div>
      </div>
    </div>
  )
}