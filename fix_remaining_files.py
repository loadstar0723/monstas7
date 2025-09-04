"""Fix remaining files with encoding issues"""
import os

files = {
    "member_management.py": '''"""
회원 관리 페이지 (대리점용)
회원 목록, 신규 등록, 활동 관리
"""

import streamlit as st
import pandas as pd
from datetime import datetime, timedelta
import numpy as np


def show_page(page_id: str):
    """페이지 표시"""
    if page_id == 'member_list':
        show_member_list()
    elif page_id == 'member_register':
        show_member_register()
    elif page_id == 'member_activity':
        show_member_activity()
    else:
        st.error(f"페이지 {page_id}를 찾을 수 없습니다.")


def show_member_list():
    """회원 목록"""
    st.subheader("👥 회원 목록")
    
    # 샘플 회원 데이터
    members = []
    for i in range(1, 51):
        members.append({
            "ID": f"M{i:04d}",
            "이름": f"회원{i}",
            "이메일": f"member{i}@example.com",
            "플랜": np.random.choice(["Basic", "Standard", "Premium"]),
            "가입일": (datetime.now() - timedelta(days=np.random.randint(1, 365))).strftime("%Y-%m-%d"),
            "상태": np.random.choice(["활성", "비활성"], p=[0.8, 0.2])
        })
    
    df = pd.DataFrame(members)
    
    # 필터
    col1, col2, col3 = st.columns(3)
    with col1:
        plan_filter = st.selectbox("플랜", ["전체", "Basic", "Standard", "Premium"])
    with col2:
        status_filter = st.selectbox("상태", ["전체", "활성", "비활성"])
    with col3:
        search = st.text_input("검색", placeholder="이름 또는 이메일")
    
    # 필터 적용
    if plan_filter != "전체":
        df = df[df["플랜"] == plan_filter]
    if status_filter != "전체":
        df = df[df["상태"] == status_filter]
    
    st.dataframe(df, use_container_width=True, hide_index=True)


def show_member_register():
    """신규 회원 등록"""
    st.subheader("➕ 신규 회원 등록")
    
    with st.form("member_register"):
        col1, col2 = st.columns(2)
        
        with col1:
            st.text_input("이름")
            st.text_input("이메일")
            st.text_input("전화번호")
            st.selectbox("플랜", ["Basic", "Standard", "Premium"])
        
        with col2:
            st.date_input("생년월일")
            st.text_area("메모")
            st.selectbox("상태", ["활성", "비활성"])
        
        st.form_submit_button("등록", use_container_width=True)


def show_member_activity():
    """회원 활동 관리"""
    st.subheader("📊 회원 활동 관리")
    
    # 활동 요약
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        st.metric("총 회원", "47명", "↑ 3")
    with col2:
        st.metric("활성 회원", "38명", "↑ 2")
    with col3:
        st.metric("이번 달 신규", "5명", "↑ 1")
    with col4:
        st.metric("평균 활동률", "78%", "↑ 3%")
    
    st.divider()
    
    # 활동 내역
    st.markdown("### 최근 활동 내역")
    
    activities = []
    for i in range(20):
        activities.append({
            "시간": (datetime.now() - timedelta(hours=i)).strftime("%Y-%m-%d %H:%M"),
            "회원": f"회원{np.random.randint(1, 48)}",
            "활동": np.random.choice(["로그인", "거래", "출금", "설정변경"])
        })
    
    df = pd.DataFrame(activities)
    st.dataframe(df, use_container_width=True, hide_index=True)
''',

"organization_management.py": '''"""
조직 관리 페이지 (본사용)
조직 구조, 권한 관리, 조직도
"""

import streamlit as st
import pandas as pd
from datetime import datetime


def show_page(page_id: str):
    """페이지 표시"""
    if page_id == 'org_structure':
        show_org_structure()
    elif page_id == 'permission_management':
        show_permission_management()
    elif page_id == 'org_chart':
        show_org_chart()
    else:
        st.error(f"페이지 {page_id}를 찾을 수 없습니다.")


def show_org_structure():
    """조직 구조"""
    st.subheader("🏢 조직 구조")
    
    # 조직 계층
    st.markdown("### 조직 계층 구조")
    
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        st.info("🏛️ 본사")
        st.metric("", "1")
    
    with col2:
        st.success("🏪 총판")
        st.metric("", "5")
    
    with col3:
        st.warning("🏬 대리점")
        st.metric("", "25")
    
    with col4:
        st.error("👤 회원")
        st.metric("", "842")
    
    st.divider()
    
    # 총판별 구조
    st.markdown("### 총판별 조직 현황")
    
    org_data = []
    for i in range(1, 6):
        org_data.append({
            "총판": f"총판 {i}",
            "대리점 수": 5 + i,
            "회원 수": 150 + i * 30,
            "월 매출": f"₩{(1000 + i * 200) * 10000:,}",
            "성장률": f"+{10 + i}%"
        })
    
    df = pd.DataFrame(org_data)
    st.dataframe(df, use_container_width=True, hide_index=True)


def show_permission_management():
    """권한 관리"""
    st.subheader("🔐 권한 관리")
    
    # 역할별 권한
    st.markdown("### 역할별 권한 설정")
    
    permissions = {
        "회원 관리": ["✅", "✅", "✅", "❌"],
        "수익 조회": ["✅", "✅", "✅", "❌"],
        "정산 관리": ["✅", "✅", "❌", "❌"],
        "시스템 설정": ["✅", "❌", "❌", "❌"],
        "AI 모델 관리": ["✅", "❌", "❌", "❌"],
        "거래 실행": ["✅", "✅", "✅", "✅"]
    }
    
    df = pd.DataFrame(permissions, index=["본사", "총판", "대리점", "회원"])
    st.dataframe(df.T, use_container_width=True)
    
    st.divider()
    
    # 권한 수정
    st.markdown("### 권한 수정")
    
    col1, col2, col3 = st.columns(3)
    
    with col1:
        st.selectbox("대상 선택", ["총판 1", "총판 2", "대리점 1", "대리점 2"])
    
    with col2:
        st.multiselect("권한 추가", ["회원 관리", "수익 조회", "정산 관리"])
    
    with col3:
        st.button("권한 저장", use_container_width=True)


def show_org_chart():
    """조직도"""
    st.subheader("📊 조직도")
    
    # 조직도 표시
    st.markdown("""
    ```
    🏛️ MONSTA 본사
    ├── 🏪 총판 1
    │   ├── 🏬 대리점 1-1
    │   ├── 🏬 대리점 1-2
    │   ├── 🏬 대리점 1-3
    │   ├── 🏬 대리점 1-4
    │   └── 🏬 대리점 1-5
    ├── 🏪 총판 2
    │   ├── 🏬 대리점 2-1
    │   ├── 🏬 대리점 2-2
    │   ├── 🏬 대리점 2-3
    │   └── 🏬 대리점 2-4
    ├── 🏪 총판 3
    │   ├── 🏬 대리점 3-1
    │   ├── 🏬 대리점 3-2
    │   └── 🏬 대리점 3-3
    └── 🏪 총판 4
        ├── 🏬 대리점 4-1
        └── 🏬 대리점 4-2
    ```
    """)
    
    # 조직 통계
    st.markdown("### 📈 조직 성과")
    
    col1, col2, col3 = st.columns(3)
    
    with col1:
        st.metric("전체 매출", "₩234,567,890", "↑ 12.3%")
    
    with col2:
        st.metric("신규 가입", "234명", "↑ 34")
    
    with col3:
        st.metric("활성률", "82.4%", "↑ 3.2%")
''',

"promotion.py": '''"""
프로모션 페이지 (대리점용)
이벤트, 캠페인, 홍보 관리
"""

import streamlit as st
import pandas as pd
from datetime import datetime, timedelta


def show_page(page_id: str):
    """페이지 표시"""
    if page_id == 'promo_events':
        show_events()
    elif page_id == 'promo_campaigns':
        show_campaigns()
    elif page_id == 'promo_materials':
        show_materials()
    else:
        st.error(f"페이지 {page_id}를 찾을 수 없습니다.")


def show_events():
    """이벤트 관리"""
    st.subheader("🎉 이벤트 관리")
    
    # 진행중인 이벤트
    st.markdown("### 진행 중인 이벤트")
    
    events = [
        {
            "이벤트": "신규 가입 이벤트",
            "기간": "2024-12-01 ~ 2024-12-31",
            "혜택": "첫달 50% 할인",
            "참여": 23
        },
        {
            "이벤트": "추천인 이벤트",
            "기간": "2024-12-15 ~ 2025-01-15",
            "혜택": "추천 수수료 2배",
            "참여": 15
        }
    ]
    
    for event in events:
        with st.container():
            col1, col2, col3 = st.columns([3, 2, 1])
            with col1:
                st.markdown(f"**{event['이벤트']}**")
                st.caption(event['기간'])
            with col2:
                st.info(event['혜택'])
            with col3:
                st.metric("참여", event['참여'])
            st.divider()


def show_campaigns():
    """캠페인 관리"""
    st.subheader("📢 캠페인 관리")
    
    # 캠페인 성과
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        st.metric("진행 캠페인", "3개")
    with col2:
        st.metric("총 참여자", "156명")
    with col3:
        st.metric("전환율", "23.4%")
    with col4:
        st.metric("ROI", "234%")
    
    st.divider()
    
    # 캠페인 목록
    campaigns = pd.DataFrame({
        "캠페인": ["연말 특별 캠페인", "신규 고객 유치", "VIP 전환 캠페인"],
        "시작일": ["2024-12-01", "2024-12-10", "2024-12-15"],
        "종료일": ["2024-12-31", "2025-01-10", "2025-01-15"],
        "목표": ["100명", "50명", "20명"],
        "달성": ["67명", "23명", "8명"],
        "달성률": ["67%", "46%", "40%"]
    })
    
    st.dataframe(campaigns, use_container_width=True, hide_index=True)


def show_materials():
    """홍보 자료"""
    st.subheader("📄 홍보 자료")
    
    # 자료 카테고리
    tab1, tab2, tab3 = st.tabs(["브로셔", "배너", "동영상"])
    
    with tab1:
        st.markdown("### 브로셔 자료")
        
        col1, col2 = st.columns(2)
        with col1:
            st.image("https://via.placeholder.com/300x400", caption="서비스 소개")
            st.button("다운로드", key="brochure1")
        
        with col2:
            st.image("https://via.placeholder.com/300x400", caption="요금제 안내")
            st.button("다운로드", key="brochure2")
    
    with tab2:
        st.markdown("### 배너 이미지")
        
        st.image("https://via.placeholder.com/728x90", caption="웹 배너 (728x90)")
        st.button("다운로드", key="banner1")
        
        st.image("https://via.placeholder.com/300x250", caption="사각 배너 (300x250)")
        st.button("다운로드", key="banner2")
    
    with tab3:
        st.markdown("### 홍보 영상")
        
        videos = [
            {"제목": "MONSTA 소개 영상", "시간": "2:30", "조회": "1,234"},
            {"제목": "사용 방법 안내", "시간": "5:15", "조회": "567"},
            {"제목": "성공 사례", "시간": "3:45", "조회": "890"}
        ]
        
        for video in videos:
            col1, col2, col3, col4 = st.columns([3, 1, 1, 1])
            with col1:
                st.markdown(f"**{video['제목']}**")
            with col2:
                st.caption(video['시간'])
            with col3:
                st.caption(f"조회 {video['조회']}")
            with col4:
                st.button("보기", key=f"video_{video['제목']}")
''',

"revenue_management.py": '''"""
수익 관리 페이지 (본사용)
매출 현황, 수익 분석, 정산 관리
"""

import streamlit as st
import pandas as pd
from datetime import datetime, timedelta
import plotly.graph_objects as go
import numpy as np


def show_page(page_id: str):
    """페이지 표시"""
    if page_id == 'revenue_overview':
        show_revenue_overview()
    elif page_id == 'revenue_analysis':
        show_revenue_analysis()
    elif page_id == 'settlement':
        show_settlement()
    else:
        st.error(f"페이지 {page_id}를 찾을 수 없습니다.")


def show_revenue_overview():
    """매출 현황"""
    st.subheader("💰 매출 현황")
    
    # 주요 지표
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        st.metric("일 매출", "₩12,345,000", "↑ 23%")
    with col2:
        st.metric("월 매출", "₩345,678,000", "↑ 15%")
    with col3:
        st.metric("분기 매출", "₩1,234,567,000", "↑ 18%")
    with col4:
        st.metric("연 매출", "₩4,567,890,000", "↑ 25%")
    
    st.divider()
    
    # 매출 차트
    st.markdown("### 📊 월별 매출 추이")
    
    months = pd.date_range(end=datetime.now(), periods=12, freq='M')
    revenue = [200 + i * 20 + np.random.randint(-30, 30) for i in range(12)]
    
    fig = go.Figure()
    fig.add_trace(go.Bar(x=months, y=revenue, name='월 매출'))
    fig.update_layout(title='월별 매출 (단위: 백만원)', height=400)
    st.plotly_chart(fig, use_container_width=True)


def show_revenue_analysis():
    """수익 분석"""
    st.subheader("📊 수익 분석")
    
    # 수익 구성
    st.markdown("### 수익 구성")
    
    col1, col2 = st.columns(2)
    
    with col1:
        revenue_sources = {
            "구독료": 45,
            "수수료": 30,
            "광고": 15,
            "기타": 10
        }
        
        fig = go.Figure(data=[go.Pie(labels=list(revenue_sources.keys()), 
                                      values=list(revenue_sources.values()))])
        fig.update_layout(title='수익원별 비중')
        st.plotly_chart(fig, use_container_width=True)
    
    with col2:
        tier_revenue = {
            "VIP": 35,
            "Premium": 25,
            "Professional": 20,
            "Standard": 15,
            "Basic": 5
        }
        
        fig = go.Figure(data=[go.Pie(labels=list(tier_revenue.keys()), 
                                      values=list(tier_revenue.values()))])
        fig.update_layout(title='플랜별 수익 비중')
        st.plotly_chart(fig, use_container_width=True)
    
    st.divider()
    
    # 상세 분석
    st.markdown("### 상세 수익 분석")
    
    analysis_data = pd.DataFrame({
        "구분": ["구독료", "수수료", "광고", "기타"],
        "이번달": ["₩156,000,000", "₩104,000,000", "₩52,000,000", "₩34,000,000"],
        "지난달": ["₩145,000,000", "₩98,000,000", "₩48,000,000", "₩30,000,000"],
        "증감": ["+7.6%", "+6.1%", "+8.3%", "+13.3%"],
        "목표대비": ["103%", "98%", "104%", "113%"]
    })
    
    st.dataframe(analysis_data, use_container_width=True, hide_index=True)


def show_settlement():
    """정산 관리"""
    st.subheader("💳 정산 관리")
    
    # 정산 현황
    col1, col2, col3 = st.columns(3)
    
    with col1:
        st.info("정산 예정")
        st.metric("총판/대리점", "₩123,456,000")
        st.caption("정산일: 2025-01-05")
    
    with col2:
        st.success("정산 완료")
        st.metric("이번 달", "₩234,567,000")
        st.caption("완료일: 2024-12-05")
    
    with col3:
        st.warning("미정산")
        st.metric("보류 금액", "₩12,345,000")
        st.caption("사유: 서류 미비")
    
    st.divider()
    
    # 정산 내역
    st.markdown("### 정산 내역")
    
    settlement_data = []
    for i in range(10):
        settlement_data.append({
            "정산일": (datetime.now() - timedelta(days=30*i)).strftime("%Y-%m-%d"),
            "구분": ["총판", "대리점"][i % 2],
            "대상": f"파트너{i+1}",
            "금액": f"₩{np.random.randint(500, 2000)*10000:,}",
            "수수료": f"₩{np.random.randint(150, 600)*10000:,}",
            "실지급액": f"₩{np.random.randint(350, 1400)*10000:,}",
            "상태": "완료" if i > 0 else "예정"
        })
    
    df = pd.DataFrame(settlement_data)
    st.dataframe(df, use_container_width=True, hide_index=True)
    
    # 정산 액션
    col1, col2, col3 = st.columns(3)
    
    with col1:
        st.button("정산 실행", type="primary", use_container_width=True)
    
    with col2:
        st.button("정산 내역 다운로드", use_container_width=True)
    
    with col3:
        st.button("정산 보고서", use_container_width=True)
''',

"statistics.py": '''"""
통계 페이지 (본사용)
사용자 통계, 거래 통계, 수익 통계
"""

import streamlit as st
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import plotly.graph_objects as go
import plotly.express as px


def show_page(page_id: str):
    """페이지 표시"""
    if page_id == 'user_stats':
        show_user_stats()
    elif page_id == 'trade_stats':
        show_trade_stats()
    elif page_id == 'profit_stats':
        show_profit_stats()
    else:
        st.error(f"페이지 {page_id}를 찾을 수 없습니다.")


def show_user_stats():
    """사용자 통계"""
    st.subheader("👥 사용자 통계")
    
    # 사용자 현황
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        st.metric("총 사용자", "1,234", "↑ 56")
    with col2:
        st.metric("신규 가입 (월)", "234", "↑ 23")
    with col3:
        st.metric("활성 사용자", "892", "↑ 45")
    with col4:
        st.metric("이탈률", "3.4%", "↓ 0.5%")
    
    st.divider()
    
    # 사용자 증가 추이
    st.markdown("### 📈 사용자 증가 추이")
    
    dates = pd.date_range(end=datetime.now(), periods=30, freq='D')
    users = np.cumsum(np.random.randint(5, 15, 30)) + 1000
    
    fig = go.Figure()
    fig.add_trace(go.Scatter(x=dates, y=users, mode='lines+markers', name='누적 사용자'))
    fig.update_layout(title='일별 누적 사용자 수', height=400)
    st.plotly_chart(fig, use_container_width=True)
    
    # 플랜별 분포
    col1, col2 = st.columns(2)
    
    with col1:
        st.markdown("### 플랜별 사용자 분포")
        
        plan_data = {
            "Basic": 345,
            "Standard": 423,
            "Professional": 234,
            "Premium": 156,
            "VIP": 76
        }
        
        fig = go.Figure(data=[go.Pie(labels=list(plan_data.keys()), 
                                      values=list(plan_data.values()))])
        st.plotly_chart(fig, use_container_width=True)
    
    with col2:
        st.markdown("### 지역별 사용자 분포")
        
        region_data = {
            "서울": 456,
            "경기": 345,
            "부산": 123,
            "대구": 98,
            "기타": 212
        }
        
        fig = go.Figure(data=[go.Pie(labels=list(region_data.keys()), 
                                      values=list(region_data.values()))])
        st.plotly_chart(fig, use_container_width=True)


def show_trade_stats():
    """거래 통계"""
    st.subheader("📊 거래 통계")
    
    # 거래 현황
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        st.metric("일 거래량", "45,678", "↑ 2,345")
    with col2:
        st.metric("일 거래대금", "₩2.3B", "↑ ₩234M")
    with col3:
        st.metric("평균 거래액", "₩50,345", "↑ ₩1,234")
    with col4:
        st.metric("승률", "62.3%", "↑ 2.1%")
    
    st.divider()
    
    # 거래량 차트
    st.markdown("### 📈 시간대별 거래량")
    
    hours = list(range(24))
    volume = [100 + i*10 + np.random.randint(-20, 50) for i in hours]
    
    fig = go.Figure()
    fig.add_trace(go.Bar(x=hours, y=volume, name='거래량'))
    fig.update_layout(title='시간대별 거래량', xaxis_title='시간', yaxis_title='거래량', height=400)
    st.plotly_chart(fig, use_container_width=True)
    
    # 코인별 거래 비중
    st.markdown("### 🪙 코인별 거래 비중")
    
    coin_data = pd.DataFrame({
        "코인": ["BTC", "ETH", "BNB", "XRP", "ADA", "기타"],
        "거래량": [35, 25, 15, 10, 8, 7],
        "거래대금": [45, 20, 12, 8, 7, 8]
    })
    
    fig = px.bar(coin_data, x="코인", y=["거래량", "거래대금"], 
                 title="코인별 거래량 및 거래대금 비중(%)", barmode='group')
    st.plotly_chart(fig, use_container_width=True)


def show_profit_stats():
    """수익 통계"""
    st.subheader("💰 수익 통계")
    
    # 수익 현황
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        st.metric("총 수익률", "+23.4%", "↑ 2.3%")
    with col2:
        st.metric("월 평균 수익", "₩12.3M", "↑ ₩1.2M")
    with col3:
        st.metric("최고 수익", "₩234M", "신기록")
    with col4:
        st.metric("손실 회원", "12.3%", "↓ 2.1%")
    
    st.divider()
    
    # 수익률 분포
    st.markdown("### 📊 사용자 수익률 분포")
    
    np.random.seed(42)
    returns = np.random.normal(15, 20, 1000)
    
    fig = go.Figure(data=[go.Histogram(x=returns, nbinsx=30)])
    fig.update_layout(title='사용자 수익률 분포(%)', xaxis_title='수익률(%)', yaxis_title='사용자 수', height=400)
    st.plotly_chart(fig, use_container_width=True)
    
    # 플랜별 평균 수익률
    st.markdown("### 💎 플랜별 평균 수익률")
    
    plan_returns = pd.DataFrame({
        "플랜": ["Basic", "Standard", "Professional", "Premium", "VIP"],
        "평균 수익률": [8.2, 12.5, 18.3, 24.7, 32.1],
        "최고 수익률": [23.4, 34.2, 45.6, 67.8, 89.2],
        "승률": [45.2, 52.3, 58.7, 65.4, 72.8]
    })
    
    st.dataframe(plan_returns, use_container_width=True, hide_index=True)
''',

"subscriber_management.py": '''"""
회원 관리 페이지 (총판용)
회원 목록, 승인, 활동 관리
"""

import streamlit as st
import pandas as pd
from datetime import datetime, timedelta
import numpy as np


def show_page(page_id: str):
    """페이지 표시"""
    if page_id == 'subscriber_list':
        show_subscriber_list()
    elif page_id == 'subscriber_approval':
        show_subscriber_approval()
    elif page_id == 'subscriber_activity':
        show_subscriber_activity()
    else:
        st.error(f"페이지 {page_id}를 찾을 수 없습니다.")


def show_subscriber_list():
    """회원 목록"""
    st.subheader("👥 회원 목록")
    
    # 필터
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        agency_filter = st.selectbox("대리점", ["전체", "대리점1", "대리점2", "대리점3"])
    
    with col2:
        plan_filter = st.selectbox("플랜", ["전체", "Basic", "Standard", "Premium"])
    
    with col3:
        status_filter = st.selectbox("상태", ["전체", "활성", "비활성", "정지"])
    
    with col4:
        search = st.text_input("검색", placeholder="이름/이메일")
    
    # 회원 데이터
    subscribers = []
    for i in range(1, 101):
        subscribers.append({
            "ID": f"S{i:04d}",
            "이름": f"회원{i}",
            "이메일": f"user{i}@example.com",
            "대리점": f"대리점{(i % 3) + 1}",
            "플랜": ["Basic", "Standard", "Premium"][i % 3],
            "가입일": (datetime.now() - timedelta(days=np.random.randint(1, 365))).strftime("%Y-%m-%d"),
            "상태": np.random.choice(["활성", "비활성", "정지"], p=[0.7, 0.2, 0.1])
        })
    
    df = pd.DataFrame(subscribers)
    
    # 필터 적용
    if agency_filter != "전체":
        df = df[df["대리점"] == agency_filter]
    if plan_filter != "전체":
        df = df[df["플랜"] == plan_filter]
    if status_filter != "전체":
        df = df[df["상태"] == status_filter]
    
    # 통계
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        st.metric("총 회원", len(df))
    with col2:
        st.metric("활성 회원", len(df[df["상태"] == "활성"]))
    with col3:
        st.metric("이번달 신규", np.random.randint(10, 30))
    with col4:
        st.metric("평균 유지율", "87.3%")
    
    st.dataframe(df, use_container_width=True, hide_index=True)


def show_subscriber_approval():
    """회원 승인"""
    st.subheader("✅ 회원 승인 관리")
    
    # 승인 대기
    st.markdown("### 승인 대기 중")
    
    pending = []
    for i in range(5):
        pending.append({
            "신청일": (datetime.now() - timedelta(days=i)).strftime("%Y-%m-%d"),
            "이름": f"신규회원{i+1}",
            "이메일": f"new{i+1}@example.com",
            "대리점": f"대리점{(i % 3) + 1}",
            "플랜": ["Basic", "Standard", "Premium"][i % 3]
        })
    
    for idx, member in enumerate(pending):
        with st.container():
            col1, col2, col3 = st.columns([3, 1, 1])
            
            with col1:
                st.markdown(f"**{member['이름']}** ({member['이메일']})")
                st.caption(f"신청일: {member['신청일']} | 대리점: {member['대리점']} | 플랜: {member['플랜']}")
            
            with col2:
                st.button("승인", key=f"approve_{idx}", type="primary")
            
            with col3:
                st.button("거부", key=f"reject_{idx}")
            
            st.divider()


def show_subscriber_activity():
    """회원 활동"""
    st.subheader("📊 회원 활동 현황")
    
    # 활동 지표
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        st.metric("일일 활성", "234", "↑ 23")
    with col2:
        st.metric("주간 활성", "892", "↑ 67")
    with col3:
        st.metric("월간 활성", "1,234", "↑ 123")
    with col4:
        st.metric("평균 체류시간", "34분", "↑ 3분")
    
    st.divider()
    
    # 대리점별 활동
    st.markdown("### 대리점별 회원 활동")
    
    agency_activity = pd.DataFrame({
        "대리점": ["대리점1", "대리점2", "대리점3"],
        "총 회원": [45, 38, 52],
        "활성 회원": [38, 29, 45],
        "활성률": ["84.4%", "76.3%", "86.5%"],
        "평균 거래": [23, 18, 28]
    })
    
    st.dataframe(agency_activity, use_container_width=True, hide_index=True)
    
    # 최근 활동
    st.markdown("### 최근 활동 로그")
    
    activities = []
    for i in range(20):
        activities.append({
            "시간": (datetime.now() - timedelta(minutes=i*10)).strftime("%H:%M"),
            "회원": f"회원{np.random.randint(1, 100)}",
            "대리점": f"대리점{np.random.randint(1, 4)}",
            "활동": np.random.choice(["로그인", "거래", "분석조회", "설정변경"])
        })
    
    df = pd.DataFrame(activities)
    st.dataframe(df, use_container_width=True, hide_index=True, height=400)
''',

"system_settings.py": '''"""
시스템 설정 페이지 (본사용)
시스템 구성, AI 모델, 보안 설정
"""

import streamlit as st
import pandas as pd
from datetime import datetime, timedelta


def show_page(page_id: str):
    """페이지 표시"""
    if page_id == 'system_config':
        show_system_config()
    elif page_id == 'ai_models':
        show_ai_models()
    elif page_id == 'security':
        show_security()
    else:
        st.error(f"페이지 {page_id}를 찾을 수 없습니다.")


def show_system_config():
    """시스템 구성"""
    st.subheader("⚙️ 시스템 구성")
    
    # 시스템 상태
    st.markdown("### 시스템 상태")
    
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        st.metric("서버 상태", "정상", "")
        st.progress(0.85, text="CPU: 85%")
    
    with col2:
        st.metric("메모리 사용", "12.3GB / 16GB", "")
        st.progress(0.77, text="RAM: 77%")
    
    with col3:
        st.metric("디스크 사용", "234GB / 500GB", "")
        st.progress(0.47, text="Disk: 47%")
    
    with col4:
        st.metric("네트워크", "정상", "")
        st.progress(0.23, text="대역폭: 23%")
    
    st.divider()
    
    # 시스템 설정
    st.markdown("### 시스템 설정")
    
    col1, col2 = st.columns(2)
    
    with col1:
        st.selectbox("서버 리전", ["Seoul", "Tokyo", "Singapore"])
        st.number_input("최대 동시 접속", 100, 10000, 1000)
        st.number_input("세션 타임아웃 (분)", 10, 120, 30)
    
    with col2:
        st.selectbox("데이터베이스", ["PostgreSQL", "MySQL", "MongoDB"])
        st.text_input("백업 주기", "매일 02:00")
        st.toggle("자동 백업", value=True)
    
    st.button("설정 저장", type="primary", use_container_width=True)


def show_ai_models():
    """AI 모델 관리"""
    st.subheader("🤖 AI 모델 관리")
    
    # 모델 현황
    st.markdown("### 활성 AI 모델")
    
    models = [
        {"모델": "LSTM", "버전": "v2.3.1", "정확도": "87.3%", "상태": "활성"},
        {"모델": "GRU", "버전": "v1.8.2", "정확도": "85.2%", "상태": "활성"},
        {"모델": "Transformer", "버전": "v3.1.0", "정확도": "91.7%", "상태": "활성"},
        {"모델": "XGBoost", "버전": "v1.5.0", "정확도": "83.9%", "상태": "활성"},
        {"모델": "Prophet", "버전": "v1.1.0", "정확도": "79.8%", "상태": "비활성"},
    ]
    
    for model in models:
        with st.container():
            col1, col2, col3, col4, col5 = st.columns([2, 1, 1, 1, 1])
            
            with col1:
                st.markdown(f"**{model['모델']}**")
                st.caption(f"버전: {model['버전']}")
            
            with col2:
                st.metric("정확도", model['정확도'])
            
            with col3:
                if model['상태'] == "활성":
                    st.success(model['상태'])
                else:
                    st.warning(model['상태'])
            
            with col4:
                st.button("설정", key=f"config_{model['모델']}")
            
            with col5:
                if model['상태'] == "활성":
                    st.button("비활성화", key=f"deact_{model['모델']}")
                else:
                    st.button("활성화", key=f"act_{model['모델']}")
            
            st.divider()
    
    # 모델 학습
    st.markdown("### 모델 학습")
    
    with st.form("model_training"):
        col1, col2 = st.columns(2)
        
        with col1:
            st.selectbox("모델 선택", ["LSTM", "GRU", "Transformer"])
            st.date_input("학습 데이터 시작일")
            st.date_input("학습 데이터 종료일")
        
        with col2:
            st.number_input("Epochs", 10, 1000, 100)
            st.number_input("Batch Size", 16, 256, 32)
            st.number_input("Learning Rate", 0.0001, 0.1, 0.001, format="%.4f")
        
        st.form_submit_button("학습 시작", use_container_width=True)


def show_security():
    """보안 설정"""
    st.subheader("🔐 보안 설정")
    
    # 보안 상태
    st.markdown("### 보안 상태")
    
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        st.success("✅ 방화벽 활성")
    with col2:
        st.success("✅ SSL 인증서 유효")
    with col3:
        st.warning("⚠️ 패치 대기: 3개")
    with col4:
        st.success("✅ 백업 정상")
    
    st.divider()
    
    # 보안 설정
    st.markdown("### 보안 정책")
    
    col1, col2 = st.columns(2)
    
    with col1:
        st.markdown("**인증 설정**")
        st.toggle("2단계 인증 강제", value=False)
        st.toggle("IP 화이트리스트", value=True)
        st.number_input("로그인 시도 제한", 3, 10, 5)
        st.number_input("계정 잠금 시간 (분)", 5, 60, 15)
    
    with col2:
        st.markdown("**암호화 설정**")
        st.selectbox("암호화 알고리즘", ["AES-256", "RSA-2048"])
        st.toggle("데이터베이스 암호화", value=True)
        st.toggle("통신 암호화 (TLS)", value=True)
        st.toggle("로그 암호화", value=False)
    
    st.divider()
    
    # 보안 로그
    st.markdown("### 보안 이벤트 로그")
    
    security_logs = []
    for i in range(10):
        security_logs.append({
            "시간": (datetime.now() - timedelta(hours=i)).strftime("%Y-%m-%d %H:%M"),
            "이벤트": ["로그인 시도", "권한 변경", "설정 수정", "비정상 접근"][i % 4],
            "사용자": f"user{i+1}",
            "IP": f"192.168.1.{i+100}",
            "결과": ["성공", "실패", "차단"][i % 3]
        })
    
    df = pd.DataFrame(security_logs)
    st.dataframe(df, use_container_width=True, hide_index=True)
'''
}

# Write all remaining files
for filename, content in files.items():
    filepath = os.path.join("pages", filename)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Fixed: {filename}")

print("All remaining files fixed!")