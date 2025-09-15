'use client'

import React, { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Sphere, Box, Line, MeshDistortMaterial, Points, PointMaterial } from '@react-three/drei'
import * as THREE from 'three'

// 메인 신경망 구조
function NeuralNetworkCore() {
  const groupRef = useRef<THREE.Group>(null)
  const time = useRef(0)
  
  // 더 복잡한 신경망 구조
  const layers = useMemo(() => [
    { neurons: 5, x: -8, color: '#4a00ff' },
    { neurons: 8, x: -4, color: '#6600ff' },
    { neurons: 12, x: 0, color: '#8800ff' },
    { neurons: 8, x: 4, color: '#aa00ff' },
    { neurons: 4, x: 8, color: '#cc00ff' }
  ], [])
  
  useFrame((state, delta) => {
    if (groupRef.current) {
      time.current += delta
      groupRef.current.rotation.y = Math.sin(time.current * 0.1) * 0.2
      groupRef.current.position.y = Math.sin(time.current * 0.2) * 0.5
    }
  })
  
  return (
    <group ref={groupRef}>
      {/* 뉴런 생성 */}
      {layers.map((layer, layerIndex) => (
        <React.Fragment key={layerIndex}>
          {Array.from({ length: layer.neurons }, (_, i) => {
            const y = (i - layer.neurons / 2) * 1.5
            const z = Math.sin(i * 0.5 + layerIndex) * 2
            
            return (
              <group key={`${layerIndex}-${i}`} position={[layer.x, y, z]}>
                {/* 뉴런 코어 */}
                <Sphere args={[0.3, 32, 32]}>
                  <meshStandardMaterial
                    color={layer.color}
                    emissive={layer.color}
                    emissiveIntensity={0.5}
                    metalness={0.8}
                    roughness={0.2}
                  />
                </Sphere>
                
                {/* 뉴런 주변 글로우 */}
                <Sphere args={[0.4, 16, 16]}>
                  <meshBasicMaterial
                    color={layer.color}
                    transparent
                    opacity={0.2}
                  />
                </Sphere>
                
                {/* 펄싱 이펙트 */}
                <PulsingNeuron
                  position={[0, 0, 0]}
                  color={layer.color}
                  delay={i * 0.1 + layerIndex * 0.5}
                />
              </group>
            )
          })}
          
          {/* 다음 레이어와 연결 */}
          {layerIndex < layers.length - 1 && (
            <ConnectionLines
              fromLayer={layers[layerIndex]}
              toLayer={layers[layerIndex + 1]}
              fromIndex={layerIndex}
              toIndex={layerIndex + 1}
            />
          )}
        </React.Fragment>
      ))}
    </group>
  )
}

// 펄싱 뉴런 효과
function PulsingNeuron({ position, color, delay }: any) {
  const meshRef = useRef<THREE.Mesh>(null)
  
  useFrame((state) => {
    if (meshRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 3 + delay) * 0.5 + 0.5
      meshRef.current.scale.setScalar(1 + pulse * 0.5)
      if (meshRef.current.material && meshRef.current.material.opacity !== undefined) {
        meshRef.current.material.opacity = pulse * 0.3
      }
    }
  })
  
  return (
    <Sphere ref={meshRef} args={[0.6, 16, 16]} position={position}>
      <meshBasicMaterial
        color={color}
        transparent
        opacity={0}
      />
    </Sphere>
  )
}

// 연결선 생성
function ConnectionLines({ fromLayer, toLayer, fromIndex, toIndex }: any) {
  const connections = useMemo(() => {
    const conns = []
    
    for (let i = 0; i < fromLayer.neurons; i++) {
      for (let j = 0; j < toLayer.neurons; j++) {
        if (Math.random() > 0.6) { // 40% 연결
          const fromY = (i - fromLayer.neurons / 2) * 1.5
          const toY = (j - toLayer.neurons / 2) * 1.5
          const fromZ = Math.sin(i * 0.5 + fromIndex) * 2
          const toZ = Math.sin(j * 0.5 + toIndex) * 2
          
          conns.push({
            start: [fromLayer.x, fromY, fromZ],
            end: [toLayer.x, toY, toZ],
            color: Math.random() > 0.5 ? '#0066ff' : '#0099ff'
          })
        }
      }
    }
    
    return conns
  }, [fromLayer, toLayer, fromIndex, toIndex])
  
  return (
    <>
      {connections.map((conn, i) => (
        <FlowingConnection key={i} {...conn} delay={i * 0.1} />
      ))}
    </>
  )
}

// 데이터 흐름 애니메이션
function FlowingConnection({ start, end, color, delay }: any) {
  const lineRef = useRef<any>(null)
  const [flowProgress, setFlowProgress] = React.useState(0)
  
  useFrame((state, delta) => {
    setFlowProgress((prev) => {
      const next = prev + delta * 0.5
      return next > 1 ? 0 : next
    })
  })
  
  const points = useMemo(() => [
    new THREE.Vector3(...start),
    new THREE.Vector3(...end)
  ], [start, end])
  
  return (
    <>
      {/* 기본 연결선 */}
      <Line
        points={points}
        color="#001144"
        lineWidth={1}
        opacity={0.3}
        transparent
      />
      
      {/* 데이터 흐름 */}
      <Sphere
        args={[0.08, 8, 8]}
        position={[
          start[0] + (end[0] - start[0]) * flowProgress,
          start[1] + (end[1] - start[1]) * flowProgress,
          start[2] + (end[2] - start[2]) * flowProgress
        ]}
      >
        <meshBasicMaterial color={color} />
      </Sphere>
    </>
  )
}

// 배경 파티클 필드
function ParticleField() {
  const points = useRef<THREE.Points>(null)
  
  const particlesPosition = useMemo(() => {
    const positions = new Float32Array(2000 * 3)
    for (let i = 0; i < 2000; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 50
      positions[i * 3 + 1] = (Math.random() - 0.5) * 50
      positions[i * 3 + 2] = (Math.random() - 0.5) * 50
    }
    return positions
  }, [])
  
  useFrame((state) => {
    if (points.current) {
      points.current.rotation.x = state.clock.elapsedTime * 0.01
      points.current.rotation.y = state.clock.elapsedTime * 0.02
    }
  })
  
  return (
    <Points ref={points} positions={particlesPosition} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#0044ff"
        size={0.02}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={0.6}
      />
    </Points>
  )
}

// 홀로그램 그리드
function HologramGrid() {
  const gridRef = useRef<THREE.GridHelper>(null)
  
  useFrame((state) => {
    if (gridRef.current) {
      const material = gridRef.current.material as any
      if (material && material.opacity !== undefined) {
        material.opacity = 0.1 + Math.sin(state.clock.elapsedTime) * 0.05
      }
    }
  })
  
  return (
    <>
      <gridHelper ref={gridRef} args={[30, 30, '#0033ff', '#001166']} />
      <gridHelper args={[30, 30, '#0033ff', '#001166']} rotation={[Math.PI / 2, 0, 0]} />
    </>
  )
}

// 에너지 코어
function EnergyCore() {
  const coreRef = useRef<THREE.Mesh>(null)
  
  useFrame((state) => {
    if (coreRef.current) {
      coreRef.current.rotation.x = state.clock.elapsedTime * 0.5
      coreRef.current.rotation.y = state.clock.elapsedTime * 0.3
      coreRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 2) * 0.1)
    }
  })
  
  return (
    <mesh ref={coreRef}>
      <dodecahedronGeometry args={[1, 0]} />
      <meshStandardMaterial
        color="#0066ff"
        emissive="#0099ff"
        emissiveIntensity={2}
        wireframe
      />
    </mesh>
  )
}

export function UltraDarkNeuralBackground3D() {
  return (
    <div className="fixed inset-0 -z-10">
      <div className="absolute inset-0 bg-black" />
      <Canvas
        camera={{ position: [0, 0, 20], fov: 60 }}
        gl={{ antialias: true, alpha: true }}
      >
        <color attach="background" args={['#000000']} />
        <fog attach="fog" args={['#000000', 10, 50]} />
        
        {/* 조명 설정 */}
        <ambientLight intensity={0.1} />
        <pointLight position={[10, 10, 10]} intensity={0.2} color="#0066ff" />
        <pointLight position={[-10, -10, -10]} intensity={0.2} color="#6600ff" />
        <spotLight
          position={[0, 10, 0]}
          angle={0.3}
          penumbra={1}
          intensity={0.5}
          color="#0099ff"
        />
        
        {/* 메인 컴포넌트들 */}
        <NeuralNetworkCore />
        <ParticleField />
        <HologramGrid />
        <EnergyCore />
        
        {/* 카메라 컨트롤 */}
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.2}
          maxPolarAngle={Math.PI * 0.6}
          minPolarAngle={Math.PI * 0.4}
        />
      </Canvas>
      
      {/* 추가 그라데이션 오버레이 */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black opacity-50 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black opacity-30 pointer-events-none" />
    </div>
  )
}