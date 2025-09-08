# 개발 규칙 및 금지사항

## 🚨 절대 금지사항
- **NO Mock/Fake 데이터**: mock, dummy, fake, sample, 임시, 예시 데이터 절대 금지
- **NO 하드코딩**: 0.1, 0.5, 2% 등 고정값 사용 금지
- **NO 가정값**: "~라고 가정", "테스트용" 등 가정 기반 구현 금지
- **NO 시뮬레이션**: setTimeout으로 가짜 거래, simulateWhaleTransactions 등 금지

## ✅ 필수 사용 원칙
- **실제 API**: Binance WebSocket, CoinGecko, Alternative.me 등 실제 API만 사용
- **실제 데이터베이스**: PostgreSQL/SQLite 실제 데이터만 사용
- **실제 WebSocket**: 실시간 데이터 스트림만 사용
- **에러 처리**: 모든 API 호출에 try-catch 필수

## 🎯 문제 해결 방식
- **근본 원인 분석**: 표면적 증상이 아닌 근본 원인 찾기
- **완전한 솔루션**: 임시방편 금지, 모든 기능 유지하면서 해결
- **실제 데이터 연동**: Mock 데이터로 폴백 절대 금지
- **프로덕션 준비**: 실제 환경에서 작동하는 코드만 작성

## 🔍 검증 규칙
- Math.random() 사용 금지
- 하드코딩된 배열 [{id: 1, ...}] 금지
- 고정 속성값 confidence: 65 등 금지
- 시뮬레이션 함수 금지