# MONSTA 스타일링 가이드

## 하이브리드 아키텍처 설정
- Frontend: Next.js (Port 3000) - 빠른 UI/UX
- Backend: FastAPI (Port 8000) - Python AI/ML 처리
- 실시간 Fast Refresh로 즉각적인 변경사항 반영

## 핵심 CSS 설정

### 1. 배경 설정
```css
/* 어두운 오버레이 제거 - 밝고 선명한 화면 */
/* body::before 요소 사용하지 않음 */

/* 은은한 그라디언트 배경 (0.1 투명도) */
body {
  background: #0a0a0a;
  background-image: 
    radial-gradient(at 27% 37%, hsla(215, 98%, 61%, 0.1) 0px, transparent 50%),
    radial-gradient(at 97% 21%, hsla(125, 98%, 72%, 0.1) 0px, transparent 50%),
    /* ... 더 많은 그라디언트 */
}
```

### 2. Glass Card 효과
```css
.glass-card {
  background: rgba(15, 15, 15, 0.95); /* 높은 불투명도로 가독성 확보 */
  backdrop-filter: blur(20px);        /* 강한 블러 효과 */
  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: 
    0 8px 32px 0 rgba(0, 0, 0, 0.37),
    inset 0 0 0 1px rgba(255, 255, 255, 0.08);
}
```

### 3. 통계 카드
```css
.stat-card {
  background: linear-gradient(135deg, rgba(15,15,15,0.98) 0%, rgba(20,20,20,0.98) 100%);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,0.15);
}
```

## 색상 팔레트
```css
:root {
  --background: #0a0a0a;      /* 깊은 검정 배경 */
  --foreground: #ffffff;       /* 흰색 텍스트 */
  --primary: #8b5cf6;          /* 보라색 포인트 */
  --secondary: #06b6d4;        /* 청록색 포인트 */
  --success: #10b981;          /* 녹색 성공 */
  --danger: #ef4444;           /* 빨간색 위험 */
  --warning: #f59e0b;          /* 주황색 경고 */
}
```

## 애니메이션 효과
- gradient: 8초 무한 반복 그라디언트
- pulse-slow: 3초 천천히 펄스
- shimmer: 1.5초 로딩 효과

## 주요 특징
1. **투명도 없는 선명한 UI** - 어두운 오버레이 제거
2. **Glass Morphism** - 현대적인 유리 효과
3. **Neon Glow** - 네온 빛 효과
4. **Gradient Text** - 그라디언트 텍스트
5. **빠른 반응성** - Fast Refresh 활용

## 적용 방법
모든 새 페이지에서:
1. globals.css import
2. glass-card, stat-card 클래스 활용
3. gradient-text, neon-text 효과 사용
4. 일관된 색상 변수 사용