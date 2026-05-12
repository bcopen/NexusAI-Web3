# NexusAI×Web3 资讯聚合站

实时聚合全球顶尖 AI 与 Web3 资讯、行情与深度报道。

## 功能

- **实时行情跑马灯**：CoinGecko API，每 60 秒自动刷新
- **RSS 资讯聚合**：TechCrunch、CoinDesk、HackerNews 等，每 5 分钟更新
- **分类筛选**：全部 / AI / Web3 / DeFi / AI Agent
- **全文搜索**：标题、来源、标签实时过滤
- **收藏功能**：localStorage 本地持久化，无需登录
- **AI Token 行情面板**：专注 RNDR、FET、WLD 等 AI 概念币

## 快速开始

```bash
# 安装依赖
npm install

# 本地开发（http://localhost:3000）
npm run dev

# 构建生产版本
npm run build
npm start
```

## 部署到 Vercel（免费）

```bash
# 安装 Vercel CLI
npm i -g vercel

# 一键部署
vercel
```

访问 [vercel.com](https://vercel.com) 注册免费账号即可。

## 项目结构

```
src/
├── app/
│   ├── api/
│   │   ├── prices/route.ts   # CoinGecko 行情 API
│   │   └── news/route.ts     # RSS 新闻聚合 API
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx              # 主页面
├── hooks/
│   ├── usePrices.ts          # SWR 行情轮询
│   └── useBookmarks.ts       # localStorage 收藏
└── types/
    └── index.ts
```

## 扩展指南

### 添加新的 RSS 源

在 `src/app/api/news/route.ts` 的 `RSS_FEEDS` 数组中添加：

```ts
{ url: 'https://your-feed.com/rss', source: '来源名称', category: 'ai' }
```

### 添加新的 Token

在 `src/app/api/prices/route.ts` 的 `COINS` 数组中添加 CoinGecko ID：

```ts
const COINS = ['bitcoin', 'ethereum', 'your-token-id']
```

### 接入 AI 每日摘要（下一步）

创建 `src/app/api/summary/route.ts`，调用 Claude API 生成每日摘要。

## 免费额度

| 服务 | 免费额度 | 备注 |
|------|---------|------|
| CoinGecko | 300次/分钟 | Demo API，无需 Key |
| Vercel | 100GB 带宽/月 | 个人项目足够 |
| RSS 解析 | 无限制 | 直接抓取，无 API Key |
| Resend（Newsletter） | 3000封/月 | 下一步集成 |
