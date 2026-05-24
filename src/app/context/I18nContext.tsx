'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

export type Language = 'tr' | 'de'

type Dictionary = Record<string, string>

const translations: Record<Language, Dictionary> = {
  tr: {
    'lang.tr': 'TR',
    'lang.de': 'DE',
    'lang.label': 'Dil',

    'nav.dashboard': 'Genel Bakış',
    'nav.income': 'Gelirler',
    'nav.expenses': 'Giderler',
    'nav.transactions': 'İşlemler',
    'nav.assistant': 'AI Asistan',
    'nav.settings': 'Ayarlar',

    'common.add': 'Ekle',
    'common.cancel': 'İptal',
    'common.save': 'Kaydet',
    'common.edit': 'Düzenle',
    'common.delete': 'Sil',
    'common.confirm': 'Onayla',
    'common.update': 'Güncelle',
    'common.all': 'Tümü',
    'common.search': 'Ara',
    'common.download': 'İndir',
    'common.password': 'Şifre',
    'common.passwordRequired': 'Şifre gerekli',
    'common.wrongPassword': 'Yanlış şifre',
    'common.question': 'Gizli soru',
    'common.answer': 'Yanıt',
    'common.title': 'Başlık',
    'common.amount': 'Miktar',
    'common.category': 'Kategori',
    'common.categoryPlaceholder': 'Kategori seçin',
    'common.areYouSure': 'Emin misiniz?',
    'common.cannotUndo': 'Bu işlem geri alınamaz.',
    'common.note': 'Önemli Not',
    'common.active': 'Açık',
    'common.inactive': 'Kapalı',
    'common.new': 'Yeni',

    'recurring.title': 'Tekrar Periyodu',
    'recurring.daily': 'Günlük',
    'recurring.weekly': 'Haftalık',
    'recurring.monthly': 'Aylık',
    'recurring.yearly': 'Yıllık',
    'recurring.everyDay': 'Her gün',
    'recurring.everyWeek': 'Her hafta',
    'recurring.weekly7days': 'Haftalık (7 gün sonra)',
    'recurring.dayOfMonth': 'Ayın Günü',
    'recurring.dayOption': '{day}. gün',
    'recurring.monthlyOnDay': 'Ayın {day}. günü',
    'recurring.monthlyDefault': 'Ayın 1inde',
    'recurring.nextDateAuto': 'Sonraki tarih otomatik hesaplanır',
    'recurring.next': 'Sonraki',

    'dialog.delete.title': 'Silmek istediğinize emin misiniz?',
    'dialog.editPasswordPrompt': 'Kaydı düzenlemek için şifrenizi girin.',

    'auth.title': 'Giriş Koruması',
    'auth.enabled': 'Şifre ile giriş açık',
    'auth.enabledDesc': 'Uygulama açılışında şifre sorulur.',
    'auth.setPassword': 'Şifre belirle',
    'auth.changePassword': 'Şifreyi değiştir',
    'auth.newPassword': 'Yeni şifre',
    'auth.confirmPassword': 'Şifreyi onayla',
    'auth.questionPlaceholder': 'örn: İlk evcil hayvanımın adı?',
    'auth.answerPlaceholder': 'Yanıtınızı yazın',
    'auth.saveSecurity': 'Kaydet',
    'auth.unlockTitle': 'Giriş yap',
    'auth.unlockCta': 'Giriş',
    'auth.passwordPlaceholder': 'Şifrenizi girin',
    'auth.forgot': 'Şifremi unuttum',
    'auth.verifyAnswer': 'Yanıtı doğrula',
    'auth.wrongAnswer': 'Yanıt yanlış',
    'auth.resetTitle': 'Şifreyi sıfırla',
    'auth.resetCta': 'Sıfırla',

    'dashboard.title': 'Genel Bakış',
    'dashboard.subtitle': 'Finansal durumunuzun özeti',
    'dashboard.totalIncome': 'Toplam Gelir',
    'dashboard.totalExpense': 'Toplam Gider',
    'dashboard.netBalance': 'Net Bakiye',
    'dashboard.savingsRate': 'Tasarruf Oranı',
    'dashboard.recurringCount': '{count} tekrarlayan',
    'dashboard.chartIncomeVsExpense': 'Gelir vs Gider (Son 6 Ay)',
    'dashboard.chartExpenseDistribution': 'Gider Dağılımı',
    'dashboard.noExpenseYet': 'Henüz gider kaydı yok',
    'dashboard.noTransactionsYet': 'Henüz işlem kaydı yok',
    'dashboard.recentTransactions': 'Son İşlemler',
    'dashboard.viewAll': 'Tümünü gör →',
    'dashboard.askAi': 'AI’ya sor →',
    'dashboard.entries': 'işlem',

    'income.title': 'Gelirler',
    'income.subtitle': 'Gelir kaynaklarınız',
    'income.total': 'Toplam Gelir',
    'income.recurring': 'Tekrarla',
    'income.recurringIncome': 'Tekrarlayan Gelirler',
    'income.allRecords': 'Tüm Gelir Kayıtları',
    'income.empty': 'Henüz gelir kaydı yok',
    'income.newTitle': 'Yeni Gelir Ekle',
    'income.editTitle': 'Geliri Düzenle',
    'income.recurringNewTitle': 'Tekrarlayan Gelir Ekle',
    'income.titlePlaceholder': 'örn: Maaş',
    'income.categoryBreakdown': 'Kategori Dağılımı',
    'income.recurringMonthly': 'Tekrarlayan (Aylık):',
    'income.perYear': '{value}/yıl',

    'expenses.title': 'Giderler',
    'expenses.subtitle': 'Harcama kayıtlarınız',
    'expenses.total': 'Toplam Gider',
    'expenses.recurring': 'Tekrarla',
    'expenses.recurringExpenses': 'Tekrarlayan Giderler',
    'expenses.allRecords': 'Tüm Gider Kayıtları',
    'expenses.empty': 'Henüz gider kaydı yok',
    'expenses.newTitle': 'Yeni Gider Ekle',
    'expenses.editTitle': 'Gideri Düzenle',
    'expenses.recurringNewTitle': 'Tekrarlayan Gider Ekle',
    'expenses.titlePlaceholder': 'örn: Market',
    'expenses.categoryBreakdown': 'Kategori Dağılımı',

    'transactions.title': 'İşlemler',
    'transactions.records': '{count} kayıt',
    'transactions.searchPlaceholder': 'İşlem ara...',
    'transactions.exportCsv': 'CSV Olarak İndir',
    'transactions.notFound': 'Kayıt bulunamadı',
    'transactions.date.thisMonth': 'Bu Ay',
    'transactions.date.lastMonth': 'Geçen Ay',
    'transactions.date.last3months': 'Son 3 Ay',
    'transactions.date.last6months': 'Son 6 Ay',
    'transactions.date.all': 'Tümü',

    'assistant.title': 'AI Asistan',
    'assistant.subtitle.connected': '● {provider} bağlı',
    'assistant.subtitle.noKey': '⚠️ API anahtarı ayarlanmamış',
    'assistant.quickQuestions': 'Hızlı Sorular',
    'assistant.inputPlaceholder': 'Mesaj yazın...',
    'assistant.send': 'Gönder',
    'assistant.errorPrefix': '⚠️ ',
    'assistant.setupKeyError': 'API anahtarı ayarlanmamış. Lütfen Ayarlar > AI Ayarları bölümünden API anahtarınızı girin.',
    'assistant.endpointError': 'API endpoint bulunamadı.',

    'settings.title': 'Ayarlar',
    'settings.subtitle': 'FinansAI ayarlarını yönet',
    'settings.tab.currency': 'Para Birimi',
    'settings.tab.ai': 'AI Ayarları',
    'settings.tab.security': 'Güvenlik',
    'settings.tab.categories': 'Kategoriler',
    'settings.tab.budgets': 'Bütçeler',
    'settings.tab.reports': 'Raporlar',
    'settings.tab.data': 'Veri Yönetimi',

    'budget.title': 'Aylık Bütçeler',
    'budget.subtitle': 'Her gider kategorisi için aylık üst sınır belirleyin. %80\'e ulaşıldığında uyarılırsınız.',
    'budget.amount': 'Aylık limit',
    'budget.save': 'Kaydet',
    'budget.remove': 'Kaldır',
    'budget.empty': 'Henüz bütçe tanımlamadınız',
    'budget.spent': 'Harcanan',
    'budget.remaining': 'Kalan',
    'budget.exceeded': 'Aşıldı',
    'budget.dashboardTitle': 'Bütçe Durumu',
    'budget.exceededBanner': '{count} kategoride aylık bütçe aşıldı',
    'budget.warningBanner': '{count} kategoride bütçenin %80\'i geçildi',
    'budget.viewAll': 'Tümünü yönet →',
    'settings.data.backupTitle': 'Veri Yedekleme',
    'settings.data.backupDesc': 'Tüm verilerinizi JSON formatında indirin',
    'settings.data.backupBtn': 'Yedek İndir',
    'settings.data.scenariosTitle': 'Örnek Senaryolar',
    'settings.data.scenariosDesc': 'Tek tıkla örnek gelir/gider verileri yükleyin (mevcut verilerin üzerine yazar).',
    'settings.data.scenario.student': 'Öğrenci',
    'settings.data.scenario.family': 'Aile',
    'settings.data.scenario.freelancer': 'Freelance',
    'settings.data.dangerTitle': 'Sıfırla ve Sil',
    'settings.data.dangerDesc': 'Tüm verileri sil ve ayarları fabrika ayarlarına döndür. Bu işlem geri alınamaz.',
    'settings.data.resetBtn': 'Tüm Verileri Sıfırla',
    'settings.data.resetWarning': 'Tüm veriler silinecek ve ayarlar fabrika ayarlarına dönecek. Bu işlem geri alınamaz.',
    'settings.data.resetConfirm': 'Sıfırla',

    'settings.category.newTitle': 'Yeni Kategori',
    'settings.category.editTitle': 'Düzenle',
    'settings.category.namePlaceholder': 'örn: Market',
    'settings.category.nameLabel': 'Kategori Adı',

    'settings.ai.providerLabel': 'AI Sağlayıcı',
    'settings.ai.providerDesc': 'AI asistan için sağlayıcı ve API anahtarınızı seçin',
    'settings.ai.title': 'AI Yapılandırma',
    'settings.ai.apiKeyLabel': 'API Anahtarı',
    'settings.ai.authHeaderLabel': 'Auth Header / Token',
    'settings.ai.apiKeyPlaceholderDefault': '{provider} API anahtarınızı girin',
    'settings.ai.apiKeyPlaceholderCustom': 'Bearer sk-... veya API key',
    'settings.ai.customUrlLabel': 'API URL',
    'settings.ai.customUrlNote': 'OpenAI veya benzeri API formatı kullanın. URL sonunda /chat/completions olabilir.',
    'settings.ai.providerName.custom': 'Özel',
    'settings.ai.providerDesc.openrouter': 'Çoklu model',
    'settings.ai.providerDesc.custom': 'Manuel API',
    'settings.ai.storageNote': 'API anahtarınız tarayıcıda yerel olarak saklanır. Hiçbir yerde paylaşılmaz.',
  },
  de: {
    'lang.tr': 'TR',
    'lang.de': 'DE',
    'lang.label': 'Sprache',

    'nav.dashboard': 'Übersicht',
    'nav.income': 'Einnahmen',
    'nav.expenses': 'Ausgaben',
    'nav.transactions': 'Transaktionen',
    'nav.assistant': 'KI-Assistent',
    'nav.settings': 'Einstellungen',

    'common.add': 'Hinzufügen',
    'common.cancel': 'Abbrechen',
    'common.save': 'Speichern',
    'common.edit': 'Bearbeiten',
    'common.delete': 'Löschen',
    'common.confirm': 'Bestätigen',
    'common.update': 'Aktualisieren',
    'common.all': 'Alle',
    'common.search': 'Suchen',
    'common.download': 'Herunterladen',
    'common.password': 'Passwort',
    'common.passwordRequired': 'Passwort erforderlich',
    'common.wrongPassword': 'Falsches Passwort',
    'common.question': 'Sicherheitsfrage',
    'common.answer': 'Antwort',
    'common.title': 'Titel',
    'common.amount': 'Betrag',
    'common.category': 'Kategorie',
    'common.categoryPlaceholder': 'Kategorie auswählen',
    'common.areYouSure': 'Sind Sie sicher?',
    'common.cannotUndo': 'Diese Aktion kann nicht rückgängig gemacht werden.',
    'common.note': 'Wichtiger Hinweis',
    'common.active': 'Aktiv',
    'common.inactive': 'Inaktiv',
    'common.new': 'Neu',

    'recurring.title': 'Wiederholungszeitraum',
    'recurring.daily': 'Täglich',
    'recurring.weekly': 'Wöchentlich',
    'recurring.monthly': 'Monatlich',
    'recurring.yearly': 'Jährlich',
    'recurring.everyDay': 'Jeden Tag',
    'recurring.everyWeek': 'Jede Woche',
    'recurring.weekly7days': 'Wöchentlich (in 7 Tagen)',
    'recurring.dayOfMonth': 'Tag des Monats',
    'recurring.dayOption': '{day}. Tag',
    'recurring.monthlyOnDay': 'Am {day}. des Monats',
    'recurring.monthlyDefault': 'Am 1.',
    'recurring.nextDateAuto': 'Nächster Termin wird automatisch berechnet',
    'recurring.next': 'Nächste',

    'dialog.delete.title': 'Wirklich löschen?',
    'dialog.editPasswordPrompt': 'Bitte Passwort zum Bearbeiten eingeben.',

    'auth.title': 'Login-Schutz',
    'auth.enabled': 'Login mit Passwort aktiv',
    'auth.enabledDesc': 'Beim Start wird ein Passwort abgefragt.',
    'auth.setPassword': 'Passwort setzen',
    'auth.changePassword': 'Passwort ändern',
    'auth.newPassword': 'Neues Passwort',
    'auth.confirmPassword': 'Passwort bestätigen',
    'auth.questionPlaceholder': 'z.B.: Name meines ersten Haustiers?',
    'auth.answerPlaceholder': 'Antwort eingeben',
    'auth.saveSecurity': 'Speichern',
    'auth.unlockTitle': 'Anmelden',
    'auth.unlockCta': 'Anmelden',
    'auth.passwordPlaceholder': 'Passwort eingeben',
    'auth.forgot': 'Passwort vergessen',
    'auth.verifyAnswer': 'Antwort prüfen',
    'auth.wrongAnswer': 'Antwort ist falsch',
    'auth.resetTitle': 'Passwort zurücksetzen',
    'auth.resetCta': 'Zurücksetzen',

    'dashboard.title': 'Übersicht',
    'dashboard.subtitle': 'Zusammenfassung Ihrer Finanzen',
    'dashboard.totalIncome': 'Gesamteinnahmen',
    'dashboard.totalExpense': 'Gesamtausgaben',
    'dashboard.netBalance': 'Saldo',
    'dashboard.savingsRate': 'Sparquote',
    'dashboard.recurringCount': '{count} wiederkehrend',
    'dashboard.chartIncomeVsExpense': 'Einnahmen vs. Ausgaben (letzte 6 Monate)',
    'dashboard.chartExpenseDistribution': 'Ausgabenverteilung',
    'dashboard.noExpenseYet': 'Noch keine Ausgaben erfasst',
    'dashboard.noTransactionsYet': 'Noch keine Transaktionen',
    'dashboard.recentTransactions': 'Letzte Transaktionen',
    'dashboard.viewAll': 'Alle anzeigen →',
    'dashboard.askAi': 'KI fragen →',
    'dashboard.entries': 'Einträge',

    'income.title': 'Einnahmen',
    'income.subtitle': 'Ihre Einnahmequellen',
    'income.total': 'Gesamteinnahmen',
    'income.recurring': 'Wiederkehrend',
    'income.recurringIncome': 'Wiederkehrende Einnahmen',
    'income.allRecords': 'Alle Einnahmen',
    'income.empty': 'Noch keine Einnahmen erfasst',
    'income.newTitle': 'Neue Einnahme',
    'income.editTitle': 'Einnahme bearbeiten',
    'income.recurringNewTitle': 'Wiederkehrende Einnahme hinzufügen',
    'income.titlePlaceholder': 'z.B.: Gehalt',
    'income.categoryBreakdown': 'Kategorieverteilung',
    'income.recurringMonthly': 'Wiederkehrend (monatlich):',
    'income.perYear': '{value}/Jahr',

    'expenses.title': 'Ausgaben',
    'expenses.subtitle': 'Ihre Ausgaben',
    'expenses.total': 'Gesamtausgaben',
    'expenses.recurring': 'Wiederkehrend',
    'expenses.recurringExpenses': 'Wiederkehrende Ausgaben',
    'expenses.allRecords': 'Alle Ausgaben',
    'expenses.empty': 'Noch keine Ausgaben erfasst',
    'expenses.newTitle': 'Neue Ausgabe',
    'expenses.editTitle': 'Ausgabe bearbeiten',
    'expenses.recurringNewTitle': 'Wiederkehrende Ausgabe hinzufügen',
    'expenses.titlePlaceholder': 'z.B.: Einkauf',
    'expenses.categoryBreakdown': 'Kategorieverteilung',

    'transactions.title': 'Transaktionen',
    'transactions.records': '{count} Einträge',
    'transactions.searchPlaceholder': 'Transaktion suchen...',
    'transactions.exportCsv': 'Als CSV herunterladen',
    'transactions.notFound': 'Keine Einträge gefunden',
    'transactions.date.thisMonth': 'Dieser Monat',
    'transactions.date.lastMonth': 'Letzter Monat',
    'transactions.date.last3months': 'Letzte 3 Monate',
    'transactions.date.last6months': 'Letzte 6 Monate',
    'transactions.date.all': 'Alle',

    'assistant.title': 'KI-Assistent',
    'assistant.subtitle.connected': '● {provider} verbunden',
    'assistant.subtitle.noKey': '⚠️ API-Schlüssel nicht gesetzt',
    'assistant.quickQuestions': 'Schnellfragen',
    'assistant.inputPlaceholder': 'Nachricht schreiben...',
    'assistant.send': 'Senden',
    'assistant.errorPrefix': '⚠️ ',
    'assistant.setupKeyError': 'API-Schlüssel nicht gesetzt. Bitte unter Einstellungen > KI-Einstellungen eintragen.',
    'assistant.endpointError': 'API-Endpunkt nicht gefunden.',

    'settings.title': 'Einstellungen',
    'settings.subtitle': 'FinansAI konfigurieren',
    'settings.tab.currency': 'Währung',
    'settings.tab.ai': 'KI-Einstellungen',
    'settings.tab.security': 'Sicherheit',
    'settings.tab.categories': 'Kategorien',
    'settings.tab.budgets': 'Budgets',
    'settings.tab.reports': 'Berichte',
    'settings.tab.data': 'Daten',

    'budget.title': 'Monatliche Budgets',
    'budget.subtitle': 'Legen Sie eine monatliche Obergrenze pro Ausgabenkategorie fest. Bei 80% werden Sie gewarnt.',
    'budget.amount': 'Monatslimit',
    'budget.save': 'Speichern',
    'budget.remove': 'Entfernen',
    'budget.empty': 'Noch kein Budget definiert',
    'budget.spent': 'Ausgegeben',
    'budget.remaining': 'Verbleibend',
    'budget.exceeded': 'Überschritten',
    'budget.dashboardTitle': 'Budgetstatus',
    'budget.exceededBanner': '{count} Kategorien haben das Monatsbudget überschritten',
    'budget.warningBanner': 'In {count} Kategorien wurden 80% des Budgets erreicht',
    'budget.viewAll': 'Alle verwalten →',
    'settings.data.backupTitle': 'Datensicherung',
    'settings.data.backupDesc': 'Alle Daten als JSON herunterladen',
    'settings.data.backupBtn': 'Backup herunterladen',
    'settings.data.scenariosTitle': 'Beispiel-Szenarien',
    'settings.data.scenariosDesc': 'Mit einem Klick Beispieldaten laden (überschreibt bestehende Daten).',
    'settings.data.scenario.student': 'Student',
    'settings.data.scenario.family': 'Familie',
    'settings.data.scenario.freelancer': 'Freelancer',
    'settings.data.dangerTitle': 'Zurücksetzen & Löschen',
    'settings.data.dangerDesc': 'Alle Daten löschen und auf Werkseinstellungen zurücksetzen. Nicht rückgängig machbar.',
    'settings.data.resetBtn': 'Alle Daten zurücksetzen',
    'settings.data.resetWarning': 'Alle Daten werden gelöscht und Einstellungen zurückgesetzt. Diese Aktion kann nicht rückgängig gemacht werden.',
    'settings.data.resetConfirm': 'Zurücksetzen',

    'settings.category.newTitle': 'Neue Kategorie',
    'settings.category.editTitle': 'Bearbeiten',
    'settings.category.namePlaceholder': 'z.B.: Einkauf',
    'settings.category.nameLabel': 'Kategoriename',

    'settings.ai.providerLabel': 'KI-Anbieter',
    'settings.ai.providerDesc': 'Anbieter und API-Schlüssel für den KI-Assistenten wählen',
    'settings.ai.title': 'KI-Konfiguration',
    'settings.ai.apiKeyLabel': 'API-Schlüssel',
    'settings.ai.authHeaderLabel': 'Auth-Header / Token',
    'settings.ai.apiKeyPlaceholderDefault': '{provider} API-Schlüssel eingeben',
    'settings.ai.apiKeyPlaceholderCustom': 'Bearer sk-... oder API-Key',
    'settings.ai.customUrlLabel': 'API URL',
    'settings.ai.customUrlNote': 'OpenAI-kompatibles API-Format verwenden. Die URL kann auf /chat/completions enden.',
    'settings.ai.providerName.custom': 'Eigener',
    'settings.ai.providerDesc.openrouter': 'Mehrere Modelle',
    'settings.ai.providerDesc.custom': 'Manuelle API',
    'settings.ai.storageNote': 'Ihr API-Schlüssel wird nur lokal im Browser gespeichert. Wird nirgends geteilt.',
  },
}

type I18nContextValue = {
  language: Language
  setLanguage: (l: Language) => void
  t: (key: string, params?: Record<string, string | number>) => string
}

const I18nContext = createContext<I18nContextValue | null>(null)

function interpolate(template: string, params?: Record<string, string | number>) {
  if (!params) return template
  return Object.entries(params).reduce((acc, [k, v]) => acc.replaceAll(`{${k}}`, String(v)), template)
}

export function I18nProvider({ children }: { children: ReactNode }) {
  // Initial state stays SSR-safe; we hydrate from localStorage in an effect.
  const [language, setLanguageState] = useState<Language>('tr')

  useEffect(() => {
    try {
      const saved = localStorage.getItem('finansai_lang') as Language | null
      if (saved === 'de' || saved === 'tr') setLanguageState(saved)
    } catch {}
  }, [])

  const setLanguage = useCallback((l: Language) => {
    setLanguageState(l)
    try {
      localStorage.setItem('finansai_lang', l)
    } catch {}
  }, [])

  useEffect(() => {
    document.documentElement.lang = language
  }, [language])

  const t = useCallback((key: string, params?: Record<string, string | number>) => {
    const dict = translations[language]
    return interpolate(dict[key] ?? key, params)
  }, [language])

  const value = useMemo(() => ({ language, setLanguage, t }), [language, setLanguage, t])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('I18nContext missing')
  return ctx
}
