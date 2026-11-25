import type { TransactionCategory, TransactionType } from '#/types/finance'

export const TRANSACTION_TYPES = ['income', 'expense'] as const

export const INCOME_CATEGORIES = [
  { id: 'salary', label: 'Gaji', type: 'income' },
  { id: 'freelance', label: 'Freelance & Proyek', type: 'income' },
  { id: 'business', label: 'Bisnis & Usaha', type: 'income' },
  { id: 'investment', label: 'Investasi & Dividen', type: 'income' },
  { id: 'gift_in', label: 'Hadiah & Bonus', type: 'income' },
  { id: 'other_income', label: 'Pemasukan Lainnya', type: 'income' },
] as const

export const EXPENSE_CATEGORIES = [
  { id: 'food_drink', label: 'Makanan & Minuman', type: 'expense' },
  { id: 'transport', label: 'Transportasi', type: 'expense' },
  { id: 'shopping', label: 'Belanja', type: 'expense' },
  { id: 'bills_utilities', label: 'Tagihan & Utilitas', type: 'expense' },
  { id: 'housing', label: 'Tempat Tinggal', type: 'expense' },
  { id: 'health', label: 'Kesehatan', type: 'expense' },
  { id: 'education', label: 'Pendidikan', type: 'expense' },
  { id: 'entertainment', label: 'Hiburan', type: 'expense' },
  { id: 'family_social', label: 'Keluarga & Sosial', type: 'expense' },
  { id: 'debt_loan', label: 'Cicilan & Pinjaman', type: 'expense' },
  { id: 'other_expense', label: 'Pengeluaran Lainnya', type: 'expense' },
] as const

export const TRANSACTION_CATEGORIES = [
  ...INCOME_CATEGORIES,
  ...EXPENSE_CATEGORIES,
] as const

type CategoryIdTuple = [
  (typeof TRANSACTION_CATEGORIES)[number]['id'],
  ...(typeof TRANSACTION_CATEGORIES)[number]['id'][],
]

export const CATEGORY_IDS = TRANSACTION_CATEGORIES.map(
  (category) => category.id,
) as CategoryIdTuple

const CATEGORY_MAP = new Map<string, TransactionCategory>(
  TRANSACTION_CATEGORIES.map((category) => [category.id, category]),
)

export function getCategoryById(id: string): TransactionCategory | undefined {
  return CATEGORY_MAP.get(id)
}

export function getCategoriesByType(
  type: TransactionType,
): readonly TransactionCategory[] {
  return type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES
}

export function isValidCategoryForType(
  categoryId: string,
  type: TransactionType,
): boolean {
  const category = CATEGORY_MAP.get(categoryId)
  return category !== undefined && category.type === type
}
