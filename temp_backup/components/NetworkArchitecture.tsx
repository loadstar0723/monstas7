'use client'

import React, { useRef, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Text, Line, Sphere } from '@react-three/drei'
import { FaBrain, FaPlay, FaPause, FaRedo, FaLayerGroup } from 'react-icons/fa'
import * as THREE from 'three'

interface NetworkArchitectureProps {
  symbol: string
}

// 3D 뉴런 컴포넌트
function Neuron({ position, activation = 0, radius = 0.3 }: any) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.scale.setScalar(1 + activation * 0.5)
      const color = new THREE.Color()
      color.setHSL(0.6 - activation * 0.6, 1, 0.5 + activation * 0.3)
      ;(meshRef.current.material as THREE.MeshStandardMaterial).color = color
      ;(meshRef.current.material as THREE.MeshStandardMaterial).emissive = color
      ;(meshRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = activation * 0.5
    }
  })

  return (
    <mesh
      ref={meshRef}
      position={position}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <sphereGeometry args={[radius, 32, 32]} />
      <meshStandardMaterial
        color="#3b82f6"
        emissive="#3b82f6"
        emissiveIntensity={0.2}
        roughness={0.3}
        metalness={0.5}
      />
      {hovered && (
        <Text
          position={[0, radius + 0.5, 0]}
          fontSize={0.3}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {`Activation: ${activation.toFixed(2)}`}
        </Text>
      )}
    </mesh>
  )
}

// 시냅스 연결 컴포넌트
function Synapse({ start, end, weight = 0.5, active = false }: any) {
  const ref = useRef<any>(null)

  useFrame(() => {
    if (ref.current && active) {
      ref.current.material.opacity = 0.3 + Math.sin(Date.now() * 0.01) * 0.3
    }
  })

  const midPoint = [
    (start[0] + end[0]) / 2,
    (start[1] + end[1]) / 2,
    (start[2] + end[2]) / 2
  ]

  return (
    <Line
      ref={ref}
      points={[start, midPoint, end]}
      color={weight > 0 ? '#10b981' : '#ef4444'}
      lineWidth={Math.abs(weight) * 3}
      transparent
      opacity={0.3 + Math.abs(weight) * 0.5}
    />
  )
}

// 신경망 3D 시각화
function NeuralNetwork3D({ architecture, activations }: any) {
  const layers = architecture
  const layerSpacing = 3
  const neuronSpacing = 1.5

  // 뉴런 위치 계산
  const getNeuronPosition = (layer: number, neuron: number) => {
    const x = layer * layerSpacing - (layers.length - 1) * layerSpacing / 2
    const y = neuron * neuronSpacing - (layers[layer] - 1) * neuronSpacing / 2
    return [x, y, 0]
  }

  return (
    <group>
      {/* 뉴런 렌더링 */}
      {layers.map((layerSize: number, layerIndex: number) => (
        <group key={`layer-${layerIndex}`}>
          {Array.from({ length: layerSize }, (_, neuronIndex) => (
            <Neuron
              key={`neuron-${layerIndex}-${neuronIndex}`}
              position={getNeuronPosition(layerIndex, neuronIndex)}
              activation={activations[layerIndex]?.[neuronIndex] || 0}
              radius={0.3}
            />
          ))}
          {/* 레이어 라벨 */}
          <Text
            position={[
              layerIndex * layerSpacing - (layers.length - 1) * layerSpacing / 2,
              -((layers[layerIndex] - 1) * neuronSpacing / 2) - 1.5,
              0
            ]}
            fontSize={0.4}
            color="#9ca3af"
            anchorX="center"
          >
            {layerIndex === 0 ? 'Input' : 
             layerIndex === layers.length - 1 ? 'Output' : 
             `Hidden ${layerIndex}`}
          </Text>
        </group>
      ))}

      {/* 시냅스 연결 */}
      {layers.map((layerSize: number, layerIndex: number) => {
        if (layerIndex === layers.length - 1) return null
        const nextLayerSize = layers[layerIndex + 1]
        
        return Array.from({ length: layerSize }, (_, i) =>
          Array.from({ length: nextLayerSize }, (_, j) => (
            <Synapse
              key={`synapse-${layerIndex}-${i}-${j}`}
              start={getNeuronPosition(layerIndex, i)}
              end={getNeuronPosition(layerIndex + 1, j)}
              weight={Math.random() * 2 - 1}
              active={activations[layerIndex]?.[i] > 0.5}
            />
          ))
        )
      })}
    </group>
  )
}

export default function NetworkArchitecture({ symbol }: NetworkArchitectureProps) {
  const [isAnimating, setIsAnimating] = useState(true)
  const [selectedArchitecture, setSelectedArchitecture] = useState('deep')
  const [activations, setActivations] = useState<number[][]>([])

  // 네트워크 아키텍처 설정
  const architectures = {
    simple: {
      name: '단순 신경망',
      layers: [3, 5, 2],
      description: '입력층 3, 은닉층 5, 출력층 2'
    },
    deep: {
      name: '심층 신경망',
      layers: [4, 8, 6, 4, 2],
      description: '4개의 은닉층을 가진 심층 구조'
    },
    wide: {
      name: '광역 신경망',
      layers: [5, 12, 10, 8, 3],
      description: '넓은 은닉층으로 복잡한 패턴 학습'
    },
    autoencoder: {
      name: '오토인코더',
      layers: [8, 4, 2, 4, 8],
      description: '압축과 복원을 위한 대칭 구조'
    }
  }

  // 활성화 애니메이션
  useEffect(() => {
    if (isAnimating) {
      const interval = setInterval(() => {
        const currentArch = architectures[selectedArchitecture as keyof typeof architectures]
        const newActivations = currentArch.layers.map((layerSize, layerIndex) => {
          return Array.from({ length: layerSize }, () => {
            // 이전 층의 활성화에 기반한 전파
            if (layerIndex === 0) {
              return Math.random()
            } else {
              const prevLayerAvg = activations[layerIndex - 1]?.reduce((a, b) => a + b, 0) / 
                                   (activations[layerIndex - 1]?.length || 1) || 0.5
              return Math.max(0, Math.min(1, prevLayerAvg + (Math.random() - 0.5) * 0.5))
            }
          })
        })
        setActivations(newActivations)
      }, 100)

      return () => clearInterval(interval)
    }
  }, [isAnimating, selectedArchitecture, activations])

  const resetActivations = () => {
    const currentArch = architectures[selectedArchitecture as keyof typeof architectures]
    setActivations(currentArch.layers.map(size => Array(size).fill(0)))
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-4 flex items-center justify-center gap-3">
          <FaLayerGroup className="text-purple-400" />
          신경망 아키텍처 시각화
        </h2>
        <p className="text-gray-300">
          실시간 정보 전파와 활성화 패턴을 관찰하세요
        </p>
      </div>

      {/* 컨트롤 패널 */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* 아키텍처 선택 */}
          <div className="flex flex-wrap gap-2">
            {Object.entries(architectures).map(([key, arch]) => (
              <button
                key={key}
                onClick={() => {
                  setSelectedArchitecture(key)
                  resetActivations()
                }}
                className={`px-4 py-2 rounded-lg transition-all ${
                  selectedArchitecture === key
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-700/50 text-gray-400 hover:bg-gray-600/50'
                }`}
              >
                {arch.name}
              </button>
            ))}
          </div>

          {/* 애니메이션 컨트롤 */}
          <div className="flex gap-2">
            <button
              onClick={() => setIsAnimating(!isAnimating)}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                isAnimating
                  ? 'bg-red-500/20 text-red-400 border border-red-500/50'
                  : 'bg-green-500/20 text-green-400 border border-green-500/50'
              }`}
            >
              {isAnimating ? <FaPause /> : <FaPlay />}
              {isAnimating ? '일시정지' : '재생'}
            </button>
            <button
              onClick={resetActivations}
              className="px-4 py-2 rounded-lg bg-gray-700/50 text-gray-400 border border-gray-600/50 hover:bg-gray-600/50 flex items-center gap-2"
            >
              <FaRedo />
              리셋
            </button>
          </div>
        </div>

        {/* 아키텍처 설명 */}
        <div className="mt-4 text-sm text-gray-400">
          <span className="text-purple-400 font-semibold">
            {architectures[selectedArchitecture as keyof typeof architectures].name}:
          </span>{' '}
          {architectures[selectedArchitecture as keyof typeof architectures].description}
        </div>
      </div>

      {/* 3D 신경망 시각화 */}
      <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-700/50" style={{ height: '500px' }}>
        <Canvas camera={{ position: [0, 0, 15], fov: 50 }}>
          <ambientLight intensity={0.3} />
          <pointLight position={[10, 10, 10]} intensity={0.8} />
          <pointLight position={[-10, -10, -10]} intensity={0.5} />
          
          <NeuralNetwork3D
            architecture={architectures[selectedArchitecture as keyof typeof architectures].layers}
            activations={activations}
          />
          
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            maxDistance={30}
            minDistance={5}
          />
        </Canvas>
      </div>

      {/* 정보 패널 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-900/20 to-indigo-900/20 rounded-xl p-6 border border-blue-500/30"
        >
          <h3 className="text-lg font-semibold text-white mb-2">전방향 전파</h3>
          <p className="text-sm text-gray-300">
            입력 신호가 각 층을 거쳐 출력층까지 전파되는 과정을 시각화
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-xl p-6 border border-purple-500/30"
        >
          <h3 className="text-lg font-semibold text-white mb-2">활성화 패턴</h3>
          <p className="text-sm text-gray-300">
            뉴런의 활성화 강도가 색상과 크기로 표현됩니다
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 rounded-xl p-6 border border-green-500/30"
        >
          <h3 className="text-lg font-semibold text-white mb-2">시냅스 가중치</h3>
          <p className="text-sm text-gray-300">
            연결선의 색상과 두께로 가중치의 크기와 방향을 표현
          </p>
        </motion.div>
      </div>
    </div>
  )
}