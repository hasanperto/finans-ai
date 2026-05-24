# FinansAI

Kişisel finans yönetim paneli — offline çalışan, kurulabilir bir PWA. Telefon, tablet ve masaüstünde çalışır. Veri tamamen cihazda (IndexedDB) tutulur; sunucu/bulut zorunluluğu yoktur.

- **Stack:** Next.js 16 (App Router, Turbopack), React 19, TypeScript, Recharts, lucide-react
- **Yerel veritabanı:** IndexedDB (Dexie)
- **Güvenlik:** İsteğe bağlı şifreli giriş (PBKDF2-SHA256, Web Crypto API)
- **Diller:** TR / DE
- **PWA:** manifest + service worker + install prompt + offline

## Geliştirme

```bash
npm install
npm run dev      # http://localhost:3000
npm run lint
npm run build
npm start        # prod sunucu
```

## Netlify'a deploy

1. Netlify'da yeni bir site oluşturun ve bu repoya bağlayın.
2. Build ayarları otomatik olarak `netlify.toml` üzerinden alınır:
   - Build command: `npm run build`
   - `@netlify/plugin-nextjs` çıktı yapısını ve yönlendirmeleri yönetir (publish dir el ile ayarlanmamalı).
   - Node sürümü 20.
3. İlk deploy sonrası şu yolları kontrol edin:
   - `https://<site>/manifest.json` → uygulama manifesti
   - `https://<site>/sw.js` → service worker (Cache-Control: max-age=0)
   - DevTools → Application → Manifest, Service Workers, Installability ✓

Lokal Netlify dry run (opsiyonel):
```bash
npm install -g netlify-cli
netlify build       # plugin'i çalıştırır
netlify dev         # Netlify Functions dahil önizleme
```

## PWA notları

- Service worker'da statik kabuk önbelleği + navigation için network-first, statikler için stale-while-revalidate.
- Cross-origin istekler (AI sağlayıcı, kur servisi) önbelleğe alınmaz.
- Yeni sürüm dağıtırken `public/sw.js` içindeki `VERSION` sabitini artırın → eski cache otomatik temizlenir.

## Veri ve gizlilik

- Tüm finansal veri tarayıcının IndexedDB'sinde (`finansai_db`) saklanır.
- localStorage'dan otomatik göç edilir (mevcut kullanıcılar için sıfır kesinti).
- Şifre ve gizli soru yanıtı PBKDF2-SHA256 (100k iter + salt) ile hash'lenmiş olarak saklanır.
- Cihazlar arası taşıma için: Ayarlar → Veri Yönetimi → **Yedek İndir** / **Yedeği İçe Aktar** (JSON v2).

## Senaryolar

- **Öğrenci** — burs, part-time, kira, market, ulaşım
- **Aile** — iki maaş, kredi, faturalar, çocuk, araç
- **Freelancer** — proje, retainer, yazılım, vergi (EUR)

## Lisans

Kişisel kullanım için.
