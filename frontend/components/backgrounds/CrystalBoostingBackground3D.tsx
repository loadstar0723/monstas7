'use client'

import React, { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Sphere, Box, Text, Float, MeshDistortMaterial } from '@react-three/drei'
import * as THREE from 'three'

// 크리스탈 리프 노드
function CrystalLeaf({ position, color, scale = 1 }: { 
  position: [number, number, number], 
  color: string,
  scale?: number
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  const glowRef = useRef<THREE.Mesh>(null)
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime + position[0]) * 0.3
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.5
    }
    if (glowRef.current) {
      const glowScale = 1.2 + Math.sin(state.clock.elapsedTime * 2) * 0.1
      glowRef.current.scale.setScalar(glowScale * scale)
    }
  })
  
  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <group position={position}>
        {/* 크리스탈 */}
        <mesh ref={meshRef}>
          <octahedronGeometry args={[0.6 * scale, 0]} />
          <meshPhysicalMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.5}
            metalness={0.9}
            roughness={0.1}
            clearcoat={1}
            clearcoatRoughness={0}
            transmission={0.5}
            thickness={0.5}
          />
        </mesh>
        
        {/* 글로우 */}
        <mesh ref={glowRef}>
          <sphereGeometry args={[0.8 * scale, 16, 16]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.3}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      </group>
    </Float>
  )
}

// 에너지 흐름
function EnergyFlow() {
  const flowRef = useRef<THREE.Points>(null)
  
  const particleCount = 500
  const positions = useMemo(() => {
    const pos = new Float32Array(particleCount * 3)
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2 * 3
      const radius = 2 + (i / particleCount) * 10
      const y = (i / particleCount) * 15 - 5
      
      pos[i * 3] = Math.cos(angle) * radius
      pos[i * 3 + 1] = y
      pos[i * 3 + 2] = Math.sin(angle) * radius
    }
    return pos
  }, [])
  
  useFrame((state) => {
    if (flowRef.current) {
      flowRef.current.rotation.y = state.clock.elapsedTime * 0.2
      
      const posArray = flowRef.current.geometry.attributes.position.array as Float32Array
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3
        const offset = Math.sin(state.clock.elapsedTime * 2 + i * 0.1) * 0.5
        const angle = (i / particleCount) * Math.PI * 2 * 3 + state.clock.elapsedTime
        const radius = 2 + (i / particleCount) * 10 + offset
        
        posArray[i3] = Math.cos(angle) * radius
        posArray[i3 + 2] = Math.sin(angle) * radius
      }
      flowRef.current.geometry.attributes.position.needsUpdate = true
    }
  })
  
  const colors = useMemo(() => {
    const col = new Float32Array(particleCount * 3)
    for (let i = 0; i < particleCount; i++) {
      const t = i / particleCount
      const color = new THREE.Color()
      color.setHSL(0.5 + t * 0.3, 1, 0.5 + t * 0.3)
      col[i * 3] = color.r
      col[i * 3 + 1] = color.g
      col[i * 3 + 2] = color.b
    }
    return col
  }, [])
  
  return (
    <points ref={flowRef}>
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
        size={0.2}
        vertexColors
        transparent
        opacity={0.8}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

// 부스팅 타워
function BoostingTower() {
  const towerRef = useRef<THREE.Group>(null)
  
  useFrame((state) => {
    if (towerRef.current) {
      towerRef.current.rotation.y = state.clock.elapsedTime * 0.1
    }
  })
  
  const colors = ['#00ffff', '#00ff88', '#88ff00', '#ffaa00', '#ff00aa', '#aa00ff']
  
  return (
    <group ref={towerRef}>
      {/* 중심 기둥 */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.5, 1, 20, 8]} />
        <meshStandardMaterial
          color="#1a3355"
          emissive="#001133"
          emissiveIntensity={0.3}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      
      {/* 크리스탈 노드들 */}
      {Array.from({ length: 6 }).map((_, level) => {
        const y = -8 + level * 3
        return Array.from({ length: 4 }).map((_, i) => {
          const angle = (i / 4) * Math.PI * 2 + level * 0.5
          const radius = 2 + Math.sin(level * 0.5) * 0.5
          
          return (
            <CrystalLeaf
              key={`${level}-${i}`}
              position={[
                Math.cos(angle) * radius,
                y,
                Math.sin(angle) * radius
              ]}
              color={colors[(level + i) % colors.length]}
              scale={0.8 + level * 0.1}
            />
          )
        })
      })}
    </group>
  )
}

// 데이터 스트림
function DataStreams() {
  return (
    <>
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i / 8) * Math.PI * 2
        const radius = 12
        
        return (
          <Float key={i} speed={1.5} rotationIntensity={0.3} floatIntensity={0.5}>
            <Box
              position={[
                Math.cos(angle) * radius,
                Math.sin(i * 2) * 3,
                Math.sin(angle) * radius
              ]}
              args={[0.5, 0.5, 0.5]}
            >
              <MeshDistortMaterial
                color={new THREE.Color().setHSL(i / 8, 1, 0.6)}
                emissive={new THREE.Color().setHSL(i / 8, 1, 0.4)}
                emissiveIntensity={0.5}
                metalness={0.8}
                roughness={0.2}
                distort={0.2}
                speed={2}
              />
            </Box>
          </Float>
        )
      })}
    </>
  )
}

// 광선 효과
function LightBeams() {
  const beamsRef = useRef<THREE.Group>(null)
  
  useFrame((state) => {
    if (beamsRef.current) {
      beamsRef.current.rotation.y = state.clock.elapsedTime * 0.05
    }
  })
  
  return (
    <group ref={beamsRef}>
      {Array.from({ length: 6 }).map((_, i) => {
        const angle = (i / 6) * Math.PI * 2
        
        return (
          <mesh key={i} position={[0, 0, 0]} rotation={[0, angle, 0]}>
            <planeGeometry args={[0.5, 30]} />
            <meshBasicMaterial
              color={new THREE.Color().setHSL(i / 6, 1, 0.7)}
              transparent
              opacity={0.1}
              side={THREE.DoubleSide}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        )
      })}
    </group>
  )
}

// 타이틀
function Title() {
  return (
    <Float speed={0.5} rotationIntensity={0.1} floatIntensity={0.3}>
      <Text
        position={[0, 12, -5]}
        fontSize={3}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        LightGBM
        <meshStandardMaterial
          color="#ffffff"
          emissive="#00ffff"
          emissiveIntensity={0.5}
        />
      </Text>
    </Float>
  )
}

export function CrystalBoostingBackground3D() {
  return (
    <div className="fixed inset-0 -z-10">
      <Canvas
        camera={{ position: [15, 8, 20], fov: 60 }}
        gl={{ antialias: true, alpha: true }}
      >
        <color attach="background" args={['#051025']} />
        <fog attach="fog" args={['#051025', 20, 60]} />
        
        {/* 조명 */}
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 20, 5]} intensity={1.2} color="#ffffff" />
        <pointLight position={[0, 10, 0]} intensity={2} color="#00ffff" />
        <pointLight position={[-10, 5, -10]} intensity={1} color="#ff00ff" />
        <pointLight position={[10, 5, 10]} intensity={1} color="#00ff88" />
        <spotLight
          position={[0, 20, 0]}
          angle={0.5}
          penumbra={1}
          intensity={2}
          color="#ffffff"
          castShadow
        />
        
        {/* 3D 요소들 */}
        <BoostingTower />
        <EnergyFlow />
        <DataStreams />
        <LightBeams />
        <Title />
        
        {/* 바닥 반사 */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -10, 0]} receiveShadow>
          <planeGeometry args={[60, 60]} />
          <meshStandardMaterial
            color="#0a1a3a"
            metalness={0.9}
            roughness={0.1}
            envMapIntensity={0.5}
          />
        </mesh>
        
        {/* 파티클 배경 */}
        <Sphere args={[40, 32, 32]}>
          <meshBasicMaterial
            color="#000511"
            side={THREE.BackSide}
          />
        </Sphere>
        
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