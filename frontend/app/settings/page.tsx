'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { FaCog, FaBell, FaShieldAlt, FaPalette, FaGlobe, FaKey } from 'react-icons/fa'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general')

  const tabs = [
    { id: 'general', label: '일반', icon: FaCog },
    { id: 'notification', label: '알림', icon: FaBell },
    { id: 'security', label: '보안', icon: FaShieldAlt },
    { id: 'appearance', label: '외관', icon: FaPalette },
    { id: 'language', label: '언어', icon: FaGlobe },
    { id: 'api', label: 'API 키', icon: FaKey },
  ]

  return (
    <div className="min-h-screen p-8">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-7xl mx-auto"
      >
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold gradient-text mb-2">설정</h1>
          <p className="text-gray-400">플랫폼 설정 및 환경 구성</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 탭 메뉴 */}
          <div className="lg:col-span-1">
            <div className="glass-card p-4">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all mb-2 ${
                      activeTab === tab.id 
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white' 
                        : 'hover:bg-gray-800 text-gray-400 hover:text-white'
                    }`}
                  >
                    <Icon size={18} />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* 설정 내용 */}
          <div className="lg:col-span-3">
            <motion.div 
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-card p-6"
            >
              {activeTab === 'general' && (
                <div>
                  <h2 className="text-xl font-bold mb-6">일반 설정</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        기본 거래소
                      </label>
                      <select className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white">
                        <option>Binance</option>
                        <option>Upbit</option>
                        <option>Bybit</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        기본 통화
                      </label>
                      <select className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white">
                        <option>USD</option>
                        <option>KRW</option>
                        <option>EUR</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        시간대
                      </label>
                      <select className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white">
                        <option>Seoul (UTC+9)</option>
                        <option>Tokyo (UTC+9)</option>
                        <option>New York (UTC-5)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'notification' && (
                <div>
                  <h2 className="text-xl font-bold mb-6">알림 설정</h2>
                  
                  <div className="space-y-4">
                    <label className="flex items-center justify-between">
                      <span className="text-gray-300">가격 알림</span>
                      <input type="checkbox" className="toggle" defaultChecked />
                    </label>
                    
                    <label className="flex items-center justify-between">
                      <span className="text-gray-300">거래 체결 알림</span>
                      <input type="checkbox" className="toggle" defaultChecked />
                    </label>

                    <label className="flex items-center justify-between">
                      <span className="text-gray-300">뉴스 알림</span>
                      <input type="checkbox" className="toggle" />
                    </label>

                    <label className="flex items-center justify-between">
                      <span className="text-gray-300">시스템 알림</span>
                      <input type="checkbox" className="toggle" defaultChecked />
                    </label>
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div>
                  <h2 className="text-xl font-bold mb-6">보안 설정</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        2단계 인증
                      </label>
                      <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all">
                        2FA 활성화
                      </button>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        비밀번호 변경
                      </label>
                      <button className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-all">
                        비밀번호 변경
                      </button>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        활동 로그
                      </label>
                      <button className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-all">
                        로그 보기
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'appearance' && (
                <div>
                  <h2 className="text-xl font-bold mb-6">외관 설정</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        테마
                      </label>
                      <select className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white">
                        <option>다크 모드</option>
                        <option>라이트 모드</option>
                        <option>자동</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        색상 테마
                      </label>
                      <div className="flex gap-2">
                        <button className="w-8 h-8 bg-purple-600 rounded"></button>
                        <button className="w-8 h-8 bg-blue-600 rounded"></button>
                        <button className="w-8 h-8 bg-green-600 rounded"></button>
                        <button className="w-8 h-8 bg-red-600 rounded"></button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'language' && (
                <div>
                  <h2 className="text-xl font-bold mb-6">언어 설정</h2>
                  
                  <div className="space-y-4">
                    <label className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-700">
                      <input type="radio" name="language" defaultChecked />
                      <span>한국어 🇰🇷</span>
                    </label>
                    
                    <label className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-700">
                      <input type="radio" name="language" />
                      <span>English 🇺🇸</span>
                    </label>

                    <label className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-700">
                      <input type="radio" name="language" />
                      <span>日本語 🇯🇵</span>
                    </label>

                    <label className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-700">
                      <input type="radio" name="language" />
                      <span>中文 🇨🇳</span>
                    </label>
                  </div>
                </div>
              )}

              {activeTab === 'api' && (
                <div>
                  <h2 className="text-xl font-bold mb-6">API 키 설정</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Binance API Key
                      </label>
                      <input 
                        type="password" 
                        placeholder="API Key 입력"
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Binance Secret Key
                      </label>
                      <input 
                        type="password" 
                        placeholder="Secret Key 입력"
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
                      />
                    </div>

                    <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                      <p className="text-sm text-yellow-400">
                        ⚠️ API 키는 안전하게 암호화되어 저장됩니다. 
                        절대 타인과 공유하지 마세요.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* 저장 버튼 */}
              <div className="mt-8 flex justify-end gap-3">
                <button className="px-6 py-2 bg-gray-800 text-white font-medium rounded-lg hover:bg-gray-700 transition-all">
                  취소
                </button>
                <button className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all">
                  저장
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}