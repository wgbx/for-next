# Demo Pool 架构调整 + provider-render 演示 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把首页/路由结构改成按分类分组的通用 demo 验证池，并新增 `/provider-render` 演示，直观对比 React Context 与 Jotai 在同一次状态更新下的渲染传播差异。

**Architecture:** `app/routes.ts` 的 `pages` 数组加 `category` 字段，首页按分类分组渲染卡片。新 demo 是纯客户端组件：顶层 `page.tsx` 持有 `count`/`name` 两个字段的真值（Context 侧用 `useState`，Jotai 侧用两个独立 atom），一组共享按钮同时更新两侧；两侧各自的只读子组件用 `useRef` 自计渲染次数并显示徽标。

**Tech Stack:** Next.js 16 App Router · React 19 · TypeScript 5 · Tailwind CSS 4 · Jotai 2.20（已是项目依赖，根布局已挂 `JotaiProvider`）

## Global Constraints

- 项目无自动化测试框架（无 jest/vitest/testing-library），验证手段是 `pnpm lint`、`pnpm build`（类型检查）和浏览器手动交互，不要虚构测试步骤。
- 不改动 `shop` / `shop-api` / `pear-shop` 现有目录结构或实现逻辑，只补 `category` 标签。
- 新 demo 目录/文件命名遵循已批准 spec：技术主题直描（`provider-render`），不套业务场景。
- 路径常量统一走 `app/routes.ts`，不在组件里手写字符串路径。
- 参考 spec：`docs/superpowers/specs/2026-08-11-demo-pool-and-provider-render-design.md`

---

### Task 1: 路由分类 + 首页按分类分组

**Files:**
- Modify: `app/routes.ts`（`pages` 数组每项加 `category`）
- Modify: `app/page.tsx`（改为按 `category` 分组渲染）

**Interfaces:**
- Produces: `pages` 数组每项新增 `category: string` 字段（现有三项均为 `"缓存策略"`），供 `app/page.tsx` 及后续 Task 4 使用。

- [ ] **Step 1: 给现有三个 demo 加 `category`**

编辑 `app/routes.ts`，把 `pages` 数组改成：

```ts
export const pages = [
  {
    path: routes.shop,
    title: "页面缓存",
    description: "用户间复用，发布后更新。服务端渲染 + 页面级缓存（没有客户端请求接口）",
    category: "缓存策略",
  },
  {
    path: routes.shopApi,
    title: "接口缓存",
    description: "客户端每次请求，但后端取数复用缓存",
    category: "缓存策略",
  },
  {
    path: routes.pearShop,
    title: "Pear 店铺首页",
    description: "页面缓存 + 按需清除。演示 SSR 取数和上游 API 响应",
    category: "缓存策略",
  },
] as const;
```

（只加 `category` 字段，`routes` 对象本次不变。）

- [ ] **Step 2: 首页改为按分类分组渲染**

编辑 `app/page.tsx`，把标题/副标题改成通用定位，并按 `category` 分组：

```tsx
import Image from "next/image";
import Link from "next/link";

import { pages } from "./routes";

const categories = Array.from(new Set(pages.map((page) => page.category)));

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center gap-12 py-32 px-6 sm:px-16 bg-white dark:bg-black">
        <div className="flex flex-col items-center gap-6 text-center">
          <Image
            className="dark:invert"
            src="/next.svg"
            alt="Next.js logo"
            width={100}
            height={20}
            priority
          />
          <h1 className="text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            Next / React Demo 验证池
          </h1>
          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            Next.js / React 特性与模式的可运行对照实验
          </p>
        </div>

        <div className="flex flex-col gap-10 w-full">
          {categories.map((category) => (
            <div key={category} className="flex flex-col gap-4 w-full">
              <h2 className="text-xl font-semibold text-black dark:text-zinc-50">
                {category}
              </h2>
              <div className="flex flex-col gap-3">
                {pages
                  .filter((page) => page.category === category)
                  .map((page) => (
                    <Link
                      key={page.path}
                      href={page.path}
                      className="group flex flex-col gap-1 rounded-2xl border border-black/[.08] bg-white p-5 shadow-sm transition-colors hover:border-black/[.12] hover:bg-black/[.02] dark:border-white/[.14] dark:bg-black dark:hover:border-white/[.20] dark:hover:bg-white/[.04]"
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-lg font-medium text-black dark:text-zinc-50">
                          {page.title}
                        </div>
                        <div className="text-zinc-400 transition-transform group-hover:translate-x-1 dark:text-zinc-500">
                          →
                        </div>
                      </div>
                      <div className="text-sm text-zinc-600 dark:text-zinc-400">
                        {page.description}
                      </div>
                      <div className="text-xs font-mono text-zinc-500 dark:text-zinc-500">
                        {page.path}
                      </div>
                    </Link>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
```

- [ ] **Step 3: 类型检查**

Run: `pnpm exec tsc --noEmit`
Expected: 无报错（`pages` 数组新字段不影响既有类型推断）。

- [ ] **Step 4: Commit**

```bash
git add app/routes.ts app/page.tsx
git commit -m "refactor: group homepage demos by category"
```

---

### Task 2: `useRenderCount` 共享 hook

**Files:**
- Create: `app/provider-render/useRenderCount.ts`

**Interfaces:**
- Produces: `useRenderCount(): number` — 每次调用它的组件渲染时自增并返回当前渲染次数（从 1 开始）。供 Task 3、Task 4 的展示组件使用。

- [ ] **Step 1: 编写 hook**

```ts
import { useRef } from "react";

export function useRenderCount(): number {
  const renderCount = useRef(0);
  renderCount.current += 1;
  return renderCount.current;
}
```

- [ ] **Step 2: 类型检查**

Run: `pnpm exec tsc --noEmit`
Expected: 无报错。

- [ ] **Step 3: Commit**

```bash
git add app/provider-render/useRenderCount.ts
git commit -m "feat: add render-count hook for provider-render demo"
```

---

### Task 3: `ContextPanel` — React Context 版本

**Files:**
- Create: `app/provider-render/ContextPanel.tsx`

**Interfaces:**
- Consumes: `useRenderCount()` from `./useRenderCount` (Task 2)
- Produces: `ContextPanel({ count, name }: { count: number; name: string })` — client component，导出供 Task 5 的 `page.tsx` 使用。内部创建的 `DemoContext` 不导出（仅本文件使用）。

- [ ] **Step 1: 编写组件**

```tsx
"use client";

import { createContext, useContext } from "react";

import { useRenderCount } from "./useRenderCount";

type DemoValue = { count: number; name: string };

const DemoContext = createContext<DemoValue | null>(null);

function Badge({ children }: { children: number }) {
  return (
    <div className="mt-1 text-xs font-mono text-amber-600 dark:text-amber-400">
      渲染 {children} 次
    </div>
  );
}

function CountDisplay() {
  const value = useContext(DemoContext);
  const renderCount = useRenderCount();
  return (
    <div className="rounded-lg border border-black/10 p-3 dark:border-white/10">
      <div className="text-sm text-zinc-500">Count</div>
      <div className="text-2xl font-semibold">{value?.count}</div>
      <Badge>{renderCount}</Badge>
    </div>
  );
}

function NameDisplay() {
  const value = useContext(DemoContext);
  const renderCount = useRenderCount();
  return (
    <div className="rounded-lg border border-black/10 p-3 dark:border-white/10">
      <div className="text-sm text-zinc-500">Name</div>
      <div className="text-2xl font-semibold">{value?.name}</div>
      <Badge>{renderCount}</Badge>
    </div>
  );
}

export function ContextPanel({ count, name }: DemoValue) {
  const value: DemoValue = { count, name };

  return (
    <DemoContext.Provider value={value}>
      <div className="flex flex-col gap-3">
        <h3 className="font-semibold text-black dark:text-zinc-50">
          React Context
        </h3>
        <CountDisplay />
        <NameDisplay />
      </div>
    </DemoContext.Provider>
  );
}
```

注意：`value` 每次渲染都是新对象字面量，**故意不加 `useMemo`** — 这是要演示的问题根源，不要"优化"掉。

- [ ] **Step 2: 类型检查**

Run: `pnpm exec tsc --noEmit`
Expected: 无报错。

- [ ] **Step 3: Commit**

```bash
git add app/provider-render/ContextPanel.tsx
git commit -m "feat: add Context panel for provider-render demo"
```

---

### Task 4: `lib/atoms/provider-render.ts` + `JotaiPanel` — Jotai 版本

**Files:**
- Create: `lib/atoms/provider-render.ts`
- Create: `app/provider-render/JotaiPanel.tsx`

**Interfaces:**
- Consumes: `useRenderCount()` from `./useRenderCount` (Task 2)
- Produces:
  - `countAtom`, `nameAtom`（`PrimitiveAtom<number>` / `PrimitiveAtom<string>`）from `lib/atoms/provider-render.ts` — 供 Task 5 的 `page.tsx` 通过 `useSetAtom` 更新。
  - `JotaiPanel()` — client component，无 props，导出供 Task 5 使用。

- [ ] **Step 1: 定义 atoms**

```ts
import { atom } from "jotai";

export const countAtom = atom(0);
export const nameAtom = atom("Ann");
```

- [ ] **Step 2: 编写 JotaiPanel**

```tsx
"use client";

import { useAtomValue } from "jotai";

import { countAtom, nameAtom } from "@/lib/atoms/provider-render";

import { useRenderCount } from "./useRenderCount";

function Badge({ children }: { children: number }) {
  return (
    <div className="mt-1 text-xs font-mono text-emerald-600 dark:text-emerald-400">
      渲染 {children} 次
    </div>
  );
}

function CountDisplay() {
  const count = useAtomValue(countAtom);
  const renderCount = useRenderCount();
  return (
    <div className="rounded-lg border border-black/10 p-3 dark:border-white/10">
      <div className="text-sm text-zinc-500">Count</div>
      <div className="text-2xl font-semibold">{count}</div>
      <Badge>{renderCount}</Badge>
    </div>
  );
}

function NameDisplay() {
  const name = useAtomValue(nameAtom);
  const renderCount = useRenderCount();
  return (
    <div className="rounded-lg border border-black/10 p-3 dark:border-white/10">
      <div className="text-sm text-zinc-500">Name</div>
      <div className="text-2xl font-semibold">{name}</div>
      <Badge>{renderCount}</Badge>
    </div>
  );
}

export function JotaiPanel() {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="font-semibold text-black dark:text-zinc-50">Jotai</h3>
      <CountDisplay />
      <NameDisplay />
    </div>
  );
}
```

- [ ] **Step 3: 类型检查**

Run: `pnpm exec tsc --noEmit`
Expected: 无报错。

- [ ] **Step 4: Commit**

```bash
git add lib/atoms/provider-render.ts app/provider-render/JotaiPanel.tsx
git commit -m "feat: add Jotai panel for provider-render demo"
```

---

### Task 5: `page.tsx` 页面编排 + 注册路由

**Files:**
- Create: `app/provider-render/page.tsx`
- Modify: `app/routes.ts`（新增 `routes.providerRender` 和对应 `pages` 条目）

**Interfaces:**
- Consumes:
  - `ContextPanel({ count, name })` from `./ContextPanel` (Task 3)
  - `JotaiPanel()` from `./JotaiPanel` (Task 4)
  - `countAtom`, `nameAtom` from `@/lib/atoms/provider-render` (Task 4)
- Produces: 路由 `/provider-render` 可访问；`pages` 数组新增一项 `category: "状态管理与渲染"`，供首页（Task 1 已完成的分组逻辑）自动渲染出新分组。

- [ ] **Step 1: 编写 page.tsx**

```tsx
"use client";

import { useSetAtom } from "jotai";
import { useState } from "react";

import { countAtom, nameAtom } from "@/lib/atoms/provider-render";

import { ContextPanel } from "./ContextPanel";
import { JotaiPanel } from "./JotaiPanel";

const NAMES = ["Ann", "Bob", "Cara", "Dan"];

export default function ProviderRenderPage() {
  const [count, setCount] = useState(0);
  const [nameIndex, setNameIndex] = useState(0);
  const [resetKey, setResetKey] = useState(0);

  const setJotaiCount = useSetAtom(countAtom);
  const setJotaiName = useSetAtom(nameAtom);

  const name = NAMES[nameIndex];

  function handleIncCount() {
    setCount((c) => c + 1);
    setJotaiCount((c) => c + 1);
  }

  function handleChangeName() {
    const nextIndex = (nameIndex + 1) % NAMES.length;
    setNameIndex(nextIndex);
    setJotaiName(NAMES[nextIndex]);
  }

  function handleReset() {
    setResetKey((k) => k + 1);
  }

  return (
    <div className="flex flex-col flex-1 items-center bg-zinc-50 dark:bg-black">
      <main className="flex flex-1 w-full max-w-3xl flex-col gap-8 py-16 px-6 sm:px-16 bg-white dark:bg-black">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">
            Provider 渲染次数对比
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            同一次状态更新，React Context 和 Jotai 各自的订阅组件重渲染了几次？
          </p>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleIncCount}
            className="rounded-full bg-black px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-black"
          >
            +1 Count
          </button>
          <button
            type="button"
            onClick={handleChangeName}
            className="rounded-full border border-black/20 px-4 py-2 text-sm font-medium text-black dark:border-white/20 dark:text-zinc-50"
          >
            换 Name
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="rounded-full border border-black/20 px-4 py-2 text-sm font-medium text-black dark:border-white/20 dark:text-zinc-50"
          >
            重置计数
          </button>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
          <ContextPanel key={resetKey} count={count} name={name} />
          <JotaiPanel key={resetKey} />
        </div>

        <div className="rounded-lg bg-zinc-100 p-4 text-sm text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
          <p>
            点击「+1 Count」时，Context 侧的 Count 和 Name 组件都会重渲染——因为
            Provider 传下去的是同一个对象引用，值一变引用就变，所有 useContext
            的消费者都会重渲染，无法区分谁真正关心哪个字段。
          </p>
          <p className="mt-2">
            Jotai 侧只有 Count 组件重渲染，因为 countAtom 和 nameAtom
            是两个独立的订阅源，组件只订阅自己用到的 atom。
          </p>
        </div>
      </main>
    </div>
  );
}
```

- [ ] **Step 2: 注册路由**

编辑 `app/routes.ts`，在 `routes` 对象里加一行，在 `pages` 数组末尾加一项：

```ts
export const routes = {
  home: "/",
  shop: "/shop",
  shopApi: "/shop-api",
  pearShop: "/pear-shop",
  providerRender: "/provider-render",
  api: {
    backend: "/api/backend",
    shopHome: "/api/shop-home",
    publish: "/api/publish",
    pearPageClear: "/api/pear-page-clear",
    pearPublish: "/api/pear-publish",
    pearUser: "/api/pear-user",
  },
} as const;

export const pages = [
  // ...existing 3 entries unchanged...
  {
    path: routes.providerRender,
    title: "Provider 渲染次数对比",
    description: "React Context vs Jotai：同一次状态更新，谁的订阅者重渲染了？",
    category: "状态管理与渲染",
  },
] as const;
```

- [ ] **Step 3: 类型检查 + lint**

Run: `pnpm exec tsc --noEmit && pnpm lint`
Expected: 均无报错。

- [ ] **Step 4: Commit**

```bash
git add app/provider-render/page.tsx app/routes.ts
git commit -m "feat: add provider-render demo page and register route"
```

---

### Task 6: 更新 `docs/architecture.md`

**Files:**
- Modify: `docs/architecture.md`

**Interfaces:** 无（纯文档）

- [ ] **Step 1: 改写第 1 节"项目目标"**

把：

```
## 1. 项目目标

本仓库不是业务生产项目，而是一个**缓存策略对照实验场**，用来回答两类问题：

1. **页面缓存**：用户 A 访问后，用户 B 访问同一路径时，能否不再触发 SSR / 上游请求？
2. **接口缓存**：页面必须走客户端请求时，能否让 Next 服务端复用对外部 API 的 `fetch` 结果，降低后端压力？

三个演示页分别展示不同策略；首页 `/` 汇总入口与说明。
```

替换为：

```
## 1. 项目目标

本仓库不是业务生产项目，而是一个**持续累积的 Next.js / React demo 验证池**：每个 demo 独立验证一个技术点，互不依赖。当前收录两类：

1. **缓存策略**：页面缓存（ISR）与接口缓存（Data Cache）的对照，回答"用户 B 访问同一路径/接口时，能否不再触发 SSR / 上游请求？"
2. **状态管理与渲染**：不同状态管理方案在渲染行为上的差异，例如 React Context vs Jotai 的订阅粒度对比。

首页 `/` 按分类分组汇总所有 demo 入口。新增分类时无需改动首页结构，只需在 `app/routes.ts` 的 `pages` 中声明新的 `category`。
```

- [ ] **Step 2: 给第 4.2 节表格加"分类"列**

把：

```
### 4.2 三个演示页对照

| 路径 | 缓存策略 | 取数方式 | 用户 B 的体验 |
|------|----------|----------|---------------|
| `/shop` | **页面缓存** + Component Cache | Server Component 直接调用 `getShopHomeData()` | 命中页面缓存，无客户端 loading，`hits` 不变 |
| `/shop-api` | **接口缓存**（Data Cache） | Client Component `fetch /api/shop-home` | 每次有 loading，但 `hits` 不变（服务端复用缓存） |
| `/pear-shop` | **页面缓存** + `fetch` tag 缓存 | Server Component 调用 `fetchPearUserByVanityUrl()` | 命中页面缓存，`fetchedAt` 不变；清缓存后重新请求上游 |

首页 `app/page.tsx` 读取 `pages` 数组渲染导航卡片。
```

替换为：

```
### 4.2 演示页对照

| 分类 | 路径 | 策略 | 取数方式 | 用户 B 的体验 |
|------|------|------|----------|---------------|
| 缓存策略 | `/shop` | **页面缓存** + Component Cache | Server Component 直接调用 `getShopHomeData()` | 命中页面缓存，无客户端 loading，`hits` 不变 |
| 缓存策略 | `/shop-api` | **接口缓存**（Data Cache） | Client Component `fetch /api/shop-home` | 每次有 loading，但 `hits` 不变（服务端复用缓存） |
| 缓存策略 | `/pear-shop` | **页面缓存** + `fetch` tag 缓存 | Server Component 调用 `fetchPearUserByVanityUrl()` | 命中页面缓存，`fetchedAt` 不变；清缓存后重新请求上游 |
| 状态管理与渲染 | `/provider-render` | React Context vs Jotai | 纯客户端 `useState` + `useContext` / `useAtomValue` | 同一次点击下，Context 侧全部消费者重渲，Jotai 侧只有订阅对应 atom 的组件重渲 |

首页 `app/page.tsx` 读取 `pages` 数组，按 `category` 分组渲染导航卡片。
```

- [ ] **Step 3: 第 11 节"扩展指南"补一条目录命名约定**

把结尾的：

```
5. tag 命名：`业务:资源:标识`，如 `shop:${shopId}`，避免随机 tag 导致无法精准失效
```

替换为：

```
5. tag 命名：`业务:资源:标识`，如 `shop:${shopId}`，避免随机 tag 导致无法精准失效
6. 目录命名：涉及外部数据/缓存的 demo 沿用业务化命名（如 `shop`）；纯粹验证某个 Next.js / React 技术点的 demo，目录名直接描述技术主题（如 `provider-render`），不套业务场景
```

- [ ] **Step 4: Commit**

```bash
git add docs/architecture.md
git commit -m "docs: update architecture doc for demo pool positioning"
```

---

### Task 7: 构建校验 + 浏览器交互验证

**Files:** 无新文件（验证性任务）

**Interfaces:** 无

- [ ] **Step 1: 生产构建**

Run: `pnpm build`
Expected: 构建成功，无 TypeScript / lint 报错，`/`、`/provider-render` 出现在构建产物路由列表中。

- [ ] **Step 2: 启动开发服务器并人工验证**

优先使用 `run` skill 启动并驱动应用；若无浏览器自动化能力，则 `pnpm dev` 后请用户或使用可用的浏览器工具手动验证，并在报告中明确说明"渲染次数变化未被自动化验证，需人工确认"（不要在未实际验证的情况下声称已确认）。

验证清单：
1. 打开 `/`：出现"缓存策略"（3 项）和"状态管理与渲染"（1 项）两个分组。
2. 打开 `/provider-render`：初始状态下 4 个徽标都显示"渲染 1 次"。
3. 点击「+1 Count」：Context 侧 Count、Name 徽标都变成"渲染 2 次"；Jotai 侧只有 Count 变成"渲染 2 次"，Name 仍是"渲染 1 次"。
4. 点击「换 Name」：Context 侧两个徽标都再 +1；Jotai 侧只有 Name 徽标 +1。
5. 点击「重置计数」：四个徽标都回到"渲染 1 次"（remount 后的首次渲染）。

- [ ] **Step 3: 如验证通过，向用户报告结果**

不需要额外 commit（Task 6 无代码变更）。若验证中发现问题，回到对应 Task 修正并重新走类型检查 + commit 流程。
