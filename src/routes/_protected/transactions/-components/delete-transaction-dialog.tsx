import * as React from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '#/components/ui/alert-dialog'
import { Badge } from '#/components/ui/badge'
import { Spinner } from '#/components/ui/spinner'
import { deleteTransactionFn } from '#/server/transaction.functions'
import type { SerializedTransaction } from '#/types/finance'
import { formatDateId } from '#/utils/format'
import { toast } from '@yusufceng1z/ding-react'

interface DeleteTransactionDialogProps {
  transaction: SerializedTransaction | null
  onOpenChange: (open: boolean) => void
  onDeleted: () => Promise<void> | void
}

export function DeleteTransactionDialog({
  transaction,
  onOpenChange,
  onDeleted,
}: DeleteTransactionDialogProps) {
  const [isDeleting, setIsDeleting] = React.useState(false)

  const handleConfirmDelete = async (
    e: React.MouseEvent<HTMLButtonElement>,
  ) => {
    e.preventDefault()
    if (!transaction) return

    setIsDeleting(true)
    try {
      const result = await deleteTransactionFn({
        data: { transactionId: transaction.id },
      })

      if (!result.ok) {
        toast.error(result.error)
        return
      }

      toast.success('Transaksi berhasil dihapus.')
      onOpenChange(false)
      await onDeleted()
    } catch {
      toast.error('Terjadi kesalahan saat menghapus transaksi.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <AlertDialog open={transaction !== null} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus Transaksi?</AlertDialogTitle>
          <AlertDialogDescription>
            Tindakan ini tidak dapat dibatalkan. Data transaksi berikut akan
            dihapus secara permanen dari riwayat Anda.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {transaction && (
          <div className="flex flex-col gap-2 rounded-2xl border bg-muted/40 p-3 text-sm">
            <div className="flex items-center justify-between gap-2">
              <span className="font-medium">{transaction.categoryLabel}</span>
              <Badge
                variant={
                  transaction.type === 'income' ? 'secondary' : 'destructive'
                }
              >
                {transaction.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
              </Badge>
            </div>
            <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
              <span>{formatDateId(transaction.transactionDate)}</span>
              <span className="font-semibold text-foreground tabular-nums">
                {transaction.amountFormatted}
              </span>
            </div>
            {transaction.description && (
              <p className="text-xs text-muted-foreground">
                {transaction.description}
              </p>
            )}
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Batal</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={isDeleting}
            onClick={handleConfirmDelete}
          >
            {isDeleting && <Spinner data-icon="inline-start" />}
            {isDeleting ? 'Menghapus...' : 'Hapus Transaksi'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
