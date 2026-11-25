import { relations } from 'drizzle-orm'
import {
  date,
  index,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core'
import type { CategoryId, TransactionType } from '#/types/finance'
import { user } from './auth-schema'

export const transactions = pgTable(
  'transactions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    // Menggunakan text agar kompatibel dengan user.id dari Better Auth,
    // tanpa onDelete: 'cascade' agar riwayat transaksi tidak ikut terhapus otomatis.
    userId: text('user_id')
      .notNull()
      .references(() => user.id),
    type: varchar('type', { length: 20 }).$type<TransactionType>().notNull(),
    amount: numeric('amount', { precision: 18, scale: 2 }).notNull(),
    categoryId: varchar('category_id', { length: 64 })
      .$type<CategoryId>()
      .notNull(),
    description: text('description').notNull().default(''),
    transactionDate: date('transaction_date', { mode: 'string' }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index('transactions_user_id_idx').on(table.userId),
    index('transactions_user_date_idx').on(table.userId, table.transactionDate),
    index('transactions_category_id_idx').on(table.categoryId),
  ],
)

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(user, {
    fields: [transactions.userId],
    references: [user.id],
  }),
}))
