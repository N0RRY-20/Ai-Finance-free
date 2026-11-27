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
  MAX_AUDIO_DURATION_MS,
  MAX_CHAT_IMAGES_PER_MESSAGE,
  MAX_TOTAL_IMAGES_BYTES,
  MAX_TOTAL_MEDIA_BYTES,
  formatAttachmentSize,
  formatAudioDuration,
} from '#/constants/chat-media'
import type { ChatAttachmentMeta } from '#/types/ai'
import type { PreparedChatAudio } from '#/utils/chat-audio'
import {
  getAudioRecorderErrorMessage,
  pickPreferredRecordingMimeType,
  prepareRecordedChatAudio,
  revokeChatAudioPreviewUrl,
} from '#/utils/chat-audio'
import type { PreparedChatImage } from '#/utils/chat-image'
import {
  extractImageFilesFromClipboard,
  prepareChatImageFile,
} from '#/utils/chat-image'
import { getInitials } from '#/utils/string'
import type { ContentPart } from '@tanstack/ai'
import type { UIMessage } from '@tanstack/ai-react'
import {
  fetchServerSentEvents,
  useAudioRecorder,
  useChat,
} from '@tanstack/ai-react'
import {
  AlertCircleIcon,
  BotIcon,
  CameraIcon,
  ImageIcon,
  ImagePlusIcon,
  Loader2Icon,
  MicIcon,
  RotateCcwIcon,
  SendHorizontalIcon,
  SquareIcon,
  XIcon,
} from 'lucide-react'
import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
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

const subscribeNoop = () => () => {}

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
  const isClientMounted = useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  )
  const [input, setInput] = useState('')
  const [attachedImages, setAttachedImages] = useState<PreparedChatImage[]>([])
  const [attachedAudio, setAttachedAudio] = useState<PreparedChatAudio | null>(
    null,
  )
  const [isPreparingImages, setIsPreparingImages] = useState(false)
  const [isFinalizingAudio, setIsFinalizingAudio] = useState(false)
  const [recordingElapsedMs, setRecordingElapsedMs] = useState(0)
  const [isDragOver, setIsDragOver] = useState(false)
  const [failedPreviewIds, setFailedPreviewIds] = useState<
    Record<string, boolean>
  >({})
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const cameraInputRef = useRef<HTMLInputElement | null>(null)
  const attachedAudioUrlRef = useRef<string | null>(null)
  const pendingRecorderActionRef = useRef(false)
  const isStoppingAudioRef = useRef(false)
  const attachedImagesBytesRef = useRef(0)
  const autoStopActionRef = useRef<() => void>(() => {})

  const {
    isRecording,
    isSupported: isRecorderSupported,
    start: startRecorder,
    stop: stopRecorder,
    cancel: cancelRecorder,
  } = useAudioRecorder({
    mimeType: pickPreferredRecordingMimeType(),
    onError: (err) => {
      if (pendingRecorderActionRef.current) return
      const msg = getAudioRecorderErrorMessage(err)
      if (msg) {
        toast.error(msg)
      }
    },
  })

  const canRecordAudio = isClientMounted && isRecorderSupported

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

  useEffect(() => {
    return () => {
      revokeChatAudioPreviewUrl(attachedAudioUrlRef.current)
    }
  }, [])

  useEffect(() => {
    attachedImagesBytesRef.current = attachedImages.reduce(
      (sum, img) => sum + img.sizeBytes,
      0,
    )
  }, [attachedImages])

  const clearAttachedAudio = () => {
    revokeChatAudioPreviewUrl(attachedAudioUrlRef.current)
    attachedAudioUrlRef.current = null
    setAttachedAudio(null)
  }

  const handleStopRecording = async (options?: { autoStopped?: boolean }) => {
    if (!isRecording || isStoppingAudioRef.current) return

    isStoppingAudioRef.current = true
    pendingRecorderActionRef.current = true
    setIsFinalizingAudio(true)
    try {
      const recorded = await stopRecorder()
      const prepared = prepareRecordedChatAudio(recorded)

      if (
        attachedImagesBytesRef.current + prepared.sizeBytes >
        MAX_TOTAL_MEDIA_BYTES
      ) {
        revokeChatAudioPreviewUrl(prepared.previewUrl)
        toast.error(
          `Total ukuran lampiran melebihi batas ${formatAttachmentSize(MAX_TOTAL_MEDIA_BYTES)}.`,
        )
        return
      }

      revokeChatAudioPreviewUrl(attachedAudioUrlRef.current)
      attachedAudioUrlRef.current = prepared.previewUrl
      setAttachedAudio(prepared)

      if (options?.autoStopped) {
        toast.info(
          'Batas durasi rekaman 2 menit tercapai. Rekaman siap ditinjau.',
        )
      }
    } catch (err) {
      const msg = getAudioRecorderErrorMessage(err)
      if (msg) {
        toast.error(msg)
      }
    } finally {
      isStoppingAudioRef.current = false
      pendingRecorderActionRef.current = false
      setIsFinalizingAudio(false)
    }
  }

  useEffect(() => {
    autoStopActionRef.current = () => {
      void handleStopRecording({ autoStopped: true })
    }
  })

  useEffect(() => {
    if (!isRecording) {
      setRecordingElapsedMs(0)
      return
    }

    const startedAt = Date.now()
    setRecordingElapsedMs(0)

    const timer = window.setInterval(() => {
      const elapsed = Date.now() - startedAt
      if (elapsed >= MAX_AUDIO_DURATION_MS) {
        setRecordingElapsedMs(MAX_AUDIO_DURATION_MS)
        window.clearInterval(timer)
        autoStopActionRef.current()
        return
      }
      setRecordingElapsedMs(elapsed)
    }, 250)

    return () => {
      window.clearInterval(timer)
      setRecordingElapsedMs(0)
    }
  }, [isRecording])

  const beginRecording = async () => {
    if (
      !canRecordAudio ||
      isLoading ||
      isPreparingImages ||
      isFinalizingAudio ||
      isRecording
    ) {
      return
    }

    pendingRecorderActionRef.current = true
    try {
      await startRecorder()
    } catch (err) {
      const msg = getAudioRecorderErrorMessage(err)
      if (msg) {
        toast.error(msg)
      }
    } finally {
      pendingRecorderActionRef.current = false
    }
  }

  const handleStartRecording = async () => {
    if (attachedAudio !== null) return
    await beginRecording()
  }

  const handleReRecordAudio = async () => {
    if (
      !canRecordAudio ||
      isLoading ||
      isPreparingImages ||
      isFinalizingAudio ||
      isRecording
    ) {
      return
    }
    clearAttachedAudio()
    await beginRecording()
  }

  const handleCancelRecording = () => {
    if (!isRecording) return
    cancelRecorder()
  }

  const handleAddFiles = async (files: File[]) => {
    if (
      files.length === 0 ||
      isLoading ||
      isPreparingImages ||
      isRecording ||
      isFinalizingAudio
    ) {
      return
    }

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
      const audioBytes = attachedAudio?.sizeBytes ?? 0
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
          if (
            runningTotalBytes + prepared.sizeBytes + audioBytes >
            MAX_TOTAL_MEDIA_BYTES
          ) {
            toast.error(
              `Total ukuran lampiran melebihi batas ${formatAttachmentSize(MAX_TOTAL_MEDIA_BYTES)}.`,
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
      (!trimmed && attachedImages.length === 0 && !attachedAudio) ||
      isLoading ||
      isPreparingImages ||
      isRecording ||
      isFinalizingAudio
    ) {
      return
    }

    if (attachedImages.length === 0 && !attachedAudio) {
      setInput('')
      void sendMessage(trimmed)
      return
    }

    const parts: ContentPart[] = []
    if (trimmed) {
      parts.push({ type: 'text', content: trimmed })
    }

    const attachments: ChatAttachmentMeta[] = []
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
        kind: 'image',
        name: img.name,
        mimeType: img.mimeType,
        sizeBytes: img.sizeBytes,
        ...(img.width !== undefined ? { width: img.width } : {}),
        ...(img.height !== undefined ? { height: img.height } : {}),
      })
    }

    if (attachedAudio) {
      parts.push({
        type: 'audio',
        source: {
          type: 'data',
          value: attachedAudio.base64,
          mimeType: attachedAudio.mimeType,
        },
        metadata: {
          mimeType: attachedAudio.mimeType,
          playbackMimeType: attachedAudio.playbackMimeType,
          name: attachedAudio.name,
          sizeBytes: attachedAudio.sizeBytes,
          durationMs: attachedAudio.durationMs,
        },
      })
      attachments.push({
        kind: 'audio',
        name: attachedAudio.name,
        mimeType: attachedAudio.mimeType,
        sizeBytes: attachedAudio.sizeBytes,
        durationMs: attachedAudio.durationMs,
      })
    }

    revokeChatAudioPreviewUrl(attachedAudioUrlRef.current)
    attachedAudioUrlRef.current = null
    setInput('')
    setAttachedImages([])
    setAttachedAudio(null)
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
                Catat pemasukan dan pengeluaran lewat chat, pesan suara, atau
                unggah beberapa foto struk sekaligus, cek ringkasan saldo, atau
                ubah transaksi yang tersimpan.
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
          {isRecording ||
          isFinalizingAudio ||
          attachedAudio !== null ||
          attachedImages.length > 0 ||
          isPreparingImages ? (
            <InputGroupAddon
              align="block-start"
              className="cursor-default flex-col items-stretch gap-2.5 border-b pb-2.5"
            >
              {isRecording || isFinalizingAudio ? (
                <div className="flex items-center justify-between gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs">
                  <div className="flex min-w-0 items-center gap-2">
                    {isFinalizingAudio ? (
                      <>
                        <Loader2Icon className="size-3.5 shrink-0 animate-spin text-destructive" />
                        <span className="truncate font-medium">
                          Menyiapkan rekaman...
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="size-2 shrink-0 animate-pulse rounded-full bg-destructive" />
                        <span className="truncate font-medium">
                          Merekam suara...
                        </span>
                      </>
                    )}
                    <span className="shrink-0 text-muted-foreground tabular-nums">
                      {formatAudioDuration(recordingElapsedMs)} /{' '}
                      {formatAudioDuration(MAX_AUDIO_DURATION_MS)}
                    </span>
                  </div>

                  {isRecording ? (
                    <div className="flex shrink-0 items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="xs"
                        disabled={isFinalizingAudio}
                        onClick={handleCancelRecording}
                      >
                        <XIcon data-icon="inline-start" />
                        Batal
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        size="xs"
                        disabled={isFinalizingAudio}
                        onClick={() => void handleStopRecording()}
                      >
                        <SquareIcon data-icon="inline-start" />
                        Selesai
                      </Button>
                    </div>
                  ) : null}
                </div>
              ) : attachedAudio ? (
                <div className="flex flex-col gap-2 rounded-xl border bg-background px-3 py-2">
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <div className="flex min-w-0 items-center gap-1.5">
                      <MicIcon className="size-3.5 shrink-0 text-primary" />
                      <span className="truncate font-medium">
                        {attachedAudio.name}
                      </span>
                      <span className="shrink-0 text-muted-foreground tabular-nums">
                        {formatAudioDuration(attachedAudio.durationMs)} ·{' '}
                        {formatAttachmentSize(attachedAudio.sizeBytes)}
                      </span>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="xs"
                        disabled={isLoading || !canRecordAudio}
                        onClick={() => void handleReRecordAudio()}
                      >
                        <RotateCcwIcon data-icon="inline-start" />
                        Rekam ulang
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        disabled={isLoading}
                        aria-label="Hapus rekaman suara"
                        onClick={clearAttachedAudio}
                      >
                        <XIcon />
                      </Button>
                    </div>
                  </div>
                  <audio
                    controls
                    preload="metadata"
                    src={attachedAudio.previewUrl}
                    className="h-8 w-full"
                  />
                </div>
              ) : null}

              {attachedImages.length > 0 || isPreparingImages ? (
                <>
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
                </>
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
            placeholder="Ketik transaksi, rekam suara, atau unggah foto struk..."
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
                  isRecording ||
                  isFinalizingAudio ||
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
                  isRecording ||
                  isFinalizingAudio ||
                  attachedImages.length >= MAX_CHAT_IMAGES_PER_MESSAGE
                }
                onClick={() => cameraInputRef.current?.click()}
              >
                <CameraIcon />
              </InputGroupButton>
              {isRecording ? (
                <InputGroupButton
                  type="button"
                  variant="destructive"
                  size="icon-sm"
                  aria-label="Hentikan rekaman suara"
                  title="Hentikan rekaman"
                  disabled={isFinalizingAudio}
                  onClick={() => void handleStopRecording()}
                >
                  <SquareIcon />
                </InputGroupButton>
              ) : (
                <InputGroupButton
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Rekam pesan suara"
                  title={
                    !canRecordAudio
                      ? 'Browser tidak mendukung perekaman suara'
                      : attachedAudio
                        ? 'Hapus rekaman saat ini untuk merekam ulang'
                        : 'Rekam pesan suara (maks. 2 menit)'
                  }
                  disabled={
                    !canRecordAudio ||
                    isLoading ||
                    isPreparingImages ||
                    isFinalizingAudio ||
                    attachedAudio !== null
                  }
                  onClick={() => void handleStartRecording()}
                >
                  <MicIcon />
                </InputGroupButton>
              )}
              <span className="hidden pl-1 text-xs text-muted-foreground sm:inline">
                Enter kirim · Suara & maks. {MAX_CHAT_IMAGES_PER_MESSAGE} foto
                struk
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
                  (!input.trim() &&
                    attachedImages.length === 0 &&
                    !attachedAudio) ||
                  isPreparingImages ||
                  isRecording ||
                  isFinalizingAudio
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
