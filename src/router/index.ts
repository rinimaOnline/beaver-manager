import { createRouter, createWebHashHistory } from "vue-router"
import { useUserStore } from "@/pinia/user/user"

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: "/",
      component: () => import("@/layouts/index.vue"),
      redirect: "/dashboard",
      children: [
        {
          path: "/dashboard",
          name: "Dashboard",
          component: () => import("@/pages/dashboard/index.vue")
        },
        {
          path: "/user/list",
          name: "UserList",
          component: () => import("@/pages/user/list/index.vue")
        },
        {
          path: "/friend/relations",
          name: "FriendRelations",
          component: () => import("@/pages/friend/relations/index.vue")
        },
        {
          path: "/friend/requests",
          name: "FriendRequests",
          component: () => import("@/pages/friend/requests/index.vue")
        },
        {
          path: "/group/list",
          name: "GroupList",
          component: () => import("@/pages/group/list/index.vue")
        },
        {
          path: "/chat/messages",
          name: "ChatMessages",
          component: () => import("@/pages/chat/messages/index.vue")
        },
        {
          path: "/file/storage",
          name: "FileStorage",
          component: () => import("@/pages/file/storage/index.vue")
        },
        {
          path: "/moment/list",
          name: "MomentList",
          component: () => import("@/pages/moment/list/index.vue")
        },
        {
          path: "/moment/comments",
          name: "MomentComments",
          component: () => import("@/pages/moment/comments/index.vue")
        },
        {
          path: "/moment/reports",
          name: "MomentReports",
          component: () => import("@/pages/moment/reports/index.vue")
        },
        {
          path: "/feedback/list",
          name: "FeedbackList",
          component: () => import("@/pages/feedback/list/index.vue")
        },
        {
          path: "/emoji/list",
          name: "EmojiList",
          component: () => import("@/pages/emoji/list/index.vue")
        },
        {
          path: "/emoji/packages",
          name: "EmojiPackages",
          component: () => import("@/pages/emoji/packages/index.vue")
        },
        {
          path: "/emoji/collects",
          name: "EmojiCollects",
          component: () => import("@/pages/emoji/collects/index.vue")
        },
        {
          path: "/track/buckets",
          name: "TrackBuckets",
          component: () => import("@/pages/track/buckets/index.vue")
        },
        {
          path: "/track/stats",
          name: "TrackStats",
          component: () => import("@/pages/track/stats/index.vue")
        },
        {
          path: "/update/apps",
          name: "UpdateApps",
          component: () => import("@/pages/update/apps/index.vue"),
          meta: {
            title: '应用管理',
            requiresAuth: true
          }
        },
        {
          path: "/update/architectures",
          name: "UpdateArchitectures",
          component: () => import("@/pages/update/architectures/index.vue"),
          meta: {
            title: '架构管理',
            requiresAuth: true
          }
        },
        {
          path: "/update/versions",
          name: "UpdateVersions",
          component: () => import("@/pages/update/versions/index.vue"),
          meta: {
            title: '版本管理',
            requiresAuth: true
          }
        },
        {
          path: "/update/strategies",
          name: "UpdateStrategies",
          component: () => import("@/pages/update/strategies/index.vue"),
          meta: {
            title: '发布策略',
            requiresAuth: true
          }
        },
      ]
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

// 路由守卫
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()

  // 如果要访问登录页，直接放行
  if (to.path === "/login") {
    next()
    return
  }

  // 检查是否已登录
  if (!userStore.isLoggedIn) {
    next("/login")
    return
  }

  next()
})

export default router
