'use client'

import React, { useRef, useEffect, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { motion } from 'framer-motion'

interface CandleData {
  time: Date
  open: number
  high: number
  low: number
  close: number
  volume: number
}

interface Props {
  data: CandleData[]
  width?: number
  height?: number
}

export default function Chart3D({ data, width = 800, height = 600 }: Props) {
  const mountRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const controlsRef = useRef<OrbitControls | null>(null)
  const candlesRef = useRef<THREE.Group | null>(null)
  const [hoveredCandle, setHoveredCandle] = useState<number | null>(null)

  useEffect(() => {
    if (!mountRef.current || data.length === 0) return

    // Scene setup
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x0a0a0a)
    scene.fog = new THREE.Fog(0x0a0a0a, 100, 300)
    sceneRef.current = scene

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      width / height,
      0.1,
      1000
    )
    camera.position.set(50, 30, 50)
    cameraRef.current = camera

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(width, height)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    rendererRef.current = renderer
    mountRef.current.appendChild(renderer.domElement)

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.maxPolarAngle = Math.PI / 2
    controlsRef.current = controls

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(50, 100, 50)
    directionalLight.castShadow = true
    directionalLight.shadow.camera.near = 0.1
    directionalLight.shadow.camera.far = 200
    directionalLight.shadow.camera.left = -50
    directionalLight.shadow.camera.right = 50
    directionalLight.shadow.camera.top = 50
    directionalLight.shadow.camera.bottom = -50
    scene.add(directionalLight)

    // Grid
    const gridHelper = new THREE.GridHelper(100, 20, 0x444444, 0x222222)
    scene.add(gridHelper)

    // Create candles group
    const candlesGroup = new THREE.Group()
    candlesRef.current = candlesGroup
    scene.add(candlesGroup)

    // Calculate price range
    const prices = data.flatMap(d => [d.open, d.high, d.low, d.close])
    const minPrice = Math.min(...prices)
    const maxPrice = Math.max(...prices)
    const priceRange = maxPrice - minPrice

    // Create candles
    data.forEach((candle, index) => {
      const x = (index - data.length / 2) * 2
      const bodyHeight = Math.abs(candle.close - candle.open)
      const bodyY = (candle.open + candle.close) / 2
      const wickHeight = candle.high - candle.low
      const wickY = (candle.high + candle.low) / 2

      // Normalize heights
      const normalizedBodyHeight = (bodyHeight / priceRange) * 50
      const normalizedBodyY = ((bodyY - minPrice) / priceRange) * 50
      const normalizedWickHeight = (wickHeight / priceRange) * 50
      const normalizedWickY = ((wickY - minPrice) / priceRange) * 50

      // Body
      const bodyGeometry = new THREE.BoxGeometry(1.5, normalizedBodyHeight || 0.1, 1.5)
      const bodyMaterial = new THREE.MeshPhongMaterial({
        color: candle.close > candle.open ? 0x00ff88 : 0xff4444,
        emissive: candle.close > candle.open ? 0x00ff88 : 0xff4444,
        emissiveIntensity: 0.2
      })
      const bodyMesh = new THREE.Mesh(bodyGeometry, bodyMaterial)
      bodyMesh.position.set(x, normalizedBodyY, 0)
      bodyMesh.castShadow = true
      bodyMesh.receiveShadow = true
      bodyMesh.userData = { index, type: 'body', candle }
      candlesGroup.add(bodyMesh)

      // Wick
      const wickGeometry = new THREE.BoxGeometry(0.2, normalizedWickHeight || 0.1, 0.2)
      const wickMaterial = new THREE.MeshPhongMaterial({
        color: 0x888888,
        emissive: 0x444444,
        emissiveIntensity: 0.1
      })
      const wickMesh = new THREE.Mesh(wickGeometry, wickMaterial)
      wickMesh.position.set(x, normalizedWickY, 0)
      wickMesh.castShadow = true
      wickMesh.userData = { index, type: 'wick', candle }
      candlesGroup.add(wickMesh)

      // Volume bars
      const volumeHeight = (candle.volume / Math.max(...data.map(d => d.volume))) * 20
      const volumeGeometry = new THREE.BoxGeometry(1.5, volumeHeight, 1.5)
      const volumeMaterial = new THREE.MeshPhongMaterial({
        color: 0x4444ff,
        transparent: true,
        opacity: 0.6
      })
      const volumeMesh = new THREE.Mesh(volumeGeometry, volumeMaterial)
      volumeMesh.position.set(x, volumeHeight / 2 - 5, 0)
      candlesGroup.add(volumeMesh)
    })

    // Raycaster for mouse interaction
    const raycaster = new THREE.Raycaster()
    const mouse = new THREE.Vector2()

    const onMouseMove = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect()
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

      raycaster.setFromCamera(mouse, camera)
      const intersects = raycaster.intersectObjects(candlesGroup.children)

      if (intersects.length > 0) {
        const object = intersects[0].object
        if (object.userData.type === 'body') {
          setHoveredCandle(object.userData.index)
        }
      } else {
        setHoveredCandle(null)
      }
    }

    renderer.domElement.addEventListener('mousemove', onMouseMove)

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate)
      controls.update()
      
      // Rotate candles slightly
      if (candlesGroup) {
        candlesGroup.rotation.y += 0.001
      }

      renderer.render(scene, camera)
    }
    animate()

    // Cleanup
    return () => {
      renderer.domElement.removeEventListener('mousemove', onMouseMove)
      mountRef.current?.removeChild(renderer.domElement)
      renderer.dispose()
    }
  }, [data, width, height])

  return (
    <div className="relative">
      <div ref={mountRef} />
      
      {/* Hover tooltip */}
      {hoveredCandle !== null && data[hoveredCandle] && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute top-4 left-4 bg-gray-900/90 backdrop-blur-sm border border-gray-700 rounded-lg p-3"
        >
          <div className="text-xs text-gray-400">
            {data[hoveredCandle].time.toLocaleString()}
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
            <div>
              <span className="text-gray-500">시가:</span>
              <span className="text-white ml-1">{data[hoveredCandle].open.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-gray-500">종가:</span>
              <span className={data[hoveredCandle].close > data[hoveredCandle].open ? 'text-green-400' : 'text-red-400'}>
                {data[hoveredCandle].close.toFixed(2)}
              </span>
            </div>
            <div>
              <span className="text-gray-500">고가:</span>
              <span className="text-white ml-1">{data[hoveredCandle].high.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-gray-500">저가:</span>
              <span className="text-white ml-1">{data[hoveredCandle].low.toFixed(2)}</span>
            </div>
            <div className="col-span-2">
              <span className="text-gray-500">거래량:</span>
              <span className="text-blue-400 ml-1">{data[hoveredCandle].volume.toLocaleString()}</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Controls hint */}
      <div className="absolute bottom-4 right-4 text-xs text-gray-500">
        마우스로 회전 • 스크롤로 확대/축소
      </div>
    </div>
  )
}