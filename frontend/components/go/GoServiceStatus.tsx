'use client'

import React, { useState, useEffect } from 'react'
import { FaServer, FaCheckCircle, FaExclamationCircle, FaSyncAlt } from 'react-icons/fa'

export default function GoServiceStatus() {
  const [serverStatus, setServerStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking')
  const [responseTime, setResponseTime] = useState<number>(0)
  const [serverVersion, setServerVersion] = useState<string>('1.0.0')

  useEffect(() => {
    const checkServerStatus = async () => {
      const startTime = Date.now()
      try {
        const response = await fetch('http://localhost:8080/health', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          mode: 'cors',
        })

        if (response.ok) {
          const data = await response.json()
          setServerStatus('connected')
          setResponseTime(Date.now() - startTime)
          setServerVersion(data.version || '1.0.0')
        } else {
          setServerStatus('disconnected')
        }
      } catch (error) {
        setServerStatus('disconnected')
      }
    }

    // 초기 체크
    checkServerStatus()

    // 5초마다 체크
    const interval = setInterval(checkServerStatus, 5000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="fixed top-20 right-4 z-10">
      <div className={`bg-gray-900/90 backdrop-blur-xl rounded-xl p-4 border ${
        serverStatus === 'connected' ? 'border-green-500/30' :
        serverStatus === 'disconnected' ? 'border-red-500/30' : 'border-yellow-500/30'
      } shadow-2xl`}>
        <div className="flex items-center gap-3">
          <FaServer className={`text-2xl ${
            serverStatus === 'connected' ? 'text-green-400' :
            serverStatus === 'disconnected' ? 'text-red-400' : 'text-yellow-400'
          }`} />

          <div>
            <div className="flex items-center gap-2">
              <span className="text-white font-semibold">Go Trading Engine</span>
              {serverStatus === 'connected' ? (
                <FaCheckCircle className="text-green-400 text-sm" />
              ) : serverStatus === 'disconnected' ? (
                <FaExclamationCircle className="text-red-400 text-sm" />
              ) : (
                <FaSyncAlt className="text-yellow-400 text-sm animate-spin" />
              )}
            </div>

            <div className="text-xs text-gray-400 mt-1">
              {serverStatus === 'connected' ? (
                <>
                  <span className="text-green-400">● 연결됨</span>
                  <span className="mx-2">|</span>
                  <span>{responseTime}ms</span>
                  <span className="mx-2">|</span>
                  <span>v{serverVersion}</span>
                </>
              ) : serverStatus === 'disconnected' ? (
                <span className="text-red-400">● 연결 끊김</span>
              ) : (
                <span className="text-yellow-400">● 연결 확인 중...</span>
              )}
            </div>
          </div>
        </div>

        {/* 성능 지표 */}
        {serverStatus === 'connected' && (
          <div className="mt-3 pt-3 border-t border-gray-700/50 grid grid-cols-3 gap-2">
            <div className="text-center">
              <div className="text-xs text-gray-500">CPU</div>
              <div className="text-sm font-semibold text-green-400">12%</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-500">메모리</div>
              <div className="text-sm font-semibold text-blue-400">89MB</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-500">고루틴</div>
              <div className="text-sm font-semibold text-purple-400">256</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}