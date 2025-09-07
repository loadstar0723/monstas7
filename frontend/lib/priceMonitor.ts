/**
 * 실시간 가격 모니터링 서비스
 * WebSocket 데이터를 받아 알림 조건을 체크하고 알림 발송
 */

import WebSocketManager from './websocketManager'
import NotificationService from './notificationService'

interface PriceAlert {
  id: number
  symbol: string
  settings: {
    priceAbove: string
    priceBelow: string
    percentChange: string
    volumeSpike: boolean
    whaleAlert: boolean
    notificationChannels: {
      telegram: boolean
      email: boolean
      push: boolean
    }
  }
  createdAt: string
  active: boolean
  lastTriggered?: string
}

interface PriceHistory {
  symbol: string
  prices: number[]
  volumes: number[]
  timestamp: number[]
}

export class PriceMonitorService {
  private static instance: PriceMonitorService
  private wsManager: WebSocketManager
  private notificationService: NotificationService
  private alerts: PriceAlert[] = []
  private priceHistory: Map<string, PriceHistory> = new Map()
  private monitoringInterval: NodeJS.Timeout | null = null
  private lastPrices: Map<string, number> = new Map()
  private triggeredAlerts: Set<string> = new Set() // 중복 알림 방지

  private constructor() {
    this.wsManager = WebSocketManager.getInstance()
    this.notificationService = NotificationService.getInstance()
    this.loadAlerts()
    this.startMonitoring()
  }

  static getInstance(): PriceMonitorService {
    if (!PriceMonitorService.instance) {
      PriceMonitorService.instance = new PriceMonitorService()
    }
    return PriceMonitorService.instance
  }

  /**
   * localStorage에서 알림 설정 로드
   */
  private loadAlerts() {
    if (typeof window === 'undefined') return
    
    try {
      const saved = localStorage.getItem('priceAlerts')
      if (saved) {
        const parsed = JSON.parse(saved)
        // 배열인지 확인하고, 배열이 아니면 빈 배열로 초기화
        if (Array.isArray(parsed)) {
          this.alerts = parsed
          console.log(`${this.alerts.length}개의 알림 설정 로드됨`)
        } else {
          // 기존 데이터가 배열이 아닌 경우 초기화
          this.alerts = []
          localStorage.setItem('priceAlerts', '[]')
          console.log('알림 설정 초기화됨')
        }
      }
    } catch (error) {
      console.error('알림 설정 로드 실패:', error)
      this.alerts = []
      localStorage.setItem('priceAlerts', '[]')
    }
  }

  /**
   * 알림 설정 저장
   */
  saveAlerts() {
    if (typeof window === 'undefined') return
    
    try {
      localStorage.setItem('priceAlerts', JSON.stringify(this.alerts))
    } catch (error) {
      console.error('알림 설정 저장 실패:', error)
    }
  }

  /**
   * 새 알림 추가
   */
  addAlert(alert: Omit<PriceAlert, 'id' | 'createdAt' | 'active'>) {
    const newAlert: PriceAlert = {
      ...alert,
      id: Date.now(),
      createdAt: new Date().toISOString(),
      active: true
    }
    
    this.alerts.push(newAlert)
    this.saveAlerts()
    
    // Push 알림 권한 요청
    if (alert.settings.notificationChannels.push) {
      this.notificationService.requestPermission()
    }
    
    return newAlert
  }

  /**
   * 알림 삭제
   */
  removeAlert(id: number) {
    this.alerts = this.alerts.filter(alert => alert.id !== id)
    this.saveAlerts()
  }

  /**
   * 알림 활성/비활성
   */
  toggleAlert(id: number) {
    const alert = this.alerts.find(a => a.id === id)
    if (alert) {
      alert.active = !alert.active
      this.saveAlerts()
    }
  }

  /**
   * 실시간 모니터링 시작
   */
  private startMonitoring() {
    // WebSocket 데이터 구독
    this.wsManager.subscribe((data) => {
      data.prices.forEach(price => {
        this.updatePriceHistory(price.symbol, price.price, price.volume24h)
        this.checkAlerts(price.symbol, price.price, price.change24h, price.volume24h)
      })
    })

    // 5초마다 알림 체크 (WebSocket이 끊어진 경우 대비)
    this.monitoringInterval = setInterval(() => {
      this.checkAllAlerts()
    }, 5000)
  }

  /**
   * 가격 히스토리 업데이트
   */
  private updatePriceHistory(symbol: string, price: number, volume: number) {
    if (!this.priceHistory.has(symbol)) {
      this.priceHistory.set(symbol, {
        symbol,
        prices: [],
        volumes: [],
        timestamp: []
      })
    }

    const history = this.priceHistory.get(symbol)!
    history.prices.push(price)
    history.volumes.push(volume)
    history.timestamp.push(Date.now())

    // 최근 100개만 유지
    if (history.prices.length > 100) {
      history.prices.shift()
      history.volumes.shift()
      history.timestamp.shift()
    }

    // 이전 가격 저장
    this.lastPrices.set(symbol, price)
  }

  /**
   * 알림 조건 체크
   */
  private checkAlerts(symbol: string, currentPrice: number, change24h: number, volume: number) {
    const relevantAlerts = this.alerts.filter(
      alert => alert.active && alert.symbol === symbol
    )

    relevantAlerts.forEach(alert => {
      const alertKey = `${alert.id}-${symbol}`
      
      // 5분 내 중복 알림 방지
      if (this.triggeredAlerts.has(alertKey)) {
        const lastTrigger = alert.lastTriggered ? new Date(alert.lastTriggered).getTime() : 0
        if (Date.now() - lastTrigger < 5 * 60 * 1000) {
          return
        }
      }

      let triggered = false
      let condition = ''

      // 가격 상승 알림
      if (alert.settings.priceAbove && currentPrice >= parseFloat(alert.settings.priceAbove)) {
        triggered = true
        condition = 'above'
        
        // 브라우저 푸시 알림
        if (alert.settings.notificationChannels.push) {
          this.notificationService.showPriceAlert(
            symbol,
            currentPrice,
            'above',
            parseFloat(alert.settings.priceAbove)
          )
        }
        
        // 텔레그램 알림
        if (alert.settings.notificationChannels.telegram) {
          this.sendTelegramNotification({
            type: 'price_alert',
            symbol,
            currentPrice,
            condition: 'above',
            targetPrice: parseFloat(alert.settings.priceAbove),
            change: change24h
          })
        }
        
        // 이메일 알림
        if (alert.settings.notificationChannels.email) {
          this.sendEmailNotification({
            type: 'price_alert',
            symbol,
            currentPrice,
            condition: 'above',
            targetPrice: parseFloat(alert.settings.priceAbove),
            change: change24h
          })
        }
      }

      // 가격 하락 알림
      if (alert.settings.priceBelow && currentPrice <= parseFloat(alert.settings.priceBelow)) {
        triggered = true
        condition = 'below'
        
        // 브라우저 푸시 알림
        if (alert.settings.notificationChannels.push) {
          this.notificationService.showPriceAlert(
            symbol,
            currentPrice,
            'below',
            parseFloat(alert.settings.priceBelow)
          )
        }
        
        // 텔레그램 알림
        if (alert.settings.notificationChannels.telegram) {
          this.sendTelegramNotification({
            type: 'price_alert',
            symbol,
            currentPrice,
            condition: 'below',
            targetPrice: parseFloat(alert.settings.priceBelow),
            change: change24h
          })
        }
        
        // 이메일 알림
        if (alert.settings.notificationChannels.email) {
          this.sendEmailNotification({
            type: 'price_alert',
            symbol,
            currentPrice,
            condition: 'below',
            targetPrice: parseFloat(alert.settings.priceBelow),
            change: change24h
          })
        }
      }

      // 급등/급락 알림
      const percentThreshold = parseFloat(alert.settings.percentChange)
      if (percentThreshold && Math.abs(change24h) >= percentThreshold) {
        triggered = true
        condition = 'percentChange'
        
        // 브라우저 푸시 알림
        if (alert.settings.notificationChannels.push) {
          this.notificationService.showPriceAlert(
            symbol,
            currentPrice,
            'percentChange'
          )
        }
        
        // 텔레그램 알림
        if (alert.settings.notificationChannels.telegram) {
          this.sendTelegramNotification({
            type: 'price_alert',
            symbol,
            currentPrice,
            condition: 'percentChange',
            change: change24h
          })
        }
        
        // 이메일 알림
        if (alert.settings.notificationChannels.email) {
          this.sendEmailNotification({
            type: 'price_alert',
            symbol,
            currentPrice,
            condition: 'percentChange',
            change: change24h
          })
        }
      }

      // 거래량 급증 알림
      if (alert.settings.volumeSpike) {
        const history = this.priceHistory.get(symbol)
        if (history && history.volumes.length > 10) {
          const avgVolume = history.volumes.slice(-10).reduce((a, b) => a + b, 0) / 10
          const volumeIncrease = ((volume - avgVolume) / avgVolume) * 100
          
          if (volumeIncrease >= 200) {
            triggered = true
            
            // 브라우저 푸시 알림
            if (alert.settings.notificationChannels.push) {
              this.notificationService.showVolumeAlert(symbol, Math.round(volumeIncrease))
            }
            
            // 텔레그램 알림
            if (alert.settings.notificationChannels.telegram) {
              this.sendTelegramNotification({
                type: 'volume_alert',
                symbol,
                volumeIncrease: Math.round(volumeIncrease)
              })
            }
            
            // 이메일 알림
            if (alert.settings.notificationChannels.email) {
              this.sendEmailNotification({
                type: 'volume_alert',
                symbol,
                volumeIncrease: Math.round(volumeIncrease)
              })
            }
          }
        }
      }

      // 고래 활동 알림 (시뮬레이션 - 실제로는 order book 데이터 필요)
      if (alert.settings.whaleAlert) {
        const priceChange = this.calculatePriceChange(symbol, currentPrice)
        if (Math.abs(priceChange) > 0.5) { // 0.5% 이상 급변동
          const amount = volume * currentPrice
          if (amount > 1000000) { // $1M 이상
            triggered = true
            
            // 브라우저 푸시 알림
            if (alert.settings.notificationChannels.push) {
              this.notificationService.showWhaleAlert(
                symbol,
                amount,
                priceChange > 0 ? 'buy' : 'sell'
              )
            }
            
            // 텔레그램 알림
            if (alert.settings.notificationChannels.telegram) {
              this.sendTelegramNotification({
                type: 'whale_alert',
                symbol,
                amount,
                side: priceChange > 0 ? 'buy' : 'sell'
              })
            }
            
            // 이메일 알림
            if (alert.settings.notificationChannels.email) {
              this.sendEmailNotification({
                type: 'whale_alert',
                symbol,
                amount,
                side: priceChange > 0 ? 'buy' : 'sell'
              })
            }
          }
        }
      }

      // 알림 트리거 기록
      if (triggered) {
        this.triggeredAlerts.add(alertKey)
        alert.lastTriggered = new Date().toISOString()
        this.saveAlerts()
        
        // 5분 후 리셋
        setTimeout(() => {
          this.triggeredAlerts.delete(alertKey)
        }, 5 * 60 * 1000)
      }
    })
  }

  /**
   * 가격 변화율 계산
   */
  private calculatePriceChange(symbol: string, currentPrice: number): number {
    const lastPrice = this.lastPrices.get(symbol)
    if (!lastPrice) return 0
    
    return ((currentPrice - lastPrice) / lastPrice) * 100
  }

  /**
   * 텔레그램 알림 전송
   */
  private async sendTelegramNotification(message: any) {
    try {
      const response = await fetch('/api/notifications/telegram', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message })
      })
      
      if (!response.ok) {
        console.error('텔레그램 알림 전송 실패:', await response.text())
      } else {
        console.log('텔레그램 알림 전송 성공')
      }
    } catch (error) {
      console.error('텔레그램 알림 오류:', error)
    }
  }

  /**
   * 이메일 알림 전송
   */
  private async sendEmailNotification(message: any) {
    try {
      const response = await fetch('/api/notifications/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          subject: `💰 MONSTA Trading - ${message.symbol} 알림`,
          message,
          type: message.type
        })
      })
      
      if (!response.ok) {
        console.error('이메일 알림 전송 실패:', await response.text())
      } else {
        console.log('이메일 알림 전송 성공')
      }
    } catch (error) {
      console.error('이메일 알림 오류:', error)
    }
  }

  /**
   * 모든 알림 체크 (수동)
   */
  checkAllAlerts() {
    const prices = Array.from(this.lastPrices.entries())
    prices.forEach(([symbol, price]) => {
      const history = this.priceHistory.get(symbol)
      if (history && history.volumes.length > 0) {
        const lastVolume = history.volumes[history.volumes.length - 1]
        this.checkAlerts(symbol, price, 0, lastVolume)
      }
    })
  }

  /**
   * 알림 목록 가져오기
   */
  getAlerts(): PriceAlert[] {
    return this.alerts
  }

  /**
   * 활성 알림 개수
   */
  getActiveAlertCount(): number {
    return this.alerts.filter(alert => alert.active).length
  }

  /**
   * 모니터링 중지
   */
  stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval)
      this.monitoringInterval = null
    }
  }
}

export default PriceMonitorService