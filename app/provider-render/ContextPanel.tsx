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
