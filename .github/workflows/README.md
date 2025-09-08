# GitHub Actions 자동 배포 시스템 📦

## 🚀 자동 배포 프로세스

이 저장소는 GitHub Actions를 통한 자동 배포가 구성되어 있습니다.

### 배포 트리거
- **자동**: master/main 브랜치에 push 시 자동 실행
- **수동**: GitHub Actions 탭에서 수동 실행 가능

### 배포 순서
1. 📥 최신 코드 가져오기 (git pull)
2. 📦 의존성 설치 (npm install)
3. 🏗️ 프로덕션 빌드 (npm run build)
4. 🔄 PM2 재시작
5. ✅ 배포 완료

## 🔐 필수 GitHub Secrets 설정

**Settings → Secrets and variables → Actions**에서 설정:

### AWS_SERVER_KEY
AWS EC2 인스턴스 접속용 SSH 프라이빗 키
- monsta-key.pem 파일의 전체 내용을 복사하여 등록
- BEGIN RSA PRIVATE KEY부터 END RSA PRIVATE KEY까지 모두 포함

## 📊 배포 상태 확인

- **GitHub Actions**: https://github.com/loadstar0723/monstas7/actions
- **라이브 사이트**: http://13.209.84.93:3000

## 🛠️ 문제 해결

배포 실패 시:
1. Actions 탭에서 에러 로그 확인
2. SSH 키가 올바르게 등록되었는지 확인
3. 서버 연결 상태 점검