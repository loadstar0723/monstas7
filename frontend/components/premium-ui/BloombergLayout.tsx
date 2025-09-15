'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FaTh, FaExpand, FaCompress, FaTimes, FaLock, 
  FaUnlock, FaDesktop, FaSave, FaFolderOpen,
  FaKeyboard, FaCog
} from 'react-icons/fa'
import { useDrag, useDrop, DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'

interface Widget {
  id: string
  type: 'chart' | 'news' | 'position' | 'orderbook' | 'performance' | 'custom'
  title: string
  x: number
  y: number
  w: number
  h: number
  locked: boolean
  content?: React.ReactNode
}

interface Layout {
  id: string
  name: string
  widgets: Widget[]
  gridCols: number
  gridRows: number
}

const defaultLayouts: Layout[] = [
  {
    id: 'trading',
    name: '트레이딩 레이아웃',
    gridCols: 12,
    gridRows: 8,
    widgets: [
      { id: '1', type: 'chart', title: '메인 차트', x: 0, y: 0, w: 8, h: 4, locked: false },
      { id: '2', type: 'orderbook', title: '오더북', x: 8, y: 0, w: 4, h: 4, locked: false },
      { id: '3', type: 'position', title: '포지션', x: 0, y: 4, w: 6, h: 4, locked: false },
      { id: '4', type: 'news', title: '뉴스', x: 6, y: 4, w: 6, h: 4, locked: false }
    ]
  },
  {
    id: 'analysis',
    name: '분석 레이아웃',
    gridCols: 12,
    gridRows: 8,
    widgets: [
      { id: '1', type: 'chart', title: '차트 1', x: 0, y: 0, w: 6, h: 4, locked: false },
      { id: '2', type: 'chart', title: '차트 2', x: 6, y: 0, w: 6, h: 4, locked: false },
      { id: '3', type: 'performance', title: '성과 분석', x: 0, y: 4, w: 12, h: 4, locked: false }
    ]
  }
]

const DraggableWidget: React.FC<{
  widget: Widget
  onMove: (id: string, x: number, y: number) => void
  onResize: (id: string, w: number, h: number) => void
  onRemove: (id: string) => void
  onToggleLock: (id: string) => void
  gridSize: { width: number, height: number }
}> = ({ widget, onMove, onResize, onRemove, onToggleLock, gridSize }) => {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isResizing, setIsResizing] = useState(false)

  const [{ isDragging }, drag] = useDrag({
    type: 'widget',
    item: { id: widget.id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    }),
    canDrag: !widget.locked
  })

  const [, drop] = useDrop({
    accept: 'widget',
    drop: (item: { id: string }, monitor) => {
      const delta = monitor.getDifferenceFromInitialOffset()
      if (delta) {
        const newX = Math.round((widget.x * gridSize.width + delta.x) / gridSize.width)
        const newY = Math.round((widget.y * gridSize.height + delta.y) / gridSize.height)
        onMove(item.id, Math.max(0, newX), Math.max(0, newY))
      }
    }
  })

  const combinedRef = (node: HTMLDivElement | null) => {
    drag(drop(node))
  }

  return (
    <motion.div
      ref={combinedRef}
      className={`absolute bg-gray-900 border border-gray-700 rounded-lg overflow-hidden ${
        isDragging ? 'opacity-50' : ''
      } ${widget.locked ? 'cursor-not-allowed' : 'cursor-move'}`}
      style={{
        left: widget.x * gridSize.width,
        top: widget.y * gridSize.height,
        width: widget.w * gridSize.width - 8,
        height: widget.h * gridSize.height - 8
      }}
      animate={isFullscreen ? {
        left: 0,
        top: 0,
        width: '100%',
        height: '100%',
        zIndex: 1000
      } : {}}
    >
      {/* 위젯 헤더 */}
      <div className="bg-gray-800 px-3 py-2 flex items-center justify-between border-b border-gray-700">
        <h3 className="text-sm font-semibold text-white">{widget.title}</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onToggleLock(widget.id)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            {widget.locked ? <FaLock size={12} /> : <FaUnlock size={12} />}
          </button>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            {isFullscreen ? <FaCompress size={12} /> : <FaExpand size={12} />}
          </button>
          <button
            onClick={() => onRemove(widget.id)}
            className="text-gray-400 hover:text-red-400 transition-colors"
          >
            <FaTimes size={12} />
          </button>
        </div>
      </div>

      {/* 위젯 콘텐츠 */}
      <div className="p-4 h-[calc(100%-40px)] overflow-auto">
        {widget.content || (
          <div className="flex items-center justify-center h-full text-gray-500">
            {widget.type} 위젯
          </div>
        )}
      </div>

      {/* 리사이즈 핸들 */}
      {!widget.locked && (
        <div
          className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
          onMouseDown={(e) => {
            e.preventDefault()
            setIsResizing(true)
            const startX = e.clientX
            const startY = e.clientY
            const startW = widget.w
            const startH = widget.h

            const handleMouseMove = (e: MouseEvent) => {
              const deltaX = e.clientX - startX
              const deltaY = e.clientY - startY
              const newW = Math.max(2, Math.round(startW + deltaX / gridSize.width))
              const newH = Math.max(2, Math.round(startH + deltaY / gridSize.height))
              onResize(widget.id, newW, newH)
            }

            const handleMouseUp = () => {
              setIsResizing(false)
              document.removeEventListener('mousemove', handleMouseMove)
              document.removeEventListener('mouseup', handleMouseUp)
            }

            document.addEventListener('mousemove', handleMouseMove)
            document.addEventListener('mouseup', handleMouseUp)
          }}
        >
          <div className="absolute bottom-1 right-1 w-2 h-2 bg-gray-600 rounded-sm" />
        </div>
      )}
    </motion.div>
  )
}

export default function BloombergLayout() {
  const [layouts, setLayouts] = useState<Layout[]>(defaultLayouts)
  const [currentLayoutId, setCurrentLayoutId] = useState(defaultLayouts[0].id)
  const [showLayoutManager, setShowLayoutManager] = useState(false)
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [gridSize, setGridSize] = useState({ width: 100, height: 100 })

  const currentLayout = layouts.find(l => l.id === currentLayoutId) || layouts[0]

  useEffect(() => {
    // 그리드 크기 계산
    const updateGridSize = () => {
      const container = document.getElementById('grid-container')
      if (container) {
        const width = container.clientWidth / currentLayout.gridCols
        const height = container.clientHeight / currentLayout.gridRows
        setGridSize({ width, height })
      }
    }

    updateGridSize()
    window.addEventListener('resize', updateGridSize)
    return () => window.removeEventListener('resize', updateGridSize)
  }, [currentLayout])

  const moveWidget = (id: string, x: number, y: number) => {
    setLayouts(prev => prev.map(layout => {
      if (layout.id === currentLayoutId) {
        return {
          ...layout,
          widgets: layout.widgets.map(w => 
            w.id === id ? { ...w, x, y } : w
          )
        }
      }
      return layout
    }))
  }

  const resizeWidget = (id: string, w: number, h: number) => {
    setLayouts(prev => prev.map(layout => {
      if (layout.id === currentLayoutId) {
        return {
          ...layout,
          widgets: layout.widgets.map(widget => 
            widget.id === id ? { ...widget, w, h } : widget
          )
        }
      }
      return layout
    }))
  }

  const removeWidget = (id: string) => {
    setLayouts(prev => prev.map(layout => {
      if (layout.id === currentLayoutId) {
        return {
          ...layout,
          widgets: layout.widgets.filter(w => w.id !== id)
        }
      }
      return layout
    }))
  }

  const toggleLockWidget = (id: string) => {
    setLayouts(prev => prev.map(layout => {
      if (layout.id === currentLayoutId) {
        return {
          ...layout,
          widgets: layout.widgets.map(w => 
            w.id === id ? { ...w, locked: !w.locked } : w
          )
        }
      }
      return layout
    }))
  }

  const saveLayout = () => {
    localStorage.setItem('bloomberg-layouts', JSON.stringify(layouts))
    alert('레이아웃이 저장되었습니다!')
  }

  const loadLayout = () => {
    const saved = localStorage.getItem('bloomberg-layouts')
    if (saved) {
      setLayouts(JSON.parse(saved))
      alert('레이아웃을 불러왔습니다!')
    }
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="h-screen bg-black text-white flex flex-col">
        {/* 상단 툴바 */}
        <div className="bg-gray-900 border-b border-gray-800 px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-blue-400">MONSTA Terminal</h1>
            <select
              value={currentLayoutId}
              onChange={(e) => setCurrentLayoutId(e.target.value)}
              className="bg-gray-800 text-white px-3 py-1 rounded border border-gray-700"
            >
              {layouts.map(layout => (
                <option key={layout.id} value={layout.id}>{layout.name}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowLayoutManager(!showLayoutManager)}
              className="bg-gray-800 hover:bg-gray-700 px-3 py-1 rounded flex items-center gap-2"
            >
              <FaTh /> 레이아웃 관리
            </button>
            <button
              onClick={saveLayout}
              className="bg-gray-800 hover:bg-gray-700 px-3 py-1 rounded flex items-center gap-2"
            >
              <FaSave /> 저장
            </button>
            <button
              onClick={loadLayout}
              className="bg-gray-800 hover:bg-gray-700 px-3 py-1 rounded flex items-center gap-2"
            >
              <FaFolderOpen /> 불러오기
            </button>
            <button
              onClick={() => setShowShortcuts(!showShortcuts)}
              className="bg-gray-800 hover:bg-gray-700 px-3 py-1 rounded flex items-center gap-2"
            >
              <FaKeyboard /> 단축키
            </button>
          </div>
        </div>

        {/* 메인 그리드 */}
        <div id="grid-container" className="flex-1 relative bg-gray-950">
          {/* 그리드 라인 */}
          <div className="absolute inset-0 pointer-events-none">
            {Array.from({ length: currentLayout.gridCols }).map((_, i) => (
              <div
                key={`col-${i}`}
                className="absolute top-0 bottom-0 border-l border-gray-900"
                style={{ left: `${(i / currentLayout.gridCols) * 100}%` }}
              />
            ))}
            {Array.from({ length: currentLayout.gridRows }).map((_, i) => (
              <div
                key={`row-${i}`}
                className="absolute left-0 right-0 border-t border-gray-900"
                style={{ top: `${(i / currentLayout.gridRows) * 100}%` }}
              />
            ))}
          </div>

          {/* 위젯들 */}
          {currentLayout.widgets.map(widget => (
            <DraggableWidget
              key={widget.id}
              widget={widget}
              onMove={moveWidget}
              onResize={resizeWidget}
              onRemove={removeWidget}
              onToggleLock={toggleLockWidget}
              gridSize={gridSize}
            />
          ))}
        </div>

        {/* 단축키 모달 */}
        <AnimatePresence>
          {showShortcuts && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
              onClick={() => setShowShortcuts(false)}
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                className="bg-gray-900 rounded-lg p-6 max-w-md"
                onClick={(e) => e.stopPropagation()}
              >
                <h2 className="text-xl font-bold mb-4">키보드 단축키</h2>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">새 차트</span>
                    <kbd className="bg-gray-800 px-2 py-1 rounded text-sm">Ctrl + N</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">레이아웃 저장</span>
                    <kbd className="bg-gray-800 px-2 py-1 rounded text-sm">Ctrl + S</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">전체화면</span>
                    <kbd className="bg-gray-800 px-2 py-1 rounded text-sm">F11</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">위젯 잠금</span>
                    <kbd className="bg-gray-800 px-2 py-1 rounded text-sm">Ctrl + L</kbd>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DndProvider>
  )
}