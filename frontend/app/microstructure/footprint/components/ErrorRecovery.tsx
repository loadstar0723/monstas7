'use client'

import { Component, ErrorInfo, ReactNode } from 'react'
import { FaExclamationTriangle, FaSync, FaHome } from 'react-icons/fa'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  retryCount: number
}

export class FootprintErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0
    }
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
      retryCount: 0
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('풋프린트 차트 에러:', error, errorInfo)
    this.setState({
      error,
      errorInfo
    })
    
    // 에러 로깅 서비스로 전송 (선택적)
    this.logErrorToService(error, errorInfo)
  }

  logErrorToService(error: Error, errorInfo: ErrorInfo) {
    // TODO: 실제 에러 로깅 서비스 연동
    const errorData = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown'
    }
    
    // API로 에러 전송
    if (process.env.NODE_ENV === 'production') {
      fetch('/api/error-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(errorData)
      }).catch(err => console.error('에러 로깅 실패:', err))
    }
  }

  handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1
    }))
  }

  handleGoHome = () => {
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return <>{this.props.fallback}</>
      }

      return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-gray-800 rounded-2xl shadow-2xl p-8">
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
                <FaExclamationTriangle className="text-red-500 text-4xl" />
              </div>
              
              <h1 className="text-2xl font-bold text-white mb-2">
                오류가 발생했습니다
              </h1>
              
              <p className="text-gray-400 mb-6">
                풋프린트 차트를 불러오는 중 문제가 발생했습니다.
                {this.state.retryCount > 0 && (
                  <span className="block mt-2 text-sm">
                    재시도 횟수: {this.state.retryCount}회
                  </span>
                )}
              </p>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="w-full mb-6 text-left">
                  <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-300">
                    상세 오류 정보
                  </summary>
                  <div className="mt-2 p-3 bg-gray-900 rounded-lg overflow-auto">
                    <pre className="text-xs text-red-400 whitespace-pre-wrap">
                      {this.state.error.toString()}
                      {this.state.errorInfo?.componentStack}
                    </pre>
                  </div>
                </details>
              )}

              <div className="flex gap-3 w-full">
                <button
                  onClick={this.handleRetry}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                  <FaSync />
                  다시 시도
                </button>
                
                <button
                  onClick={this.handleGoHome}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  <FaHome />
                  홈으로
                </button>
              </div>

              <p className="mt-4 text-xs text-gray-500">
                문제가 계속되면 잠시 후 다시 시도해주세요.
              </p>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// 함수형 컴포넌트용 에러 복구 Hook
export function useErrorRecovery() {
  const handleError = (error: Error, errorInfo?: any) => {
    console.error('에러 발생:', error, errorInfo)
    
    // 에러 타입별 복구 전략
    if (error.message.includes('WebSocket')) {
      // WebSocket 에러는 자동 재연결
      return { shouldRetry: true, delay: 1000 }
    } else if (error.message.includes('Network')) {
      // 네트워크 에러는 3초 후 재시도
      return { shouldRetry: true, delay: 3000 }
    } else if (error.message.includes('API')) {
      // API 에러는 5초 후 재시도
      return { shouldRetry: true, delay: 5000 }
    }
    
    // 기타 에러는 수동 재시도
    return { shouldRetry: false, delay: 0 }
  }

  return { handleError }
}