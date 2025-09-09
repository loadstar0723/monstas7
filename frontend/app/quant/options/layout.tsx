import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '옵션 전략 분석 - MONSTA',
  description: '암호화폐 옵션 전문 분석 및 전략 수립 플랫폼',
}

export default function OptionsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}