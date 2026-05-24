'use client'

import { useCurrency } from '../context/CurrencyContext'
import { ChevronDown } from 'lucide-react'
import { useState } from 'react'

export default function CurrencySelector() {
  const { currency, setCurrency, currencies } = useCurrency()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.5rem 1rem',
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid var(--glass-border)',
          borderRadius: '10px',
          color: 'var(--text-primary)',
          cursor: 'pointer',
          fontSize: '0.9rem'
        }}
      >
        <span style={{ fontSize: '1.1rem' }}>{currencies[currency].symbol}</span>
        <span>{currency}</span>
        <ChevronDown size={16} />
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: '0.5rem',
            background: 'var(--bg-card)',
            border: '1px solid var(--glass-border)',
            borderRadius: '12px',
            padding: '0.5rem',
            minWidth: '200px',
            zIndex: 100,
            boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
          }}
        >
          {Object.entries(currencies).map(([key, info]) => (
            <button
              key={key}
              onClick={() => {
                setCurrency(key as keyof typeof currencies)
                setIsOpen(false)
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                width: '100%',
                padding: '0.75rem',
                background: currency === key ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                border: 'none',
                borderRadius: '8px',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <span style={{ fontSize: '1.25rem' }}>{info.symbol}</span>
              <div>
                <div style={{ fontWeight: 500 }}>{key}</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{info.name}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}