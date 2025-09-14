'use client';

import { useEffect } from 'react';
// 정적 import로 변경
import '@/lib/clientSafeNumber';

export default function ClientInit() {
  useEffect(() => {
    // 클라이언트 사이드 초기화 완료 로그
    if (typeof window !== 'undefined') {
      console.log('[ClientInit] Client-side initialization completed');
    }
  }, []);
  
  return null;
}