import Image from "next/image";
import Link from "next/link";

import { pages } from "./routes";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center gap-12 py-32 px-6 sm:px-16 bg-white dark:bg-black">
        <div className="flex flex-col items-center gap-6 text-center">
          <Image
            className="dark:invert"
            src="/next.svg"
            alt="Next.js logo"
            width={100}
            height={20}
            priority
          />
          <h1 className="text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            ISR 演示项目
          </h1>
          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            Next.js 增量静态再生成 (ISR) 功能演示
          </p>
        </div>

        <div className="flex flex-col gap-4 w-full">
          <h2 className="text-xl font-semibold text-black dark:text-zinc-50">演示页面</h2>
          <div className="flex flex-col gap-3">
            {pages.map((page) => (
              <Link
                key={page.path}
                href={page.path}
                className="group flex flex-col gap-1 rounded-2xl border border-black/[.08] bg-white p-5 shadow-sm transition-colors hover:border-black/[.12] hover:bg-black/[.02] dark:border-white/[.14] dark:bg-black dark:hover:border-white/[.20] dark:hover:bg-white/[.04]"
              >
                <div className="flex items-center justify-between">
                  <div className="text-lg font-medium text-black dark:text-zinc-50">
                    {page.title}
                  </div>
                  <div className="text-zinc-400 transition-transform group-hover:translate-x-1 dark:text-zinc-500">
                    →
                  </div>
                </div>
                <div className="text-sm text-zinc-600 dark:text-zinc-400">
                  {page.description}
                </div>
                <div className="text-xs font-mono text-zinc-500 dark:text-zinc-500">
                  {page.path}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
