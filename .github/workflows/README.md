# GitHub Actions 배포 설정 가이드

## 필수 GitHub Secrets 설정

GitHub 저장소 Settings → Secrets and variables → Actions에서 다음 시크릿을 추가하세요:

### SSH_PRIVATE_KEY
AWS EC2 인스턴스에 접속하기 위한 SSH 프라이빗 키

```bash
# monsta-key.pem 파일의 전체 내용을 복사하여 붙여넣기
-----BEGIN RSA PRIVATE KEY-----
... (키 내용) ...
-----END RSA PRIVATE KEY-----
```

## 배포 프로세스

1. **자동 배포**: master 브랜치에 push하면 자동으로 배포가 시작됩니다
2. **수동 배포**: Actions 탭에서 "Deploy to AWS EC2" 워크플로우를 수동으로 실행할 수 있습니다

## 배포 단계

1. 코드 체크아웃
2. SSH 키 설정
3. EC2 서버 접속
4. 최신 코드 pull
5. 프론트엔드 빌드
6. PM2로 애플리케이션 재시작

## 문제 해결

### 배포 실패 시
1. GitHub Actions 로그 확인
2. EC2 서버에 직접 SSH 접속하여 상태 확인
3. PM2 로그 확인: `pm2 logs monstas7`

### 일반적인 문제
- **SSH 연결 실패**: SSH_PRIVATE_KEY 시크릿이 올바르게 설정되었는지 확인
- **빌드 실패**: 로컬에서 `npm run build`가 성공하는지 확인
- **PM2 재시작 실패**: `pm2 status`로 프로세스 상태 확인