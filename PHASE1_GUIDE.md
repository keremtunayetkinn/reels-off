# Faz 1 Implementation Guide — Claude Code İçin

> **Bu dosya Claude Code'a verilmek üzere hazırlanmıştır.** Eklentinin Faz 1 aşamasını (proje iskeleti + Manifest V3 temeli + yasal belgelendirme) doğru, eksiksiz ve önceki fazlardaki kararlarla tutarlı şekilde tamamlamak için kullanılır.

---

## 0. Bu Dokümanı Nasıl Kullanmalısın

1. Bu dokümanı baştan sona oku, herhangi bir adıma başlamadan **tamamını anla**.
2. Bölüm 5'teki **Sıkı Kısıtlamalar**'ı her aksiyon öncesi zihninde tut.
3. Bölüm 7'deki **Kullanıcıya Sormadan Yapma Listesi**'nde olanları istersen iş bırak, kullanıcıya sor.
4. Her görevi tamamladıktan sonra Bölüm 8'deki **Doğrulama** adımlarını çalıştır.
5. Şüpheye düştüğün, doğrulayamadığın hiçbir karar için varsayım yapma — kullanıcıya sor.
6. Bu dokümanın dışında bir karar/eklenti/optimizasyon yapma. Faz 1'in kapsamı bilinçli olarak dar — Faz 2-13 sonra gelecek.

---

## 1. Proje Bağlamı

**Proje:** Instagram'ın web arayüzünde Reels ve algoritmik dikkat dağıtıcı içerikleri gizleyen, Chrome + Firefox MV3 tarayıcı eklentisi.

**Sahibi:** Kerem Tuna.

**Telif Yılı:** 2026.

**Yayın hedefi:** Chrome Web Store + Mozilla Add-ons (AMO), Türkçe ve İngilizce dil destekli.

**Tek amaç (single purpose statement — Web Store gereği):**
> "Instagram web arayüzünde Reels ve algoritmik içerik önerilerini gizleyerek kullanıcının dikkat dağıtıcı içeriklere maruz kalmasını azaltır."

Bu cümle eklentinin tüm yaşam döngüsündeki sınırı belirler. Faz 2-13 boyunca eklentiye eklenecek hiçbir özellik bu kapsamın dışına çıkmamalı.

**Hedef teknik özellikleri:**
- Manifest V3 (Chrome ve Firefox uyumlu)
- Vanilla JavaScript (framework, transpiler, bundler yok)
- CSS-first engelleme stratejisi
- Polling-based URL redirect (JS, izole world)
- chrome.storage.local (sync değil, veri akışı yok)
- Hiçbir network çağrısı, hiçbir telemetri, hiçbir analitik
- Türkçe varsayılan dil, İngilizce fallback

---

## 2. Mimari Kararlar (Non-Negotiable)

Bu kararlar Faz 0 araştırmaları sonucunda kesinleşmiştir. Bunları **sorgulama** veya **iyileştirme** girişiminde bulunma. Aksi belirtilmedikçe, bu kararlar geçerlidir.

| Karar | Gerekçe |
|-------|---------|
| **Vanilla JS, framework yok** | React/Vue/jQuery yok. Bağımlılık = saldırı yüzeyi. |
| **Bundler yok** | Webpack/Vite/Parcel yok. Web Store reviewer kaynak kodu okuyor — minify edilmiş kod şüphe çeker. |
| **npm dependencies yok** | `package.json` opsiyonel. Eğer eklersen sadece devDependencies (ESLint, Prettier) olabilir. |
| **href-first seçici stratejisi** | Instagram class isimleri obfuscated (`x1qjc9v5`, `_aaa1`); href routing kararlı. |
| **chrome.storage.local** | sync değil. Veri Google sunucularına gönderilmez = privacy policy daha temiz. |
| **CSP: `script-src 'self'; object-src 'none'; base-uri 'none';`** | `unsafe-inline`, `unsafe-eval`, external URL'ler YASAK. |
| **host_permissions: tek bir entry** | `["https://www.instagram.com/*"]`. `<all_urls>` YASAK. |
| **permissions: boş başla** | İhtiyaç ortaya çıktıkça ekle. `storage`, `tabs`, `activeTab`, `webNavigation` Faz 1'de YASAK. |
| **No remote code** | MV3 zaten yasaklıyor ama bilinçli ol: CDN script yükleme, dinamik kod execution, `eval`, `new Function()` yok. |
| **No build step** | Dosyaları doğrudan kullanılır halde tut. `npm run build` yok. |
| **Source not minified** | Web Store reviewer için şeffaf kalsın. |

---

## 3. Faz 0 Çıktıları (Referans)

Faz 0'da Instagram DOM'u haritalandı. Faz 1 manifest'inin `content_scripts.matches` pattern'i ve gelecek fazların seçicileri bu bulgulara dayanıyor.

**Doğrulanmış seçiciler (Faz 2-4'te kullanılacak):**

| ID | Element | Seçici |
|----|---------|--------|
| A1 | Sidebar Reels linki | `a[href="/reels/"]` |
| A2 | Sidebar Keşfet linki (opsiyonel) | `a[href="/explore/"]` |
| D1 | Profil Reels tab | `main a[href$="/reels/"]:not([href="/reels/"])` |
| G1 | Feed'e gömülü tekil Reel post'ları | `a[href^="/reels/"]:not([href="/reels/"])` |

**URL redirect hedefleri (Faz 2'de JS polling ile):**

| ID | URL pattern | Aksiyon |
|----|-------------|---------|
| E1 | `/explore/*` | `location.replace('/')` (opsiyonel, user toggle) |
| F1 | `/reels/` ve `/reels/<id>/` | `location.replace('/')` |
| F1' | `/<username>/reels/` (profil Reels feed) | `location.replace('/' + username)` |

**Faz 1 için önemli not:** Yukarıdaki seçiciler/URL pattern'leri Faz 1'de **henüz implement edilmiyor**. Faz 1'de sadece bunların yer alacağı placeholder dosyaları oluşturulacak.

---

## 4. Faz 1 Görev Listesi

Görevleri **sıralı** yap. Her adımdan sonra Bölüm 8'deki doğrulama prosedürünü çalıştır.

### Görev 4.1 — Kullanıcıdan gerekli bilgileri topla

Aşağıdakileri sormadan başlama:

1. **Eklenti adı (Türkçe ve İngilizce)** — örnek: "Sakin Instagram" / "Calm Instagram", "Reels Off" / "Reels Kapalı", "Mola" / "Pause". Bu ad hem manifest'te, hem README'de, hem privacy policy'de geçecek.
2. **Eklenti açıklaması (Türkçe ve İngilizce, en fazla ~130 karakter)** — Single purpose statement'ın kısa hali. Web Store listing'de görünür.
3. **Kullanıcının GitHub kullanıcı adı** — README'de repo URL'i için.
4. **Kullanıcının iletişim email'i** — privacy policy'de görünecek. Spam riski varsa burner email kullanmasını öner.
5. **Firefox Android desteği istiyor mu?** — Evet ise manifest'e `gecko_android: {}` ekleyeceğiz.

**Kullanıcıya bu listeyi tek bir mesajda sor.** Her bir bilgiyi ayrı sorma — vakti boşa harcama.

### Görev 4.2 — Git repo'sunu başlat ve klasör yapısını oluştur

```bash
git init
mkdir -p src/content src/popup src/_locales/tr src/_locales/en src/icons docs
touch src/content/.gitkeep src/popup/.gitkeep src/icons/.gitkeep docs/.gitkeep
```

Bu komutlar ile klasör iskeleti hazır olmalı. `.gitkeep` dosyaları boş klasörlerin git'te takip edilebilmesi için.

**Beklenen yapı:**
```
proje-kök/
├── src/
│   ├── content/         (Faz 2-4'te dolacak)
│   ├── popup/           (Faz 5'te dolacak)
│   ├── _locales/
│   │   ├── tr/
│   │   └── en/
│   └── icons/           (Faz 10'da dolacak)
├── docs/
│   ├── selectors.md     (Faz 0'dan kullanıcı sağlayacak)
│   └── threat-model.md  (Faz 0'dan kullanıcı sağlayacak)
├── manifest.json
├── LICENSE
├── README.md
├── PRIVACY-TR.md
├── PRIVACY-EN.md
├── .gitignore
├── .eslintrc.json
└── .prettierrc.json
```

### Görev 4.3 — .gitignore oluştur

Bölüm 6.1'deki şablonu birebir kullan.

### Görev 4.4 — manifest.json oluştur

Bölüm 6.2'deki şablonu birebir kullan. `[KULLANICI_*]` placeholder'larını Görev 4.1'de toplanan bilgilerle doldur.

**Gecko ID formatı:** `@extension-slug.kerem-tuna` örneğin `@sakin-instagram.kerem-tuna` veya `@reels-off.kerem-tuna`. Slug, eklenti adının lowercase kebab-case versiyonu. **GERÇEK EMAIL KULLANMA** — formatı email-like ama içeriği herhangi bir string olabilir.

### Görev 4.5 — _locales dosyalarını oluştur

Bölüm 6.7 (`src/_locales/tr/messages.json`) ve Bölüm 6.8 (`src/_locales/en/messages.json`) şablonlarını kullan.

### Görev 4.6 — LICENSE oluştur

Bölüm 6.3'teki MIT lisansı şablonunu kullan. Yıl: 2026. İsim: Kerem Tuna.

### Görev 4.7 — PRIVACY-TR.md ve PRIVACY-EN.md oluştur

Bölüm 6.5 ve 6.6'daki şablonları **birebir** kullan. Kendinden hiçbir madde ekleme, çıkarma. Email placeholder'ını Görev 4.1'den gelen değerle doldur.

### Görev 4.8 — README.md oluştur

Bölüm 6.4'teki şablonu kullan.

### Görev 4.9 — ESLint ve Prettier config'lerini oluştur

Bölüm 6.9 ve 6.10'daki şablonları kullan. **Not:** Bu config'ler vanilla JS için. Eğer kullanıcı npm kurulumu yapmak istemezse, bu config dosyaları sadece referans olarak kalır (gelecekte projeye geliştirici katılırsa kullanılır).

### Görev 4.10 — İlk commit'i at

```bash
git add -A
git commit -m "Initial scaffold: Phase 1 (project skeleton + manifest + legal docs)"
```

Branch ismi `main` olmalı. `master` değil.

---

## 5. Sıkı Kısıtlamalar (DO NOT)

Bu listede olan hiçbir şeyi yapma — kullanıcı açıkça istemedikçe ve sebebini açıklamadıkça.

### Kategori: Bağımlılık
- ❌ `npm install <herhangi-bir-paket>` çalıştırma — sadece ESLint/Prettier için kullanıcı izin verirse.
- ❌ `package.json` oluştururken `dependencies` ekleme — sadece `devDependencies` izinli.
- ❌ React, Vue, Svelte, jQuery, Lodash, Axios, Moment, vb. herhangi bir kütüphane ekleme.
- ❌ Webpack, Vite, Parcel, Rollup, esbuild gibi bundler kurma.
- ❌ TypeScript ekleme — bu vanilla JS projesi.

### Kategori: Manifest
- ❌ `permissions: ["storage", "tabs", "activeTab", "webNavigation", "cookies", "scripting"]` — hiçbiri Faz 1'de gerekmez.
- ❌ `host_permissions: ["<all_urls>"]` — sadece `["https://www.instagram.com/*"]`.
- ❌ CSP'de `'unsafe-inline'`, `'unsafe-eval'`, `data:`, `https:` — sadece `'self'`.
- ❌ MV2 alanlarını ekleme: `browser_action`, `page_action`, `background.scripts` (page) — bunlar MV3'te yasak.
- ❌ `web_accessible_resources` Faz 1'de gerekmez.

### Kategori: Kod
- ❌ Inline script (`<script>...</script>` veya `onclick="..."`) — CSP zaten engeller, ama yazma.
- ❌ `eval()`, `new Function()`, `setTimeout(string)` — ASLA.
- ❌ `innerHTML`, `outerHTML`, `insertAdjacentHTML`, `document.write` — `textContent` veya `createElement` kullan.
- ❌ External font, CDN script, external image — hiçbir dış kaynak.
- ❌ Telemetri, analitik, error reporting — hiç.

### Kategori: Privacy Policy
- ❌ Olmayan özellikler için clause ekleme ("we may collect..." gibi cümleler bizim için geçerli değil).
- ❌ Generic template'lerden direkt kopyalama — özellikle Termly, Privacy Policies dot com gibi servislerden.
- ❌ "Üçüncü taraflarla paylaşırız" tipi cümleler — bizim policy'mizde "hiçbir veri toplanmaz" net olmalı.

### Kategori: README
- ❌ Marketing dili ("amazing", "powerful", "next-gen"). Teknik dokümantasyon tonu.
- ❌ Olmayan özelliklerden bahsetme.
- ❌ Build instructions ekleme — proje vanilla, build yok.

### Kategori: Genel
- ❌ Faz 2-13 kapsamındaki dosyaları doldurma. Boş placeholder'lar OK, içerik HAYIR.
- ❌ Test yazma — Faz 10'da yapılacak.
- ❌ CI/CD config (GitHub Actions, vb.) — Faz 13'te düşünülür.
- ❌ Docker, container — gereksiz.

---

## 6. Dosya Şablonları

Aşağıdaki şablonları **birebir** kullan. Yorum eklemen gereken yerler `<!-- ... -->` veya `// ...` ile işaretlendi.

### 6.1 — `.gitignore`

```gitignore
# OS
.DS_Store
Thumbs.db
desktop.ini

# Editor
.vscode/
.idea/
*.swp
*.swo
*~

# Build artifacts (gelecekte gerekirse)
dist/
build/
*.zip
*.crx
*.xpi

# Node (gelecekte ESLint/Prettier kurulursa)
node_modules/
package-lock.json
yarn.lock
pnpm-lock.yaml

# Logs
*.log
npm-debug.log*

# Environment
.env
.env.local
.env.*.local

# Test (Faz 10)
coverage/
.nyc_output/
```

### 6.2 — `manifest.json`

**⚠️ Bu dosyayı oluştururken `[KULLANICI_*]` placeholder'larını Görev 4.1'de topladığın bilgilerle doldur. Hiçbir alan boş kalmasın.**

```json
{
  "manifest_version": 3,
  "name": "__MSG_extName__",
  "description": "__MSG_extDescription__",
  "version": "0.1.0",
  "default_locale": "tr",

  "icons": {
    "16": "src/icons/icon-16.png",
    "32": "src/icons/icon-32.png",
    "48": "src/icons/icon-48.png",
    "128": "src/icons/icon-128.png"
  },

  "host_permissions": [
    "https://www.instagram.com/*"
  ],

  "content_scripts": [
    {
      "matches": ["https://www.instagram.com/*"],
      "css": ["src/content/block.css"],
      "js": ["src/content/redirect.js"],
      "run_at": "document_start"
    }
  ],

  "action": {
    "default_popup": "src/popup/popup.html",
    "default_title": "__MSG_extName__",
    "default_icon": {
      "16": "src/icons/icon-16.png",
      "32": "src/icons/icon-32.png"
    }
  },

  "content_security_policy": {
    "extension_pages": "script-src 'self'; object-src 'none'; base-uri 'none';"
  },

  "browser_specific_settings": {
    "gecko": {
      "id": "[KULLANICI_GECKO_ID]",
      "strict_min_version": "140.0",
      "data_collection_permissions": {
        "required": ["none"]
      }
    }
  }
}
```

**Notlar:**
- `content_scripts.css` ve `content_scripts.js` Faz 2'de doldurulacak boş dosyalara işaret ediyor. Bu dosyaları aşağıdaki Görev 4.4 sonunda boş olarak oluştur:
  - `src/content/block.css` — sadece bu yorumu içersin: `/* Faz 2-4'te doldurulacak */`
  - `src/content/redirect.js` — sadece bu yorumu içersin: `// Faz 2'de doldurulacak`
- `action.default_popup` da boş bir HTML'e işaret ediyor:
  - `src/popup/popup.html` — minimal boilerplate (aşağıda)
- Gecko Android desteği isteniyorsa, `browser_specific_settings.gecko_android: {}` ekle (Görev 4.1'de sor).
- `web_accessible_resources` ekleme — Faz 1'de gerekmez.

**Placeholder popup.html (Faz 5'te değişecek):**
```html
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <title></title>
  <link rel="stylesheet" href="popup.css">
</head>
<body>
  <!-- Faz 5'te doldurulacak -->
  <script src="popup.js"></script>
</body>
</html>
```

**Placeholder popup.css ve popup.js:**
- `src/popup/popup.css` — `/* Faz 5'te doldurulacak */`
- `src/popup/popup.js` — `// Faz 5'te doldurulacak`

### 6.3 — `LICENSE`

```
MIT License

Copyright (c) 2026 Kerem Tuna

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

### 6.4 — `README.md`

**`[KULLANICI_*]` placeholder'larını Görev 4.1 verisiyle doldur.**

```markdown
# [KULLANICI_EKLENTI_ADI_TR] / [KULLANICI_EKLENTI_ADI_EN]

> Instagram web arayüzünde Reels ve algoritmik içerik önerilerini gizleyen, gizlilik odaklı bir tarayıcı eklentisi.

## Ne yapar

- Sol kenar çubuğundaki Reels bağlantısını gizler
- Profil sayfasındaki Reels sekmesini gizler
- Ana akışa gömülü tekil Reels gönderilerini gizler
- `/reels/` ve `/reels/<id>/` URL'lerine erişimi engelleyip ana sayfaya yönlendirir
- Tüm ayarlar yerel olarak saklanır; hiçbir veri sunucuya gönderilmez

## Ne yapmaz

- Kullanıcı kimlik bilgilerine erişmez
- Instagram'ın API'sine bağlanmaz, yalnızca sayfa görünümünü değiştirir
- Hiçbir veri toplamaz, hiçbir analitik göndermez
- Otomatik beğeni, takip etme veya etkileşim yapmaz

## Kurulum

### Chrome
1. Chrome Web Store sayfasından yükleyin: *(yayınlandığında eklenecek)*

### Firefox
1. Mozilla Add-ons sayfasından yükleyin: *(yayınlandığında eklenecek)*

### Geliştirici modunda yükleme (yayın öncesi)
1. Bu repo'yu klonlayın
2. Chrome'da: `chrome://extensions/` → "Geliştirici modu" → "Paketlenmemiş öğe yükle" → repo klasörünü seçin
3. Firefox'ta: `about:debugging#/runtime/this-firefox` → "Geçici Eklenti Yükle" → `manifest.json` dosyasını seçin

## Teknik bilgi

- **Manifest:** V3 (Chrome ve Firefox uyumlu)
- **Bağımlılık:** Yok (vanilla JS)
- **İzin:** Sadece `https://www.instagram.com/*` host izni
- **Depolama:** `chrome.storage.local` (yerel cihaz)
- **Veri akışı:** Yok — eklenti hiçbir sunucuya veri göndermez

## Lisans

MIT — bkz. [LICENSE](./LICENSE).

## Gizlilik

Hiçbir kullanıcı verisi toplanmaz. Detay için [PRIVACY-TR.md](./PRIVACY-TR.md) ([English](./PRIVACY-EN.md)).

## Geliştirme aşamaları

Bu proje fazlar halinde geliştirilmektedir. Mevcut durum: **Faz 1 (Proje iskeleti)**.

## Geri bildirim

Hata bildirimleri ve özellik istekleri için: GitHub Issues ([KULLANICI_GITHUB_REPO_URL]).
İletişim: [KULLANICI_EMAIL]
```

### 6.5 — `PRIVACY-TR.md`

**`[KULLANICI_EMAIL]` ve `[KULLANICI_EKLENTI_ADI_TR]` placeholder'larını doldur.**

```markdown
# Gizlilik Politikası — [KULLANICI_EKLENTI_ADI_TR]

**Son güncelleme:** 2026

## Özet

Bu eklenti **hiçbir kişisel veri toplamaz, işlemez veya iletmez.** Hiçbir analitik, telemetri veya kullanıcı takibi mekanizması içermez. Tüm ayarlar yalnızca kullanıcının kendi cihazında, tarayıcı yerel depolamasında saklanır.

## Toplanmayan veriler

Eklenti aşağıdaki veri türlerinin **hiçbirini** toplamaz, kaydetmez veya iletmez:
- Kişisel kimlik bilgileri (ad, e-posta, telefon, adres)
- Kimlik doğrulama bilgileri (şifre, oturum jetonu, çerez)
- Konum verisi
- Web tarama geçmişi
- Kullanıcı etkinlikleri (tıklama, kaydırma, görüntüleme)
- Cihaz veya tarayıcı kimlik bilgisi
- Instagram hesap içeriği (gönderiler, mesajlar, takipçi listesi)

## Yerel depolama

Eklentinin tek depoladığı bilgi, kullanıcının açıp kapattığı engelleme özelliklerinin tercihleridir (boolean değerler). Bu veriler:
- `chrome.storage.local` API'si üzerinden **yalnızca kullanıcının cihazında** saklanır
- Hiçbir sunucuya gönderilmez
- Hiçbir üçüncü tarafla paylaşılmaz
- Eklenti kaldırıldığında tamamen silinir

## İzinler

Eklenti yalnızca aşağıdaki izni kullanır:
- **`https://www.instagram.com/*` (host izni):** Eklentinin Instagram web sayfalarında çalışıp Reels ve önerilen içerikleri gizleyebilmesi için gereklidir. Eklenti yalnızca bu siteye erişir, başka hiçbir siteye değil.

## Üçüncü taraflar

Eklenti hiçbir üçüncü taraf hizmetiyle entegre değildir. Hiçbir CDN, hiçbir harici script, hiçbir analitik servis kullanılmaz.

## Veri saklama ve silme

Toplanan veri olmadığı için saklama veya silme prosedürü yoktur. Eklenti kaldırıldığında tüm yerel ayarlar tarayıcı tarafından otomatik olarak silinir.

## Çocukların gizliliği

Eklenti yaş kısıtlaması olmaksızın kullanılabilir, ancak Instagram'ın kendi yaş kuralları geçerlidir. Eklenti çocuklardan veya yetişkinlerden bilinçli olarak hiçbir veri toplamaz.

## Değişiklikler

Bu gizlilik politikası eklentinin gelişimine paralel olarak güncellenebilir. Önemli değişiklikler bu sayfada ve eklentinin GitHub repo'sunda duyurulur.

## İletişim

Gizlilikle ilgili sorular için: **[KULLANICI_EMAIL]**

## Yasal Uyumluluk

Bu eklenti veri toplamadığı için GDPR (Genel Veri Koruma Yönetmeliği), CCPA (Kaliforniya Tüketici Gizlilik Yasası) ve KVKK (Kişisel Verilerin Korunması Kanunu) kapsamındaki veri işleme yükümlülükleri otomatik olarak karşılanır.
```

### 6.6 — `PRIVACY-EN.md`

```markdown
# Privacy Policy — [KULLANICI_EKLENTI_ADI_EN]

**Last updated:** 2026

## Summary

This extension **does not collect, process, or transmit any personal data.** It includes no analytics, telemetry, or user tracking mechanisms. All settings are stored exclusively on the user's own device in browser local storage.

## Data not collected

The extension does **not** collect, store, or transmit any of the following data types:
- Personally identifiable information (name, email, phone, address)
- Authentication information (passwords, session tokens, cookies)
- Location data
- Web browsing history
- User activity (clicks, scrolls, views)
- Device or browser identification
- Instagram account content (posts, messages, follower lists)

## Local storage

The only information the extension stores is the user's preferences for blocking features (boolean values). This data:
- Is stored exclusively on the user's device via the `chrome.storage.local` API
- Is never sent to any server
- Is never shared with any third party
- Is fully deleted when the extension is uninstalled

## Permissions

The extension uses only the following permission:
- **`https://www.instagram.com/*` (host permission):** Required for the extension to operate on Instagram web pages and hide Reels and recommended content. The extension accesses only this site, no other.

## Third parties

The extension is not integrated with any third-party services. No CDN, no external scripts, no analytics services are used.

## Data retention and deletion

Since no data is collected, no retention or deletion procedure applies. When the extension is uninstalled, all local settings are automatically deleted by the browser.

## Children's privacy

The extension can be used without age restrictions, though Instagram's own age rules apply. The extension knowingly collects no data from children or adults.

## Changes

This privacy policy may be updated alongside the extension's development. Important changes will be announced on this page and in the extension's GitHub repository.

## Contact

For privacy-related questions: **[KULLANICI_EMAIL]**

## Legal Compliance

Because this extension collects no data, it automatically satisfies data processing obligations under GDPR (General Data Protection Regulation), CCPA (California Consumer Privacy Act), and KVKK (Turkish Personal Data Protection Law).
```

### 6.7 — `src/_locales/tr/messages.json`

```json
{
  "extName": {
    "message": "[KULLANICI_EKLENTI_ADI_TR]",
    "description": "Eklentinin adı (mağaza ve tarayıcıda görünür)."
  },
  "extDescription": {
    "message": "[KULLANICI_AÇIKLAMA_TR]",
    "description": "Eklentinin kısa açıklaması (mağaza listingi)."
  }
}
```

### 6.8 — `src/_locales/en/messages.json`

```json
{
  "extName": {
    "message": "[KULLANICI_EKLENTI_ADI_EN]",
    "description": "Extension name (visible in store and browser)."
  },
  "extDescription": {
    "message": "[KULLANICI_AÇIKLAMA_EN]",
    "description": "Short description of the extension (store listing)."
  }
}
```

**Önemli not:** Bu dosyalar Faz 1'de minimum 2 key içerir (`extName`, `extDescription`). Faz 5'te popup UI eklenince genişleyecek. **Faz 1'de bunlardan başka key EKLEME.**

### 6.9 — `.eslintrc.json`

```json
{
  "env": {
    "browser": true,
    "es2022": true,
    "webextensions": true
  },
  "extends": "eslint:recommended",
  "parserOptions": {
    "ecmaVersion": 2022,
    "sourceType": "script"
  },
  "rules": {
    "no-eval": "error",
    "no-implied-eval": "error",
    "no-new-func": "error",
    "no-script-url": "error",
    "no-var": "error",
    "prefer-const": "error",
    "eqeqeq": ["error", "always"],
    "no-console": ["warn", { "allow": ["warn", "error"] }],
    "no-unused-vars": "warn",
    "no-undef": "error"
  }
}
```

### 6.10 — `.prettierrc.json`

```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "es5",
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

---

## 7. Kullanıcıya Sormadan Yapma Listesi

Aşağıdakileri **mutlaka** kullanıcıya sor, varsayım yapma:

1. ❓ Eklenti adı (TR + EN) — Görev 4.1
2. ❓ Eklenti kısa açıklaması (TR + EN) — Görev 4.1
3. ❓ GitHub kullanıcı adı — Görev 4.1
4. ❓ İletişim email'i — Görev 4.1
5. ❓ Firefox Android desteği — Görev 4.1
6. ❓ ESLint/Prettier kurulsun mu? — Eğer kullanıcı `npm` kullanmak istemiyorsa config dosyaları sadece referans olarak kalır.
7. ❓ Bu repo public mı private mı başlatılacak? — `gh repo create` komutu kullanılacaksa.
8. ❓ Mevcut bir GitHub repo'sunu mu kullanacak yoksa yeni mi oluşturacak?

**Bu listede olmayan hiçbir şeyi sorma — Bölüm 6'daki şablonları olduğu gibi kullan.**

---

## 8. Faz Sonrası Doğrulama

### 8.1 — Manifest doğrulama
```bash
# JSON syntax check
cat manifest.json | python3 -m json.tool > /dev/null && echo "✓ JSON valid"

# Yasaklı izin var mı?
grep -E '"(storage|tabs|activeTab|webNavigation|cookies|scripting|<all_urls>)"' manifest.json && echo "✗ HATA: yasaklı izin" || echo "✓ İzinler temiz"

# CSP içinde unsafe var mı?
grep -E "unsafe-(inline|eval)" manifest.json && echo "✗ HATA: CSP unsafe" || echo "✓ CSP temiz"

# data_collection_permissions var mı?
grep "data_collection_permissions" manifest.json && echo "✓ Firefox uyumlu" || echo "✗ HATA: gecko data_collection_permissions eksik"
```

### 8.2 — Klasör yapısı doğrulama
```bash
ls -la src/ docs/
test -d src/content && test -d src/popup && test -d src/_locales/tr && test -d src/_locales/en && test -d src/icons && echo "✓ Klasör yapısı doğru"
```

### 8.3 — Locale dosyaları doğrulama
```bash
# TR ve EN'de aynı key'ler var mı?
diff <(jq 'keys' src/_locales/tr/messages.json) <(jq 'keys' src/_locales/en/messages.json) && echo "✓ Locale key'leri eşleşiyor"
```

### 8.4 — Yasaklı bağımlılık kontrolü
```bash
test ! -f package.json || (grep -E '"(react|vue|angular|jquery|webpack|vite|parcel)"' package.json && echo "✗ HATA: yasaklı bağımlılık" || echo "✓ Bağımlılık temiz")
```

### 8.5 — Chrome'da yükleme testi
1. Chrome'u aç → `chrome://extensions/` → "Geliştirici modu"'nu aç
2. "Paketlenmemiş öğe yükle" → repo klasörünü seç
3. Eklenti yüklenirse ✓. Hata mesajı varsa kullanıcıya raporla.

### 8.6 — Firefox'ta yükleme testi (opsiyonel — Firefox 140+ gerekir)
1. Firefox aç → `about:debugging#/runtime/this-firefox`
2. "Geçici Eklenti Yükle" → `manifest.json` seç
3. Eklenti yüklenirse ✓.

### 8.7 — Git durumu
```bash
git log --oneline
# En az bir commit olmalı: "Initial scaffold: Phase 1..."

git status
# Working tree clean olmalı (commit'ten sonra)
```

---

## 9. Halüsinasyon Önleme Kuralları

Bu projede halüsinasyon riskini minimize etmek için:

### Kural 1: Verbatim Şablon Kullanımı
Bölüm 6'daki şablonları **harfiyen** kopyala. Tek harf değiştirme. Tek satır ekleme. Tek alan çıkarma. "İyileştirme" yapma.

### Kural 2: Placeholder'ları Açık Bırak
Bilgisi olmayan placeholder'lara `[KULLANICI_X]` ile bırak ve kullanıcıya sor. Asla "muhtemelen bu olmalı" diye doldurma.

### Kural 3: Bilmediğin MV3 Field'ı Ekleme
Bu doküman dışında bir MV3 alanı eklemek istiyorsan **DUR**. Önce kullanıcıya sor. MV3 spesifikasyonu Anthropic eğitim verisinden eski olabilir.

### Kural 4: Sürüm Bilgilerini Sorgula
Eğer "şu Firefox sürümü, şu Chrome sürümü" tarzı bir bilgi vermen gerekiyorsa, **kaynak alıntıla**. Bu dokümandaki sürüm numaraları (Firefox 140, Chrome MV3 Manifest V2 fully removed) doğrulanmıştır.

### Kural 5: Generic Privacy Policy'den Uzak Dur
PRIVACY-TR.md ve PRIVACY-EN.md kasıtlı olarak minimaldir. "Bunu da ekleyelim, şu da olsun" deme — şablon birebir kullanılacak.

### Kural 6: Faz Sınırına Saygı
Bu doküman sadece Faz 1 içindir. Faz 2-13 görevlerini **proaktif olarak** yapma. Kullanıcı sonraki fazları başlatınca yeni kılavuz vereceğim.

### Kural 7: Şüphede Sor, Devam Etme
Bir şey eksik, çelişkili veya belirsiz görünüyorsa devam etme. Kullanıcıya net bir soru sor.

### Kural 8: Çıktı Raporu Ver
Faz 1 tamamlandığında:
- Hangi dosyalar oluşturuldu (liste)
- Hangi doğrulama testleri geçti (Bölüm 8'den)
- Hangi placeholder'lar henüz doldurulmadı (eğer varsa)
- Bir sonraki faza geçmeden önce kullanıcının yapması gereken şeyler

---

## 10. Faz 1 Tamamlandı Sayılması İçin Şartlar

Aşağıdaki tüm maddeler ✓ olmadan Faz 1 tamamlanmış sayılmaz:

- [ ] Git repo başlatıldı, ilk commit atıldı
- [ ] Klasör yapısı tam (Bölüm 4.2'deki ağaç)
- [ ] `manifest.json` valid JSON, doğrulama testlerini geçiyor
- [ ] `manifest.json` Bölüm 6.2 şablonuyla birebir uyumlu (placeholder'lar dolu)
- [ ] `LICENSE` MIT, yıl 2026, isim Kerem Tuna
- [ ] `README.md` placeholder'lar dolu, marketing dili yok
- [ ] `PRIVACY-TR.md` ve `PRIVACY-EN.md` birebir şablon
- [ ] `_locales/tr/messages.json` ve `_locales/en/messages.json` aynı key'leri içeriyor
- [ ] `.gitignore` Bölüm 6.1'deki gibi
- [ ] `.eslintrc.json` ve `.prettierrc.json` opsiyonel (kullanıcı isterse)
- [ ] `src/content/`, `src/popup/`, `src/icons/` klasörlerinde sadece `.gitkeep` veya placeholder dosyalar
- [ ] Chrome'da eklenti hata vermeden yüklenebiliyor
- [ ] Tüm yasaklı izinler, framework'ler, bağımlılıklar yok

---

## Son Not

Bu kılavuz, Faz 1'in profesyonel ve hatasız tamamlanması için tasarlandı. Bir şey net değilse, bir alan eksik görünüyorsa, ya da kendinden emin değilsen — **kullanıcıya sor**. Zaman kaybı değil, hata önleme.

Faz 1 tamamlandığında kullanıcı sıradaki kılavuzu (Faz 2: Content Script CSS Injection) verecek.
