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

export function getGroupListApi(params: GetGroupListReq) {
  return ajax<GetGroupListRes>({
    method: "GET",
    url: `${config.baseAPI}/admin/group/v1/list`,
    params
  })
}

export function getGroupDetailApi(id: number) {
  return ajax<GetGroupDetailRes>({
    method: "GET",
    url: `${config.baseAPI}/admin/group/v1/detail`,
    params: { id }
  })
}

export function updateGroupApi(id: number, data: Omit<UpdateGroupReq, "id">) {
  return ajax<UpdateGroupRes>({
    method: "POST",
    url: `${config.baseAPI}/admin/group/v1/update`,
    data: { id, ...data }
  })
}

export function deleteGroupApi(id: number) {
  return ajax<DeleteGroupRes>({
    method: "POST",
    url: `${config.baseAPI}/admin/group/v1/delete`,
    data: { id }
  })
}

export function getGroupMemberListApi(params: GetGroupMemberListReq) {
  return ajax<GetGroupMemberListRes>({
    method: "GET",
    url: `${config.baseAPI}/admin/group/v1/members`,
    params
  })
}

export function removeGroupMemberApi(data: RemoveGroupMemberReq) {
  return ajax<RemoveGroupMemberRes>({
    method: "POST",
    url: `${config.baseAPI}/admin/group/v1/remove_member`,
    data
  })
}

export function updateMemberRoleApi(id: number, data: Omit<UpdateMemberRoleReq, "id">) {
  return ajax<UpdateMemberRoleRes>({
    method: "POST",
    url: `${config.baseAPI}/admin/group/v1/update_member_role`,
    data: { id, ...data }
  })
}

export function muteGroupMemberApi(id: number, data: Omit<MuteGroupMemberReq, "id">) {
  return ajax<MuteGroupMemberRes>({
    method: "POST",
    url: `${config.baseAPI}/admin/group/v1/mute_member`,
    data: { id, ...data }
  })
}
