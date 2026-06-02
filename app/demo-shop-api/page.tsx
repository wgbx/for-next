import Link from "next/link";
import { PublishControls } from "../demo-shop/PublishControls";
import { ShopHomeClient } from "../demo-shop/ShopHomeClient";

export default async function DemoShopApiPage() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-3xl flex-col gap-6 px-6 py-16 sm:px-10">
        <h1 className="text-2xl font-semibold tracking-tight text-black dark:text-zinc-50">
          Demo：接口缓存（客户端每次请求，但后端取数复用缓存）
        </h1>

        <div className="text-sm text-zinc-600 dark:text-zinc-400">
          想看“页面缓存”请去{" "}
          <Link href="/demo-shop" className="font-medium text-zinc-900 dark:text-zinc-50 underline">
            /demo-shop
          </Link>
        </div>

        <ShopHomeClient />

        <PublishControls />
      </main>
    </div>
  );
}

