'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaGraduationCap, FaChevronDown, FaChevronUp, FaLightbulb, FaCode, FaChartBar, FaRobot } from 'react-icons/fa'

interface ConceptExplainerProps {
  coin: any
}

const STRATEGY_CONCEPTS = [
  {
    id: 'basics',
    title: '퀀트 트레이딩 기초',
    icon: FaGraduationCap,
    content: [
      {
        subtitle: '퀀트 트레이딩이란?',
        description: '수학적 모델과 알고리즘을 사용하여 시장 패턴을 분석하고 자동으로 거래하는 투자 방법입니다.'
      },
      {
        subtitle: '장점',
        description: '감정 배제, 24시간 자동 거래, 백테스팅을 통한 검증, 일관된 전략 실행'
      },
      {
        subtitle: '필수 요소',
        description: '데이터 수집, 전략 개발, 백테스팅, 리스크 관리, 실행 시스템'
      }
    ]
  },
  {
    id: 'indicators',
    title: '기술적 지표 활용',
    icon: FaChartBar,
    content: [
      {
        subtitle: '트렌드 지표',
        description: '이동평균선(MA), MACD, ADX - 시장의 방향성을 파악하는 지표들'
      },
      {
        subtitle: '모멘텀 지표',
        description: 'RSI, 스토캐스틱, CCI - 과매수/과매도 구간을 판단하는 지표들'
      },
      {
        subtitle: '변동성 지표',
        description: '볼린저밴드, ATR, 켈트너채널 - 가격 변동폭을 측정하는 지표들'
      }
    ]
  },
  {
    id: 'strategies',
    title: '전략 유형',
    icon: FaLightbulb,
    content: [
      {
        subtitle: '트렌드 팔로잉',
        description: '상승/하락 추세를 따라가는 전략. 이동평균선 크로스오버, 돌파 전략 등'
      },
      {
        subtitle: '평균 회귀',
        description: '가격이 평균으로 돌아간다는 가정. RSI 과매수/과매도, 볼린저밴드 반전 등'
      },
      {
        subtitle: '차익거래',
        description: '가격 차이를 이용한 무위험 수익. 거래소 간 차익, 선물-현물 차익 등'
      }
    ]
  },
  {
    id: 'development',
    title: '전략 개발 프로세스',
    icon: FaCode,
    content: [
      {
        subtitle: '1단계: 아이디어 도출',
        description: '시장 관찰, 패턴 발견, 가설 설정'
      },
      {
        subtitle: '2단계: 구현 및 테스트',
        description: '코드 작성, 파라미터 최적화, 과거 데이터 검증'
      },
      {
        subtitle: '3단계: 실전 적용',
        description: '소액 실거래, 성과 모니터링, 지속적 개선'
      }
    ]
  },
  {
    id: 'risk',
    title: '리스크 관리',
    icon: FaRobot,
    content: [
      {
        subtitle: '포지션 사이징',
        description: '켈리 공식, 고정 비율, 변동성 기반 사이징으로 적절한 투자 규모 결정'
      },
      {
        subtitle: '손절/익절 설정',
        description: '트레일링 스톱, ATR 기반 스톱, 시간 기반 청산 등으로 손실 제한'
      },
      {
        subtitle: '포트폴리오 다각화',
        description: '여러 전략, 여러 코인, 여러 시간프레임으로 리스크 분산'
      }
    ]
  }
]

export default function ConceptExplainer({ coin }: ConceptExplainerProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>('basics')
  const [selectedTab, setSelectedTab] = useState(0)
  
  const toggleSection = (sectionId: string) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId)
  }
  
  return (
    <div className="space-y-6">
      {/* 코인별 맞춤 전략 소개 */}
      <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-xl p-6 border border-purple-500/30">
        <h3 className="text-xl font-bold text-white mb-4">
          {coin?.name} ({coin?.icon}) 전략 특징
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h4 className="text-purple-400 font-semibold mb-2">변동성</h4>
            <p className="text-gray-300 text-sm">
              {coin?.symbol === 'BTCUSDT' ? '중간 변동성, 장기 트렌드 팔로잉 유리' :
               coin?.symbol === 'ETHUSDT' ? '높은 변동성, 단기 스윙 트레이딩 적합' :
               coin?.symbol === 'BNBUSDT' ? '낮은 변동성, 그리드 트레이딩 추천' :
               '코인별 특성에 맞는 전략 선택 필요'}
            </p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h4 className="text-blue-400 font-semibold mb-2">유동성</h4>
            <p className="text-gray-300 text-sm">
              {coin?.symbol === 'BTCUSDT' ? '최고 유동성, 대규모 거래 가능' :
               coin?.symbol === 'DOGEUSDT' ? '중간 유동성, 슬리피지 주의' :
               '거래량 기반 포지션 사이징 필요'}
            </p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h4 className="text-green-400 font-semibold mb-2">추천 전략</h4>
            <p className="text-gray-300 text-sm">
              {coin?.symbol === 'BTCUSDT' ? '이동평균 크로스오버, MACD 다이버전스' :
               coin?.symbol === 'ETHUSDT' ? 'RSI 과매수/과매도, 볼린저밴드 반전' :
               coin?.symbol === 'SOLUSDT' ? '모멘텀 브레이크아웃, 변동성 돌파' :
               '백테스팅으로 최적 전략 발굴'}
            </p>
          </div>
        </div>
      </div>
      
      {/* 교육 콘텐츠 아코디언 */}
      <div className="space-y-3">
        {STRATEGY_CONCEPTS.map((concept) => {
          const Icon = concept.icon
          const isExpanded = expandedSection === concept.id
          
          return (
            <motion.div
              key={concept.id}
              initial={false}
              animate={{ backgroundColor: isExpanded ? 'rgba(88, 28, 135, 0.1)' : 'rgba(31, 41, 55, 0.5)' }}
              className="rounded-xl border border-gray-700 overflow-hidden"
            >
              <button
                onClick={() => toggleSection(concept.id)}
                className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-700/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Icon className="text-xl text-purple-400" />
                  <h3 className="text-lg font-semibold text-white">{concept.title}</h3>
                </div>
                {isExpanded ? (
                  <FaChevronUp className="text-gray-400" />
                ) : (
                  <FaChevronDown className="text-gray-400" />
                )}
              </button>
              
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="px-6 pb-4"
                  >
                    <div className="space-y-4 pt-2">
                      {concept.content.map((item, index) => (
                        <div key={index} className="bg-gray-800/30 rounded-lg p-4">
                          <h4 className="text-purple-300 font-semibold mb-2">{item.subtitle}</h4>
                          <p className="text-gray-400 text-sm leading-relaxed">{item.description}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </div>
      
      {/* 인터랙티브 퀴즈 */}
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <FaGraduationCap className="text-yellow-400" />
          학습 확인 퀴즈
        </h3>
        <div className="space-y-4">
          <div className="bg-gray-900/50 rounded-lg p-4">
            <p className="text-white mb-3">Q: RSI가 30 이하일 때 일반적으로 어떤 신호로 해석되나요?</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button className="px-4 py-2 bg-gray-700 hover:bg-green-600/20 hover:border-green-500 border border-gray-600 rounded-lg text-gray-300 transition-all">
                과매수 신호
              </button>
              <button className="px-4 py-2 bg-gray-700 hover:bg-green-600/20 hover:border-green-500 border border-gray-600 rounded-lg text-gray-300 transition-all">
                과매도 신호
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* 실전 팁 */}
      <div className="bg-gradient-to-r from-yellow-900/20 to-orange-900/20 rounded-xl p-6 border border-yellow-500/30">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <FaLightbulb className="text-yellow-400" />
          {coin?.name} 실전 트레이딩 팁
        </h3>
        <ul className="space-y-2 text-gray-300">
          <li className="flex items-start gap-2">
            <span className="text-yellow-400 mt-1">•</span>
            <span>백테스팅 기간은 최소 1년 이상의 데이터를 사용하세요</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-yellow-400 mt-1">•</span>
            <span>실거래 전 페이퍼 트레이딩으로 2주 이상 테스트하세요</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-yellow-400 mt-1">•</span>
            <span>전체 자본의 2-5%만 단일 포지션에 할당하세요</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-yellow-400 mt-1">•</span>
            <span>손절선은 진입 전에 미리 설정하고 절대 변경하지 마세요</span>
          </li>
        </ul>
      </div>
    </div>
  )
}