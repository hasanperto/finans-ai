'use client'

import { DataProvider } from './context/DataContext'
import { CurrencyProvider } from './context/CurrencyContext'
import { I18nProvider } from './context/I18nContext'

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <I18nProvider>
      <DataProvider>
        <CurrencyProvider>{children}</CurrencyProvider>
      </DataProvider>
    </I18nProvider>
  )
}

