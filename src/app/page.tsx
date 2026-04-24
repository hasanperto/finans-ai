'use client'

import Link from 'next/link'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { TrendingUp, TrendingDown, Wallet, PiggyBank, ArrowUpRight, ArrowDownRight, Sparkles } from 'lucide-react'

// Demo data
const monthlyData = [
  { month: 'Eki', gelir: 45000, gider: 28000 },
  { month: 'Kas', gelir: 52000, gider: 31000 },
  { month: 'Ara', gelir: 48000, gider: 35000 },
  { month: 'Oca', gelir: 61000, gider: 29000 },
  { month: 'Şub', gelir: 55000, gider: 33000 },
  { month: 'Mar', gelir: 58000, gider: 32000 },
]

const categoryData = [
  { name: 'Kira', value: 35, color: '#6366f1' },
  { name: 'Gıda', value: 25, color: '#10b981' },
  { name: 'Ulaşım', value: 15, color: '#f59e0b' },
  { name: 'Faturalar', value: 15, color: '#ef4444' },
  { name: 'Diğer', value: 10, color: '#64748b' },
]

const recentTransactions = [
  { id: 1, title: 'Maaş', amount: 45000, type: 'income', date: '1 Mar', category: 'Maaş' },
  { id: 2, title: 'Kira', amount: -15000, type: 'expense', date: '3 Mar', category: 'Zorunlu' },
  { id: 3, title: 'Market', amount: -2800, type: 'expense', date: '4 Mar', category: 'Gıda' },
  { id: 4, title: 'Freelance', amount: 12000, type: 'income', date: '5 Mar', category: 'Ek Gelir' },
  { id: 5, title: 'Fatura', amount: -950, type: 'expense', date: '6 Mar', category: 'Faturalar' },
]

export default function DashboardPage() {
  const totalIncome = 324000
  const totalExpense = 188000
  const balance = totalIncome - totalExpense
  const savingsRate = ((balance / totalIncome) * 100).toFixed(1)

  return (
    <div className="container">
      <div className="page-header">
        <h1 className="page-title">Genel Bakış</h1>
        <p className="page-subtitle">Finansal durumunuzun özeti</p>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Toplam Gelir</div>
          <div className="stat-value income">₺{totalIncome.toLocaleString()}</div>
          <div className="stat-change positive">
            <TrendingUp size={14} />
            +12% geçen aydan
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Toplam Gider</div>
          <div className="stat-value expense">₺{totalExpense.toLocaleString()}</div>
          <div className="stat-change negative">
            <TrendingDown size={14} />
            -8% geçen aydan
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Net Bakiye</div>
          <div className="stat-value balance">₺{balance.toLocaleString()}</div>
          <div className="stat-change positive">
            <Wallet size={14} />
            Pozitif
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Tasarruf Oranı</div>
          <div className="stat-value savings">{savingsRate}%</div>
          <div className="stat-change positive">
            <PiggyBank size={14} />
            Hedef: %30
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid-2">
        {/* Bar Chart */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Gelir vs Gider (Son 6 Ay)</h3>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(v) => `₺${v / 1000}k`} />
                <Tooltip 
                  contentStyle={{ background: '#1a1a24', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12 }}
                  labelStyle={{ color: '#f1f5f9' }}
                />
                <Bar dataKey="gelir" fill="#10b981" radius={[4, 4, 0, 0]} name="Gelir" />
                <Bar dataKey="gider" fill="#ef4444" radius={[4, 4, 0, 0]} name="Gider" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Harcama Dağılımı</h3>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ background: '#1a1a24', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '1rem', justifyContent: 'center' }}>
            {categoryData.map((cat) => (
              <div key={cat.name} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <div style={{ width: 10, height: 10, borderRadius: 3, background: cat.color }} />
                <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{cat.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Quick Insight */}
      <div className="card" style={{ background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(129, 140, 248, 0.05))', borderColor: 'rgba(99, 102, 241, 0.3)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg, #6366f1, #818cf8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles size={24} color="white" />
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ marginBottom: '0.5rem', fontSize: '1rem' }}>AI Hızlı Değerlendirme</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.6 }}>
              Bu ay gelirleriniz {savingsRate}% tasarruf oranı ile geçen aya göre <span style={{ color: '#10b981' }}> daha iyi</span> performans gösteriyor. 
              Giderlerinizin %35'i kira, %25'i gıda. Yatırıma yönlendirebileceğiniz fazla gelir: <span style={{ color: '#fbbf24', fontWeight: 600 }}>₺8.200</span>
            </p>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Son İşlemler</h3>
          <Link href="/transactions" style={{ fontSize: '0.85rem', color: '#6366f1' }}>Tümünü gör →</Link>
        </div>
        {recentTransactions.map((tx) => (
          <div key={tx.id} className="list-item">
            <div className="list-icon" style={{ background: tx.type === 'income' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)' }}>
              {tx.type === 'income' ? <ArrowUpRight size={20} color="#10b981" /> : <ArrowDownRight size={20} color="#ef4444" />}
            </div>
            <div className="list-content">
              <div className="list-title">{tx.title}</div>
              <div className="list-subtitle">{tx.date} · {tx.category}</div>
            </div>
            <div className={`list-amount ${tx.type}`}>
              {tx.amount > 0 ? '+' : ''}₺{Math.abs(tx.amount).toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
