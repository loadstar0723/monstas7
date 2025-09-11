'use client'

import dynamic from 'next/dynamic'
import { ComponentType } from 'react'

// 아이콘을 동적으로 로드하는 헬퍼 함수
export const loadIcon = (iconName: string): ComponentType<any> => {
  // react-icons 패키지별로 분리
  if (iconName.startsWith('Fa')) {
    return dynamic(() => 
      import('react-icons/fa').then((mod) => ({ default: mod[iconName] as ComponentType<any> })),
      { ssr: false }
    )
  } else if (iconName.startsWith('Bi')) {
    return dynamic(() => 
      import('react-icons/bi').then((mod) => ({ default: mod[iconName] as ComponentType<any> })),
      { ssr: false }
    )
  } else if (iconName.startsWith('Md')) {
    return dynamic(() => 
      import('react-icons/md').then((mod) => ({ default: mod[iconName] as ComponentType<any> })),
      { ssr: false }
    )
  } else if (iconName.startsWith('Io')) {
    return dynamic(() => 
      import('react-icons/io5').then((mod) => ({ default: mod[iconName] as ComponentType<any> })),
      { ssr: false }
    )
  } else if (iconName.startsWith('Ai')) {
    return dynamic(() => 
      import('react-icons/ai').then((mod) => ({ default: mod[iconName] as ComponentType<any> })),
      { ssr: false }
    )
  }
  
  // 기본값
  return () => <span>📄</span>
}

// 자주 사용하는 아이콘만 미리 import
export { FaHome, FaChartLine, FaRobot, FaTelegram } from 'react-icons/fa'