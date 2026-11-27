export const ALLOWED_CHAT_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
] as const

export type ChatImageMimeType = (typeof ALLOWED_CHAT_IMAGE_MIME_TYPES)[number]

export const CHAT_IMAGE_ACCEPT = ALLOWED_CHAT_IMAGE_MIME_TYPES.join(',')

export const ALLOWED_CHAT_AUDIO_MIME_TYPES = [
  'audio/webm',
  'audio/ogg',
  'audio/wav',
  'audio/mp3',
  'audio/mpeg',
  'audio/aac',
  'audio/m4a',
  'audio/flac',
  'audio/aiff',
  'audio/opus',
] as const

export type ChatAudioMimeType = (typeof ALLOWED_CHAT_AUDIO_MIME_TYPES)[number]

export const MAX_CHAT_IMAGES_PER_MESSAGE = 5
export const MAX_CHAT_AUDIO_PER_MESSAGE = 1
export const MAX_RAW_IMAGE_BYTES = 10 * 1024 * 1024
export const MAX_ENCODED_IMAGE_BYTES = 4 * 1024 * 1024
export const MAX_TOTAL_IMAGES_BYTES = 12 * 1024 * 1024
export const MIN_AUDIO_DURATION_MS = 500
export const MAX_AUDIO_DURATION_MS = 120_000
export const MAX_ENCODED_AUDIO_BYTES = 6 * 1024 * 1024
export const MAX_TOTAL_MEDIA_BYTES = 14 * 1024 * 1024
export const MAX_HISTORY_INLINE_MEDIA_BYTES = 16 * 1024 * 1024
export const IMAGE_MAX_DIMENSION = 1600
export const IMAGE_JPEG_QUALITY = 0.82

const ALLOWED_MIME_SET = new Set<string>(ALLOWED_CHAT_IMAGE_MIME_TYPES)
const ALLOWED_AUDIO_MIME_SET = new Set<string>(ALLOWED_CHAT_AUDIO_MIME_TYPES)

const AUDIO_MIME_ALIASES: Record<string, ChatAudioMimeType | undefined> = {
  'audio/mp4': 'audio/m4a',
  'audio/x-m4a': 'audio/m4a',
  'audio/mp4a-latm': 'audio/m4a',
  'audio/x-wav': 'audio/wav',
  'audio/wave': 'audio/wav',
  'audio/x-mpeg': 'audio/mp3',
  'audio/x-mp3': 'audio/mp3',
  'audio/x-aac': 'audio/aac',
  'audio/x-flac': 'audio/flac',
  'audio/x-ogg': 'audio/ogg',
  'application/ogg': 'audio/ogg',
}

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

export function isAllowedChatAudioMimeType(
  mimeType: string,
): mimeType is ChatAudioMimeType {
  return ALLOWED_AUDIO_MIME_SET.has(mimeType.toLowerCase())
}

export function normalizeChatAudioMimeType(
  rawMimeType: string,
): ChatAudioMimeType | null {
  const base = rawMimeType.split(';')[0]?.trim().toLowerCase() ?? ''
  if (!base) return null
  if (isAllowedChatAudioMimeType(base)) {
    return base
  }
  return AUDIO_MIME_ALIASES[base] ?? null
}

export function resolveAudioPlaybackMimeType(
  mimeType: string,
  rawMimeType?: string,
): string {
  if (typeof rawMimeType === 'string') {
    const trimmedRaw = rawMimeType.trim()
    if (trimmedRaw.toLowerCase().startsWith('audio/')) {
      return trimmedRaw
    }
  }

  const normalized = mimeType.trim().toLowerCase()
  if (normalized === 'audio/m4a') {
    return 'audio/mp4'
  }
  return mimeType.trim() || 'audio/webm'
}

export function formatAudioDuration(durationMs: number): string {
  if (!Number.isFinite(durationMs) || durationMs <= 0) {
    return '0:00'
  }
  const totalSeconds = Math.max(0, Math.round(durationMs / 1000))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

export function getChatAttachmentKind(attachment: {
  kind?: unknown
  mimeType?: string
}): 'image' | 'audio' {
  if (attachment.kind === 'audio') {
    return 'audio'
  }
  if (attachment.kind === 'image') {
    return 'image'
  }
  if (
    typeof attachment.mimeType === 'string' &&
    attachment.mimeType.trim().toLowerCase().startsWith('audio/')
  ) {
    return 'audio'
  }
  return 'image'
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
