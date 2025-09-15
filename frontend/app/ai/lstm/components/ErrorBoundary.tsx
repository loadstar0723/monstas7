import React from 'react'
import { FaBrain, FaExclamationTriangle } from 'react-icons/fa'

interface Props {
  children: React.ReactNode
  fallback?: React.ReactNode
  moduleName?: string
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(`[${this.props.moduleName || 'LSTM Module'}] Error:`, error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return <>{this.props.fallback}</>
      }

      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-red-900/20 border border-red-500/50 rounded-xl p-8 backdrop-blur-sm">
              <div className="flex items-center gap-4 mb-6">
                <FaExclamationTriangle className="text-red-500 text-4xl" />
                <div>
                  <h2 className="text-2xl font-bold text-white">모듈 오류 발생</h2>
                  <p className="text-gray-400">{this.props.moduleName || 'LSTM'} 모듈에서 오류가 발생했습니다</p>
                </div>
              </div>
              
              <div className="bg-black/50 rounded-lg p-4 mb-6">
                <p className="text-red-400 font-mono text-sm">{this.state.error?.message}</p>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                  페이지 새로고침
                </button>
                <button
                  onClick={() => this.setState({ hasError: false, error: null })}
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  다시 시도
                </button>
              </div>

              <div className="mt-6 p-4 bg-yellow-900/20 border border-yellow-500/50 rounded-lg">
                <p className="text-yellow-400 text-sm">
                  <strong>참고:</strong> 이 오류는 {this.props.moduleName || 'LSTM'} 모듈에만 영향을 미치며, 
                  다른 기능은 정상적으로 작동합니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}