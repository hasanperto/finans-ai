'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, ArrowUpRight, ArrowDownRight, Trash2 } from 'lucide-react'

const allTransactions = [
  { id: 1, title: 'Maaş - Mart 2026', amount: 45000, type: 'income', date: '1 Mar 2026', category: 'Maaş' },
  { id: 2, title: 'Kira - Mart', amount: -15000, type: 'expense', date: '3 Mar 2026', category: 'Zorunlu' },
  { id: 3, title: 'Migros Market', amount: -2800, type: 'expense', date: '4 Mar 2026', category: 'Gıda' },
  { id: 4, title: 'Benzin', amount: -1500, type: 'expense', date: '5 Mar 2026', category: 'Ulaşım' },
  { id: 5, title: 'Website Projesi', amount: 8000, type: 'income', date: '5 Mar 2026', category: 'Freelance' },
  { id: 6, title: 'Elektrik Faturası', amount: -950, type: 'expense', date: '6 Mar 2026', category: 'Faturalar' },
  { id: 7, title: 'Logo Tasarım', amount: 4000, type: 'income', date: '10 Mar 2026', category: 'Freelance' },
  { id: 8, title: 'Şifa Eczane', amount: -380, type: 'expense', date: '10 Mar 2026', category: 'Sağlık' },
  { id: 9, title: 'Binance Staking', amount: 1500, type: 'income', date: '12 Mar 2026', category: 'Yatırım' },
  { id: 10, title: 'Netflix + Spotify', amount: -250, type: 'expense', date: '12 Mar 2026', category: 'Abonelik' },
  { id: 11, title: 'Sinema + Yemek', amount: -650, type: 'expense', date: '15 Mar 2026', category: 'Eğlence' },
  { id: 12, title: 'Kira - Kiracı', amount: 5000, type: 'income', date: '15 Mar 2026', category: 'Kira' },
  { id: 13, title: 'Migros Market', amount: -1500, type: 'expense', date: '18 Mar 2026', category: 'Gıda' },
  { id: 14, title: 'Mobil Uygulama', amount: 6000, type: 'income', date: '20 Mar 2026', category: 'Freelance' },
  { id: 15, title: 'Internet Faturası', amount: -450, type: 'expense', date: '20 Mar 2026', category: 'Faturalar' },
]

const months = ['Ocak 2026', 'Şubat 2026', 'Mart 2026']

export default function TransactionsPage() {
  const [currentMonthIndex, setCurrentMonthIndex] = useState(2) // Mart 2026
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all')

  const currentMonth = months[currentMonthIndex]
  
  const filteredTransactions = allTransactions.filter((tx) => {
    if (filter === 'income') return tx.type === 'income'
    if (filter === 'expense') return tx.type === 'expense'
    return true
  })

  const totalIncome = filteredTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
  const totalExpense = Math.abs(filteredTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0))

  const goToPrevMonth = () => {
    if (currentMonthIndex > 0) setCurrentMonthIndex(currentMonthIndex - 1)
  }

  const goToNextMonth = () => {
    if (currentMonthIndex < months.length - 1) setCurrentMonthIndex(currentMonthIndex + 1)
  }

  return (
    <div className="container">
      <div className="page-header">
        <h1 className="page-title">İşlemler</h1>
        <p className="page-subtitle">Tüm gelir ve gider kayıtlarınız</p>
      </div>

      {/* Month Navigator */}
      <div className="month-nav">
        <button className="month-nav-btn" onClick={goToPrevMonth} disabled={currentMonthIndex === 0}>
          <ChevronLeft size={18} />
        </button>
        <div className="month-display">{currentMonth}</div>
        <button className="month-nav-btn" onClick={goToNextMonth} disabled={currentMonthIndex === months.length - 1}>
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Filters */}
      <div className="filters">
        <button className={`filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
          Tümü
        </button>
        <button className={`filter-btn ${filter === 'income' ? 'active' : ''}`} onClick={() => setFilter('income')}>
          Gelir
        </button>
        <button className={`filter-btn ${filter === 'expense' ? 'active' : ''}`} onClick={() => setFilter('expense')}>
          Gider
        </button>
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="stat-card" style={{ borderLeft: '3px solid #10b981' }}>
          <div className="stat-label">Toplam Gelir</div>
          <div className="stat-value income">₺{totalIncome.toLocaleString()}</div>
        </div>
        <div className="stat-card" style={{ borderLeft: '3px solid #ef4444' }}>
          <div className="stat-label">Toplam Gider</div>
          <div className="stat-value expense">₺{totalExpense.toLocaleString()}</div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Kayıtlar</h3>
          <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{filteredTransactions.length} işlem</span>
        </div>
        
        {filteredTransactions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
            Bu ay henüz işlem bulunmuyor.
          </div>
        ) : (
          filteredTransactions.map((tx) => (
            <div key={tx.id} className="list-item" style={{ cursor: 'pointer' }}>
              <div className="list-icon" style={{ background: tx.type === 'income' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)' }}>
                {tx.type === 'income' ? (
                  <ArrowUpRight size={20} color="#10b981" />
                ) : (
                  <ArrowDownRight size={20} color="#ef4444" />
                )}
              </div>
              <div className="list-content">
                <div className="list-title">{tx.title}</div>
                <div className="list-subtitle">{tx.date} · {tx.category}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div className={`list-amount ${tx.type}`}>
                  {tx.amount > 0 ? '+' : ''}₺{Math.abs(tx.amount).toLocaleString()}
                </div>
                <button style={{ padding: '0.5rem', borderRadius: 8, color: '#64748b', transition: 'color 0.2s' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#64748b'}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
