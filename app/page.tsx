'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'

interface Analysis {
  score: number
  verdict: string
  breakdown: { label: string; value: string; status: 'good' | 'warning' | 'bad' }[]
  summary: string
  risks: string[]
  opportunities: string[]
}

function DealAnalyzerInner() {
  const searchParams = useSearchParams()
  const [address, setAddress] = useState('')
  const [price, setPrice] = useState('')
  const [arv, setArv] = useState('')
  const [rent, setRent] = useState('')
  const [repairs, setRepairs] = useState('')
  const [loading, setLoading] = useState(false)
  const [analysis, setAnalysis] = useState<Analysis | null>(null)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  // Pre-fill from URL params (for shared links)
  useEffect(() => {
    if (searchParams.get('price')) setPrice(searchParams.get('price') || '')
    if (searchParams.get('arv')) setArv(searchParams.get('arv') || '')
    if (searchParams.get('rent')) setRent(searchParams.get('rent') || '')
    if (searchParams.get('repairs')) setRepairs(searchParams.get('repairs') || '')
    if (searchParams.get('address')) setAddress(decodeURIComponent(searchParams.get('address') || ''))
  }, [searchParams])

  const analyze = async () => {
    if (!price) { setError('Purchase price is required'); return }
    setLoading(true); setError(''); setAnalysis(null)
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, price: +price, arv: +arv || undefined, rent: +rent || undefined, repairs: +repairs || undefined })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Analysis failed')
      setAnalysis(data)
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  const shareLink = () => {
    const params = new URLSearchParams()
    if (address) params.set('address', encodeURIComponent(address))
    if (price) params.set('price', price)
    if (arv) params.set('arv', arv)
    if (rent) params.set('rent', rent)
    if (repairs) params.set('repairs', repairs)
    const url = `${window.location.origin}?${params.toString()}`
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const scoreColor = (s: number) => s >= 75 ? 'text-green-400' : s >= 50 ? 'text-yellow-400' : 'text-red-400'
  const scoreBg = (s: number) => s >= 75 ? 'border-green-500/30 bg-green-950/20' : s >= 50 ? 'border-yellow-500/30 bg-yellow-950/20' : 'border-red-500/30 bg-red-950/20'
  const statusIcon = (s: string) => s === 'good' ? '✅' : s === 'warning' ? '⚠️' : '❌'

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-indigo-950 text-white">
      <div className="max-w-4xl mx-auto px-4 py-16">
        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-sm mb-4 border border-indigo-500/30">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
            Powered by Mistral AI
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-white via-indigo-200 to-indigo-400 bg-clip-text text-transparent">
            Deal Analyzer AI
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Instant AI-powered real estate deal analysis. Get a score, risks, and investment verdict in seconds.
          </p>
        </motion.div>

        {/* Input Form */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-400 mb-1">Property Address</label>
              <input value={address} onChange={e => setAddress(e.target.value)} placeholder="123 Main St, Orlando, FL 32801"
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Purchase Price *</label>
              <input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="250000"
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">After Repair Value (ARV)</label>
              <input type="number" value={arv} onChange={e => setArv(e.target.value)} placeholder="350000"
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Monthly Rent</label>
              <input type="number" value={rent} onChange={e => setRent(e.target.value)} placeholder="2000"
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Estimated Repairs</label>
              <input type="number" value={repairs} onChange={e => setRepairs(e.target.value)} placeholder="40000"
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors" />
            </div>
          </div>
          {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
          <div className="flex gap-3">
            <button onClick={analyze} disabled={loading}
              className="flex-1 py-3 rounded-xl font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 transition-all">
              {loading ? '⏳ Analyzing with Mistral AI...' : '🔍 Analyze Deal'}
            </button>
            <button onClick={shareLink}
              className="px-4 py-3 rounded-xl border border-gray-600 hover:border-indigo-500 text-gray-300 hover:text-white transition-all text-sm">
              {copied ? '✅ Copied!' : '🔗 Share'}
            </button>
          </div>
        </motion.div>

        {/* Results */}
        {analysis && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Score */}
            <div className={`backdrop-blur border rounded-2xl p-8 text-center ${scoreBg(analysis.score)}`}>
              <div className={`text-8xl font-bold ${scoreColor(analysis.score)}`}>{analysis.score}</div>
              <div className="text-gray-400 text-sm mt-1">out of 100</div>
              <div className="text-2xl font-semibold mt-3">{analysis.verdict}</div>
              <p className="text-gray-300 mt-2 max-w-xl mx-auto">{analysis.summary}</p>
              <button onClick={shareLink} className="mt-4 text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
                {copied ? '✅ Link copied to clipboard!' : '🔗 Share this analysis'}
              </button>
            </div>

            {/* Breakdown */}
            <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-4">📊 Deal Breakdown</h3>
              <div className="space-y-3">
                {analysis.breakdown.map((item, i) => (
                  <div key={i} className="flex justify-between items-center py-2 border-b border-gray-700/50 last:border-0">
                    <span className="text-gray-300">{item.label}</span>
                    <span className="font-mono">{statusIcon(item.status)} {item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Risks & Opportunities */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-red-950/30 border border-red-900/50 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-red-300 mb-3">⚠️ Risks</h3>
                <ul className="space-y-2">{analysis.risks.map((r, i) => <li key={i} className="text-gray-300 text-sm">• {r}</li>)}</ul>
              </div>
              <div className="bg-green-950/30 border border-green-900/50 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-green-300 mb-3">💡 Opportunities</h3>
                <ul className="space-y-2">{analysis.opportunities.map((o, i) => <li key={i} className="text-gray-300 text-sm">• {o}</li>)}</ul>
              </div>
            </div>

            {/* CTA */}
            <div className="bg-indigo-950/40 border border-indigo-800/50 rounded-2xl p-6 text-center">
              <p className="text-indigo-200 font-semibold mb-2">Want deal analysis built into your CRM?</p>
              <p className="text-gray-400 text-sm mb-4">Repal CRM includes Deal Analyzer + 40+ agent tools for $9.99/month</p>
              <a href="https://realestate-pal.com" target="_blank" rel="noopener noreferrer"
                className="inline-block px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-semibold text-sm transition-colors">
                Try Repal Free →
              </a>
            </div>
          </motion.div>
        )}

        {/* Features */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: '🧠', title: 'Mistral AI Analysis', desc: 'Mistral Large identifies risks and opportunities a spreadsheet would miss' },
            { icon: '⚡', title: 'Instant Results', desc: 'Get a deal score, breakdown, risks and opportunities in under 5 seconds' },
            { icon: '🔗', title: 'Shareable Links', desc: 'Share deals with partners, investors, or clients via URL — no login required' },
          ].map((f, i) => (
            <div key={i} className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-5 text-center">
              <div className="text-3xl mb-2">{f.icon}</div>
              <h3 className="font-semibold mb-1">{f.title}</h3>
              <p className="text-sm text-gray-400">{f.desc}</p>
            </div>
          ))}
        </div>

        <footer className="text-center text-gray-500 text-sm mt-16 pb-8">
          Built for the <strong className="text-gray-400">Mistral AI Worldwide Hackathon 2026</strong> • Powered by Mistral Large<br />
          <a href="https://realestate-pal.com" className="text-indigo-400 hover:text-indigo-300">realestate-pal.com</a>
        </footer>
      </div>
    </div>
  )
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-950 flex items-center justify-center text-white">Loading...</div>}>
      <DealAnalyzerInner />
    </Suspense>
  )
}
