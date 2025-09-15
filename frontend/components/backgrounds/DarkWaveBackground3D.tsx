'use client'

import React, { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { 
  OrbitControls, 
  PerspectiveCamera,
  MeshDistortMaterial,
  Float,
  Trail,
  Sparkles,
  Stars
} from '@react-three/drei'
import * as THREE from 'three'

// 어두운 물결 메쉬
function DarkWaveMesh({ position }: { position: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null)
  
  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.elapsedTime
      meshRef.current.rotation.z = time * 0.05
      
      // 물결 애니메이션
      const positions = meshRef.current.geometry.attributes.position as THREE.BufferAttribute
      for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i)
        const y = positions.getY(i)
        const waveX = Math.sin(x * 0.3 + time * 0.8) * 0.2
        const waveY = Math.cos(y * 0.3 + time * 0.6) * 0.2
        positions.setZ(i, waveX + waveY)
      }
      positions.needsUpdate = true
    }
  })

  return (
    <mesh ref={meshRef} position={position}>
      <planeGeometry args={[15, 15, 64, 64]} />
      <meshStandardMaterial
        color="#001133"
        emissive="#0066ff"
        emissiveIntensity={0.05}
        roughness={0.9}
        metalness={0.1}
        transparent
        opacity={0.3}
        side={THREE.DoubleSide}
        wireframe
      />
    </mesh>
  )
}

// 신비로운 에너지 구체
function MysticalOrb({ position }: { position: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const lightRef = useRef<THREE.PointLight>(null)
  
  useFrame((state) => {
    if (meshRef.current && lightRef.current) {
      const time = state.clock.elapsedTime
      
      // 부드러운 움직임
      meshRef.current.position.x = position[0] + Math.sin(time * 0.3) * 1
      meshRef.current.position.y = position[1] + Math.cos(time * 0.4) * 0.5
      meshRef.current.position.z = position[2] + Math.sin(time * 0.2) * 0.5
      
      // 크기 펄스
      const scale = 0.3 + Math.sin(time * 2) * 0.1
      meshRef.current.scale.setScalar(scale)
      
      // 빛 강도 변화
      lightRef.current.intensity = 0.5 + Math.sin(time * 3) * 0.3
    }
  })

  return (
    <group>
      <mesh ref={meshRef} position={position}>
        <sphereGeometry args={[0.3, 32, 32]} />
        <MeshDistortMaterial
          color="#0088ff"
          emissive="#00ffff"
          emissiveIntensity={0.3}
          distort={0.4}
          speed={2}
          roughness={0}
          metalness={1}
          transparent
          opacity={0.8}
        />
      </mesh>
      <pointLight ref={lightRef} position={position} color="#0088ff" intensity={0.5} distance={5} />
    </group>
  )
}

// 데이터 흐름 라인
function DataFlowLine({ index }: { index: number }) {
  const meshRef = useRef<THREE.Mesh>(null)
  
  const curve = useMemo(() => {
    const points = []
    for (let i = 0; i < 100; i++) {
      const t = i / 99
      const x = (t - 0.5) * 20
      const y = Math.sin(t * Math.PI * 2 + index) * 3
      const z = Math.cos(t * Math.PI * 2 + index) * 3
      points.push(new THREE.Vector3(x, y, z))
    }
    return new THREE.CatmullRomCurve3(points)
  }, [index])

  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.elapsedTime
      meshRef.current.rotation.x = time * 0.1
      meshRef.current.rotation.y = time * 0.05
      
      // 색상 변화
      const material = meshRef.current.material as THREE.MeshStandardMaterial
      const hue = (time * 0.05 + index * 0.1) % 1
      material.emissive.setHSL(hue, 0.5, 0.2)
    }
  })

  return (
    <mesh ref={meshRef}>
      <tubeGeometry args={[curve, 100, 0.1, 8, false]} />
      <meshStandardMaterial
        color="#001144"
        emissive="#0066ff"
        emissiveIntensity={0.2}
        transparent
        opacity={0.4}
        roughness={0.5}
        metalness={0.5}
      />
    </mesh>
  )
}

// 미래적인 격자
function FuturisticGrid() {
  return (
    <group>
      <gridHelper args={[50, 50, '#002244', '#001122']} position={[0, -5, 0]} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -5, 0]}>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial 
          color="#000011"
          transparent
          opacity={0.8}
          roughness={1}
        />
      </mesh>
    </group>
  )
}

// 떠다니는 숫자 데이터
function FloatingData({ position }: { position: [number, number, number] }) {
  const groupRef = useRef<THREE.Group>(null)
  const text = useMemo(() => Math.random().toFixed(4), [])
  
  useFrame((state) => {
    if (groupRef.current) {
      const time = state.clock.elapsedTime
      groupRef.current.position.y = position[1] + Math.sin(time + position[0]) * 0.3
      groupRef.current.rotation.y = time * 0.5
    }
  })

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <group ref={groupRef} position={position}>
        <mesh>
          <boxGeometry args={[0.1, 0.1, 0.1]} />
          <meshStandardMaterial
            color="#0066ff"
            emissive="#00ffff"
            emissiveIntensity={0.3}
            transparent
            opacity={0.6}
          />
        </mesh>
      </group>
    </Float>
  )
}

// 메인 씬
function DarkWaveScene() {
  // 오브 위치
  const orbPositions: [number, number, number][] = useMemo(() => [
    [-5, 2, -3],
    [5, 3, -2],
    [0, 4, -5],
    [-3, 1, 3],
    [3, 2, 2]
  ], [])

  // 데이터 위치
  const dataPositions: [number, number, number][] = useMemo(() => {
    const positions: [number, number, number][] = []
    for (let i = 0; i < 30; i++) {
      positions.push([
        (Math.random() - 0.5) * 20,
        (isNaN(5) ? 1 : 5) * Math.random(),
        (Math.random() - 0.5) * 20
      ])
    }
    return positions
  }, [])

  return (
    <>
      {/* 조명 - 매우 어둡게 */}
      <ambientLight intensity={0.05} />
      <directionalLight position={[10, 10, 5]} intensity={0.1} color="#0066ff" />
      
      {/* 안개 효과 - 진한 어둠 */}
      <fog attach="fog" args={['#000011', 5, 30]} />
      
      {/* 어두운 물결 */}
      <DarkWaveMesh position={[0, -3, -10]} />
      <DarkWaveMesh position={[0, 0, -15]} />
      <DarkWaveMesh position={[0, 3, -20]} />
      
      {/* 미래적인 격자 */}
      <FuturisticGrid />
      
      {/* 데이터 흐름 라인 */}
      {[0, 1, 2, 3, 4].map((i) => (
        <DataFlowLine key={i} index={i} />
      ))}
      
      {/* 신비로운 오브들 */}
      {orbPositions.map((pos, i) => (
        <MysticalOrb key={i} position={pos} />
      ))}
      
      {/* 떠다니는 데이터 */}
      {dataPositions.map((pos, i) => (
        <FloatingData key={i} position={pos} />
      ))}
      
      {/* 별들 - 우주 느낌 */}
      <Stars 
        radius={50} 
        depth={50} 
        count={5000} 
        factor={2} 
        saturation={0} 
        fade 
        speed={0.5}
      />
      
      {/* 파티클 효과 */}
      <Sparkles
        count={100}
        scale={20}
        size={1}
        speed={0.2}
        color="#0066ff"
        opacity={0.5}
      />
    </>
  )
}

export function DarkWaveBackground3D() {
  return (
    <div className="fixed inset-0 z-0 bg-black">
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[0, 2, 15]} fov={60} />
        <DarkWaveScene />
        <OrbitControls 
          enablePan={false} 
          enableZoom={false} 
          enableRotate={true}
          autoRotate
          autoRotateSpeed={0.2}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 1.5}
        />
      </Canvas>
    </div>
  )
}