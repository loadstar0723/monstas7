/**
 * 브라우저 알림 서비스
 * Push Notification API를 사용한 실시간 알림
 */

export class NotificationService {
  private static instance: NotificationService
  private permission: NotificationPermission = 'default'
  
  private constructor() {
    this.checkPermission()
  }

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService()
    }
    return NotificationService.instance
  }

  /**
   * 알림 권한 확인
   */
  private checkPermission() {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      this.permission = Notification.permission
    }
  }

  /**
   * 알림 권한 요청
   */
  async requestPermission(): Promise<boolean> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return false
    }

    try {
      const permission = await Notification.requestPermission()
      this.permission = permission
      return permission === 'granted'
    } catch (error) {
      console.error('알림 권한 요청 실패:', error)
      return false
    }
  }

  /**
   * 알림 표시
   */
  async showNotification(title: string, options?: NotificationOptions): Promise<void> {
    if (this.permission !== 'granted') {
      const granted = await this.requestPermission()
      if (!granted) {
        return
      }
    }

    try {
      const notification = new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        vibrate: [200, 100, 200],
        requireInteraction: false,
        ...options
      })

      // 알림 클릭 시 포커스
      notification.onclick = () => {
        window.focus()
        notification.close()
      }

      // 5초 후 자동 닫기
      setTimeout(() => notification.close(), 5000)
    } catch (error) {
      console.error('알림 표시 실패:', error)
    }
  }

  /**
   * 가격 알림 표시
   */
  showPriceAlert(symbol: string, currentPrice: number, condition: string, targetPrice?: number) {
    const title = `💰 ${symbol} 가격 알림`
    
    let body = ''
    switch (condition) {
      case 'above':
        body = `${symbol}이(가) $${targetPrice?.toLocaleString()}를 돌파했습니다!\n현재가: $${currentPrice.toLocaleString()}`
        break
      case 'below':
        body = `${symbol}이(가) $${targetPrice?.toLocaleString()} 아래로 떨어졌습니다!\n현재가: $${currentPrice.toLocaleString()}`
        break
      case 'percentChange':
        body = `${symbol} 급등/급락 감지!\n현재가: $${currentPrice.toLocaleString()}`
        break
      default:
        body = `현재가: $${currentPrice.toLocaleString()}`
    }

    this.showNotification(title, {
      body,
      tag: `price-alert-${symbol}`,
      renotify: true,
      data: { symbol, currentPrice, condition }
    })
  }

  /**
   * 고래 활동 알림
   */
  showWhaleAlert(symbol: string, amount: number, type: 'buy' | 'sell') {
    const title = `🐋 ${symbol} 고래 활동 감지`
    const body = `$${(amount / 1000000).toFixed(2)}M 규모의 대규모 ${type === 'buy' ? '매수' : '매도'} 포착!`

    this.showNotification(title, {
      body,
      tag: `whale-alert-${symbol}`,
      renotify: true,
      icon: type === 'buy' ? '📈' : '📉'
    })
  }

  /**
   * 거래량 급증 알림
   */
  showVolumeAlert(symbol: string, volumeIncrease: number) {
    const title = `📊 ${symbol} 거래량 급증`
    const body = `평균 대비 ${volumeIncrease}% 증가!\n비정상적인 거래 활동이 감지되었습니다.`

    this.showNotification(title, {
      body,
      tag: `volume-alert-${symbol}`,
      renotify: true
    })
  }

  /**
   * 진입 신호 알림
   */
  showEntrySignal(symbol: string, signal: 'buy' | 'sell', confidence: number) {
    const title = `🎯 ${symbol} ${signal === 'buy' ? '매수' : '매도'} 신호`
    const body = `AI 신뢰도: ${confidence}%\n지금이 진입 타이밍입니다!`

    this.showNotification(title, {
      body,
      tag: `entry-signal-${symbol}`,
      renotify: true,
      requireInteraction: true, // 사용자가 직접 닫을 때까지 유지
      actions: [
        { action: 'view', title: '차트 보기' },
        { action: 'dismiss', title: '닫기' }
      ]
    })
  }

  /**
   * 알림 권한 상태 확인
   */
  isPermissionGranted(): boolean {
    return this.permission === 'granted'
  }

  /**
   * 알림 지원 여부 확인
   */
  isSupported(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window
  }
}

export default NotificationService