import { NextRequest, NextResponse } from 'next/server'

interface DealInput {
  address?: string
  price: number
  arv?: number
  rent?: number
  repairs?: number
}

function computeMetrics(d: DealInput) {
  const metrics: { label: string; value: string; status: 'good' | 'warning' | 'bad' }[] = []
  let score = 50

  // 70% Rule (for flips)
  if (d.arv && d.repairs) {
    const maxOffer = d.arv * 0.7 - d.repairs
    const pct = d.price / d.arv
    const status = d.price <= maxOffer ? 'good' : d.price <= d.arv * 0.8 - d.repairs ? 'warning' : 'bad'
    metrics.push({ label: '70% Rule Max Offer', value: `$${maxOffer.toLocaleString()}`, status })
    metrics.push({ label: 'Price-to-ARV Ratio', value: `${(pct * 100).toFixed(1)}%`, status: pct <= 0.7 ? 'good' : pct <= 0.8 ? 'warning' : 'bad' })
    score += status === 'good' ? 20 : status === 'warning' ? 5 : -15
  }

  // Cap Rate (for rentals)
  if (d.rent) {
    const annualNOI = d.rent * 12 * 0.6 // 40% expense ratio
    const capRate = (annualNOI / d.price) * 100
    const status = capRate >= 8 ? 'good' : capRate >= 5 ? 'warning' : 'bad'
    metrics.push({ label: 'Cap Rate (est)', value: `${capRate.toFixed(1)}%`, status })
    score += status === 'good' ? 15 : status === 'warning' ? 5 : -10
  }

  // Rent-to-Price (1% rule)
  if (d.rent) {
    const ratio = (d.rent / d.price) * 100
    const status = ratio >= 1 ? 'good' : ratio >= 0.7 ? 'warning' : 'bad'
    metrics.push({ label: '1% Rule', value: `${ratio.toFixed(2)}%`, status })
    score += status === 'good' ? 15 : status === 'warning' ? 5 : -10
  }

  // Cash-on-Cash (25% down)
  if (d.rent) {
    const downPayment = d.price * 0.25 + (d.repairs || 0)
    const monthlyMortgage = (d.price * 0.75) * (0.07 / 12) / (1 - Math.pow(1 + 0.07 / 12, -360))
    const monthlyCashFlow = d.rent * 0.6 - monthlyMortgage
    const annualCashFlow = monthlyCashFlow * 12
    const coc = (annualCashFlow / downPayment) * 100
    const status = coc >= 10 ? 'good' : coc >= 5 ? 'warning' : 'bad'
    metrics.push({ label: 'Cash-on-Cash Return', value: `${coc.toFixed(1)}%`, status })
    metrics.push({ label: 'Monthly Cash Flow', value: `$${monthlyCashFlow.toFixed(0)}`, status: monthlyCashFlow > 200 ? 'good' : monthlyCashFlow > 0 ? 'warning' : 'bad' })
    score += status === 'good' ? 15 : status === 'warning' ? 5 : -10
  }

  // Flip profit
  if (d.arv && d.repairs) {
    const profit = d.arv - d.price - d.repairs - (d.arv * 0.08) // 8% selling costs
    const roi = (profit / (d.price + d.repairs)) * 100
    const status = roi >= 20 ? 'good' : roi >= 10 ? 'warning' : 'bad'
    metrics.push({ label: 'Flip Profit (est)', value: `$${profit.toLocaleString()}`, status })
    metrics.push({ label: 'Flip ROI', value: `${roi.toFixed(1)}%`, status })
    score += status === 'good' ? 15 : status === 'warning' ? 5 : -15
  }

  return { metrics, score: Math.max(0, Math.min(100, score)) }
}

export async function POST(req: NextRequest) {
  try {
    const deal: DealInput = await req.json()
    if (!deal.price) return NextResponse.json({ error: 'Price is required' }, { status: 400 })

    const { metrics, score } = computeMetrics(deal)

    // Build Mistral prompt
    const prompt = `You are an expert real estate investment analyst. Analyze this deal and provide insights.

Property: ${deal.address || 'Not specified'}
Purchase Price: $${deal.price.toLocaleString()}
${deal.arv ? `After Repair Value (ARV): $${deal.arv.toLocaleString()}` : ''}
${deal.rent ? `Monthly Rent: $${deal.rent.toLocaleString()}` : ''}
${deal.repairs ? `Estimated Repairs: $${deal.repairs.toLocaleString()}` : ''}

Computed metrics:
${metrics.map(m => `- ${m.label}: ${m.value} (${m.status})`).join('\n')}
Overall score: ${score}/100

Respond in JSON format only:
{
  "verdict": "one line verdict (e.g., 'Strong Buy', 'Proceed with Caution', 'Pass')",
  "summary": "2-3 sentence summary of the deal",
  "risks": ["risk 1", "risk 2", "risk 3"],
  "opportunities": ["opportunity 1", "opportunity 2", "opportunity 3"]
}`

    let verdict = score >= 75 ? 'Strong Buy' : score >= 60 ? 'Good Deal' : score >= 45 ? 'Proceed with Caution' : 'Pass'
    let summary = `This property scores ${score}/100 based on standard investment metrics.`
    let risks = ['Market conditions may affect projected values', 'Repair estimates may be understated', 'Vacancy risk not fully modeled']
    let opportunities = ['Value-add potential through renovations', 'Rental income provides cash flow stability', 'Appreciation in growing markets']

    // Try Mistral API
    const apiKey = process.env.MISTRAL_API_KEY
    if (apiKey) {
      try {
        const res = await fetch('https://api.mistral.ai/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
          body: JSON.stringify({
            model: 'mistral-large-latest',
            messages: [{ role: 'user', content: prompt }],
            response_format: { type: 'json_object' },
            temperature: 0.3,
          })
        })
        if (res.ok) {
          const data = await res.json()
          const parsed = JSON.parse(data.choices[0].message.content)
          verdict = parsed.verdict || verdict
          summary = parsed.summary || summary
          risks = parsed.risks || risks
          opportunities = parsed.opportunities || opportunities
        }
      } catch (e) {
        console.error('Mistral API error (using fallback):', e)
      }
    }

    return NextResponse.json({
      score,
      verdict,
      summary,
      breakdown: metrics,
      risks,
      opportunities,
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Analysis failed' }, { status: 500 })
  }
}
