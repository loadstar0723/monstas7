# 📚 무료 번역 API 가이드

## 🎯 개요
MONSTA 프로젝트는 완전 무료 번역 솔루션을 제공합니다. API 키 없이도 Google Translate를 통해 즉시 번역이 가능합니다.

## 🌐 번역 서비스 우선순위

### 1. **Google Translate** (기본값) ✅
- **비용**: 완전 무료
- **API 키**: 불필요
- **제한**: 없음
- **품질**: 우수
- **설정**: 추가 설정 불필요, 즉시 사용 가능

### 2. **Papago** (네이버) 🟢
- **비용**: 일 10,000자 무료
- **API 키**: 필요 (네이버 개발자센터)
- **품질**: 한국어 특화, 매우 우수
- **장점**: 한국어 번역 품질 최고

### 3. **DeepL Free** 🔵
- **비용**: 월 500,000자 무료
- **API 키**: 필요 (DeepL 사이트)
- **품질**: 최상급
- **장점**: 자연스러운 번역

### 4. **Claude API** (유료) 💎
- **비용**: 유료
- **품질**: AI 기반 최고급
- **장점**: 컨텍스트 이해 우수

### 5. **기본 키워드 번역** (폴백) ⚠️
- **비용**: 무료
- **품질**: 기본
- **용도**: 모든 API 실패 시 폴백

## 🚀 사용 방법

### 기본 사용 (API 키 없이)
```typescript
// 아무 설정 없이 바로 사용 가능!
const response = await fetch('/api/translate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    text: 'Bitcoin price surges',
    targetLang: 'ko'
  })
})

const { translatedText } = await response.json()
// 결과: "비트코인 가격 급등"
```

### 고급 설정 (선택사항)
`.env.local` 파일에 추가:
```bash
# Papago (네이버) - 선택사항
PAPAGO_CLIENT_ID=your_client_id
PAPAGO_CLIENT_SECRET=your_client_secret

# DeepL Free - 선택사항
DEEPL_API_KEY=your_free_api_key

# Claude - 유료 사용자만
CLAUDE_API_KEY=your_claude_key
```

## 📊 비교 표

| 서비스 | 비용 | API 키 | 제한 | 품질 | 추천도 |
|--------|------|--------|------|------|--------|
| Google | 무료 | 불필요 | 없음 | ⭐⭐⭐⭐ | 🏆 |
| Papago | 무료 | 필요 | 일 10K자 | ⭐⭐⭐⭐⭐ | 🥈 |
| DeepL | 무료 | 필요 | 월 500K자 | ⭐⭐⭐⭐⭐ | 🥉 |
| Claude | 유료 | 필요 | 토큰제한 | ⭐⭐⭐⭐⭐ | 💎 |

## 🔧 테스트 페이지

번역 테스트: http://localhost:3000/test-translation

## 💡 추천 사항

### 일반 사용자
- **추가 설정 없이 Google Translate 사용** (기본값)
- 즉시 사용 가능, 완전 무료

### 고급 사용자
1. Papago API 키 발급 (한국어 품질 최고)
2. DeepL Free 계정 생성 (자연스러운 번역)
3. 두 API 키를 .env.local에 추가

### 기업 사용자
- Claude API 또는 DeepL Pro 고려
- 대량 번역 및 고품질 보장

## 🎯 결론

**ChatGPT 무료 버전은 API를 제공하지 않아 웹 통합이 불가능합니다.**

대신 **Google Translate 무료 API**를 기본으로 사용하며, 이는:
- ✅ 완전 무료
- ✅ API 키 불필요
- ✅ 즉시 사용 가능
- ✅ 제한 없음
- ✅ 우수한 번역 품질

추가로 Papago, DeepL Free를 선택적으로 설정할 수 있어 최적의 번역 품질을 보장합니다.

## 📞 지원

문제가 있으시면 GitHub Issues에 문의해주세요.