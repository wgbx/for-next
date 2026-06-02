import { cacheLife, cacheTag } from "next/cache";

type BackendPayload = {
  hits: number;
  backendServedAt: string;
};

declare global {
  // eslint-disable-next-line no-var
  var __demoBackendHits: number | undefined;
}

function incDemoBackendHits() {
  if (globalThis.__demoBackendHits == null) globalThis.__demoBackendHits = 0;
  globalThis.__demoBackendHits += 1;
  return globalThis.__demoBackendHits;
}

export async function getShopHomeData(): Promise<BackendPayload> {
  "use cache";

  // 关键：把“店铺首页数据”放进可按 tag 失效的共享缓存里
  cacheTag("demo:shop-home");
  cacheLife("default");

  const hits = incDemoBackendHits();

  return {
    hits,
    backendServedAt: new Date().toISOString(),
  };
}

