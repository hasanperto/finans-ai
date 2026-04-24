'use client'

import { useState } from 'react'
import { Settings, Plus, X, Palette, Trash2, Edit2, Check, Layers } from 'lucide-react'

interface Category {
  id: string
  name: string
  icon: string
  color: string
  type?: string
}


// Default categories
const defaultIncomeCategories: Category[] = [
  { id: '1', name: 'Maaş', icon: '💼', color: '#6366f1' },
  { id: '2', name: 'Freelance', icon: '💻', color: '#10b981' },
  { id: '3', name: 'Kira Geliri', icon: '🏠', color: '#f59e0b' },
  { id: '4', name: 'Yatırım', icon: '📈', color: '#8b5cf6' },
  { id: '5', name: 'Diğer', icon: '📦', color: '#64748b' },
]

const defaultExpenseCategories: Category[] = [
  { id: '1', name: 'Kira', icon: '🏠', color: '#6366f1', type: 'Zorunlu' },
  { id: '2', name: 'Gıda', icon: '🛒', color: '#10b981', type: 'İsteğe Bağlı' },
  { id: '3', name: 'Ulaşım', icon: '🚗', color: '#f59e0b', type: 'Zorunlu' },
  { id: '4', name: 'Faturalar', icon: '📄', color: '#ef4444', type: 'Zorunlu' },
  { id: '5', name: 'Eğlence', icon: '🎬', color: '#8b5cf6', type: 'İsteğe Bağlı' },
  { id: '6', name: 'Sağlık', icon: '❤️', color: '#ec4899', type: 'Zorunlu' },
  { id: '7', name: 'Abonelik', icon: '📺', color: '#14b8a6', type: 'İsteğe Bağlı' },
  { id: '8', name: 'Diğer', icon: '📦', color: '#64748b', type: 'İsteğe Bağlı' },
]

const availableIcons = ['💼', '💻', '💰', '🏠', '📈', '📦', '🛒', '🚗', '📄', '🎬', '❤️', '📺', '🎮', '📚', '🏋️', '✈️', '🎁', '💳', '📱', '🔌']
const availableColors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#64748b', '#3b82f6', '#84cc16']

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'income' | 'expenses'>('expenses')
  const [incomeCategories, setIncomeCategories] = useState<Category[]>(defaultIncomeCategories)
  const [expenseCategories, setExpenseCategories] = useState<Category[]>(defaultExpenseCategories)
  const [showModal, setShowModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<any>(null)
  const [newCategory, setNewCategory] = useState({ name: '', icon: '📦', color: '#6366f1', type: 'İsteğe Bağlı' })

  const handleAddNew = () => {
    setEditingCategory(null)
    setNewCategory({ name: '', icon: '📦', color: '#6366f1', type: 'İsteğe Bağlı' })
    setShowModal(true)
  }

  const handleEdit = (cat: any) => {
    setEditingCategory(cat)
    setNewCategory({ name: cat.name, icon: cat.icon, color: cat.color, type: cat.type || 'İsteğe Bağlı' })
    setShowModal(true)
  }

  const handleSave = () => {
    if (!newCategory.name.trim()) return

    if (editingCategory) {
      // Update existing
      if (activeTab === 'income') {
        setIncomeCategories(incomeCategories.map(c => c.id === editingCategory.id ? { ...c, ...newCategory } : c))
      } else {
        setExpenseCategories(expenseCategories.map(c => c.id === editingCategory.id ? { ...c, ...newCategory } : c))
      }
    } else {
      // Add new
      const id = Date.now().toString()
      if (activeTab === 'income') {
        setIncomeCategories([...incomeCategories, { id, ...newCategory }])
      } else {
        setExpenseCategories([...expenseCategories, { id, ...newCategory }])
      }
    }
    setShowModal(false)
  }

  const handleDelete = (id: string) => {
    if (activeTab === 'income') {
      setIncomeCategories(incomeCategories.filter(c => c.id !== id))
    } else {
      setExpenseCategories(expenseCategories.filter(c => c.id !== id))
    }
  }

  return (
    <div className="container">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Settings size={28} style={{ color: 'var(--primary-light)' }} />
          <div>
            <h1 className="page-title">Ayarlar</h1>
            <p className="page-subtitle">Kategori ve sistem ayarlarını yönet</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="filters" style={{ marginBottom: '1.5rem' }}>
        <button className={`filter-btn ${activeTab === 'expenses' ? 'active' : ''}`} onClick={() => setActiveTab('expenses')}>
          <Layers size={16} style={{ marginRight: '0.375rem' }} />
          Gider Kategorileri
        </button>
        <button className={`filter-btn ${activeTab === 'income' ? 'active' : ''}`} onClick={() => setActiveTab('income')}>
          <Layers size={16} style={{ marginRight: '0.375rem' }} />
          Gelir Kategorileri
        </button>
      </div>

      {/* Categories */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            {activeTab === 'income' ? 'Gelir' : 'Gider'} Kategorileri
          </h3>
          <button className="btn btn-primary" onClick={handleAddNew} style={{ padding: '0.5rem 1rem' }}>
            <Plus size={16} />
            Yeni Kategori
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {(activeTab === 'income' ? incomeCategories : expenseCategories).map((cat) => (
            <div
              key={cat.id}
              style={{
                background: 'rgba(0,0,0,0.2)',
                border: '1px solid var(--glass-border)',
                borderRadius: 12,
                padding: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  background: `${cat.color}20`,
                  border: `2px solid ${cat.color}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.25rem'
                }}
              >
                {cat.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, marginBottom: '0.125rem' }}>{cat.name}</div>
                {cat.type && (
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{cat.type}</div>
                )}
              </div>
              <div style={{ display: 'flex', gap: '0.25rem' }}>
                <button
                  onClick={() => handleEdit(cat)}
                  style={{ padding: '0.5rem', borderRadius: 8, color: '#64748b', transition: 'color 0.2s' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary-light)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#64748b'}
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => handleDelete(cat.id)}
                  style={{ padding: '0.5rem', borderRadius: 8, color: '#64748b', transition: 'color 0.2s' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--danger)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#64748b'}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Info Card */}
      <div className="card" style={{ background: 'rgba(99, 102, 241, 0.1)', borderColor: 'rgba(99, 102, 241, 0.3)' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
          <Palette size={24} style={{ color: 'var(--primary-light)', flexShrink: 0, marginTop: '0.25rem' }} />
          <div>
            <h4 style={{ marginBottom: '0.5rem', color: 'var(--primary-light)' }}>Kategori Yönetimi</h4>
            <p style={{ fontSize: '0.9rem', color: '#94a3b8', lineHeight: 1.6 }}>
              İstediğiniz gibi kategori ekleyebilir, düzenleyebilir veya silebilirsiniz. 
              Her kategori için ikon ve renk seçebilirsiniz. Gider kategorilerinde "Zorunlu" veya "İsteğe Bağlı" 
              olarak da işaretleyebilirsiniz.
            </p>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 100, padding: '1rem'
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--glass-border)',
              borderRadius: 16,
              padding: '1.5rem',
              width: '100%',
              maxWidth: 400
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2>{editingCategory ? 'Kategoriyi Düzenle' : 'Yeni Kategori'}</h2>
              <button onClick={() => setShowModal(false)}><X size={24} /></button>
            </div>

            {/* Name */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'block', marginBottom: '0.5rem' }}>
                Kategori Adı
              </label>
              <input
                type="text"
                value={newCategory.name}
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                className="chat-input"
                placeholder="örn: Market"
                style={{ width: '100%' }}
              />
            </div>

            {/* Type (only for expenses) */}
            {activeTab === 'expenses' && (
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'block', marginBottom: '0.5rem' }}>
                  Tür
                </label>
                <select
                  value={newCategory.type}
                  onChange={(e) => setNewCategory({ ...newCategory, type: e.target.value })}
                  style={{
                    width: '100%',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: 10,
                    padding: '0.75rem 1rem',
                    color: 'var(--text-primary)'
                  }}
                >
                  <option value="Zorunlu">Zorunlu</option>
                  <option value="İsteğe Bağlı">İsteğe Bağlı</option>
                </select>
              </div>
            )}

            {/* Icons */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'block', marginBottom: '0.5rem' }}>
                İkon
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {availableIcons.map((icon) => (
                  <button
                    key={icon}
                    onClick={() => setNewCategory({ ...newCategory, icon })}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 8,
                      background: newCategory.icon === icon ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                      border: newCategory.icon === icon ? '2px solid var(--primary-light)' : '1px solid var(--glass-border)',
                      fontSize: '1.25rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            {/* Colors */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'block', marginBottom: '0.5rem' }}>
                Renk
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {availableColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setNewCategory({ ...newCategory, color })}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      background: color,
                      border: newCategory.color === color ? '3px solid white' : '2px solid transparent',
                      boxShadow: newCategory.color === color ? '0 0 0 2px var(--primary)' : 'none'
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Preview */}
            <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: 12 }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem' }}>Önizleme</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: `${newCategory.color}20`,
                  border: `2px solid ${newCategory.color}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.25rem'
                }}>
                  {newCategory.icon}
                </div>
                <span style={{ fontWeight: 600 }}>{newCategory.name || 'Kategori Adı'}</span>
              </div>
            </div>

            <button className="btn btn-primary w-full" onClick={handleSave} style={{ width: '100%', justifyContent: 'center' }}>
              <Check size={18} />
              {editingCategory ? 'Güncelle' : 'Ekle'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
