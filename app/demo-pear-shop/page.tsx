import { PublishControlsPear } from "./PublishControlsPear";
import { fetchPearUserByVanityUrl } from "./data";

export default async function DemoPearShopPage() {
  const vanityUrl = "wgbx";
  const result = await fetchPearUserByVanityUrl(vanityUrl);

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-3xl flex-col gap-6 px-6 py-16 sm:px-10">
        <h1 className="text-2xl font-semibold tracking-tight text-black dark:text-zinc-50">
          Demo：Pear 店铺首页（页面缓存 + 按需清除）
        </h1>

        <div className="rounded-2xl border border-black/[.08] bg-white p-6 shadow-sm dark:border-white/[.14] dark:bg-black">
          <div className="text-sm text-zinc-600 dark:text-zinc-400">
            页面 SSR 取数（理想效果：用户 B 进入直接命中页面缓存，不再请求上游）
          </div>

          <div className="mt-4 flex flex-col gap-2 font-mono text-sm text-zinc-900 dark:text-zinc-50">
            <div>vanityUrl={vanityUrl}</div>
            <div>fetchedAt={result.fetchedAt}</div>
            {"url" in result && result.url ? <div>url={result.url}</div> : null}
            {result.ok ? (
              <div>status=ok（页面渲染已拿到数据，无需客户端 loading）</div>
            ) : (
              <div>
                status=error（为避免 Vercel build 失败，此页会降级展示错误，不抛异常）
              </div>
            )}
          </div>

          {result.ok ? (
            <pre className="mt-4 max-h-80 overflow-auto rounded-xl bg-black/[.04] p-4 text-xs text-zinc-900 dark:bg-white/[.06] dark:text-zinc-50">
              {JSON.stringify(result.data, null, 2).slice(0, 4000)}
            </pre>
          ) : (
            <pre className="mt-4 max-h-80 overflow-auto rounded-xl bg-black/[.04] p-4 text-xs text-zinc-900 dark:bg-white/[.06] dark:text-zinc-50">
              {JSON.stringify(result, null, 2).slice(0, 4000)}
            </pre>
          )}
        </div>

        <PublishControlsPear />

        <div className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          说明：本页不再用客户端 fetch，所以不会显示 loading。点击“清除页面缓存”后，下一位用户进入会触发一次上游请求，
          重新生成并缓存页面。
        </div>
      </main>
    </div>
  );
}

