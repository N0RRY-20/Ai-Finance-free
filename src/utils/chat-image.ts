import type { ChatImageMimeType } from '#/constants/chat-media'
import {
  IMAGE_JPEG_QUALITY,
  IMAGE_MAX_DIMENSION,
  MAX_ENCODED_IMAGE_BYTES,
  MAX_RAW_IMAGE_BYTES,
  formatAttachmentSize,
  resolveChatImageMimeType,
} from '#/constants/chat-media'

const PASSTHROUGH_MAX_BYTES = 500 * 1024

export interface PreparedChatImage {
  id: string
  name: string
  mimeType: ChatImageMimeType
  sizeBytes: number
  width?: number
  height?: number
  base64: string
  previewUrl: string
}

export function readFileAsBase64(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result
      if (typeof result !== 'string') {
        reject(new Error('Gagal membaca file gambar.'))
        return
      }
      const commaIndex = result.indexOf(',')
      if (commaIndex === -1) {
        reject(new Error('Format data gambar tidak valid.'))
        return
      }
      resolve(result.slice(commaIndex + 1))
    }
    reader.onerror = () => {
      reject(reader.error ?? new Error('Gagal membaca file gambar.'))
    }
    reader.readAsDataURL(file)
  })
}

async function compressBitmapToJpeg(
  bitmap: ImageBitmap,
  targetWidth: number,
  targetHeight: number,
): Promise<Blob> {
  const canvas = document.createElement('canvas')
  canvas.width = targetWidth
  canvas.height = targetHeight

  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('Browser tidak mendukung pemrosesan gambar kanvas.')
  }

  // Isi latar putih agar gambar PNG transparan tidak berubah menjadi hitam saat diekspor ke JPEG.
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, targetWidth, targetHeight)
  ctx.drawImage(bitmap, 0, 0, targetWidth, targetHeight)

  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Gagal mengompresi gambar.'))
          return
        }
        resolve(blob)
      },
      'image/jpeg',
      IMAGE_JPEG_QUALITY,
    )
  })
}

export async function prepareChatImageFile(
  file: File,
): Promise<PreparedChatImage> {
  const resolvedMimeType = resolveChatImageMimeType(file)
  if (!resolvedMimeType) {
    throw new Error(
      `Format file "${file.name}" tidak didukung. Gunakan JPG, PNG, WebP, HEIC, atau HEIF.`,
    )
  }

  if (file.size > MAX_RAW_IMAGE_BYTES) {
    throw new Error(
      `Ukuran file "${file.name}" (${formatAttachmentSize(file.size)}) melebihi batas ${formatAttachmentSize(MAX_RAW_IMAGE_BYTES)}.`,
    )
  }

  const name = file.name.trim() || 'struk.jpg'
  let mimeType: ChatImageMimeType = resolvedMimeType
  let sizeBytes = file.size
  let width: number | undefined
  let height: number | undefined
  let base64: string

  let bitmap: ImageBitmap | null = null
  try {
    bitmap = await createImageBitmap(file)
  } catch {
    bitmap = null
  }

  if (bitmap) {
    try {
      const origWidth = bitmap.width
      const origHeight = bitmap.height

      const isCanvasFriendly =
        mimeType === 'image/jpeg' ||
        mimeType === 'image/png' ||
        mimeType === 'image/webp'

      if (
        origWidth <= IMAGE_MAX_DIMENSION &&
        origHeight <= IMAGE_MAX_DIMENSION &&
        file.size <= PASSTHROUGH_MAX_BYTES &&
        isCanvasFriendly
      ) {
        width = origWidth
        height = origHeight
        base64 = await readFileAsBase64(file)
      } else {
        const scale = Math.min(
          1,
          IMAGE_MAX_DIMENSION / Math.max(origWidth, origHeight, 1),
        )
        const targetWidth = Math.max(1, Math.round(origWidth * scale))
        const targetHeight = Math.max(1, Math.round(origHeight * scale))

        const compressedBlob = await compressBitmapToJpeg(
          bitmap,
          targetWidth,
          targetHeight,
        )

        mimeType = 'image/jpeg'
        sizeBytes = compressedBlob.size
        width = targetWidth
        height = targetHeight
        base64 = await readFileAsBase64(compressedBlob)
      }
    } finally {
      bitmap.close()
    }
  } else {
    // Fallback untuk format seperti HEIC/HEIF yang mungkin tidak bisa didekode browser secara lokal
    base64 = await readFileAsBase64(file)
  }

  if (sizeBytes > MAX_ENCODED_IMAGE_BYTES) {
    throw new Error(
      `Ukuran gambar "${name}" setelah diproses (${formatAttachmentSize(sizeBytes)}) masih melebihi batas ${formatAttachmentSize(MAX_ENCODED_IMAGE_BYTES)}.`,
    )
  }

  return {
    id: crypto.randomUUID(),
    name,
    mimeType,
    sizeBytes,
    ...(width !== undefined ? { width } : {}),
    ...(height !== undefined ? { height } : {}),
    base64,
    previewUrl: `data:${mimeType};base64,${base64}`,
  }
}

export function extractImageFilesFromClipboard(
  clipboardData: DataTransfer | null | undefined,
): File[] {
  if (!clipboardData) return []

  const files: File[] = []
  for (const item of Array.from(clipboardData.items)) {
    if (item.kind !== 'file') continue
    const file = item.getAsFile()
    if (!file) continue
    if (
      file.type.startsWith('image/') ||
      resolveChatImageMimeType(file) !== null
    ) {
      files.push(file)
    }
  }

  return files
}
