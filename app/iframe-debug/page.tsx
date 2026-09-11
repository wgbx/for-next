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
            复现 Pear Ticket Booking embed：预览 iframe，监听{" "}
            <code className="text-sm">postMessage</code> 高度消息并自动调整。
          </p>
        </div>

        <IframeDebugClient />
      </main>
    </div>
  );
}
