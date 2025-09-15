'use client'

import React, { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Sphere, Box, Cylinder, Float, Trail, Text3D, Center } from '@react-three/drei'
import * as THREE from 'three'

// 리프 노드 컴포넌트
function LeafNode({ position, level, isActive }: { 
  position: [number, number, number], 
  level: number, 
  isActive: boolean 
}) {
  const leafRef = useRef<THREE.Mesh>(null)
  const glowRef = useRef<THREE.Mesh>(null)
  
  useFrame((state) => {
    if (leafRef.current && isActive) {
      leafRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 3) * 0.1)
    }
    if (glowRef.current && isActive) {
      if (glowRef.current.material && glowRef.current.material.opacity !== undefined) {
        glowRef.current.material.opacity = 0.3 + Math.sin(state.clock.elapsedTime * 4) * 0.2
      }
    }
  })
  
  const colors = ['#00ff88', '#00ffcc', '#66ff99', '#33ff66', '#99ffcc']
  const color = colors[level % colors.length]
  
  return (
    <Float speed={1} rotationIntensity={0.2} floatIntensity={0.3}>
      <group position={position}>
        {/* 리프 노드 */}
        <mesh ref={leafRef}>
          <dodecahedronGeometry args={[0.3 * (1 - level * 0.1), 0]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={isActive ? 0.8 : 0.2}
            metalness={0.3}
            roughness={0.3}
          />
        </mesh>
        
        {/* 글로우 효과 */}
        {isActive && (
          <mesh ref={glowRef}>
            <sphereGeometry args={[0.5, 16, 16]} />
            <meshBasicMaterial
              color={color}
              transparent
              opacity={0.3}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        )}
      </group>
    </Float>
  )
}

// 부스팅 빛 파티클
function BoostingLight({ startPos, endPos }: { 
  startPos: [number, number, number], 
  endPos: [number, number, number] 
}) {
  const lightRef = useRef<THREE.Mesh>(null)
  const trailRef = useRef<any>(null)
  
  useFrame((state) => {
    if (lightRef.current) {
      const t = (state.clock.elapsedTime % 2) / 2 // 0 to 1
      lightRef.current.position.x = startPos[0] + (endPos[0] - startPos[0]) * t
      lightRef.current.position.y = startPos[1] + (endPos[1] - startPos[1]) * t
      lightRef.current.position.z = startPos[2] + (endPos[2] - startPos[2]) * t
    }
  })
  
  return (
    <Trail
      ref={trailRef}
      width={3}
      length={15}
      color="#00ffff"
      attenuation={(t) => t * t}
    >
      <mesh ref={lightRef}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshBasicMaterial color="#00ffff" />
      </mesh>
    </Trail>
  )
}

// 히스토그램 빈 시각화
function HistogramBins() {
  const binsRef = useRef<THREE.Group>(null)
  
  useFrame((state) => {
    if (binsRef.current) {
      binsRef.current.rotation.y = state.clock.elapsedTime * 0.1
      binsRef.current.children.forEach((child, i) => {
        const scale = 1 + Math.sin(state.clock.elapsedTime + i * 0.5) * 0.2
        child.scale.y = scale
      })
    }
  })
  
  return (
    <group ref={binsRef} position={[0, -5, 0]}>
      {Array.from({ length: 20 }).map((_, i) => {
        const angle = (i / 20) * Math.PI * 2
        const radius = 8
        const height = 1 + (isNaN(2) ? 1 : 2) * Math.random()
        const hue = i / 20
        
        return (
          <mesh
            key={i}
            position={[
              Math.cos(angle) * radius,
              height / 2,
              Math.sin(angle) * radius
            ]}
          >
            <boxGeometry args={[0.5, height, 0.5]} />
            <meshStandardMaterial
              color={new THREE.Color().setHSL(hue, 0.7, 0.5)}
              emissive={new THREE.Color().setHSL(hue, 0.7, 0.3)}
              emissiveIntensity={0.3}
              metalness={0.6}
              roughness={0.3}
            />
          </mesh>
        )
      })}
    </group>
  )
}

// Leaf-wise 트리 구조
function LeafwiseTree() {
  const treeRef = useRef<THREE.Group>(null)
  
  useFrame((state) => {
    if (treeRef.current) {
      treeRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.1
    }
  })
  
  // 트리 노드 구조 (불균형)
  const nodes = [
    { pos: [0, 6, 0], level: 0, active: true }, // 루트
    // 레벨 1
    { pos: [-3, 4, 0], level: 1, active: true },
    { pos: [2, 4, 0], level: 1, active: false },
    // 레벨 2 (불균형)
    { pos: [-5, 2, 0], level: 2, active: true },
    { pos: [-1, 2, 0], level: 2, active: true },
    { pos: [3, 2, 1], level: 2, active: false },
    // 레벨 3 (더 불균형)
    { pos: [-6, 0, 0], level: 3, active: true },
    { pos: [-4, 0, -1], level: 3, active: true },
    { pos: [-2, 0, 1], level: 3, active: true },
    { pos: [0, 0, 0], level: 3, active: false },
    // 레벨 4 (극도로 불균형)
    { pos: [-7, -2, 0], level: 4, active: true },
    { pos: [-5, -2, -1], level: 4, active: true },
  ]
  
  return (
    <group ref={treeRef}>
      {/* 노드들 */}
      {nodes.map((node, i) => (
        <LeafNode
          key={i}
          position={node.pos}
          level={node.level}
          isActive={node.active}
        />
      ))}
      
      {/* 연결선 */}
      <mesh>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={24}
            array={new Float32Array([
              0, 6, 0, -3, 4, 0,
              0, 6, 0, 2, 4, 0,
              -3, 4, 0, -5, 2, 0,
              -3, 4, 0, -1, 2, 0,
              2, 4, 0, 3, 2, 1,
              -5, 2, 0, -6, 0, 0,
              -5, 2, 0, -4, 0, -1,
              -1, 2, 0, -2, 0, 1,
              -1, 2, 0, 0, 0, 0,
              -6, 0, 0, -7, -2, 0,
              -4, 0, -1, -5, -2, -1,
            ].flatMap(x => x))}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#004466" opacity={0.5} transparent />
      </mesh>
    </group>
  )
}

// 그라디언트 파티클
function GradientParticles() {
  const particlesRef = useRef<THREE.Points>(null)
  
  const particleCount = 500
  const positions = useMemo(() => {
    const pos = new Float32Array(particleCount * 3)
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 40
      pos[i * 3 + 1] = (isNaN(20) ? 1 : 20) * Math.random() - 5
      pos[i * 3 + 2] = (Math.random() - 0.5) * 40
    }
    return pos
  }, [])
  
  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.02
      const positions = particlesRef.current.geometry?.attributes?.position?.array as Float32Array
      
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3
        positions[i3 + 1] += 0.05
        
        if (positions[i3 + 1] > 15) {
          positions[i3 + 1] = -5
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
        size={0.05}
        color="#00ccff"
        transparent
        opacity={0.8}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

// LightGBM 로고 3D
function LightGBMLogo() {
  return (
    <Float speed={0.5} rotationIntensity={0.1} floatIntensity={0.2}>
      <group position={[0, 10, -10]}>
        <Center>
          <Text3D
            font="https://threejs.org/examples/fonts/helvetiker_bold.typeface.json"
            size={1.5}
            height={0.3}
            curveSegments={12}
            bevelEnabled
            bevelThickness={0.02}
            bevelSize={0.02}
            bevelOffset={0}
            bevelSegments={5}
          >
            LightGBM
            <meshStandardMaterial
              color="#00ffcc"
              emissive="#00ffcc"
              emissiveIntensity={0.5}
              metalness={0.8}
              roughness={0.2}
            />
          </Text3D>
        </Center>
      </group>
    </Float>
  )
}

// 빛의 웨이브
function LightWaves() {
  const waveRef = useRef<THREE.Group>(null)
  
  useFrame((state) => {
    if (waveRef.current) {
      waveRef.current.children.forEach((child, i) => {
        child.position.y = Math.sin(state.clock.elapsedTime + i * 0.5) * 2
        child.rotation.z = state.clock.elapsedTime * 0.5
      })
    }
  })
  
  return (
    <group ref={waveRef}>
      {Array.from({ length: 5 }).map((_, i) => (
        <mesh key={i} position={[0, 0, i * 2 - 4]}>
          <torusGeometry args={[5 + i, 0.1, 8, 32]} />
          <meshBasicMaterial
            color="#00ffff"
            opacity={0.3 - i * 0.05}
            transparent
          />
        </mesh>
      ))}
    </group>
  )
}

export function LeafBoostingBackground3D() {
  return (
    <div className="fixed inset-0 -z-10">
      <Canvas
        camera={{ position: [15, 8, 20], fov: 60 }}
        gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping }}
      >
        <color attach="background" args={['#000511']} />
        <fog attach="fog" args={['#000511', 30, 80]} />
        
        {/* 조명 설정 */}
        <ambientLight intensity={0.3} />
        <directionalLight position={[10, 20, 5]} intensity={0.8} color="#00ffcc" />
        <pointLight position={[0, 15, 0]} intensity={1} color="#ffffff" />
        <pointLight position={[-10, 10, -10]} intensity={0.5} color="#00ff88" />
        <pointLight position={[10, 10, 10]} intensity={0.5} color="#00ccff" />
        
        {/* Leaf-wise 트리 */}
        <LeafwiseTree />
        
        {/* 히스토그램 빈 */}
        <HistogramBins />
        
        {/* 부스팅 빛 효과 */}
        <BoostingLight startPos={[-7, -2, 0]} endPos={[0, 10, 0]} />
        <BoostingLight startPos={[-5, -2, -1]} endPos={[0, 10, 0]} />
        <BoostingLight startPos={[-2, 0, 1]} endPos={[0, 10, 0]} />
        
        {/* 특수 효과 */}
        <GradientParticles />
        <LightWaves />
        <LightGBMLogo />
        
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