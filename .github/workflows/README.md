# GitHub Actions 배포 시스템

## 📁 활성 워크플로우 (2개)

### 1. simple-deploy.yml ⭐ 권장
- **용도**: 메모리 안전 배포 (AWS 프리티어 최적화)
- **트리거**: master 브랜치 push 또는 수동 실행
- **특징**: 
  - Node.js 메모리 1GB 제한
  - PM2 단일 인스턴스 (fork 모드)
  - 빌드 실패 시 개발 모드 폴백
  - 메모리 상태 모니터링

### 2. deploy.yml
- **용도**: Next.js + FastAPI 전체 시스템 배포
- **트리거**: master 브랜치 push
- **포트**: 
  - 3000: Next.js Frontend
  - 8000: FastAPI Backend

## 🚀 배포 방법

### 자동 배포
```bash
git push origin master
```

### 수동 배포
```bash
# GitHub CLI 사용
gh workflow run simple-deploy.yml

# 상태 확인
gh run list --workflow=simple-deploy.yml
```

## ⚙️ 필수 설정

### GitHub Secrets
`Settings → Secrets → Actions`에서 설정:
- **AWS_SERVER_KEY**: EC2 SSH 프라이빗 키

## 📊 모니터링

- **GitHub Actions**: https://github.com/loadstar0723/monstas7/actions
- **라이브 사이트**: http://13.209.84.93:3000

## ⚠️ 주의사항

- 메모리 부족 시 `simple-deploy.yml` 사용
- master 브랜치 push 시 자동 배포 시작
- 배포 중 서버 일시 중단 가능 (3-5분)