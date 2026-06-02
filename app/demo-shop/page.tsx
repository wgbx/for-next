import { PublishControls } from "./PublishControls";

type BackendPayload = {
  hits: number;
  backendServedAt: string;
};

async function getShopHomeData(): Promise<BackendPayload> {
  const res = await fetch("http://localhost:3000/api/demo-backend", {
    // 关键：给这份数据打 tag，后续用 revalidateTag 精确失效。
    next: { tags: ["demo:shop-home"] },
  });

  if (!res.ok) {
    throw new Error(`demo-backend failed: HTTP ${res.status}`);
  }

  return (await res.json()) as BackendPayload;
}

export default async function DemoShopHomePage() {
  const data = await getShopHomeData();
  const renderedAt = new Date().toISOString();

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-3xl flex-col gap-6 px-6 py-16 sm:px-10">
        <h1 className="text-2xl font-semibold tracking-tight text-black dark:text-zinc-50">
          Demo：按需 ISR（revalidateTag）
        </h1>

        <div className="rounded-2xl border border-black/[.08] bg-white p-6 shadow-sm dark:border-white/[.14] dark:bg-black">
          <div className="text-sm text-zinc-600 dark:text-zinc-400">
            页面渲染时间（renderedAt）
          </div>
          <div className="mt-1 font-mono text-sm text-zinc-900 dark:text-zinc-50">
            {renderedAt}
          </div>

          <div className="mt-5 text-sm text-zinc-600 dark:text-zinc-400">
            伪后端命中次数（hits）与后端响应时间（backendServedAt）
          </div>
          <div className="mt-1 font-mono text-sm text-zinc-900 dark:text-zinc-50">
            hits={data.hits} · backendServedAt={data.backendServedAt}
          </div>
        </div>

        <PublishControls />

        <div className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          <div className="font-medium text-zinc-900 dark:text-zinc-50">
            如何验证“用户 A 访问后，用户 B 不再打后端”
          </div>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>
              建议用生产模式：先 <span className="font-mono">pnpm build</span>{" "}
              再 <span className="font-mono">pnpm start</span>
            </li>
            <li>
              打开此页面两次（不同浏览器/无痕也行）：只要没点“模拟发布”，{" "}
              <span className="font-mono">hits</span> 应该保持不变（复用缓存）
            </li>
            <li>
              点击“模拟发布（revalidateTag）”后再刷新：{" "}
              <span className="font-mono">hits</span> 会 +1（触发重新生成/重新拉取）
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
}

