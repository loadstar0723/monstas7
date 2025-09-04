-- MONSTA Trading Platform Database Schema
-- PostgreSQL Database Schema for Real Data Only

-- Users table (본사/총판/대리점/구독자)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('headquarters', 'distributor', 'agency', 'subscriber')),
    subscription_tier VARCHAR(50),
    referrer_id INTEGER REFERENCES users(id),
    referrer_path TEXT,
    commission_rate DECIMAL(5,2) DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    api_key VARCHAR(255),
    api_secret VARCHAR(255)
);

-- Subscription tiers table
CREATE TABLE subscription_tiers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    max_coins INTEGER,
    ai_models_count INTEGER,
    daily_signals INTEGER,
    features JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- AI models configuration
CREATE TABLE ai_models (
    id SERIAL PRIMARY KEY,
    model_name VARCHAR(50) UNIQUE NOT NULL,
    weight DECIMAL(5,2) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Market prices (실시간 바이낸스 데이터 저장)
CREATE TABLE market_prices (
    id SERIAL PRIMARY KEY,
    symbol VARCHAR(20) NOT NULL,
    price DECIMAL(20,8) NOT NULL,
    volume_24h DECIMAL(20,8),
    change_24h DECIMAL(10,2),
    high_24h DECIMAL(20,8),
    low_24h DECIMAL(20,8),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_symbol_updated (symbol, updated_at)
);

-- User portfolios
CREATE TABLE portfolios (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    symbol VARCHAR(20) NOT NULL,
    quantity DECIMAL(20,8) NOT NULL,
    avg_buy_price DECIMAL(20,8) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_symbol (user_id, symbol)
);

-- Trading signals
CREATE TABLE trading_signals (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    model_id INTEGER REFERENCES ai_models(id),
    symbol VARCHAR(20) NOT NULL,
    signal_type VARCHAR(20) NOT NULL CHECK (signal_type IN ('BUY', 'SELL', 'HOLD')),
    confidence DECIMAL(5,2) NOT NULL,
    price_target DECIMAL(20,8),
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Transactions
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    symbol VARCHAR(20) NOT NULL,
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('BUY', 'SELL')),
    quantity DECIMAL(20,8) NOT NULL,
    price DECIMAL(20,8) NOT NULL,
    amount DECIMAL(20,8) NOT NULL,
    fee DECIMAL(20,8),
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Commissions
CREATE TABLE commissions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    from_user_id INTEGER NOT NULL REFERENCES users(id),
    transaction_id INTEGER REFERENCES transactions(id),
    amount DECIMAL(20,8) NOT NULL,
    commission_rate DECIMAL(5,2) NOT NULL,
    level INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Auto trading bots
CREATE TABLE trading_bots (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    bot_name VARCHAR(100) NOT NULL,
    strategy_type VARCHAR(50) NOT NULL,
    config JSONB NOT NULL,
    is_active BOOLEAN DEFAULT true,
    total_profit DECIMAL(20,8) DEFAULT 0,
    total_trades INTEGER DEFAULT 0,
    win_rate DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_run_at TIMESTAMP
);

-- Bot trading history
CREATE TABLE bot_trades (
    id SERIAL PRIMARY KEY,
    bot_id INTEGER NOT NULL REFERENCES trading_bots(id),
    symbol VARCHAR(20) NOT NULL,
    side VARCHAR(10) NOT NULL,
    quantity DECIMAL(20,8) NOT NULL,
    price DECIMAL(20,8) NOT NULL,
    profit DECIMAL(20,8),
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Technical indicators data
CREATE TABLE technical_indicators (
    id SERIAL PRIMARY KEY,
    symbol VARCHAR(20) NOT NULL,
    timeframe VARCHAR(10) NOT NULL,
    indicator_name VARCHAR(50) NOT NULL,
    indicator_value DECIMAL(20,8) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_symbol_timeframe (symbol, timeframe, created_at)
);

-- User sessions
CREATE TABLE user_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    session_token VARCHAR(255) UNIQUE NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- System logs
CREATE TABLE system_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    details JSONB,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_action (user_id, action, created_at)
);

-- Notifications
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default data
INSERT INTO subscription_tiers (name, price, max_coins, ai_models_count, daily_signals, features) VALUES
('Basic', 49000, 5, 3, 10, '{"basic_indicators": true, "backtesting": false}'),
('Standard', 99000, 10, 5, 50, '{"all_indicators": true, "backtesting": true}'),
('Professional', 299000, 20, 8, -1, '{"all_indicators": true, "backtesting": true, "auto_trading": true}'),
('Premium', 599000, 50, 11, -1, '{"all_indicators": true, "backtesting": true, "auto_trading": true, "consulting": true}'),
('VIP', 1499000, -1, 11, -1, '{"all_features": true, "priority_support": true}'),
('Enterprise', 5000000, -1, 11, -1, '{"all_features": true, "custom_models": true, "onsite_training": true}');

INSERT INTO ai_models (model_name, weight, description) VALUES
('LSTM', 15.0, 'Long Short-Term Memory for time series'),
('GRU', 12.0, 'Gated Recurrent Unit for short-term trends'),
('Random Forest', 10.0, 'Feature importance analysis'),
('XGBoost', 10.0, 'Gradient boosting'),
('LightGBM', 10.0, 'Fast gradient boosting'),
('ARIMA', 8.0, 'Time series forecasting'),
('Prophet', 8.0, 'Seasonality analysis'),
('Transformer', 10.0, 'Attention mechanism'),
('BERT', 7.0, 'News sentiment analysis'),
('GAN', 5.0, 'Scenario generation'),
('Ensemble', 5.0, 'Final integration');

-- Create indexes for performance
CREATE INDEX idx_market_prices_symbol ON market_prices(symbol);
CREATE INDEX idx_portfolios_user ON portfolios(user_id);
CREATE INDEX idx_transactions_user ON transactions(user_id);
CREATE INDEX idx_trading_signals_user ON trading_signals(user_id);
CREATE INDEX idx_bot_trades_bot ON bot_trades(bot_id);