import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '#/components/ui/alert-dialog'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from '#/components/ui/field'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '#/components/ui/input-group'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import { Spinner } from '#/components/ui/spinner'
import {
  DEFAULT_GEMINI_MODEL,
  GEMINI_CHAT_MODEL_OPTIONS,
} from '#/constants/ai-models'
import { deleteUserAiKeyFn, saveUserAiKeyFn } from '#/server/ai-key.functions'
import type { GeminiChatModelId, UserAiKeyStatus } from '#/types/ai'
import { createSaveAiKeyFormSchema } from '#/validations/ai-key.validation'
import { EyeIcon, EyeOffIcon, KeyRoundIcon, Trash2Icon } from 'lucide-react'
import { useEffect, useId, useState } from 'react'
import { toast } from 'sonner'

interface AiKeySettingsFormProps {
  status: UserAiKeyStatus
  onStatusChange: (next: UserAiKeyStatus) => void
  compact?: boolean
}

export function AiKeySettingsForm({
  status,
  onStatusChange,
  compact = false,
}: AiKeySettingsFormProps) {
  const [apiKey, setApiKey] = useState('')
  const [model, setModel] = useState<GeminiChatModelId>(status.model)
  const [showKey, setShowKey] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [fieldError, setFieldError] = useState<string | null>(null)

  const apiKeyInputId = useId()
  const modelSelectId = useId()

  useEffect(() => {
    setModel(status.model)
  }, [status.model])

  const selectedModelMeta = GEMINI_CHAT_MODEL_OPTIONS.find(
    (item) => item.id === model,
  )

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const parsed = createSaveAiKeyFormSchema(status.hasKey).safeParse({
      apiKey,
      model,
    })
    if (!parsed.success) {
      setFieldError(parsed.error.issues[0]?.message ?? 'Input tidak valid.')
      return
    }

    const trimmedApiKey = parsed.data.apiKey

    setFieldError(null)
    setIsSaving(true)

    try {
      const nextStatus = await saveUserAiKeyFn({
        data: {
          ...(trimmedApiKey.length > 0 ? { apiKey: trimmedApiKey } : {}),
          model: parsed.data.model,
        },
      })
      setApiKey('')
      onStatusChange(nextStatus)
      toast.success(
        trimmedApiKey.length > 0
          ? 'API Key Gemini berhasil disimpan'
          : 'Model Gemini berhasil diperbarui',
      )
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Gagal menyimpan API Key Gemini.'
      setFieldError(message)
      toast.error(message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    setFieldError(null)

    try {
      await deleteUserAiKeyFn()
      setApiKey('')
      onStatusChange({
        hasKey: false,
        provider: 'gemini',
        keyHint: null,
        model: DEFAULT_GEMINI_MODEL,
        updatedAt: null,
      })
      toast.success('API Key Gemini berhasil dihapus')
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Gagal menghapus API Key Gemini.'
      toast.error(message)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <form
      onSubmit={(event) => void handleSubmit(event)}
      className="flex flex-col gap-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm font-medium">Status API Key</span>
        <Badge variant={status.hasKey ? 'secondary' : 'outline'}>
          {status.hasKey
            ? `Tersimpan (${status.keyHint ?? '••••'})`
            : 'Belum Diatur'}
        </Badge>
      </div>

      <FieldGroup className={compact ? 'gap-4' : undefined}>
        <Field data-invalid={Boolean(fieldError) || undefined}>
          <FieldLabel htmlFor={apiKeyInputId}>
            {status.hasKey ? 'Ganti API Key Gemini' : 'API Key Gemini'}
          </FieldLabel>
          <InputGroup>
            <InputGroupInput
              id={apiKeyInputId}
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(event) => {
                setApiKey(event.target.value)
                if (fieldError) setFieldError(null)
              }}
              placeholder={
                status.hasKey
                  ? 'Kosongkan jika hanya ingin mengganti model'
                  : 'AIzaSy...'
              }
              autoComplete="off"
              spellCheck={false}
              aria-invalid={Boolean(fieldError) || undefined}
              disabled={isSaving || isDeleting}
            />
            <InputGroupAddon align="inline-end">
              <InputGroupButton
                type="button"
                size="icon-xs"
                aria-label={
                  showKey ? 'Sembunyikan API Key' : 'Tampilkan API Key'
                }
                onClick={() => setShowKey((prev) => !prev)}
              >
                {showKey ? <EyeOffIcon /> : <EyeIcon />}
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
          <FieldDescription>
            {fieldError ? (
              <span className="text-destructive">{fieldError}</span>
            ) : (
              <>
                Dapatkan API Key di{' '}
                <a
                  href="https://aistudio.google.com/apikey"
                  target="_blank"
                  rel="noreferrer"
                  className="underline underline-offset-4 hover:text-foreground"
                >
                  Google AI Studio
                </a>
                . Key dienkripsi AES-256-GCM sebelum disimpan ke database.
              </>
            )}
          </FieldDescription>
        </Field>

        <Field>
          <FieldLabel htmlFor={modelSelectId}>Model Gemini</FieldLabel>
          <Select
            value={model}
            onValueChange={(value) => setModel(value as GeminiChatModelId)}
            disabled={isSaving || isDeleting}
          >
            <SelectTrigger id={modelSelectId} className="w-full">
              <SelectValue placeholder="Pilih model Gemini" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {GEMINI_CHAT_MODEL_OPTIONS.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          {selectedModelMeta ? (
            <FieldDescription>{selectedModelMeta.description}</FieldDescription>
          ) : null}
        </Field>
      </FieldGroup>

      <div className="flex flex-wrap items-center gap-2">
        <Button type="submit" disabled={isSaving || isDeleting}>
          {isSaving ? (
            <>
              <Spinner data-icon="inline-start" />
              Menyimpan...
            </>
          ) : (
            <>
              <KeyRoundIcon data-icon="inline-start" />
              {status.hasKey ? 'Simpan Perubahan' : 'Simpan API Key'}
            </>
          )}
        </Button>

        {status.hasKey ? (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                type="button"
                variant="destructive"
                disabled={isSaving || isDeleting}
              >
                {isDeleting ? (
                  <>
                    <Spinner data-icon="inline-start" />
                    Menghapus...
                  </>
                ) : (
                  <>
                    <Trash2Icon data-icon="inline-start" />
                    Hapus API Key
                  </>
                )}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Hapus API Key Gemini?</AlertDialogTitle>
                <AlertDialogDescription>
                  Setelah dihapus, Asisten Keuangan AI tidak dapat memproses
                  pesan hingga Anda menyimpan API Key pribadi yang baru.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Batal</AlertDialogCancel>
                <AlertDialogAction
                  variant="destructive"
                  onClick={() => void handleDelete()}
                >
                  Ya, Hapus
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        ) : null}
      </div>
    </form>
  )
}
