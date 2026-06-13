import { NextResponse } from "next/server";
import { getShopHomeData } from "@/app/shop/data";
import { routes } from "@/app/routes";

export async function GET() {
  const data = await getShopHomeData();
  return NextResponse.json({
    ...data,
    servedBy: routes.api.shopHome.slice(1),
  });
}

