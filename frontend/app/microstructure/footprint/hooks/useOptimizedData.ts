// 최적화된 데이터 관리 Hook
import { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import { FootprintCell, OrderFlowData, DeltaData } from '../types'
import { FOOTPRINT_CONFIG } from '../config/constants'

interface UseOptimizedDataProps {
  maxDataPoints?: number
  cleanupInterval?: number
}

export function useOptimizedData({ 
  maxDataPoints = 1000, 
  cleanupInterval = 30000 // 30초
}: UseOptimizedDataProps = {}) {
  
  // 데이터 상태
  const [footprintData, setFootprintData] = useState<Map<string, FootprintCell>>(new Map())
  const [orderFlow, setOrderFlow] = useState<OrderFlowData[]>([])
  const [deltaData, setDeltaData] = useState<DeltaData[]>([])
  
  // 성능 최적화를 위한 ref
  const dataCountRef = useRef({ footprint: 0, orderFlow: 0, delta: 0 })
  const lastCleanupRef = useRef(Date.now())
  
  // Footprint 데이터 추가 (중복 제거 및 최적화)
  const addFootprintData = useCallback((newData: FootprintCell) => {
    setFootprintData(prev => {
      const key = `${newData.time}-${newData.price}`
      const updated = new Map(prev)
      
      // 기존 데이터가 있으면 업데이트
      if (updated.has(key)) {
        const existing = updated.get(key)!
        updated.set(key, {
          ...existing,
          buyVolume: existing.buyVolume + newData.buyVolume,
          sellVolume: existing.sellVolume + newData.sellVolume,
          totalVolume: existing.totalVolume + newData.totalVolume,
          delta: existing.delta + newData.delta,
          imbalance: (existing.totalVolume + newData.totalVolume) > 0 
            ? (existing.delta + newData.delta) / (existing.totalVolume + newData.totalVolume) 
            : 0
        })
      } else {
        updated.set(key, newData)
      }
      
      // 데이터 크기 제한
      if (updated.size > maxDataPoints) {
        const entries = Array.from(updated.entries())
        const toDelete = entries.slice(0, entries.length - maxDataPoints)
        toDelete.forEach(([key]) => updated.delete(key))
      }
      
      dataCountRef.current.footprint = updated.size
      return updated
    })
  }, [maxDataPoints])
  
  // Order Flow 데이터 추가 (배치 처리 지원)
  const addOrderFlowData = useCallback((newData: OrderFlowData | OrderFlowData[]) => {
    setOrderFlow(prev => {
      const dataArray = Array.isArray(newData) ? newData : [newData]
      const updated = [...prev, ...dataArray]
      
      // 크기 제한
      const limited = updated.slice(-FOOTPRINT_CONFIG.MAX_ORDER_FLOW_RECORDS)
      dataCountRef.current.orderFlow = limited.length
      
      return limited
    })
  }, [])
  
  // Delta 데이터 추가
  const addDeltaData = useCallback((newData: DeltaData) => {
    setDeltaData(prev => {
      const updated = [...prev, newData]
      
      // 크기 제한
      const limited = updated.slice(-maxDataPoints)
      dataCountRef.current.delta = limited.length
      
      return limited
    })
  }, [maxDataPoints])
  
  // 메모리 최적화를 위한 데이터 정리
  const cleanupOldData = useCallback(() => {
    const now = Date.now()
    const cutoffTime = now - 3600000 // 1시간 전
    
    // Footprint 데이터 정리
    setFootprintData(prev => {
      const updated = new Map(prev)
      const toDelete: string[] = []
      
      updated.forEach((cell, key) => {
        const [timeStr] = key.split('-')
        const [hours, minutes] = timeStr.split(':').map(Number)
        const cellTime = new Date()
        cellTime.setHours(hours, minutes, 0, 0)
        
        if (cellTime.getTime() < cutoffTime) {
          toDelete.push(key)
        }
      })
      
      toDelete.forEach(key => updated.delete(key))
      return updated
    })
    
    // Order Flow 데이터 정리
    setOrderFlow(prev => prev.filter(order => order.timestamp > cutoffTime))
    
    // Delta 데이터 정리
    setDeltaData(prev => {
      const recentData = prev.slice(-100) // 최근 100개만 유지
      return recentData
    })
    
    lastCleanupRef.current = now
  }, [])
  
  // 자동 정리 설정
  useEffect(() => {
    const interval = setInterval(() => {
      const timeSinceCleanup = Date.now() - lastCleanupRef.current
      if (timeSinceCleanup > cleanupInterval) {
        cleanupOldData()
      }
    }, cleanupInterval)
    
    return () => clearInterval(interval)
  }, [cleanupInterval, cleanupOldData])
  
  // 최적화된 데이터 접근
  const footprintArray = useMemo(() => 
    Array.from(footprintData.values()).sort((a, b) => {
      if (a.time === b.time) return a.price - b.price
      return a.time.localeCompare(b.time)
    }), 
    [footprintData]
  )
  
  // 데이터 통계
  const dataStats = useMemo(() => ({
    footprintCount: dataCountRef.current.footprint,
    orderFlowCount: dataCountRef.current.orderFlow,
    deltaCount: dataCountRef.current.delta,
    totalMemory: (dataCountRef.current.footprint * 100 + 
                 dataCountRef.current.orderFlow * 50 + 
                 dataCountRef.current.delta * 30) / 1024 // KB 추정
  }), [footprintData, orderFlow, deltaData])
  
  // 데이터 리셋
  const resetData = useCallback(() => {
    setFootprintData(new Map())
    setOrderFlow([])
    setDeltaData([])
    dataCountRef.current = { footprint: 0, orderFlow: 0, delta: 0 }
  }, [])
  
  return {
    // 데이터
    footprintData: footprintArray,
    orderFlow,
    deltaData,
    
    // 데이터 추가 함수
    addFootprintData,
    addOrderFlowData,
    addDeltaData,
    
    // 유틸리티
    cleanupOldData,
    resetData,
    dataStats
  }
}