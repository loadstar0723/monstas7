# MONSTA 프로젝트 코드 스타일 및 컨벤션

## TypeScript 컨벤션
- **타입 정의**: interface 사용 (type 대신)
- **함수 선언**: Arrow function 사용
- **컴포넌트**: React.FC 대신 function 선언
- **상태 관리**: useState, useEffect 조합

## React 패턴
```typescript
// 컴포넌트 구조
export default function ComponentName() {
  const [state, setState] = useState(initialValue)
  
  useEffect(() => {
    // 실제 API 호출만
  }, [])
  
  return (
    <div className="tailwind-classes">
      {/* JSX */}
    </div>
  )
}
```

## WebSocket 패턴
```typescript
const wsRef = useRef<WebSocket | null>(null)

const connectWebSocket = (symbol: string) => {
  if (wsRef.current) {
    wsRef.current.close(1000)
  }
  
  const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@trade`)
  
  ws.onmessage = (event) => {
    // 실제 데이터 처리만
  }
}
```

## 스타일링
- **CSS Framework**: Tailwind CSS 사용
- **반응형**: Mobile-First 설계
- **애니메이션**: Framer Motion
- **아이콘**: React Icons

## 에러 처리 패턴
```typescript
try {
  const response = await fetch('/api/endpoint')
  const data = await response.json()
  // 실제 데이터 사용
} catch (error) {
  console.error('API Error:', error)
  // 기본값으로 폴백 (Mock 데이터 금지)
}
```

## 파일 구조
- Components: `/components/signals/`
- Pages: `/app/signals/*/`
- Utils: `/lib/`
- Types: 각 파일 상단에 interface 정의