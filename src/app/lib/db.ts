'use client'

import Dexie, { type Table } from 'dexie'
import type { Transaction, RecurringTransaction, Settings } from '../context/DataContext'

class FinansAIDatabase extends Dexie {
  transactions!: Table<Transaction, string>
  recurring!: Table<RecurringTransaction, string>
  meta!: Table<{ key: string; value: unknown }, string>

  constructor() {
    super('finansai_db')
    this.version(1).stores({
      transactions: 'id, date, type, category, categoryId, isRecurring, createdFrom',
      recurring: 'id, type, isActive, nextDue, period',
      meta: 'key',
    })
  }
}

let _db: FinansAIDatabase | null = null

export function getDB(): FinansAIDatabase {
  if (typeof window === 'undefined') {
    throw new Error('IndexedDB only available in the browser')
  }
  if (!_db) _db = new FinansAIDatabase()
  return _db
}

const MIGRATION_FLAG = 'finansai_db_migrated_v1'

export async function migrateFromLocalStorageIfNeeded(): Promise<void> {
  if (typeof window === 'undefined') return
  try {
    if (localStorage.getItem(MIGRATION_FLAG) === '1') return
  } catch {
    return
  }

  const db = getDB()
  try {
    const rawTx = localStorage.getItem('finansai_transactions')
    const rawRec = localStorage.getItem('finansai_recurring')
    const rawSet = localStorage.getItem('finansai_settings')

    if (rawTx) {
      const list = JSON.parse(rawTx) as Transaction[]
      if (Array.isArray(list) && list.length) {
        await db.transactions.bulkPut(list)
      }
    }
    if (rawRec) {
      const list = JSON.parse(rawRec) as RecurringTransaction[]
      if (Array.isArray(list) && list.length) {
        await db.recurring.bulkPut(list)
      }
    }
    if (rawSet) {
      const parsed = JSON.parse(rawSet) as Settings
      await db.meta.put({ key: 'settings', value: parsed })
    }

    localStorage.setItem(MIGRATION_FLAG, '1')
  } catch {
    // Migration failure must not block app — leave flag unset for retry
  }
}

export async function loadAll(): Promise<{
  transactions: Transaction[]
  recurring: RecurringTransaction[]
  settings: Settings | null
}> {
  const db = getDB()
  const [transactions, recurring, settingsRow] = await Promise.all([
    db.transactions.toArray(),
    db.recurring.toArray(),
    db.meta.get('settings'),
  ])
  return {
    transactions: transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    recurring,
    settings: (settingsRow?.value as Settings | undefined) ?? null,
  }
}

export async function saveTransactions(list: Transaction[]) {
  const db = getDB()
  await db.transaction('rw', db.transactions, async () => {
    await db.transactions.clear()
    if (list.length) await db.transactions.bulkPut(list)
  })
}

export async function saveRecurring(list: RecurringTransaction[]) {
  const db = getDB()
  await db.transaction('rw', db.recurring, async () => {
    await db.recurring.clear()
    if (list.length) await db.recurring.bulkPut(list)
  })
}

export async function saveSettings(settings: Settings) {
  const db = getDB()
  await db.meta.put({ key: 'settings', value: settings })
}

export async function wipeAll(): Promise<void> {
  const db = getDB()
  await Promise.all([
    db.transactions.clear(),
    db.recurring.clear(),
    db.meta.clear(),
  ])
}

export async function importAll(data: {
  transactions?: Transaction[]
  recurring?: RecurringTransaction[]
  settings?: Settings
}): Promise<void> {
  const db = getDB()
  await db.transaction('rw', db.transactions, db.recurring, db.meta, async () => {
    if (Array.isArray(data.transactions)) {
      await db.transactions.clear()
      if (data.transactions.length) await db.transactions.bulkPut(data.transactions)
    }
    if (Array.isArray(data.recurring)) {
      await db.recurring.clear()
      if (data.recurring.length) await db.recurring.bulkPut(data.recurring)
    }
    if (data.settings) {
      await db.meta.put({ key: 'settings', value: data.settings })
    }
  })
}
