'use client'

import React, { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { 
  Float, 
  OrbitControls, 
  MeshDistortMaterial,
  Environment,
  Sparkles
} from '@react-three/drei'
import * as THREE from 'three'

// 패턴 노드 컴포넌트
function PatternNode({ position, color, size = 1 }: any) {
  const meshRef = useRef<THREE.Mesh>(null)
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime + position[0]) * 0.1
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime + position[1]) * 0.1
    }
  })

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <mesh ref={meshRef} position={position}>
        <octahedronGeometry args={[size, 0]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.5}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
    </Float>
  )
}

// 연결선 컴포넌트
function ConnectionLine({ start, end }: { start: THREE.Vector3; end: THREE.Vector3 }) {
  const curve = useMemo(() => {
    const midPoint = new THREE.Vector3(
      (start.x + end.x) / 2,
      (start.y + end.y) / 2 + Math.random() * 2 - 1,
      (start.z + end.z) / 2
    )
    return new THREE.QuadraticBezierCurve3(start, midPoint, end)
  }, [start, end])

  const points = curve.getPoints(50)
  const geometry = new THREE.BufferGeometry().setFromPoints(points)

  return (
    <line>
      <bufferGeometry attach="geometry" {...geometry} />
      <lineBasicMaterial attach="material" color="#8b5cf6" opacity={0.3} transparent />
    </line>
  )
}

// 패턴 그리드
function PatternGrid() {
  const groupRef = useRef<THREE.Group>(null)
  
  const nodes = useMemo(() => {
    const nodeArray = []
    const gridSize = 5
    const spacing = 4
    
    for (let x = -gridSize; x <= gridSize; x++) {
      for (let z = -gridSize; z <= gridSize; z++) {
        const y = Math.sin(x * 0.5) * Math.cos(z * 0.5) * 2
        nodeArray.push({
          position: [x * spacing, y, z * spacing],
          color: x % 2 === 0 ? '#8b5cf6' : '#ec4899',
          size: 0.5 + Math.random() * 0.5
        })
      }
    }
    return nodeArray
  }, [])

  const connections = useMemo(() => {
    const connectionArray = []
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dist = Math.sqrt(
          Math.pow(nodes[i].position[0] - nodes[j].position[0], 2) +
          Math.pow(nodes[i].position[1] - nodes[j].position[1], 2) +
          Math.pow(nodes[i].position[2] - nodes[j].position[2], 2)
        )
        if (dist < 6 && Math.random() > 0.7) {
          connectionArray.push({
            start: new THREE.Vector3(...nodes[i].position),
            end: new THREE.Vector3(...nodes[j].position)
          })
        }
      }
    }
    return connectionArray
  }, [nodes])

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.05
    }
  })

  return (
    <group ref={groupRef}>
      {nodes.map((node, index) => (
        <PatternNode key={index} {...node} />
      ))}
      {connections.map((connection, index) => (
        <ConnectionLine key={index} {...connection} />
      ))}
    </group>
  )
}

// 플로팅 차트 패턴
function FloatingPattern({ type }: { type: string }) {
  const meshRef = useRef<THREE.Mesh>(null)
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.5
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.5
    }
  })

  const getGeometry = () => {
    switch (type) {
      case 'triangle':
        return <coneGeometry args={[2, 3, 3]} />
      case 'head-shoulders':
        return <cylinderGeometry args={[1, 2, 3, 16]} />
      case 'flag':
        return <boxGeometry args={[3, 2, 0.2]} />
      default:
        return <tetrahedronGeometry args={[2]} />
    }
  }

  return (
    <Float speed={3} rotationIntensity={1} floatIntensity={2}>
      <mesh ref={meshRef} position={[Math.random() * 20 - 10, Math.random() * 10, Math.random() * 20 - 10]}>
        {getGeometry()}
        <MeshDistortMaterial
          color="#ec4899"
          emissive="#8b5cf6"
          emissiveIntensity={0.5}
          metalness={0.8}
          roughness={0.2}
          distort={0.3}
          speed={2}
        />
      </mesh>
    </Float>
  )
}

export function PatternMatrixBackground3D() {
  return (
    <div className="fixed inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 10, 25], fov: 60 }}
        gl={{ antialias: true, alpha: true }}
      >
        <fog attach="fog" args={['#000000', 10, 50]} />
        
        {/* 조명 */}
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={0.5} color="#8b5cf6" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ec4899" />
        <spotLight
          position={[0, 20, 0]}
          angle={0.3}
          penumbra={1}
          intensity={0.5}
          color="#ffffff"
          castShadow
        />

        {/* 패턴 그리드 */}
        <PatternGrid />

        {/* 플로팅 패턴들 */}
        <FloatingPattern type="triangle" />
        <FloatingPattern type="head-shoulders" />
        <FloatingPattern type="flag" />
        
        {/* 파티클 효과 */}
        <Sparkles
          count={100}
          scale={30}
          size={2}
          speed={0.5}
          opacity={0.5}
          color="#8b5cf6"
        />

        {/* 환경 */}
        <Environment preset="city" />
        
        {/* 카메라 컨트롤 */}
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.5}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={Math.PI / 4}
        />
      </Canvas>

      {/* 그라데이션 오버레이 */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-purple-900/10 via-transparent to-transparent pointer-events-none" />
    </div>
  )
}