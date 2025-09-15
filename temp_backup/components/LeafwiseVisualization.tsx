'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FaLeaf, FaPlay, FaPause, FaRedo, FaTree,
  FaChartLine, FaCode, FaLightbulb, FaExpand
} from 'react-icons/fa'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Text, Line as ThreeLine } from '@react-three/drei'
import * as THREE from 'three'

interface LeafwiseVisualizationProps {
  symbol: string
}

interface TreeNode {
  id: string
  depth: number
  position: [number, number, number]
  gain: number
  samples: number
  isLeaf: boolean
  children: TreeNode[]
  splitFeature?: string
  threshold?: number
}

export default function LeafwiseVisualization({ symbol }: LeafwiseVisualizationProps) {
  const [isAnimating, setIsAnimating] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [growthMode, setGrowthMode] = useState<'leafwise' | 'levelwise'>('leafwise')
  const [showComparison, setShowComparison] = useState(false)

  const maxSteps = 15
  const animationSpeed = 1000

  // 초기 트리 구조
  const initialTree: TreeNode = {
    id: 'root',
    depth: 0,
    position: [0, 4, 0],
    gain: 100,
    samples: 10000,
    isLeaf: false,
    children: []
  }

  const [tree, setTree] = useState<TreeNode>(initialTree)

  // Leaf-wise 성장 시뮬레이션
  const growTreeLeafwise = (currentTree: TreeNode, step: number): TreeNode => {
    if (step === 0) return currentTree

    // 모든 리프 노드 찾기
    const leafNodes: TreeNode[] = []
    const findLeaves = (node: TreeNode) => {
      if (node.isLeaf || node.children.length === 0) {
        leafNodes.push(node)
      } else {
        node.children.forEach(findLeaves)
      }
    }
    findLeaves(currentTree)

    // 가장 높은 gain을 가진 리프 선택
    const bestLeaf = leafNodes.reduce((best, leaf) => 
      leaf.gain > best.gain ? leaf : best
    )

    // 선택된 리프를 분할
    const splitNode = (node: TreeNode): TreeNode => {
      if (node.id === bestLeaf.id) {
        const leftChild: TreeNode = {
          id: `${node.id}-L`,
          depth: node.depth + 1,
          position: [
            node.position[0] - Math.pow(0.7, node.depth) * 2,
            node.position[1] - 1,
            node.position[2]
          ],
          gain: node.gain * 0.6 + Math.random() * 20,
          samples: Math.floor(node.samples * 0.6),
          isLeaf: true,
          children: [],
          splitFeature: `Feature_${Math.floor(Math.random() * 10)}`,
          threshold: Math.random() * 100
        }

        const rightChild: TreeNode = {
          id: `${node.id}-R`,
          depth: node.depth + 1,
          position: [
            node.position[0] + Math.pow(0.7, node.depth) * 2,
            node.position[1] - 1,
            node.position[2]
          ],
          gain: node.gain * 0.4 + Math.random() * 20,
          samples: Math.floor(node.samples * 0.4),
          isLeaf: true,
          children: [],
          splitFeature: `Feature_${Math.floor(Math.random() * 10)}`,
          threshold: Math.random() * 100
        }

        return {
          ...node,
          isLeaf: false,
          children: [leftChild, rightChild]
        }
      }

      return {
        ...node,
        children: node.children.map(splitNode)
      }
    }

    return splitNode(currentTree)
  }

  // Level-wise 성장 시뮬레이션 (비교용)
  const growTreeLevelwise = (currentTree: TreeNode, step: number): TreeNode => {
    if (step === 0) return currentTree

    const targetDepth = Math.floor((step - 1) / 2)
    
    const splitNodesAtDepth = (node: TreeNode): TreeNode => {
      if (node.depth === targetDepth && node.children.length === 0) {
        return {
          ...node,
          isLeaf: false,
          children: [
            {
              id: `${node.id}-L`,
              depth: node.depth + 1,
              position: [
                node.position[0] - Math.pow(0.7, node.depth) * 2,
                node.position[1] - 1,
                node.position[2]
              ],
              gain: node.gain * 0.5 + Math.random() * 10,
              samples: Math.floor(node.samples * 0.5),
              isLeaf: true,
              children: []
            },
            {
              id: `${node.id}-R`,
              depth: node.depth + 1,
              position: [
                node.position[0] + Math.pow(0.7, node.depth) * 2,
                node.position[1] - 1,
                node.position[2]
              ],
              gain: node.gain * 0.5 + Math.random() * 10,
              samples: Math.floor(node.samples * 0.5),
              isLeaf: true,
              children: []
            }
          ]
        }
      }

      return {
        ...node,
        children: node.children.map(splitNodesAtDepth)
      }
    }

    return splitNodesAtDepth(currentTree)
  }

  // 애니메이션 효과
  useEffect(() => {
    if (isAnimating && currentStep < maxSteps) {
      const timer = setTimeout(() => {
        setTree(prev => 
          growthMode === 'leafwise' 
            ? growTreeLeafwise(prev, currentStep + 1)
            : growTreeLevelwise(prev, currentStep + 1)
        )
        setCurrentStep(prev => prev + 1)
      }, animationSpeed)

      return () => clearTimeout(timer)
    } else if (currentStep >= maxSteps) {
      setIsAnimating(false)
    }
  }, [isAnimating, currentStep, growthMode])

  // 트리 통계 계산
  const treeStats = useMemo(() => {
    let nodeCount = 0
    let leafCount = 0
    let totalGain = 0
    let maxDepth = 0

    const traverse = (node: TreeNode) => {
      nodeCount++
      totalGain += node.gain
      maxDepth = Math.max(maxDepth, node.depth)
      
      if (node.isLeaf || node.children.length === 0) {
        leafCount++
      } else {
        node.children.forEach(traverse)
      }
    }

    traverse(tree)

    return { nodeCount, leafCount, totalGain, maxDepth }
  }, [tree])

  // 3D 노드 렌더링
  function TreeNode3D({ node, onSelect }: { node: TreeNode; onSelect: (id: string) => void }) {
    const isSelected = selectedNode === node.id
    const color = node.isLeaf || node.children.length === 0
      ? new THREE.Color().setHSL(0.3, 0.7, 0.5) // 리프 노드는 녹색
      : new THREE.Color().setHSL(0.6, 0.7, 0.5) // 내부 노드는 파란색

    return (
      <group position={node.position}>
        <mesh onClick={() => onSelect(node.id)}>
          <sphereGeometry args={[0.3 + node.gain / 200, 16, 16]} />
          <meshStandardMaterial 
            color={color}
            emissive={isSelected ? '#ffffff' : color}
            emissiveIntensity={isSelected ? 0.3 : 0.1}
          />
        </mesh>
        
        <Text
          position={[0, -0.6, 0]}
          fontSize={0.15}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {node.gain.toFixed(0)}
        </Text>

        {/* 자식 노드와의 연결선 */}
        {node.children.map((child, index) => (
          <ThreeLine
            key={child.id}
            points={[[0, 0, 0], [
              child.position[0] - node.position[0],
              child.position[1] - node.position[1],
              child.position[2] - node.position[2]
            ]]}
            color="#4a5568"
            lineWidth={2}
          />
        ))}

        {/* 자식 노드 렌더링 */}
        {node.children.map(child => (
          <TreeNode3D key={child.id} node={child} onSelect={onSelect} />
        ))}
      </group>
    )
  }

  const toggleAnimation = () => {
    if (isAnimating) {
      setIsAnimating(false)
    } else {
      if (currentStep >= maxSteps) {
        resetAnimation()
      }
      setIsAnimating(true)
    }
  }

  const resetAnimation = () => {
    setIsAnimating(false)
    setCurrentStep(0)
    setTree(initialTree)
    setSelectedNode(null)
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-4 flex items-center justify-center gap-3">
          <FaLeaf className="text-green-400" />
          Leaf-wise 트리 성장 시각화
        </h2>
        <p className="text-gray-300">
          LightGBM의 핵심: 최대 이득을 가진 리프를 우선적으로 분할
        </p>
      </div>

      {/* 컨트롤 패널 */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">성장 시뮬레이션</h3>
          
          <div className="flex items-center gap-4">
            {/* 성장 모드 선택 */}
            <div className="flex gap-2">
              <button
                onClick={() => setGrowthMode('leafwise')}
                className={`px-4 py-2 rounded-lg text-sm transition-all ${
                  growthMode === 'leafwise'
                    ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                    : 'bg-gray-700/50 text-gray-400 border border-gray-600/50'
                }`}
              >
                <FaLeaf className="inline mr-1" /> Leaf-wise
              </button>
              <button
                onClick={() => setGrowthMode('levelwise')}
                className={`px-4 py-2 rounded-lg text-sm transition-all ${
                  growthMode === 'levelwise'
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50'
                    : 'bg-gray-700/50 text-gray-400 border border-gray-600/50'
                }`}
              >
                <FaTree className="inline mr-1" /> Level-wise
              </button>
            </div>
            
            {/* 애니메이션 컨트롤 */}
            <button
              onClick={toggleAnimation}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                isAnimating
                  ? 'bg-red-500/20 text-red-400 border border-red-500/50'
                  : 'bg-green-500/20 text-green-400 border border-green-500/50'
              } hover:opacity-80`}
            >
              {isAnimating ? <FaPause /> : <FaPlay />}
              {isAnimating ? '일시정지' : '시작'}
            </button>
            <button
              onClick={resetAnimation}
              className="px-4 py-2 rounded-lg bg-gray-700/50 text-gray-400 border border-gray-600/50 hover:bg-gray-600/50 flex items-center gap-2"
            >
              <FaRedo />
              리셋
            </button>
          </div>
        </div>

        {/* 진행 상태 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-white mb-1">
              {currentStep} / {maxSteps}
            </div>
            <div className="text-sm text-gray-400">분할 단계</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-green-400 mb-1">
              {treeStats.leafCount}
            </div>
            <div className="text-sm text-gray-400">리프 노드</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-400 mb-1">
              {treeStats.maxDepth}
            </div>
            <div className="text-sm text-gray-400">최대 깊이</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-400 mb-1">
              {treeStats.totalGain.toFixed(0)}
            </div>
            <div className="text-sm text-gray-400">총 이득</div>
          </div>
        </div>

        {/* 프로그레스 바 */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">성장 진행도</span>
            <span className="text-white text-sm font-semibold">
              {((currentStep / maxSteps) * 100).toFixed(0)}%
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(currentStep / maxSteps) * 100}%` }}
              className={`h-full ${
                growthMode === 'leafwise' 
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                  : 'bg-gradient-to-r from-blue-500 to-cyan-500'
              }`}
            />
          </div>
        </div>
      </div>

      {/* 3D 트리 시각화 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
          >
            <h3 className="text-lg font-bold text-white mb-4">트리 구조 3D 시각화</h3>
            <div style={{ height: '500px' }} className="bg-gray-900/50 rounded-lg">
              <Canvas camera={{ position: [0, 0, 15], fov: 50 }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={0.5} />
                <pointLight position={[-10, -10, -10]} intensity={0.3} />
                
                <TreeNode3D node={tree} onSelect={setSelectedNode} />
                
                <OrbitControls 
                  enablePan={true} 
                  enableZoom={true} 
                  enableRotate={true}
                  minDistance={5}
                  maxDistance={30}
                />
              </Canvas>
            </div>
            
            <div className="mt-4 text-sm text-gray-400 text-center">
              마우스로 회전, 스크롤로 줌, 노드 클릭으로 정보 확인
            </div>
          </motion.div>
        </div>

        {/* 노드 정보 패널 */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
        >
          <h3 className="text-lg font-bold text-white mb-4">노드 정보</h3>
          
          {selectedNode ? (
            <div className="space-y-3">
              <div className="bg-gray-700/30 rounded-lg p-3">
                <div className="text-sm text-gray-400">노드 ID</div>
                <div className="text-white font-mono">{selectedNode}</div>
              </div>
              
              <div className="bg-gray-700/30 rounded-lg p-3">
                <div className="text-sm text-gray-400">이득 (Gain)</div>
                <div className="text-2xl font-bold text-green-400">
                  {tree.gain.toFixed(2)}
                </div>
              </div>
              
              <div className="bg-gray-700/30 rounded-lg p-3">
                <div className="text-sm text-gray-400">샘플 수</div>
                <div className="text-xl font-bold text-blue-400">
                  {tree.samples.toLocaleString()}
                </div>
              </div>
              
              <div className="bg-gray-700/30 rounded-lg p-3">
                <div className="text-sm text-gray-400">깊이</div>
                <div className="text-xl font-bold text-purple-400">
                  Level {tree.depth}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              노드를 클릭하여 정보를 확인하세요
            </div>
          )}
        </motion.div>
      </div>

      {/* Leaf-wise vs Level-wise 비교 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-green-900/20 to-blue-900/20 rounded-xl p-6 border border-green-500/30"
      >
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <FaLightbulb className="text-yellow-400" />
          Leaf-wise vs Level-wise 비교
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h4 className="text-green-400 font-semibold mb-3 flex items-center gap-2">
              <FaLeaf /> Leaf-wise Growth (LightGBM)
            </h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">•</span>
                <span>최대 손실 감소를 가진 리프를 선택하여 분할</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">•</span>
                <span>불균형 트리 생성 허용으로 효율성 증대</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">•</span>
                <span>적은 노드로 높은 정확도 달성</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">•</span>
                <span>복잡한 패턴을 빠르게 학습</span>
              </li>
            </ul>
          </div>
          
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h4 className="text-blue-400 font-semibold mb-3 flex items-center gap-2">
              <FaTree /> Level-wise Growth (XGBoost)
            </h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>같은 깊이의 모든 노드를 동시에 분할</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>균형 잡힌 트리 구조 유지</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>과적합 위험이 상대적으로 낮음</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>많은 노드가 필요하여 메모리 사용량 증가</span>
              </li>
            </ul>
          </div>
        </div>
      </motion.div>

      {/* 성능 이점 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
      >
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <FaChartLine className="text-purple-400" />
          Leaf-wise 성능 이점
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center bg-gray-700/30 rounded-lg p-4">
            <div className="text-3xl font-bold text-green-400 mb-2">3x</div>
            <div className="text-sm text-gray-300">더 빠른 수렴</div>
            <div className="text-xs text-gray-500 mt-1">동일 정확도 기준</div>
          </div>
          
          <div className="text-center bg-gray-700/30 rounded-lg p-4">
            <div className="text-3xl font-bold text-blue-400 mb-2">70%</div>
            <div className="text-sm text-gray-300">메모리 절약</div>
            <div className="text-xs text-gray-500 mt-1">노드 수 감소</div>
          </div>
          
          <div className="text-center bg-gray-700/30 rounded-lg p-4">
            <div className="text-3xl font-bold text-purple-400 mb-2">2x</div>
            <div className="text-sm text-gray-300">예측 속도</div>
            <div className="text-xs text-gray-500 mt-1">적은 트리 깊이</div>
          </div>
          
          <div className="text-center bg-gray-700/30 rounded-lg p-4">
            <div className="text-3xl font-bold text-yellow-400 mb-2">15%</div>
            <div className="text-sm text-gray-300">정확도 향상</div>
            <div className="text-xs text-gray-500 mt-1">복잡한 패턴</div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}