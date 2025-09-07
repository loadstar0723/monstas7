'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FaCalculator, FaDollarSign, FaChartLine, FaExclamationTriangle } from 'react-icons/fa'
import { apiClient } from '../../lib/api'
import WebSocketManager from '../../lib/websocketManager'
import { config } from '@/lib/config'

interface ProfitCalculatorProps {
  symbol?: string
  userId?: string
}

/**
 * 수익 계산기 컴포넌트
 * 실제 포지션 데이터와 실시간 가격 기반 계산
 */
export default function ProfitCalculator({ 
  symbol = 'BTC',
  userId
}: ProfitCalculatorProps) {
  const [capital, setCapital] = useState(10000)
  const [leverage, setLeverage] = useState(1)
  const [entryPrice, setEntryPrice] = useState(0)
  const [stopLoss, setStopLoss] = useState(0)
  const [targets, setTargets] = useState<number[]>([])
  const [currentPrice, setCurrentPrice] = useState(0)
  const [positionSize, setPositionSize] = useState(0)
  const [riskAmount, setRiskAmount] = useState(0)
  const [potentialProfit, setPotentialProfit] = useState<number[]>([])
  const [potentialLoss, setPotentialLoss] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const wsManager = WebSocketManager.getInstance()
    
    // WebSocket 실시간 가격 구독
    const handleWebSocketData = (data: any) => {
      const symbolData = data.prices.find((p: any) => p.symbol === symbol)
      if (symbolData) {
        setCurrentPrice(symbolData.price)
        if (!entryPrice) {
          setEntryPrice(symbolData.price)
          setStopLoss(symbolData.price * config.decimals.value95) // 기본 ${config.percentage.value5} 손절
          setTargets([symbolData.price * 1.05, symbolData.price * 1.1]) // 기본 목표가
        }
        setLoading(false)
      }
    }

    wsManager.subscribe(handleWebSocketData)
    
    return () => {
      wsManager.unsubscribe(handleWebSocketData)
    }
  }, [symbol, entryPrice])

  useEffect(() => {
    if (entryPrice > 0 && stopLoss > 0 && targets.length > 0) {
      calculateProfitLoss()
    }
  }, [capital, leverage, entryPrice, stopLoss, targets])

  const calculateProfitLoss = async () => {
    try {
      // API 대신 직접 계산
      const position = capital * leverage
      const quantity = position / entryPrice
      
      // 손실 계산
      const loss = Math.abs(stopLoss - entryPrice) * quantity
      const lossPercent = (loss / capital) * 100
      
      // 이익 계산 (각 타겟별)
      const profits = targets.map(target => {
        const profit = Math.abs(target - entryPrice) * quantity
        return profit
      })
      
      // 상태 업데이트
      setPositionSize(position)
      setRiskAmount(loss)
      setPotentialLoss(loss)
      setPotentialProfit(profits)
    } catch (error) {
      console.error('수익 계산 실패:', error)
      // 폴백 계산
      const position = capital * leverage
      setPositionSize(position)

      const riskPercent = Math.abs((stopLoss - entryPrice) / entryPrice)
      const risk = position * riskPercent
      setRiskAmount(risk)
      setPotentialLoss(risk)

      const profits = targets.map(target => {
        const profitPercent = (target - entryPrice) / entryPrice
        return position * profitPercent
      })
      setPotentialProfit(profits)
    }
  }

  const riskRewardRatio = (potentialProfit[0] || 0) / (riskAmount || 1)
  const breakEvenWinRate = (1 / (1 + riskRewardRatio)) * 100

  // Kelly Criterion 계산 (최적 베팅 크기)
  const winRate = config.decimals.value6 // 가정: ${config.percentage.value60} 승률
  const kellyPercent = ((winRate * riskRewardRatio - (1 - winRate)) / riskRewardRatio) * 100

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 border border-green-500/30">
      {/* 헤더 */}
      <div className="flex items-center gap-3 mb-6">
        <FaCalculator className="text-green-400 text-2xl" />
        <h3 className="text-xl font-bold text-white">수익 계산기</h3>
      </div>

      {/* 입력 섹션 */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="text-sm text-gray-400 mb-2 block">투자 자본 (USDT)</label>
          <input
            type="number"
            value={capital}
            onChange={(e) => setCapital(Number(e.target.value))}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-green-500 focus:outline-none"
            min="100"
            step="100"
          />
        </div>
        
        <div>
          <label className="text-sm text-gray-400 mb-2 block">레버리지</label>
          <div className="flex gap-2">
            {[1, 2, 3, 5, 10].map(lev => (
              <button
                key={lev}
                onClick={() => setLeverage(lev)}
                className={`flex-1 py-2 rounded-lg font-medium transition-all ${
                  leverage === lev 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {lev}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 포지션 정보 */}
      <div className="bg-gray-800/50 rounded-lg p-4 mb-6 border border-gray-700">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-gray-400 mb-1">총 포지션 크기</div>
            <div className="text-2xl font-bold text-white">
              ${positionSize.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500">
              = ${capital} × {leverage}x
            </div>
          </div>
          
          <div>
            <div className="text-sm text-gray-400 mb-1">필요 코인 수량</div>
            <div className="text-2xl font-bold text-yellow-400">
              {(positionSize / entryPrice).toFixed(4)} {symbol}
            </div>
            <div className="text-xs text-gray-500">
              @ ${entryPrice.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* 수익/손실 계산 */}
      <div className="space-y-4 mb-6">
        {/* 손실 (손절) */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-red-900/20 rounded-lg p-4 border border-red-500/30"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FaExclamationTriangle className="text-red-400" />
              <span className="text-red-400 font-medium">최대 손실 (손절)</span>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold text-red-400">
                -${potentialLoss.toFixed(2)}
              </div>
              <div className="text-sm text-gray-400">
                -{((potentialLoss / capital) * 100).toFixed(2)}% of capital
              </div>
            </div>
          </div>
        </motion.div>

        {/* 수익 (목표가) */}
        {targets.map((target, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: config.decimals.value1 * (index + 1) }}
            className="bg-green-900/20 rounded-lg p-4 border border-green-500/30"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FaChartLine className="text-green-400" />
                <span className="text-green-400 font-medium">목표 {index + 1}</span>
                <span className="text-xs text-gray-500">
                  (${target.toLocaleString()})
                </span>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-green-400">
                  +${(potentialProfit[index] || 0).toFixed(2)}
                </div>
                <div className="text-sm text-gray-400">
                  +{(((potentialProfit[index] || 0) / capital) * 100).toFixed(2)}% of capital
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* 리스크 관리 지표 */}
      <div className="bg-purple-900/20 rounded-lg p-4 border border-purple-500/30">
        <h4 className="text-sm font-bold text-purple-400 mb-3">리스크 관리 지표</h4>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-400">리스크/보상 비율</span>
            <span className={`text-sm font-bold ${
              riskRewardRatio >= 2 ? 'text-green-400' : 
              riskRewardRatio >= 1.5 ? 'text-yellow-400' : 'text-red-400'
            }`}>
              1:{riskRewardRatio.toFixed(2)}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-400">손익분기 승률</span>
            <span className="text-sm font-bold text-blue-400">
              {breakEvenWinRate.toFixed(1)}%
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-400">Kelly 최적 베팅</span>
            <span className="text-sm font-bold text-yellow-400">
              자본의 {Math.max(0, Math.min(25, kellyPercent)).toFixed(1)}%
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-400">청산 가격 (10x)</span>
            <span className="text-sm font-bold text-red-400">
              ${(entryPrice * (leverage === 10 ? config.decimals.value9 : 1 - config.decimals.value8/leverage)).toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* 추천 사항 */}
      <div className="mt-4 p-3 bg-gray-800/50 rounded-lg">
        <div className="flex items-start gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full mt-1.5 animate-pulse" />
          <p className="text-xs text-gray-300 leading-relaxed">
            <strong className="text-white">AI 추천:</strong> 
            {leverage > 3 ? ' 높은 레버리지는 위험합니다. 3x 이하를 권장합니다.' :
             riskRewardRatio < 1.5 ? ' 리스크 대비 보상이 낮습니다. 진입 재검토가 필요합니다.' :
             kellyPercent > 25 ? ' Kelly 기준 초과. 자본의 ${config.percentage.value25} 이하로 제한하세요.' :
             ' 적절한 리스크 관리 설정입니다. 계획대로 진행하세요.'}
          </p>
        </div>
      </div>
    </div>
  )
}