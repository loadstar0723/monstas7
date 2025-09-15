'use client'

import React, { useState, useRef, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Text, Line, Sphere, Box, Cylinder } from '@react-three/drei'
import * as THREE from 'three'
import { FaTree, FaCodeBranch, FaLeaf, FaEye, FaSearch, FaCube } from 'react-icons/fa'

// 트리 노드 인터페이스
interface TreeNode {
  id: string
  feature?: string
  threshold?: number
  value?: number
  left?: TreeNode
  right?: TreeNode
  isLeaf: boolean
  depth: number
  position: [number, number, number]
  prediction?: string
  samples?: number
}

// 3D 트리 노드 컴포넌트
function TreeNode3D({ node, onHover, isHovered }: { 
  node: TreeNode, 
  onHover: (node: TreeNode | null) => void,
  isHovered: boolean 
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  
  useFrame((state) => {
    if (meshRef.current && isHovered) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 2) * 0.1
    }
  })

  const color = node.isLeaf 
    ? (node.prediction === 'UP' ? '#10b981' : '#ef4444') 
    : '#3b82f6'

  return (
    <group position={node.position}>
      <mesh
        ref={meshRef}
        onPointerOver={() => onHover(node)}
        onPointerOut={() => onHover(null)}
        scale={isHovered ? 1.2 : 1}
      >
        {node.isLeaf ? (
          <Sphere args={[0.3, 16, 16]}>
            <meshStandardMaterial 
              color={color} 
              emissive={color}
              emissiveIntensity={isHovered ? 0.5 : 0.2}
            />
          </Sphere>
        ) : (
          <Box args={[0.5, 0.5, 0.5]}>
            <meshStandardMaterial 
              color={color}
              emissive={color}
              emissiveIntensity={isHovered ? 0.5 : 0.2}
            />
          </Box>
        )}
      </mesh>
      
      {!node.isLeaf && (
        <Text
          position={[0, 0.4, 0]}
          fontSize={0.15}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {node.feature}
        </Text>
      )}
    </group>
  )
}

// 트리 엣지 컴포넌트
function TreeEdge({ from, to, isYes }: { 
  from: [number, number, number], 
  to: [number, number, number],
  isYes: boolean 
}) {
  const points = useMemo(() => [
    new THREE.Vector3(...from),
    new THREE.Vector3(...to)
  ], [from, to])

  return (
    <Line
      points={points}
      color={isYes ? '#10b981' : '#ef4444'}
      lineWidth={2}
      opacity={0.6}
      transparent
    />
  )
}

// 의사결정 트리 생성
function generateDecisionTree(depth: number = 4): TreeNode {
  const features = ['RSI', 'MACD', 'Volume', 'MA20', 'Bollinger', 'ATR']
  
  function createNode(currentDepth: number, x: number, y: number): TreeNode {
    const isLeaf = currentDepth >= depth || Math.random() > 0.7
    
    if (isLeaf) {
      return {
        id: `node-${Math.random()}`,
        isLeaf: true,
        depth: currentDepth,
        position: [x, y, 0],
        prediction: Math.random() > 0.5 ? 'UP' : 'DOWN',
        value: Math.random() * 0.1 - 0.05,
        samples: Math.floor(Math.random() * 100) + 20
      }
    }
    
    const feature = features[Math.floor(Math.random() * features.length)]
    const spread = 3 / (currentDepth + 1)
    
    return {
      id: `node-${Math.random()}`,
      feature,
      threshold: Math.random() * 100,
      isLeaf: false,
      depth: currentDepth,
      position: [x, y, 0],
      left: createNode(currentDepth + 1, x - spread, y - 1.5),
      right: createNode(currentDepth + 1, x + spread, y - 1.5),
      samples: Math.floor(Math.random() * 200) + 100
    }
  }
  
  return createNode(0, 0, 0)
}

// 트리를 렌더링하는 재귀 함수
function renderTree(node: TreeNode, hoveredNode: TreeNode | null, onHover: (node: TreeNode | null) => void): JSX.Element[] {
  const elements: JSX.Element[] = []
  
  elements.push(
    <TreeNode3D 
      key={node.id} 
      node={node} 
      onHover={onHover}
      isHovered={hoveredNode?.id === node.id}
    />
  )
  
  if (!node.isLeaf && node.left && node.right) {
    elements.push(
      <TreeEdge 
        key={`${node.id}-left`}
        from={node.position}
        to={node.left.position}
        isYes={true}
      />
    )
    elements.push(
      <TreeEdge 
        key={`${node.id}-right`}
        from={node.position}
        to={node.right.position}
        isYes={false}
      />
    )
    
    elements.push(...renderTree(node.left, hoveredNode, onHover))
    elements.push(...renderTree(node.right, hoveredNode, onHover))
  }
  
  return elements
}

interface TreeVisualization3DProps {
  symbol: string
}

export default function TreeVisualization3D({ symbol }: TreeVisualization3DProps) {
  const [selectedTree, setSelectedTree] = useState(0)
  const [hoveredNode, setHoveredNode] = useState<TreeNode | null>(null)
  const [treeDepth, setTreeDepth] = useState(4)
  const [viewMode, setViewMode] = useState<'single' | 'forest'>('single')
  
  // 여러 트리 생성
  const trees = useMemo(() => {
    return Array.from({ length: 5 }, () => generateDecisionTree(treeDepth))
  }, [treeDepth])

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-4 flex items-center justify-center gap-3">
          <FaTree className="text-green-400" />
          3D 의사결정 트리 시각화
        </h2>
        <p className="text-gray-300">
          Random Forest를 구성하는 개별 의사결정 트리의 구조를 3차원으로 탐색합니다
        </p>
      </div>

      {/* 컨트롤 패널 */}
      <div className="flex flex-wrap items-center justify-center gap-4 mb-6">
        {/* 뷰 모드 전환 */}
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('single')}
            className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
              viewMode === 'single'
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50'
                : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 border border-gray-700/50'
            }`}
          >
            <FaTree />
            단일 트리
          </button>
          <button
            onClick={() => setViewMode('forest')}
            className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
              viewMode === 'forest'
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50'
                : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 border border-gray-700/50'
            }`}
          >
            <FaCube />
            포레스트 뷰
          </button>
        </div>

        {/* 트리 선택 (단일 뷰에서만) */}
        {viewMode === 'single' && (
          <div className="flex items-center gap-2">
            <span className="text-gray-400">트리 선택:</span>
            <select
              value={selectedTree}
              onChange={(e) => {
                if (e && e.target && e.target.value) {
                  setSelectedTree(Number(e.target.value))
                }
              }}
              className="px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              {trees.map((_, index) => (
                <option key={index} value={index}>
                  Tree {index + 1}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* 트리 깊이 조절 */}
        <div className="flex items-center gap-2">
          <span className="text-gray-400">깊이:</span>
          <input
            type="range"
            min="2"
            max="6"
            value={treeDepth}
            onChange={(e) => {
              if (e && e.target && e.target.value) {
                setTreeDepth(Number(e.target.value))
              }
            }}
            className="w-24"
          />
          <span className="text-white font-mono">{treeDepth}</span>
        </div>
      </div>

      {/* 3D 시각화 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
        style={{ height: '600px' }}
      >
        <Canvas camera={{ position: [0, 0, 15], fov: 50 }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={0.8} />
          <pointLight position={[-10, -10, -10]} intensity={0.5} />
          
          {viewMode === 'single' ? (
            // 단일 트리 뷰
            <group>
              {renderTree(trees[selectedTree], hoveredNode, setHoveredNode)}
            </group>
          ) : (
            // 포레스트 뷰
            <group>
              {trees.slice(0, 3).map((tree, index) => (
                <group key={index} position={[(index - 1) * 8, 0, 0]} scale={0.5}>
                  {renderTree(tree, null, () => {})}
                </group>
              ))}
            </group>
          )}
          
          <OrbitControls 
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={5}
            maxDistance={30}
          />
        </Canvas>
      </motion.div>

      {/* 노드 정보 패널 */}
      {hoveredNode && viewMode === 'single' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
        >
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            {hoveredNode.isLeaf ? <FaLeaf className="text-green-400" /> : <FaCodeBranch className="text-blue-400" />}
            노드 상세 정보
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-gray-400 text-sm">타입</div>
              <div className="text-white font-semibold">
                {hoveredNode.isLeaf ? '리프 노드' : '분기 노드'}
              </div>
            </div>
            
            {!hoveredNode.isLeaf && (
              <>
                <div>
                  <div className="text-gray-400 text-sm">특성</div>
                  <div className="text-white font-semibold">{hoveredNode.feature}</div>
                </div>
                <div>
                  <div className="text-gray-400 text-sm">임계값</div>
                  <div className="text-white font-semibold">
                    {hoveredNode.threshold?.toFixed(2)}
                  </div>
                </div>
              </>
            )}
            
            {hoveredNode.isLeaf && (
              <div>
                <div className="text-gray-400 text-sm">예측</div>
                <div className={`font-semibold ${
                  hoveredNode.prediction === 'UP' ? 'text-green-400' : 'text-red-400'
                }`}>
                  {hoveredNode.prediction}
                </div>
              </div>
            )}
            
            <div>
              <div className="text-gray-400 text-sm">샘플 수</div>
              <div className="text-white font-semibold">{hoveredNode.samples}</div>
            </div>
          </div>
        </motion.div>
      )}

      {/* 트리 구조 설명 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-green-900/20 to-blue-900/20 rounded-xl p-6 border border-green-500/30"
      >
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <FaEye className="text-blue-400" />
          시각화 가이드
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <h4 className="text-green-400 font-semibold mb-2">노드 타입</h4>
            <ul className="space-y-1 text-gray-300">
              <li>• 큐브: 분기 노드 (조건 검사)</li>
              <li>• 구: 리프 노드 (최종 예측)</li>
              <li>• 파란색: 분기점</li>
              <li>• 초록/빨강: 상승/하락 예측</li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-blue-400 font-semibold mb-2">엣지 색상</h4>
            <ul className="space-y-1 text-gray-300">
              <li>• 초록선: Yes 경로 (조건 충족)</li>
              <li>• 빨간선: No 경로 (조건 미충족)</li>
              <li>• 선 두께: 샘플 수에 비례</li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-purple-400 font-semibold mb-2">상호작용</h4>
            <ul className="space-y-1 text-gray-300">
              <li>• 마우스 호버: 노드 정보 표시</li>
              <li>• 드래그: 3D 회전</li>
              <li>• 스크롤: 확대/축소</li>
              <li>• 우클릭 드래그: 이동</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  )
}