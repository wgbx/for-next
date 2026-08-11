# 设计：Demo 验证池架构调整 + provider-render 演示

日期：2026-08-11
状态：已批准（待实现）

## 背景

项目原本定位是"Next.js 页面缓存 vs 接口缓存"的对照实验场，现要扩展为通用的 Next/React demo 验证池——未来会持续加入不同技术主题的演示（缓存策略、状态管理与渲染、渲染性能等）。第一个新主题是对比 React Context 和 Jotai 在状态更新时的渲染行为差异。

## A. 架构调整

### A.1 `app/routes.ts`

`pages` 数组每一项增加 `category: string` 字段：

- 现有 `shop` / `shopApi` / `pearShop` 三项 → `category: "缓存策略"`
- 新增 `providerRender` 路由 `/provider-render` → `category: "状态管理与渲染"`

`routes` 对象增加：`providerRender: "/provider-render"`。

### A.2 `app/page.tsx`

首页改为按 `category` 分组渲染：先对 `pages` 按 category 分组（保留数组原有顺序，同 category 项聚在一起），每组渲染一个小标题 + 该组的卡片列表。标题/副标题从"ISR 演示项目"改为通用定位，例如「Next / React Demo 验证池」+ 描述"Next.js / React 特性与模式的可运行对照实验"。

### A.3 `docs/architecture.md`

- 第 1 节"项目目标"改写为通用验证池定位，不再局限于缓存对照两个问题，改为说明这是一个持续累积的 demo 集合，每个 demo 独立验证一个 Next.js / React 技术点。
- 第 4 节路由表加一列"分类"。
- 第 11 节"扩展指南"补一条：新 demo 目录名直接描述技术主题（如 `provider-render`），不使用业务化命名（如 `shop`）；同时在 `pages` 中声明 `category`，已有分类复用，新主题才新建分类字符串。

### A.4 不变更范围

不移动 `shop` / `shop-api` / `pear-shop` 现有目录结构或实现，只补 `category` 标签，保持最小改动。

## B. 新 demo：`/provider-render`

对比 React Context 和 Jotai 在同一状态更新下的渲染传播差异。

### B.1 目录

```
app/provider-render/
├── page.tsx          # client component，顶层状态 + 控制按钮 + 两栏布局
├── ContextPanel.tsx  # React Context 版本
└── JotaiPanel.tsx    # Jotai atom 版本
```

纯前端状态对比，不涉及 SSR/数据请求/缓存，`page.tsx` 直接是 `"use client"`。

### B.2 状态设计

两个独立字段：`count`（数字）、`name`（字符串，从固定列表中轮换）。

- **Context 侧**：`page.tsx` 用 `useState` 管理 `{count, name}` 及其 setter，通过一个 `DemoContext.Provider` 把整个对象（值 + setter）传给 `ContextPanel`。故意不做 `useMemo`/拆分优化——这是最常见的写法，用来演示问题根源：value 对象每次渲染都是新引用，任何字段变化都会让所有 `useContext` 消费者重渲。
- **Jotai 侧**：模块作用域定义 `countAtom` 和 `nameAtom` 两个独立 primitive atom。`JotaiPanel` 内组件通过 `useAtomValue` 分别订阅，通过 `useSetAtom` 更新。

### B.3 触发源

顶层 `page.tsx` 渲染一组共享按钮："+1 Count" / "换 Name"。点击时**同时**更新 Context 的 state 和 Jotai 的 atom，确保左右两栏是对同一次操作的渲染行为对比，而不是两个互不相关的演示。

### B.4 组件与渲染计数

每一侧各有两个只读子组件：`CountDisplay`、`NameDisplay`。

- `CountDisplay` 只读 `count`，`NameDisplay` 只读 `name`。
- 每个组件内部用 `useRef` 在渲染时自增一个计数器，渲染"渲染 N 次"徽标。

预期现象：

- 点击"+1 Count"：Context 侧 `CountDisplay`、`NameDisplay` 渲染次数**都** +1；Jotai 侧只有 `CountDisplay` +1。
- 点击"换 Name"同理，反过来只影响 name 相关计数。

### B.5 控制与说明

- 一个"重置计数"按钮，把双方四个组件的渲染计数清零（用 `key` 强制 remount 两个 Panel 是最简单可靠的实现）。
- 页面底部一段结论文字，解释现象成因：Context 的 value 是单一对象引用，变化时无法区分订阅者关心哪个字段；Jotai 的 atom 级订阅天然按字段粒度更新。

### B.6 范围外（不做）

不实现"拆分 Context / useMemo 优化后对比"的第三栏。作为文档中的"扩展方向"留白，后续如需要可再加一版。

## 测试计划

`pnpm dev` 启动后手动验证：

1. 首页 `/` 按分类分组展示，"缓存策略"三项 + "状态管理与渲染"一项。
2. 打开 `/provider-render`，点击"+1 Count"：确认 Context 侧两个徽标都递增，Jotai 侧只有 Count 徽标递增。
3. 点击"换 Name"：确认相反的模式（Context 两个都变，Jotai 只有 Name 变）。
4. 点击"重置计数"：四个徽标归零。
5. `pnpm lint` 通过。

无自动化测试（demo 项目，渲染次数需要人眼在浏览器中观察确认）。
