import { ReactQueryDemo } from "./ReactQueryDemo";

export default function ReactQueryPage() {
  return (
    <div className="flex flex-col flex-1 items-center bg-zinc-50 dark:bg-zinc-950">
      <main className="flex flex-1 w-full max-w-5xl flex-col gap-8 py-16 px-6 sm:px-16 bg-white dark:bg-zinc-900">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">
            React Query useQuery
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            queryKey 工厂、无限列表、条件详情、乐观更新、缓存失效。
          </p>
        </div>

        <ReactQueryDemo />

        <div className="rounded-lg bg-zinc-100 p-4 text-sm text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
          <p>
            <code>useUsers</code> / <code>useInfiniteUsers</code> /{" "}
            <code>useUser</code> 都走同一套 <code>userKeys</code>。改一条详情会
            <code>invalidateQueries(lists)</code>，列表和无限滚动一起刷新；删除会先改
            cache 再在失败时回滚。
          </p>
          <p className="mt-2">
            这是客户端 Query Cache，和 <code>/shop</code> 的 Next.js Data Cache /
            页面缓存不是一层。后者跨用户共享，这里只活在当前浏览器的 QueryClient
            里。
          </p>
        </div>
      </main>
    </div>
  );
}
