# 如何落地 Next.js 页面缓存（ISR / Page Cache）

> 目标：让“店铺首页”等公共页面 **跨用户复用**，用户 A 首次访问生成页面缓存后，用户 B 访问同一路径 **不再触发后端请求/SSR**，并支持“发布后按需刷新”。

本文只聚焦 **App Router**（`app/` 目录）下的页面缓存落地方法；接口缓存（Data Cache）请见 `docs/nextjs-page-cache-vs-api-cache.md`。

---

## 1. 先做一件事：给页面分类（能不能缓存）

把页面按“是否跨用户一致”分成两类：

### 1.1 可页面缓存（推荐）

特征：页面输出（HTML/RSC）对所有访客一致，或只依赖 **公共数据**（允许短暂陈旧）。

- 店铺首页：店铺信息、主题配置、商品/内容列表（允许 1–15 分钟陈旧）
- 营销/落地页
- 公共详情页（允许陈旧）

### 1.2 不适合页面缓存（必须动态/按用户）

出现任意一种通常就无法“跨用户共享”：

- 渲染链路依赖登录态或用户信息（SSR 读 `cookies()` / `headers()` / token）
- A/B 实验分桶、地域、设备信息参与 SSR 输出
- SSR 请求外部接口时带 `Authorization`/`Cookie`（导致响应按用户变化）
- 页面顶部就必须展示强实时数据（订单数、未读、库存）且不能延后

> 结论：**公共内容页面缓存 + 实时/用户态拆出**，是电商/店铺首页的最常见解法。

---

## 2. 落地结构：把“店铺首页”拆成两层

### 2.1 公共层（页面缓存）

在 Server Component 中获取公共数据，并让这些 `fetch` 可缓存：

- `fetch(url, { next: { revalidate: N, tags: [...] } })`
- 并发 `Promise.all` 拉多个接口（避免串行放大延迟）

### 2.2 实时/用户态层（不缓存）

从页面缓存里拆出去：

- 订单数/未读数/个性化推荐/库存
- 用客户端请求（SWR/React Query）或单独 `no-store` 接口

这样首屏能做到“公共页面秒开”，实时数据稍后补齐。

---

## 3. 代码模板：一个可缓存的店铺首页

### 3.1 tag 命名规范（强烈建议）

tag 是你定义的“业务缓存分组”，建议可读可推导：

- 页面级：`shop:${shopId}`
- 模块级：`shop:${shopId}:theme`、`shop:${shopId}:products`

不要用随机数、时间戳、全量 URL（会碎片化且无法精准失效）。

### 3.2 示例（公共数据并发 + 统一 tag）

```ts
// app/shop/[shopId]/page.tsx (Server Component)

const tag = `shop:${shopId}`;

const [shop, theme, products] = await Promise.all([
  fetch(`${API}/shop/${shopId}`, { next: { tags: [tag], revalidate: 900 } }).then(r => r.json()),
  fetch(`${API}/shop/${shopId}/theme`, { next: { tags: [tag], revalidate: 900 } }).then(r => r.json()),
  fetch(`${API}/shop/${shopId}/products`, { next: { tags: [tag], revalidate: 60 } }).then(r => r.json()),
]);
```

> 建议：**公共数据统一一个 tag**（发布时一键失效），不同模块用不同 `revalidate` 控制陈旧窗口。

---

## 4. 发布/编辑后如何“按需刷新”

页面缓存落地必须配套“失效链路”，否则改配置/上新后用户看到旧内容。

### 4.1 推荐组合：`revalidateTag` + `revalidatePath`

- `revalidateTag(tag, "default")`：清公共数据缓存
- `revalidatePath(path)`：清页面缓存（让下一次请求重新生成页面）

适用：发布动作明确、目标范围可定位（某个店铺、某个页面）。

### 4.2 在本仓库的可运行例子

- 页面：`/demo-pear-shop`
- 清缓存接口：`POST /api/demo-pear-page-clear`
  - 内部执行 `revalidateTag(...)` 与 `revalidatePath('/demo-pear-shop')`

---

## 5. 如何验证“页面缓存真的生效”

### 5.1 看 CDN/边缘缓存头（Vercel）

用 `curl -I` 看：

- `x-vercel-cache`: `HIT/MISS/STALE`
- `age`: 命中缓存时通常会递增

```bash
curl -I https://<your-domain>/shop/xxx
```

### 5.2 在页面上展示“上游版本/时间戳”

公共数据里带一个稳定版本字段（例如上游响应头 `Date` 或配置版本号）。命中页面缓存时页面内容应保持不变；清缓存后才变化。

> 注意：Next 对 `new Date()` 在 prerender 期很敏感，**尽量使用上游 `Date` 响应头或后端版本号**，避免构建期报错。

### 5.3 看服务端日志/后端 QPS

缓存命中率上来后，后端相关接口 QPS 会下降（最硬指标）。

---

## 6. 常见踩坑与解决方案（业务最常见）

### 6.1 公共页面“意外变动态”

**症状**：你以为是页面缓存，但每个用户都触发 SSR/后端请求。

**常见原因**：

- 在页面/布局里读了 `cookies()` / `headers()`
- SSR 请求带 `Authorization`/`Cookie`
- 代码里使用 `cache: "no-store"` 或默认 no-store

**解法**：

- 公共页面不要读取用户态；个性化拆成客户端模块
- 公共接口不要带用户 token；需要 token 的接口不要跨用户缓存

### 6.2 “订单数等实时数据拖慢首屏”

**解法**：把订单数拆成客户端小请求，不阻塞首屏；首屏先用缓存页面渲染公共内容。

### 6.3 多接口缓存失效不一致

**症状**：发布后有的模块更新了、有的仍旧。

**解法**：对同一店铺公共内容使用统一 tag（`shop:${shopId}`），发布时只需要一次 `revalidateTag`。

---

## 7. 落地建议（推荐你们团队的“标准做法”）

- **页面层**：默认所有“公共页面”都以页面缓存为目标设计
- **数据层**：公共接口统一加 `tags + revalidate`，并用业务 tag 命名规范
- **失效层**：发布/编辑动作落到一个清缓存接口（或 Server Action），统一触发 `revalidateTag + revalidatePath`
- **实时层**：订单数/未读/库存等拆出，避免污染公共缓存
- **验证层**：上线前后对比 TTFB、后端 QPS、`x-vercel-cache` 命中率

