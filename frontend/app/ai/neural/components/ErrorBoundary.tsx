'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { FaExclamationTriangle, FaRedo } from 'react-icons/fa'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Neural Network module error:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return <>{this.props.fallback}</>
      }

      return (
        <div className="min-h-[400px] flex items-center justify-center">
          <div className="text-center p-8 bg-gray-800/50 rounded-xl">
            <FaExclamationTriangle className="text-4xl text-yellow-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">신경망 모듈 오류</h3>
            <p className="text-gray-400 mb-4">
              {this.state.error?.message || '알 수 없는 오류가 발생했습니다'}
            </p>
            <button
              onClick={this.handleReset}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
            >
              <FaRedo />
              페이지 새로고침
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}