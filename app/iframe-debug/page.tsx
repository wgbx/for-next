import { IframeDebugClient } from "./IframeDebugClient";

export default function IframeDebugPage() {
  return (
    <div className="flex flex-col flex-1 items-center bg-zinc-50 dark:bg-zinc-950">
      <main className="flex flex-1 w-full max-w-5xl flex-col gap-8 py-16 px-6 sm:px-16 bg-white dark:bg-zinc-900">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">
            iframe 嵌入调试
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            粘贴交给宿主 A 的嵌入代码。B 通过{" "}
            <code className="text-sm">postMessage</code> 回传高度后，A 只更新{" "}
            <code className="text-sm">.iframe-section</code> 的 height（iframe 保持
            100%）。
          </p>
        </div>

        <IframeDebugClient />
      </main>
    </div>
  );
}
