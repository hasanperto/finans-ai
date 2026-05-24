'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Loader2, Sparkles, Zap } from 'lucide-react'
import { useData, type Transaction } from '../context/DataContext'
import { useCurrency } from '../context/CurrencyContext'
import { useI18n } from '../context/I18nContext'

interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
}

// Get provider-specific endpoint
function getProviderEndpoint(provider: string, apiUrl: string) {
  switch (provider) {
    case 'gemini':
      return `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=`
    case 'openai':
      return 'https://api.openai.com/v1/chat/completions'
    case 'minimax':
      return 'https://api.minimax.chat/v1/text/chatcompletion_v2'
    case 'openrouter':
      return 'https://openrouter.ai/api/v1/chat/completions'
    case 'custom':
      return apiUrl || ''
    default:
      return ''
  }
}

function buildFinancialSummary(transactions: Transaction[]) {
  const now = new Date()
  const thisMonth = transactions.filter(t => {
    const d = new Date(t.date)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  })
  
  const income = thisMonth.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const expense = Math.abs(thisMonth.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0))
  const balance = income - expense
  const savingsRate = income > 0 ? ((balance / income) * 100).toFixed(1) : '0'
  
  // Category breakdown
  const expenseCategories = thisMonth.filter(t => t.type === 'expense').reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + Math.abs(t.amount)
    return acc
  }, {} as Record<string, number>)
  
  const topExpenses = (Object.entries(expenseCategories) as [string, number][])
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([category, amount]) => ({
      category,
      amount,
      percent: expense > 0 ? ((amount / expense) * 100).toFixed(1) : '0'
    }))
  
  return {
    income,
    expense,
    balance,
    savingsRate,
    topExpenses,
    transactionCount: thisMonth.length,
  }
}

export default function AssistantPage() {
  const { transactions, settings } = useData()
  const { formatMoney } = useCurrency()
  const { language, t } = useI18n()
  
  const financialSummary = buildFinancialSummary(transactions)
  const providerLabel = settings.aiProvider
  
  const [messages, setMessages] = useState<Message[]>(() => {
    const header = language === 'de'
      ? `Hallo! Ich bin Ihr FinansAI Assistent.`
      : `Merhaba! Ben FinansAI asistanınızım.`
    const body = language === 'de'
      ? `\n\nIch kann Ihre Finanzen analysieren, Sparvorschläge machen und beim Budget helfen.`
      : `\n\nFinansal durumunuzu analiz edebilir, tasarruf önerileri sunabilir ve bütçe planlamasında size yardımcı olabilirim.`
    const summaryTitle = language === 'de' ? `\n\nAktueller Stand:` : `\n\nMevcut Durumunuz:`
    const summaryLines = [
      language === 'de' ? `- Monatliche Einnahmen: ${formatMoney(financialSummary.income)}` : `- Aylık Gelir: ${formatMoney(financialSummary.income)}`,
      language === 'de' ? `- Monatliche Ausgaben: ${formatMoney(financialSummary.expense)}` : `- Aylık Gider: ${formatMoney(financialSummary.expense)}`,
      language === 'de' ? `- Sparquote: %${financialSummary.savingsRate}` : `- Tasarruf Oranı: %${financialSummary.savingsRate}`,
      language === 'de' ? `- Übrig: ${formatMoney(financialSummary.balance)}` : `- Kalan: ${formatMoney(financialSummary.balance)}`,
      language === 'de' ? `\n${financialSummary.transactionCount} Einträge vorhanden.` : `\n${financialSummary.transactionCount} işlem kayıtlı.`,
      language === 'de' ? `\nWie kann ich helfen?` : `\nSize nasıl yardımcı olabilirim?`,
    ].join('\n')
    return [{ role: 'assistant', content: `${header}${body}${summaryTitle}\n${summaryLines}` }]
  })
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const callAI = async (userMessage: string) => {
    const { aiProvider, aiApiKey, aiApiUrl } = settings
    
    if (!aiApiKey) {
      throw new Error(t('assistant.setupKeyError'))
    }
    
    const endpoint = getProviderEndpoint(aiProvider, aiApiUrl)
    if (!endpoint) {
      throw new Error(t('assistant.endpointError'))
    }
    
    // Build context with financial data
    const context = `Sen bir finansal danışman asistanısın. Kullanıcının finansal verileri:
- Aylık Gelir: ${formatMoney(financialSummary.income)}
- Aylık Gider: ${formatMoney(financialSummary.expense)}
- Net Bakiye: ${formatMoney(financialSummary.balance)}
- Tasarruf Oranı: %${financialSummary.savingsRate}
- Toplam İşlem: ${financialSummary.transactionCount}

En yüksek gider kategorileri:
${financialSummary.topExpenses.map(e => `- ${e.category}: ${formatMoney(e.amount)} (%${e.percent})`).join('\n')}

Kullanıcı sorusu: ${userMessage}`
    
    if (aiProvider === 'gemini') {
      // Google Gemini
      const response = await fetch(`${endpoint}${aiApiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: context }] }]
        })
      })
      const data = await response.json()
      return data.candidates?.[0]?.content?.parts?.[0]?.text || 'Yanıt alınamadı'
    } else if (aiProvider === 'openai' || aiProvider === 'openrouter' || aiProvider === 'minimax' || aiProvider === 'custom') {
      // OpenAI compatible
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${aiApiKey}`
        },
        body: JSON.stringify({
          model: aiProvider === 'openai' ? 'gpt-4' : 'default',
          messages: [
            { role: 'system', content: 'Sen FinansAI asistanısın. Türkçe ve finans konusunda uzman yanıtlar ver.' },
            { role: 'user', content: context }
          ],
          max_tokens: 1000,
          temperature: 0.7
        })
      })
      const data = await response.json()
      return data.choices?.[0]?.message?.content || 'Yanıt alınamadı'
    }
    
    return language === 'de' ? 'Keine Antwort' : 'Yanıt alınamadı'
  }

  const handleSend = async (text?: string) => {
    const messageText = text || input
    if (!messageText.trim() || isLoading) return

    const userMessage: Message = { role: 'user', content: messageText }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)
    setError('')

    try {
      const response = await callAI(messageText)
      const assistantMessage: Message = { role: 'assistant', content: response }
      setMessages(prev => [...prev, assistantMessage])
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : (language === 'de' ? 'Ein Fehler ist aufgetreten' : 'Bir hata oluştu')
      setError(message)
      const errorMessage: Message = { 
        role: 'assistant', 
        content: `${t('assistant.errorPrefix')}${message}` 
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const quickQuestions = [
    { text: language === 'de' ? 'Analysiere meine Finanzen' : 'Finansal durumumu analiz et', emoji: '📊' },
    { text: language === 'de' ? 'Welche Spartipps habe ich?' : 'Tasarruf önerilerim neler?', emoji: '💰' },
    { text: language === 'de' ? 'Optimiere mein Budget' : 'Bütçemi optimize et', emoji: '⚡' },
    { text: language === 'de' ? 'Was sind meine größten Ausgaben?' : 'En yüksek giderlerim hangileri?', emoji: '📉' },
  ]

  return (
    <div className="container">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: 'linear-gradient(135deg, #6366f1, #818cf8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles size={24} color="white" />
          </div>
          <div>
            <h1 className="page-title">{t('assistant.title')}</h1>
            <p className="page-subtitle">
              {settings.aiApiKey ? (
                <span style={{ color: '#10b981' }}>{t('assistant.subtitle.connected', { provider: providerLabel })}</span>
              ) : (
                <span style={{ color: '#ef4444' }}>{t('assistant.subtitle.noKey')}</span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Questions */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem' }}>
        <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Zap size={14} />
          {t('assistant.quickQuestions')}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {quickQuestions.map((q, i) => (
            <button
              key={i}
              onClick={() => handleSend(q.text)}
              disabled={isLoading}
              style={{ 
                padding: '0.5rem 1rem', 
                borderRadius: 20, 
                background: 'rgba(99, 102, 241, 0.1)', 
                border: '1px solid rgba(99, 102, 241, 0.3)',
                color: '#a5b4fc',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.5 : 1,
              }}
            >
              <span>{q.emoji}</span>
              {q.text}
            </button>
          ))}
        </div>
      </div>

      {/* Chat */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 22rem)', padding: 0 }}>
        {/* Messages */}
        <div style={{ flex: 1, overflow: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {error && (
            <div style={{ padding: '0.75rem 1rem', border: '1px solid rgba(239, 68, 68, 0.35)', background: 'rgba(239, 68, 68, 0.08)', borderRadius: 12, color: '#fca5a5' }}>
              {t('assistant.errorPrefix')}{error}
            </div>
          )}
          {messages.map((msg, i) => (
            <div key={i} style={{ display: 'flex', gap: '0.75rem', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
              {msg.role !== 'user' && (
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #818cf8)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Bot size={18} color="white" />
                </div>
              )}
              <div style={{ 
                maxWidth: '70%', 
                padding: '1rem 1.25rem', 
                borderRadius: 16, 
                background: msg.role === 'user' ? 'var(--primary)' : 'var(--bg-card)',
                border: msg.role === 'user' ? 'none' : '1px solid var(--glass-border)',
                color: msg.role === 'user' ? 'white' : 'var(--text-primary)',
                borderBottomRightRadius: msg.role === 'user' ? 4 : 16,
                borderBottomLeftRadius: msg.role === 'user' ? 16 : 4,
                lineHeight: 1.6,
                whiteSpace: 'pre-wrap'
              }}>
                {msg.content}
              </div>
              {msg.role === 'user' && (
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--bg-card)', border: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <User size={18} color="#64748b" />
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #818cf8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Bot size={18} color="white" />
              </div>
              <div style={{ padding: '1rem 1.25rem', borderRadius: 16, background: 'var(--bg-card)', border: '1px solid var(--glass-border)' }}>
                <Loader2 size={20} className="animate-spin" style={{ color: '#6366f1' }} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} style={{ display: 'flex', gap: '0.75rem', padding: '1.5rem', borderTop: '1px solid var(--glass-border)' }}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t('assistant.inputPlaceholder')}
            className="chat-input"
            disabled={isLoading}
          />
          <button type="submit" className="btn btn-primary" disabled={isLoading || !input.trim()} style={{ padding: '0.75rem 1.25rem' }}>
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  )
}
