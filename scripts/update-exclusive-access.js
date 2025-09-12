#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 카테고리별 페이지 구성 정보
const categoryConfigs = {
  'risk': {
    tier: 'Platinum',
    pages: {
      'position-sizing': {
        title: '포지션 사이징',
        description: '자본금 대비 최적의 거래 규모를 계산하는 전문 도구',
        features: [
          '자본금 기반 포지션 계산',
          '변동성 조정 사이징',
          '리스크 패리티 모델',
          'ATR 기반 포지션 조정',
          '멀티 자산 포지션 배분',
          '동적 사이징 알고리즘'
        ]
      },
      'scenario': {
        title: '시나리오 분석',
        description: '다양한 시장 상황에서의 포트폴리오 성과 시뮬레이션',
        tier: 'Signature',
        features: [
          '몬테카를로 시뮬레이션',
          '극한 상황 스트레스 테스트',
          '역사적 시나리오 재현',
          'VaR 및 CVaR 계산',
          '다양한 시장 환경 모델링',
          '리스크 시나리오 백테스팅'
        ]
      },
      'stop-loss': {
        title: '손절매 최적화',
        description: '기술적 분석과 리스크 관리를 결합한 스마트 손절매 시스템',
        features: [
          'ATR 기반 동적 손절매',
          '트레일링 스톱 알고리즘',
          '볼린저 밴드 손절매',
          '피보나치 리트레이스먼트 활용',
          '지지저항선 기반 손절매',
          '시간 기반 손절매 전략'
        ]
      },
      'stress-test': {
        title: '스트레스 테스트',
        description: '극한 시장 상황에서의 포트폴리오 안정성 검증 시스템',
        tier: 'Master',
        features: [
          '2008 금융위기 시나리오',
          'COVID-19 팬데믹 충격 테스트',
          '암호화폐 대폭락 시뮬레이션',
          '유동성 위기 스트레스 테스트',
          '금리 급변동 시나리오',
          '지정학적 리스크 모델링'
        ]
      },
      'var': {
        title: 'VaR 리스크 측정',
        description: 'Value at Risk를 통한 정량적 리스크 측정 및 관리',
        tier: 'Infinity',
        features: [
          '히스토리컬 VaR 계산',
          '몬테카를로 VaR 시뮬레이션',
          'Conditional VaR (CVaR) 분석',
          '포트폴리오 VaR 분해',
          'VaR 백테스팅 검증',
          '리스크 기여도 분석'
        ]
      }
    }
  },
  'crypto': {
    tier: 'Signature',
    pages: {
      'altseason': {
        title: '알트시즌 분석',
        description: '알트코인 강세장을 예측하고 최적 진입 타이밍을 포착',
        features: [
          '비트코인 도미넌스 분석',
          '알트코인 상대 강도 측정',
          '섹터별 회전 분석',
          '자금 흐름 추적',
          '시장 심리 지표',
          '알트시즌 지수 계산'
        ]
      },
      'defi': {
        title: 'DeFi 생태계 분석',
        description: '탈중앙화 금융 프로토콜 분석과 수익 기회 발굴',
        tier: 'Master',
        features: [
          'TVL 변화 추적',
          '이자율 비교 분석',
          '임펄머넌트 로스 계산',
          '거버넌스 토큰 분석',
          '프로토콜 수익성 평가',
          '리스크 등급 산정'
        ]
      },
      'dominance': {
        title: '도미넌스 분석',
        description: '비트코인과 주요 알트코인의 시장 지배력 변화 추적',
        features: [
          '비트코인 도미넌스 차트',
          '이더리움 도미넌스 분석',
          '스테이블코인 비중 변화',
          '시가총액 순위 변동',
          '도미넌스 기반 매매 신호',
          '시장 단계별 전략'
        ]
      }
    }
  },
  'portfolio': {
    tier: 'Platinum',
    pages: {
      'allocation': {
        title: '자산 배분 최적화',
        description: '현대 포트폴리오 이론에 기반한 최적 자산 배분 전략',
        features: [
          '효율적 프런티어 분석',
          '리밸런싱 전략',
          '리스크 패리티 모델',
          '블랙-리터만 모델',
          '동적 자산 배분',
          '세후 수익률 최적화'
        ]
      },
      'optimization': {
        title: '포트폴리오 최적화',
        description: '수학적 모델을 통한 포트폴리오 성과 극대화',
        tier: 'Master',
        features: [
          '마코위츠 최적화',
          '제약 조건 설정',
          '거래 비용 고려',
          '다목적 최적화',
          '강건한 최적화',
          '베이지안 최적화'
        ]
      }
    }
  }
};

// ExclusiveAccess 템플릿 생성
function generateExclusiveAccessCode(title, description, tier, features) {
  return `'use client'

import ExclusiveAccess from '@/components/ExclusiveAccess'

export default function Page() {
  return (
    <ExclusiveAccess
      title="${title}"
      description="${description}"
      requiredTier="${tier}"
      features={[
        ${features.map(f => `'${f}'`).join(',\n        ')}
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

  console.log('🚀 Starting ExclusiveAccess bulk update...\n');

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
      }
    }
    
    console.log();
  }

  console.log('\n🎉 Bulk update completed!');
  console.log(`✅ Successfully updated: ${totalUpdated} files`);
  console.log(`❌ Failed to update: ${totalFailed} files`);
  console.log(`📊 Total processed: ${totalUpdated + totalFailed} files`);
}

// 스크립트 실행
if (require.main === module) {
  main();
}

module.exports = { updatePageFile, generateExclusiveAccessCode };