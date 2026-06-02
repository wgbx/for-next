"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function PublishControls() {
  const router = useRouter();
  const [publishing, setPublishing] = useState(false);
  const [lastResult, setLastResult] = useState<string>("");

  async function publish() {
    setPublishing(true);
    setLastResult("");
    try {
      const res = await fetch("/api/demo-publish", { method: "POST" });
      const json = (await res.json()) as { publishedAt?: string };
      setLastResult(
        res.ok
          ? `已触发 revalidateTag：${json.publishedAt ?? ""}`
          : `失败：HTTP ${res.status}`
      );
    } catch (e) {
      setLastResult(`失败：${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setPublishing(false);
      router.refresh();
    }
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <button
        type="button"
        onClick={publish}
        disabled={publishing}
        className="inline-flex h-11 items-center justify-center rounded-full bg-foreground px-5 text-background transition-colors disabled:opacity-60"
      >
        {publishing ? "发布中…" : "模拟发布（revalidateTag）"}
      </button>
      <button
        type="button"
        onClick={() => router.refresh()}
        className="inline-flex h-11 items-center justify-center rounded-full border border-solid border-black/[.10] px-5 transition-colors hover:bg-black/[.04] dark:border-white/[.18] dark:hover:bg-[#1a1a1a]"
      >
        刷新页面（router.refresh）
      </button>
      {lastResult ? (
        <div className="text-sm text-zinc-600 dark:text-zinc-400">
          {lastResult}
        </div>
      ) : null}
    </div>
  );
}

