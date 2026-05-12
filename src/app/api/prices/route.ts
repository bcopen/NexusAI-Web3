import { NextResponse } from 'next/server'

const COINS = [
  'bitcoin', 'ethereum', 'solana', 'arbitrum', 'render-token',
  'fetch-ai', 'worldcoin-wld', 'bittensor', 'virtual-protocol', 'akash-network'
]

export const revalidate = 60 // ISR: refresh every 60s

export async function GET() {
  try {
    const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${COINS.join(',')}&order=market_cap_desc&per_page=10&page=1&sparkline=false&price_change_percentage=24h`

    const res = await fetch(url, {
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 60 },
    })

    if (!res.ok) {
      // Return mock data if rate limited
      return NextResponse.json(getMockPrices())
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json(getMockPrices())
  }
}

function getMockPrices() {
  return [
    { id: 'bitcoin', symbol: 'btc', name: 'Bitcoin', current_price: 102430, price_change_percentage_24h: 2.3, market_cap: 2010000000000, total_volume: 38000000000, image: '' },
    { id: 'ethereum', symbol: 'eth', name: 'Ethereum', current_price: 3870, price_change_percentage_24h: 1.8, market_cap: 465000000000, total_volume: 18000000000, image: '' },
    { id: 'solana', symbol: 'sol', name: 'Solana', current_price: 182.5, price_change_percentage_24h: -0.6, market_cap: 86000000000, total_volume: 4200000000, image: '' },
    { id: 'render-token', symbol: 'rndr', name: 'Render', current_price: 8.90, price_change_percentage_24h: 3.72, market_cap: 3400000000, total_volume: 210000000, image: '' },
    { id: 'fetch-ai', symbol: 'fet', name: 'Fetch.ai', current_price: 2.31, price_change_percentage_24h: -1.20, market_cap: 1900000000, total_volume: 98000000, image: '' },
    { id: 'worldcoin-wld', symbol: 'wld', name: 'Worldcoin', current_price: 5.44, price_change_percentage_24h: 7.21, market_cap: 1200000000, total_volume: 320000000, image: '' },
    { id: 'bittensor', symbol: 'tao', name: 'Bittensor', current_price: 482, price_change_percentage_24h: 5.40, market_cap: 3800000000, total_volume: 175000000, image: '' },
    { id: 'virtual-protocol', symbol: 'virtual', name: 'Virtuals', current_price: 3.17, price_change_percentage_24h: 11.8, market_cap: 980000000, total_volume: 290000000, image: '' },
  ]
}
