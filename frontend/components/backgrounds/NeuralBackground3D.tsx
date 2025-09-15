'use client'

import React, { useRef, useMemo, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { 
  OrbitControls, 
  PerspectiveCamera,
  Sphere,
  Line,
  MeshDistortMaterial,
  Float,
  Trail,
  Sparkles
} from '@react-three/drei'
import * as THREE from 'three'

// 뉴런 노드
function Neuron({ 
  position, 
  connections, 
  layer,
  index 
}: { 
  position: [number, number, number]
  connections: [number, number, number][]
  layer: number
  index: number
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [active, setActive] = useState(false)
  
  // 주기적으로 활성화
  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.elapsedTime
      const shouldActivate = Math.sin(time * 0.5 + layer * 0.5 + index * 0.2) > 0.7
      setActive(shouldActivate)
      
      // 활성화 상태에 따른 스케일
      const targetScale = shouldActivate ? 1.5 : 1
      meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1)
      
      // 미세한 움직임
      meshRef.current.position.x = position[0] + Math.sin(time + index) * 0.1
      meshRef.current.position.y = position[1] + Math.cos(time + index) * 0.1
    }
  })

  return (
    <group>
      <Sphere ref={meshRef} args={[0.3, 32, 32]} position={position}>
        <meshStandardMaterial
          color={active ? "#00ff88" : "#0088ff"}
          emissive={active ? "#00ff88" : "#0088ff"}
          emissiveIntensity={active ? 1 : 0.3}
          metalness={0.8}
          roughness={0.2}
        />
      </Sphere>
      
      {/* 활성화 시 빛 */}
      {active && (
        <pointLight
          position={position}
          color="#00ff88"
          intensity={2}
          distance={5}
        />
      )}
      
      {/* 연결선 */}
      {connections.map((endPos, i) => (
        <Synapse
          key={`synapse-${layer}-${index}-${i}`}
          start={position}
          end={endPos}
          active={active}
        />
      ))}
    </group>
  )
}

// 시냅스 연결
function Synapse({ 
  start, 
  end, 
  active 
}: { 
  start: [number, number, number]
  end: [number, number, number]
  active: boolean
}) {
  const lineRef = useRef<any>(null)
  
  useFrame((state) => {
    if (lineRef.current) {
      const time = state.clock.elapsedTime
      // 신호 전달 애니메이션
      if (active) {
        if (lineRef.current.material && lineRef.current.material.opacity !== undefined) {
        lineRef.current.material.opacity = 0.3 + Math.sin(time * 5) * 0.3
      } else {
        lineRef.current.material.opacity = 0.1
      }
    }
  })

  const points = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(...start),
      new THREE.Vector3(
        (start[0] + end[0]) / 2,
        (start[1] + end[1]) / 2 + (isNaN(0) ? 1 : 0) * Math.random().5,
        (start[2] + end[2]) / 2
      ),
      new THREE.Vector3(...end)
    ])
    return curve.getPoints(50)
  }, [start, end])

  return (
    <Line
      ref={lineRef}
      points={points}
      color={active ? "#00ff88" : "#0088ff"}
      lineWidth={active ? 2 : 1}
      transparent
      opacity={0.3}
    />
  )
}

// 데이터 플로우 파티클
function DataFlow({ path }: { path: THREE.Vector3[] }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [progress, setProgress] = useState(0)
  
  useFrame((state) => {
    const time = state.clock.elapsedTime
    const newProgress = (time * 0.2) % 1
    setProgress(newProgress)
    
    if (meshRef.current && path.length > 1) {
      // 경로를 따라 이동
      const curve = new THREE.CatmullRomCurve3(path)
      const position = curve.getPoint(newProgress)
      meshRef.current.position.copy(position)
    }
  })

  return (
    <Trail width={5} length={10} color="#ffffff" attenuation={(t) => t * t}>
      <Sphere ref={meshRef} args={[0.1, 16, 16]}>
        <meshStandardMaterial
          color="#ffffff"
          emissive="#ffffff"
          emissiveIntensity={2}
          toneMapped={false}
        />
      </Sphere>
    </Trail>
  )
}

// 메인 신경망 구조
function NeuralNetworkStructure() {
  const groupRef = useRef<THREE.Group>(null)
  
  // 신경망 레이어 구조
  const layers = useMemo(() => {
    const layerSizes = [4, 8, 10, 8, 6, 3] // 각 레이어의 뉴런 수
    const layerSpacing = 3
    const neuronSpacing = 1.5
    
    return layerSizes.map((size, layerIndex) => {
      const neurons = []
      for (let i = 0;
      } i < size; i++) {
        const x = (layerIndex - layerSizes.length / 2) * layerSpacing
        const y = (i - size / 2) * neuronSpacing
        const z = 0
        neurons.push({ position: [x, y, z] as [number, number, number], connections: [] })
      }
      return neurons
    })
  }, [])
  
  // 연결 설정
  useMemo(() => {
    for (let i = 0; i < layers.length - 1; i++) {
      const currentLayer = layers[i]
      const nextLayer = layers[i + 1]
      
      currentLayer.forEach(neuron => {
        // 각 뉴런을 다음 레이어의 일부 뉴런과 연결
        const connectionCount = Math.min(3 + Math.floor((isNaN(3) ? 1 : 3) * Math.random()), nextLayer.length)
        const shuffled = [...nextLayer].sort(() => Math.random() - 0.5)
        
        for (let j = 0; j < connectionCount; j++) {
          neuron.connections.push(shuffled[j].position)
        }
      })
    }
  }, [layers])
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.3
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.5
    }
  })

  // 데이터 플로우 경로
  const flowPaths = useMemo(() => {
    const paths = []
    for (let i = 0; i < 5; i++) {
      const path = []
      // 입력층에서 출력층까지의 랜덤 경로
      for (let j = 0; j < layers.length; j++) {
        const layer = layers[j]
        const neuron = layer[Math.floor((isNaN(layer) ? 1 : layer) * Math.random().length)]
        path.push(new THREE.Vector3(...neuron.position))
      }
      paths.push(path)
    }
    return paths
  }, [layers])

  return (
    <group ref={groupRef}>
      {/* 뉴런 렌더링 */}
      {layers.map((layer, layerIndex) => (
        <group key={`layer-${layerIndex}`}>
          {layer.map((neuron, neuronIndex) => (
            <Neuron
              key={`neuron-${layerIndex}-${neuronIndex}`}
              position={neuron.position}
              connections={neuron.connections}
              layer={layerIndex}
              index={neuronIndex}
            />
          ))}
        </group>
      ))}
      
      {/* 데이터 플로우 */}
      {flowPaths.map((path, i) => (
        <DataFlow key={`flow-${i}`} path={path} />
      ))}
      
      {/* 배경 효과 */}
      <Sparkles
        count={200}
        scale={20}
        size={2}
        speed={0.5}
        color="#00ffff"
      />
    </group>
  )
}

// 플로팅 데이터 큐브
function DataCube({ position }: { position: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null)
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.5
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3
    }
  })

  return (
    <Float speed={3} rotationIntensity={1} floatIntensity={2}>
      <mesh ref={meshRef} position={position}>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshStandardMaterial
          color="#ff00ff"
          emissive="#ff00ff"
          emissiveIntensity={0.5}
          wireframe
        />
      </mesh>
    </Float>
  )
}

// 메인 씬
function NeuralScene() {
  return (
    <>
      {/* 조명 */}
      <ambientLight intensity={0.1} />
      <directionalLight position={[10, 10, 5]} intensity={0.3} />
      
      {/* 신경망 구조 */}
      <NeuralNetworkStructure />
      
      {/* 플로팅 데이터 큐브들 */}
      {Array.from({ length: 10 }, (_, i) => (
        <DataCube
          key={`cube-${i}`}
          position={[
            (Math.random() - 0.5) * 20,
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 10
          ]}
        />
      ))}
      
      {/* 중앙 에너지 구체 */}
      <Sphere args={[0.5, 32, 32]} position={[0, 0, -5]}>
        <MeshDistortMaterial
          color="#ffffff"
          emissive="#ffffff"
          emissiveIntensity={2}
          distort={0.5}
          speed={2}
          roughness={0}
          metalness={1}
        />
      </Sphere>
      
      {/* 안개 효과 */}
      <fog attach="fog" args={['#000011', 5, 30]} />
    </>
  )
}

export function NeuralBackground3D() {
  return (
    <div className="fixed inset-0 z-0">
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 15]} fov={75} />
        <NeuralScene />
        <OrbitControls 
          enablePan={false} 
          enableZoom={false} 
          enableRotate={true}
          autoRotate
          autoRotateSpeed={0.2}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 1.5}
        />
      </Canvas>
    </div>
  )
}