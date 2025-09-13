'use client';

import { useEffect } from 'react';

export default function ClientInit() {
  useEffect(() => {
    // 클라이언트 사이드에서 안전한 숫자 처리 초기화
    if (typeof window !== 'undefined') {
      import('@/lib/clientSafeNumber').then(() => {
        }).catch(err => {
        console.error('[ClientInit] Failed to load clientSafeNumber:', err);
      });
    }
  }, []);
  
  return null;
}