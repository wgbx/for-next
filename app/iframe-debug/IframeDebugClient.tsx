"use client";

import { useEffect, useId, useState, type FormEvent } from "react";

const PEAR_ORIGIN = "https://release.pear.us";
const DEFAULT_IFRAME_ID =
  "venue-map-c79a39f1-6da0-4cb8-847c-be6a8c16c614-dz-event";
const DEFAULT_SRC = `${PEAR_ORIGIN}/embed/dz/events/c79a39f1-6da0-4cb8-847c-be6a8c16c614?urlAlias=event&iframeId=${DEFAULT_IFRAME_ID}`;
const DEFAULT_HEIGHT = 999;

type MessageLog = {
  id: string;
  at: string;
  origin: string;
  data: unknown;
  appliedHeight: number | null;
  note: string | null;
};

function formatData(data: unknown): string {
  try {
    return JSON.stringify(data, null, 2);
  } catch {
    return String(data);
  }
}

export function IframeDebugClient() {
  const reactId = useId();
  const [srcDraft, setSrcDraft] = useState(DEFAULT_SRC);
  const [iframeIdDraft, setIframeIdDraft] = useState(DEFAULT_IFRAME_ID);
  const [heightDraft, setHeightDraft] = useState(String(DEFAULT_HEIGHT));

  const [src, setSrc] = useState(DEFAULT_SRC);
  const [iframeId, setIframeId] = useState(DEFAULT_IFRAME_ID);
  const [height, setHeight] = useState(DEFAULT_HEIGHT);
  const [reloadKey, setReloadKey] = useState(0);
  const [logs, setLogs] = useState<MessageLog[]>([]);

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      let appliedHeight: number | null = null;
      let note: string | null = null;

      const data = event.data;
      const isObject = data !== null && typeof data === "object";
      const heightValue =
        isObject && "height" in data ? (data as { height: unknown }).height : null;
      const messageIframeId =
        isObject && "iframeId" in data
          ? (data as { iframeId: unknown }).iframeId
          : null;

      if (
        event.origin === PEAR_ORIGIN &&
        isObject &&
        typeof heightValue === "number" &&
        typeof messageIframeId === "string"
      ) {
        const target = document.getElementById(messageIframeId);
        if (target) {
          target.style.height = `${heightValue}px`;
          appliedHeight = heightValue;
          note = `已应用高度 → #${messageIframeId}`;
          if (messageIframeId === iframeId) {
            setHeight(heightValue);
            setHeightDraft(String(heightValue));
          }
        } else {
          note = `收到高度消息，但未找到 #${messageIframeId}`;
        }
      } else if (event.origin === PEAR_ORIGIN) {
        note = "来自 Pear，但不符合 height + iframeId 结构";
      }

      setLogs((prev) => [
        {
          id: `${reactId}-${Date.now()}-${prev.length}`,
          at: new Date().toLocaleTimeString(),
          origin: event.origin,
          data,
          appliedHeight,
          note,
        },
        ...prev,
      ]);
    }

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [iframeId, reactId]);

  function applyControls(event: FormEvent) {
    event.preventDefault();
    const nextHeight = Number(heightDraft);
    setSrc(srcDraft.trim());
    setIframeId(iframeIdDraft.trim());
    setHeight(Number.isFinite(nextHeight) && nextHeight > 0 ? nextHeight : DEFAULT_HEIGHT);
    setReloadKey((k) => k + 1);
  }

  function reloadIframe() {
    setReloadKey((k) => k + 1);
  }

  function clearLogs() {
    setLogs([]);
  }

  function resetDefaults() {
    setSrcDraft(DEFAULT_SRC);
    setIframeIdDraft(DEFAULT_IFRAME_ID);
    setHeightDraft(String(DEFAULT_HEIGHT));
    setSrc(DEFAULT_SRC);
    setIframeId(DEFAULT_IFRAME_ID);
    setHeight(DEFAULT_HEIGHT);
    setReloadKey((k) => k + 1);
  }

  const script = `
  document.addEventListener("DOMContentLoaded", function () {
    window.addEventListener("message", function (event) {
      if (
        event.origin === "https://release.pear.us" &&
        event.data &&
        typeof event.data === "object" &&
        event.data.height &&
        event.data.iframeId
      ) {
        const iframe = document.getElementById(event.data.iframeId);
        if (iframe) {
          iframe.style.height = event.data.height + "px";
        }
      }
    });
  });
`;
  return (
    <div className="flex flex-col gap-6">
      <form
        onSubmit={applyControls}
        className="flex flex-col gap-4 rounded-xl border border-black/[.08] p-4 dark:border-white/[.14]"
      >
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-zinc-900 dark:text-zinc-50">src</span>
          <input
            value={srcDraft}
            onChange={(e) => setSrcDraft(e.target.value)}
            className="rounded-lg border border-black/[.12] bg-white px-3 py-2 font-mono text-xs text-zinc-900 dark:border-white/[.18] dark:bg-black dark:text-zinc-50"
          />
        </label>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-zinc-900 dark:text-zinc-50">
              iframeId
            </span>
            <input
              value={iframeIdDraft}
              onChange={(e) => setIframeIdDraft(e.target.value)}
              className="rounded-lg border border-black/[.12] bg-white px-3 py-2 font-mono text-xs text-zinc-900 dark:border-white/[.18] dark:bg-black dark:text-zinc-50"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-zinc-900 dark:text-zinc-50">
              初始高度 (px)
            </span>
            <input
              type="number"
              min={1}
              value={heightDraft}
              onChange={(e) => setHeightDraft(e.target.value)}
              className="rounded-lg border border-black/[.12] bg-white px-3 py-2 font-mono text-xs text-zinc-900 dark:border-white/[.18] dark:bg-black dark:text-zinc-50"
            />
          </label>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            className="rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
          >
            应用并加载
          </button>
          <button
            type="button"
            onClick={reloadIframe}
            className="rounded-lg border border-black/[.12] px-3 py-2 text-sm font-medium text-zinc-900 dark:border-white/[.18] dark:text-zinc-50"
          >
            重新加载
          </button>
          <button
            type="button"
            onClick={clearLogs}
            className="rounded-lg border border-black/[.12] px-3 py-2 text-sm font-medium text-zinc-900 dark:border-white/[.18] dark:text-zinc-50"
          >
            清空日志
          </button>
          <button
            type="button"
            onClick={resetDefaults}
            className="rounded-lg border border-black/[.12] px-3 py-2 text-sm font-medium text-zinc-900 dark:border-white/[.18] dark:text-zinc-50"
          >
            恢复默认
          </button>
        </div>

        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          仅处理 origin 为 <code>{PEAR_ORIGIN}</code> 且带{" "}
          <code>height</code> + <code>iframeId</code> 的消息。当前高度：
          <span className="ml-1 font-mono text-zinc-800 dark:text-zinc-200">
            {height}px
          </span>
        </p>
      </form>

      <div className="iframe-section"  id={iframeId} style={{ height }}>
        <iframe
          key={reloadKey}
          // id={iframeId}
          src={src}
          title="Ticket Booking"
          loading="lazy"
          allow="fullscreen; payment"
          sandbox="allow-same-origin allow-forms allow-scripts allow-popups allow-popups-to-escape-sandbox"
          style={{
            width: "100%",
            height: "100%",
            border: "none",
            borderRadius: 10,
            padding: 0,
          }}
        />
      </div>

      <script dangerouslySetInnerHTML={{ __html: script }} />

      <section className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="text-lg font-medium text-black dark:text-zinc-50">
            postMessage 日志
          </h2>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            {logs.length} 条
          </span>
        </div>

        {logs.length === 0 ? (
          <p className="rounded-lg bg-zinc-100 px-4 py-6 text-sm text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
            尚无消息。iframe 加载后若 Pear 发送高度消息，会显示在这里。
          </p>
        ) : (
          <ul className="flex max-h-[28rem] flex-col gap-2 overflow-y-auto">
            {logs.map((log) => (
              <li
                key={log.id}
                className="rounded-lg border border-black/[.08] p-3 text-sm dark:border-white/[.14]"
              >
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-500 dark:text-zinc-400">
                  <span className="font-mono">{log.at}</span>
                  <span className="font-mono">{log.origin}</span>
                  {log.appliedHeight != null && (
                    <span className="rounded bg-emerald-100 px-1.5 py-0.5 font-medium text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                      height={log.appliedHeight}
                    </span>
                  )}
                </div>
                {log.note && (
                  <p className="mt-1 text-xs text-zinc-700 dark:text-zinc-300">
                    {log.note}
                  </p>
                )}
                <pre className="mt-2 overflow-x-auto rounded bg-zinc-100 p-2 font-mono text-xs text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
                  {formatData(log.data)}
                </pre>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
