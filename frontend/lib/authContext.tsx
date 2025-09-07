'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

export type SubscriptionTier = 'Starter' | 'Advance' | 'Platinum' | 'Signature' | 'Ultimate' | 'Infinity'

interface User {
  id: string
  email: string
  name: string
  tier: SubscriptionTier
  role: 'subscriber' | 'agency' | 'distributor' | 'headquarters'
}

interface AuthContextType {
  user: User | null
  tier: SubscriptionTier
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  canAccess: (requiredTier: SubscriptionTier) => boolean
  setUserTier: (tier: SubscriptionTier) => void
}

const tierLevels: Record<SubscriptionTier, number> = {
  'Starter': 1,
  'Advance': 2,
  'Platinum': 3,
  'Signature': 4,
  'Ultimate': 5,
  'Infinity': 6
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // 기본값을 Infinity로 설정 (개발/테스트용)
  const [user, setUser] = useState<User | null>({
    id: 'dev-user',
    email: 'admin@monsta.ai',
    name: 'MONSTA Admin',
    tier: 'Infinity',
    role: 'headquarters'
  })

  const [tier, setTier] = useState<SubscriptionTier>('Infinity')

  useEffect(() => {
    // localStorage에서 사용자 정보 복원
    const savedUser = localStorage.getItem('monsta_user')
    if (savedUser) {
      const userData = JSON.parse(savedUser)
      setUser(userData)
      setTier(userData.tier)
    } else {
      // 개발 모드에서는 Infinity 등급 유지
      const devUser = {
        id: 'dev-user',
        email: 'admin@monsta.ai',
        name: 'MONSTA Admin',
        tier: 'Infinity' as SubscriptionTier,
        role: 'headquarters' as const
      }
      setUser(devUser)
      setTier('Infinity')
      localStorage.setItem('monsta_user', JSON.stringify(devUser))
    }
  }, [])

  const login = async (email: string, password: string) => {
    // 실제로는 API 호출
    // 임시로 최고 등급 사용자 설정
    const newUser: User = {
      id: 'user-1',
      email,
      name: email.split('@')[0],
      tier: 'Infinity',
      role: 'headquarters'
    }
    setUser(newUser)
    setTier(newUser.tier)
    localStorage.setItem('monsta_user', JSON.stringify(newUser))
  }

  const logout = () => {
    setUser(null)
    setTier('Starter')
    localStorage.removeItem('monsta_user')
  }

  const canAccess = (requiredTier: SubscriptionTier): boolean => {
    const currentLevel = tierLevels[tier]
    const requiredLevel = tierLevels[requiredTier]
    return currentLevel >= requiredLevel
  }

  const setUserTier = (newTier: SubscriptionTier) => {
    setTier(newTier)
    if (user) {
      const updatedUser = { ...user, tier: newTier }
      setUser(updatedUser)
      localStorage.setItem('monsta_user', JSON.stringify(updatedUser))
    }
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      tier, 
      login, 
      logout, 
      canAccess,
      setUserTier
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// 등급별 접근 제한 HOC
export function withTierAccess<P extends object>(
  Component: React.ComponentType<P>,
  requiredTier: SubscriptionTier
) {
  return function TierProtectedComponent(props: P) {
    const { canAccess, tier } = useAuth()
    
    if (!canAccess(requiredTier)) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-black">
          <div className="text-center p-8 bg-gray-800 rounded-xl border border-gray-700">
            <h2 className="text-2xl font-bold text-red-400 mb-4">
              접근 제한
            </h2>
            <p className="text-gray-300 mb-4">
              이 기능은 <span className="font-bold text-yellow-400">{requiredTier}</span> 등급 이상만 사용 가능합니다.
            </p>
            <p className="text-gray-400 mb-6">
              현재 등급: <span className="font-bold">{tier}</span>
            </p>
            <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-bold hover:from-purple-700 hover:to-pink-700 transition-all">
              업그레이드하기
            </button>
          </div>
        </div>
      )
    }
    
    return <Component {...props} />
  }
}