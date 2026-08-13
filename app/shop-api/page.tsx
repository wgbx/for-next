import Link from "next/link";
import { routes } from "@/app/routes";
import { PublishControls } from "../shop/PublishControls";
import { ShopHomeClient } from "../shop/ShopHomeClient";

export default async function DemoShopApiPage() {
  return (
    <div className="flex flex-col flex-1 items-center bg-zinc-50 font-sans dark:bg-zinc-950">
      <main className="flex flex-1 w-full max-w-5xl flex-col gap-6 py-16 px-6 sm:px-16 bg-white dark:bg-zinc-900">
        <h1 className="text-2xl font-semibold tracking-tight text-black dark:text-zinc-50">
          Demo：接口缓存（客户端每次请求，但后端取数复用缓存）
        </h1>

        <div className="text-sm text-zinc-600 dark:text-zinc-400">
          想看“页面缓存”请去{" "}
          <Link href={routes.shop} className="font-medium text-zinc-900 dark:text-zinc-50 underline">
            {routes.shop}
          </Link>
        </div>

        <ShopHomeClient />

        <PublishControls />
      </main>
    </div>
  );
}

