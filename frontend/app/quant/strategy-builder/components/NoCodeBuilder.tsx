'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FaPlus, FaTrash, FaPlay, FaSave, FaCopy,
  FaChartLine, FaCode, FaExchangeAlt, FaClock
} from 'react-icons/fa'

interface NoCodeBuilderProps {
  symbol: string
}

// 조건 블록 타입
const CONDITION_BLOCKS = [
  {
    category: '가격 조건',
    blocks: [
      { id: 'price_above', name: '현재가 > 특정가', params: ['price'] },
      { id: 'price_below', name: '현재가 < 특정가', params: ['price'] },
      { id: 'price_cross_ma', name: '가격이 MA 크로스', params: ['period'] },
      { id: 'price_breakout', name: '가격 돌파', params: ['level'] }
    ]
  },
  {
    category: '지표 조건',
    blocks: [
      { id: 'rsi_oversold', name: 'RSI < 30', params: ['period', 'level'] },
      { id: 'rsi_overbought', name: 'RSI > 70', params: ['period', 'level'] },
      { id: 'macd_cross', name: 'MACD 크로스', params: ['fast', 'slow', 'signal'] },
      { id: 'bb_touch', name: '볼린저밴드 터치', params: ['period', 'stdDev'] }
    ]
  },
  {
    category: '패턴 조건',
    blocks: [
      { id: 'candle_hammer', name: '해머 캔들', params: [] },
      { id: 'candle_doji', name: '도지 캔들', params: [] },
      { id: 'pattern_triangle', name: '삼각 수렴', params: ['period'] },
      { id: 'pattern_flag', name: '플래그 패턴', params: ['period'] }
    ]
  }
]

// 액션 블록 타입
const ACTION_BLOCKS = [
  { id: 'buy_market', name: '시장가 매수', icon: '🟢' },
  { id: 'sell_market', name: '시장가 매도', icon: '🔴' },
  { id: 'buy_limit', name: '지정가 매수', icon: '🟢' },
  { id: 'sell_limit', name: '지정가 매도', icon: '🔴' },
  { id: 'close_position', name: '포지션 종료', icon: '⚪' },
  { id: 'adjust_size', name: '포지션 조절', icon: '🔄' }
]

interface StrategyBlock {
  id: string
  type: 'condition' | 'action' | 'logic'
  name: string
  params?: any
  children?: StrategyBlock[]
}

export default function NoCodeBuilder({ symbol }: NoCodeBuilderProps) {
  const [strategyBlocks, setStrategyBlocks] = useState<StrategyBlock[]>([])
  const [selectedCategory, setSelectedCategory] = useState('가격 조건')
  const [draggedBlock, setDraggedBlock] = useState<any>(null)
  const [strategyName, setStrategyName] = useState('나의 전략 #1')
  const [isTestMode, setIsTestMode] = useState(false)
  
  // 블록 추가
  const addBlock = (block: any, type: 'condition' | 'action') => {
    const newBlock: StrategyBlock = {
      id: `${Date.now()}_${Math.random()}`,
      type: type,
      name: block.name,
      params: block.params ? {} : undefined
    }
    
    setStrategyBlocks([...strategyBlocks, newBlock])
  }
  
  // 블록 삭제
  const removeBlock = (blockId: string) => {
    setStrategyBlocks(strategyBlocks.filter(b => b.id !== blockId))
  }
  
  // 드래그 시작
  const handleDragStart = (e: React.DragEvent, block: any, type: string) => {
    setDraggedBlock({ ...block, type })
  }
  
  // 드롭
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    if (draggedBlock) {
      addBlock(draggedBlock, draggedBlock.type)
      setDraggedBlock(null)
    }
  }
  
  // 드래그 오버
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }
  
  // 전략 실행 테스트
  const testStrategy = () => {
    setIsTestMode(true)
    // 실제 테스트 로직은 백엔드와 연동
    setTimeout(() => {
      setIsTestMode(false)
    }, 3000)
  }
  
  // 전략 저장
  const saveStrategy = () => {
    const strategy = {
      name: strategyName,
      symbol: symbol,
      blocks: strategyBlocks,
      createdAt: new Date().toISOString()
    }
    console.log('저장할 전략:', strategy)
    // 실제 저장은 API 호출
  }
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* 왼쪽: 블록 팔레트 */}
      <div className="lg:col-span-1 space-y-4">
        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">조건 블록</h3>
          
          {/* 카테고리 탭 */}
          <div className="flex gap-2 mb-4 overflow-x-auto">
            {CONDITION_BLOCKS.map(category => (
              <button
                key={category.category}
                onClick={() => setSelectedCategory(category.category)}
                className={`px-3 py-1 rounded-lg text-sm whitespace-nowrap transition-all ${
                  selectedCategory === category.category
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                }`}
              >
                {category.category}
              </button>
            ))}
          </div>
          
          {/* 블록 목록 */}
          <div className="space-y-2">
            {CONDITION_BLOCKS.find(c => c.category === selectedCategory)?.blocks.map(block => (
              <motion.div
                key={block.id}
                draggable
                onDragStart={(e) => handleDragStart(e, block, 'condition')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-lg p-3 cursor-move border border-purple-500/30 hover:border-purple-500/50"
              >
                <div className="flex items-center justify-between">
                  <span className="text-white text-sm">{block.name}</span>
                  <FaChartLine className="text-purple-400" />
                </div>
                {block.params.length > 0 && (
                  <div className="mt-1 text-xs text-gray-400">
                    매개변수: {block.params.join(', ')}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
        
        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">액션 블록</h3>
          <div className="space-y-2">
            {ACTION_BLOCKS.map(block => (
              <motion.div
                key={block.id}
                draggable
                onDragStart={(e) => handleDragStart(e, block, 'action')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-gradient-to-r from-green-900/30 to-blue-900/30 rounded-lg p-3 cursor-move border border-green-500/30 hover:border-green-500/50"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">{block.icon}</span>
                  <span className="text-white text-sm">{block.name}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
      
      {/* 오른쪽: 전략 캔버스 */}
      <div className="lg:col-span-2">
        <div className="bg-gray-800/50 rounded-xl border border-gray-700 min-h-[600px]">
          {/* 헤더 */}
          <div className="px-6 py-4 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <input
                type="text"
                value={strategyName}
                onChange={(e) => setStrategyName(e.target.value)}
                className="bg-transparent text-xl font-bold text-white outline-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={testStrategy}
                  disabled={strategyBlocks.length === 0 || isTestMode}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 text-white rounded-lg flex items-center gap-2 transition-colors"
                >
                  <FaPlay className="text-sm" />
                  {isTestMode ? '테스트 중...' : '테스트'}
                </button>
                <button
                  onClick={saveStrategy}
                  disabled={strategyBlocks.length === 0}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 text-white rounded-lg flex items-center gap-2 transition-colors"
                >
                  <FaSave className="text-sm" />
                  저장
                </button>
              </div>
            </div>
          </div>
          
          {/* 캔버스 */}
          <div
            className="p-6 min-h-[500px]"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            {strategyBlocks.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-500">
                <FaExchangeAlt className="text-4xl mb-4" />
                <p className="text-lg mb-2">전략 블록을 드래그하여 시작하세요</p>
                <p className="text-sm">조건 → 액션 순서로 배치합니다</p>
              </div>
            ) : (
              <div className="space-y-4">
                <AnimatePresence>
                  {strategyBlocks.map((block, index) => (
                    <motion.div
                      key={block.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      className="relative"
                    >
                      {/* 연결선 */}
                      {index > 0 && (
                        <div className="absolute -top-4 left-8 w-0.5 h-4 bg-purple-500/50" />
                      )}
                      
                      <div className={`flex items-center gap-4 p-4 rounded-lg border ${
                        block.type === 'condition'
                          ? 'bg-blue-900/20 border-blue-500/30'
                          : 'bg-green-900/20 border-green-500/30'
                      }`}>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400 uppercase">
                              {block.type === 'condition' ? '조건' : '액션'} {index + 1}
                            </span>
                            <span className="text-white font-semibold">{block.name}</span>
                          </div>
                          
                          {/* 매개변수 입력 */}
                          {block.params && Object.keys(block.params).length > 0 && (
                            <div className="mt-2 flex gap-2">
                              {Object.keys(block.params).map(param => (
                                <input
                                  key={param}
                                  type="text"
                                  placeholder={param}
                                  className="px-2 py-1 bg-gray-700 text-white text-sm rounded"
                                />
                              ))}
                            </div>
                          )}
                        </div>
                        
                        <button
                          onClick={() => removeBlock(block.id)}
                          className="p-2 text-red-400 hover:text-red-300 transition-colors"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                {/* 블록 추가 버튼 */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full p-4 border-2 border-dashed border-gray-600 rounded-lg text-gray-400 hover:border-purple-500 hover:text-purple-400 transition-colors flex items-center justify-center gap-2"
                >
                  <FaPlus />
                  <span>블록 추가</span>
                </motion.button>
              </div>
            )}
          </div>
        </div>
        
        {/* 전략 설명 */}
        {strategyBlocks.length > 0 && (
          <div className="mt-4 bg-gray-800/50 rounded-xl p-4 border border-gray-700">
            <h4 className="text-white font-semibold mb-2">전략 설명</h4>
            <p className="text-gray-400 text-sm">
              이 전략은 {strategyBlocks.filter(b => b.type === 'condition').length}개의 조건과{' '}
              {strategyBlocks.filter(b => b.type === 'action').length}개의 액션으로 구성되어 있습니다.
              모든 조건이 충족되면 설정된 액션이 실행됩니다.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}