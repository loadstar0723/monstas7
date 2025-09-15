'use client'

import React, { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Sphere, Box, Cylinder, Text3D, Center, Float, Trail } from '@react-three/drei'
import * as THREE from 'three'

// 게이트 컴포넌트
function Gate({ position, type, color }: { position: [number, number, number], type: 'reset' | 'update', color: string }) {
  const gateRef = useRef<THREE.Group>(null)
  const innerRef = useRef<THREE.Mesh>(null)
  
  useFrame((state) => {
    if (innerRef.current) {
      innerRef.current.rotation.z = state.clock.elapsedTime * 0.5
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.1
      innerRef.current.scale.setScalar(scale)
    }
  })
  
  return (
    <Float speed={1} rotationIntensity={0.3} floatIntensity={0.5}>
      <group ref={gateRef} position={position}>
        {/* 게이트 프레임 */}
        <Box args={[2, 2, 0.3]}>
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.3}
            metalness={0.8}
            roughness={0.2}
          />
        </Box>
        
        {/* 게이트 중심부 */}
        <mesh ref={innerRef} position={[0, 0, 0.2]}>
          <torusGeometry args={[0.6, 0.2, 16, 32]} />
          <meshStandardMaterial
            color="#ffffff"
            emissive={color}
            emissiveIntensity={0.8}
            metalness={1}
            roughness={0}
          />
        </mesh>
        
        {/* 게이트 타입 텍스트 */}
        <Center position={[0, -1.5, 0]}>
          <Text3D font="https://threejs.org/examples/fonts/helvetiker_bold.typeface.json" anchorX="center" anchorY="middle"
            
            size={0.3}
            height={0.1}
            curveSegments={12}
          >
            {type.toUpperCase()}
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={0.5}
            />
          </Text3D>
        </Center>
        
        {/* 포인트 라이트 */}
        <pointLight position={[0, 0, 1]} intensity={0.5} color={color} distance={10} />
      </group>
    </Float>
  )
}

// 데이터 플로우 파티클
function DataFlow({ startPos, endPos, color }: { 
  startPos: [number, number, number], 
  endPos: [number, number, number], 
  color: string 
}) {
  const particleRef = useRef<THREE.Mesh>(null)
  const trailRef = useRef<any>(null)
  
  useFrame((state) => {
    if (particleRef.current) {
      const t = (state.clock.elapsedTime % 2) / 2 // 0 to 1
      particleRef.current.position.x = startPos[0] + (endPos[0] - startPos[0]) * t
      particleRef.current.position.y = startPos[1] + (endPos[1] - startPos[1]) * t
      particleRef.current.position.z = startPos[2] + (endPos[2] - startPos[2]) * t + Math.sin(t * Math.PI) * 1
    }
  })
  
  return (
    <Trail
      ref={trailRef}
      width={5}
      length={10}
      color={color}
      attenuation={(t) => t * t}
    >
      <mesh ref={particleRef}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshBasicMaterial color={color} />
      </mesh>
    </Trail>
  )
}

// 신경망 노드
function NeuralNode({ position, connections }: { 
  position: [number, number, number], 
  connections?: [number, number, number][] 
}) {
  const nodeRef = useRef<THREE.Mesh>(null)
  
  useFrame((state) => {
    if (nodeRef.current) {
      const pulse = 0.8 + Math.sin(state.clock.elapsedTime * 2 + position[0]) * 0.2
      nodeRef.current.scale.setScalar(pulse)
    }
  })
  
  return (
    <group position={position}>
      <mesh ref={nodeRef}>
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshStandardMaterial
          color="#00ff88"
          emissive="#00ff88"
          emissiveIntensity={0.5}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      
      {/* 연결선 */}
      {connections?.map((endPos, i) => (
        <mesh key={i}>
          <cylinderGeometry args={[0.02, 0.02, 
            Math.sqrt(
              Math.pow(endPos[0] - position[0], 2) +
              Math.pow(endPos[1] - position[1], 2) +
              Math.pow(endPos[2] - position[2], 2)
            ), 8]} 
          />
          <meshBasicMaterial color="#00ff88" opacity={0.3} transparent />
        </mesh>
      ))}
    </group>
  )
}

// 바이너리 코드 비
function BinaryRain() {
  const rainRef = useRef<THREE.Group>(null)
  
  const particles = useMemo(() => {
    const temp = []
    for (let i = 0; i < 50; i++) {
      temp.push({
        x: (Math.random() - 0.5) * 40,
        y: (isNaN(20) ? 1 : 20) * Math.random(),
        z: (Math.random() - 0.5) * 20,
        speed: 0.5 + (isNaN(1) ? 1 : 1) * Math.random()
      })
    }
    return temp
  }, [])
  
  useFrame((state) => {
    if (rainRef.current) {
      rainRef.current.children.forEach((child, i) => {
        child.position.y -= particles[i].speed * 0.1
        if (child.position.y < -10) {
          child.position.y = 15
        }
      })
    }
  })
  
  return (
    <group ref={rainRef}>
      {particles.map((particle, i) => (
        <Box key={i} args={[0.1, 0.5, 0.1]} position={[particle.x, particle.y, particle.z]}>
          <meshBasicMaterial color="#00ff00" opacity={0.6} transparent />
        </Box>
      ))}
    </group>
  )
}

// 회로 그리드
function CircuitGrid() {
  const gridRef = useRef<THREE.Mesh>(null)
  
  useFrame((state) => {
    if (gridRef.current && gridRef.current.material) {
      const mat = gridRef.current.material as THREE.MeshStandardMaterial
      mat.emissiveIntensity = 0.2 + Math.sin(state.clock.elapsedTime) * 0.1
    }
  })
  
  return (
    <mesh ref={gridRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
      <planeGeometry args={[50, 50, 50, 50]} />
      <meshStandardMaterial
        color="#001122"
        emissive="#00ff88"
        emissiveIntensity={0.2}
        wireframe
        opacity={0.5}
        transparent
      />
    </mesh>
  )
}

// 에너지 구체
function EnergyOrb({ position }: { position: [number, number, number] }) {
  const orbRef = useRef<THREE.Mesh>(null)
  const glowRef = useRef<THREE.Mesh>(null)
  
  useFrame((state) => {
    if (orbRef.current) {
      orbRef.current.rotation.y = state.clock.elapsedTime
      orbRef.current.rotation.x = state.clock.elapsedTime * 0.7
    }
    if (glowRef.current) {
      const scale = 1.5 + Math.sin(state.clock.elapsedTime * 2) * 0.2
      glowRef.current.scale.setScalar(scale)
    }
  })
  
  return (
    <Float speed={1} rotationIntensity={0.5} floatIntensity={1}>
      <group position={position}>
        {/* 코어 */}
        <mesh ref={orbRef}>
          <icosahedronGeometry args={[0.5, 1]} />
          <meshStandardMaterial
            color="#00ffff"
            emissive="#00ffff"
            emissiveIntensity={1}
            metalness={1}
            roughness={0}
            wireframe
          />
        </mesh>
        
        {/* 글로우 */}
        <mesh ref={glowRef}>
          <sphereGeometry args={[0.8, 32, 32]} />
          <meshBasicMaterial
            color="#00ffff"
            opacity={0.3}
            transparent
            blending={THREE.AdditiveBlending}
          />
        </mesh>
        
        <pointLight intensity={1} color="#00ffff" distance={15} />
      </group>
    </Float>
  )
}

export function GatedCircuitBackground3D() {
  return (
    <div className="fixed inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 10, 25], fov: 60 }}
        gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping }}
      >
        <color attach="background" args={['#000511']} />
        <fog attach="fog" args={['#000511', 20, 60]} />
        
        {/* 조명 설정 */}
        <ambientLight intensity={0.3} />
        <directionalLight position={[10, 20, 5]} intensity={0.5} color="#00ff88" />
        <pointLight position={[0, 15, 0]} intensity={1} color="#00ffff" />
        <pointLight position={[-15, 10, -15]} intensity={0.5} color="#ff00ff" />
        <pointLight position={[15, 10, 15]} intensity={0.5} color="#ffff00" />
        
        {/* Reset Gate */}
        <Gate position={[-10, 5, 0]} type="reset" color="#ff00ff" />
        
        {/* Update Gate */}
        <Gate position={[10, 5, 0]} type="update" color="#00ffff" />
        
        {/* 데이터 플로우 */}
        <DataFlow startPos={[-10, 5, 0]} endPos={[0, 0, 0]} color="#ff00ff" />
        <DataFlow startPos={[10, 5, 0]} endPos={[0, 0, 0]} color="#00ffff" />
        <DataFlow startPos={[0, 0, 0]} endPos={[0, -5, 10]} color="#00ff00" />
        
        {/* 신경망 노드들 */}
        <NeuralNode position={[0, 0, 0]} />
        <NeuralNode position={[-5, 2, -5]} />
        <NeuralNode position={[5, 2, -5]} />
        <NeuralNode position={[0, -5, 10]} />
        
        {/* 에너지 구체들 */}
        <EnergyOrb position={[-15, 10, -10]} />
        <EnergyOrb position={[15, 8, -8]} />
        <EnergyOrb position={[0, 12, -15]} />
        
        {/* 특수 효과 */}
        <BinaryRain />
        <CircuitGrid />
        
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.3}
          maxPolarAngle={Math.PI * 0.7}
          minPolarAngle={Math.PI * 0.2}
        />
      </Canvas>
    </div>
  )
}