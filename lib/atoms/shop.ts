import { routes } from "@/app/routes";
import { atomWithQuery } from "jotai-tanstack-query";

export type ShopHomePayload = {
  hits: number;
  backendServedAt: string;
  servedBy: string;
};

export const shopHomeQueryAtom = atomWithQuery(() => ({
  queryKey: ["shopHome"] as const,
  queryFn: async (): Promise<ShopHomePayload> => {
    const res = await fetch(routes.api.shopHome, { method: "GET" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as ShopHomePayload;
  },
}));
