import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Deal Analyzer AI — Instant Real Estate Deal Scoring',
  description: 'AI-powered real estate deal analysis using Mistral AI. Get instant deal scores, risk assessment, and investment metrics.',
  openGraph: {
    title: 'Deal Analyzer AI',
    description: 'AI-powered real estate deal analysis. Instant scoring, risks, and opportunities.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
