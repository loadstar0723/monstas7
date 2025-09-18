-- MONSTA 프로젝트 Supabase 스키마
-- 하이브리드 아키텍처: 사용자 데이터는 Supabase, AI/트레이딩은 Go Backend

-- 사용자 프로필 테이블
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'silver', 'gold', 'platinum', 'diamond', 'black')),
  telegram_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 구독 정보 테이블
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  tier TEXT NOT NULL CHECK (tier IN ('free', 'silver', 'gold', 'platinum', 'diamond', 'black')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'cancelled', 'expired')),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  features JSONB DEFAULT '{}',
  payment_method TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 트레이딩 시그널 저장 (AI 예측은 Go Backend에서 생성, 여기는 기록용)
CREATE TABLE IF NOT EXISTS trading_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  signal_type TEXT NOT NULL, -- 'STRONG_BUY', 'BUY', 'HOLD', 'SELL', 'STRONG_SELL'
  confidence DECIMAL(5,2),
  ai_model TEXT, -- 어떤 AI 모델이 생성했는지
  prediction_data JSONB, -- Go Backend에서 받은 전체 예측 데이터
  executed BOOLEAN DEFAULT FALSE,
  execution_price DECIMAL(20,8),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  executed_at TIMESTAMPTZ
);

-- 포트폴리오 테이블
CREATE TABLE IF NOT EXISTS portfolios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT DEFAULT 'Main Portfolio',
  assets JSONB DEFAULT '[]', -- [{symbol, amount, cost_basis}]
  total_value DECIMAL(20,2),
  performance DECIMAL(10,2),
  risk_score DECIMAL(5,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- 거래 이력
CREATE TABLE IF NOT EXISTS trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  portfolio_id UUID REFERENCES portfolios(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('buy', 'sell', 'backtest')),
  symbol TEXT NOT NULL,
  amount DECIMAL(20,8),
  price DECIMAL(20,8),
  total_value DECIMAL(20,2),
  fee DECIMAL(10,4),
  profit_loss DECIMAL(20,2),
  strategy TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 알림 설정
CREATE TABLE IF NOT EXISTS notification_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  email_alerts BOOLEAN DEFAULT TRUE,
  telegram_alerts BOOLEAN DEFAULT FALSE,
  price_alerts JSONB DEFAULT '[]', -- [{symbol, target_price, direction}]
  signal_alerts BOOLEAN DEFAULT TRUE,
  portfolio_alerts BOOLEAN DEFAULT TRUE,
  news_alerts BOOLEAN DEFAULT FALSE,
  alert_frequency TEXT DEFAULT 'realtime' CHECK (alert_frequency IN ('realtime', 'hourly', 'daily')),
  quiet_hours_start TIME,
  quiet_hours_end TIME,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- API 키 관리 (암호화 필요)
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  exchange TEXT NOT NULL,
  api_key_encrypted TEXT NOT NULL,
  api_secret_encrypted TEXT NOT NULL,
  permissions JSONB DEFAULT '{"trading": false, "withdraw": false}',
  is_active BOOLEAN DEFAULT TRUE,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 백테스팅 결과 저장
CREATE TABLE IF NOT EXISTS backtest_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  strategy_name TEXT NOT NULL,
  strategy_config JSONB NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  initial_capital DECIMAL(20,2),
  final_capital DECIMAL(20,2),
  total_return DECIMAL(10,4),
  sharpe_ratio DECIMAL(10,4),
  max_drawdown DECIMAL(10,4),
  win_rate DECIMAL(5,2),
  total_trades INTEGER,
  profit_trades INTEGER,
  loss_trades INTEGER,
  detailed_results JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 세션 로그 (사용자 활동 추적)
CREATE TABLE IF NOT EXISTS session_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  session_id TEXT,
  ip_address INET,
  user_agent TEXT,
  activity_type TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (RLS) 활성화
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE trading_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE backtest_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_logs ENABLE ROW LEVEL SECURITY;

-- RLS 정책 설정
-- 사용자는 자신의 데이터만 접근 가능
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own subscription" ON subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own signals" ON trading_signals FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own portfolio" ON portfolios FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own trades" ON trades FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own notifications" ON notification_settings FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own API keys" ON api_keys FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own backtest results" ON backtest_results FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own sessions" ON session_logs FOR SELECT USING (auth.uid() = user_id);

-- 트리거: 프로필 자동 생성
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, username)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'username');

  -- 기본 구독 생성
  INSERT INTO public.subscriptions (user_id, tier)
  VALUES (new.id, 'free');

  -- 기본 알림 설정 생성
  INSERT INTO public.notification_settings (user_id)
  VALUES (new.id);

  -- 기본 포트폴리오 생성
  INSERT INTO public.portfolios (user_id)
  VALUES (new.id);

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 새 사용자 가입 시 프로필 자동 생성
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 업데이트 시간 자동 갱신 함수
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 업데이트 트리거 설정
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_portfolios_updated_at BEFORE UPDATE ON portfolios
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_notification_settings_updated_at BEFORE UPDATE ON notification_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_api_keys_updated_at BEFORE UPDATE ON api_keys
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 인덱스 생성 (성능 최적화)
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_username ON profiles(username);
CREATE INDEX idx_profiles_subscription_tier ON profiles(subscription_tier);
CREATE INDEX idx_trading_signals_user_id ON trading_signals(user_id);
CREATE INDEX idx_trading_signals_symbol ON trading_signals(symbol);
CREATE INDEX idx_trading_signals_created_at ON trading_signals(created_at DESC);
CREATE INDEX idx_trades_user_id ON trades(user_id);
CREATE INDEX idx_trades_symbol ON trades(symbol);
CREATE INDEX idx_trades_created_at ON trades(created_at DESC);
CREATE INDEX idx_portfolios_user_id ON portfolios(user_id);
CREATE INDEX idx_backtest_results_user_id ON backtest_results(user_id);
CREATE INDEX idx_session_logs_user_id ON session_logs(user_id);
CREATE INDEX idx_session_logs_created_at ON session_logs(created_at DESC);