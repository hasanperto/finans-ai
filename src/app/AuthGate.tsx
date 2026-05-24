'use client'

import { useEffect, useMemo, useState } from 'react'
import { useData } from './context/DataContext'
import { useI18n } from './context/I18nContext'

const UNLOCK_KEY = 'finansai_unlocked_v1'

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { settings, setCredentials, verifyPassword, verifySecurityAnswer } = useData()
  const { t } = useI18n()

  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [unlocked, setUnlocked] = useState(false)
  const [mode, setMode] = useState<'login' | 'forgot' | 'reset'>('login')
  const [answer, setAnswer] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [newPassword2, setNewPassword2] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    try {
      const v = sessionStorage.getItem(UNLOCK_KEY)
      setUnlocked(v === '1')
    } catch {
      setUnlocked(false)
    }
  }, [])

  useEffect(() => {
    if (!settings.authEnabled) {
      setUnlocked(true)
      try {
        sessionStorage.removeItem(UNLOCK_KEY)
      } catch {}
      return
    }
    setError('')
  }, [settings.authEnabled])

  const shouldLock = useMemo(() => settings.authEnabled && !unlocked, [settings.authEnabled, unlocked])

  if (!shouldLock) return <>{children}</>

  const onUnlock = async () => {
    if (busy) return
    setError('')
    setBusy(true)
    try {
      const ok = await verifyPassword(password)
      if (!ok) {
        setError(t('common.wrongPassword'))
        return
      }
      setUnlocked(true)
      try { sessionStorage.setItem(UNLOCK_KEY, '1') } catch {}
    } finally {
      setBusy(false)
    }
  }

  const onVerifyAnswer = async () => {
    if (busy) return
    setError('')
    setBusy(true)
    try {
      const ok = await verifySecurityAnswer(answer)
      if (!ok) {
        setError(t('auth.wrongAnswer'))
        return
      }
      setMode('reset')
      setError('')
    } finally {
      setBusy(false)
    }
  }

  const onResetPassword = async () => {
    if (busy) return
    setError('')
    if (!newPassword || newPassword !== newPassword2) {
      setError(t('common.wrongPassword'))
      return
    }
    setBusy(true)
    try {
      await setCredentials({ password: newPassword })
      setPassword(newPassword)
      setMode('login')
      setAnswer('')
      setNewPassword('')
      setNewPassword2('')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="modal-overlay" style={{ zIndex: 10001 }}>
      <div style={{ width: '100%', maxWidth: 440, background: 'var(--bg-card)', border: '1px solid var(--glass-border)', borderRadius: 18, padding: '1.5rem' }}>
        <h2 style={{ marginBottom: '0.5rem' }}>{t('auth.unlockTitle')}</h2>
        <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.25rem' }}>{t('auth.enabledDesc')}</p>

        {mode === 'login' && (
          <>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'block', marginBottom: '0.5rem' }}>{t('common.password')}</label>
              <input className="chat-input" type="password" value={password} onChange={(e) => { setPassword(e.target.value); setError('') }} placeholder={t('auth.passwordPlaceholder')} style={{ width: '100%' }} onKeyDown={(e) => { if (e.key === 'Enter') void onUnlock() }} />
            </div>
            {error && <div style={{ color: 'var(--danger)', fontSize: '0.85rem', marginBottom: '1rem' }}>{error}</div>}
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', alignItems: 'center' }}>
              <button className="btn btn-secondary" type="button" onClick={() => { setMode('forgot'); setError('') }}>{t('auth.forgot')}</button>
              <button className="btn btn-primary" type="button" onClick={() => void onUnlock()} disabled={busy}>{t('auth.unlockCta')}</button>
            </div>
          </>
        )}

        {mode === 'forgot' && (
          <>
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.5rem' }}>{t('common.question')}</div>
              <div style={{ padding: '0.75rem 1rem', borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--glass-border)' }}>
                {settings.securityQuestion || '—'}
              </div>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'block', marginBottom: '0.5rem' }}>{t('common.answer')}</label>
              <input className="chat-input" type="text" value={answer} onChange={(e) => { setAnswer(e.target.value); setError('') }} placeholder={t('auth.answerPlaceholder')} style={{ width: '100%' }} onKeyDown={(e) => { if (e.key === 'Enter') void onVerifyAnswer() }} />
            </div>
            {error && <div style={{ color: 'var(--danger)', fontSize: '0.85rem', marginBottom: '1rem' }}>{error}</div>}
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem' }}>
              <button className="btn btn-secondary" type="button" onClick={() => { setMode('login'); setAnswer(''); setError('') }}>{t('common.cancel')}</button>
              <button className="btn btn-primary" type="button" onClick={() => void onVerifyAnswer()} disabled={busy}>{t('auth.verifyAnswer')}</button>
            </div>
          </>
        )}

        {mode === 'reset' && (
          <>
            <h3 style={{ marginTop: '0.5rem', marginBottom: '1rem' }}>{t('auth.resetTitle')}</h3>
            <div style={{ marginBottom: '0.75rem' }}>
              <label style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'block', marginBottom: '0.5rem' }}>{t('auth.newPassword')}</label>
              <input className="chat-input" type="password" value={newPassword} onChange={(e) => { setNewPassword(e.target.value); setError('') }} style={{ width: '100%' }} />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'block', marginBottom: '0.5rem' }}>{t('auth.confirmPassword')}</label>
              <input className="chat-input" type="password" value={newPassword2} onChange={(e) => { setNewPassword2(e.target.value); setError('') }} style={{ width: '100%' }} />
            </div>
            {error && <div style={{ color: 'var(--danger)', fontSize: '0.85rem', marginBottom: '1rem' }}>{error}</div>}
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem' }}>
              <button className="btn btn-secondary" type="button" onClick={() => { setMode('login'); setError('') }}>{t('common.cancel')}</button>
              <button className="btn btn-primary" type="button" onClick={() => void onResetPassword()} disabled={busy}>{t('auth.resetCta')}</button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
