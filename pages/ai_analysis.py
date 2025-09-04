"""
AI 분석 페이지 모듈
11개 AI 모델 예측, 신뢰도 점수, 백테스팅 등
"""

import streamlit as st
import pandas as pd
import plotly.graph_objects as go
import numpy as np
from services.database import get_db_manager, get_ai_model_weights


def show_page(page_id: str):
    """페이지 라우팅"""
    if page_id == 'ai_predictions':
        show_ai_predictions()
    elif page_id == 'ai_confidence':
        show_confidence_scores()
    elif page_id == 'ai_backtesting':
        show_backtesting()
    elif page_id == 'ai_performance':
        show_ai_performance()
    elif page_id == 'ai_custom':
        show_custom_strategy()
    else:
        st.error(f"페이지 {page_id}를 찾을 수 없습니다.")


def show_ai_predictions():
    """11개 AI 모델 예측 페이지"""
    st.subheader("🤖 AI 모델 예측")
    
    # 심볼 선택
    col1, col2, col3 = st.columns([2, 1, 1])
    with col1:
        symbol = st.selectbox("심볼 선택", ["BTCUSDT", "ETHUSDT", "BNBUSDT", "SOLUSDT"])
    with col2:
        timeframe = st.selectbox("예측 기간", ["1시간", "4시간", "1일", "1주"])
    with col3:
        if st.button("🔄 새로고침", use_container_width=True):
            st.rerun()
    
    # AI 모델별 예측 결과
    st.markdown("### 📊 모델별 예측 결과")
    
    # DB에서 AI 모델 가중치 가져오기 (실제로는 DB 연결 후)
    ai_models = [
        {"name": "LSTM", "weight": 15, "prediction": "상승", "confidence": 85, "price_target": 43500},
        {"name": "GRU", "weight": 12, "prediction": "상승", "confidence": 78, "price_target": 43200},
        {"name": "Random Forest", "weight": 10, "prediction": "상승", "confidence": 72, "price_target": 43000},
        {"name": "XGBoost", "weight": 10, "prediction": "중립", "confidence": 65, "price_target": 42800},
        {"name": "LightGBM", "weight": 10, "prediction": "상승", "confidence": 70, "price_target": 43100},
        {"name": "ARIMA", "weight": 8, "prediction": "하락", "confidence": 60, "price_target": 42500},
        {"name": "Prophet", "weight": 8, "prediction": "상승", "confidence": 68, "price_target": 42900},
        {"name": "Transformer", "weight": 10, "prediction": "상승", "confidence": 82, "price_target": 43300},
        {"name": "BERT", "weight": 7, "prediction": "상승", "confidence": 75, "price_target": 43000},
        {"name": "GAN", "weight": 5, "prediction": "중립", "confidence": 55, "price_target": 42700},
        {"name": "Ensemble", "weight": 5, "prediction": "상승", "confidence": 88, "price_target": 43250}
    ]
    
    # 모델별 예측 표시
    cols = st.columns(3)
    for i, model in enumerate(ai_models):
        col_idx = i % 3
        with cols[col_idx]:
            # 예측 방향에 따른 색상
            if model["prediction"] == "상승":
                color = "🟢"
                bg_color = "#d4edda"
            elif model["prediction"] == "하락":
                color = "🔴"
                bg_color = "#f8d7da"
            else:
                color = "🟡"
                bg_color = "#fff3cd"
            
            st.markdown(f"""
                <div style='background: {bg_color}; padding: 1rem; border-radius: 10px; margin-bottom: 1rem;'>
                    <h4>{color} {model['name']}</h4>
                    <div>가중치: {model['weight']}%</div>
                    <div>예측: <strong>{model['prediction']}</strong></div>
                    <div>신뢰도: {model['confidence']}%</div>
                    <div>목표가: ${model['price_target']:,}</div>
                </div>
            """, unsafe_allow_html=True)
    
    # 종합 예측
    st.markdown("### 🎯 종합 AI 예측")
    
    col1, col2, col3, col4 = st.columns(4)
    with col1:
        st.metric("종합 예측", "강한 매수", "↑")
    with col2:
        st.metric("평균 신뢰도", "73.5%", "+5.2%")
    with col3:
        st.metric("목표 가격", "$43,127", "+2.7%")
    with col4:
        st.metric("예측 정확도", "87.3%", "+1.2%")
    
    # 예측 분포 차트
    st.markdown("### 📈 예측 분포")
    predictions_count = {"상승": 8, "중립": 2, "하락": 1}
    
    fig = go.Figure(data=[go.Pie(
        labels=list(predictions_count.keys()),
        values=list(predictions_count.values()),
        marker_colors=['#28a745', '#ffc107', '#dc3545']
    )])
    fig.update_layout(height=400)
    st.plotly_chart(fig, use_container_width=True)


def show_confidence_scores():
    """신뢰도 점수 페이지"""
    st.subheader("📊 AI 신뢰도 점수")
    
    # 시간대별 신뢰도
    st.markdown("### ⏰ 시간대별 신뢰도 변화")
    
    time_data = pd.DataFrame({
        "시간": pd.date_range(start="2024-01-01", periods=24, freq="H"),
        "LSTM": np.random.uniform(70, 90, 24),
        "GRU": np.random.uniform(65, 85, 24),
        "Transformer": np.random.uniform(75, 95, 24),
        "Ensemble": np.random.uniform(80, 95, 24)
    })
    
    fig = go.Figure()
    for model in ["LSTM", "GRU", "Transformer", "Ensemble"]:
        fig.add_trace(go.Scatter(
            x=time_data["시간"],
            y=time_data[model],
            mode='lines',
            name=model
        ))
    
    fig.update_layout(
        title="모델별 신뢰도 추이",
        xaxis_title="시간",
        yaxis_title="신뢰도 (%)",
        height=400,
        hovermode='x'
    )
    st.plotly_chart(fig, use_container_width=True)
    
    # 심볼별 신뢰도
    st.markdown("### 💹 심볼별 평균 신뢰도")
    
    symbol_confidence = pd.DataFrame({
        "심볼": ["BTC", "ETH", "BNB", "SOL", "ADA", "XRP"],
        "평균 신뢰도": [85.2, 78.5, 72.3, 68.9, 65.4, 62.1],
        "최고 신뢰도": [92.5, 86.3, 79.8, 75.2, 71.6, 68.9],
        "최저 신뢰도": [78.3, 71.2, 65.4, 61.8, 58.9, 55.3]
    })
    
    fig = go.Figure()
    fig.add_trace(go.Bar(
        x=symbol_confidence["심볼"],
        y=symbol_confidence["평균 신뢰도"],
        name="평균",
        marker_color='lightblue'
    ))
    fig.add_trace(go.Scatter(
        x=symbol_confidence["심볼"],
        y=symbol_confidence["최고 신뢰도"],
        mode='markers',
        name="최고",
        marker=dict(size=10, color='green')
    ))
    fig.add_trace(go.Scatter(
        x=symbol_confidence["심볼"],
        y=symbol_confidence["최저 신뢰도"],
        mode='markers',
        name="최저",
        marker=dict(size=10, color='red')
    ))
    
    fig.update_layout(height=400, yaxis_title="신뢰도 (%)")
    st.plotly_chart(fig, use_container_width=True)
    
    # 신뢰도 기준 설정
    st.markdown("### ⚙️ 신뢰도 기준 설정")
    
    col1, col2 = st.columns(2)
    with col1:
        min_confidence = st.slider("최소 신뢰도 (%)", 0, 100, 70)
        st.info(f"신뢰도 {min_confidence}% 이상인 신호만 표시됩니다.")
    
    with col2:
        alert_threshold = st.slider("알림 기준 (%)", 0, 100, 85)
        st.info(f"신뢰도 {alert_threshold}% 이상일 때 알림을 받습니다.")


def show_backtesting():
    """백테스팅 페이지"""
    st.subheader("📈 백테스팅")
    
    # 백테스팅 설정
    st.markdown("### ⚙️ 백테스팅 설정")
    
    col1, col2, col3, col4 = st.columns(4)
    with col1:
        symbol = st.selectbox("심볼", ["BTCUSDT", "ETHUSDT", "BNBUSDT"])
    with col2:
        period = st.selectbox("테스트 기간", ["1개월", "3개월", "6개월", "1년"])
    with col3:
        initial_capital = st.number_input("초기 자본", value=10000, step=1000)
    with col4:
        if st.button("🚀 백테스팅 시작", use_container_width=True):
            st.success("백테스팅이 시작되었습니다...")
    
    # 백테스팅 결과
    st.markdown("### 📊 백테스팅 결과")
    
    col1, col2, col3, col4 = st.columns(4)
    with col1:
        st.metric("총 수익률", "+45.6%", "+$4,560")
    with col2:
        st.metric("승률", "68.5%", "137승 62패")
    with col3:
        st.metric("최대 손실", "-8.2%", "-$820")
    with col4:
        st.metric("샤프 비율", "1.85", "+0.15")
    
    # 수익 곡선
    st.markdown("### 💰 수익 곡선")
    
    dates = pd.date_range(start="2023-01-01", periods=365, freq="D")
    returns = np.random.randn(365).cumsum() * 100 + 10000
    
    fig = go.Figure()
    fig.add_trace(go.Scatter(
        x=dates,
        y=returns,
        mode='lines',
        name='포트폴리오 가치',
        fill='tozeroy'
    ))
    
    fig.update_layout(
        title="백테스팅 수익 곡선",
        xaxis_title="날짜",
        yaxis_title="포트폴리오 가치 ($)",
        height=400
    )
    st.plotly_chart(fig, use_container_width=True)
    
    # 거래 통계
    st.markdown("### 📋 거래 통계")
    
    stats_data = pd.DataFrame({
        "지표": ["총 거래 횟수", "평균 보유 기간", "평균 수익", "평균 손실", "최대 연속 승리", "최대 연속 패배"],
        "값": ["199", "4.2시간", "+2.3%", "-1.8%", "12회", "5회"]
    })
    
    col1, col2 = st.columns(2)
    with col1:
        st.dataframe(stats_data.iloc[:3], use_container_width=True)
    with col2:
        st.dataframe(stats_data.iloc[3:], use_container_width=True)


def show_ai_performance():
    """AI 성과 분석 페이지"""
    st.subheader("📊 AI 모델 성과 분석")
    
    # 모델별 성과
    st.markdown("### 🏆 모델별 성과 순위")
    
    performance_data = pd.DataFrame({
        "순위": range(1, 12),
        "모델": ["Ensemble", "LSTM", "Transformer", "GRU", "BERT", 
                "XGBoost", "LightGBM", "Random Forest", "Prophet", "ARIMA", "GAN"],
        "정확도": [88.5, 85.3, 84.2, 82.1, 78.9, 76.5, 75.3, 73.8, 71.2, 68.9, 65.4],
        "수익률": ["+42.3%", "+38.5%", "+36.2%", "+34.1%", "+28.7%",
                 "+25.4%", "+23.8%", "+21.5%", "+18.9%", "+15.2%", "+12.1%"],
        "거래 횟수": [523, 612, 487, 598, 445, 678, 701, 589, 412, 378, 289]
    })
    
    st.dataframe(performance_data, use_container_width=True)
    
    # 시간대별 정확도
    st.markdown("### ⏰ 시간대별 정확도")
    
    hours = list(range(24))
    accuracy_by_hour = np.random.uniform(65, 85, 24)
    
    fig = go.Figure()
    fig.add_trace(go.Bar(
        x=hours,
        y=accuracy_by_hour,
        marker_color=accuracy_by_hour,
        marker_colorscale='Viridis'
    ))
    
    fig.update_layout(
        title="시간대별 예측 정확도",
        xaxis_title="시간 (UTC)",
        yaxis_title="정확도 (%)",
        height=400
    )
    st.plotly_chart(fig, use_container_width=True)
    
    # 모델 조합 성과
    st.markdown("### 🔄 모델 조합 성과")
    
    col1, col2 = st.columns(2)
    
    with col1:
        st.markdown("#### 최적 조합 TOP 5")
        combinations = pd.DataFrame({
            "조합": ["LSTM+Transformer", "Ensemble+GRU", "XGBoost+BERT", 
                    "LightGBM+Prophet", "Random Forest+ARIMA"],
            "성과": ["+48.2%", "+45.6%", "+41.3%", "+38.7%", "+35.4%"]
        })
        st.dataframe(combinations, use_container_width=True)
    
    with col2:
        st.markdown("#### 모델 상관관계")
        correlation = pd.DataFrame({
            "모델1": ["LSTM", "GRU", "Transformer", "XGBoost", "BERT"],
            "모델2": ["GRU", "Transformer", "BERT", "LightGBM", "GAN"],
            "상관계수": [0.82, 0.75, 0.68, 0.71, 0.45]
        })
        st.dataframe(correlation, use_container_width=True)


def show_custom_strategy():
    """커스텀 전략 페이지"""
    st.subheader("🛠️ 커스텀 AI 전략")
    
    # 전략 생성
    st.markdown("### 📝 새 전략 만들기")
    
    with st.form("custom_strategy"):
        col1, col2 = st.columns(2)
        
        with col1:
            strategy_name = st.text_input("전략 이름")
            selected_models = st.multiselect(
                "AI 모델 선택",
                ["LSTM", "GRU", "Random Forest", "XGBoost", "LightGBM", 
                 "ARIMA", "Prophet", "Transformer", "BERT", "GAN", "Ensemble"]
            )
            
            timeframe = st.select_slider(
                "분석 시간대",
                options=["1분", "5분", "15분", "30분", "1시간", "4시간", "1일"]
            )
        
        with col2:
            risk_level = st.select_slider(
                "리스크 레벨",
                options=["매우 낮음", "낮음", "보통", "높음", "매우 높음"]
            )
            
            min_confidence = st.slider("최소 신뢰도", 50, 100, 75)
            stop_loss = st.number_input("손절 (%)", value=5.0, step=0.5)
            take_profit = st.number_input("익절 (%)", value=10.0, step=0.5)
        
        submitted = st.form_submit_button("전략 생성", use_container_width=True)
        if submitted:
            st.success(f"'{strategy_name}' 전략이 생성되었습니다!")
    
    # 저장된 전략
    st.markdown("### 💾 저장된 전략")
    
    saved_strategies = pd.DataFrame({
        "전략명": ["공격적 성장", "안정적 수익", "데이 트레이딩", "스윙 트레이딩"],
        "모델 수": [5, 3, 7, 4],
        "평균 수익률": ["+35.2%", "+18.5%", "+42.7%", "+28.3%"],
        "리스크": ["높음", "낮음", "매우 높음", "보통"],
        "상태": ["실행 중", "대기", "실행 중", "중지됨"]
    })
    
    st.dataframe(saved_strategies, use_container_width=True)
    
    # 전략 성과 비교
    st.markdown("### 📊 전략 성과 비교")
    
    strategies = ["공격적 성장", "안정적 수익", "데이 트레이딩", "스윙 트레이딩"]
    returns = [35.2, 18.5, 42.7, 28.3]
    risks = [8.5, 3.2, 12.1, 5.6]
    
    fig = go.Figure()
    fig.add_trace(go.Scatter(
        x=risks,
        y=returns,
        mode='markers+text',
        text=strategies,
        textposition="top center",
        marker=dict(size=15, color=returns, colorscale='Viridis')
    ))
    
    fig.update_layout(
        title="리스크-수익 분석",
        xaxis_title="리스크 (%)",
        yaxis_title="수익률 (%)",
        height=400
    )
    st.plotly_chart(fig, use_container_width=True)