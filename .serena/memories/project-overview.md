# MONSTA 프로젝트 개요

## 프로젝트 목적
MONSTA는 Binance AI 트레이딩 플랫폼으로, 암호화폐 시장의 실시간 분석과 트레이딩 시그널을 제공하는 웹 애플리케이션입니다.

## 기술 스택
- **Frontend**: Next.js 15.5.2, React 19.1.0, TypeScript
- **Backend**: FastAPI (Python AI/ML), Node.js Express
- **Database**: 개발환경 SQLite, 프로덕션 PostgreSQL
- **ORM**: Prisma
- **스타일링**: Tailwind CSS
- **차트**: Recharts, Chart.js, Lightweight Charts
- **애니메이션**: Framer Motion
- **WebSocket**: Socket.io, Binance WebSocket
- **상태관리**: Zustand
- **인증**: NextAuth

## 아키텍처
- **하이브리드 구조**: Next.js (UI/UX) + FastAPI (AI/ML)
- **실시간 데이터**: Binance WebSocket API
- **모듈화 설계**: 페이지별 독립적 모듈 구조
- **에러 격리**: ErrorBoundary를 통한 모듈 간 격리

## 주요 기능
1. **인사이더 플로우**: 팀 지갑, VC 지갑 움직임 추적
2. **고래 추적**: 대규모 거래 실시간 모니터링
3. **스마트 머니**: 기관 투자자 포지션 분석
4. **청산 맵**: 레버리지 포지션 청산 데이터
5. **공포 탐욕 지수**: 시장 심리 분석
6. **펀딩 비율**: 선물 시장 데이터
7. **차익거래**: 멀티 거래소 가격 차이
8. **DEX 플로우**: 탈중앙화 거래소 데이터
9. **소셜 센티먼트**: 소셜 미디어 분석
10. **비정상 옵션**: 옵션 시장 이상 신호

## 배포 정보
- **AWS 서버**: 13.209.84.93
- **Frontend**: http://13.209.84.93:3000
- **Backend API**: http://13.209.84.93:8000
- **자동 배포**: GitHub Actions (master 브랜치)