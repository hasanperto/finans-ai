'use client'

import { useRef, useState } from 'react'
import { Settings, Plus, Trash2, Edit2, Check, Layers, RotateCcw, Lock, AlertTriangle, DollarSign, BarChart3, Download, Sparkles, Eye, EyeOff, Cpu, PiggyBank } from 'lucide-react'
import { useData, type Currency, type AIProvider, type Category, type ScenarioId } from '../context/DataContext'
import { useCurrency } from '../context/CurrencyContext'
import { useI18n } from '../context/I18nContext'
import { computeBudgetStatus } from '../lib/budget'

const availableIcons = ['💼', '💻', '💰', '🏠', '📈', '📦', '🛒', '🚗', '📄', '🎬', '❤️', '📺', '🎮', '📚', '🏋️', '✈️', '🎁', '💳', '📱', '🔌']
const availableColors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#64748b', '#3b82f6', '#84cc16']

type TabType = 'currency' | 'ai' | 'security' | 'categories' | 'budgets' | 'reports' | 'data'

export default function SettingsPage() {
  const { settings, updateSettings, resetAll, transactions, hasPassword, loadScenario, verifyPassword, setCredentials, exportBackup, importBackup, setBudget, removeBudget } = useData()
  const { currency, setCurrency, currencies, formatMoney } = useCurrency()
  const { language, setLanguage, t } = useI18n()
  
  const [activeTab, setActiveTab] = useState<TabType>('currency')
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [categoryTab, setCategoryTab] = useState<'income' | 'expenses'>('expenses')
  const [newItem, setNewItem] = useState({ name: '', icon: '📦', color: '#6366f1', type: 'İsteğe Bağlı' as 'Zorunlu' | 'İsteğe Bağlı' })
  
  // Password state
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [tempPassword, setTempPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [tempQuestion, setTempQuestion] = useState('')
  const [tempAnswer, setTempAnswer] = useState('')
  const [passwordError, setPasswordError] = useState('')
  
  // Reset state
  const [showResetModal, setShowResetModal] = useState(false)
  const [resetPassword, setResetPassword] = useState('')
  const [resetError, setResetError] = useState('')
  const [showApiKey, setShowApiKey] = useState(false)

  const categories = categoryTab === 'income' ? settings.categories.income : settings.categories.expense

  // Stats
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
  const totalExpense = Math.abs(transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0))
  const balance = totalIncome - totalExpense

  const handleSave = () => {
    if (!newItem.name.trim()) return
    if (editingId) {
      if (categoryTab === 'income') {
        updateSettings({
          categories: {
            ...settings.categories,
            income: settings.categories.income.map(c => c.id === editingId ? { ...c, ...newItem } : c)
          }
        })
      } else {
        updateSettings({
          categories: {
            ...settings.categories,
            expense: settings.categories.expense.map(c => c.id === editingId ? { ...c, ...newItem } : c)
          }
        })
      }
    } else {
      const id = Date.now().toString()
      if (categoryTab === 'income') {
        updateSettings({
          categories: {
            ...settings.categories,
            income: [...settings.categories.income, { id, ...newItem }]
          }
        })
      } else {
        updateSettings({
          categories: {
            ...settings.categories,
            expense: [...settings.categories.expense, { id, ...newItem, type: newItem.type }]
          }
        })
      }
    }
    setShowModal(false)
    setEditingId(null)
    setNewItem({ name: '', icon: '📦', color: '#6366f1', type: 'İsteğe Bağlı' })
  }

  const handleEdit = (cat: Category) => {
    setEditingId(cat.id)
    setNewItem({ name: cat.name, icon: cat.icon, color: cat.color, type: cat.type || 'İsteğe Bağlı' })
    setShowModal(true)
  }

  const handleDelete = (id: string) => {
    if (categoryTab === 'income') {
      updateSettings({
        categories: { ...settings.categories, income: settings.categories.income.filter(c => c.id !== id) }
      })
    } else {
      updateSettings({
        categories: { ...settings.categories, expense: settings.categories.expense.filter(c => c.id !== id) }
      })
    }
  }

  const handlePasswordSave = async () => {
    setPasswordError('')
    const question = tempQuestion.trim()
    const answer = tempAnswer.trim()
    if (!question || !answer) {
      setPasswordError(language === 'de' ? 'Sicherheitsfrage und Antwort sind erforderlich' : 'Gizli soru ve yanıt zorunludur')
      return
    }

    if (!settings.password && !tempPassword) {
      setPasswordError(language === 'de' ? 'Bitte ein Passwort festlegen' : 'Lütfen bir şifre belirleyin')
      return
    }

    if (tempPassword) {
      if (tempPassword !== confirmPassword) {
        setPasswordError(language === 'de' ? 'Passwörter stimmen nicht überein' : 'Şifreler eşleşmiyor')
        return
      }
    }

    await setCredentials({
      authEnabled: true,
      password: tempPassword || undefined,
      securityAnswer: answer,
      question,
    })
    setShowPasswordModal(false)
    setTempPassword('')
    setConfirmPassword('')
    setTempQuestion('')
    setTempAnswer('')
  }

  const closePasswordModal = () => {
    setShowPasswordModal(false)
    setTempPassword('')
    setConfirmPassword('')
    setTempQuestion('')
    setTempAnswer('')
    setPasswordError('')
    if (settings.authEnabled && !settings.password) {
      updateSettings({ authEnabled: false })
    }
  }

  const handleReset = async () => {
    setResetError('')
    if (hasPassword() && !(await verifyPassword(resetPassword))) {
      setResetError(language === 'de' ? 'Falsches Passwort' : 'Yanlış şifre')
      return
    }
    await resetAll()
    setShowResetModal(false)
    setResetPassword('')
  }

  const exportData = () => {
    const blob = new Blob([exportBackup()], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `finansai-backup-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const importFileRef = useRef<HTMLInputElement | null>(null)
  const [importMsg, setImportMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  const handleImportFile = async (file: File) => {
    setImportMsg(null)
    if (!confirm(language === 'de'
      ? 'Bestehende Daten werden ersetzt. Fortfahren?'
      : 'Mevcut veriler değiştirilecek. Devam edilsin mi?')) return
    try {
      const text = await file.text()
      const parsed: unknown = JSON.parse(text)
      const result = importBackup(parsed)
      if (result.ok) {
        setImportMsg({ type: 'ok', text: language === 'de'
          ? `${result.count} Einträge importiert.`
          : `${result.count} kayıt içe aktarıldı.` })
      } else {
        setImportMsg({ type: 'err', text: language === 'de'
          ? `Ungültige Datei: ${result.error}`
          : `Geçersiz dosya: ${result.error}` })
      }
    } catch {
      setImportMsg({ type: 'err', text: language === 'de'
        ? 'Datei konnte nicht gelesen werden.'
        : 'Dosya okunamadı.' })
    }
  }

  const tabs = [
    { id: 'currency' as TabType, label: t('settings.tab.currency'), icon: <DollarSign size={18} /> },
    { id: 'ai' as TabType, label: t('settings.tab.ai'), icon: <Sparkles size={18} /> },
    { id: 'security' as TabType, label: t('settings.tab.security'), icon: <Lock size={18} /> },
    { id: 'categories' as TabType, label: t('settings.tab.categories'), icon: <Layers size={18} /> },
    { id: 'budgets' as TabType, label: t('settings.tab.budgets'), icon: <PiggyBank size={18} /> },
    { id: 'reports' as TabType, label: t('settings.tab.reports'), icon: <BarChart3 size={18} /> },
    { id: 'data' as TabType, label: t('settings.tab.data'), icon: <Download size={18} /> },
  ]

  return (
    <div className="container">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Settings size={28} style={{ color: 'var(--primary-light)' }} />
          <div>
            <h1 className="page-title">{t('settings.title')}</h1>
            <p className="page-subtitle">{t('settings.subtitle')}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="filters" style={{ marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        {tabs.map(tab => (
          <button 
            key={tab.id} 
            className={`filter-btn ${activeTab === tab.id ? 'active' : ''}`} 
            onClick={() => setActiveTab(tab.id)}
          >
            <span style={{ marginRight: '0.375rem' }}>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-header">
          <h3 className="card-title">{t('lang.label')}</h3>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setLanguage('tr')}
            style={{
              background: language === 'tr' ? 'rgba(99, 102, 241, 0.2)' : undefined,
              border: language === 'tr' ? '2px solid rgba(99, 102, 241, 0.6)' : undefined,
            }}
          >
            {t('lang.tr')}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setLanguage('de')}
            style={{
              background: language === 'de' ? 'rgba(99, 102, 241, 0.2)' : undefined,
              border: language === 'de' ? '2px solid rgba(99, 102, 241, 0.6)' : undefined,
            }}
          >
            {t('lang.de')}
          </button>
        </div>
      </div>

      {/* Currency Tab */}
      {activeTab === 'currency' && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">{language === 'de' ? 'Währung wählen' : 'Para Birimi Seçimi'}</h3>
          </div>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            {language === 'de' ? 'Alle Beträge werden in dieser Währung angezeigt' : 'Tüm tutarlar bu para birimiyle gösterilecek'}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
            {(Object.entries(currencies) as [Currency, typeof currencies['TRY']][]).map(([key, info]) => (
              <button
                key={key}
                onClick={() => setCurrency(key)}
                style={{
                  padding: '1.25rem',
                  background: currency === key ? `${info.rate > 1 ? '#10b981' : '#6366f1'}20` : 'rgba(255,255,255,0.03)',
                  border: `2px solid ${currency === key ? (info.rate > 1 ? '#10b981' : '#6366f1') : 'var(--glass-border)'}`,
                  borderRadius: 14,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>{info.symbol}</span>
                  {currency === key && <Check size={20} color="#10b981" />}
                </div>
                <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{info.name}</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{key}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* AI Settings Tab */}
      {activeTab === 'ai' && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Cpu size={18} />
              {t('settings.ai.title')}
            </h3>
          </div>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            {t('settings.ai.providerDesc')}
          </p>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'block', marginBottom: '0.5rem' }}>{t('settings.ai.providerLabel')}</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.75rem' }}>
              {([
                { id: 'gemini' as AIProvider, name: 'Google Gemini', icon: '🔮', desc: 'Gemini Pro' },
                { id: 'openai' as AIProvider, name: 'OpenAI', icon: '🤖', desc: 'GPT-4' },
                { id: 'minimax' as AIProvider, name: 'MiniMax', icon: '🧠', desc: 'MiniMax API' },
                { id: 'openrouter' as AIProvider, name: 'OpenRouter', icon: '🌐', desc: t('settings.ai.providerDesc.openrouter') },
                { id: 'custom' as AIProvider, name: t('settings.ai.providerName.custom'), icon: '⚙️', desc: t('settings.ai.providerDesc.custom') },
              ]).map(provider => (
                <button
                  key={provider.id}
                  onClick={() => updateSettings({ aiProvider: provider.id })}
                  style={{
                    padding: '1rem',
                    background: settings.aiProvider === provider.id ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255,255,255,0.03)',
                    border: `2px solid ${settings.aiProvider === provider.id ? '#6366f1' : 'var(--glass-border)'}`,
                    borderRadius: 12,
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{provider.icon}</div>
                  <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{provider.name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{provider.desc}</div>
                </button>
              ))}
            </div>
          </div>
          
          {settings.aiProvider === 'custom' && (
            <div style={{ marginBottom: '1.5rem', padding: '1.25rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: 12, border: '1px solid rgba(99, 102, 241, 0.3)' }}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'block', marginBottom: '0.5rem' }}>API URL</label>
                <input
                  type="text"
                  value={settings.aiApiUrl || ''}
                  onChange={(e) => updateSettings({ aiApiUrl: e.target.value })}
                  className="chat-input"
                  placeholder="https://api.example.com/v1/chat"
                  style={{ width: '100%' }}
                />
              </div>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                {t('settings.ai.customUrlNote')}
              </div>
            </div>
          )}
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'block', marginBottom: '0.5rem' }}>
              {settings.aiProvider === 'custom' ? t('settings.ai.authHeaderLabel') : t('settings.ai.apiKeyLabel')}
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showApiKey ? 'text' : 'password'}
                value={settings.aiApiKey}
                onChange={(e) => updateSettings({ aiApiKey: e.target.value })}
                className="chat-input"
                placeholder={settings.aiProvider === 'custom' ? t('settings.ai.apiKeyPlaceholderCustom') : t('settings.ai.apiKeyPlaceholderDefault', { provider: settings.aiProvider })}
                style={{ width: '100%', paddingRight: '3rem' }}
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#64748b',
                  cursor: 'pointer',
                  padding: '0.25rem'
                }}
              >
                {showApiKey ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          
          <div style={{ padding: '1rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: 10, border: '1px solid rgba(99, 102, 241, 0.3)' }}>
            <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.5rem' }}>{t('common.note')}</div>
            <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5 }}>
              {t('settings.ai.storageNote')}
            </p>
          </div>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Lock size={18} />
              {t('auth.title')}
            </h3>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{t('auth.enabled')}</div>
              <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>{t('auth.enabledDesc')}</div>
            </div>
            <button
              type="button"
              className={`btn ${settings.authEnabled ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => {
                if (!settings.authEnabled) {
                  if (!settings.password) {
                    setTempPassword('')
                    setConfirmPassword('')
                    setTempQuestion(settings.securityQuestion || '')
                    setTempAnswer('')
                    setPasswordError('')
                    setShowPasswordModal(true)
                  } else {
                    updateSettings({ authEnabled: true })
                  }
                } else {
                  updateSettings({ authEnabled: false })
                }
              }}
              style={{ padding: '0.65rem 1rem', whiteSpace: 'nowrap' }}
            >
              {settings.authEnabled ? t('common.active') : t('common.inactive')}
            </button>
          </div>

          {settings.authEnabled && (
            <>
              <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', borderRadius: 12, marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.25rem' }}>{t('common.question')}</div>
                <div style={{ fontWeight: 600 }}>{settings.securityQuestion || '—'}</div>
              </div>

              <button
                className="btn btn-primary"
                onClick={() => {
                  setTempPassword('')
                  setConfirmPassword('')
                  setTempQuestion(settings.securityQuestion || '')
                  setTempAnswer('')
                  setPasswordError('')
                  setShowPasswordModal(true)
                }}
                style={{ padding: '0.75rem 1.5rem' }}
              >
                <Lock size={18} />
                {settings.password ? t('auth.changePassword') : t('auth.setPassword')}
              </button>
            </>
          )}
        </div>
      )}

      {/* Categories Tab */}
      {activeTab === 'categories' && (
        <>
          <div className="filters" style={{ marginBottom: '1.5rem' }}>
            <button className={`filter-btn ${categoryTab === 'expenses' ? 'active' : ''}`} onClick={() => setCategoryTab('expenses')}>
              <Layers size={16} /> {language === 'de' ? 'Ausgaben' : 'Gider'}
            </button>
            <button className={`filter-btn ${categoryTab === 'income' ? 'active' : ''}`} onClick={() => setCategoryTab('income')}>
              <Layers size={16} /> {language === 'de' ? 'Einnahmen' : 'Gelir'}
            </button>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">
                {categoryTab === 'income'
                  ? (language === 'de' ? 'Einnahmen-Kategorien' : 'Gelir Kategorileri')
                  : (language === 'de' ? 'Ausgaben-Kategorien' : 'Gider Kategorileri')}
              </h3>
              <button className="btn btn-primary" onClick={() => { setEditingId(null); setNewItem({ name: '', icon: '📦', color: '#6366f1', type: 'İsteğe Bağlı' }); setShowModal(true) }}>
                <Plus size={16} /> {t('common.new')}
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
              {categories.map((cat) => (
                <div key={cat.id} style={{
                  background: 'rgba(0,0,0,0.2)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: 12,
                  padding: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem'
                }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 10,
                    background: `${cat.color}20`, border: `2px solid ${cat.color}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.25rem'
                  }}>
                    {cat.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, marginBottom: '0.125rem' }}>{cat.name}</div>
                    {cat.type && <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{cat.type}</div>}
                  </div>
                  <button onClick={() => handleEdit(cat)} style={{ padding: '0.5rem', borderRadius: 8, color: '#64748b', background: 'none', border: 'none', cursor: 'pointer' }}>
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleDelete(cat.id)} style={{ padding: '0.5rem', borderRadius: 8, color: '#64748b', background: 'none', border: 'none', cursor: 'pointer' }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Budgets Tab */}
      {activeTab === 'budgets' && (
        <BudgetsTab
          expenseCategories={settings.categories.expense}
          budgets={settings.budgets ?? []}
          statuses={computeBudgetStatus(settings.budgets, transactions)}
          formatMoney={formatMoney}
          setBudget={setBudget}
          removeBudget={removeBudget}
          t={t}
        />
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BarChart3 size={18} />
              Finansal Özet
            </h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{ background: 'rgba(16,185,129,0.15)', padding: '1.25rem', borderRadius: 12, border: '1px solid rgba(16,185,129,0.3)' }}>
              <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Toplam Gelir</div>
              <div style={{ color: '#10b981', fontSize: '1.5rem', fontWeight: 700 }}>{formatMoney(totalIncome)}</div>
            </div>
            <div style={{ background: 'rgba(239,68,68,0.15)', padding: '1.25rem', borderRadius: 12, border: '1px solid rgba(239,68,68,0.3)' }}>
              <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Toplam Gider</div>
              <div style={{ color: '#ef4444', fontSize: '1.5rem', fontWeight: 700 }}>{formatMoney(totalExpense)}</div>
            </div>
            <div style={{ background: 'rgba(99,102,241,0.15)', padding: '1.25rem', borderRadius: 12, border: '1px solid rgba(99,102,241,0.3)' }}>
              <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Net Bakiye</div>
              <div style={{ color: balance >= 0 ? '#10b981' : '#ef4444', fontSize: '1.5rem', fontWeight: 700 }}>{formatMoney(balance)}</div>
            </div>
            <div style={{ background: 'rgba(245,158,11,0.15)', padding: '1.25rem', borderRadius: 12, border: '1px solid rgba(245,158,11,0.3)' }}>
              <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Kayıt Sayısı</div>
              <div style={{ color: '#f59e0b', fontSize: '1.5rem', fontWeight: 700 }}>{transactions.length}</div>
            </div>
          </div>
          
          <h4 style={{ marginBottom: '1rem', color: '#94a3b8' }}>Kategori Bazlı Giderler</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {settings.categories.expense.map(cat => {
              const catTotal = Math.abs(transactions.filter(t => t.categoryId === cat.id && t.type === 'expense').reduce((s, t) => s + t.amount, 0))
              const percent = totalExpense > 0 ? (Math.abs(catTotal) / totalExpense) * 100 : 0
              return (
                <div key={cat.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span>{cat.icon}</span> {cat.name}
                    </span>
                    <span style={{ color: '#94a3b8' }}>{formatMoney(Math.abs(catTotal))} (%{percent.toFixed(1)})</span>
                  </div>
                  <div style={{ height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 3 }}>
                    <div style={{ width: `${percent}%`, height: '100%', background: cat.color, borderRadius: 3 }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Data Tab */}
      {activeTab === 'data' && (
        <>
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div className="card-header">
              <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sparkles size={18} />
                {t('settings.data.scenariosTitle')}
              </h3>
            </div>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
              {t('settings.data.scenariosDesc')}
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.75rem' }}>
              {([
                { id: 'student' as ScenarioId, label: t('settings.data.scenario.student') },
                { id: 'family' as ScenarioId, label: t('settings.data.scenario.family') },
                { id: 'freelancer' as ScenarioId, label: t('settings.data.scenario.freelancer') },
              ]).map(s => (
                <button
                  key={s.id}
                  className="btn btn-secondary"
                  onClick={() => loadScenario(s.id, language)}
                  style={{ justifyContent: 'center' }}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div className="card-header">
              <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Download size={18} />
                {t('settings.data.backupTitle')}
              </h3>
            </div>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              {t('settings.data.backupDesc')}
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button className="btn btn-primary" onClick={exportData}>
                <Download size={18} />
                {t('settings.data.backupBtn')}
              </button>
              <input
                ref={importFileRef}
                type="file"
                accept="application/json,.json"
                style={{ display: 'none' }}
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f) void handleImportFile(f)
                  e.target.value = ''
                }}
              />
              <button className="btn btn-secondary" onClick={() => importFileRef.current?.click()}>
                <Download size={18} style={{ transform: 'rotate(180deg)' }} />
                {language === 'de' ? 'Backup importieren' : 'Yedeği içe aktar'}
              </button>
            </div>
            {importMsg && (
              <div style={{
                marginTop: '0.85rem',
                padding: '0.65rem 0.85rem',
                borderRadius: 10,
                fontSize: '0.85rem',
                background: importMsg.type === 'ok' ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
                color: importMsg.type === 'ok' ? '#10b981' : '#ef4444',
                border: `1px solid ${importMsg.type === 'ok' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
              }}>
                {importMsg.text}
              </div>
            )}
          </div>

          <div className="card" style={{ background: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.3)' }}>
            <div className="card-header">
              <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--danger)' }}>
                <AlertTriangle size={18} />
                {t('settings.data.dangerTitle')}
              </h3>
            </div>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              {t('settings.data.dangerDesc')}
            </p>
            <button className="btn" onClick={() => { setShowResetModal(true); setResetError('') }} style={{ background: 'var(--danger)', color: 'white' }}>
              <RotateCcw size={16} />
              {t('settings.data.resetBtn')}
            </button>
          </div>
        </>
      )}

      {/* Category Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--glass-border)', borderRadius: 16, padding: '1.5rem', width: '100%', maxWidth: 400 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2>{editingId ? t('settings.category.editTitle') : t('settings.category.newTitle')}</h2>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'block', marginBottom: '0.5rem' }}>{t('settings.category.nameLabel')}</label>
              <input type="text" value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} className="chat-input" placeholder={t('settings.category.namePlaceholder')} style={{ width: '100%' }} />
            </div>

            {categoryTab === 'expenses' && (
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'block', marginBottom: '0.5rem' }}>Tür</label>
                <select value={newItem.type} onChange={(e) => setNewItem({ ...newItem, type: e.target.value as 'Zorunlu' | 'İsteğe Bağlı' })} style={{ width: '100%', background: 'var(--bg-card)', border: '1px solid var(--glass-border)', borderRadius: 10, padding: '0.75rem 1rem', color: 'var(--text-primary)' }}>
                  <option value="Zorunlu">Zorunlu</option>
                  <option value="İsteğe Bağlı">İsteğe Bağlı</option>
                </select>
              </div>
            )}

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'block', marginBottom: '0.5rem' }}>İkon</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {availableIcons.map((icon) => (
                  <button key={icon} onClick={() => setNewItem({ ...newItem, icon })} style={{ width: 40, height: 40, borderRadius: 8, background: newItem.icon === icon ? 'var(--primary)' : 'rgba(255,255,255,0.05)', border: newItem.icon === icon ? '2px solid var(--primary-light)' : '1px solid var(--glass-border)', fontSize: '1.25rem', cursor: 'pointer' }}>{icon}</button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'block', marginBottom: '0.5rem' }}>Renk</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {availableColors.map((color) => (
                  <button key={color} onClick={() => setNewItem({ ...newItem, color })} style={{ width: 32, height: 32, borderRadius: 8, background: color, border: newItem.color === color ? '3px solid white' : '2px solid transparent', boxShadow: newItem.color === color ? '0 0 0 2px var(--primary)' : 'none', cursor: 'pointer' }} />
                ))}
              </div>
            </div>

            <button className="btn btn-primary w-full" onClick={handleSave} style={{ width: '100%', justifyContent: 'center' }}>
              <Check size={18} /> Kaydet
            </button>
          </div>
        </div>
      )}

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="modal-overlay" onClick={closePasswordModal}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--glass-border)', borderRadius: 16, padding: '1.5rem', width: '100%', maxWidth: 400 }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginBottom: '1.5rem' }}>{t('auth.title')}</h2>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'block', marginBottom: '0.5rem' }}>{t('auth.newPassword')}</label>
              <input type="password" value={tempPassword} onChange={(e) => setTempPassword(e.target.value)} className="chat-input" placeholder={t('auth.passwordPlaceholder')} style={{ width: '100%' }} />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'block', marginBottom: '0.5rem' }}>{t('auth.confirmPassword')}</label>
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="chat-input" placeholder={t('auth.confirmPassword')} style={{ width: '100%' }} />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'block', marginBottom: '0.5rem' }}>{t('common.question')}</label>
              <input type="text" value={tempQuestion} onChange={(e) => setTempQuestion(e.target.value)} className="chat-input" placeholder={t('auth.questionPlaceholder')} style={{ width: '100%' }} />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'block', marginBottom: '0.5rem' }}>{t('common.answer')}</label>
              <input type="text" value={tempAnswer} onChange={(e) => setTempAnswer(e.target.value)} className="chat-input" placeholder={t('auth.answerPlaceholder')} style={{ width: '100%' }} />
            </div>
            {passwordError && <div style={{ color: 'var(--danger)', fontSize: '0.85rem', marginBottom: '1rem' }}>{passwordError}</div>}
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={closePasswordModal}>{t('common.cancel')}</button>
              <button className="btn btn-primary" onClick={handlePasswordSave}>{t('auth.saveSecurity')}</button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Modal */}
      {showResetModal && (
        <div className="modal-overlay" onClick={() => setShowResetModal(false)}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 16, padding: '1.5rem', width: '100%', maxWidth: 400 }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ color: 'var(--danger)', marginBottom: '0.5rem' }}>{t('common.areYouSure')}</h2>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              {t('settings.data.resetWarning')}
            </p>
            {hasPassword() && (
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'block', marginBottom: '0.5rem' }}>{t('auth.passwordPlaceholder')}</label>
                <input type="password" value={resetPassword} onChange={(e) => setResetPassword(e.target.value)} className="chat-input" placeholder={t('common.password')} style={{ width: '100%' }} />
              </div>
            )}
            {resetError && <div style={{ color: 'var(--danger)', fontSize: '0.85rem', marginBottom: '1rem' }}>{resetError}</div>}
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setShowResetModal(false)}>{t('common.cancel')}</button>
              <button className="btn" onClick={handleReset} style={{ background: 'var(--danger)', color: 'white' }}>{t('settings.data.resetConfirm')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function BudgetsTab({
  expenseCategories,
  budgets,
  statuses,
  formatMoney,
  setBudget,
  removeBudget,
  t,
}: {
  expenseCategories: Category[]
  budgets: { categoryId: string; amount: number; period: 'monthly' }[]
  statuses: ReturnType<typeof computeBudgetStatus>
  formatMoney: (n: number) => string
  setBudget: (categoryId: string, amount: number) => void
  removeBudget: (categoryId: string) => void
  t: (key: string, params?: Record<string, string | number>) => string
}) {
  const [drafts, setDrafts] = useState<Record<string, string>>(() =>
    Object.fromEntries(budgets.map(b => [b.categoryId, String(b.amount)]))
  )
  const statusMap = new Map(statuses.map(s => [s.categoryId, s]))

  const onSave = (categoryId: string) => {
    const raw = drafts[categoryId] ?? ''
    const n = parseFloat(raw.replace(',', '.'))
    if (!Number.isFinite(n) || n <= 0) {
      removeBudget(categoryId)
      return
    }
    setBudget(categoryId, n)
  }

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <PiggyBank size={18} />
          {t('budget.title')}
        </h3>
      </div>
      <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
        {t('budget.subtitle')}
      </p>

      {expenseCategories.length === 0 ? (
        <p style={{ color: '#64748b', textAlign: 'center', padding: '1.5rem' }}>{t('budget.empty')}</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {expenseCategories.map(cat => {
            const draft = drafts[cat.id] ?? ''
            const status = statusMap.get(cat.id)
            const levelColor = status?.level === 'over' ? 'var(--danger)' : status?.level === 'warn' ? 'var(--warning)' : 'var(--success)'
            const has = !!status
            return (
              <div key={cat.id} style={{ padding: '0.85rem 1rem', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', borderRadius: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '1.25rem' }}>{cat.icon}</span>
                  <span style={{ flex: '1 1 140px', fontWeight: 600, minWidth: 0 }}>{cat.name}</span>
                  <input
                    type="number"
                    inputMode="decimal"
                    min={0}
                    placeholder={t('budget.amount')}
                    value={draft}
                    onChange={(e) => setDrafts(d => ({ ...d, [cat.id]: e.target.value }))}
                    className="chat-input"
                    style={{ width: 140 }}
                  />
                  <button className="btn btn-primary" onClick={() => onSave(cat.id)} style={{ padding: '0.5rem 0.85rem', minHeight: 40 }}>
                    <Check size={16} />
                    {t('budget.save')}
                  </button>
                  {has && (
                    <button className="btn btn-secondary" onClick={() => { removeBudget(cat.id); setDrafts(d => ({ ...d, [cat.id]: '' })) }} style={{ padding: '0.5rem 0.75rem', minHeight: 40 }} aria-label={t('budget.remove')}>
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
                {has && status && (
                  <div style={{ marginTop: '0.65rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#94a3b8', marginBottom: 4 }}>
                      <span>{t('budget.spent')}: {formatMoney(status.spent)} / {formatMoney(status.amount)}</span>
                      <span style={{ color: levelColor, fontWeight: 600 }}>%{status.percent.toFixed(0)}</span>
                    </div>
                    <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 999, overflow: 'hidden' }}>
                      <div style={{
                        width: `${Math.min(100, status.percent)}%`,
                        height: '100%',
                        background: levelColor,
                        transition: 'width 0.3s',
                      }} />
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
