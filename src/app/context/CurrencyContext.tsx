'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { useData, type Currency } from './DataContext'
import { useI18n } from './I18nContext'

type CurrencyInfo = {
  symbol: string
  names: { tr: string; de: string }
  rate: number // For equivalent TL calculation in reports
}

const currencyInfo: Record<Currency, CurrencyInfo> = {
  TRY: { symbol: '₺', names: { tr: 'Türk Lirası', de: 'Türkische Lira' }, rate: 1 },
  EUR: { symbol: '€', names: { tr: 'Euro', de: 'Euro' }, rate: 35 },
  USD: { symbol: '$', names: { tr: 'Dolar', de: 'US-Dollar' }, rate: 32 },
  GBP: { symbol: '£', names: { tr: 'İngiliz Sterlini', de: 'Britisches Pfund' }, rate: 42 },
  CHF: { symbol: 'Fr', names: { tr: 'İsviçre Frangı', de: 'Schweizer Franken' }, rate: 37 },
  SILBER: { symbol: '🪙', names: { tr: 'Silber', de: 'Silber' }, rate: 22 },
  GOLD: { symbol: '🏆', names: { tr: 'Gold', de: 'Gold' }, rate: 2200 },
}

type RatesToTRY = Record<Currency, number>

const defaultRatesToTRY: RatesToTRY = Object.fromEntries(
  (Object.entries(currencyInfo) as [Currency, CurrencyInfo][])
    .map(([k, v]) => [k, v.rate])
) as RatesToTRY

const FX_CACHE_KEY = 'finansai_fx_rates_v1'
const FX_CACHE_MAX_AGE_MS = 6 * 60 * 60 * 1000

interface CurrencyContextType {
  currency: Currency
  setCurrency: (c: Currency) => void
  formatMoney: (amount: number) => string
  formatMoneyRaw: (amount: number) => string // Without conversion
  getEquivalentTL: (amount: number) => number
  currencies: Record<Currency, { symbol: string; name: string; rate: number }>
}

const CurrencyContext = createContext<CurrencyContextType>({
  currency: 'TRY',
  setCurrency: () => {},
  formatMoney: (n) => n.toString(),
  formatMoneyRaw: (n) => n.toString(),
  getEquivalentTL: (n) => n,
  currencies: Object.fromEntries(Object.entries(currencyInfo).map(([k, v]) => [k, { symbol: v.symbol, name: v.names.tr, rate: v.rate }])) as Record<Currency, { symbol: string; name: string; rate: number }>,
})

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const { settings, updateSettings } = useData()
  const { language } = useI18n()
  const [ratesToTRY, setRatesToTRY] = useState<RatesToTRY>(defaultRatesToTRY)

  useEffect(() => {
    let cancelled = false
    const now = Date.now()

    const loadCache = () => {
      try {
        const raw = localStorage.getItem(FX_CACHE_KEY)
        if (!raw) return null
        const parsed = JSON.parse(raw) as { updatedAt?: number; ratesToTRY?: Partial<Record<Currency, number>> }
        if (!parsed || typeof parsed !== 'object') return null
        if (typeof parsed.updatedAt !== 'number') return null
        if (!parsed.ratesToTRY || typeof parsed.ratesToTRY !== 'object') return null
        return parsed as { updatedAt: number; ratesToTRY: Partial<Record<Currency, number>> }
      } catch {
        return null
      }
    }

    const cached = loadCache()
    if (cached?.ratesToTRY) {
      setRatesToTRY(prev => ({ ...prev, ...cached.ratesToTRY }))
    }

    const shouldFetch = !cached || now - cached.updatedAt > FX_CACHE_MAX_AGE_MS
    if (!shouldFetch) return

    const fetchRates = async () => {
      try {
        const res = await fetch('https://api.frankfurter.app/latest?from=EUR&to=TRY,USD,GBP,CHF')
        if (!res.ok) return
        const data = (await res.json()) as { rates?: Record<string, number> }

        const eurToTry = data?.rates?.TRY
        const eurToUsd = data?.rates?.USD
        const eurToGbp = data?.rates?.GBP
        const eurToChf = data?.rates?.CHF

        if (!eurToTry || !eurToUsd || !eurToGbp || !eurToChf) return
        if (typeof eurToTry !== 'number' || typeof eurToUsd !== 'number' || typeof eurToGbp !== 'number' || typeof eurToChf !== 'number') return
        if (eurToTry <= 0 || eurToUsd <= 0 || eurToGbp <= 0 || eurToChf <= 0) return

        const next: Partial<Record<Currency, number>> = {
          TRY: 1,
          EUR: eurToTry,
          USD: eurToTry / eurToUsd,
          GBP: eurToTry / eurToGbp,
          CHF: eurToTry / eurToChf,
        }

        if (cancelled) return
        setRatesToTRY(prev => ({ ...prev, ...next }))

        try {
          localStorage.setItem(FX_CACHE_KEY, JSON.stringify({ updatedAt: now, ratesToTRY: next }))
        } catch {}
      } catch {}
    }

    fetchRates()

    return () => {
      cancelled = true
    }
  }, [])
  
  const value = useMemo(() => ({
    currency: settings.currency,
    setCurrency: (c: Currency) => updateSettings({ currency: c }),
    // Show amount with currency symbol - no conversion, just format
    formatMoney: (amount: number) => {
      const info = currencyInfo[settings.currency]
      const absAmount = Math.abs(amount)
      const sign = amount < 0 ? '-' : ''
      if (settings.currency === 'SILBER' || settings.currency === 'GOLD') {
        return `${sign}${info.symbol}${absAmount.toFixed(2)}`
      }
      return `${sign}${info.symbol}${absAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    },
    // Raw format without currency symbol (just number)
    formatMoneyRaw: (amount: number) => {
      return Math.abs(amount).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    },
    // Convert to TL equivalent for reports
    getEquivalentTL: (amount: number) => {
      return amount * (ratesToTRY[settings.currency] ?? currencyInfo[settings.currency].rate)
    },
    currencies: Object.fromEntries(
      (Object.entries(currencyInfo) as [Currency, CurrencyInfo][])
        .map(([k, v]) => [k, { symbol: v.symbol, name: v.names[language], rate: ratesToTRY[k] ?? v.rate }])
    ) as Record<Currency, { symbol: string; name: string; rate: number }>,
  }), [settings.currency, updateSettings, language, ratesToTRY])

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  )
}

export const useCurrency = () => useContext(CurrencyContext)
