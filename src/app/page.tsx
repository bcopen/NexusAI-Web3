'use client'

import { useState, useEffect, useMemo } from 'react'
import useSWR from 'swr'
import { usePrices } from '@/hooks/usePrices'
import { useBookmarks } from '@/hooks/useBookmarks'
import { NewsItem, FilterCategory } from '@/types'

const fetcher = (url: string) => fetch(url).then(r => r.json())

const CATEGORY_LABELS: Record<FilterCategory, string> = {
  all: '全部',
  ai: '人工智能',
  web3: 'Web3',
  defi: 'DeFi',
  agent: 'AI Agent',
}

const CATEGORY_COLORS: Record<string, string> = {
  ai: '#00E5A0',
  web3: '#7B5CFA',
  defi: '#378ADD',
  agent: '#FF5C5C',
  general: '#666A7A',
}

function formatPrice(n: number): string {
  if (n >= 1000) return `$${n.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
  if (n >= 1) return `$${n.toFixed(2)}`
  return `$${n.toFixed(4)}`
}

function timeAgo(dateStr: string): string {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000
  if (diff < 60) return '刚刚'
  if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`
  if (diff < 86400) return `${Math.floor(diff / 3600)}小时前`
  return `${Math.floor(diff / 86400)}天前`
}

// ─── Ticker ───────────────────────────────────────────────────────────────────
function Ticker() {
  const { prices, isLoading } = usePrices()
  const [lastUpdate, setLastUpdate] = useState('')

  useEffect(() => {
    const update = () => setLastUpdate(new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
    update()
    const t = setInterval(update, 1000)
    return () => clearInterval(t)
  }, [])

  const displayPrices = prices.length > 0 ? [...prices, ...prices] : []

  return (
    <div style={{
      background: 'var(--surface)',
      borderRadius: 10,
      padding: '10px 16px',
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      marginBottom: 28,
      overflow: 'hidden',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
        <span style={{
          width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)',
          display: 'inline-block',
          animation: 'pulse 2s ease-in-out infinite',
        }} />
        <span style={{ fontFamily: 'DM Mono', fontSize: 10, color: 'var(--accent)', letterSpacing: 1 }}>
          LIVE
        </span>
        {lastUpdate && (
          <span style={{ fontFamily: 'DM Mono', fontSize: 10, color: 'var(--muted)' }}>{lastUpdate}</span>
        )}
      </div>

      <div style={{ overflow: 'hidden', flex: 1 }}>
        {isLoading ? (
          <span style={{ fontFamily: 'DM Mono', fontSize: 12, color: 'var(--muted)' }}>加载行情中…</span>
        ) : (
          <div style={{
            display: 'flex', gap: 36,
            animation: 'ticker 30s linear infinite',
            whiteSpace: 'nowrap',
          }}>
            {displayPrices.map((coin, i) => (
              <span key={i} style={{ fontFamily: 'DM Mono', fontSize: 12, display: 'inline-flex', gap: 6 }}>
                <span style={{ color: 'var(--text)', fontWeight: 500 }}>{coin.symbol?.toUpperCase()}</span>
                <span style={{ color: 'var(--muted)' }}>{formatPrice(coin.current_price)}</span>
                <span style={{ color: coin.price_change_percentage_24h >= 0 ? 'var(--accent)' : 'var(--accent3)' }}>
                  {coin.price_change_percentage_24h >= 0 ? '+' : ''}{coin.price_change_percentage_24h?.toFixed(2)}%
                </span>
              </span>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes ticker { from { transform: translateX(0) } to { transform: translateX(-50%) } }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(.8)} }
      `}</style>
    </div>
  )
}

// ─── Search Bar ───────────────────────────────────────────────────────────────
function SearchBar({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ position: 'relative', marginBottom: 16 }}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2"
        style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
        <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
      </svg>
      <input
        type="text"
        placeholder="搜索资讯标题、来源、标签…"
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          width: '100%',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 10,
          padding: '11px 14px 11px 42px',
          color: 'var(--text)',
          fontSize: 14,
          fontFamily: 'Syne, sans-serif',
          outline: 'none',
          transition: 'border-color .2s',
        }}
        onFocus={e => (e.target.style.borderColor = 'var(--accent2)')}
        onBlur={e => (e.target.style.borderColor = 'var(--border)')}
      />
      {value && (
        <button onClick={() => onChange('')} style={{
          position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
          background: 'none', border: 'none', color: 'var(--muted)', fontSize: 18, lineHeight: 1,
        }}>×</button>
      )}
    </div>
  )
}

// ─── Filter Tabs ──────────────────────────────────────────────────────────────
function FilterTabs({ active, onChange, counts }: {
  active: FilterCategory
  onChange: (c: FilterCategory) => void
  counts: Record<string, number>
}) {
  return (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 24 }}>
      {(Object.keys(CATEGORY_LABELS) as FilterCategory[]).map(cat => (
        <button key={cat} onClick={() => onChange(cat)} style={{
          fontFamily: 'DM Mono', fontSize: 11, padding: '6px 14px',
          borderRadius: 20, border: '1px solid',
          borderColor: active === cat ? (cat === 'all' ? 'var(--accent)' : CATEGORY_COLORS[cat] || 'var(--accent)') : 'var(--border)',
          background: active === cat ? (cat === 'all' ? 'rgba(0,229,160,.12)' : `${CATEGORY_COLORS[cat]}18`) : 'transparent',
          color: active === cat ? (cat === 'all' ? 'var(--accent)' : CATEGORY_COLORS[cat] || 'var(--accent)') : 'var(--muted)',
          transition: 'all .2s', fontWeight: active === cat ? 500 : 400,
          display: 'flex', alignItems: 'center', gap: 5,
        }}>
          {CATEGORY_LABELS[cat]}
          {counts[cat] != null && (
            <span style={{ opacity: .6, fontSize: 10 }}>{counts[cat]}</span>
          )}
        </button>
      ))}
    </div>
  )
}

// ─── News Card ────────────────────────────────────────────────────────────────
function NewsCard({ item, isBookmarked, onToggle }: {
  item: NewsItem
  isBookmarked: boolean
  onToggle: () => void
}) {
  const color = CATEGORY_COLORS[item.category] || 'var(--muted)'

  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderLeft: `2px solid ${color}`,
      borderRadius: 12,
      padding: 20,
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      transition: 'all .2s',
      cursor: 'pointer',
    }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.background = 'var(--surface2)'
        ;(e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border-hover)'
        ;(e.currentTarget as HTMLDivElement).style.borderLeftColor = color
        ;(e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.background = 'var(--surface)'
        ;(e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)'
        ;(e.currentTarget as HTMLDivElement).style.borderLeftColor = color
        ;(e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{
            fontFamily: 'DM Mono', fontSize: 10, padding: '3px 8px', borderRadius: 4,
            background: `${color}18`, color, fontWeight: 500,
          }}>
            {CATEGORY_LABELS[item.category] || item.category}
          </span>
          {item.tags.map(tag => (
            <span key={tag} style={{
              fontFamily: 'DM Mono', fontSize: 10, padding: '3px 7px', borderRadius: 4,
              background: 'var(--surface2)', color: 'var(--muted)',
            }}>
              {tag}
            </span>
          ))}
        </div>
        <button
          onClick={e => { e.stopPropagation(); onToggle() }}
          title={isBookmarked ? '取消收藏' : '收藏'}
          style={{
            background: 'none', border: 'none', padding: 4, borderRadius: 6,
            color: isBookmarked ? '#FFD700' : 'var(--muted)',
            fontSize: 16, lineHeight: 1, transition: 'color .2s',
            flexShrink: 0,
          }}
          onMouseEnter={e => (e.currentTarget.style.color = '#FFD700')}
          onMouseLeave={e => (e.currentTarget.style.color = isBookmarked ? '#FFD700' : 'var(--muted)')}
        >
          {isBookmarked ? '★' : '☆'}
        </button>
      </div>

      <a href={item.url} target="_blank" rel="noopener noreferrer"
        onClick={e => e.stopPropagation()}
        style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.45, color: 'var(--text)' }}>
        {item.title}
      </a>

      {item.summary && (
        <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.6, }}>
          {item.summary.slice(0, 140)}{item.summary.length > 140 ? '…' : ''}
        </p>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8, borderTop: '1px solid var(--border)' }}>
        <span style={{ fontFamily: 'DM Mono', fontSize: 10, color: 'var(--muted)' }}>{item.source}</span>
        <span style={{ fontFamily: 'DM Mono', fontSize: 10, color: 'var(--muted2)' }}>{timeAgo(item.publishedAt)}</span>
      </div>
    </div>
  )
}

// ─── Price Panel ──────────────────────────────────────────────────────────────
function PricePanel() {
  const { prices, isLoading } = usePrices()
  const aiTokenIds = ['render-token', 'fetch-ai', 'worldcoin-wld', 'bittensor', 'virtual-protocol', 'akash-network']
  const aiPrices = prices.filter(p => aiTokenIds.includes(p.id))

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
      <div style={{ fontFamily: 'DM Mono', fontSize: 10, letterSpacing: 1.5, color: 'var(--muted)', marginBottom: 16, textTransform: 'uppercase' }}>
        AI Token 行情
      </div>
      {isLoading ? (
        <div style={{ fontFamily: 'DM Mono', fontSize: 12, color: 'var(--muted)' }}>加载中…</div>
      ) : (
        (aiPrices.length > 0 ? aiPrices : prices.slice(0, 6)).map(coin => (
          <div key={coin.id} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '10px 0', borderBottom: '1px solid var(--border)',
          }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700 }}>{coin.name}</div>
              <div style={{ fontFamily: 'DM Mono', fontSize: 10, color: 'var(--muted)', marginTop: 2 }}>
                {coin.symbol?.toUpperCase()}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: 'DM Mono', fontSize: 13, fontWeight: 500 }}>
                {formatPrice(coin.current_price)}
              </div>
              <div style={{
                fontFamily: 'DM Mono', fontSize: 10, marginTop: 2,
                color: coin.price_change_percentage_24h >= 0 ? 'var(--accent)' : 'var(--accent3)',
              }}>
                {coin.price_change_percentage_24h >= 0 ? '+' : ''}{coin.price_change_percentage_24h?.toFixed(2)}%
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Home() {
  const [filter, setFilter] = useState<FilterCategory>('all')
  const [search, setSearch] = useState('')
  const [showBookmarks, setShowBookmarks] = useState(false)
  const [visibleCount, setVisibleCount] = useState(12)

  const { data: news = [], isLoading: newsLoading } = useSWR<NewsItem[]>('/api/news', fetcher, {
    refreshInterval: 300000,
    revalidateOnFocus: false,
  })

  const { bookmarks, toggle, isBookmarked, mounted } = useBookmarks()

  const filteredNews = useMemo(() => {
    let items = news
    if (showBookmarks) items = items.filter(n => bookmarks.includes(n.id))
    if (filter !== 'all') items = items.filter(n => n.category === filter)
    if (search.trim()) {
      const q = search.toLowerCase()
      items = items.filter(n =>
        n.title.toLowerCase().includes(q) ||
        n.source.toLowerCase().includes(q) ||
        n.tags.some(t => t.toLowerCase().includes(q)) ||
        n.summary.toLowerCase().includes(q)
      )
    }
    return items
  }, [news, filter, search, showBookmarks, bookmarks])

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: news.length }
    news.forEach(n => { c[n.category] = (c[n.category] || 0) + 1 })
    return c
  }, [news])

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px 60px' }}>
      {/* NAV */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '20px 0 24px', borderBottom: '1px solid var(--border)', marginBottom: 28,
        flexWrap: 'wrap', gap: 12,
      }}>
        <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.5px' }}>
          Nexus<span style={{ color: 'var(--accent)' }}>AI</span>
          <span style={{ color: 'var(--accent2)' }}>×</span>Web3
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {mounted && (
            <button onClick={() => setShowBookmarks(v => !v)} style={{
              fontFamily: 'DM Mono', fontSize: 11, padding: '6px 14px',
              borderRadius: 20, border: '1px solid',
              borderColor: showBookmarks ? '#FFD700' : 'var(--border)',
              background: showBookmarks ? 'rgba(255,215,0,.1)' : 'transparent',
              color: showBookmarks ? '#FFD700' : 'var(--muted)',
              transition: 'all .2s',
            }}>
              ★ 收藏 {bookmarks.length > 0 && `(${bookmarks.length})`}
            </button>
          )}
          <a href="https://github.com" target="_blank" rel="noopener noreferrer"
            style={{ fontFamily: 'DM Mono', fontSize: 11, color: 'var(--muted)' }}>
            GitHub →
          </a>
        </div>
      </nav>

      {/* TICKER */}
      <Ticker />

      {/* LAYOUT */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 24, alignItems: 'start' }}>

        {/* LEFT: News */}
        <div>
          <SearchBar value={search} onChange={v => { setSearch(v); setVisibleCount(12) }} />
          <FilterTabs active={filter} onChange={c => { setFilter(c); setVisibleCount(12) }} counts={counts} />

          {/* Result count */}
          {(search || filter !== 'all' || showBookmarks) && (
            <div style={{ fontFamily: 'DM Mono', fontSize: 11, color: 'var(--muted)', marginBottom: 16 }}>
              {showBookmarks ? '★ 我的收藏 · ' : ''}
              找到 {filteredNews.length} 条结果
              {search && <> · "<span style={{ color: 'var(--text)' }}>{search}</span>"</>}
            </div>
          )}

          {/* Cards grid */}
          {newsLoading ? (
            <div style={{ display: 'grid', gap: 14 }}>
              {[...Array(6)].map((_, i) => (
                <div key={i} style={{
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  borderRadius: 12, height: 130,
                  animation: 'shimmer 1.5s ease-in-out infinite',
                }} />
              ))}
            </div>
          ) : filteredNews.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--muted)' }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>
                {showBookmarks ? '★' : '◯'}
              </div>
              <div style={{ fontFamily: 'DM Mono', fontSize: 13 }}>
                {showBookmarks ? '还没有收藏的文章' : '没有找到相关资讯'}
              </div>
            </div>
          ) : (
            <>
              <div style={{ display: 'grid', gap: 14 }}>
                {filteredNews.slice(0, visibleCount).map(item => (
                  <NewsCard
                    key={item.id}
                    item={item}
                    isBookmarked={mounted && isBookmarked(item.id)}
                    onToggle={() => toggle(item.id)}
                  />
                ))}
              </div>
              {visibleCount < filteredNews.length && (
                <button onClick={() => setVisibleCount(v => v + 12)} style={{
                  width: '100%', marginTop: 16, padding: '12px 0',
                  fontFamily: 'DM Mono', fontSize: 11, letterSpacing: 1,
                  background: 'transparent', border: '1px solid var(--border)',
                  borderRadius: 8, color: 'var(--muted)', transition: 'all .2s',
                }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--accent)'
                    ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--accent)'
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)'
                    ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--muted)'
                  }}
                >
                  — 加载更多 ({filteredNews.length - visibleCount} 条) —
                </button>
              )}
            </>
          )}
        </div>

        {/* RIGHT: Price panel */}
        <div style={{ position: 'sticky', top: 24 }}>
          <PricePanel />
          <div style={{
            marginTop: 16, background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 12, padding: 16,
          }}>
            <div style={{ fontFamily: 'DM Mono', fontSize: 10, letterSpacing: 1.5, color: 'var(--muted)', marginBottom: 12, textTransform: 'uppercase' }}>
              数据来源
            </div>
            {['CoinGecko · 行情', 'CoinDesk · Web3', 'TechCrunch · AI', 'HackerNews · 开发者', 'The Defiant · DeFi'].map(s => (
              <div key={s} style={{ fontFamily: 'DM Mono', fontSize: 11, color: 'var(--muted)', padding: '5px 0', borderBottom: '1px solid var(--border)' }}>
                {s}
              </div>
            ))}
            <div style={{ fontFamily: 'DM Mono', fontSize: 10, color: 'var(--muted2)', marginTop: 10 }}>
              每 60s 刷新行情 · 每 5min 更新资讯
            </div>
          </div>
        </div>

      </div>

      <style>{`
        @keyframes shimmer {
          0%,100% { opacity:.4 } 50% { opacity:.7 }
        }
        @media (max-width: 768px) {
          .layout-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
