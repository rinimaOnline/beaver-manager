import "vue-router"

export {}

declare module "vue-router" {
  interface RouteMeta {
    /**
     * @description 路由标题
     */
    title?: string
    /**
     * @description 侧边栏高亮菜单 path（详情页等非菜单路由使用）
     */
    activeMenu?: string
  }
}
