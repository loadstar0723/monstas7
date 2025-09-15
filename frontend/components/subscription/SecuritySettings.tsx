'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  FaShieldAlt, FaKey, FaMobileAlt, FaEnvelope,
  FaLock, FaHistory, FaDesktop, FaGlobe,
  FaExclamationTriangle, FaCheckCircle, FaQrcode
} from 'react-icons/fa'
import { SiGoogleauthenticator } from 'react-icons/si'

interface SecurityDevice {
  id: string
  device: string
  browser: string
  location: string
  lastAccess: Date
  isCurrent: boolean
}

interface LoginHistory {
  id: string
  timestamp: Date
  ipAddress: string
  location: string
  device: string
  status: 'success' | 'failed'
}

export default function SecuritySettings() {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [showQRCode, setShowQRCode] = useState(false)
  const [verificationCode, setVerificationCode] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  
  const [emailNotifications, setEmailNotifications] = useState({
    login: true,
    withdrawal: true,
    apiKey: true,
    subscription: true
  })

  const [apiKeys, setApiKeys] = useState([
    {
      id: 'key1',
      name: 'Production API',
      key: 'sk_live_...4242',
      created: new Date('2024-01-01'),
      lastUsed: new Date('2024-01-20'),
      permissions: ['read', 'trade']
    }
  ])

  const [devices, setDevices] = useState<SecurityDevice[]>([
    {
      id: 'dev1',
      device: 'Windows PC',
      browser: 'Chrome 120',
      location: 'Seoul, Korea',
      lastAccess: new Date(),
      isCurrent: true
    },
    {
      id: 'dev2',
      device: 'iPhone 15 Pro',
      browser: 'Safari',
      location: 'Seoul, Korea',
      lastAccess: new Date('2024-01-19'),
      isCurrent: false
    }
  ])

  const [loginHistory, setLoginHistory] = useState<LoginHistory[]>([
    {
      id: 'log1',
      timestamp: new Date(),
      ipAddress: '123.456.789.0',
      location: 'Seoul, Korea',
      device: 'Windows PC',
      status: 'success'
    },
    {
      id: 'log2',
      timestamp: new Date('2024-01-19'),
      ipAddress: '123.456.789.1',
      location: 'Seoul, Korea',
      device: 'iPhone',
      status: 'success'
    }
  ])

  const [password, setPassword] = useState({
    current: '',
    new: '',
    confirm: ''
  })

  const enable2FA = () => {
    setShowQRCode(true)
  }

  const verify2FA = () => {
    setIsVerifying(true)
    
    // Simulate verification
    setTimeout(() => {
      if (verificationCode === '123456') {
        setTwoFactorEnabled(true)
        setShowQRCode(false)
        setVerificationCode('')
        alert('2단계 인증이 활성화되었습니다.')
      } else {
        alert('잘못된 인증 코드입니다.')
      }
      setIsVerifying(false)
    }, 1000)
  }

  const generateNewApiKey = () => {
    const newKey = {
      id: `key${apiKeys.length + 1}`,
      name: 'New API Key',
      key: 'sk_live_...new_' + Math.random().toString(36).substr(2, 4),
      created: new Date(),
      lastUsed: null,
      permissions: ['read']
    }
    setApiKeys([...apiKeys, newKey])
  }

  const revokeApiKey = (keyId: string) => {
    if (confirm('이 API 키를 취소하시겠습니까?')) {
      setApiKeys(apiKeys.filter(k => k.id !== keyId))
    }
  }

  const revokeDevice = (deviceId: string) => {
    if (confirm('이 기기의 접근을 취소하시겠습니까?')) {
      setDevices(devices.filter(d => d.id !== deviceId))
    }
  }

  const changePassword = () => {
    if (password.new !== password.confirm) {
      alert('새 비밀번호가 일치하지 않습니다.')
      return
    }
    
    if (password.new.length < 8) {
      alert('비밀번호는 최소 8자 이상이어야 합니다.')
      return
    }
    
    // Simulate password change
    alert('비밀번호가 변경되었습니다.')
    setPassword({ current: '', new: '', confirm: '' })
  }

  return (
    <div className="space-y-6">
      {/* 2FA Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800 rounded-lg p-6 border border-gray-700"
      >
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <FaShieldAlt className="text-green-400" />
          2단계 인증 (2FA)
        </h3>

        {!twoFactorEnabled ? (
          <div>
            <p className="text-gray-300 mb-4">
              2단계 인증을 활성화하여 계정 보안을 강화하세요.
            </p>
            
            {!showQRCode ? (
              <button
                onClick={enable2FA}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
              >
                2FA 활성화
              </button>
            ) : (
              <div className="space-y-4">
                <div className="bg-gray-900 p-4 rounded-lg">
                  <p className="text-sm text-gray-400 mb-3">
                    1. Google Authenticator 앱을 설치하세요
                  </p>
                  <p className="text-sm text-gray-400 mb-3">
                    2. 아래 QR 코드를 스캔하세요
                  </p>
                  
                  <div className="bg-white p-4 rounded-lg w-48 h-48 mx-auto mb-4">
                    <FaQrcode className="w-full h-full text-black" />
                  </div>
                  
                  <p className="text-sm text-gray-400 mb-3">
                    3. 앱에 표시된 6자리 코드를 입력하세요
                  </p>
                  
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      placeholder="123456"
                      maxLength={6}
                      className="bg-gray-700 text-white px-4 py-2 rounded-lg flex-1"
                    />
                    <button
                      onClick={verify2FA}
                      disabled={isVerifying || verificationCode.length !== 6}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
                    >
                      확인
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FaCheckCircle className="text-green-400 text-xl" />
              <div>
                <p className="text-white font-semibold">2FA 활성화됨</p>
                <p className="text-sm text-gray-400">Google Authenticator 사용 중</p>
              </div>
            </div>
            <button
              onClick={() => setTwoFactorEnabled(false)}
              className="text-red-400 hover:text-red-300"
            >
              비활성화
            </button>
          </div>
        )}
      </motion.div>

      {/* Password Change */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gray-800 rounded-lg p-6 border border-gray-700"
      >
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <FaKey className="text-yellow-400" />
          비밀번호 변경
        </h3>

        <div className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm text-gray-400 mb-2">현재 비밀번호</label>
            <input
              type="password"
              value={password.current}
              onChange={(e) => setPassword({ ...password, current: e.target.value })}
              className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm text-gray-400 mb-2">새 비밀번호</label>
            <input
              type="password"
              value={password.new}
              onChange={(e) => setPassword({ ...password, new: e.target.value })}
              className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm text-gray-400 mb-2">새 비밀번호 확인</label>
            <input
              type="password"
              value={password.confirm}
              onChange={(e) => setPassword({ ...password, confirm: e.target.value })}
              className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <button
            onClick={changePassword}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            비밀번호 변경
          </button>
        </div>
      </motion.div>

      {/* API Keys */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gray-800 rounded-lg p-6 border border-gray-700"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <FaKey className="text-purple-400" />
            API 키 관리
          </h3>
          <button
            onClick={generateNewApiKey}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg"
          >
            새 API 키 생성
          </button>
        </div>

        <div className="space-y-3">
          {apiKeys.map(key => (
            <div key={key.id} className="bg-gray-900 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="text-white font-semibold">{key.name}</h4>
                  <p className="text-gray-400 font-mono text-sm mt-1">{key.key}</p>
                  <div className="flex gap-4 mt-2 text-xs text-gray-500">
                    <span>생성: {key.created.toLocaleDateString('ko-KR')}</span>
                    {key.lastUsed && (
                      <span>마지막 사용: {key.lastUsed.toLocaleDateString('ko-KR')}</span>
                    )}
                  </div>
                  <div className="flex gap-2 mt-2">
                    {key.permissions.map(perm => (
                      <span key={perm} className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">
                        {perm}
                      </span>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => revokeApiKey(key.id)}
                  className="text-red-400 hover:text-red-300 ml-4"
                >
                  취소
                </button>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Active Devices */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gray-800 rounded-lg p-6 border border-gray-700"
      >
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <FaDesktop className="text-blue-400" />
          활성 기기
        </h3>

        <div className="space-y-3">
          {devices.map(device => (
            <div key={device.id} className="bg-gray-900 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FaDesktop className="text-gray-400 text-xl" />
                  <div>
                    <h4 className="text-white font-semibold">
                      {device.device}
                      {device.isCurrent && (
                        <span className="text-green-400 text-xs ml-2">(현재 기기)</span>
                      )}
                    </h4>
                    <p className="text-sm text-gray-400">
                      {device.browser} • {device.location}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      마지막 접속: {device.lastAccess.toLocaleString('ko-KR')}
                    </p>
                  </div>
                </div>
                {!device.isCurrent && (
                  <button
                    onClick={() => revokeDevice(device.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    접근 취소
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Email Notifications */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gray-800 rounded-lg p-6 border border-gray-700"
      >
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <FaEnvelope className="text-orange-400" />
          이메일 알림 설정
        </h3>

        <div className="space-y-4">
          {Object.entries(emailNotifications).map(([key, value]) => (
            <label key={key} className="flex items-center justify-between cursor-pointer">
              <span className="text-gray-300">
                {key === 'login' && '로그인 알림'}
                {key === 'withdrawal' && '출금 알림'}
                {key === 'apiKey' && 'API 키 변경 알림'}
                {key === 'subscription' && '구독 관련 알림'}
              </span>
              <div className="relative">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => setEmailNotifications({
                    ...emailNotifications,
                    [key]: e.target.checked
                  })}
                  className="sr-only"
                />
                <div className={`w-12 h-6 rounded-full transition-colors ${
                  value ? 'bg-blue-600' : 'bg-gray-600'
                }`}>
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    value ? 'translate-x-6' : 'translate-x-0.5'
                  } transform mt-0.5`} />
                </div>
              </div>
            </label>
          ))}
        </div>
      </motion.div>

      {/* Login History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-gray-800 rounded-lg p-6 border border-gray-700"
      >
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <FaHistory className="text-red-400" />
          로그인 기록
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-gray-700">
                <th className="pb-3 text-gray-400 font-normal">시간</th>
                <th className="pb-3 text-gray-400 font-normal">IP 주소</th>
                <th className="pb-3 text-gray-400 font-normal">위치</th>
                <th className="pb-3 text-gray-400 font-normal">기기</th>
                <th className="pb-3 text-gray-400 font-normal">상태</th>
              </tr>
            </thead>
            <tbody>
              {loginHistory.map(log => (
                <tr key={log.id} className="border-b border-gray-700/50">
                  <td className="py-3 text-white">
                    {log.timestamp.toLocaleString('ko-KR')}
                  </td>
                  <td className="py-3 text-gray-300 font-mono text-sm">
                    {log.ipAddress}
                  </td>
                  <td className="py-3 text-gray-300 flex items-center gap-1">
                    <FaGlobe className="text-gray-500" />
                    {log.location}
                  </td>
                  <td className="py-3 text-gray-300">{log.device}</td>
                  <td className="py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                      log.status === 'success'
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {log.status === 'success' ? (
                        <>
                          <FaCheckCircle />
                          성공
                        </>
                      ) : (
                        <>
                          <FaExclamationTriangle />
                          실패
                        </>
                      )}
                    </span>
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