'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  FaCheck, FaTimes, FaCrown, FaRocket, FaStar, 
  FaInfinity, FaShieldAlt, FaChartLine 
} from 'react-icons/fa'

interface Tier {
  id: string
  name: string
  price: number
  period: 'month' | 'year'
  icon: React.ElementType
  color: string
  features: string[]
  limitations: {
    apiCalls: number | 'unlimited'
    dataRetention: number // days
    backtestingPeriod: number // days
    realtimeData: boolean
    advancedModels: boolean
    customStrategies: number | 'unlimited'
    supportLevel: string
  }
  popular?: boolean
}

const tiers: Tier[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 0,
    period: 'month',
    icon: FaStar,
    color: 'text-gray-400',
    features: [
      '기본 AI 모델 접근',
      '일일 100회 API 호출',
      '7일 데이터 보관',
      '기본 백테스팅',
      '커뮤니티 지원'
    ],
    limitations: {
      apiCalls: 100,
      dataRetention: 7,
      backtestingPeriod: 30,
      realtimeData: false,
      advancedModels: false,
      customStrategies: 1,
      supportLevel: 'community'
    }
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 49,
    period: 'month',
    icon: FaRocket,
    color: 'text-blue-400',
    features: [
      '모든 AI 모델 접근',
      '일일 1,000회 API 호출',
      '30일 데이터 보관',
      '고급 백테스팅',
      '실시간 데이터 (15분 지연)',
      '이메일 지원'
    ],
    limitations: {
      apiCalls: 1000,
      dataRetention: 30,
      backtestingPeriod: 365,
      realtimeData: true,
      advancedModels: true,
      customStrategies: 5,
      supportLevel: 'email'
    }
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 149,
    period: 'month',
    icon: FaCrown,
    color: 'text-purple-400',
    features: [
      '모든 Pro 기능',
      '일일 10,000회 API 호출',
      '90일 데이터 보관',
      '실시간 데이터 (지연 없음)',
      '우선 지원',
      '커스텀 전략 10개'
    ],
    limitations: {
      apiCalls: 10000,
      dataRetention: 90,
      backtestingPeriod: 1095, // 3 years
      realtimeData: true,
      advancedModels: true,
      customStrategies: 10,
      supportLevel: 'priority'
    },
    popular: true
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 499,
    period: 'month',
    icon: FaInfinity,
    color: 'text-yellow-400',
    features: [
      '무제한 기능',
      '무제한 API 호출',
      '무제한 데이터 보관',
      '전용 서버',
      '24/7 전용 지원',
      'SLA 보장'
    ],
    limitations: {
      apiCalls: 'unlimited',
      dataRetention: 365,
      backtestingPeriod: 3650, // 10 years
      realtimeData: true,
      advancedModels: true,
      customStrategies: 'unlimited',
      supportLevel: 'dedicated'
    }
  }
]

interface Props {
  currentTier?: string
  onSelectTier: (tierId: string) => void
}

export default function SubscriptionTiers({ currentTier = 'starter', onSelectTier }: Props) {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly')

  const getPrice = (tier: Tier) => {
    const basePrice = tier.price
    if (billingPeriod === 'yearly' && basePrice > 0) {
      return Math.floor(basePrice * 10) // 2 months free
    }
    return basePrice
  }

  const formatPrice = (price: number) => {
    if (price === 0) return '무료'
    if (billingPeriod === 'yearly') {
      return `₩${price.toLocaleString()}/년`
    }
    return `₩${price.toLocaleString()}/월`
  }

  return (
    <div className="py-12">
      {/* Billing period toggle */}
      <div className="flex justify-center mb-8">
        <div className="bg-gray-800 rounded-lg p-1 flex">
          <button
            onClick={() => setBillingPeriod('monthly')}
            className={`px-4 py-2 rounded-md transition-all ${
              billingPeriod === 'monthly'
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            월간 결제
          </button>
          <button
            onClick={() => setBillingPeriod('yearly')}
            className={`px-4 py-2 rounded-md transition-all ${
              billingPeriod === 'yearly'
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            연간 결제
            <span className="ml-2 text-xs bg-green-500 text-white px-2 py-0.5 rounded">
              2개월 무료
            </span>
          </button>
        </div>
      </div>

      {/* Tier cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {tiers.map((tier, index) => (
          <motion.div
            key={tier.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`relative bg-gray-800 rounded-lg p-6 border ${
              tier.popular 
                ? 'border-purple-500 shadow-lg shadow-purple-500/20' 
                : 'border-gray-700'
            } ${currentTier === tier.id ? 'ring-2 ring-blue-500' : ''}`}
          >
            {tier.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-purple-500 text-white text-xs px-3 py-1 rounded-full">
                  가장 인기
                </span>
              </div>
            )}

            {currentTier === tier.id && (
              <div className="absolute -top-3 right-4">
                <span className="bg-blue-500 text-white text-xs px-3 py-1 rounded-full">
                  현재 플랜
                </span>
              </div>
            )}

            <div className="text-center mb-6">
              <tier.icon className={`text-4xl ${tier.color} mx-auto mb-3`} />
              <h3 className="text-xl font-bold text-white">{tier.name}</h3>
              <div className="mt-4">
                <span className="text-3xl font-bold text-white">
                  {formatPrice(getPrice(tier))}
                </span>
              </div>
            </div>

            <ul className="space-y-3 mb-6">
              {tier.features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <FaCheck className="text-green-400 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-300">{feature}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => onSelectTier(tier.id)}
              disabled={currentTier === tier.id}
              className={`w-full py-3 rounded-lg font-semibold transition-all ${
                currentTier === tier.id
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  : tier.popular
                  ? 'bg-purple-600 hover:bg-purple-700 text-white'
                  : 'bg-gray-700 hover:bg-gray-600 text-white'
              }`}
            >
              {currentTier === tier.id ? '현재 플랜' : '선택하기'}
            </button>
          </motion.div>
        ))}
      </div>

      {/* Feature comparison table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-16 bg-gray-800 rounded-lg overflow-hidden"
      >
        <div className="p-6 border-b border-gray-700">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <FaChartLine className="text-blue-400" />
            상세 기능 비교
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-900">
              <tr>
                <th className="text-left px-6 py-4 text-gray-400">기능</th>
                {tiers.map(tier => (
                  <th key={tier.id} className="text-center px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <tier.icon className={tier.color} />
                      <span className="text-white">{tier.name}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              <tr className="hover:bg-gray-700/50">
                <td className="px-6 py-4 text-gray-300">API 호출</td>
                {tiers.map(tier => (
                  <td key={tier.id} className="text-center px-6 py-4 text-white">
                    {tier.limitations.apiCalls === 'unlimited' 
                      ? '무제한' 
                      : `일일 ${tier.limitations.apiCalls}회`}
                  </td>
                ))}
              </tr>
              <tr className="hover:bg-gray-700/50">
                <td className="px-6 py-4 text-gray-300">데이터 보관</td>
                {tiers.map(tier => (
                  <td key={tier.id} className="text-center px-6 py-4 text-white">
                    {tier.limitations.dataRetention}일
                  </td>
                ))}
              </tr>
              <tr className="hover:bg-gray-700/50">
                <td className="px-6 py-4 text-gray-300">실시간 데이터</td>
                {tiers.map(tier => (
                  <td key={tier.id} className="text-center px-6 py-4">
                    {tier.limitations.realtimeData ? (
                      <FaCheck className="text-green-400 mx-auto" />
                    ) : (
                      <FaTimes className="text-red-400 mx-auto" />
                    )}
                  </td>
                ))}
              </tr>
              <tr className="hover:bg-gray-700/50">
                <td className="px-6 py-4 text-gray-300">고급 AI 모델</td>
                {tiers.map(tier => (
                  <td key={tier.id} className="text-center px-6 py-4">
                    {tier.limitations.advancedModels ? (
                      <FaCheck className="text-green-400 mx-auto" />
                    ) : (
                      <FaTimes className="text-red-400 mx-auto" />
                    )}
                  </td>
                ))}
              </tr>
              <tr className="hover:bg-gray-700/50">
                <td className="px-6 py-4 text-gray-300">커스텀 전략</td>
                {tiers.map(tier => (
                  <td key={tier.id} className="text-center px-6 py-4 text-white">
                    {tier.limitations.customStrategies === 'unlimited' 
                      ? '무제한' 
                      : `${tier.limitations.customStrategies}개`}
                  </td>
                ))}
              </tr>
              <tr className="hover:bg-gray-700/50">
                <td className="px-6 py-4 text-gray-300">지원 레벨</td>
                {tiers.map(tier => (
                  <td key={tier.id} className="text-center px-6 py-4 text-white capitalize">
                    {tier.limitations.supportLevel === 'community' && '커뮤니티'}
                    {tier.limitations.supportLevel === 'email' && '이메일'}
                    {tier.limitations.supportLevel === 'priority' && '우선 지원'}
                    {tier.limitations.supportLevel === 'dedicated' && '전용 지원'}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  )
}