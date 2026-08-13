# for-next

Next.js / React **demo 验证池**：每个页面独立验证一个技术点，互不依赖。不是业务生产项目。

首页按分类列出全部入口；路径和卡片文案只改 [`app/routes.ts`](app/routes.ts)。

## 技术栈

| 层级 | 选型 |
|------|------|
| 框架 | Next.js 16 App Router · React 19 · TypeScript 5 |
| 样式 | Tailwind CSS 4（页面主力）· MUI 9（根主题 + 少量组件） |
| 状态 / 请求 | Jotai · TanStack Query 5 |
| 包管理 | pnpm |
| 部署 | Vercel（可用 `x-vercel-cache` 验证页面缓存） |

`next.config.ts` 开启了 `cacheComponents`，配合 `"use cache"` / `cacheTag()` 做组件级缓存。

## 本地运行

```bash
pnpm install
pnpm dev
```

打开 [http://localhost:8888](http://localhost:8888)。

验证 ISR / 页面缓存请用生产模式（dev 下缓存行为不可靠）：

```bash
pnpm build && pnpm start
```

## Demo 一览

| 分类 | 路径 | 在验证什么 |
|------|------|------------|
| 缓存策略 | [`/shop`](http://localhost:8888/shop) | 页面缓存：用户间复用，发布后更新 |
| 缓存策略 | [`/shop-api`](http://localhost:8888/shop-api) | 接口缓存：客户端每次请求，后端取数复用 |
| 缓存策略 | [`/pear-shop`](http://localhost:8888/pear-shop) | SSR + 上游 API + 按需清缓存 |
| 状态管理与渲染 | [`/provider-render`](http://localhost:8888/provider-render) | React Context vs Jotai 订阅粒度 / 重渲染次数 |
| 客户端数据获取 | [`/react-query`](http://localhost:8888/react-query) | useQuery：queryKey、无限列表、条件详情、乐观更新、缓存失效 |

客户端 Query Cache（`/react-query`）和 Next.js Data Cache / 页面缓存（`/shop`）不是一层：前者只活在当前浏览器，后者可跨用户共享。

## 新增 demo

1. 在 `app/routes.ts` 注册路径和首页卡片（`category` 决定分组）
2. 新建 `app/<feature>/page.tsx`；缓存逻辑放 `data.ts`
3. 纯技术点用主题目录名（如 `provider-render`）；接外部数据用业务名（如 `shop`）

子页返回首页由根布局的 `BackHomeLink` 自动出现。

## 文档

- [架构与目录](docs/architecture.md)
- [页面缓存 vs 接口缓存](docs/nextjs-page-cache-vs-api-cache.md)
- [页面缓存落地](docs/nextjs-page-cache-implementation.md)
