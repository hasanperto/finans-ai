'use client'

const ITERATIONS = 100_000
const HASH_LEN = 32 // bytes
const SALT_LEN = 16 // bytes
const PREFIX = 'pbkdf2$'

function bytesToB64(bytes: Uint8Array): string {
  let s = ''
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i])
  return btoa(s)
}

function b64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64)
  const out = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i)
  return out
}

async function deriveBits(plain: string, salt: Uint8Array, iterations: number): Promise<Uint8Array> {
  const enc = new TextEncoder()
  const keyBytes = enc.encode(plain)
  const key = await crypto.subtle.importKey(
    'raw',
    keyBytes.buffer.slice(keyBytes.byteOffset, keyBytes.byteOffset + keyBytes.byteLength) as ArrayBuffer,
    'PBKDF2',
    false,
    ['deriveBits']
  )
  const saltBuf = salt.buffer.slice(salt.byteOffset, salt.byteOffset + salt.byteLength) as ArrayBuffer
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: saltBuf, iterations, hash: 'SHA-256' },
    key,
    HASH_LEN * 8
  )
  return new Uint8Array(bits)
}

export function isHashed(value: string | undefined | null): boolean {
  return !!value && value.startsWith(PREFIX)
}

export async function hashSecret(plain: string): Promise<string> {
  if (!plain) return ''
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LEN))
  const hash = await deriveBits(plain, salt, ITERATIONS)
  return `${PREFIX}${ITERATIONS}$${bytesToB64(salt)}$${bytesToB64(hash)}`
}

export async function verifySecret(plain: string, stored: string | undefined | null): Promise<boolean> {
  if (!stored) return false
  if (!isHashed(stored)) {
    // Legacy plain-text secret — compare as-is. Caller should re-hash & save on success.
    return plain === stored
  }
  const parts = stored.split('$')
  // ['pbkdf2', '', '<iter>', '<salt>', '<hash>']  – split keeps the empty between 'pbkdf2' and ''
  // Actually 'pbkdf2$100000$salt$hash'.split('$') => ['pbkdf2','100000','salt','hash']
  if (parts.length < 4) return false
  const iter = Number(parts[1])
  if (!Number.isFinite(iter) || iter <= 0) return false
  const salt = b64ToBytes(parts[2])
  const expected = b64ToBytes(parts[3])
  const computed = await deriveBits(plain, salt, iter)
  if (computed.length !== expected.length) return false
  // Constant-time compare
  let diff = 0
  for (let i = 0; i < computed.length; i++) diff |= computed[i] ^ expected[i]
  return diff === 0
}
