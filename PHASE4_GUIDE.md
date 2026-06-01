# Faz 4 Implementation Guide — Claude Code İçin

> **Bu dosya Claude Code'a verilmek üzere hazırlanmıştır.** Eklentinin Faz 4 aşamasını (Popup UI + Toggle + `chrome.storage.local` entegrasyonu) doğru, eksiksiz ve Faz 1-3'teki kararlarla **çelişmeden** tamamlamak için kullanılır.
>
> **Faz numarası notu:** İçerik orijinal planda "Faz 5" olarak tanımlanmıştı (Popup + Toggle + Storage). Faz 3 sonrası boşluk bırakmamak için **Faz 4** olarak yeniden numaralandırıldı. Kapsam birebir aynı — sadece isim değişti.
>
> **Kaynak otorite hiyerarşisi:** Bu kılavuz > MV3/WebExtensions resmi dokümantasyonu > `PHASE3_HANDOFF.md` > `PHASE2_HANDOFF.md` > `PHASE1_HANDOFF.md`. **İstisna:** Bu kılavuzla MV3 spesifikasyonu çatışırsa MV3 üstündür — DUR, sapmayı kullanıcıya bildir, onay al, sonra önceki handoff'lardaki gibi şeffaf raporla.

---

## 0. Bu Dokümanı Nasıl Kullanmalısın

1. **Bölüm 1**'i mutlaka oku — Faz 1-3'ten gelen 3 sapma kaydı korunmalı (özellikle G1 audio-filter ve _locales kök konumu).
2. **Bölüm 2**'deki kapsam sınırlarını içselleştir. Faz 4 birden fazla dosyaya dokunuyor — bu Faz 1-3'e göre yüksek karmaşıklık. Bu yüzden **görev sıralaması** (Bölüm 5) çok önemli; sırayı bozma.
3. **Bölüm 4 (Storage Schema) ve Bölüm 8 (Cold-Read Race)** mimari karar bölümleri — implementasyon öncesi anlaman gerekiyor.
4. Görevleri (Bölüm 5) **sıralı** yap. Her görev sonrası doğrulama. Faz 1-3'teki dört kontrol noktası akışı burada da işliyor.
5. Şüphede kal, varsayma (Kural 7). Faz 4 mimarisi yoğun — emin değilsen sor.
6. Faz 4 kapsamı dışına çıkma. ESLint kurulumu, npm, build pipeline = Faz 4 DEĞİL.

---

## 1. Faz 1-3'ten Devralınan Durum (Kritik)

### 1.1 — Repo State (PHASE3_HANDOFF.md ile doğrulandı)

```
Branch:        main (origin/main ile senkron — push tamamlandı)
Remote:        https://github.com/keremtunayetkinn/reels-off.git (private)
Son commit:    9a34bd5 — Phase 3: URL redirect for Reels and Explore paths
Working tree:  clean
Toplam commit: 10
```

### 1.2 — Önceki Fazların Sapma Kayıtları (HEPSİ KORUNMALI)

Faz 4 refactor'ü sırasında bu üç karar **bozulmamalı**:

| # | Sapma | Kaynak | Faz 4 etkisi |
|---|-------|--------|--------------|
| 1 | `_locales/` kök seviyede (`src/_locales/` DEĞİL) | Faz 1, commit `8c95378` | Faz 4 locale genişletecek; yeni key'ler kök `_locales/tr/messages.json` ve `_locales/en/messages.json`'a |
| 2 | G1 seçicisinde `:not([href^="/reels/audio/"])` audio-link filter | Faz 2, commit `ea51773` | block.css refactor sırasında G1 kuralındaki audio-filter **AYNEN korunacak** — kaybolursa müzik etiketli foto post'lar yanlışlıkla gizlenir |
| 3 | İki katmanlı loop guard + regex sıralaması (F1a/b → E1 → F1c) | Faz 3, commit `9a34bd5` | redirect.js refactor sırasında loop guard ve regex sırası **AYNEN korunacak** |

### 1.3 — Mevcut Dosya Durumu (Faz 4'ün üzerine kuracağı zemin)

**Faz 4'ün dokunacağı dosyalar:**

| Dosya | Mevcut hal | Faz 4'te ne olacak |
|-------|-----------|--------------------|
| `manifest.json` | `permissions` alanı yok | **`"permissions": ["storage"]` eklenecek** |
| `src/content/block.css` | Faz 2 (4 kural, hep aktif) | Her kurala **override (CSS class gate)** eklenecek; mevcut kurallar değişmez |
| `src/content/redirect.js` | Faz 3 (3 URL pattern, hep aktif) | **Settings okuma + onChanged listener + CSS class toggler** eklenecek; mevcut redirect mantığı değişmez |
| `src/popup/popup.html` | Boş boilerplate | **7 toggle içeren popup UI** |
| `src/popup/popup.css` | Placeholder | **Popup stil dosyası** |
| `src/popup/popup.js` | Placeholder | **i18n + storage toggle wiring** |
| `_locales/tr/messages.json` | 2 key (`extName`, `extDescription`) | **+11 yeni key** (popup metinleri) |
| `_locales/en/messages.json` | 2 key | **+11 yeni key** (İngilizce karşılıkları) |
| `README.md` | "Mevcut durum: Faz 3" | **"Mevcut durum: Faz 4 (Kullanıcı kontrolü ve ayarlar)"** |

**Faz 4'ün DOKUNMAYACAĞI dosyalar (Faz 1-3'ten aynen kalır):**
`LICENSE`, `PRIVACY-TR.md`, `PRIVACY-EN.md`, `.gitignore`, `.eslintrc.json`, `.prettierrc.json`, ikonlar (`src/icons/*`), `docs/.gitkeep`, tüm `PHASE*_GUIDE.md` ve `PHASE*_HANDOFF.md` dosyaları.

---

## 2. Faz 4 Kapsamı ve Sınırları

### 2.1 — Faz 4'te YAPILACAK (8 görev)

1. Manifest'e `storage` izni ekle
2. `_locales/` dosyalarını genişlet (TR + EN, 11 yeni key)
3. `block.css` refactor: her kurala CSS class gate override'ı ekle
4. `redirect.js` refactor: settings okuma, onChanged listener, CSS class toggler
5. `popup.html` yaz (7 toggle, i18n attribute'ları)
6. `popup.css` yaz (basit, koyu tema, CSP-uyumlu)
7. `popup.js` yaz (i18n replacement + storage wire)
8. `README.md` "Mevcut durum" güncellemesi

Tüm toggle'lar **default ON** (engelleme aktif). Kullanıcı kapatabilir, varsayılan davranış Faz 2-3 ile birebir aynı kalır.

### 2.2 — Faz 4'te YAPILMAYACAK (Önemli Sınırlar)

| Yapma | Sebep |
|-------|-------|
| ❌ `chrome.storage.sync` kullanmak | `local` kullanılacak — Google sunucularına veri gitmez (Faz 1 mimari kararı) |
| ❌ Yeni permission eklemek (`storage` dışında) | `webNavigation`, `tabs`, `scripting`, `notifications` — hiçbiri gerekmez |
| ❌ Mevcut block.css/redirect.js kurallarını silmek | Refactor = override **eklemek**, mevcut kuralları değiştirmemek. Mevcut Faz 2-3 davranışı default davranıştır |
| ❌ G1 audio-filter'ı kaldırmak veya değiştirmek | Faz 2 Sapma 2 — kaybolursa regression |
| ❌ Loop guard veya regex sıralamasını "iyileştirmek" | Faz 3 Kural 13 ve 15 |
| ❌ `location.replace` dışına çıkmak | Faz 3 Kural 14 |
| ❌ Polling parametrelerini (`300`, `1000`) değiştirmek | Faz 3 Kural 11 |
| ❌ Popup'ta inline `<script>` veya `onclick="..."` | CSP `script-src 'self'` — strict mode |
| ❌ Popup'ta external font, CDN, image | CSP + privacy: hiçbir dış kaynak |
| ❌ Service worker eklemek | Faz 4'te gerekmez — content script ve popup arası storage event ile iletişim kuruyor |
| ❌ Mesajlaşma API'si (`chrome.runtime.sendMessage`) | Storage + `onChanged` listener yeterli; mesajlaşma gereksiz katman |
| ❌ Build pipeline (Webpack, Vite, vb.) | Vanilla, MV3 raw klasör yükleniyor |
| ❌ TypeScript, React, Vue, jQuery, vb. | Faz 1 mimari kararı |
| ❌ Test framework (Jest, Vitest, vb.) | Faz 13 işi |
| ❌ Renaming files (örn. `redirect.js` → `content-main.js`) | Manifest dependency'leri kırar; ad-içerik uyumsuzluğu yorum ile çözüldü |
| ❌ Toggle'lara animation, gradient, glassmorphism, vs. | Minimal UI; over-engineering yasak |

---

## 3. Mimari Kararlar

| Karar | Gerekçe |
|-------|---------|
| **`chrome.storage.local`** | sync DEĞİL — veri Google'a gitmez (Faz 1 mimari). Privacy policy uyumu. |
| **Flat boolean schema** | İç içe yapı yerine düz key'ler. `chrome.storage` API basit kullanım için optimize. `schemaVersion: 1` ile gelecek migration hazırlığı. |
| **Default-true policy** | Tüm 7 toggle default `true`. Kurulumda eklenti tam aktif (Faz 2-3 davranışı). Kullanıcı sadece kapatabilir. |
| **CSS-default-block + class override** | block.css default'ta her şeyi engeller (`display: none !important`). Kullanıcı bir toggle'ı kapatınca `<html>`'e class eklenir, override kuralı (`display: revert !important`) çalışır. **Flicker yok** çünkü default = engelleme. |
| **`display: revert !important`** | UA stylesheet default'una döner. Baseline 2020, hedef tarayıcılarımızda tam destek. Specificity gate (`html.ro-disable-X`) sayesinde `!important`'i ezer. |
| **Single content script (redirect.js genişletilir)** | Yeni dosya eklemek = manifest değişikliği = risk. Mevcut redirect.js sorumluluğu genişletilir; yorumlarla belgelenir. |
| **Settings cold-read race: defaults-aktif** | Storage async; gelene kadar `settings = DEFAULTS` (her şey aktif). Race penceresi (~5-10ms) içinde davranış = Faz 2-3 davranışı = güvenli. |
| **`chrome.storage.onChanged` listener** | Popup'tan toggle değiştiğinde content script canlı uyum sağlar — kullanıcı popup'ı kapatmadan değişiklik görebilir. Mesajlaşma API'si gereksiz. |
| **Popup CSP-strict (inline yok)** | `script-src 'self'` zaten ayarlı. `data-i18n` attribute + JS replacement pattern; `data-key` attribute + JS event binding. |
| **i18n: JS-side replacement** | HTML'de `__MSG_*__` syntax yalnızca manifest ve CSS'te çalışır. Popup HTML'de `data-i18n` attribute'ları, popup.js bunları `chrome.i18n.getMessage()` ile dolduruyor. |
| **Tek storage paneli (popup, options sayfası yok)** | Sadelik. 7 toggle bir popup'a sığar. Faz 13+ için options sayfası düşünülebilir. |

---

## 4. Storage Schema (Detaylı)

### Schema (verbatim, değiştirme)

```javascript
const DEFAULTS = {
  schemaVersion: 1,
  blockSidebarReels: true,       // A1 — Sidebar Reels link CSS
  blockSidebarExplore: true,     // A2 — Sidebar Keşfet link CSS
  blockProfileReelsTab: true,    // D1 — Profil Reels sekmesi CSS
  blockFeedReelPosts: true,      // G1 — Feed reel post container CSS
  redirectReels: true,           // F1a/F1b — /reels/* redirect JS
  redirectExplore: true,         // E1 — /explore/* redirect JS
  redirectProfileReels: true,    // F1c — /<user>/reels/ redirect JS
};
```

**7 toggle + schemaVersion.** Bütün toggle'lar bool, default true.

### Storage davranışı

- **İlk kurulum:** Storage boş. `chrome.storage.local.get(DEFAULTS, ...)` çağrısında `DEFAULTS` ikinci argüman olarak verilir → her key için bulunmuyorsa default değer döner. Yani ilk kurulumda settings = DEFAULTS = her şey aktif.
- **Kullanıcı kapatma:** Popup'ta toggle off edilir → `chrome.storage.local.set({ [key]: false })` → onChanged tetiklenir → content script settings'i güncellenir → `applyBlockingClasses()` çalışır → root class eklenir → CSS override aktive olur → element görünür hale gelir.
- **Kullanıcı açma:** Tersine → toggle on → set true → onChanged → settings güncellenir → root class kaldırılır → default CSS kuralı çalışır → element gizlenir.
- **Eklenti kaldırma:** Tarayıcı `chrome.storage.local`'ı eklenti bazında siler. Veri kaybolur. Privacy policy'mizle uyumlu.

### `schemaVersion` neden var?

Faz 4'te kullanılmıyor (= 1, sabit). Ama ileride yapı değişirse (yeni toggle eklemek değil — örn. `enabled` master switch eklemek gibi yapısal değişiklik) migration yazılabilsin diye. **Şimdi dokunma**, sadece yer tut.

### Schema dışı key kullanılmayacak

`DEFAULTS`'ta olmayan bir key'i storage'a yazmak (`chrome.storage.local.set({ foo: 'bar' })`) yasak. Sadece DEFAULTS key'leri yazılır/okunur.

---

## 5. Görev Listesi (Sıralı)

Görev sırası mimari sebeple bu — değiştirme.

### Görev 5.1 — Mevcut state'i doğrula
Repo'ya girince Faz 3 state'inin bozulmadığını teyit et (Bölüm 10 komutları):
- `git log --oneline` → HEAD = `9a34bd5` ?
- `git status` clean mi?
- `manifest.json`'da `permissions` alanı **yok** mu (Faz 3 henüz eklemedi)?
- `block.css` 4 kural içeriyor mu, audio-filter G1'de mi?
- `redirect.js` polling pattern içeriyor mu?

Tutarsızlık görürsen DUR, kullanıcıya bildir.

### Görev 5.2 — Manifest'e `storage` izni ekle
**Sadece tek satır eklenecek.** Mevcut `host_permissions` korunur. Yeni `permissions` alanı eklenir:

```json
"host_permissions": [
  "https://www.instagram.com/*"
],
"permissions": [
  "storage"
],
"content_scripts": [
```

Yer: `host_permissions` ve `content_scripts` arasına. Alfabetik sıra zorunlu değil ama manifest okunabilirliği için bu konum mantıklı.

### Görev 5.3 — `_locales/tr/messages.json` ve `_locales/en/messages.json` genişlet
11 yeni key (Bölüm 6.2 ve 6.3'teki şablon). Mevcut 2 key (`extName`, `extDescription`) korunur, sonuna eklenecek.

### Görev 5.4 — `block.css` refactor
Mevcut 4 kuralın her birine bir **override** ekle. Mevcut kuralları SİLME, sadece ekleme yap. Şablon Bölüm 6.4'te.

### Görev 5.5 — `redirect.js` refactor
Mevcut polling mantığı korunur. Üstüne settings okuma + onChanged listener + `applyBlockingClasses()` fonksiyonu eklenir. `computeRedirect()` settings flag'lerini kullanacak şekilde değişir. Şablon Bölüm 6.5'te.

### Görev 5.6 — `popup.html` yaz
Bölüm 6.6 şablonu birebir.

### Görev 5.7 — `popup.css` yaz
Bölüm 6.7 şablonu birebir.

### Görev 5.8 — `popup.js` yaz
Bölüm 6.8 şablonu birebir.

### Görev 5.9 — `README.md` "Mevcut durum" güncelle
Tek satır: `Faz 3 (URL yönlendirme)` → `Faz 4 (Kullanıcı kontrolü ve ayarlar)`. Bölüm 13.

### Görev 5.10 — Görsel test (kullanıcı yapar)
Bölüm 9 checklist. Test geçmeden commit etme.

### Görev 5.11 — Commit + push
Tüm testler geçince:
```bash
git add manifest.json _locales/ src/content/block.css src/content/redirect.js src/popup/ README.md
git commit -m "Phase 4: Popup UI with toggles and chrome.storage.local integration"
```

**Push'tan önce kullanıcı onayı bekle.**

---

## 6. Dosya Şablonları (Birebir Kullan)

### 6.1 — `manifest.json` Diff (sadece `permissions` ekleme)

Mevcut manifest'in **şu kısmı** değişecek (`host_permissions`'tan hemen sonra ekleme):

```json
  "host_permissions": [
    "https://www.instagram.com/*"
  ],

  "permissions": [
    "storage"
  ],

  "content_scripts": [
```

`manifest.json`'ın geri kalanı **kesinlikle değişmeyecek**. `host_permissions`, `content_scripts`, `action`, `content_security_policy`, `browser_specific_settings` — hepsi aynen kalır.

### 6.2 — `_locales/tr/messages.json` (tam dosya)

```json
{
  "extName": {
    "message": "Reels Off",
    "description": "Eklentinin adı (mağaza ve tarayıcıda görünür)."
  },
  "extDescription": {
    "message": "Instagram web arayüzünde Reels ve algoritmik içerik önerilerini gizleyerek dikkat dağılmasını azaltır. Veri toplamaz.",
    "description": "Eklentinin kısa açıklaması (mağaza listingi)."
  },
  "popupTitle": {
    "message": "Reels Off Ayarları",
    "description": "Popup başlığı."
  },
  "popupSubtitle": {
    "message": "Tercihleriniz yalnızca cihazınızda saklanır.",
    "description": "Popup alt başlığı — gizlilik vurgusu."
  },
  "categoryHide": {
    "message": "Gizleme",
    "description": "CSS ile gizleme grubu başlığı."
  },
  "categoryRedirect": {
    "message": "Yönlendirme",
    "description": "URL yönlendirme grubu başlığı."
  },
  "toggleSidebarReels": {
    "message": "Sidebar Reels bağlantısını gizle",
    "description": "A1 toggle etiketi."
  },
  "toggleSidebarExplore": {
    "message": "Sidebar Keşfet bağlantısını gizle",
    "description": "A2 toggle etiketi."
  },
  "toggleProfileReelsTab": {
    "message": "Profil Reels sekmesini gizle",
    "description": "D1 toggle etiketi."
  },
  "toggleFeedReelPosts": {
    "message": "Ana akıştaki Reels gönderilerini gizle",
    "description": "G1 toggle etiketi."
  },
  "toggleRedirectReels": {
    "message": "/reels/ adreslerinde ana sayfaya yönlendir",
    "description": "F1a/F1b toggle etiketi."
  },
  "toggleRedirectExplore": {
    "message": "/explore/ adreslerinde ana sayfaya yönlendir",
    "description": "E1 toggle etiketi."
  },
  "toggleRedirectProfileReels": {
    "message": "Profil Reels adreslerinde profile geri dön",
    "description": "F1c toggle etiketi."
  }
}
```

### 6.3 — `_locales/en/messages.json` (tam dosya)

```json
{
  "extName": {
    "message": "Reels Off",
    "description": "Extension name (visible in store and browser)."
  },
  "extDescription": {
    "message": "Reduces distraction by hiding Reels and algorithmic content suggestions on Instagram's web interface. Collects no data.",
    "description": "Short description of the extension (store listing)."
  },
  "popupTitle": {
    "message": "Reels Off Settings",
    "description": "Popup title."
  },
  "popupSubtitle": {
    "message": "Your preferences are stored only on your device.",
    "description": "Popup subtitle — privacy emphasis."
  },
  "categoryHide": {
    "message": "Hide",
    "description": "CSS hide group header."
  },
  "categoryRedirect": {
    "message": "Redirect",
    "description": "URL redirect group header."
  },
  "toggleSidebarReels": {
    "message": "Hide sidebar Reels link",
    "description": "A1 toggle label."
  },
  "toggleSidebarExplore": {
    "message": "Hide sidebar Explore link",
    "description": "A2 toggle label."
  },
  "toggleProfileReelsTab": {
    "message": "Hide profile Reels tab",
    "description": "D1 toggle label."
  },
  "toggleFeedReelPosts": {
    "message": "Hide Reel posts in main feed",
    "description": "G1 toggle label."
  },
  "toggleRedirectReels": {
    "message": "Redirect /reels/ URLs to homepage",
    "description": "F1a/F1b toggle label."
  },
  "toggleRedirectExplore": {
    "message": "Redirect /explore/ URLs to homepage",
    "description": "E1 toggle label."
  },
  "toggleRedirectProfileReels": {
    "message": "Redirect profile Reels URLs back to profile",
    "description": "F1c toggle label."
  }
}
```

**Hem TR hem EN dosyasında 13 key var ve key isimleri eşleşmeli.** Doğrulama: `diff <(jq 'keys' _locales/tr/messages.json) <(jq 'keys' _locales/en/messages.json)` boş çıkmalı.

### 6.4 — `src/content/block.css` (tam dosya, refactor edilmiş)

```css
/*
 * Reels Off — block.css
 * Faz 2 + Faz 4: Content Script CSS Injection + Settings-aware overrides
 *
 * Strateji: href-first seçiciler. Instagram class isimleri obfuscated
 * (x1qjc9v5, _aaa1 vb.) ve sık değişir; href routing kararlıdır.
 *
 * Davranış: Her kural default'ta aktif (display: none !important).
 *   Kullanıcı popup'tan bir özelliği kapatırsa, redirect.js
 *   <html> elementine ilgili "ro-disable-*" class'ını ekler ve
 *   override kuralı (display: revert !important) devreye girer.
 *
 * Flicker analizi: Default = engelleme. Storage cold-read sırasında
 *   (ilk ~5-10ms) class'lar henüz uygulanmamış olabilir → engelleme aktif.
 *   Kullanıcı off ettiyse storage gelince class eklenir, override çalışır.
 *   Yani worst case = "kapatılmış bir özellik kısa süre aktif" — kabul edilebilir.
 *
 * Kapsam (Faz 2 ile aynı, README ile tutarlı):
 *   A1 — Sidebar Reels linki         [varsayılan aktif, blockSidebarReels]
 *   A2 — Sidebar Keşfet linki        [varsayılan aktif, blockSidebarExplore]
 *   D1 — Profil Reels sekmesi        [varsayılan aktif, blockProfileReelsTab]
 *   G1 — Feed tekil Reel gönderileri [varsayılan aktif, blockFeedReelPosts]
 */

/* ---------------------------------------------------------------------------
 * A1 — Sol kenar çubuğu Reels linki
 * Seçici mantığı: tam eşleme href="/reels/" yalnızca sidebar linkini yakalar.
 *   Feed reel post'ları /reels/<id>/ formatında olduğundan hariç kalır.
 * Güven: Yüksek (Faz 0)
 * ------------------------------------------------------------------------- */
a[href="/reels/"] {
  display: none !important;
}
html.ro-disable-sidebar-reels a[href="/reels/"] {
  display: revert !important;
}

/* ---------------------------------------------------------------------------
 * A2 — Sol kenar çubuğu Keşfet linki
 * Seçici mantığı: tam eşleme href="/explore/" yalnızca sidebar linkini yakalar.
 *   /explore/locations/, /explore/search/ gibi alt yollar hariç kalır.
 * Güven: Yüksek (Faz 0)
 * ------------------------------------------------------------------------- */
a[href="/explore/"] {
  display: none !important;
}
html.ro-disable-sidebar-explore a[href="/explore/"] {
  display: revert !important;
}

/* ---------------------------------------------------------------------------
 * D1 — Profil sayfası Reels sekmesi
 * Seçici mantığı: main içinde /<username>/reels/ ile biten link;
 *   tam /reels/ (sidebar) hariç tutulur.
 * Not: Profil tab'ları role="link" + aria-selected hibrit yapı kullanır
 *   (role="tab" DEĞİL), bu yüzden href suffix ile hedefleniyor.
 * Güven: Yüksek (Faz 0)
 * ------------------------------------------------------------------------- */
main a[href$="/reels/"]:not([href="/reels/"]) {
  display: none !important;
}
html.ro-disable-profile-reels-tab main a[href$="/reels/"]:not([href="/reels/"]) {
  display: revert !important;
}

/* ---------------------------------------------------------------------------
 * G1 — Feed'e gömülü tekil Reel gönderileri
 * DURUM: 2026-05-28 tarihli tarayıcı-ajan oturumunda doğrulandı.
 *   Post-seviyesi container <article>; audio-link filter foto post'ları
 *   yanlışlıkla gizlemeyi önler (Faz 2 Sapma 2 — KORUNUR).
 * Performans notu: :has() anchor'ı (article) dar; uyarı yok.
 * Güven: Yüksek (canlı doğrulandı)
 * ------------------------------------------------------------------------- */
article:has(a[href^="/reels/"]:not([href="/reels/"]):not([href^="/reels/audio/"])) {
  display: none !important;
}
html.ro-disable-feed-reel-posts article:has(a[href^="/reels/"]:not([href="/reels/"]):not([href^="/reels/audio/"])) {
  display: revert !important;
}
```

**Özet:** Her bir Faz 2 kuralının altına bir override kuralı eklenir. Mevcut Faz 2 kuralları **kesinlikle değişmez**. G1'de audio-filter override'da da aynen geçer.

### 6.5 — `src/content/redirect.js` (tam dosya, refactor edilmiş)

```javascript
/*
 * Reels Off — redirect.js
 * Faz 3 + Faz 4: URL Redirect + Settings-aware CSS class toggle
 *
 * Faz 3'ten gelen: polling-based URL redirect (Reels + Explore + Profile Reels).
 * Faz 4'te eklenen: chrome.storage.local'dan toggle ayarları okuma,
 *   block.css için <html>'de root class toggle, chrome.storage.onChanged
 *   ile canlı güncelleme.
 *
 * Dosya adı tarihsel sebeple "redirect.js"; artık hem URL redirect hem
 *   CSS class gating yönetir. Yeniden adlandırma düşünülebilir ama
 *   manifest dependency kırma riski; yorumlarla belgelendi.
 *
 * Storage schema:
 *   blockSidebarReels         (bool, default true) → A1 CSS class
 *   blockSidebarExplore       (bool, default true) → A2 CSS class
 *   blockProfileReelsTab      (bool, default true) → D1 CSS class
 *   blockFeedReelPosts        (bool, default true) → G1 CSS class
 *   redirectReels             (bool, default true) → F1a/b koşulu
 *   redirectExplore           (bool, default true) → E1 koşulu
 *   redirectProfileReels      (bool, default true) → F1c koşulu
 *
 * Cold-read race: storage async; defaults tüm true → race penceresinde
 *   default davranış = engelleme aktif (Faz 3 davranışıyla aynı). Storage
 *   yüklendikten sonra kullanıcının kapatma tercihi uygulanır.
 *
 * Faz 3'ten korunan: location.replace(), iki katmanlı loop guard, regex
 *   sıralaması (F1a/b → E1 → F1c), polling parametreleri (300/1000 ms).
 */

(function () {
  'use strict';

  const POLL_INTERVAL_MS = 300;
  const PAUSE_AFTER_REDIRECT_MS = 1000;

  // /reels/, /reels/<id>/, /reels/audio/<id>/ — tüm /reels/ alt yolları
  const REELS_RE = /^\/reels(\/|$)/;
  // /explore/, /explore/locations/, /explore/tags/<tag>/ — tüm /explore/ alt yolları
  const EXPLORE_RE = /^\/explore(\/|$)/;
  // /<username>/reels(/) — profil Reels feed'i (capture group 1 = username)
  const PROFILE_REELS_RE = /^\/([^/]+)\/reels(\/|$)/;

  const DEFAULTS = {
    blockSidebarReels: true,
    blockSidebarExplore: true,
    blockProfileReelsTab: true,
    blockFeedReelPosts: true,
    redirectReels: true,
    redirectExplore: true,
    redirectProfileReels: true,
  };

  let settings = { ...DEFAULTS };
  let pollingPaused = false;

  function computeRedirect(pathname) {
    // Sıralama önemli: F1a/b önce, E1 sonra, F1c en son.
    if (settings.redirectReels && REELS_RE.test(pathname)) return '/';
    if (settings.redirectExplore && EXPLORE_RE.test(pathname)) return '/';
    if (settings.redirectProfileReels) {
      const match = pathname.match(PROFILE_REELS_RE);
      if (match) return '/' + match[1];
    }
    return null;
  }

  function tick() {
    if (pollingPaused) return;
    const target = computeRedirect(location.pathname);
    if (target !== null && target !== location.pathname) {
      pollingPaused = true;
      window.setTimeout(() => {
        pollingPaused = false;
      }, PAUSE_AFTER_REDIRECT_MS);
      location.replace(target);
    }
  }

  function applyBlockingClasses() {
    const root = document.documentElement;
    // settings.blockX === false → class eklenir → CSS override aktif → element görünür
    root.classList.toggle('ro-disable-sidebar-reels', settings.blockSidebarReels === false);
    root.classList.toggle('ro-disable-sidebar-explore', settings.blockSidebarExplore === false);
    root.classList.toggle('ro-disable-profile-reels-tab', settings.blockProfileReelsTab === false);
    root.classList.toggle('ro-disable-feed-reel-posts', settings.blockFeedReelPosts === false);
  }

  // Storage'tan settings'i oku, root class'ları uygula
  chrome.storage.local.get(DEFAULTS, (loaded) => {
    settings = { ...DEFAULTS, ...loaded };
    applyBlockingClasses();
  });

  // Popup'tan toggle değişikliği geldiğinde canlı uygula
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'local') return;
    for (const key in changes) {
      if (key in settings) {
        settings[key] = changes[key].newValue !== false;
      }
    }
    applyBlockingClasses();
  });

  // İlk kontrol document_start anında — kullanıcı doğrudan /reels/'e gelmişse
  // IG kodunun render başlamasından önce redirect tetiklenir (flicker yok).
  tick();

  // SPA navigation (history.pushState) için periyodik kontrol.
  window.setInterval(tick, POLL_INTERVAL_MS);
})();
```

### 6.6 — `src/popup/popup.html` (tam dosya)

```html
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <link rel="stylesheet" href="popup.css">
  <title data-i18n="popupTitle"></title>
</head>
<body>
  <header>
    <h1 data-i18n="popupTitle"></h1>
    <p data-i18n="popupSubtitle"></p>
  </header>

  <section>
    <h2 data-i18n="categoryHide"></h2>
    <label class="toggle">
      <input type="checkbox" data-key="blockSidebarReels">
      <span data-i18n="toggleSidebarReels"></span>
    </label>
    <label class="toggle">
      <input type="checkbox" data-key="blockSidebarExplore">
      <span data-i18n="toggleSidebarExplore"></span>
    </label>
    <label class="toggle">
      <input type="checkbox" data-key="blockProfileReelsTab">
      <span data-i18n="toggleProfileReelsTab"></span>
    </label>
    <label class="toggle">
      <input type="checkbox" data-key="blockFeedReelPosts">
      <span data-i18n="toggleFeedReelPosts"></span>
    </label>
  </section>

  <section>
    <h2 data-i18n="categoryRedirect"></h2>
    <label class="toggle">
      <input type="checkbox" data-key="redirectReels">
      <span data-i18n="toggleRedirectReels"></span>
    </label>
    <label class="toggle">
      <input type="checkbox" data-key="redirectExplore">
      <span data-i18n="toggleRedirectExplore"></span>
    </label>
    <label class="toggle">
      <input type="checkbox" data-key="redirectProfileReels">
      <span data-i18n="toggleRedirectProfileReels"></span>
    </label>
  </section>

  <script src="popup.js"></script>
</body>
</html>
```

**Önemli:**
- Hiçbir inline `<script>` yok (CSP).
- Hiçbir inline event handler (`onclick`, `onchange`) yok (CSP).
- Hiçbir external resource (font, image, CDN) yok.
- `data-i18n` attribute'ları popup.js tarafından doldurulacak.
- `data-key` attribute'ları popup.js tarafından storage'a bağlanacak.
- `<title>` boş başlar, `data-i18n` ile doldurulur.

### 6.7 — `src/popup/popup.css` (tam dosya)

```css
/*
 * Reels Off — popup.css
 * Faz 4: Popup stil dosyası
 *
 * Tasarım: Sade, koyu tema (Instagram'a tematik uyum).
 * Bağımlılık: Yok — system font fallback chain.
 * Erişilebilirlik: native checkbox kullanılır; klavye + screen reader uyumlu.
 */

:root {
  --bg: #1c1c1e;
  --fg: #ffffff;
  --muted: #8e8e93;
  --border: #2c2c2e;
}

body {
  margin: 0;
  padding: 16px;
  min-width: 320px;
  max-width: 360px;
  background: var(--bg);
  color: var(--fg);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  font-size: 13px;
  line-height: 1.4;
}

header {
  margin-bottom: 16px;
}

header h1 {
  margin: 0 0 4px 0;
  font-size: 15px;
  font-weight: 600;
}

header p {
  margin: 0;
  color: var(--muted);
  font-size: 11px;
}

section {
  margin-bottom: 16px;
}

section:last-of-type {
  margin-bottom: 0;
}

section h2 {
  margin: 0 0 8px 0;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--muted);
}

.toggle {
  display: flex;
  align-items: center;
  padding: 10px 0;
  cursor: pointer;
  border-bottom: 1px solid var(--border);
  user-select: none;
}

.toggle:last-child {
  border-bottom: none;
}

.toggle input[type="checkbox"] {
  margin: 0 12px 0 0;
  cursor: pointer;
  flex-shrink: 0;
}

.toggle span {
  flex: 1;
}
```

### 6.8 — `src/popup/popup.js` (tam dosya)

```javascript
/*
 * Reels Off — popup.js
 * Faz 4: Popup yönetimi
 *
 * Görevler:
 *   1. data-i18n attribute'larını chrome.i18n.getMessage() ile doldur
 *   2. data-key attribute'larındaki checkbox'ları chrome.storage.local'tan başlat
 *   3. Değişiklikleri canlı olarak storage'a yaz (content script onChanged ile duyar)
 *
 * Mesajlaşma yok: chrome.storage.onChanged content script'i bilgilendiriyor;
 *   doğrudan chrome.runtime.sendMessage gereksiz.
 */

(function () {
  'use strict';

  const DEFAULTS = {
    blockSidebarReels: true,
    blockSidebarExplore: true,
    blockProfileReelsTab: true,
    blockFeedReelPosts: true,
    redirectReels: true,
    redirectExplore: true,
    redirectProfileReels: true,
  };

  // 1. i18n replacement — tüm [data-i18n] elementlerini doldur
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.dataset.i18n;
    const msg = chrome.i18n.getMessage(key);
    if (msg) {
      el.textContent = msg;
    }
  });

  // 2. Toggle wiring — storage'tan oku, checkbox'ları başlat, change event'ı bağla
  chrome.storage.local.get(DEFAULTS, (settings) => {
    document.querySelectorAll('[data-key]').forEach((input) => {
      const key = input.dataset.key;
      // settings[key] undefined ise default true (DEFAULTS sayesinde)
      input.checked = settings[key] !== false;
      input.addEventListener('change', () => {
        chrome.storage.local.set({ [key]: input.checked });
      });
    });
  });
})();
```

**Önemli:**
- IIFE wrap + `'use strict'` (Faz 3 ile tutarlı stil).
- `chrome.runtime.sendMessage` yok — storage onChanged yeterli.
- DEFAULTS popup.js'de de tanımlı (redirect.js'tekiyle birebir aynı olmalı; aksi halde drift olur). Faz 5'te shared constants dosyası düşünülebilir.

---

## 7. Sıkı Kısıtlamalar (DO NOT)

### Kategori: Mimari
- ❌ `chrome.storage.sync` kullanmak — `local` zorunlu (Faz 1 mimari karar).
- ❌ Mesajlaşma API'si (`chrome.runtime.sendMessage`, `chrome.tabs.sendMessage`) eklemek — storage onChanged yeterli.
- ❌ Service worker eklemek — gereksiz, content script + popup zaten yeterli.
- ❌ `options_page` veya `options_ui` manifest alanı — popup yeterli, options sayfası Faz 13+ konusu.

### Kategori: Manifest
- ❌ `storage` dışında permission eklemek (`webNavigation`, `tabs`, `activeTab`, `notifications`, `scripting`).
- ❌ `host_permissions` veya `content_scripts.matches` değiştirmek.
- ❌ CSP'yi gevşetmek (`unsafe-inline`, `unsafe-eval`, external URL).

### Kategori: Popup
- ❌ Inline `<script>` veya inline event handler (`onclick="..."`, `onchange="..."`) — CSP.
- ❌ External script, font, image, CDN.
- ❌ React, Vue, Lit, vb. framework.
- ❌ `<form>` tag — gereksiz, native input + JS yeterli.
- ❌ Animation, transition, gradient — minimal UI.

### Kategori: i18n
- ❌ Hardcoded Türkçe veya İngilizce metin (popup.html veya popup.js'de) — `data-i18n` ve `chrome.i18n.getMessage()` zorunlu.
- ❌ TR ve EN messages.json arasında key uyumsuzluğu — doğrulama Bölüm 10'da.

### Kategori: Storage
- ❌ DEFAULTS dışında key yazmak/okumak.
- ❌ Schema'yı genişletmek — yeni toggle eklemek Faz 4 kapsamı değil.
- ❌ `schemaVersion`'a dokunmak.
- ❌ Storage'a kişisel veri yazmak — sadece boolean ayarlar.

### Kategori: Refactor
- ❌ Faz 2 block.css mevcut kurallarını silmek/değiştirmek — sadece override **eklemek**.
- ❌ G1 audio-filter (`:not([href^="/reels/audio/"])`) kaldırmak — Faz 2 Sapma 2.
- ❌ Faz 3 redirect.js loop guard veya regex sıralamasını değiştirmek — Faz 3 Kural 13/15.
- ❌ `location.replace` dışına çıkmak — Faz 3 Kural 14.
- ❌ Polling parametrelerini (300/1000) değiştirmek — Faz 3 Kural 11.

### Kategori: Genel
- ❌ Dosya yeniden adlandırma (`redirect.js` → `content-main.js`).
- ❌ Yeni içerik script dosyası eklemek (manifest content_scripts.js array'i genişletmek).
- ❌ npm, package.json, build pipeline.
- ❌ `eval`, `new Function`, string parametreli `setTimeout` (ESLint zaten engelliyor).
- ❌ `console.log` production'da — `console.warn`/`console.error` gerçek hata için OK.

---

## 8. Cold-Read Race Condition (Özel Bölüm)

Faz 4'te `chrome.storage.local.get()` **asenkrondur** — callback'i tetiklenmesi ~5-10ms sürer. Content script `document_start`'ta yüklenir; storage callback'i gelene kadar `settings = DEFAULTS`.

### Pencere boyunca davranış

| An | settings | applyBlockingClasses() | Toggle state | Davranış |
|----|----------|------------------------|--------------|----------|
| t=0 (document_start) | DEFAULTS (tüm true) | henüz çağrılmadı | class'lar yok | Default CSS aktif → her şey engellenmiş |
| t=10ms (storage cevap) | loaded settings | çağrıldı | kullanıcı OFF ettiyse class eklendi | Override aktif → element görünür |
| t>10ms | settings | (onChanged ile) güncellenir | canlı | Kullanıcı popup'ta toggle değiştirir, anında uygulanır |

### Race penceresi neden güvenli?

- **Default-aktif policy:** Storage gelene kadar her şey engellenmiş kalır.
- **Kullanıcı off ettiyse:** ~10ms sonra override class eklenir, element görünür hale gelir. Kullanıcı için bir "blink" hissedilebilir mi? **Hayır** — çünkü IG sayfa render'ı zaten 100-500ms sürer; 10ms penceresi içinde IG element'i henüz DOM'a koymuş bile olmayabilir.
- **Kullanıcı on tutmuşsa:** Race penceresinde de off penceresinde de element gizli — fark yok.

### Initial `tick()` race

`redirect.js` end'inde initial `tick()` çağrılır. Bu noktada `settings = DEFAULTS = redirect aktif`. Yani **kullanıcı redirect'i kapatmışsa**, storage gelmeden önce ilk tick redirect yapabilir. Bu nadir bir senaryo:
- Kullanıcı redirect'i off etmiş.
- Yeni sekme açıyor, doğrudan `/reels/`'e gidiyor.
- Storage henüz okunmadı, `settings.redirectReels = true` (default).
- Initial tick `/reels/`'i yakalar, `/`'a redirect eder.

Worst case: kullanıcı `/`'da olur. Kullanıcı tercihine ters bir davranış ama **veri kaybı yok, loop yok, hata yok**. Sonraki tick'lerde settings hazır, doğru davranır. **Kabul edilebilir trade-off.**

### Alternatif (uygulanmayacak)

Initial tick'i storage callback'ine ertelemek bu race'i çözer ama farklı bir sorun yaratır: storage cevap vermesi gecikirse (~50ms+ edge case), kullanıcı doğrudan `/reels/`'e gelirken IG'nin reel kodu render olabilir → flicker. **Mevcut tasarım (defaults-aktif initial tick) daha iyi.**

---

## 9. Görsel Test Checklist (Kullanıcı Tarayıcıda Yapar)

Eklentiyi `chrome://extensions/` → Reload (yeni dosyaları yüklesin) → eklenti ikonuna tıkla → popup açılır.

### Popup UI
- [ ] Popup açılıyor, hata yok.
- [ ] Başlık (`Reels Off Ayarları`) görünüyor (TR arayüzdeyse).
- [ ] Alt başlık (`Tercihleriniz yalnızca cihazınızda saklanır`) görünüyor.
- [ ] İki kategori başlığı görünüyor (`Gizleme`, `Yönlendirme`).
- [ ] 7 toggle görünüyor, hepsi başlangıçta **işaretli (checked)**.
- [ ] Etiketler okunabilir, kesilmiyor.
- [ ] Popup darkbg, açık metin (koyu tema).

### i18n
- [ ] Tarayıcı dili Türkçe → tüm metinler Türkçe.
- [ ] Tarayıcı dili İngilizce → tüm metinler İngilizce (`chrome://settings/languages` ile değiştirip popup'ı yeniden aç).
- [ ] Hiçbir element boş veya `__MSG_*__` görünmüyor.

### Storage default state (ilk açılış)
- [ ] Eklenti yüklenince Instagram'a git → sidebar Reels gizli (A1), Keşfet gizli (A2), profil Reels tab gizli (D1), feed reel post'ları gizli (G1).
- [ ] `/reels/` URL'ine git → `/`'a yönleniyor (redirectReels).
- [ ] `/explore/` URL'ine git → `/`'a yönleniyor (redirectExplore).
- [ ] `/instagram/reels/` URL'ine git → `/instagram`'a yönleniyor (redirectProfileReels).

**Yani Faz 4 default davranışı = Faz 3 sonu davranışı = sıfır regresyon.**

### Canlı toggle testi
- [ ] Popup'tan `blockSidebarReels` toggle'ını OFF et → IG sekmesine geç → **Reels linki tekrar görünür** (sayfa yenilenmeden!).
- [ ] Popup'tan tekrar ON et → IG sekmesinde Reels linki **tekrar kayboldu** (sayfa yenilenmeden).
- [ ] Aynı testi `blockSidebarExplore`, `blockProfileReelsTab`, `blockFeedReelPosts` için tekrarla.
- [ ] `redirectReels` OFF → `/reels/`'e git → **artık yönlenmiyor**, Reels sayfası açılıyor.
- [ ] `redirectReels` ON → `/reels/` → tekrar `/`'a yönleniyor.
- [ ] `redirectExplore` ve `redirectProfileReels` için aynı test.

### Persistance (ayar saklama)
- [ ] Bir toggle'ı OFF et → tarayıcı sekmesini kapat → tekrar aç → popup'ta toggle hâlâ OFF görünüyor.
- [ ] Eklentiyi devre dışı bırak → tekrar enable et → ayarlar korunmuş (`chrome.storage.local` eklenti enable/disable'da silinmez, sadece uninstall'da).

### Regression (önceki fazlar bozulmadı mı?)
- [ ] Tüm toggle'lar ON iken Faz 3 davranışı birebir aynı.
- [ ] G1 audio filter çalışıyor: müzik etiketli foto post'lar **gizlenmedi** (toggle ON iken bile).
- [ ] Geri tuşu hâlâ Reels'e dönmüyor (`location.replace` korundu).
- [ ] Loop yok, donma yok, "Too many redirects" yok.

### Sağlık kontrolü
- [ ] `instagram.com/` (ana sayfa) — toggle state'inden bağımsız normal yükleniyor.
- [ ] `instagram.com/instagram/` (normal profile) — normal yükleniyor.
- [ ] `instagram.com/p/<id>/` (foto post) — normal yükleniyor.
- [ ] DM, arama, bildirim sayfaları normal çalışıyor.

### Konsol kontrolü
- [ ] Eklenti yüklendikten sonra konsola **yeni** hata düşmüyor (Faz 2-3 sonu ile aynı durum).
- [ ] Popup açıkken konsolda hata yok.

---

## 10. Doğrulama Komutları

```bash
# 1. Mevcut state doğrulaması (Faz 3 outputu bozulmadı mı?)
git log --oneline | head -5             # En üstte 9a34bd5 olmalı (Faz 4 commit'inden ÖNCE)

# 2. Sadece beklenen dosyalar değişti mi?
git status --short
# Beklenen: M manifest.json, M block.css, M redirect.js, M README.md, M tr/messages.json, M en/messages.json
# + ?? popup.html, ?? popup.css, ?? popup.js (yeni dosyalar değil — placeholder'lar zaten vardı, bunlar M olur)

# 3. Manifest'te storage izni var mı?
grep -A2 '"permissions"' manifest.json
# "permissions": [\n  "storage"\n] beklenir

# 4. Manifest'te yasaklı izin yok mu?
grep -E '"(webNavigation|tabs|activeTab|cookies|scripting|<all_urls>)"' manifest.json && echo "✗ HATA" || echo "✓ Temiz"

# 5. CSP unsafe değişmedi mi?
grep -E "unsafe-(inline|eval)" manifest.json && echo "✗ HATA" || echo "✓ CSP temiz"

# 6. block.css 8 kural mı içeriyor? (4 default + 4 override)
grep -c "display: none !important" src/content/block.css      # 4 olmalı
grep -c "display: revert !important" src/content/block.css    # 4 olmalı

# 7. G1 audio-filter hâlâ var mı? (KRİTİK — Faz 2 Sapma 2)
grep -c "/reels/audio/" src/content/block.css     # 2 olmalı (default + override)

# 8. redirect.js'te yasaklı API yok mu?
grep -nE "chrome\.(webNavigation|tabs|runtime\.sendMessage)" src/content/redirect.js && echo "✗ HATA" || echo "✓ Temiz"

# 9. redirect.js chrome.storage var mı?
grep -c "chrome\.storage\.local\.get" src/content/redirect.js  # 1 olmalı
grep -c "chrome\.storage\.onChanged" src/content/redirect.js   # 1 olmalı

# 10. redirect.js loop guard hâlâ iki katmanlı mı?
grep -c "pollingPaused" src/content/redirect.js   # 3+ olmalı (let, set true, check)
grep -c "target !== location.pathname" src/content/redirect.js  # 1 olmalı

# 11. redirect.js polling parametreleri değişmedi mi?
grep "POLL_INTERVAL_MS = 300" src/content/redirect.js          # eşleşmeli
grep "PAUSE_AFTER_REDIRECT_MS = 1000" src/content/redirect.js  # eşleşmeli

# 12. location.href ataması var mı? (YASAK)
grep -nE "location\.href\s*=" src/content/redirect.js && echo "✗ HATA" || echo "✓ Temiz"

# 13. popup.html'de inline script veya event handler var mı?
grep -nE 'on[a-z]+\s*=\s*"' src/popup/popup.html && echo "✗ HATA: inline handler" || echo "✓ Temiz"
grep -nE '<script[^>]*>[^<]' src/popup/popup.html && echo "✗ HATA: inline script" || echo "✓ Temiz"

# 14. popup.html external resource var mı?
grep -nE "https?://" src/popup/popup.html && echo "✗ HATA: external URL" || echo "✓ Temiz"

# 15. popup.js'te yasaklı API var mı?
grep -nE "chrome\.(tabs|runtime\.sendMessage|webNavigation)" src/popup/popup.js && echo "✗ HATA" || echo "✓ Temiz"

# 16. popup.js storage kullanıyor mu?
grep -c "chrome\.storage\.local" src/popup/popup.js   # 2 olmalı (get + set)

# 17. _locales TR ve EN key sayıları eşit mi?
node -e "
const tr = require('./_locales/tr/messages.json');
const en = require('./_locales/en/messages.json');
const trKeys = Object.keys(tr).sort();
const enKeys = Object.keys(en).sort();
console.log('TR key sayısı:', trKeys.length);
console.log('EN key sayısı:', enKeys.length);
console.log('Eşleşiyor mu:', JSON.stringify(trKeys) === JSON.stringify(enKeys));
"
# TR: 13, EN: 13, Eşleşiyor mu: true

# 18. Toggle'ların data-key'leri popup.html ile DEFAULTS arasında tutarlı mı?
grep -oE 'data-key="[^"]+"' src/popup/popup.html | sort -u   # 7 unique key
# Bu key'lerin hepsi popup.js DEFAULTS'ta ve redirect.js DEFAULTS'ta olmalı.

# 19. README "Mevcut durum" güncellendi mi?
grep "Mevcut durum" README.md   # "Faz 4 (Kullanıcı kontrolü ve ayarlar)" olmalı

# 20. Faz 1-3 sapmaları korundu mu?
ls _locales/tr/messages.json _locales/en/messages.json   # var olmalı (Faz 1 _locales sapması)
grep "audio" src/content/block.css                       # G1 audio-filter (Faz 2 Sapma 2)
```

---

## 11. Halüsinasyon Önleme Kuralları

`PHASE1_GUIDE.md` Bölüm 9 (Kural 1-8) + `PHASE2_GUIDE.md` (Kural 9-10) + `PHASE3_GUIDE.md` (Kural 11-16) hâlâ geçerli. Faz 4'e özel ek kurallar:

### Kural 17 — Mevcut kuralları silmek yerine üzerine eklemek
block.css'te mevcut Faz 2 kuralları silinmez, **altına** override eklenir. redirect.js'te mevcut Faz 3 mantığı silinmez, **arasına** settings okuma ve `applyBlockingClasses()` eklenir. Silmek değil, eklemek.

### Kural 18 — DEFAULTS iki yerde tutarlı olmalı
`popup.js` ve `redirect.js` her ikisi de DEFAULTS objesini tanımlar. Anahtar isimleri ve değerleri **birebir aynı** olmalı. Şablonu birebir kullan; tutarsızlık olursa bug = subtle ve hard-to-debug.

### Kural 19 — Default-true policy zorunlu
Tüm 7 toggle default `true`. Tek bir tane bile `false` default'la başlatılırsa, ilk kurulumda eklenti yarı-pasif olur — kullanıcı beklenmedik davranış görür. Şablondan sapma.

### Kural 20 — CSS override mutlaka `display: revert !important`
`display: block`, `display: initial`, `display: unset` farklı semantik. `revert` UA stylesheet'e dönmek için doğru anahtar (Baseline 2020, hedef tarayıcılarda tam destek). `!important` zorunlu çünkü default kuralı da `!important`.

### Kural 21 — i18n hardcoded metin kaçışı
Popup HTML'de görünür hiçbir metin hardcoded olmamalı. Tüm metinler `data-i18n` attribute ile placeholder, popup.js dolduruyor. Aksi halde locale eklemek anlamsızlaşır.

### Kural 22 — Storage'a sadece schema'daki key'ler
`chrome.storage.local.set({ randomKey: 'foo' })` YASAK. Sadece DEFAULTS'taki 7 key + (gerekirse) `schemaVersion` yazılabilir.

### Kural 23 — Mesajlaşma API'sine giriş yapmamak
`chrome.runtime.sendMessage`, `chrome.tabs.sendMessage`, port API'leri Faz 4'te gereksiz. `chrome.storage.onChanged` content script'i bilgilendiriyor. Eklemek = gereksiz karmaşıklık + ekstra Web Store inceleme alanı.

### Kural 24 — Manifest minimal değişiklik
Manifest'e SADECE `"permissions": ["storage"]` eklenir. Başka hiçbir değişiklik (CSP, gecko, action, content_scripts) YASAK.

### Faz 4'e özel canlı doğrulama notu
Faz 4'te yapılan değişiklikler birçok dosyaya yayıldı. Görsel test (Bölüm 9) bu yüzden Faz 1-3'e göre daha uzun. Test eksik geçilirse subtle regression yakalanamaz — özellikle "canlı toggle testi" ve "G1 audio filter regression" kontrolleri kritik.

---

## 12. Faz 4 Tamamlandı Şartları

Aşağıdaki tüm maddeler ✓ olmadan Faz 4 tamamlanmış sayılmaz:

- [ ] `manifest.json`'da `"permissions": ["storage"]` eklendi; başka değişiklik yok
- [ ] `_locales/tr/messages.json` 13 key içeriyor (2 mevcut + 11 yeni)
- [ ] `_locales/en/messages.json` 13 key içeriyor (key isimleri TR ile birebir aynı)
- [ ] `block.css` 8 kural içeriyor (4 default + 4 override)
- [ ] `block.css` G1 audio-filter (`:not([href^="/reels/audio/"])`) hem default hem override kuralında korundu
- [ ] `redirect.js` settings okuma + onChanged listener + `applyBlockingClasses()` içeriyor
- [ ] `redirect.js` Faz 3 loop guard, regex sıralaması, polling parametreleri korunmuş
- [ ] `redirect.js` ve `popup.js`'deki DEFAULTS objeleri birebir aynı (7 key + schemaVersion)
- [ ] `popup.html` 7 toggle içeriyor, inline script/handler yok, external resource yok
- [ ] `popup.css` external resource yok, minimal stil
- [ ] `popup.js` IIFE wrap, `'use strict'`, i18n replacement + storage wire
- [ ] `README.md` "Mevcut durum" güncellendi: Faz 4 (Kullanıcı kontrolü ve ayarlar)
- [ ] Görsel test (Bölüm 9) yapıldı ve geçti — özellikle canlı toggle ve G1 audio-filter regression
- [ ] Eklenti devre dışı bırakılınca tüm IG normale dönüyor
- [ ] Konsola eklenti kaynaklı yeni hata düşmüyor
- [ ] Commit atıldı: `Phase 4: Popup UI with toggles and chrome.storage.local integration`
- [ ] Push için kullanıcı onayı alındı

---

## 13. README Güncelleme Görevi

`README.md` dosyasında **tek bir satır** değişecek:

```diff
- Bu proje fazlar halinde geliştirilmektedir. Mevcut durum: **Faz 3 (URL yönlendirme)**.
+ Bu proje fazlar halinde geliştirilmektedir. Mevcut durum: **Faz 4 (Kullanıcı kontrolü ve ayarlar)**.
```

**Sadece bu satır.** README'nin başka hiçbir yerine dokunma — "Ne yapar" listesi dahil. "Ne yapar" listesindeki özellikler hâlâ aktif (sadece artık kullanıcı kontrolünde); ekleme/silme yok.

Faz 4 commit'i içine dahil et, ayrı commit yapma.

---

## 14. Faz 5'e Hazırlık (Önizleme — İmplement ETME)

Faz 4 bittiğinde olası sonraki adımlar:

- **Faz 5 (Cilalama):** ESLint/Prettier'ın `package.json` ile gerçek kurulumu, `docs/selectors.md` ve `docs/threat-model.md` yazımı, ikon tasarımı.
- **Faz 6 (Test ve Paketleme):** Manuel test matrisi yazımı, eklentiyi `.zip` paketleyip kuru tarayıcıda deneme.
- **Faz 13 (Yayın):** Chrome Web Store + Mozilla AMO submission.

**Bunların HİÇBİRİNİ Faz 4'te yapma.** Faz 5 (veya doğrudan yayın hazırlığı) kılavuzu ayrıca gelecek.

---

## Son Not

Faz 4 projenin "kullanıcının elinde olma" anıdır. Faz 1-3 default davranışı kuran statik kurallardı; Faz 4 bunları toggle'lanabilir hale getiriyor. Mimari karar (default-true + class override) Faz 2-3 davranışını birebir koruyor — kurulumda hiçbir regression yok, sadece kullanıcının kapatma seçeneği var.

En büyük risk: çoklu dosya değişiklikleri arasında **drift** (popup.js DEFAULTS ≠ redirect.js DEFAULTS, TR/EN key uyumsuzluğu, block.css class isimleri redirect.js class isimleriyle uyumsuz). Bölüm 10 doğrulama komutları bu drift'leri yakalamak için tasarlandı — atla**ma**.

Şüphede sor. Faz 4 tamamlandığında kullanıcı Faz 5 (veya bir sonraki) kılavuzunu verecek.
