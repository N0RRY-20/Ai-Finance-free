import {
  createCipheriv,
  createDecipheriv,
  hkdfSync,
  randomBytes,
} from 'node:crypto'
import { serverEnv } from '#/config/env.server'

const KEY_PREFIX = 'v1'
const IV_BYTE_LENGTH = 12
const AUTH_TAG_BYTE_LENGTH = 16
const HKDF_SALT = 'ai-finance-saas:user-ai-keys'
const HKDF_INFO = 'aes-256-gcm:v1'

function getEncryptionKey(): Buffer {
  const secret =
    serverEnv.AI_KEY_ENCRYPTION_SECRET || serverEnv.BETTER_AUTH_SECRET

  if (!secret || secret.length < 16) {
    throw new Error(
      'AI_KEY_ENCRYPTION_SECRET atau BETTER_AUTH_SECRET minimal harus 16 karakter untuk mengenkripsi API Key di database.',
    )
  }

  return Buffer.from(hkdfSync('sha256', secret, HKDF_SALT, HKDF_INFO, 32))
}

export function encryptSecret(plaintext: string): string {
  const key = getEncryptionKey()
  const iv = randomBytes(IV_BYTE_LENGTH)
  const cipher = createCipheriv('aes-256-gcm', key, iv)
  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ])
  const authTag = cipher.getAuthTag()

  return `${KEY_PREFIX}:${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`
}

export function decryptSecret(payload: string): string {
  const parts = payload.split(':')
  if (parts.length !== 4 || parts[0] !== KEY_PREFIX) {
    throw new Error('Format API Key terenkripsi tidak valid.')
  }

  const [, ivHex, authTagHex, ciphertextHex] = parts
  const iv = Buffer.from(ivHex, 'hex')
  const authTag = Buffer.from(authTagHex, 'hex')
  const ciphertext = Buffer.from(ciphertextHex, 'hex')

  if (
    iv.length !== IV_BYTE_LENGTH ||
    authTag.length !== AUTH_TAG_BYTE_LENGTH ||
    ciphertext.length === 0
  ) {
    throw new Error('Data API Key terenkripsi rusak atau tidak lengkap.')
  }

  const key = getEncryptionKey()
  const decipher = createDecipheriv('aes-256-gcm', key, iv)
  decipher.setAuthTag(authTag)

  const decrypted = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ])
  return decrypted.toString('utf8')
}
