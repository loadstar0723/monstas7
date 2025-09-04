"""
PostgreSQL 데이터베이스 연결 및 관리
실제 데이터베이스에서만 데이터 조회
"""

import psycopg2
from psycopg2.extras import RealDictCursor
from psycopg2.pool import SimpleConnectionPool
import streamlit as st
from contextlib import contextmanager
from config import DATABASE_CONFIG
import logging

logger = logging.getLogger(__name__)


class DatabaseManager:
    """데이터베이스 연결 관리자"""
    
    def __init__(self):
        self.pool = None
        self.initialize_pool()
    
    def initialize_pool(self):
        """연결 풀 초기화"""
        try:
            self.pool = SimpleConnectionPool(
                1, 20,  # 최소 1개, 최대 20개 연결
                host=DATABASE_CONFIG['host'],
                port=DATABASE_CONFIG['port'],
                database=DATABASE_CONFIG['database'],
                user=DATABASE_CONFIG['user'],
                password=DATABASE_CONFIG['password']
            )
            logger.info("Database connection pool initialized")
        except Exception as e:
            logger.error(f"Failed to initialize database pool: {e}")
            st.error(f"데이터베이스 연결 실패: {e}")
    
    @contextmanager
    def get_connection(self):
        """연결 컨텍스트 매니저"""
        connection = None
        try:
            connection = self.pool.getconn()
            yield connection
            connection.commit()
        except Exception as e:
            if connection:
                connection.rollback()
            logger.error(f"Database error: {e}")
            raise
        finally:
            if connection:
                self.pool.putconn(connection)
    
    def execute_query(self, query, params=None):
        """쿼리 실행 및 결과 반환"""
        with self.get_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cursor:
                cursor.execute(query, params)
                if cursor.description:
                    return cursor.fetchall()
                return None
    
    def execute_one(self, query, params=None):
        """단일 결과 반환"""
        with self.get_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cursor:
                cursor.execute(query, params)
                if cursor.description:
                    return cursor.fetchone()
                return None
    
    def execute_insert(self, query, params=None):
        """INSERT 쿼리 실행"""
        with self.get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute(query, params)
                if cursor.description:
                    return cursor.fetchone()[0]
                return None
    
    def execute_many(self, query, params_list):
        """여러 쿼리 일괄 실행"""
        with self.get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.executemany(query, params_list)
    
    def close_all(self):
        """모든 연결 종료"""
        if self.pool:
            self.pool.closeall()
            logger.info("All database connections closed")


# 싱글톤 인스턴스
@st.cache_resource
def get_db_manager():
    """데이터베이스 매니저 싱글톤 인스턴스 반환"""
    return DatabaseManager()


# 헬퍼 함수들

def get_user_by_email(email):
    """이메일로 사용자 조회"""
    db = get_db_manager()
    query = """
        SELECT id, email, password_hash, role, subscription_tier, 
               created_at, last_login, is_active
        FROM users 
        WHERE email = %s AND is_active = true
    """
    return db.execute_one(query, (email,))


def get_user_role(user_id):
    """사용자 역할 조회"""
    db = get_db_manager()
    query = "SELECT role FROM users WHERE id = %s"
    result = db.execute_one(query, (user_id,))
    return result['role'] if result else None


def get_subscription_tier_details(tier_name):
    """구독 티어 상세 정보 조회"""
    db = get_db_manager()
    query = """
        SELECT name, price, max_coins, ai_models_count, 
               daily_signals, features
        FROM subscription_tiers 
        WHERE name = %s AND is_active = true
    """
    return db.execute_one(query, (tier_name,))


def get_ai_model_weights():
    """AI 모델 가중치 조회"""
    db = get_db_manager()
    query = """
        SELECT model_name, weight, description, is_active
        FROM ai_models 
        WHERE is_active = true
        ORDER BY weight DESC
    """
    return db.execute_query(query)


def get_real_time_prices(symbols):
    """실시간 가격 데이터 조회 (최근 DB 저장값)"""
    db = get_db_manager()
    placeholders = ','.join(['%s'] * len(symbols))
    query = f"""
        SELECT symbol, price, volume_24h, change_24h, 
               high_24h, low_24h, updated_at
        FROM market_prices 
        WHERE symbol IN ({placeholders})
        AND updated_at > NOW() - INTERVAL '1 minute'
    """
    return db.execute_query(query, symbols)


def get_user_portfolio(user_id):
    """사용자 포트폴리오 조회"""
    db = get_db_manager()
    query = """
        SELECT p.*, mp.price as current_price,
               (p.quantity * mp.price) as current_value,
               ((mp.price - p.avg_buy_price) / p.avg_buy_price * 100) as pnl_percentage
        FROM portfolios p
        JOIN market_prices mp ON p.symbol = mp.symbol
        WHERE p.user_id = %s AND p.quantity > 0
        ORDER BY current_value DESC
    """
    return db.execute_query(query, (user_id,))


def get_trading_signals(user_id, limit=10):
    """AI 트레이딩 시그널 조회"""
    db = get_db_manager()
    query = """
        SELECT s.*, m.model_name, m.weight as model_weight
        FROM trading_signals s
        JOIN ai_models m ON s.model_id = m.id
        WHERE s.user_id = %s OR s.is_public = true
        ORDER BY s.created_at DESC
        LIMIT %s
    """
    return db.execute_query(query, (user_id, limit))


def get_dashboard_stats(role, user_id):
    """역할별 대시보드 통계 조회"""
    db = get_db_manager()
    
    if role == 'headquarters':
        query = """
            SELECT 
                (SELECT COUNT(*) FROM users WHERE is_active = true) as total_users,
                (SELECT COUNT(*) FROM users WHERE role = 'subscriber' AND is_active = true) as total_subscribers,
                (SELECT SUM(amount) FROM transactions WHERE status = 'completed' AND date_trunc('month', created_at) = date_trunc('month', CURRENT_DATE)) as monthly_revenue,
                (SELECT COUNT(*) FROM trading_signals WHERE date_trunc('day', created_at) = date_trunc('day', CURRENT_DATE)) as today_signals
        """
    elif role == 'distributor':
        query = """
            SELECT 
                (SELECT COUNT(*) FROM users WHERE referrer_id = %s AND role = 'agency') as total_agencies,
                (SELECT COUNT(*) FROM users WHERE referrer_path LIKE %s AND role = 'subscriber') as total_subscribers,
                (SELECT SUM(amount * commission_rate) FROM commissions WHERE user_id = %s AND date_trunc('month', created_at) = date_trunc('month', CURRENT_DATE)) as monthly_commission,
                (SELECT COUNT(*) FROM users WHERE referrer_id = %s AND date_trunc('month', created_at) = date_trunc('month', CURRENT_DATE)) as new_signups
        """
        referrer_path = f"{user_id}/%"
        return db.execute_one(query, (user_id, referrer_path, user_id, user_id))
    elif role == 'agency':
        query = """
            SELECT 
                (SELECT COUNT(*) FROM users WHERE referrer_id = %s AND role = 'subscriber') as total_subscribers,
                (SELECT COUNT(*) FROM users WHERE referrer_id = %s AND subscription_tier IS NOT NULL) as active_subscribers,
                (SELECT SUM(amount * commission_rate) FROM commissions WHERE user_id = %s AND date_trunc('month', created_at) = date_trunc('month', CURRENT_DATE)) as monthly_commission,
                (SELECT COUNT(*) FROM users WHERE referrer_id = %s AND date_trunc('week', created_at) = date_trunc('week', CURRENT_DATE)) as weekly_signups
        """
        return db.execute_one(query, (user_id, user_id, user_id, user_id))
    else:  # subscriber
        query = """
            SELECT 
                (SELECT SUM(quantity * mp.price) FROM portfolios p JOIN market_prices mp ON p.symbol = mp.symbol WHERE p.user_id = %s) as portfolio_value,
                (SELECT SUM((mp.price - p.avg_buy_price) * p.quantity) FROM portfolios p JOIN market_prices mp ON p.symbol = mp.symbol WHERE p.user_id = %s) as total_pnl,
                (SELECT COUNT(*) FROM trading_signals WHERE user_id = %s AND date_trunc('day', created_at) = date_trunc('day', CURRENT_DATE)) as today_signals,
                (SELECT COUNT(*) FROM transactions WHERE user_id = %s AND status = 'completed' AND date_trunc('day', created_at) = date_trunc('day', CURRENT_DATE)) as today_trades
        """
        return db.execute_one(query, (user_id, user_id, user_id, user_id))
    
    return db.execute_one(query)