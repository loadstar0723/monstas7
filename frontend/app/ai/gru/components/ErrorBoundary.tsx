'use client'

import React from 'react'
import { FaExclamationTriangle, FaRedo } from 'react-icons/fa'

interface Props {
  children: React.ReactNode
  moduleName: string
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
    console.error(`Error in ${this.props.moduleName}:`, error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-red-900/20 border border-red-500/50 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <FaExclamationTriangle className="text-red-500 text-2xl mt-1" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-red-400 mb-2">
                {this.props.moduleName} 모듈 오류
              </h3>
              <p className="text-gray-300 mb-4">
                이 섹션에서 오류가 발생했습니다. 다른 섹션은 정상적으로 작동합니다.
              </p>
              <button
                onClick={this.handleReset}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                <FaRedo />
                다시 시도
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}