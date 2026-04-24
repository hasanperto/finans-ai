'use client'

import { useState } from 'react'
import { TrendingDown, Plus, ArrowDownRight, AlertCircle } from 'lucide-react'

const expenseCategories = [
  { name: 'Kira', icon: '🏠', amount: 15000, percent: 47, color: '#6366f1', type: 'Zorunlu' },
  { name: 'Gıda', icon: '🛒', amount: 8000, percent: 25, color: '#10b981', type: 'İsteğe Bağlı' },
  { name: 'Ulaşım', icon: '🚗', amount: 4500, percent: 14, color: '#f59e0b', type: 'Zorunlu' },
  { name: 'Faturalar', icon: '📄', amount: 3500, percent: 11, color: '#ef4444', type: 'Zorunlu' },
  { name: 'Eğlence', icon: '🎬', amount: 1000, percent: 3, color: '#8b5cf6', type: 'İsteğe Bağlı' },
]

const expenseList = [
  { id: 1, title: 'Kira - Mart', amount: 15000, date: '3 Mar 2026', category: 'Zorunlu' },
  { id: 2, title: 'Migros Market', amount: 2800, date: '4 Mar 2026', category: 'Gıda' },
  { id: 3, title: 'Benzin', amount: 1500, date: '5 Mar 2026', category: 'Ulaşım' },
  { id: 4, title: 'Elektrik Faturası', amount: 950, date: '6 Mar 2026', category: 'Faturalar' },
  { id: 5, title: 'Internet', amount: 450, date: '6 Mar 2026', category: 'Faturalar' },
  { id: 6, title: 'Sinema + Yemek', amount: 650, date: '8 Mar 2026', category: 'Eğlence' },
  { id: 7, title: 'Şifa Eczane', amount: 380, date: '10 Mar 2026', category: 'Sağlık' },
  { id: 8, title: 'Netflix + Spotify', amount: 250, date: '12 Mar 2026', category: 'Abonelik' },
]

export default function ExpensesPage() {
  const totalExpenses = expenseCategories.reduce((sum, c) => sum + c.amount, 0)
  const mandatoryExpenses = expenseCategories.filter(c => c.type === 'Zorunlu').reduce((sum, c) => sum + c.amount, 0)
  const optionalExpenses = totalExpenses - mandatoryExpenses

  return (
    <div className="container">
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 className="page-title">Giderler</h1>
            <p className="page-subtitle">Harcamalarınızın detaylı analizi</p>
          </div>
          <button className="btn btn-primary">
            <Plus size={18} />
            Gider Ekle
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="stat-card">
          <div className="stat-label">Toplam Gider</div>
          <div className="stat-value expense">₺{totalExpenses.toLocaleString()}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Zorunlu Giderler</div>
          <div className="stat-value" style={{ color: '#ef4444' }}>₺{mandatoryExpenses.toLocaleString()}</div>
          <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem' }}>%{(mandatoryExpenses / totalExpenses * 100).toFixed(0)} toplam gider</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">İsteğe Bağlı</div>
          <div className="stat-value" style={{ color: '#f59e0b' }}>₺{optionalExpenses.toLocaleString()}</div>
          <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem' }}>%{(optionalExpenses / totalExpenses * 100).toFixed(0)} toplam gider</div>
        </div>
      </div>

      {/* Expense Breakdown */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Kategori Bazlı Harcamalar</h3>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {expenseCategories.map((cat) => (
            <div key={cat.name}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>{cat.icon}</span>
                  <div>
                    <span style={{ fontWeight: 500 }}>{cat.name}</span>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', marginLeft: '0.5rem' }}>{cat.type}</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontWeight: 600, marginRight: '0.75rem' }}>₺{cat.amount.toLocaleString()}</span>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>gelirin %{(cat.amount / 58000 * 100).toFixed(0)}</span>
                </div>
              </div>
              <div style={{ height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 3 }}>
                <div style={{ width: `${cat.percent}%`, height: '100%', background: cat.color, borderRadius: 3, transition: 'width 0.3s' }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Warning Card */}
      <div className="card" style={{ background: 'rgba(245, 158, 11, 0.1)', borderColor: 'rgba(245, 158, 11, 0.3)' }}>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <AlertCircle size={24} color="#f59e0b" style={{ flexShrink: 0, marginTop: '0.25rem' }} />
          <div>
            <h4 style={{ marginBottom: '0.5rem', color: '#f59e0b' }}>Dikkat!</h4>
            <p style={{ fontSize: '0.9rem', color: '#94a3b8' }}>
              Gıda harcamalarınız geçen aya göre <strong style={{ color: '#f1f5f9' }}>%15 arttı</strong>. 
              Market alışverişini planlı yaparak aylık ₺2.000'e kadar tasarruf edebilirsiniz.
            </p>
          </div>
        </div>
      </div>

      {/* All Expenses */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Tüm Harcama Kayıtları</h3>
        </div>
        {expenseList.map((item) => (
          <div key={item.id} className="list-item">
            <div className="list-icon" style={{ background: 'rgba(239, 68, 68, 0.15)' }}>
              <ArrowDownRight size={20} color="#ef4444" />
            </div>
            <div className="list-content">
              <div className="list-title">{item.title}</div>
              <div className="list-subtitle">{item.date} · {item.category}</div>
            </div>
            <div className="list-amount expense">-₺{item.amount.toLocaleString()}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
