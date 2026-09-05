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

let cachedSpki: string | null = null

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

async function publicSpki(): Promise<string> {
  if (cachedSpki)
    return cachedSpki
  const res = await ajax<ICryptoPubkey>({
    method: "GET",
    url: `${config.baseAPI}/admin/auth_public/v1/crypto_pubkey`
  })
  if (res.code !== 0 || !res.result?.publicKeySpki)
    throw new Error(res.msg || "获取加密公钥失败")
  cachedSpki = res.result.publicKeySpki
  return cachedSpki
}

/** RSA-OAEP-SHA256，密文标准 Base64。登录/建用户等口令上送前调用。 */
export async function encryptSecret(plaintext: string): Promise<string> {
  const spki = await publicSpki()
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
