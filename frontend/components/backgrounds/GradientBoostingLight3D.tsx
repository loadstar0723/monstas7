'use client'

import React, { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Stars, Float } from '@react-three/drei'
import * as THREE from 'three'

// 빛나는 리프 컴포넌트
function GlowingLeaf({ position, color, delay = 0 }: { position: [number, number, number], color: string, delay?: number }) {
  const meshRef = useRef<THREE.Mesh>(null)
  
  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.elapsedTime + delay
      meshRef.current.rotation.x = Math.sin(time) * 0.2
      meshRef.current.rotation.y = Math.cos(time) * 0.3
      meshRef.current.scale.setScalar(1 + Math.sin(time * 2) * 0.1)
    }
  })
  
  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={0.3}>
      <mesh ref={meshRef} position={position}>
        <coneGeometry args={[0.3, 0.8, 4]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.8}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
    </Float>
  )
}

// 그라디언트 파티클 시스템
function GradientParticles() {
  const particlesRef = useRef<THREE.Points>(null)
  
  const particleCount = 2000
  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(particleCount * 3)
    const col = new Float32Array(particleCount * 3)
    
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 40
      pos[i * 3 + 1] = Math.random() * 20 - 5
      pos[i * 3 + 2] = (Math.random() - 0.5) * 40
      
      // 그라디언트 색상
      const t = i / particleCount
      const color = new THREE.Color()
      color.setHSL(0.15 + t * 0.5, 1, 0.5 + t * 0.3) // 노란색에서 시안색으로
      col[i * 3] = color.r
      col[i * 3 + 1] = color.g
      col[i * 3 + 2] = color.b
    }
    
    return [pos, col]
  }, [])
  
  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.02
      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array
      
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3
        
        // 위로 올라가는 효과
        positions[i3 + 1] += 0.02
        
        // 나선형 움직임
        const angle = state.clock.elapsedTime + i * 0.01
        positions[i3] += Math.sin(angle) * 0.01
        positions[i3 + 2] += Math.cos(angle) * 0.01
        
        // 리셋
        if (positions[i3 + 1] > 15) {
          positions[i3 + 1] = -5
          positions[i3] = (Math.random() - 0.5) * 40
          positions[i3 + 2] = (Math.random() - 0.5) * 40
        }
      }
      
      particlesRef.current.geometry.attributes.position.needsUpdate = true
    }
  })
  
  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={particleCount}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.1}
        vertexColors
        transparent
        opacity={0.8}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

// 부스팅 트리 구조
function BoostingTree() {
  const treeRef = useRef<THREE.Group>(null)
  
  useFrame((state) => {
    if (treeRef.current) {
      treeRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.1
    }
  })
  
  const leafColors = ['#00ff88', '#00ffcc', '#00ccff', '#0088ff', '#88ff00', '#ffcc00']
  
  return (
    <group ref={treeRef}>
      {/* 트렁크 */}
      <mesh position={[0, -2, 0]}>
        <cylinderGeometry args={[0.5, 1, 6, 8]} />
        <meshStandardMaterial color="#2a4a3a" roughness={0.8} />
      </mesh>
      
      {/* 리프 노드들 */}
      {Array.from({ length: 30 }).map((_, i) => {
        const level = Math.floor(i / 5)
        const angleInLevel = (i % 5) * (Math.PI * 2 / 5)
        const y = 2 + level * 1.5
        const radius = 3 - level * 0.5
        
        return (
          <GlowingLeaf
            key={i}
            position={[
              Math.cos(angleInLevel) * radius,
              y,
              Math.sin(angleInLevel) * radius
            ]}
            color={leafColors[i % leafColors.length]}
            delay={i * 0.1}
          />
        )
      })}
      
      {/* 연결선 (가지) */}
      <mesh>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={20}
            array={new Float32Array([
              0, 1, 0, -2, 3, 0,
              0, 1, 0, 2, 3, 0,
              0, 1, 0, 0, 3, -2,
              0, 1, 0, 0, 3, 2,
              -2, 3, 0, -2.5, 5, 0,
              -2, 3, 0, -1.5, 5, 0,
              2, 3, 0, 2.5, 5, 0,
              2, 3, 0, 1.5, 5, 0,
              0, 3, -2, -0.5, 5, -1.5,
              0, 3, 2, 0.5, 5, 1.5
            ])}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#4a7a5a" linewidth={2} />
      </mesh>
    </group>
  )
}

// 빛나는 구체들
function GlowingSpheres() {
  return (
    <>
      {Array.from({ length: 10 }).map((_, i) => {
        const angle = (i / 10) * Math.PI * 2
        const radius = 15
        const y = Math.sin(i) * 5
        const color = new THREE.Color().setHSL(i / 10, 1, 0.6)
        
        return (
          <Float key={i} speed={1 + i * 0.1} rotationIntensity={0.5} floatIntensity={1}>
            <mesh position={[
              Math.cos(angle) * radius,
              y,
              Math.sin(angle) * radius
            ]}>
              <sphereGeometry args={[0.5, 32, 32]} />
              <meshStandardMaterial
                color={color}
                emissive={color}
                emissiveIntensity={0.5}
                metalness={1}
                roughness={0}
              />
            </mesh>
          </Float>
        )
      })}
    </>
  )
}

// 에너지 링
function EnergyRings() {
  const ringsRef = useRef<THREE.Group>(null)
  
  useFrame((state) => {
    if (ringsRef.current) {
      ringsRef.current.children.forEach((child, i) => {
        child.rotation.z = state.clock.elapsedTime * (0.5 + i * 0.1)
        child.position.y = Math.sin(state.clock.elapsedTime + i) * 2
      })
    }
  })
  
  return (
    <group ref={ringsRef}>
      {Array.from({ length: 5 }).map((_, i) => (
        <mesh key={i} position={[0, i * 2 - 4, 0]}>
          <torusGeometry args={[8 + i * 2, 0.1, 16, 64]} />
          <meshStandardMaterial
            color={new THREE.Color().setHSL(0.2 + i * 0.1, 1, 0.6)}
            emissive={new THREE.Color().setHSL(0.2 + i * 0.1, 1, 0.4)}
            emissiveIntensity={0.8}
            metalness={1}
            roughness={0}
          />
        </mesh>
      ))}
    </group>
  )
}

export function GradientBoostingLight3D() {
  return (
    <div className="fixed inset-0 -z-10">
      <Canvas
        camera={{ position: [20, 10, 20], fov: 60 }}
        gl={{ antialias: true, alpha: true }}
      >
        <color attach="background" args={['#0a1525']} />
        <fog attach="fog" args={['#0a1525', 30, 80]} />
        
        {/* 조명 */}
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 20, 5]} intensity={1} color="#ffffff" />
        <pointLight position={[0, 15, 0]} intensity={2} color="#00ffcc" />
        <pointLight position={[-10, 10, -10]} intensity={1} color="#ff9900" />
        <pointLight position={[10, 10, 10]} intensity={1} color="#00ccff" />
        
        {/* 3D 요소들 */}
        <BoostingTree />
        <GradientParticles />
        <GlowingSpheres />
        <EnergyRings />
        
        {/* 별 배경 */}
        <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />
        
        {/* 바닥 */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -5, 0]}>
          <planeGeometry args={[100, 100, 20, 20]} />
          <meshStandardMaterial
            color="#0a2540"
            metalness={0.8}
            roughness={0.2}
            wireframe
          />
        </mesh>
        
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.3}
          maxPolarAngle={Math.PI * 0.8}
          minPolarAngle={Math.PI * 0.2}
        />
      </Canvas>
    </div>
  )
}