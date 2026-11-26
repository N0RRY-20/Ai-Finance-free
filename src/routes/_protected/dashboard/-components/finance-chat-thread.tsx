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
import { getInitials } from '#/utils/string'
import type { UIMessage } from '@tanstack/ai-react'
import { fetchServerSentEvents, useChat } from '@tanstack/ai-react'
import {
  AlertCircleIcon,
  BotIcon,
  SendHorizontalIcon,
  SquareIcon,
} from 'lucide-react'
import { useState } from 'react'
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

  const handleSubmit = () => {
    const trimmed = input.trim()
    if (!trimmed || isLoading) return
    setInput('')
    void sendMessage(trimmed)
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
                Catat pemasukan dan pengeluaran cukup lewat chat alami, cek
                ringkasan saldo, atau ubah transaksi yang sudah tersimpan.
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
        className="shrink-0 border-t p-3 sm:p-4"
      >
        <InputGroup>
          <InputGroupTextarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault()
                handleSubmit()
              }
            }}
            placeholder='Contoh: "Saya barusan beli buah 10rbu"'
            rows={2}
            disabled={isLoading}
            aria-label="Pesan untuk asisten keuangan"
          />
          <InputGroupAddon
            align="block-end"
            className="justify-end pt-0 sm:justify-between"
          >
            <span className="hidden text-xs text-muted-foreground sm:inline">
              Enter kirim · Shift+Enter baris baru
            </span>
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
                disabled={!input.trim()}
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
