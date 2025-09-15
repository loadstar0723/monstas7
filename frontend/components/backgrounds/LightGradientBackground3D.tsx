'use client'

import React, { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Float, Sphere, Box } from '@react-three/drei'
import * as THREE from 'three'

// 빛의 계단 (Gradient Boosting 시각화)
function LightStairs() {
  const stairsRef = useRef<THREE.Group>(null)
  
  useFrame((state) => {
    if (stairsRef.current) {
      stairsRef.current.rotation.y = state.clock.elapsedTime * 0.1
      
      // 각 계단이 순차적으로 빛나는 효과
      stairsRef.current.children.forEach((stair, i) => {
        const intensity = Math.sin(state.clock.elapsedTime * 2 - i * 0.5) * 0.5 + 0.5
        const material = (stair as THREE.Mesh).material as THREE.MeshStandardMaterial
        material.emissiveIntensity = intensity
      })
    }
  })
  
  return (
    <group ref={stairsRef} position={[0, -5, 0]}>
      {Array.from({ length: 20 }).map((_, i) => {
        const height = i * 0.5
        const hue = i / 20
        const color = new THREE.Color().setHSL(hue, 1, 0.6)
        
        return (
          <mesh
            key={i}
            position={[0, height, -i * 0.5]}
            rotation={[0, (i * Math.PI) / 10, 0]}
          >
            <boxGeometry args={[4 - i * 0.1, 0.2, 2]} />
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={0.5}
              metalness={0.9}
              roughness={0.1}
            />
          </mesh>
        )
      })}
    </group>
  )
}

// 빛의 나뭇잎 (Leaf-wise growth)
function LightLeaves() {
  const leavesRef = useRef<THREE.Group>(null)
  
  useFrame((state) => {
    if (leavesRef.current) {
      leavesRef.current.children.forEach((leaf, i) => {
        // 나뭇잎이 바람에 흔들리는 효과
        leaf.rotation.x = Math.sin(state.clock.elapsedTime + i) * 0.2
        leaf.rotation.z = Math.cos(state.clock.elapsedTime + i) * 0.2
        
        // 위아래로 떠다니는 효과
        leaf.position.y = leaf.userData.originalY + Math.sin(state.clock.elapsedTime * 2 + i) * 0.5
      })
    }
  })
  
  const leaves = useMemo(() => {
    const leafArray = []
    for (let i = 0; i < 100; i++) {
      const x = (Math.random() - 0.5) * 30
      const y = Math.random() * 15
      const z = (Math.random() - 0.5) * 30
      const scale = 0.5 + Math.random() * 0.5
      const color = new THREE.Color().setHSL(0.3 + Math.random() * 0.3, 1, 0.6)
      
      leafArray.push({ position: [x, y, z] as [number, number, number], scale, color })
    }
    return leafArray
  }, [])
  
  return (
    <group ref={leavesRef}>
      {leaves.map((leaf, i) => (
        <Float key={i} speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
          <mesh
            position={leaf.position}
            scale={leaf.scale}
            userData={{ originalY: leaf.position[1] }}
          >
            <tetrahedronGeometry args={[0.5, 0]} />
            <meshStandardMaterial
              color={leaf.color}
              emissive={leaf.color}
              emissiveIntensity={0.8}
              metalness={0.9}
              roughness={0.1}
              transparent
              opacity={0.9}
            />
          </mesh>
        </Float>
      ))}
    </group>
  )
}

// 빛의 흐름 (Data flow)
function LightFlow() {
  const flowRef = useRef<THREE.Points>(null)
  
  const particleCount = 2000
  const positions = useMemo(() => {
    const pos = new Float32Array(particleCount * 3)
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 4
      const radius = 15 * (i / particleCount)
      const height = (i / particleCount) * 20 - 10
      
      pos[i * 3] = Math.cos(angle) * radius
      pos[i * 3 + 1] = height
      pos[i * 3 + 2] = Math.sin(angle) * radius
    }
    return pos
  }, [])
  
  const colors = useMemo(() => {
    const col = new Float32Array(particleCount * 3)
    for (let i = 0; i < particleCount; i++) {
      const t = i / particleCount
      const color = new THREE.Color()
      // 노란색 → 초록색 → 청록색 그라디언트
      if (t < 0.33) {
        color.lerpColors(new THREE.Color('#ffff00'), new THREE.Color('#00ff00'), t * 3)
      } else if (t < 0.66) {
        color.lerpColors(new THREE.Color('#00ff00'), new THREE.Color('#00ffff'), (t - 0.33) * 3)
      } else {
        color.lerpColors(new THREE.Color('#00ffff'), new THREE.Color('#0088ff'), (t - 0.66) * 3)
      }
      col[i * 3] = color.r
      col[i * 3 + 1] = color.g
      col[i * 3 + 2] = color.b
    }
    return col
  }, [])
  
  useFrame((state) => {
    if (flowRef.current) {
      flowRef.current.rotation.y = state.clock.elapsedTime * 0.2
      
      const positions = flowRef.current.geometry.attributes.position.array as Float32Array
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3
        const t = (state.clock.elapsedTime * 0.5 + i / particleCount) % 1
        const angle = t * Math.PI * 4
        const radius = 15 * t
        const height = t * 20 - 10
        
        positions[i3] = Math.cos(angle) * radius
        positions[i3 + 1] = height + Math.sin(state.clock.elapsedTime * 2 + i * 0.01) * 0.5
        positions[i3 + 2] = Math.sin(angle) * radius
      }
      flowRef.current.geometry.attributes.position.needsUpdate = true
    }
  })
  
  return (
    <points ref={flowRef}>
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

// 빛나는 구체들 (Boosting nodes)
function BoostingNodes() {
  const nodesRef = useRef<THREE.Group>(null)
  
  useFrame((state) => {
    if (nodesRef.current) {
      nodesRef.current.rotation.y = state.clock.elapsedTime * 0.05
    }
  })
  
  return (
    <group ref={nodesRef}>
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i / 8) * Math.PI * 2
        const radius = 10
        const y = Math.sin(i * 0.8) * 5
        const size = 0.5 + (i / 8) * 0.5
        const color = new THREE.Color().setHSL(i / 8, 1, 0.6)
        
        return (
          <Float key={i} speed={1 + i * 0.2} rotationIntensity={0.5} floatIntensity={1}>
            <group position={[
              Math.cos(angle) * radius,
              y,
              Math.sin(angle) * radius
            ]}>
              <Sphere args={[size, 32, 32]}>
                <meshPhysicalMaterial
                  color={color}
                  emissive={color}
                  emissiveIntensity={0.5}
                  metalness={0.9}
                  roughness={0}
                  clearcoat={1}
                  clearcoatRoughness={0}
                  transmission={0.5}
                  thickness={0.5}
                />
              </Sphere>
              
              {/* 광선 효과 */}
              <mesh>
                <sphereGeometry args={[size * 1.5, 16, 16]} />
                <meshBasicMaterial
                  color={color}
                  transparent
                  opacity={0.2}
                  blending={THREE.AdditiveBlending}
                />
              </mesh>
            </group>
          </Float>
        )
      })}
    </group>
  )
}

// 빛의 그리드 (바닥)
function LightGrid() {
  const gridRef = useRef<THREE.Mesh>(null)
  
  useFrame((state) => {
    if (gridRef.current && gridRef.current.material) {
      const material = gridRef.current.material as THREE.ShaderMaterial
      if (material.uniforms && material.uniforms.time) {
        material.uniforms.time.value = state.clock.elapsedTime
      }
    }
  })
  
  const gridMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        color1: { value: new THREE.Color('#001a33') },
        color2: { value: new THREE.Color('#004488') }
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform vec3 color1;
        uniform vec3 color2;
        varying vec2 vUv;
        
        void main() {
          vec2 uv = vUv * 20.0;
          float pattern = sin(uv.x + time) * sin(uv.y + time) * 0.5 + 0.5;
          vec3 color = mix(color1, color2, pattern);
          gl_FragColor = vec4(color, 1.0);
        }
      `,
      transparent: true
    })
  }, [])
  
  return (
    <mesh
      ref={gridRef}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -10, 0]}
      material={gridMaterial}
    >
      <planeGeometry args={[100, 100, 100, 100]} />
    </mesh>
  )
}

export function LightGradientBackground3D() {
  return (
    <div className="fixed inset-0 -z-10">
      <Canvas
        camera={{ position: [20, 10, 20], fov: 60 }}
        gl={{ antialias: true, alpha: true }}
      >
        <color attach="background" args={['#000a20']} />
        <fog attach="fog" args={['#000a20', 20, 60]} />
        
        {/* 조명 설정 */}
        <ambientLight intensity={0.4} />
        <directionalLight position={[20, 30, 10]} intensity={1.5} color="#ffffff" castShadow />
        <pointLight position={[0, 20, 0]} intensity={2} color="#00ffcc" />
        <pointLight position={[-10, 10, -10]} intensity={1} color="#ffcc00" />
        <pointLight position={[10, 10, 10]} intensity={1} color="#00ccff" />
        <spotLight
          position={[0, 30, 0]}
          angle={0.6}
          penumbra={1}
          intensity={2}
          color="#ffffff"
        />
        
        {/* 3D 요소들 */}
        <LightStairs />
        <LightLeaves />
        <LightFlow />
        <BoostingNodes />
        <LightGrid />
        
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.2}
          maxPolarAngle={Math.PI * 0.8}
          minPolarAngle={Math.PI * 0.2}
        />
      </Canvas>
    </div>
  )
}