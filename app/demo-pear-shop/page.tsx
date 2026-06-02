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
          说明：这是“接口缓存”形态：每个用户进入都会在浏览器请求一次本项目的 API，所以一定会出现 loading；
          但只要没点“模拟发布”，本项目在服务端会复用外部后端接口的缓存响应，避免每个用户都打外部后端。
        </div>
      </main>
    </div>
  );
}

