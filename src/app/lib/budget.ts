import type { Budget, Transaction } from '../context/DataContext'

export type BudgetStatus = {
  categoryId: string
  amount: number
  spent: number
  remaining: number
  percent: number
  level: 'ok' | 'warn' | 'over'
}

/** Sum of |expense amounts| for this calendar month, per category id. */
export function spentThisMonthByCategory(transactions: Transaction[], now = new Date()): Map<string, number> {
  const m = now.getMonth()
  const y = now.getFullYear()
  const out = new Map<string, number>()
  for (const t of transactions) {
    if (t.type !== 'expense') continue
    const d = new Date(t.date)
    if (d.getMonth() !== m || d.getFullYear() !== y) continue
    out.set(t.categoryId, (out.get(t.categoryId) ?? 0) + Math.abs(t.amount))
  }
  return out
}

export function computeBudgetStatus(budgets: Budget[] | undefined, transactions: Transaction[], now = new Date()): BudgetStatus[] {
  if (!budgets || budgets.length === 0) return []
  const spentMap = spentThisMonthByCategory(transactions, now)
  return budgets
    .filter(b => b.amount > 0)
    .map<BudgetStatus>(b => {
      const spent = spentMap.get(b.categoryId) ?? 0
      const remaining = b.amount - spent
      const percent = b.amount > 0 ? (spent / b.amount) * 100 : 0
      const level: BudgetStatus['level'] = percent >= 100 ? 'over' : percent >= 80 ? 'warn' : 'ok'
      return { categoryId: b.categoryId, amount: b.amount, spent, remaining, percent, level }
    })
    .sort((a, b) => b.percent - a.percent)
}
