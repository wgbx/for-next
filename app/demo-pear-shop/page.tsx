import { PearShopClient } from "./PearShopClient";
import { PublishControlsPear } from "./PublishControlsPear";

export default async function DemoPearShopPage() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-3xl flex-col gap-6 px-6 py-16 sm:px-10">
        <h1 className="text-2xl font-semibold tracking-tight text-black dark:text-zinc-50">
          Demo：Pear 店铺首页（真实接口 + 按需失效）
        </h1>

        <PearShopClient />

        <PublishControlsPear />

        <div className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          说明：这里演示的是“对外部后端接口做缓存”。每个用户都会请求一次本页里的 API，但只要没点“模拟发布”，
          由于外部请求被 tag 缓存，<span className="font-mono">apiHits</span> 不会每次都变化。
        </div>
      </main>
    </div>
  );
}

