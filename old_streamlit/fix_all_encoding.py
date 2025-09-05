"""
Fix all encoding issues in page files
"""
import os

# Define content for each file with encoding issues
file_contents = {
    "agency_management.py": '''"""
대리점 관리 페이지 (총판용)
대리점 목록, 신규 등록, 실적 관리
"""

import streamlit as st
import pandas as pd
from datetime import datetime, timedelta
import numpy as np


def show_page(page_id: str):
    """페이지 표시"""
    if page_id == 'agency_list':
        show_agency_list()
    elif page_id == 'agency_register':
        show_agency_register()
    elif page_id == 'agency_performance':
        show_agency_performance()
    else:
        st.error(f"페이지 {page_id}를 찾을 수 없습니다.")


def show_agency_list():
    """대리점 목록"""
    st.subheader("🏢 대리점 목록")
    
    # 샘플 데이터 생성
    agencies = []
    for i in range(1, 16):
        agencies.append({
            "ID": f"AG{i:03d}",
            "대리점명": f"대리점 {i}",
            "대표자": f"대표 {i}",
            "등급": np.random.choice(["Gold", "Silver", "Bronze"]),
            "회원수": np.random.randint(10, 100),
            "월 수익": f"₩{np.random.randint(100, 1000)*10000:,}",
            "상태": np.random.choice(["활성", "비활성"])
        })
    
    df = pd.DataFrame(agencies)
    
    # 필터
    col1, col2, col3 = st.columns(3)
    with col1:
        grade_filter = st.selectbox("등급", ["전체", "Gold", "Silver", "Bronze"])
    with col2:
        status_filter = st.selectbox("상태", ["전체", "활성", "비활성"])
    with col3:
        search = st.text_input("검색", placeholder="대리점명 또는 대표자")
    
    # 필터 적용
    if grade_filter != "전체":
        df = df[df["등급"] == grade_filter]
    if status_filter != "전체":
        df = df[df["상태"] == status_filter]
    if search:
        df = df[df["대리점명"].str.contains(search) | df["대표자"].str.contains(search)]
    
    st.dataframe(df, use_container_width=True, hide_index=True)


def show_agency_register():
    """신규 대리점 등록"""
    st.subheader("➕ 신규 대리점 등록")
    
    with st.form("agency_register_form"):
        col1, col2 = st.columns(2)
        
        with col1:
            st.text_input("대리점명", placeholder="대리점 이름 입력")
            st.text_input("대표자명", placeholder="대표자 이름 입력")
            st.text_input("사업자번호", placeholder="123-45-67890")
            st.selectbox("등급", ["Bronze", "Silver", "Gold"])
        
        with col2:
            st.text_input("연락처", placeholder="010-1234-5678")
            st.text_input("이메일", placeholder="email@example.com")
            st.text_area("주소", placeholder="상세 주소 입력")
            st.number_input("수수료율 (%)", min_value=0.0, max_value=100.0, value=35.0)
        
        submitted = st.form_submit_button("등록", use_container_width=True)
        if submitted:
            st.success("대리점이 등록되었습니다!")


def show_agency_performance():
    """대리점 실적 관리"""
    st.subheader("📊 대리점 실적 관리")
    
    # 기간 선택
    col1, col2 = st.columns([1, 4])
    with col1:
        period = st.selectbox("기간", ["이번 달", "지난 달", "최근 3개월", "올해"])
    
    # 실적 요약
    col1, col2, col3, col4 = st.columns(4)
    with col1:
        st.metric("총 대리점", "15개", "↑ 2")
    with col2:
        st.metric("총 회원수", "842명", "↑ 56")
    with col3:
        st.metric("총 수익", "₩45,230,000", "↑ 12%")
    with col4:
        st.metric("평균 수익", "₩3,015,333", "↑ 8%")
    
    st.divider()
    
    # 실적 상세
    st.markdown("### 대리점별 실적")
    
    performance_data = []
    for i in range(1, 16):
        performance_data.append({
            "순위": i,
            "대리점": f"대리점 {i}",
            "신규회원": np.random.randint(5, 30),
            "탈퇴회원": np.random.randint(0, 5),
            "순증가": np.random.randint(5, 25),
            "수익": f"₩{np.random.randint(100, 500)*10000:,}",
            "수수료": f"₩{np.random.randint(30, 150)*10000:,}",
            "성장률": f"{np.random.uniform(-5, 20):.1f}%"
        })
    
    df = pd.DataFrame(performance_data)
    st.dataframe(df, use_container_width=True, hide_index=True)
''',

    "earning_management.py": '''"""
수익 관리 페이지 (대리점용)
수익 현황, 정산, 출금 관리
"""

import streamlit as st
import pandas as pd
from datetime import datetime, timedelta
import plotly.graph_objects as go


def show_page(page_id: str):
    """페이지 표시"""
    if page_id == 'earning_status':
        show_earning_status()
    elif page_id == 'earning_settlement':
        show_settlement()
    elif page_id == 'earning_withdrawal':
        show_withdrawal()
    else:
        st.error(f"페이지 {page_id}를 찾을 수 없습니다.")


def show_earning_status():
    """수익 현황"""
    st.subheader("💰 수익 현황")
    
    # 기간별 수익
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        st.metric("오늘 수익", "₩234,000", "↑ 12%")
    with col2:
        st.metric("이번 주", "₩1,234,000", "↑ 8%")
    with col3:
        st.metric("이번 달", "₩5,678,000", "↑ 15%")
    with col4:
        st.metric("이번 분기", "₩15,234,000", "↑ 23%")
    
    st.divider()
    
    # 수익 차트
    st.markdown("### 📈 일별 수익 추이")
    
    dates = pd.date_range(end=datetime.now(), periods=30, freq='D')
    daily_revenue = [150000 + i * 5000 for i in range(30)]
    
    fig = go.Figure()
    fig.add_trace(go.Scatter(x=dates, y=daily_revenue, mode='lines+markers', name='일별 수익'))
    fig.update_layout(height=400)
    st.plotly_chart(fig, use_container_width=True)
    
    # 수익 내역
    st.markdown("### 📋 상세 수익 내역")
    
    revenue_details = []
    for i in range(20):
        revenue_details.append({
            "날짜": (datetime.now() - timedelta(days=i)).strftime("%Y-%m-%d"),
            "구분": ["신규가입", "구독료", "수수료"][i % 3],
            "회원": f"user{i+1}",
            "플랜": ["Basic", "Standard", "Premium"][i % 3],
            "금액": f"₩{(i+1)*10000:,}",
            "상태": "정산완료" if i > 5 else "정산대기"
        })
    
    df = pd.DataFrame(revenue_details)
    st.dataframe(df, use_container_width=True, hide_index=True)


def show_settlement():
    """정산 관리"""
    st.subheader("💳 정산 관리")
    
    # 정산 요약
    col1, col2, col3 = st.columns(3)
    
    with col1:
        st.info("이번 달 정산 예정")
        st.metric("정산 예정액", "₩4,567,890")
        st.caption("정산일: 매월 5일")
    
    with col2:
        st.success("지난 달 정산 완료")
        st.metric("정산 완료액", "₩3,890,000")
        st.caption("정산일: 2024-12-05")
    
    with col3:
        st.warning("미정산 금액")
        st.metric("미정산액", "₩234,000")
        st.caption("사유: 서류 미비")
    
    st.divider()
    
    # 정산 내역
    st.markdown("### 📜 정산 내역")
    
    settlements = []
    for i in range(12):
        settlements.append({
            "정산월": f"2024-{12-i:02d}",
            "정산일": f"2024-{12-i:02d}-05",
            "회원수": 45 + i,
            "총 수익": f"₩{(300 + i*20)*10000:,}",
            "수수료": f"₩{(100 + i*7)*10000:,}",
            "정산액": f"₩{(200 + i*13)*10000:,}",
            "상태": "완료" if i < 6 else "예정"
        })
    
    df = pd.DataFrame(settlements)
    st.dataframe(df, use_container_width=True, hide_index=True)


def show_withdrawal():
    """출금 관리"""
    st.subheader("🏦 출금 관리")
    
    # 출금 가능 금액
    col1, col2 = st.columns(2)
    
    with col1:
        st.info("출금 가능 금액")
        st.metric("", "₩2,345,000")
        st.caption("최소 출금액: ₩100,000")
        
        with st.form("withdrawal_form"):
            amount = st.number_input("출금 금액", min_value=100000, max_value=2345000, step=10000)
            bank = st.selectbox("은행 선택", ["신한은행", "국민은행", "우리은행", "하나은행"])
            account = st.text_input("계좌번호", placeholder="계좌번호 입력")
            
            submitted = st.form_submit_button("출금 신청", use_container_width=True)
            if submitted:
                st.success("출금 신청이 완료되었습니다!")
    
    with col2:
        st.markdown("### 📋 출금 내역")
        
        withdrawals = []
        for i in range(5):
            withdrawals.append({
                "신청일": (datetime.now() - timedelta(days=i*7)).strftime("%Y-%m-%d"),
                "금액": f"₩{(100 + i*50)*10000:,}",
                "상태": "완료" if i > 1 else "처리중"
            })
        
        df = pd.DataFrame(withdrawals)
        st.dataframe(df, use_container_width=True, hide_index=True)
''',

    "income_management.py": '''"""
수입 관리 페이지 (총판용)
수입 현황, 수수료, 정산 관리
"""

import streamlit as st
import pandas as pd
from datetime import datetime, timedelta
import plotly.express as px


def show_page(page_id: str):
    """페이지 표시"""
    if page_id == 'income_overview':
        show_income_overview()
    elif page_id == 'commission_management':
        show_commission_management()
    elif page_id == 'income_settlement':
        show_income_settlement()
    else:
        st.error(f"페이지 {page_id}를 찾을 수 없습니다.")


def show_income_overview():
    """수입 개요"""
    st.subheader("💰 수입 현황")
    
    # 수입 요약
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        st.metric("이번 달 수입", "₩12,345,000", "↑ 15%")
    with col2:
        st.metric("대리점 수수료", "₩8,234,000", "↑ 12%")
    with col3:
        st.metric("직접 회원", "₩4,111,000", "↑ 23%")
    with col4:
        st.metric("순이익", "₩7,234,000", "↑ 18%")
    
    st.divider()
    
    # 월별 수입 추이
    st.markdown("### 📊 월별 수입 추이")
    
    months = pd.date_range(end=datetime.now(), periods=12, freq='M')
    income_data = pd.DataFrame({
        '월': months.strftime('%Y-%m'),
        '대리점 수수료': [700 + i*50 for i in range(12)],
        '직접 회원': [300 + i*30 for i in range(12)],
        '기타 수입': [100 + i*10 for i in range(12)]
    })
    
    fig = px.bar(income_data, x='월', y=['대리점 수수료', '직접 회원', '기타 수입'],
                 title='월별 수입 구성', barmode='stack')
    st.plotly_chart(fig, use_container_width=True)


def show_commission_management():
    """수수료 관리"""
    st.subheader("💸 수수료 관리")
    
    # 수수료율 설정
    st.markdown("### ⚙️ 수수료율 설정")
    
    col1, col2, col3 = st.columns(3)
    
    with col1:
        st.info("Gold 등급")
        st.slider("수수료율 (%)", 30, 50, 40, key="gold_rate")
    
    with col2:
        st.info("Silver 등급")
        st.slider("수수료율 (%)", 25, 45, 35, key="silver_rate")
    
    with col3:
        st.info("Bronze 등급")
        st.slider("수수료율 (%)", 20, 40, 30, key="bronze_rate")
    
    st.divider()
    
    # 대리점별 수수료 현황
    st.markdown("### 📋 대리점별 수수료 현황")
    
    commission_data = []
    for i in range(1, 11):
        commission_data.append({
            "대리점": f"대리점 {i}",
            "등급": ["Gold", "Silver", "Bronze"][i % 3],
            "회원수": 20 + i*3,
            "총 매출": f"₩{(500 + i*100)*10000:,}",
            "수수료율": f"{35 + (i % 3)*5}%",
            "수수료": f"₩{(175 + i*35)*10000:,}",
            "상태": "정산완료" if i < 6 else "정산대기"
        })
    
    df = pd.DataFrame(commission_data)
    st.dataframe(df, use_container_width=True, hide_index=True)


def show_income_settlement():
    """수입 정산"""
    st.subheader("📊 수입 정산")
    
    # 정산 현황
    col1, col2 = st.columns(2)
    
    with col1:
        st.markdown("### 💳 정산 현황")
        
        settlement_summary = {
            "정산 예정": "₩8,234,000",
            "정산 완료": "₩45,678,000",
            "미정산": "₩234,000",
            "다음 정산일": "2025-01-05"
        }
        
        for key, value in settlement_summary.items():
            st.metric(key, value)
    
    with col2:
        st.markdown("### 📅 정산 일정")
        
        settlement_schedule = []
        for i in range(6):
            date = datetime.now() + timedelta(days=30*i)
            settlement_schedule.append({
                "정산월": date.strftime("%Y-%m"),
                "정산일": date.replace(day=5).strftime("%Y-%m-%d"),
                "예상 금액": f"₩{(800 + i*100)*10000:,}"
            })
        
        df = pd.DataFrame(settlement_schedule)
        st.dataframe(df, use_container_width=True, hide_index=True)
''',

    "marketing.py": '''"""
마케팅 페이지 (총판용)
프로모션, 이벤트, 광고 관리
"""

import streamlit as st
import pandas as pd
from datetime import datetime, timedelta


def show_page(page_id: str):
    """페이지 표시"""
    if page_id == 'promotions':
        show_promotions()
    elif page_id == 'events':
        show_events()
    elif page_id == 'advertising':
        show_advertising()
    else:
        st.error(f"페이지 {page_id}를 찾을 수 없습니다.")


def show_promotions():
    """프로모션 관리"""
    st.subheader("🎁 프로모션 관리")
    
    # 현재 진행 중인 프로모션
    st.markdown("### 🔥 진행 중인 프로모션")
    
    active_promos = [
        {"제목": "신규 가입 30% 할인", "기간": "2024-12-01 ~ 2024-12-31", "참여": 234, "상태": "진행중"},
        {"제목": "친구 추천 이벤트", "기간": "2024-12-15 ~ 2025-01-15", "참여": 156, "상태": "진행중"},
    ]
    
    for promo in active_promos:
        col1, col2, col3, col4 = st.columns([3, 2, 1, 1])
        with col1:
            st.markdown(f"**{promo['제목']}**")
        with col2:
            st.caption(promo['기간'])
        with col3:
            st.metric("참여", promo['참여'])
        with col4:
            st.success(promo['상태'])
    
    st.divider()
    
    # 새 프로모션 생성
    st.markdown("### ➕ 새 프로모션 생성")
    
    with st.form("new_promotion"):
        col1, col2 = st.columns(2)
        
        with col1:
            st.text_input("프로모션명")
            st.selectbox("유형", ["할인", "캐시백", "무료체험", "추천인"])
            st.number_input("할인율 (%)", 0, 100, 30)
        
        with col2:
            st.date_input("시작일")
            st.date_input("종료일")
            st.text_area("설명")
        
        st.form_submit_button("생성", use_container_width=True)


def show_events():
    """이벤트 관리"""
    st.subheader("🎉 이벤트 관리")
    
    # 이벤트 캘린더
    st.markdown("### 📅 이벤트 일정")
    
    events = [
        {"날짜": "2024-12-25", "이벤트": "크리스마스 특별 이벤트", "유형": "할인"},
        {"날짜": "2025-01-01", "이벤트": "새해 맞이 이벤트", "유형": "경품"},
        {"날짜": "2025-01-15", "이벤트": "월간 트레이딩 대회", "유형": "대회"},
    ]
    
    df = pd.DataFrame(events)
    st.dataframe(df, use_container_width=True, hide_index=True)
    
    # 이벤트 성과
    st.markdown("### 📊 이벤트 성과")
    
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        st.metric("총 참여자", "1,234명", "↑ 234")
    with col2:
        st.metric("신규 가입", "456명", "↑ 56")
    with col3:
        st.metric("전환율", "37.0%", "↑ 5%")
    with col4:
        st.metric("ROI", "245%", "↑ 15%")


def show_advertising():
    """광고 관리"""
    st.subheader("📢 광고 관리")
    
    # 광고 채널별 성과
    st.markdown("### 📊 채널별 광고 성과")
    
    channels = {
        "구글 광고": {"예산": "₩2,000,000", "클릭": "5,234", "전환": "234", "CPA": "₩8,547"},
        "페이스북": {"예산": "₩1,500,000", "클릭": "4,567", "전환": "189", "CPA": "₩7,937"},
        "네이버": {"예산": "₩1,000,000", "클릭": "3,234", "전환": "156", "CPA": "₩6,410"},
        "카카오": {"예산": "₩800,000", "클릭": "2,345", "전환": "123", "CPA": "₩6,504"},
    }
    
    for channel, data in channels.items():
        with st.expander(channel):
            col1, col2, col3, col4 = st.columns(4)
            with col1:
                st.metric("예산", data["예산"])
            with col2:
                st.metric("클릭수", data["클릭"])
            with col3:
                st.metric("전환수", data["전환"])
            with col4:
                st.metric("CPA", data["CPA"])
    
    # 광고 예산 설정
    st.markdown("### 💰 광고 예산 관리")
    
    total_budget = st.number_input("월간 총 예산", 0, 10000000, 5000000, step=100000)
    
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        st.number_input("구글", 0, total_budget, 2000000)
    with col2:
        st.number_input("페이스북", 0, total_budget, 1500000)
    with col3:
        st.number_input("네이버", 0, total_budget, 1000000)
    with col4:
        st.number_input("카카오", 0, total_budget, 500000)
    
    st.button("예산 저장", use_container_width=True)
'''
}

# Write all files
for filename, content in file_contents.items():
    filepath = os.path.join("pages", filename)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Fixed: {filename}")

print("\n✅ All files have been fixed!")