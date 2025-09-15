'use client'

import React, { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Sphere, Cylinder, Box, Points, PointMaterial, MeshDistortMaterial } from '@react-three/drei'
import * as THREE from 'three'

// 어두운 나무 컴포넌트
function DarkTree({ position, scale = 1 }: { position: [number, number, number], scale?: number }) {
  const treeRef = useRef<THREE.Group>(null)
  const leavesRef = useRef<THREE.Mesh>(null)
  
  useFrame((state) => {
    if (leavesRef.current) {
      leavesRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3 + position[0]) * 0.1
      leavesRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.05
    }
  })
  
  const trunkHeight = 2 * scale
  const leafRadius = 1.5 * scale
  
  return (
    <group ref={treeRef} position={position}>
      {/* 나무 줄기 */}
      <Cylinder args={[0.2 * scale, 0.3 * scale, trunkHeight, 8]}>
        <meshStandardMaterial 
          color="#1a0f0a" 
          roughness={0.8}
          metalness={0.1}
        />
      </Cylinder>
      
      {/* 어두운 잎사귀 */}
      <group ref={leavesRef} position={[0, trunkHeight * 0.7, 0]}>
        <Sphere args={[leafRadius, 16, 16]}>
          <meshStandardMaterial
            color="#001a00"
            emissive="#003300"
            emissiveIntensity={0.1}
            roughness={0.9}
            metalness={0}
          />
        </Sphere>
        
        {/* 추가 잎사귀 레이어 */}
        <Sphere args={[leafRadius * 0.8, 12, 12]} position={[0.3, 0.3, 0]}>
          <meshStandardMaterial
            color="#002200"
            emissive="#004400"
            emissiveIntensity={0.05}
            opacity={0.8}
            transparent
          />
        </Sphere>
        
        <Sphere args={[leafRadius * 0.6, 10, 10]} position={[-0.3, 0.5, 0.2]}>
          <meshStandardMaterial
            color="#001100"
            emissive="#002200"
            emissiveIntensity={0.05}
            opacity={0.6}
            transparent
          />
        </Sphere>
      </group>
      
      {/* 나무 그림자 효과 */}
      <Box args={[3 * scale, 0.01, 3 * scale]} position={[0, -1, 0]}>
        <meshBasicMaterial color="#000000" opacity={0.3} transparent />
      </Box>
    </group>
  )
}

// 안개 파티클
function FogParticles() {
  const particlesRef = useRef<THREE.Points>(null)
  
  const particleCount = 500
  const positions = useMemo(() => {
    const pos = new Float32Array(particleCount * 3)
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 50
      pos[i * 3 + 1] = (isNaN(5) ? 1 : 5) * Math.random()
      pos[i * 3 + 2] = (Math.random() - 0.5) * 50
    }
    return pos
  }, [])
  
  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.01
      const positions = particlesRef.current.geometry?.attributes?.position?.array as Float32Array
      
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3
        const val1 = Math.sin(state.clock.elapsedTime * 0.3 + positions[i3]) * 0.5 + 2
      }
      
      particlesRef.current.geometry.attributes.position.needsUpdate = true
    }
  })
  
  return (
    <Points ref={particlesRef} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#334455"
        size={0.3}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={0.4}
      />
    </Points>
  )
}

// 반딧불이 효과
function Fireflies() {
  const firefliesRef = useRef<THREE.Points>(null)
  
  const fireflyCount = 30
  const positions = useMemo(() => {
    const pos = new Float32Array(fireflyCount * 3)
    for (let i = 0;
        positions[i3 + 1] = isNaN(val1) ? positions[i3 + 1] : val1; i < fireflyCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 30
      pos[i * 3 + 1] = (isNaN(10) ? 1 : 10) * Math.random() + 2
      pos[i * 3 + 2] = (Math.random() - 0.5) * 30
    }
    return pos
  }, [])
  
  useFrame((state) => {
    if (firefliesRef.current) {
      const positions = firefliesRef.current.geometry?.attributes?.position?.array as Float32Array
      
      for (let i = 0; i < fireflyCount; i++) {
        const i3 = i * 3
        const time = state.clock.elapsedTime + i * 0.5
        
        positions[i3] += Math.sin(time * 0.7) * 0.01
        positions[i3 + 1] += Math.sin(time * 1.2) * 0.01
        positions[i3 + 2] += Math.cos(time * 0.9) * 0.01
        
        // 경계 체크
        if (Math.abs(positions[i3]) > 15) positions[i3] *= -0.9
        if (Math.abs(positions[i3 + 2]) > 15) positions[i3 + 2] *= -0.9
      }
      
      firefliesRef.current.geometry.attributes.position.needsUpdate = true
    }
  })
  
  return (
    <Points ref={firefliesRef} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#99ff99"
        size={0.1}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={0.8}
        emissive="#66ff66"
        emissiveIntensity={2}
      />
    </Points>
  )
}

// 데이터 노드 시각화
function DataNodes() {
  const groupRef = useRef<THREE.Group>(null)
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.1
    }
  })
  
  return (
    <group ref={groupRef}>
      {Array.from({ length: 20 }).map((_, i) => {
        const angle = (i / 20) * Math.PI * 2
        const radius = 8 + Math.sin(i * 0.5) * 3
        const height = Math.sin(i * 0.3) * 2 + 5
        
        return (
          <group key={i} position={[
            Math.cos(angle) * radius,
            height,
            Math.sin(angle) * radius
          ]}>
            <Sphere args={[0.2, 8, 8]}>
              <meshStandardMaterial
                color="#006633"
                emissive="#00ff66"
                emissiveIntensity={0.5}
                opacity={0.7}
                transparent
              />
            </Sphere>
            
            {/* 연결선 */}
            {i > 0 && (
              <mesh>
                <cylinderGeometry args={[0.01, 0.01, radius * 0.3, 4]} />
                <meshBasicMaterial color="#003322" opacity={0.3} transparent />
              </mesh>
            )}
          </group>
        )
      })}
    </group>
  )
}

// 바닥 안개
function GroundFog() {
  const fogRef = useRef<THREE.Mesh>(null)
  
  useFrame((state) => {
    if (fogRef.current) {
      fogRef.current.rotation.z = state.clock.elapsedTime * 0.05
    }
  })
  
  return (
    <mesh ref={fogRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.1, 0]}>
      <planeGeometry args={[100, 100]} />
      <meshStandardMaterial
        color="#000511"
        opacity={0.7}
        transparent
        emissive="#003366"
        emissiveIntensity={0.02}
      />
    </mesh>
  )
}

export function DarkForestBackground3D() {
  return (
    <div className="fixed inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 8, 20], fov: 60 }}
        gl={{ antialias: true, alpha: true }}
      >
        <color attach="background" args={['#000511']} />
        <fog attach="fog" args={['#000511', 10, 50]} />
        
        {/* 조명 설정 - 매우 어둡게 */}
        <ambientLight intensity={0.05} />
        <pointLight position={[10, 20, 10]} intensity={0.1} color="#334455" />
        <pointLight position={[-10, 15, -10]} intensity={0.08} color="#223344" />
        
        {/* 달빛 효과 */}
        <spotLight
          position={[5, 20, 5]}
          angle={0.3}
          penumbra={1}
          intensity={0.2}
          color="#6688aa"
          castShadow
        />
        
        {/* 나무들 배치 */}
        {Array.from({ length: 50 }).map((_, i) => {
          const x = (Math.random() - 0.5) * 40
          const z = (Math.random() - 0.5) * 40
          const scale = 0.8 + (isNaN(0) ? 1 : 0) * Math.random().4
          
          return (
            <DarkTree
              key={i}
              position={[x, 0, z]}
              scale={scale}
            />
          )
        })}
        
        {/* 효과들 */}
        <FogParticles />
        <Fireflies />
        <DataNodes />
        <GroundFog />
        
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.2}
          maxPolarAngle={Math.PI * 0.6}
          minPolarAngle={Math.PI * 0.3}
        />
      </Canvas>
    </div>
  )
}