'use client'

import { FaChartLine, FaBalanceScale, FaCalculator, FaLightbulb } from 'react-icons/fa'
import { safeFixed } from '@/lib/safeFormat'

interface PinBarStrategyProps {
  symbol: string
  currentPrice: number
}

export default function PinBarStrategy({ symbol, currentPrice }: PinBarStrategyProps) {
  // 전략 계산
  const calculateStrategy = () => {
    const accountBalance = 10000 // 예시 잔고
    const riskPercent = 2 // 리스크 2%
    const riskAmount = accountBalance * (riskPercent / 100)
    
    // 예시 핀 바 기준
    const pinBarHigh = currentPrice * 1.02
    const pinBarLow = currentPrice * 0.98
    const range = pinBarHigh - pinBarLow
    
    // Bullish 전략
    const bullishEntry = currentPrice
    const bullishStop = pinBarLow - (range * 0.1)
    const bullishTarget1 = bullishEntry + (range * 1.5)
    const bullishTarget2 = bullishEntry + (range * 3)
    const bullishRisk = bullishEntry - bullishStop
    const bullishPositionSize = riskAmount / bullishRisk
    
    // Bearish 전략
    const bearishEntry = currentPrice
    const bearishStop = pinBarHigh + (range * 0.1)
    const bearishTarget1 = bearishEntry - (range * 1.5)
    const bearishTarget2 = bearishEntry - (range * 3)
    const bearishRisk = bearishStop - bearishEntry
    const bearishPositionSize = riskAmount / bearishRisk
    
    return {
      bullish: {
        entry: bullishEntry,
        stop: bullishStop,
        target1: bullishTarget1,
        target2: bullishTarget2,
        risk: bullishRisk,
        positionSize: bullishPositionSize
      },
      bearish: {
        entry: bearishEntry,
        stop: bearishStop,
        target1: bearishTarget1,
        target2: bearishTarget2,
        risk: bearishRisk,
        positionSize: bearishPositionSize
      },
      riskAmount
    }
  }
  
  const strategy = calculateStrategy()

  return (
    <div className="bg-gray-800/50 rounded-xl border border-gray-700">
      <div className="p-4 border-b border-gray-700">
        <h3 className="text-lg font-bold text-white mb-3">🎯 핀 바 트레이딩 전략</h3>
      </div>
      
      <div className="p-4 space-y-6">
        {/* Bullish 전략 */}
        <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
          <h4 className="text-green-400 font-bold mb-3 flex items-center gap-2">
            <FaChartLine /> Bullish Pin Bar 전략
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div className="bg-gray-900/50 rounded-lg p-2">
              <p className="text-gray-400 text-xs mb-1">진입가</p>
              <p className="text-white font-bold">${safeFixed(strategy.bullish.entry, 2)}</p>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-2">
              <p className="text-gray-400 text-xs mb-1">손절가</p>
              <p className="text-red-400 font-bold">${safeFixed(strategy.bullish.stop, 2)}</p>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-2">
              <p className="text-gray-400 text-xs mb-1">목표가 1</p>
              <p className="text-green-400 font-bold">${safeFixed(strategy.bullish.target1, 2)}</p>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-2">
              <p className="text-gray-400 text-xs mb-1">목표가 2</p>
              <p className="text-green-400 font-bold">${safeFixed(strategy.bullish.target2, 2)}</p>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-2">
              <p className="text-gray-400 text-xs mb-1">리스크</p>
              <p className="text-yellow-400 font-bold">${safeFixed(strategy.bullish.risk, 2)}</p>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-2">
              <p className="text-gray-400 text-xs mb-1">포지션 크기</p>
              <p className="text-purple-400 font-bold">{safeFixed(strategy.bullish.positionSize, 2)}개</p>
            </div>
          </div>
        </div>
        
        {/* Bearish 전략 */}
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
          <h4 className="text-red-400 font-bold mb-3 flex items-center gap-2">
            <FaChartLine /> Bearish Pin Bar 전략
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div className="bg-gray-900/50 rounded-lg p-2">
              <p className="text-gray-400 text-xs mb-1">진입가</p>
              <p className="text-white font-bold">${safeFixed(strategy.bearish.entry, 2)}</p>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-2">
              <p className="text-gray-400 text-xs mb-1">손절가</p>
              <p className="text-red-400 font-bold">${safeFixed(strategy.bearish.stop, 2)}</p>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-2">
              <p className="text-gray-400 text-xs mb-1">목표가 1</p>
              <p className="text-green-400 font-bold">${safeFixed(strategy.bearish.target1, 2)}</p>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-2">
              <p className="text-gray-400 text-xs mb-1">목표가 2</p>
              <p className="text-green-400 font-bold">${safeFixed(strategy.bearish.target2, 2)}</p>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-2">
              <p className="text-gray-400 text-xs mb-1">리스크</p>
              <p className="text-yellow-400 font-bold">${safeFixed(strategy.bearish.risk, 2)}</p>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-2">
              <p className="text-gray-400 text-xs mb-1">포지션 크기</p>
              <p className="text-purple-400 font-bold">{safeFixed(strategy.bearish.positionSize, 2)}개</p>
            </div>
          </div>
        </div>
        
        {/* 리스크 관리 */}
        <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4">
          <h4 className="text-purple-400 font-bold mb-3 flex items-center gap-2">
            <FaBalanceScale /> 리스크 관리
          </h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">계좌 잔고</span>
              <span className="text-white font-medium">$10,000</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">리스크 비율</span>
              <span className="text-yellow-400 font-medium">2%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">거래당 최대 손실</span>
              <span className="text-red-400 font-medium">${safeFixed(strategy.riskAmount, 2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">권장 레버리지</span>
              <span className="text-purple-400 font-medium">2-3x</span>
            </div>
          </div>
        </div>
        
        {/* 실행 팁 */}
        <div className="bg-gray-900/50 rounded-lg p-4">
          <h4 className="text-gray-300 font-bold mb-3 flex items-center gap-2">
            <FaLightbulb className="text-yellow-400" /> 실행 팁
          </h4>
          <ul className="text-gray-400 text-sm space-y-2">
            <li>✓ 핀 바 형성 후 다음 캔들에서 진입 확인</li>
            <li>✓ 목표가 1 도달 시 50% 부분 익절</li>
            <li>✓ 이익 발생 시 스탑로스를 손익분기점으로 이동</li>
            <li>✓ 주요 지지/저항선 근처의 핀 바만 거래</li>
            <li>✓ 뉴스 발표 전후 30분은 거래 자제</li>
          </ul>
        </div>
      </div>
    </div>
  )
}