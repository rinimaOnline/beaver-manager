import type { RouteRecordRaw } from "vue-router"
import { createRouter, createWebHashHistory } from "vue-router"
import { useUserStore } from "@/pinia/user/user"

/** 业务路由，path 与 pages 目录一一对应 */
const adminRoutes: RouteRecordRaw[] = [
  { path: "/dashboard", name: "Dashboard", component: () => import("@/pages/dashboard/index.vue") },
  { path: "/analytics/overview", name: "AnalyticsOverview", component: () => import("@/pages/analytics/overview/index.vue") },
  { path: "/search", name: "UnifiedSearch", component: () => import("@/pages/search/index.vue") },
  { path: "/user/search", name: "UserSearch", component: () => import("@/pages/user/search/index.vue") },
  { path: "/user/list", name: "UserList", component: () => import("@/pages/user/list/index.vue") },
  { path: "/user/profile/:userId", name: "UserProfile", component: () => import("@/pages/user/profile/index.vue"), meta: { title: "用户360" } },
  { path: "/user/sanctions", name: "UserSanctions", component: () => import("@/pages/user/sanctions/index.vue") },
  { path: "/compliance/messages", name: "ComplianceMessages", component: () => import("@/pages/compliance/messages/index.vue") },
  { path: "/compliance/sessions", name: "ComplianceSessions", component: () => import("@/pages/compliance/sessions/index.vue") },
  { path: "/compliance/exports", name: "ComplianceExports", component: () => import("@/pages/compliance/exports/index.vue") },
  { path: "/group/search", name: "GroupSearch", component: () => import("@/pages/group/search/index.vue") },
  { path: "/group/list", name: "GroupList", component: () => import("@/pages/group/list/index.vue") },
  { path: "/group/profile/:groupId", name: "GroupProfile", component: () => import("@/pages/group/profile/index.vue"), meta: { title: "群组360" } },
  { path: "/group/messages", name: "GroupMessages", component: () => import("@/pages/group/messages/index.vue") },
  { path: "/friend/relations", name: "FriendRelations", component: () => import("@/pages/friend/relations/index.vue") },
  { path: "/friend/requests", name: "FriendRequests", component: () => import("@/pages/friend/requests/index.vue") },
  { path: "/friend/blocks", name: "FriendBlocks", component: () => import("@/pages/friend/blocks/index.vue") },
  { path: "/safety/reports", name: "SafetyReports", component: () => import("@/pages/safety/reports/index.vue") },
  { path: "/safety/cases", name: "SafetyCases", component: () => import("@/pages/safety/cases/index.vue") },
  { path: "/safety/machine-review", name: "SafetyMachineReview", component: () => import("@/pages/safety/machine-review/index.vue") },
  { path: "/safety/appeals", name: "SafetyAppeals", component: () => import("@/pages/safety/appeals/index.vue") },
  { path: "/safety/policy", name: "SafetyPolicy", component: () => import("@/pages/safety/policy/index.vue") },
  { path: "/safety/audit-logs", name: "SafetyAuditLogs", component: () => import("@/pages/safety/audit-logs/index.vue") },
  { path: "/community/moments", name: "CommunityMoments", component: () => import("@/pages/community/moments/index.vue") },
  { path: "/community/comments", name: "CommunityComments", component: () => import("@/pages/community/comments/index.vue") },
  { path: "/service/feedback", name: "ServiceFeedback", component: () => import("@/pages/service/feedback/index.vue") },
  { path: "/service/tickets", name: "ServiceTickets", component: () => import("@/pages/service/tickets/index.vue") },
  { path: "/risk/users", name: "RiskUsers", component: () => import("@/pages/risk/users/index.vue") },
  { path: "/risk/blocklist", name: "RiskBlocklist", component: () => import("@/pages/risk/blocklist/index.vue") },
  { path: "/risk/rules", name: "RiskRules", component: () => import("@/pages/risk/rules/index.vue") },
  { path: "/risk/alerts", name: "RiskAlerts", component: () => import("@/pages/risk/alerts/index.vue") },
  { path: "/open/developers", name: "OpenDevelopers", component: () => import("@/pages/open/developers/index.vue") },
  { path: "/open/apps", name: "OpenApps", component: () => import("@/pages/open/apps/index.vue") },
  { path: "/open/integrations", name: "OpenIntegrations", component: () => import("@/pages/open/integrations/index.vue") },
  { path: "/release/apps", name: "ReleaseApps", component: () => import("@/pages/release/apps/index.vue") },
  { path: "/release/architectures", name: "ReleaseArchitectures", component: () => import("@/pages/release/architectures/index.vue") },
  { path: "/release/versions", name: "ReleaseVersions", component: () => import("@/pages/release/versions/index.vue") },
  { path: "/release/strategies", name: "ReleaseStrategies", component: () => import("@/pages/release/strategies/index.vue") },
  { path: "/data/buckets", name: "DataBuckets", component: () => import("@/pages/data/buckets/index.vue") },
  { path: "/data/events", name: "DataEvents", component: () => import("@/pages/data/events/index.vue") },
  { path: "/data/logs", name: "DataLogs", component: () => import("@/pages/data/logs/index.vue") },
  { path: "/assets/files", name: "AssetsFiles", component: () => import("@/pages/assets/files/index.vue") },
  { path: "/assets/emojis", name: "AssetsEmojis", component: () => import("@/pages/assets/emojis/index.vue") },
  { path: "/assets/emoji-packages", name: "AssetsEmojiPackages", component: () => import("@/pages/assets/emoji-packages/index.vue") },
  { path: "/assets/emoji-collects", name: "AssetsEmojiCollects", component: () => import("@/pages/assets/emoji-collects/index.vue") },
  { path: "/system/roles", name: "SystemRoles", component: () => import("@/pages/system/roles/index.vue") },
  { path: "/system/admins", name: "SystemAdmins", component: () => import("@/pages/system/admins/index.vue") },
  { path: "/system/menus", name: "SystemMenus", component: () => import("@/pages/system/menus/index.vue") },
  { path: "/system/audit-logs", name: "SystemAuditLogs", component: () => import("@/pages/system/audit-logs/index.vue") },
  { path: "/system/config", name: "SystemConfig", component: () => import("@/pages/system/config/index.vue") }
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
