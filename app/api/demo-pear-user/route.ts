import { NextResponse } from "next/server";

import {
  PEAR_DEFAULT_BASE_URL,
  PEAR_DEMO_TAG,
  type PearVanityUser,
} from "@/app/demo-pear-shop/data";

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
  const baseUrl = process.env.NEXT_PUBLIC_SERVER_HOST_ENV ?? PEAR_DEFAULT_BASE_URL;
  const url = new URL(`/user/vanity-url/${encodeURIComponent(vanityUrl)}`, baseUrl);

  // 关键：对“外部后端服务”的请求结果做 tag 缓存
  const res = await fetch(url, {
    next: { tags: [PEAR_DEMO_TAG] },
    headers: { accept: "application/json" },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    return NextResponse.json(
      { ok: false, status: res.status, body: text.slice(0, 300) },
      { status: 502 }
    );
  }

  const apiHits = incHits();

  return NextResponse.json({
    ok: true,
    baseUrl,
    vanityUrl,
    apiHits,
    fetchedAt: new Date().toISOString(),
    data: (await res.json()) as PearVanityUser,
  });
}

