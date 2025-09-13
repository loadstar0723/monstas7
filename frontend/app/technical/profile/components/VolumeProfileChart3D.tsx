'use client'

import { useEffect, useRef, useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { formatPrice, formatVolume, formatPercentage } from '@/lib/formatters'

interface VolumeLevel {
  price: number
  buyVolume: number
  sellVolume: number
  totalVolume: number
  percentage: number
  time?: string
}

interface VolumeProfileData {
  levels: VolumeLevel[]
  poc: number
  vah: number
  val: number
  totalVolume: number
  buyVolume: number
  sellVolume: number
  hvnLevels: number[]
  lvnLevels: number[]
}

interface VolumeProfileChart3DProps {
  data: VolumeProfileData | null
  currentPrice: number
  symbol: string
  viewMode: '2D' | '3D'
  onViewModeChange: (mode: '2D' | '3D') => void
  isConnected?: boolean
}

export default function VolumeProfileChart3D({
  data,
  currentPrice,
  symbol,
  viewMode,
  onViewModeChange,
  isConnected = false
}: VolumeProfileChart3DProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const animationFrameRef = useRef<number>()
  
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [rotation, setRotation] = useState({ x: -0.3, y: 0.5 })
  const [zoom, setZoom] = useState(1.5)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  
  // 차트 설정
  const [settings, setSettings] = useState({
    showValueArea: true,
    showHVN: true,
    showLVN: true,
    showPOC: true,
    showGrid: true,
    colorScheme: 'default', // default, heat, monochrome
    transparency: 0.8
  })
  
  // 컬러 스킴 - 더 화려하고 현대적으로
  const colorSchemes = {
    default: {
      buy: 'rgba(16, 185, 129, 0.9)',
      sell: 'rgba(239, 68, 68, 0.9)',
      poc: 'rgba(250, 204, 21, 1)',
      valueArea: 'rgba(139, 92, 246, 0.15)',
      hvn: 'rgba(59, 130, 246, 0.7)',
      lvn: 'rgba(251, 146, 60, 0.7)',
      // 네온 글로우
      buyGlow: '#10b981',
      sellGlow: '#ef4444',
      pocGlow: '#fbbf24'
    },
    neon: {
      buy: 'rgba(0, 255, 127, 0.9)',
      sell: 'rgba(255, 0, 127, 0.9)',
      poc: 'rgba(255, 235, 59, 1)',
      valueArea: 'rgba(124, 58, 237, 0.2)',
      hvn: 'rgba(0, 188, 255, 0.8)',
      lvn: 'rgba(255, 152, 0, 0.8)',
      buyGlow: '#00ff7f',
      sellGlow: '#ff007f',
      pocGlow: '#ffeb3b'
    },
    cyberpunk: {
      buy: 'rgba(0, 255, 255, 0.9)',
      sell: 'rgba(255, 0, 255, 0.9)',
      poc: 'rgba(255, 255, 0, 1)',
      valueArea: 'rgba(138, 43, 226, 0.2)',
      hvn: 'rgba(50, 205, 50, 0.8)',
      lvn: 'rgba(255, 69, 0, 0.8)',
      buyGlow: '#00ffff',
      sellGlow: '#ff00ff',
      pocGlow: '#ffff00'
    }
  }
  
  const currentColors = colorSchemes[settings.colorScheme as keyof typeof colorSchemes]
  
  // 2D 렌더링 - 깔끔한 선형 스타일
  const render2D = () => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    // 캔버스 크기 설정
    const rect = container.getBoundingClientRect()
    canvas.width = rect.width * window.devicePixelRatio
    canvas.height = rect.height * window.devicePixelRatio
    canvas.style.width = `${rect.width}px`
    canvas.style.height = `${rect.height}px`
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    
    // 깨끗한 단색 배경
    ctx.fillStyle = '#0a0a0a'
    ctx.fillRect(0, 0, rect.width, rect.height)
    
    if (!data || !data.levels || data.levels.length === 0) {
      // 로딩 메시지
      ctx.fillStyle = 'rgba(156, 163, 175, 0.5)'
      ctx.font = '14px Inter'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('볼륨 프로파일 데이터를 기다리는 중...', rect.width / 2, rect.height / 2)
      return
    }
    
    // 차트 영역 설정 - 화면을 최대한 활용
    const padding = { top: 60, right: 100, bottom: 60, left: 80 }
    const chartWidth = rect.width - padding.left - padding.right
    const chartHeight = rect.height - padding.top - padding.bottom
    
    // 가격 범위 계산
    const prices = data.levels.map(l => l.price)
    const minPrice = Math.min(...prices)
    const maxPrice = Math.max(...prices)
    const priceRange = maxPrice - minPrice
    
    // 최대 볼륨 찾기
    const maxVolume = Math.max(...data.levels.map(l => l.totalVolume))
    
    // 그리드는 유지하되 더 깔끔하게
    
    // 섬세한 그리드
    if (settings.showGrid) {
      ctx.save()
      
      // 수평 그리드 (가격) - 더 많은 라인으로 섬세하게
      for (let i = 0; i <= 20; i++) {
        const y = padding.top + (i / 20) * chartHeight
        const price = maxPrice - (i / 20) * priceRange
        
        // 주요 라인과 보조 라인 구분
        if (i % 4 === 0) {
          ctx.strokeStyle = 'rgba(75, 85, 99, 0.3)'
          ctx.lineWidth = 0.5
          
          // 가격 레이블 - 주요 라인에만
          ctx.fillStyle = 'rgba(156, 163, 175, 0.7)'
          ctx.font = '10px Inter'
          ctx.textAlign = 'right'
          ctx.textBaseline = 'middle'
          ctx.fillText(formatPrice(price), padding.left - 10, y)
        } else {
          ctx.strokeStyle = 'rgba(75, 85, 99, 0.1)'
          ctx.lineWidth = 0.5
        }
        
        ctx.beginPath()
        ctx.moveTo(padding.left, y)
        ctx.lineTo(padding.left + chartWidth, y)
        ctx.stroke()
      }
      
      // 수직 그리드 - 섬세한 점선
      ctx.strokeStyle = 'rgba(75, 85, 99, 0.1)'
      ctx.setLineDash([2, 4])
      for (let i = 0; i <= 10; i++) {
        const x = padding.left + (i / 10) * chartWidth
        ctx.beginPath()
        ctx.moveTo(x, padding.top)
        ctx.lineTo(x, padding.top + chartHeight)
        ctx.stroke()
      }
      ctx.setLineDash([])
      
      ctx.restore()
    }
    
    // Value Area 배경 - 고급스러운 그라데이션
    if (settings.showValueArea && data.vah && data.val) {
      const vahY = padding.top + ((maxPrice - data.vah) / priceRange) * chartHeight
      const valY = padding.top + ((maxPrice - data.val) / priceRange) * chartHeight
      
      // 수직 그라데이션으로 깊이감 추가
      const vaGradient = ctx.createLinearGradient(0, vahY, 0, valY)
      vaGradient.addColorStop(0, 'rgba(139, 92, 246, 0.05)')
      vaGradient.addColorStop(0.5, 'rgba(139, 92, 246, 0.1)')
      vaGradient.addColorStop(1, 'rgba(139, 92, 246, 0.05)')
      
      ctx.fillStyle = vaGradient
      ctx.fillRect(padding.left, vahY, chartWidth, valY - vahY)
      
      // VAH/VAL 라인
      ctx.strokeStyle = 'rgba(139, 92, 246, 0.5)'
      ctx.lineWidth = 1
      ctx.setLineDash([5, 5])
      
      // VAH
      ctx.beginPath()
      ctx.moveTo(padding.left, vahY)
      ctx.lineTo(padding.left + chartWidth, vahY)
      ctx.stroke()
      
      // VAL
      ctx.beginPath()
      ctx.moveTo(padding.left, valY)
      ctx.lineTo(padding.left + chartWidth, valY)
      ctx.stroke()
      
      ctx.setLineDash([])
    }
    
    // 볼륨 바 그리기 - 깔끔한 선형 스타일
    data.levels.forEach((level, index) => {
      const y = padding.top + ((maxPrice - level.price) / priceRange) * chartHeight
      
      // 전체 바 너비 - 볼륨에 따라 동적으로 조절
      const volumeRatio = level.totalVolume / maxVolume
      const maxBarWidth = chartWidth * 0.7 // 화면을 더 채우도록 너비 증가
      const totalWidth = volumeRatio * maxBarWidth
      
      // 매수/매도 비율
      const buyRatio = level.totalVolume > 0 ? level.buyVolume / level.totalVolume : 0
      const sellRatio = level.totalVolume > 0 ? level.sellVolume / level.totalVolume : 0
      
      // 중앙 정렬 위치
      const centerX = padding.left + chartWidth * 0.5
      const startX = centerX - totalWidth / 2
      const buyWidth = totalWidth * buyRatio
      const sellWidth = totalWidth * sellRatio
      
      // 볼륨 중요도에 따른 불투명도
      const opacity = Math.max(0.3, Math.min(0.9, volumeRatio))
      
      ctx.save()
      
      // 얇은 수평선
      ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.1})`
      ctx.lineWidth = 0.5
      ctx.beginPath()
      ctx.moveTo(padding.left, y)
      ctx.lineTo(padding.left + chartWidth, y)
      ctx.stroke()
      
      // 매도 볼륨 (왼쪽부터) - 굵은 막대
      if (sellWidth > 0) {
        ctx.fillStyle = `rgba(239, 68, 68, ${opacity})`
        ctx.fillRect(startX, y - 12, sellWidth, 24)
      }
      
      // 매수 볼륨 (매도 볼륨 바로 옆) - 굵은 막대
      if (buyWidth > 0) {
        ctx.fillStyle = `rgba(16, 185, 129, ${opacity})`
        ctx.fillRect(startX + sellWidth, y - 12, buyWidth, 24)
      }
      
      // 볼륨 끝점 마커
      ctx.beginPath()
      ctx.arc(startX + totalWidth, y, 2, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(139, 92, 246, ${opacity})`
      ctx.fill()
      
      ctx.restore()
      
      // HVN/LVN 표시 - 굵은 막대에 맞게 조정
      if (settings.showHVN && data.hvnLevels.includes(level.price)) {
        ctx.strokeStyle = currentColors.hvn
        ctx.lineWidth = 2
        ctx.strokeRect(startX - 2, y - 14, totalWidth + 4, 28)
      }
      
      if (settings.showLVN && data.lvnLevels.includes(level.price)) {
        ctx.strokeStyle = currentColors.lvn
        ctx.lineWidth = 2
        ctx.setLineDash([3, 3])
        ctx.strokeRect(startX - 2, y - 14, totalWidth + 4, 28)
        ctx.setLineDash([])
      }
      
      // POC 강조 - 세련된 효과
      if (settings.showPOC && Math.abs(level.price - data.poc) < 0.01) {
        // 펄스 애니메이션 효과
        const pulse = Math.sin(Date.now() * 0.003) * 0.3 + 0.7
        
        ctx.save()
        ctx.shadowBlur = 20 * pulse
        ctx.shadowColor = currentColors.pocGlow || currentColors.poc
        
        // POC 하이라이트 바
        ctx.strokeStyle = currentColors.poc
        ctx.lineWidth = 2
        ctx.globalAlpha = pulse
        ctx.strokeRect(startX - 4, y - 14, totalWidth + 8, 28)
        
        // POC 레이블 - 깔끔한 스타일
        ctx.shadowBlur = 10
        ctx.fillStyle = currentColors.poc
        ctx.font = 'bold 11px Inter'
        ctx.textAlign = 'left'
        ctx.globalAlpha = 1
        ctx.fillText('POC', startX + totalWidth + 10, y)
        
        ctx.restore()
      }
      
      // 볼륨 정보 - 중요한 레벨만 섬세하게 표시
      if (level.percentage > 5 || Math.abs(level.price - data.poc) < 0.01) { // 5% 이상 또는 POC
        ctx.save()
        ctx.fillStyle = `rgba(156, 163, 175, ${opacity * 0.8})`
        ctx.font = '9px Inter'
        ctx.textAlign = 'left'
        
        // 가격
        ctx.fillText(
          formatPrice(level.price),
          padding.left + chartWidth + 10,
          y - 4
        )
        
        // 볼륨 퍼센티지
        ctx.fillStyle = `rgba(139, 92, 246, ${opacity * 0.6})`
        ctx.font = 'bold 8px Inter'
        ctx.fillText(
          `${level.percentage.toFixed(1)}%`,
          padding.left + chartWidth + 10,
          y + 4
        )
        ctx.restore()
      }
    })

    // 현재 가격 라인 - 깔끔한 스타일
    const currentPriceY = padding.top + ((maxPrice - currentPrice) / priceRange) * chartHeight
    
    ctx.save()
    // 단순한 점선
    ctx.strokeStyle = 'rgba(168, 85, 247, 0.8)'
    ctx.lineWidth = 1
    ctx.setLineDash([5, 5])
    ctx.beginPath()
    ctx.moveTo(padding.left, currentPriceY)
    ctx.lineTo(padding.left + chartWidth, currentPriceY)
    ctx.stroke()
    ctx.setLineDash([])
    
    // 현재 가격 레이블 - 단순한 스타일
    ctx.fillStyle = 'rgba(168, 85, 247, 0.1)'
    ctx.fillRect(padding.left + chartWidth + 10, currentPriceY - 10, 80, 20)
    
    ctx.strokeStyle = 'rgba(168, 85, 247, 0.5)'
    ctx.lineWidth = 1
    ctx.strokeRect(padding.left + chartWidth + 10, currentPriceY - 10, 80, 20)
    
    ctx.fillStyle = 'rgba(168, 85, 247, 1)'
    ctx.font = '12px Inter'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(formatPrice(currentPrice), padding.left + chartWidth + 50, currentPriceY)
    
    ctx.restore()

    // 범례
    const legendY = 30
    const legendItems = [
      { label: '매수', color: currentColors.buy },
      { label: '매도', color: currentColors.sell },
      { label: 'POC', color: currentColors.poc },
      { label: 'Value Area', color: currentColors.valueArea }
    ]
    
    let legendX = rect.width - 200
    legendItems.forEach((item) => {
      // 색상 박스
      ctx.fillStyle = item.color
      ctx.fillRect(legendX, legendY - 6, 12, 12)
      
      // 레이블
      ctx.fillStyle = 'rgba(229, 231, 235, 0.8)'
      ctx.font = '12px Inter'
      ctx.textAlign = 'left'
      ctx.fillText(item.label, legendX + 16, legendY)
      
      legendX += 80
    })
    
    // 제목 - 깔끔한 스타일
    ctx.save()
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
    ctx.font = '16px Inter'
    ctx.textAlign = 'left'
    ctx.fillText(`${symbol} Volume Profile`, 20, 30)
    
    // 실시간 표시
    if (isConnected) {
      ctx.fillStyle = 'rgba(16, 185, 129, 0.8)'
      ctx.font = '12px Inter'
      ctx.fillText('● LIVE', 250, 30)
    }
    ctx.restore()
    
    // 통계 정보
    const statsY = rect.height - 30
    ctx.fillStyle = 'rgba(156, 163, 175, 0.8)'
    ctx.font = '12px Inter'
    ctx.textAlign = 'left'
    ctx.fillText(
      `총 거래량: ${formatVolume(data.totalVolume)} | 매수: ${formatPercentage((data.buyVolume / data.totalVolume) * 100)}% | 매도: ${formatPercentage((data.sellVolume / data.totalVolume) * 100)}%`,
      20,
      statsY
    )
  }
  
  // 3D 렌더링 (화려한 pseudo-3D)
  const render3D = () => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    // 캔버스 설정
    const rect = container.getBoundingClientRect()
    canvas.width = rect.width * window.devicePixelRatio
    canvas.height = rect.height * window.devicePixelRatio
    canvas.style.width = `${rect.width}px`
    canvas.style.height = `${rect.height}px`
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    
    // 화려한 배경
    const bgGradient = ctx.createRadialGradient(rect.width/2, rect.height/2, 0, rect.width/2, rect.height/2, Math.max(rect.width, rect.height))
    bgGradient.addColorStop(0, 'rgba(10, 10, 20, 0.98)')
    bgGradient.addColorStop(0.3, 'rgba(15, 10, 30, 0.95)')
    bgGradient.addColorStop(0.6, 'rgba(20, 10, 40, 0.95)')
    bgGradient.addColorStop(1, 'rgba(5, 5, 15, 0.98)')
    ctx.fillStyle = bgGradient
    ctx.fillRect(0, 0, rect.width, rect.height)
    
    // 별 효과 - 피보나치 배열로 배치
    ctx.save()
    const fibSequence = [1, 1, 2, 3, 5, 8, 13, 21, 34]
    for (let i = 0; i < 50; i++) {
      const fibIndex = i % fibSequence.length
      const fibRatio = fibSequence[fibIndex] / 21 // 정규화
      
      const x = (rect.width * fibRatio * (i % 7) / 7) + (rect.width / 8)
      const y = (rect.height * (1 - fibRatio) * (i % 5) / 5) + (rect.height / 10)
      const size = 0.5 + fibRatio * 1.5
      const opacity = 0.1 + fibRatio * 0.4
      
      ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`
      ctx.beginPath()
      ctx.arc(x, y, size, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.restore()
    
    if (!data || !data.levels || data.levels.length === 0) {
      ctx.fillStyle = 'rgba(156, 163, 175, 0.5)'
      ctx.font = '14px Inter'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('볼륨 프로파일 데이터를 기다리는 중...', rect.width / 2, rect.height / 2)
      return
    }
    
    // 3D 변환 설정
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const scale = zoom
    const perspective = 800
    
    // 3D 큐브 형태로 볼륨 렌더링
    const depthLevels = 20 // 깊이 레벨
    const maxVolume = Math.max(...data.levels.map(l => l.totalVolume))
    
    // Z축 정렬을 위한 레벨 정렬
    const sortedLevels = [...data.levels].sort((a, b) => {
      // 회전에 따른 정렬
      return rotation.y > 0 ? a.price - b.price : b.price - a.price
    })
    
    sortedLevels.forEach((level, index) => {
      const z = (index - data.levels.length / 2) * 10
      const factor = perspective / (perspective - z * Math.sin(rotation.y))
      
      const x = centerX + (index - data.levels.length / 2) * 20 * factor * Math.cos(rotation.y)
      const y = centerY + (index - data.levels.length / 2) * 20 * factor * Math.sin(rotation.x)
      const height = (level.totalVolume / maxVolume) * 200 * factor
      const width = 20 * factor // 더 넓게
      
      ctx.save()
      // 3D 그림자 효과
      ctx.shadowBlur = 20 * factor
      ctx.shadowOffsetX = 5 * Math.sin(rotation.y)
      ctx.shadowOffsetY = 5 * Math.cos(rotation.x)
      
      // 매수 볼륨 - 그라데이션
      const buyHeight = (level.buyVolume / level.totalVolume) * height
      const buyGradient = ctx.createLinearGradient(x - width/2, y + buyHeight, x + width/2, y)
      buyGradient.addColorStop(0, currentColors.buy)
      buyGradient.addColorStop(0.5, currentColors.buyGlow || currentColors.buy)
      buyGradient.addColorStop(1, currentColors.buy)
      
      ctx.shadowColor = currentColors.buyGlow || currentColors.buy
      ctx.fillStyle = buyGradient
      ctx.globalAlpha = settings.transparency * factor
      ctx.fillRect(x - width/2, y, width, buyHeight)
      
      // 매도 볼륨 - 그라데이션
      const sellHeight = (level.sellVolume / level.totalVolume) * height
      const sellGradient = ctx.createLinearGradient(x - width/2, y - sellHeight, x + width/2, y)
      sellGradient.addColorStop(0, currentColors.sell)
      sellGradient.addColorStop(0.5, currentColors.sellGlow || currentColors.sell)
      sellGradient.addColorStop(1, currentColors.sell)
      
      ctx.shadowColor = currentColors.sellGlow || currentColors.sell
      ctx.fillStyle = sellGradient
      ctx.fillRect(x - width/2, y - sellHeight, width, sellHeight)
      
      // 3D 효과 - 측면
      ctx.globalAlpha = settings.transparency * factor * 0.5
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
      ctx.fillRect(x + width/2, y - sellHeight, width * 0.2, height)
      
      // POC 강조 - 네온 효과
      if (settings.showPOC && Math.abs(level.price - data.poc) < 0.01) {
        const pulse = Math.sin(Date.now() * 0.003) * 0.5 + 0.5
        
        ctx.shadowBlur = 30 * pulse
        ctx.shadowColor = currentColors.pocGlow || currentColors.poc
        ctx.strokeStyle = currentColors.poc
        ctx.lineWidth = 3 * factor
        ctx.globalAlpha = pulse
        ctx.strokeRect(x - width/2 - 3, y - height - 3, width + 6, height + 6)
        
        // POC 표시
        ctx.fillStyle = currentColors.poc
        ctx.font = `bold ${12 * factor}px Inter`
        ctx.textAlign = 'center'
        ctx.globalAlpha = 1
        ctx.fillText('POC', x, y - height - 10)
      }
      
      ctx.restore()
    })
    
    // 3D 제어 정보
    ctx.fillStyle = 'rgba(156, 163, 175, 0.8)'
    ctx.font = '12px Inter'
    ctx.textAlign = 'right'
    ctx.fillText('마우스 드래그로 회전 • 스크롤로 확대/축소', rect.width - 20, rect.height - 20)
  }
  
  // 마우스 이벤트 핸들러
  const handleMouseDown = (e: React.MouseEvent) => {
    if (viewMode === '3D') {
      setIsDragging(true)
      setDragStart({ x: e.clientX, y: e.clientY })
    }
  }
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && viewMode === '3D') {
      const deltaX = e.clientX - dragStart.x
      const deltaY = e.clientY - dragStart.y
      
      setRotation({
        x: rotation.x + deltaY * 0.01,
        y: rotation.y + deltaX * 0.01
      })
      
      setDragStart({ x: e.clientX, y: e.clientY })
    }
  }
  
  const handleMouseUp = () => {
    setIsDragging(false)
  }
  
  const handleWheel = (e: React.WheelEvent) => {
    if (viewMode === '3D') {
      e.preventDefault()
      const delta = e.deltaY > 0 ? 0.9 : 1.1
      setZoom(prev => Math.max(0.5, Math.min(3, prev * delta)))
    }
  }
  
  // 렌더링
  useEffect(() => {
    const render = () => {
      if (viewMode === '2D') {
        render2D()
      } else {
        render3D()
      }
    }
    
    render()
    
    if (viewMode === '3D') {
      const animate = () => {
        render()
        animationFrameRef.current = requestAnimationFrame(animate)
      }
      animationFrameRef.current = requestAnimationFrame(animate)
    }
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [data, currentPrice, viewMode, settings, rotation, zoom, currentColors])
  
  // 전체화면 토글
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }
  
  // 스크린샷
  const takeScreenshot = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const link = document.createElement('a')
    link.download = `volume-profile-${symbol}-${Date.now()}.png`
    link.href = canvas.toDataURL()
    link.click()
  }
  
  return (
    <div className="relative bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden h-full">
      {/* 헤더 */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-gray-900 to-transparent">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="text-purple-400">📊</span>
            볼륨 프로파일 차트
          </h3>
          
          <div className="flex items-center gap-2">
            {/* 2D/3D 전환 */}
            <div className="flex bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => onViewModeChange('2D')}
                className={`px-3 py-1 rounded ${
                  viewMode === '2D' 
                    ? 'bg-purple-500 text-white' 
                    : 'text-gray-400 hover:text-white'
                } transition-colors`}
              >
                2D
              </button>
              <button
                onClick={() => onViewModeChange('3D')}
                className={`px-3 py-1 rounded ${
                  viewMode === '3D' 
                    ? 'bg-purple-500 text-white' 
                    : 'text-gray-400 hover:text-white'
                } transition-colors`}
              >
                3D
              </button>
            </div>
            
            {/* 도구 버튼 */}
            <button
              onClick={takeScreenshot}
              className="p-2 bg-gray-800 text-gray-400 rounded-lg hover:text-white transition-colors"
              title="스크린샷"
            >
              📷
            </button>
            
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 bg-gray-800 text-gray-400 rounded-lg hover:text-white transition-colors"
              title="설정"
            >
              ⚙️
            </button>
            
            <button
              onClick={toggleFullscreen}
              className="p-2 bg-gray-800 text-gray-400 rounded-lg hover:text-white transition-colors"
              title={isFullscreen ? "전체화면 종료" : "전체화면"}
            >
              {isFullscreen ? '🗗' : '🗖'}
            </button>
          </div>
        </div>
      </div>
      
      {/* 설정 패널 */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-16 right-4 z-20 bg-gray-800 rounded-lg p-4 border border-gray-700 shadow-xl"
          >
            <h4 className="text-white font-bold mb-3">차트 설정</h4>
            
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm text-gray-300">
                <input
                  type="checkbox"
                  checked={settings.showValueArea}
                  onChange={(e) => setSettings({ ...settings, showValueArea: e.target.checked })}
                  className="rounded"
                />
                Value Area 표시
              </label>
              
              <label className="flex items-center gap-2 text-sm text-gray-300">
                <input
                  type="checkbox"
                  checked={settings.showHVN}
                  onChange={(e) => setSettings({ ...settings, showHVN: e.target.checked })}
                  className="rounded"
                />
                HVN (고볼륨) 표시
              </label>
              
              <label className="flex items-center gap-2 text-sm text-gray-300">
                <input
                  type="checkbox"
                  checked={settings.showLVN}
                  onChange={(e) => setSettings({ ...settings, showLVN: e.target.checked })}
                  className="rounded"
                />
                LVN (저볼륨) 표시
              </label>
              
              <label className="flex items-center gap-2 text-sm text-gray-300">
                <input
                  type="checkbox"
                  checked={settings.showPOC}
                  onChange={(e) => setSettings({ ...settings, showPOC: e.target.checked })}
                  className="rounded"
                />
                POC 강조
              </label>
              
              <label className="flex items-center gap-2 text-sm text-gray-300">
                <input
                  type="checkbox"
                  checked={settings.showGrid}
                  onChange={(e) => setSettings({ ...settings, showGrid: e.target.checked })}
                  className="rounded"
                />
                그리드 표시
              </label>
              
              <div className="pt-3 border-t border-gray-700">
                <p className="text-sm text-gray-300 mb-2">컬러 스킴</p>
                <select
                  value={settings.colorScheme}
                  onChange={(e) => setSettings({ ...settings, colorScheme: e.target.value })}
                  className="w-full bg-gray-700 text-white rounded px-3 py-1 text-sm"
                >
                  <option value="default">기본</option>
                  <option value="neon">네온</option>
                  <option value="cyberpunk">사이버펑크</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* 차트 캔버스 */}
      <div 
        ref={containerRef}
        className="relative w-full h-full min-h-[600px] cursor-move"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        <canvas 
          ref={canvasRef}
          className="w-full h-full"
        />
      </div>
      
      {/* 정보 패널 */}
      <div className="absolute bottom-4 left-4 bg-gray-800/90 backdrop-blur-sm rounded-lg p-3 border border-gray-700">
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-400 rounded" />
            <span className="text-gray-300">POC:</span>
            <span className="text-white font-medium">
              ${formatPrice(data?.poc || 0)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-purple-400 rounded" />
            <span className="text-gray-300">VAH:</span>
            <span className="text-white font-medium">
              ${formatPrice(data?.vah || 0)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-purple-400 rounded" />
            <span className="text-gray-300">VAL:</span>
            <span className="text-white font-medium">
              ${formatPrice(data?.val || 0)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}