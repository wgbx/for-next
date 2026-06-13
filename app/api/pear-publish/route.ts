import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

import { PEAR_DEMO_TAG } from "@/app/pear-shop/data";

export async function POST() {
  revalidateTag(PEAR_DEMO_TAG, "default");
  return NextResponse.json({
    ok: true,
    revalidatedTag: PEAR_DEMO_TAG,
    publishedAt: new Date().toISOString(),
  });
}

