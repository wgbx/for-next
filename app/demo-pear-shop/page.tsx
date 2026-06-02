import { PublishControlsPear } from "./PublishControlsPear";
import { fetchPearUserByVanityUrl } from "./data";

type PearApiEnvelope = {
  code?: number;
  message?: string;
  request_id?: string;
  data?: {
    id?: string;
    email?: string;
    storeName?: string;
    vanityUrl?: string;
    logo?: string;
    description?: string;
    subTitle?: string;
    pearVerified?: boolean;
    backgroundImage?: string;
    supportEmail?: string;
    socialMedias?: Array<{ type?: string; account?: string }>;
    storeFront?: {
      themeName?: string;
      postThemeName?: string;
      fonts?: unknown;
      colors?: Record<string, string>;
      storeTabs?: Array<{ name?: string; checked?: boolean }>;
    };
  };
};

export default async function DemoPearShopPage() {
  const vanityUrl = "wgbx";
  const result = await fetchPearUserByVanityUrl(vanityUrl);

  const envelope = (result.ok ? (result.data as PearApiEnvelope) : null) ?? null;
  const shop = envelope?.data;
  const colors = shop?.storeFront?.colors ?? null;
  const fonts = shop?.storeFront?.fonts ?? null;
  const tabs = shop?.storeFront?.storeTabs ?? null;
  const socials = shop?.socialMedias ?? null;

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
            <>
              <div className="mt-5 grid grid-cols-[72px_1fr] gap-4 rounded-xl border border-black/[.06] p-4 dark:border-white/[.10]">
                <div className="h-[72px] w-[72px] overflow-hidden rounded-xl bg-black/[.04] dark:bg-white/[.06]">
                  {shop?.logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      alt="logo"
                      src={shop.logo}
                      className="h-full w-full object-cover"
                    />
                  ) : null}
                </div>
                <div className="flex flex-col gap-1">
                  <div className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                    {shop?.storeName ?? "(missing storeName)"}
                    {shop?.pearVerified ? (
                      <span className="ml-2 rounded-full bg-black/[.06] px-2 py-1 text-xs font-medium dark:bg-white/[.10]">
                        PEAR VERIFIED
                      </span>
                    ) : null}
                  </div>
                  <div className="text-sm text-zinc-600 dark:text-zinc-400">
                    vanityUrl={shop?.vanityUrl ?? "(missing vanityUrl)"} · theme=
                    {shop?.storeFront?.themeName ?? "?"} / postTheme=
                    {shop?.storeFront?.postThemeName ?? "?"}
                  </div>
                  <div className="text-sm text-zinc-600 dark:text-zinc-400">
                    id={shop?.id ?? "?"} · email={shop?.email ?? "?"}
                  </div>
                  {shop?.subTitle ? (
                    <div className="text-sm text-zinc-700 dark:text-zinc-300">
                      {shop.subTitle}
                    </div>
                  ) : null}
                  {shop?.description ? (
                    <div className="text-sm text-zinc-700 dark:text-zinc-300">
                      {shop.description}
                    </div>
                  ) : null}
                  {shop?.backgroundImage ? (
                    <div className="text-sm text-zinc-600 dark:text-zinc-400 break-all">
                      backgroundImage={shop.backgroundImage}
                    </div>
                  ) : null}
                  {shop?.supportEmail ? (
                    <div className="text-sm text-zinc-600 dark:text-zinc-400">
                      supportEmail={shop.supportEmail}
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="mt-5 text-sm text-zinc-600 dark:text-zinc-400">
                上游响应摘要：code={envelope?.code ?? "?"} · message=
                {envelope?.message ?? "?"} · request_id={envelope?.request_id ?? "?"}
              </div>

              {socials?.length ? (
                <div className="mt-4">
                  <div className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                    socialMedias
                  </div>
                  <pre className="mt-2 max-h-56 overflow-auto rounded-xl bg-black/[.04] p-4 text-xs text-zinc-900 dark:bg-white/[.06] dark:text-zinc-50">
                    {JSON.stringify(socials, null, 2).slice(0, 12000)}
                  </pre>
                </div>
              ) : null}

              {tabs?.length ? (
                <div className="mt-4">
                  <div className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                    storeFront.storeTabs
                  </div>
                  <pre className="mt-2 max-h-56 overflow-auto rounded-xl bg-black/[.04] p-4 text-xs text-zinc-900 dark:bg-white/[.06] dark:text-zinc-50">
                    {JSON.stringify(tabs, null, 2).slice(0, 12000)}
                  </pre>
                </div>
              ) : null}

              {colors ? (
                <div className="mt-4">
                  <div className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                    storeFront.colors（更长截断）
                  </div>
                  <pre className="mt-2 max-h-80 overflow-auto rounded-xl bg-black/[.04] p-4 text-xs text-zinc-900 dark:bg-white/[.06] dark:text-zinc-50">
                    {JSON.stringify(colors, null, 2).slice(0, 12000)}
                  </pre>
                </div>
              ) : (
                <div className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
                  storeFront.colors 缺失
                </div>
              )}

              {fonts ? (
                <div className="mt-4">
                  <div className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                    storeFront.fonts（截断）
                  </div>
                  <pre className="mt-2 max-h-80 overflow-auto rounded-xl bg-black/[.04] p-4 text-xs text-zinc-900 dark:bg-white/[.06] dark:text-zinc-50">
                    {JSON.stringify(fonts, null, 2).slice(0, 12000)}
                  </pre>
                </div>
              ) : null}

              <div className="mt-4">
                <div className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  原始 JSON（更长截断，方便对照）
                </div>
                <pre className="mt-2 max-h-[520px] overflow-auto rounded-xl bg-black/[.04] p-4 text-xs text-zinc-900 dark:bg-white/[.06] dark:text-zinc-50">
                  {JSON.stringify(result.data, null, 2).slice(0, 20000)}
                </pre>
              </div>
            </>
          ) : (
            <pre className="mt-4 max-h-80 overflow-auto rounded-xl bg-black/[.04] p-4 text-xs text-zinc-900 dark:bg-white/[.06] dark:text-zinc-50">
              {JSON.stringify(result, null, 2).slice(0, 20000)}
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

