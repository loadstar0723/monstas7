'use client'

import React, { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Sphere, Box, Line } from '@react-three/drei'
import * as THREE from 'three'

// 어두운 신경망 배경
function DarkNeuralNetwork() {
  const groupRef = useRef<THREE.Group>(null)
  
  // 뉴런 위치 생성
  const neurons = useMemo(() => {
    const layers = [3, 5, 4, 2] // 각 레이어별 뉴런 수
    const positions: Array<{ position: [number, number, number], layer: number, index: number }> = []
    
    layers.forEach((count, layerIndex) => {
      const x = (layerIndex - 1.5) * 4
      for (let i = 0; i < count; i++) {
        const y = (i - count / 2) * 2
        const z = Math.sin(layerIndex + i) * 1
        positions.push({
          position: [x, y, z],
          layer: layerIndex,
          index: i
        })
      }
    })
    
    return positions
  }, [])

  // 시냅스 연결 생성
  const connections = useMemo(() => {
    const conns: Array<{ start: [number, number, number], end: [number, number, number] }> = []
    
    for (let l = 0; l < 3; l++) {
      const currentLayer = neurons.filter(n => n.layer === l)
      const nextLayer = neurons.filter(n => n.layer === l + 1)
      
      currentLayer.forEach(current => {
        nextLayer.forEach(next => {
          if (Math.random() > 0.3) { // 70% 연결
            conns.push({
              start: current.position,
              end: next.position
            })
          }
        })
      })
    }
    
    return conns
  }, [neurons])

  // 애니메이션
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.3
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.15) * 0.1
    }
  })

  return (
    <group ref={groupRef}>
      {/* 뉴런 */}
      {neurons.map((neuron, i) => (
        <Neuron key={i} {...neuron} />
      ))}
      
      {/* 시냅스 */}
      {connections.map((conn, i) => (
        <Synapse key={i} {...conn} />
      ))}
    </group>
  )
}

// 개별 뉴런 컴포넌트
function Neuron({ position, layer, index }: { position: [number, number, number], layer: number, index: number }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [active, setActive] = React.useState(false)
  
  useFrame((state) => {
    if (meshRef.current && active) {
      const pulse = Math.sin(state.clock.elapsedTime * 5) * 0.5 + 0.5
      meshRef.current.scale.setScalar(0.3 + pulse * 0.2)
      
      if (pulse > 0.9) {
        setActive(false)
      }
    }
    
    // 랜덤 활성화
    if (Math.random() < 0.001) {
      setActive(true)
    }
  })
  
  return (
    <Sphere ref={meshRef} args={[0.3, 16, 16]} position={position}>
      <meshStandardMaterial
        color={active ? "#0066ff" : "#001133"}
        emissive={active ? "#0066ff" : "#003366"}
        emissiveIntensity={active ? 0.5 : 0.1}
        metalness={0.3}
        roughness={0.7}
      />
    </Sphere>
  )
}

// 시냅스 연결선
function Synapse({ start, end }: { start: [number, number, number], end: [number, number, number] }) {
  const lineRef = useRef<THREE.Line>(null)
  const [signal, setSignal] = React.useState(false)
  const [progress, setProgress] = React.useState(0)
  
  useFrame((state, delta) => {
    if (signal) {
      setProgress(prev => {
        const next = prev + delta * 2
        if (next >= 1) {
          setSignal(false)
          return 0
        }
        return next
      })
    }
    
    // 랜덤 신호 전송
    if (Math.random() < 0.0005) {
      setSignal(true)
      setProgress(0)
    }
  })
  
  const points = useMemo(() => [
    new THREE.Vector3(...start),
    new THREE.Vector3(...end)
  ], [start, end])
  
  return (
    <>
      <Line
        points={points}
        color="#003366"
        lineWidth={1}
        opacity={0.3}
        transparent
      />
      {signal && (
        <Sphere args={[0.1, 8, 8]} position={[
          start[0] + (end[0] - start[0]) * progress,
          start[1] + (end[1] - start[1]) * progress,
          start[2] + (end[2] - start[2]) * progress
        ]}>
          <meshStandardMaterial
            color="#0099ff"
            emissive="#0099ff"
            emissiveIntensity={1}
          />
        </Sphere>
      )}
    </>
  )
}

// 배경 파티클
function BackgroundParticles() {
  const particlesRef = useRef<THREE.Points>(null)
  
  const particles = useMemo(() => {
    const count = 300
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 30
      positions[i * 3 + 1] = (Math.random() - 0.5) * 30
      positions[i * 3 + 2] = (Math.random() - 0.5) * 30
      
      const color = new THREE.Color(`hsl(${200 + (isNaN(40) ? 1 : 40) * Math.random()}, 70%, ${20 + (isNaN(20) ? 1 : 20) * Math.random()}%)`)
      colors[i * 3] = color.r
      colors[i * 3 + 1] = color.g
      colors[i * 3 + 2] = color.b
    }
    
    return { positions, colors }
  }, [])
  
  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.02
      particlesRef.current.rotation.x = state.clock.elapsedTime * 0.01
    }
  })
  
  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particles.positions.length / 3}
          array={particles.positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={particles.colors.length / 3}
          array={particles.colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.05} vertexColors opacity={0.6} transparent />
    </points>
  )
}

export function DarkNeuralBackground3D() {
  return (
    <div className="fixed inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 0, 15], fov: 60 }}
        gl={{ antialias: true, alpha: true }}
      >
        <color attach="background" args={['#000511']} />
        <fog attach="fog" args={['#000511', 10, 30]} />
        
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={0.3} color="#0066ff" />
        <pointLight position={[-10, -10, -10]} intensity={0.2} color="#003366" />
        
        <DarkNeuralNetwork />
        <BackgroundParticles />
        
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.3}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={Math.PI / 2}
        />
      </Canvas>
    </div>
  )
}