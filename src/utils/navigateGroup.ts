import type { Router } from "vue-router"
import { ElMessage } from "element-plus"
import { getGroupOperationsProfileApi } from "@/api/operations"

export async function navigateToUserGroup(
  router: Router,
  groupId: string,
  anchorUserId?: string
) {
  let userId = anchorUserId
  if (!userId) {
    const res = await getGroupOperationsProfileApi(groupId)
    if (res.code === 0) {
      userId = res.result.profile.creatorId || res.result.members?.[0]?.userId
    }
  }
  if (!userId) {
    ElMessage.warning("无法定位群上下文，请从用户360进入")
    return
  }
  await router.push({
    path: `/user/profile/${userId}`,
    query: { relation: "groups", groupId }
  })
}
