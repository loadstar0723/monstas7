'use client'

import React, { useRef, useEffect } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { motion } from 'framer-motion'

interface VolumeLevel {
  price: number
  volume: number
  buyVolume: number
  sellVolume: number
}

interface Props {
  data: VolumeLevel[]
  currentPrice: number
  width?: number
  height?: number
}

export default function VolumeProfile3D({ data, currentPrice, width = 800, height = 600 }: Props) {
  const mountRef = useRef<HTMLDivElement>(null)
  const pocRef = useRef<number>(0) // Point of Control

  useEffect(() => {
    if (!mountRef.current || data.length === 0) return

    // Scene setup
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x0a0a0a)
    scene.fog = new THREE.Fog(0x0a0a0a, 50, 200)

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      width / height,
      0.1,
      1000
    )
    camera.position.set(40, 30, 40)

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(width, height)
    renderer.shadowMap.enabled = true
    mountRef.current.appendChild(renderer.domElement)

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(50, 50, 50)
    directionalLight.castShadow = true
    scene.add(directionalLight)

    // Find Point of Control (highest volume price)
    const maxVolume = Math.max(...data.map(d => d.volume))
    pocRef.current = data.find(d => d.volume === maxVolume)?.price || currentPrice

    // Create volume profile bars
    data.forEach((level, index) => {
      const normalizedVolume = (level.volume / maxVolume) * 40
      const buyRatio = level.buyVolume / level.volume
      const sellRatio = level.sellVolume / level.volume

      // Buy volume (green)
      const buyGeometry = new THREE.BoxGeometry(
        normalizedVolume * buyRatio,
        1,
        2
      )
      const buyMaterial = new THREE.MeshPhongMaterial({
        color: 0x00ff88,
        emissive: 0x00ff88,
        emissiveIntensity: 0.2,
        transparent: true,
        opacity: 0.8
      })
      const buyMesh = new THREE.Mesh(buyGeometry, buyMaterial)
      buyMesh.position.set(
        (normalizedVolume * buyRatio) / 2,
        index * 1.5 - data.length * 0.75,
        0
      )
      buyMesh.castShadow = true
      scene.add(buyMesh)

      // Sell volume (red)
      const sellGeometry = new THREE.BoxGeometry(
        normalizedVolume * sellRatio,
        1,
        2
      )
      const sellMaterial = new THREE.MeshPhongMaterial({
        color: 0xff4444,
        emissive: 0xff4444,
        emissiveIntensity: 0.2,
        transparent: true,
        opacity: 0.8
      })
      const sellMesh = new THREE.Mesh(sellGeometry, sellMaterial)
      sellMesh.position.set(
        -((normalizedVolume * sellRatio) / 2),
        index * 1.5 - data.length * 0.75,
        0
      )
      sellMesh.castShadow = true
      scene.add(sellMesh)

      // Price label
      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')!
      canvas.width = 128
      canvas.height = 32
      context.fillStyle = '#ffffff'
      context.font = '16px Arial'
      context.fillText(`$${level.price.toFixed(2)}`, 10, 20)
      
      const texture = new THREE.CanvasTexture(canvas)
      const spriteMaterial = new THREE.SpriteMaterial({ map: texture })
      const sprite = new THREE.Sprite(spriteMaterial)
      sprite.scale.set(8, 2, 1)
      sprite.position.set(
        -25,
        index * 1.5 - data.length * 0.75,
        0
      )
      scene.add(sprite)

      // POC indicator
      if (level.price === pocRef.current) {
        const pocGeometry = new THREE.PlaneGeometry(50, 0.5)
        const pocMaterial = new THREE.MeshBasicMaterial({
          color: 0xffff00,
          transparent: true,
          opacity: 0.5
        })
        const pocMesh = new THREE.Mesh(pocGeometry, pocMaterial)
        pocMesh.position.set(0, index * 1.5 - data.length * 0.75, -5)
        scene.add(pocMesh)
      }
    })

    // Current price line
    const currentPriceIndex = data.findIndex(d => 
      Math.abs(d.price - currentPrice) < 0.01
    )
    if (currentPriceIndex !== -1) {
      const lineGeometry = new THREE.PlaneGeometry(50, 0.2)
      const lineMaterial = new THREE.MeshBasicMaterial({
        color: 0x00aaff,
        transparent: true,
        opacity: 0.8
      })
      const lineMesh = new THREE.Mesh(lineGeometry, lineMaterial)
      lineMesh.position.set(
        0,
        currentPriceIndex * 1.5 - data.length * 0.75,
        -3
      )
      scene.add(lineMesh)
    }

    // Grid
    const gridHelper = new THREE.GridHelper(60, 20, 0x444444, 0x222222)
    gridHelper.rotation.x = Math.PI / 2
    gridHelper.position.z = -10
    scene.add(gridHelper)

    // Animation loop
    let time = 0
    const animate = () => {
      requestAnimationFrame(animate)
      time += 0.01
      
      // Gentle rotation
      scene.rotation.y = Math.sin(time * 0.1) * 0.05
      
      controls.update()
      renderer.render(scene, camera)
    }
    animate()

    // Cleanup
    return () => {
      mountRef.current?.removeChild(renderer.domElement)
      renderer.dispose()
    }
  }, [data, currentPrice, width, height])

  return (
    <div className="relative">
      <div ref={mountRef} />
      
      {/* Legend */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="absolute top-4 left-4 bg-gray-900/90 backdrop-blur-sm border border-gray-700 rounded-lg p-4"
      >
        <h3 className="text-sm font-semibold text-white mb-3">볼륨 프로파일</h3>
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-400 rounded"></div>
            <span className="text-gray-400">매수 볼륨</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-400 rounded"></div>
            <span className="text-gray-400">매도 볼륨</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-400 rounded"></div>
            <span className="text-gray-400">POC (최대 거래량)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-400 rounded"></div>
            <span className="text-gray-400">현재가</span>
          </div>
        </div>
      </motion.div>

      {/* POC Info */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="absolute top-4 right-4 bg-gray-900/90 backdrop-blur-sm border border-gray-700 rounded-lg p-4"
      >
        <div className="text-xs text-gray-400">Point of Control</div>
        <div className="text-lg font-bold text-yellow-400">${pocRef.current.toFixed(2)}</div>
        <div className="text-xs text-gray-500 mt-1">최대 거래량 가격</div>
      </motion.div>

      {/* Controls hint */}
      <div className="absolute bottom-4 right-4 text-xs text-gray-500">
        마우스로 회전 • 스크롤로 확대/축소
      </div>
    </div>
  )
}