'use client'

import dynamic from 'next/dynamic'
import AIModuleWrapper from '@/components/ai/AIModuleWrapper'

// Go 하이브리드 LSTM으로 통합
const GoLSTMModule = dynamic(() => import('./LSTMModuleEnhanced'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-500 mx-auto mb-4"></div>
        <p className="text-white text-lg">Go 하이브리드 LSTM 로딩 중...</p>
      </div>
    </div>
  )
})

export default function LSTMPredictionPage() {
  return (
    <AIModuleWrapper moduleName="LSTM" showEngineStatus={true}>
      <GoLSTMModule />
    </AIModuleWrapper>
  )
}