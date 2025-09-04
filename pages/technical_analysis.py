"""
기술적 분석 페이지 모듈
30+ 기술적 지표, 패턴 인식, 지지/저항 분석 등
"""

import streamlit as st
import pandas as pd
import plotly.graph_objects as go
import numpy as np
from plotly.subplots import make_subplots


def show_page(page_id: str):
    """페이지 라우팅"""
    if page_id == 'ta_indicators':
        show_technical_indicators()
    elif page_id == 'ta_patterns':
        show_pattern_recognition()
    elif page_id == 'ta_support_resistance':
        show_support_resistance()
    elif page_id == 'ta_volume':
        show_volume_analysis()
    elif page_id == 'ta_orderflow':
        show_orderflow()
    else:
        st.error(f"페이지 {page_id}를 찾을 수 없습니다.")


def show_technical_indicators():
    """30+ 기술적 지표 페이지"""
    st.subheader("📊 기술적 지표 분석")
    
    # 심볼 및 설정
    col1, col2, col3 = st.columns([2, 1, 1])
    with col1:
        symbol = st.selectbox("심볼", ["BTCUSDT", "ETHUSDT", "BNBUSDT", "SOLUSDT"])
    with col2:
        timeframe = st.selectbox("시간대", ["1m", "5m", "15m", "1h", "4h", "1d"])
    with col3:
        if st.button("🔄 새로고침", use_container_width=True):
            st.rerun()
    
    # 지표 선택
    st.markdown("### 📈 지표 선택")
    
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        st.markdown("#### 이동평균선")
        use_sma = st.checkbox("SMA (20, 50, 200)")
        use_ema = st.checkbox("EMA (12, 26)")
        use_wma = st.checkbox("WMA (20)")
        use_vwma = st.checkbox("VWMA (20)")
    
    with col2:
        st.markdown("#### 모멘텀")
        use_rsi = st.checkbox("RSI (14)")
        use_macd = st.checkbox("MACD")
        use_stoch = st.checkbox("Stochastic")
        use_cci = st.checkbox("CCI (20)")
        use_williams = st.checkbox("Williams %R")
    
    with col3:
        st.markdown("#### 변동성")
        use_bb = st.checkbox("Bollinger Bands")
        use_atr = st.checkbox("ATR (14)")
        use_keltner = st.checkbox("Keltner Channel")
        use_donchian = st.checkbox("Donchian Channel")
    
    with col4:
        st.markdown("#### 볼륨/추세")
        use_obv = st.checkbox("OBV")
        use_cmf = st.checkbox("CMF")
        use_vwap = st.checkbox("VWAP")
        use_adx = st.checkbox("ADX")
        use_ichimoku = st.checkbox("Ichimoku")
    
    # 차트 생성
    st.markdown("### 📉 차트")
    
    # 샘플 데이터 생성
    dates = pd.date_range(start="2024-01-01", periods=100, freq="H")
    prices = 42000 + np.cumsum(np.random.randn(100) * 100)
    volume = np.random.uniform(1000000, 5000000, 100)
    
    # 서브플롯 생성
    fig = make_subplots(
        rows=3, cols=1,
        shared_xaxes=True,
        vertical_spacing=0.03,
        row_heights=[0.5, 0.25, 0.25],
        subplot_titles=("Price", "RSI", "Volume")
    )
    
    # 가격 차트
    fig.add_trace(
        go.Candlestick(
            x=dates,
            open=prices - np.random.uniform(0, 50, 100),
            high=prices + np.random.uniform(0, 100, 100),
            low=prices - np.random.uniform(0, 100, 100),
            close=prices,
            name="Price"
        ),
        row=1, col=1
    )
    
    # SMA 추가
    if use_sma:
        sma20 = pd.Series(prices).rolling(20).mean()
        fig.add_trace(
            go.Scatter(x=dates, y=sma20, name="SMA 20", line=dict(color='blue')),
            row=1, col=1
        )
    
    # Bollinger Bands
    if use_bb:
        sma = pd.Series(prices).rolling(20).mean()
        std = pd.Series(prices).rolling(20).std()
        upper = sma + (std * 2)
        lower = sma - (std * 2)
        
        fig.add_trace(
            go.Scatter(x=dates, y=upper, name="BB Upper", line=dict(color='gray', dash='dash')),
            row=1, col=1
        )
        fig.add_trace(
            go.Scatter(x=dates, y=lower, name="BB Lower", line=dict(color='gray', dash='dash')),
            row=1, col=1
        )
    
    # RSI
    if use_rsi:
        rsi = 50 + np.cumsum(np.random.randn(100) * 2)
        rsi = np.clip(rsi, 0, 100)
        
        fig.add_trace(
            go.Scatter(x=dates, y=rsi, name="RSI", line=dict(color='purple')),
            row=2, col=1
        )
        fig.add_hline(y=70, line_dash="dash", line_color="red", row=2, col=1)
        fig.add_hline(y=30, line_dash="dash", line_color="green", row=2, col=1)
    
    # Volume
    fig.add_trace(
        go.Bar(x=dates, y=volume, name="Volume", marker_color='lightblue'),
        row=3, col=1
    )
    
    fig.update_xaxes(title_text="Date", row=3, col=1)
    fig.update_yaxes(title_text="Price", row=1, col=1)
    fig.update_yaxes(title_text="RSI", row=2, col=1)
    fig.update_yaxes(title_text="Volume", row=3, col=1)
    
    fig.update_layout(height=800, showlegend=True, hovermode='x unified')
    st.plotly_chart(fig, use_container_width=True)
    
    # 지표 신호
    st.markdown("### 🚦 지표 신호")
    
    signals = pd.DataFrame({
        "지표": ["RSI", "MACD", "Bollinger Bands", "Stochastic", "ADX"],
        "값": ["68.5", "Bullish Cross", "Price at Upper", "75/80", "32"],
        "신호": ["중립", "매수", "매도", "과매수", "강한 추세"],
        "강도": ["보통", "강함", "강함", "매우 강함", "강함"]
    })
    
    st.dataframe(signals, use_container_width=True)


def show_pattern_recognition():
    """패턴 인식 페이지"""
    st.subheader("🔍 패턴 인식")
    
    # 검색 설정
    col1, col2, col3 = st.columns(3)
    with col1:
        symbol = st.selectbox("심볼", ["BTCUSDT", "ETHUSDT", "BNBUSDT"])
    with col2:
        timeframe = st.selectbox("시간대", ["15m", "1h", "4h", "1d"])
    with col3:
        pattern_type = st.selectbox("패턴 유형", ["전체", "반전", "지속", "캔들스틱"])
    
    # 발견된 패턴
    st.markdown("### 📌 발견된 패턴")
    
    patterns = pd.DataFrame({
        "시간": pd.date_range(start="2024-01-01", periods=10, freq="H"),
        "패턴": ["Head & Shoulders", "Double Bottom", "Ascending Triangle", 
                "Bull Flag", "Cup & Handle", "Wedge", "Pennant", 
                "Triple Top", "Rectangle", "Diamond"],
        "유형": ["반전", "반전", "지속", "지속", "지속", 
                "반전", "지속", "반전", "지속", "반전"],
        "신뢰도": [85, 78, 72, 80, 75, 68, 71, 82, 69, 66],
        "예상 변동": ["+5.2%", "+3.8%", "+2.5%", "+4.1%", "+3.2%",
                   "-2.8%", "+1.9%", "-4.5%", "+2.1%", "-3.3%"],
        "상태": ["형성 중", "완성", "형성 중", "완성", "형성 중",
                "완성", "형성 중", "완성", "형성 중", "완성"]
    })
    
    # 색상 코딩
    def highlight_pattern(row):
        if row["유형"] == "반전":
            if "+" in row["예상 변동"]:
                return ['background-color: #d4edda'] * len(row)
            else:
                return ['background-color: #f8d7da'] * len(row)
        else:
            return ['background-color: #d1ecf1'] * len(row)
    
    styled_df = patterns.style.apply(highlight_pattern, axis=1)
    st.dataframe(styled_df, use_container_width=True)
    
    # 패턴 차트
    st.markdown("### 📊 패턴 시각화")
    
    # 샘플 차트 데이터
    dates = pd.date_range(start="2024-01-01", periods=50, freq="H")
    prices = 42000 + np.cumsum(np.random.randn(50) * 50)
    
    fig = go.Figure()
    
    # 캔들스틱
    fig.add_trace(go.Candlestick(
        x=dates,
        open=prices - np.random.uniform(0, 30, 50),
        high=prices + np.random.uniform(0, 50, 50),
        low=prices - np.random.uniform(0, 50, 50),
        close=prices,
        name="Price"
    ))
    
    # Head & Shoulders 패턴 예시
    pattern_x = dates[10:30]
    pattern_y = prices[10:30]
    fig.add_trace(go.Scatter(
        x=pattern_x[[0, 5, 10, 15, 19]],
        y=pattern_y[[0, 5, 10, 15, 19]] + np.array([0, 200, 50, 200, 0]),
        mode='lines+markers',
        name='Head & Shoulders',
        line=dict(color='red', width=2, dash='dash'),
        marker=dict(size=8)
    ))
    
    # 패턴 영역 표시
    fig.add_vrect(
        x0=dates[10], x1=dates[29],
        fillcolor="red", opacity=0.1,
        layer="below", line_width=0,
    )
    
    fig.update_layout(
        title="Head & Shoulders 패턴 발견",
        xaxis_title="시간",
        yaxis_title="가격",
        height=500
    )
    st.plotly_chart(fig, use_container_width=True)
    
    # 패턴 통계
    st.markdown("### 📈 패턴 통계")
    
    col1, col2 = st.columns(2)
    
    with col1:
        st.markdown("#### 패턴별 성공률")
        success_rates = pd.DataFrame({
            "패턴": ["Head & Shoulders", "Double Bottom", "Triangle", "Flag"],
            "성공률": [72, 68, 65, 71],
            "발생 빈도": [23, 31, 45, 38]
        })
        st.dataframe(success_rates, use_container_width=True)
    
    with col2:
        st.markdown("#### 시간대별 패턴 분포")
        timeframe_patterns = pd.DataFrame({
            "시간대": ["1h", "4h", "1d", "1w"],
            "반전 패턴": [45, 38, 27, 15],
            "지속 패턴": [62, 51, 34, 22]
        })
        st.dataframe(timeframe_patterns, use_container_width=True)


def show_support_resistance():
    """지지/저항 분석 페이지"""
    st.subheader("📊 지지/저항 레벨")
    
    # 설정
    col1, col2, col3 = st.columns(3)
    with col1:
        symbol = st.selectbox("심볼", ["BTCUSDT", "ETHUSDT", "BNBUSDT"])
    with col2:
        timeframe = st.selectbox("시간대", ["1h", "4h", "1d", "1w"])
    with col3:
        method = st.selectbox("분석 방법", ["피보나치", "피벗 포인트", "볼륨 프로파일", "자동 감지"])
    
    # 현재 가격
    current_price = 42150
    st.metric("현재 가격", f"${current_price:,}")
    
    # 지지/저항 레벨
    st.markdown("### 📍 주요 레벨")
    
    levels = pd.DataFrame({
        "레벨": ["R3", "R2", "R1", "Pivot", "S1", "S2", "S3"],
        "가격": [43500, 43000, 42500, 42000, 41500, 41000, 40500],
        "강도": ["약함", "중간", "강함", "매우 강함", "강함", "중간", "약함"],
        "거리": ["+3.2%", "+2.0%", "+0.8%", "-0.4%", "-1.5%", "-2.7%", "-3.9%"],
        "터치 횟수": [2, 4, 7, 12, 8, 5, 3]
    })
    
    # 색상 코딩
    def color_levels(val):
        if isinstance(val, str) and "+" in val:
            return 'color: red'
        elif isinstance(val, str) and "-" in val:
            return 'color: green'
        return ''
    
    styled_levels = levels.style.applymap(color_levels, subset=['거리'])
    st.dataframe(styled_levels, use_container_width=True)
    
    # 차트
    st.markdown("### 📈 레벨 차트")
    
    dates = pd.date_range(start="2024-01-01", periods=100, freq="H")
    prices = 42000 + np.cumsum(np.random.randn(100) * 50)
    
    fig = go.Figure()
    
    # 캔들스틱
    fig.add_trace(go.Candlestick(
        x=dates,
        open=prices - np.random.uniform(0, 30, 100),
        high=prices + np.random.uniform(0, 50, 100),
        low=prices - np.random.uniform(0, 50, 100),
        close=prices,
        name="Price"
    ))
    
    # 지지/저항선
    colors = {'R': 'red', 'S': 'green', 'P': 'blue'}
    for _, row in levels.iterrows():
        level_type = row["레벨"][0]
        color = colors.get(level_type, 'gray')
        
        fig.add_hline(
            y=row["가격"],
            line_dash="dash" if row["강도"] == "약함" else "solid",
            line_color=color,
            line_width=1 if row["강도"] == "약함" else 2,
            annotation_text=f"{row['레벨']}: ${row['가격']:,}",
            annotation_position="right"
        )
    
    fig.update_layout(
        title="지지/저항 레벨",
        xaxis_title="시간",
        yaxis_title="가격",
        height=600
    )
    st.plotly_chart(fig, use_container_width=True)
    
    # 피보나치 레벨
    if method == "피보나치":
        st.markdown("### 🔢 피보나치 되돌림")
        
        fib_levels = pd.DataFrame({
            "레벨": ["0%", "23.6%", "38.2%", "50%", "61.8%", "78.6%", "100%"],
            "가격": [40000, 40944, 41528, 42000, 42472, 43056, 44000],
            "설명": ["최저점", "약한 지지", "중간 지지", "심리적 레벨", 
                    "황금 비율", "강한 저항", "최고점"]
        })
        st.dataframe(fib_levels, use_container_width=True)


def show_volume_analysis():
    """볼륨 분석 페이지"""
    st.subheader("📊 볼륨 분석")
    
    # 설정
    col1, col2, col3 = st.columns(3)
    with col1:
        symbol = st.selectbox("심볼", ["BTCUSDT", "ETHUSDT", "BNBUSDT"])
    with col2:
        timeframe = st.selectbox("시간대", ["5m", "15m", "1h", "4h"])
    with col3:
        if st.button("🔄 새로고침", use_container_width=True):
            st.rerun()
    
    # 볼륨 지표
    st.markdown("### 📈 볼륨 지표")
    
    col1, col2, col3, col4 = st.columns(4)
    with col1:
        st.metric("24시간 거래량", "$2.4B", "+12.5%")
    with col2:
        st.metric("평균 거래량", "$1.8B", "+5.2%")
    with col3:
        st.metric("OBV", "125.4M", "+8.3%")
    with col4:
        st.metric("CMF", "0.35", "+0.05")
    
    # 볼륨 프로파일
    st.markdown("### 📊 볼륨 프로파일")
    
    # 가격대별 볼륨
    price_levels = np.linspace(40000, 44000, 20)
    volumes = np.random.exponential(1000000, 20)
    
    fig = go.Figure()
    
    # 수평 바 차트로 볼륨 프로파일 표시
    fig.add_trace(go.Bar(
        y=price_levels,
        x=volumes,
        orientation='h',
        name='Volume',
        marker=dict(
            color=volumes,
            colorscale='Viridis',
            showscale=True
        )
    ))
    
    # POC (Point of Control) 표시
    max_volume_idx = np.argmax(volumes)
    fig.add_hline(
        y=price_levels[max_volume_idx],
        line_color="red",
        line_width=2,
        annotation_text=f"POC: ${price_levels[max_volume_idx]:,.0f}"
    )
    
    # Value Area
    total_volume = volumes.sum()
    sorted_indices = np.argsort(volumes)[::-1]
    cumsum = 0
    value_area_indices = []
    
    for idx in sorted_indices:
        cumsum += volumes[idx]
        value_area_indices.append(idx)
        if cumsum >= total_volume * 0.7:
            break
    
    value_area_high = max([price_levels[i] for i in value_area_indices])
    value_area_low = min([price_levels[i] for i in value_area_indices])
    
    fig.add_hrect(
        y0=value_area_low, y1=value_area_high,
        fillcolor="blue", opacity=0.1,
        layer="below", line_width=0,
        annotation_text="Value Area (70%)"
    )
    
    fig.update_layout(
        title="볼륨 프로파일",
        xaxis_title="거래량",
        yaxis_title="가격 레벨",
        height=600
    )
    st.plotly_chart(fig, use_container_width=True)
    
    # 시간대별 볼륨
    st.markdown("### ⏰ 시간대별 볼륨")
    
    hours = list(range(24))
    hourly_volume = np.random.uniform(50000000, 200000000, 24)
    
    fig = go.Figure()
    fig.add_trace(go.Bar(
        x=hours,
        y=hourly_volume,
        marker_color=hourly_volume,
        marker_colorscale='Blues',
        text=[f"{v/1e6:.0f}M" for v in hourly_volume],
        textposition='auto'
    ))
    
    fig.update_layout(
        title="시간대별 거래량 (UTC)",
        xaxis_title="시간",
        yaxis_title="거래량 (USD)",
        height=400
    )
    st.plotly_chart(fig, use_container_width=True)


def show_orderflow():
    """오더플로우 분석 페이지"""
    st.subheader("💹 오더플로우 분석")
    
    # 설정
    col1, col2, col3 = st.columns(3)
    with col1:
        symbol = st.selectbox("심볼", ["BTCUSDT", "ETHUSDT", "BNBUSDT"])
    with col2:
        depth = st.selectbox("깊이", ["10", "25", "50", "100"])
    with col3:
        if st.button("🔄 실시간 업데이트", use_container_width=True):
            st.rerun()
    
    # 오더북 불균형
    st.markdown("### 📊 오더북 불균형")
    
    col1, col2, col3, col4 = st.columns(4)
    with col1:
        st.metric("매수 압력", "65%", "+5%")
    with col2:
        st.metric("매도 압력", "35%", "-5%")
    with col3:
        st.metric("불균형 비율", "1.86", "+0.15")
    with col4:
        st.metric("예상 방향", "상승", "강함")
    
    # 오더북 히트맵
    st.markdown("### 🔥 오더북 히트맵")
    
    # 가격 레벨
    price_levels = np.linspace(41800, 42200, 20)
    times = pd.date_range(start="2024-01-01", periods=50, freq="T")
    
    # 랜덤 오더북 데이터
    order_data = np.random.uniform(0, 1000000, (20, 50))
    
    fig = go.Figure(data=go.Heatmap(
        z=order_data,
        x=times,
        y=price_levels,
        colorscale='RdYlGn',
        colorbar=dict(title="Volume (USD)")
    ))
    
    fig.update_layout(
        title="오더북 히트맵",
        xaxis_title="시간",
        yaxis_title="가격",
        height=500
    )
    st.plotly_chart(fig, use_container_width=True)
    
    # 대량 주문
    st.markdown("### 🐋 대량 주문 (Whale Orders)")
    
    whale_orders = pd.DataFrame({
        "시간": pd.date_range(start="2024-01-01 12:00", periods=10, freq="5T"),
        "유형": ["매수", "매도", "매수", "매수", "매도", "매수", "매도", "매수", "매수", "매도"],
        "가격": [42100, 42150, 42080, 42120, 42180, 42090, 42160, 42110, 42130, 42170],
        "수량": ["125 BTC", "89 BTC", "156 BTC", "203 BTC", "95 BTC", 
                "178 BTC", "112 BTC", "234 BTC", "167 BTC", "143 BTC"],
        "금액": ["$5.26M", "$3.75M", "$6.56M", "$8.54M", "$4.00M",
                "$7.48M", "$4.71M", "$9.85M", "$7.03M", "$6.02M"],
        "영향": ["높음", "중간", "높음", "매우 높음", "중간",
                "높음", "중간", "매우 높음", "높음", "높음"]
    })
    
    # 색상 코딩
    def color_type(val):
        if val == "매수":
            return 'background-color: #d4edda'
        elif val == "매도":
            return 'background-color: #f8d7da'
        return ''
    
    styled_whales = whale_orders.style.applymap(color_type, subset=['유형'])
    st.dataframe(styled_whales, use_container_width=True)
    
    # 유동성 히트맵
    st.markdown("### 💧 유동성 히트맵")
    
    col1, col2 = st.columns(2)
    
    with col1:
        st.markdown("#### 매수 유동성")
        buy_liquidity = pd.DataFrame({
            "가격대": ["$42,000-42,050", "$41,950-42,000", "$41,900-41,950"],
            "유동성": ["$12.5M", "$8.3M", "$6.7M"],
            "주문 수": [234, 156, 128]
        })
        st.dataframe(buy_liquidity, use_container_width=True)
    
    with col2:
        st.markdown("#### 매도 유동성")
        sell_liquidity = pd.DataFrame({
            "가격대": ["$42,150-42,200", "$42,200-42,250", "$42,250-42,300"],
            "유동성": ["$9.8M", "$11.2M", "$7.5M"],
            "주문 수": [189, 212, 145]
        })
        st.dataframe(sell_liquidity, use_container_width=True)