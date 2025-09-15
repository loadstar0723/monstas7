'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FaCode, FaPython, FaCopy, FaDownload, FaCheck } from 'react-icons/fa'
import { SiJavascript, SiTypescript } from 'react-icons/si'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'

interface Props {
  strategy: any
}

export default function CodeGenerator({ strategy }: Props) {
  const [selectedLanguage, setSelectedLanguage] = useState<'python' | 'javascript' | 'typescript' | 'pinescript'>('python')
  const [generatedCode, setGeneratedCode] = useState('')
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState<'strategy' | 'backtest' | 'api'>('strategy')

  // 전략에 따른 코드 생성
  useEffect(() => {
    if (strategy) {
      generateCode()
    }
  }, [strategy, selectedLanguage, activeTab])

  const generateCode = () => {
    if (!strategy) {
      setGeneratedCode('// 전략을 먼저 생성해주세요.')
      return
    }

    let code = ''

    if (selectedLanguage === 'python') {
      code = generatePythonCode()
    } else if (selectedLanguage === 'javascript') {
      code = generateJavaScriptCode()
    } else if (selectedLanguage === 'typescript') {
      code = generateTypeScriptCode()
    } else if (selectedLanguage === 'pinescript') {
      code = generatePineScriptCode()
    }

    setGeneratedCode(code)
  }

  const generatePythonCode = () => {
    if (activeTab === 'strategy') {
      return `import pandas as pd
import numpy as np
import ccxt
from datetime import datetime
import talib

class ${strategy.name.replace(/\s+/g, '')}Strategy:
    """${strategy.name} - AI 전략 빌더로 생성된 트레이딩 전략"""
    
    def __init__(self, symbol='BTC/USDT', timeframe='1h'):
        self.symbol = symbol
        self.timeframe = timeframe
        self.exchange = ccxt.binance()
        self.position = 0
        self.balance = 10000
        
        # 전략 파라미터
        self.rsi_period = 14
        self.rsi_overbought = 70
        self.rsi_oversold = 30
        self.stop_loss_pct = 3
        self.take_profit_pct = 8
        
    def fetch_data(self, limit=100):
        """시장 데이터 가져오기"""
        ohlcv = self.exchange.fetch_ohlcv(self.symbol, self.timeframe, limit=limit)
        df = pd.DataFrame(ohlcv, columns=['timestamp', 'open', 'high', 'low', 'close', 'volume'])
        df['timestamp'] = pd.to_datetime(df['timestamp'], unit='ms')
        return df
        
    def calculate_indicators(self, df):
        """기술적 지표 계산"""
        df['rsi'] = talib.RSI(df['close'], timeperiod=self.rsi_period)
        df['ema_short'] = talib.EMA(df['close'], timeperiod=12)
        df['ema_long'] = talib.EMA(df['close'], timeperiod=26)
        df['macd'], df['macd_signal'], df['macd_hist'] = talib.MACD(df['close'])
        
        # 볼린저 밴드
        df['bb_upper'], df['bb_middle'], df['bb_lower'] = talib.BBANDS(
            df['close'], timeperiod=20, nbdevup=2, nbdevdn=2
        )
        
        return df
        
    def generate_signals(self, df):
        """매매 신호 생성"""
        df['signal'] = 0
        
        # RSI 기반 신호
        df.loc[df['rsi'] < self.rsi_oversold, 'signal'] = 1  # 매수
        df.loc[df['rsi'] > self.rsi_overbought, 'signal'] = -1  # 매도
        
        # MACD 크로스오버
        df['macd_cross'] = np.where(
            (df['macd'] > df['macd_signal']) & (df['macd'].shift(1) <= df['macd_signal'].shift(1)), 
            1, 0
        )
        
        # 볼린저 밴드 신호
        df.loc[df['close'] < df['bb_lower'], 'signal'] = 1
        df.loc[df['close'] > df['bb_upper'], 'signal'] = -1
        
        return df
        
    def calculate_position_size(self, capital, risk_pct=2):
        """포지션 크기 계산 (Kelly Criterion)"""
        win_rate = 0.6  # 예상 승률
        avg_win = self.take_profit_pct / 100
        avg_loss = self.stop_loss_pct / 100
        
        kelly_pct = (win_rate * avg_win - (1 - win_rate) * avg_loss) / avg_win
        kelly_pct = min(kelly_pct, 0.25)  # 최대 25%로 제한
        
        position_size = capital * kelly_pct
        return position_size
        
    def execute_trade(self, signal, price, timestamp):
        """거래 실행"""
        if signal == 1 and self.position == 0:
            # 매수
            position_size = self.calculate_position_size(self.balance)
            self.position = position_size / price
            print(f"{timestamp}: 매수 - 가격: {price}, 수량: {self.position:.4f}")
            
        elif signal == -1 and self.position > 0:
            # 매도
            pnl = self.position * price - self.position * price
            self.balance += pnl
            print(f"{timestamp}: 매도 - 가격: {price}, 수익: {pnl:.2f}")
            self.position = 0
            
    def run(self):
        """전략 실행"""
        df = self.fetch_data()
        df = self.calculate_indicators(df)
        df = self.generate_signals(df)
        
        # 최신 신호 확인
        latest = df.iloc[-1]
        if latest['signal'] != 0:
            self.execute_trade(latest['signal'], latest['close'], latest['timestamp'])
            
        return df
        
if __name__ == "__main__":
    strategy = ${strategy.name.replace(/\s+/g, '')}Strategy()
    result = strategy.run()
    print(result.tail())
`
    } else if (activeTab === 'backtest') {
      return `import pandas as pd
import numpy as np
from backtesting import Backtest, Strategy
from backtesting.lib import crossover
import talib

class ${strategy.name.replace(/\s+/g, '')}BacktestStrategy(Strategy):
    """백테스트용 전략 클래스"""
    
    # 파라미터 정의
    rsi_period = 14
    rsi_overbought = 70
    rsi_oversold = 30
    stop_loss_pct = 3
    take_profit_pct = 8
    
    def init(self):
        """지표 초기화"""
        # RSI 계산
        self.rsi = self.I(talib.RSI, self.data.Close, self.rsi_period)
        
        # MACD 계산
        macd, signal, hist = talib.MACD(self.data.Close)
        self.macd = self.I(lambda: macd)
        self.macd_signal = self.I(lambda: signal)
        
        # 볼린저 밴드
        self.bb_upper, self.bb_middle, self.bb_lower = self.I(
            talib.BBANDS, self.data.Close
        )
        
    def next(self):
        """각 봉마다 실행되는 로직"""
        price = self.data.Close[-1]
        
        # 포지션이 없을 때
        if not self.position:
            # 매수 신호
            if self.rsi[-1] < self.rsi_oversold:
                self.buy(size=0.95)  # 자본의 95% 사용
                
            elif crossover(self.macd, self.macd_signal):
                self.buy(size=0.95)
                
            elif price < self.bb_lower[-1]:
                self.buy(size=0.95)
                
        # 포지션이 있을 때
        else:
            # 익절/손절 계산
            entry_price = self.position.avg_fill_price
            stop_loss = entry_price * (1 - self.stop_loss_pct / 100)
            take_profit = entry_price * (1 + self.take_profit_pct / 100)
            
            # 매도 신호
            if (self.rsi[-1] > self.rsi_overbought or 
                price >= take_profit or 
                price <= stop_loss):
                self.position.close()
                
# 백테스트 실행
if __name__ == "__main__":
    # 데이터 로드 (예시)
    import yfinance as yf
    
    data = yf.download('BTC-USD', start='2022-01-01', end='2023-12-31')
    
    # 백테스트 설정
    bt = Backtest(
        data, 
        ${strategy.name.replace(/\s+/g, '')}BacktestStrategy,
        cash=10000,
        commission=0.001,
        exclusive_orders=True
    )
    
    # 백테스트 실행
    results = bt.run()
    print(results)
    
    # 최적화 실행
    optimized = bt.optimize(
        rsi_period=range(10, 30, 2),
        rsi_overbought=range(65, 85, 5),
        rsi_oversold=range(15, 35, 5),
        maximize='Sharpe Ratio'
    )
    print(optimized)
    
    # 차트 표시
    bt.plot()
`
    } else {
      return `import ccxt
import pandas as pd
import time
import logging
from typing import Dict, List, Optional
import asyncio
import websockets
import json

class ${strategy.name.replace(/\s+/g, '')}Bot:
    """실전 트레이딩 봇"""
    
    def __init__(self, api_key: str, secret: str, testnet: bool = True):
        self.exchange = ccxt.binance({
            'apiKey': api_key,
            'secret': secret,
            'enableRateLimit': True,
            'options': {
                'defaultType': 'future',  # 선물 거래
                'testnet': testnet
            }
        })
        
        self.symbol = 'BTC/USDT'
        self.position = None
        self.orders = []
        self.running = False
        
        # 로깅 설정
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger(__name__)
        
    async def connect_websocket(self):
        """웹소켓 연결"""
        uri = "wss://stream.binance.com:9443/ws/btcusdt@kline_1m"
        
        async with websockets.connect(uri) as websocket:
            while self.running:
                try:
                    message = await websocket.recv()
                    data = json.loads(message)
                    await self.on_price_update(data)
                except Exception as e:
                    self.logger.error(f"WebSocket error: {e}")
                    await asyncio.sleep(5)
                    
    async def on_price_update(self, data):
        """실시간 가격 업데이트 처리"""
        if data['e'] == 'kline':
            kline = data['k']
            if kline['x']:  # 봉 완성
                price = float(kline['c'])
                volume = float(kline['v'])
                
                # 전략 실행
                signal = await self.check_signal(price, volume)
                if signal:
                    await self.execute_order(signal, price)
                    
    async def check_signal(self, price: float, volume: float) -> Optional[str]:
        """신호 확인"""
        # 기술적 지표 계산
        df = await self.fetch_recent_data()
        
        # RSI 계산
        rsi = self.calculate_rsi(df['close'])
        
        if rsi < 30 and not self.position:
            return 'BUY'
        elif rsi > 70 and self.position:
            return 'SELL'
            
        return None
        
    async def execute_order(self, signal: str, price: float):
        """주문 실행"""
        try:
            if signal == 'BUY':
                # 포지션 크기 계산
                balance = self.exchange.fetch_balance()
                usdt_balance = balance['USDT']['free']
                position_size = usdt_balance * 0.1  # 10% 사용
                
                order = self.exchange.create_market_buy_order(
                    self.symbol,
                    position_size / price
                )
                
                # 손절/익절 주문
                stop_loss = price * 0.97
                take_profit = price * 1.08
                
                self.exchange.create_order(
                    self.symbol, 'STOP_LOSS', 'sell', 
                    order['amount'], stop_loss
                )
                
                self.exchange.create_order(
                    self.symbol, 'TAKE_PROFIT', 'sell',
                    order['amount'], take_profit
                )
                
                self.position = order
                self.logger.info(f"Buy order executed: {order}")
                
            elif signal == 'SELL' and self.position:
                order = self.exchange.create_market_sell_order(
                    self.symbol,
                    self.position['amount']
                )
                
                self.position = None
                self.logger.info(f"Sell order executed: {order}")
                
        except Exception as e:
            self.logger.error(f"Order execution error: {e}")
            
    async def risk_management(self):
        """리스크 관리 모니터링"""
        while self.running:
            try:
                # 포지션 체크
                positions = self.exchange.fetch_positions()
                
                for position in positions:
                    # 최대 손실 체크
                    if position['percentage'] < -5:  # -5% 이상 손실
                        await self.emergency_close(position)
                        
                await asyncio.sleep(10)  # 10초마다 체크
                
            except Exception as e:
                self.logger.error(f"Risk management error: {e}")
                
    async def emergency_close(self, position):
        """긴급 청산"""
        try:
            order = self.exchange.create_market_order(
                position['symbol'],
                'sell' if position['side'] == 'long' else 'buy',
                abs(position['contracts'])
            )
            self.logger.warning(f"Emergency close executed: {order}")
        except Exception as e:
            self.logger.error(f"Emergency close error: {e}")
            
    async def run(self):
        """봇 실행"""
        self.running = True
        
        # 태스크 시작
        tasks = [
            asyncio.create_task(self.connect_websocket()),
            asyncio.create_task(self.risk_management())
        ]
        
        try:
            await asyncio.gather(*tasks)
        except KeyboardInterrupt:
            self.running = False
            self.logger.info("Bot stopped by user")
            
# 실행
if __name__ == "__main__":
    bot = ${strategy.name.replace(/\s+/g, '')}Bot(
        api_key="YOUR_API_KEY",
        secret="YOUR_SECRET",
        testnet=True
    )
    
    asyncio.run(bot.run())
`
    }
  }

  const generateJavaScriptCode = () => {
    return `const ccxt = require('ccxt');
const talib = require('talib');

class ${strategy.name.replace(/\s+/g, '')}Strategy {
  constructor(symbol = 'BTC/USDT', timeframe = '1h') {
    this.symbol = symbol;
    this.timeframe = timeframe;
    this.exchange = new ccxt.binance();
    this.position = 0;
    this.balance = 10000;
    
    // Strategy parameters
    this.rsiPeriod = 14;
    this.rsiOverbought = 70;
    this.rsiOversold = 30;
    this.stopLossPct = 3;
    this.takeProfitPct = 8;
  }
  
  async fetchData(limit = 100) {
    const ohlcv = await this.exchange.fetchOHLCV(this.symbol, this.timeframe, undefined, limit);
    return ohlcv.map(candle => ({
      timestamp: candle[0],
      open: candle[1],
      high: candle[2],
      low: candle[3],
      close: candle[4],
      volume: candle[5]
    }));
  }
  
  calculateIndicators(data) {
    const closes = data.map(d => d.close);
    
    // Calculate RSI
    const rsi = talib.RSI(closes, this.rsiPeriod);
    
    // Calculate MACD
    const macd = talib.MACD(closes, 12, 26, 9);
    
    // Add indicators to data
    data.forEach((candle, i) => {
      candle.rsi = rsi[i];
      candle.macd = macd.MACD[i];
      candle.macdSignal = macd.signal[i];
      candle.macdHist = macd.histogram[i];
    });
    
    return data;
  }
  
  generateSignals(data) {
    const latest = data[data.length - 1];
    
    if (latest.rsi < this.rsiOversold && this.position === 0) {
      return { action: 'BUY', price: latest.close };
    }
    
    if (latest.rsi > this.rsiOverbought && this.position > 0) {
      return { action: 'SELL', price: latest.close };
    }
    
    return null;
  }
  
  async run() {
    try {
      const data = await this.fetchData();
      const dataWithIndicators = this.calculateIndicators(data);
      const signal = this.generateSignals(dataWithIndicators);
      
      if (signal) {
        console.log(\`Signal: \${signal.action} at \${signal.price}\`);
        // Execute trade here
      }
      
      return dataWithIndicators;
    } catch (error) {
      console.error('Error running strategy:', error);
    }
  }
}

module.exports = ${strategy.name.replace(/\s+/g, '')}Strategy;`
  }

  const generateTypeScriptCode = () => {
    return `import ccxt from 'ccxt';
import * as talib from 'talib';

interface Candle {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  rsi?: number;
  macd?: number;
  macdSignal?: number;
  macdHist?: number;
}

interface Signal {
  action: 'BUY' | 'SELL';
  price: number;
  confidence?: number;
}

class ${strategy.name.replace(/\s+/g, '')}Strategy {
  private exchange: ccxt.Exchange;
  private position: number = 0;
  private balance: number = 10000;
  
  // Strategy parameters
  private readonly rsiPeriod: number = 14;
  private readonly rsiOverbought: number = 70;
  private readonly rsiOversold: number = 30;
  private readonly stopLossPct: number = 3;
  private readonly takeProfitPct: number = 8;
  
  constructor(
    private symbol: string = 'BTC/USDT',
    private timeframe: string = '1h'
  ) {
    this.exchange = new ccxt.binance();
  }
  
  async fetchData(limit: number = 100): Promise<Candle[]> {
    const ohlcv = await this.exchange.fetchOHLCV(
      this.symbol, 
      this.timeframe, 
      undefined, 
      limit
    );
    
    return ohlcv.map(candle => ({
      timestamp: candle[0],
      open: candle[1],
      high: candle[2],
      low: candle[3],
      close: candle[4],
      volume: candle[5]
    }));
  }
  
  calculateIndicators(data: Candle[]): Candle[] {
    const closes = data.map(d => d.close);
    
    // Calculate RSI
    const rsi = talib.RSI(closes, this.rsiPeriod);
    
    // Calculate MACD
    const macd = talib.MACD(closes, 12, 26, 9);
    
    // Add indicators to data
    data.forEach((candle, i) => {
      candle.rsi = rsi[i];
      candle.macd = macd.MACD[i];
      candle.macdSignal = macd.signal[i];
      candle.macdHist = macd.histogram[i];
    });
    
    return data;
  }
  
  generateSignals(data: Candle[]): Signal | null {
    const latest = data[data.length - 1];
    
    if (!latest.rsi) return null;
    
    if (latest.rsi < this.rsiOversold && this.position === 0) {
      return { 
        action: 'BUY', 
        price: latest.close,
        confidence: (this.rsiOversold - latest.rsi) / this.rsiOversold
      };
    }
    
    if (latest.rsi > this.rsiOverbought && this.position > 0) {
      return { 
        action: 'SELL', 
        price: latest.close,
        confidence: (latest.rsi - this.rsiOverbought) / (100 - this.rsiOverbought)
      };
    }
    
    return null;
  }
  
  calculatePositionSize(capital: number, riskPct: number = 2): number {
    const winRate = 0.6;
    const avgWin = this.takeProfitPct / 100;
    const avgLoss = this.stopLossPct / 100;
    
    const kellyPct = (winRate * avgWin - (1 - winRate) * avgLoss) / avgWin;
    const safePct = Math.min(kellyPct, 0.25);
    
    return capital * safePct;
  }
  
  async run(): Promise<Candle[]> {
    try {
      const data = await this.fetchData();
      const dataWithIndicators = this.calculateIndicators(data);
      const signal = this.generateSignals(dataWithIndicators);
      
      if (signal) {
        console.log(\`Signal: \${signal.action} at \${signal.price} (confidence: \${signal.confidence?.toFixed(2)})\`);
        // Execute trade here
      }
      
      return dataWithIndicators;
    } catch (error) {
      console.error('Error running strategy:', error);
      throw error;
    }
  }
}

export default ${strategy.name.replace(/\s+/g, '')}Strategy;`
  }

  const generatePineScriptCode = () => {
    return `//@version=5
strategy("${strategy.name}", overlay=true, initial_capital=10000, 
         default_qty_type=strategy.percent_of_equity, default_qty_value=10)

// Strategy Parameters
rsi_period = input.int(14, "RSI Period", minval=5, maxval=50)
rsi_overbought = input.int(70, "RSI Overbought", minval=60, maxval=90)
rsi_oversold = input.int(30, "RSI Oversold", minval=10, maxval=40)
stop_loss_pct = input.float(3.0, "Stop Loss %", minval=0.5, maxval=10, step=0.5)
take_profit_pct = input.float(8.0, "Take Profit %", minval=1, maxval=20, step=0.5)

// Calculate Indicators
rsi = ta.rsi(close, rsi_period)
[macd_line, signal_line, hist] = ta.macd(close, 12, 26, 9)

// Bollinger Bands
[bb_upper, bb_middle, bb_lower] = ta.bb(close, 20, 2)

// EMA
ema_short = ta.ema(close, 12)
ema_long = ta.ema(close, 26)

// Trading Conditions
long_condition = rsi < rsi_oversold or 
                 ta.crossover(macd_line, signal_line) or
                 close < bb_lower
                 
short_condition = rsi > rsi_overbought or 
                  ta.crossunder(macd_line, signal_line) or
                  close > bb_upper

// Risk Management
long_stop = strategy.position_avg_price * (1 - stop_loss_pct / 100)
long_take = strategy.position_avg_price * (1 + take_profit_pct / 100)
short_stop = strategy.position_avg_price * (1 + stop_loss_pct / 100)
short_take = strategy.position_avg_price * (1 - take_profit_pct / 100)

// Execute Trades
if (long_condition and strategy.position_size == 0)
    strategy.entry("Long", strategy.long)
    
if (short_condition and strategy.position_size == 0)
    strategy.entry("Short", strategy.short)

// Exit Trades
if (strategy.position_size > 0)
    strategy.exit("Long Exit", "Long", stop=long_stop, limit=long_take)
    
if (strategy.position_size < 0)
    strategy.exit("Short Exit", "Short", stop=short_stop, limit=short_take)

// Plot Indicators
plot(rsi, "RSI", color=color.blue)
hline(rsi_overbought, "Overbought", color=color.red, linestyle=hline.style_dashed)
hline(rsi_oversold, "Oversold", color=color.green, linestyle=hline.style_dashed)

// Plot Bollinger Bands
plot(bb_upper, "BB Upper", color=color.red)
plot(bb_middle, "BB Middle", color=color.gray)
plot(bb_lower, "BB Lower", color=color.green)

// Plot Entry/Exit Points
plotshape(long_condition, "Long Signal", location=location.belowbar, 
          color=color.green, style=shape.triangleup, size=size.small)
plotshape(short_condition, "Short Signal", location=location.abovebar, 
          color=color.red, style=shape.triangledown, size=size.small)

// Performance Table
var table perfTable = table.new(position.top_right, 2, 6)
if barstate.islast
    table.cell(perfTable, 0, 0, "Metric", bgcolor=color.gray)
    table.cell(perfTable, 1, 0, "Value", bgcolor=color.gray)
    table.cell(perfTable, 0, 1, "Net Profit")
    table.cell(perfTable, 1, 1, str.tostring(strategy.netprofit, "#.##"))
    table.cell(perfTable, 0, 2, "Win Rate")
    table.cell(perfTable, 1, 2, str.tostring(strategy.wintrades / strategy.closedtrades * 100, "#.##") + "%")
    table.cell(perfTable, 0, 3, "Max Drawdown")
    table.cell(perfTable, 1, 3, str.tostring(strategy.max_drawdown, "#.##"))
    table.cell(perfTable, 0, 4, "Total Trades")
    table.cell(perfTable, 1, 4, str.tostring(strategy.closedtrades))
`
  }

  // 코드 복사
  const copyCode = () => {
    navigator.clipboard.writeText(generatedCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // 코드 다운로드
  const downloadCode = () => {
    const extension = selectedLanguage === 'python' ? 'py' : 
                     selectedLanguage === 'javascript' ? 'js' :
                     selectedLanguage === 'typescript' ? 'ts' : 'pine'
    
    const filename = `${strategy?.name?.replace(/\s+/g, '_') || 'strategy'}_${activeTab}.${extension}`
    const blob = new Blob([generatedCode], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
  }

  return (
    <div className="space-y-6">
      {/* 언어 및 탭 선택 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedLanguage('python')}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
              selectedLanguage === 'python'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <FaPython />
            Python
          </button>
          <button
            onClick={() => setSelectedLanguage('javascript')}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
              selectedLanguage === 'javascript'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <SiJavascript />
            JavaScript
          </button>
          <button
            onClick={() => setSelectedLanguage('typescript')}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
              selectedLanguage === 'typescript'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <SiTypescript />
            TypeScript
          </button>
          <button
            onClick={() => setSelectedLanguage('pinescript')}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
              selectedLanguage === 'pinescript'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <FaCode />
            PineScript
          </button>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={copyCode}
            className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            {copied ? <FaCheck /> : <FaCopy />}
            {copied ? '복사됨' : '복사'}
          </button>
          <button
            onClick={downloadCode}
            className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <FaDownload />
            다운로드
          </button>
        </div>
      </div>

      {/* 코드 유형 탭 */}
      {selectedLanguage !== 'pinescript' && (
        <div className="flex items-center gap-2 bg-gray-800/50 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('strategy')}
            className={`px-4 py-2 rounded ${
              activeTab === 'strategy'
                ? 'bg-purple-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            전략 코드
          </button>
          <button
            onClick={() => setActiveTab('backtest')}
            className={`px-4 py-2 rounded ${
              activeTab === 'backtest'
                ? 'bg-purple-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            백테스트
          </button>
          <button
            onClick={() => setActiveTab('api')}
            className={`px-4 py-2 rounded ${
              activeTab === 'api'
                ? 'bg-purple-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            실전 트레이딩
          </button>
        </div>
      )}

      {/* 코드 표시 */}
      <div className="bg-gray-800/50 rounded-lg overflow-hidden border border-gray-700">
        <div className="bg-gray-900 px-4 py-2 border-b border-gray-700">
          <span className="text-gray-400 text-sm">
            {strategy?.name || 'Strategy'}.
            {selectedLanguage === 'python' ? 'py' : 
             selectedLanguage === 'javascript' ? 'js' :
             selectedLanguage === 'typescript' ? 'ts' : 'pine'}
          </span>
        </div>
        <div className="max-h-[600px] overflow-y-auto">
          <SyntaxHighlighter
            language={selectedLanguage === 'pinescript' ? 'javascript' : selectedLanguage}
            style={vscDarkPlus}
            customStyle={{
              background: 'transparent',
              padding: '1.5rem',
              margin: 0
            }}
          >
            {generatedCode}
          </SyntaxHighlighter>
        </div>
      </div>

      {/* 사용 가이드 */}
      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
        <h4 className="text-lg font-bold text-white mb-4">사용 가이드</h4>
        <div className="space-y-3 text-sm text-gray-300">
          {selectedLanguage === 'python' && (
            <>
              <p>1. 필요한 패키지 설치: <code className="bg-gray-700 px-2 py-1 rounded">pip install ccxt pandas numpy talib backtesting</code></p>
              <p>2. API 키 설정: Binance에서 API 키와 시크릿을 발급받아 코드에 입력</p>
              <p>3. 전략 실행: <code className="bg-gray-700 px-2 py-1 rounded">python strategy.py</code></p>
            </>
          )}
          {selectedLanguage === 'javascript' && (
            <>
              <p>1. 필요한 패키지 설치: <code className="bg-gray-700 px-2 py-1 rounded">npm install ccxt talib</code></p>
              <p>2. API 키 설정: 환경변수 또는 config 파일에 설정</p>
              <p>3. 전략 실행: <code className="bg-gray-700 px-2 py-1 rounded">node strategy.js</code></p>
            </>
          )}
          {selectedLanguage === 'typescript' && (
            <>
              <p>1. 필요한 패키지 설치: <code className="bg-gray-700 px-2 py-1 rounded">npm install ccxt talib @types/ccxt</code></p>
              <p>2. TypeScript 설정: <code className="bg-gray-700 px-2 py-1 rounded">tsc --init</code></p>
              <p>3. 컴파일 및 실행: <code className="bg-gray-700 px-2 py-1 rounded">tsc && node dist/strategy.js</code></p>
            </>
          )}
          {selectedLanguage === 'pinescript' && (
            <>
              <p>1. TradingView 차트 열기</p>
              <p>2. Pine Editor 열기 (차트 하단)</p>
              <p>3. 코드 붙여넣기 후 "Add to Chart" 클릭</p>
              <p>4. Strategy Tester에서 백테스트 결과 확인</p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}