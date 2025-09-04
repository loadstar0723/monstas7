# GitHub 자동 배포 설정 가이드

## ✅ 자동 배포 설정 완료!

이제 GitHub에 push하면 자동으로 서버에 배포됩니다.

## 🔑 중요: GitHub Secrets 설정 (필수!)

1. GitHub 저장소 페이지 접속: https://github.com/loadstar0723/monstas7
2. Settings 탭 클릭
3. 왼쪽 메뉴에서 Secrets and variables > Actions 클릭
4. New repository secret 버튼 클릭
5. 다음 정보 입력:
   - Name: `AWS_SERVER_KEY`
   - Secret: monsta-key.pem 파일의 전체 내용 복사/붙여넣기

### monsta-key.pem 내용 복사 방법:
```bash
# Windows에서
type monsta-key.pem

# 또는 메모장으로 열기
notepad monsta-key.pem
```

전체 내용을 복사 (-----BEGIN RSA PRIVATE KEY-----부터 -----END RSA PRIVATE KEY-----까지)

## 🚀 자동 배포 동작 방식

### 언제 배포되나요?
- master 또는 main 브랜치에 push할 때
- GitHub Actions 페이지에서 수동 실행할 때

### 배포 프로세스:
1. GitHub에 코드 push
2. GitHub Actions 자동 실행
3. 서버 접속 (SSH)
4. 최신 코드 pull
5. 패키지 업데이트
6. 앱 재시작
7. 완료!

## 📝 사용 방법

### 자동 배포:
```bash
git add .
git commit -m "새로운 기능 추가"
git push origin master
```

### 수동 배포:
1. GitHub 저장소 > Actions 탭
2. "Deploy MONSTA Platform" 워크플로우 선택
3. "Run workflow" 버튼 클릭

## 🔍 배포 상태 확인

### GitHub에서:
- Actions 탭에서 배포 진행 상황 실시간 확인
- 녹색 체크: 성공
- 빨간 X: 실패

### 서버에서:
```bash
ssh -i monsta-key.pem ubuntu@13.209.84.93
tail -f ~/monsta-v7/monstas7/app.log
```

## ⚠️ 주의사항

1. **반드시 AWS_SERVER_KEY를 GitHub Secrets에 등록해야 함**
2. 키 파일은 절대 GitHub에 직접 업로드하지 말 것
3. master/main 브랜치에만 push 시 자동 배포됨
4. 테스트는 별도 브랜치에서 진행 권장

## 🌐 접속 정보

배포 완료 후:
- 웹 애플리케이션: http://13.209.84.93:8508
- GitHub Actions: https://github.com/loadstar0723/monstas7/actions

## 📞 문제 발생 시

1. GitHub Actions 로그 확인
2. 서버 로그 확인: `ssh -i monsta-key.pem ubuntu@13.209.84.93`
3. 프로세스 상태 확인: `ps aux | grep streamlit`