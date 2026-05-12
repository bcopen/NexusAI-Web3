import { NextResponse } from 'next/server'
import Parser from 'rss-parser'
import { NewsItem } from '@/types'

export const revalidate = 300 // refresh every 5 min

const parser = new Parser({
  timeout: 8000,
  customFields: { item: ['description', 'summary', 'content:encoded'] },
})

const RSS_FEEDS = [
  { url: 'https://techcrunch.com/category/artificial-intelligence/feed/', source: 'TechCrunch', category: 'ai' as const },
  { url: 'https://feeds.feedburner.com/venturebeat/SZYF', source: 'VentureBeat', category: 'ai' as const },
  { url: 'https://hnrss.org/frontpage?q=AI+LLM+GPT+agent&count=15', source: 'HackerNews', category: 'ai' as const },
  { url: 'https://www.coindesk.com/arc/outboundfeeds/rss/', source: 'CoinDesk', category: 'web3' as const },
  { url: 'https://cointelegraph.com/rss', source: 'CoinTelegraph', category: 'web3' as const },
  { url: 'https://thedefiant.io/feed', source: 'The Defiant', category: 'defi' as const },
]

function categorize(title: string, source: string): NewsItem['category'] {
  const t = title.toLowerCase()
  if (/\bagent\b|multi.agent|autonomous/.test(t)) return 'agent'
  if (/defi|yield|liquidity|dex|amm|protocol|tvl/.test(t)) return 'defi'
  if (/\bai\b|gpt|llm|model|openai|anthropic|gemini|claude|llama/.test(t)) return 'ai'
  if (/bitcoin|ethereum|crypto|nft|web3|blockchain|token|dao/.test(t)) return 'web3'
  if (source === 'TechCrunch' || source === 'VentureBeat' || source === 'HackerNews') return 'ai'
  return 'web3'
}

function extractTags(title: string): string[] {
  const tags: string[] = []
  const t = title.toLowerCase()
  if (/openai|gpt/.test(t)) tags.push('OpenAI')
  if (/anthropic|claude/.test(t)) tags.push('Anthropic')
  if (/ethereum|eth/.test(t)) tags.push('Ethereum')
  if (/bitcoin|btc/.test(t)) tags.push('Bitcoin')
  if (/solana|sol/.test(t)) tags.push('Solana')
  if (/defi/.test(t)) tags.push('DeFi')
  if (/agent/.test(t)) tags.push('AI Agent')
  if (/llm|model/.test(t)) tags.push('LLM')
  return tags.slice(0, 3)
}

function stripHtml(html: string): string {
  return html?.replace(/<[^>]*>/g, '').replace(/&[a-z]+;/gi, ' ').trim().slice(0, 180) || ''
}

async function fetchFeed(feed: typeof RSS_FEEDS[0]): Promise<NewsItem[]> {
  try {
    const parsed = await parser.parseURL(feed.url)
    return (parsed.items || []).slice(0, 6).map((item, i) => ({
      id: `${feed.source}-${i}-${Date.now()}`,
      title: item.title || 'Untitled',
      summary: stripHtml(item.contentSnippet || item.summary || item.description || ''),
      url: item.link || '#',
      source: feed.source,
      publishedAt: item.pubDate || new Date().toISOString(),
      category: categorize(item.title || '', feed.source),
      tags: extractTags(item.title || ''),
    }))
  } catch {
    return []
  }
}

export async function GET() {
  try {
    const results = await Promise.allSettled(RSS_FEEDS.map(fetchFeed))
    const allItems = results
      .flatMap(r => r.status === 'fulfilled' ? r.value : [])
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .slice(0, 40)

    if (allItems.length === 0) {
      return NextResponse.json(getMockNews())
    }

    return NextResponse.json(allItems)
  } catch {
    return NextResponse.json(getMockNews())
  }
}

function getMockNews(): NewsItem[] {
  return [
    { id: '1', title: 'GPT-5 Turbo 发布，推理速度提升 3×，API 价格下调 40%', summary: '原生支持 64K 上下文窗口，代码执行效率大幅优化，多模态能力全面升级。', url: 'https://openai.com', source: 'OpenAI Blog', publishedAt: new Date().toISOString(), category: 'ai', tags: ['OpenAI', 'LLM'] },
    { id: '2', title: 'Ethereum ETF 单日净流入 6.8 亿美元创历史新高', summary: 'BlackRock ETHA 领跑，机构配置需求持续强劲，ETH 质押量同步攀升至新高。', url: 'https://coindesk.com', source: 'CoinDesk', publishedAt: new Date(Date.now() - 3600000).toISOString(), category: 'web3', tags: ['Ethereum'] },
    { id: '3', title: 'AI Agent 资管规模突破百亿，Virtuals 生态快速扩张', summary: '多个头部 AI Agent 协议宣布在无人工干预情况下完成复杂跨链套利策略。', url: 'https://theblock.co', source: 'The Block', publishedAt: new Date(Date.now() - 7200000).toISOString(), category: 'agent', tags: ['AI Agent'] },
    { id: '4', title: 'Meta Llama 4 Ultra 全面基准测试首超 GPT-4o', summary: '在代码、数学、多语言任务上均创新高，开源生态迎来历史性时刻。', url: 'https://huggingface.co', source: 'Hugging Face', publishedAt: new Date(Date.now() - 10800000).toISOString(), category: 'ai', tags: ['LLM', 'Anthropic'] },
    { id: '5', title: 'Uniswap V4 上线主网，Hook 机制带来 DeFi 新范式', summary: '开发者可自定义流动性池行为，TVL 在上线 48 小时内突破 20 亿美元。', url: 'https://uniswap.org', source: 'The Defiant', publishedAt: new Date(Date.now() - 14400000).toISOString(), category: 'defi', tags: ['DeFi', 'Ethereum'] },
    { id: '6', title: 'Solana 日活地址首破 500 万，Firedancer 升级后 TPS 峰值超 100K', summary: '应用层繁荣推动链上手续费收入创历史新高，开发者数量同比增长 180%。', url: 'https://messari.io', source: 'Messari', publishedAt: new Date(Date.now() - 18000000).toISOString(), category: 'web3', tags: ['Solana'] },
    { id: '7', title: 'zkTLS 技术突破：Opacity Network 完成 2000 万美元融资', summary: '将允许用户在零知识证明下验证任意 HTTPS 数据，隐私计算新纪元开启。', url: 'https://bankless.com', source: 'Bankless', publishedAt: new Date(Date.now() - 21600000).toISOString(), category: 'web3', tags: ['DeFi'] },
    { id: '8', title: 'Anthropic 完成 40 亿美元 E 轮，估值达 800 亿美元', summary: 'Google 和 Spark Capital 领投，Claude 企业客户数量过去一年增长 5 倍。', url: 'https://anthropic.com', source: 'Reuters', publishedAt: new Date(Date.now() - 25200000).toISOString(), category: 'ai', tags: ['Anthropic', 'LLM'] },
  ]
}
