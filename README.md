# MONSTA Trading Platform

## 📊 개요
MONSTA는 바이낸스 기반 암호화폐 AI 트레이딩 플랫폼입니다.
🚀 자동 배포 설정 완료! (2025.09.04)

### 주요 특징
- ✅ 11개 AI 모델 통합 예측
- ✅ 실시간 바이낸스 데이터
- ✅ 6단계 구독 티어 시스템
- ✅ 역할 기반 접근 제어 (본사/총판/대리점/구독자)
- ✅ 30+ 기술적 지표
- ✅ 100% 모바일 반응형

## 🚀 시작하기

### 필수 요구사항
- Python 3.10+
- PostgreSQL 14+
- Redis
- 바이낸스 API 키

### 설치
```bash
# 가상환경 생성
python -m venv venv
venv\Scripts\activate  # Windows
source venv/bin/activate  # Linux/Mac

# 의존성 설치
pip install -r requirements.txt

# 환경변수 설정
cp .env.example .env
# .env 파일 수정

# 데이터베이스 초기화
python scripts/init_db.py
```

### 실행
```bash
streamlit run app.py
```

## 📁 프로젝트 구조
```
monsta-trading/
├── app.py              # 메인 애플리케이션
├── pages/              # 모듈화된 페이지
├── components/         # 재사용 컴포넌트
├── services/           # API 연동 서비스
├── config/            # 설정 파일
└── requirements.txt   # 의존성
```

## 🔒 보안
- 모든 API 키는 환경변수로 관리
- 역할 기반 접근 제어 적용
- JWT 토큰 인증

## 📝 라이선스
Proprietary - All rights reserved

## 🤝 문의
MONSTA Team - contact@monsta.trading