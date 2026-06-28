export const BUCKET_KIND_LOG = "log"

/** 默认日志 Bucket，与 beaver-server/database/platform/track/init.go 一致 */
export const DEFAULT_LOG_BUCKET_ID = "b2c3d4e5-f6a7-4789-b012-456789abcdef"

export const bucketKindLabel: Record<string, string> = {
  [BUCKET_KIND_LOG]: "日志"
}
