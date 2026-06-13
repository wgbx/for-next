import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

import { PEAR_DEMO_TAG } from "@/app/pear-shop/data";
import { routes } from "@/app/routes";

export async function POST() {
  // 1) 清掉外部接口的 tag 缓存
  revalidateTag(PEAR_DEMO_TAG, "default");
  // 2) 清掉页面缓存（让下一位用户触发重新生成）
  revalidatePath(routes.pearShop);

  return NextResponse.json({
    ok: true,
    revalidatedTag: PEAR_DEMO_TAG,
    revalidatedPath: routes.pearShop,
    clearedAt: new Date().toISOString(),
  });
}

