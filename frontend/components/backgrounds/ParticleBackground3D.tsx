'use client'

import React, { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { 
  OrbitControls, 
  PerspectiveCamera,
  Sphere,
  Trail,
  Float,
  MeshDistortMaterial,
  PointMaterial,
  Points,
  Text3D,
  Center
} from '@react-three/drei'
import * as THREE from 'three'

// 파티클 시스템
function ParticleField() {
  const ref = useRef<THREE.Points>(null)
  const [positions, colors] = useMemo(() => {
    const positions = new Float32Array(5000 * 3)
    const colors = new Float32Array(5000 * 3)
    
    for (let i = 0; i < 5000; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 50
      positions[i * 3 + 1] = (Math.random() - 0.5) * 50
      positions[i * 3 + 2] = (Math.random() - 0.5) * 50
      
      const color = new THREE.Color()
      color.setHSL(Math.random(), 1, 0.5)
      colors[i * 3] = color.r
      colors[i * 3 + 1] = color.g
      colors[i * 3 + 2] = color.b
    }
    
    return [positions, colors]
  }, [])

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.x = state.clock.elapsedTime * 0.05
      ref.current.rotation.y = state.clock.elapsedTime * 0.075
      
      // 파티클 위치 업데이트
      const positions = ref.current.geometry.attributes.position as THREE.BufferAttribute
      const time = state.clock.elapsedTime
      
      for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i)
        const y = positions.getY(i)
        const z = positions.getZ(i)
        
        positions.setY(i, y + Math.sin(time + x * 0.1) * 0.01)
      }
      
      positions.needsUpdate = true
    }
  })

  return (
    <Points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={colors.length / 3}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <PointMaterial 
        fontSize={0.1} 
        vertexColors 
        transparent 
        opacity={0.8}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </Points>
  )
}

// 궤도를 도는 구체
function OrbitingSphere({ 
  radius, 
  speed, 
  size, 
  color, 
  emissive 
}: { 
  radius: number
  speed: number
  size: number
  color: string
  emissive: string
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  const trailRef = useRef<any>(null)

  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.elapsedTime * speed
      meshRef.current.position.x = Math.cos(time) * radius
      meshRef.current.position.z = Math.sin(time) * radius
      meshRef.current.position.y = Math.sin(time * 2) * 2
      
      meshRef.current.rotation.x += 0.01
      meshRef.current.rotation.y += 0.02
    }
  })

  return (
    <Trail
      ref={trailRef}
      width={2}
      length={20}
      color={new THREE.Color(emissive)}
      attenuation={(t) => t * t}
    >
      <Sphere ref={meshRef} args={[size, 32, 32]}>
        <MeshDistortMaterial
          color={color}
          emissive={emissive}
          emissiveIntensity={0.5}
          roughness={0}
          metalness={1}
          distort={0.3}
          speed={5}
        />
      </Sphere>
    </Trail>
  )
}

// 중앙 에너지 코어
function EnergyCore() {
  const coreRef = useRef<THREE.Mesh>(null)
  const innerRef = useRef<THREE.Mesh>(null)
  const outerRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    const time = state.clock.elapsedTime
    
    if (coreRef.current) {
      coreRef.current.rotation.x = time * 0.5
      coreRef.current.rotation.y = time * 0.3
      const scale = 1 + Math.sin(time * 2) * 0.1
      coreRef.current.scale.setScalar(scale)
    }
    
    if (innerRef.current) {
      innerRef.current.rotation.x = -time * 0.3
      innerRef.current.rotation.y = -time * 0.5
    }
    
    if (outerRef.current) {
      outerRef.current.rotation.x = time * 0.2
      outerRef.current.rotation.y = -time * 0.3
    }
  })

  return (
    <group>
      {/* 코어 */}
      <Sphere ref={coreRef} args={[1, 32, 32]}>
        <meshStandardMaterial
          color="#ffffff"
          emissive="#ffffff"
          emissiveIntensity={2}
          roughness={0}
          metalness={0}
        />
      </Sphere>
      
      {/* 내부 링 */}
      <mesh ref={innerRef}>
        <torusGeometry args={[2, 0.1, 16, 100]} />
        <meshStandardMaterial
          color="#00ffff"
          emissive="#00ffff"
          emissiveIntensity={1}
          transparent
          opacity={0.8}
        />
      </mesh>
      
      {/* 외부 링 */}
      <mesh ref={outerRef}>
        <torusGeometry args={[3, 0.15, 16, 100]} />
        <meshStandardMaterial
          color="#ff00ff"
          emissive="#ff00ff"
          emissiveIntensity={1}
          transparent
          opacity={0.6}
        />
      </mesh>
      
      {/* 포인트 라이트 */}
      <pointLight color="#ffffff" intensity={5} distance={20} />
      <pointLight color="#00ffff" intensity={3} distance={15} position={[0, 0, 0]} />
    </group>
  )
}

// 데이터 스트림
function DataStream({ startY, color }: { startY: number, color: string }) {
  const meshRef = useRef<THREE.Mesh>(null)
  
  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.elapsedTime
      meshRef.current.position.y = startY + (time * 3) % 20 - 10
      meshRef.current.rotation.z = time * 2
    }
  })

  return (
    <Float speed={2} rotationIntensity={0} floatIntensity={2}>
      <mesh ref={meshRef} position={[0, startY, 0]}>
        <boxGeometry args={[0.2, 2, 0.2]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={1}
          transparent
          opacity={0.7}
        />
      </mesh>
    </Float>
  )
}

// 메인 씬
function ParticleScene() {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.05
    }
  })

  return (
    <>
      {/* 조명 */}
      <ambientLight intensity={0.1} />
      <directionalLight position={[10, 10, 5]} intensity={0.5} />
      
      {/* 파티클 필드 */}
      <ParticleField />
      
      {/* 중앙 에너지 코어 */}
      <group ref={groupRef}>
        <EnergyCore />
        
        {/* 궤도 구체들 */}
        <OrbitingSphere radius={5} speed={1} fontSize={0.3} color="#ff0000" emissive="#ff0000" />
        <OrbitingSphere radius={7} speed={0.7} fontSize={0.4} color="#00ff00" emissive="#00ff00" />
        <OrbitingSphere radius={9} speed={0.5} fontSize={0.5} color="#0000ff" emissive="#0000ff" />
        <OrbitingSphere radius={6} speed={-0.8} fontSize={0.35} color="#ffff00" emissive="#ffff00" />
        <OrbitingSphere radius={8} speed={-0.6} fontSize={0.45} color="#ff00ff" emissive="#ff00ff" />
        
        {/* 데이터 스트림 */}
        {Array.from({ length: 20 }, (_, i) => (
          <group key={`stream-${i}`} rotation={[0, (i / 20) * Math.PI * 2, 0]}>
            <DataStream 
              startY={(isNaN(20) ? 1 : 20) * Math.random() - 10} 
              color={`hsl(${i * 18}, 100%, 50%)`} 
            />
          </group>
        ))}
      </group>
      
      {/* 3D 텍스트 */}
      <Center position={[0, -5, 0]}>
        <Text3D font="https://threejs.org/examples/fonts/helvetiker_bold.typeface.json" anchorX="center" anchorY="middle"
          
          size={1}
          height={0.2}
          curveSegments={12}
          
          bevelThickness={0.02}
          bevelSize={0.02}
          bevelSegments={5}
        >
          AI POWERED
          <meshStandardMaterial
            color="#ffffff"
            emissive="#00ffff"
            emissiveIntensity={0.5}
            metalness={0.8}
            roughness={0.2}
          />
        </Text3D>
      </Center>
    </>
  )
}

export function ParticleBackground3D() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <Canvas style={{ pointerEvents: 'none' }}>
        <PerspectiveCamera makeDefault position={[0, 0, 20]} fov={75} />
        <ParticleScene />
        <OrbitControls
          enablePan={false}
          enableZoom={false}
          enableRotate={true}
          autoRotate
          autoRotateSpeed={0.3}
        />
        {/* 블룸 효과를 위한 후처리는 별도 설정 필요 */}
      </Canvas>
    </div>
  )
}