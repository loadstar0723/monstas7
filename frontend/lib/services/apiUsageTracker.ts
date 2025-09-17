/**
 * API 사용량 추적 시스템
 * 각 API의 호출 횟수를 추적하여 무료 한도 관리
 */

interface APIUsage {
  name: string;
  count: number;
  limit: number;
  resetDate: Date;
  lastCall: Date;
}

interface APILimits {
  [key: string]: {
    daily?: number;
    monthly?: number;
    perMinute?: number;
  };
}

// API별 무료 플랜 한도
const API_LIMITS: APILimits = {
  cryptocompare: {
    monthly: 100000,
    perMinute: 50,
  },
  coingecko: {
    monthly: 10000,
    perMinute: 30,
  },
  binance: {
    perMinute: 1200, // 무료 플랜
  },
  alternative: {
    daily: 10000, // Alternative.me
  },
  glassnode: {
    monthly: 1000, // 무료 플랜
  },
};

class APIUsageTracker {
  private storage: Storage | null = null;
  private memoryCache: Map<string, APIUsage> = new Map();

  constructor() {
    if (typeof window !== 'undefined') {
      this.storage = localStorage;
      this.loadFromStorage();
    }
  }

  // 스토리지에서 데이터 로드
  private loadFromStorage() {
    if (!this.storage) return;

    const stored = this.storage.getItem('api_usage');
    if (stored) {
      try {
        const data = JSON.parse(stored);
        Object.entries(data).forEach(([key, value]) => {
          this.memoryCache.set(key, value as APIUsage);
        });
      } catch (error) {
        console.error('API 사용량 데이터 로드 실패:', error);
      }
    }
  }

  // 스토리지에 저장
  private saveToStorage() {
    if (!this.storage) return;

    const data: { [key: string]: APIUsage } = {};
    this.memoryCache.forEach((value, key) => {
      data[key] = value;
    });

    this.storage.setItem('api_usage', JSON.stringify(data));
  }

  // API 호출 추적
  track(apiName: string, endpoint?: string): boolean {
    const key = endpoint ? `${apiName}:${endpoint}` : apiName;
    const now = new Date();

    let usage = this.memoryCache.get(key);
    const limits = API_LIMITS[apiName];

    if (!usage) {
      usage = {
        name: apiName,
        count: 0,
        limit: limits?.monthly || limits?.daily || 0,
        resetDate: this.getResetDate(apiName),
        lastCall: now,
      };
    }

    // 리셋 날짜 확인
    if (now > usage.resetDate) {
      usage.count = 0;
      usage.resetDate = this.getResetDate(apiName);
    }

    // 분당 제한 확인
    if (limits?.perMinute) {
      const minuteKey = `${key}:minute`;
      const minuteUsage = this.memoryCache.get(minuteKey);

      if (minuteUsage) {
        const minuteDiff = (now.getTime() - minuteUsage.lastCall.getTime()) / 1000 / 60;
        if (minuteDiff < 1 && minuteUsage.count >= limits.perMinute) {
          console.warn(`⚠️ ${apiName} 분당 한도 초과: ${minuteUsage.count}/${limits.perMinute}`);
          return false;
        }
      }
    }

    // 카운트 증가
    usage.count++;
    usage.lastCall = now;
    this.memoryCache.set(key, usage);
    this.saveToStorage();

    // 한도 경고
    if (limits) {
      const limit = limits.monthly || limits.daily || 0;
      const percentage = (usage.count / limit) * 100;

      if (percentage >= 90) {
        console.warn(`🚨 ${apiName} API 사용량 경고: ${usage.count}/${limit} (${percentage.toFixed(1)}%)`);
      } else if (percentage >= 75) {
        console.warn(`⚠️ ${apiName} API 사용량 주의: ${usage.count}/${limit} (${percentage.toFixed(1)}%)`);
      }
    }

    return true;
  }

  // 리셋 날짜 계산
  private getResetDate(apiName: string): Date {
    const now = new Date();
    const limits = API_LIMITS[apiName];

    if (limits?.monthly) {
      // 다음 달 1일
      const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      return nextMonth;
    } else if (limits?.daily) {
      // 내일 00:00
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      return tomorrow;
    }

    // 기본: 한 달 후
    const nextMonth = new Date(now);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    return nextMonth;
  }

  // 사용량 통계 조회
  getStats(apiName?: string): APIUsage[] {
    const stats: APIUsage[] = [];

    if (apiName) {
      const usage = this.memoryCache.get(apiName);
      if (usage) stats.push(usage);
    } else {
      this.memoryCache.forEach(value => {
        if (!value.name.includes(':minute')) {
          stats.push(value);
        }
      });
    }

    return stats;
  }

  // 사용량 리포트 생성
  generateReport(): string {
    const stats = this.getStats();
    let report = '📊 API 사용량 리포트\n';
    report += '═══════════════════\n\n';

    stats.forEach(stat => {
      const limits = API_LIMITS[stat.name];
      const limit = limits?.monthly || limits?.daily || 0;
      const percentage = limit > 0 ? (stat.count / limit) * 100 : 0;
      const status = percentage >= 90 ? '🔴' : percentage >= 75 ? '🟡' : '🟢';

      report += `${status} ${stat.name.toUpperCase()}\n`;
      report += `  사용량: ${stat.count.toLocaleString()}/${limit.toLocaleString()} (${percentage.toFixed(1)}%)\n`;
      report += `  리셋: ${stat.resetDate.toLocaleDateString()}\n`;
      report += `  마지막 호출: ${stat.lastCall.toLocaleTimeString()}\n\n`;
    });

    return report;
  }

  // 대시보드용 데이터
  getDashboardData() {
    const stats = this.getStats();

    return stats.map(stat => {
      const limits = API_LIMITS[stat.name];
      const limit = limits?.monthly || limits?.daily || 0;
      const percentage = limit > 0 ? (stat.count / limit) * 100 : 0;

      return {
        name: stat.name,
        used: stat.count,
        limit: limit,
        percentage: percentage,
        status: percentage >= 90 ? 'danger' : percentage >= 75 ? 'warning' : 'success',
        resetDate: stat.resetDate,
        daysUntilReset: Math.ceil((stat.resetDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
      };
    });
  }

  // 사용량 초기화 (테스트용)
  reset(apiName?: string) {
    if (apiName) {
      this.memoryCache.delete(apiName);
    } else {
      this.memoryCache.clear();
    }
    this.saveToStorage();
  }
}

// 싱글톤 인스턴스
export const apiUsageTracker = new APIUsageTracker();

// 헬퍼 함수
export const trackAPI = (apiName: string, endpoint?: string): boolean => {
  return apiUsageTracker.track(apiName, endpoint);
};

export const getAPIStats = () => {
  return apiUsageTracker.getDashboardData();
};

export const getAPIReport = () => {
  return apiUsageTracker.generateReport();
};