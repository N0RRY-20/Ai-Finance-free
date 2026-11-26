import * as React from 'react'
import { RouteErrorFallback } from '#/components/common/route-error-fallback'
import { Button } from '#/components/ui/button'
import { runProtectedLoader } from '#/lib/protected-loader'
import { getTransactionsPageDataFn } from '#/server/transaction.functions'
import type {
  SerializedTransaction,
  TransactionPageSize,
  TransactionsSearchParams,
} from '#/types/finance'
import { transactionsSearchSchema } from '#/validations/transaction.validation'
import {
  createFileRoute,
  useRouter,
  useRouterState,
} from '@tanstack/react-router'
import type { ErrorComponentProps } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import { DeleteTransactionDialog } from './-components/delete-transaction-dialog'
import { TransactionFilters } from './-components/transaction-filters'
import { TransactionFormDialog } from './-components/transaction-form-dialog'
import { TransactionTable } from './-components/transaction-table'
import { TransactionsPendingState } from './-components/transactions-skeleton'

export const Route = createFileRoute('/_protected/transactions/')({
  staticData: {
    breadcrumb: 'Transaksi',
  },
  validateSearch: (search: Record<string, unknown>) =>
    transactionsSearchSchema.parse(search),
  loaderDeps: ({ search }) => search,
  loader: async ({ deps }) =>
    await runProtectedLoader(() => getTransactionsPageDataFn({ data: deps })),
  pendingComponent: TransactionsPendingState,
  errorComponent: TransactionsErrorState,
  component: TransactionsPage,
})

function TransactionsErrorState({ error, reset }: ErrorComponentProps) {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">Transaksi</h1>
        <p className="text-sm text-muted-foreground">
          Kelola seluruh pemasukan dan pengeluaran keuangan Anda di satu tempat.
        </p>
      </div>

      <RouteErrorFallback
        error={error}
        reset={reset}
        title="Gagal memuat data transaksi"
        description="Terjadi kendala saat mengambil data transaksi dari server. Silakan coba lagi."
      />
    </div>
  )
}

function TransactionsPage() {
  const data = Route.useLoaderData()
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  const router = useRouter()
  const isLoading = useRouterState({
    select: (state) => state.isLoading,
  })

  const [formOpen, setFormOpen] = React.useState(false)
  const [editingTransaction, setEditingTransaction] =
    React.useState<SerializedTransaction | null>(null)
  const [deletingTransaction, setDeletingTransaction] =
    React.useState<SerializedTransaction | null>(null)

  React.useEffect(() => {
    if (data.pagination.page !== search.page) {
      void navigate({
        search: (prev) => ({
          ...prev,
          page: data.pagination.page,
        }),
        replace: true,
      })
    }
  }, [data.pagination.page, search.page, navigate])

  const hasActiveFilters = Boolean(
    search.type ||
    search.categoryId ||
    search.startDate ||
    search.endDate ||
    search.search,
  )

  const handleSearchChange = React.useCallback(
    (patch: Partial<TransactionsSearchParams>) => {
      void navigate({
        search: (prev) => ({
          ...prev,
          ...patch,
        }),
      })
    },
    [navigate],
  )

  const handleResetFilters = React.useCallback(() => {
    void navigate({
      search: {
        page: 1,
        pageSize: search.pageSize,
      },
    })
  }, [navigate, search.pageSize])

  const handlePageChange = React.useCallback(
    (page: number) => {
      void navigate({
        search: (prev) => ({
          ...prev,
          page,
        }),
      })
    },
    [navigate],
  )

  const handlePageSizeChange = React.useCallback(
    (pageSize: TransactionPageSize) => {
      void navigate({
        search: (prev) => ({
          ...prev,
          page: 1,
          pageSize,
        }),
      })
    },
    [navigate],
  )

  const handleOpenCreate = () => {
    setEditingTransaction(null)
    setFormOpen(true)
  }

  const handleOpenEdit = (transaction: SerializedTransaction) => {
    setEditingTransaction(transaction)
    setFormOpen(true)
  }

  const handleMutationSuccess = async () => {
    await router.invalidate()
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight">Transaksi</h1>
          <p className="text-sm text-muted-foreground">
            Kelola seluruh pemasukan dan pengeluaran keuangan Anda di satu
            tempat.
          </p>
        </div>

        <Button onClick={handleOpenCreate}>
          <Plus data-icon="inline-start" />
          Tambah Transaksi
        </Button>
      </div>

      <TransactionFilters
        search={search}
        hasActiveFilters={hasActiveFilters}
        onSearchChange={handleSearchChange}
        onReset={handleResetFilters}
      />

      <TransactionTable
        data={data}
        hasActiveFilters={hasActiveFilters}
        isLoading={isLoading}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        onCreateClick={handleOpenCreate}
        onEditClick={handleOpenEdit}
        onDeleteClick={setDeletingTransaction}
        onResetFilters={handleResetFilters}
      />

      <TransactionFormDialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open)
          if (!open) {
            setEditingTransaction(null)
          }
        }}
        transaction={editingTransaction}
        onSuccess={handleMutationSuccess}
      />

      <DeleteTransactionDialog
        transaction={deletingTransaction}
        onOpenChange={(open) => {
          if (!open) {
            setDeletingTransaction(null)
          }
        }}
        onDeleted={handleMutationSuccess}
      />
    </div>
  )
}
