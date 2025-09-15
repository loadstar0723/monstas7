'use client'

import React, { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Sphere, Box, Line, MeshDistortMaterial } from '@react-three/drei'
import * as THREE from 'three'

// 신경망 노드 컴포넌트
function NeuralNode({ position, color = '#8b5cf6' }: { position: [number, number, number], color?: string }) {
  const meshRef = useRef<THREE.Mesh>(null)
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.01
      meshRef.current.rotation.y += 0.01
      meshRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 2) * 0.1)
    }
  })

  return (
    <Sphere ref={meshRef} position={position} args={[0.3, 16, 16]}>
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.5}
        metalness={0.8}
        roughness={0.2}
      />
    </Sphere>
  )
}

// 연결선 컴포넌트
function Connection({ start, end }: { start: [number, number, number], end: [number, number, number] }) {
  const points = useMemo(() => [
    new THREE.Vector3(...start),
    new THREE.Vector3(...end)
  ], [start, end])

  return (
    <Line
      points={points}
      color="#8b5cf6"
      lineWidth={1}
      opacity={0.3}
      transparent
    />
  )
}

// 플로팅 패턴 박스
function PatternBox({ position }: { position: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null)
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.5
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime) * 0.5
    }
  })

  return (
    <Box ref={meshRef} position={position} args={[0.5, 0.5, 0.5]}>
      <MeshDistortMaterial
        color="#ec4899"
        emissive="#ec4899"
        emissiveIntensity={0.2}
        metalness={0.9}
        roughness={0.1}
        distort={0.3}
        speed={2}
      />
    </Box>
  )
}

// 메인 신경망 구조
function NeuralStructure() {
  const groupRef = useRef<THREE.Group>(null)
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.1
    }
  })

  // 신경망 레이어 구조
  const layers = [
    { z: -3, nodes: 3, color: '#3b82f6' },  // 입력층
    { z: -1, nodes: 5, color: '#8b5cf6' },  // 은닉층 1
    { z: 1, nodes: 5, color: '#ec4899' },   // 은닉층 2
    { z: 3, nodes: 2, color: '#10b981' }    // 출력층
  ]

  const nodes: Array<{ position: [number, number, number], color: string, layer: number }> = []
  
  layers.forEach((layer, layerIndex) => {
    for (let i = 0; i < layer.nodes; i++) {
      const angle = (i / layer.nodes) * Math.PI * 2
      const radius = 2
      nodes.push({
        position: [
          Math.cos(angle) * radius,
          Math.sin(angle) * radius,
          layer.z
        ],
        color: layer.color,
        layer: layerIndex
      })
    }
  })

  // 연결선 생성
  const connections: Array<{ start: [number, number, number], end: [number, number, number] }> = []
  
  for (let i = 0; i < layers.length - 1; i++) {
    const currentLayerNodes = nodes.filter(n => n.layer === i)
    const nextLayerNodes = nodes.filter(n => n.layer === i + 1)
    
    currentLayerNodes.forEach(currentNode => {
      nextLayerNodes.forEach(nextNode => {
        connections.push({
          start: currentNode.position,
          end: nextNode.position
        })
      })
    })
  }

  return (
    <group ref={groupRef}>
      {/* 노드 렌더링 */}
      {nodes.map((node, index) => (
        <NeuralNode key={index} position={node.position} color={node.color} />
      ))}
      
      {/* 연결선 렌더링 */}
      {connections.map((connection, index) => (
        <Connection key={index} start={connection.start} end={connection.end} />
      ))}
      
      {/* 플로팅 패턴 박스들 */}
      <PatternBox position={[3, 2, 0]} />
      <PatternBox position={[-3, -2, 0]} />
      <PatternBox position={[0, 3, 2]} />
      <PatternBox position={[0, -3, -2]} />
    </group>
  )
}

// 파티클 시스템
function ParticleField() {
  const particlesRef = useRef<THREE.Points>(null)
  
  const particles = useMemo(() => {
    const count = 1000
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20
      
      const color = new THREE.Color()
      color.setHSL(0.7 + Math.random() * 0.3, 0.8, 0.5)
      colors[i * 3] = color.r
      colors[i * 3 + 1] = color.g
      colors[i * 3 + 2] = color.b
    }
    
    return { positions, colors }
  }, [])
  
  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.05
      particlesRef.current.rotation.x = state.clock.elapsedTime * 0.03
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
      <pointsMaterial size={0.05} vertexColors transparent opacity={0.6} />
    </points>
  )
}

export default function NeuralPatternBackground3D() {
  return (
    <div className="fixed inset-0 -z-10">
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-purple-900/20 to-black" />
      <Canvas
        camera={{ position: [0, 0, 10], fov: 60 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={0.5} color="#8b5cf6" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ec4899" />
        
        <NeuralStructure />
        <ParticleField />
        
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.5}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={Math.PI / 3}
        />
      </Canvas>
      
      {/* 오버레이 그라데이션 */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
    </div>
  )
}