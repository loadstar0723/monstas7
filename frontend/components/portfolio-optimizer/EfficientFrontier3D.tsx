'use client'

import React, { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { FaInfoCircle, FaChartLine } from 'react-icons/fa'

interface Asset {
  symbol: string
  expectedReturn: number
  volatility: number
}

interface Portfolio {
  expectedReturn: number
  volatility: number
  sharpeRatio: number
}

interface Props {
  assets: Asset[]
  currentPortfolio: Portfolio | null
  optimizationResult: any | null
  constraints: {
    minWeight: number
    maxWeight: number
    maxVolatility: number
    minSharpe: number
  }
}

export default function EfficientFrontier3D({ 
  assets, 
  currentPortfolio, 
  optimizationResult,
  constraints 
}: Props) {
  const mountRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const [hoveredPoint, setHoveredPoint] = useState<any>(null)

  useEffect(() => {
    if (!mountRef.current) return

    // Scene setup
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x111827)
    scene.fog = new THREE.Fog(0x111827, 1, 100)
    sceneRef.current = scene

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    )
    camera.position.set(30, 30, 50)

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    mountRef.current.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.enableZoom = true

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 2)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
    directionalLight.position.set(50, 50, 50)
    directionalLight.castShadow = true
    scene.add(directionalLight)

    // Grid and axes
    const gridHelper = new THREE.GridHelper(60, 30, 0x4B5563, 0x1F2937)
    gridHelper.rotation.x = Math.PI / 2
    scene.add(gridHelper)

    // X axis (Volatility)
    const xAxisGeometry = new THREE.BoxGeometry(60, 0.2, 0.2)
    const xAxisMaterial = new THREE.MeshBasicMaterial({ color: 0x60A5FA })
    const xAxis = new THREE.Mesh(xAxisGeometry, xAxisMaterial)
    xAxis.position.set(0, 0, 0)
    scene.add(xAxis)

    // Y axis (Return)
    const yAxisGeometry = new THREE.BoxGeometry(0.2, 60, 0.2)
    const yAxisMaterial = new THREE.MeshBasicMaterial({ color: 0x34D399 })
    const yAxis = new THREE.Mesh(yAxisGeometry, yAxisMaterial)
    yAxis.position.set(-30, 0, 0)
    scene.add(yAxis)

    // Z axis (Sharpe Ratio)
    const zAxisGeometry = new THREE.BoxGeometry(0.2, 0.2, 60)
    const zAxisMaterial = new THREE.MeshBasicMaterial({ color: 0xA78BFA })
    const zAxis = new THREE.Mesh(zAxisGeometry, zAxisMaterial)
    zAxis.position.set(-30, -30, 0)
    scene.add(zAxis)

    // Generate efficient frontier points
    const frontierPoints: THREE.Vector3[] = []
    const numPoints = 100
    
    for (let i = 0; i < numPoints; i++) {
      const t = i / (numPoints - 1)
      const vol = 10 + t * 80 // 10% to 90% volatility
      const ret = 5 + Math.sqrt(vol - 10) * 2.5 + (Math.random() - 0.5) * 5
      const sharpe = ret / vol
      
      // Map to 3D space
      const x = (vol - 50) * 0.6
      const y = (ret - 50) * 0.6
      const z = sharpe * 20
      
      frontierPoints.push(new THREE.Vector3(x, y, z))
    }

    // Create efficient frontier curve
    const curve = new THREE.CatmullRomCurve3(frontierPoints)
    const curvePoints = curve.getPoints(200)
    const curveGeometry = new THREE.BufferGeometry().setFromPoints(curvePoints)
    const curveMaterial = new THREE.LineBasicMaterial({ 
      color: 0x10B981, 
      linewidth: 3,
      transparent: true,
      opacity: 0.8
    })
    const frontierLine = new THREE.Line(curveGeometry, curveMaterial)
    scene.add(frontierLine)

    // Create efficient frontier surface
    const surfaceGeometry = new THREE.PlaneGeometry(60, 40, 30, 20)
    const surfaceMaterial = new THREE.MeshPhongMaterial({
      color: 0x3B82F6,
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide,
      wireframe: false
    })
    
    // Modify vertices to create curved surface
    const positions = surfaceGeometry.attributes.position
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i)
      const y = positions.getY(i)
      const z = Math.sin(x * 0.1) * Math.cos(y * 0.1) * 10
      positions.setZ(i, z)
    }
    positions.needsUpdate = true
    
    const surface = new THREE.Mesh(surfaceGeometry, surfaceMaterial)
    scene.add(surface)

    // Add portfolio points
    if (assets && assets.length > 0) {
      assets.forEach(asset => {
        const geometry = new THREE.SphereGeometry(0.8, 32, 32)
        const material = new THREE.MeshPhongMaterial({ 
          color: 0xFBBF24,
          emissive: 0xFBBF24,
          emissiveIntensity: 0.3
        })
        const sphere = new THREE.Mesh(geometry, material)
        
        const x = (asset.volatility - 50) * 0.6
        const y = (asset.expectedReturn - 50) * 0.6
        const z = (asset.expectedReturn / asset.volatility) * 20
        
        sphere.position.set(x, y, z)
        scene.add(sphere)
      })
    }

    // Add current portfolio point
    if (currentPortfolio) {
      const geometry = new THREE.SphereGeometry(1.5, 32, 32)
      const material = new THREE.MeshPhongMaterial({ 
        color: 0xEF4444,
        emissive: 0xEF4444,
        emissiveIntensity: 0.5
      })
      const currentSphere = new THREE.Mesh(geometry, material)
      
      const x = (currentPortfolio.volatility - 50) * 0.6
      const y = (currentPortfolio.expectedReturn - 50) * 0.6
      const z = currentPortfolio.sharpeRatio * 20
      
      currentSphere.position.set(x, y, z)
      scene.add(currentSphere)
    }

    // Add optimized portfolio point
    if (optimizationResult) {
      const geometry = new THREE.SphereGeometry(1.5, 32, 32)
      const material = new THREE.MeshPhongMaterial({ 
        color: 0x10B981,
        emissive: 0x10B981,
        emissiveIntensity: 0.5
      })
      const optimalSphere = new THREE.Mesh(geometry, material)
      
      const x = (optimizationResult.volatility - 50) * 0.6
      const y = (optimizationResult.expectedReturn - 50) * 0.6
      const z = optimizationResult.sharpeRatio * 20
      
      optimalSphere.position.set(x, y, z)
      scene.add(optimalSphere)
    }

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate)
      controls.update()
      
      // Rotate efficient frontier slowly
      frontierLine.rotation.z += 0.001
      surface.rotation.z += 0.001
      
      renderer.render(scene, camera)
    }
    animate()

    // Handle resize
    const handleResize = () => {
      if (!mountRef.current) return
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight)
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement)
      }
      renderer.dispose()
      controls.dispose()
    }
  }, [assets, currentPortfolio, optimizationResult])

  return (
    <div className="space-y-4">
      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <FaChartLine className="text-blue-400" />
            3D 효율적 프론티어
          </h3>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <FaInfoCircle />
            마우스로 드래그하여 회전
          </div>
        </div>

        <div 
          ref={mountRef} 
          className="w-full h-[600px] rounded-lg overflow-hidden"
        />

        {/* 범례 */}
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-600 rounded-full"></div>
            <span className="text-gray-400 text-sm">X축: 변동성 (리스크)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-400 rounded-full"></div>
            <span className="text-gray-400 text-sm">Y축: 기대 수익률</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-purple-400 rounded-full"></div>
            <span className="text-gray-400 text-sm">Z축: 샤프 비율</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-2">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-400 rounded-full"></div>
            <span className="text-gray-400 text-sm">개별 자산</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded-full"></div>
            <span className="text-gray-400 text-sm">현재 포트폴리오</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded-full"></div>
            <span className="text-gray-400 text-sm">최적 포트폴리오</span>
          </div>
        </div>
      </div>

      {/* 제약조건 표시 */}
      <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
        <h4 className="text-sm font-semibold text-gray-400 mb-2">최적화 제약조건</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-500">최소 비중:</span>
            <span className="text-white ml-2">{(constraints.minWeight * 100).toFixed(0)}%</span>
          </div>
          <div>
            <span className="text-gray-500">최대 비중:</span>
            <span className="text-white ml-2">{(constraints.maxWeight * 100).toFixed(0)}%</span>
          </div>
          <div>
            <span className="text-gray-500">최대 변동성:</span>
            <span className="text-white ml-2">{constraints.maxVolatility}%</span>
          </div>
          <div>
            <span className="text-gray-500">최소 샤프:</span>
            <span className="text-white ml-2">{constraints.minSharpe}</span>
          </div>
        </div>
      </div>
    </div>
  )
}