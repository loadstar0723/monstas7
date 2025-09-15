'use client'

import React, { useState, useCallback } from 'react'
import { DndProvider, useDrag, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { motion } from 'framer-motion'
import { 
  FaChartLine, FaRobot, FaFilter, FaBalanceScale,
  FaCog, FaPlay, FaStop, FaSave, FaCode
} from 'react-icons/fa'

interface StrategyComponent {
  id: string
  type: 'indicator' | 'signal' | 'filter' | 'risk' | 'execution'
  name: string
  icon: React.ElementType
  config: Record<string, any>
  connections: {
    inputs: string[]
    outputs: string[]
  }
}

interface Connection {
  from: string
  to: string
  type: 'data' | 'signal' | 'control'
}

const componentLibrary = {
  indicators: [
    { name: 'RSI', icon: FaChartLine, defaultConfig: { period: 14, overbought: 70, oversold: 30 } },
    { name: 'MACD', icon: FaChartLine, defaultConfig: { fast: 12, slow: 26, signal: 9 } },
    { name: 'Bollinger Bands', icon: FaChartLine, defaultConfig: { period: 20, stdDev: 2 } },
    { name: 'Moving Average', icon: FaChartLine, defaultConfig: { period: 50, type: 'SMA' } },
    { name: 'Volume', icon: FaChartLine, defaultConfig: { period: 20 } }
  ],
  signals: [
    { name: 'AI Signal', icon: FaRobot, defaultConfig: { model: 'LSTM', confidence: 0.7 } },
    { name: 'Pattern Recognition', icon: FaRobot, defaultConfig: { patterns: ['H&S', 'Triangle'] } },
    { name: 'Cross Signal', icon: FaRobot, defaultConfig: { fast: 'MA50', slow: 'MA200' } }
  ],
  filters: [
    { name: 'Time Filter', icon: FaFilter, defaultConfig: { start: '09:00', end: '16:00' } },
    { name: 'Volume Filter', icon: FaFilter, defaultConfig: { minVolume: 1000000 } },
    { name: 'Volatility Filter', icon: FaFilter, defaultConfig: { minATR: 0.5, maxATR: 3 } }
  ],
  risk: [
    { name: 'Stop Loss', icon: FaBalanceScale, defaultConfig: { type: 'percent', value: 2 } },
    { name: 'Take Profit', icon: FaBalanceScale, defaultConfig: { type: 'percent', value: 4 } },
    { name: 'Position Size', icon: FaBalanceScale, defaultConfig: { riskPercent: 1, method: 'kelly' } }
  ],
  execution: [
    { name: 'Market Order', icon: FaCog, defaultConfig: { slippage: 0.1 } },
    { name: 'Limit Order', icon: FaCog, defaultConfig: { offset: 0.05 } },
    { name: 'Smart Order', icon: FaCog, defaultConfig: { type: 'TWAP', duration: 300 } }
  ]
}

interface DraggableComponentProps {
  component: any
  type: string
  onDrop: (type: string, name: string) => void
}

const DraggableComponent: React.FC<DraggableComponentProps> = ({ component, type, onDrop }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'component',
    item: { type, name: component.name },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  })

  return (
    <div
      ref={drag}
      className={`bg-gray-700 rounded-lg p-3 cursor-move transition-all ${
        isDragging ? 'opacity-50' : 'hover:bg-gray-600'
      }`}
    >
      <div className="flex items-center gap-2">
        <component.icon className="text-gray-400" />
        <span className="text-sm text-white">{component.name}</span>
      </div>
    </div>
  )
}

interface StrategyNodeProps {
  component: StrategyComponent
  position: { x: number; y: number }
  onMove: (id: string, position: { x: number; y: number }) => void
  onRemove: (id: string) => void
  onConfigChange: (id: string, config: any) => void
}

const StrategyNode: React.FC<StrategyNodeProps> = ({ 
  component, 
  position, 
  onMove, 
  onRemove,
  onConfigChange 
}) => {
  const [showConfig, setShowConfig] = useState(false)

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="absolute bg-gray-800 rounded-lg p-4 border border-gray-600 shadow-lg"
      style={{ left: position.x, top: position.y }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <component.icon className={`text-lg ${
            component.type === 'indicator' ? 'text-blue-400' :
            component.type === 'signal' ? 'text-green-400' :
            component.type === 'filter' ? 'text-yellow-400' :
            component.type === 'risk' ? 'text-red-400' :
            'text-purple-400'
          }`} />
          <h4 className="text-white font-semibold">{component.name}</h4>
        </div>
        <button
          onClick={() => onRemove(component.id)}
          className="text-gray-400 hover:text-red-400 text-sm"
        >
          ✕
        </button>
      </div>

      {showConfig && (
        <div className="mt-3 space-y-2 border-t border-gray-700 pt-3">
          {Object.entries(component.config).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <label className="text-xs text-gray-400">{key}:</label>
              <input
                type={typeof value === 'number' ? 'number' : 'text'}
                value={value}
                onChange={(e) => onConfigChange(component.id, {
                  ...component.config,
                  [key]: typeof value === 'number' ? Number(e.target.value) : e.target.value
                })}
                className="w-20 bg-gray-700 text-white px-2 py-1 rounded text-xs"
              />
            </div>
          ))}
        </div>
      )}

      <button
        onClick={() => setShowConfig(!showConfig)}
        className="text-xs text-gray-400 hover:text-white mt-2"
      >
        {showConfig ? '숨기기' : '설정'}
      </button>

      <div className="flex gap-2 mt-2">
        <div className="w-2 h-2 bg-green-400 rounded-full" title="입력" />
        <div className="w-2 h-2 bg-red-400 rounded-full" title="출력" />
      </div>
    </motion.div>
  )
}

// Canvas component that uses the drop hook
const StrategyCanvas = ({ onDrop, children }: { 
  onDrop: (type: string, name: string, position: { x: number; y: number }) => void;
  children: React.ReactNode;
}) => {
  const [, drop] = useDrop({
    accept: 'component',
    drop: (item: { type: string; name: string }, monitor) => {
      const offset = monitor.getClientOffset()
      if (offset) {
        onDrop(item.type, item.name, {
          x: offset.x - 200,
          y: offset.y - 100
        })
      }
    }
  })

  return (
    <div className="flex-1 relative bg-gray-950" ref={drop}>
      {children}
    </div>
  )
}

export default function DragDropInterface() {
  const [components, setComponents] = useState<StrategyComponent[]>([])
  const [connections, setConnections] = useState<Connection[]>([])
  const [isRunning, setIsRunning] = useState(false)

  const handleAddComponent = (type: string, name: string, position: { x: number; y: number }) => {
    const library = componentLibrary[type as keyof typeof componentLibrary]
    const template = library.find(c => c.name === name)
    
    if (template) {
      const newComponent: StrategyComponent = {
        id: `${type}_${Date.now()}`,
        type: type as any,
        name: template.name,
        icon: template.icon,
        config: { ...template.defaultConfig },
        connections: {
          inputs: [],
          outputs: []
        }
      }
      
      setComponents([...components, newComponent])
    }
  }

  const handleRemoveComponent = (id: string) => {
    setComponents(components.filter(c => c.id !== id))
    setConnections(connections.filter(c => c.from !== id && c.to !== id))
  }

  const handleConfigChange = (id: string, config: any) => {
    setComponents(components.map(c => 
      c.id === id ? { ...c, config } : c
    ))
  }

  const handleRunStrategy = () => {
    setIsRunning(!isRunning)
  }

  const handleSaveStrategy = () => {
    const strategy = {
      components,
      connections,
      metadata: {
        name: 'My Strategy',
        created: new Date(),
        version: '1.0'
      }
    }
    console.log('Saving strategy:', strategy)
    // 실제로는 API로 저장
  }

  const handleGenerateCode = () => {
    // Pine Script 또는 Python 코드 생성 로직
    console.log('Generating code...')
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex h-full">
        {/* Component Library */}
        <div className="w-64 bg-gray-900 p-4 overflow-y-auto">
          <h3 className="text-lg font-bold text-white mb-4">컴포넌트 라이브러리</h3>
          
          {Object.entries(componentLibrary).map(([type, items]) => (
            <div key={type} className="mb-6">
              <h4 className="text-sm font-semibold text-gray-400 mb-2 capitalize">
                {type === 'indicators' ? '기술지표' :
                 type === 'signals' ? 'AI 시그널' :
                 type === 'filters' ? '필터' :
                 type === 'risk' ? '리스크 관리' :
                 '실행'}
              </h4>
              <div className="space-y-2">
                {items.map((component) => (
                  <DraggableComponent
                    key={component.name}
                    component={component}
                    type={type}
                    onDrop={handleAddComponent}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Canvas */}
        <StrategyCanvas onDrop={handleAddComponent}>
          {/* Toolbar */}
          <div className="absolute top-4 right-4 flex gap-2 z-10">
            <button
              onClick={handleRunStrategy}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                isRunning 
                  ? 'bg-red-600 hover:bg-red-700' 
                  : 'bg-green-600 hover:bg-green-700'
              } text-white`}
            >
              {isRunning ? (
                <>
                  <FaStop /> 정지
                </>
              ) : (
                <>
                  <FaPlay /> 실행
                </>
              )}
            </button>
            
            <button
              onClick={handleSaveStrategy}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <FaSave /> 저장
            </button>
            
            <button
              onClick={handleGenerateCode}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <FaCode /> 코드 생성
            </button>
          </div>

          {/* Strategy Nodes */}
          {components.map((component, index) => (
            <StrategyNode
              key={component.id}
              component={component}
              position={{ x: 100 + (index % 3) * 250, y: 100 + Math.floor(index / 3) * 200 }}
              onMove={(id, pos) => {}}
              onRemove={handleRemoveComponent}
              onConfigChange={handleConfigChange}
            />
          ))}

          {/* Drop Zone Hint */}
          {components.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-gray-600 text-lg">
                왼쪽에서 컴포넌트를 드래그하여 전략을 구성하세요
              </p>
            </div>
          )}
        </StrategyCanvas>
      </div>
    </DndProvider>
  )
}