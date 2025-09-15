'use client'

import React, { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { 
  OrbitControls, 
  PerspectiveCamera,
  MeshDistortMaterial,
  GradientTexture,
  Environment,
  Float,
  Trail,
  Sparkles
} from '@react-three/drei'
import * as THREE from 'three'

// 물결 메쉬 컴포넌트
function WaveMesh({ position, scale = 1 }: { position: [number, number, number], scale?: number }) {
  const meshRef = useRef<THREE.Mesh>(null)
  
  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.elapsedTime
      meshRef.current.rotation.z = time * 0.1
      
      // 물결 애니메이션
      const positions = meshRef.current.geometry.attributes.position as THREE.BufferAttribute
      for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i)
        const y = positions.getY(i)
        const waveX = Math.sin(x * 0.5 + time) * 0.3
        const waveY = Math.sin(y * 0.5 + time * 0.8) * 0.3
        positions.setZ(i, waveX + waveY)
      }
      positions.needsUpdate = true
    }
  })

  return (
    <mesh ref={meshRef} position={position} scale={scale}>
      <planeGeometry args={[10, 10, 32, 32]} />
      <MeshDistortMaterial
        color="#0088ff"
        emissive="#00ffff"
        emissiveIntensity={0.2}
        distort={0.3}
        speed={2}
        transparent
        opacity={0.8}
        side={THREE.DoubleSide}
      >
        <GradientTexture
          stops={[0, 0.5, 1]}
          colors={['#0088ff', '#00ffff', '#0044ff']}
        />
      </MeshDistortMaterial>
    </mesh>
  )
}

// 플로팅 오브 (데이터 포인트)
function DataOrb({ position }: { position: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const trailRef = useRef<any>(null)
  
  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.elapsedTime
      // 랜덤한 궤도 운동
      meshRef.current.position.x = position[0] + Math.sin(time * 0.5 + position[0]) * 2
      meshRef.current.position.y = position[1] + Math.cos(time * 0.7 + position[1]) * 1.5
      meshRef.current.position.z = position[2] + Math.sin(time * 0.3 + position[2]) * 1
      
      // 빛나는 효과
      const material = meshRef.current.material as THREE.MeshStandardMaterial
      if (material && material.emissiveIntensity !== undefined) {
        material.emissiveIntensity = 0.5 + Math.sin(time * 3) * 0.5
      }
    }
  })

  const color = useMemo(() => {
    const colors = ['#00ff88', '#00ffff', '#ff00ff', '#ffff00', '#ff0088']
    return colors[Math.floor((isNaN(colors) ? 1 : colors) * Math.random().length)]
  }, [])

  return (
    <Trail
      width={3}
      length={10}
      color={color}
      attenuation={(t) => t * t}
    >
      <Float speed={2} rotationIntensity={1} floatIntensity={2}>
        <mesh ref={meshRef} position={position}>
          <sphereGeometry args={[0.2, 32, 32]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.5}
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>
      </Float>
    </Trail>
  )
}

// 시간 흐름을 나타내는 리본
function TimeRibbon({ index }: { index: number }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const curve = useMemo(() => {
    const points = []
    for (let i = 0; i < 50; i++) {
      points.push(new THREE.Vector3(
        i - 25,
        Math.sin((i / 50) * Math.PI * 2) * 3,
        Math.cos((i / 50) * Math.PI * 2) * 3
      ))
    }
    return new THREE.CatmullRomCurve3(points)
  }, [])

  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.elapsedTime
      meshRef.current.rotation.x = time * 0.2 + index * 0.5
      meshRef.current.rotation.y = time * 0.1
      
      // 색상 변화
      const material = meshRef.current.material as THREE.MeshStandardMaterial
      const hue = (time * 0.1 + index * 0.2) % 1
      material.color.setHSL(hue, 1, 0.5)
      material.emissive.setHSL(hue, 1, 0.3)
    }
  })

  return (
    <mesh ref={meshRef}>
      <tubeGeometry args={[curve, 100, 0.3, 8, false]} />
      <meshStandardMaterial
        color="#0088ff"
        emissive="#0088ff"
        emissiveIntensity={0.3}
        metalness={0.8}
        roughness={0.2}
        transparent
        opacity={0.6}
      />
    </mesh>
  )
}

// 중앙 시계열 구조
function TimeSeriesCore() {
  const groupRef = useRef<THREE.Group>(null)
  
  useFrame((state) => {
    if (groupRef.current) {
      const time = state.clock.elapsedTime
      groupRef.current.rotation.y = time * 0.1
      groupRef.current.position.y = Math.sin(time * 0.2) * 0.5
    }
  })

  return (
    <group ref={groupRef}>
      {/* 중앙 코어 */}
      <mesh>
        <icosahedronGeometry args={[1, 2]} />
        <MeshDistortMaterial
          color="#ffffff"
          emissive="#ffffff"
          emissiveIntensity={1}
          distort={0.3}
          speed={2}
          transparent
          opacity={0.8}
        />
      </mesh>
      
      {/* 궤도 링 */}
      {[0, 1, 2].map((i) => (
        <mesh key={i} rotation={[0, 0, i * Math.PI / 3]}>
          <torusGeometry args={[3 + i, 0.1, 16, 100]} />
          <meshStandardMaterial
            color={`hsl(${i * 120}, 100%, 50%)`}
            emissive={`hsl(${i * 120}, 100%, 50%)`}
            emissiveIntensity={0.5}
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>
      ))}
    </group>
  )
}

// 메인 씬
function WaveScene() {
  // 데이터 오브 위치
  const orbPositions: [number, number, number][] = useMemo(() => {
    const positions: [number, number, number][] = []
    for (let i = 0; i < 20; i++) {
      positions.push([
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 20
      ])
    }
    return positions
  }, [])

  return (
    <>
      {/* 조명 */}
      <ambientLight intensity={0.2} />
      <directionalLight position={[10, 10, 5]} intensity={0.5} castShadow />
      <pointLight position={[0, 0, 0]} intensity={2} color="#00ffff" />
      
      {/* 안개 효과 */}
      <fog attach="fog" args={['#000033', 10, 50]} />
      
      {/* 배경 물결 */}
      <WaveMesh position={[0, -5, -10]} scale={2} />
      <WaveMesh position={[0, 5, -15]} scale={1.5} />
      
      {/* 시계열 코어 */}
      <TimeSeriesCore />
      
      {/* 시간 리본들 */}
      {[0, 1, 2].map((i) => (
        <TimeRibbon key={i} index={i} />
      ))}
      
      {/* 데이터 오브들 */}
      {orbPositions.map((pos, i) => (
        <DataOrb key={i} position={pos} />
      ))}
      
      {/* 반짝이는 파티클 */}
      <Sparkles
        count={300}
        scale={30}
        size={2}
        speed={0.5}
        color="#00ffff"
      />
      
      {/* 환경 */}
      <Environment preset="night" />
    </>
  )
}

export function WaveBackground3D() {
  return (
    <div className="fixed inset-0 z-0">
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[0, 5, 20]} fov={60} />
        <WaveScene />
        <OrbitControls 
          enablePan={false} 
          enableZoom={false} 
          enableRotate={true}
          autoRotate
          autoRotateSpeed={0.3}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 1.5}
        />
      </Canvas>
    </div>
  )
}