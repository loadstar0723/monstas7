// 하이브리드 서비스 - Supabase + Go Backend 통합
// 이 서비스가 모든 기능의 중심 허브 역할

import { supabaseService } from './supabaseService'
import { goBackendService } from './goBackendService'

export interface AITradingSignal {
  // Supabase에서 관리
  user_id: string
  symbol: string

  // Go Backend에서 생성
  ai_prediction: {
    model: string
    direction: 'UP' | 'DOWN' | 'NEUTRAL'
    confidence: number
    price_target: number
    stop_loss: number
    take_profit: number
  }

  // 통합 데이터
  created_at: string
  executed: boolean
  profit_loss?: number
}

export interface HybridPortfolio {
  // Supabase 데이터
  user_data: {
    id: string
    subscription_tier: string
    total_balance: number
  }

  // Go Backend 분석
  ai_optimization: {
    recommended_allocation: Record<string, number>
    risk_score: number
    expected_return: number
    sharpe_ratio: number
  }

  // 실시간 시장 데이터 (Go Backend)
  market_data: {
    total_value_usd: number
    daily_pnl: number
    positions: any[]
  }
}

class HybridService {
  // ========== 통합 AI 트레이딩 시그널 ==========
  async getAITradingSignal(userId: string, symbol: string): Promise<AITradingSignal> {
    // 1. 사용자 권한 확인 (Supabase)
    const user = await supabaseService.getCurrentUser()
    if (!user) throw new Error('인증이 필요합니다')

    const profile = await supabaseService.getUserProfile(user.id)
    if (!profile) throw new Error('프로필을 찾을 수 없습니다')

    // 2. AI 예측 가져오기 (Go Backend)
    const aiPredictions = await goBackendService.getAllPredictions({
      symbol,
      timeframe: '1h',
      historical: [], // 실제 데이터는 Go Backend에서 자동으로 가져옴
    })

    // 3. 최적의 예측 선택 (앙상블 우선)
    const bestPrediction = aiPredictions.ensemble ||
                          aiPredictions.neural ||
                          aiPredictions.lightgbm ||
                          aiPredictions.randomforest

    if (!bestPrediction) throw new Error('AI 예측을 생성할 수 없습니다')

    // 4. 시그널 생성
    const signal: AITradingSignal = {
      user_id: user.id,
      symbol,
      ai_prediction: {
        model: bestPrediction.model,
        direction: bestPrediction.direction,
        confidence: bestPrediction.confidence,
        price_target: bestPrediction.prediction,
        stop_loss: bestPrediction.prediction * 0.95, // 5% 손절
        take_profit: bestPrediction.prediction * 1.1, // 10% 익절
      },
      created_at: new Date().toISOString(),
      executed: false,
    }

    // 5. Supabase에 시그널 저장
    await supabaseService.saveSignal({
      user_id: user.id,
      symbol,
      signal_type: bestPrediction.signal,
      confidence: bestPrediction.confidence,
    })

    return signal
  }

  // ========== 하이브리드 포트폴리오 최적화 ==========
  async getOptimizedPortfolio(userId: string): Promise<HybridPortfolio> {
    // 1. 사용자 데이터 (Supabase)
    const [user, profile, portfolio] = await Promise.all([
      supabaseService.getCurrentUser(),
      supabaseService.getUserProfile(userId),
      supabaseService.getPortfolio(userId),
    ])

    if (!user || !profile) throw new Error('사용자 정보를 찾을 수 없습니다')

    // 2. AI 포트폴리오 최적화 (Go Backend)
    const optimization = await goBackendService.optimizePortfolio({
      assets: portfolio?.assets.map(a => a.symbol) || ['BTCUSDT', 'ETHUSDT'],
      capital: portfolio?.total_value || 10000,
      risk_level: profile.subscription_tier === 'black' ? 'aggressive' : 'moderate',
    })

    // 3. 실시간 시장 데이터 (Go Backend)
    const marketData = await Promise.all(
      (portfolio?.assets || []).map(async (asset: any) => {
        const price = await goBackendService.getPrice(asset.symbol)
        return {
          ...asset,
          current_price: price.price,
          value_usd: asset.amount * price.price,
        }
      })
    )

    // 4. 통합 데이터 생성
    return {
      user_data: {
        id: user.id,
        subscription_tier: profile.subscription_tier || 'free',
        total_balance: portfolio?.total_value || 0,
      },
      ai_optimization: {
        recommended_allocation: optimization.allocation,
        risk_score: optimization.risk_score,
        expected_return: optimization.expected_return,
        sharpe_ratio: optimization.sharpe_ratio,
      },
      market_data: {
        total_value_usd: marketData.reduce((sum, a) => sum + a.value_usd, 0),
        daily_pnl: marketData.reduce((sum, a) => sum + (a.value_usd - a.cost_basis), 0),
        positions: marketData,
      },
    }
  }

  // ========== 실시간 알림 통합 ==========
  async setupRealtimeAlerts(userId: string) {
    // 1. Supabase 실시간 구독 (사용자 데이터 변경)
    const userChannel = supabaseService.subscribeToUserChanges(userId, (payload) => {
      console.log('사용자 데이터 변경:', payload)
    })

    // 2. Go Backend WebSocket (시장 데이터)
    goBackendService.connectWebSocket(
      (data) => {
        console.log('실시간 시장 데이터:', data)
        // 가격 알림 로직
        this.checkPriceAlerts(userId, data)
      },
      (error) => console.error('WebSocket 에러:', error),
      (event) => console.log('WebSocket 종료:', event)
    )

    return {
      userChannel,
      unsubscribe: () => {
        userChannel.unsubscribe()
        goBackendService.disconnectWebSocket()
      },
    }
  }

  // ========== 백테스팅 통합 ==========
  async runBacktest(userId: string, strategy: any) {
    // 1. 사용자 권한 확인 (Supabase)
    const profile = await supabaseService.getUserProfile(userId)

    // Premium 이상만 백테스팅 가능
    const premiumTiers = ['platinum', 'diamond', 'black']
    if (!profile || !premiumTiers.includes(profile.subscription_tier || '')) {
      throw new Error('백테스팅은 Premium 구독자만 사용 가능합니다')
    }

    // 2. Go Backend에서 백테스팅 실행
    const backtest = await fetch('/api/go-backend/backtesting/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(strategy),
    }).then(r => r.json())

    // 3. 결과를 Supabase에 저장
    await supabaseService.saveTrade({
      user_id: userId,
      type: 'backtest',
      strategy: strategy.name,
      result: backtest,
      created_at: new Date().toISOString(),
    })

    return backtest
  }

  // ========== 자동 트레이딩 봇 ==========
  async startTradingBot(userId: string, config: any) {
    // 1. Black 등급만 가능 (Supabase)
    const profile = await supabaseService.getUserProfile(userId)
    if (profile?.subscription_tier !== 'black') {
      throw new Error('자동 트레이딩은 Black 등급 전용입니다')
    }

    // 2. Go Backend에 봇 시작 요청
    const bot = await fetch('/api/go-backend/trading/bot/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: userId,
        config,
      }),
    }).then(r => r.json())

    // 3. 봇 상태 실시간 모니터링
    const botChannel = supabaseService.subscribeToUserChanges(userId, async (payload) => {
      if (payload.new.bot_active) {
        // 봇 실행 중 상태 업데이트
        const status = await fetch(`/api/go-backend/trading/bot/status/${userId}`)
          .then(r => r.json())
        console.log('봇 상태:', status)
      }
    })

    return {
      bot_id: bot.id,
      status: 'running',
      channel: botChannel,
    }
  }

  // ========== 가격 알림 체크 ==========
  private async checkPriceAlerts(userId: string, marketData: any) {
    const settings = await supabaseService.getNotificationSettings(userId)
    if (!settings?.price_alerts) return

    for (const alert of settings.price_alerts) {
      if (marketData.symbol === alert.symbol) {
        if (marketData.price >= alert.target_price && alert.direction === 'up') {
          // 알림 발송
          console.log(`🔔 가격 알림: ${alert.symbol} 목표가 도달!`)
        } else if (marketData.price <= alert.target_price && alert.direction === 'down') {
          console.log(`🔔 가격 알림: ${alert.symbol} 목표가 도달!`)
        }
      }
    }
  }

  // ========== 구독 등급별 기능 제한 ==========
  async checkFeatureAccess(userId: string, feature: string): Promise<boolean> {
    const profile = await supabaseService.getUserProfile(userId)
    const tier = profile?.subscription_tier || 'free'

    const featureMatrix: Record<string, string[]> = {
      free: ['basic_signals', 'price_chart'],
      silver: ['basic_signals', 'price_chart', 'technical_indicators'],
      gold: ['basic_signals', 'price_chart', 'technical_indicators', 'ai_predictions'],
      platinum: ['basic_signals', 'price_chart', 'technical_indicators', 'ai_predictions', 'backtesting'],
      diamond: ['basic_signals', 'price_chart', 'technical_indicators', 'ai_predictions', 'backtesting', 'portfolio_optimization'],
      black: ['all'], // 모든 기능
    }

    const allowedFeatures = featureMatrix[tier] || []
    return allowedFeatures.includes('all') || allowedFeatures.includes(feature)
  }

  // ========== 시스템 상태 모니터링 ==========
  async getSystemHealth() {
    const [supabaseHealth, goBackendHealth] = await Promise.all([
      // Supabase 헬스체크
      fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/health`)
        .then(r => ({ supabase: r.ok ? 'healthy' : 'unhealthy' }))
        .catch(() => ({ supabase: 'error' })),

      // Go Backend 헬스체크
      goBackendService.getHealth()
        .then(() => ({ go_backend: 'healthy' }))
        .catch(() => ({ go_backend: 'error' })),
    ])

    return {
      ...supabaseHealth,
      ...goBackendHealth,
      timestamp: new Date().toISOString(),
    }
  }
}

// 싱글톤 인스턴스
export const hybridService = new HybridService()

// Hook용 export
export function useHybridService() {
  return hybridService
}