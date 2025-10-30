import type {
  DeleteGroupRes,
  GetGroupDetailRes,
  GetGroupListReq,
  GetGroupListRes,
  GetGroupMemberListReq,
  GetGroupMemberListRes,
  MuteGroupMemberReq,
  MuteGroupMemberRes,
  RemoveGroupMemberReq,
  RemoveGroupMemberRes,
  UpdateGroupReq,
  UpdateGroupRes,
  UpdateMemberRoleReq,
  UpdateMemberRoleRes
} from "@/types/api/group"
import config from "@/config/env"
import { ajax } from "@/utils/request"

// 获取群组列表
export function getGroupListApi(params: GetGroupListReq) {
  return ajax<GetGroupListRes>({
    method: "GET",
    url: `${config.baseAPI}/admin/group/list`,
    params
  })
}

// 获取群组详情
export function getGroupDetailApi(id: number) {
  return ajax<GetGroupDetailRes>({
    method: "GET",
    url: `${config.baseAPI}/admin/group/${id}`
  })
}

// 更新群组
export function updateGroupApi(id: number, data: Omit<UpdateGroupReq, "id">) {
  return ajax<UpdateGroupRes>({
    method: "PUT",
    url: `${config.baseAPI}/admin/group/${id}`,
    data
  })
}

// 删除群组
export function deleteGroupApi(id: number) {
  return ajax<DeleteGroupRes>({
    method: "DELETE",
    url: `${config.baseAPI}/admin/group/${id}`
  })
}

// 获取群成员列表
export function getGroupMemberListApi(params: GetGroupMemberListReq) {
  return ajax<GetGroupMemberListRes>({
    method: "GET",
    url: `${config.baseAPI}/admin/group/members`,
    params
  })
}

// 移除群成员
export function removeGroupMemberApi(data: RemoveGroupMemberReq) {
  return ajax<RemoveGroupMemberRes>({
    method: "POST",
    url: `${config.baseAPI}/admin/group/remove-member`,
    data
  })
}

// 更新成员角色
export function updateMemberRoleApi(id: number, data: Omit<UpdateMemberRoleReq, "id">) {
  return ajax<UpdateMemberRoleRes>({
    method: "PUT",
    url: `${config.baseAPI}/admin/group/member/${id}`,
    data
  })
}

// 禁言成员
export function muteGroupMemberApi(id: number, data: Omit<MuteGroupMemberReq, "id">) {
  return ajax<MuteGroupMemberRes>({
    method: "PUT",
    url: `${config.baseAPI}/admin/group/mute/${id}`,
    data
  })
}
