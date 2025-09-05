\# 프로젝트 가이드라인



\## 절대 금지사항 (Critical Rules)

\- ❌ NO 가짜 데이터 (mock data) 사용

\- ❌ NO 폴백 구현체 (fallback implementations) 

\- ❌ NO 목업 메서드나 함수

\- ❌ NO 하드코딩된 예시 데이터

\- ❌ NO "임시로" 또는 "테스트용" 데이터

고정값 사용 절대 금지.



\## 반드시 사용해야 할 것들 (Must Use)

\- ✅ 실제 API 호출만 사용

\- ✅ 실제 데이터베이스 연결 사용

\- ✅ 실제 인증 시스템 사용

\- ✅ 실제 환경 변수와 설정값 사용



\## 데이터 소스 우선순위

1\. 실제 프로덕션 API

2\. 실제 데이터베이스 쿼리

3\. 실제 파일 시스템 읽기

4\. 환경 변수에서 설정 로드

모든 것을 실제데이터와 실제웹소켓 실제 api, 실제 db, 실제docker, 실제 PostgreSQL 데이터베이스에서 가져오도록 전면 재수정해. 고정값 사용금지.

모든 숫자값은 PostgreSQL 데이터베이스에서 실시간으로 가져와야 함

Next.js 와 Streamlit 의 장점만을 활용하여 오직 통합 하나의 하이브리드 사용하기.사이트 디자인 및 코딩하기
● 하나의 통합된 페이지에서 Next.js(프론트엔드)와 Python(백엔드 API)의 장점을 모두 활용하는 진짜 하이브리드

완벽한 하이브리드 시스템 구축하기! 두가지의 장점만 살린 하나의 하이브리드 시스템만 사용한다.

  통합 플랫폼 아키텍처:

  사용자 → [Next.js Frontend:3001] → [FastAPI Backend:8000]
                ↓                            ↓
           (최강 UI/UX)              (Python AI/ML 처리)
                ↓                            ↓
          TradingView 차트            11개 AI 모델 앙상블
          실시간 히트맵               실시간 예측/분석
          WebSocket 연결              PostgreSQL DB


  1. Next.js Fast Refresh - 코드 변경 시 즉시 브라우저에 반영 (HMR: Hot Module Replacement)
  2. 프론트엔드/백엔드 분리 - 각각 독립적으로 최적화되어 실행
    - Frontend (3000): UI 변경사항 즉시 반영
    - Backend (8000): API는 별도로 실행되어 프론트 변경에 영향 없음
  3. 개발 서버 최적화 - npm run dev로 실행 중이라 변경사항 실시간 감지
  4. CSS-in-JS 없음 - 순수 Tailwind CSS로 스타일 처리가 빨라짐
  5. 병렬 처리 - Frontend와 Backend가 동시에 독립적으로 작동

  이것이 바로 하이브리드 아키텍처의 강력한 점
  - 개발 속도 ↑: 즉각적인 피드백
  - 생산성 ↑: 빠른 반복 개발
  - 디버깅 ↑: 문제 즉시 확인 가능

  MONSTA 프로젝트가 Next.js(최강 UI/UX) + FastAPI(Python AI/ML) 조합을 사용

  각 각페이지별로 모듈화해서 시스템과 연동, 독립적 경쟁력과 에러방지, 안정성확보   

  