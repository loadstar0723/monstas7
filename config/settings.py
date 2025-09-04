"""
MONSTA 플랫폼 설정 파일
모든 설정값은 환경변수 또는 데이터베이스에서 가져옴
"""

import os
from pathlib import Path
from dotenv import load_dotenv

# .env 파일 로드
load_dotenv()

# 프로젝트 루트 디렉토리
BASE_DIR = Path(__file__).parent.parent

# 환경 설정
APP_ENV = os.getenv('APP_ENV', 'development')
DEBUG = os.getenv('APP_DEBUG', 'True').lower() == 'true'

# 데이터베이스 설정
DATABASE_CONFIG = {
    'host': os.getenv('DATABASE_HOST', 'localhost'),
    'port': int(os.getenv('DATABASE_PORT', 5432)),
    'database': os.getenv('DATABASE_NAME', 'monsta_db'),
    'user': os.getenv('DATABASE_USER', 'monsta_user'),
    'password': os.getenv('DATABASE_PASSWORD', ''),
}

# Redis 설정
REDIS_CONFIG = {
    'host': os.getenv('REDIS_HOST', 'localhost'),
    'port': int(os.getenv('REDIS_PORT', 6379)),
    'password': os.getenv('REDIS_PASSWORD', None),
    'decode_responses': True,
}

# 바이낸스 API 설정
BINANCE_CONFIG = {
    'api_key': os.getenv('BINANCE_API_KEY', ''),
    'secret_key': os.getenv('BINANCE_SECRET_KEY', ''),
    'testnet': os.getenv('BINANCE_TESTNET', 'False').lower() == 'true',
}

# JWT 설정
JWT_CONFIG = {
    'secret_key': os.getenv('JWT_SECRET_KEY', 'your-secret-key'),
    'expiration_hours': int(os.getenv('JWT_EXPIRATION_HOURS', 24)),
    'algorithm': 'HS256',
}

# API 제한 설정
RATE_LIMIT = {
    'per_minute': int(os.getenv('API_RATE_LIMIT_PER_MINUTE', 60)),
    'per_hour': int(os.getenv('API_RATE_LIMIT_PER_HOUR', 1000)),
}

# 역할 정의
USER_ROLES = {
    'HEADQUARTERS': 'headquarters',  # 본사
    'DISTRIBUTOR': 'distributor',    # 총판
    'AGENCY': 'agency',               # 대리점
    'SUBSCRIBER': 'subscriber',       # 구독자
}

# 구독 티어 정의 (가격은 DB에서 실시간으로 가져옴)
SUBSCRIPTION_TIERS = [
    'Basic',
    'Standard',
    'Professional',
    'Premium',
    'VIP',
    'Enterprise'
]

# AI 모델 설정 (가중치는 DB에서 실시간으로 가져옴)
AI_MODELS = [
    'LSTM',
    'GRU',
    'Random Forest',
    'XGBoost',
    'LightGBM',
    'ARIMA',
    'Prophet',
    'Transformer',
    'BERT',
    'GAN',
    'Ensemble'
]

# 기술적 지표 목록
TECHNICAL_INDICATORS = [
    # 이동평균선
    'SMA', 'EMA', 'WMA', 'VWMA',
    # 모멘텀
    'RSI', 'MACD', 'Stochastic', 'CCI', 'Williams %R',
    # 변동성
    'Bollinger Bands', 'ATR', 'Keltner Channel', 'Donchian Channel',
    # 볼륨
    'OBV', 'CMF', 'VWAP', 'Volume Profile',
    # 추세
    'ADX', 'Aroon', 'Ichimoku', 'Parabolic SAR',
    # 시장 미시구조
    'Order Flow Imbalance', 'Market Depth', 'Liquidity Heatmap', 'Whale Movement'
]

# 로깅 설정
LOGGING_CONFIG = {
    'level': os.getenv('LOG_LEVEL', 'INFO'),
    'file': os.getenv('LOG_FILE', 'logs/monsta.log'),
    'format': '%(asctime)s - %(name)s - %(levelname)s - %(message)s',
}

# Streamlit 설정
STREAMLIT_CONFIG = {
    'page_title': 'MONSTA Trading Platform',
    'page_icon': '📊',
    'layout': 'wide',
    'initial_sidebar_state': 'expanded',
}

# 세션 설정
SESSION_CONFIG = {
    'timeout_minutes': 60,
    'max_sessions_per_user': 3,
}

# 텔레그램 봇 설정 (선택사항)
TELEGRAM_CONFIG = {
    'bot_token': os.getenv('TELEGRAM_BOT_TOKEN', ''),
    'chat_id': os.getenv('TELEGRAM_CHAT_ID', ''),
    'enabled': bool(os.getenv('TELEGRAM_BOT_TOKEN', '')),
}