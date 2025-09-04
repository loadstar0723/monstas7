"""
데이터베이스 초기화 스크립트
테이블 생성 및 초기 데이터 삽입
"""

import psycopg2
import os
import hashlib
from datetime import datetime, timedelta
import random

def get_connection():
    """데이터베이스 연결"""
    return psycopg2.connect(
        host=os.getenv('DB_HOST', 'localhost'),
        port=os.getenv('DB_PORT', '5432'),
        database=os.getenv('DB_NAME', 'monsta_db'),
        user=os.getenv('DB_USER', 'monsta'),
        password=os.getenv('DB_PASSWORD', 'monsta123')
    )

def create_database():
    """데이터베이스 생성"""
    try:
        # postgres 데이터베이스에 연결
        conn = psycopg2.connect(
            host=os.getenv('DB_HOST', 'localhost'),
            port=os.getenv('DB_PORT', '5432'),
            database='postgres',
            user=os.getenv('DB_USER', 'monsta'),
            password=os.getenv('DB_PASSWORD', 'monsta123')
        )
        conn.autocommit = True
        cur = conn.cursor()
        
        # 데이터베이스 존재 확인
        cur.execute("SELECT 1 FROM pg_database WHERE datname = 'monsta_db'")
        exists = cur.fetchone()
        
        if not exists:
            cur.execute("CREATE DATABASE monsta_db")
            print("✅ Database 'monsta_db' created successfully")
        else:
            print("ℹ️ Database 'monsta_db' already exists")
        
        cur.close()
        conn.close()
        
    except Exception as e:
        print(f"❌ Error creating database: {e}")
        return False
    
    return True

def create_tables():
    """테이블 생성"""
    try:
        conn = get_connection()
        cur = conn.cursor()
        
        # SQL 파일 읽기
        with open('scripts/create_tables.sql', 'r', encoding='utf-8') as f:
            sql = f.read()
        
        # 테이블 생성
        cur.execute(sql)
        conn.commit()
        
        print("✅ All tables created successfully")
        
        cur.close()
        conn.close()
        
    except Exception as e:
        print(f"❌ Error creating tables: {e}")
        return False
    
    return True

def insert_initial_data():
    """초기 데이터 삽입"""
    try:
        conn = get_connection()
        cur = conn.cursor()
        
        # 1. 본사 계정 생성
        password_hash = hashlib.sha256('admin123'.encode()).hexdigest()
        cur.execute("""
            INSERT INTO users (username, email, password_hash, role, status)
            VALUES ('admin', 'admin@monsta.com', %s, 'headquarters', 'active')
            ON CONFLICT (email) DO NOTHING
            RETURNING id
        """, (password_hash,))
        
        result = cur.fetchone()
        if result:
            print(f"✅ Headquarters account created (ID: {result[0]})")
        
        # 2. 총판 계정 생성
        for i in range(1, 4):
            password_hash = hashlib.sha256(f'dist{i}123'.encode()).hexdigest()
            cur.execute("""
                INSERT INTO users (username, email, password_hash, role, status)
                VALUES (%s, %s, %s, 'distributor', 'active')
                ON CONFLICT (email) DO NOTHING
                RETURNING id
            """, (f'distributor{i}', f'dist{i}@monsta.com', password_hash))
            
            user_id = cur.fetchone()
            if user_id:
                # 총판 정보 추가
                cur.execute("""
                    INSERT INTO distributors (user_id, name, commission_rate)
                    VALUES (%s, %s, %s)
                    RETURNING id
                """, (user_id[0], f'총판 {i}', 40.0))
                
                dist_id = cur.fetchone()
                print(f"✅ Distributor {i} created (ID: {dist_id[0]})")
                
                # 3. 각 총판당 대리점 생성
                for j in range(1, 6):
                    password_hash = hashlib.sha256(f'agency{i}{j}123'.encode()).hexdigest()
                    cur.execute("""
                        INSERT INTO users (username, email, password_hash, role, status)
                        VALUES (%s, %s, %s, 'agency', 'active')
                        ON CONFLICT (email) DO NOTHING
                        RETURNING id
                    """, (f'agency{i}_{j}', f'agency{i}_{j}@monsta.com', password_hash))
                    
                    agency_user_id = cur.fetchone()
                    if agency_user_id:
                        # 대리점 정보 추가
                        grades = ['Gold', 'Silver', 'Bronze']
                        cur.execute("""
                            INSERT INTO agencies (distributor_id, user_id, name, grade, commission_rate)
                            VALUES (%s, %s, %s, %s, %s)
                            RETURNING id
                        """, (dist_id[0], agency_user_id[0], f'대리점 {i}-{j}', 
                              random.choice(grades), 35.0))
                        
                        agency_id = cur.fetchone()
                        
                        # 4. 각 대리점당 회원 생성
                        for k in range(1, 11):
                            password_hash = hashlib.sha256(f'user{i}{j}{k}123'.encode()).hexdigest()
                            cur.execute("""
                                INSERT INTO users (username, email, password_hash, phone, role, status)
                                VALUES (%s, %s, %s, %s, 'subscriber', 'active')
                                ON CONFLICT (email) DO NOTHING
                                RETURNING id
                            """, (f'user{i}_{j}_{k}', f'user{i}_{j}_{k}@example.com', 
                                  password_hash, f'010-{random.randint(1000,9999)}-{random.randint(1000,9999)}'))
                            
                            sub_user_id = cur.fetchone()
                            if sub_user_id:
                                # 회원-대리점 연결
                                cur.execute("""
                                    INSERT INTO user_agencies (user_id, agency_id)
                                    VALUES (%s, %s)
                                    ON CONFLICT DO NOTHING
                                """, (sub_user_id[0], agency_id[0]))
                                
                                # 구독 정보 추가
                                tiers = ['Basic', 'Standard', 'Professional', 'Premium', 'VIP']
                                tier_prices = {
                                    'Basic': 49000,
                                    'Standard': 99000,
                                    'Professional': 299000,
                                    'Premium': 599000,
                                    'VIP': 1499000
                                }
                                tier = random.choice(tiers)
                                
                                cur.execute("""
                                    INSERT INTO subscriptions 
                                    (user_id, agency_id, tier, monthly_fee, status, start_date, end_date)
                                    VALUES (%s, %s, %s, %s, 'active', CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days')
                                """, (sub_user_id[0], agency_id[0], tier, tier_prices[tier]))
        
        # 5. 샘플 거래 신호 생성
        symbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'ADAUSDT', 'DOGEUSDT']
        models = ['LSTM', 'GRU', 'XGBoost', 'Prophet', 'Ensemble']
        
        for _ in range(20):
            symbol = random.choice(symbols)
            signal_type = random.choice(['BUY', 'SELL', 'HOLD'])
            price = random.uniform(0.1, 50000)
            
            cur.execute("""
                INSERT INTO trading_signals 
                (symbol, signal_type, price, target_price, stop_loss, confidence, ai_model)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
            """, (symbol, signal_type, price, price * 1.05, price * 0.95, 
                  random.uniform(60, 95), random.choice(models)))
        
        conn.commit()
        print("✅ Initial data inserted successfully")
        
        # 통계 출력
        cur.execute("SELECT COUNT(*) FROM users WHERE role = 'distributor'")
        dist_count = cur.fetchone()[0]
        
        cur.execute("SELECT COUNT(*) FROM users WHERE role = 'agency'")
        agency_count = cur.fetchone()[0]
        
        cur.execute("SELECT COUNT(*) FROM users WHERE role = 'subscriber'")
        sub_count = cur.fetchone()[0]
        
        print(f"\n📊 Database Statistics:")
        print(f"   - Distributors: {dist_count}")
        print(f"   - Agencies: {agency_count}")
        print(f"   - Subscribers: {sub_count}")
        print(f"   - Total Users: {1 + dist_count + agency_count + sub_count}")
        
        cur.close()
        conn.close()
        
    except Exception as e:
        print(f"❌ Error inserting initial data: {e}")
        return False
    
    return True

def main():
    """메인 실행 함수"""
    print("🚀 Starting database initialization...")
    print("-" * 50)
    
    # 1. 데이터베이스 생성
    if not create_database():
        return
    
    # 2. 테이블 생성
    if not create_tables():
        return
    
    # 3. 초기 데이터 삽입
    if not insert_initial_data():
        return
    
    print("-" * 50)
    print("✨ Database initialization completed successfully!")
    print("\n📝 Login Credentials:")
    print("   Headquarters: admin@monsta.com / admin123")
    print("   Distributor1: dist1@monsta.com / dist1123")
    print("   Agency1_1: agency1_1@monsta.com / agency11123")
    print("   User1_1_1: user1_1_1@example.com / user111123")

if __name__ == "__main__":
    main()