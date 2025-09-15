'use client'

import React from 'react'
import dynamic from 'next/dynamic'

const SubscriptionModule = dynamic(
  () => import('../../components/subscription/SubscriptionModule'),
  { ssr: false }
)

export default function SubscriptionPage() {
  return <SubscriptionModule />
}