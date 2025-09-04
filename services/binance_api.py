"""
바이낸스 API 연동 모듈
실제 바이낸스 데이터만 사용
"""

import os
import time
import logging
from typing import List, Dict, Optional
from binance.client import Client
from binance.exceptions import BinanceAPIException
# BinanceSocketManager는 python-binance v2에서 제거됨
import pandas as pd
import streamlit as st
from config import BINANCE_CONFIG

logger = logging.getLogger(__name__)


class BinanceAPI:
    """바이낸스 API 클래스"""
    
    def __init__(self):
        """바이낸스 클라이언트 초기화"""
        try:
            self.client = Client(
                BINANCE_CONFIG['api_key'],
                BINANCE_CONFIG['secret_key'],
                testnet=BINANCE_CONFIG['testnet']
            )
            self.bsm = None
            logger.info("Binance API client initialized")
        except Exception as e:
            logger.error(f"Failed to initialize Binance client: {e}")
            st.error(f"바이낸스 API 연결 실패: {e}")
    
    def get_account_info(self):
        """계정 정보 조회"""
        try:
            return self.client.get_account()
        except BinanceAPIException as e:
            logger.error(f"Failed to get account info: {e}")
            return None
    
    def get_ticker_price(self, symbol: str) -> Optional[Dict]:
        """특정 심볼의 현재 가격 조회"""
        try:
            ticker = self.client.get_symbol_ticker(symbol=symbol)
            return {
                'symbol': ticker['symbol'],
                'price': float(ticker['price']),
                'timestamp': time.time()
            }
        except BinanceAPIException as e:
            logger.error(f"Failed to get ticker price for {symbol}: {e}")
            return None
    
    def get_all_tickers(self) -> List[Dict]:
        """모든 티커 가격 조회"""
        try:
            tickers = self.client.get_all_tickers()
            return [{
                'symbol': t['symbol'],
                'price': float(t['price'])
            } for t in tickers]
        except BinanceAPIException as e:
            logger.error(f"Failed to get all tickers: {e}")
            return []
    
    def get_24hr_ticker(self, symbol: str) -> Optional[Dict]:
        """24시간 통계 정보 조회"""
        try:
            ticker = self.client.get_ticker(symbol=symbol)
            return {
                'symbol': ticker['symbol'],
                'price': float(ticker['lastPrice']),
                'price_change': float(ticker['priceChange']),
                'price_change_percent': float(ticker['priceChangePercent']),
                'volume': float(ticker['volume']),
                'quote_volume': float(ticker['quoteVolume']),
                'high_24h': float(ticker['highPrice']),
                'low_24h': float(ticker['lowPrice']),
                'open_24h': float(ticker['openPrice']),
                'count': int(ticker['count'])
            }
        except BinanceAPIException as e:
            logger.error(f"Failed to get 24hr ticker for {symbol}: {e}")
            return None
    
    def get_order_book(self, symbol: str, limit: int = 100) -> Optional[Dict]:
        """오더북 조회"""
        try:
            order_book = self.client.get_order_book(symbol=symbol, limit=limit)
            return {
                'bids': [[float(price), float(qty)] for price, qty in order_book['bids']],
                'asks': [[float(price), float(qty)] for price, qty in order_book['asks']],
                'last_update': order_book['lastUpdateId']
            }
        except BinanceAPIException as e:
            logger.error(f"Failed to get order book for {symbol}: {e}")
            return None
    
    def get_klines(self, symbol: str, interval: str, limit: int = 500) -> pd.DataFrame:
        """캔들스틱 데이터 조회"""
        try:
            klines = self.client.get_klines(
                symbol=symbol,
                interval=interval,
                limit=limit
            )
            
            df = pd.DataFrame(klines, columns=[
                'timestamp', 'open', 'high', 'low', 'close', 'volume',
                'close_time', 'quote_volume', 'trades', 'taker_buy_base',
                'taker_buy_quote', 'ignore'
            ])
            
            # 데이터 타입 변환
            df['timestamp'] = pd.to_datetime(df['timestamp'], unit='ms')
            for col in ['open', 'high', 'low', 'close', 'volume', 'quote_volume']:
                df[col] = df[col].astype(float)
            
            df.set_index('timestamp', inplace=True)
            return df
            
        except BinanceAPIException as e:
            logger.error(f"Failed to get klines for {symbol}: {e}")
            return pd.DataFrame()
    
    def get_recent_trades(self, symbol: str, limit: int = 100) -> List[Dict]:
        """최근 체결 내역 조회"""
        try:
            trades = self.client.get_recent_trades(symbol=symbol, limit=limit)
            return [{
                'id': t['id'],
                'price': float(t['price']),
                'qty': float(t['qty']),
                'time': pd.to_datetime(t['time'], unit='ms'),
                'is_buyer_maker': t['isBuyerMaker']
            } for t in trades]
        except BinanceAPIException as e:
            logger.error(f"Failed to get recent trades for {symbol}: {e}")
            return []
    
    def get_exchange_info(self, symbol: Optional[str] = None) -> Optional[Dict]:
        """거래소 정보 조회"""
        try:
            info = self.client.get_exchange_info()
            if symbol:
                for s in info['symbols']:
                    if s['symbol'] == symbol:
                        return s
                return None
            return info
        except BinanceAPIException as e:
            logger.error(f"Failed to get exchange info: {e}")
            return None
    
    def place_order(self, symbol: str, side: str, order_type: str, 
                   quantity: float, price: Optional[float] = None) -> Optional[Dict]:
        """주문 실행"""
        try:
            if order_type == 'MARKET':
                order = self.client.create_order(
                    symbol=symbol,
                    side=side,
                    type=order_type,
                    quantity=quantity
                )
            else:  # LIMIT
                order = self.client.create_order(
                    symbol=symbol,
                    side=side,
                    type=order_type,
                    quantity=quantity,
                    price=price,
                    timeInForce='GTC'
                )
            
            logger.info(f"Order placed: {order}")
            return order
            
        except BinanceAPIException as e:
            logger.error(f"Failed to place order: {e}")
            st.error(f"주문 실행 실패: {e}")
            return None
    
    def cancel_order(self, symbol: str, order_id: int) -> bool:
        """주문 취소"""
        try:
            result = self.client.cancel_order(
                symbol=symbol,
                orderId=order_id
            )
            logger.info(f"Order cancelled: {result}")
            return True
        except BinanceAPIException as e:
            logger.error(f"Failed to cancel order: {e}")
            return False
    
    def get_open_orders(self, symbol: Optional[str] = None) -> List[Dict]:
        """미체결 주문 조회"""
        try:
            if symbol:
                orders = self.client.get_open_orders(symbol=symbol)
            else:
                orders = self.client.get_open_orders()
            
            return [{
                'symbol': o['symbol'],
                'order_id': o['orderId'],
                'price': float(o['price']),
                'orig_qty': float(o['origQty']),
                'executed_qty': float(o['executedQty']),
                'status': o['status'],
                'type': o['type'],
                'side': o['side'],
                'time': pd.to_datetime(o['time'], unit='ms')
            } for o in orders]
            
        except BinanceAPIException as e:
            logger.error(f"Failed to get open orders: {e}")
            return []
    
    def get_balance(self, asset: str) -> float:
        """특정 자산 잔고 조회"""
        try:
            balance = self.client.get_asset_balance(asset=asset)
            if balance:
                return float(balance['free']) + float(balance['locked'])
            return 0.0
        except BinanceAPIException as e:
            logger.error(f"Failed to get balance for {asset}: {e}")
            return 0.0
    
    def get_all_balances(self) -> Dict[str, float]:
        """모든 자산 잔고 조회"""
        try:
            account = self.client.get_account()
            balances = {}
            for balance in account['balances']:
                total = float(balance['free']) + float(balance['locked'])
                if total > 0:
                    balances[balance['asset']] = total
            return balances
        except BinanceAPIException as e:
            logger.error(f"Failed to get all balances: {e}")
            return {}
    
    def start_websocket(self, symbol: str, callback):
        """웹소켓 스트림 시작"""
        try:
            if not self.bsm:
                self.bsm = BinanceSocketManager(self.client)
            
            conn_key = self.bsm.start_symbol_ticker_socket(symbol, callback)
            self.bsm.start()
            return conn_key
            
        except Exception as e:
            logger.error(f"Failed to start websocket for {symbol}: {e}")
            return None
    
    def stop_websocket(self, conn_key):
        """웹소켓 스트림 중지"""
        try:
            if self.bsm:
                self.bsm.stop_socket(conn_key)
        except Exception as e:
            logger.error(f"Failed to stop websocket: {e}")


# 싱글톤 인스턴스
@st.cache_resource
def get_binance_client():
    """바이낸스 클라이언트 싱글톤 인스턴스 반환"""
    return BinanceAPI()


# 헬퍼 함수들

def get_top_gainers(limit: int = 10) -> List[Dict]:
    """상승률 상위 코인 조회"""
    client = get_binance_client()
    tickers = client.client.get_ticker()
    
    # USDT 페어만 필터링하고 상승률 순으로 정렬
    usdt_pairs = [t for t in tickers if t['symbol'].endswith('USDT')]
    sorted_tickers = sorted(usdt_pairs, 
                           key=lambda x: float(x['priceChangePercent']), 
                           reverse=True)
    
    return [{
        'symbol': t['symbol'],
        'price': float(t['lastPrice']),
        'change_percent': float(t['priceChangePercent']),
        'volume': float(t['volume'])
    } for t in sorted_tickers[:limit]]


def get_top_losers(limit: int = 10) -> List[Dict]:
    """하락률 상위 코인 조회"""
    client = get_binance_client()
    tickers = client.client.get_ticker()
    
    # USDT 페어만 필터링하고 하락률 순으로 정렬
    usdt_pairs = [t for t in tickers if t['symbol'].endswith('USDT')]
    sorted_tickers = sorted(usdt_pairs, 
                           key=lambda x: float(x['priceChangePercent']))
    
    return [{
        'symbol': t['symbol'],
        'price': float(t['lastPrice']),
        'change_percent': float(t['priceChangePercent']),
        'volume': float(t['volume'])
    } for t in sorted_tickers[:limit]]


def get_top_volume(limit: int = 10) -> List[Dict]:
    """거래량 상위 코인 조회"""
    client = get_binance_client()
    tickers = client.client.get_ticker()
    
    # USDT 페어만 필터링하고 거래량 순으로 정렬
    usdt_pairs = [t for t in tickers if t['symbol'].endswith('USDT')]
    sorted_tickers = sorted(usdt_pairs, 
                           key=lambda x: float(x['quoteVolume']), 
                           reverse=True)
    
    return [{
        'symbol': t['symbol'],
        'price': float(t['lastPrice']),
        'change_percent': float(t['priceChangePercent']),
        'volume': float(t['quoteVolume'])
    } for t in sorted_tickers[:limit]]