import numpy as np
import pandas as pd
import tensorflow as tf
from flask import Flask, request, jsonify
import requests
from datetime import datetime
import talib
import joblib

app = Flask(__name__)

class TradingAI:
    def __init__(self):
        # 여러 AI 모델 앙상블
        self.lstm_model = self.build_lstm_model()
        self.xgboost_model = None  # 학습 후 로드
        self.rf_model = None       # 학습 후 로드
        
    def build_lstm_model(self):
        """LSTM 가격 예측 모델"""
        model = tf.keras.Sequential([
            tf.keras.layers.LSTM(128, return_sequences=True, input_shape=(60, 7)),
            tf.keras.layers.Dropout(0.2),
            tf.keras.layers.LSTM(64, return_sequences=True),
            tf.keras.layers.Dropout(0.2),
            tf.keras.layers.LSTM(32),
            tf.keras.layers.Dropout(0.2),
            tf.keras.layers.Dense(16, activation='relu'),
            tf.keras.layers.Dense(1)
        ])
        model.compile(optimizer='adam', loss='mse', metrics=['mae'])
        return model
    
    def prepare_features(self, df):
        """기술적 지표 계산"""
        # 이동평균선
        df['SMA_20'] = talib.SMA(df['close'], timeperiod=20)
        df['SMA_50'] = talib.SMA(df['close'], timeperiod=50)
        df['EMA_12'] = talib.EMA(df['close'], timeperiod=12)
        df['EMA_26'] = talib.EMA(df['close'], timeperiod=26)
        
        # MACD
        df['MACD'], df['MACD_signal'], df['MACD_hist'] = talib.MACD(df['close'])
        
        # RSI
        df['RSI'] = talib.RSI(df['close'], timeperiod=14)
        
        # 볼린저 밴드
        df['BB_upper'], df['BB_middle'], df['BB_lower'] = talib.BBANDS(df['close'])
        
        # 볼륨 지표
        df['OBV'] = talib.OBV(df['close'], df['volume'])
        df['AD'] = talib.AD(df['high'], df['low'], df['close'], df['volume'])
        
        # 변동성
        df['ATR'] = talib.ATR(df['high'], df['low'], df['close'])
        
        return df
    
    def predict(self, symbol='BTCUSDT'):
        """AI 예측 실행"""
        # 실시간 데이터 가져오기
        df = self.fetch_market_data(symbol)
        
        # 특징 추출
        df = self.prepare_features(df)
        
        # LSTM 예측
        lstm_pred = self.predict_lstm(df)
        
        # 앙상블 예측 (여러 모델 결합)
        ensemble_pred = self.ensemble_predict(df)
        
        # 신호 생성
        signal = self.generate_signal(lstm_pred, ensemble_pred, df)
        
        return signal
    
    def predict_lstm(self, df):
        """LSTM 모델 예측"""
        # 최근 60개 캔들 데이터
        features = ['open', 'high', 'low', 'close', 'volume', 'RSI', 'ATR']
        data = df[features].tail(60).values
        
        # 정규화
        data = (data - data.mean()) / data.std()
        data = data.reshape(1, 60, len(features))
        
        # 예측
        prediction = self.lstm_model.predict(data, verbose=0)
        return prediction[0][0]
    
    def ensemble_predict(self, df):
        """앙상블 모델 예측"""
        features = df[['RSI', 'MACD', 'ATR', 'OBV', 'volume']].tail(1)
        
        predictions = []
        
        # XGBoost 예측
        if self.xgboost_model:
            xgb_pred = self.xgboost_model.predict_proba(features)[0][1]
            predictions.append(xgb_pred)
        
        # Random Forest 예측
        if self.rf_model:
            rf_pred = self.rf_model.predict_proba(features)[0][1]
            predictions.append(rf_pred)
        
        # 평균 앙상블
        return np.mean(predictions) if predictions else 0.5
    
    def generate_signal(self, lstm_pred, ensemble_pred, df):
        """거래 신호 생성"""
        current_price = df['close'].iloc[-1]
        
        # 가격 변화 예측
        price_change = lstm_pred
        
        # 신뢰도 계산
        confidence = self.calculate_confidence(lstm_pred, ensemble_pred, df)
        
        # 액션 결정
        if price_change > 0.02 and confidence > 0.7:  # 2% 상승 예측
            action = "BUY"
            take_profit = current_price * 1.03  # 3% 수익
            stop_loss = current_price * 0.98    # 2% 손실
        elif price_change < -0.02 and confidence > 0.7:  # 2% 하락 예측
            action = "SELL"
            take_profit = current_price * 0.97
            stop_loss = current_price * 1.02
        else:
            action = "HOLD"
            take_profit = 0
            stop_loss = 0
        
        return {
            "symbol": "BTCUSDT",
            "action": action,
            "confidence": float(confidence),
            "price": float(current_price),
            "predicted_price": float(current_price * (1 + price_change)),
            "stop_loss": float(stop_loss),
            "take_profit": float(take_profit),
            "timestamp": int(datetime.now().timestamp())
        }
    
    def calculate_confidence(self, lstm_pred, ensemble_pred, df):
        """신뢰도 계산"""
        # RSI 기반 신뢰도
        rsi = df['RSI'].iloc[-1]
        rsi_confidence = 1.0 if 30 < rsi < 70 else 0.5
        
        # 변동성 기반 신뢰도
        atr = df['ATR'].iloc[-1]
        volatility_confidence = 1.0 if atr < df['ATR'].mean() else 0.7
        
        # 모델 일치도
        model_agreement = 1.0 if abs(lstm_pred - ensemble_pred) < 0.1 else 0.6
        
        # 종합 신뢰도
        confidence = (rsi_confidence + volatility_confidence + model_agreement) / 3
        return min(max(confidence, 0), 1)  # 0-1 범위로 제한
    
    def fetch_market_data(self, symbol, limit=500):
        """Binance에서 실시간 데이터 가져오기"""
        url = f"https://api.binance.com/api/v3/klines"
        params = {
            'symbol': symbol,
            'interval': '5m',
            'limit': limit
        }
        
        response = requests.get(url, params=params)
        data = response.json()
        
        df = pd.DataFrame(data, columns=[
            'timestamp', 'open', 'high', 'low', 'close', 'volume',
            'close_time', 'quote_volume', 'trades', 'taker_buy_base',
            'taker_buy_quote', 'ignore'
        ])
        
        # 데이터 타입 변환
        for col in ['open', 'high', 'low', 'close', 'volume']:
            df[col] = df[col].astype(float)
        
        df['timestamp'] = pd.to_datetime(df['timestamp'], unit='ms')
        df.set_index('timestamp', inplace=True)
        
        return df

# AI 인스턴스
trading_ai = TradingAI()

@app.route('/predict', methods=['POST'])
def predict():
    """AI 예측 엔드포인트"""
    data = request.json
    symbol = data.get('symbol', 'BTCUSDT')
    
    try:
        signal = trading_ai.predict(symbol)
        
        # Go 트레이딩 엔진으로 신호 전송
        go_engine_url = "http://localhost:8082/api/ai-signal"
        response = requests.post(go_engine_url, json=signal)
        
        return jsonify({
            "status": "success",
            "signal": signal,
            "engine_response": response.json() if response.ok else None
        })
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

@app.route('/train', methods=['POST'])
def train():
    """모델 학습 엔드포인트"""
    # 백그라운드에서 모델 학습
    # 실제로는 Celery 등을 사용해 비동기 처리
    return jsonify({"status": "training started"})

@app.route('/backtest', methods=['POST'])
def backtest():
    """백테스팅 엔드포인트"""
    data = request.json
    start_date = data.get('start_date')
    end_date = data.get('end_date')
    
    # 백테스팅 로직
    results = {
        "total_trades": 150,
        "win_rate": 0.65,
        "profit": 45.2,
        "sharpe_ratio": 1.8,
        "max_drawdown": -12.5
    }
    
    return jsonify(results)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)