'use client'

import React from 'react'
import dynamic from 'next/dynamic'

const PremiumUIModule = dynamic(
  () => import('../../components/premium-ui/PremiumUIModule'),
  { ssr: false }
)

export default function PremiumUIPage() {
  return <PremiumUIModule />
}