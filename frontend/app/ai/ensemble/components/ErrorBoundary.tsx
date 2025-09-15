'use client'

import React from 'react'
import { FaExclamationTriangle, FaRedo } from 'react-icons/fa'

interface Props {
  children: React.ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('앙상블 시스템 에러:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex items-center justify-center">
          <div className="text-center p-8 bg-gray-800/50 rounded-xl border border-gray-700">
            <FaExclamationTriangle className="text-6xl text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">오류가 발생했습니다</h2>
            <p className="text-gray-400 mb-4">
              앙상블 시스템에서 예기치 않은 오류가 발생했습니다.
            </p>
            <button
              onClick={this.handleReset}
              className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors flex items-center gap-2 mx-auto"
            >
              <FaRedo />
              다시 시도
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}