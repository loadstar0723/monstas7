'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { FaBook, FaRocket, FaTrophy, FaChartLine, FaBrain, FaShieldAlt } from 'react-icons/fa'
import { GiArtificialIntelligence } from 'react-icons/gi'

interface StrategyTemplate {
  id: string
  name: string
  category: string
  description: string
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  performance: {
    winRate: number
    avgReturn: number
    sharpeRatio: number
    maxDrawdown: number
  }
  nodes: any[]
  edges: any[]
  parameters: any
  tags: string[]
}

interface Props {
  onSelectTemplate: (template: any) => void
}

export default function StrategyTemplates({ onSelectTemplate }: Props) {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedDifficulty, setSelectedDifficulty] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  // 전략 템플릿 데이터베이스
  const templates: StrategyTemplate[] = [
    {
      id: 'rsi_mean_reversion',
      name: 'RSI 평균회귀 전략',
      category: 'mean_reversion',
      description: 'RSI 과매수/과매도 구간에서 평균회귀를 노리는 기본 전략',
      difficulty: 'beginner',
      performance: {
        winRate: 65,
        avgReturn: 8.5,
        sharpeRatio: 1.4,
        maxDrawdown: -12
      },
      nodes: [
        { id: '1', type: 'data', position: { x: 100, y: 100 }, data: { label: 'BTCUSDT 가격' } },
        { id: '2', type: 'indicator', position: { x: 300, y: 100 }, data: { label: 'RSI (14)' } },
        { id: '3', type: 'condition', position: { x: 500, y: 100 }, data: { label: 'RSI < 30' } },
        { id: '4', type: 'signal', position: { x: 700, y: 100 }, data: { label: '매수 신호' } },
        { id: '5', type: 'action', position: { x: 900, y: 100 }, data: { label: '시장가 매수' } }
      ],
      edges: [
        { id: 'e1', source: '1', target: '2' },
        { id: 'e2', source: '2', target: '3' },
        { id: 'e3', source: '3', target: '4' },
        { id: 'e4', source: '4', target: '5' }
      ],
      parameters: {
        rsi_period: 14,
        oversold: 30,
        overbought: 70,
        stop_loss: 3,
        take_profit: 6
      },
      tags: ['RSI', '평균회귀', '초보자']
    },
    {
      id: 'macd_trend_following',
      name: 'MACD 추세추종 전략',
      category: 'trend_following',
      description: 'MACD 크로스오버를 이용한 중장기 추세 추종 전략',
      difficulty: 'intermediate',
      performance: {
        winRate: 58,
        avgReturn: 15.2,
        sharpeRatio: 1.6,
        maxDrawdown: -18
      },
      nodes: [],
      edges: [],
      parameters: {
        macd_fast: 12,
        macd_slow: 26,
        macd_signal: 9,
        atr_multiplier: 2
      },
      tags: ['MACD', '추세추종', '중급']
    },
    {
      id: 'ai_lstm_prediction',
      name: 'AI LSTM 예측 전략',
      category: 'ai_ml',
      description: 'LSTM 딥러닝 모델을 활용한 가격 예측 기반 트레이딩',
      difficulty: 'expert',
      performance: {
        winRate: 72,
        avgReturn: 28.5,
        sharpeRatio: 2.1,
        maxDrawdown: -15
      },
      nodes: [],
      edges: [],
      parameters: {
        lstm_layers: 3,
        sequence_length: 60,
        prediction_horizon: 24,
        confidence_threshold: 0.7
      },
      tags: ['AI', 'LSTM', '머신러닝', '고급']
    },
    {
      id: 'grid_trading',
      name: '그리드 트레이딩 봇',
      category: 'market_neutral',
      description: '정해진 가격 구간에서 자동 매수/매도를 반복하는 전략',
      difficulty: 'beginner',
      performance: {
        winRate: 85,
        avgReturn: 12.3,
        sharpeRatio: 1.8,
        maxDrawdown: -8
      },
      nodes: [],
      edges: [],
      parameters: {
        grid_levels: 10,
        grid_spacing: 2,
        position_size: 0.1,
        price_range: [45000, 55000]
      },
      tags: ['그리드', '마켓중립', '자동매매']
    },
    {
      id: 'bollinger_breakout',
      name: '볼린저밴드 돌파 전략',
      category: 'breakout',
      description: '볼린저밴드 상단/하단 돌파 시 추세 진입',
      difficulty: 'intermediate',
      performance: {
        winRate: 55,
        avgReturn: 18.7,
        sharpeRatio: 1.5,
        maxDrawdown: -20
      },
      nodes: [],
      edges: [],
      parameters: {
        bb_period: 20,
        bb_std: 2,
        volume_confirmation: true,
        atr_stop: 2.5
      },
      tags: ['볼린저밴드', '돌파', '변동성']
    },
    {
      id: 'arbitrage_triangular',
      name: '삼각 차익거래 봇',
      category: 'arbitrage',
      description: '3개 통화쌍 간 가격 차이를 이용한 무위험 차익거래',
      difficulty: 'advanced',
      performance: {
        winRate: 92,
        avgReturn: 8.2,
        sharpeRatio: 3.5,
        maxDrawdown: -3
      },
      nodes: [],
      edges: [],
      parameters: {
        min_profit: 0.2,
        max_slippage: 0.1,
        execution_speed: 'fast',
        exchanges: ['binance', 'ftx', 'kraken']
      },
      tags: ['차익거래', '무위험', 'HFT']
    },
    {
      id: 'momentum_breakout',
      name: '모멘텀 브레이크아웃',
      category: 'momentum',
      description: '강한 모멘텀과 거래량 급증을 포착하는 단기 전략',
      difficulty: 'intermediate',
      performance: {
        winRate: 62,
        avgReturn: 22.4,
        sharpeRatio: 1.7,
        maxDrawdown: -16
      },
      nodes: [],
      edges: [],
      parameters: {
        momentum_period: 20,
        volume_multiplier: 2.5,
        atr_filter: true,
        holding_period: 48
      },
      tags: ['모멘텀', '단기', '거래량']
    },
    {
      id: 'options_hedging',
      name: '옵션 헤징 전략',
      category: 'options',
      description: '옵션을 활용한 다운사이드 보호 및 수익 극대화',
      difficulty: 'expert',
      performance: {
        winRate: 68,
        avgReturn: 19.8,
        sharpeRatio: 2.3,
        maxDrawdown: -10
      },
      nodes: [],
      edges: [],
      parameters: {
        hedge_ratio: 0.5,
        option_type: 'put',
        strike_offset: 5,
        expiry_days: 30
      },
      tags: ['옵션', '헤징', '리스크관리']
    },
    {
      id: 'market_making',
      name: '마켓 메이킹 봇',
      category: 'market_neutral',
      description: '스프레드 수익을 노리는 유동성 공급 전략',
      difficulty: 'advanced',
      performance: {
        winRate: 78,
        avgReturn: 15.5,
        sharpeRatio: 2.8,
        maxDrawdown: -6
      },
      nodes: [],
      edges: [],
      parameters: {
        spread_pct: 0.1,
        order_levels: 5,
        inventory_limit: 10,
        skew_factor: 0.3
      },
      tags: ['마켓메이킹', 'HFT', '유동성']
    },
    {
      id: 'sentiment_trading',
      name: 'AI 감성분석 트레이딩',
      category: 'ai_ml',
      description: '소셜미디어 감성분석을 통한 시장 심리 기반 매매',
      difficulty: 'advanced',
      performance: {
        winRate: 64,
        avgReturn: 20.1,
        sharpeRatio: 1.9,
        maxDrawdown: -14
      },
      nodes: [],
      edges: [],
      parameters: {
        sentiment_threshold: 0.7,
        data_sources: ['twitter', 'reddit', 'news'],
        ml_model: 'bert',
        update_frequency: 3600
      },
      tags: ['AI', '감성분석', 'NLP']
    }
  ]

  // 카테고리 목록
  const categories = [
    { value: 'all', label: '전체', icon: FaBook },
    { value: 'trend_following', label: '추세추종', icon: FaChartLine },
    { value: 'mean_reversion', label: '평균회귀', icon: FaChartLine },
    { value: 'breakout', label: '돌파', icon: FaRocket },
    { value: 'momentum', label: '모멘텀', icon: FaRocket },
    { value: 'market_neutral', label: '마켓중립', icon: FaShieldAlt },
    { value: 'arbitrage', label: '차익거래', icon: FaTrophy },
    { value: 'ai_ml', label: 'AI/ML', icon: GiArtificialIntelligence },
    { value: 'options', label: '옵션', icon: FaBrain }
  ]

  // 필터링된 템플릿
  const filteredTemplates = templates.filter(template => {
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory
    const matchesDifficulty = selectedDifficulty === 'all' || template.difficulty === selectedDifficulty
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    
    return matchesCategory && matchesDifficulty && matchesSearch
  })

  // 난이도별 색상
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-400 bg-green-500/20'
      case 'intermediate': return 'text-blue-400 bg-blue-500/20'
      case 'advanced': return 'text-purple-400 bg-purple-500/20'
      case 'expert': return 'text-red-400 bg-red-500/20'
      default: return 'text-gray-400 bg-gray-500/20'
    }
  }

  // 난이도별 라벨
  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return '초급'
      case 'intermediate': return '중급'
      case 'advanced': return '고급'
      case 'expert': return '전문가'
      default: return difficulty
    }
  }

  return (
    <div className="space-y-6">
      {/* 필터 섹션 */}
      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">검색</label>
            <input
              type="text"
              placeholder="전략명, 태그 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg"
            />
          </div>
          
          <div>
            <label className="block text-sm text-gray-400 mb-2">카테고리</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg"
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm text-gray-400 mb-2">난이도</label>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg"
            >
              <option value="all">전체</option>
              <option value="beginner">초급</option>
              <option value="intermediate">중급</option>
              <option value="advanced">고급</option>
              <option value="expert">전문가</option>
            </select>
          </div>
        </div>
      </div>

      {/* 템플릿 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => {
          const CategoryIcon = categories.find(c => c.value === template.category)?.icon || FaBook
          
          return (
            <motion.div
              key={template.id}
              whileHover={{ scale: 1.02 }}
              className="bg-gray-800/50 rounded-lg p-6 border border-gray-700 hover:border-purple-500/50 cursor-pointer"
              onClick={() => onSelectTemplate(template)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-600/20 rounded-lg">
                    <CategoryIcon className="text-purple-400 text-xl" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{template.name}</h3>
                    <span className={`text-xs px-2 py-1 rounded ${getDifficultyColor(template.difficulty)}`}>
                      {getDifficultyLabel(template.difficulty)}
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                {template.description}
              </p>

              {/* 성능 지표 */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-gray-900/50 rounded p-2">
                  <div className="text-gray-500 text-xs">승률</div>
                  <div className="text-green-400 font-semibold">
                    {template.performance.winRate}%
                  </div>
                </div>
                <div className="bg-gray-900/50 rounded p-2">
                  <div className="text-gray-500 text-xs">평균 수익</div>
                  <div className="text-blue-400 font-semibold">
                    {template.performance.avgReturn}%
                  </div>
                </div>
                <div className="bg-gray-900/50 rounded p-2">
                  <div className="text-gray-500 text-xs">샤프 비율</div>
                  <div className="text-purple-400 font-semibold">
                    {template.performance.sharpeRatio}
                  </div>
                </div>
                <div className="bg-gray-900/50 rounded p-2">
                  <div className="text-gray-500 text-xs">최대 손실</div>
                  <div className="text-red-400 font-semibold">
                    {template.performance.maxDrawdown}%
                  </div>
                </div>
              </div>

              {/* 태그 */}
              <div className="flex items-center gap-2 flex-wrap">
                {template.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* 빈 상태 */}
      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <FaBook className="text-gray-600 text-5xl mx-auto mb-4" />
          <p className="text-gray-400">검색 조건에 맞는 템플릿이 없습니다.</p>
        </div>
      )}
    </div>
  )
}