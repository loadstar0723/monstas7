'use client'

import React, { useRef, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { 
  OrbitControls, 
  PerspectiveCamera, 
  Sphere, 
  Box,
  Cone,
  MeshDistortMaterial,
  Float,
  Environment,
  Stars
} from '@react-three/drei'
import * as THREE from 'three'

// 나무 컴포넌트
function Tree({ position, scale = 1 }: { position: [number, number, number], scale?: number }) {
  const meshRef = useRef<THREE.Group>(null)
  const trunkRef = useRef<THREE.Mesh>(null)
  const leavesRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5 + position[0]) * 0.1
    }
    if (leavesRef.current) {
      leavesRef.current.rotation.y += 0.001
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.05
      leavesRef.current.scale.setScalar(scale)
    }
  })

  return (
    <group ref={meshRef} position={position} scale={scale}>
      {/* 나무 줄기 */}
      <Box ref={trunkRef} args={[0.5, 2, 0.5]} position={[0, 1, 0]}>
        <meshStandardMaterial color="#8B4513" roughness={0.8} />
      </Box>
      
      {/* 나뭇잎 (여러 층) */}
      <group ref={leavesRef}>
        <Cone args={[2, 2, 8]} position={[0, 3, 0]}>
          <meshStandardMaterial color="#228B22" emissive="#00ff00" emissiveIntensity={0.2} />
        </Cone>
        <Cone args={[1.5, 1.5, 8]} position={[0, 4, 0]}>
          <meshStandardMaterial color="#32CD32" emissive="#00ff00" emissiveIntensity={0.3} />
        </Cone>
        <Cone args={[1, 1, 8]} position={[0, 5, 0]}>
          <meshStandardMaterial color="#7FFF00" emissive="#00ff00" emissiveIntensity={0.4} />
        </Cone>
      </group>
    </group>
  )
}

// 떠다니는 파티클 데이터 컴포넌트
function DataParticle({ position }: { position: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const color = useMemo(() => {
    const colors = ['#00ff00', '#00ffff', '#ff00ff', '#ffff00', '#ff0088']
    return colors[Math.floor(Math.random() * colors.length)]
  }, [])

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2 + position[0]) * 0.5
      meshRef.current.rotation.x += 0.02
      meshRef.current.rotation.y += 0.03
      
      // 빛나는 효과
      const material = meshRef.current.material as THREE.MeshStandardMaterial
      if (material && material.emissiveIntensity !== undefined) {
        material.emissiveIntensity = 0.5 + Math.sin(state.clock.elapsedTime * 3) * 0.5
      }
    }
  })

  return (
    <Float speed={2} rotationIntensity={2} floatIntensity={2}>
      <Box ref={meshRef} args={[0.2, 0.2, 0.2]} position={position}>
        <meshStandardMaterial 
          color={color} 
          emissive={color} 
          emissiveIntensity={0.5}
          metalness={0.8}
          roughness={0.2}
        />
      </Box>
    </Float>
  )
}

// 빛나는 구체 (데이터 노드)
function GlowingSphere({ position, size = 1 }: { position: [number, number, number], size?: number }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const lightRef = useRef<THREE.PointLight>(null)

  useFrame((state) => {
    if (meshRef.current && lightRef.current) {
      const time = state.clock.elapsedTime
      meshRef.current.rotation.x = time * 0.5
      meshRef.current.rotation.y = time * 0.3
      
      // 펄스 효과
      const scale = 1 + Math.sin(time * 2) * 0.1
      meshRef.current.scale.setScalar(scale * size)
      
      // 빛 강도 변화
      lightRef.current.intensity = 2 + Math.sin(time * 3) * 1
    }
  })

  return (
    <group position={position}>
      <Sphere ref={meshRef} args={[size, 32, 32]}>
        <MeshDistortMaterial
          color="#00ff88"
          emissive="#00ff88"
          emissiveIntensity={0.5}
          roughness={0}
          metalness={0.8}
          distort={0.3}
          speed={2}
        />
      </Sphere>
      <pointLight ref={lightRef} color="#00ff88" intensity={2} distance={10} />
    </group>
  )
}

// 연결선 컴포넌트
function ConnectionLine({ start, end }: { start: [number, number, number], end: [number, number, number] }) {
  const ref = useRef<THREE.BufferGeometry>(null)
  
  useFrame((state) => {
    if (ref.current) {
      const positions = ref.current.attributes.position as THREE.BufferAttribute
      const time = state.clock.elapsedTime
      
      // 중간 지점에 곡선 효과
      const midX = (start[0] + end[0]) / 2
      const midY = (start[1] + end[1]) / 2 + Math.sin(time * 2) * 0.5
      const midZ = (start[2] + end[2]) / 2
      
      positions.setXYZ(1, midX, midY, midZ)
      positions.needsUpdate = true
    }
  })

  const points = useMemo(() => [
    new THREE.Vector3(...start),
    new THREE.Vector3((start[0] + end[0]) / 2, (start[1] + end[1]) / 2, (start[2] + end[2]) / 2),
    new THREE.Vector3(...end)
  ], [start, end])

  return (
    <line>
      <bufferGeometry ref={ref}>
        <bufferAttribute
          attach="attributes-position"
          count={points.length}
          array={new Float32Array(points.flatMap(p => [p.x, p.y, p.z]))}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial color="#00ffff" linewidth={2} transparent opacity={0.6} />
    </line>
  )
}

// 메인 Forest 씬
function ForestScene() {
  const { camera } = useThree()

  // 나무 위치들
  const treePositions: [number, number, number][] = useMemo(() => {
    const positions: [number, number, number][] = []
    for (let i = 0; i < 30; i++) {
      const angle = (i / 30) * Math.PI * 2
      const radius = 10 + Math.random() * 15
      positions.push([
        Math.cos(angle) * radius,
        0,
        Math.sin(angle) * radius
      ])
    }
    return positions
  }, [])

  // 데이터 파티클 위치들
  const particlePositions: [number, number, number][] = useMemo(() => {
    const positions: [number, number, number][] = []
    for (let i = 0; i < 50; i++) {
      positions.push([
        (Math.random() - 0.5) * 30,
        Math.random() * 10 + 2,
        (Math.random() - 0.5) * 30
      ])
    }
    return positions
  }, [])

  // 중앙 데이터 노드들
  const nodePositions: [number, number, number][] = [
    [0, 5, 0],
    [3, 7, -2],
    [-3, 6, 2],
    [2, 4, 3],
    [-2, 8, -3]
  ]

  useFrame((state) => {
    // 카메라 미세 움직임
    const time = state.clock.elapsedTime
    camera.position.x = Math.sin(time * 0.1) * 2
    camera.position.y = 8 + Math.sin(time * 0.15) * 2
    camera.lookAt(0, 5, 0)
  })

  return (
    <>
      {/* 조명 설정 */}
      <ambientLight intensity={0.2} />
      <directionalLight position={[10, 20, 5]} intensity={1} castShadow />
      <pointLight position={[0, 10, 0]} intensity={2} color="#00ff88" />
      
      {/* 안개 효과 */}
      <fog attach="fog" args={['#001122', 10, 50]} />
      
      {/* 나무들 */}
      {treePositions.map((pos, i) => (
        <Tree key={`tree-${i}`} position={pos} scale={0.8 + Math.random() * 0.4} />
      ))}
      
      {/* 데이터 파티클들 */}
      {particlePositions.map((pos, i) => (
        <DataParticle key={`particle-${i}`} position={pos} />
      ))}
      
      {/* 중앙 데이터 노드들 */}
      {nodePositions.map((pos, i) => (
        <GlowingSphere key={`node-${i}`} position={pos} size={0.5 + i * 0.1} />
      ))}
      
      {/* 노드 간 연결선 */}
      {nodePositions.map((start, i) => 
        nodePositions.slice(i + 1).map((end, j) => (
          <ConnectionLine key={`line-${i}-${j}`} start={start} end={end} />
        ))
      )}
      
      {/* 바닥 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial 
          color="#001a00" 
          roughness={0.8}
          metalness={0.2}
        />
      </mesh>
      
      {/* 별들 */}
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
    </>
  )
}

export function ForestBackground3D() {
  return (
    <div className="fixed inset-0 z-0">
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[20, 15, 20]} fov={60} />
        <ForestScene />
        <OrbitControls 
          enablePan={false} 
          enableZoom={false} 
          enableRotate={true}
          autoRotate
          autoRotateSpeed={0.5}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 2}
        />
        <Environment preset="forest" />
      </Canvas>
    </div>
  )
}