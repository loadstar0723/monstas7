'use client'

import React, { useRef, useState, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Box, Sphere, Text, Line, MeshDistortMaterial } from '@react-three/drei'
import * as THREE from 'three'
import { motion } from 'framer-motion'
import { FaExchangeAlt, FaCog, FaBrain, FaChartLine } from 'react-icons/fa'
import { 
  LineChart, Line as RechartsLine, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts'

interface GateVisualizationProps {
  symbol: string
}

// 게이트 3D 컴포넌트
function GRUGate({ position, color, label, value, isActive }: {
  position: [number, number, number]
  color: string
  label: string
  value: number
  isActive: boolean
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += isActive ? 0.02 : 0.005
      meshRef.current.scale.setScalar(hovered ? 1.2 : 1)
    }
  })

  return (
    <group position={position}>
      <Box
        ref={meshRef}
        args={[1, 1, 1]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isActive ? 0.5 : 0.2}
          metalness={0.8}
          roughness={0.2}
        />
      </Box>
      <Text
        position={[0, -1.5, 0]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {label}
      </Text>
      <Text
        position={[0, 1.5, 0]}
        fontSize={0.4}
        color={color}
        anchorX="center"
        anchorY="middle"
      >
        {(value * 100).toFixed(1)}%
      </Text>
    </group>
  )
}

// 정보 흐름 라인
function FlowLine({ start, end, intensity }: {
  start: [number, number, number]
  end: [number, number, number]
  intensity: number
}) {
  const lineRef = useRef<THREE.Line>(null)

  useFrame((state) => {
    if (lineRef.current && lineRef.current.material) {
      const material = lineRef.current.material as THREE.LineBasicMaterial
      material.opacity = 0.3 + intensity * 0.7
    }
  })

  const points = [
    new THREE.Vector3(...start),
    new THREE.Vector3(...end)
  ]

  return (
    <line ref={lineRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={points.length}
          array={new Float32Array(points.flatMap(p => [p.x, p.y, p.z]))}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial color="#10b981" linewidth={2} transparent />
    </line>
  )
}

export default function GateVisualization({ symbol }: GateVisualizationProps) {
  const [resetGate, setResetGate] = useState(0.3)
  const [updateGate, setUpdateGate] = useState(0.7)
  const [candidateState, setCandidateState] = useState(0.5)
  const [timeSeriesData, setTimeSeriesData] = useState<any[]>([])

  // 실시간 게이트 값 시뮬레이션
  useEffect(() => {
    const interval = setInterval(() => {
      setResetGate(0.2 + Math.random() * 0.6)
      setUpdateGate(0.5 + Math.random() * 0.4)
      setCandidateState(0.3 + Math.random() * 0.5)

      setTimeSeriesData(prev => {
        const newData = [...prev, {
          time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          reset: resetGate,
          update: updateGate,
          candidate: candidateState,
          output: (1 - updateGate) * 0.6 + updateGate * candidateState
        }].slice(-30)
        return newData
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [resetGate, updateGate, candidateState])

  // 게이트 영향력 데이터
  const gateInfluence = [
    { gate: 'Reset', shortTerm: 85, longTerm: 45, efficiency: 90 },
    { gate: 'Update', shortTerm: 70, longTerm: 80, efficiency: 85 },
    { gate: 'Candidate', shortTerm: 60, longTerm: 70, efficiency: 75 },
    { gate: 'Hidden', shortTerm: 80, longTerm: 85, efficiency: 88 }
  ]

  return (
    <div className="space-y-6">
      {/* 3D 게이트 시각화 */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
          <FaBrain className="text-green-500" />
          GRU 게이트 3D 시각화
        </h3>
        
        <div className="h-96 relative">
          <Canvas camera={{ position: [0, 0, 8], fov: 50 }}>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} />
            <pointLight position={[-10, -10, -10]} intensity={0.5} />
            
            <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
            
            {/* Reset Gate */}
            <GRUGate
              position={[-3, 0, 0]}
              color="#ef4444"
              label="Reset Gate"
              value={resetGate}
              isActive={resetGate > 0.5}
            />
            
            {/* Update Gate */}
            <GRUGate
              position={[0, 0, 0]}
              color="#3b82f6"
              label="Update Gate"
              value={updateGate}
              isActive={updateGate > 0.6}
            />
            
            {/* Candidate State */}
            <Sphere position={[3, 0, 0]} args={[0.8, 32, 32]}>
              <MeshDistortMaterial
                color="#10b981"
                attach="material"
                distort={candidateState}
                speed={2}
                roughness={0.2}
                metalness={0.8}
              />
            </Sphere>
            <Text
              position={[3, -1.5, 0]}
              fontSize={0.3}
              color="white"
              anchorX="center"
              anchorY="middle"
            >
              Candidate
            </Text>
            
            {/* Flow Lines */}
            <FlowLine start={[-3, 0, 0]} end={[0, 0, 0]} intensity={resetGate} />
            <FlowLine start={[0, 0, 0]} end={[3, 0, 0]} intensity={updateGate} />
            <FlowLine start={[3, 0, 0]} end={[0, -3, 0]} intensity={candidateState} />
            
            {/* Hidden State */}
            <Box position={[0, -3, 0]} args={[2, 0.5, 0.5]}>
              <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={0.3} />
            </Box>
            <Text
              position={[0, -3.8, 0]}
              fontSize={0.3}
              color="white"
              anchorX="center"
              anchorY="middle"
            >
              Hidden State
            </Text>
          </Canvas>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-sm text-gray-400 mb-1">Reset Gate</div>
            <div className="text-2xl font-bold text-red-400">{(resetGate * 100).toFixed(1)}%</div>
            <div className="text-xs text-gray-500 mt-1">이전 정보 리셋</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-400 mb-1">Update Gate</div>
            <div className="text-2xl font-bold text-blue-400">{(updateGate * 100).toFixed(1)}%</div>
            <div className="text-xs text-gray-500 mt-1">정보 업데이트</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-400 mb-1">Candidate State</div>
            <div className="text-2xl font-bold text-green-400">{(candidateState * 100).toFixed(1)}%</div>
            <div className="text-xs text-gray-500 mt-1">새로운 정보</div>
          </div>
        </div>
      </div>

      {/* 게이트 활성화 시계열 */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
          <FaChartLine className="text-green-500" />
          실시간 게이트 활성화 패턴
        </h3>
        
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={timeSeriesData}>
            <defs>
              <linearGradient id="resetGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="updateGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="candidateGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="time" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" domain={[0, 1]} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1f2937',
                border: '1px solid #374151',
                borderRadius: '8px'
              }}
              formatter={(value: any) => [(value * 100).toFixed(1) + '%']}
            />
            <Area
              type="monotone"
              dataKey="reset"
              stackId="1"
              stroke="#ef4444"
              fill="url(#resetGradient)"
              name="Reset Gate"
            />
            <Area
              type="monotone"
              dataKey="update"
              stackId="2"
              stroke="#3b82f6"
              fill="url(#updateGradient)"
              name="Update Gate"
            />
            <Area
              type="monotone"
              dataKey="candidate"
              stackId="3"
              stroke="#10b981"
              fill="url(#candidateGradient)"
              name="Candidate State"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* 게이트 영향력 분석 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
          <h3 className="text-lg font-bold text-white mb-4">게이트별 영향력</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={gateInfluence}>
              <PolarGrid stroke="#374151" />
              <PolarAngleAxis dataKey="gate" stroke="#9ca3af" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#9ca3af" />
              <Radar
                name="단기 예측"
                dataKey="shortTerm"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.6}
              />
              <Radar
                name="장기 예측"
                dataKey="longTerm"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.6}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
          <h3 className="text-lg font-bold text-white mb-4">게이트 수식</h3>
          <div className="space-y-4 font-mono text-sm">
            <div className="p-3 bg-gray-900/50 rounded-lg border border-red-500/30">
              <div className="text-red-400 mb-2">Reset Gate</div>
              <div className="text-gray-300">rt = σ(Wr·[ht-1, xt] + br)</div>
              <div className="text-gray-500 text-xs mt-1">과거 정보 리셋 비율 결정</div>
            </div>
            
            <div className="p-3 bg-gray-900/50 rounded-lg border border-blue-500/30">
              <div className="text-blue-400 mb-2">Update Gate</div>
              <div className="text-gray-300">zt = σ(Wz·[ht-1, xt] + bz)</div>
              <div className="text-gray-500 text-xs mt-1">현재/과거 정보 비율 조절</div>
            </div>
            
            <div className="p-3 bg-gray-900/50 rounded-lg border border-green-500/30">
              <div className="text-green-400 mb-2">Candidate State</div>
              <div className="text-gray-300">h̃t = tanh(W·[rt * ht-1, xt] + b)</div>
              <div className="text-gray-500 text-xs mt-1">새로운 정보 후보 생성</div>
            </div>
            
            <div className="p-3 bg-gray-900/50 rounded-lg border border-yellow-500/30">
              <div className="text-yellow-400 mb-2">Hidden State</div>
              <div className="text-gray-300">ht = (1 - zt) * ht-1 + zt * h̃t</div>
              <div className="text-gray-500 text-xs mt-1">최종 상태 출력</div>
            </div>
          </div>
        </div>
      </div>

      {/* 게이트 작동 설명 */}
      <div className="bg-gradient-to-r from-green-900/20 to-blue-900/20 rounded-xl p-6 border border-green-500/30">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-3">
          <FaCog className="text-green-400" />
          GRU 게이트 작동 원리
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-green-400 font-semibold mb-2">Reset Gate의 역할</h4>
            <p className="text-gray-300 text-sm leading-relaxed">
              Reset Gate는 이전 시점의 정보 중 얼마나 잊을지를 결정합니다. 
              값이 0에 가까우면 이전 정보를 모두 리셋하고, 1에 가까우면 
              모두 유지합니다. 급격한 시장 변화 시 낮은 값으로 새로운 패턴에 집중합니다.
            </p>
          </div>
          <div>
            <h4 className="text-blue-400 font-semibold mb-2">Update Gate의 역할</h4>
            <p className="text-gray-300 text-sm leading-relaxed">
              Update Gate는 현재 정보와 이전 정보의 비율을 조절합니다. 
              높은 값은 새로운 정보를 더 많이 반영하고, 낮은 값은 
              이전 상태를 더 유지합니다. 트렌드 지속성을 판단하는 핵심 요소입니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}