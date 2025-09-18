// Supabase Service - 하이브리드 아키텍처
// 역할: 사용자 인증, 프로필, 구독, 실시간 데이터

import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

export interface UserProfile {
  id: string
  email: string
  username?: string
  subscription_tier?: 'free' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'black'
  created_at: string
  updated_at: string
}

export interface TradingSignal {
  id: string
  user_id: string
  symbol: string
  signal_type: string
  confidence: number
  created_at: string
}

export interface Portfolio {
  id: string
  user_id: string
  assets: any[]
  total_value: number
  performance: number
  updated_at: string
}

class SupabaseService {
  private supabase = createClient()

  // ========== 인증 관련 (Supabase 담당) ==========
  async signUp(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
    })
    if (error) throw error
    return data
  }

  async signIn(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
    return data
  }

  async signOut() {
    const { error } = await this.supabase.auth.signOut()
    if (error) throw error
  }

  async getCurrentUser(): Promise<User | null> {
    const { data: { user } } = await this.supabase.auth.getUser()
    return user
  }

  async resetPassword(email: string) {
    const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })
    if (error) throw error
  }

  // OAuth 소셜 로그인
  async signInWithOAuth(provider: 'google' | 'github' | 'discord') {
    const { error } = await this.supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) throw error
  }

  // ========== 사용자 프로필 (Supabase 담당) ==========
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Error fetching profile:', error)
      return null
    }
    return data
  }

  async updateUserProfile(userId: string, updates: Partial<UserProfile>) {
    const { data, error } = await this.supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // ========== 구독 관리 (Supabase 담당) ==========
  async getUserSubscription(userId: string) {
    const { data, error } = await this.supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) {
      console.error('Subscription fetch error:', error)
      return null
    }
    return data
  }

  async updateSubscription(userId: string, tier: string) {
    const { data, error } = await this.supabase
      .from('subscriptions')
      .upsert({
        user_id: userId,
        tier,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  // ========== 트레이딩 시그널 저장 (Supabase 담당) ==========
  async saveSignal(signal: Omit<TradingSignal, 'id' | 'created_at'>) {
    const { data, error } = await this.supabase
      .from('trading_signals')
      .insert(signal)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async getUserSignals(userId: string, limit = 50) {
    const { data, error } = await this.supabase
      .from('trading_signals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data
  }

  // ========== 포트폴리오 관리 (Supabase 담당) ==========
  async getPortfolio(userId: string): Promise<Portfolio | null> {
    const { data, error } = await this.supabase
      .from('portfolios')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) {
      console.error('Portfolio fetch error:', error)
      return null
    }
    return data
  }

  async updatePortfolio(userId: string, portfolio: Partial<Portfolio>) {
    const { data, error } = await this.supabase
      .from('portfolios')
      .upsert({
        user_id: userId,
        ...portfolio,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  // ========== 실시간 구독 (Supabase Realtime) ==========
  subscribeToUserChanges(userId: string, callback: (payload: any) => void) {
    return this.supabase
      .channel(`user:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${userId}`,
        },
        callback
      )
      .subscribe()
  }

  subscribeToSignals(callback: (payload: any) => void) {
    return this.supabase
      .channel('signals')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'trading_signals',
        },
        callback
      )
      .subscribe()
  }

  subscribeToPortfolio(userId: string, callback: (payload: any) => void) {
    return this.supabase
      .channel(`portfolio:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'portfolios',
          filter: `user_id=eq.${userId}`,
        },
        callback
      )
      .subscribe()
  }

  // ========== 알림 설정 (Supabase 담당) ==========
  async getNotificationSettings(userId: string) {
    const { data, error } = await this.supabase
      .from('notification_settings')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) return null
    return data
  }

  async updateNotificationSettings(userId: string, settings: any) {
    const { data, error } = await this.supabase
      .from('notification_settings')
      .upsert({
        user_id: userId,
        ...settings,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  // ========== 거래 이력 (Supabase 담당) ==========
  async saveTrade(trade: any) {
    const { data, error } = await this.supabase
      .from('trades')
      .insert(trade)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async getUserTrades(userId: string, limit = 100) {
    const { data, error } = await this.supabase
      .from('trades')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data
  }

  // ========== 세션 관리 ==========
  onAuthStateChange(callback: (event: any, session: any) => void) {
    return this.supabase.auth.onAuthStateChange(callback)
  }

  async getSession() {
    const { data: { session } } = await this.supabase.auth.getSession()
    return session
  }

  // ========== Row Level Security Helper ==========
  async checkPermission(userId: string, resource: string): Promise<boolean> {
    // RLS가 Supabase에서 자동으로 처리됨
    // 추가 권한 체크가 필요한 경우 여기에 구현
    return true
  }
}

// 싱글톤 인스턴스
export const supabaseService = new SupabaseService()

// Hook용 export
export function useSupabase() {
  return supabaseService
}