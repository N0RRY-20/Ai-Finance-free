import { db } from '#/db'
import { transactions } from '#/db/schema/finance-schema'
import type {
  ListTransactionsFilters,
  NewTransaction,
  Transaction,
  TransactionCategoryAggregationRow,
  TransactionSummaryFilters,
} from '#/types/finance'
import { and, desc, eq, gte, ilike, lte, sql } from 'drizzle-orm'
import type { SQL } from 'drizzle-orm'

function escapeLikePattern(value: string): string {
  return value.replace(/[\\%_]/g, '\\$&')
}

function buildTransactionConditions(
  userId: string,
  filters?: TransactionSummaryFilters,
): SQL[] {
  const conditions: SQL[] = [eq(transactions.userId, userId)]

  if (filters?.type) {
    conditions.push(eq(transactions.type, filters.type))
  }
  if (filters?.categoryId) {
    conditions.push(eq(transactions.categoryId, filters.categoryId))
  }
  if (filters?.startDate) {
    conditions.push(gte(transactions.transactionDate, filters.startDate))
  }
  if (filters?.endDate) {
    conditions.push(lte(transactions.transactionDate, filters.endDate))
  }
  const trimmedSearch = filters?.search?.trim()
  if (trimmedSearch) {
    conditions.push(
      ilike(transactions.description, `%${escapeLikePattern(trimmedSearch)}%`),
    )
  }

  return conditions
}

export const transactionRepository = {
  /**
   * Menyimpan baris transaksi baru ke database.
   */
  async create(data: NewTransaction): Promise<Transaction> {
    const [created] = await db.insert(transactions).values(data).returning()
    return created
  },

  /**
   * Mengambil satu transaksi milik pengguna tertentu berdasarkan ID transaksi.
   */
  async findByIdForUser(
    userId: string,
    transactionId: string,
  ): Promise<Transaction | undefined> {
    const rows = await db
      .select()
      .from(transactions)
      .where(
        and(
          eq(transactions.id, transactionId),
          eq(transactions.userId, userId),
        ),
      )
      .limit(1)
    return rows.at(0)
  },

  /**
   * Mengambil daftar transaksi milik pengguna dengan filter dan pagination opsional.
   */
  async findManyByUser(
    userId: string,
    filters?: ListTransactionsFilters,
  ): Promise<Transaction[]> {
    const conditions = buildTransactionConditions(userId, filters)
    const limit = Math.min(Math.max(filters?.limit ?? 20, 1), 100)
    const offset = Math.max(filters?.offset ?? 0, 0)

    return await db
      .select()
      .from(transactions)
      .where(and(...conditions))
      .orderBy(
        desc(transactions.transactionDate),
        desc(transactions.createdAt),
        desc(transactions.id),
      )
      .limit(limit)
      .offset(offset)
  },

  /**
   * Menghitung jumlah transaksi milik pengguna sesuai filter aktif.
   */
  async countByUser(
    userId: string,
    filters?: TransactionSummaryFilters,
  ): Promise<number> {
    const rows = await db
      .select({ count: sql<number>`COUNT(*)::int` })
      .from(transactions)
      .where(and(...buildTransactionConditions(userId, filters)))

    return rows.at(0)?.count ?? 0
  },

  /**
   * Mengagregasi total nominal dan jumlah transaksi per tipe & kategori untuk pengguna.
   */
  async aggregateByCategory(
    userId: string,
    filters?: TransactionSummaryFilters,
  ): Promise<TransactionCategoryAggregationRow[]> {
    return await db
      .select({
        type: transactions.type,
        categoryId: transactions.categoryId,
        total: sql<string>`COALESCE(SUM(${transactions.amount}), 0)`,
        count: sql<number>`COUNT(*)::int`,
      })
      .from(transactions)
      .where(and(...buildTransactionConditions(userId, filters)))
      .groupBy(transactions.type, transactions.categoryId)
  },

  /**
   * Mengagregasi ringkasan all-time dan bulan berjalan sekaligus dalam satu query SQL.
   */
  async aggregateDashboardOverview(
    userId: string,
    monthRange: { startDate: string; endDate: string },
  ): Promise<{
    allTimeIncome: string
    allTimeExpense: string
    totalTransactionCount: number
    monthlyIncome: string
    monthlyExpense: string
    monthlyTransactionCount: number
  }> {
    const rows = await db
      .select({
        allTimeIncome: sql<string>`COALESCE(SUM(${transactions.amount}) FILTER (WHERE ${transactions.type} = 'income'), 0)`,
        allTimeExpense: sql<string>`COALESCE(SUM(${transactions.amount}) FILTER (WHERE ${transactions.type} = 'expense'), 0)`,
        totalTransactionCount: sql<number>`COUNT(*)::int`,
        monthlyIncome: sql<string>`COALESCE(SUM(${transactions.amount}) FILTER (WHERE ${transactions.type} = 'income' AND ${transactions.transactionDate} >= ${monthRange.startDate} AND ${transactions.transactionDate} <= ${monthRange.endDate}), 0)`,
        monthlyExpense: sql<string>`COALESCE(SUM(${transactions.amount}) FILTER (WHERE ${transactions.type} = 'expense' AND ${transactions.transactionDate} >= ${monthRange.startDate} AND ${transactions.transactionDate} <= ${monthRange.endDate}), 0)`,
        monthlyTransactionCount: sql<number>`COUNT(*) FILTER (WHERE ${transactions.transactionDate} >= ${monthRange.startDate} AND ${transactions.transactionDate} <= ${monthRange.endDate})::int`,
      })
      .from(transactions)
      .where(eq(transactions.userId, userId))

    const row = rows.at(0)
    return {
      allTimeIncome: row?.allTimeIncome ?? '0',
      allTimeExpense: row?.allTimeExpense ?? '0',
      totalTransactionCount: row?.totalTransactionCount ?? 0,
      monthlyIncome: row?.monthlyIncome ?? '0',
      monthlyExpense: row?.monthlyExpense ?? '0',
      monthlyTransactionCount: row?.monthlyTransactionCount ?? 0,
    }
  },

  /**
   * Memperbarui transaksi milik pengguna berdasarkan ID transaksi.
   */
  async updateByIdForUser(
    userId: string,
    transactionId: string,
    data: Pick<
      NewTransaction,
      'type' | 'amount' | 'categoryId' | 'description' | 'transactionDate'
    >,
  ): Promise<Transaction | undefined> {
    const rows = await db
      .update(transactions)
      .set(data)
      .where(
        and(
          eq(transactions.id, transactionId),
          eq(transactions.userId, userId),
        ),
      )
      .returning()
    return rows.at(0)
  },

  /**
   * Menghapus transaksi milik pengguna berdasarkan ID transaksi.
   */
  async deleteByIdForUser(
    userId: string,
    transactionId: string,
  ): Promise<Transaction | undefined> {
    const rows = await db
      .delete(transactions)
      .where(
        and(
          eq(transactions.id, transactionId),
          eq(transactions.userId, userId),
        ),
      )
      .returning()
    return rows.at(0)
  },
}
