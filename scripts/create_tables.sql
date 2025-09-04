-- PostgreSQL Database Schema for MONSTA Platform
-- 실제 데이터베이스 테이블 생성 스크립트

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(20) NOT NULL CHECK (role IN ('headquarters', 'distributor', 'agency', 'subscriber')),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    activity_score DECIMAL(5,2) DEFAULT 0,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Distributors table
CREATE TABLE IF NOT EXISTS distributors (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    business_number VARCHAR(50),
    address TEXT,
    bank_account VARCHAR(100),
    commission_rate DECIMAL(5,2) DEFAULT 40.0,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Agencies table
CREATE TABLE IF NOT EXISTS agencies (
    id SERIAL PRIMARY KEY,
    distributor_id INTEGER REFERENCES distributors(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    grade VARCHAR(20) DEFAULT 'Bronze' CHECK (grade IN ('Gold', 'Silver', 'Bronze')),
    commission_rate DECIMAL(5,2) DEFAULT 35.0,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User-Agency relationship
CREATE TABLE IF NOT EXISTS user_agencies (
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    agency_id INTEGER REFERENCES agencies(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, agency_id)
);

-- Subscriptions table  
CREATE TABLE IF NOT EXISTS subscriptions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    agency_id INTEGER REFERENCES agencies(id),
    tier VARCHAR(20) NOT NULL CHECK (tier IN ('Basic', 'Standard', 'Professional', 'Premium', 'VIP', 'Enterprise')),
    monthly_fee DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'pending', 'cancelled', 'expired')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Trading signals table
CREATE TABLE IF NOT EXISTS trading_signals (
    id SERIAL PRIMARY KEY,
    symbol VARCHAR(20) NOT NULL,
    signal_type VARCHAR(10) CHECK (signal_type IN ('BUY', 'SELL', 'HOLD')),
    price DECIMAL(20,8) NOT NULL,
    target_price DECIMAL(20,8),
    stop_loss DECIMAL(20,8),
    confidence DECIMAL(5,2),
    ai_model VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Trades table
CREATE TABLE IF NOT EXISTS trades (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    signal_id INTEGER REFERENCES trading_signals(id),
    symbol VARCHAR(20) NOT NULL,
    trade_type VARCHAR(10) CHECK (trade_type IN ('BUY', 'SELL')),
    quantity DECIMAL(20,8) NOT NULL,
    price DECIMAL(20,8) NOT NULL,
    total_amount DECIMAL(20,8) NOT NULL,
    profit_loss DECIMAL(20,8) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'pending',
    executed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Commissions table
CREATE TABLE IF NOT EXISTS commissions (
    id SERIAL PRIMARY KEY,
    distributor_id INTEGER REFERENCES distributors(id),
    agency_id INTEGER REFERENCES agencies(id),
    user_id INTEGER REFERENCES users(id),
    commission_amount DECIMAL(15,2) NOT NULL,
    commission_rate DECIMAL(5,2) NOT NULL,
    trade_volume DECIMAL(20,2),
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Agency commissions
CREATE TABLE IF NOT EXISTS agency_commissions (
    id SERIAL PRIMARY KEY,
    agency_id INTEGER REFERENCES agencies(id),
    user_id INTEGER REFERENCES users(id),
    commission_amount DECIMAL(15,2) NOT NULL,
    commission_rate DECIMAL(5,2) NOT NULL,
    trade_volume DECIMAL(20,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Settlements table
CREATE TABLE IF NOT EXISTS settlements (
    id SERIAL PRIMARY KEY,
    distributor_id INTEGER REFERENCES distributors(id),
    settlement_date DATE NOT NULL,
    total_sales DECIMAL(15,2) NOT NULL,
    commission_amount DECIMAL(15,2) NOT NULL,
    incentive_amount DECIMAL(15,2) DEFAULT 0,
    tax_amount DECIMAL(15,2) DEFAULT 0,
    net_amount DECIMAL(15,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    paid_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Agency settlements
CREATE TABLE IF NOT EXISTS agency_settlements (
    id SERIAL PRIMARY KEY,
    agency_id INTEGER REFERENCES agencies(id),
    settlement_date DATE NOT NULL,
    total_sales DECIMAL(15,2) NOT NULL,
    commission_amount DECIMAL(15,2) NOT NULL,
    incentive_amount DECIMAL(15,2) DEFAULT 0,
    tax_amount DECIMAL(15,2) DEFAULT 0,
    net_amount DECIMAL(15,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    paid_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Incentive targets
CREATE TABLE IF NOT EXISTS incentive_targets (
    id SERIAL PRIMARY KEY,
    distributor_id INTEGER REFERENCES distributors(id),
    target_name VARCHAR(255) NOT NULL,
    target_amount DECIMAL(15,2) NOT NULL,
    current_amount DECIMAL(15,2) DEFAULT 0,
    incentive_amount DECIMAL(15,2) NOT NULL,
    deadline DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Agency incentive targets
CREATE TABLE IF NOT EXISTS agency_incentive_targets (
    id SERIAL PRIMARY KEY,
    agency_id INTEGER REFERENCES agencies(id),
    target_name VARCHAR(255) NOT NULL,
    target_type VARCHAR(50),
    target_amount DECIMAL(15,2) NOT NULL,
    current_amount DECIMAL(15,2) DEFAULT 0,
    incentive_amount DECIMAL(15,2) NOT NULL,
    deadline DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Incentive history
CREATE TABLE IF NOT EXISTS incentive_history (
    id SERIAL PRIMARY KEY,
    distributor_id INTEGER REFERENCES distributors(id),
    incentive_type VARCHAR(50),
    achievement_detail TEXT,
    amount DECIMAL(15,2) NOT NULL,
    received_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Agency incentive history
CREATE TABLE IF NOT EXISTS agency_incentive_history (
    id SERIAL PRIMARY KEY,
    agency_id INTEGER REFERENCES agencies(id),
    incentive_type VARCHAR(50),
    achievement_detail TEXT,
    amount DECIMAL(15,2) NOT NULL,
    received_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Revenue records
CREATE TABLE IF NOT EXISTS revenue_records (
    id SERIAL PRIMARY KEY,
    distributor_id INTEGER REFERENCES distributors(id),
    agency_id INTEGER REFERENCES agencies(id),
    revenue_type VARCHAR(50),
    amount DECIMAL(15,2) NOT NULL,
    user_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Agency revenue
CREATE TABLE IF NOT EXISTS agency_revenue (
    id SERIAL PRIMARY KEY,
    agency_id INTEGER REFERENCES agencies(id),
    revenue_type VARCHAR(50),
    amount DECIMAL(15,2) NOT NULL,
    user_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Campaigns table
CREATE TABLE IF NOT EXISTS campaigns (
    id SERIAL PRIMARY KEY,
    distributor_id INTEGER REFERENCES distributors(id),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50),
    target_audience VARCHAR(50),
    budget DECIMAL(15,2),
    current_spend DECIMAL(15,2) DEFAULT 0,
    start_date DATE,
    end_date DATE,
    discount_rate DECIMAL(5,2),
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Campaign results
CREATE TABLE IF NOT EXISTS campaign_results (
    id SERIAL PRIMARY KEY,
    campaign_id INTEGER REFERENCES campaigns(id),
    user_id INTEGER REFERENCES users(id),
    conversion_value DECIMAL(15,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Referrals table
CREATE TABLE IF NOT EXISTS referrals (
    id SERIAL PRIMARY KEY,
    referrer_id INTEGER REFERENCES users(id),
    referred_id INTEGER REFERENCES users(id),
    reward_amount DECIMAL(15,2),
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Agency referrals
CREATE TABLE IF NOT EXISTS agency_referrals (
    id SERIAL PRIMARY KEY,
    agency_id INTEGER REFERENCES agencies(id),
    referrer_id INTEGER REFERENCES users(id),
    referred_id INTEGER REFERENCES users(id),
    reward_amount DECIMAL(15,2),
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Churn predictions
CREATE TABLE IF NOT EXISTS churn_predictions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    churn_probability DECIMAL(5,4),
    prediction_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Activity logs
CREATE TABLE IF NOT EXISTS activity_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    activity_type VARCHAR(50),
    details TEXT,
    duration_seconds INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- API usage logs
CREATE TABLE IF NOT EXISTS api_usage_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    endpoint VARCHAR(255),
    response_time_ms INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Feature usage
CREATE TABLE IF NOT EXISTS feature_usage (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    feature_name VARCHAR(100),
    usage_count INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Agency events
CREATE TABLE IF NOT EXISTS agency_events (
    id SERIAL PRIMARY KEY,
    agency_id INTEGER REFERENCES agencies(id),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50),
    start_date DATE,
    end_date DATE,
    discount_rate DECIMAL(5,2),
    target_tier VARCHAR(100),
    min_purchase DECIMAL(15,2),
    description TEXT,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Event participation
CREATE TABLE IF NOT EXISTS event_participation (
    id SERIAL PRIMARY KEY,
    event_id INTEGER REFERENCES agency_events(id),
    user_id INTEGER REFERENCES users(id),
    benefit_amount DECIMAL(15,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Agency coupons
CREATE TABLE IF NOT EXISTS agency_coupons (
    id SERIAL PRIMARY KEY,
    agency_id INTEGER REFERENCES agencies(id),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255),
    type VARCHAR(50),
    discount_value DECIMAL(15,2),
    discount_amount DECIMAL(15,2),
    expiry_date DATE,
    used_date DATE,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Market data cache
CREATE TABLE IF NOT EXISTS market_data_cache (
    id SERIAL PRIMARY KEY,
    symbol VARCHAR(20) NOT NULL,
    timeframe VARCHAR(10),
    open_price DECIMAL(20,8),
    high_price DECIMAL(20,8),
    low_price DECIMAL(20,8),
    close_price DECIMAL(20,8),
    volume DECIMAL(20,8),
    timestamp TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(symbol, timeframe, timestamp)
);

-- Technical indicators
CREATE TABLE IF NOT EXISTS technical_indicators (
    id SERIAL PRIMARY KEY,
    symbol VARCHAR(20) NOT NULL,
    timeframe VARCHAR(10),
    indicator_name VARCHAR(50),
    indicator_value DECIMAL(20,8),
    timestamp TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- AI predictions
CREATE TABLE IF NOT EXISTS ai_predictions (
    id SERIAL PRIMARY KEY,
    symbol VARCHAR(20) NOT NULL,
    model_name VARCHAR(50),
    prediction_type VARCHAR(50),
    predicted_value DECIMAL(20,8),
    confidence_score DECIMAL(5,4),
    prediction_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_trades_user_id ON trades(user_id);
CREATE INDEX idx_trades_symbol ON trades(symbol);
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_commissions_distributor_id ON commissions(distributor_id);
CREATE INDEX idx_commissions_agency_id ON commissions(agency_id);
CREATE INDEX idx_market_data_symbol_time ON market_data_cache(symbol, timeframe, timestamp);
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id, created_at);