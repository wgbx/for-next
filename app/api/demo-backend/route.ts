import { NextResponse } from "next/server";

declare global {
  // eslint-disable-next-line no-var
  var __demoBackendHits: number | undefined;
}

function getHitsStore() {
  if (globalThis.__demoBackendHits == null) globalThis.__demoBackendHits = 0;
  return {
    get: () => globalThis.__demoBackendHits ?? 0,
    inc: () => {
      globalThis.__demoBackendHits = (globalThis.__demoBackendHits ?? 0) + 1;
      return globalThis.__demoBackendHits;
    },
  };
}

export async function GET() {
  const store = getHitsStore();
  const hits = store.inc();

  return NextResponse.json({
    hits,
    backendServedAt: new Date().toISOString(),
  });
}

