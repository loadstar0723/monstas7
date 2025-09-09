# 🚀 AWS 서버 SSH 명령어 모음

## 📌 AWS 서버 정보
- **IP**: 13.209.84.93
- **Frontend**: http://13.209.84.93:3000
- **Backend**: http://13.209.84.93:8000

---

## 1️⃣ 서버 빠른 시작 (복사-붙여넣기)

### 옵션 A: 원라이너 (가장 빠름)
```bash
cd ~/monstas7/frontend && git pull && npm install && npm run build && pm2 delete all; pm2 start npm --name monsta -- start && pm2 save
```

### 옵션 B: 단계별 실행
```bash
# 1. 프로젝트로 이동
cd ~/monstas7 || cd ~/monsta-v7/monstas7

# 2. 최신 코드 가져오기
git pull origin master

# 3. Frontend 디렉토리로 이동
cd frontend

# 4. 의존성 설치
npm install --production

# 5. Prisma 클라이언트 생성
npx prisma generate

# 6. 프로덕션 빌드
npm run build

# 7. PM2로 시작
pm2 delete all
pm2 start npm --name monsta -- start

# 8. PM2 저장
pm2 save
```

---

## 2️⃣ 서버 상태 확인

### PM2 프로세스 확인
```bash
pm2 list
```

### PM2 로그 보기
```bash
pm2 logs monsta --lines 50
```

### 포트 확인
```bash
netstat -tlnp | grep -E "3000|8000"
```

### 헬스체크
```bash
curl http://localhost:3000 && echo "✅ Frontend OK" || echo "❌ Frontend Failed"
```

---

## 3️⃣ 문제 해결

### 서버가 시작되지 않을 때
```bash
# 모든 Node 프로세스 종료
pkill -f node

# PM2 완전 초기화
pm2 kill
pm2 flush

# 캐시 삭제 후 재시작
cd ~/monstas7/frontend
rm -rf .next node_modules/.cache
npm run build
pm2 start npm --name monsta -- start
```

### 포트가 이미 사용 중일 때
```bash
# 3000 포트 사용 프로세스 찾기
lsof -i :3000

# 특정 PID 종료 (PID를 실제 값으로 변경)
kill -9 [PID]
```

### Git 충돌 발생 시
```bash
cd ~/monstas7
git fetch origin
git reset --hard origin/master
git pull origin master
```

---

## 4️⃣ PM2 관리 명령어

### 재시작 (무중단)
```bash
pm2 reload monsta
```

### 중지
```bash
pm2 stop monsta
```

### 삭제
```bash
pm2 delete monsta
```

### 모니터링
```bash
pm2 monit
```

### CPU/메모리 상태
```bash
pm2 status
```

---

## 5️⃣ 긴급 복구 스크립트

### 전체 재설치 및 시작
```bash
cd ~ && rm -rf monstas7 && git clone https://github.com/loadstar0723/monstas7.git && cd monstas7/frontend && npm install && npx prisma generate && npm run build && pm2 start npm --name monsta -- start && pm2 save
```

---

## 6️⃣ 자동 시작 설정

### PM2 부팅 시 자동 시작
```bash
pm2 startup
# 출력된 명령어를 복사해서 실행
pm2 save
```

---

## 7️⃣ 로그 관리

### 로그 실시간 보기
```bash
pm2 logs monsta --follow
```

### 로그 파일 위치
```bash
ls ~/.pm2/logs/
```

### 로그 초기화
```bash
pm2 flush
```

---

## 🆘 도움이 필요할 때

1. **PM2 상태 확인**: `pm2 list`
2. **로그 확인**: `pm2 logs monsta --lines 100`
3. **포트 확인**: `netstat -tlnp | grep 3000`
4. **프로세스 확인**: `ps aux | grep node`

---

## ⚡ 최종 체크리스트

- [ ] Git pull 완료
- [ ] npm install 완료
- [ ] npm run build 성공
- [ ] PM2 프로세스 실행 중
- [ ] 포트 3000 열림
- [ ] http://13.209.84.93:3000 접속 가능

---

## 📝 참고사항

- AWS 보안 그룹에서 포트 3000, 8000이 열려있어야 함
- Ubuntu 방화벽도 확인: `sudo ufw status`
- Node.js 버전 확인: `node -v` (18.x 이상 권장)