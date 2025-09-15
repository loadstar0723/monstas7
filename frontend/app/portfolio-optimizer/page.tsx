'use client'

import React from 'react'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import ModuleErrorBoundary from '@/components/common/ModuleErrorBoundary'

const PortfolioOptimizerModule = dynamic(
  () => import('@/components/portfolio-optimizer/portfolio-optimizer-module'),
  {
    loading: () => (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white text-xl">포트폴리오 옵티마이저 로딩중...</p>
        </div>
      </div>
    ),
    ssr: false
  }
)

export default function PortfolioOptimizerPage() {
  return (
    <ModuleErrorBoundary moduleName="포트폴리오 옵티마이저">
      <div className="min-h-screen bg-gray-950 text-white">
        <div className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <PortfolioOptimizerModule />
          </motion.div>
        </div>
      </div>
    </ModuleErrorBoundary>
  )
}