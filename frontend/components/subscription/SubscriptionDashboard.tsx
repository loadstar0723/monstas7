'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  FaCrown, FaChartLine, FaCalendarAlt, FaCreditCard,
  FaHistory, FaDownload, FaExclamationTriangle, FaCheckCircle
} from 'react-icons/fa'
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'

interface SubscriptionData {
  tier: string
  status: 'active' | 'cancelled' | 'expired'
  startDate: Date
  endDate: Date
  billingCycle: 'monthly' | 'yearly'
  nextBillingDate: Date
  amount: number
  paymentMethod: string
}

interface UsageData {
  apiCalls: number
  apiLimit: number
  dataStorage: number
  storageLimit: number
  customStrategies: number
  strategiesLimit: number
  lastUpdated: Date
}

interface PaymentHistory {
  id: string
  date: Date
  amount: number
  status: 'success' | 'failed' | 'pending'
  method: string
  invoice: string
}

export default function SubscriptionDashboard() {
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData>({
    tier: 'Premium',
    status: 'active',
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-12-31'),
    billingCycle: 'yearly',
    nextBillingDate: new Date('2024-12-31'),
    amount: 1490,
    paymentMethod: 'Stripe - •••• 4242'
  })

  const [usageData, setUsageData] = useState<UsageData>({
    apiCalls: 4532,
    apiLimit: 10000,
    dataStorage: 45.2,
    storageLimit: 90,
    customStrategies: 7,
    strategiesLimit: 10,
    lastUpdated: new Date()
  })

  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([
    {
      id: 'PAY001',
      date: new Date('2024-01-01'),
      amount: 1490,
      status: 'success',
      method: 'Stripe',
      invoice: 'INV-2024-001'
    },
    {
      id: 'PAY002',
      date: new Date('2023-12-01'),
      amount: 149,
      status: 'success',
      method: 'Stripe',
      invoice: 'INV-2023-012'
    }
  ])

  const [dailyUsage, setDailyUsage] = useState<any[]>([])

  useEffect(() => {
    // Generate daily usage data
    const usage = Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }),
      apiCalls: Math.floor(Math.random() * 500) + 100,
      storage: 40 + Math.random() * 10
    }))
    setDailyUsage(usage)

    // Simulate real-time usage updates
    const interval = setInterval(() => {
      setUsageData(prev => ({
        ...prev,
        apiCalls: prev.apiCalls + Math.floor(Math.random() * 5),
        dataStorage: Math.min(prev.storageLimit, prev.dataStorage + Math.random() * 0.1),
        lastUpdated: new Date()
      }))
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const daysUntilRenewal = Math.ceil((subscriptionData.nextBillingDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
  const apiUsagePercent = (usageData.apiCalls / usageData.apiLimit) * 100
  const storageUsagePercent = (usageData.dataStorage / usageData.storageLimit) * 100
  const strategiesUsagePercent = (usageData.customStrategies / usageData.strategiesLimit) * 100

  const handleCancelSubscription = () => {
    if (confirm('정말로 구독을 취소하시겠습니까?')) {
      setSubscriptionData(prev => ({ ...prev, status: 'cancelled' }))
    }
  }

  const handleUpgrade = () => {
    // Navigate to subscription tiers page
    console.log('Navigate to upgrade page')
  }

  return (
    <div className="space-y-6">
      {/* Subscription Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-lg p-6 border border-purple-500/30"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <FaCrown className="text-purple-400" />
                {subscriptionData.tier} 플랜
              </h2>
              <p className="text-gray-400 mt-1">
                {subscriptionData.billingCycle === 'yearly' ? '연간 구독' : '월간 구독'}
              </p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
              subscriptionData.status === 'active' 
                ? 'bg-green-500/20 text-green-400' 
                : 'bg-red-500/20 text-red-400'
            }`}>
              {subscriptionData.status === 'active' ? '활성' : '취소됨'}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-gray-400 text-sm">시작일</p>
              <p className="text-white font-semibold">
                {subscriptionData.startDate.toLocaleDateString('ko-KR')}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">다음 결제일</p>
              <p className="text-white font-semibold">
                {subscriptionData.nextBillingDate.toLocaleDateString('ko-KR')}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">결제 금액</p>
              <p className="text-white font-semibold">
                ₩{subscriptionData.amount.toLocaleString()}/{subscriptionData.billingCycle === 'yearly' ? '년' : '월'}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">결제 방법</p>
              <p className="text-white font-semibold">
                {subscriptionData.paymentMethod}
              </p>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              onClick={handleUpgrade}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-semibold"
            >
              업그레이드
            </button>
            <button
              onClick={() => {}}
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
            >
              결제 방법 변경
            </button>
            {subscriptionData.status === 'active' && (
              <button
                onClick={handleCancelSubscription}
                className="text-red-400 hover:text-red-300 px-4 py-2"
              >
                구독 취소
              </button>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-800 rounded-lg p-6 border border-gray-700"
        >
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <FaCalendarAlt className="text-blue-400" />
            갱신까지
          </h3>
          <div className="text-center">
            <div className="text-5xl font-bold text-white mb-2">{daysUntilRenewal}</div>
            <p className="text-gray-400">일 남음</p>
          </div>
          {daysUntilRenewal < 30 && (
            <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-600/30 rounded-lg">
              <p className="text-yellow-400 text-sm flex items-center gap-2">
                <FaExclamationTriangle />
                곧 갱신됩니다
              </p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Usage Statistics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gray-800 rounded-lg p-6 border border-gray-700"
      >
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <FaChartLine className="text-green-400" />
          사용량 통계
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-400">API 호출</span>
              <span className="text-white font-semibold">
                {usageData.apiCalls.toLocaleString()} / {usageData.apiLimit.toLocaleString()}
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  apiUsagePercent > 80 ? 'bg-red-500' : apiUsagePercent > 60 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(100, apiUsagePercent)}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">{apiUsagePercent.toFixed(1)}% 사용</p>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-400">데이터 저장</span>
              <span className="text-white font-semibold">
                {usageData.dataStorage.toFixed(1)}GB / {usageData.storageLimit}GB
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  storageUsagePercent > 80 ? 'bg-red-500' : storageUsagePercent > 60 ? 'bg-yellow-500' : 'bg-blue-500'
                }`}
                style={{ width: `${Math.min(100, storageUsagePercent)}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">{storageUsagePercent.toFixed(1)}% 사용</p>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-400">커스텀 전략</span>
              <span className="text-white font-semibold">
                {usageData.customStrategies} / {usageData.strategiesLimit}
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  strategiesUsagePercent > 80 ? 'bg-red-500' : strategiesUsagePercent > 60 ? 'bg-yellow-500' : 'bg-purple-500'
                }`}
                style={{ width: `${Math.min(100, strategiesUsagePercent)}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">{strategiesUsagePercent.toFixed(0)}% 사용</p>
          </div>
        </div>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dailyUsage}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
                labelStyle={{ color: '#9CA3AF' }}
              />
              <Line 
                type="monotone" 
                dataKey="apiCalls" 
                stroke="#10B981" 
                strokeWidth={2}
                dot={false}
                name="API 호출"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <p className="text-xs text-gray-500 text-right mt-2">
          마지막 업데이트: {usageData.lastUpdated.toLocaleTimeString('ko-KR')}
        </p>
      </motion.div>

      {/* Payment History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gray-800 rounded-lg p-6 border border-gray-700"
      >
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <FaHistory className="text-orange-400" />
          결제 내역
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-gray-700">
                <th className="pb-3 text-gray-400 font-normal">날짜</th>
                <th className="pb-3 text-gray-400 font-normal">금액</th>
                <th className="pb-3 text-gray-400 font-normal">결제 방법</th>
                <th className="pb-3 text-gray-400 font-normal">상태</th>
                <th className="pb-3 text-gray-400 font-normal">인보이스</th>
              </tr>
            </thead>
            <tbody>
              {paymentHistory.map((payment) => (
                <tr key={payment.id} className="border-b border-gray-700/50">
                  <td className="py-4 text-white">
                    {payment.date.toLocaleDateString('ko-KR')}
                  </td>
                  <td className="py-4 text-white font-semibold">
                    ₩{payment.amount.toLocaleString()}
                  </td>
                  <td className="py-4 text-gray-300">{payment.method}</td>
                  <td className="py-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                      payment.status === 'success' 
                        ? 'bg-green-500/20 text-green-400' 
                        : payment.status === 'failed'
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {payment.status === 'success' && <FaCheckCircle />}
                      {payment.status === 'success' ? '성공' : payment.status === 'failed' ? '실패' : '대기중'}
                    </span>
                  </td>
                  <td className="py-4">
                    <button className="text-blue-400 hover:text-blue-300 flex items-center gap-1">
                      <FaDownload className="text-sm" />
                      {payment.invoice}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  )
}