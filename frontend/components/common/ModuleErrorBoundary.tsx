import React, { Component, ErrorInfo, ReactNode } from 'react'
import { FaExclamationTriangle, FaRedo } from 'react-icons/fa'

interface Props {
  children: ReactNode
  moduleName?: string
}

interface State {
  hasError: boolean
  error: Error | null
}

export default class ModuleErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`Error in ${this.props.moduleName || 'Module'}:`, error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex items-center justify-center bg-gray-900 rounded-lg p-8">
          <div className="text-center max-w-md">
            <FaExclamationTriangle className="text-6xl text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">
              {this.props.moduleName || '모듈'} 오류
            </h2>
            <p className="text-gray-400 mb-4">
              이 모듈에서 오류가 발생했습니다. 다른 모듈은 정상적으로 작동합니다.
            </p>
            {this.state.error && (
              <p className="text-sm text-red-400 mb-4 font-mono">
                {this.state.error.message}
              </p>
            )}
            <button
              onClick={this.handleReset}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 mx-auto"
            >
              <FaRedo /> 다시 시도
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}