import { NextResponse } from "next/server";
import { getShopHomeData } from "@/app/demo-shop/data";

export async function GET() {
  const data = await getShopHomeData();
  return NextResponse.json({
    ...data,
    servedBy: "api/demo-shop-home",
  });
}

