# Faz 6 Uygulama Kılavuzu — Claude Code İçin Görev Belgesi

> **Bu belgenin amacı:** Faz 5 tamamlanmış halde devralınan projeyi, Faz 6 (Yayın Hazırlığı) kapsamında — gerçek ikon, versiyon, temiz paket ve başvuru-öncesi doğrulama — halüsinasyon riskini minimize ederek, her kritik adımda kontrol noktası bulundurarak ve kapsam sınırlarına sıkı bağlı kalarak ilerletmek. Bu bir **uygulama kılavuzudur**; Claude Code bunu okuyup uygular, "iyileştirmez", kapsam dışına çıkmaz.
>
> **Bu kılavuz `PHASE5_HANDOFF.md` ile birlikte okunmalıdır.** Handoff projenin *geçmişini* anlatır; bu kılavuz Faz 6'da *ne yapılacağını* tanımlar. Çelişki halinde bu kılavuz Faz 6 görevleri için üstündür.
>
> **G1 durumu:** G1 over-match (derin scroll → siyah boşluk + jitter) **bilinçli olarak ertelendi** (kullanıcı kararı). Sebep: semptom zararsız — kullanıcı `blockFeedReelPosts` toggle'ını kapatarak giderebilir; kalıcı veri kaybı/güvenlik riski yok. Faz 6 G1 mekanizmasına **dokunmaz**. G1 yalnızca *dokümantasyon* düzeyinde ele alınır (G6.0).

---

## 0. Kaynak Otorite Hiyerarşisi (ÖNCE BUNU OKU)

Aşağıdaki sıralama bağlayıcıdır. Üstteki, alttakini ezer:

1. **Canlı dosya içeriği** (diskteki gerçek dosyaların o anki hali) — **TEK DOĞRULUK KAYNAĞI**.
2. **Bu kılavuz** (`PHASE6_GUIDE.md`).
3. **MV3 / WebExtensions resmi dokümantasyonu** + **mağaza politikaları** (Chrome Web Store + Mozilla AMO).
4. **Önceki handoff'lar** (`PHASE5_HANDOFF.md`, …) — *referans/bağlam*, otorite değil.
5. **Kullanıcının canlı talimatı** her zaman geçerli; belirsizlikte kullanıcıya sorulur.

### 0.1 — Git commit ağacı OTORİTE DEĞİLDİR (taşınan kritik kural)

Bu projenin commit geçmişinde **kanıtlanmış tutarsızlıklar** vardır (örn. `1065df4` "Refactor…" mesajı gerçekte doc-only commit'ti; faz-numarası kaymaları; handoff'lar arası faz-kapsam çelişkileri — ikonun hangi faza ait olduğu gibi).

**Bu nedenle Claude Code:**

- **Commit mesajlarına, commit zincirine, hash'lere veya git geçmişine dayanarak proje durumu (state) ÇIKARSAMAZ.** Bunlar yanıltıcı olabilir.
- Proje durumunu **yalnızca diskteki canlı dosyaları okuyarak** belirler (`Read` / `cat` / `grep`).
- Bir commit mesajı ile dosya içeriği çeliştiğinde **dosya içeriğine güvenir**, commit mesajını yok sayar.
- Git arkeolojisi (commit'ler arası diff alıp "şu fazda şu oldu" anlatısı kurma) ile karar vermez. `git log`/`git show`/`git diff` çıktıları yalnız **bilgilendirme** amaçlıdır; "dosya şöyledir" sonucu için dosya doğrudan açılır.

> **Tek cümlede:** "Ne yazıyor commit?" değil, "Ne yazıyor dosyanın kendisi?" Çelişki görürsen commit'i değil dosyayı esas al; gerekirse kullanıcıya bildir.

---

## 1. Proje Kimliği (Faz 6 başı)

| Alan | Değer |
|---|---|
| Proje adı | **Reels Off** (TR ve EN aynı) |
| Tür | Chrome + Firefox MV3 tarayıcı eklentisi |
| Tek amaç | "Instagram web arayüzünde Reels ve algoritmik içerik önerilerini gizleyerek dikkat dağılmasını azaltır. Tercihler yalnızca cihazda saklanır." |
| Sahibi | Kerem Tuna |
| Hedef mağazalar | Chrome Web Store + Mozilla Add-ons (AMO) |
| Diller | Türkçe (varsayılan), İngilizce (fallback) |
| Mevcut faz | **Faz 5 tamamlandı**; bu belge **Faz 6'yı (Yayın Hazırlığı)** tanımlar |
| Nihai hedef | Public lansman. Faz 6 = submit-edilebilir **temiz paket + görsel kimlik + doğrulama**. Asıl mağaza başvurusu ve public yayın **sonraki faz** (kullanıcı yürütür). |

### Değişmez teknik kararlar (Faz 1-5 mirası — Faz 6'da KORUNUR)

Vanilla JS · bundler/minify yok · CSS-first href-tabanlı seçici · `chrome.storage.local` (sync DEĞİL) · sıkı CSP · tek `host_permissions` (`instagram.com/*`) · `permissions: ["storage"]` (başka izin yok) · build adımı yok · sıfır telemetri/analitik.

### Korunan Envanter (hiçbir görevde bozulmaz)

G1 audio-filter · iki katmanlı loop guard · regex sıralaması (F1a/b → E1 → F1c) · polling parametreleri (300/1000ms) · `location.replace()` (asla `location.href =`) · default-true policy (7 toggle) · `chrome.storage.local` · sıkı CSP / minimal izin · **Bulgu #5 force reflow workaround** (`void root.offsetHeight` — Faz 5'te eklendi, dokunulmaz).

---

## 2. Faz 6 Kapsamı

Faz 6 = **Yayın Hazırlığı**. Eklenti davranışına yeni özellik EKLENMEZ; mevcut kod yalnız versiyon ve (gerekirse) ikon referansları düzeyinde değişir. Amaç: mağazalara sunulabilir, doğrulanmış bir paket üretmek.

### 2.1 — Kapsam İÇİ (bu fazda yapılacak)

| # | Görev | Tip | Çıktı |
|---|---|---|---|
| G6.0 | G1 ertelemesini resmileştir (dokümantasyon) + public default-state teyidi | Karar + Doküman | README "Bilinen sınırlamalar" + onay |
| G6.1 | Gerçek ikon tasarımı (placeholder "X" yerine) | Karar + Üretim | `src/icons/icon-{16,32,48,128}.png` |
| G6.2 | Versiyon bump (`0.1.0` → karar) | Kod | `manifest.json` + `package.json` |
| G6.3 | Temiz paketleme (Chrome zip + Firefox zip/xpi) — allowlist | Araç | `dist/` altında paketler |
| G6.4 | Başvuru-öncesi doğrulama (web-ext lint + manifest + politika self-check) | Doğrulama | Lint raporu + checklist |
| G6.5 | Mağaza listing varlıkları hazırlığı (metinler + ekran görüntüsü/promo *spesifikasyonu*) | Doküman | Hazır metin + kullanıcıya görsel görev listesi |

**Karar görevleri (G6.0, G6.1, G6.2):** Claude Code tek başına uygulamaz. Önce seçenek sunar, kullanıcı onaylar, sonra uygular (Kural 27, taşındı).

### 2.2 — Kapsam DIŞI (bu fazda KESİNLİKLE yapılmayacak)

- **G1 mekanizma fix** — ertelendi; yalnız dokümante edilir, koda dokunulmaz.
- Eklenti davranışında yeni özellik / yeni toggle / yeni engelleme kuralı.
- Yeni izin (`webNavigation`/`tabs`/`scripting`/`notifications`/`<all_urls>`) veya mesajlaşma API'si.
- CI/CD (GitHub Actions), test altyapısı (Vitest/Jest) — sonraki faz.
- **Kullanıcıya ait, geri-alınması zor adımlar (Kural 34 — Claude Code YAPMAZ):**
  - Chrome Web Store / AMO geliştirici hesabı açma, ödeme yapma, ToS kabul etme.
  - Mağazaya paket yükleme / submit etme.
  - Ekran görüntüsü / promo görseli **çekme** (canlı tarayıcı gerektirir — kullanıcı yapar; Claude Code yalnız spesifikasyon ve metin hazırlar).
  - GitHub repo'sunu **public yapma**.
  - `git push` (yalnız açık onayla, Kural 30).

---

## 3. Çalışma Felsefesi ve Faz 6 Kuralları

Faz 1-5'teki tüm kurallar (Kural 1-31) geçerlidir. Özeti: **İyileştirici değil uygulayıcı ol. Belirsizlikte sor. Sapma yaparsan şeffaf raporla. Kapsam dışına çıkma.**

### Faz 6'ya özel ek kurallar (Kural 32-37)

- **Kural 32 (Allowlist paketleme):** Pakete **yalnız açıkça listelenmiş runtime dosyaları** girer (Bölüm 7.1). Asla "şunlar hariç hepsini al" (denylist) yapılmaz. "Kopya" yedek dosyaları, dev config'leri, `*_GUIDE.md`/`*_HANDOFF.md`, `node_modules/`, `.git/` **kesinlikle pakete girmez**.
- **Kural 33 (İkon yolları değişmez):** İkon dosya adları/yolları (`src/icons/icon-16.png`, `-32`, `-48`, `-128`) **birebir korunur**; `manifest.json` ikon yolları değişmez. Yeni dosya adı = manifest değişikliği = gereksiz risk.
- **Kural 34 (Kullanıcıya ait aksiyonlar):** Hesap açma, mağaza submit, yayınlama, repo public yapma, ToS/izin kabulü — bunları Claude Code **yapmaz**; net şekilde kullanıcıya devreder ("şu adımı sen yapmalısın, çünkü…").
- **Kural 35 (Mağaza gerçeklerini doğrula):** Ücretler, başvuru gereksinimleri, inceleme süreleri, politika maddeleri **bellekten yazılmaz**; başvuru anında resmi dokümandan doğrulanması gerektiği belirtilir. "Şu kadar ücret" gibi sabit sayı verme.
- **Kural 36 (Versiyon senkron + semantik):** Versiyon hem `manifest.json` hem `package.json`'da **aynı** olmalı. SemVer'e uygun. Bump kullanıcı onaylı (Kural 27).
- **Kural 37 (Telif/marka güvenliği — ikon):** İkon, Instagram/Meta logosunu, glyph'ini, marka renk-kombinasyonunu veya başka bir telifli/markalı öğeyi **kullanamaz** (mağaza politikası + marka ihlali riski). Özgün, sade tasarım.

---

## 4. Devralınan State Doğrulama (Görev 6.0-pre — her şeyden önce)

> **Amaç:** Faz 6'ya başlamadan önce diskteki gerçek durumu **dosyaları okuyarak** teyit etmek (commit geçmişiyle değil — Kural 25).

```bash
# Versiyon başlangıcı
grep '"version"' manifest.json                                # "0.1.0" (beklenen)
grep '"version"' package.json                                 # "0.1.0" (Faz 5'te eklendi)

# İkonlar hâlâ placeholder (4 PNG mevcut, manifest yolları sabit)
ls src/icons/icon-16.png src/icons/icon-32.png src/icons/icon-48.png src/icons/icon-128.png
grep -A5 '"icons"' manifest.json                              # 4 yol: src/icons/icon-XX.png

# İzinler değişmedi
grep -A2 '"permissions"' manifest.json                        # "storage"
grep -E '"(webNavigation|tabs|activeTab|cookies|scripting|<all_urls>)"' manifest.json   # BOŞ

# Korunan envanter tabanda (G1 ertelendi → leaf-fix YOK olmalı)
grep -c ":not(:has(article))" src/content/block.css           # 0 (G1 fix uygulanmadı)
grep "audio" src/content/block.css                            # audio-filter mevcut
grep "POLL_INTERVAL_MS = 300" src/content/redirect.js         # eşleşmeli
grep "PAUSE_AFTER_REDIRECT_MS = 1000" src/content/redirect.js # eşleşmeli
grep "void root.offsetHeight" src/content/redirect.js         # Bulgu #5 workaround mevcut (Faz 5)

# i18n eşleşmesi (mağaza metni buradan)
node -e "const t=require('./_locales/tr/messages.json'),e=require('./_locales/en/messages.json');console.log('TR',Object.keys(t).length,'EN',Object.keys(e).length,JSON.stringify(Object.keys(t).sort())===JSON.stringify(Object.keys(e).sort()));"

# Yedek "Kopya" dosyaları tespit (pakete GİRMEYECEK — Kural 32)
ls | grep -i "kopya" ; ls -a | grep -i "kopya"                # varsa not al, allowlist'e ASLA ekleme
```

→ **[KONTROL NOKTASI 0]** State doğrulama raporunu sun (beklenen vs. gerçek tablo). Sapma varsa DUR, bildir, onay bekle.

---

## 5. Görev 6.0 — G1 Ertelemesini Resmileştir (KN1)

G1 fix ertelendi. Faz 6'da yapılacak: ertelemeyi **kullanıcı-yüzü dokümana** taşımak, çünkü public kullanıcılar `docs/threat-model.md`'yi okumaz.

**Adım 6.0.a — Dokümantasyon.** `README.md`'ye kısa bir "Bilinen sınırlamalar" / "Known limitations" bölümü (TR + gerekiyorsa EN paralel) ekle: ana feed'de derin kaydırmada nadiren boş alan görülebilir; geçici çözüm "Ana akıştaki Reels gönderilerini gizle" toggle'ını kapatmak. Mevcut `docs/selectors.md` / `docs/threat-model.md`'deki G1 deferral notlarıyla tutarlı kalsın (yeni iddia uydurma — Kural 7).

**Adım 6.0.b — Public default-state teyidi (KARAR).** Mevcut politika: `blockFeedReelPosts` default `true` (Kural 19). Public bağlamda iki seçenek var; kullanıcı seçer:

→ **[KONTROL NOKTASI 1]**
- **(A) Default `true` kalsın** (mevcut politika korunur, Kural 19 sağlam). Semptom README'de bilinen sınırlama olarak açıklanır. *Önerilen — kapsam ve invariant disiplini.*
- **(B) Yalnız `blockFeedReelPosts` default `false`** yapılsın (kullanıcı bilinçli açana kadar feed reel'leri gizlenmez). **Uyarı:** Bu, Faz 4 Kural 19 default-true invariant'ını **bilinçli olarak bozar**; iki dosyada (`redirect.js` + `popup.js` DEFAULTS) değişiklik + dokümantasyon gerekir. Sessiz yapılmaz; yapılacaksa açık kullanıcı override'ı olarak kaydedilir.

Kullanıcı (A)'yı seçerse koda dokunulmaz, yalnız README güncellenir. (B)'yi seçerse iki DEFAULTS senkron değişir (Kural 18) ve değişiklik handoff'ta gerekçesiyle yazılır.

---

## 6. Görev 6.1 — Gerçek İkon Tasarımı (KN2)

Placeholder "X" PNG'ler public lansman için yetersiz. Hedef: özgün, sade, koyu-tema uyumlu bir marka ikonu; **aynı dosya adları/yolları** (Kural 33).

> **Faz notu:** Handoff belgeleri ikonu bir yerde Faz 5, bir yerde Faz 10 diye işaretliyordu (çelişki). Public lansman ikonları zorunlu kıldığı için Faz 6'ya alındı. Kullanıcı farklı bir faz isterse bu görev atlanır.

**Adım 6.1.a — Tasarım kararı (KARAR).** Kullanıcıya net seçenek/brief sun:

→ **[KONTROL NOKTASI 2]**
- **(A)** Kullanıcı hazır bir tasarım/SVG sağlar → Claude Code yalnız 4 boyuta render eder.
- **(B)** Claude Code, sade bir brief'ten (koyu zemin + özgün sembol; örn. durdurma/engelleme metaforu, IG markası KULLANILMADAN — Kural 37) 1-2 aday SVG üretir, kullanıcı onaylar, sonra render edilir.

**Adım 6.1.b — Üretim (onaylı tasarımla).** SVG master'dan 16/32/48/128 px PNG render et (ör. `rsvg-convert`, `cairosvg`, Inkscape CLI veya Node `sharp`). Kurallar:
- Dosya adları **birebir** `icon-16.png`, `icon-32.png`, `icon-48.png`, `icon-128.png`; konum `src/icons/`.
- 16/32 px'te okunabilirlik için sembol sadeleştir (detay kaybı kontrol et).
- Şeffaf veya koyu zemin — popup/manifest temasıyla tutarlı.
- Telif/marka temiz (Kural 37).

**Adım 6.1.c — Doğrulama.**
```bash
file src/icons/icon-*.png            # her biri geçerli PNG, doğru boyut
# Boyut kontrolü (ör. Python/Pillow ile): 16x16, 32x32, 48x48, 128x128
grep -A5 '"icons"' manifest.json     # yollar DEĞİŞMEDİ (Kural 33)
```

→ **[KONTROL NOKTASI 2-onay]** Render edilmiş ikonları (görsel önizleme + boyut tablosu) kullanıcıya sun. Tarayıcıda yüklenince doğru göründüğünü kullanıcı teyit etsin (manifest icon + action icon).

---

## 7. Görev 6.2 — Versiyon Bump (KN3)

**Adım 6.2.a — Karar.** İlk public sürüm numarası kullanıcı kararı.

→ **[KONTROL NOKTASI 3]** Seçenekler: **(A)** `1.0.0` (ilk kararlı public sürüm — önerilen), **(B)** `0.1.0` koru (beta/erken erişim sinyali), **(C)** başka SemVer değer.

**Adım 6.2.b — Uygulama (senkron — Kural 36).** Onaylı değeri **hem** `manifest.json` **hem** `package.json` `"version"` alanına yaz. Gecko `strict_min_version` ve diğer manifest alanları **değişmez**.

```bash
grep '"version"' manifest.json package.json   # ikisi de aynı yeni değer
```

---

## 8. Görev 6.3 — Temiz Paketleme (Allowlist — KN4)

> **Kural 32 mutlak:** Allowlist. Yalnız aşağıdaki runtime dosyaları pakete girer. Başka hiçbir şey.

### 7.1 — Runtime allowlist (pakete girecek TEK liste)

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
README.md            (opsiyonel — dahil edilebilir; reviewer şeffaflığı)
```

### 7.2 — Pakete ASLA girmeyecekler (teyit listesi)

`node_modules/` · `.git/` · `package.json` · `package-lock.json` · `.eslintrc.json` · `.prettierrc.json` · `.prettierignore` · `.gitignore` · tüm `*_GUIDE.md` · tüm `*_HANDOFF.md` · `docs/` (dev dokümanı — varsayılan hariç; kullanıcı isterse dahil edilebilir) · **tüm "Kopya" yedek dosyaları** (özellikle `manifest - Kopya.json` — eski/storage-izinsiz, pakete girerse hatalı sürüm riski) · `dist/` (paketin kendisi) · varsa kalan `.gitkeep`.

### 7.3 — Üretim

- **Firefox (AMO):** `web-ext` (devDependency olarak eklenebilir) ile `web-ext build --source-dir=<staging>` — allowlist'e göre hazırlanmış staging dizininden. `web-ext` kendi ignore mantığını da uygular; yine de **staging dizinine yalnız allowlist kopyalanır** (denylist'e güvenme).
- **Chrome (CWS):** Aynı staging dizininden düz `zip` (kök seviyede `manifest.json` olacak şekilde). Resmi Chrome CLI linter yoktur; bu yüzden staging + allowlist disiplini kritik.

**Önerilen güvenli yöntem:** Geçici `dist/staging/` dizini oluştur → allowlist'teki dosyaları oraya **tek tek kopyala** (klasör yapısını koru) → staging'i lint et → staging'den iki paket üret (`dist/reels-off-chrome-<ver>.zip`, `dist/reels-off-firefox-<ver>.zip` / `.xpi`). Bu, "yanlışlıkla Kopya dosyası sızması" riskini sıfırlar.

```bash
# Paket içeriği teyidi (Kural 32) — Kopya/dev dosyası ÇIKMAMALI
unzip -l dist/reels-off-chrome-*.zip | grep -iE "kopya|node_modules|\.git|GUIDE|HANDOFF|eslintrc|prettier|package\.json"
# BOŞ olmalı
unzip -l dist/reels-off-chrome-*.zip | grep "manifest.json"   # kökte olmalı
```

→ **[KONTROL NOKTASI 4]** Her iki paketin **içerik listesini** (`unzip -l`) kullanıcıya sun. Allowlist dışı tek dosya varsa DUR, staging'i temizle, yeniden üret.

---

## 9. Görev 6.4 — Başvuru-Öncesi Doğrulama (KN5)

**Adım 6.4.a — web-ext lint (Firefox + ortak MV3 kontrolleri).**
```bash
npx web-ext lint --source-dir=dist/staging
# Hata (error) sıfır olmalı; uyarılar (warning) değerlendirilir
```
Çıkan her error/warning kullanıcıya raporlanır; otomatik "düzeltme" yapılmaz (Kural 26 — önce anla).

**Adım 6.4.b — Manifest + politika self-check (manuel checklist).**
- `manifest.json` valid JSON; `version` yeni değer; ikon yolları intact.
- İzinler minimal: yalnız `storage` + `host_permissions: instagram.com/*`. Gerekçe net (single-purpose ile uyumlu).
- CSP sıkı; remote kod yok; `eval`/`new Function` yok; harici CDN yok.
- Privacy policy mevcut (`PRIVACY-*.md`) ve "sıfır veri toplama" beyanı tutarlı.
- Tek-amaç beyanı (`_locales` `extDescription`) ile davranış uyumlu.
- Obfuscation/minify yok (reviewer kaynak okuyabilir).

**Adım 6.4.c — Yükle-ve-doğrula (kullanıcı, canlı tarayıcı).**
→ **[KONTROL NOKTASI 5]** Kullanıcıdan iste:
- Chrome: paketlenmiş zip'i `chrome://extensions` (geliştirici modu, "paketlenmiş yükle" veya unpacked staging) ile yükle → `chrome://extensions`'da **hata yok**, popup açılıyor, yeni ikon görünüyor.
- Firefox: `about:debugging` → geçici yükle (veya `web-ext run`) → hata yok, popup + ikon doğru.
- Temel duman testi: sidebar Reels/Keşfet gizli, `/reels/` → `/`, popup toggle'ları çalışıyor, yeni ikon yerinde.

Sonucu raporla. Hata çıkarsa kapsam-içi (paket/ikon/manifest) düzelt; davranışsal hata çıkarsa (beklenmiyor) DUR ve kullanıcıya bildir — Faz 6 davranış değiştirmemeli.

---

## 10. Görev 6.5 — Mağaza Listing Varlıkları Hazırlığı (KN6)

Claude Code yalnız **metin + spesifikasyon** hazırlar; görselleri kullanıcı çeker (Kural 34).

**Adım 6.5.a — Metinler (Claude Code hazırlar).**
- Kısa açıklama: `_locales` `extDescription` (TR/EN) zaten hazır — tutarlılık teyidi.
- Uzun açıklama taslağı (TR + EN): ne yapar / ne yapmaz / gizlilik vurgusu — README'den türetilir, **yeni iddia uydurmadan**.
- Tek-amaç beyanı (CWS "single purpose" alanı için) + izin gerekçeleri (storage neden, host izni neden).
- Gizlilik politikası: mağazalar genelde **URL** ister. `PRIVACY-*.md`'nin yayınlanmış bir URL'ye (örn. GitHub repo dosyası / Pages) ihtiyacı olduğunu kullanıcıya hatırlat (repo public olunca erişilebilir; repo public yapma = kullanıcı aksiyonu).

**Adım 6.5.b — Görsel spesifikasyonu (kullanıcıya görev listesi).**
→ **[KONTROL NOKTASI 6]** Kullanıcıya çekmesi gereken görselleri *spesifikasyonla* ver (kesin boyut/sayı **başvuru anında resmi dokümandan doğrulanmalı** — Kural 35; bellekten sabit ölçü verme). Tipik ihtiyaçlar: birkaç ekran görüntüsü (popup + öncesi/sonrası feed), mağaza promo/tile görseli. Her biri için "neyi göstermeli" notu hazırla; çekimi kullanıcı yapar.

---

## 11. Kontrol Noktası Akışı (Özet)

```
Görev 6.0-pre → [KN0: State doğrulama] → onay
   ↓
G6.0 → [KN1: G1 deferral dokümantasyonu + public default-state kararı] → seçim
   ↓
G6.1 → [KN2: ikon tasarım kararı] → [KN2-onay: render önizleme] → onay
   ↓
G6.2 → [KN3: versiyon kararı] → uygulama
   ↓
G6.3 → [KN4: paket içerik listesi (allowlist teyidi)] → onay
   ↓
G6.4 → [KN5: lint + yükle-doğrula] → onay
   ↓
G6.5 → [KN6: listing metinleri + görsel spesifikasyonu] → onay
   ↓
[KN7: commit planı] → onay → atomic commit'ler → [KN8: push öncesi onay] → push
```

**Her kontrol noktasında rapor formatı:** (1) yapılan iş özeti (tablo), (2) doğrulama sonuçları (false-positive varsa açıklama — Kural 31), (3) sıradaki adım için açık onay isteği (komut + etki yazılı).

---

## 12. Commit ve Push Disiplini (Kural 29-30, taşındı)

- **Atomic commit'ler.** Önerilen ayrım: (1) G6.0 README sınırlama notu [+ varsa default-state değişikliği ayrı], (2) ikonlar, (3) versiyon bump, (4) packaging script/dist artefaktları (dist'i commit'lemek istenmiyorsa `.gitignore`'a ekle — kullanıcıya sor). Kod ile doküman karıştırılmaz.
- **Commit mesajı dürüst** (içeriği yansıtır; "Refactor" yalanı tekrarlanmaz — Kural 25/29).
- **`dist/` paketleri commit'lensin mi?** Kullanıcıya sor; genelde release artefaktları `.gitignore`'da tutulur, mağazaya manuel yüklenir.
- **Push yalnız açık onayla** (Kural 30). Otomatik push yok.

---

## 13. Faz 6 Tamamlandı Şartları

| Şart | Durum |
|---|---|
| G1 ertelemesi README "bilinen sınırlamalar"da dokümante edildi | ☐ |
| Public default-state kararı verildi (A: değişmedi / B: bilinçli override + senkron DEFAULTS) | ☐ |
| Gerçek ikonlar üretildi; dosya adları/yolları değişmedi (Kural 33); telif/marka temiz (Kural 37) | ☐ |
| Versiyon bump senkron (manifest + package.json), SemVer (Kural 36) | ☐ |
| Korunan envanter bozulmadı; izinler değişmedi; davranış değişmedi | ☐ |
| Chrome + Firefox paketleri allowlist ile üretildi; içerikte Kopya/dev/.md sızıntısı YOK (Kural 32) | ☐ |
| `web-ext lint` error = 0; uyarılar raporlandı | ☐ |
| Politika self-check (izin gerekçesi, privacy, single-purpose, no remote code) tamam | ☐ |
| Kullanıcı paketleri tarayıcıda yükledi: hata yok, popup + yeni ikon doğru, duman testi geçti | ☐ |
| Listing metinleri (kısa/uzun açıklama, single-purpose, izin gerekçeleri) hazır | ☐ |
| Görsel spesifikasyonu kullanıcıya iletildi (görsel çekimi = kullanıcı görevi) | ☐ |
| Atomic commit'ler atıldı, mesajlar dürüst | ☐ |
| Push için açık onay alındı | ☐ |

---

## 14. Ne YAPMA (Faz 6 sınırları)

- Commit geçmişine/mesajlarına dayanarak state çıkarsama — **dosyayı oku** (Kural 25).
- G1 mekanizmasına dokunma (`block.css` G1 seçicisini değiştirme) — ertelendi.
- Korunan envanteri bozma (audio-filter, loop guard, regex sıralaması, polling, `location.replace`, default-true, `storage.local`, CSP/minimal izin, Bulgu #5 `void root.offsetHeight`).
- Yeni izin / mesajlaşma API'si / yeni özellik ekleme.
- İkon dosya adlarını/yollarını değiştirme; manifest ikon yollarını değiştirme (Kural 33).
- İkonda IG/Meta logosu, glyph'i veya telifli öğe kullanma (Kural 37).
- Pakete allowlist dışı dosya koyma; özellikle "Kopya" yedeklerini, dev config'lerini, `*_GUIDE.md`/`*_HANDOFF.md`'yi (Kural 32).
- Mağaza ücreti/gereksinimi/inceleme süresi gibi gerçekleri bellekten verme — "başvuru anında doğrula" de (Kural 35).
- **Kullanıcıya ait aksiyonları üstlenme:** hesap açma, mağaza submit, yayınlama, repo public yapma, ekran görüntüsü çekme, ToS kabulü (Kural 34).
- Karar görevlerini (G6.0 default-state, G6.1 tasarım, G6.2 versiyon) tek başına uygulama (Kural 27).
- Otomatik `eslint --fix` / `prettier --write` / lint "auto-fix"i onaysız çalıştırma.
- `git push`'u onaysız çalıştırma (Kural 30).

---

## 15. Sonraki Faz İçin Devir (Mağaza Başvurusu — kullanıcı yürütür)

Faz 6 sonunda elde edilen: doğrulanmış paketler + ikon + versiyon + listing metinleri. Bir sonraki faz **kullanıcı-yürütümlü** olup Claude Code yalnız *hazırlık/dokümantasyon* desteği verir:

- Chrome Web Store + AMO geliştirici hesabı (ücret/gereksinim **başvuru anında resmi dokümandan doğrulanır** — Kural 35).
- Listing doldurma (metinler hazır; görselleri kullanıcı yükler), gizlilik politikası URL'si (repo public + Pages gerekebilir).
- Paket yükleme + submit + reviewer geri bildirimi (kullanıcı aksiyonları).
- Repo public yapma (geri-alınması zor — kullanıcı onayı/aksiyonu).
- (Opsiyonel sonraki) public tanıtım, CI/CD lint+format gate, test altyapısı.

Faz 6 sonunda bir `PHASE6_HANDOFF.md` yazılması beklenir (proje disiplini).

---

## 16. Bu Belgeyi Okuyan Claude Code'a Son Söz

Faz 6'nın üç ayırt edici disiplini:

1. **Canlı dosya = doğruluk, commit ağacı = değil** (Kural 25). State'i dosyadan oku.
2. **Davranış değişmez, yalnız ambalaj.** Faz 6 paketleme/görsel/versiyon fazıdır; eklentinin çalışma mantığına dokunulmaz. G1 dahil ertelenen işler ertelendiği gibi kalır.
3. **Geri-alınması zor ve kullanıcıya ait adımları üstlenme** (Kural 34). Allowlist paketleme (Kural 32) ve "Kopya dosyası sızmasın" disiplini bu fazın en somut tuzağıdır — staging + tek-tek kopyalama ile sıfırla.

Projenin değişmez ilkesi (Faz 1-5'ten beri):

> **"İyileştirici değil uygulayıcı ol. Belirsizlikte sor. Sapma yaparsan şeffaf raporla. Kapsam dışına çıkma."**

Faz 6 bu ilkeye sıkı tutunmalı.
