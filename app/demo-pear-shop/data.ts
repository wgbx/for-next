const DEFAULT_BASE_URL = "https://staging.katana-api.1m.app";
const TAG = "demo:pear-shop:wgbx";

export type PearVanityUser = unknown;

export async function getPearUserByVanityUrl(vanityUrl: string) {
  const baseUrl = process.env.NEXT_PUBLIC_SERVER_HOST_ENV ?? DEFAULT_BASE_URL;
  const url = new URL(`/user/vanity-url/${encodeURIComponent(vanityUrl)}`, baseUrl);

  const res = await fetch(url, {
    next: { tags: [TAG], revalidate: 900 },
    headers: { accept: "application/json" },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Pear API failed: HTTP ${res.status} ${text}`.slice(0, 300));
  }

  return {
    vanityUrl,
    fetchedAt: new Date().toISOString(),
    baseUrl,
    data: (await res.json()) as PearVanityUser,
  };
}

export const PEAR_DEMO_TAG = TAG;
export const PEAR_DEFAULT_BASE_URL = DEFAULT_BASE_URL;

