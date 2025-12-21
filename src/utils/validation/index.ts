/**
 * 验证相关工具函数
 */

/**
 * 判断是否为外部链接
 */
export function isExternal(path: string): boolean {
  return /^(https?:|mailto:|tel:)/.test(path)
}

/**
 * 判断是否为邮箱
 */
export function isEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * 判断是否为手机号
 */
export function isPhone(phone: string): boolean {
  const phoneRegex = /^1[3-9]\d{9}$/
  return phoneRegex.test(phone)
}

/**
 * 判断是否为身份证号
 */
export function isIdCard(idCard: string): boolean {
  const idCardRegex = /(^\d{15}$)|(^\d{18}$)|(^\d{17}([\dX])$)/i
  return idCardRegex.test(idCard)
}

/**
 * 判断是否为URL
 */
export function isUrl(url: string): boolean {
  const urlRegex = /^(https?|ftp):\/\/[^\s/$.?#].\S*$/i
  return urlRegex.test(url)
}
