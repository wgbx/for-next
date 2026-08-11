"use client";

import { memo } from "react";

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

export const JotaiPanel = memo(function JotaiPanel() {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="font-semibold text-black dark:text-zinc-50">Jotai</h3>
      <CountDisplay />
      <NameDisplay />
    </div>
  );
});
