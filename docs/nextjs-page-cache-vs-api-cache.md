# Next.js 页面缓存 vs 接口缓存（技术方案）

> 适用版本：本仓库使用 Next.js 16（App Router）  
> 目标：解决“用户 A 访问后，用户 B 再访问不应重复请求后端”的缓存复用问题，并支持“发布后按需失效/刷新”。

## 1. 目标 / 非目标

### 1.1 目标

- **页面级缓存（Page Cache / ISR）**：同一路径（如店铺首页）在第一个请求生成后，后续用户直接命中缓存返回页面结果，避免重复 SSR/重复取数。
- **接口级缓存（API Cache / Data Cache）**：即使页面是动态的或客户端会请求 API，也能让 Next 在服务端复用“对外部后端 API 的请求结果”，减少对后端的压力。
- **按需失效**：发布/配置变更后，通过 `revalidateTag()` 或 `revalidatePath()` 精准清缓存，让下一次请求重新生成。
- **拆分实时数据**：订单数、未读数等强实时数据不走跨用户缓存，避免一致性问题。

### 1.2 非目标

- 不试图让“每个用户都不发浏览器请求”。**只要你用客户端 `useEffect`/SWR 请求 API，浏览器请求一定会发生**；能优化的是“API 背后是否还会打后端/DB”。
- 不覆盖多租户/多语言/AB 实验等所有个性化场景；这类场景会影响缓存 key，需要额外设计。

## 2. 总体原则（一句话）

- **页面缓存优先**：能做成“跨用户共享的公共页面”，就用页面缓存（ISR），用户体验最好、后端压力最低。
- **接口缓存兜底**：页面无法缓存（有个性化/登录态/请求头参与）时，至少把“公共接口”在 Next 服务端缓存起来。
- **实时数据拆出**：实时/用户态数据单独请求（`no-store` 或客户端拉取），不要污染公共缓存。

## 3. 两种缓存的定义与差异

### 3.1 页面缓存（Page Cache / ISR）

**缓存对象**：页面的渲染输出（HTML/RSC 结果）。  
**理想现象**：用户 A 首次访问触发取数 + 渲染；用户 B 再访问直接命中缓存，后端不再被调用。  
**典型适用**：

- 店铺首页（公共内容：店铺信息、主题、商品/内容列表）
- 落地页、营销页
- 公共详情页（允许短暂陈旧）

### 3.2 接口缓存（API Cache / Next Data Cache）

**缓存对象**：Next 服务端对外部后端 API 的 `fetch` 响应结果（Data Cache）。  
**现象**：

- 页面本身可能仍需执行（动态路由/用户态），或浏览器仍会请求本项目的 API
- 但 **本项目服务端不会每次都去请求外部后端**，从而降低后端压力、提升响应时间

**典型适用**：

- 页面必须动态（例如依赖 `cookies()/headers()` 做个性化），但有一部分公共数据可共享
- 客户端必须请求 API（例如实时刷新模块），但希望 API 背后复用缓存

## 4. 页面缓存（ISR）推荐落地方式

### 4.1 关键要点

- 页面里获取的**公共数据**使用 `fetch(url, { next: { revalidate, tags } })`，让 Next 能复用缓存。
- **不要**让公共页面读取会导致“按用户变化”的数据源（如 `cookies()`、`headers()`、`Authorization/Cookie` 请求头）参与渲染，否则缓存会变成按用户分片或退化成动态。
- 发布/变更时，用 `revalidateTag()` 或 `revalidatePath()` 清掉缓存。

### 4.2 模板（公共页面 + 多个公共接口）

```ts
// page.tsx（Server Component）
// - 并发请求多个公共接口
// - 每个请求都打相同 tag，发布时一键失效

const TAG = `shop:${shopId}`;

const [shopInfo, theme, products] = await Promise.all([
  fetch(`${API}/shop/${shopId}`, { next: { tags: [TAG], revalidate: 900 } }).then(r => r.json()),
  fetch(`${API}/shop/${shopId}/theme`, { next: { tags: [TAG], revalidate: 900 } }).then(r => r.json()),
  fetch(`${API}/shop/${shopId}/products`, { next: { tags: [TAG], revalidate: 60 } }).then(r => r.json()),
]);
```

### 4.3 “清页面缓存”按钮（按需失效）

- **按 tag 清公共数据缓存**：`revalidateTag(TAG, "default")`
- **按 path 清页面缓存**：`revalidatePath("/shop/xxx")`

```ts
// route.ts
revalidateTag(TAG, "default");
revalidatePath(`/shop/${shopId}`);
```

## 5. 接口缓存（API/Data Cache）推荐落地方式

### 5.1 关键要点

- 在 Route Handler / Server Component 内请求外部 API 时，使用：
  - `fetch(url, { next: { tags: [...], revalidate: N } })`
- 这样即使浏览器每次请求本项目 API，**本项目服务端也能复用外部 API 响应**。

### 5.2 模板（Route Handler 缓存外部 API）

```ts
// app/api/shop-public/route.ts
export async function GET() {
  const res = await fetch(`${API}/shop/public`, {
    next: { tags: ["shop:public"], revalidate: 300 },
  });
  return NextResponse.json(await res.json());
}
```

### 5.3 常见误区

- **误区**：“我做了接口缓存，所以用户 B 不会再看到 loading”
  - 只要是客户端 `useEffect` 请求 API，B 仍会经历一次“等待返回”的 loading；缓存带来的改变是 **更快返回 & 不再打外部后端**。

## 6. 店铺首页拆分建议（公共缓存 + 实时不缓存）

### 6.1 公共可缓存（跨用户一致）

- 店铺信息、主题配置、商品/内容列表（允许短暂陈旧）
- 推荐：页面缓存（ISR）或服务端 Data Cache + SSR

### 6.2 实时不缓存（强一致/用户态）

- 订单数、库存、未读数、用户权益、个性化推荐
- 推荐：客户端请求（SWR/React Query）或服务端 `no-store`

## 7. 如何验证是否命中缓存

### 7.1 页面级（ISR/边缘缓存）

- 看响应头：`x-vercel-cache`（HIT/MISS/STALE）与 `age`
- 看“上游时间戳”：若页面展示了上游的 `Date`（或自定义版本号），多用户访问是否保持不变

### 7.2 接口级（Data Cache）

- 让 API 返回一个“是否实际请求了上游”的计数（仅 demo 用）
- 或在后端/网关日志中统计外部 API QPS 在缓存启用前后的变化

## 8. 常见坑（导致 B 还会重新请求）

- **页面读取了 `cookies()/headers()`**：页面变为按用户变化，无法共享页面缓存
- **`fetch` 带 `Authorization/Cookie`**：缓存 key 变复杂/退化为私有
- **使用 `cache: "no-store"`**：明确禁用缓存
- **客户端拉取公共数据**：页面首屏一定 loading（即使 API 背后有缓存）
- **缓存失效策略不一致**：多个接口没统一 tag，导致发布后“有的更新、有的旧”

## 9. 本仓库 demo 对应关系（便于代码对照）

- **页面缓存 demo**：`/demo-pear-shop`  
  - 取数：`app/demo-pear-shop/data.ts`（`fetch(..., next: { tags, revalidate })`）  
  - 清缓存：`POST /api/demo-pear-page-clear`（`revalidateTag + revalidatePath`）
- **接口缓存 demo**：`/demo-shop-api` / `GET /api/demo-shop-home`（用于对照“浏览器会请求，但后端复用缓存”）

