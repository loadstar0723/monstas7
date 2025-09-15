'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  FaBalanceScale, FaChartBar, FaCog, FaExclamationTriangle,
  FaInfoCircle, FaSyncAlt
} from 'react-icons/fa'
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Cell, RadialBarChart, RadialBar
} from 'recharts'

interface Asset {
  symbol: string
  volatility: number
  correlation: { [key: string]: number }
  currentWeight: number
  riskParityWeight: number
  riskContribution: number
  expectedReturn: number
}

interface PerformanceData {
  date: string
  traditional: number
  riskParity: number
  sp500: number
}

export default function RiskParityStrategy() {
  const [rebalanceFrequency, setRebalanceFrequency] = useState<'daily' | 'weekly' | 'monthly' | 'quarterly'>('monthly')
  const [leverageRatio, setLeverageRatio] = useState(1.5)
  const [targetVolatility, setTargetVolatility] = useState(0.10)
  
  const [assets] = useState<Asset[]>([
    {
      symbol: 'Stocks',
      volatility: 0.16,
      correlation: { Stocks: 1, Bonds: -0.2, Gold: 0.1, Real_Estate: 0.6, Commodities: 0.3 },
      currentWeight: 0.60,
      riskParityWeight: 0.25,
      riskContribution: 0.20,
      expectedReturn: 0.08
    },
    {
      symbol: 'Bonds',
      volatility: 0.05,
      correlation: { Stocks: -0.2, Bonds: 1, Gold: 0.3, Real_Estate: 0.1, Commodities: -0.1 },
      currentWeight: 0.30,
      riskParityWeight: 0.40,
      riskContribution: 0.20,
      expectedReturn: 0.03
    },
    {
      symbol: 'Gold',
      volatility: 0.15,
      correlation: { Stocks: 0.1, Bonds: 0.3, Gold: 1, Real_Estate: 0.2, Commodities: 0.5 },
      currentWeight: 0.05,
      riskParityWeight: 0.15,
      riskContribution: 0.20,
      expectedReturn: 0.05
    },
    {
      symbol: 'Real_Estate',
      volatility: 0.12,
      correlation: { Stocks: 0.6, Bonds: 0.1, Gold: 0.2, Real_Estate: 1, Commodities: 0.4 },
      currentWeight: 0.03,
      riskParityWeight: 0.12,
      riskContribution: 0.20,
      expectedReturn: 0.06
    },
    {
      symbol: 'Commodities',
      volatility: 0.20,
      correlation: { Stocks: 0.3, Bonds: -0.1, Gold: 0.5, Real_Estate: 0.4, Commodities: 1 },
      currentWeight: 0.02,
      riskParityWeight: 0.08,
      riskContribution: 0.20,
      expectedReturn: 0.04
    }
  ])

  const generatePerformanceData = (): PerformanceData[] => {
    const data: PerformanceData[] = []
    let traditional = 100
    let riskParity = 100
    let sp500 = 100
    
    for (let i = 0; i < 252; i++) { // 1년 거래일
      const tradReturn = (Math.random() - 0.48) * 0.02
      const rpReturn = (Math.random() - 0.48) * 0.01 * leverageRatio
      const spReturn = (Math.random() - 0.48) * 0.015
      
      traditional *= (1 + tradReturn)
      riskParity *= (1 + rpReturn)
      sp500 *= (1 + spReturn)
      
      data.push({
        date: `Day ${i + 1}`,
        traditional,
        riskParity,
        sp500
      })
    }
    
    return data
  }

  const [performanceData] = useState(generatePerformanceData())

  const riskContributionData = assets.map(asset => ({
    name: asset.symbol,
    traditional: asset.currentWeight * asset.volatility * 100,
    riskParity: asset.riskContribution * 100,
    target: 20
  }))

  const weightComparisonData = assets.map(asset => ({
    asset: asset.symbol,
    traditional: asset.currentWeight * 100,
    riskParity: asset.riskParityWeight * 100
  }))

  const correlationMatrix = assets.map(asset1 => 
    assets.map(asset2 => asset1.correlation[asset2.symbol] || 0)
  )

  const radialData = assets.map(asset => ({
    name: asset.symbol,
    value: asset.riskParityWeight * 100,
    fill: `hsl(${assets.indexOf(asset) * 72}, 70%, 50%)`
  }))

  const calculatePortfolioMetrics = () => {
    const tradVol = Math.sqrt(
      assets.reduce((sum, a1) => 
        sum + assets.reduce((s, a2) => 
          s + a1.currentWeight * a2.currentWeight * 
          a1.volatility * a2.volatility * 
          (a1.correlation[a2.symbol] || 0), 0
        ), 0
      )
    )
    
    const rpVol = targetVolatility
    
    const tradReturn = assets.reduce((sum, a) => 
      sum + a.currentWeight * a.expectedReturn, 0
    )
    
    const rpReturn = assets.reduce((sum, a) => 
      sum + a.riskParityWeight * a.expectedReturn, 0
    ) * leverageRatio
    
    return {
      traditional: { vol: tradVol, return: tradReturn, sharpe: tradReturn / tradVol },
      riskParity: { vol: rpVol, return: rpReturn, sharpe: rpReturn / rpVol }
    }
  }

  const metrics = calculatePortfolioMetrics()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <FaBalanceScale className="text-purple-400" />
          Risk Parity 전략
        </h3>
        <p className="text-gray-400">
          각 자산의 리스크 기여도를 균등하게 배분하여 더 안정적이고 균형잡힌 포트폴리오를 구성합니다
        </p>
      </div>

      {/* Risk Contribution Comparison */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-bold text-white mb-4">리스크 기여도 비교</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={riskContributionData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="name" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Tooltip
              contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
              labelStyle={{ color: '#9CA3AF' }}
              formatter={(value: any) => `${value.toFixed(1)}%`}
            />
            <Bar dataKey="traditional" fill="#6B7280" name="전통적 배분" />
            <Bar dataKey="riskParity" fill="#8B5CF6" name="Risk Parity" />
            <Bar dataKey="target" fill="#10B981" name="목표치" opacity={0.5} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Weight Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-bold text-white mb-4">가중치 분포</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weightComparisonData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis type="number" stroke="#9CA3AF" />
              <YAxis dataKey="asset" type="category" stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
                labelStyle={{ color: '#9CA3AF' }}
                formatter={(value: any) => `${value.toFixed(1)}%`}
              />
              <Bar dataKey="traditional" fill="#6B7280" name="전통적 배분" />
              <Bar dataKey="riskParity" fill="#8B5CF6" name="Risk Parity" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-bold text-white mb-4">Risk Parity 가중치</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="90%" data={radialData}>
              <RadialBar dataKey="value" fill="#8B5CF6" label={{ position: 'insideStart', fill: '#fff' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
                labelStyle={{ color: '#9CA3AF' }}
                formatter={(value: any) => `${value.toFixed(1)}%`}
              />
            </RadialBarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Performance Comparison */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-bold text-white mb-4">성과 비교 (1년)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={performanceData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="date" 
              stroke="#9CA3AF"
              interval={50}
            />
            <YAxis stroke="#9CA3AF" />
            <Tooltip
              contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
              labelStyle={{ color: '#9CA3AF' }}
              formatter={(value: any) => value.toFixed(2)}
            />
            <Line
              type="monotone"
              dataKey="traditional"
              stroke="#6B7280"
              strokeWidth={2}
              dot={false}
              name="전통적 60/40"
            />
            <Line
              type="monotone"
              dataKey="riskParity"
              stroke="#8B5CF6"
              strokeWidth={2}
              dot={false}
              name="Risk Parity"
            />
            <Line
              type="monotone"
              dataKey="sp500"
              stroke="#3B82F6"
              strokeWidth={1}
              strokeDasharray="5 5"
              dot={false}
              name="S&P 500"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Parameters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <FaCog className="text-gray-400" />
            전략 파라미터
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                리밸런싱 주기
              </label>
              <select
                value={rebalanceFrequency}
                onChange={(e) => setRebalanceFrequency(e.target.value as any)}
                className="w-full bg-gray-700 text-white px-3 py-2 rounded"
              >
                <option value="daily">일간</option>
                <option value="weekly">주간</option>
                <option value="monthly">월간</option>
                <option value="quarterly">분기</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">
                레버리지 비율
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="100"
                  max="300"
                  value={leverageRatio * 100}
                  onChange={(e) => setLeverageRatio(Number(e.target.value) / 100)}
                  className="flex-1"
                />
                <span className="text-white w-12">{leverageRatio.toFixed(1)}x</span>
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">
                목표 변동성 (연간)
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="5"
                  max="20"
                  value={targetVolatility * 100}
                  onChange={(e) => setTargetVolatility(Number(e.target.value) / 100)}
                  className="flex-1"
                />
                <span className="text-white w-12">{(targetVolatility * 100).toFixed(0)}%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-bold text-white mb-4">포트폴리오 메트릭</h3>
          
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold text-gray-400 mb-2">전통적 60/40</h4>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div>
                  <p className="text-gray-500">변동성</p>
                  <p className="text-white">{(metrics.traditional.vol * 100).toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-gray-500">수익률</p>
                  <p className="text-green-400">{(metrics.traditional.return * 100).toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-gray-500">샤프</p>
                  <p className="text-yellow-400">{metrics.traditional.sharpe.toFixed(2)}</p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-400 mb-2">Risk Parity</h4>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div>
                  <p className="text-gray-500">변동성</p>
                  <p className="text-white">{(metrics.riskParity.vol * 100).toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-gray-500">수익률</p>
                  <p className="text-green-400">{(metrics.riskParity.return * 100).toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-gray-500">샤프</p>
                  <p className="text-yellow-400">{metrics.riskParity.sharpe.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>

          <button className="w-full mt-4 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg flex items-center justify-center gap-2">
            <FaSyncAlt /> 리밸런싱 실행
          </button>
        </div>
      </div>

      {/* Warnings */}
      <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-4">
        <p className="text-yellow-400 text-sm flex items-start gap-2">
          <FaExclamationTriangle className="mt-0.5 flex-shrink-0" />
          Risk Parity 전략은 레버리지를 사용할 수 있으며, 이는 손실을 증폭시킬 수 있습니다.
          금리 상승기에는 채권 비중이 높아 성과가 저조할 수 있습니다.
        </p>
      </div>

      {/* Info */}
      <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-4">
        <p className="text-blue-400 text-sm flex items-start gap-2">
          <FaInfoCircle className="mt-0.5 flex-shrink-0" />
          Risk Parity는 각 자산의 리스크 기여도를 균등하게 만들어 분산 효과를 극대화합니다.
          전통적인 60/40 포트폴리오보다 더 안정적인 수익을 추구합니다.
        </p>
      </div>
    </div>
  )
}