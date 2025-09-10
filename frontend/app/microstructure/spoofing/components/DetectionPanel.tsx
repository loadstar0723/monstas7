'use client'

import { useEffect, useState } from 'react'
import { FaEye, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa'

interface DetectionPanelProps {
  orderbook: any
  settings: any
}

export default function DetectionPanel({ orderbook, settings }: DetectionPanelProps) {
  const [detections, setDetections] = useState<any[]>([])
  
  useEffect(() => {
    if (!orderbook) return
    
    // 스푸핑 패턴 감지 로직
    const newDetections = []
    
    // 대량 주문 감지
    const largeOrders = [...(orderbook.bids || []), ...(orderbook.asks || [])].filter(
      order => order.amount > settings.wallMinSize
    )
    
    if (largeOrders.length > 0) {
      newDetections.push({
        type: 'large_order',
        severity: 'warning',
        message: `대량 주문 ${largeOrders.length}개 감지`,
        timestamp: Date.now()
      })
    }
    
    setDetections(newDetections.slice(0, 10))
  }, [orderbook, settings])
  
  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
      <div className="flex items-center gap-2 mb-4">
        <FaEye className="text-purple-400" />
        <h3 className="text-lg font-bold text-white">실시간 감지</h3>
      </div>
      
      <div className="space-y-2 max-h-[300px] overflow-y-auto">
        {detections.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <FaCheckCircle className="text-4xl mx-auto mb-2 text-green-500" />
            <p>현재 의심스러운 활동이 감지되지 않았습니다</p>
          </div>
        ) : (
          detections.map((detection, index) => (
            <div key={index} className="bg-gray-700/50 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <FaExclamationTriangle className="text-yellow-500 mt-1" />
                <div className="flex-1">
                  <p className="text-sm text-white">{detection.message}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(detection.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}