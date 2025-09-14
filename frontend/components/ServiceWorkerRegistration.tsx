'use client'

import { useEffect } from 'react'

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    // 개발 환경에서는 Service Worker 비활성화
    if (process.env.NODE_ENV === 'development') {
      // 기존 Service Worker 제거
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(function(registrations) {
          for(let registration of registrations) {
            registration.unregister()
            console.log('Service Worker unregistered in development')
          }
        })
      }
      return
    }
    
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            // 업데이트 체크
            registration.addEventListener('updatefound', () => {
              const newWorker = registration.installing
              if (newWorker) {
                newWorker.addEventListener('statechange', () => {
                  if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    // 새 버전 사용 가능
                    if (confirm('새로운 버전이 있습니다. 업데이트하시겠습니까?')) {
                      window.location.reload()
                    }
                  }
                })
              }
            })
          })
          .catch((error) => {
            console.error('서비스 워커 등록 실패:', error)
          })
      })
    }
  }, [])

  return null
}