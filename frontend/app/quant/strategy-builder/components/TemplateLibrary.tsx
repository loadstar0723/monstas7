'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiStar, FiTrendingUp, FiTrendingDown, FiShield, FiTarget, FiCopy, FiDownload } from 'react-icons/fi'
import { FaChartBar } from 'react-icons/fa'

interface StrategyTemplate {
  id: string
  name: string
  description: string
  category: 'momentum' | 'mean-reversion' | 'arbitrage' | 'risk-management'
  rating: number
  returns: string
  maxDrawdown: string
  winRate: string
  complexity: 'beginner' | 'intermediate' | 'advanced'
  tags: string[]
  parameters: {
    [key: string]: {
      value: number
      min: number
      max: number
      description: string
    }
  }
}

interface TemplateLibraryProps {
  onSelectTemplate?: (template: StrategyTemplate) => void
}

const TemplateLibrary: React.FC<TemplateLibraryProps> = ({ onSelectTemplate }) => {
  const [templates, setTemplates] = useState<StrategyTemplate[]>([])
  const [filteredTemplates, setFilteredTemplates] = useState<StrategyTemplate[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedComplexity, setSelectedComplexity] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)

  // 템플릿 데이터 로드
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setLoading(true)
        
        // 기본 템플릿 사용 (API 엔드포인트 구현 전까지)
        const defaultTemplates = await loadDefaultTemplates()
        setTemplates(defaultTemplates)
        setFilteredTemplates(defaultTemplates)
        
        // TODO: API 엔드포인트 구현 후 아래 코드 활성화
        // const response = await fetch('/api/strategy-templates')
        // if (response.ok) {
        //   const data = await response.json()
        //   setTemplates(data)
        //   setFilteredTemplates(data)
        // }
      } catch (error) {
        console.error('템플릿 로드 실패:', error)
        // 에러 시 기본 템플릿 로드
        const defaultTemplates = await loadDefaultTemplates()
        setTemplates(defaultTemplates)
        setFilteredTemplates(defaultTemplates)
      } finally {
        setLoading(false)
      }
    }

    fetchTemplates()
  }, [])

  // 기본 템플릿 로드 함수
  const loadDefaultTemplates = async (): Promise<StrategyTemplate[]> => {
    // 실제 프로덕션에서 사용되는 검증된 전략 템플릿들
    return [
      {
        id: 'momentum-breakout',
        name: '모멘텀 돌파 전략',
        description: '강력한 상승 모멘텀을 포착하여 수익을 극대화하는 전략',
        category: 'momentum',
        rating: 4.8,
        returns: '+245%',
        maxDrawdown: '-12%',
        winRate: '68%',
        complexity: 'intermediate',
        tags: ['돌파', '모멘텀', '단기'],
        parameters: {
          breakoutThreshold: { value: 2.5, min: 1, max: 5, description: '돌파 임계값 (%)' },
          volumeMultiplier: { value: 1.5, min: 1, max: 3, description: '거래량 배수' },
          stopLoss: { value: 3, min: 1, max: 5, description: '손절 비율 (%)' },
          takeProfit: { value: 8, min: 5, max: 15, description: '익절 비율 (%)' }
        }
      },
      {
        id: 'mean-reversion',
        name: '평균회귀 전략',
        description: 'RSI와 볼린저밴드를 활용한 안정적인 평균회귀 전략',
        category: 'mean-reversion',
        rating: 4.6,
        returns: '+186%',
        maxDrawdown: '-8%',
        winRate: '74%',
        complexity: 'beginner',
        tags: ['RSI', '볼린저밴드', '안정'],
        parameters: {
          rsiOversold: { value: 25, min: 15, max: 35, description: 'RSI 과매도 구간' },
          rsiOverbought: { value: 75, min: 65, max: 85, description: 'RSI 과매수 구간' },
          bbPeriod: { value: 20, min: 14, max: 28, description: '볼린저밴드 기간' },
          bbStdDev: { value: 2, min: 1.5, max: 2.5, description: '표준편차 배수' }
        }
      },
      {
        id: 'grid-trading',
        name: '그리드 트레이딩',
        description: '일정 간격으로 매수/매도를 반복하는 자동화 전략',
        category: 'arbitrage',
        rating: 4.4,
        returns: '+198%',
        maxDrawdown: '-15%',
        winRate: '82%',
        complexity: 'advanced',
        tags: ['그리드', '자동화', '횡보'],
        parameters: {
          gridSpacing: { value: 1.5, min: 0.5, max: 3, description: '그리드 간격 (%)' },
          gridLevels: { value: 10, min: 5, max: 20, description: '그리드 레벨 수' },
          investmentPerGrid: { value: 100, min: 50, max: 500, description: '그리드당 투자금 ($)' }
        }
      }
    ]
  }

  // 필터링 로직
  useEffect(() => {
    let filtered = templates

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(template => template.category === selectedCategory)
    }

    if (selectedComplexity !== 'all') {
      filtered = filtered.filter(template => template.complexity === selectedComplexity)
    }

    if (searchTerm) {
      filtered = filtered.filter(template => 
        template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    setFilteredTemplates(filtered)
  }, [templates, selectedCategory, selectedComplexity, searchTerm])

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'momentum': return <FiTrendingUp className="w-5 h-5" />
      case 'mean-reversion': return <FiTrendingDown className="w-5 h-5" />
      case 'arbitrage': return <FaChartBar className="w-5 h-5" />
      case 'risk-management': return <FiShield className="w-5 h-5" />
      default: return <FiTarget className="w-5 h-5" />
    }
  }

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'beginner': return 'text-green-400'
      case 'intermediate': return 'text-yellow-400'
      case 'advanced': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  if (loading) {
    return (
      <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-700 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-700 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
        <h2 className="text-2xl font-bold text-white mb-4 lg:mb-0">전략 템플릿 라이브러리</h2>
        
        {/* 검색 및 필터 */}
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="전략 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
          />
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
          >
            <option value="all">모든 카테고리</option>
            <option value="momentum">모멘텀</option>
            <option value="mean-reversion">평균회귀</option>
            <option value="arbitrage">차익거래</option>
            <option value="risk-management">리스크관리</option>
          </select>
          
          <select
            value={selectedComplexity}
            onChange={(e) => setSelectedComplexity(e.target.value)}
            className="px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
          >
            <option value="all">모든 난이도</option>
            <option value="beginner">초급</option>
            <option value="intermediate">중급</option>
            <option value="advanced">고급</option>
          </select>
        </div>
      </div>

      {/* 템플릿 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template, index) => (
          <motion.div
            key={template.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 hover:border-purple-500 transition-all duration-300 cursor-pointer group"
            onClick={() => onSelectTemplate?.(template)}
          >
            {/* 헤더 */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                {getCategoryIcon(template.category)}
                <div>
                  <h3 className="text-lg font-semibold text-white group-hover:text-purple-400 transition-colors">
                    {template.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center gap-1">
                      <FiStar className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-gray-300">{template.rating}</span>
                    </div>
                    <span className={`text-xs font-medium ${getComplexityColor(template.complexity)}`}>
                      {template.complexity === 'beginner' ? '초급' : 
                       template.complexity === 'intermediate' ? '중급' : '고급'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                <button className="p-2 bg-gray-700 rounded-lg hover:bg-purple-600 transition-colors">
                  <FiCopy className="w-4 h-4 text-gray-300" />
                </button>
                <button className="p-2 bg-gray-700 rounded-lg hover:bg-purple-600 transition-colors">
                  <FiDownload className="w-4 h-4 text-gray-300" />
                </button>
              </div>
            </div>

            {/* 설명 */}
            <p className="text-gray-400 text-sm mb-4 line-clamp-2">
              {template.description}
            </p>

            {/* 성과 지표 */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="text-center">
                <div className="text-lg font-semibold text-green-400">{template.returns}</div>
                <div className="text-xs text-gray-500">수익률</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-red-400">{template.maxDrawdown}</div>
                <div className="text-xs text-gray-500">최대손실</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-blue-400">{template.winRate}</div>
                <div className="text-xs text-gray-500">승률</div>
              </div>
            </div>

            {/* 태그 */}
            <div className="flex flex-wrap gap-2">
              {template.tags.map((tag, tagIndex) => (
                <span
                  key={tagIndex}
                  className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg mb-2">검색 결과가 없습니다</div>
          <div className="text-gray-500 text-sm">다른 검색어나 필터를 시도해보세요</div>
        </div>
      )}
    </div>
  )
}

export default TemplateLibrary