export function buildPrivateConversationId(userIdA: string, userIdB: string): string {
  const ids = [userIdA, userIdB].filter(Boolean).sort()
  if (ids.length === 1) {
    return `private_${ids[0]}`
  }
  return `private_${ids[0]}_${ids[1]}`
}

export function buildGroupConversationCandidates(groupUuid: string): string[] {
  const id = groupUuid.trim()
  if (!id) {
    return []
  }
  if (id.startsWith("group_")) {
    return [id]
  }
  return [`group_${id}`, id]
}

export function getConversationType(conversationId: string): number {
  if (conversationId.startsWith("group_")) {
    return 2
  }
  if (conversationId.startsWith("private_")) {
    return 1
  }
  return conversationId.includes("_") ? 1 : 2
}
