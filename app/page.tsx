'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

interface Analysis {
  score: number
  verdict: string
  breakdown: { label: string; value: string; status: 'good' | 'warning' | 'bad' }[]
  summary: string
  risks: string[]
  opportunities: string[]
}

export default function Home() {
  const [address, setAddress] = useState('')
  const [price, setPrice] = useState('')
  const [arv, setArv] = useState('')
  const [rent, setRent] = useState('')
  const [repairs, setRepairs] = useState('')
  const [loading, setLoading] = useState(false)
  const [analysis, setAnalysis] = useState<Analysis | null>(null)
  const [error, setError] = useState('')

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

  const scoreColor = (s: number) => s >= 75 ? 'text-green-400' : s >= 50 ? 'text-yellow-400' : 'text-red-400'
  const statusIcon = (s: string) => s === 'good' ? '✅' : s === 'warning' ? '⚠️' : '❌'

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-indigo-950 text-white">
      {/* Hero */}
      <div className="max-w-4xl mx-auto px-4 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="inline-block px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-sm mb-4">
            Powered by Mistral AI
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-white via-indigo-200 to-indigo-400 bg-clip-text text-transparent">
            Deal Analyzer AI
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Instant AI-powered real estate deal analysis. Enter a property, get a score, risks, and opportunities in seconds.
          </p>
        </motion.div>

        {/* Input Form */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-400 mb-1">Property Address</label>
              <input value={address} onChange={e => setAddress(e.target.value)} placeholder="123 Main St, Orlando, FL 32801"
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Purchase Price *</label>
              <input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="250000"
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">After Repair Value (ARV)</label>
              <input type="number" value={arv} onChange={e => setArv(e.target.value)} placeholder="350000"
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Monthly Rent</label>
              <input type="number" value={rent} onChange={e => setRent(e.target.value)} placeholder="2000"
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Estimated Repairs</label>
              <input type="number" value={repairs} onChange={e => setRepairs(e.target.value)} placeholder="40000"
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500" />
            </div>
          </div>
          {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
          <button onClick={analyze} disabled={loading}
            className="w-full py-3 rounded-xl font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 transition-all">
            {loading ? 'Analyzing with Mistral AI...' : '🔍 Analyze Deal'}
          </button>
        </motion.div>

        {/* Results */}
        {analysis && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Score */}
            <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-6 text-center">
              <div className={`text-7xl font-bold ${scoreColor(analysis.score)}`}>{analysis.score}</div>
              <div className="text-2xl font-semibold mt-2">{analysis.verdict}</div>
              <p className="text-gray-400 mt-2">{analysis.summary}</p>
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
          </motion.div>
        )}

        {/* Features */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: '🧠', title: 'AI-Powered', desc: 'Mistral Large analyzes deals using real estate investment principles' },
            { icon: '⚡', title: 'Instant Results', desc: 'Get a deal score, breakdown, risks and opportunities in seconds' },
            { icon: '📈', title: 'Investment Ready', desc: 'Cap rate, cash-on-cash, 70% rule, and rental yield analysis' },
          ].map((f, i) => (
            <div key={i} className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-5 text-center">
              <div className="text-3xl mb-2">{f.icon}</div>
              <h3 className="font-semibold mb-1">{f.title}</h3>
              <p className="text-sm text-gray-400">{f.desc}</p>
            </div>
          ))}
        </div>

        <footer className="text-center text-gray-500 text-sm mt-16 pb-8">
          Built for the Mistral AI Worldwide Hackathon 2026 • Powered by Mistral Large
        </footer>
      </div>
    </div>
  )
}
