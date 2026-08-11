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
