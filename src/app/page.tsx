'use client'

import Link from 'next/link'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { TrendingUp, TrendingDown, Wallet, PiggyBank, ArrowUpRight, ArrowDownRight, AlertTriangle } from 'lucide-react'
import CurrencySelector from './components/CurrencySelector'
import { useCurrency } from './context/CurrencyContext'
import { useData } from './context/DataContext'
import { useI18n } from './context/I18nContext'
import { useEffect, useMemo, useState } from 'react'
import { computeBudgetStatus } from './lib/budget'

export default function DashboardPage() {
  const { formatMoney } = useCurrency()
  const { transactions, recurringTransactions, settings } = useData()
  const { language, t } = useI18n()
  const [mounted, setMounted] = useState(false)

  const budgetStatuses = useMemo(
    () => computeBudgetStatus(settings.budgets, transactions),
    [settings.budgets, transactions]
  )
  const overCount = budgetStatuses.filter(b => b.level === 'over').length
  const warnCount = budgetStatuses.filter(b => b.level === 'warn').length

  useEffect(() => {
    setMounted(true)
  }, [])

  // Calculate totals
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
  const totalExpense = Math.abs(transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0))
  const balance = totalIncome - totalExpense
  const savingsRate = totalIncome > 0 ? ((balance / totalIncome) * 100).toFixed(1) : '0'

  // Build dynamic chart data from last 6 months
  const getMonthlyData = () => {
    const months = []
    const now = new Date()
    
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthName = d.toLocaleDateString(language === 'de' ? 'de-DE' : 'tr-TR', { month: 'short' })
      const monthNum = d.getMonth()
      const year = d.getFullYear()
      
      const monthTx = transactions.filter(t => {
        const td = new Date(t.date)
        return td.getMonth() === monthNum && td.getFullYear() === year
      })
      
      const income = monthTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
      const expense = Math.abs(monthTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0))
      
      months.push({ 
        month: monthName, 
        gelir: income || 0, 
        gider: expense || 0 
      })
    }
    
    return months
  }

  const monthlyData = getMonthlyData()

  // Dynamic category data from real transactions
  const getCategoryData = () => {
    const categories = transactions.filter(t => t.type === 'expense').reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + Math.abs(t.amount)
      return acc
    }, {} as Record<string, number>)
    
    const colors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#64748b']
    
    return Object.entries(categories)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, value], i) => ({ 
        name, 
        value: Math.round(value),
        color: colors[i % colors.length]
      }))
  }

  const categoryData = getCategoryData()
  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)

  // Active recurring count
  const activeRecurring = recurringTransactions.filter(r => r.isActive).length

  // AI suggestion based on real data
  const getAISuggestion = () => {
    if (totalExpense === 0) return null
    
    const topCat = categoryData[0]
    if (!topCat) return null
    
    const topPercent = ((topCat.value / totalExpense) * 100).toFixed(1)
    
    if (parseFloat(topPercent) > 40) {
      return {
        type: 'warning',
        icon: '⚠️',
        text: language === 'de'
          ? `${topCat.name} macht %${topPercent} Ihrer Ausgaben aus. Das ist ziemlich hoch.`
          : `${topCat.name} kategoriniz toplam giderlerin %${topPercent}’ini oluşturuyor. Bu oran yüksek.`
      }
    }
    
    if (parseFloat(savingsRate) < 20) {
      return {
        type: 'info',
        icon: '💡',
        text: language === 'de'
          ? `Ihre Sparquote ist %${savingsRate}. Ziel: 30% oder mehr.`
          : `Tasarruf oranınız %${savingsRate}. Hedefiniz %30 ve üzeri olmalı.`
      }
    }
    
    return {
      type: 'success',
      icon: '🎉',
      text: language === 'de'
        ? `Ihre Sparquote ist %${savingsRate}. Ihre Finanzen sehen gut aus!`
        : `Tasarruf oranınız %${savingsRate}. Finansal durumunuz iyi görünüyor!`
    }
  }

  const aiSuggestion = getAISuggestion()

  return (
    <div className="container">
      <div className="page-header">
        <h1 className="page-title">{t('dashboard.title')}</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <p className="page-subtitle">{t('dashboard.subtitle')}</p>
          <CurrencySelector />
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">{t('dashboard.totalIncome')}</div>
          <div className="stat-value income">{formatMoney(totalIncome)}</div>
          <div className="stat-change positive">
            <TrendingUp size={14} />
            {transactions.filter(t => t.type === 'income').length} {t('dashboard.entries')}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">{t('dashboard.totalExpense')}</div>
          <div className="stat-value expense">{formatMoney(totalExpense)}</div>
          <div className="stat-change negative">
            <TrendingDown size={14} />
            {transactions.filter(t => t.type === 'expense').length} {t('dashboard.entries')}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">{t('dashboard.netBalance')}</div>
          <div className="stat-value balance">{formatMoney(balance)}</div>
          <div className="stat-change positive">
            <Wallet size={14} />
            {balance >= 0 ? (language === 'de' ? 'Positiv' : 'Pozitif') : (language === 'de' ? 'Negativ' : 'Negatif')}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">{t('dashboard.savingsRate')}</div>
          <div className="stat-value savings">{savingsRate}%</div>
          <div className="stat-change positive">
            <PiggyBank size={14} />
            {t('dashboard.recurringCount', { count: activeRecurring })}
          </div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">{t('dashboard.chartIncomeVsExpense')}</h3>
          </div>
          <div className="chart-container">
            {mounted && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(v) => v === 0 ? '' : `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip contentStyle={{ background: '#1a1a24', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12 }} labelStyle={{ color: '#f1f5f9' }} formatter={(value) => [formatMoney(value as number), '']} />
                  <Bar dataKey="gelir" fill="#10b981" radius={[4, 4, 0, 0]} name={language === 'de' ? 'Einnahmen' : 'Gelir'} />
                  <Bar dataKey="gider" fill="#ef4444" radius={[4, 4, 0, 0]} name={language === 'de' ? 'Ausgaben' : 'Gider'} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">{t('dashboard.chartExpenseDistribution')}</h3>
          </div>
          <div className="chart-container">
            {categoryData.length > 0 ? (
              mounted && (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name} %${((percent || 0) * 100).toFixed(0)}`} labelLine={false}>
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#1a1a24', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12 }} formatter={(value) => [formatMoney(value as number), '']} />
                  </PieChart>
                </ResponsiveContainer>
              )
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#64748b' }}>
                {t('dashboard.noExpenseYet')}
              </div>
            )}
          </div>
          {categoryData.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '1rem', justifyContent: 'center' }}>
              {categoryData.map((cat) => (
                <div key={cat.name} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  <div style={{ width: 10, height: 10, borderRadius: 3, background: cat.color }} />
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{cat.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* AI Suggestion */}
      {aiSuggestion && (
        <div className="card" style={{ 
          background: aiSuggestion.type === 'warning' ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(245, 158, 11, 0.05))' : 
                      aiSuggestion.type === 'success' ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(16, 185, 129, 0.05))' :
                      'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(99, 102, 241, 0.05))',
          borderColor: aiSuggestion.type === 'warning' ? 'rgba(245, 158, 11, 0.3)' : 
                       aiSuggestion.type === 'success' ? 'rgba(16, 185, 129, 0.3)' :
                       'rgba(99, 102, 241, 0.3)'
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
            <div style={{ fontSize: '1.5rem' }}>{aiSuggestion.icon}</div>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.6, flex: 1 }}>
              {aiSuggestion.text}
            </p>
            <Link href="/assistant" style={{ color: '#6366f1', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
              {t('dashboard.askAi')}
            </Link>
          </div>
        </div>
      )}

      {budgetStatuses.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <PiggyBank size={18} />
              {t('budget.dashboardTitle')}
            </h3>
            <Link href="/settings" style={{ fontSize: '0.85rem', color: '#6366f1' }}>{t('budget.viewAll')}</Link>
          </div>

          {overCount > 0 && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.6rem',
              padding: '0.65rem 0.85rem', borderRadius: 10, marginBottom: '0.75rem',
              background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', fontSize: '0.85rem',
            }}>
              <AlertTriangle size={16} />
              {t('budget.exceededBanner', { count: overCount })}
            </div>
          )}
          {overCount === 0 && warnCount > 0 && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.6rem',
              padding: '0.65rem 0.85rem', borderRadius: 10, marginBottom: '0.75rem',
              background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)', color: '#fcd34d', fontSize: '0.85rem',
            }}>
              <AlertTriangle size={16} />
              {t('budget.warningBanner', { count: warnCount })}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {budgetStatuses.slice(0, 5).map(b => {
              const cat = settings.categories.expense.find(c => c.id === b.categoryId)
              if (!cat) return null
              const color = b.level === 'over' ? 'var(--danger)' : b.level === 'warn' ? 'var(--warning)' : 'var(--success)'
              return (
                <div key={b.categoryId}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 4, alignItems: 'center', gap: 8 }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
                      <span style={{ fontSize: '1rem' }}>{cat.icon}</span>
                      <span style={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{cat.name}</span>
                    </span>
                    <span style={{ color: '#94a3b8' }}>
                      {formatMoney(b.spent)} / <span style={{ color }}>{formatMoney(b.amount)}</span>
                    </span>
                  </div>
                  <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 999, overflow: 'hidden' }}>
                    <div style={{ width: `${Math.min(100, b.percent)}%`, height: '100%', background: color, transition: 'width 0.3s' }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">{t('dashboard.recentTransactions')}</h3>
          <Link href="/transactions" style={{ fontSize: '0.85rem', color: '#6366f1' }}>{t('dashboard.viewAll')}</Link>
        </div>
        {recentTransactions.length === 0 ? (
          <p style={{ color: '#64748b', textAlign: 'center', padding: '2rem' }}>{t('dashboard.noTransactionsYet')}</p>
        ) : (
          recentTransactions.map((tx) => (
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
