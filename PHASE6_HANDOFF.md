# Faz 6 Tamamlama Raporu — Sonraki Ajan Devretme Belgesi

> **Bu belgenin amacı:** Faz 6 (Yayın Hazırlığı) tamamlanmış halde, projeyi
> henüz görmemiş bir AI ajanına projeyi devretmek. Belge sayesinde yeni ajan;
> (a) Faz 6'da hangi karar ve değişikliklerin yapıldığını, (b) Faz 6'nın
> "ambalaj fazı" disiplinini (davranış değişmez, yalnız paketleme/görsel/versiyon)
> nasıl koruduğunu, (c) sonraki faz olan **mağaza submission**'ın neden
> tamamen kullanıcı yürütümlü olduğunu anlayabilmeli.
>
> **Kaynak otorite hiyerarşisi:** Canlı dosya içeriği > `PHASE6_GUIDE.md`
> (kullanıcının yazdığı kılavuz) > MV3/WebExtensions resmi dokümantasyonu +
> mağaza politikaları (CWS + AMO) > bu rapor > önceki handoff'lar
> (`PHASE5_HANDOFF.md`, …). Faz 5'in en önemli ek kuralı — **commit ağacı
> otorite değildir** (PHASE6_GUIDE.md Bölüm 0.1, Kural 25) — Faz 6'da da
> birebir uygulandı.
>
> **Belge tarihi:** 2026-06-07.

---

## 1. Proje Kimliği (Faz 6 sonu güncel hali)

| Alan            | Değer                                                                                                                              |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Proje adı       | **Reels Off** (TR ve EN aynı)                                                                                                      |
| Tür             | Chrome + Firefox MV3 tarayıcı eklentisi                                                                                            |
| Tek amaç        | Instagram web arayüzünde Reels ve algoritmik içerik önerilerini gizleyerek dikkat dağılmasını azaltır. Tercihler yalnızca cihazda. |
| Sahibi          | Kerem Tuna                                                                                              |
| Telif yılı      | 2026                                                                                                                                |
| Hedef mağazalar | Chrome Web Store + Mozilla Add-ons (AMO)                                                                                           |
| Diller          | Türkçe (varsayılan), İngilizce (fallback)                                                                                           |
| Mevcut faz      | **Faz 6 tamamlandı + push edildi** (5 commit: `1c22afb` → `739413a` → `e764916` → `69d9b78` → `cb8eace`); sıradaki **mağaza submission** (kullanıcı yürütür). |
| Repo            | `https://github.com/keremtunayetkinn/reels-off.git` (private, `origin/main`)                                                       |
| HEAD            | `cb8eace` — "Phase 6: add store listing draft (single purpose, descriptions, permission rationale)" |
| Toplam commit   | 26                                                                                                                                  |
| Versiyon        | **1.0.0** (manifest + package.json senkron)                                                                                        |

### Değişmez teknik kararlar (Faz 1-5 mirası — Faz 6'da KORUNDU)

- Vanilla JavaScript · bundler/minify yok · CSS-first href-tabanlı seçici
- `chrome.storage.local` (sync DEĞİL) · sıkı CSP · tek `host_permissions`
  (`instagram.com/*`) · `permissions: ["storage"]` (başka izin yok)
- Build adımı yok · sıfır telemetri/analitik · MV3 baseline
- **Korunan envanter** (PHASE5_HANDOFF.md Bölüm 5): G1 audio-filter, iki
  katmanlı loop guard, regex sıralaması (F1a/b → E1 → F1c), polling
  parametreleri (300/1000ms), `location.replace()` (asla `location.href =`),
  default-true policy, `chrome.storage.local`, sıkı CSP / minimal izin,
  **Bulgu #5 force reflow workaround** (`void root.offsetHeight`).
  **Hepsi byte-for-byte semantik korundu** — Faz 6 hiçbir runtime kod
  dosyasına dokunmadı.

### Faz 6'da eklenenler / değişenler (özet)

| Ekleme / değişim                            | Konum                                                                          | Sebep                                                                                                  |
| ------------------------------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------ |
| README "Bilinen sınırlamalar" bölümü        | [README.md:22-26](README.md#L22)                                               | G6.0 — G1 deferral'ı kullanıcı-yüzü dokümana taşıma                                                    |
| Gerçek ikonlar (placeholder X yerine)       | [src/icons/icon-{16,32,48,128}.png](src/icons/)                                | G6.1 — public lansman için "R + güç sembolü" logomark (kullanıcı tasarımı)                             |
| Versiyon `0.1.0` → `1.0.0`                  | [manifest.json:5](manifest.json#L5) + [package.json:3](package.json#L3)        | G6.2 — ilk kararlı public sürüm; iki dosya senkron (Kural 36)                                          |
| `gecko_android.strict_min_version: "142.0"` | [manifest.json:49-51](manifest.json#L49)                                       | G6.4 — `web-ext lint` Firefox-Android `data_collection_permissions` warning'ini çözmek için minimal cerrahi |
| `web-ext` devDependency                     | [package.json:14](package.json#L14)                                            | G6.4 — Mozilla resmi lint/build aracı; Faz 5 `eslint`/`prettier` pattern'ine paralel                   |
| `docs/store-listing.md`                     | `docs/store-listing.md`                                                        | G6.5 — mağaza textbox'larına kopya-yapıştır için TR+EN metinler ve submit checklist                    |

### Faz 6'da değişmeyen şeyler (önemli)

- **Davranış (runtime code):** `src/content/redirect.js`, `src/content/block.css`,
  `src/popup/popup.{html,css,js}` — Faz 6 sıfır değişiklik yaptı. Faz 5'in
  cold-read race fix, force reflow workaround, EN locale UI desteği aynen
  duruyor.
- **G1 mekanizması:** Hâlâ Faz 4 hâliyle (leaf-only fix yok, deferral devam
  ediyor — G1 üzerine Faz 6 _yalnız dokümantasyon_ ekledi: README "Bilinen
  sınırlamalar").
- **Manifest izinleri:** `["storage"]` aynı. `host_permissions: instagram.com/*`
  aynı. Yasaklı izinler (`webNavigation`, `tabs`, `activeTab`, `cookies`,
  `scripting`, `<all_urls>`, `notifications`) — hâlâ reddedilmiş.
- **CSP:** `script-src 'self'; object-src 'none'; base-uri 'none';` aynı.
- **i18n anahtarları:** TR + EN her ikisinde 13 anahtar, parite korundu.
- **`gecko.strict_min_version: "140.0"`:** Masaüstü Firefox baseline aynı.
- **DEFAULTS duplicate pattern:** redirect.js + popup.js senkron iki blok
  (G5.3 Seçenek B kararı korundu).

---

## 2. Çalışma Felsefesi (Faz 1-5'ten Aynen Devam Eder + Faz 6 Ek Kuralları)

Faz 1-5'teki kural seti (Kural 1-31) Faz 6'da istisnasız uygulandı.
PHASE6_GUIDE.md Bölüm 3 altı ek kural ekledi (Kural 32-37); aşağıda Faz 6
deneyiminden uygulanma kanıtları:

- **Kural 32 (Allowlist paketleme):** Paket yalnız açıkça listelenmiş 16
  runtime dosyasını içerir. `dist/staging/` dizini staging temizliğinin omurgası
  oldu — allowlist tek tek kopyalandı (PowerShell scripti ile, denylist'e
  güvenmedik). Sonuç: paketlere "Kopya" yedek/dev config/PHASE_* doküman
  **sızıntısı sıfır** (KN4'te grep ile teyit edildi).
- **Kural 33 (İkon yolları değişmez):** 4 PNG dosyası (`icon-16.png`,
  `-32.png`, `-48.png`, `-128.png`) **birebir aynı isimler** ve **aynı yolda**
  (`src/icons/`) — yalnız içerikleri değişti. `manifest.json` icon yolları
  bir karakter değişmedi.
- **Kural 34 (Kullanıcıya ait aksiyonlar):** Geliştirici hesabı açma,
  mağazaya paket yükleme, ekran görüntüsü çekme, repo public yapma, ToS
  kabulü — **hiçbiri Claude Code tarafından yapılmadı**. Hepsi kullanıcıya
  net şekilde devredildi (PHASE6_HANDOFF Bölüm 6 ve docs/store-listing.md).
- **Kural 35 (Mağaza gerçeklerini doğrula):** Mağaza ücretleri, başvuru
  gereksinimleri, inceleme süreleri, ekran görüntüsü boyutları,
  GitHub Pages tier kuralları — **hiçbirinde sabit sayı bellekten yazılmadı**.
  docs/store-listing.md §3, §8 ve §9'da "submit anında resmi dokümandan
  doğrula" notları var.
- **Kural 36 (Versiyon senkron + semantik):** `manifest.json` ve `package.json`
  `"version"` alanı **aynı atomic commit'te** `0.1.0` → `1.0.0` yapıldı
  (commit `e764916`). SemVer kararı kullanıcı onaylı (KN3 → A: 1.0.0
  kararlı public sürüm).
- **Kural 37 (Telif/marka güvenliği — ikon):** Kullanıcının sağladığı logomark
  ("R" + jenerik güç sembolü, koyu gri stroke, şeffaf zemin) Instagram/Meta
  logosunu, glyph'ini, marka renk-kombinasyonunu kullanmıyor. Özgün, sade.

### Kullanıcı bağlamı (Faz 6'da gözlenen)

- **Kullanıcı kararsız bırakmayı tercih etmedi; her seçim noktasında net
  cevap verdi.** Faz 6'da ~10 karar noktası ortaya çıktı (6.0.b default-state,
  6.1 ikon stratejisi, 6.1 wordmark dahil mi, SVG kaynak var mı, arka plan,
  6.2 versiyon, 6.3 README/docs/dist gitignore (3 ayrı soru), 6.4 Android
  warning, 6.5 privacy URL hosting); her birinde kullanıcı kesin seçim
  yaptı.
- **Kullanıcı kapsam disiplinine sıkı sıkı tutundu.** Default-state için
  "(A) Kural 19 invariant'ı koru" seçildi — davranış değişmedi. İkonlarda
  "yalnız logomark" seçildi (16/32 px okunabilirlik için). Versiyon `1.0.0`
  seçildi (kararlı public sinyal). Hepsi Faz 6'nın "ambalaj fazı" ruhunu
  korudu.
- **Kullanıcı geçici araçları temizletti.** Pillow ikon üretimi için
  install/use/uninstall yapıldı; kullanıcı kararıyla. Eklenti paketi veya
  proje config'i Pillow'a hiçbir noktada bağımlı olmadı (Kural 32 disiplini
  pratik kanıtı). `web-ext` ise devDependency olarak kalıcı eklendi (Faz 5
  pattern'iyle uyumlu, runtime'a girmiyor).
- **Kullanıcı manuel tarayıcı testleriyle her aşamayı doğruladı.** İkon
  KN2-onay (Chrome unpacked yükleme), KN5 duman testi (Chrome + Firefox
  tam senaryo seti). Kullanıcı Chrome console'da bir uyarı keşfetti
  (`Unload event listeners deprecated`); bu uyarının IG kaynaklı olduğu
  (eklentide `unload` listener'ı yok, hash'li bundle adı IG'in build
  sistemine ait) grep + dosya analiziyle kanıtlanıp kullanıcıya
  raporlandı.
- **Kullanıcı Türkçe iletişim tercih etti**, kod ve commit mesajları
  İngilizce (önceki fazlarla tutarlı). docs/store-listing.md TR+EN paralel
  (mağaza submit hedef diller).
- **Kullanıcı görsel kalite kritiklerimi geri çevirdi.** Ekran görüntülerinde
  taskbar görünürlüğü, profil avatarı, IG "Mesajlar" widget tutarsızlığı
  flag'lendi; kullanıcı "kritik görmüyorum" dedi. Faz 6 disiplini
  "kullanıcı aksiyonu" sınırına saygı duydu, ek revize yapılmadı.

---

## 3. Faz 6 Görev Akışı (KN0 → KN8)

PHASE6_GUIDE.md Bölüm 11 kontrol noktası akışı sırasıyla uygulandı:

```
KN0 (state doğrulama)                       → onay
KN1 (G1 deferral dokümantasyonu + 6.0.b)    → (A): default-true korunur
KN2 (ikon tasarım kararı)                   → (A): kullanıcı JPEG sağladı
   KN2-onay (render önizleme)                → onay (tarayıcı yükleme teyit)
KN3 (versiyon kararı)                       → (A): 1.0.0
KN4 (paket içerik listesi — allowlist teyit) → onay
KN5 (lint + politika self-check + yükle-doğrula) → onay (Android warning b ile çözüldü, paketler yeniden üretildi)
KN6 (listing metinleri + görsel spesifikasyonu) → onay
KN7 (commit planı + 5 atomic commit)        → onay
KN8 (push)                                  → onay → push tamamlandı
PHASE6_HANDOFF.md (bu rapor)                 → bekleniyor (KN8 sonrası 6. commit)
```

### 3.1 — Görev 6.0-pre (KN0): State Doğrulama — TEMİZ

PHASE6_GUIDE.md Bölüm 4'teki 15 kontrol komutu çalıştırıldı (`Read`/`Grep` ile;
`git log` yalnız bağlam). Tüm beklenti-gerçek eşleşti:

- Versiyonlar `0.1.0` (manifest + package.json senkron)
- 4 ikon dosyası mevcut (placeholder PNG'ler)
- Yasaklı izinler yok; `permissions: ["storage"]` korunmuş
- G1 leaf-fix `:not(:has(article))` yok (deferral devam ediyor)
- Audio-filter, polling params, `void root.offsetHeight` Bulgu #5 workaround mevcut
- i18n TR↔EN parite 13/13 anahtar
- 8 "Kopya" yedek dosyası tespit edildi (Kural 32 için işaretlendi — pakete
  asla girmeyecek)

Sapma yok; state Faz 6'ya başlamak için temiz.

### 3.2 — Görev 6.0 (KN1): G1 Deferral Dokümantasyonu + Default-State KARARI

**6.0.a — README "Bilinen sınırlamalar" bölümü.** [README.md:22-26](README.md#L22)'ye
eklendi. Metin G1 toggle'ın resmi i18n etiketi ("Ana akıştaki Reels gönderilerini
gizle") kullanılarak yazıldı; mevcut [docs/selectors.md](docs/selectors.md) ve
[docs/threat-model.md](docs/threat-model.md) G1 deferral notlarıyla tutarlı
(yeni iddia uydurma yok — Kural 7).

**6.0.b — Public default-state KARARI (KN1).** İki seçenek sunuldu:

- (A) Default `true` kalsın (Kural 19 default-true invariant korunur). README'de
  bilinen sınırlama olarak açıklanır.
- (B) Yalnız `blockFeedReelPosts` default `false` (G5 invariant kırılır, iki
  dosyada DEFAULTS senkron değişir).

**Kullanıcı (A)'yı seçti.** Sebep: Faz 6 ambalaj fazı disiplini; semptom
self-curable; Kural 19 invariant'ı korunur; marketing tutarlılığı ("Reels'i
gizler" varsayılan olarak gerçek). Koda dokunulmadı; yalnız README güncellendi.

### 3.3 — Görev 6.1 (KN2 + KN2-onay): Gerçek İkon Tasarımı

**6.1.a — Tasarım KARARI.** İki seçenek sunuldu: (A) kullanıcı SVG/tasarım
sağlar, AI render eder; (B) AI brief'ten aday SVG üretir. **Kullanıcı (A)**:
JPEG formatında logomark sağladı (`b7cb7e51-...jpg` masaüstü):
- "R" harfi + jenerik güç sembolü (power-off)
- Koyu gri stroke (~#2D3239), beyaz/krem zemin
- Wordmark "REELS OFF" altta

**Kural 37 check:** Instagram/Meta logosu/glyph/renk-kombinasyonu yok. Özgün, temiz.

**Üç teknik karar AskUserQuestion ile alındı:**

1. **Kompozisyon:** "Yalnız logomark" (16/32 px'te wordmark okunmaz).
2. **Kaynak format:** Sadece JPEG var (SVG yok) → raster pipeline kullanıldı.
3. **Arka plan:** Şeffaf zemin + koyu logomark.

**6.1.b — Render üretimi.** Pillow (Python; geçici install) ile pipeline:

1. JPEG yüklendi, dark-pixel band analizi ile logomark vs wordmark yatay
   bantları tespit edildi (logomark: y=182-454; wordmark: y=508-584).
2. Logomark band'i crop edildi (0,0 → W,480).
3. **Luminance-to-alpha ramp** (LO=100, HI=230 lineer geçiş) ile chroma key —
   beyaz zemin şeffafa, koyu stroke opak. Anti-alias kenarlarda halo yok.
4. Opak piksellere uniform `#2D3239` stroke rengi yazıldı (small-size
   görünürlük için).
5. Tight bbox alındı (`447×275`, 1.6:1 aspect), %12 margin ile square pad
   (`555×555`).
6. Her boyut için ayrı `LANCZOS` resize: 16, 32, 48, 128 px. Kademeli değil
   — her boyut master 555'ten taze (16 px'te keskinlik).

Çıktı:
- `icon-16.png`: 547 B, RGBA, 16×16
- `icon-32.png`: 1316 B, RGBA, 32×32
- `icon-48.png`: 2165 B, RGBA, 48×48
- `icon-128.png`: 6847 B, RGBA, 128×128

Hepsi `src/icons/` altında, **dosya adları/yolları birebir korundu**
(Kural 33). `manifest.json` icon yolları değişmedi.

**6.1.c — Doğrulama (KN2-onay).** Kullanıcı Chrome'a unpacked yükledi;
"hata yok, yeni ikon görünüyor" raporladı. Sonra Pillow uninstall edildi
(`pip uninstall -y Pillow`; `ModuleNotFoundError` teyit ettim). Kural 32
disiplini: araç paketin dışında bırakıldı.

### 3.4 — Görev 6.2 (KN3): Versiyon Bump

İlk public sürüm numarası kararı için üç seçenek sunuldu: `1.0.0` (kararlı
public), `0.1.0` koru (beta sinyali), `0.9.0` (preview).

**Kullanıcı `1.0.0` seçti.** "Üretime hazırım" sinyali.

**Uygulama:** [manifest.json:5](manifest.json#L5) ve [package.json:3](package.json#L3)
**aynı atomic edit'te** `1.0.0` yapıldı. Diğer manifest alanları (icons,
permissions, CSP, gecko `strict_min_version: "140.0"`) **dokunulmadı**. Bu
değişiklik commit `e764916`'da Android warning fix'i ile birleşti (KN7'de
gerekçesi açıklandı).

### 3.5 — Görev 6.3 (KN4): Temiz Paketleme

**Üç opsiyonel karar AskUserQuestion ile alındı:**

1. **README pakete dahil edilsin mi?** → Evet (reviewer şeffaflığı).
2. **`docs/` klasörü pakete dahil edilsin mi?** → Hayır (dev dokümanı).
3. **`dist/` `.gitignore`'a eklensin mi?** → Zaten eklenmiş (Faz 5 mirası).
   `dist/`, `*.zip`, `*.xpi`, `*.crx` hepsi `.gitignore`'da.

**Allowlist (16 dosya):**

```
manifest.json
_locales/tr/messages.json
_locales/en/messages.json
src/content/block.css
src/content/redirect.js
src/popup/popup.html
src/popup/popup.css
src/popup/popup.js
src/icons/icon-16.png
src/icons/icon-32.png
src/icons/icon-48.png
src/icons/icon-128.png
LICENSE
PRIVACY-TR.md
PRIVACY-EN.md
README.md
```

**Üretim:** PowerShell scripti ile `dist/staging/` oluşturuldu, 16 dosya
**tek tek** kopyalandı (klasör yapısı korunarak). Sonra:

- **Firefox:** `npx web-ext build --source-dir=dist/staging --artifacts-dir=dist`
  → `dist/reels_off-1.0.0.zip` → rename `reels-off-firefox-1.0.0.zip`.
- **Chrome:** Python `zipfile` ile `dist/staging/` içeriği zip'lendi (manifest.json
  kök seviyede), `dist/reels-off-chrome-1.0.0.zip` olarak yazıldı.

**Sızıntı taraması (Kural 32):** Pattern `kopya|node_modules|.git|GUIDE|HANDOFF|eslintrc|prettier|package.json|.gitkeep|.gitignore|docs/` her iki
pakette **0 eşleşme**. ✅

### 3.6 — Görev 6.4 (KN5): Lint + Self-Check + Duman Testi

**6.4.a — `web-ext lint --source-dir=dist/staging`.** İlk çalıştırma:
- errors: 0, notices: 0, warnings: **1**

Tek warning: `KEY_FIREFOX_ANDROID_UNSUPPORTED_BY_MIN_VERSION` —
`gecko.strict_min_version: "140.0"` ama `data_collection_permissions` alanı
Firefox-Android 142+'da tanınıyor.

Üç seçenek kullanıcıya sunuldu:
- (a) Görmezden gel (AMO'da warning kalır, submit edilir)
- (b) `gecko_android.strict_min_version: "142.0"` ekle (warning kaybolur,
  masaüstü etkilenmez)
- (c) `data_collection_permissions` kaldır (privacy beyanı kaybolur)

**Kullanıcı (b)'yi seçti.** [manifest.json:49-51](manifest.json#L49) güncellendi
(minimal cerrahi: `"gecko_android": {}` → `{ "strict_min_version": "142.0" }`).
Staging refresh + her iki paket yeniden üretildi. Lint tekrar: **0/0/0**. ✅

**6.4.b — Manifest + politika self-check.** 14 kontrol başlığı:

| Kontrol | Sonuç |
|---|---|
| `manifest.json` valid JSON | ✅ |
| `version` 1.0.0 senkron | ✅ |
| İkon yolları intact | ✅ |
| `permissions: ["storage"]` minimal | ✅ |
| `host_permissions: instagram.com/*` | ✅ |
| Yasaklı izin yok | ✅ |
| CSP sıkı | ✅ |
| `eval`/`new Function`/`importScripts` yok | ✅ (staging'de 0 eşleşme) |
| `innerHTML =`/`document.write` yok | ✅ |
| Harici URL/CDN/fetch yok (kod dosyalarında) | ✅ |
| Inline script yok | ✅ ([popup.html:50](src/popup/popup.html#L50) sadece `<script src="popup.js">`) |
| Obfuscation/minify yok | ✅ |
| Privacy policy mevcut | ✅ |
| "Sıfır veri toplama" beyanı tutarlı | ✅ (i18n extDescription + manifest data_collection_permissions + PRIVACY*.md) |

**6.4.c — Duman testi (kullanıcı, canlı tarayıcı).** PHASE6_GUIDE.md
Bölüm 9'a göre kullanıcıya **detaylı checklist** sunuldu (Chrome unpacked
yükleme + IG sidebar A1/A2 + profil D1 + feed G1 + URL redirect F1a/F1b/E1/F1c
+ popup toggle persistence + console temiz + Firefox paralel).

**Sonuç (kullanıcı raporu):**
- Chrome duman + popup testi: ✅ Geçti
- Firefox tüm testler: ✅ Geçti
- Chrome console warning: `Unload event listeners are deprecated` —
  kaynak `3h4YqOhE0YZ.js:242` (hash'li IG bundle).

**Console warning incelemesi.** Üç kanıt ile IG kaynaklı olduğu netleştirildi:
1. Bizim staging'de `unload|beforeunload|pagehide` grep'i: 0 eşleşme.
2. Bizim tek `addEventListener` çağrımız [popup.js:42](src/popup/popup.js#L42)
   `'change'` event; `unload` ile alakasız.
3. `3h4YqOhE0YZ.js` hash'li bundle adı — bizim vanilla JS dosyalarımız
   düz isimli (`redirect.js`, `popup.js`); bizim üretemeyeceğimiz format.

**Sonuç: Warning %100 IG kaynaklı, eklentiyle ilgisiz. Aksiyon yok.**

### 3.7 — Görev 6.5 (KN6): Listing Metinleri + Görsel Spesifikasyonu

Tek çıktı: [docs/store-listing.md](docs/store-listing.md) (~229 satır).

İçerik:
- §1 Eklenti metadata
- §2 Tek-amaç beyanı (TR + EN) — CWS "Single purpose" alanı
- §3 Kısa açıklama (TR + EN) — i18n `extDescription` ile birebir tutarlı
- §4 Uzun açıklama (TR + EN) — README ve PRIVACY-*.md'den türetildi, yeni
  iddia yok (Kural 7). G1 bilinen sınırlaması ayrı paragraf olarak yer aldı.
- §5 İzin gerekçeleri (TR + EN) — `storage` + host izni + "diğer izinler
  kullanılmaz" notu
- §6 Veri toplama beyanı tablosu (12 soru, hepsine "Hayır")
- §7 Privacy policy URL — 3 seçenek (public Gist / dedicated public repo / ana
  repo public). **Kullanıcı kararı: (A) public Gist** — ana `reels-off`
  repo private kalır, PRIVACY-EN.md içeriği public Gist olarak yayınlanır,
  link mağazada verilir.
- §8 Görsel listesi (hatırlatma) — kullanıcının çektiği 3 ekran görüntüsü
  + opsiyonel önerileri. **Sabit boyut/sayı verilmedi** (Kural 35).
- §9 Submit checklist

**Görseller (kullanıcı çekti, masaüstünde):**
- `Ekran görüntüsü 2026-06-07 180033.png` — popup demo (English UI)
- `Ekran görüntüsü 2026-06-07 181002.png` — `/reels/` redirect demo
- `Ekran görüntüsü 2026-06-07 181233.png` — `/explore/` redirect demo

(Bir 4. shot — Metallica profil demo — kullanıcı tarafından silindi.)

Kullanıcı için flag'lenen düzeltme önerileri (kullanıcı geri çevirdi, kritik
görmedi): profil avatarı sağ üstte (Chrome account chip), Windows taskbar
görünür her shot'ta, IG "Mesajlar" widget'ı TR (popup EN ama IG widget TR
tutarsızlık). Bu öneriler **kullanıcı isteğine bırakıldı**.

### 3.8 — KN7: Atomic Commit'ler

5 commit, hepsi `Phase 6:` prefix'li, hepsinde `Co-Authored-By: Claude Opus
4.7 <noreply@anthropic.com>` trailer'ı:

| # | Hash | Mesaj | Dosyalar |
|---|---|---|---|
| 1 | `1c22afb` | Phase 6: document G1 deferral as known limitation in README | `README.md` |
| 2 | `739413a` | Phase 6: replace placeholder icons with Reels Off logomark | 4 × `src/icons/*.png` |
| 3 | `e764916` | Phase 6: bump to 1.0.0 and set gecko_android.strict_min_version | `manifest.json` + `package.json` |
| 4 | `69d9b78` | Phase 6: add web-ext as devDependency for lint/build | `package.json` |
| 5 | `cb8eace` | Phase 6: add store listing draft (single purpose, descriptions, permission rationale) | `docs/store-listing.md` |

**Atomic ayırma teknik notu:** Commit #3 ve #4 ikisi de `package.json` etkiliyordu
(version bump + devDep ekleme). Atomic disiplini için `git add -p` (interaktif
hunk staging) yasaklı (Kural: -i flag yok). Çözüm: commit #3'te `package.json`'dan
`web-ext` satırı **geçici olarak çıkarıldı** (Edit ile), commit atıldı, sonra
commit #4'te `web-ext` satırı geri eklendi (Edit ile), ikinci commit atıldı.
Sonuç: iki bağımsız commit, her ikisinin de mantıksal kapsamı net, çakışma yok.

### 3.9 — KN8: Push

`git push origin main`:
```
e1bb687..cb8eace  main -> main
```

Working tree clean, `origin/main` ile senkron (0 ahead / 0 behind).
Repo private; hiçbir bilgi public olmadı.

---

## 4. Repo Durumu (Faz 6 sonu, push edildi — origin/main ile senkron)

```
Yerel dizin:    C:\Users\User\Desktop\İnstagram Chrome Plugin\
Branch:         main (origin/main ile senkron)
Remote:         origin = https://github.com/keremtunayetkinn/reels-off.git
Visibility:     Private (GitHub)
Working tree:   clean
HEAD:           cb8eace — "Phase 6: add store listing draft (single purpose, descriptions, permission rationale)"
Toplam commit:  26
Faz 6 commit'leri: 1c22afb, 739413a, e764916, 69d9b78, cb8eace (sırayla)
```

### Faz 6 commit zinciri (eski → yeni)

| Hash      | Mesaj (özet)                                                              | Kapsam                                                                                    |
| --------- | ------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `1c22afb` | Phase 6: document G1 deferral as known limitation in README                | `README.md` (+4 satır)                                                                    |
| `739413a` | Phase 6: replace placeholder icons with Reels Off logomark                 | 4 × `src/icons/icon-*.png` (binary replace)                                               |
| `e764916` | Phase 6: bump to 1.0.0 and set gecko_android.strict_min_version            | `manifest.json` + `package.json` (+5/-3)                                                  |
| `69d9b78` | Phase 6: add web-ext as devDependency for lint/build                       | `package.json` (+2/-1, devDep `web-ext ^10.3.0`)                                          |
| `cb8eace` | Phase 6: add store listing draft (single purpose, descriptions, permission rationale) | `docs/store-listing.md` (+229 satır, yeni)                                      |

### Faz 6 başlamadan önceki HEAD

`e1bb687` — "Phase 6: add PHASE6_GUIDE.md for project transition and guidelines".
Bu commit Faz 6 GUIDE'ını içerir; Faz 6 implementation'ı buradan başladı.
Faz 5 sonu HEAD'i `e2b561e` idi; arada GUIDE commit'i (`e1bb687`) kullanıcı
tarafından atıldı (Faz 5 sonrası, Faz 6 başlangıcı).

### Dosya envanteri (Faz 6 sonu, kök + alt)

```
.eslintrc.json (Faz 1)
.prettierrc.json (Faz 1)
.prettierignore (Faz 5)
.gitignore (Faz 1; dist/, *.zip, *.xpi, *.crx, node_modules/, package-lock.json ignore'lu)
package.json (Faz 5; Faz 6 version 1.0.0 + web-ext devDep)
manifest.json (Faz 1; Faz 4 storage; Faz 5 Prettier; Faz 6 version 1.0.0 + gecko_android.strict_min_version)
README.md (Faz 1-4 güncel; Faz 5 Prettier; Faz 6 "Bilinen sınırlamalar" bölümü)
LICENSE (Faz 1)
PRIVACY-TR.md, PRIVACY-EN.md (Faz 1; Faz 5 Prettier)
PHASE1_HANDOFF.md, PHASE2_HANDOFF.md, PHASE3_HANDOFF.md, PHASE4_HANDOFF.md, PHASE5_HANDOFF.md (Faz 5 Prettier)
PHASE1_GUIDE.md → PHASE5_GUIDE.md (Faz 5 Prettier)
PHASE6_GUIDE.md (Faz 5 sonu — kullanıcı yazdı)
PHASE6_HANDOFF.md (bu belge — Faz 6 YENİ)
docs/.gitkeep (Faz 0)
docs/selectors.md (Faz 5)
docs/threat-model.md (Faz 5)
docs/store-listing.md (Faz 6 — YENİ)
src/content/block.css (Faz 2; Faz 4 override'lar; Faz 5 Prettier)
src/content/redirect.js (Faz 3; Faz 4 settings/onChanged; Faz 5 race fix + force reflow)
src/popup/popup.html (Faz 4; Faz 5 Prettier)
src/popup/popup.css (Faz 4; Faz 5 Prettier)
src/popup/popup.js (Faz 4)
src/icons/icon-16.png, icon-32.png, icon-48.png, icon-128.png (Faz 6 — YENİ; placeholder X yerine "R + güç" logomark)
_locales/tr/messages.json, _locales/en/messages.json (Faz 1+4; 13'er key)
node_modules/ (gitignored; ESLint + Prettier + web-ext transitive)
dist/ (gitignored; staging + Chrome/Firefox zip paketleri; Faz 6 üretildi)

Yedek dosyalar (kullanıcı tarafından tutuluyor, .prettierignore'da, .gitignore tracked değil):
  - Kopya.gitignore, LICENSE - Kopya, manifest - Kopya.json,
  PHASE1_GUIDE - Kopya.md, PRIVACY-EN - Kopya.md, PRIVACY-TR - Kopya.md,
  .eslintrc - Kopya.json, .prettierrc - Kopya.json
```

### Üretilen paketler (gitignore'da, mağaza submit için hazır)

```
dist/reels-off-chrome-1.0.0.zip   — 23,665 B  — sha256[:16]=560b4c8cee5119c9
dist/reels-off-firefox-1.0.0.zip  — 24,338 B  — sha256[:16]=10e39d1f537daf11
dist/staging/                      — staging dizini (kaynak; 16 runtime dosyası)
```

Her iki paket allowlist disiplini ile temiz; "Kopya"/dev/.md sızıntısı yok.

---

## 5. Korunan Envanter Sağlamlık Kontrolü (Faz 6 sonu)

PHASE5_HANDOFF.md Bölüm 5 + PHASE6_GUIDE.md Bölüm 3.1 — Faz 6 boyunca
hiçbiri bozulmadı:

| Mekanik                                                                    | Konum                                                                                       | Durum                                          |
| -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| G1 audio-filter `:not([href^='/reels/audio/'])`                            | [block.css:74,78](src/content/block.css#L74) (default + override)                           | ✅ Dokunulmadı                                 |
| İki katmanlı loop guard (`target !== location.pathname` + `pollingPaused`) | [redirect.js:71-80](src/content/redirect.js#L71)                                            | ✅ Dokunulmadı                                 |
| Regex sıralaması (F1a/b → E1 → F1c)                                        | [redirect.js:61-66](src/content/redirect.js#L61)                                            | ✅ Dokunulmadı                                 |
| Polling parametreleri (300/1000ms)                                         | [redirect.js:36-37](src/content/redirect.js#L36)                                            | ✅ Dokunulmadı                                 |
| `location.replace()` (asla `location.href =`)                              | [redirect.js:78](src/content/redirect.js#L78)                                               | ✅ Dokunulmadı                                 |
| Default-true policy (7 toggle hepsi true)                                  | [redirect.js:46-54](src/content/redirect.js#L46) + [popup.js:17-25](src/popup/popup.js#L17) | ✅ Dokunulmadı (KN1 6.0.b → A: koru)           |
| `chrome.storage.local` (sync DEĞİL)                                        | [redirect.js:111](src/content/redirect.js#L111) + [popup.js:37](src/popup/popup.js#L37)     | ✅ Dokunulmadı                                 |
| Sıkı CSP / minimal izin                                                    | [manifest.json:17,37-39](manifest.json#L17)                                                 | ✅ Dokunulmadı (storage tek izin, CSP aynı)    |
| Bulgu #5 force reflow workaround (`void root.offsetHeight`)                | [redirect.js:92](src/content/redirect.js#L92)                                               | ✅ Dokunulmadı                                 |
| Cold-read race fix (storage callback içinden tick)                         | [redirect.js:95-116](src/content/redirect.js#L95)                                           | ✅ Dokunulmadı                                 |
| G1 mekanizması (deferral devam)                                            | [block.css:74,78](src/content/block.css#L74)                                                | ✅ Dokunulmadı (deferral koda dokunmadı)       |
| İkon dosya adları/yolları                                                  | `src/icons/icon-{16,32,48,128}.png`                                                         | ✅ Birebir aynı (Kural 33); yalnız içerik yenilendi |

---

## 6. Sonraki Faz İçin Devir (Mağaza Submission — Kullanıcı Yürütür)

Faz 6 sonunda mağaza submit için **doğrulanmış paketler + ikon + versiyon
+ listing metinleri** hazır. Sonraki faz **kullanıcı-yürütümlü** olup
Claude Code yalnız hazırlık/dokümantasyon desteği verir. **Hiçbir aksiyonu
Claude Code üstlenmez** (Kural 34).

### 6.1 — Mağaza submission görev listesi (kullanıcı yapar)

1. **Chrome Web Store geliştirici hesabı.** Account aç, ödeme yap, ToS kabul et.
   Ücret/gereksinim/inceleme süresi **başvuru anında resmi dokümandan
   doğrulanır** (Kural 35; `https://developer.chrome.com/docs/webstore/register`).
2. **Mozilla Add-ons (AMO) geliştirici hesabı.** Account aç, ToS kabul et.
   Tarihsel olarak ücretsiz; submit anında teyit (`https://addons.mozilla.org/developers/`).
3. **Privacy policy URL hosting.** Kullanıcı kararı: **public Gist** (KN6
   sonu — docs/store-listing.md §7 (A) seçeneği). Gist içeriği `PRIVACY-EN.md`'den
   kopyalanır, link mağazada verilir. Ana repo private kalmaya devam eder.
4. **Listing form doldurma.** Tüm textbox'lar için kaynak:
   [docs/store-listing.md](docs/store-listing.md).
5. **Ekran görüntülerini mağazaya yükle.** Kullanıcı çekti (3 shot mevcut).
   Mağaza boyut/format gereksinimi başvuru anında doğrulanır.
6. **Paket yükleme.**
   - Chrome: `dist/reels-off-chrome-1.0.0.zip` → CWS Developer Dashboard.
   - Firefox: `dist/reels-off-firefox-1.0.0.zip` → AMO Submission.
7. **Submit + reviewer feedback iterasyonları.** Kullanıcı yürütür. Reviewer
   notu önerisi (docs/store-listing.md §9): "Vanilla JS, bundler yok, kaynak
   GitHub'da public — minify/obfuscation yok" (repo public yapılınca geçerli).

### 6.2 — Repo public yapma (geri-alınması zor — kullanıcı kararı)

Kullanıcı niyeti: **"ileride"** (Faz 6 sonu, KN8 öncesi onaylanan).
Public yapma günü için ek temizlik checklist'i:

**Public-açma temizlik checklist'i:**

- [ ] **Git author e-posta:** Tüm commit'lerin author trailer'ında
      `Kerem Tuna Yetkin <ktyetkin@hotmail.com>` görünüyor. README/PRIVACY'deki
      `ktyetkinwork@gmail.com`'dan **farklı bir e-posta** (kişisel hotmail).
      Public repo'da herkes görür. İki seçenek:
      (i) Olduğu gibi bırak (iki e-posta da public olur),
      (ii) Git rebase/filter ile geçmiş author e-posta'ları `ktyetkinwork@gmail.com`'a
      birleştir (**force push gerekir**; private repo iken yapılırsa risk yok,
      public yaptıktan sonra force push yapma).
- [ ] **"Kerem Tuna" ifadesi:** Tüm PHASE1-6
      GUIDE/HANDOFF dosyalarında geçiyor. Public repo'da bu bilgi (ad +
      üniversite + bölüm) herkes görür. İki seçenek:
      (i) Kalsın (eğitim arka planı açıklayıcı), (ii) "Kerem Tuna" yeterli,
      üniversite kısmını sil.
- [ ] **"Kopya" yedek dosyaları:** 8 dosya kökte (`PHASE1_GUIDE - Kopya.md`,
      `manifest - Kopya.json`, `LICENSE - Kopya`, `.eslintrc - Kopya.json`,
      `.prettierrc - Kopya.json`, `PRIVACY-{TR,EN} - Kopya.md`,
      ` - Kopya.gitignore`). Faz 5/6 sürecinde yedek/referans amaçlı tutuldu;
      pakete sızıntı yok ama public repo'da görünürler. Kullanıcı kararı:
      sil veya tut.
- [ ] **PHASE_* GUIDE/HANDOFF dosyaları:** Geliştirme sürecini detaylı
      anlatıyor (hipotez denemeleri, başarısız fix'ler, vb.). Reviewer
      şeffaflığı için **artı** ama kişisel detay (ad, üniversite, e-posta)
      içeriyor. Kullanıcı kararı: kalsın (transparency) veya sansürlü kopya
      hazırla.
- [ ] **`docs/store-listing.md`'deki kişisel bilgiler:** E-posta + GitHub
      kullanıcı adı. Mağaza submit kapsamında zaten public olacak, bu bir
      ek sızıntı değil.

### 6.3 — Opsiyonel sonraki işler (mağaza submit sonrası)

- Public tanıtım (Reddit, Hacker News, Twitter, vb.)
- CI/CD (GitHub Actions): `web-ext lint`, `eslint`, `prettier --check`
  pipeline. PHASE5_HANDOFF.md Bölüm 7 öneriliyordu, hâlâ açık.
- Test altyapısı (Vitest/Jest). Faz 5 sonrası öneri, hâlâ açık.
- `schemaVersion` + storage migration altyapısı (G5.4 deferral; ihtiyaç
  doğduğunda).
- ESLint 8 → 9 (flat config refactor). PHASE5_HANDOFF.md Bölüm 7'den.
- Periyodik IG DOM stability denetimi. Faz 2 handoff'tan beri öneri.
- G1 mekanizma fix (PHASE5_HANDOFF.md Bölüm 6'da Faz 6 birincil konu olarak
  öngörülmüştü; PHASE6_GUIDE.md ertelemeyi konsolide etti). Kullanıcı
  isterse yeniden açılabilir; "layout-aware CSS gizleme" (PHASE5_HANDOFF.md
  Bölüm 6.4 (1) seçeneği) en az riskli yaklaşım.

---

## 7. Faz 6 Açık Konular (Bilgi)

| Konu                                          | Durum / kaynak                                                                |
| --------------------------------------------- | ----------------------------------------------------------------------------- |
| Repo public yapma                             | Kullanıcı niyeti: ileride. Public-açma temizlik checklist'i Bölüm 6.2.        |
| Privacy URL canlı yayını                      | Kullanıcı kararı: public Gist (Bölüm 6.1.3). Submit öncesi kullanıcı yapar.   |
| Mağazaya submit                                | Kullanıcı yürütür (Bölüm 6.1).                                                |
| README "Faz 4" satırı eskimiş                 | [README.md:60](README.md#L60) "Mevcut durum: Faz 4". Faz 6 boyunca dokunulmadı (Kural 14 — kapsam dışı; not: "Bilinen sınırlamalar" eklenmesi yüzünden satır numarası önceki state'ten kaydı). Sonraki güncelleme önerisi: "Faz 6 tamamlandı, yayın hazırlığında" veya tamamen kaldır. |
| G1 mekanizma fix                              | Ertelenmiş; G1 toggle kullanıcı elinde, semptom dokümante (README + selectors.md + threat-model.md). |
| `package-lock.json`                           | `.gitignore`'da tutuluyor (Faz 5 mirası). Reproducible build için ileride taşımak gerekebilir. |
| CI/CD, test altyapısı                         | Faz 5/6'da kapsam dışı; sonraki faz konusu.                                   |

---

## 8. Faz 6 Dersleri (Lessons Learned)

### 8.1 — "Ambalaj fazı" disiplini gerçekten korundu

Faz 6'nın en zor disiplini: davranışsal koda **dokunmamak**. Runtime
JS/CSS dosyalarında **0 satır değişiklik** yapıldı. Bu disiplinin pratik
faydası: KN5 duman testinde Faz 5 sonu davranışıyla birebir aynı çıkardı —
versiyon değişti, ikonlar değişti, ama eklentinin "hissi" aynı. Faz 5'in
tüm fix'leri (cold-read race, force reflow, EN locale) çalışmaya devam etti.

**Ders:** Yayın hazırlığı fazı, "ufak iyileştirmeler de yapayım" ayartmasına
direnmelidir. Versiyon bump'la birlikte yeni özellik ya da refactor karışırsa
"davranış değişti mi?" sorusu bulanıklaşır; reviewer karşısında savunulamaz
olur.

### 8.2 — Geçici araçlar paketten dışarda tutuldu (Kural 32 pratik kanıtı)

Pillow ikon üretimi için install edildi, ikonlar yazıldı, sonra uninstall
edildi. Eklenti paketi (`dist/*.zip`) Pillow'a hiçbir noktada bağımlı olmadı.
`web-ext` ise devDependency (kalıcı) ama `node_modules` paket dışı.

**Ders:** Allowlist disiplini sadece zip içeriğini değil, **araç zincirini**
de kapsar. "Bir an için pip install yapacağım" demek dahi paket sızıntısı
riski oluşturmaz, çünkü staging allowlist'i denylist'e değil **whitelist'e**
dayanır.

### 8.3 — `package.json` üzerinden iki atomic commit (interaktif yasak)

Faz 6'da `package.json`'da hem versiyon bump hem `web-ext` devDep eklemesi
vardı. Atomic ayırma için `git add -p` (interaktif hunk staging) yasaklı
(Kural: -i flag yok). Çözüm: ilk commit'te `package.json`'dan `web-ext`
satırı geçici çıkarıldı (Edit), commit atıldı, sonra `web-ext` satırı geri
eklendi (Edit), ikinci commit atıldı. İki temiz, mantıksal kapsama sahip
commit ortaya çıktı.

**Ders:** Interaktif kısıtlamalar mevcut araçlarla aşılabilir — Edit ile
geçici state oluştur, commit at, Edit ile geri al, commit at. Net,
deterministik, scriptable.

### 8.4 — Kullanıcı görsel kritiklerini geri çevirme hakkına saygı

Ekran görüntüleri için 4 düzeltme önerisi (profil avatarı, taskbar,
IG "Mesajlar" widget dil tutarsızlığı, "öncesi/sonrası" karşılaştırma
çekimi) sunuldu. Kullanıcı "kritik görmüyorum" dedi. Kural 34 ("kullanıcı
aksiyonu") burada genişledi: **görsel kalite kararı da kullanıcının**.
Aksiyon önerilmeli, başka yere yönlendirilmemeli, bildirim sonrası
kullanıcı kararı kesin.

**Ders:** Hazırlık/kalite önerileri kullanıcıya bilgi olarak sunulur;
kullanıcı kabul etmediğinde Claude Code "ısrar etmez". Bu, kullanıcının
mağaza/UX kararlarına saygı duymanın somut hali.

### 8.5 — Console warning kaynağı tespiti dosya gerçeğiyle yapılır

Kullanıcı Chrome console'da `Unload event listeners are deprecated`
warning'ini gördü. Kaynak `3h4YqOhE0YZ.js:242` (hash'li). Bizim mi, IG'in mi?
**Hızlı doğrulama:** (1) staging'de `unload|beforeunload|pagehide` grep:
0 eşleşme; (2) bizim tek `addEventListener` `'change'` event; (3) hash'li
dosya adı bizim vanilla JS pattern'ine uymuyor. Üç bağımsız kanıt → IG kaynaklı.

**Ders:** Dış uyarıların attribution analizi **dosya gerçeğine dayanır**
(Kural 25). "Eklentinin olabilir mi acaba" şüphesi grep ile kapatılır.

### 8.6 — `web-ext lint` warning attribution: hiç dağılmadan minimal cerrahi

`KEY_FIREFOX_ANDROID_UNSUPPORTED_BY_MIN_VERSION` warning'i için üç seçenek
sunuldu; ikisi (görmezden gel / data_collection_permissions kaldır) yan etkili,
biri (`gecko_android.strict_min_version: "142.0"` ekle) **minimal cerrahi**.
Kullanıcı (b)'yi seçti, manifest'e tek satır eklendi, warning kayboldu,
masaüstü Firefox baseline etkilenmedi.

**Ders:** Lint warning'leri bazen "düzelt ya da reddet"ten fazlasını
sunar — bazen **kapsama özgü minimal değişiklik** mümkündür. Seçenekleri
tek tek değerlendir, yan etkilerini açıkla, kullanıcı karar versin.

---

## 9. Yeni Ajan İçin Hızlı Başlangıç Kontrol Listesi

Mağaza submission (sonraki faz) için kullanıcı ajan kullanırsa, ajan şu
adımları sırasıyla yapmalı:

1. **Bu raporu oku.** Özellikle Bölüm 6 (sonraki faz devri — kullanıcı yürütür)
   ve Bölüm 6.2 (public-açma temizlik checklist'i).
2. **PHASE6_GUIDE.md Bölüm 0.1 (Kural 25 = commit ağacı otorite değil)
   ezberle.** Mağaza submission sürecinde de geçerli.
3. **Disk state'ini `Read`/`Grep` ile doğrula.** `git log` yalnız bağlam.
   Beklenti tablosu:
   - [manifest.json:5](manifest.json#L5) `"version": "1.0.0"`.
   - [package.json:3](package.json#L3) `"version": "1.0.0"`, [package.json:14](package.json#L14) `"web-ext": "^10.3.0"`.
   - [manifest.json:49-51](manifest.json#L49) `gecko_android.strict_min_version: "142.0"`.
   - [README.md:22-26](README.md#L22) "Bilinen sınırlamalar" bölümü mevcut.
   - `src/icons/icon-*.png` Faz 6 logomark (placeholder X değil).
   - `docs/store-listing.md` mevcut.
   - `dist/` `.gitignore`'da; zip'ler local'de var ama tracked değil.
4. **Davranışsal koda dokunma.** Mağaza submission sürecinde reviewer
   feedback gelirse bile, mekanizma değişikliği yeni faz açar — bu fazda
   sadece doc/metadata değişiklikleri makul.
5. **Kullanıcı aksiyonlarını üstlenme** (Kural 34). Hesap açma, mağaza
   yükleme, repo public yapma, Gist oluşturma — hepsi kullanıcı görevidir.
6. **Mağaza gerçeklerini bellekten yazma** (Kural 35). Ücret, boyut,
   süre — submit anında resmi dokümandan.
7. **Atomic commit disiplini**, **açık push onayı** (Kural 29, 30) — devam
   ediyor.

---

## 10. Bu Belgeyi Okuyan Yeni Ajana Son Söz

Faz 6'nın üç ayırt edici disiplini:

1. **Davranış değişmez, yalnız ambalaj** (PHASE6_GUIDE.md Bölüm 16).
   Faz 6 sürecinde `redirect.js`, `block.css`, `popup.*` dosyalarına
   sıfır kod değişikliği yapıldı. Bu disiplin, yayın öncesi "biraz da
   şunu iyileştireyim" ayartmasına direnme pratiğidir.
2. **Allowlist paketleme** (Kural 32). Whitelist tek başına 16 dosya;
   denylist'e güvenmedik. "Kopya"/dev/.md sızıntısı sıfır. Staging
   pattern'i: önce dosyaları tek tek kopyala, sonra paketle, sonra
   içerik grep'le teyit et.
3. **Kullanıcıya ait aksiyonları üstlenmeme** (Kural 34). Hesap açma,
   mağaza submit, yayınlama, repo public yapma, ekran görüntüsü çekme —
   hiçbiri Claude Code tarafından yapılmadı. Net şekilde kullanıcıya
   devredildi.

Projenin değişmez ilkesi (Faz 1-5'ten beri):

> **"İyileştirici değil uygulayıcı ol. Belirsizlikte sor. Sapma yaparsan
> şeffaf raporla. Kapsam dışına çıkma."**

Faz 6 bu ilkeye sıkı tutundu. Mağaza submission da tutmalı — özellikle
reviewer feedback'i sırasında kapsam genişleme baskısına direnmek
kritik olacak.
