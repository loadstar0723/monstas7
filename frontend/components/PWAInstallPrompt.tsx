'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaDownload, FaTimes, FaMobileAlt } from 'react-icons/fa'

export default function PWAInstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [isIOS, setIsIOS] = useState(false)

  useEffect(() => {
    // iOS 감지
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
    setIsIOS(isIOSDevice)

    // 이미 설치된 경우 체크
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return
    }

    // 설치 프롬프트 이벤트 리스너
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      
      // 이전에 거절했는지 체크
      const dismissed = localStorage.getItem('pwa_install_dismissed')
      const dismissedTime = dismissed ? parseInt(dismissed) : 0
      const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24)
      
      // 7일 후 다시 표시
      if (!dismissed || daysSinceDismissed > 7) {
        setTimeout(() => setShowPrompt(true), 3000) // 3초 후 표시
      }
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // iOS의 경우 수동 설치 안내
    if (isIOSDevice && !window.navigator.standalone) {
      const dismissed = localStorage.getItem('pwa_install_dismissed_ios')
      if (!dismissed) {
        setTimeout(() => setShowPrompt(true), 5000)
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstall = async () => {
    if (isIOS) {
      // iOS 설치 안내 모달 표시
      alert('Safari 브라우저에서:\n1. 공유 버튼을 탭하세요\n2. "홈 화면에 추가"를 선택하세요')
      localStorage.setItem('pwa_install_dismissed_ios', Date.now().toString())
      setShowPrompt(false)
      return
    }

    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      } else {
      localStorage.setItem('pwa_install_dismissed', Date.now().toString())
    }

    setDeferredPrompt(null)
    setShowPrompt(false)
  }

  const handleDismiss = () => {
    if (isIOS) {
      localStorage.setItem('pwa_install_dismissed_ios', Date.now().toString())
    } else {
      localStorage.setItem('pwa_install_dismissed', Date.now().toString())
    }
    setShowPrompt(false)
  }

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96"
        >
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg shadow-xl p-4 text-white">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <FaMobileAlt className="w-6 h-6 mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-1">MONSTA 앱 설치</h3>
                  <p className="text-sm opacity-90 mb-3">
                    홈 화면에 추가하여 더 빠르게 접속하세요
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={handleInstall}
                      className="bg-white text-purple-600 px-4 py-2 rounded-lg font-semibold text-sm hover:bg-gray-100 transition-colors flex items-center gap-2"
                    >
                      <FaDownload className="w-4 h-4" />
                      설치하기
                    </button>
                    <button
                      onClick={handleDismiss}
                      className="bg-white/20 px-4 py-2 rounded-lg font-semibold text-sm hover:bg-white/30 transition-colors"
                    >
                      나중에
                    </button>
                  </div>
                </div>
              </div>
              <button
                onClick={handleDismiss}
                className="text-white/70 hover:text-white transition-colors"
                aria-label="닫기"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}