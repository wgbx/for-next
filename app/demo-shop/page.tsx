import { PublishControls } from "./PublishControls";
import { ShopHomeClient } from "./ShopHomeClient";

export default async function DemoShopHomePage() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-3xl flex-col gap-6 px-6 py-16 sm:px-10">
        <h1 className="text-2xl font-semibold tracking-tight text-black dark:text-zinc-50">
          Demo：按需 ISR（revalidateTag）
        </h1>

        <ShopHomeClient />

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
              不同用户/不同浏览器都会请求一次{" "}
              <span className="font-mono">/api/demo-shop-home</span>，但只要没点“模拟发布”，{" "}
              <span className="font-mono">hits</span> 应该保持不变（说明接口背后复用缓存）
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

