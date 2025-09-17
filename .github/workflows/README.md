# GitHub Actions 워크플로우 가이드

## 📋 현재 활성 워크플로우

### 1. 🚀 메인 배포 (simple-deploy.yml) - **핵심**
- **용도**: 모든 코드 배포를 담당하는 메인 워크플로우
- **자동 실행**: master 브랜치에 push 시
- **수동 실행**: GitHub Actions 페이지에서 가능
- **특징**:
  - ✅ 실제 서버 헬스체크로 배포 검증
  - ✅ 빌드 실패 시 개발 모드로 자동 폴백
  - ✅ PM2 프로세스 관리
  - ✅ 포트 확인 및 상태 검증

### 2. 🏥 서버 모니터링 (health-check.yml) - **자동화**
- **용도**: 서버 안정성 24/7 모니터링
- **자동 실행**: 30분마다
- **기능**:
  - 서버 상태 확인 (HTTP 200 체크)
  - 응답 시간 측정
  - 서버 다운 시 자동 재시작
  - PM2 프로세스 복구

### 3. 🚨 긴급 수정 (emergency-fix.yml) - **백업용**
- **용도**: Simple Deploy 실패 시 긴급 대응
- **수동 실행 전용**: 비상 상황에서만 사용
- **모드 선택**:
  - development: 개발 모드 강제 실행
  - production: 프로덕션 빌드 재시도
  - restart-only: 단순 재시작

## ❌ 삭제된 워크플로우

- **deploy.yml**: simple-deploy.yml과 중복되어 제거됨

## 🎯 사용 시나리오

### 일반 배포 (99% 경우)
```bash
git add .
git commit -m "기능 추가"
git push origin master
# → Simple Deploy 자동 실행 → 배포 완료
```

### 서버 상태 확인
- GitHub Actions 페이지에서 Health Check 최근 실행 확인
- 또는 http://15.165.105.250:3000 직접 접속

### 긴급 상황 대응
1. Simple Deploy 실패 확인
2. Emergency Fix 워크플로우 수동 실행
3. 모드 선택하여 실행

## 📊 워크플로우 우선순위

1. **Simple Deploy** - 모든 배포는 이것으로 처리
2. **Health Check** - 자동 모니터링 (건드릴 필요 없음)
3. **Emergency Fix** - 정말 급할 때만 사용

## ⚙️ GitHub Secrets 설정

- **AWS_SERVER_KEY**: SSH 키 (모든 워크플로우 공통 사용)

## 🔗 빠른 링크

- **Actions 페이지**: https://github.com/loadstar0723/monstas7/actions
- **라이브 서버**: http://15.165.105.250:3000
- **Simple Deploy 직접 실행**: https://github.com/loadstar0723/monstas7/actions/workflows/simple-deploy.yml

## ✅ 결론

**Simple Deploy 하나만 제대로 작동하면 충분합니다!**
- Health Check는 자동으로 서버를 지켜줍니다
- Emergency Fix는 정말 급할 때 백업용입니다
- deploy.yml은 중복이라 삭제했습니다