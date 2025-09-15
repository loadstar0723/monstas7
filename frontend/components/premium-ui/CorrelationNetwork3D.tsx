'use client'

import React, { useRef, useEffect, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { motion } from 'framer-motion'

interface Asset {
  id: string
  name: string
  category: 'crypto' | 'stock' | 'commodity' | 'forex'
  value: number
  change: number
}

interface Correlation {
  source: string
  target: string
  value: number // -1 to 1
}

interface Props {
  assets: Asset[]
  correlations: Correlation[]
  width?: number
  height?: number
}

export default function CorrelationNetwork3D({ assets, correlations, width = 800, height = 600 }: Props) {
  const mountRef = useRef<HTMLDivElement>(null)
  const [hoveredAsset, setHoveredAsset] = useState<string | null>(null)
  const nodesRef = useRef<Map<string, THREE.Mesh>>(new Map())
  const edgesRef = useRef<THREE.LineSegments[]>([])

  useEffect(() => {
    if (!mountRef.current || assets.length === 0) return

    // Scene setup
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x0a0a0a)

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      width / height,
      0.1,
      1000
    )
    camera.position.set(0, 0, 100)

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(width, height)
    mountRef.current.appendChild(renderer.domElement)

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.autoRotate = true
    controls.autoRotateSpeed = 0.5

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
    scene.add(ambientLight)

    const pointLight = new THREE.PointLight(0xffffff, 0.8)
    pointLight.position.set(50, 50, 50)
    scene.add(pointLight)

    // Category colors
    const categoryColors = {
      crypto: 0x00ff88,
      stock: 0x4488ff,
      commodity: 0xffaa00,
      forex: 0xff44aa
    }

    // Create nodes
    assets.forEach((asset, index) => {
      const geometry = new THREE.SphereGeometry(3 + Math.abs(asset.change) * 0.5, 32, 32)
      const material = new THREE.MeshPhongMaterial({
        color: categoryColors[asset.category],
        emissive: categoryColors[asset.category],
        emissiveIntensity: 0.3,
        transparent: true,
        opacity: 0.9
      })
      const sphere = new THREE.Mesh(geometry, material)
      
      // Position nodes in a sphere
      const phi = Math.acos(1 - 2 * (index + 0.5) / assets.length)
      const theta = Math.sqrt(assets.length * Math.PI) * phi
      const radius = 40
      
      sphere.position.x = radius * Math.sin(phi) * Math.cos(theta)
      sphere.position.y = radius * Math.sin(phi) * Math.sin(theta)
      sphere.position.z = radius * Math.cos(phi)
      
      sphere.userData = { asset }
      nodesRef.current.set(asset.id, sphere)
      scene.add(sphere)

      // Add label
      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')!
      canvas.width = 256
      canvas.height = 64
      context.fillStyle = '#ffffff'
      context.font = 'bold 24px Arial'
      context.textAlign = 'center'
      context.fillText(asset.name, 128, 40)
      
      const texture = new THREE.CanvasTexture(canvas)
      const spriteMaterial = new THREE.SpriteMaterial({ 
        map: texture,
        transparent: true,
        opacity: 0.8
      })
      const sprite = new THREE.Sprite(spriteMaterial)
      sprite.scale.set(10, 2.5, 1)
      sprite.position.copy(sphere.position)
      sprite.position.y += 5
      scene.add(sprite)
    })

    // Create edges
    correlations.forEach(correlation => {
      const sourceNode = nodesRef.current.get(correlation.source)
      const targetNode = nodesRef.current.get(correlation.target)
      
      if (sourceNode && targetNode) {
        const points = []
        points.push(sourceNode.position)
        points.push(targetNode.position)
        
        const geometry = new THREE.BufferGeometry().setFromPoints(points)
        
        // Color based on correlation strength
        const color = correlation.value > 0 
          ? new THREE.Color(0, correlation.value, 0)
          : new THREE.Color(-correlation.value, 0, 0)
        
        const material = new THREE.LineBasicMaterial({
          color,
          transparent: true,
          opacity: Math.abs(correlation.value),
          linewidth: Math.abs(correlation.value) * 3
        })
        
        const line = new THREE.LineSegments(geometry, material)
        edgesRef.current.push(line)
        scene.add(line)
      }
    })

    // Raycaster for interaction
    const raycaster = new THREE.Raycaster()
    const mouse = new THREE.Vector2()

    const onMouseMove = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect()
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

      raycaster.setFromCamera(mouse, camera)
      const intersects = raycaster.intersectObjects(Array.from(nodesRef.current.values()))

      if (intersects.length > 0) {
        const asset = intersects[0].object.userData.asset
        setHoveredAsset(asset.id)
        
        // Highlight connected nodes
        nodesRef.current.forEach((node, id) => {
          const isConnected = correlations.some(c => 
            (c.source === asset.id && c.target === id) ||
            (c.target === asset.id && c.source === id)
          )
          if (node.material instanceof THREE.MeshPhongMaterial) {
            node.material.opacity = isConnected || id === asset.id ? 1 : 0.3
          }
        })
      } else {
        setHoveredAsset(null)
        nodesRef.current.forEach(node => {
          if (node.material instanceof THREE.MeshPhongMaterial) {
            node.material.opacity = 0.9
          }
        })
      }
    }

    renderer.domElement.addEventListener('mousemove', onMouseMove)

    // Animation loop
    let time = 0
    const animate = () => {
      requestAnimationFrame(animate)
      time += 0.01
      
      // Animate nodes
      nodesRef.current.forEach((node, id) => {
        const asset = assets.find(a => a.id === id)
        if (asset) {
          node.scale.setScalar(1 + Math.sin(time * 2 + node.position.x) * 0.1)
        }
      })
      
      controls.update()
      renderer.render(scene, camera)
    }
    animate()

    // Cleanup
    return () => {
      renderer.domElement.removeEventListener('mousemove', onMouseMove)
      mountRef.current?.removeChild(renderer.domElement)
      renderer.dispose()
    }
  }, [assets, correlations, width, height])

  return (
    <div className="relative">
      <div ref={mountRef} />
      
      {/* Legend */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute bottom-4 left-4 bg-gray-900/90 backdrop-blur-sm border border-gray-700 rounded-lg p-4"
      >
        <h3 className="text-sm font-semibold text-white mb-3">자산 카테고리</h3>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-400 rounded-full"></div>
            <span className="text-gray-400">암호화폐</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
            <span className="text-gray-400">주식</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-400 rounded-full"></div>
            <span className="text-gray-400">원자재</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-pink-400 rounded-full"></div>
            <span className="text-gray-400">외환</span>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-gray-700">
          <div className="text-xs text-gray-500">
            <div>녹색 선: 양의 상관관계</div>
            <div>적색 선: 음의 상관관계</div>
          </div>
        </div>
      </motion.div>

      {/* Hovered asset info */}
      {hoveredAsset && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute top-4 right-4 bg-gray-900/90 backdrop-blur-sm border border-gray-700 rounded-lg p-4"
        >
          {(() => {
            const asset = assets.find(a => a.id === hoveredAsset)
            if (!asset) return null
            
            const connections = correlations.filter(c => 
              c.source === hoveredAsset || c.target === hoveredAsset
            )
            
            return (
              <>
                <h4 className="text-lg font-bold text-white">{asset.name}</h4>
                <div className="text-sm text-gray-400 mt-1">{asset.category}</div>
                <div className={`text-lg font-semibold mt-2 ${
                  asset.change > 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {asset.change > 0 ? '+' : ''}{asset.change.toFixed(2)}%
                </div>
                <div className="mt-3 pt-3 border-t border-gray-700">
                  <div className="text-xs text-gray-500">연결: {connections.length}개</div>
                </div>
              </>
            )
          })()}
        </motion.div>
      )}
    </div>
  )
}