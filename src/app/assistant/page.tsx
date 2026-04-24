'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Loader2, Sparkles, Zap } from 'lucide-react'

interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
}

const quickQuestions = [
  { text: 'Sigara harcamamı nasıl azaltabilirim?', emoji: '🚬' },
  { text: 'Aylık ₺5.000 tasarruf hedefi için öneri', emoji: '🎯' },
  { text: 'En iyi yatırım seçenekleri neler?', emoji: '📈' },
  { text: 'Bütçemi nasıl optimize ederim?', emoji: '⚡' },
]

// Financial context that would be sent to AI
const financialContext = {
  monthlyIncome: 58000,
  monthlyExpenses: 32000,
  savingsRate: 44.8,
  topExpenses: [
    { category: 'Kira', amount: 15000, percent: 47 },
    { category: 'Gıda', amount: 8000, percent: 25 },
    { category: 'Ulaşım', amount: 4500, percent: 14 },
  ],
  recentTransactions: 15,
  goal: 'Aylık %30 tasarruf oranı hedefi'
}

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Merhaba! 👋 Ben FinansAI asistanınızım. 

Finansal durumunuzu analiz edebilir, tasarruf önerileri sunabilir ve bütçe planlamasında size yardımcı olabilirim.

**Mevcut Durumunuz:**
- Aylık Gelir: ₺58.000
- Aylık Gider: ₺32.000  
- Tasarruf Oranı: %44.8
- Hedef: %30 tasarruf

Size nasıl yardımcı olabilirim?`
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (text?: string) => {
    const messageText = text || input
    if (!messageText.trim() || isLoading) return

    // Add user message
    const userMessage: Message = { role: 'user', content: messageText }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    // Simulate AI response (in real app, this would call an API)
    setTimeout(() => {
      let response = ''
      
      if (messageText.includes('sigara') || messageText.includes('kötü alışkanlık')) {
        response = `🚬 Sigara harcamalarınızı azaltmak için size birkaç önerim var:

1. **Günlük limit belirleyin** - Günde maksimum ₺50 gibi bir limit
2. **Alternatif bulun** - Paranın yetmediğini hissettiğinizde nane, çiklet gibi alternatifler
3. **Bütçe kesintisi yapın** - Sigara için ₺1.500 gibi bir bütçe ayırın, fazlası için "hayır" deyin
4. **Hedef bağlayın** - Biriktirdiğiniz parayla yatırım hesabı açın

Bu ay sigaraya ₺1.200 harcadığınızı varsayarsak, yıllık tasarruf potansiyeliniz: **₺14.400**

Başka sorularınız var mı?`
      } else if (messageText.includes('tasarruf') || messageText.includes('biriktir')) {
        response = `🎯 ${financialContext.goal} için harika bir strateji:

**Kısa Vadeli (1-3 Ay):**
- Gereksiz abonelikleri iptal et → ₺500/ay
- Market harcamalarını %20 azalt → ₺1.600/ay
- Dışarı yemek yerine evde pişir → ₺800/ay

**Orta Vadeli (3-6 Ay):**
- Ek gelir kaynağı oluştur (freelance)
- Yatırım hesabı aç - faiz getirisi
- 6 ay emergency fund biriktir

**Hedefe Ulaşmak İçin:**
Mevcut tasarruf oranınız %44.8. Hedefinize ulaşmak için ₺2.800 daha biriktirmeniz gerekiyor.

Başarılar! 💪`
      } else if (messageText.includes('yatırım') || messageText.includes('yatirim')) {
        response = `📈 Mevcut finansal durumunuza göre yatırım önerileri:

**Düşük Risk (Tasarruf Hesabı, Devlet Tahvili)**
- Getiri: %15-20 yıllık
- Önerilen süre: 1-2 yıl
- Avantaj: Güvenli, likit

**Orta Risk (Borsa, ETF)**
- Getiri: %20-30 potansiyel (uzun vadede)
- Önerilen: ABD borsa ETF'leri (VOO, VTI)
- Dezavantaj: Kısa vadede dalgalı

**Yüksek Risk (Kripto, Spekülatif)**
- Sadece kaybetmeyi göze aldığınız para ile
- Maximum portföyün %5-10'u

**Önerim:** 
Şu an %44.8 tasarruf oranınız var. Bunun ₺10.000'ini düşük riskli yatırıma, ₺5.000'ini orta riskli yatırıma yönlendirebilirsiniz.`
      } else if (messageText.includes('bütçe') || messageText.includes('butce') || messageText.includes('optimiz')) {
        response = `⚡ Bütçenizi optimize etmek için:

**Mevcut Durum Analizi:**
- Gelir: ₺58.000
- Gider: ₺32.000
- Net: ₺26.000 (tasarruf edilebilir)

**Optimizasyon Önerileri:**

| kategori | Mevcut | Önerilen | Tasarruf |
|----------|--------|----------|----------|
| Kira | ₺15.000 | ₺12.000 | +₺3.000 |
| Gıda | ₺8.000 | ₺6.500 | +₺1.500 |
| Abonelik | ₺1.000 | ₺500 | +₺500 |
| **Toplam** | | | **+₺5.000** |

Bu değişikliklerle aylık tasarrufunuzu ₺26.000 → ₺31.000'e çıkarabilirsiniz!`
      } else {
        response = `Anladım! Finansal sorularınızı yanıtlamaktan mutluluk duyarım.

Şu konularda yardımcı olabilirim:
- 📊 Bütçe analizi ve optimizasyonu
- 🎯 Tasarruf hedefleri belirleme
- 💰 Yatırım önerileri
- 📉 Harcama kesinti önerileri
- 📈 Finansal hedeflere ulaşma stratejileri

Biraz daha spesifik olursanız daha detaylı yardımcı olabilirim. 🤔`
      }

      const assistantMessage: Message = { role: 'assistant', content: response }
      setMessages(prev => [...prev, assistantMessage])
      setIsLoading(false)
    }, 1500)
  }

  return (
    <div className="container">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: 'linear-gradient(135deg, #6366f1, #818cf8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles size={24} color="white" />
          </div>
          <div>
            <h1 className="page-title">AI Asistan</h1>
            <p className="page-subtitle">Finansal kararlarınızda size rehberlik ediyorum</p>
          </div>
        </div>
      </div>

      {/* Quick Questions */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem' }}>
        <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Zap size={14} />
          Hızlı Sorular
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {quickQuestions.map((q, i) => (
            <button
              key={i}
              onClick={() => handleSend(q.text)}
              style={{ 
                padding: '0.5rem 1rem', 
                borderRadius: 20, 
                background: 'rgba(99, 102, 241, 0.1)', 
                border: '1px solid rgba(99, 102, 241, 0.3)',
                color: '#a5b4fc',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem'
              }}
            >
              <span>{q.emoji}</span>
              {q.text}
            </button>
          ))}
        </div>
      </div>

      {/* Chat */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 20rem)', padding: 0 }}>
        {/* Messages */}
        <div style={{ flex: 1, overflow: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
            placeholder="Finansal bir soru sorun..."
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
