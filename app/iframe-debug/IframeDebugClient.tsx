"use client";

import {
  useEffect,
  useId,
  useState,
  type CSSProperties,
  type FormEvent,
} from "react";

/** 推荐交给宿主 A 的写法：section 定高占位，iframe height:100%；收到高度后只改 section */
const RELEASE_ORIGIN = "https://release.pear.us";
/** katana-web 本地默认（apps/web-common LOCAL_HOST） */
const LOCAL_ORIGIN = "http://localhost:3000";

const DEFAULT_SNIPPET = `<div class="iframe-section" style="height: 640px;">
  <iframe
    style="width: 100%; height: 100%; border: none; border-radius: 10px; padding: 0px"
    id="venue-map-c79a39f1-6da0-4cb8-847c-be6a8c16c614-dz-event"
    sandbox="allow-same-origin allow-forms allow-scripts allow-popups allow-popups-to-escape-sandbox"
    src="${RELEASE_ORIGIN}/embed/dz/events/c79a39f1-6da0-4cb8-847c-be6a8c16c614?urlAlias=event&iframeId=venue-map-c79a39f1-6da0-4cb8-847c-be6a8c16c614-dz-event"
    title="Ticket Booking"
    loading="lazy"
    allow="fullscreen; payment"
  ></iframe>
</div>

<script>
  document.addEventListener("DOMContentLoaded", function () {
    window.addEventListener("message", function (event) {
      if (
        event.origin === "${RELEASE_ORIGIN}" &&
        event.data &&
        typeof event.data === "object" &&
        event.data.height &&
        event.data.iframeId
      ) {
        const iframe = document.getElementById(event.data.iframeId);
        if (iframe) {
          const section = iframe.closest(".iframe-section");
          if (section) {
            section.style.height = event.data.height + "px";
          }
        }
      }
    });
  });
</script>`;

function toLocalSnippet(snippet: string): string {
  return snippet.replaceAll(RELEASE_ORIGIN, LOCAL_ORIGIN);
}

type ParsedEmbed = {
  sectionHeight: string;
  iframeId: string;
  src: string;
  title: string;
  sandbox: string;
  allow: string;
  loading: "eager" | "lazy" | undefined;
  iframeStyle: string;
  allowedOrigin: string | null;
};

const DEFAULT_IFRAME_ID =
  "venue-map-c79a39f1-6da0-4cb8-847c-be6a8c16c614-dz-event";

/** SSR-safe default — do not call DOMParser during prerender / useState init. */
const DEFAULT_EMBED: ParsedEmbed = {
  sectionHeight: "640px",
  iframeId: DEFAULT_IFRAME_ID,
  src: `${RELEASE_ORIGIN}/embed/dz/events/c79a39f1-6da0-4cb8-847c-be6a8c16c614?urlAlias=event&iframeId=${DEFAULT_IFRAME_ID}`,
  title: "Ticket Booking",
  sandbox:
    "allow-same-origin allow-forms allow-scripts allow-popups allow-popups-to-escape-sandbox",
  allow: "fullscreen; payment",
  loading: "lazy",
  iframeStyle:
    "width: 100%; height: 100%; border: none; border-radius: 10px; padding: 0px",
  allowedOrigin: RELEASE_ORIGIN,
};

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

function cssTextToStyle(cssText: string): CSSProperties {
  return Object.fromEntries(
    cssText
      .split(";")
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const idx = part.indexOf(":");
        if (idx === -1) return null;
        const prop = part.slice(0, idx).trim();
        const value = part.slice(idx + 1).trim();
        const camel = prop.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
        return [camel, value] as const;
      })
      .filter((entry): entry is readonly [string, string] => entry != null),
  ) as CSSProperties;
}

/** 浏览器扩展等噪声，不进调试日志 */
function isNoiseMessage(data: unknown): boolean {
  if (data === null || typeof data !== "object") return false;
  const source = (data as { source?: unknown }).source;
  return (
    typeof source === "string" &&
    (source.startsWith("react-devtools") ||
      source === "react-devtools-content-script")
  );
}

function readSectionPlaceholderHeight(section: Element | null): string {
  const style = section?.getAttribute("style") ?? "";
  return (
    style.match(/(?:^|;)\s*height:\s*([^;]+)/i)?.[1]?.trim() ??
    style.match(/min-height:\s*([^;]+)/i)?.[1]?.trim() ??
    "640px"
  );
}

/** 宿主推荐：只改 .iframe-section 的 height；iframe 保持 height:100% 跟着走 */
function applyHostHeight(iframe: HTMLElement, heightPx: string) {
  const section = iframe.closest(".iframe-section");
  if (section instanceof HTMLElement) {
    section.style.height = heightPx;
  }
}

function parseEmbedSnippet(snippet: string): ParsedEmbed | { error: string } {
  if (typeof DOMParser === "undefined") {
    return { error: "当前环境无法解析 HTML，请在浏览器中点击「应用并加载」。" };
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(snippet, "text/html");
  const section = doc.querySelector(".iframe-section");
  const iframe = doc.querySelector("iframe");

  if (!iframe) {
    return { error: "未找到 <iframe>，请粘贴完整宿主嵌入代码。" };
  }

  const src = iframe.getAttribute("src")?.trim() ?? "";
  const iframeId = iframe.getAttribute("id")?.trim() ?? "";
  if (!src) return { error: "iframe 缺少 src。" };
  if (!iframeId) return { error: "iframe 缺少 id（高度消息需要用它定位）。" };

  const originMatch = snippet.match(/event\.origin\s*===\s*["']([^"']+)["']/);
  const loadingAttr = iframe.getAttribute("loading");
  const loading =
    loadingAttr === "lazy" || loadingAttr === "eager" ? loadingAttr : undefined;

  return {
    sectionHeight: readSectionPlaceholderHeight(section),
    iframeId,
    src,
    title: iframe.getAttribute("title") ?? "Ticket Booking",
    sandbox: iframe.getAttribute("sandbox") ?? "",
    allow: iframe.getAttribute("allow") ?? "",
    loading,
    iframeStyle:
      iframe.getAttribute("style") ??
      "width: 100%; height: 100%; border: none; border-radius: 10px; padding: 0px",
    allowedOrigin: originMatch?.[1] ?? null,
  };
}

function toLocalEmbed(embed: ParsedEmbed): ParsedEmbed {
  return {
    ...embed,
    src: embed.src.replaceAll(RELEASE_ORIGIN, LOCAL_ORIGIN),
    allowedOrigin:
      embed.allowedOrigin === RELEASE_ORIGIN
        ? LOCAL_ORIGIN
        : embed.allowedOrigin?.replaceAll(RELEASE_ORIGIN, LOCAL_ORIGIN) ?? null,
  };
}

export function IframeDebugClient() {
  const reactId = useId();
  const [snippet, setSnippet] = useState(DEFAULT_SNIPPET);
  const [parseError, setParseError] = useState<string | null>(null);
  const [embed, setEmbed] = useState<ParsedEmbed>(DEFAULT_EMBED);
  const [reloadKey, setReloadKey] = useState(0);
  const [liveHeight, setLiveHeight] = useState<string | null>(null);
  const [logs, setLogs] = useState<MessageLog[]>([]);

  useEffect(() => {
    const allowedOrigin = embed.allowedOrigin;

    function onMessage(event: MessageEvent) {
      const data = event.data;
      if (isNoiseMessage(data)) return;
      if (allowedOrigin != null && event.origin !== allowedOrigin) return;

      let appliedHeight: number | null = null;
      let note: string | null = null;
      const isObject = data !== null && typeof data === "object";
      const heightValue =
        isObject && "height" in data ? (data as { height: unknown }).height : null;
      const messageIframeId =
        isObject && "iframeId" in data
          ? (data as { iframeId: unknown }).iframeId
          : null;

      if (
        isObject &&
        typeof heightValue === "number" &&
        typeof messageIframeId === "string"
      ) {
        // 忽略明显未就绪的高度（如仅 header 的 52），避免把 iframe 缩崩
        if (heightValue < 120) {
          note = `忽略过小高度 ${heightValue}（疑似仅 header / 加载中）`;
        } else {
          const px = `${heightValue}px`;
          if (messageIframeId === embed.iframeId) {
            setLiveHeight(px);
            appliedHeight = heightValue;
            note = `已应用高度到 .iframe-section → #${messageIframeId}`;
          } else {
            const target = document.getElementById(messageIframeId);
            if (target) {
              applyHostHeight(target, px);
              appliedHeight = heightValue;
              note = `已应用高度到 .iframe-section → #${messageIframeId}`;
            } else {
              note = `收到高度消息，但未找到 #${messageIframeId}`;
            }
          }
        }
      } else {
        note = "来自允许的 origin，但不符合 height + iframeId 结构";
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
  }, [embed.allowedOrigin, embed.iframeId, reactId]);

  function loadParsed(nextSnippet: string) {
    const parsed = parseEmbedSnippet(nextSnippet);
    if ("error" in parsed) {
      setParseError(parsed.error);
      return;
    }
    setSnippet(nextSnippet);
    setParseError(null);
    setEmbed(parsed);
    setLiveHeight(null);
    setReloadKey((k) => k + 1);
  }

  function applySnippet(event: FormEvent) {
    event.preventDefault();
    loadParsed(snippet);
  }

  function resetDefaults() {
    setSnippet(DEFAULT_SNIPPET);
    setParseError(null);
    setEmbed(DEFAULT_EMBED);
    setLiveHeight(null);
    setReloadKey((k) => k + 1);
  }

  function loadLocal() {
    if (snippet.includes(RELEASE_ORIGIN)) {
      loadParsed(toLocalSnippet(snippet));
      return;
    }
    if (snippet.includes(LOCAL_ORIGIN)) {
      loadParsed(snippet);
      return;
    }
    setSnippet(toLocalSnippet(DEFAULT_SNIPPET));
    setParseError(null);
    setEmbed(toLocalEmbed(DEFAULT_EMBED));
    setLiveHeight(null);
    setReloadKey((k) => k + 1);
  }

  const sectionStyle: CSSProperties = {
    height: liveHeight ?? embed.sectionHeight,
  };

  return (
    <div className="flex flex-col gap-6">
      <form
        onSubmit={applySnippet}
        className="flex flex-col gap-3 rounded-xl border border-black/[.08] p-4 dark:border-white/[.14]"
      >
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-zinc-900 dark:text-zinc-50">
            宿主嵌入代码
          </span>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            粘贴交给宿主 A 的整段 HTML +
            script。推荐：section 用 height 占位，iframe 用 height:100%；收到 B
            的高度后只改 section。
          </span>
          <textarea
            value={snippet}
            onChange={(e) => setSnippet(e.target.value)}
            rows={18}
            spellCheck={false}
            className="mt-1 rounded-lg border border-black/[.12] bg-white px-3 py-2 font-mono text-xs leading-5 text-zinc-900 dark:border-white/[.18] dark:bg-black dark:text-zinc-50"
          />
        </label>

        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            className="rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
          >
            应用并加载
          </button>
          <button
            type="button"
            onClick={() => {
              setLiveHeight(null);
              setReloadKey((k) => k + 1);
            }}
            className="rounded-lg border border-black/[.12] px-3 py-2 text-sm font-medium text-zinc-900 dark:border-white/[.18] dark:text-zinc-50"
          >
            重新加载
          </button>
          <button
            type="button"
            onClick={() => setLogs([])}
            className="rounded-lg border border-black/[.12] px-3 py-2 text-sm font-medium text-zinc-900 dark:border-white/[.18] dark:text-zinc-50"
          >
            清空日志
          </button>
          <button
            type="button"
            onClick={loadLocal}
            className="rounded-lg border border-black/[.12] px-3 py-2 text-sm font-medium text-zinc-900 dark:border-white/[.18] dark:text-zinc-50"
            title={`将 src / origin 切到 ${LOCAL_ORIGIN}（需本地跑 katana-web）`}
          >
            加载本地
          </button>
          <button
            type="button"
            onClick={resetDefaults}
            className="rounded-lg border border-black/[.12] px-3 py-2 text-sm font-medium text-zinc-900 dark:border-white/[.18] dark:text-zinc-50"
          >
            恢复默认
          </button>
        </div>

        {parseError && (
          <p className="text-sm text-rose-600 dark:text-rose-400">{parseError}</p>
        )}

        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          当前：
          <code className="ml-1">id={embed.iframeId}</code>
          {embed.allowedOrigin && (
            <>
              {" · "}
              <code>origin={embed.allowedOrigin}</code>
            </>
          )}
          {" · "}
          <code>
            {liveHeight
              ? `applied=${liveHeight}`
              : `placeholder height=${embed.sectionHeight}`}
          </code>
        </p>
      </form>

      <div className="iframe-section" style={sectionStyle}>
        <iframe
          key={reloadKey}
          id={embed.iframeId}
          src={embed.src}
          title={embed.title}
          loading={embed.loading}
          allow={embed.allow || undefined}
          sandbox={embed.sandbox || undefined}
          style={cssTextToStyle(embed.iframeStyle)}
        />
      </div>

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
            尚无消息。收到 B 的 height + iframeId 后，会更新{" "}
            <code>.iframe-section</code> 高度（iframe 仍为 height:100%）。
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
