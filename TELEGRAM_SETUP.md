# 📱 Telegram 배포 알림 설정 가이드

## 🚀 이제 배포 시 Telegram으로 알림이 옵니다!

### 📬 받게 될 알림:
1. **배포 시작 알림** - 배포가 시작되면 즉시 알림
2. **배포 성공 알림** - 성공 시 접속 주소와 함께 알림
3. **배포 실패 알림** - 실패 시 에러 로그 링크와 함께 알림

## ⚙️ GitHub Secrets 설정 (필수!)

### 1단계: GitHub 저장소 접속
https://github.com/loadstar0723/monstas7

### 2단계: Settings → Secrets and variables → Actions

### 3단계: 다음 2개의 Secret 추가

#### 1️⃣ DEPLOY_TELEGRAM_BOT_TOKEN
- **Name**: `DEPLOY_TELEGRAM_BOT_TOKEN`
- **Secret**: `8398982269:AAELZBJUntjPPo-SV80eLxdLp37K79aR9Qc`

#### 2️⃣ DEPLOY_TELEGRAM_CHAT_ID
- **Name**: `DEPLOY_TELEGRAM_CHAT_ID`
- **Secret**: `6437449819`

## 📱 알림 예시

### 🚀 배포 시작
```
🚀 MONSTA 배포 시작

📝 커밋: Add new feature
👤 작성자: loadstar0723
🔗 커밋 ID: abc123...
🌿 브랜치: master

⏳ 배포 진행 중...
```

### ✅ 배포 성공
```
✅ MONSTA 배포 성공!

📝 커밋: Add new feature
👤 작성자: loadstar0723
🕐 완료 시간: 2025-09-04 20:30:00

🌐 접속 주소: http://13.209.84.93:8508
📊 GitHub Actions: [링크]

🎉 배포가 성공적으로 완료되었습니다!
```

### ❌ 배포 실패
```
❌ MONSTA 배포 실패!

📝 커밋: Add new feature
👤 작성자: loadstar0723
🔗 커밋 ID: abc123...

📋 로그 확인: [GitHub Actions 링크]

⚠️ 배포가 실패했습니다. 로그를 확인해주세요!
```

## 🔍 테스트 방법

1. GitHub Secrets 설정 완료
2. 아무 파일이나 수정
3. Git push
4. Telegram 메시지 확인

## ✨ 추가 기능

### 다른 이벤트에도 알림 받기:
- Pull Request 생성/병합
- 이슈 생성/해결
- 일일 빌드 상태

필요하면 추가 설정 가능합니다!

## 📞 문제 해결

### 알림이 오지 않는 경우:
1. GitHub Secrets 설정 확인
2. Bot Token과 Chat ID가 정확한지 확인
3. GitHub Actions 로그에서 에러 확인

### Telegram Bot 정보:
- Bot 이름: MONSTA Deploy Bot
- Chat ID: 6437449819 (개발팀 채널)