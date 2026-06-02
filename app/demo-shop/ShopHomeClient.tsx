"use client";

import { useEffect, useState } from "react";

type ApiPayload = {
  hits: number;
  backendServedAt: string;
  servedBy: string;
};

export function ShopHomeClient() {
  const [data, setData] = useState<ApiPayload | null>(null);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/demo-shop-home", { method: "GET" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setData((await res.json()) as ApiPayload);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="rounded-2xl border border-black/[.08] bg-white p-6 shadow-sm dark:border-white/[.14] dark:bg-black">
      <div className="text-sm text-zinc-600 dark:text-zinc-400">
        客户端请求接口（每个用户都会请求一次，但接口背后应复用缓存）
      </div>

      <div className="mt-4 flex flex-col gap-2 font-mono text-sm text-zinc-900 dark:text-zinc-50">
        {loading ? <div>loading…</div> : null}
        {error ? <div className="text-red-600 dark:text-red-400">{error}</div> : null}
        {data ? (
          <>
            <div>servedBy={data.servedBy}</div>
            <div>hits={data.hits}</div>
            <div>backendServedAt={data.backendServedAt}</div>
          </>
        ) : null}
      </div>

      <div className="mt-4">
        <button
          type="button"
          onClick={() => void load()}
          className="inline-flex h-11 items-center justify-center rounded-full border border-solid border-black/[.10] px-5 transition-colors hover:bg-black/[.04] dark:border-white/[.18] dark:hover:bg-[#1a1a1a]"
        >
          只刷新接口（不刷新整页）
        </button>
      </div>
    </div>
  );
}

