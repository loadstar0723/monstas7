"""
바이낸스 WebSocket 실시간 데이터 클라이언트
실제 시세 데이터 스트리밍
"""

import json
import asyncio
import websockets
import logging
from typing import Callable, List, Dict, Any
from datetime import datetime
import psycopg2
from psycopg2.extras import RealDictCursor
import os

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class BinanceWebSocketClient:
    """바이낸스 WebSocket 클라이언트"""
    
    def __init__(self):
        self.base_url = "wss://stream.binance.com:9443/ws"
        self.symbols = [
            'btcusdt', 'ethusdt', 'bnbusdt', 'adausdt', 'dogeusdt',
            'xrpusdt', 'dotusdt', 'uniusdt', 'linkusdt', 'solusdt'
        ]
        self.callbacks: Dict[str, List[Callable]] = {}
        self.running = False
        self.tasks = []
        
    def get_db_connection(self):
        """PostgreSQL 연결"""
        return psycopg2.connect(
            host=os.getenv('DB_HOST', 'localhost'),
            port=os.getenv('DB_PORT', '5432'),
            database=os.getenv('DB_NAME', 'monsta_db'),
            user=os.getenv('DB_USER', 'monsta'),
            password=os.getenv('DB_PASSWORD', 'monsta123'),
            cursor_factory=RealDictCursor
        )
    
    def subscribe(self, event_type: str, callback: Callable):
        """이벤트 구독"""
        if event_type not in self.callbacks:
            self.callbacks[event_type] = []
        self.callbacks[event_type].append(callback)
    
    def _emit(self, event_type: str, data: Any):
        """이벤트 발생"""
        if event_type in self.callbacks:
            for callback in self.callbacks[event_type]:
                try:
                    callback(data)
                except Exception as e:
                    logger.error(f"Callback error: {e}")
    
    async def _handle_ticker(self, uri: str):
        """실시간 가격 데이터 처리"""
        async with websockets.connect(uri) as websocket:
            logger.info(f"Connected to ticker stream")
            
            while self.running:
                try:
                    message = await websocket.recv()
                    data = json.loads(message)
                    
                    # 데이터 포맷팅
                    ticker_data = {
                        'symbol': data['s'],
                        'price': float(data['c']),
                        'change_24h': float(data['P']),
                        'volume_24h': float(data['v']),
                        'high_24h': float(data['h']),
                        'low_24h': float(data['l']),
                        'timestamp': datetime.fromtimestamp(data['E'] / 1000)
                    }
                    
                    # 이벤트 발생
                    self._emit('ticker', ticker_data)
                    
                    # DB 저장 (선택적)
                    await self._save_ticker_to_db(ticker_data)
                    
                except websockets.exceptions.ConnectionClosed:
                    logger.warning("WebSocket connection closed, reconnecting...")
                    await asyncio.sleep(5)
                    return await self._handle_ticker(uri)
                except Exception as e:
                    logger.error(f"Ticker handler error: {e}")
                    await asyncio.sleep(1)
    
    async def _handle_kline(self, uri: str, interval: str = '1m'):
        """K선(캔들) 데이터 처리"""
        async with websockets.connect(uri) as websocket:
            logger.info(f"Connected to kline stream ({interval})")
            
            while self.running:
                try:
                    message = await websocket.recv()
                    data = json.loads(message)
                    
                    if 'k' in data:
                        kline = data['k']
                        kline_data = {
                            'symbol': data['s'],
                            'interval': kline['i'],
                            'open': float(kline['o']),
                            'high': float(kline['h']),
                            'low': float(kline['l']),
                            'close': float(kline['c']),
                            'volume': float(kline['v']),
                            'close_time': datetime.fromtimestamp(kline['T'] / 1000),
                            'is_closed': kline['x']
                        }
                        
                        # 완성된 캔들만 처리
                        if kline_data['is_closed']:
                            self._emit('kline', kline_data)
                            await self._save_kline_to_db(kline_data)
                    
                except websockets.exceptions.ConnectionClosed:
                    logger.warning("Kline connection closed, reconnecting...")
                    await asyncio.sleep(5)
                    return await self._handle_kline(uri, interval)
                except Exception as e:
                    logger.error(f"Kline handler error: {e}")
                    await asyncio.sleep(1)
    
    async def _handle_trade(self, uri: str):
        """실시간 거래 데이터 처리"""
        async with websockets.connect(uri) as websocket:
            logger.info(f"Connected to trade stream")
            
            while self.running:
                try:
                    message = await websocket.recv()
                    data = json.loads(message)
                    
                    trade_data = {
                        'symbol': data['s'],
                        'price': float(data['p']),
                        'quantity': float(data['q']),
                        'timestamp': datetime.fromtimestamp(data['T'] / 1000),
                        'is_buyer_maker': data['m']
                    }
                    
                    self._emit('trade', trade_data)
                    
                except websockets.exceptions.ConnectionClosed:
                    logger.warning("Trade connection closed, reconnecting...")
                    await asyncio.sleep(5)
                    return await self._handle_trade(uri)
                except Exception as e:
                    logger.error(f"Trade handler error: {e}")
                    await asyncio.sleep(1)
    
    async def _handle_depth(self, uri: str):
        """오더북(호가) 데이터 처리"""
        async with websockets.connect(uri) as websocket:
            logger.info(f"Connected to depth stream")
            
            while self.running:
                try:
                    message = await websocket.recv()
                    data = json.loads(message)
                    
                    depth_data = {
                        'symbol': data.get('s', ''),
                        'bids': [[float(p), float(q)] for p, q in data.get('b', [])[:10]],
                        'asks': [[float(p), float(q)] for p, q in data.get('a', [])[:10]],
                        'timestamp': datetime.now()
                    }
                    
                    self._emit('depth', depth_data)
                    
                except websockets.exceptions.ConnectionClosed:
                    logger.warning("Depth connection closed, reconnecting...")
                    await asyncio.sleep(5)
                    return await self._handle_depth(uri)
                except Exception as e:
                    logger.error(f"Depth handler error: {e}")
                    await asyncio.sleep(1)
    
    async def _save_ticker_to_db(self, ticker_data: Dict):
        """티커 데이터 DB 저장"""
        try:
            conn = self.get_db_connection()
            cur = conn.cursor()
            
            cur.execute("""
                INSERT INTO market_data_cache 
                (symbol, timeframe, close_price, volume, timestamp)
                VALUES (%s, 'ticker', %s, %s, %s)
                ON CONFLICT (symbol, timeframe, timestamp) 
                DO UPDATE SET 
                    close_price = EXCLUDED.close_price,
                    volume = EXCLUDED.volume
            """, (
                ticker_data['symbol'],
                ticker_data['price'],
                ticker_data['volume_24h'],
                ticker_data['timestamp']
            ))
            
            conn.commit()
            cur.close()
            conn.close()
            
        except Exception as e:
            logger.error(f"DB save error: {e}")
    
    async def _save_kline_to_db(self, kline_data: Dict):
        """K선 데이터 DB 저장"""
        try:
            conn = self.get_db_connection()
            cur = conn.cursor()
            
            cur.execute("""
                INSERT INTO market_data_cache 
                (symbol, timeframe, open_price, high_price, low_price, 
                 close_price, volume, timestamp)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (symbol, timeframe, timestamp) 
                DO UPDATE SET 
                    open_price = EXCLUDED.open_price,
                    high_price = EXCLUDED.high_price,
                    low_price = EXCLUDED.low_price,
                    close_price = EXCLUDED.close_price,
                    volume = EXCLUDED.volume
            """, (
                kline_data['symbol'],
                kline_data['interval'],
                kline_data['open'],
                kline_data['high'],
                kline_data['low'],
                kline_data['close'],
                kline_data['volume'],
                kline_data['close_time']
            ))
            
            conn.commit()
            cur.close()
            conn.close()
            
        except Exception as e:
            logger.error(f"DB save error: {e}")
    
    async def start(self, streams: List[str] = None):
        """WebSocket 스트리밍 시작"""
        self.running = True
        
        if streams is None:
            streams = ['ticker', 'kline', 'trade']
        
        tasks = []
        
        for symbol in self.symbols:
            if 'ticker' in streams:
                # 24시간 미니 티커
                uri = f"{self.base_url}/{symbol}@ticker"
                tasks.append(asyncio.create_task(self._handle_ticker(uri)))
            
            if 'kline' in streams:
                # 1분봉 K선
                uri = f"{self.base_url}/{symbol}@kline_1m"
                tasks.append(asyncio.create_task(self._handle_kline(uri, '1m')))
            
            if 'trade' in streams:
                # 실시간 거래
                uri = f"{self.base_url}/{symbol}@trade"
                tasks.append(asyncio.create_task(self._handle_trade(uri)))
            
            if 'depth' in streams:
                # 오더북
                uri = f"{self.base_url}/{symbol}@depth20@100ms"
                tasks.append(asyncio.create_task(self._handle_depth(uri)))
        
        self.tasks = tasks
        logger.info(f"Started {len(tasks)} WebSocket streams")
        
        try:
            await asyncio.gather(*tasks)
        except Exception as e:
            logger.error(f"WebSocket error: {e}")
        finally:
            self.stop()
    
    def stop(self):
        """WebSocket 스트리밍 중지"""
        self.running = False
        for task in self.tasks:
            task.cancel()
        logger.info("WebSocket streams stopped")


class WebSocketManager:
    """WebSocket 관리자 (Streamlit 앱용)"""
    
    def __init__(self):
        self.client = BinanceWebSocketClient()
        self.loop = None
        self.thread = None
        
    def subscribe(self, event_type: str, callback: Callable):
        """이벤트 구독"""
        self.client.subscribe(event_type, callback)
    
    def start_async(self, streams: List[str] = None):
        """비동기 스트리밍 시작"""
        import threading
        
        def run_loop():
            asyncio.set_event_loop(asyncio.new_event_loop())
            loop = asyncio.get_event_loop()
            self.loop = loop
            loop.run_until_complete(self.client.start(streams))
        
        self.thread = threading.Thread(target=run_loop)
        self.thread.start()
    
    def stop(self):
        """스트리밍 중지"""
        if self.client:
            self.client.stop()
        if self.loop:
            self.loop.stop()
        if self.thread:
            self.thread.join()


# 사용 예제
if __name__ == "__main__":
    async def main():
        client = BinanceWebSocketClient()
        
        # 콜백 함수 정의
        def on_ticker(data):
            print(f"Ticker: {data['symbol']} = ${data['price']:,.2f} ({data['change_24h']:+.2f}%)")
        
        def on_kline(data):
            print(f"Kline: {data['symbol']} Close: ${data['close']:,.2f} Volume: {data['volume']:,.0f}")
        
        def on_trade(data):
            print(f"Trade: {data['symbol']} ${data['price']:,.2f} x {data['quantity']:.8f}")
        
        # 이벤트 구독
        client.subscribe('ticker', on_ticker)
        client.subscribe('kline', on_kline)
        client.subscribe('trade', on_trade)
        
        # 스트리밍 시작
        await client.start(['ticker', 'kline'])
    
    # 실행
    asyncio.run(main())