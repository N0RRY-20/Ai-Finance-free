import { db } from '#/db'
import { transactions } from '#/db/schema/finance-schema'
import type {
  ListTransactionsFilters,
  NewTransaction,
  Transaction,
  TransactionCategoryAggregationRow,
  TransactionDateRangeFilter,
} from '#/types/finance'
import { and, desc, eq, gte, ilike, lte, sql } from 'drizzle-orm'

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
   * Mengambil daftar transaksi milik pengguna dengan filter opsional.
   */
  async findManyByUser(
    userId: string,
    filters?: ListTransactionsFilters,
  ): Promise<Transaction[]> {
    const conditions = [eq(transactions.userId, userId)]

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
    if (filters?.search && filters.search.trim().length > 0) {
      conditions.push(
        ilike(transactions.description, `%${filters.search.trim()}%`),
      )
    }

    const limit = Math.min(Math.max(filters?.limit ?? 20, 1), 100)

    return await db
      .select()
      .from(transactions)
      .where(and(...conditions))
      .orderBy(desc(transactions.transactionDate), desc(transactions.createdAt))
      .limit(limit)
  },

  /**
   * Mengagregasi total nominal dan jumlah transaksi per tipe & kategori untuk pengguna.
   */
  async aggregateByCategory(
    userId: string,
    filters?: TransactionDateRangeFilter,
  ): Promise<TransactionCategoryAggregationRow[]> {
    const conditions = [eq(transactions.userId, userId)]

    if (filters?.startDate) {
      conditions.push(gte(transactions.transactionDate, filters.startDate))
    }
    if (filters?.endDate) {
      conditions.push(lte(transactions.transactionDate, filters.endDate))
    }

    return await db
      .select({
        type: transactions.type,
        categoryId: transactions.categoryId,
        total: sql<string>`COALESCE(SUM(${transactions.amount}), 0)`,
        count: sql<number>`COUNT(*)::int`,
      })
      .from(transactions)
      .where(and(...conditions))
      .groupBy(transactions.type, transactions.categoryId)
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
