import { NextResponse } from "next/server";

import {
  PEAR_DEFAULT_BASE_URL,
  PEAR_DEMO_TAG,
  type PearVanityUser,
} from "@/app/pear-shop/data";

declare global {
  // eslint-disable-next-line no-var
  var __demoPearApiHits: number | undefined;
}

function incHits() {
  if (globalThis.__demoPearApiHits == null) globalThis.__demoPearApiHits = 0;
  globalThis.__demoPearApiHits += 1;
  return globalThis.__demoPearApiHits;
}

export async function GET() {
  const vanityUrl = "wgbx";
  const baseUrls = ["https://katana-api.1m.app", PEAR_DEFAULT_BASE_URL];
  const path = `/user/vanity-url/${encodeURIComponent(vanityUrl)}`;

  // 关键：对“外部后端服务”的请求结果做 tag 缓存
  const MAX_RETRIES = 2;
  const TIMEOUT_MS = 8000;

  let lastErr: unknown;
  let res: Response | null = null;
  let usedUrl: URL | null = null;

  for (const baseUrl of baseUrls) {
    const url = new URL(path, baseUrl);

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
      const controller = new AbortController();
      const t = setTimeout(() => controller.abort(), TIMEOUT_MS);
      try {
        res = await fetch(url, {
          next: { tags: [PEAR_DEMO_TAG], revalidate: 900 },
          headers: {
            accept: "application/json",
            "user-agent": "isr-next-demo/1.0",
          },
          signal: controller.signal,
        });

        usedUrl = url;

        // 上游 502/503/504 很常见是临时网关抖动，做有限重试
        if ([502, 503, 504].includes(res.status) && attempt < MAX_RETRIES) {
          await new Promise((r) => setTimeout(r, 250 * (attempt + 1)));
          continue;
        }

        break;
      } catch (e) {
        lastErr = e;
        usedUrl = url;
        if (attempt >= MAX_RETRIES) break;
        await new Promise((r) => setTimeout(r, 250 * (attempt + 1)));
      } finally {
        clearTimeout(t);
      }
    }

    if (res?.ok) break;
  }

  if (!res?.ok) {
    const text = res ? await res.text().catch(() => "") : "";
    return NextResponse.json(
      {
        ok: false,
        status: res?.status ?? 0,
        body: text.slice(0, 300),
        url: usedUrl?.toString(),
        hint: "已按顺序尝试：prod(https://katana-api.1m.app) → staging",
        error: lastErr instanceof Error ? lastErr.message : undefined,
      },
      { status: 502 }
    );
  }

  const apiHits = incHits();

  return NextResponse.json({
    ok: true,
    baseUrl: usedUrl ? `${usedUrl.protocol}//${usedUrl.host}` : baseUrls[0],
    vanityUrl,
    apiHits,
    fetchedAt: new Date().toISOString(),
    data: (await res.json()) as PearVanityUser,
  });
}

