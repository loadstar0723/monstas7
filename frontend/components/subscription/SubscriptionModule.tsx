'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import dynamic from 'next/dynamic'
import { 
  FaCrown, FaCreditCard, FaShieldAlt, FaUser,
  FaChartLine, FaKey, FaHistory, FaCheckCircle
} from 'react-icons/fa'

// Dynamic imports
const SubscriptionTiers = dynamic(() => import('./SubscriptionTiers'), { ssr: false })
const PaymentIntegration = dynamic(() => import('./PaymentIntegration'), { ssr: false })
const SubscriptionDashboard = dynamic(() => import('./SubscriptionDashboard'), { ssr: false })
const KYCVerification = dynamic(() => import('./KYCVerification'), { ssr: false })
const SecuritySettings = dynamic(() => import('./SecuritySettings'), { ssr: false })

type TabType = 'tiers' | 'dashboard' | 'payment' | 'kyc' | 'security'

export default function SubscriptionModule() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard')
  const [currentTier, setCurrentTier] = useState('starter')
  const [selectedTier, setSelectedTier] = useState('premium')
  const [isKYCVerified, setIsKYCVerified] = useState(false)

  const tabs = [
    {
      id: 'dashboard' as TabType,
      name: '대시보드',
      icon: FaChartLine,
      description: '구독 현황 및 사용량'
    },
    {
      id: 'tiers' as TabType,
      name: '구독 플랜',
      icon: FaCrown,
      description: '플랜 선택 및 비교'
    },
    {
      id: 'payment' as TabType,
      name: '결제',
      icon: FaCreditCard,
      description: '결제 방법 관리'
    },
    {
      id: 'kyc' as TabType,
      name: 'KYC 인증',
      icon: FaUser,
      description: '신원 확인',
      badge: !isKYCVerified ? 'required' : 'verified'
    },
    {
      id: 'security' as TabType,
      name: '보안 설정',
      icon: FaShieldAlt,
      description: '계정 보안 관리'
    }
  ]

  const handleTierSelection = (tierId: string) => {
    setSelectedTier(tierId)
    setActiveTab('payment')
  }

  const handlePaymentComplete = (paymentData: any) => {
    console.log('Payment completed:', paymentData)
    setCurrentTier(paymentData.tier)
    setActiveTab('dashboard')
    // Show success message
    alert('결제가 완료되었습니다!')
  }

  const tierPrices = {
    starter: 0,
    pro: 49,
    premium: 149,
    enterprise: 499
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
            구독 & 계정 관리
          </h1>
          <p className="text-gray-400 mt-1">프리미엄 기능으로 더 나은 트레이딩을 경험하세요</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-gray-900/50 backdrop-blur-sm sticky top-0 z-10 border-b border-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="flex overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 flex items-center gap-3 border-b-2 transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-500 bg-gray-900/50'
                    : 'border-transparent hover:bg-gray-900/30'
                }`}
              >
                <tab.icon className={activeTab === tab.id ? 'text-blue-400' : 'text-gray-400'} />
                <div className="text-left">
                  <div className={`flex items-center gap-2 ${activeTab === tab.id ? 'text-white' : 'text-gray-300'}`}>
                    {tab.name}
                    {tab.badge && (
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        tab.badge === 'required' 
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-green-500/20 text-green-400'
                      }`}>
                        {tab.badge === 'required' ? '필수' : '완료'}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">{tab.description}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* KYC Warning Banner */}
        {!isKYCVerified && activeTab !== 'kyc' && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-4 mb-6 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <FaUser className="text-yellow-400 text-xl" />
              <div>
                <h4 className="text-yellow-400 font-semibold">KYC 인증이 필요합니다</h4>
                <p className="text-sm text-gray-300">
                  Pro 이상 플랜을 이용하려면 신원 확인이 필요합니다.
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('kyc')}
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg text-sm"
            >
              지금 인증하기
            </button>
          </motion.div>
        )}

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <SubscriptionDashboard />
            </motion.div>
          )}

          {activeTab === 'tiers' && (
            <motion.div
              key="tiers"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <SubscriptionTiers
                currentTier={currentTier}
                onSelectTier={handleTierSelection}
              />
            </motion.div>
          )}

          {activeTab === 'payment' && (
            <motion.div
              key="payment"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <PaymentIntegration
                selectedTier={selectedTier}
                price={tierPrices[selectedTier as keyof typeof tierPrices]}
                onPaymentComplete={handlePaymentComplete}
              />
            </motion.div>
          )}

          {activeTab === 'kyc' && (
            <motion.div
              key="kyc"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <KYCVerification />
            </motion.div>
          )}

          {activeTab === 'security' && (
            <motion.div
              key="security"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <SecuritySettings />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

const AnimatePresence = ({ children, mode }: { children: React.ReactNode, mode?: 'wait' | 'sync' | 'popLayout' }) => {
  return <>{children}</>
}