'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FaCode, FaPython, FaJs, FaPlay, FaSave, FaCopy, FaUndo, FaRedo } from 'react-icons/fa'

interface CodeEditorProps {
  symbol: string
}

const PYTHON_TEMPLATE = `# Trading Strategy
import pandas as pd
import numpy as np
from binance.client import Client

class TradingStrategy:
    def __init__(self, symbol='SYMBOL'):
        self.symbol = symbol
        self.position = None
        self.entry_price = 0
        
    def calculate_indicators(self, df):
        # Moving Averages
        df['MA20'] = df['close'].rolling(window=20).mean()
        df['MA50'] = df['close'].rolling(window=50).mean()
        
        # RSI
        delta = df['close'].diff()
        gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
        rs = gain / loss
        df['RSI'] = 100 - (100 / (1 + rs))
        
        return df
    
    def generate_signals(self, df):
        df = self.calculate_indicators(df)
        
        # Buy signal: MA20 > MA50 and RSI < 70
        buy_signal = (df['MA20'] > df['MA50']) & (df['RSI'] < 70)
        
        # Sell signal: MA20 < MA50 or RSI > 80
        sell_signal = (df['MA20'] < df['MA50']) | (df['RSI'] > 80)
        
        return buy_signal, sell_signal
    
    def execute_trade(self, signal_type, price):
        if signal_type == 'BUY' and self.position is None:
            self.position = 'LONG'
            self.entry_price = price
            print(f"Buy executed: {price}")
            
        elif signal_type == 'SELL' and self.position == 'LONG':
            profit = (price - self.entry_price) / self.entry_price * 100
            print(f"Sell executed: {price}, Profit: {profit:.2f}%")
            self.position = None
            self.entry_price = 0

# Execute strategy
if __name__ == "__main__":
    strategy = TradingStrategy('SYMBOL')
    # Add real-time data processing here`

const JAVASCRIPT_TEMPLATE = `// Trading Strategy
class TradingStrategy {
    constructor(symbol = 'SYMBOL') {
        this.symbol = symbol;
        this.position = null;
        this.entryPrice = 0;
        this.indicators = {};
    }
    
    // Calculate technical indicators
    calculateIndicators(candles) {
        // Moving averages
        this.indicators.ma20 = this.calculateMA(candles, 20);
        this.indicators.ma50 = this.calculateMA(candles, 50);
        
        // RSI
        this.indicators.rsi = this.calculateRSI(candles, 14);
        
        return this.indicators;
    }
    
    // Calculate moving average
    calculateMA(candles, period) {
        if (candles.length < period) return null;
        
        const sum = candles
            .slice(-period)
            .reduce((acc, candle) => acc + candle.close, 0);
        
        return sum / period;
    }
    
    // Calculate RSI
    calculateRSI(candles, period = 14) {
        if (candles.length < period + 1) return null;
        
        let gains = 0;
        let losses = 0;
        
        for (let i = candles.length - period; i < candles.length; i++) {
            const change = candles[i].close - candles[i - 1].close;
            if (change > 0) gains += change;
            else losses += Math.abs(change);
        }
        
        const avgGain = gains / period;
        const avgLoss = losses / period;
        const rs = avgGain / avgLoss;
        
        return 100 - (100 / (1 + rs));
    }
    
    // Generate trading signals
    generateSignals(currentPrice) {
        const { ma20, ma50, rsi } = this.indicators;
        
        // Buy signal: MA20 > MA50 & RSI < 70
        if (ma20 > ma50 && rsi < 70 && !this.position) {
            return 'BUY';
        }
        
        // Sell signal: MA20 < MA50 or RSI > 80
        if ((ma20 < ma50 || rsi > 80) && this.position === 'LONG') {
            return 'SELL';
        }
        
        return 'HOLD';
    }
    
    // Execute trade
    executeTrade(signal, price) {
        if (signal === 'BUY') {
            this.position = 'LONG';
            this.entryPrice = price;
            console.log('Buy executed: $' + price);
            return { action: 'BUY', price };
        }
        
        if (signal === 'SELL') {
            const profit = ((price - this.entryPrice) / this.entryPrice * 100).toFixed(2);
            console.log('Sell executed: $' + price + ', Profit: ' + profit + '%');
            this.position = null;
            this.entryPrice = 0;
            return { action: 'SELL', price, profit };
        }
        
        return { action: 'HOLD' };
    }
}

// Execute strategy
const strategy = new TradingStrategy('SYMBOL');`

export default function CodeEditor({ symbol }: CodeEditorProps) {
  const [language, setLanguage] = useState<'python' | 'javascript'>('python')
  const [code, setCode] = useState('')
  const [isRunning, setIsRunning] = useState(false)
  const [output, setOutput] = useState<string[]>([])
  const [history, setHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  
  // Initialize template
  useEffect(() => {
    const template = language === 'python' ? PYTHON_TEMPLATE : JAVASCRIPT_TEMPLATE
    setCode(template.replace(/SYMBOL/g, symbol))
  }, [language, symbol])
  
  // Run code
  const runCode = async () => {
    setIsRunning(true)
    setOutput(prev => [...prev, `[${new Date().toLocaleTimeString()}] Starting strategy execution...`])
    
    // Simulate execution
    setTimeout(() => {
      setOutput(prev => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] Strategy compiled successfully`,
        `[${new Date().toLocaleTimeString()}] Starting backtest...`,
        `[${new Date().toLocaleTimeString()}] Trade signal: BUY @ $45,234`,
        `[${new Date().toLocaleTimeString()}] Position entered`,
        `[${new Date().toLocaleTimeString()}] Current P&L: +2.34%`
      ])
      setIsRunning(false)
    }, 2000)
  }
  
  // Save code
  const saveCode = () => {
    setHistory(prev => [...prev, code])
    setHistoryIndex(history.length)
    setOutput(prev => [...prev, `[${new Date().toLocaleTimeString()}] Code saved`])
  }
  
  // Copy code
  const copyCode = () => {
    navigator.clipboard.writeText(code)
    setOutput(prev => [...prev, `[${new Date().toLocaleTimeString()}] Code copied to clipboard`])
  }
  
  // Undo
  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1)
      setCode(history[historyIndex - 1])
    }
  }
  
  // Redo
  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1)
      setCode(history[historyIndex + 1])
    }
  }
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Editor Area */}
      <div className="lg:col-span-2">
        <div className="bg-gray-900 rounded-xl border border-gray-700 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 bg-gray-800 border-b border-gray-700 flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Language Selection */}
              <div className="flex gap-1 bg-gray-900 rounded-lg p-1">
                <button
                  onClick={() => setLanguage('python')}
                  className={`px-3 py-1 rounded-md flex items-center gap-2 transition-all ${
                    language === 'python'
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <FaPython />
                  Python
                </button>
                <button
                  onClick={() => setLanguage('javascript')}
                  className={`px-3 py-1 rounded-md flex items-center gap-2 transition-all ${
                    language === 'javascript'
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <FaJs />
                  JavaScript
                </button>
              </div>
              
              <span className="text-gray-500">|</span>
              
              {/* Edit Tools */}
              <div className="flex gap-2">
                <button
                  onClick={undo}
                  disabled={historyIndex <= 0}
                  className="p-2 text-gray-400 hover:text-white disabled:text-gray-600 transition-colors"
                >
                  <FaUndo />
                </button>
                <button
                  onClick={redo}
                  disabled={historyIndex >= history.length - 1}
                  className="p-2 text-gray-400 hover:text-white disabled:text-gray-600 transition-colors"
                >
                  <FaRedo />
                </button>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={copyCode}
                className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded-lg flex items-center gap-2 transition-colors"
              >
                <FaCopy className="text-sm" />
                Copy
              </button>
              <button
                onClick={saveCode}
                className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded-lg flex items-center gap-2 transition-colors"
              >
                <FaSave className="text-sm" />
                Save
              </button>
              <button
                onClick={runCode}
                disabled={isRunning}
                className="px-4 py-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 text-white rounded-lg flex items-center gap-2 transition-colors"
              >
                <FaPlay className="text-sm" />
                {isRunning ? 'Running...' : 'Run'}
              </button>
            </div>
          </div>
          
          {/* Code Editor Textarea */}
          <div className="relative">
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full h-[500px] p-4 bg-gray-950 text-gray-300 font-mono text-sm resize-none focus:outline-none"
              spellCheck={false}
              style={{ tabSize: 4 }}
            />
            <div className="absolute top-2 right-2 text-xs text-gray-500">
              {language === 'python' ? 'Python 3.9+' : 'JavaScript ES6+'}
            </div>
          </div>
        </div>
      </div>
      
      {/* Output Area */}
      <div className="lg:col-span-1">
        <div className="bg-gray-800/50 rounded-xl border border-gray-700 h-full">
          <div className="px-4 py-3 border-b border-gray-700">
            <h3 className="text-white font-semibold">Execution Output</h3>
          </div>
          <div className="p-4 h-[500px] overflow-y-auto">
            {output.length === 0 ? (
              <div className="text-gray-500 text-center mt-8">
                Run the code to see output here
              </div>
            ) : (
              <div className="space-y-1 font-mono text-sm">
                {output.map((line, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-gray-300"
                  >
                    {line}
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}