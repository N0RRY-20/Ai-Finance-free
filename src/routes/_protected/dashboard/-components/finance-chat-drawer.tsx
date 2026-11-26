import { Button } from '#/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '#/components/ui/empty'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '#/components/ui/sheet'
import { Skeleton } from '#/components/ui/skeleton'
import { getUserAiKeyStatusFn } from '#/server/ai-key.functions'
import {
  deleteConversationFn,
  getConversationMessagesFn,
  listConversationsFn,
} from '#/server/chat.functions'
import type { SerializedConversation, UserAiKeyStatus } from '#/types/ai'
import type { UIMessage } from '@tanstack/ai-react'
import { Link } from '@tanstack/react-router'
import {
  CheckIcon,
  ChevronDownIcon,
  HistoryIcon,
  KeyRoundIcon,
  MessageSquareIcon,
  PlusIcon,
  SettingsIcon,
  Trash2Icon,
} from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { FinanceChatThread } from './finance-chat-thread'

interface FinanceChatDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userName: string
  userImage?: string | null
  initialAiKeyStatus: UserAiKeyStatus
  onTransactionMutated: () => void
}

export function FinanceChatDrawer({
  open,
  onOpenChange,
  userName,
  userImage,
  initialAiKeyStatus,
  onTransactionMutated,
}: FinanceChatDrawerProps) {
  const [aiKeyStatus, setAiKeyStatus] =
    useState<UserAiKeyStatus>(initialAiKeyStatus)
  const [conversations, setConversations] = useState<SerializedConversation[]>(
    [],
  )
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(null)
  const [initialMessages, setInitialMessages] = useState<UIMessage[]>([])
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const loadRequestIdRef = useRef(0)

  useEffect(() => {
    setAiKeyStatus(initialAiKeyStatus)
  }, [initialAiKeyStatus])

  const refreshConversations = useCallback(async () => {
    try {
      const list = await listConversationsFn()
      setConversations(list)
    } catch {
      // Abaikan jika gagal memuat daftar riwayat sementara
    }
  }, [])

  const refreshAiKeyStatus = useCallback(async () => {
    try {
      const latest = await getUserAiKeyStatusFn()
      setAiKeyStatus(latest)
    } catch {
      // Abaikan jika gagal memuat status key sementara
    }
  }, [])

  useEffect(() => {
    if (!open) return

    if (!activeConversationId) {
      setActiveConversationId(crypto.randomUUID())
      setInitialMessages([])
    }

    void refreshConversations()
    void refreshAiKeyStatus()
  }, [open, activeConversationId, refreshConversations, refreshAiKeyStatus])

  const handleNewChat = () => {
    loadRequestIdRef.current += 1
    setIsLoadingMessages(false)
    setInitialMessages([])
    setActiveConversationId(crypto.randomUUID())
  }

  const handleSelectConversation = async (conversationId: string) => {
    if (conversationId === activeConversationId && !isLoadingMessages) {
      return
    }

    const requestId = ++loadRequestIdRef.current
    setActiveConversationId(conversationId)
    setIsLoadingMessages(true)

    try {
      const loaded = await getConversationMessagesFn({
        data: { conversationId },
      })
      if (loadRequestIdRef.current !== requestId) return
      setInitialMessages(loaded)
    } catch (err) {
      if (loadRequestIdRef.current !== requestId) return
      toast.error(
        err instanceof Error ? err.message : 'Gagal memuat riwayat percakapan.',
      )
      setInitialMessages([])
    } finally {
      if (loadRequestIdRef.current === requestId) {
        setIsLoadingMessages(false)
      }
    }
  }

  const activeConversation = conversations.find(
    (item) => item.id === activeConversationId,
  )

  const handleDeleteActiveConversation = async () => {
    if (!activeConversationId || !activeConversation || isDeleting) return

    setIsDeleting(true)
    try {
      await deleteConversationFn({
        data: { conversationId: activeConversationId },
      })
      toast.success('Percakapan berhasil dihapus')
      handleNewChat()
      await refreshConversations()
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Gagal menghapus percakapan.',
      )
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex flex-col gap-0 p-0 data-[side=right]:w-full data-[side=right]:sm:max-w-xl"
      >
        <SheetHeader className="shrink-0 border-b p-4 pr-12 sm:p-6 sm:pr-12">
          <SheetTitle>Asisten Keuangan AI</SheetTitle>
          <SheetDescription>
            Catat, lihat, ubah, dan hapus transaksi lewat chat alami atau unggah
            foto struk.
          </SheetDescription>
          <div className="flex items-center gap-2 pt-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="min-w-0 flex-1 sm:max-w-56 sm:flex-initial"
                >
                  <HistoryIcon data-icon="inline-start" />
                  <span className="min-w-0 flex-1 truncate text-left">
                    {activeConversation?.title ?? 'Percakapan Baru'}
                  </span>
                  <ChevronDownIcon data-icon="inline-end" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-72" align="start">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Riwayat Percakapan</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {conversations.length === 0 ? (
                    <DropdownMenuItem disabled>
                      Belum ada riwayat tersimpan
                    </DropdownMenuItem>
                  ) : (
                    conversations.map((conv) => (
                      <DropdownMenuItem
                        key={conv.id}
                        onClick={() => void handleSelectConversation(conv.id)}
                      >
                        <MessageSquareIcon />
                        <span className="min-w-0 flex-1 truncate">
                          {conv.title}
                        </span>
                        {conv.id === activeConversationId ? (
                          <CheckIcon />
                        ) : null}
                      </DropdownMenuItem>
                    ))
                  )}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="shrink-0"
              onClick={handleNewChat}
            >
              <PlusIcon data-icon="inline-start" />
              Chat Baru
            </Button>

            {activeConversation ? (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="shrink-0"
                aria-label="Hapus percakapan ini"
                disabled={isDeleting}
                onClick={() => void handleDeleteActiveConversation()}
              >
                <Trash2Icon />
              </Button>
            ) : null}
          </div>
        </SheetHeader>

        {!aiKeyStatus.hasKey ? (
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-4 sm:p-6">
            <Empty className="my-auto flex-none border p-5 sm:p-8">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <KeyRoundIcon />
                </EmptyMedia>
                <EmptyTitle>API Key Gemini Diperlukan</EmptyTitle>
                <EmptyDescription>
                  Akun ini belum memiliki API Key Gemini. Silakan atur API Key
                  pribadi Anda di halaman Pengaturan untuk mulai menggunakan
                  Asisten Keuangan AI.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button asChild>
                  <Link to="/settings" onClick={() => onOpenChange(false)}>
                    <SettingsIcon data-icon="inline-start" />
                    Buka Pengaturan
                  </Link>
                </Button>
              </EmptyContent>
            </Empty>
          </div>
        ) : !activeConversationId || isLoadingMessages ? (
          <div className="flex flex-1 flex-col gap-4 p-6">
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="ml-auto h-10 w-2/3" />
            <Skeleton className="h-20 w-4/5" />
          </div>
        ) : (
          <FinanceChatThread
            key={activeConversationId}
            conversationId={activeConversationId}
            initialMessages={initialMessages}
            userName={userName}
            userImage={userImage}
            onConversationActivity={() => void refreshConversations()}
            onTransactionMutated={onTransactionMutated}
          />
        )}
      </SheetContent>
    </Sheet>
  )
}
