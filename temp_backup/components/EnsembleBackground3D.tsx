'use client'

import React, { useRef, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Sphere, Line, Box, MeshDistortMaterial } from '@react-three/drei'
import * as THREE from 'three'

// 앙상블 모델 노드
function ModelNode({ position, color, label }: { position: [number, number, number], color: string, label: string }) {
  const meshRef = useRef<THREE.Mesh>(null)
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.01
      meshRef.current.rotation.y += 0.01
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.1
      meshRef.current.scale.setScalar(scale)
    }
  })

  return (
    <group position={position}>
      <Sphere ref={meshRef} args={[0.5, 32, 32]}>
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.5}
          metalness={0.8}
          roughness={0.2}
        />
      </Sphere>
      {/* 글로우 효과 */}
      <Sphere args={[0.6, 16, 16]}>
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.2}
        />
      </Sphere>
    </group>
  )
}

// 중앙 앙상블 코어
function EnsembleCore() {
  const coreRef = useRef<THREE.Mesh>(null)
  
  useFrame((state) => {
    if (coreRef.current) {
      coreRef.current.rotation.x = state.clock.elapsedTime * 0.5
      coreRef.current.rotation.y = state.clock.elapsedTime * 0.3
    }
  })

  return (
    <group position={[0, 0, 0]}>
      <Box ref={coreRef} args={[1, 1, 1]}>
        <MeshDistortMaterial
          color="#ff00ff"
          emissive="#ff00ff"
          emissiveIntensity={0.5}
          metalness={0.9}
          roughness={0.1}
          distort={0.4}
          speed={2}
        />
      </Box>
      {/* 외곽 프레임 */}
      <mesh>
        <dodecahedronGeometry args={[1.5, 0]} />
        <meshStandardMaterial
          color="#ffffff"
          wireframe
          opacity={0.3}
          transparent
        />
      </mesh>
    </group>
  )
}

// 앙상블 네트워크 구조
function EnsembleNetwork() {
  const groupRef = useRef<THREE.Group>(null)
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.1
    }
  })

  // 11개 모델 위치 (원형 배치)
  const models = [
    { name: 'LSTM', color: '#3b82f6' },
    { name: 'GRU', color: '#10b981' },
    { name: 'CNN', color: '#f59e0b' },
    { name: 'Transformer', color: '#ef4444' },
    { name: 'XGBoost', color: '#8b5cf6' },
    { name: 'LightGBM', color: '#ec4899' },
    { name: 'Random Forest', color: '#14b8a6' },
    { name: 'Neural Net', color: '#6366f1' },
    { name: 'ARIMA', color: '#84cc16' },
    { name: 'Prophet', color: '#f97316' },
    { name: 'DeepAR', color: '#06b6d4' }
  ]

  const modelPositions = models.map((model, i) => {
    const angle = (i / models.length) * Math.PI * 2
    const radius = 4
    return {
      ...model,
      position: [
        Math.cos(angle) * radius,
        Math.sin(angle) * 0.5,
        Math.sin(angle) * radius
      ] as [number, number, number]
    }
  })

  return (
    <group ref={groupRef}>
      {/* 중앙 앙상블 코어 */}
      <EnsembleCore />
      
      {/* 모델 노드들 */}
      {modelPositions.map((model, index) => (
        <ModelNode
          key={index}
          position={model.position}
          color={model.color}
          label={model.name}
        />
      ))}
      
      {/* 연결선들 */}
      {modelPositions.map((model, index) => (
        <Line
          key={`line-${index}`}
          points={[
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(...model.position)
          ]}
          color={model.color}
          lineWidth={2}
          opacity={0.3}
          transparent
        />
      ))}
      
      {/* 모델 간 연결 */}
      {modelPositions.map((model1, i) => (
        modelPositions.slice(i + 1).map((model2, j) => (
          <Line
            key={`inter-${i}-${j}`}
            points={[
              new THREE.Vector3(...model1.position),
              new THREE.Vector3(...model2.position)
            ]}
            color="#ffffff"
            lineWidth={1}
            opacity={0.1}
            transparent
          />
        ))
      ))}
    </group>
  )
}

// 플로팅 파티클
function FloatingParticles() {
  const particlesRef = useRef<THREE.Points>(null)
  
  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.05
      const positions = particlesRef.current.geometry.attributes.position
      for (let i = 0; i < positions.count; i++) {
        const y = positions.getY(i)
        positions.setY(i, y + Math.sin(state.clock.elapsedTime + i * 0.1) * 0.002)
      }
      positions.needsUpdate = true
    }
  })

  const particles = new THREE.BufferGeometry()
  const particleCount = 500
  const positions = new Float32Array(particleCount * 3)
  const colors = new Float32Array(particleCount * 3)
  
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 15
    positions[i * 3 + 1] = (Math.random() - 0.5) * 15
    positions[i * 3 + 2] = (Math.random() - 0.5) * 15
    
    const color = new THREE.Color()
    color.setHSL(Math.random(), 0.8, 0.6)
    colors[i * 3] = color.r
    colors[i * 3 + 1] = color.g
    colors[i * 3 + 2] = color.b
  }
  
  particles.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  particles.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  
  return (
    <points ref={particlesRef} geometry={particles}>
      <pointsMaterial
        size={0.05}
        vertexColors
        transparent
        opacity={0.8}
        sizeAttenuation
      />
    </points>
  )
}

export default function EnsembleBackground3D() {
  return (
    <div className="absolute inset-0 bg-gradient-to-b from-purple-950 via-pink-950/20 to-black">
      <Canvas
        camera={{ position: [0, 2, 10], fov: 60 }}
        gl={{ antialias: true, alpha: true }}
        className="absolute inset-0"
      >
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={0.5} color="#ff00ff" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#00ffff" />
        <pointLight position={[0, 0, 0]} intensity={0.8} color="#ffffff" />
        
        <Suspense fallback={null}>
          <EnsembleNetwork />
          <FloatingParticles />
        </Suspense>
        
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.3}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={Math.PI / 3}
        />
      </Canvas>
    </div>
  )
}