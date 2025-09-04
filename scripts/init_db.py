"""
데이터베이스 초기화 스크립트
PostgreSQL 데이터베이스와 테이블을 생성하고 초기 데이터를 삽입
"""

import os
import sys
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
from dotenv import load_dotenv
from pathlib import Path

# 프로젝트 루트 경로 추가
sys.path.append(str(Path(__file__).parent.parent))

# 환경 변수 로드
load_dotenv()


def create_database():
    """데이터베이스 생성"""
    try:
        # 기본 postgres 데이터베이스에 연결
        conn = psycopg2.connect(
            host=os.getenv('DATABASE_HOST', 'localhost'),
            port=os.getenv('DATABASE_PORT', 5432),
            user='postgres',
            password=os.getenv('POSTGRES_PASSWORD', 'postgres')
        )
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cursor = conn.cursor()
        
        # 데이터베이스 존재 확인
        db_name = os.getenv('DATABASE_NAME', 'monsta_db')
        cursor.execute(f"SELECT 1 FROM pg_database WHERE datname = '{db_name}'")
        exists = cursor.fetchone()
        
        if not exists:
            # 데이터베이스 생성
            cursor.execute(f"CREATE DATABASE {db_name}")
            print(f"✅ Database '{db_name}' created successfully")
        else:
            print(f"ℹ️ Database '{db_name}' already exists")
        
        # 사용자 생성 (존재하지 않으면)
        user_name = os.getenv('DATABASE_USER', 'monsta_user')
        user_password = os.getenv('DATABASE_PASSWORD', 'monsta_password')
        
        cursor.execute(f"SELECT 1 FROM pg_user WHERE usename = '{user_name}'")
        user_exists = cursor.fetchone()
        
        if not user_exists:
            cursor.execute(f"CREATE USER {user_name} WITH PASSWORD '{user_password}'")
            print(f"✅ User '{user_name}' created successfully")
        else:
            print(f"ℹ️ User '{user_name}' already exists")
        
        # 권한 부여
        cursor.execute(f"GRANT ALL PRIVILEGES ON DATABASE {db_name} TO {user_name}")
        print(f"✅ Privileges granted to '{user_name}'")
        
        cursor.close()
        conn.close()
        
        return True
        
    except Exception as e:
        print(f"❌ Error creating database: {e}")
        return False


def execute_schema():
    """스키마 SQL 실행"""
    try:
        # 생성된 데이터베이스에 연결
        conn = psycopg2.connect(
            host=os.getenv('DATABASE_HOST', 'localhost'),
            port=os.getenv('DATABASE_PORT', 5432),
            database=os.getenv('DATABASE_NAME', 'monsta_db'),
            user=os.getenv('DATABASE_USER', 'monsta_user'),
            password=os.getenv('DATABASE_PASSWORD', 'monsta_password')
        )
        cursor = conn.cursor()
        
        # 스키마 파일 읽기
        schema_path = Path(__file__).parent.parent / 'database' / 'schema.sql'
        
        if not schema_path.exists():
            print(f"❌ Schema file not found: {schema_path}")
            return False
        
        with open(schema_path, 'r', encoding='utf-8') as f:
            schema_sql = f.read()
        
        # SQL 문 실행
        # PostgreSQL에서 INDEX 구문 수정 필요
        schema_sql = schema_sql.replace('INDEX idx_', 'CREATE INDEX IF NOT EXISTS idx_')
        schema_sql = schema_sql.replace('UNIQUE KEY', 'UNIQUE')
        
        # 각 문장을 개별적으로 실행
        statements = [s.strip() for s in schema_sql.split(';') if s.strip()]
        
        for statement in statements:
            if statement:
                try:
                    cursor.execute(statement)
                except psycopg2.errors.DuplicateTable:
                    print(f"ℹ️ Table already exists, skipping...")
                except psycopg2.errors.DuplicateObject:
                    print(f"ℹ️ Object already exists, skipping...")
                except Exception as e:
                    print(f"⚠️ Warning: {e}")
        
        conn.commit()
        print("✅ Schema executed successfully")
        
        # 테이블 목록 확인
        cursor.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY table_name
        """)
        
        tables = cursor.fetchall()
        print(f"\n📋 Created tables ({len(tables)}):")
        for table in tables:
            print(f"   - {table[0]}")
        
        cursor.close()
        conn.close()
        
        return True
        
    except Exception as e:
        print(f"❌ Error executing schema: {e}")
        return False


def insert_test_data():
    """테스트 데이터 삽입"""
    try:
        conn = psycopg2.connect(
            host=os.getenv('DATABASE_HOST', 'localhost'),
            port=os.getenv('DATABASE_PORT', 5432),
            database=os.getenv('DATABASE_NAME', 'monsta_db'),
            user=os.getenv('DATABASE_USER', 'monsta_user'),
            password=os.getenv('DATABASE_PASSWORD', 'monsta_password')
        )
        cursor = conn.cursor()
        
        # 테스트 사용자 생성
        test_users = [
            ('admin@monsta.com', 'headquarters', None),
            ('distributor@monsta.com', 'distributor', 'Premium'),
            ('agency@monsta.com', 'agency', 'Professional'),
            ('user@monsta.com', 'subscriber', 'Standard'),
        ]
        
        for email, role, tier in test_users:
            cursor.execute("""
                INSERT INTO users (email, password_hash, role, subscription_tier)
                VALUES (%s, %s, %s, %s)
                ON CONFLICT (email) DO NOTHING
            """, (email, 'hashed_password_here', role, tier))
        
        conn.commit()
        print("✅ Test data inserted successfully")
        
        cursor.close()
        conn.close()
        
        return True
        
    except Exception as e:
        print(f"⚠️ Warning inserting test data: {e}")
        return True  # Not critical if test data fails


def main():
    """메인 실행 함수"""
    print("🚀 Starting database initialization...")
    print("=" * 50)
    
    # 1. 데이터베이스 생성
    if not create_database():
        print("❌ Failed to create database")
        sys.exit(1)
    
    # 2. 스키마 실행
    if not execute_schema():
        print("❌ Failed to execute schema")
        sys.exit(1)
    
    # 3. 테스트 데이터 삽입
    insert_test_data()
    
    print("=" * 50)
    print("✅ Database initialization completed successfully!")
    print("\nYou can now run the application with:")
    print("  streamlit run app.py")


if __name__ == "__main__":
    main()