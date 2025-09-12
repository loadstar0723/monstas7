'use client'

import { useState } from 'react'
import { Crown, Lock, Sparkles, Star, Diamond, Infinity } from 'lucide-react'
import Link from 'next/link'

type SubscriptionTier = 'Free' | 'Starter' | 'Professional' | 'Platinum' | 'Signature' | 'Master' | 'Infinity'

interface ExclusiveAccessProps {
  title: string
  category?: string
  description: string
  requiredTier: SubscriptionTier
  features: string[]
  currentUserTier?: SubscriptionTier
  techStack?: string[]
  previewType?: 'dashboard' | 'analytics' | 'trading' | 'monitoring'
}

const tierIcons = {
  Free: Star,
  Starter: Star,
  Professional: Crown,
  Platinum: Diamond,
  Signature: Sparkles,
  Master: Crown,
  Infinity: Infinity
}

const tierColors = {
  Free: 'text-gray-400',
  Starter: 'text-blue-400',
  Professional: 'text-green-400',
  Platinum: 'text-purple-400',
  Signature: 'text-yellow-400',
  Master: 'text-red-400',
  Infinity: 'text-pink-400'
}

const tierGradients = {
  Free: 'from-gray-900 to-gray-800',
  Starter: 'from-blue-900 to-blue-800',
  Professional: 'from-green-900 to-green-800',
  Platinum: 'from-purple-900 to-purple-800',
  Signature: 'from-yellow-900 to-yellow-800',
  Master: 'from-red-900 to-red-800',
  Infinity: 'from-pink-900 to-pink-800'
}

const tierBorders = {
  Free: 'border-gray-600',
  Starter: 'border-blue-600',
  Professional: 'border-green-600',
  Platinum: 'border-purple-600',
  Signature: 'border-yellow-600',
  Master: 'border-red-600',
  Infinity: 'border-pink-600'
}

export default function ExclusiveAccess({
  title,
  category,
  description,
  requiredTier,
  features,
  currentUserTier = 'Free',
  techStack,
  previewType
}: ExclusiveAccessProps) {
  const [showUpgrade, setShowUpgrade] = useState(false)
  
  const TierIcon = tierIcons[requiredTier]
  const hasAccess = false // TODO: 실제 구독 상태 확인 로직 구현

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-6">
      {/* 헤더 */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="flex items-center gap-2 text-gray-400 text-sm mb-4">
          <Link href="/" className="hover:text-white transition-colors">홈</Link>
          <span>/</span>
          {category ? (
            <>
              <span className="text-white">{category}</span>
              <span>/</span>
              <span className="text-white">{title}</span>
            </>
          ) : (
            <>
              <Link href="/ai" className="hover:text-white transition-colors">AI/ML 분석</Link>
              <span>/</span>
              <span className="text-white">{title}</span>
            </>
          )}
        </div>
        
        <div className="flex items-center gap-3 mb-4">
          <TierIcon className={`w-8 h-8 ${tierColors[requiredTier]}`} />
          <h1 className="text-4xl font-bold text-white">{title}</h1>
        </div>
        <p className="text-gray-400 text-lg">{description}</p>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="max-w-4xl mx-auto">
        {!hasAccess ? (
          // 접근 제한 화면
          <div className={`bg-gradient-to-br ${tierGradients[requiredTier]} rounded-2xl p-8 border-2 ${tierBorders[requiredTier]} relative overflow-hidden`}>
            {/* 배경 장식 */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-10 right-10">
                <TierIcon className="w-32 h-32" />
              </div>
              <div className="absolute bottom-10 left-10">
                <Lock className="w-24 h-24" />
              </div>
            </div>

            <div className="relative z-10">
              <div className="text-center mb-8">
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${tierColors[requiredTier]} bg-white/10 mb-4`}>
                  <TierIcon className="w-5 h-5" />
                  <span className="font-semibold">{requiredTier} 전용</span>
                </div>
                
                <h2 className="text-3xl font-bold text-white mb-4">프리미엄 기능입니다</h2>
                <p className="text-gray-300 text-lg max-w-2xl mx-auto">
                  이 고급 AI 분석 도구는 <span className={`font-semibold ${tierColors[requiredTier]}`}>{requiredTier}</span> 
                  등급 이상의 구독자만 이용할 수 있습니다.
                </p>
              </div>

              {/* 기능 목록 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3 bg-white/5 p-4 rounded-lg">
                    <div className={`w-6 h-6 rounded-full ${tierColors[requiredTier]} bg-white/20 flex items-center justify-center mt-0.5`}>
                      <Sparkles className="w-3 h-3" />
                    </div>
                    <span className="text-gray-200">{feature}</span>
                  </div>
                ))}
              </div>

              {/* 기술 스택 */}
              {techStack && techStack.length > 0 && (
                <div className="bg-white/5 rounded-xl p-6 mb-8">
                  <h3 className="text-lg font-bold text-white mb-4">기술 스택</h3>
                  <div className="flex flex-wrap gap-2">
                    {techStack.map((tech, index) => (
                      <span 
                        key={index} 
                        className={`px-3 py-1 rounded-full text-sm font-medium ${tierColors[requiredTier]} bg-white/10`}
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 구독 정보 */}
              <div className="bg-white/10 rounded-xl p-6 mb-6">
                <h3 className="text-xl font-bold text-white mb-4">현재 구독 상태</h3>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-300">현재 등급:</span>
                    <span className={`font-semibold ${tierColors[currentUserTier]}`}>{currentUserTier}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-300">필요 등급:</span>
                    <span className={`font-semibold ${tierColors[requiredTier]}`}>{requiredTier}</span>
                  </div>
                </div>
                
                {requiredTier !== 'Free' && (
                  <div className="bg-white/5 rounded-lg p-4">
                    <h4 className="font-semibold text-white mb-2">{requiredTier} 등급 혜택</h4>
                    <ul className="space-y-1 text-sm text-gray-300">
                      <li>• 모든 AI 분석 도구 무제한 이용</li>
                      <li>• 실시간 프리미엄 시그널</li>
                      <li>• 전용 텔레그램 채널 액세스</li>
                      <li>• 1:1 맞춤 트레이딩 컨설팅</li>
                      <li>• 우선 고객 지원</li>
                    </ul>
                  </div>
                )}
              </div>

              {/* 액션 버튼 */}
              <div className="text-center">
                <button
                  onClick={() => setShowUpgrade(true)}
                  className={`inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-white transition-all hover:scale-105 ${
                    requiredTier === 'Infinity' 
                      ? 'bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500' 
                      : requiredTier === 'Master'
                      ? 'bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500'
                      : requiredTier === 'Signature'
                      ? 'bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500'
                      : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500'
                  }`}
                >
                  <Crown className="w-5 h-5" />
                  {requiredTier} 등급으로 업그레이드
                </button>
                
                <p className="text-gray-400 text-sm mt-4">
                  7일 무료 체험 • 언제든 취소 가능
                </p>
              </div>
            </div>
          </div>
        ) : (
          // 실제 기능 화면 (접근 허용 시)
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700">
            <div className="text-center py-12">
              <TierIcon className={`w-16 h-16 ${tierColors[requiredTier]} mx-auto mb-4`} />
              <h2 className="text-2xl font-bold text-white mb-2">기능 구현 중</h2>
              <p className="text-gray-400">
                이 프리미엄 기능은 현재 개발 중입니다. 곧 업데이트될 예정입니다.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 업그레이드 모달 */}
      {showUpgrade && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-2xl p-8 max-w-md w-full border border-gray-700">
            <div className="text-center mb-6">
              <TierIcon className={`w-12 h-12 ${tierColors[requiredTier]} mx-auto mb-4`} />
              <h3 className="text-2xl font-bold text-white mb-2">{requiredTier} 구독</h3>
              <p className="text-gray-400">프리미엄 AI 분석의 모든 기능을 경험하세요</p>
            </div>

            <div className="space-y-4 mb-6">
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="text-center">
                  <span className="text-3xl font-bold text-white">월 299,000원</span>
                  <span className="text-gray-400 block text-sm">7일 무료 체험 포함</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowUpgrade(false)}
                className="flex-1 py-3 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-800 transition-colors"
              >
                취소
              </button>
              <button
                className={`flex-1 py-3 rounded-lg text-white font-semibold transition-colors ${
                  requiredTier === 'Infinity' 
                    ? 'bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500' 
                    : requiredTier === 'Master'
                    ? 'bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500'
                    : requiredTier === 'Signature'
                    ? 'bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500'
                    : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500'
                }`}
              >
                구독 시작
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}