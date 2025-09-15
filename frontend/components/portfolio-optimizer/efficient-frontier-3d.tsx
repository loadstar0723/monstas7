'use client'

import React, { useRef, useEffect, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { motion } from 'framer-motion'
import { FaChartLine, FaInfoCircle, FaCrosshairs } from 'react-icons/fa'

interface Portfolio {
  id: string
  name: string
  expectedReturn: number
  risk: number
  sharpeRatio: number
  weights: { [asset: string]: number }
  color: string
}

export default function EfficientFrontier3D() {
  const mountRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const frameRef = useRef<number>()

  const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(null)
  const [riskTolerance, setRiskTolerance] = useState(0.15)
  const [targetReturn, setTargetReturn] = useState(0.12)

  const generatePortfolios = (): Portfolio[] => {
    const portfolios: Portfolio[] = []
    const assets = ['BTC', 'ETH', 'BNB', 'SOL', 'ADA', 'DOGE']
    
    // 효율적 프론티어 상의 포트폴리오 생성
    for (let i = 0; i < 50; i++) {
      const risk = 0.05 + (i / 49) * 0.35
      const return_ = 0.02 + risk * 0.8 + Math.sin(i / 8) * 0.05
      const sharpeRatio = (return_ - 0.02) / risk
      
      // 무작위 가중치 생성 (합이 1이 되도록)
      const weights: { [asset: string]: number } = {}
      let total = 0
      assets.forEach(asset => {
        weights[asset] = Math.random()
        total += weights[asset]
      })
      assets.forEach(asset => {
        weights[asset] /= total
      })
      
      portfolios.push({
        id: `portfolio-${i}`,
        name: i === 0 ? '최소 위험' : i === 49 ? '최대 수익' : `포트폴리오 ${i}`,
        expectedReturn: return_,
        risk,
        sharpeRatio,
        weights,
        color: `hsl(${i * 7}, 70%, 50%)`
      })
    }

    // 비효율적 포트폴리오도 추가
    for (let i = 0; i < 100; i++) {
      const risk = 0.05 + Math.random() * 0.35
      const maxReturn = 0.02 + risk * 0.8 + Math.sin(risk * 20) * 0.05
      const return_ = maxReturn * (0.3 + Math.random() * 0.6)
      const sharpeRatio = (return_ - 0.02) / risk
      
      const weights: { [asset: string]: number } = {}
      let total = 0
      assets.forEach(asset => {
        weights[asset] = Math.random()
        total += weights[asset]
      })
      assets.forEach(asset => {
        weights[asset] /= total
      })
      
      portfolios.push({
        id: `sub-portfolio-${i}`,
        name: `서브 포트폴리오 ${i}`,
        expectedReturn: return_,
        risk,
        sharpeRatio,
        weights,
        color: '#6B7280'
      })
    }
    
    return portfolios
  }

  const [portfolios] = useState(generatePortfolios())

  useEffect(() => {
    if (!mountRef.current) return

    // Scene setup
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x0f172a)
    scene.fog = new THREE.Fog(0x0f172a, 100, 500)
    sceneRef.current = scene

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      60,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    )
    camera.position.set(50, 40, 80)

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight)
    renderer.setPixelRatio(window.devicePixelRatio)
    mountRef.current.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6)
    directionalLight.position.set(50, 50, 50)
    scene.add(directionalLight)

    // Grid and axes
    const gridHelper = new THREE.GridHelper(100, 20, 0x1e293b, 0x1e293b)
    gridHelper.rotation.x = Math.PI / 2
    scene.add(gridHelper)

    // X axis (Risk)
    const xAxisGeometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-50, 0, 0),
      new THREE.Vector3(50, 0, 0)
    ])
    const xAxis = new THREE.Line(xAxisGeometry, new THREE.LineBasicMaterial({ color: 0x3b82f6 }))
    scene.add(xAxis)

    // Y axis (Return)
    const yAxisGeometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, -50, 0),
      new THREE.Vector3(0, 50, 0)
    ])
    const yAxis = new THREE.Line(yAxisGeometry, new THREE.LineBasicMaterial({ color: 0x10b981 }))
    scene.add(yAxis)

    // Z axis (Sharpe Ratio)
    const zAxisGeometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, -50),
      new THREE.Vector3(0, 0, 50)
    ])
    const zAxis = new THREE.Line(zAxisGeometry, new THREE.LineBasicMaterial({ color: 0xf59e0b }))
    scene.add(zAxis)

    // Portfolio points
    const pointsGroup = new THREE.Group()
    portfolios.forEach((portfolio) => {
      const x = (portfolio.risk - 0.2) * 200
      const y = (portfolio.expectedReturn - 0.1) * 200
      const z = (portfolio.sharpeRatio - 1) * 30

      const geometry = new THREE.SphereGeometry(
        portfolio.id.startsWith('portfolio-') ? 1.5 : 0.8
      )
      const material = new THREE.MeshPhongMaterial({
        color: portfolio.color,
        emissive: portfolio.color,
        emissiveIntensity: 0.3
      })
      const sphere = new THREE.Mesh(geometry, material)
      sphere.position.set(x, y, z)
      sphere.userData = portfolio
      pointsGroup.add(sphere)
    })
    scene.add(pointsGroup)

    // Efficient frontier curve
    const frontierPoints = portfolios
      .filter(p => p.id.startsWith('portfolio-'))
      .sort((a, b) => a.risk - b.risk)
      .map(p => new THREE.Vector3(
        (p.risk - 0.2) * 200,
        (p.expectedReturn - 0.1) * 200,
        (p.sharpeRatio - 1) * 30
      ))
    
    const frontierCurve = new THREE.CatmullRomCurve3(frontierPoints)
    const frontierGeometry = new THREE.TubeGeometry(frontierCurve, 100, 0.5, 8, false)
    const frontierMaterial = new THREE.MeshBasicMaterial({
      color: 0x3b82f6,
      opacity: 0.8,
      transparent: true
    })
    const frontierMesh = new THREE.Mesh(frontierGeometry, frontierMaterial)
    scene.add(frontierMesh)

    // Constraint planes
    // Risk tolerance plane
    const riskPlaneGeometry = new THREE.PlaneGeometry(100, 100)
    const riskPlaneMaterial = new THREE.MeshBasicMaterial({
      color: 0xef4444,
      opacity: 0.1,
      transparent: true,
      side: THREE.DoubleSide
    })
    const riskPlane = new THREE.Mesh(riskPlaneGeometry, riskPlaneMaterial)
    riskPlane.rotation.y = Math.PI / 2
    scene.add(riskPlane)

    // Target return plane
    const returnPlaneGeometry = new THREE.PlaneGeometry(100, 100)
    const returnPlaneMaterial = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      opacity: 0.1,
      transparent: true,
      side: THREE.DoubleSide
    })
    const returnPlane = new THREE.Mesh(returnPlaneGeometry, returnPlaneMaterial)
    returnPlane.rotation.x = Math.PI / 2
    scene.add(returnPlane)

    // Animation
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate)
      
      // Update constraint planes
      riskPlane.position.x = (riskTolerance - 0.2) * 200
      returnPlane.position.y = (targetReturn - 0.1) * 200

      // Rotate portfolio points
      pointsGroup.children.forEach((child, i) => {
        if (child instanceof THREE.Mesh) {
          child.rotation.y += 0.01
          child.scale.setScalar(1 + Math.sin(Date.now() * 0.001 + i * 0.1) * 0.1)
        }
      })

      controls.update()
      renderer.render(scene, camera)
    }

    animate()

    // Raycaster for mouse interaction
    const raycaster = new THREE.Raycaster()
    const mouse = new THREE.Vector2()

    const handleMouseMove = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect()
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

      raycaster.setFromCamera(mouse, camera)
      const intersects = raycaster.intersectObjects(pointsGroup.children)

      pointsGroup.children.forEach((child) => {
        if (child instanceof THREE.Mesh) {
          child.material.emissiveIntensity = 0.3
        }
      })

      if (intersects.length > 0) {
        const mesh = intersects[0].object as THREE.Mesh
        mesh.material.emissiveIntensity = 0.8
        renderer.domElement.style.cursor = 'pointer'
      } else {
        renderer.domElement.style.cursor = 'default'
      }
    }

    const handleClick = (event: MouseEvent) => {
      raycaster.setFromCamera(mouse, camera)
      const intersects = raycaster.intersectObjects(pointsGroup.children)

      if (intersects.length > 0) {
        const portfolio = intersects[0].object.userData as Portfolio
        setSelectedPortfolio(portfolio)
      }
    }

    renderer.domElement.addEventListener('mousemove', handleMouseMove)
    renderer.domElement.addEventListener('click', handleClick)

    // Handle resize
    const handleResize = () => {
      if (!mountRef.current) return
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight)
    }

    window.addEventListener('resize', handleResize)

    return () => {
      renderer.domElement.removeEventListener('mousemove', handleMouseMove)
      renderer.domElement.removeEventListener('click', handleClick)
      window.removeEventListener('resize', handleResize)
      
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current)
      }
      
      renderer.dispose()
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement)
      }
    }
  }, [riskTolerance, targetReturn, portfolios])

  const optimalPortfolio = portfolios
    .filter(p => p.risk <= riskTolerance && p.expectedReturn >= targetReturn)
    .sort((a, b) => b.sharpeRatio - a.sharpeRatio)[0]

  return (
    <div className="space-y-6">
      {/* 3D Visualization */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <FaChartLine className="text-blue-400" />
          효율적 프론티어 3D 시각화
        </h3>
        <div ref={mountRef} className="w-full h-[600px] rounded-lg overflow-hidden" />
        
        {/* Legend */}
        <div className="mt-4 flex items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
            <span className="text-gray-300">X축: 위험 (변동성)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded-full"></div>
            <span className="text-gray-300">Y축: 기대 수익률</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
            <span className="text-gray-300">Z축: 샤프 비율</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-bold text-white mb-4">제약 조건</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                최대 위험 허용치 (표준편차)
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="5"
                  max="40"
                  value={riskTolerance * 100}
                  onChange={(e) => setRiskTolerance(Number(e.target.value) / 100)}
                  className="flex-1"
                />
                <span className="text-white w-12">{(riskTolerance * 100).toFixed(0)}%</span>
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">
                최소 목표 수익률 (연간)
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="0"
                  max="30"
                  value={targetReturn * 100}
                  onChange={(e) => setTargetReturn(Number(e.target.value) / 100)}
                  className="flex-1"
                />
                <span className="text-white w-12">{(targetReturn * 100).toFixed(0)}%</span>
              </div>
            </div>
          </div>

          {optimalPortfolio && (
            <div className="mt-6 p-4 bg-green-900/20 border border-green-600/30 rounded-lg">
              <p className="text-green-400 text-sm flex items-start gap-2">
                <FaCrosshairs className="mt-0.5 flex-shrink-0" />
                최적 포트폴리오: {optimalPortfolio.name} (샤프 비율: {optimalPortfolio.sharpeRatio.toFixed(2)})
              </p>
            </div>
          )}
        </div>

        {/* Selected Portfolio */}
        {selectedPortfolio && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gray-800 rounded-lg p-6 border border-gray-700"
          >
            <h3 className="text-lg font-bold text-white mb-4">선택된 포트폴리오</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">이름</span>
                <span className="text-white font-semibold">{selectedPortfolio.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">기대 수익률</span>
                <span className="text-green-400 font-semibold">
                  +{(selectedPortfolio.expectedReturn * 100).toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">위험 (표준편차)</span>
                <span className="text-red-400 font-semibold">
                  {(selectedPortfolio.risk * 100).toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">샤프 비율</span>
                <span className="text-yellow-400 font-semibold">
                  {selectedPortfolio.sharpeRatio.toFixed(3)}
                </span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-700">
              <h4 className="text-sm font-semibold text-gray-400 mb-2">자산 배분</h4>
              {Object.entries(selectedPortfolio.weights).map(([asset, weight]) => (
                <div key={asset} className="flex items-center justify-between mb-1">
                  <span className="text-gray-300">{asset}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${weight * 100}%` }}
                      />
                    </div>
                    <span className="text-white text-sm w-12 text-right">
                      {(weight * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Info */}
      <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-4">
        <p className="text-blue-400 text-sm flex items-start gap-2">
          <FaInfoCircle className="mt-0.5 flex-shrink-0" />
          효율적 프론티어는 주어진 위험 수준에서 최대 수익률을 제공하거나, 목표 수익률을 달성하는 최소 위험을 가진 포트폴리오들의 집합입니다.
          3D 공간에서 파란색 곡선이 효율적 프론티어를 나타냅니다.
        </p>
      </div>
    </div>
  )
}