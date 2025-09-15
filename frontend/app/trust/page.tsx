'use client'

import React from 'react'
import dynamic from 'next/dynamic'

const TrustModule = dynamic(
  () => import('../../components/trust/TrustModule'),
  { ssr: false }
)

export default function TrustPage() {
  return <TrustModule />
}