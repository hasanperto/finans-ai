'use client'

import { useState } from 'react'
import { ArrowUpRight, ArrowDownRight, Search, Filter, Calendar, Download } from 'lucide-react'
import { useData } from '../context/DataContext'
import { useCurrency } from '../context/CurrencyContext'
import { useI18n } from '../context/I18nContext'

type DateFilter = 'all' | 'thisMonth' | 'lastMonth' | 'last3months' | 'last6months'

export default function TransactionsPage() {
  const { transactions } = useData()
  const { formatMoney } = useCurrency()
  const { language, t } = useI18n()
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all')
  const [search, setSearch] = useState('')
  const [dateFilter, setDateFilter] = useState<DateFilter>('thisMonth')

  const getFilteredTransactions = () => {
    let filtered = transactions

    // Date filter
    const now = new Date()
    if (dateFilter !== 'all') {
      filtered = filtered.filter(t => {
        const d = new Date(t.date)
        switch (dateFilter) {
          case 'thisMonth':
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
          case 'lastMonth':
            const last = new Date(now.getFullYear(), now.getMonth() - 1, 1)
            return d.getMonth() === last.getMonth() && d.getFullYear() === last.getFullYear()
          case 'last3months':
            const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate())
            return d >= threeMonthsAgo
          case 'last6months':
            const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate())
            return d >= sixMonthsAgo
          default:
            return true
        }
      })
    }

    // Type filter
    if (filter !== 'all') {
      filtered = filtered.filter(t => t.type === filter)
    }

    // Search
    if (search) {
      filtered = filtered.filter(t => 
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.category.toLowerCase().includes(search.toLowerCase())
      )
    }

    return filtered
  }

  const filtered = getFilteredTransactions()

  // Stats for filtered
  const totalIncome = filtered.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const totalExpense = Math.abs(filtered.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0))
  const netBalance = totalIncome - totalExpense

  const exportCSV = () => {
    const headers = language === 'de'
      ? ['Datum', 'Titel', 'Kategorie', 'Typ', 'Betrag']
      : ['Tarih', 'Başlık', 'Kategori', 'Tür', 'Tutar']
    const rows = filtered.map(t => [
      t.date,
      t.title,
      t.category,
      t.type === 'income' ? (language === 'de' ? 'Einnahmen' : 'Gelir') : (language === 'de' ? 'Ausgaben' : 'Gider'),
      t.amount.toString()
    ])
    
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `finansai-transactions-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const dateFilters: { id: DateFilter; label: string }[] = [
    { id: 'thisMonth', label: t('transactions.date.thisMonth') },
    { id: 'lastMonth', label: t('transactions.date.lastMonth') },
    { id: 'last3months', label: t('transactions.date.last3months') },
    { id: 'last6months', label: t('transactions.date.last6months') },
    { id: 'all', label: t('transactions.date.all') },
  ]

  return (
    <div className="container">
      <div className="page-header">
        <h1 className="page-title">{t('transactions.title')}</h1>
        <p className="page-subtitle">{t('transactions.records', { count: filtered.length })}</p>
      </div>

      {/* Summary */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{language === 'de' ? 'Einnahmen' : 'Gelir'}</div>
            <div style={{ color: '#10b981', fontWeight: 600, fontSize: '1.1rem' }}>{formatMoney(totalIncome)}</div>
          </div>
          <div style={{ borderLeft: '1px solid var(--glass-border)', borderRight: '1px solid var(--glass-border)', padding: '0 1.5rem' }}>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{language === 'de' ? 'Ausgaben' : 'Gider'}</div>
            <div style={{ color: '#ef4444', fontWeight: 600, fontSize: '1.1rem' }}>{formatMoney(totalExpense)}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{language === 'de' ? 'Saldo' : 'Net'}</div>
            <div style={{ color: netBalance >= 0 ? '#10b981' : '#ef4444', fontWeight: 600, fontSize: '1.1rem' }}>{formatMoney(netBalance)}</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
        {/* Date Filter */}
        <div className="filters" style={{ flexWrap: 'wrap', gap: '0.5rem' }}>
          {dateFilters.map(df => (
            <button
              key={df.id}
              onClick={() => setDateFilter(df.id)}
              className={`filter-btn ${dateFilter === df.id ? 'active' : ''}`}
            >
              <Calendar size={14} />
              {df.label}
            </button>
          ))}
        </div>

        {/* Type Filter */}
        <div className="filters">
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('transactions.searchPlaceholder')}
              className="chat-input"
              style={{ paddingLeft: '2.5rem', width: '100%' }}
            />
          </div>
          <button className={`filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
            <Filter size={16} /> {t('common.all')}
          </button>
          <button className={`filter-btn ${filter === 'income' ? 'active' : ''}`} onClick={() => setFilter('income')}>
            <ArrowUpRight size={16} /> {language === 'de' ? 'Einnahmen' : 'Gelir'}
          </button>
          <button className={`filter-btn ${filter === 'expense' ? 'active' : ''}`} onClick={() => setFilter('expense')}>
            <ArrowDownRight size={16} /> {language === 'de' ? 'Ausgaben' : 'Gider'}
          </button>
        </div>
      </div>

      {/* Export Button */}
      <div style={{ marginBottom: '1rem' }}>
        <button className="btn btn-secondary" onClick={exportCSV} style={{ padding: '0.5rem 1rem' }}>
          <Download size={16} />
          {t('transactions.exportCsv')}
        </button>
      </div>

      {/* Transactions List */}
      <div className="card">
        {filtered.length === 0 ? (
          <p style={{ color: '#64748b', textAlign: 'center', padding: '2rem' }}>{t('transactions.notFound')}</p>
        ) : (
          filtered.map((tx) => (
            <div key={tx.id} className="list-item">
              <div className="list-icon" style={{ background: tx.type === 'income' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)' }}>
                {tx.type === 'income' ? <ArrowUpRight size={20} color="#10b981" /> : <ArrowDownRight size={20} color="#ef4444" />}
              </div>
              <div className="list-content">
                <div className="list-title">
                  {tx.title}
                  {tx.isRecurring && <span style={{ fontSize: '0.7rem', color: '#6366f1', marginLeft: '0.5rem' }}>🔄</span>}
                </div>
                <div className="list-subtitle">{tx.date} · {tx.category}</div>
              </div>
              <div className={`list-amount ${tx.type}`}>
                {tx.amount > 0 ? '+' : ''}{formatMoney(Math.abs(tx.amount))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
