'use client'

import React, { useRef, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Sphere, Line } from '@react-three/drei'
import * as THREE from 'three'

// 3D 신경망 애니메이션
function NeuralNetwork3D() {
  const groupRef = useRef<THREE.Group>(null)
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.1
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.1
    }
  })
  
  // 뉴런 레이어
  const layers = [
    { count: 5, x: -6, color: '#4444ff' },
    { count: 8, x: -3, color: '#6666ff' },
    { count: 10, x: 0, color: '#8888ff' },
    { count: 8, x: 3, color: '#aaaaff' },
    { count: 3, x: 6, color: '#ccccff' }
  ]
  
  return (
    <group ref={groupRef}>
      {/* 뉴런들 */}
      {layers.map((layer, layerIndex) => (
        <React.Fragment key={layerIndex}>
          {Array.from({ length: layer.count }).map((_, i) => {
            const y = (i - layer.count / 2) * 1.2
            return (
              <group key={i} position={[layer.x, y, 0]}>
                <Sphere args={[0.3, 16, 16]}>
                  <meshStandardMaterial
                    color={layer.color}
                    emissive={layer.color}
                    emissiveIntensity={0.5}
                    metalness={0.7}
                    roughness={0.3}
                  />
                </Sphere>
                {/* 글로우 효과 */}
                <Sphere args={[0.4, 8, 8]}>
                  <meshBasicMaterial
                    color={layer.color}
                    transparent
                    opacity={0.2}
                  />
                </Sphere>
              </group>
            )
          })}
          
          {/* 연결선 */}
          {layerIndex < layers.length - 1 && (
            <>
              {Array.from({ length: layer.count }).map((_, i) => {
                const fromY = (i - layer.count / 2) * 1.2
                const nextLayer = layers[layerIndex + 1]
                
                return Array.from({ length: nextLayer.count }).map((_, j) => {
                  const toY = (j - nextLayer.count / 2) * 1.2
                  const points = [
                    new THREE.Vector3(layer.x, fromY, 0),
                    new THREE.Vector3(nextLayer.x, toY, 0)
                  ]
                  
                  return (
                    <Line
                      key={`${i}-${j}`}
                      points={points}
                      color="#004488"
                      lineWidth={1}
                      opacity={0.3}
                      transparent
                    />
                  )
                })
              })}
            </>
          )}
        </React.Fragment>
      ))}
      
      {/* 중앙 에너지 코어 */}
      <mesh position={[0, 0, 0]}>
        <icosahedronGeometry args={[0.8, 0]} />
        <meshStandardMaterial
          color="#0066ff"
          emissive="#00aaff"
          emissiveIntensity={1}
          wireframe
        />
      </mesh>
    </group>
  )
}

// 배경 파티클
function BackgroundParticles() {
  const particlesRef = useRef<THREE.Points>(null)
  
  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.02
      const positions = particlesRef.current.geometry.attributes.position
      for (let i = 0; i < positions.count; i++) {
        const y = positions.getY(i)
        positions.setY(i, y + Math.sin(state.clock.elapsedTime + i) * 0.001)
      }
      positions.needsUpdate = true
    }
  })
  
  const particles = new THREE.BufferGeometry()
  const particleCount = 1000
  const positions = new Float32Array(particleCount * 3)
  
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 20
    positions[i * 3 + 1] = (Math.random() - 0.5) * 20
    positions[i * 3 + 2] = (Math.random() - 0.5) * 20
  }
  
  particles.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  
  return (
    <points ref={particlesRef} geometry={particles}>
      <pointsMaterial
        size={0.02}
        color="#4444ff"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  )
}

export default function NeuralBackground3D() {
  return (
    <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-blue-950/20 to-black">
      <Canvas
        camera={{ position: [0, 0, 15], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
        className="absolute inset-0"
      >
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={0.5} color="#4488ff" />
        <pointLight position={[-10, -10, -10]} intensity={0.3} color="#0044ff" />
        
        <Suspense fallback={null}>
          <NeuralNetwork3D />
          <BackgroundParticles />
        </Suspense>
        
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.5}
        />
      </Canvas>
    </div>
  )
}