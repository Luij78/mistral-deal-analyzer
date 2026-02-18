# Deal Analyzer AI 🏠

**Mistral AI Worldwide Hackathon 2026 Submission**

> Instant AI-powered real estate deal analysis. Built with Mistral Large.

🔗 **Live Demo:** https://mistral-deal-analyzer.vercel.app  
📊 **GitHub:** https://github.com/Luij78/mistral-deal-analyzer

---

## What It Does

Real estate agents and investors analyze deals by typing in numbers and hoping the math works. It's slow, error-prone, and misses nuanced factors.

Deal Analyzer AI changes that. Enter a property → get a **0-100 deal score**, **plain-English risk analysis**, and **investment verdict** in under 5 seconds.

**Powered by Mistral Large** for the AI analysis layer.

---

## Features

### 🧮 Financial Analysis Engine
- **70% Rule** (flip investing) — Calculates max offer price
- **Cap Rate** (rental investing) — Estimates NOI vs purchase price
- **1% Rule** — Quick rental viability check
- **Cash-on-Cash Return** — Real return after mortgage payment
- **Monthly Cash Flow** — Net income after expenses
- **Flip ROI** — Total profit as percentage of investment

### 🤖 Mistral AI Layer
After computing metrics, the deal is sent to **Mistral Large** for:
- **Risk identification** (market risks, structural issues, overpaying indicators)
- **Opportunity analysis** (upside potential, value-add strategies)
- **Investment verdict** (STRONG BUY / GOOD DEAL / MARGINAL / AVOID)
- **Plain English explanation** of what the numbers mean

### 🎨 Premium UI
- Dark gradient design built for serious investors
- Animated score display (0-100 visual indicator)
- Color-coded breakdown (✅ Good, ⚠️ Warning, ❌ Bad)
- Mobile-responsive

---

## Mistral AI Integration

```typescript
// Sends deal data to Mistral Large via API
const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: 'mistral-large-latest',
    messages: [{ role: 'user', content: dealAnalysisPrompt }],
    temperature: 0.3,
    max_tokens: 600,
  })
})
```

The AI returns structured JSON with `verdict`, `summary`, `risks[]`, and `opportunities[]`.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| AI Model | Mistral Large (via Mistral API) |
| Styling | Tailwind CSS + Framer Motion |
| Deployment | Vercel |
| Language | TypeScript |

---

## Local Development

```bash
git clone https://github.com/Luij78/mistral-deal-analyzer
cd mistral-deal-analyzer
npm install

# Add your Mistral API key
echo "MISTRAL_API_KEY=your_key_here" > .env.local

npm run dev
# Open http://localhost:3000
```

**Note:** The app works WITHOUT a Mistral API key — it falls back to rule-based local analysis. Adding the key enables the full AI narrative.

---

## Example Analysis

**Input:**
- Purchase Price: $185,000
- ARV: $265,000
- Rent: $1,800/mo
- Repairs: $35,000

**Output:**
- **Deal Score: 78/100**
- 70% Rule: ✅ Max offer $150,500 (under budget)
- Cap Rate: ✅ 7.8%
- 1% Rule: ✅ 0.97%
- Flip Profit: ✅ $30,800 (17.2% ROI)
- **Mistral verdict:** "GOOD DEAL — Strong fundamentals for either a rental or flip strategy. Primary risk is the renovation timeline estimate..."

---

## Business Model

This tool validates a larger product: **Repal CRM** (realestate-pal.com)
- $9.99/mo for RE agents who want AI-powered deal analysis built into their CRM
- Deal Analyzer is the standalone lead generator

---

## About the Builder

Built by **Luis Garcia** — Army veteran, Florida real estate agent, and AI builder.

- X: @luij78
- Repal CRM: realestate-pal.com
- AlphaScanner: alpha-scanner-theta.vercel.app

---

## Hackathon Notes

- Built in one night (Feb 17-18, 2026) for Mistral AI Worldwide Hackathon
- Model: Mistral Large (mistral-large-latest)
- Fallback: Local computation when API key not set
- Live demo fully functional at mistral-deal-analyzer.vercel.app
