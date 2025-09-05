'use client'

import { FaCrown, FaCheck, FaTimes } from 'react-icons/fa'

const tierInfo = {
  'Starter': { 
    price: '무료',
    color: 'from-gray-600 to-gray-700',
    borderColor: 'border-gray-600',
    icon: '✨',
    features: ['기본 차트', '뉴스 피드', '기본 대시보드', '교육 콘텐츠']
  },
  'Advance': { 
    price: '₩29,900/월',
    color: 'from-blue-600 to-blue-700',
    borderColor: 'border-blue-500',
    icon: '💎',
    features: ['기술적 지표', '시그널 알림', '포트폴리오 관리', '프리미엄 채널']
  },
  'Platinum': { 
    price: '₩59,900/월',
    color: 'from-purple-600 to-purple-700',
    borderColor: 'border-purple-500',
    icon: '👑',
    features: ['AI 분석', '백테스팅', '볼륨 프로파일', '리스크 관리']
  },
  'Signature': { 
    price: '₩99,900/월',
    color: 'from-amber-600 to-amber-700',
    borderColor: 'border-amber-500',
    icon: '🏆',
    features: ['퀀트 전략', '자동화 봇', '전략 빌더', '인사이더 플로우']
  },
  'Master': { 
    price: '₩199,900/월',
    color: 'from-red-600 to-red-700',
    borderColor: 'border-red-500',
    icon: '🔥',
    features: ['마이크로구조', '마켓 메이킹', '고래 추적', 'VIP 관리']
  },
  'Infinity': { 
    price: '₩499,900/월',
    color: 'from-purple-600 via-pink-600 to-yellow-600',
    borderColor: 'border-purple-500',
    icon: '⚡',
    features: ['모든 기능', '1:1 컨설팅', '조기 액세스', '무제한 API']
  }
}

const allFeatures = [
  { name: '기본 차트 & 대시보드', tiers: ['Starter', 'Advance', 'Platinum', 'Signature', 'Master', 'Infinity'] },
  { name: '뉴스 & 이벤트', tiers: ['Starter', 'Advance', 'Platinum', 'Signature', 'Master', 'Infinity'] },
  { name: '기술적 지표', tiers: ['Advance', 'Platinum', 'Signature', 'Master', 'Infinity'] },
  { name: '시그널 & 알림', tiers: ['Advance', 'Platinum', 'Signature', 'Master', 'Infinity'] },
  { name: 'AI 분석', tiers: ['Platinum', 'Signature', 'Master', 'Infinity'] },
  { name: '백테스팅', tiers: ['Platinum', 'Signature', 'Master', 'Infinity'] },
  { name: '퀀트 전략', tiers: ['Signature', 'Master', 'Infinity'] },
  { name: '자동화 봇', tiers: ['Signature', 'Master', 'Infinity'] },
  { name: '마이크로구조 분석', tiers: ['Master', 'Infinity'] },
  { name: '고래 추적', tiers: ['Master', 'Infinity'] },
  { name: '1:1 전문가 지원', tiers: ['Infinity'] },
  { name: '무제한 API 액세스', tiers: ['Infinity'] },
]

export default function ComparePage() {
  const tiers = Object.keys(tierInfo) as Array<keyof typeof tierInfo>

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            등급 비교
          </h1>
          <p className="text-gray-400">당신에게 맞는 완벽한 플랜을 선택하세요</p>
        </div>

        {/* 등급 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-12">
          {tiers.map((tier) => {
            const info = tierInfo[tier]
            return (
              <div
                key={tier}
                className={`relative p-6 rounded-xl bg-gradient-to-b ${info.color} border ${info.borderColor} hover:scale-105 transition-transform`}
              >
                <div className="text-center">
                  <div className="text-4xl mb-2">{info.icon}</div>
                  <h3 className="text-xl font-bold mb-2">{tier}</h3>
                  <div className="text-2xl font-bold mb-4">{info.price}</div>
                  <ul className="text-sm space-y-2">
                    {info.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <FaCheck className="text-green-400 text-xs" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )
          })}
        </div>

        {/* 상세 비교 테이블 */}
        <div className="bg-gray-800 rounded-xl p-6">
          <h2 className="text-2xl font-bold mb-6">상세 기능 비교</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-4">기능</th>
                  {tiers.map(tier => (
                    <th key={tier} className="text-center py-3 px-4">
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-2xl">{tierInfo[tier].icon}</span>
                        <span className="text-sm">{tier}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {allFeatures.map((feature, idx) => (
                  <tr key={idx} className="border-b border-gray-700/50">
                    <td className="py-3 px-4">{feature.name}</td>
                    {tiers.map(tier => (
                      <td key={tier} className="text-center py-3 px-4">
                        {feature.tiers.includes(tier) ? (
                          <FaCheck className="text-green-400 mx-auto" />
                        ) : (
                          <FaTimes className="text-gray-600 mx-auto" />
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <button className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-bold hover:from-purple-700 hover:to-pink-700 transition-colors">
            지금 업그레이드하기
          </button>
        </div>
      </div>
    </div>
  )
}