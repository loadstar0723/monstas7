'use client'

import React, { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Line, Text3D, Center, Float, Trail, MeshTransmissionMaterial } from '@react-three/drei'
import * as THREE from 'three'

// 시계열 파동 컴포넌트
function TimeWave({ position, amplitude = 1, frequency = 1, color = "#00ffff" }: {
  position: [number, number, number]
  amplitude?: number
  frequency?: number
  color?: string
}) {
  const waveRef = useRef<THREE.Group>(null)
  
  const points = useMemo(() => {
    const pts = []
    for (let i = 0; i <= 100; i++) {
      const x = (i / 100) * 20 - 10
      const y = 0
      const z = 0
      pts.push(new THREE.Vector3(x, y, z))
    }
    return pts
  }, [])
  
  useFrame((state) => {
    if (waveRef.current) {
      const time = state.clock.elapsedTime
      const geometry = waveRef.current.children[0]?.geometry as THREE.BufferGeometry
      if (geometry && geometry.attributes.position) {
        const positions = geometry?.attributes?.position?.array as Float32Array
        
        for (let i = 0; i < positions.length; i += 3) {
          const x = positions[i]
          positions[i + 1] = Math.sin((x + time) * frequency) * amplitude
        }
        
        geometry.attributes.position.needsUpdate = true
      }
    }
  })
  
  return (
    <group ref={waveRef} position={position}>
      <Line
        points={points}
        color={color}
        lineWidth={3}
        transparent
        opacity={0.8}
      />
    </group>
  )
}

// 시간 흐름 파티클
function TimeFlowParticles() {
  const particlesRef = useRef<THREE.Points>(null)
  
  const particleCount = 1000
  const positions = useMemo(() => {
    const pos = new Float32Array(particleCount * 3)
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 50
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20
      pos[i * 3 + 2] = Math.random() * 50 - 25
    }
    return pos
  }, [])
  
  useFrame((state) => {
    if (particlesRef.current) {
      const positions = particlesRef.current.geometry?.attributes?.position?.array as Float32Array
      
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3
        
        // Z축으로 이동 (시간의 흐름)
        positions[i3 + 2] -= 0.1
        
        // 파동 효과
        positions[i3 + 1] = Math.sin(positions[i3 + 2] * 0.1 + state.clock.elapsedTime) * 2
        
        // 리셋
        if (positions[i3 + 2] < -25) {
          positions[i3 + 2] = 25
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
      </bufferGeometry>
      <pointsMaterial
        fontSize={0.05}
        color="#00ff88"
        transparent
        opacity={0.6}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

// 예측 구간 시각화
function PredictionCone({ position }: { position: [number, number, number] }) {
  const coneRef = useRef<THREE.Mesh>(null)
  
  useFrame((state) => {
    if (coneRef.current) {
      coneRef.current.rotation.z = -Math.PI / 2
      const material = coneRef.current.material as any
      if (material && material.opacity !== undefined) {
        material.opacity = 0.2 + Math.sin(state.clock.elapsedTime * 2) * 0.1
      }
    }
  })
  
  return (
    <mesh ref={coneRef} position={position}>
      <coneGeometry args={[0.5, 10, 32, 1, true]} />
      <meshStandardMaterial
        color="#ffff00"
        emissive="#ffff00"
        emissiveIntensity={0.3}
        transparent
        opacity={0.3}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}

// 시계열 데이터 포인트
function DataPoint({ position, delay = 0 }: { position: [number, number, number], delay?: number }) {
  const pointRef = useRef<THREE.Mesh>(null)
  
  useFrame((state) => {
    if (pointRef.current) {
      const time = state.clock.elapsedTime + delay
      pointRef.current.scale.setScalar(0.8 + Math.sin(time * 3) * 0.2)
    }
  })
  
  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <mesh ref={pointRef} position={position}>
        <sphereGeometry args={[0.2, 32, 32]} />
        <meshStandardMaterial
          color="#00ffff"
          emissive="#00ffff"
          emissiveIntensity={0.8}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
    </Float>
  )
}

// 시간 격자
function TimeGrid() {
  const gridRef = useRef<THREE.Group>(null)
  
  useFrame((state) => {
    if (gridRef.current) {
      gridRef.current.position.z = -((state.clock.elapsedTime * 2) % 5)
    }
  })
  
  return (
    <group ref={gridRef}>
      {Array.from({ length: 20 }).map((_, i) => (
        <group key={i}>
          {/* 수직선 */}
          <mesh position={[0, 0, i * 5 - 50]}>
            <boxGeometry args={[0.02, 10, 0.02]} />
            <meshBasicMaterial color="#003366" opacity={0.3} transparent />
          </mesh>
          
          {/* 수평선 */}
          <mesh position={[0, i - 10, 0]}>
            <boxGeometry args={[20, 0.02, 100]} />
            <meshBasicMaterial color="#003366" opacity={0.2} transparent />
          </mesh>
        </group>
      ))}
    </group>
  )
}

// ARIMA 수식 3D
function ARIMAFormula() {
  return (
    <Float speed={1} rotationIntensity={0.2} floatIntensity={0.3}>
      <group position={[0, 8, 0]}>
        <Center>
          <Text3D font="https://threejs.org/examples/fonts/helvetiker_bold.typeface.json" anchorX="center" anchorY="middle"
            
            size={0.8}
            height={0.2}
            curveSegments={12}
          >
            ARIMA(p,d,q)
            <meshStandardMaterial
              color="#ffffff"
              emissive="#00ffff"
              emissiveIntensity={0.3}
              metalness={0.8}
              roughness={0.2}
            />
          </Text3D>
        </Center>
      </group>
    </Float>
  )
}

// 이동 평균선
function MovingAverage({ data, color }: { data: number[], color: string }) {
  const lineRef = useRef<THREE.Line>(null)
  
  const points = useMemo(() => {
    return data.map((y, i) => new THREE.Vector3(i - data.length / 2, y, 0))
  }, [data])
  
  useFrame((state) => {
    if (lineRef.current) {
      lineRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1
    }
  })
  
  return (
    <line ref={lineRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={points.length}
          array={new Float32Array(points.flatMap(p => [
            isNaN(p.x) ? 0 : p.x,
            isNaN(p.y) ? 0 : p.y,
            isNaN(p.z) ? 0 : p.z
          ]))}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial color={color} linewidth={2} />
    </line>
  )
}

// 시간축 화살표
function TimeAxis() {
  return (
    <group position={[0, -5, 0]}>
      {/* 화살표 축 */}
      <mesh rotation={[0, 0, -Math.PI / 2]}>
        <cylinderGeometry args={[0.05, 0.05, 30, 8]} />
        <meshBasicMaterial color="#666666" />
      </mesh>
      
      {/* 화살표 머리 */}
      <mesh position={[15, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.3, 1, 8]} />
        <meshBasicMaterial color="#666666" />
      </mesh>
      
      {/* 시간 라벨 */}
      <Center position={[16, -1, 0]}>
        <Text3D font="https://threejs.org/examples/fonts/helvetiker_bold.typeface.json" anchorX="center" anchorY="middle"
          
          size={0.5}
          height={0.1}
        >
          Time
          <meshBasicMaterial color="#999999" />
        </Text3D>
      </Center>
    </group>
  )
}

export function TimeSeriesFlow3D() {
  // 샘플 데이터
  const sampleData = useMemo(() => {
    return Array.from({ length: 20 }, (_, i) => Math.sin(i * 0.5) * 2 + Math.random() * 0.5)
  }, [])
  
  return (
    <div className="fixed inset-0 -z-10">
      <Canvas
        camera={{ position: [15, 10, 20], fov: 60 }}
        gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping }}
      >
        <color attach="background" args={['#000511']} />
        <fog attach="fog" args={['#000511', 30, 80]} />
        
        {/* 조명 설정 */}
        <ambientLight intensity={0.3} />
        <directionalLight position={[10, 20, 5]} intensity={0.5} color="#00ffff" />
        <pointLight position={[0, 10, 0]} intensity={0.8} color="#ffffff" />
        <pointLight position={[-20, 5, -20]} intensity={0.5} color="#ff00ff" />
        <pointLight position={[20, 5, 20]} intensity={0.5} color="#00ff00" />
        
        {/* 시계열 파동들 */}
        <TimeWave position={[0, 0, 0]} amplitude={2} frequency={0.5} color="#00ffff" />
        <TimeWave position={[0, 3, 0]} amplitude={1.5} frequency={0.7} color="#00ff00" />
        <TimeWave position={[0, -3, 0]} amplitude={1} frequency={1} color="#ff00ff" />
        
        {/* 시간 흐름 효과 */}
        <TimeFlowParticles />
        <TimeGrid />
        <TimeAxis />
        
        {/* ARIMA 컴포넌트 */}
        <ARIMAFormula />
        <PredictionCone position={[10, 0, 0]} />
        
        {/* 데이터 포인트들 */}
        {Array.from({ length: 10 }).map((_, i) => (
          <DataPoint
            key={i}
            position={[i * 2 - 10, Math.sin(i * 0.5) * 2, 0]}
            delay={i * 0.2}
          />
        ))}
        
        {/* 이동 평균선 */}
        <MovingAverage data={sampleData} color="#ffff00" />
        
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.2}
          maxPolarAngle={Math.PI * 0.7}
          minPolarAngle={Math.PI * 0.2}
        />
      </Canvas>
    </div>
  )
}