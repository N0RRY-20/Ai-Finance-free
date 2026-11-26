export const ALLOWED_CHAT_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
] as const

export type ChatImageMimeType = (typeof ALLOWED_CHAT_IMAGE_MIME_TYPES)[number]

export const CHAT_IMAGE_ACCEPT = ALLOWED_CHAT_IMAGE_MIME_TYPES.join(',')

export const MAX_CHAT_IMAGES_PER_MESSAGE = 5
export const MAX_RAW_IMAGE_BYTES = 10 * 1024 * 1024
export const MAX_ENCODED_IMAGE_BYTES = 4 * 1024 * 1024
export const MAX_TOTAL_IMAGES_BYTES = 12 * 1024 * 1024
export const MAX_HISTORY_INLINE_IMAGE_BYTES = 16 * 1024 * 1024
export const IMAGE_MAX_DIMENSION = 1600
export const IMAGE_JPEG_QUALITY = 0.82

const ALLOWED_MIME_SET = new Set<string>(ALLOWED_CHAT_IMAGE_MIME_TYPES)

const EXTENSION_TO_MIME: Record<string, ChatImageMimeType | undefined> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.heic': 'image/heic',
  '.heif': 'image/heif',
}

export function isAllowedChatImageMimeType(
  mimeType: string,
): mimeType is ChatImageMimeType {
  return ALLOWED_MIME_SET.has(mimeType.toLowerCase())
}

export function resolveChatImageMimeType(file: {
  type: string
  name: string
}): ChatImageMimeType | null {
  const normalizedType = file.type.trim().toLowerCase()
  if (normalizedType === 'image/jpg') {
    return 'image/jpeg'
  }
  if (isAllowedChatImageMimeType(normalizedType)) {
    return normalizedType
  }

  const dotIndex = file.name.lastIndexOf('.')
  if (dotIndex !== -1) {
    const ext = file.name.slice(dotIndex).toLowerCase()
    const mapped = EXTENSION_TO_MIME[ext]
    if (mapped) {
      return mapped
    }
  }

  return null
}

export function estimateBase64ByteSize(base64: string): number {
  const cleaned = base64.replace(/\s+/g, '')
  const len = cleaned.length
  if (len === 0) return 0

  let padding = 0
  if (cleaned.endsWith('==')) {
    padding = 2
  } else if (cleaned.endsWith('=')) {
    padding = 1
  }

  return Math.max(0, Math.floor((len * 3) / 4) - padding)
}

export function formatAttachmentSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return '0 B'
  }
  if (bytes < 1024) {
    return `${Math.round(bytes)} B`
  }
  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} KB`
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
