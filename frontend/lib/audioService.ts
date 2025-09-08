// 오디오 알림 서비스
class AudioService {
  private audioContext: AudioContext | null = null
  private isEnabled: boolean = false

  constructor() {
    // 브라우저 환경에서만 초기화
    if (typeof window !== 'undefined') {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      // 로컬스토리지에서 설정 불러오기
      const savedSettings = localStorage.getItem('alertSettings')
      if (savedSettings) {
        const settings = JSON.parse(savedSettings)
        this.isEnabled = settings.sound || false
      }
    }
  }

  // 알림 소리 재생 (비프음)
  playNotification(type: 'whale' | 'price' | 'volume' | 'pattern' = 'whale') {
    if (!this.isEnabled || !this.audioContext) return

    const oscillator = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(this.audioContext.destination)

    // 알림 타입별 다른 소리
    switch(type) {
      case 'whale':
        // 고래 거래: 낮은음 -> 높은음
        oscillator.frequency.setValueAtTime(300, this.audioContext.currentTime)
        oscillator.frequency.exponentialRampToValueAtTime(600, this.audioContext.currentTime + 0.1)
        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5)
        break
      case 'price':
        // 가격 알림: 높은음 두번
        oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime)
        oscillator.frequency.setValueAtTime(0, this.audioContext.currentTime + 0.1)
        oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime + 0.2)
        gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3)
        break
      case 'volume':
        // 거래량 알림: 중간음 지속
        oscillator.frequency.setValueAtTime(500, this.audioContext.currentTime)
        gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.4)
        break
      case 'pattern':
        // 패턴 알림: 3음 계단
        oscillator.frequency.setValueAtTime(400, this.audioContext.currentTime)
        oscillator.frequency.setValueAtTime(500, this.audioContext.currentTime + 0.1)
        oscillator.frequency.setValueAtTime(600, this.audioContext.currentTime + 0.2)
        gainNode.gain.setValueAtTime(0.25, this.audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3)
        break
    }

    oscillator.type = 'sine'
    oscillator.start(this.audioContext.currentTime)
    oscillator.stop(this.audioContext.currentTime + 0.5)
  }

  // 테스트 사운드 재생
  playTest() {
    if (!this.audioContext) return

    // AudioContext가 suspended 상태면 resume
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume()
    }

    const tempEnabled = this.isEnabled
    this.isEnabled = true
    this.playNotification('whale')
    this.isEnabled = tempEnabled
  }

  // 알림 활성화/비활성화
  setEnabled(enabled: boolean) {
    this.isEnabled = enabled
    // 설정 저장
    const currentSettings = JSON.parse(localStorage.getItem('alertSettings') || '{}')
    currentSettings.sound = enabled
    localStorage.setItem('alertSettings', JSON.stringify(currentSettings))
  }

  // 알림 상태 확인
  isAlertEnabled() {
    return this.isEnabled
  }

  // 브라우저 알림 권한 요청
  async requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission()
      return permission === 'granted'
    }
    return Notification.permission === 'granted'
  }

  // 브라우저 알림 표시
  showBrowserNotification(title: string, body: string, icon?: string) {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: icon || '/favicon.ico',
        badge: '/favicon.ico',
        vibrate: [200, 100, 200]
      })
    }
  }

  // 신호 알림 재생 (내부자 거래용)
  playSignalAlert() {
    this.playNotification('whale')
  }

  // 경고 알림 재생 (청산 히트맵용)
  playAlert(type: 'critical' | 'warning' | 'info' = 'warning') {
    if (!this.isEnabled || !this.audioContext) return

    const oscillator = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(this.audioContext.destination)

    switch(type) {
      case 'critical':
        // 위급: 높은음 반복
        oscillator.frequency.setValueAtTime(1000, this.audioContext.currentTime)
        oscillator.frequency.setValueAtTime(0, this.audioContext.currentTime + 0.1)
        oscillator.frequency.setValueAtTime(1000, this.audioContext.currentTime + 0.2)
        oscillator.frequency.setValueAtTime(0, this.audioContext.currentTime + 0.3)
        oscillator.frequency.setValueAtTime(1000, this.audioContext.currentTime + 0.4)
        gainNode.gain.setValueAtTime(0.4, this.audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.6)
        break
      case 'warning':
        // 경고: 중간음 울림
        oscillator.frequency.setValueAtTime(600, this.audioContext.currentTime)
        oscillator.frequency.exponentialRampToValueAtTime(400, this.audioContext.currentTime + 0.3)
        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.4)
        break
      case 'info':
        // 정보: 부드러운 알림음
        oscillator.frequency.setValueAtTime(400, this.audioContext.currentTime)
        oscillator.frequency.exponentialRampToValueAtTime(500, this.audioContext.currentTime + 0.2)
        gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3)
        break
    }

    oscillator.type = 'sine'
    oscillator.start(this.audioContext.currentTime)
    oscillator.stop(this.audioContext.currentTime + 0.6)
  }
}

// 싱글톤 인스턴스
export const audioService = new AudioService()