# 🚀 MONSTA 배포 체크리스트 & 문제 예방 가이드

## 🔴 배포 전 필수 체크사항

### 1. 로컬 테스트 (배포 전 반드시 확인)
```bash
# 1. 빌드 테스트
cd frontend
npm run build

# 2. 프로덕션 모드 테스트
npm run start

# 3. 타입 체크
npm run typecheck

# 4. 린트 체크
npm run lint
```

### 2. 자동 검증 스크립트
```bash
# frontend/scripts/pre-deploy-check.sh
#!/bin/bash
echo "🔍 배포 전 검증 시작..."

# 빌드 테스트
if ! npm run build; then
    echo "❌ 빌드 실패! 배포 중단"
    exit 1
fi

# Prisma 체크
if ! npx prisma generate; then
    echo "❌ Prisma 생성 실패! 배포 중단"
    exit 1
fi

echo "✅ 모든 검증 통과!"
```

## 🟡 자주 발생하는 문제 & 해결책

### 1. Prisma 초기화 오류
**문제**: "@prisma/client did not initialize yet"
**해결책**:
```bash
cd frontend
npx prisma generate
npm run build
```

### 2. 포트 충돌
**문제**: "Port already in use"
**해결책**:
```bash
# Windows
taskkill /F /IM node.exe /T

# Linux/Mac
killall node
```

### 3. 빌드 에러 (잘못된 함수명)
**예방책**: 
- 함수명은 반드시 영문자로 시작
- 숫자로 시작하는 함수명 금지 (❌ 30Page → ✅ Page30)

### 4. GitHub Actions 실패
**점검사항**:
- Secrets 설정 확인 (AWS_SERVER_KEY)
- 브랜치명 확인 (master vs main)
- deploy.yml 문법 검증

## 🟢 자동화 개선사항

### 1. Pre-commit Hook 설정
```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "npm run lint && npm run typecheck",
      "pre-push": "npm run build"
    }
  }
}
```

### 2. GitHub Actions 개선
```yaml
# .github/workflows/deploy.yml 추가사항
- name: 빌드 테스트
  run: |
    cd frontend
    npm ci
    npx prisma generate
    npm run build
    
- name: 헬스체크 강화
  run: |
    for i in {1..10}; do
      if curl -f http://localhost:3000; then
        echo "✅ 서버 정상 작동"
        break
      fi
      echo "⏳ 대기 중... ($i/10)"
      sleep 5
    done
```

### 3. 모니터링 설정
```bash
# PM2 모니터링
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30
```

## 📋 배포 순서 (수동 배포 시)

1. **로컬 검증**
   ```bash
   npm run build
   npm run typecheck
   npm run lint
   ```

2. **커밋 & 푸시**
   ```bash
   git add -A
   git commit -m "배포: [기능설명]"
   git push origin master
   ```

3. **서버 배포** (자동화 실패 시)
   ```bash
   ssh ubuntu@13.209.84.93
   cd ~/monsta-v7/monstas7
   git pull origin master
   cd frontend
   npm install
   npx prisma generate
   npm run build
   pm2 restart monsta-nextjs
   ```

## 🛠️ 트러블슈팅 명령어 모음

```bash
# PM2 상태 확인
pm2 status
pm2 logs monsta-nextjs

# 포트 확인
netstat -tlnp | grep 3000

# 프로세스 확인
ps aux | grep node

# 로그 확인
tail -f ~/.pm2/logs/monsta-nextjs-out.log
tail -f ~/.pm2/logs/monsta-nextjs-error.log

# 서버 재시작
pm2 restart monsta-nextjs

# 캐시 클리어
rm -rf frontend/.next
rm -rf frontend/node_modules/.cache
```

## ⚠️ AWS 보안 그룹 필수 설정

인바운드 규칙:
- **SSH**: 포트 22 (본인 IP만)
- **HTTP**: 포트 80 (0.0.0.0/0)
- **HTTPS**: 포트 443 (0.0.0.0/0)
- **Next.js**: 포트 3000 (0.0.0.0/0)
- **FastAPI**: 포트 8000 (0.0.0.0/0)

## 📱 연락처 & 모니터링

- GitHub Actions: https://github.com/loadstar0723/monstas7/actions
- 서버 상태: http://13.209.84.93:3000
- PM2 모니터링: `pm2 monit` (SSH 접속 후)

## 🔄 정기 점검 사항

### 일일 점검
- [ ] PM2 프로세스 상태
- [ ] 메모리 사용량 확인
- [ ] 로그 에러 확인

### 주간 점검
- [ ] npm 패키지 업데이트
- [ ] 보안 패치 확인
- [ ] 백업 상태 확인

### 월간 점검
- [ ] 서버 리소스 최적화
- [ ] 데이터베이스 정리
- [ ] 로그 파일 정리

---
*마지막 업데이트: 2025-09-05*