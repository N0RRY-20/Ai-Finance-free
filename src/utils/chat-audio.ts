import type { ChatAudioMimeType } from '#/constants/chat-media'
import {
  MAX_ENCODED_AUDIO_BYTES,
  MIN_AUDIO_DURATION_MS,
  estimateBase64ByteSize,
  formatAttachmentSize,
  normalizeChatAudioMimeType,
  resolveAudioPlaybackMimeType,
} from '#/constants/chat-media'

export interface RecordedAudioInput {
  blob: Blob
  base64: string
  mimeType: string
  durationMs: number
}

export interface PreparedChatAudio {
  id: string
  name: string
  mimeType: ChatAudioMimeType
  playbackMimeType: string
  sizeBytes: number
  durationMs: number
  base64: string
  previewUrl: string
}

const PREFERRED_RECORDING_MIME_TYPES = [
  'audio/webm;codecs=opus',
  'audio/webm',
  'audio/ogg;codecs=opus',
  'audio/ogg',
  'audio/mp4',
] as const

export function pickPreferredRecordingMimeType(): string | undefined {
  if (
    typeof MediaRecorder === 'undefined' ||
    typeof MediaRecorder.isTypeSupported !== 'function'
  ) {
    return undefined
  }

  return PREFERRED_RECORDING_MIME_TYPES.find((mime) =>
    MediaRecorder.isTypeSupported(mime),
  )
}

export function prepareRecordedChatAudio(
  recording: RecordedAudioInput,
): PreparedChatAudio {
  if (recording.durationMs < MIN_AUDIO_DURATION_MS) {
    throw new Error('Rekaman terlalu singkat. Coba rekam ulang.')
  }

  const base64 = recording.base64.trim()
  if (!base64 || recording.blob.size <= 0) {
    throw new Error('Data rekaman suara kosong. Silakan coba rekam ulang.')
  }

  const mimeType = normalizeChatAudioMimeType(recording.mimeType)
  if (!mimeType) {
    throw new Error('Format rekaman audio browser tidak didukung oleh Gemini.')
  }

  const sizeBytes =
    recording.blob.size > 0
      ? recording.blob.size
      : estimateBase64ByteSize(base64)

  if (sizeBytes > MAX_ENCODED_AUDIO_BYTES) {
    throw new Error(
      `Ukuran rekaman suara (${formatAttachmentSize(sizeBytes)}) melebihi batas ${formatAttachmentSize(MAX_ENCODED_AUDIO_BYTES)}.`,
    )
  }

  const playbackMimeType = resolveAudioPlaybackMimeType(
    mimeType,
    recording.mimeType,
  )
  const previewUrl = URL.createObjectURL(recording.blob)

  return {
    id: crypto.randomUUID(),
    name: 'Pesan suara',
    mimeType,
    playbackMimeType,
    sizeBytes,
    durationMs: Math.round(recording.durationMs),
    base64,
    previewUrl,
  }
}

export function getAudioRecorderErrorMessage(error: unknown): string | null {
  if (error instanceof Error) {
    if (
      error.message === 'Recording cancelled' ||
      error.name === 'AbortError'
    ) {
      return null
    }

    switch (error.name) {
      case 'NotAllowedError':
      case 'PermissionDeniedError':
        return 'Izin mikrofon ditolak. Aktifkan akses mikrofon di pengaturan browser Anda.'
      case 'NotFoundError':
      case 'DevicesNotFoundError':
        return 'Mikrofon tidak ditemukan pada perangkat ini.'
      case 'NotReadableError':
      case 'TrackStartError':
        return 'Mikrofon sedang digunakan oleh aplikasi lain.'
      case 'SecurityError':
        return 'Perekaman suara memerlukan koneksi HTTPS atau localhost.'
      default:
        return error.message || 'Gagal merekam suara. Silakan coba lagi.'
    }
  }

  return 'Gagal merekam suara. Silakan coba lagi.'
}

export function revokeChatAudioPreviewUrl(
  url: string | null | undefined,
): void {
  if (typeof url === 'string' && url.startsWith('blob:')) {
    URL.revokeObjectURL(url)
  }
}
