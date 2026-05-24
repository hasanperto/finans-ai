'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ArrowDownCircle, ArrowUpCircle, LayoutDashboard, MessageCircle, Receipt, Settings } from 'lucide-react'
import MobileNav from './components/MobileNav'
import InstallPrompt from './components/InstallPrompt'
import { useI18n } from './context/I18nContext'
import AuthGate from './AuthGate'

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { language, setLanguage, t } = useI18n()

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-logo" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem' }}>
          <span>FinansAI</span>
          <div style={{ display: 'flex', gap: '0.25rem' }}>
            <button
              type="button"
              onClick={() => setLanguage('tr')}
              className="btn"
              style={{
                padding: '0.25rem 0.5rem',
                background: language === 'tr' ? 'rgba(99, 102, 241, 0.25)' : 'rgba(255,255,255,0.05)',
                border: '1px solid var(--glass-border)',
                borderRadius: 10,
                color: 'var(--text-primary)',
                cursor: 'pointer',
                fontSize: '0.75rem',
                minHeight: 0,
              }}
            >
              {t('lang.tr')}
            </button>
            <button
              type="button"
              onClick={() => setLanguage('de')}
              className="btn"
              style={{
                padding: '0.25rem 0.5rem',
                background: language === 'de' ? 'rgba(99, 102, 241, 0.25)' : 'rgba(255,255,255,0.05)',
                border: '1px solid var(--glass-border)',
                borderRadius: 10,
                color: 'var(--text-primary)',
                cursor: 'pointer',
                fontSize: '0.75rem',
                minHeight: 0,
              }}
            >
              {t('lang.de')}
            </button>
          </div>
        </div>

        <nav className="sidebar-nav">
          <Link href="/" className={`nav-item ${isActive('/') ? 'active' : ''}`}>
            <LayoutDashboard size={20} />
            {t('nav.dashboard')}
          </Link>
          <Link href="/income" className={`nav-item ${isActive('/income') ? 'active' : ''}`}>
            <ArrowUpCircle size={20} />
            {t('nav.income')}
          </Link>
          <Link href="/expenses" className={`nav-item ${isActive('/expenses') ? 'active' : ''}`}>
            <ArrowDownCircle size={20} />
            {t('nav.expenses')}
          </Link>
          <Link href="/transactions" className={`nav-item ${isActive('/transactions') ? 'active' : ''}`}>
            <Receipt size={20} />
            {t('nav.transactions')}
          </Link>
          <Link href="/assistant" className={`nav-item ai ${isActive('/assistant') ? 'active' : ''}`}>
            <MessageCircle size={20} />
            {t('nav.assistant')}
          </Link>
          <Link href="/settings" className={`nav-item ${isActive('/settings') ? 'active' : ''}`}>
            <Settings size={20} />
            {t('nav.settings')}
          </Link>
        </nav>
      </aside>

      <main className="main-content">
        {/* Mobile / tablet top bar */}
        <header className="app-topbar">
          <Link href="/" className="brand" aria-label="FinansAI">FinansAI</Link>
          <div style={{ display: 'flex', gap: '0.35rem' }}>
            <button
              type="button"
              onClick={() => setLanguage('tr')}
              className={`lang-pill ${language === 'tr' ? 'active' : ''}`}
              aria-pressed={language === 'tr'}
            >
              {t('lang.tr')}
            </button>
            <button
              type="button"
              onClick={() => setLanguage('de')}
              className={`lang-pill ${language === 'de' ? 'active' : ''}`}
              aria-pressed={language === 'de'}
            >
              {t('lang.de')}
            </button>
          </div>
        </header>

        <AuthGate>{children}</AuthGate>
      </main>

      <MobileNav />
      <InstallPrompt />
    </div>
  )
}
