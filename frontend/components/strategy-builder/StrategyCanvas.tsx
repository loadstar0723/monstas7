'use client'

import React, { useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ReactFlow, {
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  addEdge,
  Controls,
  MiniMap,
  Background,
  BackgroundVariant,
  Connection,
  Edge,
  Node,
  NodeTypes,
  MarkerType
} from 'reactflow'
import 'reactflow/dist/style.css'
import { FaBrain, FaChartLine, FaCog, FaDatabase, FaBell, FaRobot, FaPlay, FaStop, FaSave, FaDownload } from 'react-icons/fa'
import { GiArtificialIntelligence } from 'react-icons/gi'

// 커스텀 노드 타입들
import IndicatorNode from './nodes/IndicatorNode'
import SignalNode from './nodes/SignalNode'
import ConditionNode from './nodes/ConditionNode'
import ActionNode from './nodes/ActionNode'
import DataNode from './nodes/DataNode'
import AINode from './nodes/AINode'

interface StrategyNode extends Node {
  data: {
    label: string
    type: string
    config: any
    inputs: string[]
    outputs: string[]
    value?: any
  }
}

interface Props {
  onStrategyChange?: (strategy: any) => void
  initialStrategy?: any
}

const nodeTypes: NodeTypes = {
  indicator: IndicatorNode,
  signal: SignalNode,
  condition: ConditionNode,
  action: ActionNode,
  data: DataNode,
  ai: AINode
}

const initialNodes: StrategyNode[] = [
  {
    id: '1',
    type: 'data',
    position: { x: 100, y: 100 },
    data: {
      label: '가격 데이터',
      type: 'data',
      config: { symbol: 'BTCUSDT', interval: '1h' },
      inputs: [],
      outputs: ['price', 'volume']
    }
  }
]

export default function StrategyCanvas({ onStrategyChange, initialStrategy }: Props) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [selectedNode, setSelectedNode] = useState<StrategyNode | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [strategyName, setStrategyName] = useState('새 전략')
  const [showNodeLibrary, setShowNodeLibrary] = useState(false)

  // 노드 라이브러리
  const nodeLibrary = {
    데이터: [
      { type: 'data', label: '가격 데이터', icon: FaDatabase },
      { type: 'data', label: '거래량 데이터', icon: FaDatabase },
      { type: 'data', label: '온체인 데이터', icon: FaDatabase },
      { type: 'data', label: '뉴스 데이터', icon: FaDatabase }
    ],
    지표: [
      { type: 'indicator', label: 'RSI', icon: FaChartLine },
      { type: 'indicator', label: 'MACD', icon: FaChartLine },
      { type: 'indicator', label: '볼린저 밴드', icon: FaChartLine },
      { type: 'indicator', label: 'EMA', icon: FaChartLine },
      { type: 'indicator', label: 'Stochastic', icon: FaChartLine },
      { type: 'indicator', label: 'ATR', icon: FaChartLine },
      { type: 'indicator', label: 'Volume Profile', icon: FaChartLine },
      { type: 'indicator', label: 'Fibonacci', icon: FaChartLine }
    ],
    AI: [
      { type: 'ai', label: 'LSTM 예측', icon: GiArtificialIntelligence },
      { type: 'ai', label: 'GRU 예측', icon: GiArtificialIntelligence },
      { type: 'ai', label: '감성 분석', icon: GiArtificialIntelligence },
      { type: 'ai', label: '패턴 인식', icon: GiArtificialIntelligence },
      { type: 'ai', label: '이상 탐지', icon: GiArtificialIntelligence }
    ],
    조건: [
      { type: 'condition', label: 'AND 조건', icon: FaCog },
      { type: 'condition', label: 'OR 조건', icon: FaCog },
      { type: 'condition', label: '비교 조건', icon: FaCog },
      { type: 'condition', label: '크로스오버', icon: FaCog },
      { type: 'condition', label: '다이버전스', icon: FaCog }
    ],
    신호: [
      { type: 'signal', label: '매수 신호', icon: FaBrain },
      { type: 'signal', label: '매도 신호', icon: FaBrain },
      { type: 'signal', label: '중립 신호', icon: FaBrain },
      { type: 'signal', label: '경고 신호', icon: FaBrain }
    ],
    액션: [
      { type: 'action', label: '시장가 주문', icon: FaRobot },
      { type: 'action', label: '지정가 주문', icon: FaRobot },
      { type: 'action', label: '손절 설정', icon: FaRobot },
      { type: 'action', label: '익절 설정', icon: FaRobot },
      { type: 'action', label: '알림 발송', icon: FaBell },
      { type: 'action', label: '포지션 조정', icon: FaRobot }
    ]
  }

  // 연결 생성 핸들러
  const onConnect = useCallback(
    (params: Connection | Edge) => {
      const sourceNode = nodes.find(n => n.id === params.source)
      const targetNode = nodes.find(n => n.id === params.target)
      
      if (sourceNode && targetNode) {
        // 연결 유효성 검사
        const sourceOutputs = sourceNode.data.outputs || []
        const targetInputs = targetNode.data.inputs || []
        
        if (sourceOutputs.length > 0 && targetInputs.length > 0) {
          setEdges((eds) => addEdge({
            ...params,
            animated: true,
            style: { stroke: '#8B5CF6', strokeWidth: 2 },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: '#8B5CF6'
            }
          }, eds))
        }
      }
    },
    [nodes, setEdges]
  )

  // 노드 추가
  const addNode = (nodeType: string, label: string) => {
    const newNode: StrategyNode = {
      id: `${Date.now()}`,
      type: nodeType,
      position: { 
        x: Math.random() * 500 + 100, 
        y: Math.random() * 300 + 100 
      },
      data: {
        label,
        type: nodeType,
        config: {},
        inputs: getNodeInputs(nodeType),
        outputs: getNodeOutputs(nodeType)
      }
    }
    
    setNodes((nds) => [...nds, newNode])
    setShowNodeLibrary(false)
  }

  // 노드별 입력/출력 정의
  const getNodeInputs = (type: string): string[] => {
    switch (type) {
      case 'data':
        return []
      case 'indicator':
        return ['price', 'volume']
      case 'ai':
        return ['data', 'features']
      case 'condition':
        return ['value1', 'value2']
      case 'signal':
        return ['condition']
      case 'action':
        return ['signal']
      default:
        return []
    }
  }

  const getNodeOutputs = (type: string): string[] => {
    switch (type) {
      case 'data':
        return ['price', 'volume', 'timestamp']
      case 'indicator':
        return ['value', 'signal']
      case 'ai':
        return ['prediction', 'confidence']
      case 'condition':
        return ['result']
      case 'signal':
        return ['signal', 'strength']
      case 'action':
        return ['status']
      default:
        return []
    }
  }

  // 전략 실행
  const runStrategy = () => {
    setIsRunning(true)
    // 전략 실행 로직
    // 노드 그래프를 순회하며 실행
    console.log('Running strategy with nodes:', nodes)
    console.log('And edges:', edges)
  }

  // 전략 중지
  const stopStrategy = () => {
    setIsRunning(false)
  }

  // 전략 저장
  const saveStrategy = () => {
    const strategy = {
      name: strategyName,
      nodes,
      edges,
      timestamp: Date.now()
    }
    
    if (onStrategyChange) {
      onStrategyChange(strategy)
    }
    
    // 로컬 스토리지에 저장
    localStorage.setItem('strategy_' + Date.now(), JSON.stringify(strategy))
  }

  // 전략 내보내기
  const exportStrategy = () => {
    const strategy = {
      name: strategyName,
      nodes,
      edges,
      version: '1.0',
      created: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(strategy, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${strategyName.replace(/\s+/g, '_')}_strategy.json`
    link.click()
  }

  return (
    <div className="w-full h-full min-h-[800px] relative">
      {/* 헤더 툴바 */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-gray-900/90 backdrop-blur-sm border-b border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <input
              type="text"
              value={strategyName}
              onChange={(e) => setStrategyName(e.target.value)}
              className="bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700 font-semibold"
            />
            <button
              onClick={() => setShowNodeLibrary(!showNodeLibrary)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <FaCog />
              노드 추가
            </button>
          </div>
          
          <div className="flex items-center gap-3">
            {isRunning ? (
              <button
                onClick={stopStrategy}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <FaStop />
                중지
              </button>
            ) : (
              <button
                onClick={runStrategy}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <FaPlay />
                실행
              </button>
            )}
            <button
              onClick={saveStrategy}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <FaSave />
              저장
            </button>
            <button
              onClick={exportStrategy}
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <FaDownload />
              내보내기
            </button>
          </div>
        </div>
      </div>

      {/* 노드 라이브러리 */}
      <AnimatePresence>
        {showNodeLibrary && (
          <motion.div
            initial={{ opacity: 0, x: -300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -300 }}
            className="absolute left-0 top-20 bottom-0 w-80 bg-gray-800/95 backdrop-blur-sm border-r border-gray-700 z-20 p-4 overflow-y-auto"
          >
            <h3 className="text-lg font-bold text-white mb-4">노드 라이브러리</h3>
            {Object.entries(nodeLibrary).map(([category, items]) => (
              <div key={category} className="mb-6">
                <h4 className="text-sm font-semibold text-gray-400 mb-2">{category}</h4>
                <div className="space-y-2">
                  {items.map((item) => (
                    <button
                      key={item.label}
                      onClick={() => addNode(item.type, item.label)}
                      className="w-full bg-gray-700 hover:bg-gray-600 text-white p-3 rounded-lg flex items-center gap-3 transition-colors"
                    >
                      <item.icon className="text-purple-400" />
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* React Flow 캔버스 */}
      <div ref={reactFlowWrapper} className="w-full h-full">
        <ReactFlowProvider>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            onNodeClick={(event, node) => setSelectedNode(node as StrategyNode)}
            fitView
            attributionPosition="bottom-left"
          >
            <Controls />
            <MiniMap 
              nodeColor={(node) => {
                switch (node.type) {
                  case 'data': return '#3B82F6'
                  case 'indicator': return '#10B981'
                  case 'ai': return '#8B5CF6'
                  case 'condition': return '#F59E0B'
                  case 'signal': return '#EF4444'
                  case 'action': return '#EC4899'
                  default: return '#6B7280'
                }
              }}
            />
            <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
          </ReactFlow>
        </ReactFlowProvider>
      </div>

      {/* 노드 설정 패널 */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="absolute right-0 top-20 bottom-0 w-80 bg-gray-800/95 backdrop-blur-sm border-l border-gray-700 z-20 p-4"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">노드 설정</h3>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">노드 이름</label>
                <input
                  type="text"
                  value={selectedNode.data.label}
                  onChange={(e) => {
                    setNodes((nds) =>
                      nds.map((node) =>
                        node.id === selectedNode.id
                          ? { ...node, data: { ...node.data, label: e.target.value } }
                          : node
                      )
                    )
                  }}
                  className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg"
                />
              </div>
              
              {/* 노드 타입별 설정 */}
              {selectedNode.type === 'indicator' && (
                <div>
                  <label className="block text-sm text-gray-400 mb-2">기간</label>
                  <input
                    type="number"
                    defaultValue={14}
                    className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg"
                  />
                </div>
              )}
              
              {selectedNode.type === 'condition' && (
                <div>
                  <label className="block text-sm text-gray-400 mb-2">조건 타입</label>
                  <select className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg">
                    <option value="gt">초과 (&gt;)</option>
                    <option value="lt">미만 (&lt;)</option>
                    <option value="eq">같음 (=)</option>
                    <option value="cross">크로스오버</option>
                  </select>
                </div>
              )}
              
              {selectedNode.type === 'action' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">주문 유형</label>
                    <select className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg">
                      <option value="market">시장가</option>
                      <option value="limit">지정가</option>
                      <option value="stop">손절가</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">수량 (%)</label>
                    <input
                      type="number"
                      defaultValue={10}
                      min="1"
                      max="100"
                      className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg"
                    />
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}