'use client'

export default function TestPage() {
  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-4xl font-bold mb-8">소셜 감성 테스트 페이지</h1>
      <div className="space-y-4">
        <div className="bg-green-500 p-4 rounded">
          <p className="text-xl">✅ 페이지가 정상적으로 로드되었습니다!</p>
        </div>
        <div className="bg-blue-500 p-4 rounded">
          <p>현재 시간: {new Date().toLocaleString('ko-KR')}</p>
        </div>
        <div className="bg-purple-500 p-4 rounded">
          <p>React 버전: {require('react').version}</p>
        </div>
      </div>
    </div>
  )
}