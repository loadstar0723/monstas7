# 📚 Supabase 설정 가이드 (초보자용 상세 설명)

## 🎯 Supabase란?
- **Firebase 대체품**: 구글 Firebase와 비슷하지만 오픈소스
- **백엔드 서비스**: 데이터베이스, 인증, 실시간 기능을 제공
- **무료 사용 가능**: 개인 프로젝트는 무료로 충분

## 📝 Step 1: Supabase 계정 만들기

1. **웹브라우저에서 접속**
   ```
   https://supabase.com
   ```

2. **회원가입**
   - "Start your project" 버튼 클릭
   - GitHub 계정으로 가입 (가장 쉬움)
   - 또는 이메일로 가입도 가능

## 🚀 Step 2: 프로젝트 생성

1. **Dashboard 접속 후**
   - "New Project" 버튼 클릭

2. **프로젝트 정보 입력**
   ```
   Organization: Personal (개인용)
   Project name: monstas7
   Database Password: 강력한 비밀번호 (예: Monsta2024!@#)
   Region: Northeast Asia (Seoul) - 한국에서 가장 빠름
   Pricing Plan: Free tier
   ```

3. **생성 대기**
   - "Create new project" 클릭
   - 1-2분 정도 기다리면 프로젝트 생성 완료

## 🔑 Step 3: API 키 찾기

1. **왼쪽 메뉴에서**
   - Settings (⚙️ 아이콘) 클릭

2. **API 탭 선택**

3. **필요한 정보 복사**

   **Project URL** (예시):
   ```
   https://xyzabc123456.supabase.co
   ```

   **anon public key** (예시):
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5emFiYzEyMzQ1NiIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjQ2MjM5MDIyLCJleHAiOjE5NjE4MTUwMjJ9.abcdefghijklmnopqrstuvwxyz1234567890
   ```

## 📋 Step 4: 환경변수 설정

1. **VS Code나 메모장으로 .env.local 파일 열기**
   ```
   C:\monsta\monstas7\frontend\.env.local
   ```

2. **아래 부분 찾기**
   ```env
   # Supabase Configuration (필수 - 아래 값을 실제 값으로 교체해주세요!)
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

3. **실제 값으로 교체**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://xyzabc123456.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

## ✅ Step 5: 데이터베이스 테이블 생성

1. **Supabase Dashboard에서**
   - SQL Editor 클릭 (왼쪽 메뉴)

2. **New query 클릭**

3. **migration 파일 내용 복사**
   - `C:\monsta\monstas7\supabase\migrations\001_initial_schema.sql` 파일 내용 전체 복사
   - SQL Editor에 붙여넣기

4. **실행**
   - "Run" 버튼 클릭
   - Success 메시지 확인

## 🔐 Step 6: Authentication 설정 (선택사항)

1. **Authentication 메뉴 클릭**

2. **Providers 탭**
   - Email 활성화 (기본)
   - Google 로그인 추가하려면:
     - Google 토글 ON
     - Google Cloud Console에서 OAuth 설정 필요
   - GitHub 로그인 추가하려면:
     - GitHub 토글 ON
     - GitHub OAuth App 설정 필요

3. **URL Configuration**
   - Site URL: `http://localhost:3000` (개발용)
   - Redirect URLs: `http://localhost:3000/auth/callback`

## 🧪 Step 7: 테스트

1. **프로젝트 재시작**
   ```bash
   cd frontend
   npm run dev
   ```

2. **브라우저에서 확인**
   - http://localhost:3000 접속
   - 콘솔에 에러 없으면 성공!

## ❓ 자주 묻는 질문

### Q: 무료로 얼마나 사용 가능한가요?
- **Database**: 500MB 저장공간
- **Auth**: 월 50,000명 활성 사용자
- **Storage**: 1GB 파일 저장
- **Bandwidth**: 월 2GB
- 개인 프로젝트는 충분!

### Q: API 키가 노출되면 위험한가요?
- **anon key**: 프론트엔드용, 노출되어도 RLS(Row Level Security)로 보호
- **service_role key**: 절대 노출 금지! 백엔드에서만 사용

### Q: 프로덕션 배포 시 주의사항?
1. Site URL을 실제 도메인으로 변경
2. RLS 정책 반드시 설정
3. service_role key는 서버에만 보관

## 🆘 문제 해결

### "Invalid API key" 에러
- API key 복사 시 공백이나 줄바꿈 포함되지 않았는지 확인
- 키 전체를 정확히 복사했는지 확인

### "Connection refused" 에러
- Supabase 프로젝트가 활성화되었는지 확인
- URL이 정확한지 확인 (https:// 포함)

### 테이블이 생성되지 않음
- SQL Editor에서 에러 메시지 확인
- 이미 테이블이 존재하는 경우 DROP TABLE 먼저 실행

## 📚 추가 자료
- [Supabase 공식 문서](https://supabase.com/docs)
- [Next.js + Supabase 튜토리얼](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [RLS 설정 가이드](https://supabase.com/docs/guides/auth/row-level-security)

## 💡 팁
1. **개발 시**: Supabase Dashboard를 항상 열어두고 데이터 확인
2. **Table Editor**: GUI로 데이터 직접 수정 가능
3. **Logs**: Authentication > Logs에서 로그인 시도 확인 가능

---

이제 Supabase가 MONSTA 프로젝트에 통합되었습니다! 🎉