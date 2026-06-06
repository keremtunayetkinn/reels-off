# Reels Off — Seçici Envanteri

Bu belge, eklentinin Instagram DOM ve URL şeması üzerinde kullandığı tüm
aktif seçicileri (CSS + URL regex) ve bunların kaynağını, güven seviyesini,
bilinen kırılganlıklarını listeler. Yalnız [`src/content/block.css`](../src/content/block.css)
ve [`src/content/redirect.js`](../src/content/redirect.js) içeriğinden +
geçmiş handoff'lardan doğrulanmış bilgi içerir; yeni iddia yoktur.

**Strateji özeti:** Instagram, atomic CSS class isimlerini obfuscated
(`x1qjc9v5`, `_aaa1` vb.) ve sık sık döner. `href` routing değerleri ise
ürün davranışıyla bağlıdır ve çok daha kararlıdır. Bu nedenle tüm seçiciler
**class değil, href tabanlıdır**. Belge tarihi: 2026-06-06.

---

## 1. CSS Seçicileri

| ID  | Hedef                                | Toggle key             | Güven                                                | Son doğrulama                              |
| --- | ------------------------------------ | ---------------------- | ---------------------------------------------------- | ------------------------------------------ |
| A1  | Sol kenar çubuğu Reels linki         | `blockSidebarReels`    | Yüksek                                               | Faz 0                                      |
| A2  | Sol kenar çubuğu Keşfet linki        | `blockSidebarExplore`  | Yüksek                                               | Faz 0                                      |
| D1  | Profil sayfası Reels sekmesi         | `blockProfileReelsTab` | Yüksek                                               | Faz 0                                      |
| G1  | Feed'e gömülü tekil Reel gönderileri | `blockFeedReelPosts`   | Yüksek (DOM seviyesi); UX'te bilinen sorun (aşağıda) | 2026-05-28 (canlı), 2026-06-05 (DOM ölçüm) |

### A1 — Sidebar Reels linki

```css
a[href='/reels/'] {
  display: none !important;
}
html.ro-disable-sidebar-reels a[href='/reels/'] {
  display: revert !important;
}
```

- **Mantık:** Tam eşleme `href='/reels/'` yalnız sidebar linkini yakalar; feed
  reel post'ları `/reels/<id>/` formatında olduğundan hariç kalır.
- **Kırılganlık:** IG sidebar'ı `<a>` yerine button + onClick'e çevirirse seçici
  düşer. Bugüne kadar gözlemlenmedi.

### A2 — Sidebar Keşfet linki

```css
a[href='/explore/'] {
  display: none !important;
}
html.ro-disable-sidebar-explore a[href='/explore/'] {
  display: revert !important;
}
```

- **Mantık:** Tam eşleme; `/explore/locations/`, `/explore/search/` gibi alt
  yollar hariç kalır (Keşfet sayfasına gidip alt-sekmeleri kullanmak isteyen
  kullanıcı için).
- **Kırılganlık:** A1 ile aynı.

### D1 — Profil sayfası Reels sekmesi

```css
main a[href$='/reels/']:not([href='/reels/']) {
  display: none !important;
}
html.ro-disable-profile-reels-tab main a[href$='/reels/']:not([href='/reels/']) {
  display: revert !important;
}
```

- **Mantık:** `main` içinde `/<username>/reels/` ile biten link; tam `/reels/`
  (sidebar A1) hariç tutulur.
- **Not:** IG profil tab'ları `role="link"` + `aria-selected` hibrit yapısı
  kullanır (`role="tab"` DEĞİL); bu nedenle href suffix ile hedefleniyor.
- **Kırılganlık:** IG profil tab yapısını `role="tab"`'a geçirirse seçici
  görünürde çalışır ama semantik hizalama bozulur.

### G1 — Feed tekil Reel gönderileri

```css
article:has(a[href^='/reels/']:not([href='/reels/']):not([href^='/reels/audio/'])) {
  display: none !important;
}
html.ro-disable-feed-reel-posts
  article:has(a[href^='/reels/']:not([href='/reels/']):not([href^='/reels/audio/'])) {
  display: revert !important;
}
```

- **Mantık:** İçinde reel post linki (`/reels/<id>/`) bulunan `<article>`'ı
  hedefler. **Audio-link filter** (`:not([href^='/reels/audio/'])`) — Faz 2
  Sapma 2 ile eklendi: müzik etiketli foto post'lar `/reels/audio/<id>/`
  linki içerir; bu filtre olmadan o post'lar yanlışlıkla gizlenirdi. **KORUNMUŞ
  envanter.**
- **DOM doğrulaması (Faz 5 KN1, 2026-06-05):** 5/5 örnekte eşleşen article
  `innerArticleCount: 0` (leaf article); her birinde `hasVideo: true`. Yani
  G1 yakaladığı article'lar gerçekten leaf reel post'larıdır.
- **Bilinen UX sorunu (Faz 5 KN2, 2026-06-05):** Derin scroll'da (~7-8 post
  sonra) feed'de **siyah boşluk** ve **scroll jitter** ortaya çıkar. A/B
  testi semptomun G1'e bağlı olduğunu gösterdi (toggle OFF → semptom kayboldu).
- **Denenen ve başarısız fix:** `article:not(:has(article))` ile leaf-only
  kısıtı uygulandı; semptomu çözmedi. Kapsayıcı article hipotezi DOM verisiyle
  çürütüldü (innerArticleCount herhangi article'da > 0 değil). Gerçek
  mekanizma muhtemelen şudur: `display: none` IG'nin virtualized feed spacer
  hesabını bozar → eksik yükseklik = siyah boşluk + jitter.
- **Kapsam kararı:** Faz 5'te dokümante edildi, uygulamaya alınmadı. Kullanıcı
  rahatsız olursa popup'tan `blockFeedReelPosts` toggle'ı ile kapatabilir.
  Layout-aware gizleme yaklaşımı (örn. `height: 0; overflow: hidden`) Faz 5+
  konusudur.
- **Uzun-vade IG redesign riski:** Faz 2 handoff'tan beri not edilen
  "periyodik yeniden değerlendirme" önerisi; Faz 4'te yeniden manifest oldu.
  IG bir gün reel post `<article>`'ının içine başka `<article>` gömerse
  (örn. embed quote post), G1 seçicisi reel post'u "yaprak" olmaktan
  çıkarmadığı için yine çalışır ama ileride bu yapı değişimini izlemek
  gerekebilir.

---

## 2. URL Redirect Regex'leri

[`redirect.js`](../src/content/redirect.js) içinde `document_start` polling
ile, kullanıcı `/reels/`, `/explore/` veya `/<user>/reels/` adreslerinden
birine girince güvenli bir alternatife yönlendirir.

| ID      | Eşleştirilen yol            | Yönlendirme hedefi     | Toggle key             |
| ------- | --------------------------- | ---------------------- | ---------------------- |
| F1a/F1b | `/reels/`, `/reels/<id>/`   | `/` (ana sayfa)        | `redirectReels`        |
| E1      | `/explore/` ve alt yolları  | `/` (ana sayfa)        | `redirectExplore`      |
| F1c     | `/<username>/reels/` (alt-) | `/<user>` (profil ana) | `redirectProfileReels` |

Regex sabitleri ([`redirect.js`](../src/content/redirect.js) içinde):

```js
const REELS_RE = /^\/reels(\/|$)/;
const EXPLORE_RE = /^\/explore(\/|$)/;
const PROFILE_REELS_RE = /^\/([^/]+)\/reels(\/|$)/;
```

### Sıralama (Kural — KORUNMUŞ envanter)

[`computeRedirect`](../src/content/redirect.js) içinde sıra önemli:

```
F1a/b  (REELS_RE)         önce
E1     (EXPLORE_RE)       sonra
F1c    (PROFILE_REELS_RE) en son
```

Aksi durumda F1c'nin `[^/]+` username yakalayıcısı `/reels/...`'i de
yakalayabilirdi (`reels` kelimesini username sanırdı).

### Polling parametreleri (KORUNMUŞ envanter — Faz 3 doğrulanmış sweet spot)

- `POLL_INTERVAL_MS = 300` — SPA navigation kontrolü
- `PAUSE_AFTER_REDIRECT_MS = 1000` — bir redirect sonrası bu süre kadar
  yeni redirect tetiklenmez (loop guard'ın bir katmanı)

### Loop guard (iki katmanlı, KORUNMUŞ envanter)

```js
if (target !== null && target !== location.pathname) { ...redirect... }
```

ile her redirect sonrasında `pollingPaused = true` (1 saniye). Bu iki katman
sonsuz redirect döngüsünü önler.

### Redirect yöntemi (KORUNMUŞ envanter)

Daima `location.replace(target)` — `location.href = target` **asla**
kullanılmaz. Sebep: geri tuşu kullanıcıyı reel'e geri döndürmesin.

---

## 3. Yeni Toggle Ekleme Prosedürü

[Faz 5 G5.3](../PHASE5_GUIDE.md) kararı: `DEFAULTS` objesi
[`redirect.js`](../src/content/redirect.js) ve [`popup.js`](../src/popup/popup.js)
içinde _duplicate-but-verified_ pattern ile tutuluyor. Yeni toggle eklerken
ikisinin senkronize kalması için aşağıdaki sırayı izle:

1. **`src/content/redirect.js`** içinde `DEFAULTS` objesine yeni key ekle
   (varsayılan: `true` — engelleme/yönlendirme default-aktif politikası,
   Faz 4 Kural 19).
2. **`src/popup/popup.js`** içinde `DEFAULTS` objesine **aynı key**i ekle.
   Karakter-karakter eşleşmeli.
3. **`src/popup/popup.html`** içinde yeni `<label class="toggle">` bloğu:
   - `<input type="checkbox" data-key="newKey" />`
   - `<span data-i18n="toggleNewKeyLabel"></span>`
4. **`_locales/tr/messages.json`** ve **`_locales/en/messages.json`**
   içinde `"toggleNewKeyLabel"` ekle (TR + EN birebir aynı sayıda key
   olmalı — Faz 4 zorunluluğu).
5. **Gizleme toggle'ı ise:**
   - `src/content/block.css` içinde yeni CSS kuralı + override kuralı ekle
     (`html.ro-disable-new-feature ...selector... { display: revert !important; }`).
   - [`applyBlockingClasses`](../src/content/redirect.js) içinde
     `root.classList.toggle('ro-disable-new-feature', settings.newKey === false);`
     satırı ekle.
6. **Yönlendirme toggle'ı ise:**
   - `src/content/redirect.js` içinde yeni regex sabiti (örn. `NEW_RE`).
   - [`computeRedirect`](../src/content/redirect.js) içinde regex kontrolü
     **sıraya uygun** yerleştir (üstteki sıralama kuralına bak).

> Drift olduğunda gözle görülür: redirect.js'te eksik key → content script
> özelliği uygulamaz; popup.js'te eksik key → popup checkbox'ı yanlış
> başlangıç değeri alır. Silent corruption üretmiyor, "missing feature"
> üretiyor.

---

## 4. Bilinen Kırılganlıklar (özet tablo)

| ID           | Kırılganlık                                                                                               | Etki                                                              | Mitigation                                                                                                        |
| ------------ | --------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| A1/A2/D1     | IG sidebar/profil yapısını `<a>`'dan button + onClick'e çevirirse seçici düşer                            | Sessiz no-op                                                      | İzleme; href tabanlı yaklaşım dışı plan yok                                                                       |
| G1           | `display: none` + IG virtualized feed spacer etkileşimi → siyah boşluk + jitter                           | UX sorunu (kullanıcı `blockFeedReelPosts` toggle ile kapatabilir) | Faz 5+ için layout-aware gizleme araştırması                                                                      |
| G1           | IG bir gün reel post `<article>`'ının içine başka `<article>` gömerse seçici davranışı belirsiz           | Teorik; bugün gözlenmedi                                          | İzleme + periyodik DOM yeniden doğrulama                                                                          |
| F1a-c        | IG SPA routing'ini değiştirirse (pushState yerine başka mekanizma) polling tick'leri yetersiz kalabilir   | Yönlendirme gecikir veya çalışmaz                                 | Polling artırılabilir; `webNavigation` izni alternatif ama reddedildi (bkz. [threat-model.md](./threat-model.md)) |
| Audio-filter | IG müzik etiketi href şemasını `/reels/audio/...`'dan değiştirirse foto post'lar yanlış gizlenmeye başlar | False positive — kullanıcı görüntü kaybeder                       | İzleme; href değişimi olursa filter güncellenir                                                                   |
