/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-manager
 *
 * beaver-manager-header-v1
 */

import config from "@/config/env"
import { ajax } from "@/utils/request"

interface ICryptoPubkey {
  alg: string
  publicKeyPem: string
  publicKeySpki: string
  modulus: string
  exponent: number
}

let cached: ICryptoPubkey | null = null

function b64ToBytes(b64: string): ArrayBuffer {
  const bin = atob(b64)
  const out = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++)
    out[i] = bin.charCodeAt(i)
  return out.buffer
}

function bytesToB64(bytes: Uint8Array): string {
  let s = ""
  const chunk = 0x8000
  for (let i = 0; i < bytes.length; i += chunk)
    s += String.fromCharCode(...bytes.subarray(i, i + chunk))
  return btoa(s)
}

async function publicKey(): Promise<ICryptoPubkey> {
  if (cached)
    return cached
  const res = await ajax<ICryptoPubkey>({
    method: "GET",
    url: `${config.baseAPI}/admin/auth_public/v1/crypto_pubkey`
  })
  if (res.code !== 0 || !res.result?.modulus || !res.result.exponent)
    throw new Error(res.msg || "获取加密公钥失败")
  cached = res.result
  return cached
}

async function encryptSubtle(spki: string, plaintext: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "spki",
    b64ToBytes(spki),
    { name: "RSA-OAEP", hash: "SHA-256" },
    false,
    ["encrypt"]
  )
  const ct = await crypto.subtle.encrypt(
    { name: "RSA-OAEP" },
    key,
    new TextEncoder().encode(plaintext)
  )
  return bytesToB64(new Uint8Array(ct))
}

/**
 * 公网 HTTP 页不是 Secure Context，`crypto.subtle` 为 undefined。
 * 用公钥接口返回的模量/指数做 RFC 8017 RSA-OAEP-SHA256，与 Go/Web Crypto 对齐。
 */
function encryptOaepSha256(modulusHex: string, exponent: number, plaintext: string): string {
  const n = BigInt(`0x${modulusHex}`)
  const e = BigInt(exponent)
  const k = Math.ceil(modulusHex.length / 2)
  const hLen = 32
  const msg = new TextEncoder().encode(plaintext)
  if (msg.length > k - 2 * hLen - 2)
    throw new Error("密码过长，无法加密")

  const lHash = sha256(new Uint8Array(0))
  const ps = new Uint8Array(k - msg.length - 2 * hLen - 2)
  const db = new Uint8Array(k - hLen - 1)
  db.set(lHash, 0)
  db.set(ps, hLen)
  db[hLen + ps.length] = 1
  db.set(msg, hLen + ps.length + 1)

  const seed = new Uint8Array(hLen)
  crypto.getRandomValues(seed)
  const dbMask = mgf1(seed, db.length)
  const maskedDB = xor(db, dbMask)
  const seedMask = mgf1(maskedDB, hLen)
  const maskedSeed = xor(seed, seedMask)

  const em = new Uint8Array(k)
  em[0] = 0
  em.set(maskedSeed, 1)
  em.set(maskedDB, 1 + hLen)

  const m = os2ip(em)
  const c = modPow(m, e, n)
  return bytesToB64(i2osp(c, k))
}

function mgf1(seed: Uint8Array, maskLen: number): Uint8Array {
  const out = new Uint8Array(maskLen)
  const hLen = 32
  const rounds = Math.ceil(maskLen / hLen)
  for (let i = 0; i < rounds; i++) {
    const counter = new Uint8Array(4)
    counter[0] = (i >>> 24) & 0xff
    counter[1] = (i >>> 16) & 0xff
    counter[2] = (i >>> 8) & 0xff
    counter[3] = i & 0xff
    const buf = new Uint8Array(seed.length + 4)
    buf.set(seed, 0)
    buf.set(counter, seed.length)
    out.set(sha256(buf).subarray(0, Math.min(hLen, maskLen - i * hLen)), i * hLen)
  }
  return out
}

function xor(a: Uint8Array, b: Uint8Array): Uint8Array {
  const out = new Uint8Array(a.length)
  for (let i = 0; i < a.length; i++)
    out[i] = a[i] ^ b[i]
  return out
}

function os2ip(bytes: Uint8Array): bigint {
  let n = 0n
  for (const b of bytes)
    n = (n << 8n) + BigInt(b)
  return n
}

function i2osp(n: bigint, len: number): Uint8Array {
  const out = new Uint8Array(len)
  let x = n
  for (let i = len - 1; i >= 0; i--) {
    out[i] = Number(x & 0xffn)
    x >>= 8n
  }
  return out
}

function modPow(base: bigint, exp: bigint, mod: bigint): bigint {
  let result = 1n
  let b = base % mod
  let e = exp
  while (e > 0n) {
    if (e & 1n)
      result = (result * b) % mod
    b = (b * b) % mod
    e >>= 1n
  }
  return result
}

function sha256(data: Uint8Array): Uint8Array {
  const K = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ]
  const bitLen = data.length * 8
  const withPad = new Uint8Array(((data.length + 9 + 63) >> 6) << 6)
  withPad.set(data)
  withPad[data.length] = 0x80
  const view = new DataView(withPad.buffer)
  view.setUint32(withPad.length - 4, bitLen)

  let h0 = 0x6a09e667
  let h1 = 0xbb67ae85
  let h2 = 0x3c6ef372
  let h3 = 0xa54ff53a
  let h4 = 0x510e527f
  let h5 = 0x9b05688c
  let h6 = 0x1f83d9ab
  let h7 = 0x5be0cd19
  const w = new Uint32Array(64)
  const rotr = (x: number, n: number) => (x >>> n) | (x << (32 - n))

  for (let i = 0; i < withPad.length; i += 64) {
    for (let t = 0; t < 16; t++)
      w[t] = view.getUint32(i + t * 4)
    for (let t = 16; t < 64; t++) {
      const s0 = rotr(w[t - 15], 7) ^ rotr(w[t - 15], 18) ^ (w[t - 15] >>> 3)
      const s1 = rotr(w[t - 2], 17) ^ rotr(w[t - 2], 19) ^ (w[t - 2] >>> 10)
      w[t] = (w[t - 16] + s0 + w[t - 7] + s1) >>> 0
    }
    let a = h0
    let b = h1
    let c = h2
    let d = h3
    let e = h4
    let f = h5
    let g = h6
    let h = h7
    for (let t = 0; t < 64; t++) {
      const S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25)
      const ch = (e & f) ^ (~e & g)
      const t1 = (h + S1 + ch + K[t] + w[t]) >>> 0
      const S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22)
      const maj = (a & b) ^ (a & c) ^ (b & c)
      const t2 = (S0 + maj) >>> 0
      h = g
      g = f
      f = e
      e = (d + t1) >>> 0
      d = c
      c = b
      b = a
      a = (t1 + t2) >>> 0
    }
    h0 = (h0 + a) >>> 0
    h1 = (h1 + b) >>> 0
    h2 = (h2 + c) >>> 0
    h3 = (h3 + d) >>> 0
    h4 = (h4 + e) >>> 0
    h5 = (h5 + f) >>> 0
    h6 = (h6 + g) >>> 0
    h7 = (h7 + h) >>> 0
  }

  const out = new Uint8Array(32)
  const hv = [h0, h1, h2, h3, h4, h5, h6, h7]
  for (let i = 0; i < 8; i++) {
    out[i * 4] = (hv[i] >>> 24) & 0xff
    out[i * 4 + 1] = (hv[i] >>> 16) & 0xff
    out[i * 4 + 2] = (hv[i] >>> 8) & 0xff
    out[i * 4 + 3] = hv[i] & 0xff
  }
  return out
}

/** RSA-OAEP-SHA256，密文标准 Base64。登录/建用户等口令上送前调用。 */
export async function encryptSecret(plaintext: string): Promise<string> {
  const pub = await publicKey()
  if (globalThis.crypto?.subtle && pub.publicKeySpki) {
    try {
      return await encryptSubtle(pub.publicKeySpki, plaintext)
    }
    catch {
      // HTTP 公网或部分 WebView 没有 SubtleCrypto，走纯 JS。
    }
  }
  return encryptOaepSha256(pub.modulus, pub.exponent, plaintext)
}
