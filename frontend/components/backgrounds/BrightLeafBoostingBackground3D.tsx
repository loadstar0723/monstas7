'use client'

import React, { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Sphere, Box, Cylinder, Float, Trail, Text3D, Center, MeshTransmissionMaterial } from '@react-three/drei'
import * as THREE from 'three'

// 빛나는 리프 노드
function GlowingLeafNode({ position, level, color }: { 
  position: [number, number, number], 
  level: number, 
  color: string 
}) {
  const leafRef = useRef<THREE.Mesh>(null)
  const glowRef = useRef<THREE.Mesh>(null)
  const lightRef = useRef<THREE.PointLight>(null)
  
  useFrame((state) => {
    if (leafRef.current) {
      leafRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 2 + level) * 0.2)
      leafRef.current.rotation.x = Math.sin(state.clock.elapsedTime + level) * 0.1
      leafRef.current.rotation.y = Math.cos(state.clock.elapsedTime + level) * 0.1
    }
    if (glowRef.current && glowRef.current.material) {
      const material = glowRef.current.material as THREE.MeshBasicMaterial
      material.opacity = 0.5 + Math.sin(state.clock.elapsedTime * 3) * 0.3
    }
    if (lightRef.current) {
      lightRef.current.intensity = 3 + Math.sin(state.clock.elapsedTime * 4) * 2
    }
  })
  
  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <group position={position}>
        {/* 리프 노드 */}
        <mesh ref={leafRef}>
          <octahedronGeometry args={[0.5 * (1 - level * 0.1), 0]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={1.5}
            metalness={0.9}
            roughness={0.1}
          />
        </mesh>
        
        {/* 밝은 글로우 효과 */}
        <mesh ref={glowRef}>
          <sphereGeometry args={[0.8, 16, 16]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.5}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
        
        {/* 포인트 라이트 */}
        <pointLight ref={lightRef} color={color} intensity={3} distance={5} />
      </group>
    </Float>
  )
}

// 부스팅 에너지 빔
function BoostingBeam({ startPos, endPos, color }: { 
  startPos: [number, number, number], 
  endPos: [number, number, number],
  color: string 
}) {
  const beamRef = useRef<THREE.Mesh>(null)
  const particlesRef = useRef<THREE.Points>(null)
  
  useFrame((state) => {
    if (beamRef.current) {
      const t = (state.clock.elapsedTime % 1.5) / 1.5
      beamRef.current.position.x = startPos[0] + (endPos[0] - startPos[0]) * t
      beamRef.current.position.y = startPos[1] + (endPos[1] - startPos[1]) * t
      beamRef.current.position.z = startPos[2] + (endPos[2] - startPos[2]) * t
      beamRef.current.scale.setScalar(1 + Math.sin(t * Math.PI) * 0.5)
    }
  })
  
  return (
    <Trail
      width={5}
      length={20}
      color={color}
      attenuation={(t) => t * t}
    >
      <mesh ref={beamRef}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshBasicMaterial color={color} />
      </mesh>
    </Trail>
  )
}

// 밝은 히스토그램 시각화
function BrightHistogram() {
  const binsRef = useRef<THREE.Group>(null)
  
  useFrame((state) => {
    if (binsRef.current) {
      binsRef.current.rotation.y = state.clock.elapsedTime * 0.15
      binsRef.current.children.forEach((child, i) => {
        const scale = 1.5 + Math.sin(state.clock.elapsedTime * 2 + i * 0.3) * 0.5
        child.scale.y = scale
        // 색상 변화
        const material = (child as THREE.Mesh).material as THREE.MeshStandardMaterial
        const hue = (state.clock.elapsedTime * 0.1 + i / 20) % 1
        material.color.setHSL(hue, 1, 0.6)
        material.emissive.setHSL(hue, 1, 0.4)
      })
    }
  })
  
  return (
    <group ref={binsRef} position={[0, -3, 0]}>
      {Array.from({ length: 24 }).map((_, i) => {
        const angle = (i / 24) * Math.PI * 2
        const radius = 6
        const height = 1 + Math.random() * 3
        const hue = i / 24
        
        return (
          <mesh
            key={i}
            position={[
              Math.cos(angle) * radius,
              height / 2,
              Math.sin(angle) * radius
            ]}
          >
            <boxGeometry args={[0.8, height, 0.8]} />
            <meshStandardMaterial
              color={new THREE.Color().setHSL(hue, 1, 0.6)}
              emissive={new THREE.Color().setHSL(hue, 1, 0.4)}
              emissiveIntensity={0.8}
              metalness={0.9}
              roughness={0.1}
            />
          </mesh>
        )
      })}
    </group>
  )
}

// 밝은 Leaf-wise 트리
function BrightLeafTree() {
  const treeRef = useRef<THREE.Group>(null)
  
  useFrame((state) => {
    if (treeRef.current) {
      treeRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.2
    }
  })
  
  const nodeColors = ['#00ffff', '#00ff88', '#88ff00', '#ffff00', '#ff88ff', '#ff00ff']
  
  const nodes = [
    { pos: [0, 8, 0], level: 0 }, // 루트
    { pos: [-4, 5, 0], level: 1 },
    { pos: [3, 5, 0], level: 1 },
    { pos: [-6, 2, 0], level: 2 },
    { pos: [-2, 2, 0], level: 2 },
    { pos: [4, 2, 1], level: 2 },
    { pos: [1, 2, -1], level: 2 },
    { pos: [-7, -1, 0], level: 3 },
    { pos: [-5, -1, -1], level: 3 },
    { pos: [-3, -1, 1], level: 3 },
    { pos: [-1, -1, 0], level: 3 },
    { pos: [5, -1, 1], level: 3 },
    { pos: [3, -1, -1], level: 3 },
  ]
  
  return (
    <group ref={treeRef}>
      {/* 노드들 */}
      {nodes.map((node, i) => (
        <GlowingLeafNode
          key={i}
          position={node.pos}
          level={node.level}
          color={nodeColors[i % nodeColors.length]}
        />
      ))}
      
      {/* 빛나는 연결선 */}
      <mesh>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={26}
            array={new Float32Array([
              0, 8, 0, -4, 5, 0,
              0, 8, 0, 3, 5, 0,
              -4, 5, 0, -6, 2, 0,
              -4, 5, 0, -2, 2, 0,
              3, 5, 0, 4, 2, 1,
              3, 5, 0, 1, 2, -1,
              -6, 2, 0, -7, -1, 0,
              -6, 2, 0, -5, -1, -1,
              -2, 2, 0, -3, -1, 1,
              -2, 2, 0, -1, -1, 0,
              4, 2, 1, 5, -1, 1,
              1, 2, -1, 3, -1, -1,
              0, 8, 0, 0, -4, 0, // 중앙 축
            ].flatMap(x => x))}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#ffffff" opacity={0.8} transparent />
      </mesh>
      
      {/* 부스팅 빔 */}
      <BoostingBeam startPos={[-7, -1, 0]} endPos={[0, 8, 0]} color="#00ffff" />
      <BoostingBeam startPos={[5, -1, 1]} endPos={[0, 8, 0]} color="#ff00ff" />
      <BoostingBeam startPos={[-5, -1, -1]} endPos={[0, 8, 0]} color="#00ff88" />
    </group>
  )
}

// 밝은 파티클 폭포
function BrightParticleWaterfall() {
  const particlesRef = useRef<THREE.Points>(null)
  
  const particleCount = 1500
  const positions = useMemo(() => {
    const pos = new Float32Array(particleCount * 3)
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 30
      pos[i * 3 + 1] = Math.random() * 25
      pos[i * 3 + 2] = (Math.random() - 0.5) * 30
    }
    return pos
  }, [])
  
  const colors = useMemo(() => {
    const col = new Float32Array(particleCount * 3)
    for (let i = 0; i < particleCount; i++) {
      const color = new THREE.Color()
      color.setHSL(Math.random(), 1, 0.7)
      col[i * 3] = color.r
      col[i * 3 + 1] = color.g
      col[i * 3 + 2] = color.b
    }
    return col
  }, [])
  
  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.05
      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array
      
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3
        positions[i3 + 1] -= 0.1
        
        // 파동 효과
        positions[i3] += Math.sin(state.clock.elapsedTime + i * 0.01) * 0.02
        positions[i3 + 2] += Math.cos(state.clock.elapsedTime + i * 0.01) * 0.02
        
        if (positions[i3 + 1] < -5) {
          positions[i3 + 1] = 25
          positions[i3] = (Math.random() - 0.5) * 30
          positions[i3 + 2] = (Math.random() - 0.5) * 30
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
        <bufferAttribute
          attach="attributes-color"
          count={particleCount}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.15}
        vertexColors
        transparent
        opacity={0.8}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

// LightGBM 3D 텍스트
function LightGBMTitle() {
  const textRef = useRef<THREE.Group>(null)
  
  useFrame((state) => {
    if (textRef.current) {
      textRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1
      textRef.current.position.y = 12 + Math.sin(state.clock.elapsedTime) * 0.5
    }
  })
  
  return (
    <Float speed={0.5} rotationIntensity={0.1} floatIntensity={0.5}>
      <group ref={textRef} position={[0, 12, -5]}>
        <Center>
          <Text3D
            font="https://threejs.org/examples/fonts/helvetiker_bold.typeface.json"
            size={2}
            height={0.5}
            curveSegments={12}
            bevelEnabled
            bevelThickness={0.05}
            bevelSize={0.05}
            bevelOffset={0}
            bevelSegments={5}
          >
            LightGBM
            <meshStandardMaterial
              color="#ffffff"
              emissive="#00ffff"
              emissiveIntensity={0.8}
              metalness={1}
              roughness={0}
            />
          </Text3D>
        </Center>
        
        {/* 텍스트 주변 파티클 */}
        {Array.from({ length: 20 }).map((_, i) => {
          const angle = (i / 20) * Math.PI * 2
          return (
            <mesh key={i} position={[
              Math.cos(angle) * 5,
              0,
              Math.sin(angle) * 5
            ]}>
              <sphereGeometry args={[0.1, 8, 8]} />
              <meshBasicMaterial color="#00ffff" />
            </mesh>
          )
        })}
      </group>
    </Float>
  )
}

// 밝은 에너지 웨이브
function BrightEnergyWaves() {
  const waveRef = useRef<THREE.Group>(null)
  
  useFrame((state) => {
    if (waveRef.current) {
      waveRef.current.children.forEach((child, i) => {
        child.position.y = Math.sin(state.clock.elapsedTime * 2 + i * 0.5) * 3
        child.rotation.z = state.clock.elapsedTime * 0.5
        const scale = 1 + Math.sin(state.clock.elapsedTime + i) * 0.3
        child.scale.set(scale, scale, 1)
      })
    }
  })
  
  return (
    <group ref={waveRef}>
      {Array.from({ length: 8 }).map((_, i) => (
        <mesh key={i} position={[0, 0, i * 3 - 12]}>
          <torusGeometry args={[8 + i * 0.5, 0.2, 16, 64]} />
          <meshStandardMaterial
            color={new THREE.Color().setHSL(i / 8, 1, 0.6)}
            emissive={new THREE.Color().setHSL(i / 8, 1, 0.4)}
            emissiveIntensity={0.8}
            metalness={1}
            roughness={0}
          />
        </mesh>
      ))}
    </group>
  )
}

// 크리스탈 클러스터
function CrystalCluster({ position }: { position: [number, number, number] }) {
  const clusterRef = useRef<THREE.Group>(null)
  
  useFrame((state) => {
    if (clusterRef.current) {
      clusterRef.current.rotation.y = state.clock.elapsedTime * 0.3
      clusterRef.current.children.forEach((child, i) => {
        child.rotation.x = Math.sin(state.clock.elapsedTime + i) * 0.2
        child.rotation.z = Math.cos(state.clock.elapsedTime + i) * 0.2
      })
    }
  })
  
  return (
    <Float speed={1} rotationIntensity={0.5} floatIntensity={0.5}>
      <group ref={clusterRef} position={position}>
        {Array.from({ length: 7 }).map((_, i) => {
          const angle = (i / 7) * Math.PI * 2
          const radius = i === 0 ? 0 : 0.5
          const height = 0.5 + Math.random() * 1
          const color = new THREE.Color().setHSL(Math.random(), 1, 0.7)
          
          return (
            <mesh
              key={i}
              position={[
                Math.cos(angle) * radius,
                height / 2,
                Math.sin(angle) * radius
              ]}
              rotation={[0, 0, (Math.random() - 0.5) * 0.3]}
            >
              <coneGeometry args={[0.2, height, 6]} />
              <meshStandardMaterial
                color={color}
                emissive={color}
                emissiveIntensity={0.5}
                metalness={1}
                roughness={0}
              />
            </mesh>
          )
        })}
      </group>
    </Float>
  )
}

export function BrightLeafBoostingBackground3D() {
  return (
    <div className="fixed inset-0 -z-10">
      <Canvas
        camera={{ position: [20, 12, 25], fov: 60 }}
        gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping }}
      >
        <color attach="background" args={['#000a1a']} />
        <fog attach="fog" args={['#000a1a', 40, 100]} />
        
        {/* 밝은 조명 설정 */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[20, 30, 10]} intensity={1.5} color="#ffffff" />
        <pointLight position={[0, 20, 0]} intensity={2} color="#00ffff" />
        <pointLight position={[-15, 15, -15]} intensity={1.5} color="#ff00ff" />
        <pointLight position={[15, 15, 15]} intensity={1.5} color="#00ff88" />
        <spotLight
          position={[0, 30, 0]}
          angle={0.6}
          penumbra={1}
          intensity={2}
          color="#ffffff"
        />
        
        {/* 메인 컴포넌트들 */}
        <BrightLeafTree />
        <BrightHistogram />
        <BrightParticleWaterfall />
        <BrightEnergyWaves />
        <LightGBMTitle />
        
        {/* 크리스탈 클러스터들 */}
        <CrystalCluster position={[-10, 3, -10]} />
        <CrystalCluster position={[10, 5, -8]} />
        <CrystalCluster position={[-8, 2, 10]} />
        <CrystalCluster position={[12, 4, 8]} />
        
        {/* 바닥 그리드 */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -5, 0]}>
          <planeGeometry args={[100, 100, 50, 50]} />
          <meshStandardMaterial
            color="#001a33"
            metalness={0.9}
            roughness={0.1}
            wireframe
          />
        </mesh>
        
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.3}
          maxPolarAngle={Math.PI * 0.8}
          minPolarAngle={Math.PI * 0.2}
        />
      </Canvas>
    </div>
  )
}