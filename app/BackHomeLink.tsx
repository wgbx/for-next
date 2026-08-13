"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { routes } from "./routes";

export function BackHomeLink() {
  const pathname = usePathname();
  if (pathname === routes.home) return null;

  return (
    <Link
      href={routes.home}
      className="fixed top-4 left-4 z-50 rounded-full border border-black/20 bg-white px-4 py-2 text-sm font-medium text-black shadow-sm transition-colors hover:bg-black/[.04] dark:border-white/20 dark:bg-black dark:text-zinc-50 dark:hover:bg-white/[.06]"
    >
      ← 返回首页
    </Link>
  );
}
