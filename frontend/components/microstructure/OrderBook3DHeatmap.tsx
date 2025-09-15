'use client'

import React, { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { motion } from 'framer-motion'
import { FaChartBar, FaInfoCircle } from 'react-icons/fa'

interface OrderBookData {
  bids: Array<[number, number]> // [price, amount]
  asks: Array<[number, number]>
  timestamp: number
}

interface Props {
  symbol: string
  depth?: number
  updateInterval?: number
}

export default function OrderBook3DHeatmap({ 
  symbol, 
  depth = 20,
  updateInterval = 1000 
}: Props) {
  const mountRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const controlsRef = useRef<OrbitControls | null>(null)
  const meshesRef = useRef<THREE.Mesh[]>([])
  
  const [orderBookData, setOrderBookData] = useState<OrderBookData[]>([])
  const [currentPrice, setCurrentPrice] = useState(0)
  const [spread, setSpread] = useState(0)
  const [imbalance, setImbalance] = useState(0)

  // WebSocket 연결
  useEffect(() => {
    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@depth20@1000ms`)
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      if (data.b && data.a) {
        const newOrderBook: OrderBookData = {
          bids: data.b.map((bid: string[]) => [parseFloat(bid[0]), parseFloat(bid[1])]),
          asks: data.a.map((ask: string[]) => [parseFloat(ask[0]), parseFloat(ask[1])]),
          timestamp: Date.now()
        }
        
        setOrderBookData(prev => [...prev.slice(-50), newOrderBook])
        
        // 현재가와 스프레드 계산
        if (newOrderBook.bids.length > 0 && newOrderBook.asks.length > 0) {
          const bestBid = newOrderBook.bids[0][0]
          const bestAsk = newOrderBook.asks[0][0]
          setCurrentPrice((bestBid + bestAsk) / 2)
          setSpread(bestAsk - bestBid)
          
          // 주문 불균형 계산
          const bidVolume = newOrderBook.bids.reduce((sum, [_, vol]) => sum + vol, 0)
          const askVolume = newOrderBook.asks.reduce((sum, [_, vol]) => sum + vol, 0)
          setImbalance((bidVolume - askVolume) / (bidVolume + askVolume))
        }
      }
    }
    
    return () => ws.close()
  }, [symbol])

  // Three.js 초기화
  useEffect(() => {
    if (!mountRef.current) return

    // Scene 설정
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x0a0a0a)
    scene.fog = new THREE.Fog(0x0a0a0a, 50, 200)
    sceneRef.current = scene

    // Camera 설정
    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    )
    camera.position.set(30, 30, 30)
    cameraRef.current = camera

    // Renderer 설정
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight)
    renderer.setPixelRatio(window.devicePixelRatio)
    mountRef.current.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // Controls 설정
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controlsRef.current = controls

    // 조명 추가
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.7)
    directionalLight.position.set(50, 50, 50)
    scene.add(directionalLight)

    // 격자 추가
    const gridHelper = new THREE.GridHelper(50, 20, 0x444444, 0x222222)
    scene.add(gridHelper)

    // 축 레이블 (FontLoader는 deprecated, 텍스트는 2D로 표시)
    
    // 애니메이션 루프
    const animate = () => {
      requestAnimationFrame(animate)
      controls.update()
      renderer.render(scene, camera)
    }
    animate()

    // 리사이즈 핸들러
    const handleResize = () => {
      if (!mountRef.current) return
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight)
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      mountRef.current?.removeChild(renderer.domElement)
      renderer.dispose()
    }
  }, [])

  // 오더북 데이터 시각화 업데이트
  useEffect(() => {
    if (!sceneRef.current || orderBookData.length === 0) return

    // 기존 메시 제거
    meshesRef.current.forEach(mesh => {
      sceneRef.current?.remove(mesh)
      mesh.geometry.dispose()
      if (mesh.material instanceof THREE.Material) {
        mesh.material.dispose()
      }
    })
    meshesRef.current = []

    const latestData = orderBookData[orderBookData.length - 1]
    const allPrices = [...latestData.bids, ...latestData.asks].map(([price]) => price)
    const minPrice = Math.min(...allPrices)
    const maxPrice = Math.max(...allPrices)
    const priceRange = maxPrice - minPrice

    // Bid 시각화 (녹색)
    latestData.bids.forEach((bid, index) => {
      const [price, volume] = bid
      const geometry = new THREE.BoxGeometry(2, volume * 0.5, 2)
      const material = new THREE.MeshPhongMaterial({
        color: new THREE.Color(0.1, 0.8, 0.1),
        opacity: 0.8,
        transparent: true
      })
      const mesh = new THREE.Mesh(geometry, material)
      
      const x = ((price - minPrice) / priceRange - 0.5) * 40
      mesh.position.set(x, volume * 0.25, -index * 2.5)
      
      sceneRef.current?.add(mesh)
      meshesRef.current.push(mesh)
    })

    // Ask 시각화 (빨간색)
    latestData.asks.forEach((ask, index) => {
      const [price, volume] = ask
      const geometry = new THREE.BoxGeometry(2, volume * 0.5, 2)
      const material = new THREE.MeshPhongMaterial({
        color: new THREE.Color(0.8, 0.1, 0.1),
        opacity: 0.8,
        transparent: true
      })
      const mesh = new THREE.Mesh(geometry, material)
      
      const x = ((price - minPrice) / priceRange - 0.5) * 40
      mesh.position.set(x, volume * 0.25, index * 2.5)
      
      sceneRef.current?.add(mesh)
      meshesRef.current.push(mesh)
    })

    // 중간선 (현재가)
    const midLineGeometry = new THREE.BoxGeometry(0.5, 20, 40)
    const midLineMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 })
    const midLine = new THREE.Mesh(midLineGeometry, midLineMaterial)
    const midX = ((currentPrice - minPrice) / priceRange - 0.5) * 40
    midLine.position.set(midX, 10, 0)
    sceneRef.current?.add(midLine)
    meshesRef.current.push(midLine)

  }, [orderBookData, currentPrice])

  return (
    <div className="w-full">
      {/* 헤더 정보 */}
      <div className="mb-4 p-4 bg-gray-800/50 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <FaChartBar className="text-purple-400" />
            오더북 3D 히트맵
          </h3>
          <div className="flex items-center gap-4 text-sm">
            <div>
              <span className="text-gray-400">현재가: </span>
              <span className="text-white font-bold">${currentPrice.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-gray-400">스프레드: </span>
              <span className="text-yellow-400 font-bold">${spread.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-gray-400">불균형: </span>
              <span className={`font-bold ${imbalance > 0 ? 'text-green-400' : 'text-red-400'}`}>
                {(imbalance * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <FaInfoCircle />
          <span>마우스로 회전, 스크롤로 확대/축소 가능</span>
        </div>
      </div>

      {/* 3D 오더북 뷰 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative w-full h-[600px] bg-gray-900 rounded-lg overflow-hidden"
      >
        <div ref={mountRef} className="w-full h-full" />
        
        {/* 범례 */}
        <div className="absolute bottom-4 left-4 bg-gray-800/90 p-3 rounded-lg text-sm">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-gray-300">매수 주문 (Bids)</span>
          </div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span className="text-gray-300">매도 주문 (Asks)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 bg-yellow-400"></div>
            <span className="text-gray-300">현재가</span>
          </div>
        </div>

        {/* 실시간 업데이트 인디케이터 */}
        <div className="absolute top-4 right-4">
          <div className="flex items-center gap-2 bg-gray-800/90 px-3 py-1 rounded-full">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-xs text-gray-300">실시간</span>
          </div>
        </div>
      </motion.div>

      {/* 추가 정보 */}
      <div className="mt-4 grid grid-cols-3 gap-4">
        <div className="p-3 bg-gray-800/50 rounded-lg">
          <div className="text-gray-400 text-sm mb-1">총 매수량</div>
          <div className="text-green-400 text-xl font-bold">
            {orderBookData.length > 0 
              ? orderBookData[orderBookData.length - 1].bids.reduce((sum, [_, vol]) => sum + vol, 0).toFixed(2)
              : '0.00'}
          </div>
        </div>
        <div className="p-3 bg-gray-800/50 rounded-lg">
          <div className="text-gray-400 text-sm mb-1">총 매도량</div>
          <div className="text-red-400 text-xl font-bold">
            {orderBookData.length > 0 
              ? orderBookData[orderBookData.length - 1].asks.reduce((sum, [_, vol]) => sum + vol, 0).toFixed(2)
              : '0.00'}
          </div>
        </div>
        <div className="p-3 bg-gray-800/50 rounded-lg">
          <div className="text-gray-400 text-sm mb-1">주문 깊이</div>
          <div className="text-purple-400 text-xl font-bold">{depth}</div>
        </div>
      </div>
    </div>
  )
}