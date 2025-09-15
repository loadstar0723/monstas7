'use client'

import React, { useRef, useEffect, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { 
  OrbitControls, 
  Text, 
  Box, 
  Sphere, 
  Line, 
  MeshDistortMaterial,
  Float,
  Trail
} from '@react-three/drei'
import * as THREE from 'three'
import { motion } from 'framer-motion'
import { FaBrain, FaMemory, FaInfoCircle } from 'react-icons/fa'

// LSTM 게이트 컴포넌트
function LSTMGate({ 
  position, 
  color, 
  label, 
  isActive 
}: { 
  position: [number, number, number]
  color: string
  label: string
  isActive: boolean
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += isActive ? 0.02 : 0.005
      const scale = isActive ? 1.2 : 1
      meshRef.current.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.1)
    }
  })

  return (
    <group position={position}>
      <Box
        ref={meshRef}
        args={[1, 1.5, 0.3]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <meshStandardMaterial 
          color={color} 
          emissive={color}
          emissiveIntensity={isActive ? 0.5 : 0.2}
          transparent
          opacity={0.8}
        />
      </Box>
      <Text
        position={[0, -1.2, 0]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {label}
      </Text>
      {hovered && (
        <Text
          position={[0, 1.2, 0]}
          fontSize={0.2}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {isActive ? 'Active' : 'Idle'}
        </Text>
      )}
    </group>
  )
}

// 메모리 셀 컴포넌트
function MemoryCell({ position }: { position: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [intensity, setIntensity] = useState(0)

  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.getElapsedTime()
      setIntensity(Math.sin(time * 2) * 0.5 + 0.5)
      meshRef.current.rotation.x = Math.sin(time) * 0.1
      meshRef.current.rotation.z = Math.cos(time) * 0.1
    }
  })

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <Sphere ref={meshRef} position={position} args={[0.8, 32, 32]}>
        <MeshDistortMaterial
          color="#8b5cf6"
          emissive="#8b5cf6"
          emissiveIntensity={intensity}
          distort={0.3}
          speed={2}
          transparent
          opacity={0.7}
        />
      </Sphere>
    </Float>
  )
}

// 데이터 플로우 라인
function DataFlow({ 
  start, 
  end, 
  color = "#00ff00",
  animated = true 
}: { 
  start: [number, number, number]
  end: [number, number, number]
  color?: string
  animated?: boolean
}) {
  const lineRef = useRef<THREE.Line>(null)
  
  useFrame((state) => {
    if (lineRef.current && animated) {
      const time = state.clock.getElapsedTime()
      const material = lineRef.current.material as THREE.LineBasicMaterial
      material.opacity = Math.sin(time * 3) * 0.3 + 0.7
    }
  })

  return (
    <Line
      ref={lineRef}
      points={[start, end]}
      color={color}
      lineWidth={3}
      transparent
      opacity={0.7}
    />
  )
}

// 3D LSTM 아키텍처 씬
function LSTMScene({ activeGate }: { activeGate: string }) {
  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#8b5cf6" />
      
      {/* 입력 */}
      <group position={[-6, 0, 0]}>
        <Sphere args={[0.5, 32, 32]}>
          <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={0.3} />
        </Sphere>
        <Text position={[0, -1, 0]} fontSize={0.3} color="white">
          Input (Xt)
        </Text>
      </group>

      {/* Forget Gate */}
      <LSTMGate
        position={[-3, 2, 0]}
        color="#ef4444"
        label="Forget Gate"
        isActive={activeGate === 'forget'}
      />

      {/* Input Gate */}
      <LSTMGate
        position={[-3, 0, 0]}
        color="#10b981"
        label="Input Gate"
        isActive={activeGate === 'input'}
      />

      {/* Output Gate */}
      <LSTMGate
        position={[-3, -2, 0]}
        color="#f59e0b"
        label="Output Gate"
        isActive={activeGate === 'output'}
      />

      {/* Memory Cell */}
      <MemoryCell position={[0, 0, 0]} />
      <Text position={[0, -1.5, 0]} fontSize={0.3} color="white">
        Cell State (Ct)
      </Text>

      {/* Hidden State */}
      <group position={[3, 0, 0]}>
        <Box args={[1, 1, 1]}>
          <meshStandardMaterial color="#8b5cf6" emissive="#8b5cf6" emissiveIntensity={0.3} />
        </Box>
        <Text position={[0, -1, 0]} fontSize={0.3} color="white">
          Hidden (ht)
        </Text>
      </group>

      {/* Output */}
      <group position={[6, 0, 0]}>
        <Sphere args={[0.5, 32, 32]}>
          <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={0.3} />
        </Sphere>
        <Text position={[0, -1, 0]} fontSize={0.3} color="white">
          Output
        </Text>
      </group>

      {/* Data Flow Lines */}
      <DataFlow start={[-5.5, 0, 0]} end={[-3.5, 2, 0]} color="#3b82f6" />
      <DataFlow start={[-5.5, 0, 0]} end={[-3.5, 0, 0]} color="#3b82f6" />
      <DataFlow start={[-5.5, 0, 0]} end={[-3.5, -2, 0]} color="#3b82f6" />
      
      <DataFlow start={[-2.5, 2, 0]} end={[0, 0.5, 0]} color="#ef4444" animated={activeGate === 'forget'} />
      <DataFlow start={[-2.5, 0, 0]} end={[0, 0, 0]} color="#10b981" animated={activeGate === 'input'} />
      <DataFlow start={[-2.5, -2, 0]} end={[2.5, 0, 0]} color="#f59e0b" animated={activeGate === 'output'} />
      
      <DataFlow start={[0.8, 0, 0]} end={[2.5, 0, 0]} color="#8b5cf6" />
      <DataFlow start={[3.5, 0, 0]} end={[5.5, 0, 0]} color="#10b981" />

      <OrbitControls 
        enablePan={false} 
        enableZoom={true}
        minDistance={10}
        maxDistance={30}
        autoRotate
        autoRotateSpeed={0.5}
      />
    </>
  )
}

export default function ModelArchitecture3D() {
  const [activeGate, setActiveGate] = useState('forget')
  const [showInfo, setShowInfo] = useState(false)

  // 게이트 순환 애니메이션
  useEffect(() => {
    const gates = ['forget', 'input', 'output']
    let index = 0
    
    const interval = setInterval(() => {
      index = (index + 1) % gates.length
      setActiveGate(gates[index])
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const gateInfo = {
    forget: {
      title: 'Forget Gate (망각 게이트)',
      description: '이전 시점의 정보 중 어떤 것을 잊을지 결정합니다. 시그모이드 함수를 통해 0~1 사이의 값을 출력하며, 0에 가까울수록 정보를 잊고 1에 가까울수록 정보를 유지합니다.',
      formula: 'ft = σ(Wf · [ht-1, xt] + bf)'
    },
    input: {
      title: 'Input Gate (입력 게이트)',
      description: '현재 시점의 정보 중 어떤 것을 저장할지 결정합니다. 시그모이드와 tanh 함수를 조합하여 새로운 정보의 중요도와 실제 값을 계산합니다.',
      formula: 'it = σ(Wi · [ht-1, xt] + bi)'
    },
    output: {
      title: 'Output Gate (출력 게이트)',
      description: '업데이트된 셀 상태를 기반으로 어떤 정보를 출력할지 결정합니다. 최종 은닉 상태를 생성하여 다음 시점으로 전달합니다.',
      formula: 'ot = σ(Wo · [ht-1, xt] + bo)'
    }
  }

  return (
    <div className="bg-gray-900/50 rounded-xl p-6 backdrop-blur-sm border border-purple-500/20">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FaBrain className="text-purple-500 text-2xl" />
          <h3 className="text-xl font-bold text-white">LSTM 아키텍처 3D 시각화</h3>
        </div>
        <button
          onClick={() => setShowInfo(!showInfo)}
          className="p-2 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 transition-colors"
        >
          <FaInfoCircle className="text-purple-400" />
        </button>
      </div>

      {/* 3D 캔버스 */}
      <div className="h-96 bg-black/50 rounded-lg mb-6 relative overflow-hidden">
        <Canvas camera={{ position: [0, 5, 15], fov: 50 }}>
          <LSTMScene activeGate={activeGate} />
        </Canvas>
        
        {/* 활성 게이트 표시 */}
        <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm rounded-lg p-3">
          <p className="text-sm text-gray-400">현재 활성 게이트:</p>
          <p className="text-lg font-bold text-white">{gateInfo[activeGate as keyof typeof gateInfo].title}</p>
        </div>
      </div>

      {/* 게이트 선택 버튼 */}
      <div className="flex gap-4 mb-6">
        {Object.entries(gateInfo).map(([key, info]) => (
          <button
            key={key}
            onClick={() => setActiveGate(key)}
            className={`flex-1 p-3 rounded-lg transition-all ${
              activeGate === key
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            <div className="font-semibold">{info.title.split(' ')[0]} Gate</div>
            <div className="text-xs mt-1 opacity-70">{info.title.split('(')[1].replace(')', '')}</div>
          </button>
        ))}
      </div>

      {/* 상세 정보 */}
      <motion.div
        initial={false}
        animate={{ height: showInfo ? 'auto' : 0 }}
        className="overflow-hidden"
      >
        <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
          <h4 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
            <FaMemory className="text-purple-500" />
            {gateInfo[activeGate as keyof typeof gateInfo].title}
          </h4>
          <p className="text-gray-300 mb-4">
            {gateInfo[activeGate as keyof typeof gateInfo].description}
          </p>
          <div className="bg-black/50 rounded-lg p-3">
            <p className="text-sm text-gray-400 mb-1">수식:</p>
            <code className="text-purple-400 font-mono">
              {gateInfo[activeGate as keyof typeof gateInfo].formula}
            </code>
          </div>
        </div>
      </motion.div>

      {/* 범례 */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-500 rounded"></div>
          <span className="text-sm text-gray-400">입력 데이터</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded"></div>
          <span className="text-sm text-gray-400">Forget Gate</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <span className="text-sm text-gray-400">Input Gate</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-500 rounded"></div>
          <span className="text-sm text-gray-400">Output Gate</span>
        </div>
      </div>
    </div>
  )
}