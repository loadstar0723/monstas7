'use client'

import React, { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Sphere, Cylinder, Box, Points, PointMaterial, MeshDistortMaterial, Float } from '@react-three/drei'
import * as THREE from 'three'

// 신비로운 나무 컴포넌트
function MysticTree({ position, scale = 1, color }: { position: [number, number, number], scale?: number, color: string }) {
  const treeRef = useRef<THREE.Group>(null)
  const leavesRef = useRef<THREE.Mesh>(null)
  const glowRef = useRef<THREE.Mesh>(null)
  
  useFrame((state) => {
    if (leavesRef.current) {
      leavesRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5 + position[0]) * 0.1
      leavesRef.current.scale.setScalar(scale + Math.sin(state.clock.elapsedTime * 0.8) * 0.05)
    }
    if (glowRef.current) {
      if (glowRef.current.material && glowRef.current.material.opacity !== undefined) {
        glowRef.current.material.opacity = 0.3 + Math.sin(state.clock.elapsedTime * 2) * 0.1
    }
  })
  
  return (
    <group ref={treeRef} position={position}>
      {/* 나무 줄기 */}
      <Cylinder args={[0.2 * scale, 0.4 * scale, 3 * scale, 8]}>
        <meshStandardMaterial 
          color="#1a1a2e" 
          emissive="#16213e"
          emissiveIntensity={0.2}
          roughness={0.8}
        />
      </Cylinder>
      
      {/* 신비로운 잎사귀 */}
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <group ref={leavesRef} position={[0, 2 * scale, 0]}>
          {/* 메인 크라운 */}
          <Sphere args={[1.5 * scale, 32, 32]}>
            <MeshDistortMaterial
              color={color}
              emissive={color}
              emissiveIntensity={0.3}
              roughness={0.3}
              metalness={0.8}
              distort={0.2}
              speed={2}
            />
          </Sphere>
          
          {/* 글로우 효과 */}
          <Sphere ref={glowRef} args={[1.8 * scale, 16, 16]}>
            <meshBasicMaterial
              color={color}
              transparent
              opacity={0.3}
              blending={THREE.AdditiveBlending}
            />
          </Sphere>
        </group>
      </Float>
      
      {/* 마법의 파티클 */}
      <MagicParticles position={[0, 2 * scale, 0]} color={color} scale={scale} />
    </group>
  )
}

// 마법 파티클 효과
function MagicParticles({ position, color, scale }: any) {
  const particlesRef = useRef<THREE.Points>(null)
  
  const particleCount = 50
  const positions = useMemo(() => {
    const pos = new Float32Array(particleCount * 3)
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2
      const radius = (isNaN(2) ? 1 : 2) * Math.random() * scale
      pos[i * 3] = Math.cos(angle) * radius
      pos[i * 3 + 1] = (isNaN(2) ? 1 : 2) * Math.random() * scale
      pos[i * 3 + 2] = Math.sin(angle) * radius
    }
    return pos
  }, [scale])
  
  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.5
      const positions = particlesRef.current.geometry?.attributes?.position?.array as Float32Array
      
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3
        const val1 = Math.sin(state.clock.elapsedTime * 2 + i) * scale + scale
      }
      
      particlesRef.current.geometry.attributes.position.needsUpdate = true
    }
  })
  
  return (
    <points ref={particlesRef} position={position}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color={color}
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

// 크리스탈 컴포넌트
function Crystal({ position, color }: { position: [number, number, number], color: string }) {
  const crystalRef = useRef<THREE.Mesh>(null)
  
  useFrame((state) => {
    if (crystalRef.current) {
      crystalRef.current.rotation.y = state.clock.elapsedTime * 0.5
      crystalRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime) * 0.2
    }
  })
  
  return (
    <Float speed={1} rotationIntensity={1} floatIntensity={0.5}>
      <mesh ref={crystalRef} position={position}>
        <octahedronGeometry args={[0.3, 0]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={1}
          metalness={1}
          roughness={0}
        />
      </mesh>
    </Float>
  )
}

// 빛나는 포털
function GlowingPortal() {
  const portalRef = useRef<THREE.Mesh>(null)
  
  useFrame((state) => {
    if (portalRef.current) {
      portalRef.current.rotation.z = state.clock.elapsedTime * 0.2
    }
  })
  
  return (
    <group position={[0, 5, -10]}>
      <mesh ref={portalRef}>
        <torusGeometry args={[3, 0.5, 16, 100]} />
        <meshStandardMaterial
          color="#ff00ff"
          emissive="#ff00ff"
          emissiveIntensity={2}
          metalness={1}
          roughness={0}
        />
      </mesh>
      
      {/* 포털 중심 */}
      <mesh>
        <planeGeometry args={[6, 6]} />
        <meshBasicMaterial
          color="#000033"
          opacity={0.8}
          transparent
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  )
}

// 환상적인 안개
function FantasyFog() {
  const fogRef = useRef<THREE.Points>(null)
  
  const fogCount = 1000
  const positions = useMemo(() => {
    const pos = new Float32Array(fogCount * 3)
    for (let i = 0; i < fogCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 50
      pos[i * 3 + 1] = Math.random() * 10
      pos[i * 3 + 2] = (Math.random() - 0.5) * 50
    }
    return pos
  }, [])
  
  useFrame((state) => {
    if (fogRef.current) {
      fogRef.current.rotation.y = state.clock.elapsedTime * 0.02
      fogRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.5
    }
  })
  
  return (
    <points ref={fogRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={fogCount}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.1}
        color="#4466ff"
        transparent
        opacity={0.3}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

// 데이터 플로우 시각화
function DataFlow() {
  const flowRef = useRef<THREE.Group>(null)
  
  useFrame((state) => {
    if (flowRef.current) {
      flowRef.current.rotation.y = state.clock.elapsedTime * 0.1
    }
  })
  
  return (
    <group ref={flowRef}>
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i / 8) * Math.PI * 2
        const radius = 10
        
        return (
          <Float key={i} speed={1.5} rotationIntensity={0.5}>
            <group position={[
              Math.cos(angle) * radius,
              5 + Math.sin(i) * 2,
              Math.sin(angle) * radius
            ]}>
              <Box args={[0.5, 0.5, 0.5]}>
                <meshStandardMaterial
                  color="#00ff88"
                  emissive="#00ff88"
                  emissiveIntensity={0.5}
                  metalness={1}
                  roughness={0}
                />
              </Box>
              
              {/* 연결선 */}
              {i < 7 && (
                <mesh>
                  <cylinderGeometry args={[0.02, 0.02, radius * 0.3, 8]} />
                  <meshBasicMaterial color="#00ff88" opacity={0.5} transparent />
                </mesh>
              )}
            </group>
          </Float>
        )
      })}
    </group>
  )
}

export function MysticForestBackground3D() {
  const treeColors = ['#0066ff', '#0099ff', '#00ccff', '#00ffcc', '#00ff99', '#00ff66']
  
  return (
    <div className="fixed inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 10, 25], fov: 60 }}
        gl={{ antialias: true, alpha: true }}
      >
        <color attach="background" args={['#000816']} />
        <fog attach="fog" args={['#000816', 20, 60]} />
        
        {/* 조명 설정 */}
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 20, 10]} intensity={0.5} color="#6688ff" />
        <pointLight position={[-10, 15, -10]} intensity={0.5} color="#ff6688" />
        <spotLight
          position={[0, 30, 0]}
          angle={0.5}
          penumbra={1}
          intensity={1}
          color="#00ffff"
        />
        
        {/* 신비로운 나무들 */}
        {Array.from({ length: 30 }).map((_, i) => {
          const x = (Math.random() - 0.5) * 40
          const z = (Math.random() - 0.5) * 40
          const scale = 0.8 + Math.random() * 0.6
          const color = treeColors[Math.floor(Math.random() * treeColors.length)]
          
          return (
            <MysticTree
              key={i}
              position={[x, 0, z]}
              scale={scale}
              color={color}
            />
          )
        })}
        
        {/* 크리스탈들 */}
        {Array.from({ length: 20 }).map((_, i) => (
          <Crystal
            key={i}
            position={[
              (Math.random() - 0.5) * 30,
              Math.random() * 5 + 2,
              (Math.random() - 0.5) * 30
            ]}
            color={treeColors[i % treeColors.length]}
          />
        ))}
        
        {/* 특수 효과들 */}
        <GlowingPortal />
        <FantasyFog />
        <DataFlow />
        
        {/* 바닥 효과 */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
          <planeGeometry args={[100, 100]} />
          <meshStandardMaterial
            color="#000033"
            metalness={0.8}
            roughness={0.2}
            emissive="#000066"
            emissiveIntensity={0.1}
          />
        </mesh>
        
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.3}
          maxPolarAngle={Math.PI * 0.7}
          minPolarAngle={Math.PI * 0.3}
        />
      </Canvas>
    </div>
  )
}