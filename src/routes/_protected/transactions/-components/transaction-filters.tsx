import * as React from 'react'
import {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  isValidCategoryForType,
} from '#/constants/categories'
import { Button } from '#/components/ui/button'
import { Card, CardContent } from '#/components/ui/card'
import { Field, FieldLabel } from '#/components/ui/field'
import { Input } from '#/components/ui/input'
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
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import { ToggleGroup, ToggleGroupItem } from '#/components/ui/toggle-group'
import type {
  CategoryId,
  TransactionsSearchParams,
  TransactionType,
} from '#/types/finance'
import { RotateCcw, Search, X } from 'lucide-react'

interface TransactionFiltersProps {
  search: TransactionsSearchParams
  hasActiveFilters: boolean
  onSearchChange: (patch: Partial<TransactionsSearchParams>) => void
  onReset: () => void
}

export function TransactionFilters({
  search,
  hasActiveFilters,
  onSearchChange,
  onReset,
}: TransactionFiltersProps) {
  const [keyword, setKeyword] = React.useState(search.search ?? '')

  React.useEffect(() => {
    setKeyword(search.search ?? '')
  }, [search.search])

  React.useEffect(() => {
    const trimmed = keyword.trim()
    const currentSearch = search.search ?? ''
    if (trimmed === currentSearch) return

    const timer = window.setTimeout(() => {
      onSearchChange({
        search: trimmed.length > 0 ? trimmed : undefined,
        page: 1,
      })
    }, 350)

    return () => window.clearTimeout(timer)
  }, [keyword, search.search, onSearchChange])

  const handleTypeChange = (value: string) => {
    if (!value) return
    const nextType = value === 'all' ? undefined : (value as TransactionType)
    const keepCategory =
      !nextType ||
      !search.categoryId ||
      isValidCategoryForType(search.categoryId, nextType)

    onSearchChange({
      type: nextType,
      categoryId: keepCategory ? search.categoryId : undefined,
      page: 1,
    })
  }

  const handleCategoryChange = (value: string) => {
    onSearchChange({
      categoryId: value === 'all' ? undefined : (value as CategoryId),
      page: 1,
    })
  }

  const handleClearSearch = () => {
    setKeyword('')
    if (search.search) {
      onSearchChange({ search: undefined, page: 1 })
    }
  }

  const showIncomeCategories = !search.type || search.type === 'income'
  const showExpenseCategories = !search.type || search.type === 'expense'

  return (
    <Card size="sm">
      <CardContent className="flex flex-col gap-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Field className="md:col-span-2 lg:col-span-1">
            <FieldLabel htmlFor="transaction-search">Cari Deskripsi</FieldLabel>
            <InputGroup>
              <InputGroupAddon>
                <Search />
              </InputGroupAddon>
              <InputGroupInput
                id="transaction-search"
                placeholder="Cari catatan transaksi..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
              {keyword.length > 0 && (
                <InputGroupAddon align="inline-end">
                  <InputGroupButton
                    size="icon-xs"
                    aria-label="Hapus pencarian"
                    onClick={handleClearSearch}
                  >
                    <X />
                  </InputGroupButton>
                </InputGroupAddon>
              )}
            </InputGroup>
          </Field>

          <Field>
            <FieldLabel htmlFor="transaction-filter-category">
              Kategori
            </FieldLabel>
            <Select
              value={search.categoryId ?? 'all'}
              onValueChange={handleCategoryChange}
            >
              <SelectTrigger
                id="transaction-filter-category"
                className="w-full"
              >
                <SelectValue placeholder="Semua Kategori" />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectGroup>
                  <SelectItem value="all">Semua Kategori</SelectItem>
                </SelectGroup>
                {showIncomeCategories && (
                  <SelectGroup>
                    <SelectLabel>Pemasukan</SelectLabel>
                    {INCOME_CATEGORIES.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                )}
                {showExpenseCategories && (
                  <SelectGroup>
                    <SelectLabel>Pengeluaran</SelectLabel>
                    {EXPENSE_CATEGORIES.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                )}
              </SelectContent>
            </Select>
          </Field>

          <Field>
            <FieldLabel htmlFor="transaction-start-date">
              Dari Tanggal
            </FieldLabel>
            <Input
              id="transaction-start-date"
              type="date"
              value={search.startDate ?? ''}
              max={search.endDate}
              onChange={(e) =>
                onSearchChange({
                  startDate: e.target.value || undefined,
                  page: 1,
                })
              }
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="transaction-end-date">
              Sampai Tanggal
            </FieldLabel>
            <Input
              id="transaction-end-date"
              type="date"
              value={search.endDate ?? ''}
              min={search.startDate}
              onChange={(e) =>
                onSearchChange({
                  endDate: e.target.value || undefined,
                  page: 1,
                })
              }
            />
          </Field>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">
              Tipe:
            </span>
            <ToggleGroup
              type="single"
              variant="outline"
              size="sm"
              spacing={0}
              value={search.type ?? 'all'}
              onValueChange={handleTypeChange}
            >
              <ToggleGroupItem value="all">Semua</ToggleGroupItem>
              <ToggleGroupItem value="income">Pemasukan</ToggleGroupItem>
              <ToggleGroupItem value="expense">Pengeluaran</ToggleGroupItem>
            </ToggleGroup>
          </div>

          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={onReset}>
              <RotateCcw data-icon="inline-start" />
              Reset Filter
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
