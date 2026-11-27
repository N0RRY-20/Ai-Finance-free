import * as React from 'react'
import {
  EXPENSE_CATEGORIES,
  getCategoriesByType,
  isValidCategoryForType,
} from '#/constants/categories'
import { Alert, AlertDescription } from '#/components/ui/alert'
import { Button } from '#/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '#/components/ui/field'
import { Input } from '#/components/ui/input'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
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
import { Textarea } from '#/components/ui/textarea'
import { ToggleGroup, ToggleGroupItem } from '#/components/ui/toggle-group'
import {
  createTransactionFn,
  updateTransactionFn,
} from '#/server/transaction.functions'
import type {
  CategoryId,
  SerializedTransaction,
  TransactionType,
} from '#/types/finance'
import { getTodayLocalDate } from '#/utils/format'
import { createTransactionInputSchema } from '#/validations/transaction.validation'
import { AlertCircle } from 'lucide-react'
import { toast } from '@yusufceng1z/ding-react'

interface TransactionFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  transaction: SerializedTransaction | null
  onSuccess: () => Promise<void> | void
}

type TransactionFormField =
  'type' | 'amount' | 'categoryId' | 'transactionDate' | 'description'

type FieldErrors = Partial<Record<TransactionFormField, string>>

export function TransactionFormDialog({
  open,
  onOpenChange,
  transaction,
  onSuccess,
}: TransactionFormDialogProps) {
  const isEditing = transaction !== null

  const [type, setType] = React.useState<TransactionType>('expense')
  const [amount, setAmount] = React.useState('')
  const [categoryId, setCategoryId] = React.useState<CategoryId>(
    EXPENSE_CATEGORIES[0].id,
  )
  const [transactionDate, setTransactionDate] = React.useState(() =>
    getTodayLocalDate(),
  )
  const [description, setDescription] = React.useState('')
  const [fieldErrors, setFieldErrors] = React.useState<FieldErrors>({})
  const [formError, setFormError] = React.useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  React.useEffect(() => {
    if (!open) return

    if (transaction) {
      setType(transaction.type)
      setAmount(String(transaction.amount))
      setCategoryId(transaction.categoryId)
      setTransactionDate(transaction.transactionDate)
      setDescription(transaction.description)
    } else {
      setType('expense')
      setAmount('')
      setCategoryId(EXPENSE_CATEGORIES[0].id)
      setTransactionDate(getTodayLocalDate())
      setDescription('')
    }

    setFieldErrors({})
    setFormError(null)
  }, [open, transaction])

  const categories = getCategoriesByType(type)

  const handleTypeChange = (nextValue: string) => {
    if (!nextValue) return
    const nextType = nextValue as TransactionType
    setType(nextType)

    if (!isValidCategoryForType(categoryId, nextType)) {
      const firstCategory = getCategoriesByType(nextType)[0]
      setCategoryId(firstCategory.id)
    }

    setFieldErrors((prev) => ({
      ...prev,
      type: undefined,
      categoryId: undefined,
    }))
    setFormError(null)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setFormError(null)

    const parsed = createTransactionInputSchema.safeParse({
      type,
      amount,
      categoryId,
      description,
      transactionDate,
    })

    if (!parsed.success) {
      const nextErrors: FieldErrors = {}
      for (const issue of parsed.error.issues) {
        const key = issue.path[0]
        if (typeof key === 'string' && !(key in nextErrors)) {
          nextErrors[key as TransactionFormField] = issue.message
        }
      }
      setFieldErrors(nextErrors)
      return
    }

    setFieldErrors({})
    setIsSubmitting(true)

    try {
      const result = isEditing
        ? await updateTransactionFn({
            data: {
              transactionId: transaction.id,
              patch: parsed.data,
            },
          })
        : await createTransactionFn({
            data: parsed.data,
          })

      if (!result.ok) {
        setFormError(result.error)
        toast.error(result.error)
        return
      }

      toast.success(
        isEditing
          ? 'Transaksi berhasil diperbarui.'
          : 'Transaksi berhasil ditambahkan.',
      )
      onOpenChange(false)
      await onSuccess()
    } catch {
      const message = 'Terjadi kesalahan saat menyimpan transaksi.'
      setFormError(message)
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Transaksi' : 'Tambah Transaksi'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Perbarui detail transaksi keuangan Anda di bawah ini.'
              : 'Catat pemasukan atau pengeluaran baru ke riwayat transaksi.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {formError && (
            <Alert variant="destructive">
              <AlertCircle />
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          )}

          <FieldGroup className="gap-4">
            <Field data-invalid={Boolean(fieldErrors.type) || undefined}>
              <FieldLabel>Tipe Transaksi</FieldLabel>
              <ToggleGroup
                type="single"
                variant="outline"
                spacing={0}
                value={type}
                onValueChange={handleTypeChange}
                disabled={isSubmitting}
                className="w-full"
              >
                <ToggleGroupItem value="expense" className="flex-1">
                  Pengeluaran
                </ToggleGroupItem>
                <ToggleGroupItem value="income" className="flex-1">
                  Pemasukan
                </ToggleGroupItem>
              </ToggleGroup>
              {fieldErrors.type && <FieldError>{fieldErrors.type}</FieldError>}
            </Field>

            <Field data-invalid={Boolean(fieldErrors.amount) || undefined}>
              <FieldLabel htmlFor="transaction-amount">Nominal</FieldLabel>
              <InputGroup>
                <InputGroupAddon>
                  <InputGroupText>Rp</InputGroupText>
                </InputGroupAddon>
                <InputGroupInput
                  id="transaction-amount"
                  type="number"
                  inputMode="decimal"
                  min="1"
                  step="any"
                  placeholder="Contoh: 50000"
                  value={amount}
                  disabled={isSubmitting}
                  aria-invalid={Boolean(fieldErrors.amount) || undefined}
                  onChange={(e) => {
                    setAmount(e.target.value)
                    setFieldErrors((prev) => ({ ...prev, amount: undefined }))
                  }}
                />
              </InputGroup>
              {fieldErrors.amount && (
                <FieldError>{fieldErrors.amount}</FieldError>
              )}
            </Field>

            <Field data-invalid={Boolean(fieldErrors.categoryId) || undefined}>
              <FieldLabel htmlFor="transaction-category">Kategori</FieldLabel>
              <Select
                value={categoryId}
                disabled={isSubmitting}
                onValueChange={(value) => {
                  setCategoryId(value as CategoryId)
                  setFieldErrors((prev) => ({
                    ...prev,
                    categoryId: undefined,
                  }))
                }}
              >
                <SelectTrigger
                  id="transaction-category"
                  className="w-full"
                  aria-invalid={Boolean(fieldErrors.categoryId) || undefined}
                >
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectGroup>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              {fieldErrors.categoryId && (
                <FieldError>{fieldErrors.categoryId}</FieldError>
              )}
            </Field>

            <Field
              data-invalid={Boolean(fieldErrors.transactionDate) || undefined}
            >
              <FieldLabel htmlFor="transaction-date">
                Tanggal Transaksi
              </FieldLabel>
              <Input
                id="transaction-date"
                type="date"
                value={transactionDate}
                disabled={isSubmitting}
                aria-invalid={Boolean(fieldErrors.transactionDate) || undefined}
                onChange={(e) => {
                  setTransactionDate(e.target.value)
                  setFieldErrors((prev) => ({
                    ...prev,
                    transactionDate: undefined,
                  }))
                }}
              />
              {fieldErrors.transactionDate && (
                <FieldError>{fieldErrors.transactionDate}</FieldError>
              )}
            </Field>

            <Field data-invalid={Boolean(fieldErrors.description) || undefined}>
              <FieldLabel htmlFor="transaction-description">
                Deskripsi (Opsional)
              </FieldLabel>
              <Textarea
                id="transaction-description"
                rows={3}
                maxLength={1000}
                placeholder="Contoh: Makan siang bersama tim"
                value={description}
                disabled={isSubmitting}
                aria-invalid={Boolean(fieldErrors.description) || undefined}
                onChange={(e) => {
                  setDescription(e.target.value)
                  setFieldErrors((prev) => ({
                    ...prev,
                    description: undefined,
                  }))
                }}
              />
              {fieldErrors.description && (
                <FieldError>{fieldErrors.description}</FieldError>
              )}
            </Field>
          </FieldGroup>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={() => onOpenChange(false)}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Spinner data-icon="inline-start" />}
              {isSubmitting
                ? 'Menyimpan...'
                : isEditing
                  ? 'Simpan Perubahan'
                  : 'Tambah Transaksi'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
