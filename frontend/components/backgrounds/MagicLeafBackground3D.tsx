'use client'

import React, { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Sphere, Box, MeshDistortMaterial, Float, Stars } from '@react-three/drei'
import * as THREE from 'three'

// 마법의 나뭇잎
function MagicLeaf({ position, color, size = 1 }: { 
  position: [number, number, number], 
  color: string,
  size?: number 
}) {
  const leafRef = useRef<THREE.Mesh>(null)
  const glowRef = useRef<THREE.Mesh>(null)
  
  useFrame((state) => {
    if (leafRef.current) {
      // 나뭇잎 회전 및 떨어지는 효과
      leafRef.current.rotation.x += 0.01
      leafRef.current.rotation.y += 0.02
      leafRef.current.position.y -= 0.03
      
      // 바닥에 닿으면 다시 위로
      if (leafRef.current.position.y < -10) {
        leafRef.current.position.y = 15
        leafRef.current.position.x = position[0] + (Math.random() - 0.5) * 5
        leafRef.current.position.z = position[2] + (Math.random() - 0.5) * 5
      }
      
      // 좌우로 흔들리는 효과
      leafRef.current.position.x += Math.sin(state.clock.elapsedTime + position[0]) * 0.02
    }
    
    if (glowRef.current) {
      glowRef.current.scale.setScalar(size * (1 + Math.sin(state.clock.elapsedTime * 3) * 0.2))
    }
  })
  
  return (
    <group position={position}>
      <mesh ref={leafRef}>
        <coneGeometry args={[size * 0.5, size, 4]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.5}
          metalness={0.7}
          roughness={0.3}
        />
      </mesh>
      
      <mesh ref={glowRef}>
        <sphereGeometry args={[size * 0.7, 16, 16]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.3}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  )
}

// 빛나는 나무
function GlowingTree({ position }: { position: [number, number, number] }) {
  const treeRef = useRef<THREE.Group>(null)
  
  useFrame((state) => {
    if (treeRef.current) {
      treeRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1
    }
  })
  
  return (
    <Float speed={1} rotationIntensity={0.2} floatIntensity={0.3}>
      <group ref={treeRef} position={position}>
        {/* 나무 줄기 */}
        <mesh position={[0, 2, 0]}>
          <cylinderGeometry args={[0.5, 1, 4, 8]} />
          <meshStandardMaterial 
            color="#4a3020"
            roughness={0.8}
            metalness={0.2}
          />
        </mesh>
        
        {/* 나무 잎사귀 (구체들) */}
        <Sphere args={[2, 32, 32]} position={[0, 5, 0]}>
          <MeshDistortMaterial
            color="#00ff88"
            emissive="#00ff44"
            emissiveIntensity={0.5}
            roughness={0.3}
            metalness={0.8}
            distort={0.3}
            speed={2}
          />
        </Sphere>
        
        <Sphere args={[1.5, 32, 32]} position={[-1, 6, 0]}>
          <MeshDistortMaterial
            color="#00ffcc"
            emissive="#00ff88"
            emissiveIntensity={0.5}
            roughness={0.3}
            metalness={0.8}
            distort={0.3}
            speed={2}
          />
        </Sphere>
        
        <Sphere args={[1.5, 32, 32]} position={[1, 6, 0]}>
          <MeshDistortMaterial
            color="#88ff00"
            emissive="#66ff00"
            emissiveIntensity={0.5}
            roughness={0.3}
            metalness={0.8}
            distort={0.3}
            speed={2}
          />
        </Sphere>
      </group>
    </Float>
  )
}

// 빛나는 큐브 파티클
function GlowingCubes() {
  const cubesRef = useRef<THREE.Group>(null)
  
  useFrame((state) => {
    if (cubesRef.current) {
      cubesRef.current.rotation.y = state.clock.elapsedTime * 0.1
      cubesRef.current.children.forEach((child, i) => {
        child.position.y = 5 + Math.sin(state.clock.elapsedTime + i) * 2
        child.rotation.x = state.clock.elapsedTime + i
        child.rotation.z = state.clock.elapsedTime + i * 0.5
      })
    }
  })
  
  return (
    <group ref={cubesRef}>
      {Array.from({ length: 20 }).map((_, i) => {
        const angle = (i / 20) * Math.PI * 2
        const radius = 10 + Math.sin(i) * 3
        const color = new THREE.Color().setHSL(i / 20, 1, 0.6)
        
        return (
          <mesh
            key={i}
            position={[
              Math.cos(angle) * radius,
              5,
              Math.sin(angle) * radius
            ]}
          >
            <boxGeometry args={[0.5, 0.5, 0.5]} />
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={0.5}
              metalness={1}
              roughness={0}
            />
          </mesh>
        )
      })}
    </group>
  )
}

// 에너지 파티클
function EnergyParticles() {
  const particlesRef = useRef<THREE.Points>(null)
  
  const particleCount = 1000
  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(particleCount * 3)
    const col = new Float32Array(particleCount * 3)
    
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 50
      pos[i * 3 + 1] = Math.random() * 20
      pos[i * 3 + 2] = (Math.random() - 0.5) * 50
      
      const color = new THREE.Color()
      color.setHSL(Math.random(), 1, 0.7)
      col[i * 3] = color.r
      col[i * 3 + 1] = color.g
      col[i * 3 + 2] = color.b
    }
    
    return [pos, col]
  }, [])
  
  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.05
      
      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3
        positions[i3 + 1] += Math.sin(state.clock.elapsedTime + i * 0.01) * 0.01
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

// 빛나는 링
function GlowingRings() {
  const ringsRef = useRef<THREE.Group>(null)
  
  useFrame((state) => {
    if (ringsRef.current) {
      ringsRef.current.children.forEach((child, i) => {
        child.rotation.x = state.clock.elapsedTime * (0.5 + i * 0.1)
        child.rotation.y = state.clock.elapsedTime * (0.3 + i * 0.1)
      })
    }
  })
  
  return (
    <group ref={ringsRef} position={[0, 10, 0]}>
      {Array.from({ length: 5 }).map((_, i) => {
        const color = new THREE.Color().setHSL(i / 5, 1, 0.6)
        
        return (
          <mesh key={i}>
            <torusGeometry args={[3 + i * 0.5, 0.1, 16, 64]} />
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={0.8}
              metalness={1}
              roughness={0}
            />
          </mesh>
        )
      })}
    </group>
  )
}

export function MagicLeafBackground3D() {
  const leafColors = ['#00ff88', '#00ffcc', '#88ff00', '#ffcc00', '#ff8800', '#ff00cc']
  
  return (
    <div className="fixed inset-0 -z-10">
      <Canvas
        camera={{ position: [20, 10, 25], fov: 60 }}
        gl={{ antialias: true, alpha: true }}
      >
        <color attach="background" args={['#0a0f1b']} />
        <fog attach="fog" args={['#0a0f1b', 20, 60]} />
        
        {/* 조명 설정 */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 20, 5]} intensity={1.5} color="#ffffff" castShadow />
        <pointLight position={[0, 15, 0]} intensity={2} color="#00ffcc" />
        <pointLight position={[-10, 10, -10]} intensity={1} color="#ff00cc" />
        <pointLight position={[10, 10, 10]} intensity={1} color="#88ff00" />
        <spotLight
          position={[0, 20, 0]}
          angle={0.6}
          penumbra={1}
          intensity={2}
          color="#ffffff"
        />
        
        {/* 떨어지는 나뭇잎들 */}
        {Array.from({ length: 50 }).map((_, i) => (
          <MagicLeaf
            key={i}
            position={[
              (Math.random() - 0.5) * 40,
              15 + Math.random() * 10,
              (Math.random() - 0.5) * 40
            ]}
            color={leafColors[i % leafColors.length]}
            size={0.5 + Math.random() * 0.5}
          />
        ))}
        
        {/* 빛나는 나무들 */}
        <GlowingTree position={[-8, 0, -5]} />
        <GlowingTree position={[8, 0, -8]} />
        <GlowingTree position={[0, 0, 5]} />
        <GlowingTree position={[-12, 0, 8]} />
        <GlowingTree position={[12, 0, 5]} />
        
        {/* 특수 효과들 */}
        <GlowingCubes />
        <EnergyParticles />
        <GlowingRings />
        
        {/* 별 배경 */}
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        
        {/* 바닥 */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
          <planeGeometry args={[100, 100]} />
          <meshStandardMaterial
            color="#0f1f2f"
            metalness={0.8}
            roughness={0.2}
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