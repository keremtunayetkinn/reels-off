# Faz 2 Tamamlama Raporu — Sonraki Ajan Devretme Belgesi

> **Bu belgenin amacı:** Faz 2 tamamlanmış halde, projeyi henüz görmemiş bir AI ajanına projeyi devretmek. Belge sayesinde yeni ajan; (a) Faz 2'de neyin nasıl yapıldığını, (b) hangi seçicilerin hangi gerekçelerle aktive edildiğini, (c) Faz 3'e geçerken nelere dikkat etmesi gerektiğini sıfırdan anlayabilmeli.
>
> **Kaynak otorite hiyerarşisi:** `PHASE2_GUIDE.md` (kullanıcının yazdığı kılavuz) > MV3/WebExtensions resmi dokümantasyonu > bu rapor > `PHASE1_HANDOFF.md`. **İstisna:** Kılavuzla MV3 spesifikasyonu çatışırsa MV3 üstündür (Faz 1'de `_locales/`, Faz 2'de G1 audio-link filter sapması örneği — Bölüm 7).

---

## 1. Proje Kimliği (Faz 2 sonu güncel hali)

| Alan              | Değer                                                                                                                                                                                                                                |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Proje adı         | **Reels Off** (TR ve EN aynı)                                                                                                                                                                                                        |
| Tür               | Chrome + Firefox MV3 tarayıcı eklentisi                                                                                                                                                                                              |
| Tek amaç (güncel) | "Instagram web arayüzünde Reels ve algoritmik içerik önerilerini gizleyerek kullanıcının dikkat dağıtıcı içeriklere maruz kalmasını azaltır." Faz 2'de **Keşfet (Explore)** açıkça kapsama dahil edildi (algoritmik içerik önerisi). |
| Sahibi            | Kerem Tuna                                                                                                                                                                                                                           |
| Telif yılı        | 2026                                                                                                                                                                                                                                 |
| Hedef mağazalar   | Chrome Web Store + Mozilla Add-ons (AMO)                                                                                                                                                                                             |
| Diller            | Türkçe (varsayılan), İngilizce (fallback)                                                                                                                                                                                            |
| Mevcut faz        | **Faz 2 tamamlandı**; sıradaki Faz 3 (URL Redirect — `redirect.js`)                                                                                                                                                                  |

### Teknik kararlar (Faz 1'den miras, Faz 2'de değişmedi)

| Karar                               | Sebep                                                    |
| ----------------------------------- | -------------------------------------------------------- |
| Vanilla JavaScript                  | React/Vue/jQuery yok. Bağımlılık = saldırı yüzeyi        |
| Bundler / minify yok                | Web Store reviewer kaynak kodu okur                      |
| CSS-first engelleme                 | Class isimleri yerine href-first seçici                  |
| `chrome.storage.local` (sync DEĞİL) | Google sunucularına veri gitmez                          |
| CSP sıkı                            | `script-src 'self'; object-src 'none'; base-uri 'none';` |
| `host_permissions` tek entry        | Sadece `https://www.instagram.com/*`                     |
| `permissions` boş                   | Faz 2 yeni izin gerektirmedi                             |
| Build adımı yok                     | Klasör doğrudan yüklenebilir                             |
| Telemetri / analitik                | **Hiç**                                                  |

### Faz 2'ye özel mimari kararlar

| Karar                          | Gerekçe                                                                            |
| ------------------------------ | ---------------------------------------------------------------------------------- |
| **CSS-only, JS yok**           | JS = saldırı yüzeyi. Saf CSS, XSS riski sıfır, SPA navigasyonunda otomatik kalıcı. |
| **href-first seçici**          | Instagram class isimleri obfuscated (`x1qjc9v5`, `_aaa1`); href routing kararlı.   |
| **`display: none !important`** | Instagram inline/yüksek-özgüllük stillerini ezmek için zorunlu.                    |
| **`:has()` dar anchor**        | Performans için; geniş `*:has()` veya `div:has()` yasak.                           |
| **Section'lı, yorumlu CSS**    | Faz 5'te toggle refactor'u kolaylaşsın diye her hedef ayrı bölümde.                |
| **MutationObserver YOK**       | CSS kuralları SPA'da otomatik kalıcı; JS DOM manipülasyonu gereksiz risk.          |
| **Hep aktif (toggle yok)**     | Kullanıcı açma/kapama Faz 5 işi (popup + storage gerektirir).                      |

---

## 2. Çalışma Felsefesi (Faz 1'den Aynen Devam Eder)

`PHASE1_GUIDE.md` Bölüm 9'daki 8 halüsinasyon önleme kuralı (verbatim şablon, placeholder açık bırak, bilmediğin MV3 alanı ekleme, sürüm sorgula, generic policy uzak dur, faz sınırına saygı, şüphede sor, çıktı raporu) Faz 2'de de geçerliydi ve Faz 3+'ta da geçerli.

`PHASE2_GUIDE.md` Bölüm 11'deki Faz 2'ye özel ek kurallar:

- **Kural 9 (kapsam genişlemesi dar tut):** Faz 2 ortasında A2 eklenirken sadece üç ekleme yapıldı (block.css A2 bloğu + scope düzeltmesi, README 2 satır, görsel test bir madde); kapsam dışına çıkılmadı.
- **Kural 10 (mevcut iş hâlâ önce):** A2 eklenirken G1 doğrulama süreci paralel devam etti.

### Kullanıcı bağlamı (Faz 2'de gözlemlenen, Faz 3'e taşınacak)

- Kullanıcı Türkçe konuşur; yapılandırılmış kısa sorular tercih ediliyor.
- Kullanıcı, **bağımsız doğrulama** disiplinine açıkça değer veriyor (G1 sürecinde tarayıcı-ajan oturumu raporunu ben bağımsız çapraz-doğruladıktan sonra implement etmeye geçtim — onaylandı).
- Kullanıcı, **kılavuzdan sapma şeffaflığı**'na değer veriyor (G1 audio-filter sapmasının açık raporlanması ve A/B/C seçim sunma onaylandı).
- Kullanıcı **geri-alınması zor aksiyonlardan önce açık onay** bekler (push, force-push, mağaza submission). Faz 2 commit'i yapıldı, **push hâlâ kullanıcı onayını bekliyor**.
- Diagnostic süreçlerde tarayıcı-ajan oturumu kullanmayı tercih ediyor; bunun için ayrı, profesyonel düzenli prompt isteniyor (`Bölüm 8`'deki diagnostic mission prompt yapısı referans olarak kullanılabilir).

---

## 3. Repo Durumu (Faz 2 Sonu, Doğrulanmış)

```
Yerel dizin:  C:\Users\User\Desktop\İnstagram Chrome Plugin\
Branch:       main (origin/main ile tracking, 2 commit ileride)
Remote:       origin = https://github.com/keremtunayetkinn/reels-off.git
Visibility:   Private (GitHub)
Working tree: clean (bu rapor commit edilmeden önceki durumu kasteder)
Toplam commit: 5
```

### Commit zinciri (eski → yeni)

| Hash      | Mesaj                                                                  | Kapsam                                                    |
| --------- | ---------------------------------------------------------------------- | --------------------------------------------------------- |
| `c1db646` | Add placeholder PNG icons for Phase 1 Chrome load                      | 4 PNG + `.gitkeep` temizliği                              |
| `8c95378` | Move \_locales to extension root (Chrome MV3 requires hard-coded path) | `src/_locales/` → `_locales/` rename                      |
| `67097a0` | Add Phase 1 Handoff Report for AI Agent Transition                     | `PHASE1_HANDOFF.md`                                       |
| `0002e6a` | Add initial project structure and configuration files for Phase 1      | Faz 1 ana iskelet                                         |
| `638a623` | Add Phase 2 Implementation Guide for CSS Injection and Reels Blocking  | `PHASE2_GUIDE.md`                                         |
| `ea51773` | **Phase 2: CSS injection for Reels/Explore blocking (A1, A2, D1, G1)** | `README.md` (+2 satır), `src/content/block.css` (+65, -1) |

`ea51773` HEAD'dir ve **origin/main'in 2 commit ilerisindedir** (push edilmedi — kullanıcı onayı bekliyor).

---

## 4. Faz 2 Dosya Envanteri

### Faz 2'de DEĞİŞTİRİLEN dosyalar (sadece 2)

| Dosya                   | Değişiklik                       | Açıklama                                                   |
| ----------------------- | -------------------------------- | ---------------------------------------------------------- |
| `src/content/block.css` | Placeholder → 4 aktif CSS kuralı | A1, A2, D1, G1 — sayfa header + 4 section header + 4 kural |
| `README.md`             | "Ne yapar" listesine 2 satır     | Keşfet sidebar + `/explore/` URL redirect satırları        |

### Faz 2'de DOKUNULMAYAN dosyalar (Faz 1'den aynen kaldı)

`manifest.json`, `src/content/redirect.js` (placeholder), `_locales/tr/messages.json`, `_locales/en/messages.json`, `src/popup/*` (Faz 5), `src/icons/*` (Faz 10), `LICENSE`, `PRIVACY-TR.md`, `PRIVACY-EN.md`, `.gitignore`, `.eslintrc.json`, `.prettierrc.json`, `PHASE1_GUIDE.md`, `PHASE1_HANDOFF.md`, `PHASE2_GUIDE.md`, `docs/.gitkeep`.

`git diff` ile teyit edildi: bu listede hiçbir dosyada tek karakter değişiklik yok.

---

## 5. Faz 2 Sırasında Toplanan Kullanıcı Kararları

Faz 1'deki tüm kararlar değişmedi (`PHASE1_HANDOFF.md` Bölüm 5). Faz 2'de yeni bir karar verildi:

| Karar                             | Değer                 | Bağlam                                                                                                                                                                               |
| --------------------------------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| A2 (Keşfet/Explore) kapsama dahil | EVET                  | Faz 2 ortasında verildi. "Single purpose statement zaten 'algoritmik içerik önerileri' diyor; Keşfet algoritmik içerik önerisidir." Kapsam genişlemesi değil, kapsam spesifikasyonu. |
| G1 seçicisinde audio-link filter  | EVET (Seçenek A)      | Tarayıcı-ajan oturumunda tespit edilen tuzak. Kılavuz Bölüm 6 verbatim'inden sapma; kullanıcı şeffaf rapor sonrası onayladı.                                                         |
| Push zamanlaması                  | **Henüz onaylanmadı** | Faz 2 commit'i lokal; push için açık onay bekleniyor.                                                                                                                                |

---

## 6. `src/content/block.css` İçeriği (Verbatim, Faz 2 sonu)

```css
/*
 * Reels Off — block.css
 * Faz 2: Content Script CSS Injection
 *
 * Strateji: href-first seçiciler. Instagram class isimleri obfuscated
 * (x1qjc9v5, _aaa1 vb.) ve sık değişir; href routing kararlıdır.
 *
 * Tüm kurallar "her zaman aktif"tir. Kullanıcı açma/kapama toggle'ları
 * Faz 5'te (popup + chrome.storage.local) eklenecektir.
 *
 * Kapsam (README ile tutarlı):
 *   A1 — Sidebar Reels linki         [aktif]
 *   A2 — Sidebar Keşfet linki        [aktif]
 *   D1 — Profil Reels sekmesi        [aktif]
 *   G1 — Feed tekil Reel gönderileri [aktif]
 */

/* A1 — Sol kenar çubuğu Reels linki */
a[href='/reels/'] {
  display: none !important;
}

/* A2 — Sol kenar çubuğu Keşfet linki */
a[href='/explore/'] {
  display: none !important;
}

/* D1 — Profil sayfası Reels sekmesi */
main a[href$='/reels/']:not([href='/reels/']) {
  display: none !important;
}

/* G1 — Feed'e gömülü tekil Reel gönderileri (audio-link false-positive guard'lı) */
article:has(a[href^='/reels/']:not([href='/reels/']):not([href^='/reels/audio/'])) {
  display: none !important;
}
```

> **Not:** Yukarıdaki blok özetleyici amaçlıdır. Gerçek dosyadaki her section'ın üstündeki açıklayıcı yorum bloğu (güven, gerekçe, doğrulama tarihi) **olduğu gibi korunmalıdır** — Faz 5'te toggle refactor edilirken oradaki gerekçe metni iş yükünü azaltacak.

### Hedef seçicilerin gerekçesi (özet)

| ID  | Seçici                                                                               | Gerekçe                                                                                                                                                                                                                           |
| --- | ------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A1  | `a[href="/reels/"]`                                                                  | Tam eşleme; sidebar Reels linki tam `/reels/`. Feed reel'leri `/reels/<id>/` formatında olduğundan hariç.                                                                                                                         |
| A2  | `a[href="/explore/"]`                                                                | Tam eşleme; sidebar Keşfet linki tam `/explore/`. `/explore/locations/`, `/explore/tags/<tag>/` gibi alt yollar hariç (Faz 3'te URL redirect'te ayrı işlenecek).                                                                  |
| D1  | `main a[href$="/reels/"]:not([href="/reels/"])`                                      | `main` içinde `/<username>/reels/` ile biten link; sidebar `/reels/` hariç. Profil tab'ları `role="link"` + `aria-selected` hibrit yapı kullanır (`role="tab"` DEĞİL), bu yüzden href suffix ile hedeflendi.                      |
| G1  | `article:has(a[href^="/reels/"]:not([href="/reels/"]):not([href^="/reels/audio/"]))` | Post-seviyesi `<article>` container; reel post linki içerenleri gizle. **Audio filter:** IG bazı foto post'larda şarkı atfı için `/reels/audio/<id>/` linki kullanır; bu filter o foto post'ların yanlışlıkla gizlenmesini önler. |

---

## 7. PHASE2_GUIDE.md'den Sapmalar (Şeffaf İfşa)

Faz 2 boyunca kılavuzdan **iki** sapma yapıldı. İkisi de kullanıcı açık onayıyla.

### Sapma 1 — A2 (Keşfet) faz ortasında kapsama eklendi

- **Kılavuzdaki durum:** Bölüm 2.2 "A2 (Explore/Keşfet) gizleme **YAPMA** — README'de yok, committed kapsam dışı."
- **Neden sapıldı:** Kullanıcı (Kerem) Faz 2 ortasında bilinçli karar verdi. Argüman: single purpose statement zaten "algoritmik içerik önerileri" diyor; Keşfet algoritmik içerik önerisi sayfasıdır → kapsam genişlemesi değil, kapsam spesifikasyonu. Manifest/izin/privacy etkilenmedi.
- **Çözüm:** Üç ek (kullanıcı şartıyla — "Kural 9: kapsam dar tut"):
  1. `README.md` "Ne yapar" listesine 2 satır eklendi (Keşfet sidebar + `/explore/` URL).
  2. `block.css`'e A2 bloğu eklendi, kapsam header düzeltildi ("Kapsam DIŞI: A2" satırı silindi).
  3. Görsel test checklist'ine A2 maddesi eklendi (Faz 2'ye özel addendum, kılavuza yazılmadı).
- **Commit:** `ea51773` (A1, D1, G1 ile birlikte tek atomic commit).
- **Etki:** Faz 3 kılavuzunda `redirect.js`'in `/explore/*` URL pattern'ini de hedeflemesi bekleniyor (README'deki "Ne yapar" satırı bunu söz veriyor). Faz 3 ajanı bu satırı atlayamaz.

### Sapma 2 — G1 seçicisine `:not([href^="/reels/audio/"])` eklendi

- **Kılavuzdaki durum:** Bölüm 4 G1 aday seçicisi `article:has(a[href^="/reels/"]:not([href="/reels/"]))` (audio filter YOK). Bölüm 8.3: "Container `<article>` ise: block.css'teki G1 yorumunu kaldır, **olduğu gibi** aktive et."
- **Neden sapıldı:** 2026-05-28 tarihli tarayıcı-ajan doğrulama oturumu kritik bir tuzak tespit etti: IG bazı foto post'larda müzik etiketi için `/reels/audio/<id>/` linki kullanır. Bu link `/reels/` prefix'iyle başlayıp `/reels/` olmayan bir URL — kılavuzdaki orijinal `:not([href="/reels/"])` filter'ından kaçar. Filter olmadan: müzik etiketli foto post'lar `article:has(audio-link)` ile yanlışlıkla gizlenir.
- **Çözüm:** Seçiciye `:not([href^="/reels/audio/"])` zincirleme `:not()` eklendi. CSS Selectors Level 4 standartı; evrensel destek.
- **Onay süreci:** Kullanıcıya A/B/C seçenek sunuldu (A: audio filter'lı, B: kılavuz verbatim, C: ek soru). Seçenek A onaylandı ("mümkün oldukça kılavuzdan sapmama" şartıyla — bu yüzden başka iyileştirme yapılmadı).
- **Commit:** `ea51773` (G1 bloğunun içine yapıldı, comment olarak "Bölüm 8.3 sapma raporu kullanıcı onaylı" notu düşüldü).
- **Etki:** Bu sapma `PHASE2_GUIDE.md` Bölüm 6 şablonu ve Bölüm 8.3 talimatıyla çelişir. Faz 5'te (popup toggle) G1 kuralını refactor eden ajan **mutlaka audio filter'ı korumalı**; yoksa müzik etiketli foto post'lar regression olur.

### Sapma yapmayan ama dikkat çeken nokta — G1 "flicker" konusu (Bölüm 8)

- Kullanıcı görsel test sırasında "Senin için feed'de aşağı kaydırırken gönderiler hızlı aralıklarla kaybolup geri geliyor (flicker)" bildirdi.
- 2026-05-31 tarihli ikinci tarayıcı-ajan diagnostic oturumu (12 sn, 25 örnek, scrollY=0→4800) flicker'ı **reprodüksiyona almadı**. Aynı scrollY'de `g1Matches` monoton ve stabil kaldı (2→3→7); osilasyon gözlenmedi.
- Hipotez skor tablosu (rapor): H1 (DOM staging), H2 (caption reel linki), H3 (Suggested kart), H4 (Reels Tray) **hiçbiri desteklenmedi**.
- Yorum: Kullanıcının gözlemlediği "kaybolup geri gelme" büyük olasılıkla **IG'nin kendi virtualization'ı** (`totalArticles` ajan testinde 20→17→20 dalgalandı). Bu eklentinin değil, IG'nin lazy-load davranışı.
- Sonuç: G1 olduğu gibi (audio-filter'lı seçici) commit edildi. **Kod değişikliği yapılmadı.**
- Kullanıcı bu yorumu onayladıktan sonra ek görsel test (extension disable/enable + D1 son kontrol) yapıldı, anomali rapor edilmedi.

---

## 8. G1 Doğrulama Süreci (Yöntemsel Not — Faz 3+ İçin Şablon)

G1 doğrulama, Faz 2'nin en yüksek belirsizlik içeren kısmıydı. Kullanılan yöntem Faz 3+ için referans olabilir:

1. **Ajan kılavuzu hazırlama:** Kullanıcı tarayıcı-ajan oturumu kullanacağı için ayrı, sıkı kısıtlamalı, sosyal-etkileşim-yasak, anonim raporlamalı bir mission prompt yazıldı. (Bu prompt konuşma geçmişinde, gerekirse Faz 3'te benzer pattern ile tekrar üretilebilir.)
2. **Bağımsız doğrulama:** Ajan raporu geldiğinde Claude Code bağımsız çapraz-okudu (matematik, yapı, hipotez eleme kalitesi, metodoloji).
3. **Şeffaf sapma raporu:** Kılavuzdan sapma gerekiyorsa A/B/C seçenek halinde kullanıcıya sunuldu, onay alındıktan sonra uygulandı.
4. **Diagnostic iterasyonu:** Görsel test sırasında bildirilen anomali için ikinci bir ajan oturumu yapıldı (flicker testi); rapor flicker'ı doğrulamadı → kod değişikliği yapılmadı, gözlem IG davranışına atfedildi.

Bu pattern Faz 3'te `redirect.js`'in URL yakalama seçicilerini doğrularken aynısı kullanılabilir — özellikle Instagram'ın SPA navigation event'lerini izole world'den dinlemenin zor olduğu noktada.

---

## 9. Görsel Test Sonuçları (PHASE2_GUIDE.md Bölüm 9)

Test ortamı: Chrome (kullanıcının ana tarayıcısı), kullanıcının kendi IG hesabı, kontrollü oturum.

| Madde                                                                        | Sonuç                                             |
| ---------------------------------------------------------------------------- | ------------------------------------------------- |
| A1 — Sidebar Reels linki kayboldu                                            | ✓                                                 |
| A2 — Sidebar Keşfet linki kayboldu                                           | ✓                                                 |
| D1 — Kendi profilde + `instagram.com/instagram/` Reels sekmesi gizli         | ✓ (son kontrol 2026-05-31)                        |
| G1 — "Senin için" feed'de reel post'lar gizli                                | ✓                                                 |
| G1 — Normal foto/video post'lar görünür                                      | ✓                                                 |
| G1 — Müzik etiketli foto post'lar görünür (audio filter doğrulaması)         | ✓                                                 |
| Genel — Hiçbir sayfa beyaz/boş değil                                         | ✓                                                 |
| Genel — DM, Story, arama, profil normal                                      | ✓                                                 |
| Genel — Eklenti kapatılınca her şey eski hâline dönüyor (geri-alınabilirlik) | ✓ (son kontrol 2026-05-31)                        |
| Genel — Console eklenti kaynaklı hata yok                                    | ✓ (17 hata IG/diğer eklentilerden, analiz edildi) |

### Console hatalarının kaynağı (kullanıcı 17 hata bildirdi)

- `ERR_BLOCKED_BY_CLIENT` (IG telemetry: `ajax/bz?...`, `graph.instagram.com/logging_client_events`): **Başka bir eklenti** engelliyor (uBlock Origin, AdGuard, vb.). Reels Off'un `webRequest` / `declarativeNetRequest` izni yok, ağ engelleyemez.
- `Banner not shown: beforeinstallpromptevent...`: IG'nin PWA banner kodu.
- `Dur! Bu, geliştiriciler için tasarlanmış...`: IG'nin self-XSS uyarısı (kasıtlı, her IG kullanıcısında görünür).
- `Permissions policy violation: unload is not allowed`: IG'nin kendi kodu.
- `POST .../ajax/bz... ERR_BLOCKED_BY_CLIENT` stack trace'li: IG React Scheduler telemetry, başka eklenti engelliyor.

**Hiçbiri Reels Off kaynaklı değil.**

---

## 10. Faz 2 Tamamlandı Şartları (PHASE2_GUIDE.md Bölüm 12)

| Şart                                                                   | Durum                                                             |
| ---------------------------------------------------------------------- | ----------------------------------------------------------------- |
| `src/content/block.css` Bölüm 6 şablonuyla dolduruldu                  | ✅                                                                |
| A1 ve D1 kuralları aktif, doğru href-first seçiciler                   | ✅                                                                |
| G1 doğrulanıp aktive edildi, durum net raporlandı                      | ✅ (2026-05-28 ata zinciri + 2026-05-31 controlled scroll)        |
| Hiçbir class-name (obfuscated) seçici yok                              | ✅                                                                |
| Tüm aktif kurallar `display: none !important`                          | ✅ (4 kural, grep ile teyit)                                      |
| `@import`, `url()`, inline style yok                                   | ✅ (grep ile teyit)                                               |
| `manifest.json`, `redirect.js`, `_locales/`, popup dosyaları DEĞİŞMEDİ | ✅ (`git diff` boş)                                               |
| Görsel test (Bölüm 9) yapıldı ve geçti                                 | ✅                                                                |
| Eklenti devre dışı bırakılınca Instagram normale dönüyor               | ✅                                                                |
| Konsola eklenti kaynaklı hata düşmüyor                                 | ✅                                                                |
| Commit atıldı                                                          | ✅ `ea51773`                                                      |
| Push için kullanıcı onayı alındı                                       | ⏳ **Beklemede** — kullanıcı onayı sonrası `git push origin main` |

**Bonus (kapsam dışıydı, Faz 2 ortasında karar):** A2 (Keşfet) eklendi.

---

## 11. Faz 3'e Hazırlık (Sonraki Ajan İçin Operasyonel Notlar)

### Faz 3 hakkında bilinen (kılavuz henüz yok)

- **Konu:** URL Redirect (JavaScript).
- **Hedef dosya:** `src/content/redirect.js` (manifest'te zaten referanslı, şu an placeholder).
- **Kapsam (Faz 2 sonu README'sinden okunur):**
  - `/reels/` ve `/reels/<id>/` → `/`
  - `/explore/` → `/` (Faz 2'de A2 ile birlikte committed kapsama girdi)
  - Profil Reels feed'i (`/<username>/reels/`) → ihtimal ayrı path matcher
- **Bilinen teknik zorluk:** Instagram SPA. `history.pushState` content script'ten patch'lenemez (izole world). Polling-based URL change detection veya `popstate`/`hashchange` event'leri kullanılacak.

### Yeni ajanın **başlamadan** doğrulaması gerekenler

1. Kullanıcıdan **Faz 3 kılavuzu** (`PHASE3_GUIDE.md`) gelmesini bekle. Bu rapora dayanarak proaktif başlatma — Kural 6 ihlali.
2. Kullanıcı kılavuzu sağladığında bu rapordaki state'le tutarlılık kontrolü:
   - Kılavuz Faz 2'de aktif olan 4 CSS kuralının (A1, A2, D1, G1) korunduğunu varsayıyor mu? Varsayım doğru — block.css dokunulmayacak.
   - Kılavuz `redirect.js`'i `document_start`'ta çalıştırmaya devam mı edecek? Şu an manifest böyle, değişebilir.
   - Kılavuz yeni bir `permissions` ekliyor mu? (Faz 3'te `webNavigation` cazip görünebilir ama gereksiz — content script `location.href` ile yetinir.) Kural 3 — varsa kullanıcıya MV3 dokümanından doğrulamayı öner.
   - Kılavuz `/explore/*` URL redirect'ini içeriyor mu? Faz 2 README'si bu sözü veriyor; kılavuz atlarsa kullanıcıya hatırlat.
3. G1 audio-filter sapması (Bölüm 7 Sapma 2) **kayıt altında**. Faz 3'te G1 kuralına dokunulmuyor; ama Faz 5'te toggle refactor edilirken bu filter kaybolmamalı.

### Bilinen riskler / dikkat noktaları

- **`history.pushState` izole world'de patch'lenemez.** MutationObserver veya periodic `location.href` polling kullanmak gerekecek. Kılavuz hangi yöntemi seçtiyse uygula; kendi tercihini empoze etme.
- **`location.replace(url)` vs `window.location = url`:** `replace` tarayıcı geçmişine eklemez (tercih edilen, "back" tuşu reel'e geri dönmesin). Kılavuz farklı bir şey söylemiyorsa `replace` kullan.
- **Sonsuz redirect loop riski:** Eğer hedef URL ana sayfa (`/`) ise ve ana sayfa script'i tekrar tetiklerse loop olur. Kılavuz açıkça URL kontrolü yapmayı söylüyorsa uygula; söylemiyorsa kullanıcıya sor.
- **`run_at: "document_start"` ve `location.replace`:** `document_start`'ta `location.replace` çalışır mı? Genellikle evet, ama bazı tarayıcılarda `window` henüz yok. Test edilmeli.
- **A2 ile birlikte gelen `/explore/` redirect'i:** Faz 2 sonu README'sinde söz var. Faz 3 kılavuzu bunu atlarsa kullanıcıya hatırlat.

### Ne YAPMA

- `block.css`'e dokunma — Faz 2 outputu, Faz 3 işi değil.
- A2 kapsamını daha da genişletme (öneriler "DM Suggested" da gizlensin gibi) — Kural 9 hâlâ geçerli.
- G1 seçicisini "iyileştirme" — kılavuz açıkça istemiyorsa.
- `popup.*` dosyalarına dokunma — Faz 5.
- `_locales/` ekleme — Faz 3'te yeni kullanıcı-yüzü metni gerekirse o zaman.
- `permissions` ekleme — kılavuz emretmediği sürece.

---

## 12. Yeni Ajan İçin Hızlı Self-Doğrulama Komutları

Repo'ya girdiğinde state'i hızlı teyit etmek için:

```bash
# Repo durumu
git log --oneline                          # En üstte: ea51773 Phase 2: CSS injection...
git status                                 # working tree clean
git remote -v                              # origin = ...keremtunayetkinn/reels-off.git

# Manifest sağlığı (Faz 2'de değişmedi)
python -m json.tool manifest.json          # valid JSON
git diff 0002e6a -- manifest.json          # BOŞ olmalı (Faz 1'den beri değişmemiş)

# block.css içeriği (Faz 2 outputu)
test -s src/content/block.css              # boş değil
grep -c "display: none !important" src/content/block.css  # 4 olmalı (A1, A2, D1, G1)
grep -E '\.(x[0-9a-z]{6,}|_[a-z]{3,})' src/content/block.css  # BOŞ (class-name seçici yok)
grep -E "@import|url\(" src/content/block.css  # BOŞ (yasaklı CSS)

# redirect.js Faz 3 için hâlâ placeholder
cat src/content/redirect.js                # "// Faz 2'de doldurulacak" olmalı (rename mantıklı: Faz 3'te doldurulacak)

# _locales hâlâ kökte (Sapma 2 — Faz 1'den miras)
ls _locales/tr/messages.json _locales/en/messages.json

# Push durumu
git log origin/main..HEAD --oneline        # 2 commit listelenmeli: 638a623, ea51773
# (kullanıcı push onayı verdiyse boş olur)
```

---

## 13. Açık Konular / Henüz Yapılmadıklar

| Konu                                          | Faz                  | Not                                                                                                         |
| --------------------------------------------- | -------------------- | ----------------------------------------------------------------------------------------------------------- |
| Faz 2 push                                    | Faz 2 son adım       | Kullanıcı onayı bekleniyor                                                                                  |
| `redirect.js` doldurma                        | Faz 3                | Kılavuz henüz yok                                                                                           |
| Popup UI + toggle'lar                         | Faz 5                | A1/A2/D1/G1 kuralları "her zaman aktif"; Faz 5'te kullanıcı kontrolüne geçecek                              |
| `chrome.storage.local` entegrasyonu           | Faz 5                | Kullanıcı tercihlerini saklamak için                                                                        |
| Gerçek ikon tasarımları                       | Faz 10               | Placeholder PNG'ler hâlâ kullanımda                                                                         |
| `docs/selectors.md` ve `docs/threat-model.md` | Faz 0 (kullanıcıdan) | Faz 2'de de getirilmedi                                                                                     |
| `package.json` (devDependencies için)         | Opsiyonel            | Sadece kullanıcı isterse                                                                                    |
| Test infrastructure                           | Faz 10               | Henüz yok                                                                                                   |
| CI/CD (GitHub Actions)                        | Faz 13               | Yok                                                                                                         |
| AMO / Web Store submission                    | Faz 13               | Yok                                                                                                         |
| Eklenti versiyonu                             | `0.1.0`              | Faz 13 öncesi bump kararı kullanıcıda                                                                       |
| G1 uzun-vade DOM stability                    | Faz 5+               | IG redesign sürecinde; periyodik MutationObserver tabanlı yeniden değerlendirme önerisi var (Faz 5 sonrası) |

---

## 14. Bu Belgeyi Okuyan Ajan'a Son Söz

Faz 2 üç alt-aşamadan geçti:

1. **Statik kısım (A1, D1):** Kılavuz şablonu birebir uygulandı.
2. **Genişletme (A2):** Faz ortasında kullanıcı kararı; Kural 9 (kapsam dar) sıkı uygulandı — sadece üç dosya satırı eklendi.
3. **Belirsizlik (G1):** Tarayıcı-ajan oturumuyla doğrulandı, audio-filter sapması şeffaf raporlandı, ikinci diagnostic oturumuyla "flicker" gözlemi IG virtualization'a atfedildi.

Bu projenin disiplini: **"İyileştirici değil uygulayıcı ol. Belirsizlikte sor. Sapma yaparsan şeffaf raporla."** Faz 2 bu disipline sıkı tutundu; Faz 3 ajanı aynı disiplini sürdürmeli.

Faz 2 temiz tamamlandı. Faz 3 kılavuzunu kullanıcıdan alana kadar bu repo'da `redirect.js` dahil hiçbir değişiklik yapma. Bu sırada kullanıcı Faz 2'yi push edip etmemeye karar verecek; push edildikten sonra `origin/main` ile senkron olunacak.
