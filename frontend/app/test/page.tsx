'use client'

export default function TestPage() {
  return (
    <div style={{ padding: '20px', backgroundColor: '#000', color: '#fff', minHeight: '100vh' }}>
      <h1>서버 테스트 페이지</h1>
      <p>이 페이지가 보인다면 서버가 정상 작동중입니다.</p>
      <p>현재 시간: {new Date().toLocaleString('ko-KR')}</p>
    </div>
  )
}