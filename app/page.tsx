import Image from "next/image";
import Link from "next/link";

import { pages } from "./routes";

const categories = Array.from(new Set(pages.map((page) => page.category)));

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-5xl flex-col items-center gap-6 py-12 px-6 sm:px-16 bg-white dark:bg-black">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={72}
          height={15}
          priority
        />

        <div className="flex flex-col gap-8 w-full">
          {categories.map((category) => (
            <div key={category} className="flex flex-col gap-3 w-full">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                {category}
              </h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {pages
                  .filter((page) => page.category === category)
                  .map((page) => (
                    <Link
                      key={page.path}
                      href={page.path}
                      title={page.description}
                      className="group flex flex-col gap-1 rounded-xl border border-black/[.08] bg-white p-4 shadow-sm transition-colors hover:border-black/[.12] hover:bg-black/[.02] dark:border-white/[.14] dark:bg-black dark:hover:border-white/[.20] dark:hover:bg-white/[.04]"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-base font-medium text-black dark:text-zinc-50">
                          {page.title}
                        </div>
                        <div className="text-zinc-400 transition-transform group-hover:translate-x-1 dark:text-zinc-500">
                          →
                        </div>
                      </div>
                      <div className="line-clamp-1 text-sm text-zinc-600 dark:text-zinc-400">
                        {page.description}
                      </div>
                    </Link>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
