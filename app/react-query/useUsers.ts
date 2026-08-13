"use client";

import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type InfiniteData,
} from "@tanstack/react-query";

import { userApi } from "./api";
import type {
  PaginatedResponse,
  QueryParams,
  UpdateUserData,
  UserItem,
} from "./types";

export const userKeys = {
  all: ["users"] as const,
  lists: () => [...userKeys.all, "list"] as const,
  list: (params: QueryParams) => [...userKeys.lists(), params] as const,
  details: () => [...userKeys.all, "detail"] as const,
  detail: (id: number) => [...userKeys.details(), id] as const,
};

const STALE_TIME = 5 * 60 * 1000;
const GC_TIME = 10 * 60 * 1000;

export function useUsers(params: QueryParams = {}) {
  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: () => userApi.getUsers(params),
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
  });
}

export function useInfiniteUsers(params: Omit<QueryParams, "page"> = {}) {
  return useInfiniteQuery({
    queryKey: userKeys.list(params),
    queryFn: ({ pageParam }) => userApi.getUsers({ ...params, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
  });
}

export function useUser(id: number | null) {
  return useQuery({
    queryKey: id == null ? userKeys.details() : userKeys.detail(id),
    queryFn: () => userApi.getUser(id as number),
    enabled: id != null,
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userApi.createUser,
    onSuccess: (newUser) => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.setQueryData(userKeys.detail(newUser.id), newUser);
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userApi.updateUser,
    onMutate: async (updatedUser) => {
      await queryClient.cancelQueries({
        queryKey: userKeys.detail(updatedUser.id),
      });

      const previousUser = queryClient.getQueryData<UserItem>(
        userKeys.detail(updatedUser.id),
      );

      queryClient.setQueryData<UserItem>(
        userKeys.detail(updatedUser.id),
        (old) => (old ? { ...old, ...updatedUser } : old),
      );

      return { previousUser };
    },
    onError: (_err, updatedUser, context) => {
      if (context?.previousUser) {
        queryClient.setQueryData(
          userKeys.detail(updatedUser.id),
          context.previousUser,
        );
      }
    },
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({
        queryKey: userKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userApi.deleteUser,
    onMutate: async (userId) => {
      await queryClient.cancelQueries({ queryKey: userKeys.lists() });

      const previousLists = queryClient.getQueriesData<
        PaginatedResponse<UserItem> | InfiniteData<PaginatedResponse<UserItem>>
      >({ queryKey: userKeys.lists() });

      queryClient.setQueriesData<PaginatedResponse<UserItem>>(
        { queryKey: userKeys.lists() },
        (old) => {
          if (!old || !("data" in old) || !Array.isArray(old.data)) return old;
          return {
            ...old,
            data: old.data.filter((user) => user.id !== userId),
            total: Math.max(0, old.total - 1),
          };
        },
      );

      return { previousLists };
    },
    onError: (_err, _userId, context) => {
      context?.previousLists.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}
