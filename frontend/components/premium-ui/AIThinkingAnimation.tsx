'use client'

import React, { useRef, useEffect } from 'react'
import * as THREE from 'three'
import { motion } from 'framer-motion'

interface NeuralActivity {
  layer: number
  neuron: number
  activation: number
  timestamp: number
}

interface Props {
  activity: NeuralActivity[]
  width?: number
  height?: number
  layers?: number[]
}

export default function AIThinkingAnimation({ 
  activity, 
  width = 800, 
  height = 400,
  layers = [8, 16, 32, 16, 8, 1] 
}: Props) {
  const mountRef = useRef<HTMLDivElement>(null)
  const neuronsRef = useRef<Map<string, THREE.Mesh>>(new Map())
  const connectionsRef = useRef<THREE.LineSegments[]>([])
  const signalsRef = useRef<Map<string, THREE.Mesh>>(new Map())

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

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3)
    scene.add(ambientLight)

    // Create neural network structure
    const layerSpacing = 60 / layers.length
    const networkGroup = new THREE.Group()
    
    layers.forEach((neuronCount, layerIndex) => {
      const layerX = (layerIndex - layers.length / 2) * layerSpacing
      
      for (let i = 0; i < neuronCount; i++) {
        const y = (i - neuronCount / 2) * (30 / neuronCount)
        
        // Neuron
        const geometry = new THREE.SphereGeometry(1, 16, 16)
        const material = new THREE.MeshPhongMaterial({
          color: 0x4488ff,
          emissive: 0x4488ff,
          emissiveIntensity: 0.2,
          transparent: true,
          opacity: 0.6
        })
        const neuron = new THREE.Mesh(geometry, material)
        neuron.position.set(layerX, y, 0)
        
        const neuronId = `${layerIndex}-${i}`
        neuronsRef.current.set(neuronId, neuron)
        networkGroup.add(neuron)
        
        // Create connections to next layer
        if (layerIndex < layers.length - 1) {
          const nextLayerCount = layers[layerIndex + 1]
          const nextLayerX = ((layerIndex + 1) - layers.length / 2) * layerSpacing
          
          for (let j = 0; j < nextLayerCount; j++) {
            const nextY = (j - nextLayerCount / 2) * (30 / nextLayerCount)
            
            const points = []
            points.push(new THREE.Vector3(layerX, y, 0))
            points.push(new THREE.Vector3(nextLayerX, nextY, 0))
            
            const geometry = new THREE.BufferGeometry().setFromPoints(points)
            const material = new THREE.LineBasicMaterial({
              color: 0x333333,
              transparent: true,
              opacity: 0.2
            })
            
            const line = new THREE.LineSegments(geometry, material)
            connectionsRef.current.push(line)
            networkGroup.add(line)
          }
        }
      }
    })
    
    scene.add(networkGroup)

    // Process neural activity
    const processActivity = (activity: NeuralActivity) => {
      const neuronId = `${activity.layer}-${activity.neuron}`
      const neuron = neuronsRef.current.get(neuronId)
      
      if (neuron && neuron.material instanceof THREE.MeshPhongMaterial) {
        // Activate neuron
        neuron.material.emissiveIntensity = activity.activation
        neuron.scale.setScalar(1 + activity.activation * 0.5)
        
        // Create signal to next layer
        if (activity.layer < layers.length - 1) {
          const signalGeometry = new THREE.SphereGeometry(0.5, 8, 8)
          const signalMaterial = new THREE.MeshBasicMaterial({
            color: new THREE.Color(activity.activation, activity.activation * 0.5, 0),
            transparent: true,
            opacity: activity.activation
          })
          const signal = new THREE.Mesh(signalGeometry, signalMaterial)
          signal.position.copy(neuron.position)
          
          const signalId = `signal-${Date.now()}-${Math.random()}`
          signal.userData = {
            startPos: neuron.position.clone(),
            targetLayer: activity.layer + 1,
            progress: 0,
            activation: activity.activation
          }
          
          signalsRef.current.set(signalId, signal)
          scene.add(signal)
        }
      }
    }

    // Animation loop
    let time = 0
    const animate = () => {
      requestAnimationFrame(animate)
      time += 0.016
      
      // Decay neuron activations
      neuronsRef.current.forEach(neuron => {
        if (neuron.material instanceof THREE.MeshPhongMaterial) {
          neuron.material.emissiveIntensity *= 0.95
          neuron.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1)
        }
      })
      
      // Update signals
      signalsRef.current.forEach((signal, id) => {
        signal.userData.progress += 0.05
        
        if (signal.userData.progress >= 1) {
          scene.remove(signal)
          signalsRef.current.delete(id)
        } else {
          // Move signal along connection
          const targetLayerX = (signal.userData.targetLayer - layers.length / 2) * layerSpacing
          signal.position.x = THREE.MathUtils.lerp(
            signal.userData.startPos.x,
            targetLayerX,
            signal.userData.progress
          )
          
          // Fade out
          if (signal.material instanceof THREE.MeshBasicMaterial) {
            signal.material.opacity = signal.userData.activation * (1 - signal.userData.progress)
          }
        }
      })
      
      // Process new activity
      const recentActivity = activity.filter(a => 
        Date.now() - a.timestamp < 1000
      )
      recentActivity.forEach(processActivity)
      
      // Gentle rotation
      networkGroup.rotation.y = Math.sin(time * 0.2) * 0.1
      networkGroup.rotation.x = Math.sin(time * 0.3) * 0.05
      
      renderer.render(scene, camera)
    }
    animate()

    // Cleanup
    return () => {
      mountRef.current?.removeChild(renderer.domElement)
      renderer.dispose()
    }
  }, [activity, width, height, layers])

  return (
    <div className="relative">
      <div ref={mountRef} />
      
      {/* Info overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute top-4 left-4 bg-gray-900/80 backdrop-blur-sm rounded-lg p-3"
      >
        <h3 className="text-sm font-semibold text-white mb-2">AI 사고 과정</h3>
        <div className="text-xs text-gray-400 space-y-1">
          <div>레이어: {layers.length}개</div>
          <div>뉴런: {layers.reduce((a, b) => a + b, 0)}개</div>
          <div>활성 신호: {signalsRef.current.size}개</div>
        </div>
      </motion.div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 text-xs text-gray-500">
        밝기 = 활성화 강도 • 크기 = 중요도
      </div>
    </div>
  )
}