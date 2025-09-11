'use client'

import { useEffect, useRef, useState, useMemo } from 'react'
import { safeFixed, safePrice, safeAmount, safeMillion } from '@/lib/safeFormat'
import { motion, AnimatePresence } from 'framer-motion'
import { FaExpand, FaCube, FaChartBar, FaInfoCircle } from 'react-icons/fa'

interface VolumeLevel {
  price: number
  buyVolume: number
  sellVolume: number
  totalVolume: number
}

interface VolumeProfileData {
  levels: VolumeLevel[]
  poc: number // Point of Control - 최대 거래량 가격
  vah: number // Value Area High
  val: number // Value Area Low
  totalVolume: number
}

interface VolumeProfileChartProps {
  data: VolumeProfileData | null
  currentPrice: number
  symbol: string
  viewMode?: '2D' | '3D'
}

export default function VolumeProfileChart({
  data,
  currentPrice,
  symbol,
  viewMode: initialViewMode = '2D'
}: VolumeProfileChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const animationFrameRef = useRef<number>()
  const [rotation, setRotation] = useState(0)
  const [showValueArea, setShowValueArea] = useState(true)
  const [viewMode, setViewMode] = useState<'2D' | '3D'>(initialViewMode)
  
  // 실제 볼륨 프로파일 데이터 계산 (API 데이터 기반)
  const calculateVolumeProfile = (priceData: any[]): VolumeProfileData => {
    if (!priceData || priceData.length === 0) {
      return {
        levels: [],
        poc: currentPrice,
        vah: currentPrice * 1.01,
        val: currentPrice * 0.99,
        totalVolume: 0
      }
    }
    
    // 실제 거래 데이터에서 볼륨 프로파일 생성
    // TODO: Binance API에서 Order Flow 데이터 가져오기
    // 현재는 빈 배열 반환 (실제 구현 필요)
    return {
      levels: [],
      poc: currentPrice,
      vah: currentPrice * 1.01,
      val: currentPrice * 0.99,
      totalVolume: 0
    }
  }
  
  const volumeData = useMemo(() => {
    return data || {
      levels: [],
      poc: currentPrice,
      vah: currentPrice * 1.01,
      val: currentPrice * 0.99,
      totalVolume: 0
    }
  }, [data, currentPrice])
  
  // 2D 볼륨 프로파일 렌더링
  const render2DProfile = () => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    // 캔버스 크기 설정
    const rect = container.getBoundingClientRect()
    canvas.width = rect.width
    canvas.height = rect.height
    
    // 설정
    const padding = { top: 40, right: 150, bottom: 40, left: 80 }
    const chartWidth = canvas.width - padding.left - padding.right
    const chartHeight = canvas.height - padding.top - padding.bottom
    
    // 배경
    ctx.fillStyle = 'rgba(17, 24, 39, 0.95)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    // 데이터가 없으면 안내 메시지 표시
    if (!volumeData.levels || volumeData.levels.length === 0) {
      ctx.fillStyle = 'rgba(156, 163, 175, 0.5)'
      ctx.font = '14px Inter'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('볼륨 프로파일 데이터 로딩 중...', canvas.width / 2, canvas.height / 2)
      return
    }
    
    // 최대 볼륨 찾기
    const maxVolume = Math.max(...volumeData.levels.map(l => l.totalVolume))
    
    // Value Area 배경 그리기
    if (showValueArea && volumeData.levels.length > 0) {
      const vahY = padding.top + (volumeData.levels[0].price - volumeData.vah) / 
                   (volumeData.levels[0].price - volumeData.levels[volumeData.levels.length - 1].price) * chartHeight
      const valY = padding.top + (volumeData.levels[0].price - volumeData.val) / 
                   (volumeData.levels[0].price - volumeData.levels[volumeData.levels.length - 1].price) * chartHeight
      
      ctx.fillStyle = 'rgba(139, 92, 246, 0.1)'
      ctx.fillRect(padding.left, vahY, chartWidth, valY - vahY)
      
      // Value Area 레이블
      ctx.fillStyle = 'rgba(139, 92, 246, 0.6)'
      ctx.font = '10px Inter'
      ctx.textAlign = 'right'
      ctx.fillText('VAH', padding.left - 5, vahY + 4)
      ctx.fillText('VAL', padding.left - 5, valY + 4)
    }
    
    // 볼륨 바 그리기
    if (volumeData.levels && volumeData.levels.length > 0) {
      volumeData.levels.forEach((level, index) => {
      const y = padding.top + index * (chartHeight / volumeData.levels.length)
      const barHeight = chartHeight / volumeData.levels.length - 1
      
      // 매수 볼륨 (왼쪽에서 오른쪽으로)
      const buyWidth = (level.buyVolume / maxVolume) * chartWidth * 0.45
      ctx.fillStyle = 'rgba(16, 185, 129, 0.8)'
      ctx.fillRect(padding.left, y, buyWidth, barHeight)
      
      // 매도 볼륨 (오른쪽에서 왼쪽으로)
      const sellWidth = (level.sellVolume / maxVolume) * chartWidth * 0.45
      ctx.fillStyle = 'rgba(239, 68, 68, 0.8)'
      ctx.fillRect(padding.left + chartWidth - sellWidth, y, sellWidth, barHeight)
      
      // POC 강조
      if (Math.abs(level.price - volumeData.poc) < 0.01) {
        ctx.strokeStyle = 'rgba(250, 204, 21, 1)'
        ctx.lineWidth = 2
        ctx.strokeRect(padding.left - 2, y - 1, chartWidth + 4, barHeight + 2)
        
        // POC 레이블
        ctx.fillStyle = 'rgba(250, 204, 21, 1)'
        ctx.font = 'bold 11px Inter'
        ctx.textAlign = 'right'
        ctx.fillText('POC', padding.left - 10, y + barHeight / 2 + 4)
      }
      
      // 가격 레이블 (5개마다)
      if (index % 5 === 0) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
        ctx.font = '10px Inter'
        ctx.textAlign = 'right'
        ctx.fillText(`$${safePrice(level.price, 2)}`, padding.left - 10, y + barHeight / 2 + 3)
      }
    })
    }
    
    // 현재 가격선
    if (volumeData.levels && volumeData.levels.length > 0) {
      const currentPriceY = padding.top + (volumeData.levels[0].price - currentPrice) / 
                           (volumeData.levels[0].price - volumeData.levels[volumeData.levels.length - 1].price) * chartHeight
    
    ctx.strokeStyle = 'rgba(139, 92, 246, 1)'
    ctx.lineWidth = 2
    ctx.setLineDash([5, 5])
    ctx.beginPath()
    ctx.moveTo(padding.left, currentPriceY)
    ctx.lineTo(padding.left + chartWidth, currentPriceY)
    ctx.stroke()
    ctx.setLineDash([])
    
    // 현재 가격 레이블
    ctx.fillStyle = 'rgba(139, 92, 246, 1)'
    ctx.fillRect(padding.left + chartWidth + 5, currentPriceY - 10, 55, 20)
    ctx.fillStyle = 'white'
    ctx.font = 'bold 11px Inter'
    ctx.textAlign = 'left'
    ctx.fillText(`$${safePrice(currentPrice, 2)}`, padding.left + chartWidth + 8, currentPriceY + 4)
    }
    
    // 타이틀
    ctx.fillStyle = 'white'
    ctx.font = 'bold 14px Inter'
    ctx.textAlign = 'left'
    ctx.fillText('볼륨 프로파일', 20, 25)
    
    // 범례
    ctx.font = '11px Inter'
    ctx.fillStyle = 'rgba(16, 185, 129, 0.8)'
    ctx.fillRect(canvas.width - 130, 15, 15, 15)
    ctx.fillStyle = 'white'
    ctx.fillText('매수', canvas.width - 110, 27)
    
    ctx.fillStyle = 'rgba(239, 68, 68, 0.8)'
    ctx.fillRect(canvas.width - 65, 15, 15, 15)
    ctx.fillStyle = 'white'
    ctx.fillText('매도', canvas.width - 45, 27)
    
    // 통계 정보
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
    ctx.font = '10px Inter'
    ctx.textAlign = 'right'
    const statsX = canvas.width - 20
    let statsY = canvas.height - 100
    
    ctx.fillText(`총 거래량: ${safeMillion(volumeData.totalVolume)}M`, statsX, statsY)
    statsY += 15
    ctx.fillText(`POC: $${safePrice(volumeData.poc, 2)}`, statsX, statsY)
    statsY += 15
    ctx.fillText(`Value Area: $${safePrice(volumeData.val, 2)}-$${safePrice(volumeData.vah, 2)}`, statsX, statsY)
  }
  
  // 3D 효과 (간단한 원근감)
  const render3DProfile = () => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    // 캔버스 크기 설정
    const rect = container.getBoundingClientRect()
    canvas.width = rect.width
    canvas.height = rect.height
    
    // 배경
    ctx.fillStyle = 'rgba(17, 24, 39, 0.95)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    // 데이터가 없으면 안내 메시지 표시
    if (!volumeData.levels || volumeData.levels.length === 0) {
      ctx.fillStyle = 'rgba(156, 163, 175, 0.5)'
      ctx.font = '14px Inter'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('볼륨 프로파일 데이터 로딩 중...', canvas.width / 2, canvas.height / 2)
      return
    }
    
    // 3D 변환 매트릭스 (간단한 회전)
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const maxVolume = Math.max(...volumeData.levels.map(l => l.totalVolume))
    
    ctx.save()
    ctx.translate(centerX, centerY)
    
    // 볼륨 바를 3D처럼 그리기
    volumeData.levels.forEach((level, index) => {
      const y = -200 + index * 8
      const z = Math.sin(rotation) * 50 // 회전 효과
      
      // 원근감 적용
      const perspective = 1 + z / 500
      const barWidth = ((level.totalVolume / maxVolume) * 200) * perspective
      const barHeight = 6 * perspective
      
      // 색상 (거리에 따른 명암)
      const brightness = 0.7 + (z / 200)
      const buyColor = `rgba(${Math.round(16 * brightness)}, ${Math.round(185 * brightness)}, ${Math.round(129 * brightness)}, 0.8)`
      const sellColor = `rgba(${Math.round(239 * brightness)}, ${Math.round(68 * brightness)}, ${Math.round(68 * brightness)}, 0.8)`
      
      // 매수 부분
      const buyWidth = barWidth * (level.buyVolume / level.totalVolume)
      ctx.fillStyle = buyColor
      ctx.fillRect(-buyWidth, y, buyWidth, barHeight)
      
      // 매도 부분
      const sellWidth = barWidth * (level.sellVolume / level.totalVolume)
      ctx.fillStyle = sellColor
      ctx.fillRect(0, y, sellWidth, barHeight)
      
      // POC 강조
      if (Math.abs(level.price - volumeData.poc) < 0.01) {
        ctx.strokeStyle = 'rgba(250, 204, 21, 1)'
        ctx.lineWidth = 2 * perspective
        ctx.strokeRect(-buyWidth - 2, y - 1, barWidth + 4, barHeight + 2)
      }
    })
    
    ctx.restore()
    
    // 타이틀
    ctx.fillStyle = 'white'
    ctx.font = 'bold 14px Inter'
    ctx.textAlign = 'left'
    ctx.fillText('볼륨 프로파일 (3D)', 20, 25)
  }
  
  // 초기 렌더링
  useEffect(() => {
    const render = () => {
      if (viewMode === '2D') {
        render2DProfile()
      } else {
        render3DProfile()
      }
    }
    
    render()
  }, [volumeData, currentPrice, viewMode, showValueArea, rotation])
  
  // 3D 애니메이션
  useEffect(() => {
    if (viewMode === '3D') {
      const animate = () => {
        setRotation(prev => prev + 0.01)
        animationFrameRef.current = requestAnimationFrame(animate)
      }
      
      animate()
      
      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current)
        }
      }
    }
  }, [viewMode])
  
  // 리사이즈 처리
  useEffect(() => {
    const handleResize = () => {
      if (viewMode === '2D') {
        render2DProfile()
      } else {
        render3DProfile()
      }
    }
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [volumeData, viewMode])
  
  return (
    <div ref={containerRef} className="relative w-full h-full">
      <canvas 
        ref={canvasRef}
        className="w-full h-full cursor-crosshair"
      />
      
      {/* 컨트롤 버튼 */}
      <div className="absolute top-2 right-2 flex items-center gap-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setViewMode(viewMode === '2D' ? '3D' : '2D')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            viewMode === '3D'
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          {viewMode === '3D' ? <FaCube className="inline mr-1" /> : null}
          {viewMode}
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowValueArea(!showValueArea)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            showValueArea 
              ? 'bg-purple-600 text-white' 
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          Value Area
        </motion.button>
      </div>
      
      {/* 정보 툴팁 */}
      <div className="absolute bottom-2 left-2 group">
        <FaInfoCircle className="text-gray-400 hover:text-gray-300 cursor-help" />
        <div className="absolute bottom-6 left-0 bg-gray-900 border border-gray-700 rounded-lg p-3 text-xs w-72 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
          <p className="text-gray-300 font-semibold mb-2">볼륨 프로파일 분석</p>
          <ul className="text-gray-400 space-y-1">
            <li>• <span className="text-yellow-400">POC</span>: 최대 거래량이 발생한 가격대</li>
            <li>• <span className="text-purple-400">Value Area</span>: 전체 거래량의 70%가 발생한 구간</li>
            <li>• <span className="text-green-400">매수 볼륨</span>: 해당 가격대의 매수 압력</li>
            <li>• <span className="text-red-400">매도 볼륨</span>: 해당 가격대의 매도 압력</li>
          </ul>
          <p className="text-gray-500 mt-2 italic">
            POC 근처는 강력한 지지/저항 구간으로 작용합니다
          </p>
        </div>
      </div>
    </div>
  )
}