import "vue-router"

export {}

declare module "vue-router" {
  interface RouteMeta {
    /**
     * @description 路由标题
     */
    title?: string
    /**
     * @description 是否隐藏该路由
     */
    hidden?: boolean
  }
}
