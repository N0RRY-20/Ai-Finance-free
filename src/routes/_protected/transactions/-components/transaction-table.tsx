import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
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
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '#/components/ui/pagination'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import { Skeleton } from '#/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table'
import { cn } from '#/lib/utils'
import type {
  PaginatedTransactionsResult,
  SerializedTransaction,
  TransactionPageSize,
} from '#/types/finance'
import { formatDateId } from '#/utils/format'
import { TRANSACTION_PAGE_SIZES } from '#/validations/transaction.validation'
import {
  MoreHorizontal,
  Pencil,
  Plus,
  ReceiptText,
  RotateCcw,
  Trash2,
} from 'lucide-react'

interface TransactionTableProps {
  data: PaginatedTransactionsResult
  hasActiveFilters: boolean
  isLoading: boolean
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: TransactionPageSize) => void
  onCreateClick: () => void
  onEditClick: (transaction: SerializedTransaction) => void
  onDeleteClick: (transaction: SerializedTransaction) => void
  onResetFilters: () => void
}

function buildPaginationItems(
  currentPage: number,
  totalPages: number,
): Array<number | 'ellipsis'> {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  const items: Array<number | 'ellipsis'> = [1]
  const start = Math.max(2, currentPage - 1)
  const end = Math.min(totalPages - 1, currentPage + 1)

  if (start > 2) {
    items.push('ellipsis')
  }

  for (let page = start; page <= end; page++) {
    items.push(page)
  }

  if (end < totalPages - 1) {
    items.push('ellipsis')
  }

  items.push(totalPages)
  return items
}

export function TransactionTable({
  data,
  hasActiveFilters,
  isLoading,
  onPageChange,
  onPageSizeChange,
  onCreateClick,
  onEditClick,
  onDeleteClick,
  onResetFilters,
}: TransactionTableProps) {
  const { items, pagination } = data
  const { page, pageSize, totalItems, totalPages } = pagination

  const startItem = totalItems === 0 ? 0 : (page - 1) * pageSize + 1
  const endItem = Math.min(page * pageSize, totalItems)
  const pageNumbers = buildPaginationItems(page, totalPages)

  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle>Daftar Transaksi</CardTitle>
        <CardDescription>
          {totalItems === 0
            ? 'Tidak ada transaksi yang ditampilkan'
            : `Menampilkan ${startItem}–${endItem} dari ${totalItems} transaksi`}
        </CardDescription>
        <CardAction>
          <div className="flex items-center gap-2">
            <span className="hidden text-xs text-muted-foreground sm:inline">
              Baris per halaman
            </span>
            <Select
              value={String(pageSize)}
              onValueChange={(value) =>
                onPageSizeChange(Number(value) as TransactionPageSize)
              }
            >
              <SelectTrigger size="sm" aria-label="Baris per halaman">
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper" align="end">
                <SelectGroup>
                  {TRANSACTION_PAGE_SIZES.map((size) => (
                    <SelectItem key={size} value={String(size)}>
                      {size} / halaman
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </CardAction>
      </CardHeader>

      <CardContent>
        {isLoading && items.length === 0 ? (
          <div className="flex flex-col gap-3 py-4">
            {Array.from({ length: 5 }, (_, index) => (
              <Skeleton key={index} className="h-11 w-full" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <ReceiptText />
              </EmptyMedia>
              <EmptyTitle>
                {hasActiveFilters
                  ? 'Tidak ada transaksi yang cocok'
                  : 'Belum ada transaksi'}
              </EmptyTitle>
              <EmptyDescription>
                {hasActiveFilters
                  ? 'Coba ubah kata kunci pencarian atau reset filter untuk melihat semua transaksi.'
                  : 'Mulai catat pemasukan dan pengeluaran Anda untuk memantau arus kas secara teratur.'}
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              {hasActiveFilters ? (
                <Button variant="outline" onClick={onResetFilters}>
                  <RotateCcw data-icon="inline-start" />
                  Reset Filter
                </Button>
              ) : (
                <Button onClick={onCreateClick}>
                  <Plus data-icon="inline-start" />
                  Tambah Transaksi
                </Button>
              )}
            </EmptyContent>
          </Empty>
        ) : (
          <div className={cn(isLoading && 'opacity-60 transition-opacity')}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Tipe</TableHead>
                  <TableHead>Deskripsi</TableHead>
                  <TableHead className="text-right">Nominal</TableHead>
                  <TableHead className="w-14 text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="text-muted-foreground">
                      {formatDateId(item.transactionDate)}
                    </TableCell>
                    <TableCell className="font-medium">
                      {item.categoryLabel}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          item.type === 'income' ? 'secondary' : 'destructive'
                        }
                      >
                        {item.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <span
                        className="block truncate text-muted-foreground"
                        title={item.description || undefined}
                      >
                        {item.description || '—'}
                      </span>
                    </TableCell>
                    <TableCell
                      className={cn(
                        'text-right font-medium tabular-nums',
                        item.type === 'expense' && 'text-destructive',
                      )}
                    >
                      {item.type === 'income' ? '+' : '-'}
                      {item.amountFormatted}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label={`Aksi untuk ${item.categoryLabel}`}
                          >
                            <MoreHorizontal />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuGroup>
                            <DropdownMenuItem onClick={() => onEditClick(item)}>
                              <Pencil />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              variant="destructive"
                              onClick={() => onDeleteClick(item)}
                            >
                              <Trash2 />
                              Hapus
                            </DropdownMenuItem>
                          </DropdownMenuGroup>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      {totalItems > 0 && (
        <CardFooter className="flex flex-col items-center justify-between gap-3 border-t sm:flex-row">
          <p className="text-xs text-muted-foreground">
            Halaman {page} dari {totalPages}
          </p>

          <Pagination className="mx-0 w-auto justify-end">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  text="Sebelumnya"
                  aria-disabled={page <= 1}
                  tabIndex={page <= 1 ? -1 : undefined}
                  className={cn(page <= 1 && 'pointer-events-none opacity-50')}
                  onClick={(e) => {
                    e.preventDefault()
                    if (page > 1) onPageChange(page - 1)
                  }}
                />
              </PaginationItem>

              {pageNumbers.map((entry, index) =>
                entry === 'ellipsis' ? (
                  <PaginationItem key={`ellipsis-${index}`}>
                    <PaginationEllipsis />
                  </PaginationItem>
                ) : (
                  <PaginationItem key={entry}>
                    <PaginationLink
                      href="#"
                      isActive={entry === page}
                      onClick={(e) => {
                        e.preventDefault()
                        if (entry !== page) onPageChange(entry)
                      }}
                    >
                      {entry}
                    </PaginationLink>
                  </PaginationItem>
                ),
              )}

              <PaginationItem>
                <PaginationNext
                  href="#"
                  text="Berikutnya"
                  aria-disabled={page >= totalPages}
                  tabIndex={page >= totalPages ? -1 : undefined}
                  className={cn(
                    page >= totalPages && 'pointer-events-none opacity-50',
                  )}
                  onClick={(e) => {
                    e.preventDefault()
                    if (page < totalPages) onPageChange(page + 1)
                  }}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </CardFooter>
      )}
    </Card>
  )
}
