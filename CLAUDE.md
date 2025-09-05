    \# 프로젝트 가이드라인

    \## 절대 금지사항 (Critical Rules)
    NO 가짜 데이터 (mock data) 사용
    NO 폴백 구현체 (fallback implementations) 
    NO 목업 메서드나 함수
    NO 하드코딩된 예시 데이터
     NO "임시로" 또는 "테스트용" 데이터
    고정값 사용 절대 금지.

      \## 반드시 사용해야 할 것들 (Must Use)
     실제 API 호출만 사용
     실제 데이터베이스 연결 사용
     실제 인증 시스템 사용
     실제 환경 변수와 설정값 사용

    \## 데이터 소스 우선순위
    1\. 실제 프로덕션 API
    2\. 실제 데이터베이스 쿼리
    3\. 실제 파일 시스템 읽기
    4\. 환경 변수에서 설정 로드

    모든 것을 실제데이터와 실제웹소켓 실제 api, 실제 db, 실제docker, 실제 PostgreSQL 데이터베이스에서 가져오도록 전면 재수정해. 고정값 사용금지.
    모든 숫자값은 PostgreSQL 데이터베이스에서 실시간으로 가져와야 함

    1. Next.js Fast Refresh - 코드 변경 시 즉시 브라우저에 반영 (HMR: Hot Module Replacement)
    2. 프론트엔드/백엔드 분리 - 각각 독립적으로 최적화되어 실행
      - Frontend : UI 변경사항 즉시 반영
      - Backend : API는 별도로 실행되어 프론트 변경에 영향 없음
    3. 개발 서버 최적화 - npm run dev로 실행 중이라 변경사항 실시간 감지
    4. CSS-in-JS 없음 - 순수 Tailwind CSS로 스타일 처리가 빨라짐
    5. 병렬 처리 - Frontend와 Backend가 동시에 독립적으로 작동
   
      MONSTA 프로젝트가 Next.js(최강 UI/UX) + FastAPI(Python AI/ML) 조합을 사용

     각 각페이지별로 모듈화해서 시스템과 연동, 독립적 경쟁력과 에러방지, 안정성확보   
            

📊 하이브리드 구조의 장점:

      - Next.js: 빠른 UI, 실시간 업데이트
     - FastAPI: Python AI/ML 모델 실행
      - 완벽한 통합: API를 통한 자연스러운 연결

      * 간단버전, 샘플, 임시 사용금지

## 🚫 Streamlit 사용 금지
- Streamlit 앱 영구 사용 정지
- Next.js + FastAPI 하이브리드 시스템만 사용
- 앞으로 영원히 이 하이브리드만 사용

## 📍 배포 정보
- AWS 서버: 13.209.84.93
- 프론트엔드: http://13.209.84.93:3000 
- 백엔드 API: http://13.209.84.93:8000
- 헬스체크: http://13.209.84.93:8000/api/v1/health
- GitHub Actions로 자동 배포 (master 브랜치 push 시)

## 🗄️ 데이터베이스 설정
- 개발: SQLite (frontend/prisma/dev.db)
- 프로덕션: PostgreSQL 또는 MySQL 사용
- Prisma ORM으로 데이터베이스 관리
- 마이그레이션: npx prisma migrate dev

## 🎨 UI/UX 가이드라인
- 모든 메뉴와 UI 텍스트는 한국어로 표시
- 모바일 반응형 디자인 필수
- MONSTA 브랜드 강조 (보라색 테마)
- 블러 효과는 최소화하여 가독성 확보

## 🏗️ 프로젝트 구조
- 20개 카테고리, 301개 메뉴 항목 구현 완료
- 역할별 접근권한: 본사/총판/대리점/구독자
- 6단계 구독 시스템: Free → Silver → Gold → Platinum → Diamond → Black
- 212개 개별 페이지 파일 생성 완료

## 🔧 개발 시 주의사항
- Internal Server Error 발생 시 Prisma 재생성: npx prisma generate
- 포트 충돌 시 다른 포트 사용 (3000-3006)
- 모든 Node 프로세스 종료: taskkill /F /IM node.exe /T
- 항상 한국어로 답변

## 📈 실시간 시장 데이터
- 8개 암호화폐 실시간 추적: BTC, ETH, BNB, SOL, XRP, ADA, DOGE, AVAX
- Binance API 연동
- WebSocket으로 실시간 업데이트

## ⚡ 성능 최적화
- Next.js Fast Refresh로 즉시 반영
- Frontend/Backend 독립 실행
- PM2로 프로세스 관리
- 병렬 처리로 성능 향상