'use client'

import React from 'react'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'

const StrategyBuilderModule = dynamic(
  () => import('@/components/strategy-builder/StrategyBuilderModule'),
  {
    loading: () => (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white text-xl">AI 전략 빌더 로딩중...</p>
        </div>
      </div>
    ),
    ssr: false
  }
)

export default function StrategyBuilderPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <StrategyBuilderModule />
        </motion.div>
      </div>
    </div>
  )
}