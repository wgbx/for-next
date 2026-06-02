import Link from "next/link";
import { PublishControls } from "./PublishControls";
import { getShopHomeData } from "./data";

export default async function DemoShopHomePage() {
  const data = await getShopHomeData();

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-3xl flex-col gap-6 px-6 py-16 sm:px-10">
        <h1 className="text-2xl font-semibold tracking-tight text-black dark:text-zinc-50">
          Demo：页面缓存（用户间复用，发布后更新）
        </h1>

        <div className="text-sm text-zinc-600 dark:text-zinc-400">
          想看“接口缓存”请去{" "}
          <Link
            href="/demo-shop-api"
            className="font-medium text-zinc-900 dark:text-zinc-50 underline"
          >
            /demo-shop-api
          </Link>
        </div>

        <div className="rounded-2xl border border-black/[.08] bg-white p-6 shadow-sm dark:border-white/[.14] dark:bg-black">
          <div className="text-sm text-zinc-600 dark:text-zinc-400">
            这页是服务端渲染 + 页面级缓存（没有客户端请求接口）
          </div>

          <div className="mt-4 flex flex-col gap-2 font-mono text-sm text-zinc-900 dark:text-zinc-50">
            <div>hits={data.hits}</div>
            <div>backendServedAt={data.backendServedAt}</div>
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
              用户 A 先打开 <span className="font-mono">/demo-shop</span>（触发一次取数），
              然后用户 B 打开同一个页面：只要没点“模拟发布”，{" "}
              <span className="font-mono">hits</span> 应该保持不变（说明页面结果被复用）
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

