# GitHub Secrets 설정 가이드

## 🔐 SSH 키를 GitHub Secrets에 등록하는 방법

### 1. GitHub 저장소로 이동
1. https://github.com/loadstar0723/monstas7 접속
2. Settings 탭 클릭
3. 왼쪽 메뉴에서 "Secrets and variables" → "Actions" 클릭

### 2. 새 Secret 추가
1. "New repository secret" 버튼 클릭
2. 다음 정보 입력:
   - **Name**: `AWS_SERVER_KEY`
   - **Value**: 아래의 SSH 키 전체 내용 복사 & 붙여넣기 (BEGIN부터 END까지 모두 포함)

### 3. SSH 키 내용
monsta-key.pem 파일의 전체 내용을 복사하여 붙여넣으세요.
(보안상 여기에는 표시하지 않음)

### 4. 저장
"Add secret" 버튼을 클릭하여 저장

## ✅ 설정 확인
Settings → Secrets and variables → Actions에서 `AWS_SERVER_KEY`가 표시되는지 확인

## 🚀 자동 배포 활성화
1. Actions 탭으로 이동
2. "완전 자동 배포 시스템" 워크플로우 선택
3. "Run workflow" 버튼으로 수동 실행 테스트

## 📌 주의사항
- SSH 키는 절대 공개 저장소에 직접 커밋하지 마세요
- Secrets은 저장 후 내용을 다시 볼 수 없으므로 올바르게 입력했는지 확인하세요
- 키가 잘못 입력된 경우 삭제 후 다시 생성해야 합니다