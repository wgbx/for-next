import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

export async function POST() {
  revalidateTag("demo:shop-home", "default");
  return NextResponse.json({
    ok: true,
    revalidatedTag: "demo:shop-home",
    publishedAt: new Date().toISOString(),
  });
}

