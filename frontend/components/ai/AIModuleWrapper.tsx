'use client';

import React, { Component, ErrorInfo, ReactNode, Suspense } from 'react';

interface Props {
  children: ReactNode;
  moduleName: string;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

// 에러 경계 컴포넌트
class AIModuleErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`[${this.props.moduleName}] 에러 발생:`, error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-purple-900 p-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-red-900/20 backdrop-blur-sm rounded-lg p-8 border border-red-800">
              <h2 className="text-2xl font-bold text-red-400 mb-4">
                ⚠️ {this.props.moduleName} 모듈 에러
              </h2>

              <div className="mb-6">
                <p className="text-gray-300 mb-2">
                  이 모듈에서 에러가 발생했습니다. 다른 모듈은 정상 작동합니다.
                </p>
                <p className="text-sm text-gray-400">
                  에러가 격리되어 다른 기능에는 영향을 주지 않습니다.
                </p>
              </div>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="mb-6 p-4 bg-gray-900/50 rounded border border-gray-700">
                  <p className="text-sm font-mono text-red-300 mb-2">
                    {this.state.error.toString()}
                  </p>
                  {this.state.errorInfo && (
                    <details className="text-xs text-gray-400">
                      <summary className="cursor-pointer hover:text-gray-300">
                        스택 트레이스 보기
                      </summary>
                      <pre className="mt-2 overflow-auto">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </details>
                  )}
                </div>
              )}

              <div className="flex gap-4">
                <button
                  onClick={this.handleReset}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  다시 시도
                </button>
                <button
                  onClick={() => window.location.href = '/ai'}
                  className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  AI 메뉴로 돌아가기
                </button>
              </div>
            </div>

            {/* 다른 모듈 상태 표시 */}
            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
              {['LSTM', 'XGBoost', 'ARIMA', 'GRU'].map((model) => (
                <div
                  key={model}
                  className={`p-3 rounded-lg border ${
                    model === this.props.moduleName
                      ? 'bg-red-900/20 border-red-800'
                      : 'bg-green-900/20 border-green-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        model === this.props.moduleName
                          ? 'bg-red-500'
                          : 'bg-green-500 animate-pulse'
                      }`}
                    />
                    <span className="text-sm text-gray-300">{model}</span>
                    <span className="text-xs text-gray-500">
                      {model === this.props.moduleName ? '에러' : '정상'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// 로딩 컴포넌트
const ModuleLoadingFallback: React.FC<{ moduleName: string }> = ({ moduleName }) => (
  <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-purple-900 flex items-center justify-center">
    <div className="text-center">
      <div className="relative">
        <div className="w-20 h-20 border-4 border-blue-500/30 rounded-full animate-pulse"></div>
        <div className="absolute inset-0 w-20 h-20 border-4 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
      <p className="mt-6 text-xl text-gray-300">{moduleName} 모듈 로딩 중...</p>
      <p className="mt-2 text-sm text-gray-500">Go 엔진과 연결 중입니다</p>
    </div>
  </div>
);

// 모듈 래퍼 컴포넌트
interface AIModuleWrapperProps {
  moduleName: string;
  children: ReactNode;
  showEngineStatus?: boolean;
  className?: string;
}

export default function AIModuleWrapper({
  moduleName,
  children,
  showEngineStatus = true,
  className = '',
}: AIModuleWrapperProps) {
  return (
    <AIModuleErrorBoundary moduleName={moduleName}>
      <Suspense fallback={<ModuleLoadingFallback moduleName={moduleName} />}>
        <div className={`ai-module-container ${className}`} data-module={moduleName}>
          {/* Go 엔진 상태 표시 */}
          {showEngineStatus && (
            <div className="fixed top-4 right-4 z-50">
              <div className="bg-gray-900/90 backdrop-blur-sm rounded-lg px-3 py-2 border border-gray-700">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-gray-300">Go Engine</span>
                  <span className="text-xs text-gray-500">|</span>
                  <span className="text-xs text-gray-400">{moduleName}</span>
                </div>
              </div>
            </div>
          )}

          {/* 모듈 콘텐츠 */}
          <div className="module-content">
            {children}
          </div>
        </div>
      </Suspense>
    </AIModuleErrorBoundary>
  );
}

// 개별 모델 상태 관리 훅
export function useModuleHealth(moduleName: string) {
  const [health, setHealth] = React.useState({
    status: 'loading' as 'loading' | 'healthy' | 'error' | 'warning',
    message: '',
    lastCheck: new Date(),
  });

  React.useEffect(() => {
    const checkHealth = async () => {
      try {
        // Go 엔진 헬스 체크
        const goResponse = await fetch('http://localhost:8080/health');
        const goHealth = await goResponse.json();

        // Python AI 서버 헬스 체크
        const pyResponse = await fetch('http://localhost:8000/health');
        const pyHealth = await pyResponse.json();

        if (goHealth.status === 'healthy' && pyHealth.status === 'healthy') {
          setHealth({
            status: 'healthy',
            message: '모든 서비스 정상',
            lastCheck: new Date(),
          });
        } else {
          setHealth({
            status: 'warning',
            message: '일부 서비스 점검 필요',
            lastCheck: new Date(),
          });
        }
      } catch (error) {
        setHealth({
          status: 'error',
          message: '서비스 연결 실패',
          lastCheck: new Date(),
        });
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 30000); // 30초마다 체크

    return () => clearInterval(interval);
  }, [moduleName]);

  return health;
}