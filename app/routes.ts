/** 全站路由声明。改路径时只改这一处。 */
export const routes = {
  home: "/",
  shop: "/shop",
  shopApi: "/shop-api",
  pearShop: "/pear-shop",
  api: {
    backend: "/api/backend",
    shopHome: "/api/shop-home",
    publish: "/api/publish",
    pearPageClear: "/api/pear-page-clear",
    pearPublish: "/api/pear-publish",
    pearUser: "/api/pear-user",
  },
} as const;

export const pages = [
  {
    path: routes.shop,
    title: "页面缓存",
    description: "用户间复用，发布后更新。服务端渲染 + 页面级缓存（没有客户端请求接口）",
  },
  {
    path: routes.shopApi,
    title: "接口缓存",
    description: "客户端每次请求，但后端取数复用缓存",
  },
  {
    path: routes.pearShop,
    title: "Pear 店铺首页",
    description: "页面缓存 + 按需清除。演示 SSR 取数和上游 API 响应",
  },
] as const;
