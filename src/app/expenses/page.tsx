'use client'

import { useState } from 'react'
import { TrendingDown, Plus, ArrowDownRight, Edit2, Trash2, Check, RefreshCw, X } from 'lucide-react'
import { useData, type PeriodType, type Transaction } from '../context/DataContext'
import { useCurrency } from '../context/CurrencyContext'
import { useI18n } from '../context/I18nContext'

const buildPeriodLabel = (t: (key: string, params?: Record<string, string | number>) => string) =>
  (period: PeriodType, dayOfMonth?: number) => {
    switch (period) {
      case 'daily': return t('recurring.everyDay')
      case 'weekly': return t('recurring.everyWeek')
      case 'monthly': return dayOfMonth ? t('recurring.monthlyOnDay', { day: dayOfMonth }) : t('recurring.monthlyDefault')
      case 'yearly': return t('recurring.yearly')
    }
  }

export default function ExpensesPage() {
  const { transactions, recurringTransactions, addTransaction, updateTransaction, deleteTransaction, addRecurring, updateRecurring, settings, hasPassword, verifyPassword } = useData()
  const { formatMoney } = useCurrency()
  const { t } = useI18n()
  const [showModal, setShowModal] = useState(false)
  const [showRecurringModal, setShowRecurringModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newTx, setNewTx] = useState({ title: '', amount: '', categoryId: '' })
  const [newRecurring, setNewRecurring] = useState<{ title: string; amount: string; categoryId: string; period: PeriodType; dayOfMonth: number }>({ title: '', amount: '', categoryId: '', period: 'monthly', dayOfMonth: 1 })
  const [authPassword, setAuthPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [pendingDelete, setPendingDelete] = useState<string | null>(null)
  const [pendingEdit, setPendingEdit] = useState<string | null>(null)

  const getPeriodLabel = buildPeriodLabel(t)
  const expenseTransactions = transactions.filter(t => t.type === 'expense')
  const totalExpense = Math.abs(expenseTransactions.reduce((sum, t) => sum + t.amount, 0))
  
  const recurringExpenses = recurringTransactions.filter(r => r.type === 'expense' && r.isActive)
  const recurringTotal = recurringExpenses.reduce((sum, r) => sum + r.amount, 0)

  const handleAdd = () => {
    if (!newTx.title || !newTx.amount || !newTx.categoryId) return
    const cat = settings.categories.expense.find(c => c.id === newTx.categoryId)
    addTransaction({
      title: newTx.title,
      amount: -Math.abs(parseFloat(newTx.amount)),
      type: 'expense',
      date: new Date().toISOString().split('T')[0],
      category: cat?.name || 'Diğer',
      categoryId: newTx.categoryId,
    })
    setNewTx({ title: '', amount: '', categoryId: '' })
    setShowModal(false)
  }

  const handleAddRecurring = () => {
    if (!newRecurring.title || !newRecurring.amount || !newRecurring.categoryId) return
    const cat = settings.categories.expense.find(c => c.id === newRecurring.categoryId)
    
    const today = new Date()
    let nextDue = ''
    
    if (newRecurring.period === 'monthly') {
      const targetDay = newRecurring.dayOfMonth
      const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, targetDay)
      if (nextMonth <= today) {
        nextMonth.setMonth(nextMonth.getMonth() + 1)
      }
      nextDue = nextMonth.toISOString().split('T')[0]
    } else if (newRecurring.period === 'weekly') {
      const next = new Date(today)
      next.setDate(next.getDate() + 7)
      nextDue = next.toISOString().split('T')[0]
    } else if (newRecurring.period === 'daily') {
      nextDue = new Date(today.getTime() + 86400000).toISOString().split('T')[0]
    } else {
      nextDue = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate()).toISOString().split('T')[0]
    }
    
    addRecurring({
      title: newRecurring.title,
      amount: parseFloat(newRecurring.amount),
      type: 'expense',
      category: cat?.name || 'Diğer',
      categoryId: newRecurring.categoryId,
      period: newRecurring.period,
      nextDue,
      isActive: true,
      dayOfMonth: newRecurring.period === 'monthly' ? newRecurring.dayOfMonth : undefined,
    })
    setNewRecurring({ title: '', amount: '', categoryId: '', period: 'monthly', dayOfMonth: 1 })
    setShowRecurringModal(false)
  }

  const handleEdit = (tx: Transaction) => {
    if (hasPassword()) {
      setEditingId(tx.id)
      setPendingEdit(tx.id)
      setAuthError('')
      return
    }
    setEditingId(tx.id)
    setNewTx({ title: tx.title, amount: Math.abs(tx.amount).toString(), categoryId: tx.categoryId })
    setShowModal(true)
  }

  const handleUpdate = () => {
    if (!editingId || !newTx.title || !newTx.amount || !newTx.categoryId) return
    const cat = settings.categories.expense.find(c => c.id === newTx.categoryId)
    updateTransaction(editingId, {
      title: newTx.title,
      amount: -Math.abs(parseFloat(newTx.amount)),
      category: cat?.name || 'Diğer',
      categoryId: newTx.categoryId,
    })
    setEditingId(null)
    setNewTx({ title: '', amount: '', categoryId: '' })
    setShowModal(false)
  }

  const handleDelete = (id: string) => {
    if (hasPassword()) {
      setPendingDelete(id)
      setAuthError('')
    } else {
      deleteTransaction(id)
    }
  }

  const confirmDelete = async () => {
    if (pendingDelete) {
      if (hasPassword() && !(await verifyPassword(authPassword))) {
        setAuthError(t('common.wrongPassword'))
        return
      }
      deleteTransaction(pendingDelete)
      setPendingDelete(null)
      setAuthPassword('')
      setAuthError('')
    }
  }

  const confirmEdit = async () => {
    if (pendingEdit) {
      if (hasPassword() && !(await verifyPassword(authPassword))) {
        setAuthError(t('common.wrongPassword'))
        return
      }
      const tx = transactions.find(t => t.id === pendingEdit)
      if (tx) {
        setNewTx({ title: tx.title, amount: Math.abs(tx.amount).toString(), categoryId: tx.categoryId })
        setShowModal(true)
      }
      setPendingEdit(null)
      setAuthPassword('')
      setAuthError('')
    }
  }

  return (
    <div className="container">
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 className="page-title">{t('expenses.title')}</h1>
            <p className="page-subtitle">{t('expenses.subtitle')}</p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn-secondary" onClick={() => setShowRecurringModal(true)} title={t('expenses.recurring')}>
              <RefreshCw size={18} />
              {t('expenses.recurring')}
            </button>
            <button className="btn btn-primary" onClick={() => { setEditingId(null); setNewTx({ title: '', amount: '', categoryId: '' }); setShowModal(true) }}>
              <Plus size={18} />
              {t('common.add')}
            </button>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="card" style={{ background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(239, 68, 68, 0.05))', borderColor: 'rgba(239, 68, 68, 0.3)', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: 'linear-gradient(135deg, #ef4444, #dc2626)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <TrendingDown size={28} color="white" />
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.25rem' }}>{t('expenses.total')}</div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#ef4444' }}>{formatMoney(totalExpense)}</div>
          </div>
        </div>
        
        {/* Category breakdown */}
        <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '1rem' }}>
          <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.75rem' }}>{t('expenses.categoryBreakdown')}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {settings.categories.expense.map(cat => {
              const catTotal = Math.abs(transactions.filter(t => t.type === 'expense' && t.categoryId === cat.id).reduce((s, t) => s + t.amount, 0))
              const percent = totalExpense > 0 ? (catTotal / totalExpense) * 100 : 0
              if (catTotal === 0) return null
              return (
                <div key={cat.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '1.25rem' }}>{cat.icon}</span>
                  <span style={{ flex: 1, fontWeight: 500 }}>{cat.name}</span>
                  <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>{formatMoney(catTotal)}</span>
                  <span style={{ 
                    background: `${cat.color}30`, 
                    color: cat.color, 
                    padding: '0.25rem 0.6rem', 
                    borderRadius: 20, 
                    fontSize: '0.8rem', 
                    fontWeight: 600 
                  }}>
                    %{percent.toFixed(1)}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
        
        {recurringTotal > 0 && (
          <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'rgba(239,68,68,0.1)', borderRadius: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <RefreshCw size={16} color="#ef4444" />
              <span style={{ fontSize: '0.9rem', color: '#94a3b8' }}>{t('income.recurringMonthly')}</span>
            </div>
            <span style={{ fontWeight: 600, color: '#ef4444' }}>{formatMoney(recurringTotal)} | {t('income.perYear', { value: formatMoney(recurringTotal * 12) })}</span>
          </div>
        )}
      </div>

      {/* Recurring Expenses */}
      {recurringExpenses.length > 0 && (
        <div className="card" style={{ marginBottom: '1.5rem', borderColor: 'rgba(99, 102, 241, 0.3)' }}>
          <div className="card-header">
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <RefreshCw size={18} style={{ color: '#6366f1' }} />
              {t('expenses.recurringExpenses')}
            </h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {recurringExpenses.map(r => (
              <div key={r.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', background: 'rgba(0,0,0,0.2)', borderRadius: 10 }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{r.title}</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{getPeriodLabel(r.period, r.dayOfMonth)} · {t('recurring.next')}: {r.nextDue}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ color: '#ef4444', fontWeight: 600 }}>-{formatMoney(r.amount)}</span>
                  <button onClick={() => updateRecurring(r.id, { isActive: false })} style={{ padding: '0.375rem', color: '#64748b', background: 'none', border: 'none', cursor: 'pointer' }}>
                    <X size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Transactions */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">{t('expenses.allRecords')}</h3>
        </div>
        {expenseTransactions.length === 0 ? (
          <p style={{ color: '#64748b', textAlign: 'center', padding: '2rem' }}>{t('expenses.empty')}</p>
        ) : (
          expenseTransactions.map((tx) => {
            const cat = settings.categories.expense.find(c => c.id === tx.categoryId)
            return (
              <div key={tx.id} className="list-item">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
                  <div className="list-icon" style={{ background: cat ? `${cat.color}20` : 'rgba(239, 68, 68, 0.15)' }}>
                    <ArrowDownRight size={20} color={cat?.color || '#ef4444'} />
                  </div>
                  <div className="list-content">
                    <div className="list-title">{tx.title} {tx.isRecurring && <span style={{ fontSize: '0.7rem', color: '#6366f1' }}>🔄</span>}</div>
                    <div className="list-subtitle">{tx.date} · {tx.category}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div className="list-amount expense">-{formatMoney(Math.abs(tx.amount))}</div>
                  <button onClick={() => handleEdit(tx)} style={{ padding: '0.375rem', color: '#64748b', background: 'none', border: 'none', cursor: 'pointer', borderRadius: 6 }}>
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleDelete(tx.id)} style={{ padding: '0.375rem', color: '#64748b', background: 'none', border: 'none', cursor: 'pointer', borderRadius: 6 }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--glass-border)', borderRadius: 16, padding: '1.5rem', width: '100%', maxWidth: 400 }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginBottom: '1.5rem' }}>{editingId ? t('expenses.editTitle') : t('expenses.newTitle')}</h2>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'block', marginBottom: '0.5rem' }}>{t('common.title')}</label>
              <input type="text" value={newTx.title} onChange={(e) => setNewTx({ ...newTx, title: e.target.value })} className="chat-input" placeholder={t('expenses.titlePlaceholder')} style={{ width: '100%' }} />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'block', marginBottom: '0.5rem' }}>{t('common.amount')}</label>
              <input type="number" value={newTx.amount} onChange={(e) => setNewTx({ ...newTx, amount: e.target.value })} className="chat-input" placeholder="0" style={{ width: '100%' }} />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'block', marginBottom: '0.5rem' }}>{t('common.category')}</label>
              <select value={newTx.categoryId} onChange={(e) => setNewTx({ ...newTx, categoryId: e.target.value })} style={{ width: '100%', background: 'var(--bg-card)', border: '1px solid var(--glass-border)', borderRadius: 10, padding: '0.75rem 1rem', color: 'var(--text-primary)' }}>
                <option value="">{t('common.categoryPlaceholder')}</option>
                {settings.categories.expense.map(c => (
                  <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                ))}
              </select>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => { setShowModal(false); setEditingId(null) }}>{t('common.cancel')}</button>
              <button className="btn btn-primary" onClick={editingId ? handleUpdate : handleAdd}>
                <Check size={18} />
                {editingId ? t('common.update') : t('common.add')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recurring Modal */}
      {showRecurringModal && (
        <div className="modal-overlay" onClick={() => setShowRecurringModal(false)}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--glass-border)', borderRadius: 16, padding: '1.5rem', width: '100%', maxWidth: 400 }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <RefreshCw size={20} style={{ color: '#6366f1' }} />
              {t('expenses.recurringNewTitle')}
            </h2>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'block', marginBottom: '0.5rem' }}>{t('common.title')}</label>
              <input type="text" value={newRecurring.title} onChange={(e) => setNewRecurring({ ...newRecurring, title: e.target.value })} className="chat-input" placeholder={t('expenses.titlePlaceholder')} style={{ width: '100%' }} />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'block', marginBottom: '0.5rem' }}>{t('common.amount')}</label>
              <input type="number" value={newRecurring.amount} onChange={(e) => setNewRecurring({ ...newRecurring, amount: e.target.value })} className="chat-input" placeholder="0" style={{ width: '100%' }} />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'block', marginBottom: '0.5rem' }}>{t('common.category')}</label>
              <select value={newRecurring.categoryId} onChange={(e) => setNewRecurring({ ...newRecurring, categoryId: e.target.value })} style={{ width: '100%', background: 'var(--bg-card)', border: '1px solid var(--glass-border)', borderRadius: 10, padding: '0.75rem 1rem', color: 'var(--text-primary)' }}>
                <option value="">{t('common.categoryPlaceholder')}</option>
                {settings.categories.expense.map(c => (
                  <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                ))}
              </select>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'block', marginBottom: '0.5rem' }}>{t('recurring.title')}</label>
              <select value={newRecurring.period} onChange={(e) => setNewRecurring({ ...newRecurring, period: e.target.value as PeriodType })} style={{ width: '100%', background: 'var(--bg-card)', border: '1px solid var(--glass-border)', borderRadius: 10, padding: '0.75rem 1rem', color: 'var(--text-primary)' }}>
                <option value="daily">{t('recurring.daily')}</option>
                <option value="weekly">{t('recurring.weekly')}</option>
                <option value="monthly">{t('recurring.monthly')}</option>
                <option value="yearly">{t('recurring.yearly')}</option>
              </select>
            </div>

            {newRecurring.period === 'monthly' && (
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'block', marginBottom: '0.5rem' }}>{t('recurring.dayOfMonth')}</label>
                <select
                  value={newRecurring.dayOfMonth}
                  onChange={(e) => setNewRecurring({ ...newRecurring, dayOfMonth: parseInt(e.target.value) })}
                  style={{ width: '100%', background: 'var(--bg-card)', border: '1px solid var(--glass-border)', borderRadius: 10, padding: '0.75rem 1rem', color: 'var(--text-primary)' }}
                >
                  {Array.from({ length: 28 }, (_, i) => i + 1).map(day => (
                    <option key={day} value={day}>{t('recurring.dayOption', { day })}</option>
                  ))}
                </select>
              </div>
            )}

            <div style={{ padding: '1rem', background: 'rgba(99,102,241,0.1)', borderRadius: 10, marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{t('recurring.nextDateAuto')}</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, marginTop: '0.25rem' }}>
                {newRecurring.period === 'daily' && t('recurring.everyDay')}
                {newRecurring.period === 'weekly' && t('recurring.weekly7days')}
                {newRecurring.period === 'monthly' && t('recurring.monthlyOnDay', { day: newRecurring.dayOfMonth })}
                {newRecurring.period === 'yearly' && t('recurring.yearly')}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setShowRecurringModal(false)}>{t('common.cancel')}</button>
              <button className="btn btn-primary" onClick={handleAddRecurring}>
                <Check size={18} />
                {t('common.add')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {pendingDelete && (
        <div className="modal-overlay" onClick={() => setPendingDelete(null)}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 16, padding: '1.5rem', width: '100%', maxWidth: 400 }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ color: 'var(--danger)', marginBottom: '0.5rem' }}>{t('dialog.delete.title')}</h2>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.5rem' }}>{t('common.cannotUndo')}</p>
            {hasPassword() && (
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'block', marginBottom: '0.5rem' }}>{t('auth.passwordPlaceholder')}</label>
                <input type="password" value={authPassword} onChange={(e) => { setAuthPassword(e.target.value); setAuthError('') }} className="chat-input" placeholder={t('common.password')} style={{ width: '100%' }} />
              </div>
            )}
            {authError && <div style={{ color: 'var(--danger)', fontSize: '0.85rem', marginBottom: '1rem' }}>{authError}</div>}
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => { setPendingDelete(null); setAuthPassword(''); setAuthError('') }}>{t('common.cancel')}</button>
              <button className="btn" onClick={confirmDelete} style={{ background: 'var(--danger)', color: 'white' }}>
                <Trash2 size={16} /> {t('common.delete')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Confirmation */}
      {pendingEdit && (
        <div className="modal-overlay" onClick={() => { setPendingEdit(null); setAuthPassword('') }}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--glass-border)', borderRadius: 16, padding: '1.5rem', width: '100%', maxWidth: 400 }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginBottom: '0.5rem' }}>{t('common.passwordRequired')}</h2>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.5rem' }}>{t('dialog.editPasswordPrompt')}</p>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'block', marginBottom: '0.5rem' }}>{t('common.password')}</label>
              <input type="password" value={authPassword} onChange={(e) => { setAuthPassword(e.target.value); setAuthError('') }} className="chat-input" placeholder={t('common.password')} style={{ width: '100%' }} />
            </div>
            {authError && <div style={{ color: 'var(--danger)', fontSize: '0.85rem', marginBottom: '1rem' }}>{authError}</div>}
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => { setPendingEdit(null); setAuthPassword(''); setAuthError('') }}>{t('common.cancel')}</button>
              <button className="btn btn-primary" onClick={confirmEdit}>{t('common.confirm')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
