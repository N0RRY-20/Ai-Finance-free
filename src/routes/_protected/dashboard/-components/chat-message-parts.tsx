import { ChatMarkdown } from '#/components/ai/chat-markdown'
import { Badge } from '#/components/ui/badge'
import { Bubble, BubbleContent } from '#/components/ui/bubble'
import { CodeBlock, CodeBlockContent } from '#/components/ui/code-block'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'
import {
  Trace,
  TraceCollapsible,
  TraceCollapsibleContent,
  TraceCollapsibleTrigger,
  TraceDescription,
  TraceIcon,
  TraceLine,
  TraceTitle,
} from '#/components/ui/trace'
import { formatAttachmentSize } from '#/constants/chat-media'
import type { ChatImageAttachmentMeta } from '#/types/ai'
import type { UIMessage } from '@tanstack/ai-react'
import type { LucideIcon } from 'lucide-react'
import {
  BrainIcon,
  ImageIcon,
  ListFilterIcon,
  PencilIcon,
  PieChartIcon,
  ReceiptTextIcon,
  Trash2Icon,
  WrenchIcon,
  ZoomInIcon,
} from 'lucide-react'
import { useState } from 'react'

type MessagePart = UIMessage['parts'][number]
type ThinkingMessagePart = Extract<MessagePart, { type: 'thinking' }>
type ToolCallMessagePart = Extract<MessagePart, { type: 'tool-call' }>

interface LiveImageItem {
  id: string
  src: string
  name: string
  sizeBytes?: number
}

interface ToolMeta {
  icon: LucideIcon
  runningLabel: string
  doneLabel: string
  errorLabel: string
}

function getToolMeta(toolName: string): ToolMeta {
  switch (toolName) {
    case 'record_transaction':
      return {
        icon: ReceiptTextIcon,
        runningLabel: 'Mencatat transaksi...',
        doneLabel: 'Transaksi dicatat',
        errorLabel: 'Gagal mencatat transaksi',
      }
    case 'list_transactions':
      return {
        icon: ListFilterIcon,
        runningLabel: 'Memuat daftar transaksi...',
        doneLabel: 'Daftar transaksi dimuat',
        errorLabel: 'Gagal memuat transaksi',
      }
    case 'get_transaction_summary':
      return {
        icon: PieChartIcon,
        runningLabel: 'Menghitung ringkasan keuangan...',
        doneLabel: 'Ringkasan keuangan dihitung',
        errorLabel: 'Gagal menghitung ringkasan',
      }
    case 'update_transaction':
      return {
        icon: PencilIcon,
        runningLabel: 'Memperbarui transaksi...',
        doneLabel: 'Transaksi diperbarui',
        errorLabel: 'Gagal memperbarui transaksi',
      }
    case 'delete_transaction':
      return {
        icon: Trash2Icon,
        runningLabel: 'Menghapus transaksi...',
        doneLabel: 'Transaksi dihapus',
        errorLabel: 'Gagal menghapus transaksi',
      }
    default:
      return {
        icon: WrenchIcon,
        runningLabel: `Menjalankan ${toolName}...`,
        doneLabel: `${toolName} selesai`,
        errorLabel: `${toolName} gagal`,
      }
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function getToolDescription(part: ToolCallMessagePart): string | undefined {
  if (!isRecord(part.output)) return undefined

  if (
    isRecord(part.output.transaction) &&
    typeof part.output.transaction.amountFormatted === 'string'
  ) {
    return part.output.transaction.amountFormatted
  }

  if (typeof part.output.count === 'number') {
    return `${part.output.count} item`
  }

  if (
    isRecord(part.output.summary) &&
    typeof part.output.summary.balanceFormatted === 'string'
  ) {
    return part.output.summary.balanceFormatted
  }

  return undefined
}

function formatToolOutput(output: unknown): string {
  if (typeof output === 'string') {
    return output
  }
  try {
    return JSON.stringify(output, null, 2)
  } catch {
    return String(output)
  }
}

function ThinkingTraceItem({
  part,
  isRunning,
}: {
  part: ThinkingMessagePart
  isRunning: boolean
}) {
  return (
    <TraceCollapsible defaultOpen={isRunning}>
      <TraceCollapsibleTrigger>
        <TraceLine status={isRunning ? 'running' : undefined}>
          <TraceIcon>
            <BrainIcon />
          </TraceIcon>
          <TraceTitle>
            {isRunning ? 'Sedang berpikir...' : 'Proses berpikir'}
          </TraceTitle>
        </TraceLine>
      </TraceCollapsibleTrigger>
      <TraceCollapsibleContent>
        <p className="text-xs whitespace-pre-wrap">{part.content}</p>
      </TraceCollapsibleContent>
    </TraceCollapsible>
  )
}

function ToolCallTraceItem({ part }: { part: ToolCallMessagePart }) {
  const meta = getToolMeta(part.name)
  const Icon = meta.icon
  const outputFailed = isRecord(part.output) && part.output.success === false
  const isError = part.state === 'error' || outputFailed
  const isComplete = part.state === 'complete'
  const status: 'running' | 'error' | undefined = isError
    ? 'error'
    : isComplete
      ? undefined
      : 'running'

  const title = isError
    ? meta.errorLabel
    : isComplete
      ? meta.doneLabel
      : meta.runningLabel
  const description = getToolDescription(part)

  const line = (
    <TraceLine status={status}>
      <TraceIcon>
        <Icon />
      </TraceIcon>
      <TraceTitle>{title}</TraceTitle>
      {description ? <TraceDescription>{description}</TraceDescription> : null}
    </TraceLine>
  )

  if (part.output === undefined) {
    return line
  }

  return (
    <TraceCollapsible>
      <TraceCollapsibleTrigger>{line}</TraceCollapsibleTrigger>
      <TraceCollapsibleContent>
        <CodeBlock size="sm" variant={isError ? 'destructive' : 'default'}>
          <CodeBlockContent wrap className="max-h-64">
            {formatToolOutput(part.output)}
          </CodeBlockContent>
        </CodeBlock>
      </TraceCollapsibleContent>
    </TraceCollapsible>
  )
}

function getMessageAttachments(message: UIMessage): ChatImageAttachmentMeta[] {
  if (
    !isRecord(message.metadata) ||
    !Array.isArray(message.metadata.attachments)
  ) {
    return []
  }

  const parsed: ChatImageAttachmentMeta[] = []
  for (const item of message.metadata.attachments) {
    if (!isRecord(item)) continue
    if (
      typeof item.name !== 'string' ||
      !item.name.trim() ||
      typeof item.mimeType !== 'string' ||
      typeof item.sizeBytes !== 'number' ||
      !Number.isFinite(item.sizeBytes)
    ) {
      continue
    }
    parsed.push({
      name: item.name,
      mimeType: item.mimeType,
      sizeBytes: item.sizeBytes,
      ...(typeof item.width === 'number' && Number.isFinite(item.width)
        ? { width: item.width }
        : {}),
      ...(typeof item.height === 'number' && Number.isFinite(item.height)
        ? { height: item.height }
        : {}),
    })
  }

  return parsed
}

function buildLiveImages(
  parts: UIMessage['parts'],
  savedAttachments: ChatImageAttachmentMeta[],
): LiveImageItem[] {
  const images: LiveImageItem[] = []
  let imgIndex = 0

  for (const part of parts) {
    if (part.type !== 'image') continue
    if (part.source.type === 'file') {
      imgIndex += 1
      continue
    }

    const src =
      part.source.type === 'url'
        ? part.source.value
        : `data:${part.source.mimeType};base64,${part.source.value}`
    const partMeta = isRecord(part.metadata) ? part.metadata : undefined
    const saved = savedAttachments.at(imgIndex)
    const name =
      typeof partMeta?.name === 'string' && partMeta.name.trim()
        ? partMeta.name.trim()
        : (saved?.name ?? `Lampiran ${imgIndex + 1}`)
    const sizeBytes =
      typeof partMeta?.sizeBytes === 'number' &&
      Number.isFinite(partMeta.sizeBytes)
        ? partMeta.sizeBytes
        : saved?.sizeBytes

    images.push({
      id: `live-img-${imgIndex}`,
      src,
      name,
      sizeBytes,
    })
    imgIndex += 1
  }

  return images
}

function LiveImageCard({
  item,
  onPreview,
}: {
  item: LiveImageItem
  onPreview: (item: LiveImageItem) => void
}) {
  const [hasError, setHasError] = useState(false)

  return (
    <button
      type="button"
      onClick={() => onPreview(item)}
      aria-label={`Pratinjau ${item.name}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border bg-muted/40 text-left transition-colors hover:border-primary/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
    >
      {hasError ? (
        <div className="flex h-28 w-full flex-col items-center justify-center gap-1.5 bg-muted/60 px-3 text-muted-foreground">
          <ImageIcon className="size-6" />
          <span className="line-clamp-1 text-xs font-medium">{item.name}</span>
        </div>
      ) : (
        <div className="relative h-32 w-full overflow-hidden bg-muted/60">
          <img
            src={item.src}
            alt={item.name}
            className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.03]"
            onError={() => setHasError(true)}
          />
          <span className="absolute right-2 bottom-2 flex size-6 items-center justify-center rounded-full bg-background/80 text-foreground opacity-0 shadow-xs backdrop-blur-xs transition-opacity group-hover:opacity-100">
            <ZoomInIcon className="size-3.5" />
          </span>
        </div>
      )}
      <div className="flex items-center justify-between gap-2 px-2.5 py-1.5 text-[11px]">
        <span className="min-w-0 flex-1 truncate font-medium">{item.name}</span>
        {item.sizeBytes !== undefined ? (
          <span className="shrink-0 text-muted-foreground">
            {formatAttachmentSize(item.sizeBytes)}
          </span>
        ) : null}
      </div>
    </button>
  )
}

export function ChatMessageParts({
  message,
  isStreaming,
}: {
  message: UIMessage
  isStreaming: boolean
}) {
  const [previewImage, setPreviewImage] = useState<LiveImageItem | null>(null)
  const isUser = message.role === 'user'
  const savedAttachments = getMessageAttachments(message)
  const liveImages = buildLiveImages(message.parts, savedAttachments)

  if (
    message.parts.length === 0 &&
    savedAttachments.length === 0 &&
    isStreaming &&
    !isUser
  ) {
    return (
      <span className="shimmer px-3.5 text-sm text-muted-foreground">
        Sedang memproses...
      </span>
    )
  }

  type RenderGroup =
    | { kind: 'trace'; parts: Array<ThinkingMessagePart | ToolCallMessagePart> }
    | { kind: 'text'; content: string }

  const groups: RenderGroup[] = []

  for (const part of message.parts) {
    if (part.type === 'thinking' || part.type === 'tool-call') {
      const last = groups.at(-1)
      if (last && last.kind === 'trace') {
        last.parts.push(part)
      } else {
        groups.push({ kind: 'trace', parts: [part] })
      }
    } else if (part.type === 'text' && part.content) {
      groups.push({ kind: 'text', content: part.content })
    }
  }

  if (
    groups.length === 0 &&
    liveImages.length === 0 &&
    savedAttachments.length === 0 &&
    isStreaming &&
    !isUser
  ) {
    return (
      <span className="shimmer px-3.5 text-sm text-muted-foreground">
        Sedang memproses...
      </span>
    )
  }

  return (
    <div className="flex min-w-0 flex-col gap-2">
      {liveImages.length > 0 ? (
        <div
          className={
            liveImages.length >= 2
              ? `grid max-w-[85%] grid-cols-2 gap-2 ${isUser ? 'self-end' : 'self-start'}`
              : `grid w-60 max-w-[85%] grid-cols-1 gap-2 ${isUser ? 'self-end' : 'self-start'}`
          }
        >
          {liveImages.map((item) => (
            <LiveImageCard
              key={item.id}
              item={item}
              onPreview={setPreviewImage}
            />
          ))}
        </div>
      ) : savedAttachments.length > 0 ? (
        <div
          className={`flex max-w-[85%] flex-col gap-1.5 ${isUser ? 'items-end self-end' : 'items-start self-start'}`}
        >
          <div
            className={`flex flex-wrap gap-1.5 ${isUser ? 'justify-end' : 'justify-start'}`}
          >
            {savedAttachments.map((att, index) => (
              <Badge
                key={`${att.name}-${index}`}
                variant="secondary"
                className="h-auto max-w-full gap-1.5 py-1 pr-2.5 pl-2"
              >
                <ImageIcon className="shrink-0" />
                <span className="max-w-44 truncate">{att.name}</span>
                <span className="shrink-0 text-muted-foreground">
                  ({formatAttachmentSize(att.sizeBytes)})
                </span>
              </Badge>
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground">
            Lampiran gambar tidak disimpan di riwayat
          </p>
        </div>
      ) : null}

      {groups.map((group, groupIndex) => {
        if (group.kind === 'trace') {
          return (
            <Trace key={`trace-${groupIndex}`} className="px-1">
              {group.parts.map((part, partIndex) => {
                if (part.type === 'thinking') {
                  const hasLaterGroups = groupIndex < groups.length - 1
                  const hasLaterParts = partIndex < group.parts.length - 1
                  const isRunning =
                    isStreaming && !hasLaterGroups && !hasLaterParts
                  return (
                    <ThinkingTraceItem
                      key={`thinking-${partIndex}`}
                      part={part}
                      isRunning={isRunning}
                    />
                  )
                }

                return <ToolCallTraceItem key={part.id} part={part} />
              })}
            </Trace>
          )
        }

        if (isUser) {
          return (
            <Bubble key={`text-${groupIndex}`} variant="default" align="end">
              <BubbleContent className="whitespace-pre-wrap">
                {group.content}
              </BubbleContent>
            </Bubble>
          )
        }

        const isStreamingGroup = isStreaming && groupIndex === groups.length - 1

        return (
          <Bubble
            key={`text-${groupIndex}`}
            variant="muted"
            align="start"
            className="max-w-[90%]"
          >
            <BubbleContent>
              <ChatMarkdown
                content={group.content}
                isStreaming={isStreamingGroup}
              />
            </BubbleContent>
          </Bubble>
        )
      })}

      <Dialog
        open={previewImage !== null}
        onOpenChange={(open) => {
          if (!open) setPreviewImage(null)
        }}
      >
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="truncate pr-8">
              {previewImage?.name}
            </DialogTitle>
            <DialogDescription>
              {previewImage?.sizeBytes !== undefined
                ? formatAttachmentSize(previewImage.sizeBytes)
                : 'Lampiran gambar'}
            </DialogDescription>
          </DialogHeader>
          {previewImage ? (
            <div className="flex max-h-[75vh] items-center justify-center overflow-hidden rounded-xl bg-muted/40 p-2">
              <img
                src={previewImage.src}
                alt={previewImage.name}
                className="max-h-[70vh] w-auto rounded-lg object-contain"
              />
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}
