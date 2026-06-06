# Faz 5 Tamamlama Raporu — Sonraki Ajan Devretme Belgesi

> **Bu belgenin amacı:** Faz 5 tamamlanmış halde, projeyi henüz görmemiş bir AI
> ajanına projeyi devretmek. Belge sayesinde yeni ajan; (a) Faz 5'te neyin nasıl
> yapıldığını, (b) **G1 leaf-only fix denemesinin neden başarısız olduğunu ve
> Faz 6'ya nasıl taşındığını**, (c) Faz 5'te kullanılan halüsinasyon önleme
> disiplinini ve karar verme protokolünü anlayabilmeli.
>
> **Kaynak otorite hiyerarşisi:** Canlı dosya içeriği > `PHASE5_GUIDE.md`
> (kullanıcının yazdığı kılavuz — `c:\Users\User\Downloads\PHASE5_GUIDE.md`) >
> MV3/WebExtensions resmi dokümantasyonu > bu rapor > önceki handoff'lar
> (`PHASE4_HANDOFF.md`, `PHASE3_HANDOFF.md`, …). Faz 5'in en önemli ek kuralı:
> **commit ağacı otorite değildir** (PHASE5_GUIDE.md Bölüm 0.1, Kural 25).
> Tutarsızlık görürsen `git show <hash>` değil `Read <file>` yap.
>
> **Belge tarihi:** 2026-06-06.

---

## 1. Proje Kimliği (Faz 5 sonu güncel hali)

| Alan            | Değer                                                                                                                                |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Proje adı       | **Reels Off** (TR ve EN aynı)                                                                                                        |
| Tür             | Chrome + Firefox MV3 tarayıcı eklentisi                                                                                              |
| Tek amaç        | Instagram web arayüzünde Reels ve algoritmik içerik önerilerini gizleyerek dikkat dağılmasını azaltır. Tercihler yalnızca cihazda.   |
| Sahibi          | Kerem Tuna                                                                                                |
| Telif yılı      | 2026                                                                                                                                 |
| Hedef mağazalar | Chrome Web Store + Mozilla Add-ons (AMO)                                                                                             |
| Diller          | Türkçe (varsayılan), İngilizce (fallback) — Faz 5'te EN locale UI testi geçti                                                        |
| Mevcut faz      | **Faz 5 tamamlandı + push edildi** (4 commit: `bd68169` → `2512853` → `0b29886` → `e2b561e`); sıradaki **Faz 6** (G1 mekanizma fix). |
| Repo            | `https://github.com/keremtunayetkinn/reels-off.git` (private, `origin/main`)                                                         |
| HEAD            | `e2b561e` — "Phase 5: add docs/selectors.md and docs/threat-model.md"                                                                |
| Toplam commit   | 19                                                                                                                                   |

### Değişmez teknik kararlar (Faz 1-4 mirası — Faz 5'te KORUNDU)

- Vanilla JavaScript · bundler/minify yok · CSS-first href-tabanlı seçici
- `chrome.storage.local` (sync DEĞİL) · sıkı CSP · tek `host_permissions`
  (`instagram.com/*`) · `permissions: ["storage"]` (başka izin yok)
- Build adımı yok · sıfır telemetri/analitik · MV3 baseline
- **Korunan envanter** (PHASE5_GUIDE.md Bölüm 3.1): G1 audio-filter, iki katmanlı
  loop guard, regex sıralaması (F1a/b → E1 → F1c), polling parametreleri
  (300/1000ms), `location.replace()` (asla `location.href =`), default-true
  policy, `chrome.storage.local`, sıkı CSP / minimal izin. **Hepsi byte-for-byte
  semantik korundu.**

### Faz 5'te eklenenler (yeni)

| Ekleme                  | Konum                                                                                                        | Sebep                                                                          |
| ----------------------- | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ |
| Cold-read race fix      | [src/content/redirect.js](src/content/redirect.js) — `tick()` ve `setInterval` storage callback içine        | G5.2 kararı (Seçenek A): bookmark/direct nav redirect toggle değerine saygı    |
| Force reflow workaround | [src/content/redirect.js](src/content/redirect.js) — `applyBlockingClasses` sonunda `void root.offsetHeight` | Bulgu #5: Chrome `:has()` invalidation quirk için workaround                   |
| `package.json`          | Kök                                                                                                          | G5.5 — `private: true`, yalnız devDependencies (ESLint 8.57.1, Prettier 3.3.3) |
| `.prettierignore`       | Kök                                                                                                          | G5.5 — `node_modules/` + "Kopya" yedek dosyaları hariç                         |
| `docs/selectors.md`     | `docs/`                                                                                                      | G5.6 — Tüm aktif seçicilerin envanteri + G1 deferral notu                      |
| `docs/threat-model.md`  | `docs/`                                                                                                      | G5.6 — Privacy/güvenlik duruşu + reddedilen API'ler                            |

### Faz 5'te değişmeyen şeyler (önemli)

- **Manifest izinleri:** `["storage"]` aynı. `webNavigation`, `tabs`, `scripting`,
  `cookies`, `<all_urls>`, `notifications` — hâlâ reddedilmiş.
- **Content script dosya yapısı:** `redirect.js` ve `block.css` aynı yerlerde.
- **Mesajlaşma API'si:** `chrome.runtime.sendMessage` / `chrome.tabs.sendMessage`
  yok. `chrome.storage.onChanged` content script'i popup değişimlerinden
  haberdar ediyor.
- **DEFAULTS pattern:** [redirect.js:46-54](src/content/redirect.js#L46) ve
  [popup.js:17-25](src/popup/popup.js#L17) duplicate kaldı (G5.3 Seçenek B
  kararı — yeni toggle ekleme prosedürü [docs/selectors.md](docs/selectors.md)
  Bölüm 3'te).
- **`schemaVersion`:** Eklenmedi (G5.4 Seçenek B kararı — YAGNI, ileride
  migration gerekirse `?? 0` paterniyle eklenir).
- **İkon tasarımı:** Hâlâ placeholder PNG'ler. Faz ataması belirsiz (handoff
  belgeleri arası çelişki vardı; PHASE5_GUIDE.md Bölüm 2.2 bu konuyu kapsam
  dışı tuttu).
- **Versiyon:** `0.1.0` (manifest + package.json). Bump Faz 6+ konusu.

---

## 2. Çalışma Felsefesi (Faz 1-4'ten Aynen Devam Eder + Faz 5 Ek Kuralları)

Faz 1-4'teki kural seti (Kural 1-24) Faz 5'te istisnasız uygulandı.
PHASE5_GUIDE.md Bölüm 3 yedi ek kural ekledi (Kural 25-31); aşağıda Faz 5
deneyiminden uygulanma kanıtları:

- **Kural 25 (Commit ağacına güvenme):** Faz 5 başında KN0 state doğrulaması
  yalnız `Read`/`Grep` ile yapıldı, `git log` çıktısı bilgi amaçlıydı. G1
  rollback sonrası `git diff` boş çıktısı + grep count kontrolü ile doğrulandı.
- **Kural 26 (Önce doğrula, sonra değiştir):** G1 leaf-only fix için
  **canlı DOM doğrulaması** (KN1) yapıldı. Browser agent ile DOM ölçüldü;
  hipotez (kapsayıcı article over-match) verisiyle desteklenmedi (5/5 article
  `innerArticleCount: 0`). Fix yine de uygulandı (defansif olarak), ama KN2
  görsel testte başarısız oldu → rollback. Bu, "önce doğrulamadığın hipoteze
  güvenme" dersinin pratik kanıtı.
- **Kural 27 (Karar görevleri tek başına uygulanmaz):** G5.2 (cold-read race),
  G5.3 (DEFAULTS module), G5.4 (schemaVersion), Bulgu #5 — hepsinde
  seçenekler kullanıcıya sunuldu, karar bekledikten sonra uygulandı.
- **Kural 28 (Korunan mekanikler dokunulmaz):** Her kod değişikliğinden sonra
  grep kontrolü yapıldı (`POLL_INTERVAL_MS = 300`, `PAUSE_AFTER_REDIRECT_MS = 1000`,
  `location.replace`, `'use strict'`, audio-filter referansları). Prettier
  auto-format CSS quote stilini değiştirdi ama **semantik byte-for-byte
  aynı** (CSS spec'te tek/çift tırnak özdeş).
- **Kural 29 (Atomic, dar commit'ler):** 4 commit, her biri tek mantıksal iş.
  Kod ile doküman aynı commit'te değil. Commit mesajları içeriği dürüstçe
  yansıtıyor (`1065df4` "Refactor" yalanı tekrarlanmadı).
- **Kural 30 (Açık onay):** `npm install`, Prettier `--write`, her commit,
  `git push` — hepsi ayrı açık onayla yapıldı.
- **Kural 31 (False-positive farkındalığı):** KN0'da `applyBlockingClasses`
  grep count 3 çıktı (kılavuz 2 bekliyordu) — panik yapılmadı, dosya okundu,
  3'ün doğru sayı olduğu (tanım + 2 çağrı: storage callback + onChanged
  listener) açıklandı.

### Kullanıcı bağlamı (Faz 5'te gözlenen)

- **Kullanıcı kararsız bırakmayı tercih etmiyor; her seçim noktasında net
  cevap veriyor.** Faz 5'te 7 karar noktası (KN0-KN9) ortaya çıktı; her
  birinde kullanıcı "A/B/C" formatından kesin seçim yaptı. Belirsiz noktalarda
  ek bilgi istedi (ör. tarayıcı ajan prompt'u).
- **Halüsinasyon riski uyarısı kullanıcı tarafından sıkça hatırlatıldı.**
  Browser agent raporundan sonra kullanıcı "bağımsız doğrulama yap" dedi
  (bu ajanın CSS tarama scriptinin şüpheli olduğu tespit edildi). Push
  öncesinde "G1'i yeniden açma kararı proje düzenine zarar verir mi" diye
  sorgulattı. Bu handoff'un da bağımsız doğrulamayla bitirilmesi kullanıcı
  isteği.
- **Kullanıcı kapsam disiplinine sıkı sıkı tutundu.** G5.3 ve G5.4'te
  Seçenek B (yeni infrastructure ekleme yerine dokümante etme) seçildi.
  G1 başarısızlığında "Yol 1 (erteleme + dokümantasyon)" tercih edildi.
  PHASE5_GUIDE.md Bölüm 2.2'nin lafzıyla ruhu birebir uygulandı.
- **Kullanıcı tarayıcı ajan oturumlarını kendi sağladı.** Browser agent
  raporlarını kullanıcı topladı; ajan promptlarını AI hazırladı, kullanıcı
  çalıştırdı. Maliyet kullanıcı tarafında.
- **Kullanıcı Türkçe iletişim tercih etti**, kod ve commit mesajları İngilizce
  (önceki fazlarla tutarlı).
- **Kullanıcı manuel tarayıcı testleriyle her fix'i doğruladı.** G5.2 cold-read
  race + Bulgu #5 force reflow + G5.7 EN locale: hepsi Chrome + Firefox'ta
  manuel testlerle teyit edildi.

---

## 3. Faz 5 Görev Akışı (KN0 → KN9)

PHASE5_GUIDE.md Bölüm 10 kontrol noktası akışı sırasıyla uygulandı:

```
KN0 (state doğrulama) → onay
KN1 (G1 DOM doğrulama) → onay/dallanma
KN2 (G1 görsel test) → BAŞARISIZ → rollback + Faz 5+ erteleme kararı
KN3 (cold-read race kararı) → Seçenek A → uygulandı
KN4 (DEFAULTS module kararı) → Seçenek B
KN5 (schemaVersion kararı) → Seçenek B
Bulgu #5 fix kararı (kılavuzda yoktu, KN2'de keşfedildi) → Fix A → uygulandı
KN6 (lint/format raporu) → Seçenek A (auto-write tüm dosyalara)
KN7 (docs taslağı) → onay
G5.7 (EN locale UI testi) → başarılı (Chrome + Firefox)
Birleşik tarayıcı testi (G5.2 + Bulgu #5) → başarılı
KN8 (commit planı) → 4 commit'lik plan onaylandı
KN9 (push) → onaylandı → push tamamlandı
```

### 3.1 — Görev 5.0 (KN0): State Doğrulama — TEMİZ

PHASE5_GUIDE.md Bölüm 4'teki 14 kontrol komutu çalıştırıldı. Tüm beklenti-gerçek
eşleşti; tek "sapma" `applyBlockingClasses` count 3 çıktı (kılavuz 2 bekliyordu).
Dosya okumasıyla 3'ün doğru olduğu netleşti (Kural 31). State Faz 5'e başlamak
için temiz.

### 3.2 — Görev 5.1 (KN1+KN2): G1 Leaf-Only Fix — BAŞARISIZ, ROLLBACK

PHASE5_GUIDE.md Bölüm 5'in en yüksek öncelikli görevi. Aşağıdaki adımlar sırasıyla
yaşandı:

**Adım 5.1.a — DOM doğrulaması (KN1).** Browser agent oturumu açıldı; AI tarafından
hazırlanmış 6 konsol komutu (K1-K6) ile Instagram ana feed'i ölçüldü. Sonuç:

- 5/5 eşleşen article `innerArticleCount: 0` (leaf article'lar)
- Hepsinde `hasVideo: true`, audio + reel linki birlikte
- "Önerilen" kapsayıcısı **bu oturumda gözlemlenmedi**
- Audio-tagged foto post regresyon kontrolü: temiz

Yorum: **Kapsayıcı article hipotezi DOM verisiyle desteklenmedi**, ama PHASE4
A/B testindeki semptom kanıtı (G1 OFF → siyah boşluk kayboldu) gerçek. Defansif
fix uygulanmaya değer bulundu.

**Adım 5.1.b — Fix uygulaması.** [block.css:74,77](src/content/block.css#L74)
default + override seçicilerine `:not(:has(article))` eklendi. Grep
doğrulamaları geçti. Audio-filter byte-for-byte korundu.

**Adım 5.1.d — Görsel test (KN2).** Kullanıcı 5 testi sahaya indirdi:

| #   | Test                                        | Sonuç                                                                  |
| --- | ------------------------------------------- | ---------------------------------------------------------------------- |
| 1   | Tüm toggle ON, derin scroll                 | **Siyah boşluk + jitter VAR** (fix çalışmadı)                          |
| 2   | Reel post'lar gizli mi?                     | Evet ✓                                                                 |
| 3   | Audio-tagged foto post regresyon            | Görünür kaldı ✓ (audio-filter OK)                                      |
| 4   | `blockFeedReelPosts` OFF, sayfa yenilemeden | Reel'ler göründü ✓                                                     |
| 5   | Tekrar ON, sayfa yenilemeden                | **Reel'ler tekrar gizlenmedi** (**Bulgu #5** — ayrı bir bug; bkz. 3.4) |

Bulgu #1 fix'in çözmediği orijinal semptom; Bulgu #5 KN2 sırasında **keşfedilen
yeni bir hata**.

**Adım 5.1.e — Rollback.** [block.css:74,77](src/content/block.css#L74)
Faz 4 haline döndürüldü. `git diff` boş (LF/CRLF uyarısı dışında). Fix
kodundan eser yok. Commit atılmamıştı, kayıp yok.

**Kök neden araştırması.** PHASE5_GUIDE.md Bölüm 5.1.d'nin tavsiyesi ("test
geçmezse fix'i geri al, alternatif seçicilere dön") uygulandı. T1/T2/T3
kontrol testleri yapıldı:

- T1 (eklenti tamamen devre dışı): Siyah boşluk **YOK**
- T2 (tüm 7 toggle ON): Siyah boşluk **VAR** (zaten önceki testten biliniyordu)
- T3 (yalnız `blockFeedReelPosts` OFF): Siyah boşluk **YOK**

Sonuç: **Semptom %100 G1 CSS kuralına bağlı.** PHASE4 A/B testi yeniden doğrulandı.

**Karar.** Üç yol değerlendirildi:

- (1) Erteleme + dokümantasyon
- (2) Faz 5 kapsamını genişletip yeni mekanizma (örn. `height: 0 + visibility: hidden`) dene
- (3) Daha derin DOM analizi

Kullanıcı (1)'i seçti. Sebep: kapsayıcı article hipotezi DOM verisiyle çürütüldü
(KN1); gerçek mekanizma muhtemelen `display: none` + IG virtualization spacer
etkileşimi, ama bu kanıtlanmadı. Yeni mekanizma denemesi PHASE5_GUIDE.md Bölüm
2.2 ("yeni özellik EKLENMEZ") ile çelişir.

**Faz 6'ya devredildi.** Bkz. Bölüm 6.

### 3.3 — Görev 5.2 (KN3): Cold-Read Race Fix — SEÇENEK A UYGULANDI

[redirect.js](src/content/redirect.js)'te race penceresi: ilk `tick()` storage
yüklenmeden çalışıyordu; kullanıcı `redirectReels` OFF olsa bile bookmark/direct
nav `/reels/...`'e gelen ilk hit yine yönlendiriliyordu.

Fix: `onChanged` listener'ı `storage.get` callback'inden önce kuruldu, `tick()`
ve `setInterval` callback içine taşındı. Korunan envanter (`POLL_INTERVAL_MS`,
`PAUSE_AFTER_REDIRECT_MS`, regex sıralaması, `location.replace`, loop guard)
dokunulmadı — sadece üç satırın çalıştırma sırası değişti + header yorumu
yenilendi.

Test: Kullanıcı manuel olarak Chrome'da doğruladı:

- `redirectReels` ON + bookmark `/reels/` → yönlendirildi ✓
- `redirectReels` OFF + bookmark `/reels/` → **yönlendirilmedi** ✓ (race kapandı)

### 3.4 — Görev 5.3 (KN4): DEFAULTS Shared Module — SEÇENEK B (DUPLICATE KORUNDU)

[redirect.js:46-54](src/content/redirect.js#L46) ve
[popup.js:17-25](src/popup/popup.js#L17) DEFAULTS objesi duplicate. Drift
riski "missing feature" üretir (silent corruption değil), düşük şiddetli.

Seçenek A (`src/shared/defaults.js` modülü + `manifest.json` `"type": "module"`)
manifest değişikliği gerektirir; Firefox MV3 ES module content script desteği
belirsiz. **Reddedildi.**

Seçenek B: duplicate kaldı, "yeni toggle ekleme prosedürü"
[docs/selectors.md](docs/selectors.md) Bölüm 3'te dokümante edildi (6 adımlı
checklist).

### 3.5 — Görev 5.4 (KN5): `schemaVersion` — SEÇENEK B (ERTELENDİ)

Faz 4 kılavuz niyeti `schemaVersion: 1` placeholder öneriyordu; fiili DEFAULTS'ta
yok. Faz 5'te:

- Yakın vadede şema değişimi planlanmıyor (yeni toggle eklemek YAGNI sayılıyor)
- `schemaVersion` aktif kullanımı olmayan placeholder; eklenince onChanged
  listener'a filtre eklemek gerek
- İleride migration gerekirse `stored.schemaVersion ?? 0` paterniyle eklenebilir

**Seçenek B (ertele) seçildi.** [docs/threat-model.md](docs/threat-model.md)
Bölüm 7.3'te dokümante edildi.

### 3.6 — Bulgu #5 (KN2'de keşfedildi): Toggle ON Live Re-Apply — FIX A UYGULANDI

KN2 testinde keşfedildi: `blockFeedReelPosts` OFF→ON yapınca, sayfa yenilenmeden
reel post'lar tekrar gizlenmiyordu. F5 ile düzeliyordu (storage doğru yazılıyor;
canlı CSS class removal'ı IG re-render'ı tetikleyemiyor).

Hipotez: Chrome `:has()` selectors için ancestor class değişikliğinde dinamik
invalidation her zaman tetiklenmiyor (bilinen Chrome quirk pattern'i).

Fix A: [redirect.js:92](src/content/redirect.js#L92) `applyBlockingClasses`
sonuna `void root.offsetHeight;` eklendi. Layout pass'i zorlar, tarayıcı
`:has()`'ı re-evaluate eder. Maliyet: ~1 frame perf hit (yalnız toggle anında).

Test: Kullanıcı sahada doğruladı — toggle OFF→ON anında gizleme tekrar çalıştı.

> **Önemli ayrım:** Bulgu #5 G5.1'deki "siyah boşluk + jitter" semptomundan
> **farklı bir bug**. G5.1 semptomu G1 ile `display:none`+virtualization
> etkileşimi; Bulgu #5 ise `:has()` re-evaluation timing'i. Faz 6 sadece
> G5.1 semptomunu hedefler; Bulgu #5 zaten kapatıldı.

### 3.7 — Görev 5.5 (KN6): ESLint/Prettier Kurulumu + Auto-Format

[.eslintrc.json](.eslintrc.json) ve [.prettierrc.json](.prettierrc.json) Faz 1'den
beri var ama `npm install` hiç çalışmamıştı.

Eklenenler:

- [package.json](package.json) — `private: true`, yalnız devDependencies:
  `eslint ^8.57.1`, `prettier ^3.3.3`. Runtime bağımlılığı yok.
- [.prettierignore](.prettierignore) — `node_modules/` + "Kopya" yedek dosyaları
  hariç tutar.
- `npm install` → 100 paket kuruldu, 0 vulnerability. 6 deprecation uyarısı
  (transitive deps + ESLint 8 EOL); fonksiyonel sorun değil.
- ESLint: `npx eslint src/` → exit 0, sıfır uyarı.
- Prettier: 20 dosyada format farkı tespit edildi; `npx prettier --write .`
  ile düzeltildi:
  - `redirect.js`, `popup.js` ve JSON config dosyaları **Prettier-clean idi**
    (dokunulmadı).
  - `block.css`, `popup.css`, `popup.html`, `manifest.json` — yalnız stil
    değişiklikleri (CSS quote, JSON array inline, HTML self-closing).
    Korunan envanter byte-for-byte semantik aynı.
  - 12 .md dosyası (PHASE1-5 GUIDE/HANDOFF, PRIVACY-TR/EN, README) yeniden
    formatlandı; içerik değişmedi.

**Önemli yan etki:** Bir markdown table (selectors.md URL Redirect Regex)
Prettier auto-format ile bozuldu — regex içindeki `|` karakteri markdown
table separator olarak yorumlandı. Manuel restructure ile düzeltildi
(regex'ler `js` code block içine taşındı).

### 3.8 — Görev 5.6 (KN7): docs/selectors.md + docs/threat-model.md

PHASE5_GUIDE.md Bölüm 8 gereği:

- [docs/selectors.md](docs/selectors.md) (~9.6 KB) — 4 CSS seçici (A1, A2, D1, G1)
  - 3 URL regex (F1a/b, E1, F1c) envanteri; G1 deferral notu; yeni toggle
    ekleme prosedürü (G5.3 Seçenek B çıktısı).
- [docs/threat-model.md](docs/threat-model.md) (~10.6 KB) — Privacy/güvenlik
  duruşu; istenmeyen izinler tablosu; CSP açıklaması; cold-read race davranışı;
  reddedilen API'ler; bilinen UX/stabilite konuları (G1 + virtualization,
  Bulgu #5 workaround, schemaVersion deferral).

**Yeni iddia uydurma yok (Kural 7):** Tüm bilgiler block.css/redirect.js
dosyalarından, manifest.json'dan ve PHASE1-4 handoff'larından doğrulandı.

### 3.9 — Görev 5.7: EN Locale UI Testi — BAŞARILI

Chrome ve Firefox'ta İngilizce dil ayarı ile popup test edildi:

- Başlık + alt başlık İngilizce ✓
- 7 toggle etiketi (4 "Hide" + 3 "Redirect") İngilizce ✓
- Hiçbir `__MSG_*__` veya boş element yok ✓

Sahaya iniş sırasında Chrome'da "Display Google Chrome in this language" ayarının
gözden kaçtığı için command-line `--lang=en-US` yöntemi alternatif olarak
sunuldu. Kullanıcı her iki tarayıcıda da locale'i değiştirdi, test geçti,
sonrasında Türkçe'ye geri döndü.

### 3.10 — Birleşik Tarayıcı Testi: BAŞARILI

KN8 commit'lerinden önce G5.2 cold-read race fix ve Bulgu #5 force reflow fix
birleşik test ile sahada doğrulandı. Her iki fix de çalıştı.

---

## 4. Repo Durumu (Faz 5 sonu, push edildi — origin/main ile senkron)

```
Yerel dizin:  C:\Users\User\Desktop\İnstagram Chrome Plugin\
Branch:       main (origin/main ile senkron)
Remote:       origin = https://github.com/keremtunayetkinn/reels-off.git
Visibility:   Private (GitHub)
Working tree: clean
HEAD:         e2b561e — "Phase 5: add docs/selectors.md and docs/threat-model.md"
Toplam commit: 19
Faz 5 commit'leri: bd68169, 2512853, 0b29886, e2b561e (sırayla)
```

### Faz 5 commit zinciri (eski → yeni)

| Hash      | Mesaj (özet)                                                           | Kapsam                                                                                                          |
| --------- | ---------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `bd68169` | Phase 5: cold-read race fix + onChanged :has() invalidation workaround | `src/content/redirect.js` (+21/-16). G5.2 race fix + Bulgu #5 force reflow workaround.                          |
| `2512853` | Phase 5: add package.json + .prettierignore, format extension assets   | `package.json`, `.prettierignore` (yeni); `manifest.json`, `block.css`, `popup.css`, `popup.html` (Prettier).   |
| `0b29886` | Phase 5: format existing documentation with Prettier                   | 12 .md dosyası (PHASE1-5 GUIDE/HANDOFF, PRIVACY-TR/EN, README) — yalnız Prettier auto-format, içerik değişmedi. |
| `e2b561e` | Phase 5: add docs/selectors.md and docs/threat-model.md                | `docs/selectors.md` + `docs/threat-model.md` (yeni; G5.6 çıktısı).                                              |

### Faz 5 başlamadan önceki HEAD

`9ee7159` — "Revise PHASE4_HANDOFF.md for clarity and accuracy; add
PHASE5_GUIDE.md for Phase 5 implementation guidelines". Bu commit Faz 5
GUIDE'ını içerir; Faz 5 implementation'ı buradan başladı.

### Dosya envanteri (Faz 5 sonu, kök + alt)

```
.eslintrc.json (Faz 1)
.prettierrc.json (Faz 1)
.prettierignore (Faz 5 — YENİ)
.gitignore (Faz 1; node_modules + package-lock.json ignore'lu)
package.json (Faz 5 — YENİ)
manifest.json (Faz 1; Faz 4 storage permission; Faz 5 Prettier)
README.md (Faz 1-4 güncellendi; Faz 5 Prettier)
LICENSE (Faz 1)
PRIVACY-TR.md, PRIVACY-EN.md (Faz 1; Faz 5 Prettier)
PHASE1_HANDOFF.md, PHASE2_HANDOFF.md, PHASE3_HANDOFF.md, PHASE4_HANDOFF.md (Faz 5 Prettier)
PHASE1_GUIDE.md → PHASE5_GUIDE.md (Faz 5 Prettier)
PHASE5_HANDOFF.md (bu belge — YENİ)
docs/.gitkeep (Faz 0; yine var)
docs/selectors.md (Faz 5 — YENİ)
docs/threat-model.md (Faz 5 — YENİ)
src/content/block.css (Faz 2; Faz 4 override'lar; Faz 5 Prettier)
src/content/redirect.js (Faz 3; Faz 4 settings/onChanged; Faz 5 race fix + force reflow)
src/popup/popup.html (Faz 4; Faz 5 Prettier)
src/popup/popup.css (Faz 4; Faz 5 Prettier)
src/popup/popup.js (Faz 4)
src/icons/icon-16.png, icon-32.png, icon-48.png, icon-128.png (Faz 1 placeholder)
_locales/tr/messages.json, _locales/en/messages.json (Faz 1+4; 13'er key)
node_modules/ (gitignored; ESLint + Prettier transitive)

Yedek dosyalar (kullanıcı tarafından tutuluyor, .prettierignore'da):
  - Kopya.gitignore, LICENSE - Kopya, manifest - Kopya.json, PHASE1_GUIDE - Kopya.md,
PRIVACY-EN - Kopya.md, PRIVACY-TR - Kopya.md, .eslintrc - Kopya.json, .prettierrc - Kopya.json
```

---

## 5. Korunan Envanter Sağlamlık Kontrolü (Faz 5 sonu)

PHASE5_GUIDE.md Bölüm 3.1 — Faz 5 boyunca hiçbiri bozulmadı:

| Mekanik                                                                    | Konum                                                                                       | Durum                                                      |
| -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| G1 audio-filter `:not([href^='/reels/audio/'])`                            | [block.css:74,77](src/content/block.css#L74) (default + override)                           | ✅ byte-for-byte (semantic) — yalnız Prettier tırnak stili |
| İki katmanlı loop guard (`target !== location.pathname` + `pollingPaused`) | [redirect.js:71-80](src/content/redirect.js#L71)                                            | ✅ Dokunulmadı                                             |
| Regex sıralaması (F1a/b → E1 → F1c)                                        | [redirect.js:61-66](src/content/redirect.js#L61)                                            | ✅ Dokunulmadı                                             |
| Polling parametreleri (300/1000ms)                                         | [redirect.js:36-37](src/content/redirect.js#L36)                                            | ✅ Dokunulmadı                                             |
| `location.replace()` (asla `location.href =`)                              | [redirect.js:78](src/content/redirect.js#L78)                                               | ✅ Dokunulmadı                                             |
| Default-true policy (7 toggle hepsi true)                                  | [redirect.js:46-54](src/content/redirect.js#L46) + [popup.js:17-25](src/popup/popup.js#L17) | ✅ Dokunulmadı                                             |
| `chrome.storage.local` (sync DEĞİL)                                        | [redirect.js:111](src/content/redirect.js#L111) + [popup.js:37](src/popup/popup.js#L37)     | ✅ Dokunulmadı                                             |
| Sıkı CSP / minimal izin                                                    | [manifest.json](manifest.json)                                                              | ✅ Dokunulmadı (storage tek izin)                          |

---

## 6. Faz 6 İçin Devir (G1 Mekanizma Fix)

Faz 5 G5.1 yarı bıraktı: semptom kanıtlandı (G1 suçlu), denenen fix
(`:not(:has(article))`) başarısız oldu, kapsayıcı article hipotezi çürütüldü.
Faz 6 bu işin devamıdır.

### Faz 6 hedefi (öneri)

**Tek konu:** Instagram ana feed'de `blockFeedReelPosts` aktifken derin scroll
(~7-8 post sonra) ortaya çıkan **siyah boşluk + scroll jitter** semptomunu
ortadan kaldırmak.

### Faz 6 başlangıç state'i

- block.css'te G1 mevcut hâliyle (Faz 4 hali = leaf-only fix yok)
- T1/T2/T3 testleriyle suçlu G1 olarak kanıtlanmış
- KN1 DOM verisi: 5/5 article leaf (innerArticleCount: 0); kapsayıcı article yok
- Hipotez (kanıtlanmadı): `display: none` IG'nin virtualized feed spacer
  hesabını bozar → eksik yükseklik → siyah boşluk + jitter

### Faz 6 önerilen ilk adım

**Mekanizma hipotezini kanıtlamak.** Browser agent veya manuel olarak,
semptom gözlendiği **tam anda** DOM snapshot:

- Feed parent'ının `padding-bottom` spacer değeri vs viewport içeriği
- Gizli (display:none) article'ların eski offsetHeight değerleri vs IG'nin
  beklediği yükseklik
- Article render counts (mounted, hidden, recycled)
- IG'nin internal virtualization scroll position state

Bu veri "display:none + spacer mismatch" hipotezini kanıtlar veya çürütür.

### Faz 6 olası mekanizma çözümleri (sıraya göre risk artıyor)

1. **Layout-aware CSS gizleme:** `display: none` yerine `height: 0; overflow: hidden;
visibility: hidden; margin: 0; padding: 0;` — element DOM'da kalır,
   IG yükseklik ölçümü "0" döner, spacer matematiği bozulmaz. **Riski en
   düşük yaklaşım.** Test gerekir.
2. **`position: absolute; left: -9999px;`** — element layout flow dışına
   çıkar, görünmez. IG ölçümlerine etkisi belirsiz.
3. **JS-based gizleme + MutationObserver** — CSS-only stratejiden çıkış;
   mimari değişiklik. En invaziv. Faz 6 kapsamı genişletilirse düşünülebilir.

### Faz 6 koruması (Faz 5'ten miras)

- Audio-filter, loop guard, regex sıralaması, polling, location.replace,
  default-true policy, chrome.storage.local, minimal izin, CSP — **hepsi
  korunmalı**.
- A1/A2/D1 seçicilerine dokunulmamalı; sadece G1 mekanizması.
- Manifest değişikliği gereksiz (yeni izin yok).
- Bulgu #5 force reflow workaround intact (Faz 5'te eklendi, sahada çalıştı).

### Faz 6 başarı kriteri

- T2 testi (tüm toggle ON, derin scroll) → siyah boşluk YOK, jitter YOK.
- T3 + T1 testleri hâlâ aynı sonuç (kontrol kümesi).
- Audio-tagged foto post regresyon kontrolü temiz.
- KN2 benzeri tam görsel test geçmeli.

### Faz 6 başarısız olursa

Faz 5'te de kabul edilebilir bulunan duruma geri sarılır: G1 toggle kullanıcı
elinde, semptom dokümante edilmiş, bug zararsız (kullanıcı `blockFeedReelPosts`
OFF yapabilir). Faz 6 commit'leri revert edilir veya branch silinir.

---

## 7. Faz 5 Açık Konular ve Sonraki Adımlar (Bilgi)

Faz 6'da G1 dışında dokunulabilecek diğer "Faz 5+" konuları (sıra önerisi
değil, hatırlatma):

| Konu                                          | Kaynak                                                                                   |
| --------------------------------------------- | ---------------------------------------------------------------------------------------- |
| G1 mekanizma fix                              | Bölüm 6 (bu rapor) — Faz 6 birincil konu                                                 |
| Versiyon bump (`0.1.0` → `1.0.0`)             | Bağımsız; PHASE5_GUIDE.md Bölüm 2.2                                                      |
| Gerçek ikon tasarımı (placeholder PNG'ler)    | Faz numarası belirsiz; PHASE5_GUIDE.md Bölüm 2.2                                         |
| Paketleme (zip/xpi) + mağaza submission       | Chrome Web Store + AMO (gereksinimler/ücretler başvuru anında doğrulanmalı)              |
| CI/CD (GitHub Actions): lint + format gate    | Faz 5 sonrası                                                                            |
| Test altyapısı (Vitest / Jest)                | Faz 5 sonrası                                                                            |
| Periyodik IG DOM stability denetimi           | Faz 2 handoff'tan beri öneri; her ana faz arasında                                       |
| ESLint 8 → 9 (flat config refactor)           | Bağımlılık olgunlaştığında                                                               |
| `schemaVersion` + storage migration altyapısı | Şema değişimi ihtiyacı doğduğunda                                                        |
| `chrome.storage.local` vs `sync` tartışması   | Kapalı (sync reddedildi, privacy gerekçesi); değiştirmek için politika revizyonu gerekir |

---

## 8. Faz 5 Dersleri (Lessons Learned)

Bu bölüm yeni ajan için süreç dersleri.

### 8.1 — Browser agent halüsinasyon riski gerçek

KN1 sonrası G1 derin DOM analizi için kullanılan ikinci browser agent oturumu
şu sorunları gösterdi:

- **Semptomu tetikleyemedi** (12 post derinliğe indi, "belirgin siyah blok
  yakalayamadım" dedi) — ama sonra yine de hipotez kurmaya çalıştı.
- **CSS tarama scriptini şablon dışı ekledi** ve "eklenti CSS yok" çıkardı,
  bu disk gerçeğiyle çelişti ([block.css](src/content/block.css)
  açıkça `display: none` kuralı içeriyor).
- **D2 (G1 seçicisi eşleşme sayısı) komutunu atladı** ama hipotez bildirdi.

**Ders:** Browser agent çıktısı her zaman bağımsız doğrulamadan geçirilmeli.
Şablon dışı ekleme, atlanmış komut, ya da "disk gerçeği ile çelişen iddia"
red flag'leridir. Kural 25 burada da geçerli: ajan çıktısı otorite değil,
dosya gerçeği otorite.

### 8.2 — Hipotez doğrulamadan fix uygulama hatası tekrarlanabilir

G5.1'de `:not(:has(article))` fix'i, kapsayıcı article hipotezi DOM verisiyle
desteklenmediği halde defansif olarak uygulandı. KN2 testinde başarısız olunca
geri sarıldı. Bu, **PHASE4_HANDOFF.md'da uyarılan pattern'in tekrarı**: Faz 4'te
de güvenlik analizi yapıldıktan sonra fix Faz 5'e ertelenmişti çünkü hipotez
doğrulanmadan uygulama tehlikeliydi. Faz 5'te de aynı tehlike vardı, sadece
test maliyeti küçük olduğu için riske girildi.

**Ders:** "Kanıtlanmamış hipoteze dayalı küçük fix" bile maliyetli olabilir
— testten geçmezse rollback yapılır ama bilgi kazanılır mı? KN1'in zaten
sağladığı bilgiyi (innerArticleCount=0) ciddiye almak fix denemesini
elemine edebilirdi.

### 8.3 — Markdown table'da regex tehlikesi

Prettier markdown table'ı reformat ederken cell içindeki `|` karakteri
separator olarak yorumlandı; URL Redirect Regex tablosu görsel olarak
bozuldu. Tespit edildi ve restructure ile düzeltildi (regex'ler code
block'a alındı).

**Ders:** Markdown table'da pipe içeren içerik (regex, alternation
syntax, table-içi pipe) kullanma; inline code'da bile sıkıntı yaratabilir.
Code block veya başka yapı kullan.

### 8.4 — Atomic commit'in faydası push öncesi karar anında ortaya çıktı

Push öncesi kullanıcı G1'i yeniden açma sorusunu sordu. Çünkü 4 commit
atomik ve kapsam-net olduğu için, "G1 işi ayrı bir Faz 6'ya" kararı temiz
verilebildi: mevcut commit'leri kirletmeden, geri sarmaya gerek kalmadan.

**Ders:** Atomic commit'in faydası "geri sarmak kolay olur" değil; **karar
verme anında esnekliği korur**. Mantıksal birimler ayrıldığında, hangi
biriminin kaldığını / kaldırılacağını / ertelenec eğini bağımsız seçebilirsin.

### 8.5 — Force reflow workaround sahada çalıştı (ama hipotez yine kanıtlanmadı)

Bulgu #5 için `void root.offsetHeight;` ekledik. Testte çalıştı. Ama
**Chrome `:has()` invalidation quirk** hipotezi sadece "plausible" düzeyinde
— gerçekten Chrome bug'ı mı, IG render etkileşimi mi, yoksa başka bir şey
mi, kesin değil. Çözüm çalıştığı için yeterli.

**Ders:** Bazı durumlarda hipotez kanıtlanamasa da çözüm çalışır. Bu kabul
edilebilir ama **handoff/docs'ta hipotezin "kanıtlanmadı"
işaretlenmeli** (yapıldı: [threat-model.md Bölüm 7.2](docs/threat-model.md)).

---

## 9. Yeni Ajan İçin Hızlı Başlangıç Kontrol Listesi

Faz 6'ya başlayan ajan şu adımları sırasıyla yapmalı:

1. **Bu raporu oku.** Özellikle Bölüm 6 (Faz 6 devir).
2. **`PHASE5_GUIDE.md` Bölüm 0.1 (Kural 25 = commit ağacı otorite değil)
   ezberle.** Faz 6'da da geçerli.
3. **Disk state'ini `Read`/`Grep` ile doğrula.** `git log` yalnız bağlam.
   Beklenti tablosu:
   - [block.css](src/content/block.css) G1 satır 74-80'de, `:not(:has(article))` **yok**.
   - [redirect.js](src/content/redirect.js) cold-read race fix satır 95-116; force reflow satır 92.
   - [docs/selectors.md](docs/selectors.md) G1 deferral bölümü mevcut.
   - [docs/threat-model.md](docs/threat-model.md) Bölüm 7.1 G1 + virtualization açıklaması.
4. **Faz 6 GUIDE'ı kullanıcıdan iste** (henüz yazılmadı; bu rapor sadece
   devir).
5. **Faz 6 başlangıç KN'leri kullanıcıyla netleştir.** Önerilen ilk
   adım: hipotez kanıt toplama (Bölüm 6.3 — Faz 6 önerilen ilk adım).
6. **Korunan envantere asla dokunma** (Bölüm 5).
7. **Karar görevlerinde tek başına uygulama yapma** (Kural 27).
8. **Bulgu #5 force reflow workaround intact kalsın.** G1 mekanizma
   değişikliği yapsan bile `applyBlockingClasses` sonundaki `void root.offsetHeight`
   silinmemeli (Faz 5'te ayrı bir sorunu çözüyordu).

---

## 10. Bu Belgeyi Okuyan Yeni Ajana Son Söz

Faz 5'in iki ayırt edici disiplini var:

1. **Canlı dosya = doğruluk, commit ağacı = değil.** Kural 25. Faz 5
   boyunca her state kontrolü dosya okumayla yapıldı, commit geçmişi yalnız
   bağlam.
2. **Önce doğrula, sonra dokun.** Kural 26. G5.1'in başarısız olması bu
   kuralın _neden var olduğunu_ gösteriyor — kanıtlanmamış hipoteze dayalı
   fix bedeli vardır (test, rollback, dokümantasyon güncellemesi).

Faz 5'in en zorlu kararı: G1 başarısızlığı karşısında kullanıcının "yol
ayrımı" sunduğum üç seçenekten (1, 2, 3) en kapsam-disiplinli olanı
(erteleme + dokümantasyon) seçmesiydi. Faz 6 bu erteleme kararının
devamıdır; G1 mekanizmasını sıfırdan ele alır.

Projenin değişmez ilkesi (Faz 1-4'ten beri):

> **"İyileştirici değil uygulayıcı ol. Belirsizlikte sor. Sapma yaparsan
> şeffaf raporla. Kapsam dışına çıkma."**

Faz 5 bu ilkeye sıkı tutundu. Faz 6 de tutmalı.
