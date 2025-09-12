#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 완전한 카테고리별 페이지 구성 정보
const categoryConfigs = {
  // Macro 카테고리
  'macro': {
    tier: 'Signature',
    pages: {
      'bonds': {
        title: '채권 시장 분석',
        description: '글로벌 채권 시장 동향과 수익률 곡선 분석',
        features: ['국가별 채권 수익률 비교', '수익률 곡선 분석', '신용 스프레드 추적', '중앙은행 정책 영향', '인플레이션 연동채 분석', '채권 듀레이션 리스크']
      },
      'calendar': {
        title: '경제 캘린더',
        description: '주요 경제 지표 발표 일정과 시장 영향도 분석',
        features: ['중요 경제지표 일정', '발표 전후 변동성 분석', 'GDP, CPI, NFP 추적', '중앙은행 회의 일정', '기업 실적 발표', '시장 컨센서스 비교']
      },
      'central-banks': {
        title: '중앙은행 정책 분석',
        description: '주요 중앙은행의 통화정책과 시장 영향 분석',
        tier: 'Master',
        features: ['Fed 정책 실시간 추적', 'ECB/BOJ 정책 비교', '금리 인상/인하 예측', 'QE 정책 영향 분석', '중앙은행 발언 분석', '통화정책 일정 추적']
      },
      'commodities': {
        title: '원자재 시장 분석',
        description: '금, 은, 원유 등 주요 원자재 가격 동향 분석',
        features: ['금/은 가격 추적', '원유 선물 분석', '농산물 가격 동향', '산업용 금속 추적', '달러 인덱스 연관성', '인플레이션 헤지 전략']
      },
      'dxy': {
        title: '달러 인덱스 분석',
        description: 'DXY 달러 지수와 암호화폐 시장의 상관관계 분석',
        features: ['달러 강세/약세 분석', '주요 통화 대비 달러', '암호화폐 역상관성', '연준 정책과 달러', 'DXY 기술적 분석', '글로벌 리스크 온오프']
      },
      'forex': {
        title: '외환 시장 분석',
        description: '주요 통화쌍의 환율 동향과 크로스 커런시 분석',
        tier: 'Master',
        features: ['주요 통화쌍 분석', '크로스 커런시 기회', '캐리 트레이드 전략', '중앙은행 개입 추적', '경제지표 영향 분석', '헤지 전략 활용']
      },
      'geopolitics': {
        title: '지정학적 리스크 분석',
        description: '국제 정치 상황이 금융 시장에 미치는 영향 분석',
        tier: 'Master',
        features: ['국제 분쟁 모니터링', '제재 영향 분석', '안전자산 플로우', '에너지 안보 이슈', '무역 분쟁 추적', '선거 영향 분석']
      },
      'indicators': {
        title: '경제 지표 분석',
        description: '주요 경제 지표의 시장 영향도와 트렌드 분석',
        features: ['GDP 성장률 추적', '인플레이션 지표 분석', '고용 통계 모니터링', '제조업/서비스업 PMI', '소비자 신뢰지수', '주택 시장 지표']
      },
      'inflation': {
        title: '인플레이션 분석',
        description: '글로벌 인플레이션 동향과 암호화폐에 미치는 영향',
        features: ['CPI/PPI 데이터 추적', '핵심 인플레이션 분석', '인플레이션 기대치', '중앙은행 목표 대비', '에너지/식품 가격 영향', '임금 상승 압력']
      },
      'interest-rates': {
        title: '금리 분석',
        description: '주요국 기준금리 변화와 시장에 미치는 영향 분석',
        features: ['기준금리 추적', '금리 기대치 분석', '수익률 곡선 변화', '실질금리 계산', '금리 차이 거래', '채권-주식 상관관계']
      }
    }
  },
  
  // Education 카테고리
  'education': {
    tier: 'Starter',
    pages: {
      'basics': {
        title: '트레이딩 기초',
        description: '암호화폐 트레이딩의 기본 개념과 용어 학습',
        tier: 'Free',
        features: ['기초 용어 정리', '차트 읽는 방법', '주문 타입 설명', '기본 지표 활용', '리스크 관리 기초', '실전 예제 학습']
      },
      'certification': {
        title: '트레이더 인증',
        description: '체계적인 학습과 평가를 통한 트레이더 자격 인증',
        tier: 'Platinum',
        features: ['레벨별 학습 과정', '실력 평가 테스트', '인증서 발급', '전문가 멘토링', '커뮤니티 액세스', '지속 교육 프로그램']
      },
      'defi': {
        title: 'DeFi 교육',
        description: '탈중앙화 금융의 이해와 실전 활용 가이드',
        tier: 'Professional',
        features: ['DeFi 기초 개념', '유동성 공급 방법', '이자 농사 전략', '임펄머넌트 로스 이해', '거버넌스 참여', '리스크 관리']
      },
      'fundamental': {
        title: '펀더멘털 분석',
        description: '암호화폐 프로젝트의 기본 가치 평가 방법론',
        tier: 'Professional',
        features: ['프로젝트 평가 기준', '토크노믹스 분석', '팀 및 파트너십 평가', '기술적 혁신성', '시장 적용 가능성', '경쟁 분석']
      },
      'glossary': {
        title: '용어 사전',
        description: '암호화폐 및 블록체인 관련 전문 용어 해설',
        tier: 'Free',
        features: ['A-Z 용어 정리', '카테고리별 분류', '예시와 함께 설명', '최신 용어 업데이트', '검색 기능', '북마크 기능']
      },
      'psychology': {
        title: '트레이딩 심리학',
        description: '감정 관리와 심리적 편향 극복을 위한 멘털 트레이닝',
        tier: 'Professional',
        features: ['감정 관리 기법', '인지적 편향 이해', 'FOMO/FUD 대응', '손실 수용 심리', '자기 통제력 향상', '멘털 코칭']
      },
      'risk': {
        title: '리스크 관리 교육',
        description: '체계적인 리스크 관리와 자본 보호 전략',
        tier: 'Professional',
        features: ['포지션 사이징', '손절매 전략', '분산투자 원칙', '레버리지 관리', '시장 상황 대응', '백테스팅 방법']
      },
      'strategies': {
        title: '트레이딩 전략',
        description: '검증된 트레이딩 전략과 실전 적용 방법',
        tier: 'Platinum',
        features: ['DCA 전략 심화', '스윙 트레이딩 기법', '스캘핑 전략', '아비트라지 기법', '포트폴리오 전략', '백테스팅 방법']
      },
      'technical': {
        title: '기술적 분석',
        description: '차트 패턴과 기술적 지표를 활용한 분석 기법',
        tier: 'Professional',
        features: ['차트 패턴 인식', '이동평균선 활용', 'RSI, MACD 해석', '볼린저 밴드 전략', '피보나치 리트레이스먼트', '지지저항선 분석']
      },
      'webinar': {
        title: '실시간 웨비나',
        description: '전문가와 함께하는 라이브 교육 세션',
        tier: 'Platinum',
        features: ['주간 라이브 세션', '전문가 Q&A', '실시간 차트 분석', '시장 상황 토론', '녹화 다시보기', 'VIP 세션 참여']
      }
    }
  },

  // Gaming 카테고리
  'gaming': {
    tier: 'Professional',
    pages: {
      'achievements': {
        title: '트레이딩 업적',
        description: '거래 성과에 따른 배지와 업적 시스템',
        features: ['수익률 배지', '연속 성공 기록', '거래량 마일스톤', '정확도 레벨', '리더보드 랭킹', '특별 칭호 획득']
      },
      'guild': {
        title: '트레이딩 길드',
        description: '같은 관심사를 가진 트레이더들의 그룹 활동',
        tier: 'Platinum',
        features: ['길드 생성/가입', '그룹 채팅', '공동 포트폴리오', '길드 대항전', '지식 공유', '멘토-멘티 매칭']
      },
      'leaderboard': {
        title: '리더보드',
        description: '트레이더들의 실시간 순위와 성과 비교',
        features: ['일일/주간/월간 순위', '수익률 랭킹', '승률 순위', '거래량 순위', '안정성 점수', '종합 평가']
      },
      'metaverse': {
        title: '메타버스 트레이딩',
        description: '가상현실 환경에서의 몰입형 트레이딩 경험',
        tier: 'Infinity',
        features: ['VR 트레이딩 룸', '3D 차트 시각화', '아바타 커스터마이징', '가상 거래소', '소셜 트레이딩 공간', 'NFT 수집품']
      },
      'nft': {
        title: 'NFT 게임',
        description: 'NFT 기반 트레이딩 카드와 수집품 게임',
        tier: 'Master',
        features: ['트레이딩 카드 NFT', '카드 배틀 시스템', '레어 카드 수집', 'P2E 리워드', '카드 거래소', '시즌별 이벤트']
      },
      'paper-competition': {
        title: '페이퍼 트레이딩 대회',
        description: '가상 자금으로 진행하는 트레이딩 경연 대회',
        features: ['월간 대회', '실시간 순위', '가상 자금 100만원', '우승 상금', '전략 공유', '대회 분석 리포트']
      },
      'prediction': {
        title: '가격 예측 게임',
        description: '암호화폐 가격 예측을 통한 포인트 획득 게임',
        features: ['일일 예측 미션', '정확도 점수', '예측 스트릭', '보너스 포인트', '예측왕 선발', '리워드 교환']
      },
      'rewards': {
        title: '리워드 시스템',
        description: '거래 활동과 참여에 따른 다양한 보상 시스템',
        features: ['포인트 적립', '등급별 혜택', '캐시백 리워드', '무료 구독권', '특별 이벤트', '추천인 보상']
      },
      'social-trading': {
        title: '소셜 트레이딩',
        description: '성공한 트레이더의 전략을 따라하는 소셜 투자',
        tier: 'Platinum',
        features: ['인기 트레이더 팔로우', '자동 복사 거래', '트레이더 순위', '전략 분석', '수수료 공유', '커뮤니티 피드']
      },
      'trading-battle': {
        title: '트레이딩 배틀',
        description: '실시간 1:1 또는 팀 대항 트레이딩 경기',
        tier: 'Professional',
        features: ['실시간 대전', '팀 배틀', '토너먼트 시스템', 'ELO 레이팅', '배틀 리플레이', '전략 분석']
      }
    }
  },

  // System 카테고리
  'system': {
    tier: 'Professional',
    pages: {
      'account': {
        title: '계정 관리',
        description: '개인 정보 및 계정 설정 관리',
        tier: 'Free',
        features: ['프로필 설정', '비밀번호 변경', '2FA 보안 설정', '알림 설정', '개인정보 수정', '계정 탈퇴']
      },
      'advanced': {
        title: '고급 설정',
        description: '전문가를 위한 상세 시스템 설정',
        tier: 'Master',
        features: ['고급 차트 설정', '사용자 정의 지표', '알고리즘 설정', '백테스팅 환경', '데이터 내보내기', '개발자 도구']
      },
      'api': {
        title: 'API 연동 설정',
        description: '거래소 API 연동 및 자동화 거래 설정',
        tier: 'Master',
        features: ['거래소 API 키 설정', 'REST API 연동', 'WebSocket 실시간 데이터', 'API 보안 설정', '자동 거래 봇 설정', 'API 사용량 관리']
      },
      'backup': {
        title: '백업 및 복원',
        description: '설정과 데이터의 백업 및 복원 시스템',
        tier: 'Professional',
        features: ['자동 백업 설정', '수동 백업 생성', '클라우드 동기화', '데이터 복원', '설정 내보내기', '이전 버전 복구']
      },
      'integrations': {
        title: '외부 서비스 연동',
        description: '써드파티 서비스와의 연동 및 동기화',
        tier: 'Platinum',
        features: ['포트폴리오 트래커 연동', '세무 소프트웨어 동기화', 'DeFi 프로토콜 연결', '소셜 미디어 연동', '뉴스 피드 통합', '알림 서비스']
      },
      'language': {
        title: '언어 설정',
        description: '다국어 지원 및 지역별 설정',
        tier: 'Free',
        features: ['한국어/영어/일본어', '시간대 설정', '통화 단위 선택', '날짜 형식', '숫자 표기법', '지역별 규정']
      },
      'notifications': {
        title: '알림 설정',
        description: '다양한 알림과 경고 시스템 설정',
        tier: 'Professional',
        features: ['가격 알림 설정', '이메일/SMS 알림', '푸시 알림', '텔레그램 봇 연동', '알림 빈도 조절', '중요도별 분류']
      },
      'privacy': {
        title: '개인정보 보호',
        description: '개인정보 처리 및 프라이버시 설정',
        tier: 'Free',
        features: ['데이터 처리 동의', '쿠키 설정', '추적 차단', '데이터 삭제 요청', '개인정보 열람', '동의 철회']
      },
      'security': {
        title: '보안 설정',
        description: '계정 보안 강화 및 위험 관리',
        tier: 'Professional',
        features: ['2FA 인증 설정', '로그인 기록 조회', 'IP 화이트리스트', '세션 관리', '보안 알림', '의심 활동 탐지']
      },
      'theme': {
        title: '테마 설정',
        description: '사용자 인터페이스 테마 및 레이아웃 커스터마이징',
        tier: 'Free',
        features: ['다크/라이트 모드', '색상 테마 선택', '레이아웃 조정', '차트 스타일', '글꼴 크기 조절', '사용자 정의 CSS']
      }
    }
  }
};

// ExclusiveAccess 템플릿 생성
function generateExclusiveAccessCode(title, description, tier, features) {
  const featuresString = features.map(f => `        '${f}'`).join(',\n');
  
  return `'use client'

import ExclusiveAccess from '@/components/ExclusiveAccess'

export default function Page() {
  return (
    <ExclusiveAccess
      title="${title}"
      description="${description}"
      requiredTier="${tier}"
      features={[
${featuresString}
      ]}
    />
  )
}`;
}

// 파일 업데이트 함수
function updatePageFile(filePath, config, categoryTier) {
  const tier = config.tier || categoryTier;
  const content = generateExclusiveAccessCode(
    config.title, 
    config.description, 
    tier, 
    config.features
  );
  
  try {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Updated: ${filePath}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to update ${filePath}:`, error.message);
    return false;
  }
}

// 메인 실행 함수
function main() {
  const frontendDir = path.join(__dirname, '..', 'frontend', 'app');
  let totalUpdated = 0;
  let totalFailed = 0;

  console.log('🚀 Starting comprehensive ExclusiveAccess bulk update...\n');

  for (const [category, categoryConfig] of Object.entries(categoryConfigs)) {
    console.log(`📁 Processing category: ${category}`);
    const categoryDir = path.join(frontendDir, category);
    
    if (!fs.existsSync(categoryDir)) {
      console.log(`⚠️  Category directory not found: ${categoryDir}`);
      continue;
    }

    for (const [page, pageConfig] of Object.entries(categoryConfig.pages)) {
      const pageFilePath = path.join(categoryDir, page, 'page.tsx');
      
      if (fs.existsSync(pageFilePath)) {
        const success = updatePageFile(pageFilePath, pageConfig, categoryConfig.tier);
        if (success) {
          totalUpdated++;
        } else {
          totalFailed++;
        }
      } else {
        console.log(`⚠️  Page file not found: ${pageFilePath}`);
        totalFailed++;
      }
    }
    
    console.log();
  }

  console.log('\n🎉 Comprehensive bulk update completed!');
  console.log(`✅ Successfully updated: ${totalUpdated} files`);
  console.log(`❌ Failed to update: ${totalFailed} files`);
  console.log(`📊 Total processed: ${totalUpdated + totalFailed} files`);
}

// 스크립트 실행
if (require.main === module) {
  main();
}

module.exports = { updatePageFile, generateExclusiveAccessCode };