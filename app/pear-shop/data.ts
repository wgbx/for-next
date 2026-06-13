const DEFAULT_BASE_URL = "https://staging.katana-api.1m.app";
const TAG = "demo:pear-shop:wgbx";

export type PearVanityUser = unknown;

export type PearFetchOk = {
  ok: true;
  vanityUrl: string;
  fetchedAt: string;
  baseUrl: string;
  url: string;
  data: PearVanityUser;
};

export type PearFetchErr = {
  ok: false;
  vanityUrl: string;
  fetchedAt: string;
  url?: string;
  status?: number;
  body?: string;
  error?: string;
};

export async function fetchPearUserByVanityUrl(vanityUrl: string): Promise<PearFetchOk | PearFetchErr> {
  const baseUrls = ["https://katana-api.1m.app", DEFAULT_BASE_URL];
  const path = `/user/vanity-url/${encodeURIComponent(vanityUrl)}`;

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
          next: { tags: [TAG], revalidate: 900 },
          headers: {
            accept: "application/json",
            "user-agent": "isr-next-demo/1.0",
          },
          signal: controller.signal,
        });

        usedUrl = url;

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

  // 注意：Next 在 prerender 期对 new Date() 很敏感；用上游响应时间/HTTP Date 更稳
  const fetchedAt = res?.headers?.get("date") ?? "";

  if (!res?.ok) {
    const text = res ? await res.text().catch(() => "") : "";
    return {
      ok: false,
      vanityUrl,
      fetchedAt,
      url: usedUrl?.toString(),
      status: res?.status,
      body: text.slice(0, 300),
      error: lastErr instanceof Error ? lastErr.message : undefined,
    };
  }

  return {
    ok: true,
    vanityUrl,
    fetchedAt,
    baseUrl: usedUrl ? `${usedUrl.protocol}//${usedUrl.host}` : baseUrls[0],
    url: usedUrl?.toString() ?? "",
    data: (await res.json()) as PearVanityUser,
  };
}

export const PEAR_DEMO_TAG = TAG;
export const PEAR_DEFAULT_BASE_URL = DEFAULT_BASE_URL;

