# Reels Off — Threat Model & Privacy Posture

Bu belge, eklentinin **veri toplama, ağ trafiği, tarayıcı izinleri** ve
**güvenlik kararlarını** belgeler. Yalnız [`manifest.json`](../manifest.json),
[`src/content/redirect.js`](../src/content/redirect.js), [`src/popup/popup.js`](../src/popup/popup.js),
[`src/content/block.css`](../src/content/block.css) içeriğinden + Faz 1-4
handoff'larından doğrulanmış bilgi içerir. Belge tarihi: 2026-06-06.

İlgili belge: [`selectors.md`](./selectors.md) (DOM/URL seçicileri),
[`PRIVACY-TR.md`](../PRIVACY-TR.md) ve [`PRIVACY-EN.md`](../PRIVACY-EN.md)
(kullanıcıya yönelik gizlilik politikası).

---

## 1. Özet duruş

| Boyut                            | Karar                                                                               |
| -------------------------------- | ----------------------------------------------------------------------------------- |
| Veri toplama                     | **Sıfır.** Hiçbir analytics, telemetri, crash report yok.                           |
| Ağ trafiği                       | **Sıfır.** `fetch`, `XMLHttpRequest`, `WebSocket`, `sendBeacon` kullanılmaz.        |
| Hesap entegrasyonu               | **Yok.** Instagram'a giriş yapmaz, login state'i okumaz/değiştirmez.                |
| Storage                          | **Yalnız `chrome.storage.local`** (sync DEĞİL). 7 boolean toggle.                   |
| Tarayıcı izni                    | **`storage`** (yalnız). `host_permissions`: `https://www.instagram.com/*` (yalnız). |
| CSP                              | Sıkı: `script-src 'self'; object-src 'none'; base-uri 'none';`                      |
| Build adımı                      | **Yok.** Vanilla JS + CSS, klasörden doğrudan yüklenebilir.                         |
| Üçüncü-parti runtime bağımlılığı | **Yok.** devDependencies (ESLint, Prettier) yalnız geliştirici ortamında.           |

---

## 2. İstenmeyen ve neden istenmeyen izinler

| İzin                                                                    | Talep ediliyor mu? | Neden değil                                                                                                     |
| ----------------------------------------------------------------------- | ------------------ | --------------------------------------------------------------------------------------------------------------- |
| `storage`                                                               | **Evet**           | Toggle tercihlerini saklamak için gerekli.                                                                      |
| `host_permissions: https://www.instagram.com/*`                         | **Evet**           | Content script'in (`block.css` + `redirect.js`) IG sayfalarında çalışması için.                                 |
| `webNavigation`                                                         | Hayır              | Polling tabanlı redirect (300ms) yeterli; izin Chrome Web Store reviewer'ı için kırmızı bayrak.                 |
| `tabs`                                                                  | Hayır              | Diğer tab'lara erişim hiçbir özellik için gerekli değil.                                                        |
| `activeTab`                                                             | Hayır              | Eklenti popup'tan tab içeriği okumaz.                                                                           |
| `scripting`                                                             | Hayır              | Content script manifest üzerinden statik enjekte ediliyor; `chrome.scripting` API'sine gerek yok.               |
| `cookies`                                                               | Hayır              | Eklenti hesap/oturum bilgisine dokunmaz.                                                                        |
| `<all_urls>`                                                            | Hayır              | Yalnız `instagram.com/*` host'u gerekli.                                                                        |
| `notifications`                                                         | Hayır              | Kullanıcıya bildirim göndermez.                                                                                 |
| Messaging API (`chrome.runtime.sendMessage`, `chrome.tabs.sendMessage`) | Hayır              | `chrome.storage.onChanged` content script'i popup değişikliklerinden haberdar ediyor; ayrı mesajlaşma gereksiz. |

> **Genel ilke:** Web Store reviewer'ı için minimal yüzey; kullanıcı için
> minimal güven yükü. Her ek izin = ek gözden geçirme + ek soru.

---

## 3. İçerik güvenlik politikası (CSP)

[`manifest.json`](../manifest.json) `content_security_policy.extension_pages`:

```
script-src 'self'; object-src 'none'; base-uri 'none';
```

**Anlamı:**

- `script-src 'self'`: Popup ve diğer extension sayfalarında **inline script
  veya inline event handler kullanılmaz**. Tüm JS extension klasöründen
  enjekte edilir. (`onclick="..."` yasak; `popup.js`'te `addEventListener`
  ile bağlanır.)
- `object-src 'none'`: `<object>`, `<embed>` engellendi.
- `base-uri 'none'`: `<base>` tag ile URL resolution değiştirilemez (CSP
  bypass yolu kapalı).
- External script src **yok** (CDN, third-party script yüklenmez).

---

## 4. Cold-read race davranışı

Storage `chrome.storage.local.get` çağrısı asenkron. Content script
`document_start`'ta çalışmaya başlar. Storage yüklenene kadar bir race
penceresi açıktır (~5-50ms tipik).

### Gizleme toggle'ları (A1/A2/D1/G1)

[`block.css`](../src/content/block.css) default kuralları **engelleme
aktif**'tir. Race penceresinde class henüz uygulanmadığı için engelleme
sürer. Kullanıcı bir gizleme toggle'ını kapatmış olsa bile, race penceresinde
o özellik kısa süre gizli kalır → storage gelince class eklenir → override
aktif olur → element görünür hale gelir.

**Worst case:** Kullanıcı kapattığı bir özellik ~5-50ms görünmez kalır.
**Sınıflandırma:** Kabul edilebilir trade-off. Sıkı gizlilik açısından
"varsayılan kapalıyken bir şey gizleyiyorsan kullanıcı pek fark etmez";
ters durum (varsayılan kapalıyken bir şey gösteriyorsan kullanıcı semptomu
hızlıca fark eder ve sinirlenir). Faz 1-4 ruhu bu yönde.

### Yönlendirme toggle'ları (redirectReels / redirectExplore / redirectProfileReels)

Önceki davranış: ilk `tick()` storage gelmeden çalışırdı; `settings = DEFAULTS`
(tümü true) olduğu için kullanıcı yönlendirmeyi kapatmış olsa bile bookmark
veya doğrudan navigation ile `/reels/...`'e gelen ilk hit yönlendirilirdi.

**Faz 5 G5.2 düzeltmesi:** `tick()` ve `setInterval` çağrıları
`chrome.storage.local.get` callback içine taşındı; race kapatıldı. Ek
gecikme: ~10-20ms (storage callback latency). IG'nin kendi render'ı çok
daha yavaş olduğu için kullanıcı tarafında flicker pratik olarak gözlemlenmez.

Detay: [`redirect.js`](../src/content/redirect.js) — başlık yorumundaki
"Cold-read race" bölümü ve `chrome.storage.local.get(...)` bloğu.

---

## 5. Storage seçimi: `local` vs `sync`

`chrome.storage.local` kullanılır. `chrome.storage.sync` **reddedildi**.

**Gerekçe:**

- `sync` Google/Mozilla hesabı üzerinden cihazlar arası senkronize eder
  — yani tercih bilgisi tarayıcı hesabına yüklenir.
- Eklenti "veri toplamaz; tercihler yalnız cihazınızda saklanır" diyor.
  `sync` bu iddianın altını oyar (tercih Google sunucusuna gider).
- 7 boolean toggle için cihazlar arası senkronizasyon kayda değer bir UX
  iyileştirmesi değil.

---

## 6. Audio-filter — Faz 2 Sapma 2 (false-positive kontrolü)

G1 seçicisi `<article>` içinde reel linki ararken `:not([href^='/reels/audio/'])`
filtresini içerir. Bu, müzik etiketli foto post'ların `/reels/audio/<id>/`
linki içerdiğinde **yanlışlıkla gizlenmemesini** sağlar.

**Privacy/güven açısından önemi:** Eklenti vaadi "reel'leri gizler". Foto
post'ları yanlışlıkla gizlemek kullanıcı güvenini yıpratır ve eklentiyi
"agresif/kötü çalışıyor" hissettirir. Bu filtre korunmuş envantere dahil
([selectors.md](./selectors.md) G1 bölümü).

---

## 7. Bilinen UX/stabilite konuları

### 7.1 G1 + IG virtualization (siyah boşluk + jitter)

[selectors.md G1](./selectors.md) bölümünde detaylı. Özet:

- Derin scroll'da (~7-8 post sonra) feed'de siyah boşluk + scroll jitter.
- A/B testi (Faz 5 KN2): semptom G1 toggle'ına bağlı.
- Önerilen "leaf-only" CSS fix denendi (Faz 5 G5.1), başarısız oldu.
- Muhtemel kök neden: `display: none` IG'nin virtualized spacer hesabı ile
  uyumsuz.
- Kapsam kararı: Faz 5'te uygulamaya alınmadı; layout-aware gizleme yaklaşımı
  Faz 5+ konusu. Kullanıcı toggle ile kapatabilir.

### 7.2 Chrome `:has()` invalidation quirk (Bulgu #5)

[`applyBlockingClasses`](../src/content/redirect.js) sonunda
`void root.offsetHeight;` workaround'u var. Bağlam:

- Faz 5 KN2 testinde keşfedildi: `blockFeedReelPosts` toggle'ı OFF→ON
  yapınca, sayfa yenilenmeden reel post'lar tekrar gizlenmiyordu (F5 ile
  düzeliyordu).
- Hipotez: Chrome `:has()` selectors için ancestor class değişikliğinde
  dinamik invalidation her zaman tetiklenmiyor.
- Çözüm: `applyBlockingClasses` sonunda zorla layout pass (`offsetHeight`
  read) → tarayıcı `:has()`'ı re-evaluate eder.
- Maliyet: ~1 frame perf hit (yalnız toggle anında).
- **Doğrulama notu (2026-06-06):** Workaround uygulandı; canlı tarayıcı
  testiyle doğrulanması bekleniyor. Çalışmazsa tek satır geri sileceğiz
  ve bilinen-bug olarak işleyeceğiz.

### 7.3 Storage schema sürümleme

Şu an `chrome.storage.local`'da saklanan obje basit: 7 boolean key.
`schemaVersion` alanı **yok** (Faz 5 G5.4 kararı: eklenmesi YAGNI, yakın
vadede şema değişimi planlanmıyor; ileride migration gerekirse ilk adım
olarak `schemaVersion` + migration kodu eklenebilir). Mevcut şema implicit
olarak "v0/sürümsüz"; gelecekteki migration kodu `stored.schemaVersion ?? 0`
ile geri uyumlu okuma yapabilir.

---

## 8. Reddedilen API kullanımları (özet)

| API                                                         | Reddedildi mi? | Sebep                                                                                                      |
| ----------------------------------------------------------- | -------------- | ---------------------------------------------------------------------------------------------------------- |
| `chrome.runtime.sendMessage` / `chrome.tabs.sendMessage`    | Evet           | `chrome.storage.onChanged` content script'i popup değişikliklerinden haberdar ediyor; mesajlaşma gereksiz. |
| `chrome.scripting.executeScript`                            | Evet           | Content script manifest tabanlı statik enjekte; dinamik enjeksiyon yok.                                    |
| `chrome.webRequest`                                         | Evet           | Eklenti hiçbir ağ trafiğine müdahale etmez.                                                                |
| `fetch` / `XMLHttpRequest` (content script veya popup'tan)  | Evet           | Eklenti dış kaynaktan veri çekmez.                                                                         |
| Inline script (`<script>...</script>` veya `onclick="..."`) | Evet           | CSP `script-src 'self'` zorunluluğu; tüm event handler `addEventListener` ile bağlanır.                    |
| External script src (CDN, third-party JS)                   | Evet           | Saldırı yüzeyi artırır; bağımsız çalışan eklenti tasarımı.                                                 |
| `chrome.storage.sync`                                       | Evet           | Bkz. Bölüm 5.                                                                                              |

---

## 9. Reviewer notları (Web Store + AMO başvurusu için)

Bu eklentinin mağaza başvurusu Faz 5 kapsamı dışında olsa da, reviewer'ın
muhtemel soruları için kısa hatırlatma:

- **Neden `host_permissions` Instagram?** Eklentinin tek amacı IG arayüzünde
  Reels öğelerini gizlemek; başka site etkilenmez.
- **Veri nereye gidiyor?** Hiçbir yere. `chrome.storage.local` cihazda;
  ağ trafiği yok.
- **Build çıktısı nasıl test edilir?** `git clone` → `chrome://extensions`
  → "Load unpacked" → klasör seç. Build adımı yok.
- **devDependencies ne yapar?** ESLint + Prettier yalnız geliştirici
  ortamında; eklenti paketine girmez, runtime'da çalışmaz.

---

## 10. Faz 5+ açık konular (bilgi)

Bu liste Faz 5'te **uygulanmayan** ama gelecekte ele alınabilecek
konuların hatırlatıcısıdır. Sıra önerisi değil.

- G1 layout-aware gizleme (Bölüm 7.1).
- Chrome `:has()` workaround testte başarısız olursa alternatif yol (Bölüm 7.2).
- `schemaVersion` + storage migration altyapısı (Bölüm 7.3).
- ESLint 9 + flat config geçişi (ESLint 8 EOL).
- Test altyapısı (Vitest / Jest) — şu an manuel görsel test.
- CI/CD (GitHub Actions): lint + format gate.
- Periyodik IG DOM stability denetimi (Faz 2'den beri öneri).
- İkon tasarımı (placeholder PNG'ler mevcut).
- Versiyon bump (`0.1.0` → `1.0.0`) + paketleme + mağaza submission.
