'use client'

import { useState } from 'react'
import { TrendingUp, Plus, ArrowUpRight, TrendingDown, Wallet } from 'lucide-react'

const incomeCategories = [
  { name: 'Maaş', icon: '💼', amount: 45000, percent: 70, color: '#6366f1' },
  { name: 'Freelance', icon: '💻', amount: 12000, percent: 19, color: '#10b981' },
  { name: 'Kira Geliri', icon: '🏠', amount: 5000, percent: 8, color: '#f59e0b' },
  { name: 'Yatırım', icon: '📈', amount: 2000, percent: 3, color: '#8b5cf6' },
]

const incomeList = [
  { id: 1, title: 'Maaş - Mart 2026', amount: 45000, date: '1 Mar 2026', source: 'Ana iş' },
  { id: 2, title: 'Website Projesi', amount: 8000, date: '5 Mar 2026', source: 'Freelance' },
  { id: 3, title: 'Logo Tasarım', amount: 4000, date: '10 Mar 2026', source: 'Freelance' },
  { id: 4, title: 'Binance Staking', amount: 1500, date: '12 Mar 2026', source: 'Yatırım' },
  { id: 5, title: 'Kira - Kiracı', amount: 5000, date: '15 Mar 2026', source: 'Kira' },
  { id: 6, title: 'Mobil Uygulama', amount: 6000, date: '20 Mar 2026', source: 'Freelance' },
]

export default function IncomePage() {
  const [showAddModal, setShowAddModal] = useState(false)
  const totalIncome = incomeCategories.reduce((sum, c) => sum + c.amount, 0)

  return (
    <div className="container">
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 className="page-title">Gelirler</h1>
            <p className="page-subtitle">Gelir kaynaklarınız ve kırılımları</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
            <Plus size={18} />
            Gelir Ekle
          </button>
        </div>
      </div>

      {/* Summary Card */}
      <div className="card" style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(16, 185, 129, 0.05))', borderColor: 'rgba(16, 185, 129, 0.3)', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: 56, height: 56, borderRadius: 14, background: 'linear-gradient(135deg, #10b981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={28} color="white" />
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.25rem' }}>Toplam Gelir (Bu Ay)</div>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: '#10b981' }}>₺{totalIncome.toLocaleString()}</div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Geçen Ay</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 600, color: '#10b981' }}>+₺4.200</div>
          </div>
        </div>
      </div>

      {/* Income by Category */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Gelir Kaynaklarına Göre Kırılım</h3>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {incomeCategories.map((cat) => (
            <div key={cat.name}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>{cat.icon}</span>
                  <span style={{ fontWeight: 500 }}>{cat.name}</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontWeight: 600, marginRight: '0.75rem' }}>₺{cat.amount.toLocaleString()}</span>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>%{cat.percent}</span>
                </div>
              </div>
              <div style={{ height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 3 }}>
                <div style={{ width: `${cat.percent}%`, height: '100%', background: cat.color, borderRadius: 3, transition: 'width 0.3s' }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Income List */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Tüm Gelir Kayıtları</h3>
        </div>
        {incomeList.map((item) => (
          <div key={item.id} className="list-item">
            <div className="list-icon" style={{ background: 'rgba(16, 185, 129, 0.15)' }}>
              <ArrowUpRight size={20} color="#10b981" />
            </div>
            <div className="list-content">
              <div className="list-title">{item.title}</div>
              <div className="list-subtitle">{item.date} · {item.source}</div>
            </div>
            <div className="list-amount income">+₺{item.amount.toLocaleString()}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
