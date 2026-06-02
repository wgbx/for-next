"use client";

import { useEffect, useState } from "react";

type ApiPayload =
  | {
      ok: true;
      baseUrl: string;
      vanityUrl: string;
      apiHits: number;
      fetchedAt: string;
      data: unknown;
    }
  | {
      ok: false;
      status: number;
      body: string;
    };

export function PearShopClient() {
  const [loading, setLoading] = useState(true);
  const [payload, setPayload] = useState<ApiPayload | null>(null);
  const [error, setError] = useState<string>("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/demo-pear-user");
      const json = (await res.json()) as ApiPayload;
      setPayload(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setPayload(null);
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
        客户端请求 <span className="font-mono">/api/demo-pear-user</span>，由 Next 在服务端缓存“外部后端”的响应
      </div>

      <div className="mt-4 flex flex-col gap-2 font-mono text-sm text-zinc-900 dark:text-zinc-50">
        {loading ? <div>loading…</div> : null}
        {error ? <div className="text-red-600 dark:text-red-400">{error}</div> : null}
        {payload?.ok ? (
          <>
            <div>apiHits={payload.apiHits}</div>
            <div>fetchedAt={payload.fetchedAt}</div>
            <div>
              source={payload.baseUrl}/user/vanity-url/{payload.vanityUrl}
            </div>
            <pre className="mt-2 max-h-72 overflow-auto rounded-xl bg-black/[.04] p-4 text-xs dark:bg-white/[.06]">
              {JSON.stringify(payload.data, null, 2).slice(0, 4000)}
            </pre>
          </>
        ) : payload?.ok === false ? (
          <div>
            upstream failed: HTTP {payload.status} {payload.body}
          </div>
        ) : null}
      </div>

      <div className="mt-4">
        <button
          type="button"
          onClick={() => void load()}
          className="inline-flex h-11 items-center justify-center rounded-full border border-solid border-black/[.10] px-5 transition-colors hover:bg-black/[.04] dark:border-white/[.18] dark:hover:bg-[#1a1a1a]"
        >
          只刷新接口
        </button>
      </div>
    </div>
  );
}

