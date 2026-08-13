"use client";

import { Provider as JotaiProvider, useSetAtom } from "jotai";
import { useState } from "react";

import { countAtom, nameAtom } from "@/lib/atoms/provider-render";

import { ContextPanel } from "./ContextPanel";
import { JotaiPanel } from "./JotaiPanel";

const NAMES = ["Ann", "Bob", "Cara", "Dan"];

export default function ProviderRenderPage() {
  // Page-scoped Jotai store: the root layout's <JotaiProvider> (app/providers.tsx)
  // wraps the whole app and its store survives client-side navigation, but this
  // demo's premise is "the same operation applied to both sides" — so the Jotai
  // side needs to reset exactly when the Context side's useState resets, i.e. on
  // every mount of this page. A bare <JotaiProvider> with no `store` prop creates
  // its own fresh, isolated store per mount (see jotai's react/Provider source),
  // which shadows the app-wide store for everything rendered inside it.
  return (
    <JotaiProvider>
      <ProviderRenderContent />
    </JotaiProvider>
  );
}

function ProviderRenderContent() {
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
    <div className="flex flex-col flex-1 items-center bg-zinc-50 dark:bg-zinc-950">
      <main className="flex flex-1 w-full max-w-5xl flex-col gap-8 py-16 px-6 sm:px-16 bg-white dark:bg-zinc-900">
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
          <ContextPanel key={`context-${resetKey}`} count={count} name={name} />
          <JotaiPanel key={`jotai-${resetKey}`} />
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
          <p className="mt-2">
            精确数字仅供参考，会受到两个已知因素影响：开发模式下 React
            Strict Mode 会将渲染双重执行，徽标数字大约是生产环境的 2
            倍；另外每个 atom 自 mount
            后的第一次写入会让订阅者的徽标多计 1 次（一次性的 Jotai
            初始化开销，之后的写入都是干净的 +1）。想看最干净的数字，用
            `pnpm build && pnpm start` 运行。
          </p>
        </div>
      </main>
    </div>
  );
}
