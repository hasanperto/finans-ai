'use client'

import { useEffect, useState } from 'react'
import { Download, X } from 'lucide-react'
import { useI18n } from '../context/I18nContext'

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const DISMISS_KEY = 'finansai_install_dismissed_v1'

export default function InstallPrompt() {
  const { language } = useI18n()
  const [evt, setEvt] = useState<BeforeInstallPromptEvent | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.matchMedia?.('(display-mode: standalone)').matches) return
    try {
      if (localStorage.getItem(DISMISS_KEY) === '1') return
    } catch {}

    const onPrompt = (e: Event) => {
      e.preventDefault()
      setEvt(e as BeforeInstallPromptEvent)
      setVisible(true)
    }
    window.addEventListener('beforeinstallprompt', onPrompt)
    return () => window.removeEventListener('beforeinstallprompt', onPrompt)
  }, [])

  if (!visible || !evt) return null

  const dismiss = () => {
    setVisible(false)
    try { localStorage.setItem(DISMISS_KEY, '1') } catch {}
  }

  const install = async () => {
    try {
      await evt.prompt()
      await evt.userChoice
    } catch {}
    setVisible(false)
  }

  return (
    <div className="install-prompt" role="dialog" aria-live="polite">
      <Download size={20} style={{ color: 'var(--primary-light)', flexShrink: 0 }} />
      <div style={{ flex: 1, fontSize: '0.85rem', lineHeight: 1.4 }}>
        {language === 'de'
          ? 'FinansAI als App installieren?'
          : 'FinansAI uygulamasını yükle?'}
      </div>
      <button onClick={install} className="btn btn-primary" style={{ padding: '0.4rem 0.75rem', minHeight: 36, fontSize: '0.8rem' }}>
        {language === 'de' ? 'Installieren' : 'Yükle'}
      </button>
      <button onClick={dismiss} aria-label="dismiss" style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4 }}>
        <X size={18} />
      </button>
    </div>
  )
}
