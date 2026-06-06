import type { RouteRecordRaw } from "vue-router"
import { createRouter, createWebHashHistory } from "vue-router"
import { useUserStore } from "@/pinia/user/user"

/** 路由 path 与 src/pages 目录一一对应，无 redirect 兼容层 */
const adminRoutes: RouteRecordRaw[] = [
  { path: "/dashboard", name: "Dashboard", component: () => import("@/pages/dashboard/index.vue") },

  { path: "/user/list", name: "UserList", component: () => import("@/pages/user/list/index.vue") },
  { path: "/user/profile/:userId", name: "UserProfile", component: () => import("@/pages/user/profile/index.vue"), meta: { title: "用户360" } },

  { path: "/compliance/messages", name: "ComplianceMessages", component: () => import("@/pages/compliance/messages/index.vue") },
  { path: "/compliance/sessions", name: "ComplianceSessions", component: () => import("@/pages/compliance/sessions/index.vue") },

  { path: "/safety/cases", name: "SafetyCases", component: () => import("@/pages/safety/cases/index.vue") },
  { path: "/safety/appeals", name: "SafetyAppeals", component: () => import("@/pages/safety/appeals/index.vue") },
  { path: "/safety/policy", name: "SafetyPolicy", component: () => import("@/pages/safety/policy/index.vue") },

  { path: "/service/feedback", name: "ServiceFeedback", component: () => import("@/pages/service/feedback/index.vue") },

  { path: "/open/developers", name: "OpenDevelopers", component: () => import("@/pages/open/developers/index.vue") },
  { path: "/open/apps", name: "OpenApps", component: () => import("@/pages/open/apps/index.vue") },
  { path: "/open/integrations", name: "OpenIntegrations", component: () => import("@/pages/open/integrations/index.vue") },

  { path: "/release/versions", name: "ReleaseVersions", component: () => import("@/pages/release/versions/index.vue") },
  { path: "/release/strategies", name: "ReleaseStrategies", component: () => import("@/pages/release/strategies/index.vue") },

  { path: "/data/events", name: "DataEvents", component: () => import("@/pages/data/events/index.vue") },
  { path: "/data/logs", name: "DataLogs", component: () => import("@/pages/data/logs/index.vue") },

  { path: "/assets/files", name: "AssetsFiles", component: () => import("@/pages/assets/files/index.vue") },
  { path: "/assets/emojis", name: "AssetsEmojis", component: () => import("@/pages/assets/emojis/index.vue") },
  { path: "/assets/emoji-packages", name: "AssetsEmojiPackages", component: () => import("@/pages/assets/emoji-packages/index.vue") },

  { path: "/system/roles", name: "SystemRoles", component: () => import("@/pages/system/roles/index.vue") },
  { path: "/system/admins", name: "SystemAdmins", component: () => import("@/pages/system/admins/index.vue") },
  { path: "/system/config", name: "SystemConfig", component: () => import("@/pages/system/config/index.vue") },
  { path: "/system/audit-logs", name: "SystemAuditLogs", component: () => import("@/pages/system/audit-logs/index.vue") }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: "/",
      component: () => import("@/layouts/index.vue"),
      redirect: "/dashboard",
      children: adminRoutes
    },
    {
      path: "/login",
      name: "Login",
      component: () => import("@/pages/login/index.vue")
    },
    {
      path: "/redirect/:path(.*)",
      name: "Redirect",
      component: () => import("@/pages/redirect/index.vue")
    },
    {
      path: "/error/404",
      name: "Error404",
      component: () => import("@/pages/error/404.vue")
    },
    {
      path: "/:pathMatch(.*)*",
      redirect: "/error/404"
    }
  ]
})

router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  if (to.path === "/login") {
    next()
    return
  }
  if (!userStore.isLoggedIn) {
    next("/login")
    return
  }
  next()
})

export default router
