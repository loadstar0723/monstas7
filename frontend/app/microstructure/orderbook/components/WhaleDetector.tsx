'use client'

import { motion } from 'framer-motion'
import { FaFish, FaExclamationTriangle } from 'react-icons/fa'
import { safeFixed, safePrice, safeAmount } from '@/lib/safeFormat'

interface WhaleDetectorProps {
  orderbook: any
  stats: any
  symbol: string
}

export default function WhaleDetector({ orderbook, stats, symbol }: WhaleDetectorProps) {
  if (!stats || !orderbook) {
    return null
  }

  return (
    <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <FaFish className="text-blue-400" />
        고래 주문 감지
      </h3>

      {stats.wallsDetected && (stats.wallsDetected.bidWalls.length > 0 || stats.wallsDetected.askWalls.length > 0) ? (
        <div className="space-y-4">
          {stats.wallsDetected.bidWalls.length > 0 && (
            <div>
              <h4 className="text-green-400 font-semibold mb-2">매수벽 발견</h4>
              <div className="space-y-2">
                {stats.wallsDetected.bidWalls.slice(0, 3).map((wall: any, i: number) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-gray-400">${safePrice(wall.price, 2)}</span>
                    <span className="text-white">{safeAmount(wall.amount)} {symbol.replace('USDT', '')}</span>
                    <span className="text-green-400">${safeFixed(wall.total, 0)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {stats.wallsDetected.askWalls.length > 0 && (
            <div>
              <h4 className="text-red-400 font-semibold mb-2">매도벽 발견</h4>
              <div className="space-y-2">
                {stats.wallsDetected.askWalls.slice(0, 3).map((wall: any, i: number) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-gray-400">${safePrice(wall.price, 2)}</span>
                    <span className="text-white">{safeAmount(wall.amount)} {symbol.replace('USDT', '')}</span>
                    <span className="text-red-400">${safeFixed(wall.total, 0)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-4 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
            <div className="flex items-center gap-2 text-yellow-400 text-sm">
              <FaExclamationTriangle />
              <span className="font-semibold">주의: 대량 주문 근처</span>
            </div>
            <p className="text-xs text-gray-300 mt-1">
              벽 근처에서는 가격이 급변할 수 있습니다
            </p>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-400">
          <FaFish className="text-4xl mx-auto mb-3 opacity-50" />
          <p>현재 대량 주문이 감지되지 않았습니다</p>
        </div>
      )}
    </div>
  )
}