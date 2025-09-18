-- MONSTA AI Trading System Database Schema

-- Users table (사용자 관리)
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'subscriber', -- admin, partner, agent, subscriber
    subscription_tier VARCHAR(50) DEFAULT 'free', -- free, silver, gold, platinum, diamond, black
    api_key VARCHAR(255) UNIQUE,
    binance_api_key VARCHAR(255),
    binance_secret_key VARCHAR(255),
    telegram_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

-- Market data table (시장 데이터)
CREATE TABLE IF NOT EXISTS market_data (
    id SERIAL PRIMARY KEY,
    symbol VARCHAR(20) NOT NULL,
    price DECIMAL(20, 8) NOT NULL,
    volume DECIMAL(20, 8),
    high_24h DECIMAL(20, 8),
    low_24h DECIMAL(20, 8),
    change_24h DECIMAL(10, 4),
    change_percent_24h DECIMAL(10, 4),
    market_cap DECIMAL(20, 2),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    source VARCHAR(50) DEFAULT 'binance',
    INDEX idx_symbol_timestamp (symbol, timestamp)
);

-- OHLCV Klines data (캔들스틱 데이터)
CREATE TABLE IF NOT EXISTS klines (
    id SERIAL PRIMARY KEY,
    symbol VARCHAR(20) NOT NULL,
    interval VARCHAR(10) NOT NULL, -- 1m, 5m, 15m, 1h, 4h, 1d
    open_time TIMESTAMP NOT NULL,
    open DECIMAL(20, 8) NOT NULL,
    high DECIMAL(20, 8) NOT NULL,
    low DECIMAL(20, 8) NOT NULL,
    close DECIMAL(20, 8) NOT NULL,
    volume DECIMAL(20, 8) NOT NULL,
    close_time TIMESTAMP NOT NULL,
    quote_volume DECIMAL(20, 8),
    trades_count INTEGER,
    taker_buy_volume DECIMAL(20, 8),
    taker_buy_quote_volume DECIMAL(20, 8),
    UNIQUE KEY unique_kline (symbol, interval, open_time),
    INDEX idx_symbol_interval_time (symbol, interval, open_time)
);

-- Trading signals (트레이딩 시그널)
CREATE TABLE IF NOT EXISTS trading_signals (
    id SERIAL PRIMARY KEY,
    symbol VARCHAR(20) NOT NULL,
    signal_type VARCHAR(50) NOT NULL, -- whale_tracker, smart_money, liquidation, etc.
    direction VARCHAR(10) NOT NULL, -- buy, sell, hold
    strength DECIMAL(5, 2), -- 0-100 signal strength
    entry_price DECIMAL(20, 8),
    stop_loss DECIMAL(20, 8),
    take_profit_1 DECIMAL(20, 8),
    take_profit_2 DECIMAL(20, 8),
    take_profit_3 DECIMAL(20, 8),
    confidence DECIMAL(5, 2), -- 0-100 confidence level
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    INDEX idx_symbol_created (symbol, created_at)
);

-- AI predictions (AI 예측)
CREATE TABLE IF NOT EXISTS ai_predictions (
    id SERIAL PRIMARY KEY,
    symbol VARCHAR(20) NOT NULL,
    model_name VARCHAR(50) NOT NULL, -- neural, lightgbm, randomforest, ensemble, lstm, gru, xgboost, arima
    prediction_type VARCHAR(50) NOT NULL, -- price, direction, volatility
    current_price DECIMAL(20, 8),
    predicted_price DECIMAL(20, 8),
    predicted_direction VARCHAR(10), -- up, down, sideways
    confidence DECIMAL(5, 2),
    time_horizon VARCHAR(20), -- 1h, 4h, 1d, 1w
    features_used JSONB,
    accuracy_score DECIMAL(5, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    prediction_for TIMESTAMP,
    INDEX idx_symbol_model_created (symbol, model_name, created_at)
);

-- User trades (사용자 거래 내역)
CREATE TABLE IF NOT EXISTS user_trades (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    symbol VARCHAR(20) NOT NULL,
    order_id VARCHAR(100),
    side VARCHAR(10) NOT NULL, -- buy, sell
    type VARCHAR(20) NOT NULL, -- market, limit, stop_loss, take_profit
    status VARCHAR(20) NOT NULL, -- pending, filled, partially_filled, cancelled
    price DECIMAL(20, 8),
    quantity DECIMAL(20, 8),
    executed_price DECIMAL(20, 8),
    executed_quantity DECIMAL(20, 8),
    fee DECIMAL(20, 8),
    fee_asset VARCHAR(20),
    profit_loss DECIMAL(20, 8),
    profit_loss_percent DECIMAL(10, 4),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    executed_at TIMESTAMP,
    INDEX idx_user_symbol_created (user_id, symbol, created_at)
);

-- Portfolio (포트폴리오)
CREATE TABLE IF NOT EXISTS portfolio (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    asset VARCHAR(20) NOT NULL,
    quantity DECIMAL(20, 8) NOT NULL,
    avg_buy_price DECIMAL(20, 8),
    current_price DECIMAL(20, 8),
    current_value DECIMAL(20, 8),
    unrealized_pnl DECIMAL(20, 8),
    unrealized_pnl_percent DECIMAL(10, 4),
    realized_pnl DECIMAL(20, 8),
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_asset (user_id, asset)
);

-- Backtest results (백테스트 결과)
CREATE TABLE IF NOT EXISTS backtest_results (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    strategy_name VARCHAR(100) NOT NULL,
    symbol VARCHAR(20) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    initial_capital DECIMAL(20, 2),
    final_capital DECIMAL(20, 2),
    total_return DECIMAL(10, 4),
    annual_return DECIMAL(10, 4),
    sharpe_ratio DECIMAL(10, 4),
    max_drawdown DECIMAL(10, 4),
    win_rate DECIMAL(10, 4),
    total_trades INTEGER,
    winning_trades INTEGER,
    losing_trades INTEGER,
    avg_win DECIMAL(20, 8),
    avg_loss DECIMAL(20, 8),
    parameters JSONB,
    trades_data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Alerts (알림)
CREATE TABLE IF NOT EXISTS alerts (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    alert_type VARCHAR(50) NOT NULL, -- price, signal, news, pattern
    symbol VARCHAR(20),
    condition VARCHAR(100) NOT NULL,
    target_value DECIMAL(20, 8),
    message TEXT,
    is_active BOOLEAN DEFAULT true,
    is_triggered BOOLEAN DEFAULT false,
    triggered_at TIMESTAMP,
    telegram_sent BOOLEAN DEFAULT false,
    email_sent BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_active (user_id, is_active)
);

-- Telegram messages (텔레그램 메시지)
CREATE TABLE IF NOT EXISTS telegram_messages (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    telegram_id VARCHAR(100),
    message_type VARCHAR(50), -- signal, alert, report, notification
    message TEXT NOT NULL,
    is_sent BOOLEAN DEFAULT false,
    sent_at TIMESTAMP,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_telegram_sent (telegram_id, is_sent)
);

-- API logs (API 로그)
CREATE TABLE IF NOT EXISTS api_logs (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    endpoint VARCHAR(255) NOT NULL,
    method VARCHAR(10) NOT NULL,
    status_code INTEGER,
    request_body TEXT,
    response_body TEXT,
    ip_address VARCHAR(50),
    user_agent TEXT,
    latency INTEGER, -- milliseconds
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_created (user_id, created_at)
);

-- System metrics (시스템 메트릭)
CREATE TABLE IF NOT EXISTS system_metrics (
    id SERIAL PRIMARY KEY,
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(20, 8),
    metric_unit VARCHAR(50),
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_metric_created (metric_name, created_at)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_api_key ON users(api_key);
CREATE INDEX IF NOT EXISTS idx_market_data_symbol ON market_data(symbol);
CREATE INDEX IF NOT EXISTS idx_klines_symbol_interval ON klines(symbol, interval);
CREATE INDEX IF NOT EXISTS idx_signals_symbol_type ON trading_signals(symbol, signal_type);
CREATE INDEX IF NOT EXISTS idx_predictions_symbol_model ON ai_predictions(symbol, model_name);
CREATE INDEX IF NOT EXISTS idx_trades_user_status ON user_trades(user_id, status);
CREATE INDEX IF NOT EXISTS idx_portfolio_user ON portfolio(user_id);
CREATE INDEX IF NOT EXISTS idx_backtest_user ON backtest_results(user_id);
CREATE INDEX IF NOT EXISTS idx_alerts_user_active ON alerts(user_id, is_active);

-- Create update timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add update triggers to tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_portfolio_updated_at BEFORE UPDATE ON portfolio
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();