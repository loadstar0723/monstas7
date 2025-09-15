'use client'

import React, { useRef, useEffect } from 'react'
import * as THREE from 'three'
import { motion } from 'framer-motion'

interface Trade {
  id: string
  price: number
  volume: number
  side: 'buy' | 'sell'
  timestamp: Date
}

interface Props {
  trades: Trade[]
  width?: number
  height?: number
}

export default function ParticleFlow({ trades, width = 800, height = 400 }: Props) {
  const mountRef = useRef<HTMLDivElement>(null)
  const particlesRef = useRef<Map<string, THREE.Points>>(new Map())

  useEffect(() => {
    if (!mountRef.current) return

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
    camera.position.z = 50

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(width, height)
    mountRef.current.appendChild(renderer.domElement)

    // Create particle system for trades
    const createParticle = (trade: Trade) => {
      const geometry = new THREE.BufferGeometry()
      const vertices = new Float32Array([0, 0, 0])
      geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3))

      // Size based on volume
      const size = Math.log10(trade.volume + 1) * 2

      // Color based on side
      const color = trade.side === 'buy' ? new THREE.Color(0x00ff88) : new THREE.Color(0xff4444)

      const material = new THREE.PointsMaterial({
        size,
        color,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
      })

      const particle = new THREE.Points(geometry, material)
      
      // Random starting position
      particle.position.x = (Math.random() - 0.5) * 80
      particle.position.y = 30
      particle.position.z = (Math.random() - 0.5) * 20

      particle.userData = {
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.2,
          -Math.random() * 0.5 - 0.1,
          0
        ),
        trade,
        lifespan: 200
      }

      scene.add(particle)
      particlesRef.current.set(trade.id, particle)
    }

    // Add existing trades
    trades.slice(-50).forEach(trade => createParticle(trade))

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate)

      // Update particles
      particlesRef.current.forEach((particle, id) => {
        const userData = particle.userData
        
        // Apply velocity
        particle.position.add(userData.velocity)
        
        // Apply gravity
        userData.velocity.y -= 0.01
        
        // Fade out
        userData.lifespan--
        if (particle.material instanceof THREE.PointsMaterial) {
          particle.material.opacity = userData.lifespan / 200
        }
        
        // Remove dead particles
        if (userData.lifespan <= 0 || particle.position.y < -30) {
          scene.remove(particle)
          particlesRef.current.delete(id)
        }
      })

      renderer.render(scene, camera)
    }
    animate()

    // Handle new trades
    const lastTradeCount = trades.length
    const checkNewTrades = setInterval(() => {
      if (trades.length > lastTradeCount) {
        trades.slice(lastTradeCount).forEach(trade => createParticle(trade))
      }
    }, 100)

    // Cleanup
    return () => {
      clearInterval(checkNewTrades)
      mountRef.current?.removeChild(renderer.domElement)
      renderer.dispose()
    }
  }, [trades, width, height])

  return (
    <div className="relative">
      <div ref={mountRef} />
      
      {/* Legend */}
      <div className="absolute top-4 left-4 bg-gray-900/80 backdrop-blur-sm rounded-lg p-3">
        <h3 className="text-sm font-semibold text-white mb-2">거래 흐름</h3>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-400 rounded-full"></div>
            <span className="text-gray-400">매수</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-400 rounded-full"></div>
            <span className="text-gray-400">매도</span>
          </div>
        </div>
        <div className="mt-2 text-xs text-gray-500">
          크기 = 거래량
        </div>
      </div>

      {/* Stats */}
      <div className="absolute bottom-4 right-4 bg-gray-900/80 backdrop-blur-sm rounded-lg p-3">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-gray-500">활성 입자:</span>
            <span className="text-white ml-1">{particlesRef.current.size}</span>
          </div>
          <div>
            <span className="text-gray-500">총 거래:</span>
            <span className="text-white ml-1">{trades.length}</span>
          </div>
        </div>
      </div>
    </div>
  )
}