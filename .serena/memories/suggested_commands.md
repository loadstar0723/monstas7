# MONSTA 프로젝트 개발 명령어

## 개발 서버 실행
```bash
# Frontend 개발 서버 (검증 후 실행)
cd frontend && npm run dev

# 검증 우회 실행 (긴급시만)
cd frontend && npx next dev -H 0.0.0.0 -p 3000

# Backend 개발 서버
cd backend && npm run dev
```

## 검증 명령어
```bash
# 규칙 위반 검증
cd frontend && npm run validate:strict

# 실시간 검증 감시
cd frontend && npm run validate:watch

# Mock 데이터 감지
cd frontend && npm run detect:mock

# Math.random 사용 카운트
cd frontend && npm run check:random
```

## 빌드 & 배포
```bash
# Frontend 빌드
cd frontend && npm run build

# Prisma 재생성 (Internal Server Error 시)
cd frontend && npx prisma generate

# 마이그레이션
cd frontend && npx prisma migrate dev
```

## Windows 시스템 명령어
```cmd
# 포트 확인
netstat -ano | findstr :3000

# Node 프로세스 종료
taskkill /F /IM node.exe /T

# 디렉토리 정리
rmdir /s /q .next
```

## 개발 프로세스
1. 코드 작성 전 금지사항 체크
2. 실제 API 연동 확인
3. 검증 명령어 실행
4. 테스트 후 커밋
5. GitHub Actions 자동 배포