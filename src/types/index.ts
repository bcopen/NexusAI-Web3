export interface CoinPrice {
  id: string
  symbol: string
  name: string
  current_price: number
  price_change_percentage_24h: number
  market_cap: number
  total_volume: number
  image: string
}

export interface NewsItem {
  id: string
  title: string
  summary: string
  url: string
  source: string
  publishedAt: string
  category: 'ai' | 'web3' | 'defi' | 'agent' | 'general'
  tags: string[]
}

export type FilterCategory = 'all' | 'ai' | 'web3' | 'defi' | 'agent'
