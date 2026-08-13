"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";

import type { UserItem } from "./types";
import { userApi } from "./api";
import {
  useCreateUser,
  useDeleteUser,
  useInfiniteUsers,
  useUpdateUser,
  useUser,
  userKeys,
} from "./useUsers";

function statusLabel(status: UserItem["status"]) {
  if (status === "active") return "活跃";
  if (status === "inactive") return "非活跃";
  return "待审核";
}

function statusClass(status: UserItem["status"]) {
  if (status === "active") return "text-emerald-600 dark:text-emerald-400";
  if (status === "inactive") return "text-rose-600 dark:text-rose-400";
  return "text-amber-600 dark:text-amber-400";
}

export function ReactQueryDemo() {
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);

  const {
    data: infiniteData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: listLoading,
    isFetching: listFetching,
    error: listError,
  } = useInfiniteUsers({ pageSize: 3 });

  const {
    data: selectedUser,
    isLoading: userLoading,
    isFetching: userFetching,
    error: userError,
  } = useUser(selectedId);

  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();

  const users = infiniteData?.pages.flatMap((page) => page.data) ?? [];
  const cache = queryClient.getQueryCache().getAll();
  const userQueries = cache.filter((query) => query.queryKey[0] === "users");

  async function handleCreate(event: FormEvent) {
    event.preventDefault();
    if (!name.trim() || !email.trim()) return;
    try {
      const created = await createUser.mutateAsync({
        name: name.trim(),
        email: email.trim(),
        role: "用户",
        status: "pending",
      });
      setName("");
      setEmail("");
      setSelectedId(created.id);
      setFeedback(`已创建 ${created.name}，列表会失效并重新拉取`);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "创建失败");
    }
  }

  async function handleDelete(user: UserItem) {
    try {
      await deleteUser.mutateAsync(user.id);
      if (selectedId === user.id) setSelectedId(null);
      setFeedback(`已删除 ${user.name}（先乐观从列表拿掉，失败会回滚）`);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "删除失败");
    }
  }

  async function handleToggleStatus(user: UserItem) {
    const nextStatus = user.status === "active" ? "inactive" : "active";
    try {
      await updateUser.mutateAsync({ id: user.id, status: nextStatus });
      setFeedback(`已把 ${user.name} 改为${statusLabel(nextStatus)}（详情先乐观更新）`);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "更新失败");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-2xl border border-black/[.08] bg-zinc-50 p-4 dark:border-white/[.14] dark:bg-zinc-950">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
              缓存面板
            </div>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              再点同一用户详情应立刻出现；失效/清空后才会重新转圈。
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() =>
                queryClient.invalidateQueries({ queryKey: userKeys.all })
              }
              className="rounded-full border border-black/20 px-3 py-1.5 text-sm font-medium text-black dark:border-white/20 dark:text-zinc-50"
            >
              失效 users
            </button>
            <button
              type="button"
              onClick={() => queryClient.clear()}
              className="rounded-full border border-black/20 px-3 py-1.5 text-sm font-medium text-black dark:border-white/20 dark:text-zinc-50"
            >
              清空缓存
            </button>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-3 text-center text-sm">
          <div className="rounded-xl bg-white px-3 py-3 dark:bg-zinc-900">
            <div className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              {cache.length}
            </div>
            <div className="text-zinc-500">总查询</div>
          </div>
          <div className="rounded-xl bg-white px-3 py-3 dark:bg-zinc-900">
            <div className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              {userQueries.length}
            </div>
            <div className="text-zinc-500">users 查询</div>
          </div>
          <div className="rounded-xl bg-white px-3 py-3 dark:bg-zinc-900">
            <div className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              {listFetching || userFetching ? "fetching" : "idle"}
            </div>
            <div className="text-zinc-500">当前状态</div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-black/[.08] p-4 dark:border-white/[.14]">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
              useInfiniteQuery 列表
            </h2>
            {listFetching && !listLoading ? (
              <span className="text-xs text-zinc-500">后台刷新中</span>
            ) : null}
          </div>

          {listLoading ? (
            <p className="py-10 text-center text-sm text-zinc-500">加载中…</p>
          ) : listError ? (
            <p className="py-10 text-center text-sm text-rose-600">
              {listError.message}
            </p>
          ) : (
            <ul className="mt-4 flex flex-col gap-2">
              {users.map((user) => (
                <li
                  key={user.id}
                  className={`flex items-center gap-3 rounded-xl border px-3 py-3 ${
                    selectedId === user.id
                      ? "border-black/20 bg-black/[.04] dark:border-white/20 dark:bg-white/[.06]"
                      : "border-black/[.06] dark:border-white/[.08]"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setSelectedId(user.id)}
                    onMouseEnter={() => {
                      void queryClient.prefetchQuery({
                        queryKey: userKeys.detail(user.id),
                        queryFn: () => userApi.getUser(user.id),
                      });
                    }}
                    className="flex min-w-0 flex-1 items-center gap-3 text-left"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={user.avatar}
                      alt=""
                      className="h-9 w-9 rounded-full bg-zinc-100"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate font-medium text-zinc-900 dark:text-zinc-50">
                          {user.name}
                        </span>
                        <span className={`text-xs ${statusClass(user.status)}`}>
                          {statusLabel(user.status)}
                        </span>
                      </div>
                      <div className="truncate text-xs text-zinc-500">
                        {user.email}
                      </div>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleDelete(user)}
                    className="text-xs text-zinc-400 hover:text-rose-600"
                  >
                    删除
                  </button>
                </li>
              ))}
            </ul>
          )}

          {hasNextPage ? (
            <button
              type="button"
              onClick={() => void fetchNextPage()}
              disabled={isFetchingNextPage}
              className="mt-4 w-full rounded-full border border-black/20 px-4 py-2 text-sm font-medium text-black disabled:opacity-60 dark:border-white/20 dark:text-zinc-50"
            >
              {isFetchingNextPage ? "加载中…" : "加载更多"}
            </button>
          ) : null}
        </section>

        <section className="rounded-2xl border border-black/[.08] p-4 dark:border-white/[.14]">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
              useQuery 详情（enabled）
            </h2>
            {userFetching && !userLoading ? (
              <span className="text-xs text-zinc-500">命中后后台校验</span>
            ) : null}
          </div>

          {!selectedId ? (
            <p className="py-10 text-center text-sm text-zinc-500">
              点左侧用户查看详情。悬停会 prefetch。
            </p>
          ) : userLoading ? (
            <p className="py-10 text-center text-sm text-zinc-500">加载中…</p>
          ) : userError ? (
            <p className="py-10 text-center text-sm text-rose-600">
              {userError.message}
            </p>
          ) : selectedUser ? (
            <div className="mt-4 flex flex-col gap-4">
              <div className="flex items-center gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selectedUser.avatar}
                  alt=""
                  className="h-16 w-16 rounded-2xl bg-zinc-100"
                />
                <div>
                  <div className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                    {selectedUser.name}
                  </div>
                  <div className="text-sm text-zinc-500">{selectedUser.email}</div>
                </div>
              </div>
              <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
                <dt className="text-zinc-500">角色</dt>
                <dd className="text-zinc-900 dark:text-zinc-50">
                  {selectedUser.role}
                </dd>
                <dt className="text-zinc-500">状态</dt>
                <dd className={statusClass(selectedUser.status)}>
                  {statusLabel(selectedUser.status)}
                </dd>
                <dt className="text-zinc-500">更新时间</dt>
                <dd className="font-mono text-zinc-900 dark:text-zinc-50">
                  {new Date(selectedUser.updatedAt).toLocaleString()}
                </dd>
              </dl>
              <button
                type="button"
                onClick={() => void handleToggleStatus(selectedUser)}
                disabled={updateUser.isPending}
                className="self-start rounded-full bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-60 dark:bg-white dark:text-black"
              >
                {updateUser.isPending ? "更新中…" : "切换活跃状态"}
              </button>
            </div>
          ) : null}
        </section>
      </div>

      <section className="rounded-2xl border border-black/[.08] p-4 dark:border-white/[.14]">
        <h2 className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
          useMutation 创建用户
        </h2>
        <form onSubmit={handleCreate} className="mt-4 flex flex-wrap gap-3">
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="姓名"
            className="min-w-40 flex-1 rounded-xl border border-black/15 bg-white px-3 py-2 text-sm dark:border-white/15 dark:bg-zinc-950 dark:text-zinc-50"
          />
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="邮箱"
            type="email"
            className="min-w-52 flex-1 rounded-xl border border-black/15 bg-white px-3 py-2 text-sm dark:border-white/15 dark:bg-zinc-950 dark:text-zinc-50"
          />
          <button
            type="submit"
            disabled={createUser.isPending}
            className="rounded-full bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-60 dark:bg-white dark:text-black"
          >
            {createUser.isPending ? "创建中…" : "创建"}
          </button>
        </form>
        {feedback ? (
          <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">{feedback}</p>
        ) : null}
      </section>
    </div>
  );
}
