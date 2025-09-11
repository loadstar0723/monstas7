'use client';

import { useEffect } from 'react';

export default function ClientInit() {
  useEffect(() => {
    // 클라이언트 사이드에서 안전한 숫자 처리 초기화
    import('@/lib/clientSafeNumber').then(() => {
      console.log('[ClientInit] Safe number handling initialized');
    });
  }, []);
  
  return null;
}