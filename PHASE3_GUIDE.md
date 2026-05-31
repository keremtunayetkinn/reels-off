# Faz 3 Implementation Guide — Claude Code İçin

> **Bu dosya Claude Code'a verilmek üzere hazırlanmıştır.** Eklentinin Faz 3 aşamasını (URL Redirect — `src/content/redirect.js` dosyasının doldurulması) doğru, eksiksiz ve Faz 1-2'deki kararlarla **çelişmeden** tamamlamak için kullanılır.
>
> **Kaynak otorite hiyerarşisi:** Bu kılavuz > MV3/WebExtensions resmi dokümantasyonu > `PHASE2_HANDOFF.md` > `PHASE1_HANDOFF.md`. **İstisna:** Bu kılavuzla MV3 spesifikasyonu çatışırsa MV3 üstündür — bu durumda DUR, sapmayı kullanıcıya bildir, onay al, sonra `PHASE2_HANDOFF.md` Bölüm 7'deki gibi şeffaf raporla.

---

## 0. Bu Dokümanı Nasıl Kullanmalısın

1. Önce **Bölüm 1**'i (Faz 1-2'den Devralınan Durum) oku — özellikle Bölüm 1.2'deki iki sapma (`_locales/` kök, G1 audio-filter) Faz 3'e taşınmamalı.
2. **Bölüm 2**'deki kapsam sınırlarını içselleştir. Faz 3 kasıtlı olarak dar: sadece `redirect.js`, sadece 3 URL pattern'i. Storage yok, toggle yok, popup yok.
3. Görevleri (Bölüm 5) **sıralı** yap. Her görev sonrası doğrulama.
4. **Loop guard (Bölüm 8) en kritik nokta** — yanlış pattern sonsuz redirect döngüsü üretir. Şablonu birebir kullan.
5. Şüphede kal, varsayma (Kural 7).
6. Faz 3 kapsamı dışına çıkma. block.css, manifest, popup, storage = Faz 3 DEĞİL.

---

## 1. Faz 1-2'den Devralınan Durum (Kritik)

### 1.1 — Repo State (PHASE2_HANDOFF.md ile doğrulandı)

```
Branch:        main (origin/main ile senkron — push yapıldı)
Remote:        https://github.com/keremtunayetkinn/reels-off.git (private)
Son commit:    ea51773 — Phase 2: CSS injection for Reels/Explore blocking
Working tree:  clean
Toplam commit: 5
```

**Faz 1 + 2'de oluşturulan ve Faz 3'te DOKUNULMAYACAK dosyalar:**
`manifest.json`, `LICENSE`, `PRIVACY-TR.md`, `PRIVACY-EN.md`, `.gitignore`, `.eslintrc.json`, `.prettierrc.json`, `_locales/tr/messages.json`, `_locales/en/messages.json`, ikonlar, `src/content/block.css` (Faz 2 outputu — DOKUNMA), `src/popup/*` (Faz 5).

**Faz 3'ün DOKUNACAĞI dosyalar (sadece 2):**
- `src/content/redirect.js` — şu an `// Faz 2'de doldurulacak` placeholder'ı (yorumdaki tarihi de güncellersin, aşağıda)
- `README.md` — "Mevcut durum" satırı güncellenecek (Bölüm 13)

### 1.2 — Önceki Fazların Sapmaları (DOKUNMA, AMA BİL)

| Sapma | Kaynak | Faz 3 etkisi |
|-------|--------|-------------|
| `_locales/` kök seviyede (`src/_locales/` DEĞİL) | Faz 1, commit `8c95378` | Faz 3 locale eklemiyor, ama eklersen yol kökte |
| G1 seçicisinde `:not([href^="/reels/audio/"])` audio-link filter | Faz 2, commit `ea51773`, Sapma 2 | `block.css`'e dokunma; G1 mantığını Faz 3 redirect'i bozmayacak şekilde sürdür |

### 1.3 — Mevcut manifest content_scripts bloğu (DEĞİŞTİRME)

Manifest zaten şunu içeriyor (Faz 3'te **olduğu gibi kalacak**):

```json
"content_scripts": [
  {
    "matches": ["https://www.instagram.com/*"],
    "css": ["src/content/block.css"],
    "js": ["src/content/redirect.js"],
    "run_at": "document_start"
  }
]
```

- `js: ["src/content/redirect.js"]` → Faz 3'te dolduracağın dosyaya zaten işaret ediyor. **Manifest'i değiştirmene gerek YOK.**
- `run_at: "document_start"` → Redirect için ideal: kullanıcı `/reels/`'e doğrudan gittiğinde IG'nin sayfa içeriği render olmadan önce yönlendirme yapılır, **flicker'sız**.
- `css: ["src/content/block.css"]` → Faz 2 outputu, korunur.

### 1.4 — Faz 2'den Faz 3'e taşınan tek görev sözü

Faz 2 README güncellemesi, "Ne yapar" listesine şu satırı ekledi:
> `/explore/` URL'lerine erişimi engelleyip ana sayfaya yönlendirir

Bu satır README'de **şu an söz veriyor ama implement edilmemiş** (Faz 2 sadece CSS yaptı). Faz 3'te `/explore/*` redirect'i implement edilerek bu söz yerine getirilecek. README'nin diğer söz verdikleri (`/reels/` redirect, `/reels/<id>/` redirect) de aynı dosyada implement edilecek.

---

## 2. Faz 3 Kapsamı ve Sınırları

### 2.1 — Faz 3'de YAPILACAK

`src/content/redirect.js` dosyasına **polling-based URL kontrol** yazarak şu 3 URL kategorisini ana sayfaya / profil sayfasına yönlendirmek:

| ID | URL pattern | Hedef | Gerekçe |
|----|-------------|-------|---------|
| F1a | `/reels/` (sidebar tıklaması) | `/` | Reels feed sayfasının kendisi |
| F1b | `/reels/<id>/` ve alt yollar (örn. `/reels/audio/<id>/`) | `/` | Doğrudan deep link veya reel id paylaşımı |
| F1c | `/<username>/reels/` ve `/<username>/reels` | `/<username>` | Profil Reels feed'i — kullanıcı profile geri döndürülür |
| E1 | `/explore/` ve `/explore/<anything>` | `/` | Tüm Explore yolları (Faz 2 README sözü) |

Tüm redirect'ler **her zaman aktif** olacak. Kullanıcı açma/kapama toggle'ları Faz 5'te eklenecek (popup + storage gerektirir).

### 2.2 — Faz 3'de YAPILMAYACAK (önemli sınırlar)

| Yapma | Sebep |
|-------|-------|
| ❌ `chrome.storage` kullanmak | Faz 5 (toggle'lar için). Faz 3'te storage entegrasyonu yok. |
| ❌ Popup UI veya toggle yazmak | Faz 5. |
| ❌ `block.css`'e dokunmak | Faz 2 outputu, kesinleşti. G1'in audio-filter'ı korunmalı. |
| ❌ `manifest.json`'ı değiştirmek | `run_at`, `js` referansı, izinler — hepsi doğru. |
| ❌ Yeni `permissions` eklemek | `webNavigation`, `tabs`, `scripting` — hiçbiri gerekmez. `host_permissions` yeterli. |
| ❌ `chrome.webNavigation.onHistoryStateUpdated` kullanmak | Ekstra izin gerektirir, Web Store inceleme için kırmızı bayrak. Polling yeterli. |
| ❌ `history.pushState`'i monkey-patch'lemeye çalışmak | Content script izole world'de; page context'in pushState'i patch'lenemez. (Faz 1 öncesi araştırmalarda doğrulandı.) |
| ❌ `world: "MAIN"` content script kullanmak | XSS yüzeyi açar, güvenlik kaybı. |
| ❌ MutationObserver kullanmak | URL değişikliği DOM olayı değil, gereksiz. Polling daha hedefli. |
| ❌ `location.href = url` kullanmak | History'ye eklenir, back tuşu reel'e döner. **Sadece `location.replace`.** |
| ❌ `_locales/`'e string eklemek | Saf JS redirect, kullanıcıya gösterilen metin yok. |

---

## 3. Mimari Kararlar (Faz 1-2'den Miras + Faz 3'e Özel)

| Karar | Gerekçe |
|-------|---------|
| **Polling (`setInterval`) ile URL takibi** | `history.pushState` izole world'den patch'lenemez. `chrome.webNavigation` ekstra izin gerektirir. Polling en sade ve izinsiz çözüm; doğrulanmış pattern. |
| **`location.replace()` (kesinlikle `location.href = ` DEĞİL)** | Geri tuşu Reels'e dönmesin (kullanıcının yönlendirildiği yerden çıkması zor olur). Birden fazla kaynakta best practice olarak teyitli. |
| **300ms polling interval** | 250-500ms aralığı sweet spot. 300ms reels'in oynamaya başlamasından önce yakalamak için yeterli; CPU yükü ihmal edilebilir. |
| **1 saniye redirect-sonrası polling duraklatma** | `location.replace` çağrısı sonrası navigation tamamlanana kadar polling tekrar tetiklenmesin → loop guard. |
| **IIFE wrapping + `'use strict'`** | Content script zaten izole world; ek savunma olarak global scope kirliliği önlenir, hatalar erken yakalanır. |
| **Regex tabanlı URL eşleşmesi** | Trailing slash varyasyonları (`/reels` vs `/reels/`) ve alt yolları (`/reels/audio/`) tek desenle yakalar. Path parsing manuel yapılırsa edge case kaçar. |
| **`document_start` korunur** | Manifest'te zaten ayarlı. Initial tick (script load anında) doğrudan navigation'ı yakalar — IG kodunun render başlamasından önce. |
| **Toggle entegrasyonu YOK** | Faz 5 işi. Kuralları "her zaman aktif" tut; Faz 5'te storage check eklenecek. |

---

## 4. URL Pattern'leri ve Davranışları

### F1a — `/reels/` (Reels feed, sidebar tıklaması)
- **Regex:** `^/reels(\/|$)`
- **Hedef:** `/`
- **Eşleşen URL'ler:** `/reels/`, `/reels`
- **Eşleşmeyenler:** `/instagram/reels/` (profile reels — F1c yakalar)

### F1b — `/reels/<id>/` (deep link, reel id)
- **Regex:** F1a ile aynı (`^/reels(\/|$)`)
- **Hedef:** `/`
- **Eşleşen URL'ler:** `/reels/ABC123/`, `/reels/audio/XYZ/`, `/reels/audio/`
- **Not:** Audio link redirect'e dahildir (block.css'te G1 filter'ında **hariç** tutulması foto post'ları gizlememek içindi; URL redirect ayrı bir kontroldür ve kullanıcı `/reels/audio/<id>/`'ye giderse reel listesi sayfası gelir → engellenmeli).

### F1c — `/<username>/reels/` (profil Reels feed'i)
- **Regex:** `^/([^/]+)/reels(\/|$)`
- **Hedef:** `/` + yakalanan username (örn. `/instagram`)
- **Eşleşen URL'ler:** `/instagram/reels/`, `/anyuser/reels`
- **Eşleşmeyenler:** `/reels/` (F1a yakalar, regex sıralaması bu yüzden önemli)
- **Hedef seçimi gerekçesi:** Kullanıcı profile gezerken Reels tab'ına yanlışlıkla tıklarsa profile geri dönsün — ana sayfaya değil.

### E1 — `/explore/` ve alt yolları
- **Regex:** `^/explore(\/|$)`
- **Hedef:** `/`
- **Eşleşen URL'ler:** `/explore/`, `/explore/locations/Istanbul/`, `/explore/tags/<tag>/`, `/explore/search/`
- **Faz 2 README sözünü tamamlar.**

### Regex sıralaması neden önemli
Kontrol sırası: **F1a/b → E1 → F1c.** Çünkü:
- `/reels/<id>/` URL'i hem F1a (`^/reels`) hem teorik olarak F1c'ye benzer görünür, ama F1c'nin `[^/]+` username yakalayıcısı `reels`'i de yakalayabilirdi. Doğru sıra: önce F1a, eşleşmezse F1c.
- `/explore/<anything>` URL'i de username olarak `explore` yakalayabilir; E1 önce kontrol edilir.

### Edge case'ler (test edilmiş, yan etki yok)
- `/` → hiçbir regex eşleşmez → redirect yok ✓
- `/instagram/` (normal profile) → hiçbir regex eşleşmez → redirect yok ✓
- `/p/<id>/` (foto post) → hiçbir regex eşleşmez → redirect yok ✓
- `/reel/<id>/` (tekil reel, dikkat: `reel` tekil, `reels` çoğul) → hiçbir regex eşleşmez (kasıtlı: bu URL feed reel post'larında kullanılır ama küçük; G1 CSS ile zaten gizleniyor)
- `/accounts/login/` → hiçbir regex eşleşmez → redirect yok ✓

---

## 5. Görev Listesi

### Görev 5.1 — Mevcut state'i doğrula
Repo'ya girdiğinde Faz 2 state'inin bozulmadığını teyit et (Bölüm 10 komutları). Özellikle:
- `git status` clean mi?
- `src/content/redirect.js` hâlâ placeholder mı?
- `src/content/block.css` Faz 2'deki gibi 4 kural içeriyor mu (A1, A2, D1, G1)?
- `manifest.json` content_scripts.js `src/content/redirect.js`'e mi işaret ediyor?

Bir tutarsızlık görürsen DUR, kullanıcıya bildir.

### Görev 5.2 — `redirect.js`'i Bölüm 6 şablonuyla doldur
`src/content/redirect.js` dosyasının tamamını sil ve Bölüm 6'daki kodu birebir koy. ESLint kurallarına uyumlu (no-var, prefer-const, eqeqeq, no-eval). Prettier formatına uyumlu (single quote, 2-space indent, semi).

### Görev 5.3 — README "Mevcut durum" satırını güncelle (Bölüm 13)
README "Mevcut durum: **Faz 1 (Proje iskeleti)**" satırı **Faz 3 (URL yönlendirme)** ile değiştir. Sadece bu satır; README'nin başka hiçbir yerine dokunma.

### Görev 5.4 — Görsel test (kullanıcı yapar)
`redirect.js` yazıldıktan sonra kullanıcı eklentiyi yükleyip Bölüm 9'daki görsel test checklist'ini uygular. Test geçmeden commit etme.

### Görev 5.5 — Commit
Tüm testler geçince:
```bash
git add src/content/redirect.js README.md
git commit -m "Phase 3: URL redirect for Reels and Explore paths (polling-based)"
```

**Push'tan önce kullanıcı onayı bekle.**

---

## 6. `src/content/redirect.js` Şablonu

Aşağıdaki içeriği **birebir** kullan. Tek karakter değiştirme.

```javascript
/*
 * Reels Off — redirect.js
 * Faz 3: URL Redirect (polling-based)
 *
 * Amaç: Instagram'ın Reels (/reels/, /reels/<id>/, /<user>/reels/) ve
 *   Explore (/explore/*) URL'lerine yapılan navigasyonları engelleyip
 *   güvenli bir hedefe yönlendirmek.
 *
 * Strateji: Polling (setInterval) ile location.pathname kontrolü.
 *   history.pushState content script'in izole world'ünden patch'lenemez;
 *   chrome.webNavigation ekstra izin gerektirir. Polling, izinsiz ve
 *   güvenilir SPA URL değişiklik tespiti olarak seçildi.
 *
 * Geri-alınabilirlik: location.replace() kullanılır — back tuşu reel
 *   sayfasına dönmez (history stack'e eklenmez).
 *
 * Loop guard: Her redirect sonrası polling 1 saniye duraklatılır;
 *   navigation'ın location.pathname'i güncellemesi için zaman tanınır.
 *
 * Kapsam (README ile tutarlı):
 *   F1a — /reels/                  → /                [aktif]
 *   F1b — /reels/<id>/, alt yollar → /                [aktif]
 *   F1c — /<username>/reels/       → /<username>      [aktif]
 *   E1  — /explore/, /explore/<x>  → /                [aktif]
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

  let pollingPaused = false;

  function computeRedirect(pathname) {
    // Sıralama önemli: F1a/b önce, E1 sonra, F1c en son.
    if (REELS_RE.test(pathname)) return '/';
    if (EXPLORE_RE.test(pathname)) return '/';
    const match = pathname.match(PROFILE_REELS_RE);
    if (match) return '/' + match[1];
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

  // İlk kontrol document_start anında — kullanıcı doğrudan /reels/'e gelmişse
  // IG kodunun render başlamasından önce redirect tetiklenir (flicker yok).
  tick();

  // SPA navigation (history.pushState) için periyodik kontrol.
  window.setInterval(tick, POLL_INTERVAL_MS);
})();
```

**Format kuralları:**
- `'use strict'` zorunlu.
- IIFE wrap zorunlu (`(function () { ... })();`).
- `const` constant'lar için, `let` mutable state için. `var` YASAK (ESLint kuralı).
- Tek tırnak (`'`) string'ler için (Prettier kuralı).
- 2-space indent, satır sonu LF (Prettier kuralı).
- Semicolon kullan (Prettier kuralı).
- `===` (eqeqeq, ESLint).

---

## 7. Sıkı Kısıtlamalar (DO NOT)

### Kategori: Kapsam
- ❌ Storage entegrasyonu eklemeyin — Faz 5 işi.
- ❌ Toggle/popup kontrolü eklemeyin — Faz 5.
- ❌ `block.css`'e dokunmayın — Faz 2 kesinleşti, G1 audio-filter kritik.
- ❌ Manifest'i değiştirmeyin — content_scripts hâlihazırda doğru.

### Kategori: API
- ❌ `chrome.webNavigation` — ekstra izin, Faz 3 ona ihtiyaç duymuyor.
- ❌ `chrome.tabs` — content script'te zaten erişim yok, gerekmez de.
- ❌ `chrome.storage` — Faz 5.
- ❌ `chrome.runtime.sendMessage` — service worker yok zaten.

### Kategori: Redirect mantığı
- ❌ `location.href = url` — history kirlenir, back tuşu reel'e döner. Sadece `location.replace()`.
- ❌ `window.location = url` — yukarıyla aynı sorun.
- ❌ `location.assign(url)` — yukarıyla aynı sorun.
- ❌ `history.replaceState` ile sadece URL değiştirmek — sayfa içeriği IG'nin reel kodu olarak kalır, yetersiz.
- ❌ `history.pushState`'i monkey-patch'lemeye çalışmak — izole world'de page context'in pushState'i değiştirilemez.
- ❌ `world: "MAIN"` content script'e geçmek — XSS yüzeyi.

### Kategori: URL eşleştirme
- ❌ String içerik kontrolüyle (`pathname.includes('/reels')`) eşleştirme — `/p/reels-photo/` gibi false positive'leri yakalar.
- ❌ Regex'i sıralamadan kontrol etme — `/instagram/reels/` URL'i F1c yerine yanlış pattern'e takılabilir.
- ❌ Username olarak rezerve kelimeleri (`reels`, `explore`) yakalamak — regex sıralaması bunları önce filtreliyor; sıralamayı bozma.

### Kategori: Polling
- ❌ `setInterval`'ı `setTimeout` recursion ile değiştirme — gereksiz karmaşıklık, leak riski.
- ❌ Polling interval'ını 100ms altına çekme — CPU yükü.
- ❌ Polling interval'ını 1000ms üstüne çıkarma — reel oynamadan önce yakalayamayız.
- ❌ Loop guard'ı çıkarma veya azaltma — navigation tamamlanmadan polling tetiklenirse double-redirect olur.

### Kategori: Genel
- ❌ JavaScript dışında bir dosya değiştirme (manifest, block.css, locale'ler).
- ❌ `eval`, `new Function`, `setTimeout(string)` — ESLint zaten engelliyor.
- ❌ External network çağrısı (`fetch`, `XMLHttpRequest`) — eklenti hiçbir sunucuya bağlanmaz.
- ❌ `console.log` bırakmak — production'a uygun değil, ESLint warn veriyor zaten. `console.warn`/`console.error` gerçek hatalarda OK.
- ❌ Yorum dışında Türkçe metin yazmak — hardcoded i18n riski.

---

## 8. Loop Guard ve Polling Mantığı (Özel Bölüm)

Faz 3'ün **en yüksek risk noktası** sonsuz redirect döngüsüdür. Şablonu birebir uygulamadan riski anlaman lazım.

### Senaryo: Loop nasıl oluşabilir?
1. Kullanıcı `/reels/`'e gider.
2. `tick()` çalışır, `computeRedirect('/reels/')` → `'/'` döner.
3. `location.replace('/')` çağrılır.
4. **Navigation başlar ama hemen tamamlanmaz** — birkaç ms içinde `location.pathname` hâlâ `/reels/` olabilir.
5. 300ms sonra bir `tick()` daha tetiklenir.
6. Eğer guard yoksa: yine `/reels/` görür, yine `location.replace('/')` çağırır.
7. Tarayıcı navigation kuyruğu kirlenir, en kötü ihtimalle "Too many redirects" hatası veya yavaşlama.

### Guard pattern (şablonda zaten var)
```javascript
if (target !== null && target !== location.pathname) {
  pollingPaused = true;
  window.setTimeout(() => {
    pollingPaused = false;
  }, PAUSE_AFTER_REDIRECT_MS);  // 1 saniye
  location.replace(target);
}
```

İki katmanlı koruma:
1. **`target !== location.pathname`** kontrolü — hedef ile mevcut aynıysa redirect etme. `/` hedefine `'/'` pathname'inden tekrar yönlendirme olmaz.
2. **`pollingPaused` flag** — redirect tetiklendiği anda 1 saniye polling kapalı; navigation tamamlanması için zaman tanır.

### Polling interval seçimi (300ms)
- 100ms: CPU yükü gereksiz; URL değişikliği saniyede 10 kez kontrol gerekmez.
- 300ms: Reels otomatik play başlamadan önce yakalanır (otomatik play ~500ms gecikmeli).
- 500-700ms: Sınırda; bazı durumda reel'in başlangıç frame'i görünebilir.
- 1000ms+: Reel'in ilk saniyesi görünür → kabul edilemez.

**Şablon 300ms ile sabitli. Değiştirme.**

### `document_start`'taki initial tick neden önemli?
Manifest `run_at: "document_start"` ayarlı, yani redirect.js IG'nin sayfa içeriği render olmadan önce çalışır. Şablondaki:
```javascript
tick();  // initial — setInterval beklemeden hemen
window.setInterval(tick, POLL_INTERVAL_MS);
```
İlk satır kritik: kullanıcı doğrudan `/reels/`'e geldiyse (bookmark, share link, yazma), reel kodu ekranda görünmeden önce redirect olur. Bu **flicker'sız** kullanıcı deneyimi sağlar.

---

## 9. Görsel Test Checklist (Kullanıcı Tarayıcıda Yapar)

Eklentiyi `chrome://extensions/` → "Reload" ile yenile (yeni redirect.js'i yüklesin) → testleri yap:

### F1a — `/reels/` ana feed
- [ ] Tarayıcıya `instagram.com/reels/` yaz, Enter bas → **otomatik olarak `instagram.com/`'a yönlendiriliyor** (flicker var mı kontrol et — ideal: yok).
- [ ] Geri tuşuna bas → Reels sayfasına **dönmüyor** (önceki sayfaya gidiyor veya yeni sekmedeyse browser hint görünüyor).

### F1b — Deep link / reel ID
- [ ] `instagram.com/reels/ABC123/` gibi (random ID, kişisel veri kullanma) bir URL'e git → **`/`'a yönlendiriliyor**.
- [ ] `instagram.com/reels/audio/XYZ/` (varsa) → **`/`'a yönlendiriliyor**.

### F1c — Profil Reels feed
- [ ] `instagram.com/instagram/reels/` (Instagram'ın kendi resmi hesabı, public) → **`instagram.com/instagram`'a yönlendiriliyor** (profile, Reels tab değil).
- [ ] Reels tab'ı zaten Faz 2'de gizlendi (D1); URL ile bypass deneyince yine de redirect oluyor → çift güvence çalışıyor.

### E1 — Explore
- [ ] `instagram.com/explore/` → **`/`'a yönlendiriliyor**.
- [ ] `instagram.com/explore/locations/` (varsa) → **`/`'a yönlendiriliyor**.
- [ ] `instagram.com/explore/tags/something/` → **`/`'a yönlendiriliyor**.

### Sağlık kontrolü
- [ ] `instagram.com/` (ana sayfa) → hiçbir yönlendirme yok, normal yükleniyor.
- [ ] `instagram.com/instagram/` (profile) → hiçbir yönlendirme yok, profile normal yükleniyor.
- [ ] `instagram.com/p/<photo-id>/` (foto post) → hiçbir yönlendirme yok.
- [ ] DM, arama, bildirim sayfaları → normal çalışıyor.

### Geri-alınabilirlik
- [ ] Eklenti devre dışı bırakıldığında `/reels/` ve `/explore/` URL'leri yine açılabiliyor.
- [ ] Faz 2 CSS engellemeleri hâlâ çalışıyor (sidebar Reels/Keşfet linkleri gizli, profil Reels tab gizli, feed reel post'ları gizli).

### Loop kontrol (özel — Faz 3'ün en kritik testi)
- [ ] `/reels/` → `/` redirect'inden sonra ana sayfada **takılma, donma, "Too many redirects" hatası yok**.
- [ ] Console'da `[redirect.js]` veya `Maximum call stack` benzeri hata yok.
- [ ] Tarayıcı sekme başlığı veya URL bar'da hızlı flaşlama / titreşim yok.

### Konsol kontrolü
- [ ] Console'a eklenti kaynaklı yeni hata düşmüyor. (Faz 2'deki IG/başka eklenti kaynaklı 17 hata aynı kalmış olabilir, bunlar Reels Off değil.)

---

## 10. Doğrulama Komutları

```bash
# 1. Faz 2 dosyaları korundu mu? (sadece redirect.js ve README değişmeli)
git status --short
# Çıktıda sadece: M src/content/redirect.js  ve  M README.md  olmalı

# 2. redirect.js boş veya placeholder olmasın
test -s src/content/redirect.js && wc -l src/content/redirect.js
# 40-70 satır arası beklenir

# 3. Yasaklı API'ler var mı? (hiçbiri olmamalı)
grep -nE "chrome\.(webNavigation|tabs|storage|runtime)" src/content/redirect.js && echo "✗ HATA: yasaklı chrome API" || echo "✓ Temiz"

# 4. location.href atama YASAK
grep -nE "location\.href\s*=" src/content/redirect.js && echo "✗ HATA: location.href atama" || echo "✓ Sadece location.replace"

# 5. location.replace KULLANILIYOR
grep -c "location\.replace(" src/content/redirect.js
# 1 olmalı

# 6. var YASAK
grep -nE "\bvar\b" src/content/redirect.js && echo "✗ HATA: var bulundu" || echo "✓ const/let"

# 7. eval / new Function YASAK
grep -nE "\b(eval|new Function)" src/content/redirect.js && echo "✗ HATA: dinamik kod" || echo "✓ Temiz"

# 8. fetch / XMLHttpRequest YASAK (network çağrısı yok)
grep -nE "\b(fetch|XMLHttpRequest)\b" src/content/redirect.js && echo "✗ HATA: network çağrısı" || echo "✓ Network çağrısı yok"

# 9. Manifest değişmemiş
git diff manifest.json
# Çıktı BOŞ olmalı

# 10. block.css değişmemiş
git diff src/content/block.css
# Çıktı BOŞ olmalı

# 11. _locales değişmemiş
git diff _locales/
# Çıktı BOŞ olmalı

# 12. README sadece bir satır değişti (Mevcut durum)
git diff README.md | grep -E "^[+-]" | grep -v "^+++\|^---"
# Sadece 2 satır göstermeli (eski "-Faz 1" ve yeni "+Faz 3")

# 13. ESLint syntax check (eğer node kuruluysa)
# npx eslint src/content/redirect.js --no-eslintrc -c .eslintrc.json
# (npm kurulmadıysa atla — Prettier/ESLint sadece referans)
```

---

## 11. Halüsinasyon Önleme Kuralları

`PHASE1_HANDOFF.md` Bölüm 2'deki 8 kural + `PHASE2_GUIDE.md` Kural 9-10 hâlâ geçerli. Faz 3'e özel ek kurallar:

### Kural 11 — Polling parametrelerini keyfi değiştirme
`POLL_INTERVAL_MS = 300` ve `PAUSE_AFTER_REDIRECT_MS = 1000` doğrulanmış değerler. "Daha hızlı yakalasın diye 100ms yapayım" YASAK. "Garantili olsun diye 2 saniye yapayım" YASAK. Kullanıcı açıkça istemedikçe sayılar değişmez.

### Kural 12 — Yasaklı API'leri "iyileştirme" amacıyla bile ekleme
`chrome.webNavigation` daha "doğru" gibi görünebilir (gerçek navigation event'leri verir). Eklemeyin. Ekstra izin = Web Store reviewer için ekstra justification, kullanıcı install prompt'unda ekstra uyarı. Polling yeterli.

### Kural 13 — Regex sıralamasına dokunma
F1a/b → E1 → F1c sıralaması kasıtlı. Sıralamayı değiştirme. Yeni regex eklemek istersen DUR ve kullanıcıya sor.

### Kural 14 — `location.replace` dışına çıkma
`location.href = ...`, `window.location = ...`, `location.assign(...)` — hepsi history'yi kirletir. Geri-alınabilirlik bozulur. Sadece `replace`.

### Kural 15 — Loop guard'ı "basitleştirme"
İki katmanlı guard (`target !== location.pathname` + `pollingPaused`) zorunlu. Tek katman yetmez (race condition vardır). Çıkarma, sadeleştirme, optimize etme.

### Kural 16 — Polling'i event-driven yapmaya çalışma
`history.pushState` patch'i, `popstate` event'i, `chrome.webNavigation`, `MutationObserver` — hiçbiri Faz 3'te yok. Polling'in dezavantajları biliniyor ve kabul edildi (300ms gecikme); değiştirme.

### Faz 3'e özel canlı doğrulama notu
Faz 2'deki gibi, Faz 3'ün de Instagram canlı testte doğrulanması gerekiyor. Senin (Claude Code) Instagram'a erişimin yok; görsel testi kullanıcı yapacak. Test geçmeden "tamamlandı" deme.

Test sırasında **loop fark edilirse** (tarayıcı donar, "too many redirects" hatası, URL bar'da hızlı flaşlama):
- DUR, kullanıcıyı uyar.
- redirect.js'i yorumla geçici devre dışı bırakmayı öner.
- Sebebi analiz et: hangi URL'de oldu? Loop guard çalıştı mı?
- Şablona dön, sapma yaptıysan geri al.

---

## 12. Faz 3 Tamamlandı Şartları

Aşağıdaki tüm maddeler ✓ olmadan Faz 3 tamamlanmış sayılmaz:

- [ ] `src/content/redirect.js` Bölüm 6 şablonuyla dolduruldu (birebir)
- [ ] IIFE wrap + `'use strict'` mevcut
- [ ] 3 URL pattern (REELS_RE, EXPLORE_RE, PROFILE_REELS_RE) tanımlı
- [ ] `computeRedirect()` ve `tick()` fonksiyonları şablondaki gibi
- [ ] `location.replace` kullanılıyor (`location.href = ` YOK)
- [ ] Loop guard iki katmanlı (target check + pollingPaused flag)
- [ ] Initial tick (script load anında) + setInterval (devam eden) ikisi de var
- [ ] Hiçbir yasaklı API (`chrome.webNavigation`, `chrome.tabs`, `chrome.storage`, `chrome.runtime`) kullanılmamış
- [ ] Hiçbir dış network çağrısı (`fetch`, `XMLHttpRequest`) yok
- [ ] `eval`, `new Function`, `var` yok (ESLint kuralları)
- [ ] `console.log` production'a düşmüyor
- [ ] `manifest.json`, `block.css`, `_locales/`, popup dosyaları DEĞİŞMEDİ
- [ ] `README.md`'de sadece "Mevcut durum" satırı değişti (Faz 1 → Faz 3)
- [ ] Görsel test (Bölüm 9) kullanıcı tarafından yapıldı ve geçti
- [ ] Loop kontrol testi (Bölüm 9, özel) geçti — donma/flicker yok
- [ ] Eklenti devre dışı bırakılınca Reels/Explore URL'leri normal açılıyor (geri-alınabilirlik)
- [ ] Konsola eklenti kaynaklı yeni hata düşmüyor
- [ ] Commit atıldı: `Phase 3: URL redirect for Reels and Explore paths (polling-based)`
- [ ] Push için kullanıcı onayı alındı

---

## 13. README Güncelleme Görevi (Önemli)

`README.md` dosyasında **tek bir satır** değişecek. Şu an:

```markdown
Bu proje fazlar halinde geliştirilmektedir. Mevcut durum: **Faz 1 (Proje iskeleti)**.
```

Yeni hali:

```markdown
Bu proje fazlar halinde geliştirilmektedir. Mevcut durum: **Faz 3 (URL yönlendirme)**.
```

**Sadece bu satır.** README'nin başka hiçbir yerine dokunma. "Ne yapar", "Ne yapmaz", "Kurulum", "Lisans" — hepsi olduğu gibi kalsın.

**Not:** PHASE2_HANDOFF.md, Faz 2 sonu yapılması beklenen bir görevdi (handoff bunu "açık görev" olarak belirtti). O fazda kullanıcı açıkça istemediği için Claude Code disiplinli davranıp dokunmadı (uygun davranış). Faz 3'te bu açık görevi tamamlıyoruz. Aynı `git commit`'in parçası olsun — ayrı commit yapma.

---

## 14. Faz 4-5'e Hazırlık (Önizleme — İmplement ETME)

Faz 3 bittiğinde sıradaki faz **Faz 4** veya doğrudan **Faz 5 (Popup + Toggle + Storage)** olacak. Kullanıcı bu kararı verecek. Bu bölüm sadece bağlam için, görev değil (Kural 6).

**Faz 5 geldiğinde Faz 3 redirect.js refactor edilebilir:**
- `chrome.storage.local`'dan `{ blockReels: bool, blockExplore: bool, blockProfileReels: bool }` okunacak
- `computeRedirect()` fonksiyonu storage'a göre koşullu çalışacak
- Storage değişikliği canlı uygulanacak (`chrome.storage.onChanged`)

Aynı şekilde `block.css` refactor edilebilir:
- CSS kuralları root class'a (`html.ro-block-X`) gate edilecek
- JS, storage'dan okuyup root class'ı toggle edecek
- **G1 audio-filter korunmalı** (Faz 2 Sapma 2)

**Bunların HİÇBİRİNİ Faz 3'te yapma.** Faz 4-5 kılavuzu geldiğinde uygulanır.

---

## Son Not

Faz 3 kasıtlı olarak dar ve yüksek kararlı: tek JS dosyası, 3 URL pattern, polling-based mantık, loop guard, geri-alınabilir redirect. En büyük risk loop'tur — şablona sıkı uy, polling parametrelerini değiştirme, `location.replace` dışına çıkma. Bir şey net değilse kullanıcıya sor. Faz 3 tamamlandığında kullanıcı Faz 4/5 kılavuzunu verecek.
