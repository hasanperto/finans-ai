'use client'

import { createContext, useContext, useState, useEffect, useRef, useCallback, ReactNode } from 'react'
import {
  migrateFromLocalStorageIfNeeded,
  loadAll,
  saveTransactions,
  saveRecurring,
  saveSettings,
  wipeAll,
  importAll,
} from '../lib/db'
import { hashSecret, verifySecret, isHashed } from '../lib/crypto'

export type PeriodType = 'daily' | 'weekly' | 'monthly' | 'yearly'

export type Transaction = {
  id: string
  title: string
  amount: number
  type: 'income' | 'expense'
  date: string
  category: string
  categoryId: string
  // Recurring
  isRecurring?: boolean
  period?: PeriodType
  lastGenerated?: string
  createdFrom?: string // original recurring tx id
}

export type RecurringTransaction = {
  id: string
  title: string
  amount: number
  type: 'income' | 'expense'
  category: string
  categoryId: string
  period: PeriodType
  dayOfMonth?: number // for monthly: 1-28
  dayOfWeek?: number // for weekly: 0-6 (Sun-Sat)
  nextDue: string
  isActive: boolean
  createdAt: string
}

export type Category = {
  id: string
  name: string
  icon: string
  color: string
  type?: 'Zorunlu' | 'İsteğe Bağlı'
}

export type Budget = {
  /** Category id this budget applies to (expense category). */
  categoryId: string
  /** Limit amount in the current display currency. */
  amount: number
  /** Only 'monthly' is supported for now. */
  period: 'monthly'
}

export type Currency = 'TRY' | 'EUR' | 'USD' | 'GBP' | 'CHF' | 'SILBER' | 'GOLD'

export type AIProvider = 'gemini' | 'openai' | 'minimax' | 'openrouter' | 'custom'

export type ScenarioId = 'student' | 'family' | 'freelancer'

export type Settings = {
  authEnabled: boolean
  /** Stored as `pbkdf2$<iter>$<saltB64>$<hashB64>`. Empty string when no password set. */
  password: string
  securityQuestion: string
  /** Stored hashed too (same format as password). */
  securityAnswer: string
  /** Optional display name for the device owner. UI only. */
  profileName?: string
  currency: Currency
  aiProvider: AIProvider
  aiApiKey: string
  aiApiUrl: string // for custom provider
  categories: {
    income: Category[]
    expense: Category[]
  }
  /** Per expense-category monthly budgets. Absent or zero entries are treated as "no budget". */
  budgets?: Budget[]
}

const defaultSettings: Settings = {
  authEnabled: false,
  password: '',
  securityQuestion: '',
  securityAnswer: '',
  profileName: '',
  currency: 'TRY',
  aiProvider: 'gemini',
  aiApiKey: '',
  aiApiUrl: '',
  categories: {
    income: [
      { id: '1', name: 'Maaş', icon: '💼', color: '#6366f1' },
      { id: '2', name: 'Freelance', icon: '💻', color: '#10b981' },
      { id: '3', name: 'Kira Geliri', icon: '🏠', color: '#f59e0b' },
      { id: '4', name: 'Yatırım', icon: '📈', color: '#8b5cf6' },
      { id: '5', name: 'Diğer', icon: '📦', color: '#64748b' },
    ],
    expense: [
      { id: '1', name: 'Kira', icon: '🏠', color: '#6366f1', type: 'Zorunlu' },
      { id: '2', name: 'Gıda', icon: '🛒', color: '#10b981', type: 'İsteğe Bağlı' },
      { id: '3', name: 'Ulaşım', icon: '🚗', color: '#f59e0b', type: 'Zorunlu' },
      { id: '4', name: 'Faturalar', icon: '📄', color: '#ef4444', type: 'Zorunlu' },
      { id: '5', name: 'Eğlence', icon: '🎬', color: '#8b5cf6', type: 'İsteğe Bağlı' },
      { id: '6', name: 'Sağlık', icon: '❤️', color: '#ec4899', type: 'Zorunlu' },
      { id: '7', name: 'Abonelik', icon: '📺', color: '#14b8a6', type: 'İsteğe Bağlı' },
      { id: '8', name: 'Diğer', icon: '📦', color: '#64748b', type: 'İsteğe Bağlı' },
    ]
  },
  budgets: [],
}

function defaultTransactionsFresh(): Transaction[] {
  // Generate sample data anchored to today so "this month" filter shows entries on first run.
  const today = new Date()
  const iso = (d: Date) => d.toISOString().split('T')[0]
  const minus = (n: number) => {
    const d = new Date(today)
    d.setDate(d.getDate() - n)
    return iso(d)
  }
  return [
    { id: '1', title: 'Maaş',      amount:  45000, type: 'income',  date: minus(20), category: 'Maaş',      categoryId: '1' },
    { id: '2', title: 'Kira',      amount: -15000, type: 'expense', date: minus(18), category: 'Kira',      categoryId: '1' },
    { id: '3', title: 'Market',    amount:  -2800, type: 'expense', date: minus(15), category: 'Gıda',      categoryId: '2' },
    { id: '4', title: 'Freelance', amount:  12000, type: 'income',  date: minus(12), category: 'Freelance', categoryId: '2' },
    { id: '5', title: 'Fatura',    amount:   -950, type: 'expense', date: minus(10), category: 'Faturalar', categoryId: '4' },
    { id: '6', title: 'Ek Gelir',  amount:   8000, type: 'income',  date: minus(7),  category: 'Diğer',     categoryId: '5' },
    { id: '7', title: 'Restoran',  amount:  -1500, type: 'expense', date: minus(4),  category: 'Gıda',      categoryId: '2' },
    { id: '8', title: 'Ulaşım',    amount:   -800, type: 'expense', date: minus(2),  category: 'Ulaşım',    categoryId: '3' },
  ]
}

interface DataContextType {
  transactions: Transaction[]
  recurringTransactions: RecurringTransaction[]
  ready: boolean
  addTransaction: (tx: Omit<Transaction, 'id'>) => void
  updateTransaction: (id: string, tx: Partial<Transaction>) => void
  deleteTransaction: (id: string) => void
  addRecurring: (tx: Omit<RecurringTransaction, 'id' | 'createdAt'>) => void
  updateRecurring: (id: string, tx: Partial<RecurringTransaction>) => void
  deleteRecurring: (id: string) => void
  settings: Settings
  updateSettings: (s: Partial<Settings>) => void
  setBudget: (categoryId: string, amount: number) => void
  removeBudget: (categoryId: string) => void
  /** Hash a plain password/answer and persist via updateSettings({ password, securityAnswer }). */
  setCredentials: (input: { password?: string; securityAnswer?: string; question?: string; authEnabled?: boolean }) => Promise<void>
  /** Verify a plain password against stored hash (auto-rehashes legacy plain). */
  verifyPassword: (plain: string) => Promise<boolean>
  /** Verify a plain security answer against stored hash. */
  verifySecurityAnswer: (plain: string) => Promise<boolean>
  resetAll: () => Promise<void>
  loadScenario: (scenarioId: ScenarioId, language?: 'tr' | 'de') => void
  importBackup: (raw: unknown) => { ok: true; count: number } | { ok: false; error: string }
  exportBackup: () => string
  hasPassword: () => boolean
}

function noopAsyncBool(): Promise<boolean> { return Promise.resolve(false) }

const DataContext = createContext<DataContextType>({
  transactions: [],
  recurringTransactions: [],
  ready: false,
  addTransaction: () => {},
  updateTransaction: () => {},
  deleteTransaction: () => {},
  addRecurring: () => {},
  updateRecurring: () => {},
  deleteRecurring: () => {},
  settings: defaultSettings,
  updateSettings: () => {},
  setBudget: () => {},
  removeBudget: () => {},
  setCredentials: async () => {},
  verifyPassword: noopAsyncBool,
  verifySecurityAnswer: noopAsyncBool,
  resetAll: async () => {},
  loadScenario: () => {},
  importBackup: () => ({ ok: false, error: 'not ready' }),
  exportBackup: () => '',
  hasPassword: () => false,
})

function formatISODate(d: Date) {
  return d.toISOString().split('T')[0]
}

function addDays(base: Date, days: number) {
  const d = new Date(base)
  d.setDate(d.getDate() + days)
  return d
}

function getScenarioData(scenarioId: ScenarioId, language: 'tr' | 'de'): { settings: Settings; transactions: Transaction[]; recurringTransactions: RecurringTransaction[] } {
  const today = new Date()
  const txId = () => `${Date.now()}_${Math.random().toString(16).slice(2)}`

  const common: Pick<Settings, 'authEnabled' | 'password' | 'securityQuestion' | 'securityAnswer' | 'aiProvider' | 'aiApiKey' | 'aiApiUrl'> = {
    authEnabled: false,
    password: '',
    securityQuestion: '',
    securityAnswer: '',
    aiProvider: 'gemini',
    aiApiKey: '',
    aiApiUrl: '',
  }

  if (scenarioId === 'student') {
    const settings: Settings = {
      ...common,
      currency: 'TRY',
      categories: {
        income: [
          { id: 'i1', name: language === 'de' ? 'Stipendium' : 'Burs', icon: '🎓', color: '#6366f1' },
          { id: 'i2', name: language === 'de' ? 'Nebenjob' : 'Part-time', icon: '🧑‍💻', color: '#10b981' },
          { id: 'i3', name: language === 'de' ? 'Familienhilfe' : 'Aile Desteği', icon: '🏠', color: '#f59e0b' },
        ],
        expense: [
          { id: 'e1', name: language === 'de' ? 'Miete' : 'Kira', icon: '🏡', color: '#6366f1', type: 'Zorunlu' },
          { id: 'e2', name: language === 'de' ? 'Lebensmittel' : 'Gıda', icon: '🛒', color: '#10b981', type: 'Zorunlu' },
          { id: 'e3', name: language === 'de' ? 'Transport' : 'Ulaşım', icon: '🚇', color: '#f59e0b', type: 'Zorunlu' },
          { id: 'e4', name: language === 'de' ? 'Abos' : 'Abonelik', icon: '📺', color: '#8b5cf6', type: 'İsteğe Bağlı' },
        ],
      },
    }

    const transactions: Transaction[] = [
      { id: txId(), title: language === 'de' ? 'Stipendium' : 'Burs', amount: 12000, type: 'income', date: formatISODate(addDays(today, -10)), category: settings.categories.income[0].name, categoryId: 'i1' },
      { id: txId(), title: language === 'de' ? 'Nebenjob Zahlung' : 'Part-time Ödeme', amount: 5500, type: 'income', date: formatISODate(addDays(today, -5)), category: settings.categories.income[1].name, categoryId: 'i2' },
      { id: txId(), title: language === 'de' ? 'Miete' : 'Kira', amount: -8000, type: 'expense', date: formatISODate(addDays(today, -9)), category: settings.categories.expense[0].name, categoryId: 'e1' },
      { id: txId(), title: language === 'de' ? 'Einkauf' : 'Market', amount: -1500, type: 'expense', date: formatISODate(addDays(today, -7)), category: settings.categories.expense[1].name, categoryId: 'e2' },
      { id: txId(), title: language === 'de' ? 'ÖPNV Karte' : 'Ulaşım Kartı', amount: -650, type: 'expense', date: formatISODate(addDays(today, -6)), category: settings.categories.expense[2].name, categoryId: 'e3' },
      { id: txId(), title: language === 'de' ? 'Streaming Abo' : 'Streaming Aboneliği', amount: -120, type: 'expense', date: formatISODate(addDays(today, -2)), category: settings.categories.expense[3].name, categoryId: 'e4' },
    ]

    return { settings, transactions, recurringTransactions: [] }
  }

  if (scenarioId === 'family') {
    const settings: Settings = {
      ...common,
      currency: 'TRY',
      categories: {
        income: [
          { id: 'i1', name: language === 'de' ? 'Gehalt' : 'Maaş', icon: '💼', color: '#10b981' },
          { id: 'i2', name: language === 'de' ? 'Zusatzverdienst' : 'Ek Gelir', icon: '📈', color: '#6366f1' },
        ],
        expense: [
          { id: 'e1', name: language === 'de' ? 'Miete/Hypothek' : 'Kira/Kredi', icon: '🏠', color: '#6366f1', type: 'Zorunlu' },
          { id: 'e2', name: language === 'de' ? 'Lebensmittel' : 'Gıda', icon: '🛒', color: '#10b981', type: 'Zorunlu' },
          { id: 'e3', name: language === 'de' ? 'Nebenkosten' : 'Faturalar', icon: '📄', color: '#ef4444', type: 'Zorunlu' },
          { id: 'e4', name: language === 'de' ? 'Kinder' : 'Çocuk', icon: '🧸', color: '#f59e0b', type: 'Zorunlu' },
          { id: 'e5', name: language === 'de' ? 'Auto' : 'Araç', icon: '🚗', color: '#8b5cf6', type: 'İsteğe Bağlı' },
        ],
      },
    }

    const transactions: Transaction[] = [
      { id: txId(), title: language === 'de' ? 'Gehalt (1)' : 'Maaş (1)', amount: 52000, type: 'income', date: formatISODate(addDays(today, -12)), category: settings.categories.income[0].name, categoryId: 'i1' },
      { id: txId(), title: language === 'de' ? 'Gehalt (2)' : 'Maaş (2)', amount: 42000, type: 'income', date: formatISODate(addDays(today, -12)), category: settings.categories.income[0].name, categoryId: 'i1' },
      { id: txId(), title: language === 'de' ? 'Miete/Hypothek' : 'Kira/Kredi', amount: -28000, type: 'expense', date: formatISODate(addDays(today, -11)), category: settings.categories.expense[0].name, categoryId: 'e1' },
      { id: txId(), title: language === 'de' ? 'Wocheneinkauf' : 'Haftalık Market', amount: -6500, type: 'expense', date: formatISODate(addDays(today, -8)), category: settings.categories.expense[1].name, categoryId: 'e2' },
      { id: txId(), title: language === 'de' ? 'Strom/Wasser/Internet' : 'Elektrik/Su/İnternet', amount: -2300, type: 'expense', date: formatISODate(addDays(today, -6)), category: settings.categories.expense[2].name, categoryId: 'e3' },
      { id: txId(), title: language === 'de' ? 'Kinderbedarf' : 'Çocuk İhtiyaçları', amount: -1800, type: 'expense', date: formatISODate(addDays(today, -3)), category: settings.categories.expense[3].name, categoryId: 'e4' },
      { id: txId(), title: language === 'de' ? 'Tanken' : 'Yakıt', amount: -1400, type: 'expense', date: formatISODate(addDays(today, -1)), category: settings.categories.expense[4].name, categoryId: 'e5' },
    ]

    return { settings, transactions, recurringTransactions: [] }
  }

  const settings: Settings = {
    ...common,
    currency: 'EUR',
    categories: {
      income: [
        { id: 'i1', name: language === 'de' ? 'Projekt' : 'Proje', icon: '🧾', color: '#10b981' },
        { id: 'i2', name: language === 'de' ? 'Retainer' : 'Aylık Anlaşma', icon: '🔁', color: '#6366f1' },
      ],
      expense: [
        { id: 'e1', name: language === 'de' ? 'Software' : 'Yazılım', icon: '💻', color: '#8b5cf6', type: 'Zorunlu' },
        { id: 'e2', name: language === 'de' ? 'Coworking' : 'Ofis', icon: '🏢', color: '#f59e0b', type: 'İsteğe Bağlı' },
        { id: 'e3', name: language === 'de' ? 'Steuern' : 'Vergi', icon: '🧾', color: '#ef4444', type: 'Zorunlu' },
      ],
    },
  }

  const transactions: Transaction[] = [
    { id: txId(), title: language === 'de' ? 'Projekt Rechnung' : 'Proje Faturası', amount: 2400, type: 'income', date: formatISODate(addDays(today, -14)), category: settings.categories.income[0].name, categoryId: 'i1' },
    { id: txId(), title: language === 'de' ? 'Retainer' : 'Aylık Anlaşma', amount: 900, type: 'income', date: formatISODate(addDays(today, -4)), category: settings.categories.income[1].name, categoryId: 'i2' },
    { id: txId(), title: language === 'de' ? 'Tool Abos' : 'Araç Abonelikleri', amount: -60, type: 'expense', date: formatISODate(addDays(today, -9)), category: settings.categories.expense[0].name, categoryId: 'e1' },
    { id: txId(), title: language === 'de' ? 'Coworking Tag' : 'Coworking', amount: -120, type: 'expense', date: formatISODate(addDays(today, -5)), category: settings.categories.expense[1].name, categoryId: 'e2' },
    { id: txId(), title: language === 'de' ? 'Steuerrücklage' : 'Vergi Kenara Ayırma', amount: -300, type: 'expense', date: formatISODate(addDays(today, -2)), category: settings.categories.expense[2].name, categoryId: 'e3' },
  ]

  return { settings, transactions, recurringTransactions: [] }
}

function getNextDueDate(period: PeriodType, currentNext: string, dayOfMonth?: number): string {
  const current = new Date(currentNext)
  switch (period) {
    case 'daily':
      current.setDate(current.getDate() + 1)
      break
    case 'weekly':
      current.setDate(current.getDate() + 7)
      break
    case 'monthly': {
      const targetDay = dayOfMonth || 1
      current.setMonth(current.getMonth() + 1)
      const lastDay = new Date(current.getFullYear(), current.getMonth() + 1, 0).getDate()
      current.setDate(Math.min(targetDay, lastDay))
      break
    }
    case 'yearly':
      current.setFullYear(current.getFullYear() + 1)
      break
  }
  return current.toISOString().split('T')[0]
}

/** Returns { newRecurrings, newTxs } describing the result of catching up due items. Pure function. */
function catchUpRecurring(recurrings: RecurringTransaction[]): {
  newRecurrings: RecurringTransaction[]
  newTxs: Omit<Transaction, 'id'>[]
} {
  const today = new Date().toISOString().split('T')[0]
  const newRecurrings: RecurringTransaction[] = []
  const newTxs: Omit<Transaction, 'id'>[] = []

  for (const r of recurrings) {
    if (!r.isActive) { newRecurrings.push(r); continue }
    const updated = { ...r }
    let safety = 0
    while (updated.nextDue <= today && safety++ < 60) {
      newTxs.push({
        title: updated.title,
        amount: updated.type === 'expense' ? -Math.abs(updated.amount) : Math.abs(updated.amount),
        type: updated.type,
        date: updated.nextDue,
        category: updated.category,
        categoryId: updated.categoryId,
        isRecurring: true,
        period: updated.period,
        createdFrom: updated.id,
      })
      updated.nextDue = getNextDueDate(updated.period, updated.nextDue, updated.dayOfMonth)
    }
    newRecurrings.push(updated)
  }
  return { newRecurrings, newTxs }
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [recurringTransactions, setRecurringTransactions] = useState<RecurringTransaction[]>([])
  const [settings, setSettings] = useState<Settings>(defaultSettings)
  const [ready, setReady] = useState(false)
  const dirtyTxRef = useRef(false)
  const dirtyRecRef = useRef(false)
  const dirtySettingsRef = useRef(false)

  // Initial load: migrate from localStorage if needed, then read from Dexie.
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        await migrateFromLocalStorageIfNeeded()
        const loaded = await loadAll()
        if (cancelled) return
        if (loaded.transactions.length === 0 && loaded.recurring.length === 0 && !loaded.settings) {
          // First-ever run on this device — seed sample data anchored to today
          const seed = defaultTransactionsFresh()
          setTransactions(seed)
          setSettings(defaultSettings)
          dirtyTxRef.current = true
          dirtySettingsRef.current = true
        } else {
          setTransactions(loaded.transactions)
          setRecurringTransactions(loaded.recurring)
          if (loaded.settings) {
            const merged: Settings = {
              ...defaultSettings,
              ...loaded.settings,
              categories: {
                income: loaded.settings.categories?.income ?? defaultSettings.categories.income,
                expense: loaded.settings.categories?.expense ?? defaultSettings.categories.expense,
              },
            }
            setSettings(merged)
          }
        }
        setReady(true)
      } catch {
        setReady(true)
      }
    })()
    return () => { cancelled = true }
  }, [])

  // Persist on change. The dirty refs avoid writing back data we just loaded.
  useEffect(() => {
    if (!ready) return
    if (!dirtyTxRef.current) { dirtyTxRef.current = true; return }
    void saveTransactions(transactions)
  }, [transactions, ready])

  useEffect(() => {
    if (!ready) return
    if (!dirtyRecRef.current) { dirtyRecRef.current = true; return }
    void saveRecurring(recurringTransactions)
  }, [recurringTransactions, ready])

  useEffect(() => {
    if (!ready) return
    if (!dirtySettingsRef.current) { dirtySettingsRef.current = true; return }
    void saveSettings(settings)
  }, [settings, ready])

  // Recurring catch-up: on load, on focus, and hourly.
  useEffect(() => {
    if (!ready) return

    const runCatchUp = () => {
      setRecurringTransactions(prev => {
        if (prev.length === 0) return prev
        const { newRecurrings, newTxs } = catchUpRecurring(prev)
        if (newTxs.length === 0) return prev
        setTransactions(curTx => {
          const withIds = newTxs.map((t, i) => ({ ...t, id: `${Date.now()}_${i}_${Math.random().toString(16).slice(2)}` }))
          return [...withIds, ...curTx].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        })
        return newRecurrings
      })
    }

    runCatchUp()
    const onVis = () => { if (document.visibilityState === 'visible') runCatchUp() }
    document.addEventListener('visibilitychange', onVis)
    const interval = window.setInterval(runCatchUp, 60 * 60 * 1000)

    return () => {
      document.removeEventListener('visibilitychange', onVis)
      window.clearInterval(interval)
    }
  }, [ready])

  const addTransaction = useCallback((tx: Omit<Transaction, 'id'>) => {
    setTransactions(prev => [{ ...tx, id: `${Date.now()}_${Math.random().toString(16).slice(2)}` }, ...prev])
  }, [])

  const updateTransaction = useCallback((id: string, tx: Partial<Transaction>) => {
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, ...tx } : t))
  }, [])

  const deleteTransaction = useCallback((id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id))
  }, [])

  const addRecurring = useCallback((tx: Omit<RecurringTransaction, 'id' | 'createdAt'>) => {
    const newRecurring: RecurringTransaction = {
      ...tx,
      id: `${Date.now()}_${Math.random().toString(16).slice(2)}`,
      createdAt: new Date().toISOString().split('T')[0],
    }
    setRecurringTransactions(prev => [...prev, newRecurring])
    setTransactions(prev => [{
      id: `${Date.now()}_${Math.random().toString(16).slice(2)}`,
      title: tx.title,
      amount: tx.type === 'expense' ? -Math.abs(tx.amount) : Math.abs(tx.amount),
      type: tx.type,
      date: tx.nextDue,
      category: tx.category,
      categoryId: tx.categoryId,
      isRecurring: true,
      period: tx.period,
      createdFrom: newRecurring.id,
    }, ...prev])
  }, [])

  const updateRecurring = useCallback((id: string, tx: Partial<RecurringTransaction>) => {
    setRecurringTransactions(prev => prev.map(r => r.id === id ? { ...r, ...tx } : r))
  }, [])

  const deleteRecurring = useCallback((id: string) => {
    setRecurringTransactions(prev => prev.filter(r => r.id !== id))
  }, [])

  const updateSettings = useCallback((s: Partial<Settings>) => {
    setSettings(prev => ({ ...prev, ...s }))
  }, [])

  const setBudget = useCallback((categoryId: string, amount: number) => {
    setSettings(prev => {
      const list = prev.budgets ?? []
      const idx = list.findIndex(b => b.categoryId === categoryId)
      const next: Budget = { categoryId, amount: Math.max(0, amount), period: 'monthly' }
      const updated = idx >= 0 ? list.map((b, i) => i === idx ? next : b) : [...list, next]
      return { ...prev, budgets: updated }
    })
  }, [])

  const removeBudget = useCallback((categoryId: string) => {
    setSettings(prev => ({
      ...prev,
      budgets: (prev.budgets ?? []).filter(b => b.categoryId !== categoryId),
    }))
  }, [])

  const setCredentials = useCallback(async (input: { password?: string; securityAnswer?: string; question?: string; authEnabled?: boolean }) => {
    const next: Partial<Settings> = {}
    if (typeof input.password === 'string' && input.password.length > 0) {
      next.password = await hashSecret(input.password)
    }
    if (typeof input.securityAnswer === 'string' && input.securityAnswer.length > 0) {
      next.securityAnswer = await hashSecret(input.securityAnswer.trim())
    }
    if (typeof input.question === 'string') next.securityQuestion = input.question
    if (typeof input.authEnabled === 'boolean') next.authEnabled = input.authEnabled
    setSettings(prev => ({ ...prev, ...next }))
  }, [])

  const verifyPassword = useCallback(async (plain: string): Promise<boolean> => {
    if (!settings.authEnabled) return true
    if (!settings.password) return false
    const ok = await verifySecret(plain, settings.password)
    if (ok && !isHashed(settings.password)) {
      // Upgrade legacy plain → hashed
      const hashed = await hashSecret(plain)
      setSettings(prev => ({ ...prev, password: hashed }))
    }
    return ok
  }, [settings.authEnabled, settings.password])

  const verifySecurityAnswer = useCallback(async (plain: string): Promise<boolean> => {
    if (!settings.securityAnswer) return false
    const trimmed = plain.trim()
    const ok = await verifySecret(trimmed, settings.securityAnswer)
    if (ok && !isHashed(settings.securityAnswer)) {
      const hashed = await hashSecret(trimmed)
      setSettings(prev => ({ ...prev, securityAnswer: hashed }))
    }
    return ok
  }, [settings.securityAnswer])

  const resetAll = useCallback(async () => {
    await wipeAll()
    const seed = defaultTransactionsFresh()
    setTransactions(seed)
    setRecurringTransactions([])
    setSettings(defaultSettings)
  }, [])

  const loadScenario = useCallback((scenarioId: ScenarioId, language: 'tr' | 'de' = 'tr') => {
    const { settings: s, transactions: tx, recurringTransactions: rec } = getScenarioData(scenarioId, language)
    setTransactions(tx.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()))
    setRecurringTransactions(rec)
    setSettings(s)
  }, [])

  const exportBackup = useCallback((): string => {
    return JSON.stringify({
      version: 2,
      exportDate: new Date().toISOString(),
      transactions,
      recurringTransactions,
      settings,
    }, null, 2)
  }, [transactions, recurringTransactions, settings])

  const importBackup = useCallback((raw: unknown): { ok: true; count: number } | { ok: false; error: string } => {
    if (!raw || typeof raw !== 'object') return { ok: false, error: 'invalid' }
    const obj = raw as Partial<{ transactions: Transaction[]; recurringTransactions: RecurringTransaction[]; settings: Settings }>
    if (!Array.isArray(obj.transactions)) return { ok: false, error: 'missing transactions array' }

    const txs = obj.transactions.filter(t => t && typeof t.id === 'string' && typeof t.amount === 'number')
    const recs = Array.isArray(obj.recurringTransactions) ? obj.recurringTransactions : []
    setTransactions(txs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()))
    setRecurringTransactions(recs)
    if (obj.settings && typeof obj.settings === 'object') {
      const merged: Settings = {
        ...defaultSettings,
        ...obj.settings,
        categories: {
          income: obj.settings.categories?.income ?? defaultSettings.categories.income,
          expense: obj.settings.categories?.expense ?? defaultSettings.categories.expense,
        },
      }
      setSettings(merged)
    }
    void importAll({ transactions: txs, recurring: recs, settings: obj.settings })
    return { ok: true, count: txs.length }
  }, [])

  const hasPassword = useCallback((): boolean => settings.authEnabled && !!settings.password, [settings.authEnabled, settings.password])

  return (
    <DataContext.Provider value={{
      transactions, recurringTransactions, ready,
      addTransaction, updateTransaction, deleteTransaction,
      addRecurring, updateRecurring, deleteRecurring,
      settings, updateSettings,
      setBudget, removeBudget,
      setCredentials, verifyPassword, verifySecurityAnswer,
      resetAll, loadScenario, importBackup, exportBackup, hasPassword,
    }}>
      {children}
    </DataContext.Provider>
  )
}

export const useData = () => useContext(DataContext)
