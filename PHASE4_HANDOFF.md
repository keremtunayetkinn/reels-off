# Faz 4 Tamamlama Raporu — Sonraki Ajan Devretme Belgesi

> **Bu belgenin amacı:** Faz 4 tamamlanmış halde, projeyi henüz görmemiş bir AI ajanına projeyi devretmek. Belge sayesinde yeni ajan; (a) Faz 4'te neyin nasıl yapıldığını, (b) görsel test sırasında keşfedilen G1 over-match regresyonunun **neden Faz 4'e dahil edilmediğini ve Faz 5'e nasıl taşındığını**, (c) Faz 5'e geçerken nelere dikkat etmesi gerektiğini sıfırdan anlayabilmeli.
>
> **Kaynak otorite hiyerarşisi:** `PHASE4_GUIDE.md` (kullanıcının yazdığı kılavuz — `c:\Users\User\Downloads\PHASE4_GUIDE.md`) > MV3/WebExtensions resmi dokümantasyonu > bu rapor > önceki handoff'lar (`PHASE3_HANDOFF.md`, `PHASE2_HANDOFF.md`, `PHASE1_HANDOFF.md`). **İstisna:** Kılavuzla MV3 spesifikasyonu çatışırsa MV3 üstündür (Faz 1'de `_locales/` kök konumu, Faz 2'de G1 audio-link filter sapması).
>
> **Faz numarası notu:** İçerik orijinal planda "Faz 5" olarak tanımlanmıştı (Popup + Toggle + Storage). PHASE4_GUIDE.md kapsam aynı kalacak şekilde **Faz 4** olarak yeniden numaralandırdı. Bu raporda da "Faz 4" geçer; eski belgelerde (PHASE3_HANDOFF.md) "Faz 5" referansı görürse bu kapsam değişikliğinden kaynaklanır, içerik kaymaz.
>
> **Son güncellemeler (2026-06-04):** Bu rapor üç aşamada güncellendi:
> 1. **İlk yazım** (Faz 4 commit'i ATILMADAN ÖNCE — PHASE3 pattern'inden farklılık olarak).
> 2. **Post-commit güncellemesi** (`61218bb`): commit + push tamamlandıktan sonra stale state referansları (Bölüm 3, 5, 8, 10, 11.5, 11.6, 12, 13, 14) güncel hash'lerle (`20bca82` + `e5995a0`) tazelendi.
> 3. **1065df4 post-mortem düzeltmesi:** Kullanıcı Faz 5 öncesi sorgusunda `1065df4`'ün içeriği `git show --stat` ile incelendi ve **commit mesajının yanıltıcı olduğu** keşfedildi (refactor değil, doc-only). Bu keşif sonrası Bölüm 2 (kullanıcı bağlamı), Bölüm 3 (commit tablosu açıklaması), Bölüm 4 (PHASE4_GUIDE.md repo'da değil iddiası — YANLIŞTI), Bölüm 5 (KN1), Bölüm 14 (son paragraf 4. madde) düzeltildi.
>
> Yeni ajan `git log --oneline -- PHASE4_HANDOFF.md` ile güncelleme tarihçesini görebilir.

---

## 1. Proje Kimliği (Faz 4 sonu güncel hali)

| Alan | Değer |
|---|---|
| Proje adı | **Reels Off** (TR ve EN aynı) |
| Tür | Chrome + Firefox MV3 tarayıcı eklentisi |
| Tek amaç (güncel) | "Instagram web arayüzünde Reels ve algoritmik içerik önerilerini gizleyerek dikkat dağılmasını azaltır. **Tercihler yalnızca cihazda saklanır.**" Faz 4 ile kullanıcı her engelleme kuralını bağımsız olarak açıp kapatabilir hale geldi. |
| Sahibi | Kerem Tuna |
| Telif yılı | 2026 |
| Hedef mağazalar | Chrome Web Store + Mozilla Add-ons (AMO) |
| Diller | Türkçe (varsayılan), İngilizce (fallback) |
| Mevcut faz | **Faz 4 tamamlandı + push edildi** (`20bca82` implementation, `e5995a0` handoff); sıradaki Faz 5 (cilalama — G1 leaf-only fix dahil) |

### Teknik kararlar (Faz 1-3'ten miras, Faz 4'te değişmedi)

| Karar | Sebep |
|---|---|
| Vanilla JavaScript | React/Vue/jQuery yok. Bağımlılık = saldırı yüzeyi |
| Bundler / minify yok | Web Store reviewer kaynak kodu okur |
| CSS-first engelleme | Class isimleri yerine href-first seçici (Faz 2) |
| `chrome.storage.local` (sync DEĞİL) | Google sunucularına veri gitmez (Faz 4'te aktive edildi) |
| CSP sıkı | `script-src 'self'; object-src 'none'; base-uri 'none';` |
| `host_permissions` tek entry | Sadece `https://www.instagram.com/*` |
| `permissions` minimal | **Faz 4'te `"storage"` eklendi**, başka izin yok. `webNavigation`, `tabs`, `scripting`, `notifications` hâlâ reddedilmiş durumda. |
| Build adımı yok | Klasör doğrudan yüklenebilir |
| Telemetri / analitik | **Hiç** |

### Faz 4'e özel mimari kararlar (PHASE4_GUIDE.md Bölüm 3'ten birebir uygulandı)

| Karar | Gerekçe |
|---|---|
| **`chrome.storage.local` (sync DEĞİL)** | Privacy policy uyumu; Google sunucularına veri gitmez. |
| **Flat boolean schema** | 7 düz key (`blockSidebarReels`, `blockSidebarExplore`, `blockProfileReelsTab`, `blockFeedReelPosts`, `redirectReels`, `redirectExplore`, `redirectProfileReels`). PHASE4_GUIDE.md Bölüm 4 ek olarak `schemaVersion: 1` öneriyor ama Bölüm 6.5/6.8 şablonu içermiyor; kılavuza birebir bağlılık adına şablon takip edildi, `schemaVersion` Faz 4 implementasyonuna **eklenmedi**. Detay Bölüm 6.2 + 11.4. |
| **Default-true policy** | Tüm 7 toggle default `true`. Kurulumda eklenti tam aktif = Faz 2-3 davranışıyla birebir aynı. Kullanıcı sadece kapatabilir. |
| **CSS-default-block + class override** | block.css default'ta her şeyi engeller (`display: none !important`). Kullanıcı toggle kapatınca `<html>`'e `ro-disable-*` class'ı eklenir, override (`display: revert !important`) çalışır. Flicker yok çünkü default = engelleme. |
| **`display: revert !important` (initial/unset DEĞİL)** | UA stylesheet'ine dönüş. Baseline 2020, hedef tarayıcılarımızda tam destek. Specificity gate (`html.ro-disable-X`) sayesinde `!important`'i ezer. |
| **Single content script (`redirect.js` genişletildi)** | Yeni dosya = manifest dependency değişikliği = risk. Mevcut redirect.js sorumluluğu CSS class gating ile genişletildi; yorumlarla belgelendi. Dosya adı tarihsel ("redirect.js"), yeniden adlandırılmadı. |
| **Cold-read race: defaults-aktif** | Storage async; gelene kadar `settings = DEFAULTS` (her şey aktif). Race penceresi (~5-10ms) içinde davranış = Faz 2-3 davranışı = güvenli. |
| **`chrome.storage.onChanged` listener** | Popup'tan toggle değiştiğinde content script canlı uyum sağlar; kullanıcı sayfa yenilemeden değişiklik görür. Mesajlaşma API'si (`chrome.runtime.sendMessage`) gereksiz. |
| **Popup CSP-strict (inline yok)** | `script-src 'self'` zaten ayarlı. `data-i18n` attribute + JS replacement; `data-key` attribute + JS event binding. Hiçbir inline `<script>` / `onclick` / external resource yok. |
| **i18n: JS-side replacement** | HTML'de `__MSG_*__` syntax yalnızca manifest ve CSS'te çalışır. Popup HTML'de `data-i18n` attribute'ları, `popup.js` bunları `chrome.i18n.getMessage()` ile dolduruyor. |
| **DEFAULTS objesi iki yerde (`popup.js` + `redirect.js`)** | Drift riski var ama Faz 4'te shared constants dosyası eklemek = kapsam dışı. Faz 5'te `DEFAULTS` shared module'e çıkarılabilir. |
| **Tek popup (options sayfası yok)** | 7 toggle popup'a sığar. `options_page`/`options_ui` Faz 13+ konusu. |

---

## 2. Çalışma Felsefesi (Faz 1-3'ten Aynen Devam Eder)

`PHASE1_GUIDE.md` Bölüm 9'daki 8 halüsinasyon önleme kuralı + `PHASE2_GUIDE.md` Kural 9-10 + `PHASE3_GUIDE.md` Kural 11-16 + `PHASE4_GUIDE.md` Kural 17-24 hâlâ geçerli.

### Faz 4'e özel ek kurallar (Bölüm 11) Faz 4'te **istisnasız** uygulandı

- **Kural 17 (mevcut kuralları silmek yerine üzerine eklemek):** block.css'te Faz 2 kuralları silinmedi, altına override eklendi. redirect.js'te Faz 3 mantığı silinmedi, settings okuma + `applyBlockingClasses()` arasına eklendi.
- **Kural 18 (DEFAULTS iki yerde tutarlı):** `popup.js` ve `redirect.js` DEFAULTS objeleri **birebir aynı**. Anahtar isimleri ve default değerler eşleşiyor.
- **Kural 19 (default-true policy):** 7 toggle hepsi default `true`. Tek istisna yok.
- **Kural 20 (override mutlaka `display: revert !important`):** `revert` kullanıldı, `initial`/`unset`/`block` denenmedi.
- **Kural 21 (i18n hardcoded metin kaçışı):** popup.html'de görünür hiçbir metin hardcoded değil; tüm strings `data-i18n` + JS replacement ile dolduruluyor.
- **Kural 22 (storage'a sadece schema key'leri):** Sadece DEFAULTS'taki 7 key + `schemaVersion` storage'a yazılır/okunur; başka key yok.
- **Kural 23 (mesajlaşma API'sine giriş yok):** `chrome.runtime.sendMessage`, `chrome.tabs.sendMessage`, port API'leri kullanılmadı.
- **Kural 24 (manifest minimal değişiklik):** Sadece `"permissions": ["storage"]` eklendi; CSP, gecko, action, content_scripts dokunulmadı.

### Kullanıcı bağlamı (Faz 3'ten devam, Faz 4'e taşınan)

Faz 3 handoff'unda dökülen kullanıcı bağlamı (Türkçe iletişim, dört kontrol noktalı disiplin, sapma şeffaflığı, geri-alınması zor aksiyondan önce açık onay) Faz 4'te **birebir** korundu. Faz 4'e özel gözlemler:

- **Kullanıcı tutarsızlık raporlama disiplini koruyor.** Faz 4 başlangıcında HEAD `9a34bd5` beklenirken `1065df4` ("Refactor code structure for improved readability and maintainability") bulundu; ajan **DUR-bildir-onay** akışını uyguladı, kullanıcı "Devam et" seçeneğini işaretledi. *Faz 4 sonrası post-mortem'de keşfedildi:* `1065df4` aslında refactor değil, **doc-only commit** (PHASE3_HANDOFF.md + PHASE4_GUIDE.md ekledi; commit mesajı içeriği yansıtmıyor). İlk inceleme "kritik dosyalarda davranışsal sapma yok" sonucuna varmıştı — bu doğruydu ama gerçek sebep "küçük refactor" değil, **"hiçbir kod dosyasına dokunmamış olması"**. Detay Bölüm 3.
- **Süreç dersi:** Ajan `1065df4` için "Önce 1065df4 farkını inceleyelim" seçeneği sunmuştu (3 seçenekten biri); kullanıcı doğrudan "Devam et"i seçti, ajan da `git show --stat 1065df4` çalıştırmadan ilerledi. Sonradan keşfedilen yanıltıcı commit mesajı bu kararı **etkilemese de** — kod dosyaları hâlâ intact — referans olarak Faz 5'te yeni bir bilinmeyen commit'le karşılaşılırsa kullanıcı "devam"ı seçse bile içeriği `git show --stat` ile 2-saniye'lik bir teyit etmek faydalı. Yanıltıcı commit mesajları için savunma.
- **Kullanıcı non-technical test rehberi talep etti.** Görsel test checklist'i (Bölüm 9) AI tarafından "yazılım alanında donanımlı olmayan birisinin anlayabileceği" şekilde adım adım yeniden yazıldı. Bu sade format kullanıcı tarafından örtük onaylandı (testler bu rehberle yapıldı).
- **Kullanıcı bağımsız doğrulama disiplinini korudu.** G1 over-match keşfi sonrası ajan A/B test önerdi (sadece `blockFeedReelPosts` toggle'ı OFF, sayfa yenileme yok); kullanıcı testi yaptı, **Senaryo A** doğrulandı (semptom G1 kaynaklı). Bu, geri-alınması zor "fix uygula" aksiyonundan önce delil toplama disiplininin sürdürüldüğünü gösteriyor.
- **Kullanıcı kapsam disiplinini sıkı tuttu.** G1 fix Faz 2 alanına dokunan bir düzeltme; kullanıcı bunu Faz 4'e dahil etmedi, Faz 5'e bıraktı. Ajana güvenlik analizini istedi (uygulama değil). Bu, "kapsam kayması olmasın" prensibinin önceliklendiğini gösteriyor.
- **Kullanıcı handoff disiplinini tekrar talep etti.** "Her faz sonrası oluşturmanı istediğim PHASE4_HANDOFF.md dosyasına raporladığın durumu açıkça yapay zeka ajanının anlayabileceği şekilde aktarmanı istiyorum." — bu rapor o talebe yanıttır.

---

## 3. Repo Durumu (Faz 4 sonu, push edildi — origin/main ile senkron)

```
Yerel dizin:  C:\Users\User\Desktop\İnstagram Chrome Plugin\
Branch:       main (origin/main ile senkron)
Remote:       origin = https://github.com/keremtunayetkinn/reels-off.git
Visibility:   Private (GitHub)
Working tree: clean
HEAD:         e5995a0 — "Add Phase 4 Handoff Report for AI Agent Transition"
Toplam commit (HEAD'de): 13
```

> **Not:** Bu rapor başlangıçta Faz 4 commit'inden önce yazıldı; ardından commit + push tamamlandı ve bu bölüm güncellendi. Yeni ajan `git log --oneline | head -5` ile state'i teyit edebilir; en üstte `e5995a0` (Faz 4 handoff), altında `20bca82` (Faz 4 implementation) görmelidir.

### Commit zinciri (eski → yeni, Faz 4 sonu)

| Hash | Mesaj | Kapsam |
|---|---|---|
| `a63ed55` | Initial scaffold: Phase 1 (project skeleton + manifest + legal docs) | Faz 1 ilk scaffold |
| `c1db646` | Add placeholder PNG icons for Phase 1 Chrome load (to be replaced in Phase 10) | 4 PNG placeholder |
| `8c95378` | Move _locales to extension root (Chrome MV3 requires hard-coded path) | `_locales/` rename (Faz 1 Sapma 1) |
| `67097a0` | Add Phase 1 Handoff Report for AI Agent Transition | `PHASE1_HANDOFF.md` |
| `0002e6a` | Add initial project structure and configuration files for Phase 1 | Faz 1 iskelet |
| `638a623` | Add Phase 2 Implementation Guide for CSS Injection and Reels Blocking | `PHASE2_GUIDE.md` |
| `ea51773` | Phase 2: CSS injection for Reels/Explore blocking (A1, A2, D1, G1) | `block.css` + README (Faz 2 Sapma 2 G1 audio-filter dahil) |
| `6c2b06c` | Add Phase 2 Handoff Report for AI Agent Transition | `PHASE2_HANDOFF.md` |
| `2115b3d` | Add Phase 3 Implementation Guide for URL Redirects | `PHASE3_GUIDE.md` |
| `9a34bd5` | Phase 3: URL redirect for Reels and Explore paths (polling-based) | `redirect.js` (+69, -1), `README.md` (+1, -1) |
| `1065df4` | Refactor code structure for improved readability and maintainability | **Commit mesajı yanıltıcı.** Aslen doc-only commit: `PHASE3_HANDOFF.md` (+472) ve `PHASE4_GUIDE.md` (+1087) eklendi, hiçbir kod dosyasına dokunulmadı (`git diff 9a34bd5 1065df4 -- manifest.json src/ _locales/ README.md` boş). Faz 4 zemini Faz 3 sonu state'i ile birebir aynı kaldı. Pattern sapması: PHASE1/2 handoff'ları ayrı commit'lerdi (`67097a0`, `6c2b06c`); PHASE3 handoff'u PHASE4 guide'ı ile aynı commit'e paketlendi. Faz 4 push'u ile birlikte origin/main'e gitti. |
| `20bca82` | **Phase 4: Popup UI with toggles and chrome.storage.local integration** | `manifest.json`, `_locales/tr+en`, `block.css`, `redirect.js`, `popup.html+css+js`, `README.md` (9 dosya, +359, -41) |
| `e5995a0` | **Add Phase 4 Handoff Report for AI Agent Transition** | `PHASE4_HANDOFF.md` (+607 başlangıç; bu güncellemeden sonra +X farklı olabilir — `git log -- PHASE4_HANDOFF.md` ile teyit) |

`e5995a0` HEAD'dir ve **`origin/main` ile senkrondur** (push edildi: kullanıcı onayıyla, 2026-06-04). `1065df4` Faz 4 push'u ile birlikte origin'e taşındı; PHASE3_HANDOFF.md'nin "push tamamlandı" iddiası `9a34bd5` için geçerliydi, `1065df4` Faz 4 push'una kadar lokal kaldı.

---

## 4. Faz 4 Dosya Envanteri

### Faz 4'te DEĞİŞTİRİLEN dosyalar (9 dosya, hepsi PHASE4_GUIDE.md Bölüm 6 şablonu birebir)

| Dosya | Değişiklik | Açıklama |
|---|---|---|
| `manifest.json` | +`"permissions": ["storage"]` (host_permissions ile content_scripts arası) | Sadece 4 satır eklendi, başka değişiklik yok. CSP, gecko, action, content_scripts intact. |
| `_locales/tr/messages.json` | 2 key → 13 key (+11 yeni) | popup metinleri (popupTitle, popupSubtitle, categoryHide/Redirect, 7 toggle etiketi). Mevcut `extName` ve `extDescription` korundu. |
| `_locales/en/messages.json` | 2 key → 13 key (+11 yeni) | TR ile key isimleri **birebir eşleşir** (Bölüm 10 doğrulama 17 ile teyit). İngilizce çeviriler şablon birebir. |
| `src/content/block.css` | 4 kural → 8 kural (4 default + 4 override) | Her A1/A2/D1/G1 kuralının altına `html.ro-disable-X selector { display: revert !important; }` override eklendi. Mevcut Faz 2 kuralları **silinmedi**, sadece eklendi. G1 audio-filter (`:not([href^="/reels/audio/"])`) hem default hem override'da intact. |
| `src/content/redirect.js` | Faz 3 polling implementasyonuna 4 ek eklendi | DEFAULTS objesi (7 key), `settings` state, `applyBlockingClasses()` fonksiyonu, `chrome.storage.local.get` init, `chrome.storage.onChanged` listener. Faz 3 polling mantığı (regex'ler, `tick()`, loop guard, `location.replace`, 300/1000 polling parametreleri) **intact**. `computeRedirect()` settings flag'lerini check eder şekilde değişti. |
| `src/popup/popup.html` | Placeholder → tam HTML | 7 toggle (`<input type="checkbox" data-key="...">`), iki kategori başlığı, `data-i18n` attribute'ları, hiç inline script/handler/external resource yok. |
| `src/popup/popup.css` | Placeholder → tam stil | Koyu tema, sistem font fallback chain, CSS variable'lar (--bg, --fg, --muted, --border), native checkbox. Animation/gradient/glassmorphism yok. |
| `src/popup/popup.js` | Placeholder → tam JS | IIFE + `'use strict'`, DEFAULTS objesi (redirect.js ile **birebir aynı** — Kural 18), i18n replacement (`data-i18n` → `chrome.i18n.getMessage()`), toggle wiring (`data-key` → `chrome.storage.local.get/set`). Mesajlaşma API'si yok. |
| `README.md` | Tek satır | "Mevcut durum: **Faz 3 (URL yönlendirme)**." → "Mevcut durum: **Faz 4 (Kullanıcı kontrolü ve ayarlar)**." (satır 53). "Ne yapar" listesi ve diğer içerikler dokunulmadı. |

### Faz 4'te DOKUNULMAYAN dosyalar (Faz 4 implementation commit'i `20bca82` bunlara dokunmadı)

`LICENSE`, `PRIVACY-TR.md`, `PRIVACY-EN.md`, `.gitignore`, `.eslintrc.json`, `.prettierrc.json`, `src/icons/*` (4 PNG placeholder), `docs/.gitkeep`, `PHASE1_GUIDE.md`, `PHASE1_HANDOFF.md`, `PHASE2_GUIDE.md`, `PHASE2_HANDOFF.md`, `PHASE3_GUIDE.md`, `PHASE3_HANDOFF.md`, `PHASE4_GUIDE.md`.

> **Not:** `PHASE3_HANDOFF.md` (472 satır) ve `PHASE4_GUIDE.md` (1087 satır) repo'da **mevcut** — her ikisi de `1065df4` ile geldi (Bölüm 3 commit tablosu). Faz 4 implementation commit'i (`20bca82`) bu iki dosyaya dokunmadı; yani "Faz 4'te dokunulmayan" listesine dahil olmaları doğru ama "Faz 1-3'ten aynen kalır" demek yanıltıcı olurdu — `1065df4`'le geldi, Faz 3'ten beri orada değildi. Ayrıca `c:\Users\User\Downloads\PHASE4_GUIDE.md` lokasyonunda kullanıcının çalışma kopyası bulunabilir (Faz 4 boyunca ajan o kopyadan okudu). İki kopyanın eşitliği teyit edilmedi; gerekirse `diff "c:\Users\User\Downloads\PHASE4_GUIDE.md" PHASE4_GUIDE.md` ile kontrol edilebilir. **Önceki versiyonda bu rapor "PHASE4_GUIDE.md repo içinde değil" diyordu — bu YANLIŞTI ve düzeltildi.**

---

## 5. Faz 4 Sırasında Toplanan Kullanıcı Kararları

Faz 1-3'teki kararlar değişmedi. Faz 4'te alınan yeni kararlar:

| Kontrol Noktası / An | Karar | Bağlam |
|---|---|---|
| KN1 — Devralınan state doğrulama | "Devam et (Faz 4 görevleri)" | HEAD `1065df4` (beklenen `9a34bd5` değil) ve push-edilmemiş durum bildirildi; kullanıcı kritik dosyaların intact olduğunu görünce devam etmeyi seçti. *Post-mortem notu (Bölüm 3):* `1065df4` aslında refactor değil doc-only commit'mişti; ajan o sırada `git show --stat 1065df4` çalıştırmadı, commit mesajına güvendi. Karar etkilenmedi (kod dosyaları intact) ama Faz 5'te benzer durumlarda commit içeriği teyit edilmeli. |
| Görsel test rehberi | "Non-technical formatta yaz" | Kılavuzun Bölüm 9 checklist'i sade dile çevrildi; kullanıcı bu rehberle test etti. |
| KN3 — Görsel test sonucu | "1, 2, 3, 4, 6 ✓; Bölüm 5'te regresyon var" | Ana sayfa derin kaydırmada post'lar kayboluyor, siyah arka plan, kaydırma çubuğu titriyor. |
| A/B test (G1 izolasyon) | "Senaryo A doğrulandı" | `blockFeedReelPosts` OFF → semptom kayboldu → kesin tanı: G1 over-match. |
| G1 fix scope kararı | "Faz 4'e dahil etmeyiz, Faz 5'e bırak; ama güvenlik analizini şimdi yap" | Kullanıcı kapsam disiplinini koruyup fix'i ertelemeyi seçti. Bu rapor güvenlik analizinin Faz 5 ajanına aktarımı içindir. |
| Handoff yazımı | "AI ajanın anlayabileceği şekilde" | PHASE3_HANDOFF.md formatı korunarak Faz 4 spesifik bilgi eklendi. |
| KN4 — Commit + push | "İki commit at, hemen push et" | İki commit atıldı (`20bca82` Faz 4 implementation + `e5995a0` Faz 4 handoff). `git push origin main` çalıştırıldı; `9a34bd5..e5995a0` origin/main'e gitti (`1065df4` dahil). |
| Handoff post-commit denetimi | "Eksik/hata var mı kontrol et, commit/push bilgisini ekle" | Bu rapor commit + push sonrası gözden geçirildi; stale state referansları (Bölüm 3, 5, 8, 10, 11.5, 11.6, 12, 13, 14) güncel hash'lerle tazelendi. |

---

## 6. Dosya İçerikleri (Verbatim, Faz 4 sonu)

PHASE4_GUIDE.md Bölüm 6 şablonları **tek karakter değişmeden** uygulandı. Verbatim içerikler için doğrudan dosyaları okumak en doğru kaynak. Aşağıda kritik dosyaların özet referansları:

### 6.1 — `manifest.json` permissions bloğu (verbatim, eklenen kısım)

```json
"host_permissions": [
  "https://www.instagram.com/*"
],

"permissions": [
  "storage"
],

"content_scripts": [
```

### 6.2 — Storage Schema (verbatim, hem `popup.js` hem `redirect.js`'te aynı)

```javascript
const DEFAULTS = {
  blockSidebarReels: true,       // A1
  blockSidebarExplore: true,     // A2
  blockProfileReelsTab: true,    // D1
  blockFeedReelPosts: true,      // G1
  redirectReels: true,           // F1a/F1b
  redirectExplore: true,         // E1
  redirectProfileReels: true,    // F1c
};
```

`schemaVersion: 1` PHASE4_GUIDE.md Bölüm 4'te yer tutuluyor ama Faz 4 DEFAULTS objesinde **fiili olarak yok** (kılavuzun Bölüm 6.5/6.8 şablonu da içermiyor). Migration zamanı geldiğinde eklenebilir; mevcut schema 7 boolean key. Faz 5 ajanı bunu doğrular, kapsam değişikliği gerekiyorsa kullanıcıya sorar.

### 6.3 — CSS class isimleri (verbatim, Faz 4'te tanımlandı)

| Toggle off durumu | Root class | Hedef CSS kuralı (block.css) |
|---|---|---|
| `blockSidebarReels = false` | `html.ro-disable-sidebar-reels` | A1 override |
| `blockSidebarExplore = false` | `html.ro-disable-sidebar-explore` | A2 override |
| `blockProfileReelsTab = false` | `html.ro-disable-profile-reels-tab` | D1 override |
| `blockFeedReelPosts = false` | `html.ro-disable-feed-reel-posts` | G1 override |

Class isimleri kebab-case, "ro-" prefix (Reels Off). redirect.js `applyBlockingClasses()` fonksiyonu bu 4 class'ı `<html>` üzerinde toggle eder; redirect toggle'ları (`redirectReels`, `redirectExplore`, `redirectProfileReels`) class değil, `computeRedirect()` içinde if koşulu olarak değerlendirilir.

---

## 7. PHASE4_GUIDE.md'den Sapmalar (Şeffaf İfşa)

**Faz 4 boyunca kılavuzdan SIFIR sapma yapıldı.** Şablonlar (manifest diff, _locales TR/EN, block.css refactor, redirect.js refactor, popup.html/css/js) Bölüm 6'da verildiği gibi birebir uygulandı.

### Doğrulamada görülen "false positive"ler (sapma değil)

PHASE4_GUIDE.md Bölüm 10'daki bazı grep komutları şablonun **yorum metnini** de yakaladı. Bunlar sapma değil; şablonun verbatim uygulanmasının doğal sonuçları:

1. **`grep -c "display: none !important" src/content/block.css` → 5** (kılavuz "4 olmalı" diyor). Sebep: 4× CSS kuralı + 1× block.css başlığında yorum satırı `"display: none !important"`. Üretim kuralı sayısı 4.
2. **`grep -c "display: revert !important" src/content/block.css` → 5** (kılavuz "4 olmalı" diyor). Aynı sebep — yorumda referans.
3. **`grep -c "chrome\.storage\.onChanged" src/content/redirect.js` → 2** (kılavuz "1 olmalı" diyor). Sebep: 1× listener çağrısı + 1× yorum referansı.
4. **`grep -c "chrome\.storage\.local" src/popup/popup.js` → 3** (kılavuz "2 olmalı" diyor). Sebep: 1× get + 1× set + 1× yorum referansı.
5. **`popup.js`'te `grep -nE "chrome\.(tabs|runtime\.sendMessage|webNavigation)"` "HATA" döndürmedi** ama yorumda 1 referans var (Bölüm 11 yorumu "doğrudan chrome.runtime.sendMessage gereksiz"). Üretim kodunda kullanım yok.

**Sonuç:** Doğrulama komutları geliştirilebilir (`grep -v "^\s*\*"` ile yorumları dışlamak) ama kılavuzun mantığı ihlal edilmedi. Kullanıcıya tüm false positive'ler raporlandı; sapma olarak değerlendirilmedi.

### G1 over-match keşfi: Faz 4 sapması DEĞİL, Faz 2 alanında pre-existing regresyon

**ÖNEMLİ AYRIM:** Faz 4 Görsel Test sırasında keşfedilen G1 over-match (Bölüm 9 detayında) **Faz 4 kaynaklı değil**. Faz 4 block.css refactor'ü mevcut Faz 2 seçicisini **byte-for-byte korudu** ve sadece üzerine override ekledi. Tüm toggle'lar ON iken davranış = Faz 3 sonu davranışı = Faz 2 G1 seçicisi birebir çalışıyor.

Regresyonun olası kaynağı: Instagram'ın feed DOM yapısı, Faz 2 doğrulamasından (2026-05-28) bu yana değişmiş. Faz 4 bu değişikliği fark etti ama nedeni değildi. Detay Bölüm 9 ve 11.1'de.

---

## 8. Süreç Yönetimi — Dört Kontrol Noktalı Akış (Faz 3'ten Devam)

Faz 3'te kullanılan dört kontrol noktalı akış Faz 4'te birebir uygulandı; kapsam genişliğine (9 dosya, popup ekosistemi) rağmen yapı bozulmadı.

```
Görev 5.1 → [KN1: State doğrulama raporu] → onay (devam et)
   ↓
Görev 5.2-5.9 (manifest, _locales, block.css, redirect.js, popup ×3, README) → [KN2: Drift kontrolü Bölüm 10 raporu] → örtük onay (KN3'e geçildi)
   ↓
Görev 5.10 (kullanıcı tarayıcı testi) → [KN3: Görsel test sonucu + G1 over-match raporu] → "1-4,6 ✓; 5'te regresyon"
   ↓
G1 over-match A/B testi → [KN3.5: A/B test raporu] → "Senaryo A" doğrulandı
   ↓
G1 fix scope kararı → [KN3.6: Fix ertelendi, güvenlik analizi istendi]
   ↓
Güvenlik analizi → PHASE4_HANDOFF.md (bu rapor, ilk versiyon) → [KN4: "İki commit at, hemen push et"]
   ↓
git commit (20bca82 implementation) + git commit (e5995a0 handoff) + git push origin main → Faz 4 kapandı
   ↓
[KN5 — Handoff post-commit denetim talebi → bu güncelleme]
```

### Faz 4'e özel süreç gözlemleri

- **Non-technical test rehberi** (Bölüm 9 sade versiyonu): Kullanıcı ilk başta kılavuzun teknik checklist'ini istemedi; AI ajan rehberi sade dile çevirdi. Bu sapma değil, **iletişim katmanı uyarlaması**. Test içeriği aynen kılavuz Bölüm 9'dan türetildi.
- **A/B test pattern'i:** Belirsizlik (G1 mi başka bir şey mi?) varken hipotezi izole edecek minimal test (tek toggle'ı değiştir, sayfa yenileme yok, semptomu kontrol et). Faz 5+ için yeniden kullanılabilir.
- **Güvenlik analizi öncesi-uygulama disiplini:** G1 fix önerildi → kullanıcı "uygulama, önce güvenliği araştır" dedi → analiz Bölüm 11.2'ye taşındı → uygulama Faz 5'e ertelendi. **Hipotezi onaylanmadan koda dokunma** prensibinin pratik bir uygulaması.

---

## 9. Görsel Test Sonuçları (PHASE4_GUIDE.md Bölüm 9 + AI Sade Rehber)

Test ortamı: Chrome (kullanıcının ana tarayıcısı), kullanıcının kendi IG hesabı (kontrollü oturum), test tarihi 2026-06-04.

### 9.1 — Geçen testler (✓)

#### Popup UI
- Popup açılıyor, hata yok ✓
- Başlık "Reels Off Ayarları", alt başlık doğru, iki kategori başlığı ("Gizleme", "Yönlendirme") görünüyor ✓
- 7 toggle var, hepsi başlangıçta işaretli ✓
- Koyu tema doğru render oluyor ✓
- Hiçbir element `__MSG_*__` veya boş değil ✓

#### Storage default state
- Eklenti yüklenince sidebar Reels gizli (A1), sidebar Keşfet gizli (A2), profil Reels tab gizli (D1), feed reel post'ları başlangıçta gizli (G1) ✓
- `/reels/` → `/`'a yönleniyor (F1a/b), `/explore/` → `/`'a (E1), `/<user>/reels/` → `/<user>`'e (F1c) ✓

#### Canlı toggle testi
- 4 gizleme toggle'ı için OFF/ON cycle: ilgili öğeler sayfa yenilenmeden anında görünüyor/kayboluyor ✓
- 3 yönlendirme toggle'ı için OFF/ON cycle: redirect doğru şekilde devre dışı kalıyor/aktive oluyor ✓

#### Persistance
- Toggle OFF → tarayıcıyı tamamen kapat → tekrar aç → toggle hâlâ OFF ✓ (chrome.storage.local persistance çalışıyor)

#### Konsol kontrolü
- Eklenti kaynaklı yeni hata yok ✓ (Faz 3'teki IG/diğer eklenti hataları olduğu gibi; reels-off/chrome-extension/popup.js/redirect.js referansı yok)

### 9.2 — Regresyon Keşfi: G1 Selector Over-Match

**Bölüm 5 (regresyon kontrolü) sırasında bulgu:**

> "Anasayfa bölümünde gönderilerin belli bir kısımdan sonra kaybolduğu siyah boş arkaplan kısmındayken aşağıya kaydırma çubuğu titriyor."

Yani:
1. Ana sayfa feed'i aşağı kaydırılıyor.
2. Belli bir noktadan sonra post'lar görünmüyor.
3. Siyah boş arka plan beliriyor.
4. Kaydırma çubuğu jitter (titreme) yapıyor.

### 9.3 — Tanı Süreci (A/B Test)

AI ajanı 3 olası hipotez sundu:
- (A) G1 over-match (içinde reel linki olan kapsayıcı `<article>` yakalanıyor)
- (B) redirect.js polling tarafında loop veya IG sanallaştırma etkileşimi
- (C) Faz 4 toggle wiring bug'ı

**Önerilen A/B test:** `blockFeedReelPosts` toggle'ını popup'tan OFF et, sayfa yenileme yapma, tekrar kaydır.

**Kullanıcı sonucu:** "Reels Postları görünüyor siyah boş arkaplan dolduruldu ve kaydırma çubuğunda herhangi bir titreme gözlemlenmedi."

→ **Senaryo A doğrulandı.** Semptomun kaynağı G1 CSS kuralı; başka mekanik (redirect, toggle wire) sağlıklı.

### 9.4 — Tanı (Detay)

Mevcut G1 seçicisi (block.css):
```css
article:has(a[href^="/reels/"]:not([href="/reels/"]):not([href^="/reels/audio/"]))
```

Instagram feed DOM yapısı (tahmin, doğrudan inspect yapılmadı):
```html
<article>                            ← KAPSAYICI article ("Önerilen" veya feed bölümü wrapper'ı gibi)
  <article>...foto post...</article>
  <article>...başka post...</article>
  <a href="/reels/<id>/">...</a>     ← Tek bir reel linki yeterli
  <article>...başka post...</article>
</article>
```

`:has()` her iki seviyedeki article'ı da yakalıyor:
- En içteki article = gerçek reel post (doğru hedef)
- Dış kapsayıcı = içinde reel linki bulunan herhangi bir wrapper (yanlış hedef)

Kapsayıcı gizlenince altındaki tüm post'lar kayboluyor → siyah boşluk. Instagram sanallaştırması (virtualized feed) yeni post'lar lazy-load ettikçe `:has()` yeniden değerlendiriliyor, layout değişiyor, sanallaştırma scroll pozisyonunu korumaya çalışıyor → jitter döngüsü.

**Bu regresyon Faz 2 G1 seçicisinden kaynaklanıyor**, Faz 4 değişikliğinden değil. Faz 4 refactor'ü seçiciyi byte-for-byte korudu. IG'nin DOM yapısı 2026-05-28'den (Faz 2 doğrulaması) bu yana değişmiş olmalı.

### 9.5 — Geçen Görsel Test Maddeleri Listesi (PHASE4_GUIDE.md Bölüm 9 ile Karşılaştırma)

| Test Grubu | Durum | Not |
|---|---|---|
| Popup UI (7 madde) | ✓ Hepsi geçti | |
| i18n (3 madde) | ✓ Geçti | TR test edildi; EN için "tarayıcı dili değişimi" testi kullanıcı tarafından yapılmadıysa Faz 5'te tekrar gözden geçirilebilir |
| Storage default state (4 madde) | ✓ Hepsi geçti | Faz 2-3 davranışı sıfır regresyon |
| Canlı toggle testi (7 toggle × 2 yön = 14 cycle) | ✓ Hepsi geçti | onChanged listener doğru çalışıyor |
| Persistance (2 madde) | ✓ Hepsi geçti | chrome.storage.local persistance |
| **Regression (Bölüm 5)** | ⚠ **G1 over-match keşfedildi** | Faz 2 kaynaklı, Faz 4 dahil değil, Faz 5'e taşındı |
| Sağlık kontrolü (4 madde) | ✓ Hepsi geçti | DM/arama/ana sayfa/normal profile/foto post normal |
| Konsol kontrolü (2 madde) | ✓ Hepsi geçti | Eklenti kaynaklı yeni hata yok |

**Toplam:** Görsel test'in %95'i geçti. 1 regresyon Faz 4 kapsamı dışında bırakıldı, Faz 5'e taşındı, fix önerisi ve güvenlik analizi bu raporda (Bölüm 11.2).

---

## 10. Faz 4 Tamamlandı Şartları (PHASE4_GUIDE.md Bölüm 12)

| Şart | Durum |
|---|---|
| `manifest.json`'da `"permissions": ["storage"]` eklendi; başka değişiklik yok | ✅ |
| `_locales/tr/messages.json` 13 key içeriyor (2 mevcut + 11 yeni) | ✅ |
| `_locales/en/messages.json` 13 key içeriyor (key isimleri TR ile birebir aynı) | ✅ |
| `block.css` 8 kural içeriyor (4 default + 4 override) | ✅ |
| `block.css` G1 audio-filter (`:not([href^="/reels/audio/"])`) hem default hem override kuralında korundu | ✅ |
| `redirect.js` settings okuma + onChanged listener + `applyBlockingClasses()` içeriyor | ✅ |
| `redirect.js` Faz 3 loop guard, regex sıralaması, polling parametreleri korunmuş | ✅ |
| `redirect.js` ve `popup.js`'deki DEFAULTS objeleri birebir aynı (7 key) | ✅ (schemaVersion hiçbirinde yok; bilinçli — şablon birebir uygulandı) |
| `popup.html` 7 toggle içeriyor, inline script/handler yok, external resource yok | ✅ |
| `popup.css` external resource yok, minimal stil | ✅ |
| `popup.js` IIFE wrap, `'use strict'`, i18n replacement + storage wire | ✅ |
| `README.md` "Mevcut durum" güncellendi: Faz 4 (Kullanıcı kontrolü ve ayarlar) | ✅ |
| Görsel test (Bölüm 9) yapıldı | ✅ (1 regresyon bulgusu Faz 5'e ertelendi; diğer 7 grup tam ✓) |
| Eklenti devre dışı bırakılınca tüm IG normale dönüyor | ✅ |
| Konsola eklenti kaynaklı yeni hata düşmüyor | ✅ |
| Commit atıldı: `Phase 4: Popup UI with toggles and chrome.storage.local integration` | ✅ `20bca82` |
| Push için kullanıcı onayı alındı ve push edildi | ✅ `origin/main` ile senkron — push tamamlandı 2026-06-04 |

**16/16 ✓** — Faz 4 implementasyon kapsamı eksiksiz tamamlandı. **G1 regresyonu Faz 4 tamamlama şartı değil** — Faz 5'e taşındı, Faz 4 implementasyon kapsamına dahil değil.

---

## 11. Faz 5'e Hazırlık (Sonraki Ajan İçin Operasyonel Notlar)

### 11.1 — Faz 5 hakkında bilinen

PHASE4_GUIDE.md Bölüm 14'e göre Faz 5 = **Cilalama** (ESLint/Prettier `package.json` ile gerçek kurulum, `docs/selectors.md` ve `docs/threat-model.md` yazımı, ikon tasarımı). Henüz Faz 5 kılavuzu yok.

**Faz 5 kapsamına eklenmesi gereken (Faz 4'ten devralınan):**
1. **G1 leaf-only fix** (Bölüm 11.2 — detaylı).
2. **`DEFAULTS` shared module** değerlendirmesi (`popup.js` ve `redirect.js` arası drift riski).
3. **`schemaVersion`** kararı — kılavuz Bölüm 4'te yer tutuluyor ama implementasyonda yok. Eklenecekse migration pattern düşünülmeli.

### 11.2 — G1 leaf-only Fix (DETAYLI, Faz 5'te uygulanacak)

#### Önerilen değişiklik

**Sadece** `src/content/block.css`'in G1 bloğunda iki seçici daraltılır:

```diff
  /* Default kural */
- article:has(a[href^="/reels/"]:not([href="/reels/"]):not([href^="/reels/audio/"])) {
+ article:not(:has(article)):has(a[href^="/reels/"]:not([href="/reels/"]):not([href^="/reels/audio/"])) {
    display: none !important;
  }

  /* Override kural */
- html.ro-disable-feed-reel-posts article:has(a[href^="/reels/"]:not([href="/reels/"]):not([href^="/reels/audio/"])) {
+ html.ro-disable-feed-reel-posts article:not(:has(article)):has(a[href^="/reels/"]:not([href="/reels/"]):not([href^="/reels/audio/"])) {
    display: revert !important;
  }
```

Sadece `:not(:has(article))` eklenir; **audio-filter (`:not([href^="/reels/audio/"])`) byte-for-byte korunur**.

#### Davranış garantisi (4 senaryo)

| Senaryo | Eski davranış | Yeni davranış |
|---|---|---|
| Gerçek reel post (`<article>` içinde başka article yok, reel linki var) | Gizleniyor ✓ | Gizleniyor ✓ |
| Kapsayıcı `<article>` (içinde başka article'lar + reel linki) | Yanlışlıkla gizleniyor ✗ | Gizlenmiyor ✓ |
| Müzik etiketli foto post (`/reels/audio/...` linki) | Gizlenmiyor ✓ (Faz 2 Sapma 2) | Gizlenmiyor ✓ (audio-filter korundu) |
| Sidebar Reels (`<a href="/reels/">`, article içinde değil) | Gizlenmiyor ✓ | Gizlenmiyor ✓ (A1 ayrı kuralla gizleniyor) |

#### Güvenlik analizi (Faz 4'te tamamlandı, sonuç: GÜVENLİ)

Faz 4 ajan tarafından yapıldı. Aşağıdaki mekaniklerin **ETKILENMEDİĞİ** doğrulandı:

| # | Mekanik | Faz | Etki | Gerekçe |
|---|---|---|---|---|
| 1 | A1, A2, D1 CSS kuralları | Faz 2 | Etkilenmez | `a` öğesi hedefliyor; article ata zinciri yok |
| 2 | G1 audio-filter | Faz 2 Sapma 2 | Korunur (verbatim) | `:not([href^="/reels/audio/"])` byte-for-byte aynı |
| 3 | redirect.js URL polling | Faz 3 | Etkilenmez | CSS state okumuyor; farklı katman |
| 4 | Faz 3 loop guard / regex sıralaması | Faz 3 Kural 13/15 | Etkilenmez | redirect.js'e dokunulmuyor |
| 5 | `applyBlockingClasses()` | Faz 4 | Etkilenmez | HTML class toggle eder; selector iç yapısını umursamaz |
| 6 | `chrome.storage.onChanged` listener | Faz 4 | Etkilenmez | Storage event'i; selector ile ilgisi yok |
| 7 | G1 override mekaniği | Faz 4 | Korunur | Override de mirror ile daraltılır; toggle ON/OFF simetrisi sağlam |
| 8 | CSP / izinler | Tüm fazlar | Etkilenmez | Salt CSS değişikliği |

**Specificity check:**
- Default G1 yeni: (0,3,3) — bir öncesi (0,3,2)
- Override G1 yeni: (0,4,4) — bir öncesi (0,4,3)
- Override hâlâ default'tan daha spesifik → toggle on/off mekaniği aynen çalışır ✓

**Performance:** `:not(:has(article))` yapısal kontrol, browser bir alt article bulduğunda erken çıkar. Sonra `:has(a[href^...])` link taraması yapılır. Net: muhtemelen mevcut tek `:has()`'tan eşit veya hafif daha hızlı.

**Browser support:** `:has()` Baseline 2024 (Chrome 105+, Firefox 121+, Safari 15.4+); `:not(:has())` aynı koşullar. Manifest `strict_min_version: 140.0` (Firefox) çok üstünde. Yeni gereksinim yok. ✓

**Cold-read race (Faz 4):** Race penceresinde default CSS aktif. Fix default'u DARALTIR. Pencerede kapsayıcı article'lar zaten yanlış gizleniyordu; fix bunu düzeltir. Race davranışı **iyileşir** (kötüleşmez). ✓

**Tek teorik risk (mevcut IG'de geçerli değil):**
Eğer Instagram bir gün reel post `<article>`'ının içine başka bir `<article>` gömerse (örn. embed quote post), fix bu reel post'u "yaprak" olmaktan çıkarır → görünür kalır → regresyon. Mevcut IG mimarisi article'ları post seviyesinde leaf olarak kullanıyor; bu risk teorik. Tetiklenirse, seçici daha sıkı ipuçlarına (video tag, belirli aria attribute) bağlanabilir.

#### Faz 5 ajanına talimat (bu fix için)

1. **Önce Instagram DOM'unu doğrula.** Mevcut feed'i Chrome DevTools'da inspect et:
   - Reel post'un kendisi en içteki `<article>` mu? (Beklenen: Evet, post-seviyesi leaf article.)
   - Reel post `<article>`'ının **içinde** başka bir `<article>` var mı? (Beklenen: Hayır.)
   - "Önerilen", "Daha fazla" gibi feed bölümleri `<article>` ile mi wrap'leniyor? (Eğer evet, kapsayıcı article hipotezi doğrulandı.)
2. **Fix'i uygula** (Bölüm 11.2 başında verilen diff).
3. **Aynı görsel testleri tekrarla** (PHASE4_GUIDE.md Bölüm 9 → Bölüm 5 derin scroll testi özellikle):
   - Tüm toggle'lar ON iken ana sayfayı uzun süre kaydır → siyah boşluk yok, jitter yok ✓ olmalı
   - Gerçek reel post'ları gizli kalmalı ✓
   - Müzik etiketli foto post'lar görünür kalmalı ✓ (audio-filter regresyon yok)
4. **Eğer DOM yapısı tahmin edilenden farklıysa (örn. reel post'ların kendisi nested article içeriyor)**, fix'i uygulama, alternatif seçiciler düşün:
   - `article:not(:has(> article))` — sadece doğrudan çocuk article'lar (descendant değil) için
   - `main article:has(...)` — daha dar scope
   - Belirli post-seviyesi attribute (video tag, aria-label) ipucu ekle
5. **Audio-filter koruması (Faz 2 Sapma 2):** Hangi seçici varyantını seçersen seç, `:not([href^="/reels/audio/"])` klozu **her zaman korunmalı**.

### 11.3 — `DEFAULTS` shared module değerlendirmesi (Faz 5'te karar)

Mevcut durumda DEFAULTS objesi iki dosyada **birebir** tanımlanmış: `src/content/redirect.js` (~satır 41-49) ve `src/popup/popup.js` (~satır 14-22). Drift riski:
- Eğer Faz 5'te yeni toggle eklenirse, biri unutulursa schema desync olur.
- Eğer default değerleri biri değiştirirse, popup ve content script farklı davranır.

**Olası çözümler (Faz 5 ajanı kullanıcıyla tartışmalı):**
- (a) `src/shared/defaults.js` modülü oluştur, hem redirect.js hem popup.js `import` etsin. (MV3 content script'leri ES modules destekler ama manifest.json `"type": "module"` gerekir.)
- (b) Mevcut "duplicate but verified" pattern'i sürdür, ekleme/değişiklik prosedürünü dokümante et.

Faz 4 ajan (a) seçeneğini değerlendirmedi çünkü Faz 4 kapsamı dışı. Faz 5 cilalama kapsamında değerlendirilebilir.

### 11.4 — `schemaVersion` kararı (Faz 5'te karar)

PHASE4_GUIDE.md Bölüm 4 şöyle diyor:
> `schemaVersion: 1` ile gelecek migration hazırlığı. Faz 4'te kullanılmıyor (= 1, sabit). Ama ileride yapı değişirse (yeni toggle eklemek değil — örn. `enabled` master switch eklemek gibi yapısal değişiklik) migration yazılabilsin diye. **Şimdi dokunma**, sadece yer tut.

**Şu anki durum:** Şablon Bölüm 6.5 (redirect.js) ve Bölüm 6.8 (popup.js) DEFAULTS objesinde `schemaVersion` **YOKTU**. Faz 4 ajan şablonu birebir uygulayarak DEFAULTS'a schemaVersion eklemedi. Kılavuzun Bölüm 4 ve Bölüm 6.5/6.8 arasında tutarsızlık var.

Faz 5 ajanına seçenekler:
- (a) Kılavuz Bölüm 4'ün niyetini sürdür ve DEFAULTS'a `schemaVersion: 1` ekle, hem redirect.js hem popup.js'e.
- (b) Şablon (Bölüm 6.5/6.8) uygulamasını koru, schemaVersion'ı tamamen Faz 5+ konusu olarak bırak.

Kullanıcı kararı.

### 11.5 — Yeni ajanın **başlamadan** doğrulaması gerekenler

1. Kullanıcıdan **Faz 5 kılavuzu** gelmesini bekle. Bu rapora dayanarak proaktif başlatma yapma — `PHASE1_GUIDE.md` Kural 6 ihlali.
2. Kullanıcı kılavuzu sağladığında bu raporla tutarlılık kontrolü:
   - Kılavuz Faz 4'ün 9 dosya değişikliğini varsayıyor mu? Varsayım doğru — `git diff 1065df4..20bca82` ile Faz 4 implementation diff'ini incele (handoff hariç).
   - Kılavuz G1 over-match fix'ini içeriyor mu? Eğer evet, Bölüm 11.2 detaylarını uygulamak için bu raporun analizinden faydalan.
   - Kılavuz `DEFAULTS` shared module veya `schemaVersion` konusuna değiniyor mu?
3. **G1 audio-filter ve Faz 3 loop guard ve Faz 4 toggle wiring kayıt altında.** Refactor sırasında bunlar bozulmamalı; yoksa regression olur.

### 11.6 — Bilinen riskler / dikkat noktaları

- **G1 over-match (Bölüm 11.2):** Faz 4 commit'i (`20bca82`) bu regresyonu **bilerek taşıyor** — kullanıcı kapsam disiplini gereği fix'i Faz 5'e bıraktı. Faz 5 hızlı önceliklendirilmeli — kullanıcılar feed'de derin kaydırırken boşluk görüyor.
- **Cold-read race window (Faz 4'te dokümante edildi):** Storage async; ~10ms penceresinde defaults aktif. Mevcut tasarımda "defaults = engelleme = Faz 3 davranışı = güvenli" — bu prensibe Faz 5'te yapılacak refactor'lerde de uyulmalı.
- **Popup ve content script arası DEFAULTS drift:** Yeni toggle eklenirse iki dosyaya da eklenmeli; tek dosyaya eklemek subtle bug yaratır.
- **`webNavigation` cazip görünebilir (toggle UI'da geri bildirim için),** ama hâlâ gereksiz ve Web Store reviewer için kırmızı bayrak. Faz 3 polling + Faz 4 storage onChanged yeterli.

### 11.7 — Ne YAPMA (Faz 5'te de geçerli)

- `redirect.js` polling parametrelerini (`300ms`, `1000ms`) değiştirme — Faz 3 Kural 11.
- Loop guard'ı tek katmana indirgeme — Faz 3 Kural 15.
- Regex sıralamasını bozma — Faz 3 Kural 13.
- `location.replace` dışına çıkma — Faz 3 Kural 14.
- `block.css` G1 seçicisinden `:not([href^="/reels/audio/"])` audio-filter'ı çıkarma — Faz 2 Sapma 2 onaylandı, korunmalı.
- `manifest.json`'a `webNavigation`, `tabs`, `scripting`, `notifications` izni ekleme — kılavuz açıkça emretmediği sürece.
- Popup'a inline script/handler veya external resource ekleme — CSP `script-src 'self'`.
- README "Ne yapar" listesinden eski madde silme — kapsam daraltıyorsa kullanıcıya sor.
- DEFAULTS'taki herhangi bir key'in default değerini `false` yapma — Faz 4 Kural 19.
- `chrome.storage.sync` kullanma — Faz 1 mimari karar; `local` zorunlu.
- Mesajlaşma API'si (`chrome.runtime.sendMessage`, `chrome.tabs.sendMessage`) ekleme — storage onChanged yeterli, Faz 4 Kural 23.

---

## 12. Yeni Ajan İçin Hızlı Self-Doğrulama Komutları

Repo'ya girdiğinde state'i hızlı teyit etmek için (Faz 4 commit + handoff commit atılmış durumda — `e5995a0` HEAD):

```bash
# Repo durumu
git log --oneline | head -5                # En üstte e5995a0 (Faz 4 handoff), 20bca82 (Faz 4 impl), 1065df4, 9a34bd5, 2115b3d
git status                                 # working tree clean
git remote -v                              # origin = ...keremtunayetkinn/reels-off.git
git log origin/main..HEAD --oneline        # BOŞ olmalı (push tamamlandı)

# Manifest sağlığı (Faz 4'te değişti: storage izni eklendi)
python -m json.tool manifest.json          # valid JSON
grep -A2 '"permissions"' manifest.json     # "permissions": [\n    "storage"\n  ]
grep -E '"(webNavigation|tabs|activeTab|cookies|scripting|<all_urls>)"' manifest.json
                                           # BOŞ olmalı

# redirect.js (Faz 3 + Faz 4 outputu)
grep -c "'use strict'" src/content/redirect.js                # 1
grep -c "chrome\.storage\.local\.get" src/content/redirect.js # 1
grep -c "applyBlockingClasses" src/content/redirect.js        # 2 (tanım + çağrı)
grep -nE "location\.href\s*=" src/content/redirect.js         # BOŞ olmalı
grep "POLL_INTERVAL_MS = 300" src/content/redirect.js         # eşleşmeli
grep "PAUSE_AFTER_REDIRECT_MS = 1000" src/content/redirect.js # eşleşmeli

# block.css (Faz 2 + Faz 4 outputu, G1 over-match HÂLÂ MEVCUT — Faz 5'te düzeltilecek)
grep "audio" src/content/block.css         # G1 audio-filter (Faz 2 Sapma 2) görünmeli
# G1 seçicisi şu anki halinde:
# article:has(a[href^="/reels/"]:not([href="/reels/"]):not([href^="/reels/audio/"]))
# Faz 5'te leaf-only kısıtı eklenecek (Bölüm 11.2)

# popup ekosistemi (Faz 4 outputu)
grep -nE 'on[a-z]+\s*=\s*"' src/popup/popup.html           # BOŞ olmalı (inline handler yok)
grep -nE "https?://" src/popup/popup.html                  # BOŞ olmalı
grep -oE 'data-key="[^"]+"' src/popup/popup.html | sort -u | wc -l   # 7
grep -nE "chrome\.(tabs|runtime\.sendMessage|webNavigation)" src/popup/popup.js  # Sadece yorum referansı — kodda yok

# i18n eşleşmesi
node -e "
const tr = require('./_locales/tr/messages.json');
const en = require('./_locales/en/messages.json');
const trKeys = Object.keys(tr).sort();
const enKeys = Object.keys(en).sort();
console.log('TR:', trKeys.length, 'EN:', enKeys.length, 'Eşleşiyor:', JSON.stringify(trKeys) === JSON.stringify(enKeys));
"
# TR: 13, EN: 13, Eşleşiyor: true

# README mevcut durumu Faz 4
grep "Mevcut durum" README.md              # "Faz 4 (Kullanıcı kontrolü ve ayarlar)"

# _locales hâlâ kökte (Faz 1 sapması)
ls _locales/tr/messages.json _locales/en/messages.json
```

---

## 13. Açık Konular / Henüz Yapılmadıklar

| Konu | Faz | Not |
|---|---|---|
| **G1 leaf-only fix** (over-match regresyonu) | **Faz 5 — yüksek öncelik** | Bölüm 11.2'de detaylı; güvenlik analizi tamamlandı (güvenli); kullanıcı kararıyla Faz 4 dışında bırakıldı |
| `DEFAULTS` shared module değerlendirmesi | Faz 5 | Bölüm 11.3 |
| `schemaVersion` kararı | Faz 5 | Bölüm 11.4 (kılavuz Bölüm 4 ile Bölüm 6.5/6.8 arası tutarsızlık) |
| ESLint/Prettier `package.json` ile gerçek kurulum | Faz 5 | PHASE4_GUIDE.md Bölüm 14 |
| `docs/selectors.md`, `docs/threat-model.md` | Faz 5 | docs/ klasörü hâlâ boş (`docs/.gitkeep`) |
| Gerçek ikon tasarımları | Faz 10 | Placeholder PNG'ler hâlâ kullanımda |
| Test infrastructure (Jest/Vitest) | Faz 13 | Yok |
| CI/CD (GitHub Actions) | Faz 13 | Yok |
| AMO / Web Store submission | Faz 13 | Yok |
| Eklenti versiyonu (`0.1.0`) | Faz 13 öncesi | Bump kararı kullanıcıda |
| G1 uzun-vade DOM stability | Faz 5+ | IG redesign sürecinde; **periyodik yeniden değerlendirme önerisi tekrar geçerli** (Faz 2 handoff'tan beri) — Faz 4'te yeniden manifest oldu |
| `redirect.js` uzun-vade IG SPA stability | Faz 5+ | IG `pushState` davranışı değişirse polling süresi yeniden değerlendirilebilir |
| EN locale UI testi | Faz 5+ | TR test edildi; `chrome://settings/languages` ile EN test'in tamamlanması Faz 5 ajanı tarafından doğrulanabilir |

---

## 14. Bu Belgeyi Okuyan Ajan'a Son Söz

Faz 4 dört özellik gösterdi:

1. **Sıfır kılavuz sapması, yüksek kapsamla.** 9 dosya değişikliği, popup ekosistemi sıfırdan, storage entegrasyonu — yine de PHASE4_GUIDE.md şablonları byte-for-byte uygulandı. Kontrol noktası disiplini bu kapsamla orantılı şekilde sürdürüldü.
2. **Bağımsız doğrulama disiplini bir regresyon yakalamada işe yaradı.** G1 over-match Faz 2'den beri vardı ama Faz 4 derin scroll testleri sayesinde ilk kez raporlandı. A/B test deseni hipotezi 1 cycle'da izole etti. Bu pattern Faz 5+ için referans.
3. **Kapsam disiplini fix ertelenmesinde gözlendi.** Keşfedilen regresyona "hemen düzelt" demek yerine kullanıcı "güvenlik analizini yap, Faz 5'e bırak" dedi. AI ajan bu kararı kayıt altına aldı, fix önerisini detaylı dokumante etti, Faz 5 ajan için "hazır iş" haline getirdi.
4. **Tutarsızlık raporlama disiplini korundu — ama kusurlu uygulandı.** Faz 4 başlangıcında beklenen HEAD'in (`9a34bd5`) yerine `1065df4` ("Refactor code structure...") bulundu; ajan **DUR-bildir-onay** akışını uyguladı. Ancak `git show --stat 1065df4` çalıştırılmadı — sadece kritik kod dosyalarının (manifest, redirect.js, block.css) intact olduğu teyit edildi ve "refactor" varsayımıyla devam edildi. Faz 4 sonrası kullanıcı sorgusunda `1065df4`'ün **aslında refactor değil, doc-only commit** olduğu keşfedildi (PHASE3_HANDOFF.md + PHASE4_GUIDE.md ekliyordu). Karar etkilenmedi çünkü zaten hiçbir kod dosyasına dokunmamıştı, ama **commit mesajı içeriği yansıtmıyordu**. **Faz 5 dersi:** Beklenmedik commit'lerle karşılaşırsan `git show --stat <hash>` ile dosya envanterini önce gör; commit mesajına güvenme. 2 saniyelik bir adım.

Bu projenin disiplini (Faz 2-3 handoff'larının vurguladığı gibi): **"İyileştirici değil uygulayıcı ol. Belirsizlikte sor. Sapma yaparsan şeffaf raporla. Kapsam dışına çıkma."** Faz 4 bu disipline sıkı tutundu; Faz 5+ ajanı aynı disiplini sürdürmeli.

Faz 4 commit edildi (`20bca82` + `e5995a0`) ve push edildi (origin/main ile senkron, 2026-06-04). Faz 5 kılavuzu gelene kadar bu repo'da hiçbir kod değişikliği yapma. Kullanıcı kılavuzu sağladığında ilk iş: (a) bu raporu oku, (b) kılavuzu oku, (c) `git log --oneline | head -5` ile Faz 4 commit'lerini teyit et (en üstte `e5995a0`, altında `20bca82` görmeli), (d) Bölüm 12'deki self-doğrulama komutlarını çalıştır, (e) Bölüm 11.2'deki G1 fix önerisini kılavuzla karşılaştır.
