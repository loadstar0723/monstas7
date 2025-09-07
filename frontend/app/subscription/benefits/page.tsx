'use client'

import { FaCrown, FaCheck, FaLock, FaStar, FaChartLine, FaRobot, FaBrain, FaInfinity } from 'react-icons/fa'
import { tierBenefits, tierLevels } from '@/lib/tierConfig'
import Link from 'next/link'
import { config } from '@/lib/config'

// 등급별 아이콘 및 스타일
const tierStyles = {
  'Starter': { 
    icon: '✨',
    color: 'from-gray-600 to-gray-700',
    borderColor: 'border-gray-600',
    textColor: 'text-gray-400',
    bgGradient: 'bg-gradient-to-br from-gray-800 to-gray-900'
  },
  'Advance': { 
    icon: '💎',
    color: 'from-blue-600 to-blue-700',
    borderColor: 'border-blue-500',
    textColor: 'text-blue-400',
    bgGradient: 'bg-gradient-to-br from-blue-900 to-gray-900'
  },
  'Platinum': { 
    icon: '👑',
    color: 'from-purple-600 to-purple-700',
    borderColor: 'border-purple-500',
    textColor: 'text-purple-400',
    bgGradient: 'bg-gradient-to-br from-purple-900 to-gray-900'
  },
  'Signature': { 
    icon: '🏆',
    color: 'from-amber-600 to-amber-700',
    borderColor: 'border-amber-500',
    textColor: 'text-amber-400',
    bgGradient: 'bg-gradient-to-br from-amber-900 to-gray-900'
  },
  'Master': { 
    icon: '🔥',
    color: 'from-red-600 to-red-700',
    borderColor: 'border-red-500',
    textColor: 'text-red-400',
    bgGradient: 'bg-gradient-to-br from-red-900 to-gray-900'
  },
  'Infinity': { 
    icon: '⚡',
    color: 'from-purple-600 via-pink-600 to-yellow-600',
    borderColor: 'border-transparent',
    textColor: 'text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-yellow-400 bg-clip-text',
    bgGradient: 'bg-gradient-to-br from-purple-900 via-pink-900 to-amber-900'
  }
}

export default function BenefitsPage() {
  const tiers = Object.keys(tierBenefits) as Array<keyof typeof tierBenefits>

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* 히어로 섹션 */}
      <div className="relative overflow-hidden py-20">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-pink-900/20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              MONSTA 프리미엄 등급
            </span>
          </h1>
          <p className="text-xl text-gray-400 mb-8">
            당신의 트레이딩을 한 단계 높여줄 완벽한 플랜을 선택하세요
          </p>
        </div>
      </div>

      {/* 등급 카드 그리드 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tiers.map((tier) => {
            const style = tierStyles[tier]
            const benefit = tierBenefits[tier]
            
            return (
              <div
                key={tier}
                className={`relative group ${tier === 'Infinity' ? 'lg:col-span-3' : ''}`}
              >
                {/* 인기 표시 */}
                {tier === 'Platinum' && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                    <span className="px-4 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-bold rounded-full">
                      MOST POPULAR
                    </span>
                  </div>
                )}

                <div className={`relative p-8 rounded-2xl ${style.bgGradient} border-2 ${style.borderColor} 
                              hover:scale-105 transition-all duration-300 h-full
                              ${tier === 'Infinity' ? 'lg:max-w-2xl lg:mx-auto' : ''}`}>
                  
                  {/* 등급 헤더 */}
                  <div className="text-center mb-8">
                    <div className="text-6xl mb-4">{style.icon}</div>
                    <h3 className={`text-3xl font-bold mb-2 ${style.textColor}`}>
                      {tier}
                    </h3>
                    <div className="text-4xl font-bold mb-2">
                      {benefit.price}
                    </div>
                    <div className="text-gray-400">
                      <span className="text-2xl font-bold text-white">{benefit.menuCount}</span>개 메뉴 접근
                    </div>
                  </div>

                  {/* 주요 기능 */}
                  <div className="space-y-4 mb-8">
                    {benefit.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <FaCheck className={`${style.textColor} mt-1 flex-shrink-0`} />
                        <span className="text-gray-300">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* 추가 혜택 표시 */}
                  {tier === 'Infinity' && (
                    <div className="grid grid-cols-2 gap-4 mb-8">
                      <div className="text-center p-4 bg-gray-800/50 rounded-lg">
                        <FaInfinity className="text-3xl text-purple-400 mx-auto mb-2" />
                        <span className="text-sm text-gray-400">무제한 액세스</span>
                      </div>
                      <div className="text-center p-4 bg-gray-800/50 rounded-lg">
                        <FaBrain className="text-3xl text-pink-400 mx-auto mb-2" />
                        <span className="text-sm text-gray-400">AI 최고급 모델</span>
                      </div>
                      <div className="text-center p-4 bg-gray-800/50 rounded-lg">
                        <FaRobot className="text-3xl text-blue-400 mx-auto mb-2" />
                        <span className="text-sm text-gray-400">커스텀 봇 개발</span>
                      </div>
                      <div className="text-center p-4 bg-gray-800/50 rounded-lg">
                        <FaCrown className="text-3xl text-amber-400 mx-auto mb-2" />
                        <span className="text-sm text-gray-400">VIP 전용 채널</span>
                      </div>
                    </div>
                  )}

                  {/* CTA 버튼 */}
                  <Link
                    href={tier === 'Starter' ? '/signup' : '/subscription/upgrade'}
                    className={`block w-full py-4 rounded-lg font-bold text-center transition-all
                              ${tier === 'Starter' 
                                ? 'bg-gray-700 hover:bg-gray-600' 
                                : `bg-gradient-to-r ${style.color} hover:opacity-90`}
                              text-white`}
                  >
                    {tier === 'Starter' ? '무료 시작하기' : '업그레이드'}
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 등급별 접근 가능 기능 비교표 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-3xl font-bold text-center mb-12">
          <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            등급별 기능 비교
          </span>
        </h2>

        <div className="bg-gray-800 rounded-2xl p-8 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-4 px-4">카테고리</th>
                {tiers.map(tier => (
                  <th key={tier} className="text-center py-4 px-4">
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-2xl">{tierStyles[tier].icon}</span>
                      <span className="text-sm font-normal">{tier}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { name: '기본 차트 & 대시보드', tiers: ['Starter', 'Advance', 'Platinum', 'Signature', 'Master', 'Infinity'] },
                { name: '시그널 & 알림', tiers: ['Advance', 'Platinum', 'Signature', 'Master', 'Infinity'] },
                { name: '퀀트 전략 & 백테스팅', tiers: ['Platinum', 'Signature', 'Master', 'Infinity'] },
                { name: '마이크로구조 분석', tiers: ['Signature', 'Master', 'Infinity'] },
                { name: 'AI & 머신러닝', tiers: ['Platinum', 'Signature', 'Master', 'Infinity'] },
                { name: '자동화 & 봇', tiers: ['Signature', 'Master', 'Infinity'] },
                { name: '리스크 관리', tiers: ['Platinum', 'Signature', 'Master', 'Infinity'] },
                { name: '포트폴리오 최적화', tiers: ['Platinum', 'Signature', 'Master', 'Infinity'] },
                { name: '고래 추적 & 인사이더', tiers: ['Signature', 'Master', 'Infinity'] },
                { name: '마켓 메이킹', tiers: ['Master', 'Infinity'] },
                { name: '양자 컴퓨팅 분석', tiers: ['Infinity'] },
                { name: '1:1 전문가 컨설팅', tiers: ['Infinity'] },
              ].map((feature, idx) => (
                <tr key={idx} className="border-b border-gray-700/50">
                  <td className="py-3 px-4">{feature.name}</td>
                  {tiers.map(tier => (
                    <td key={tier} className="text-center py-3 px-4">
                      {feature.tiers.includes(tier) ? (
                        <FaCheck className="text-green-400 mx-auto" />
                      ) : (
                        <FaLock className="text-gray-600 mx-auto text-sm" />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* FAQ 섹션 */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-3xl font-bold text-center mb-12">자주 묻는 질문</h2>
        
        <div className="space-y-6">
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-bold mb-2 text-purple-400">언제든지 업그레이드할 수 있나요?</h3>
            <p className="text-gray-400">네, 언제든지 상위 등급으로 업그레이드 가능합니다. 남은 기간은 일할 계산되어 적용됩니다.</p>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-bold mb-2 text-purple-400">환불 정책은 어떻게 되나요?</h3>
            <p className="text-gray-400">구매 후 7일 이내 ${config.percentage.value100} 환불이 가능합니다. 단, API 사용량이 일정 수준을 초과한 경우 부분 환불이 적용됩니다.</p>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-bold mb-2 text-purple-400">여러 계정을 사용할 수 있나요?</h3>
            <p className="text-gray-400">Signature 등급부터 멀티 계정 관리가 가능합니다. Master는 5개, Infinity는 무제한 계정을 지원합니다.</p>
          </div>
        </div>
      </div>

      {/* CTA 섹션 */}
      <div className="bg-gradient-to-r from-purple-900 to-pink-900 py-20">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl font-bold mb-4">준비되셨나요?</h2>
          <p className="text-xl text-gray-300 mb-8">
            지금 시작하고 트레이딩의 새로운 차원을 경험하세요
          </p>
          <Link
            href="/subscription/upgrade"
            className="inline-block px-8 py-4 bg-white text-purple-900 font-bold rounded-lg hover:bg-gray-100 transition-colors"
          >
            지금 업그레이드하기 →
          </Link>
        </div>
      </div>
    </div>
  )
}