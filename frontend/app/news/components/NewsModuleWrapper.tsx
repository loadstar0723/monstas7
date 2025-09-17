'use client';

import React, { ReactNode } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

interface NewsModuleWrapperProps {
  children: ReactNode;
  title?: string;
  description?: string;
}

function ErrorFallback({ error }: { error: Error }) {
  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-red-900/20 border border-red-600/30 rounded-lg p-6">
          <h2 className="text-xl font-bold text-red-400 mb-2">뉴스 모듈 오류</h2>
          <p className="text-gray-300">뉴스를 불러오는 중 오류가 발생했습니다.</p>
          <details className="mt-4">
            <summary className="cursor-pointer text-sm text-gray-400">오류 상세 정보</summary>
            <pre className="mt-2 text-xs text-gray-500 overflow-auto">
              {error.message}
            </pre>
          </details>
        </div>
      </div>
    </div>
  );
}

export default function NewsModuleWrapper({
  children,
  title,
  description
}: NewsModuleWrapperProps) {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <div className="min-h-screen bg-gray-900">
        <div className="max-w-7xl mx-auto p-4 md:p-8">
          {title && (
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">{title}</h1>
              {description && (
                <p className="text-gray-400">{description}</p>
              )}
            </div>
          )}
          {children}
        </div>
      </div>
    </ErrorBoundary>
  );
}