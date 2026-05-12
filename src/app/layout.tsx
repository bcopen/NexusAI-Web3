import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'NexusAI×Web3 — AI 与 Web3 资讯聚合',
  description: '实时聚合全球顶尖 AI 与 Web3 资讯、行情与深度报道',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh">
      <body>{children}</body>
    </html>
  )
}
