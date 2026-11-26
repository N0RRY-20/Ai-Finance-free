import { Alert, AlertDescription, AlertTitle } from '#/components/ui/alert'
import { Avatar, AvatarFallback, AvatarImage } from '#/components/ui/avatar'
import { Button } from '#/components/ui/button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '#/components/ui/empty'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from '#/components/ui/input-group'
import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageHeader,
} from '#/components/ui/message'
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from '#/components/ui/message-scroller'
import {
  CHAT_IMAGE_ACCEPT,
  MAX_CHAT_IMAGES_PER_MESSAGE,
  MAX_TOTAL_IMAGES_BYTES,
  formatAttachmentSize,
} from '#/constants/chat-media'
import type { ChatImageAttachmentMeta } from '#/types/ai'
import type { PreparedChatImage } from '#/utils/chat-image'
import {
  extractImageFilesFromClipboard,
  prepareChatImageFile,
} from '#/utils/chat-image'
import { getInitials } from '#/utils/string'
import type { ContentPart } from '@tanstack/ai'
import type { UIMessage } from '@tanstack/ai-react'
import { fetchServerSentEvents, useChat } from '@tanstack/ai-react'
import {
  AlertCircleIcon,
  BotIcon,
  CameraIcon,
  ImageIcon,
  ImagePlusIcon,
  Loader2Icon,
  SendHorizontalIcon,
  SquareIcon,
  XIcon,
} from 'lucide-react'
import { useRef, useState } from 'react'
import { toast } from 'sonner'
import { ChatMessageParts } from './chat-message-parts'

const MUTATING_TOOL_NAMES = new Set([
  'record_transaction',
  'update_transaction',
  'delete_transaction',
])

const QUICK_PROMPTS = [
  'Saya barusan beli buah 10rbu',
  'Terima gaji 5jt hari ini',
  'Ringkasan pengeluaran bulan ini',
  'Lihat transaksi terbaru',
] as const

interface FinanceChatThreadProps {
  conversationId: string
  initialMessages: UIMessage[]
  userName: string
  userImage?: string | null
  onConversationActivity: () => void
  onTransactionMutated: () => void
}

function isToolCallSucceeded(part: UIMessage['parts'][number]): boolean {
  if (part.type !== 'tool-call') return false
  if (!MUTATING_TOOL_NAMES.has(part.name)) return false
  if (part.state !== 'complete') return false
  if (
    typeof part.output === 'object' &&
    part.output !== null &&
    'success' in part.output &&
    part.output.success === false
  ) {
    return false
  }
  return true
}

export function FinanceChatThread({
  conversationId,
  initialMessages,
  userName,
  userImage,
  onConversationActivity,
  onTransactionMutated,
}: FinanceChatThreadProps) {
  const [input, setInput] = useState('')
  const [attachedImages, setAttachedImages] = useState<PreparedChatImage[]>([])
  const [isPreparingImages, setIsPreparingImages] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const [failedPreviewIds, setFailedPreviewIds] = useState<
    Record<string, boolean>
  >({})
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const cameraInputRef = useRef<HTMLInputElement | null>(null)

  const { messages, sendMessage, isLoading, error, stop } = useChat({
    connection: fetchServerSentEvents('/api/chat'),
    threadId: conversationId,
    initialMessages,
    onFinish: (message) => {
      onConversationActivity()
      const hasMutation = message.parts.some(isToolCallSucceeded)
      if (hasMutation) {
        onTransactionMutated()
        toast.success('Data transaksi berhasil diperbarui')
      }
    },
  })

  const handleAddFiles = async (files: File[]) => {
    if (files.length === 0 || isLoading || isPreparingImages) return

    const remaining = MAX_CHAT_IMAGES_PER_MESSAGE - attachedImages.length
    if (remaining <= 0) {
      toast.warning(
        `Maksimal ${MAX_CHAT_IMAGES_PER_MESSAGE} gambar yang dapat dikirim sekaligus.`,
      )
      return
    }

    const filesToProcess =
      files.length > remaining ? files.slice(0, remaining) : files
    if (files.length > remaining) {
      toast.warning(
        `Hanya ${remaining} gambar pertama yang ditambahkan (batas ${MAX_CHAT_IMAGES_PER_MESSAGE} gambar per pesan).`,
      )
    }

    setIsPreparingImages(true)
    try {
      let runningTotalBytes = attachedImages.reduce(
        (sum, img) => sum + img.sizeBytes,
        0,
      )
      const preparedList: PreparedChatImage[] = []

      for (const file of filesToProcess) {
        try {
          const prepared = await prepareChatImageFile(file)
          if (runningTotalBytes + prepared.sizeBytes > MAX_TOTAL_IMAGES_BYTES) {
            toast.error(
              `Total ukuran gambar melebihi batas ${formatAttachmentSize(MAX_TOTAL_IMAGES_BYTES)}.`,
            )
            break
          }
          runningTotalBytes += prepared.sizeBytes
          preparedList.push(prepared)
        } catch (err) {
          toast.error(
            err instanceof Error
              ? err.message
              : `Gagal memproses gambar "${file.name}".`,
          )
        }
      }

      if (preparedList.length > 0) {
        setAttachedImages((prev) =>
          [...prev, ...preparedList].slice(0, MAX_CHAT_IMAGES_PER_MESSAGE),
        )
      }
    } finally {
      setIsPreparingImages(false)
    }
  }

  const handleRemoveImage = (id: string) => {
    setAttachedImages((prev) => prev.filter((img) => img.id !== id))
    setFailedPreviewIds((prev) => {
      if (!prev[id]) return prev
      const next = { ...prev }
      delete next[id]
      return next
    })
  }

  const handleClearImages = () => {
    setAttachedImages([])
    setFailedPreviewIds({})
  }

  const handleSubmit = () => {
    const trimmed = input.trim()
    if (
      (!trimmed && attachedImages.length === 0) ||
      isLoading ||
      isPreparingImages
    ) {
      return
    }

    if (attachedImages.length === 0) {
      setInput('')
      void sendMessage(trimmed)
      return
    }

    const parts: ContentPart[] = []
    if (trimmed) {
      parts.push({ type: 'text', content: trimmed })
    }

    const attachments: ChatImageAttachmentMeta[] = []
    for (const img of attachedImages) {
      parts.push({
        type: 'image',
        source: {
          type: 'data',
          value: img.base64,
          mimeType: img.mimeType,
        },
        metadata: {
          mimeType: img.mimeType,
          name: img.name,
          sizeBytes: img.sizeBytes,
          ...(img.width !== undefined ? { width: img.width } : {}),
          ...(img.height !== undefined ? { height: img.height } : {}),
        },
      })
      attachments.push({
        name: img.name,
        mimeType: img.mimeType,
        sizeBytes: img.sizeBytes,
        ...(img.width !== undefined ? { width: img.width } : {}),
        ...(img.height !== undefined ? { height: img.height } : {}),
      })
    }

    setInput('')
    setAttachedImages([])
    setFailedPreviewIds({})

    void sendMessage({
      content: parts,
      metadata: { attachments },
    })
  }

  const showPendingAssistant =
    isLoading &&
    messages.length > 0 &&
    messages[messages.length - 1]?.role === 'user'

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {messages.length === 0 ? (
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-4 sm:p-6">
          <Empty className="my-auto flex-none border p-5 sm:p-8">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <BotIcon />
              </EmptyMedia>
              <EmptyTitle>Asisten Keuangan AI</EmptyTitle>
              <EmptyDescription>
                Catat pemasukan dan pengeluaran lewat chat atau unggah beberapa
                foto struk sekaligus, cek ringkasan saldo, atau ubah transaksi
                yang tersimpan.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <div className="flex flex-wrap justify-center gap-2">
                {QUICK_PROMPTS.map((prompt) => (
                  <Button
                    key={prompt}
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isLoading}
                    onClick={() => void sendMessage(prompt)}
                  >
                    {prompt}
                  </Button>
                ))}
              </div>
            </EmptyContent>
          </Empty>
        </div>
      ) : (
        <MessageScrollerProvider autoScroll>
          <MessageScroller className="min-h-0 flex-1">
            <MessageScrollerViewport className="px-4 py-4">
              <MessageScrollerContent className="gap-5">
                {messages.map((message, index) => {
                  const isUser = message.role === 'user'
                  const isLastAssistant =
                    !isUser && index === messages.length - 1

                  return (
                    <MessageScrollerItem
                      key={message.id}
                      messageId={message.id}
                      scrollAnchor={isUser}
                    >
                      <Message align={isUser ? 'end' : 'start'}>
                        <MessageAvatar>
                          <Avatar className="size-8">
                            {isUser && userImage ? (
                              <AvatarImage src={userImage} alt={userName} />
                            ) : null}
                            <AvatarFallback>
                              {isUser ? getInitials(userName) : 'AI'}
                            </AvatarFallback>
                          </Avatar>
                        </MessageAvatar>
                        <MessageContent>
                          <MessageHeader>
                            {isUser ? userName : 'Asisten Keuangan AI'}
                          </MessageHeader>
                          <ChatMessageParts
                            message={message}
                            isStreaming={isLoading && isLastAssistant}
                          />
                        </MessageContent>
                      </Message>
                    </MessageScrollerItem>
                  )
                })}

                {showPendingAssistant ? (
                  <MessageScrollerItem messageId="pending-assistant">
                    <Message align="start">
                      <MessageAvatar>
                        <Avatar className="size-8">
                          <AvatarFallback>AI</AvatarFallback>
                        </Avatar>
                      </MessageAvatar>
                      <MessageContent>
                        <MessageHeader>Asisten Keuangan AI</MessageHeader>
                        <span className="shimmer px-3.5 text-sm text-muted-foreground">
                          Sedang memproses...
                        </span>
                      </MessageContent>
                    </Message>
                  </MessageScrollerItem>
                ) : null}
              </MessageScrollerContent>
            </MessageScrollerViewport>
            <MessageScrollerButton />
          </MessageScroller>
        </MessageScrollerProvider>
      )}

      {error ? (
        <div className="px-4 pb-2">
          <Alert variant="destructive">
            <AlertCircleIcon />
            <AlertTitle>Gagal memproses permintaan</AlertTitle>
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
        </div>
      ) : null}

      <form
        onSubmit={(event) => {
          event.preventDefault()
          handleSubmit()
        }}
        onDragOver={(event) => {
          if (
            !isLoading &&
            Array.from(event.dataTransfer.types).includes('Files')
          ) {
            event.preventDefault()
            setIsDragOver(true)
          }
        }}
        onDragLeave={(event) => {
          if (
            !event.currentTarget.contains(event.relatedTarget as Node | null)
          ) {
            setIsDragOver(false)
          }
        }}
        onDrop={(event) => {
          event.preventDefault()
          setIsDragOver(false)
          const files = Array.from(event.dataTransfer.files)
          if (files.length > 0) {
            void handleAddFiles(files)
          }
        }}
        className="shrink-0 border-t p-3 sm:p-4"
      >
        {/* Ditempatkan di luar InputGroup agar klik pada InputGroupAddon tidak memicu fokus ke input file tersembunyi */}
        <input
          ref={fileInputRef}
          type="file"
          accept={CHAT_IMAGE_ACCEPT}
          multiple
          className="sr-only"
          aria-hidden="true"
          tabIndex={-1}
          onChange={(event) => {
            const files = Array.from(event.target.files ?? [])
            event.target.value = ''
            if (files.length > 0) {
              void handleAddFiles(files)
            }
          }}
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="sr-only"
          aria-hidden="true"
          tabIndex={-1}
          onChange={(event) => {
            const files = Array.from(event.target.files ?? [])
            event.target.value = ''
            if (files.length > 0) {
              void handleAddFiles(files)
            }
          }}
        />
        <InputGroup
          className={
            isDragOver ? 'border-primary ring-2 ring-primary/30' : undefined
          }
        >
          {attachedImages.length > 0 || isPreparingImages ? (
            <InputGroupAddon
              align="block-start"
              className="cursor-default flex-col items-stretch gap-2 border-b pb-2.5"
            >
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  {isPreparingImages ? (
                    <>
                      <Loader2Icon className="size-3.5 animate-spin" />
                      Memproses gambar...
                    </>
                  ) : (
                    `${attachedImages.length}/${MAX_CHAT_IMAGES_PER_MESSAGE} gambar siap dikirim`
                  )}
                </span>
                {attachedImages.length > 1 ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="xs"
                    disabled={isLoading || isPreparingImages}
                    onClick={handleClearImages}
                  >
                    Hapus semua
                  </Button>
                ) : null}
              </div>

              {attachedImages.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {attachedImages.map((img) => {
                    const previewFailed = Boolean(failedPreviewIds[img.id])
                    return (
                      <div
                        key={img.id}
                        title={`${img.name} (${formatAttachmentSize(img.sizeBytes)})`}
                        className="group relative size-16 shrink-0 overflow-hidden rounded-xl border bg-background"
                      >
                        {previewFailed ? (
                          <div className="flex size-full flex-col items-center justify-center gap-0.5 p-1 text-muted-foreground">
                            <ImageIcon className="size-4" />
                            <span className="w-full truncate text-center text-[9px]">
                              {img.name}
                            </span>
                          </div>
                        ) : (
                          <img
                            src={img.previewUrl}
                            alt={img.name}
                            className="size-full object-cover"
                            onError={() =>
                              setFailedPreviewIds((prev) => ({
                                ...prev,
                                [img.id]: true,
                              }))
                            }
                          />
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(img.id)}
                          disabled={isLoading}
                          aria-label={`Hapus ${img.name}`}
                          className="absolute top-1 right-1 flex size-5 items-center justify-center rounded-full bg-background/90 text-foreground shadow-xs transition-colors hover:bg-destructive hover:text-destructive-foreground"
                        >
                          <XIcon className="size-3" />
                        </button>
                      </div>
                    )
                  })}
                </div>
              ) : null}
            </InputGroupAddon>
          ) : null}

          <InputGroupTextarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onPaste={(event) => {
              const imageFiles = extractImageFilesFromClipboard(
                event.clipboardData,
              )
              if (imageFiles.length > 0) {
                const hasPlainText = Boolean(
                  event.clipboardData.getData('text/plain'),
                )
                if (!hasPlainText) {
                  event.preventDefault()
                }
                void handleAddFiles(imageFiles)
              }
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault()
                handleSubmit()
              }
            }}
            placeholder="Ketik transaksi atau unggah/tempel foto struk..."
            rows={2}
            disabled={isLoading}
            aria-label="Pesan untuk asisten keuangan"
          />
          <InputGroupAddon align="block-end" className="justify-between pt-0">
            <div className="flex items-center gap-1">
              <InputGroupButton
                type="button"
                variant="ghost"
                size="icon-sm"
                className="hidden md:flex"
                aria-label="Lampirkan foto struk"
                title={`Unggah foto struk (maks. ${MAX_CHAT_IMAGES_PER_MESSAGE} gambar)`}
                disabled={
                  isLoading ||
                  isPreparingImages ||
                  attachedImages.length >= MAX_CHAT_IMAGES_PER_MESSAGE
                }
                onClick={() => fileInputRef.current?.click()}
              >
                <ImagePlusIcon />
              </InputGroupButton>
              <InputGroupButton
                type="button"
                variant="ghost"
                size="icon-sm"
                className="md:hidden"
                aria-label="Foto struk dengan kamera"
                title="Foto struk langsung dengan kamera"
                disabled={
                  isLoading ||
                  isPreparingImages ||
                  attachedImages.length >= MAX_CHAT_IMAGES_PER_MESSAGE
                }
                onClick={() => cameraInputRef.current?.click()}
              >
                <CameraIcon />
              </InputGroupButton>
              <span className="hidden pl-1 text-xs text-muted-foreground sm:inline">
                Enter kirim · Maks. {MAX_CHAT_IMAGES_PER_MESSAGE} foto struk
              </span>
            </div>
            {isLoading ? (
              <InputGroupButton
                type="button"
                variant="destructive"
                size="sm"
                onClick={stop}
              >
                <SquareIcon data-icon="inline-start" />
                Hentikan
              </InputGroupButton>
            ) : (
              <InputGroupButton
                type="submit"
                variant="default"
                size="sm"
                disabled={
                  (!input.trim() && attachedImages.length === 0) ||
                  isPreparingImages
                }
              >
                <SendHorizontalIcon data-icon="inline-start" />
                Kirim
              </InputGroupButton>
            )}
          </InputGroupAddon>
        </InputGroup>
      </form>
    </div>
  )
}
