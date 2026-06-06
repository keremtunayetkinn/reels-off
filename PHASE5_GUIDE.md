# Faz 5 Uygulama Kılavuzu — Claude Code İçin Görev Belgesi

> **Bu belgenin amacı:** Faz 4 tamamlanmış halde devralınan projeyi, Faz 5 (Cilalama / Stabilizasyon) kapsamında, halüsinasyon riskini minimize ederek, her kritik adımda kontrol noktası bulundurarak ve kapsam sınırlarına sıkı bağlı kalarak ilerletmek. Bu belge bir **uygulama kılavuzudur**; Claude Code bunu okuyup uygular, "iyileştirmez", kapsam dışına çıkmaz.
>
> **Bu kılavuz `PHASE4_HANDOFF.md` ile birlikte okunmalıdır.** Handoff projenin _geçmişini_ anlatır; bu kılavuz Faz 5'te _ne yapılacağını_ tanımlar. Çelişki halinde bu kılavuz Faz 5 görevleri için üstündür.

---

## 0. Kaynak Otorite Hiyerarşisi (ÖNCE BUNU OKU)

Aşağıdaki sıralama bağlayıcıdır. Üstteki, alttakini ezer:

1. **Canlı dosya içeriği** (`git`'in değil, diskteki gerçek dosyaların o anki hali) — **TEK DOĞRULUK KAYNAĞI**.
2. **Bu kılavuz** (`PHASE5_GUIDE.md`).
3. **MV3 / WebExtensions resmi dokümantasyonu** (Chrome + MDN).
4. **Önceki handoff'lar** (`PHASE4_HANDOFF.md`, `PHASE3_HANDOFF.md`, …) — _referans/bağlam_, otorite değil.
5. **Kullanıcının canlı talimatı** her zaman geçerli; belirsizlikte kullanıcıya sorulur.

### 0.1 — Git commit ağacı OTORİTE DEĞİLDİR (Faz 5'in en kritik kuralı)

Bu projenin commit geçmişinde **kanıtlanmış tutarsızlıklar** vardır:

- `1065df4` commit mesajı "Refactor code structure for improved readability and maintainability" der; gerçekte **hiçbir kod dosyasına dokunmamış**, yalnızca doküman eklemiş bir commit'tir. Commit mesajı içeriği yansıtmıyordu.
- Faz numaralandırması belgeler arası kaymıştır (eski belgelerde "Faz 5" olarak geçen kapsam, sonradan "Faz 4" olarak yeniden numaralandırıldı).
- Handoff metinleri arasında faz-kapsam atfı çelişebilir (örn. ikon tasarımının hangi faza ait olduğu).

**Bu nedenle Claude Code:**

- **Commit mesajlarına, commit zincirine, hash'lere veya git geçmişine dayanarak proje durumu (state) ÇIKARSAMAZ.** Bunlar yanıltıcı olabilir.
- Proje durumunu **yalnızca diskteki canlı dosyaları okuyarak** belirler (`view` / `cat` / `grep` ile gerçek içerik).
- Bir commit mesajı ile dosya içeriği çeliştiğinde **dosya içeriğine güvenir**, commit mesajını yok sayar.
- Git arkeolojisi (commit'ler arası diff alıp "şu fazda şu oldu" anlatısı kurma) yaparak karar vermez. Geçmiş bağlam için handoff yeterlidir; karar için canlı dosya esastır.
- `git log`, `git show`, `git diff <eski-hash>` çıktılarını **bilgilendirme amaçlı** kullanabilir, ama bunlara dayanarak "dosya şöyledir" sonucuna varmaz — dosyayı doğrudan açıp okur.

> **Tek cümlede:** "Ne yazıyor commit?" değil, "Ne yazıyor dosyanın kendisi?" sorusu yönlendiricidir. Çelişki görürsen commit'i değil dosyayı esas al ve gerekirse kullanıcıya bildir.

---

## 1. Proje Kimliği (Faz 5 başı)

| Alan            | Değer                                                                                                                                         |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Proje adı       | **Reels Off** (TR ve EN aynı)                                                                                                                 |
| Tür             | Chrome + Firefox MV3 tarayıcı eklentisi                                                                                                       |
| Tek amaç        | "Instagram web arayüzünde Reels ve algoritmik içerik önerilerini gizleyerek dikkat dağılmasını azaltır. Tercihler yalnızca cihazda saklanır." |
| Sahibi          | Kerem Tuna                                                                                                         |
| Hedef mağazalar | Chrome Web Store + Mozilla Add-ons (AMO)                                                                                                      |
| Diller          | Türkçe (varsayılan), İngilizce (fallback)                                                                                                     |
| Mevcut faz      | **Faz 4 tamamlandı**; bu belge **Faz 5'i (Cilalama)** tanımlar                                                                                |
| Nihai hedef     | Public lansman (Faz 5 bu hedefe giden _kod kalitesi_ adımıdır; lansmanın kendisi sonraki fazlardır)                                           |

### Değişmez teknik kararlar (Faz 1-4 mirası — Faz 5'te KORUNUR)

Vanilla JS · bundler/minify yok · CSS-first href-tabanlı seçici · `chrome.storage.local` (sync DEĞİL) · sıkı CSP · tek `host_permissions` (`instagram.com/*`) · `permissions: ["storage"]` (başka izin yok) · build adımı yok · sıfır telemetri/analitik.

---

## 2. Faz 5 Kapsamı

Faz 5 = **Cilalama ve Stabilizasyon**. Yeni kullanıcı-yüzü özelliği EKLENMEZ. Kapsam, Faz 4 handoff'unun açık bıraktığı ve doğrulama sırasında tespit edilen maddelerden oluşur.

### 2.1 — Kapsam İÇİ (bu fazda yapılacak)

| #    | Görev                                                                                | Tip                         | Öncelik    |
| ---- | ------------------------------------------------------------------------------------ | --------------------------- | ---------- |
| G5.1 | **G1 over-match leaf-only fix**                                                      | Kod değişikliği (block.css) | **Yüksek** |
| G5.2 | redirect.js cold-read race (yönlendirme toggle'ları) — **araştır + kullanıcıya sun** | Karar                       | Orta       |
| G5.3 | `DEFAULTS` shared module — **değerlendir + kullanıcıya sun**                         | Karar                       | Düşük      |
| G5.4 | `schemaVersion` — **değerlendir + kullanıcıya sun**                                  | Karar                       | Düşük      |
| G5.5 | ESLint/Prettier `package.json` ile gerçek kurulum + lint/format                      | Araç                        | Orta       |
| G5.6 | `docs/selectors.md` + `docs/threat-model.md` yazımı                                  | Doküman                     | Orta       |
| G5.7 | EN locale UI testi (şimdiye dek yalnız TR test edildi)                               | Test                        | Düşük      |

**Önemli:** G5.2, G5.3 ve G5.4 birer **karar görevidir** — Claude Code bunları tek başına uygulamaz. Önce analiz eder, seçenekleri kullanıcıya sunar, onay alınca uygular. (Detay: Bölüm 6.)

### 2.2 — Kapsam DIŞI (bu fazda KESİNLİKLE yapılmayacak)

- **Gerçek ikon tasarımı.** Handoff belgeleri bu konuda kendi içinde çelişiyor (bir yerde Faz 5, başka yerde Faz 10). Çelişki nedeniyle **Faz 5 kapsamı dışında tutuldu**; faz ataması kullanıcı kararıdır. Placeholder PNG'lere dokunma.
- Versiyon bump (`0.1.0` → `1.0.0`) — sonraki faz.
- Paketleme (zip/xpi), mağaza submission, repo public yapma — sonraki fazlar.
- CI/CD (GitHub Actions) — sonraki faz.
- Test altyapısı (Jest/Vitest) — sonraki faz.
- Yeni toggle / yeni engelleme kuralı / kapsam genişletme — yapılmaz.
- `webNavigation`, `tabs`, `scripting`, `notifications`, `<all_urls>` izinleri — eklenmez.
- Mesajlaşma API'si (`chrome.runtime.sendMessage`, `chrome.tabs.sendMessage`) — eklenmez.

---

## 3. Çalışma Felsefesi ve Faz 5 Kuralları

Faz 1-4'teki tüm kurallar (Kural 1-24) geçerlidir. Özeti: **İyileştirici değil uygulayıcı ol. Belirsizlikte sor. Sapma yaparsan şeffaf raporla. Kapsam dışına çıkma.**

### Faz 5'e özel ek kurallar (Kural 25-31)

- **Kural 25 (Commit ağacına güvenme):** Bölüm 0.1 bağlayıcıdır. State, canlı dosyadan okunur; commit geçmişinden çıkarsanmaz.
- **Kural 26 (Önce doğrula, sonra değiştir):** Hiçbir DOM-bağımlı düzeltme (özellikle G5.1), canlı DOM doğrulaması yapılmadan uygulanmaz. Varsayıma dayanarak seçici değiştirme **yasaktır**.
- **Kural 27 (Karar görevleri tek başına uygulanmaz):** G5.2/G5.3/G5.4 için Claude Code analiz yapar ve seçenek sunar; kullanıcı seçmeden kod yazılmaz.
- **Kural 28 (Korunan mekanikler dokunulmaz):** Aşağıdaki "korunan envanter" (Bölüm 3.1) hiçbir görevde bozulmaz. Bir görev bunlardan birine dokunuyorsa DUR ve kullanıcıya bildir.
- **Kural 29 (Atomic, dar commit'ler):** Her mantıksal iş ayrı commit. Kod değişikliği ile doküman ekleme aynı commit'e karıştırılmaz (geçmişteki `1065df4` hatasının tekrarı önlenir). Commit mesajı içeriği **dürüstçe** yansıtır.
- **Kural 30 (Geri-alınması zor aksiyon = açık onay):** `git commit`, `git push` öncesi kullanıcıdan net onay alınır. Otomatik push **yasak**.
- **Kural 31 (False-positive farkındalığı):** Doğrulama grep'leri kod + yorum metnini birlikte sayabilir. Beklenenden fazla eşleşme görülürse önce "yorum mu, kod mu?" ayrımı yapılır; panik yapılmaz, kullanıcıya açıklanır.

### 3.1 — Korunan Envanter (hiçbir görevde bozulmaz)

| Mekanik                                                                    | Kaynak         | Neden korunur                                        |
| -------------------------------------------------------------------------- | -------------- | ---------------------------------------------------- |
| G1 audio-filter `:not([href^="/reels/audio/"])`                            | Faz 2 Sapma 2  | Müzik etiketli foto post'lar yanlışlıkla gizlenmesin |
| İki katmanlı loop guard (`target !== location.pathname` + `pollingPaused`) | Faz 3 Kural 15 | Sonsuz redirect döngüsü önlenir                      |
| Regex sıralaması (F1a/b → E1 → F1c)                                        | Faz 3 Kural 13 | Username yakalayıcısının çakışmasını önler           |
| Polling parametreleri (300ms / 1000ms)                                     | Faz 3 Kural 11 | Doğrulanmış sweet spot                               |
| `location.replace()` (asla `location.href =`)                              | Faz 3 Kural 14 | Geri tuşu reel'e dönmesin                            |
| Default-true policy (7 toggle hepsi `true`)                                | Faz 4 Kural 19 | Kurulumda eklenti tam aktif                          |
| `chrome.storage.local` (sync DEĞİL)                                        | Faz 1 mimari   | Privacy policy uyumu                                 |
| Sıkı CSP / minimal izin                                                    | Faz 1-4        | Web Store reviewer kırmızı bayrağı olmasın           |

---

## 4. Devralınan State Doğrulama (Görev 5.0 — her şeyden önce)

> **Amaç:** Faz 5'e başlamadan önce diskteki gerçek durumun beklenenle uyumlu olduğunu **dosyaları okuyarak** teyit etmek. (Commit geçmişiyle değil — Kural 25.)

Aşağıdaki komutlar bilgilendiricidir; çıktıları **dosya içeriğini** teyit eder. Beklenen sonuçlar yorumda.

```bash
# block.css — Faz 4 outputu, G1 over-match HÂLÂ MEVCUT olmalı (henüz düzeltilmedi)
grep -c "display: none !important" src/content/block.css      # 5 (4 kural + 1 yorum referansı — Kural 31)
grep -c "display: revert !important" src/content/block.css    # 5 (4 override + 1 yorum referansı)
grep "audio" src/content/block.css                            # audio-filter satır(lar)ı görünmeli
grep -c ":not(:has(article))" src/content/block.css           # 0 olmalı (leaf-fix henüz yok)

# redirect.js — Faz 3+4 outputu
grep -c "'use strict'" src/content/redirect.js                # 1
grep "POLL_INTERVAL_MS = 300" src/content/redirect.js         # eşleşmeli
grep "PAUSE_AFTER_REDIRECT_MS = 1000" src/content/redirect.js # eşleşmeli
grep -c "applyBlockingClasses" src/content/redirect.js        # 2 (tanım + çağrı)
grep -nE "location\.href\s*=" src/content/redirect.js         # BOŞ olmalı

# manifest — storage izni var, yasaklı izin yok
grep -A2 '"permissions"' manifest.json                        # "storage"
grep -E '"(webNavigation|tabs|activeTab|cookies|scripting|<all_urls>)"' manifest.json  # BOŞ

# i18n — TR ve EN 13'er key, isimler eşleşir
node -e "const t=require('./_locales/tr/messages.json'),e=require('./_locales/en/messages.json');const a=Object.keys(t).sort(),b=Object.keys(e).sort();console.log('TR:',a.length,'EN:',b.length,'Eşleşiyor:',JSON.stringify(a)===JSON.stringify(b));"
# TR: 13 EN: 13 Eşleşiyor: true

# DEFAULTS popup.js ↔ redirect.js — 7 key, hepsi true, schemaVersion YOK
grep -c "schemaVersion" src/content/redirect.js src/popup/popup.js   # ikisinde de 0

# docs/ hâlâ boş
ls docs/                                                      # sadece .gitkeep
```

→ **[KONTROL NOKTASI 0]** State doğrulama raporunu kullanıcıya sun (tablo halinde: beklenen vs. gerçek). Sapma varsa DUR ve bildir. Onay gelmeden Görev 5.1'e geçme.

---

## 5. Görev 5.1 — G1 Over-Match Leaf-Only Fix (Yüksek Öncelik)

> **Bağlam:** Faz 4 derin-scroll testinde keşfedildi. Mevcut G1 seçicisi, içinde reel linki bulunan **kapsayıcı** `<article>`'ı da yakalıyor; kapsayıcı gizlenince altındaki tüm post'lar kayboluyor → siyah boşluk + scroll jitter. Faz 4 güvenlik analizi tamamlandı (sonuç: önerilen fix güvenli). Ancak fix **canlı DOM doğrulaması olmadan uygulanmaz** (Kural 26).

### Adım 5.1.a — Canlı DOM doğrulaması (ÖNCE, kod yazmadan)

Claude in Chrome (veya kullanıcının sağlayacağı canlı inceleme) ile Instagram ana feed'i incele ve şu soruları **kanıtla** yanıtla:

1. Gerçek reel post'un kendisi en içteki (leaf) `<article>` mı?
2. Reel post `<article>`'ının **içinde** başka bir `<article>` var mı? (Beklenen: hayır.)
3. "Önerilen"/"Daha fazla" gibi feed bölümleri `<article>` ile mi sarılıyor? (Bu, kapsayıcı-article hipotezini doğrular.)

→ **[KONTROL NOKTASI 1]** DOM doğrulama bulgularını raporla.

- **DOM beklendiği gibiyse** (reel post = leaf article, kapsayıcı article over-match yapıyor) → 5.1.b'ye geç.
- **DOM farklıysa** (örn. reel post nested article içeriyor) → fix'i UYGULAMA. Alternatif seçicileri (`article:not(:has(> article))` yalnız doğrudan çocuk; `main article:has(...)` dar scope; video/aria ipucu) kullanıcıya sun, kararını bekle.

### Adım 5.1.b — Fix uygulaması (yalnız DOM doğrulandıysa)

`src/content/block.css`'te **yalnız G1 bloğunda**, iki seçiciye `:not(:has(article))` eklenir. Audio-filter **byte-for-byte korunur** (Kural 28).

```diff
  /* G1 default kural */
- article:has(a[href^="/reels/"]:not([href="/reels/"]):not([href^="/reels/audio/"])) {
+ article:not(:has(article)):has(a[href^="/reels/"]:not([href="/reels/"]):not([href^="/reels/audio/"])) {
    display: none !important;
  }

  /* G1 override kural */
- html.ro-disable-feed-reel-posts article:has(a[href^="/reels/"]:not([href="/reels/"]):not([href^="/reels/audio/"])) {
+ html.ro-disable-feed-reel-posts article:not(:has(article)):has(a[href^="/reels/"]:not([href="/reels/"]):not([href^="/reels/audio/"])) {
    display: revert !important;
  }
```

**Yalnız `:not(:has(article))` eklenir; başka hiçbir değişiklik yapılmaz.** G1 bloğunun açıklayıcı yorumları güncellenebilir (fix'in tarihçesi/gerekçesi), ama kuralın mantığı yukarıdaki diff ile sınırlıdır.

### Adım 5.1.c — Doğrulama (uygulama sonrası)

```bash
grep -c ":not(:has(article))" src/content/block.css   # 2 olmalı (default + override)
grep "audio" src/content/block.css                    # audio-filter HÂLÂ mevcut olmalı
grep -c "display: none !important" src/content/block.css    # 5 (değişmedi)
grep -c "display: revert !important" src/content/block.css  # 5 (değişmedi)
```

**Davranış garantisi (4 senaryo) — kontrol et:**

| Senaryo                                             | Beklenen                     |
| --------------------------------------------------- | ---------------------------- |
| Gerçek reel post (leaf article, reel linki var)     | Gizleniyor ✓                 |
| Kapsayıcı article (içinde article'lar + reel linki) | Gizlenmiyor ✓                |
| Müzik etiketli foto post (`/reels/audio/…`)         | Gizlenmiyor ✓ (audio-filter) |
| Sidebar Reels (`a`, article içinde değil)           | A1 ile gizleniyor ✓          |

### Adım 5.1.d — Görsel test (kullanıcı, canlı tarayıcı)

→ **[KONTROL NOKTASI 2]** Kullanıcıdan şu testleri iste, sonucu raporla:

- Tüm toggle'lar ON iken ana sayfayı **uzun süre kaydır** → siyah boşluk YOK, jitter YOK olmalı.
- Gerçek reel post'lar gizli kalmalı.
- Müzik etiketli foto post'lar görünür kalmalı (audio-filter regresyon kontrolü).
- `blockFeedReelPosts` OFF/ON cycle → anında çalışmalı (onChanged sağlam).

Test geçmezse fix'i geri al, KONTROL NOKTASI 1'deki alternatif seçicilere dön, kullanıcıya bildir.

---

## 6. Görev 5.2-5.4 — Karar Görevleri (uygulamadan önce kullanıcıya sun)

Bu üç görev **Kural 27** kapsamındadır: Claude Code analiz yapar, net seçenekler sunar, kullanıcı seçer, sonra uygulanır.

### Görev 5.2 — Cold-read race (yönlendirme toggle'ları)

**Tespit:** `redirect.js` `document_start`'ta `tick()` ve `setInterval`'i storage yüklenmeden çalıştırır. 4 _gizleme_ toggle'ı için race güvenlidir (default = engelleme = en kötü ihtimalle kapatılmış kural ~10ms görünür kalır). Ancak 3 _yönlendirme_ toggle'ı için: kullanıcı `redirectReels`'i kapatmış olsa bile, doğrudan/bookmark ile `instagram.com/reels/`'e girişte, storage gelmeden önceki initial `tick()` `settings=DEFAULTS` (true) ile **yine de yönlendirebilir**. SPA-içi gezinmede sorun yok (storage zaten yüklü). Faz 3 handoff'u tam bu riski öngörüp "storage hazır olana kadar polling'i başlatma" çözümünü önermişti; Faz 4'te uygulanmadı.

→ **[KONTROL NOKTASI 3]** Kullanıcıya seçenekleri sun:

- **(A)** Initial `tick()` ve `setInterval`'i `chrome.storage.local.get` callback'i içine taşı (storage hazır olunca başlat). Davranışı doğrular; korunan mekanikleri bozmaz; küçük ve izole değişiklik.
- **(B)** Mevcut davranışı koru, "kabul edilebilir race" olarak dokümante et (`docs/threat-model.md`'de).
- **(C)** Önce ek inceleme.

Kullanıcı (A)'yı seçerse: değişiklik yalnız başlatma sırasını etkilemeli; loop guard, regex sıralaması, polling parametreleri, `location.replace` **aynen korunur** (Kural 28).

### Görev 5.3 — `DEFAULTS` shared module

**Tespit:** `DEFAULTS` objesi `redirect.js` ve `popup.js`'te ayrı ayrı, birebir aynı tanımlı. Drift riski: yeni toggle eklenirse biri unutulabilir.

→ **[KONTROL NOKTASI 4]** Seçenekler:

- **(A)** `src/shared/defaults.js` modülü; ikisi de import eder. MV3 content script ES module desteği `manifest.json`'da `"type": "module"` gerektirir → manifest değişikliği → ek inceleme + test gerekir.
- **(B)** Mevcut "duplicate-but-verified" pattern'i koru; ekleme prosedürünü `docs/`'a dokümante et.

Not: (A) manifest'e dokunduğu için risk taşır; kullanıcı seçerse dikkatli test edilir.

### Görev 5.4 — `schemaVersion`

**Tespit:** Kılavuz niyeti (Faz 4 guide Bölüm 4) `schemaVersion: 1` yer tutmayı öneriyor; fiili DEFAULTS'ta yok (şablon Bölüm 6.5/6.8 içermiyordu). Tutarsızlık.

→ **[KONTROL NOKTASI 5]** Seçenekler:

- **(A)** `DEFAULTS`'a `schemaVersion: 1` ekle (hem redirect.js hem popup.js), gelecekte yapısal migration'a hazırlık.
- **(B)** Faz 5+ konusu olarak bırak, dokümante et.

Kullanıcı kararı.

---

## 7. Görev 5.5 — ESLint/Prettier Gerçek Kurulum

`.eslintrc.json` ve `.prettierrc.json` mevcut ama kurulu değil (npm hiç çalışmadı). Bu görev:

1. `package.json` oluştur — **yalnız `devDependencies`** (eslint, prettier). Runtime bağımlılığı YOK. `"private": true` ekle (yanlışlıkla publish önlenir).
2. `npm install` (devDependencies).
3. `npx eslint src/` ve `npx prettier --check .` çalıştır.
4. Çıkan uyarıları/format farklarını **dikkatle** değerlendir: otomatik düzeltme (`--fix`, `--write`) çalıştırmadan önce hangi dosyaların etkileneceğini kullanıcıya raporla — çünkü format değişikliği korunan kod bloklarına (loop guard, regex, polling) dokunabilir.

→ **[KONTROL NOKTASI 6]** Lint/format raporunu sun. Otomatik düzeltme öncesi onay al. `node_modules/` ve `package-lock.json`'un `.gitignore`'da olduğunu teyit et (zaten olmalı; değilse kullanıcıya bildir, kapsam genişletme).

**Dikkat:** Web Store reviewer kaynak kodu okur. `package.json` eklenmesi build/bundle adımı **getirmez**; eklenti hâlâ klasörden doğrudan yüklenebilir olmalı. devDependencies yalnız geliştirici makinesinde; eklenti paketine girmez.

---

## 8. Görev 5.6 — `docs/` Dokümantasyonu

`docs/` Faz 0'dan beri boş (`.gitkeep`). İki dosya yazılır:

- **`docs/selectors.md`** — Tüm aktif seçicilerin (A1, A2, D1, G1 + leaf-fix, F1a/b/c, E1) envanteri: ID, seçici, gerekçe, güven seviyesi, son doğrulama tarihi, bilinen kırılganlıklar (IG redesign riski). Mevcut `block.css` ve `redirect.js` yorumlarından + handoff'lardan türetilir. **Yeni iddia uydurma** — yalnız dosyalarda/handoff'larda doğrulanmış bilgiyi yaz (Kural 7).
- **`docs/threat-model.md`** — Privacy/güvenlik duruşu: sıfır veri toplama, sıfır network, minimal izin, CSP, neden `webNavigation`/`tabs`/`scripting` reddedildi, cold-read race kararı (5.2 sonucu buraya), G1 long-term DOM stability riski.

→ **[KONTROL NOKTASI 7]** İki dosya taslağını kullanıcıya sun. Onay sonrası commit.

---

## 9. Görev 5.7 — EN Locale UI Testi

Şimdiye dek yalnız TR test edildi. Kullanıcıdan `chrome://settings/languages` (veya Firefox karşılığı) ile tarayıcı dilini İngilizce yapıp popup'ı açmasını iste:

- 7 toggle etiketi + 2 kategori + başlık/alt başlık İngilizce görünmeli.
- Hiçbir element `__MSG_*__` veya boş olmamalı.

→ Sonucu raporla. Hata bulunursa `_locales/en/messages.json` eksik/yanlış key kontrolü yap (kapsam: yalnız i18n düzeltmesi).

---

## 10. Kontrol Noktası Akışı (Özet)

```
Görev 5.0 → [KN0: State doğrulama] → onay
   ↓
Görev 5.1.a → [KN1: DOM doğrulama] → onay/dallanma
   ↓
Görev 5.1.b-c → 5.1.d → [KN2: Görsel test (G1 fix)] → onay
   ↓
Görev 5.2 → [KN3: cold-read race kararı] → seçim
Görev 5.3 → [KN4: DEFAULTS module kararı] → seçim
Görev 5.4 → [KN5: schemaVersion kararı] → seçim
   ↓
Görev 5.5 → [KN6: lint/format raporu] → onay
   ↓
Görev 5.6 → [KN7: docs taslağı] → onay
   ↓
Görev 5.7 → EN locale test raporu
   ↓
[KN8: Commit planı] → onay → atomic commit'ler → [KN9: Push öncesi onay] → push
```

**Her kontrol noktasında rapor formatı:** (1) yapılan iş özeti (tablo), (2) doğrulama sonuçları (false-positive varsa açıklama — Kural 31), (3) sıradaki adım için açık onay isteği (komut + etki yazılı).

---

## 11. Commit ve Push Disiplini (Kural 29-30)

- **Atomic commit'ler.** Önerilen ayrım: (1) G1 fix (block.css), (2) varsa karar-görevi kod değişiklikleri (her biri ayrı veya mantıksal grup), (3) package.json + lint config, (4) docs. **Kod ile doküman aynı commit'e karıştırılmaz.**
- **Commit mesajı dürüst.** İçeriği yansıtır. "Refactor" deyip doküman ekleme gibi yanıltıcı mesaj **yasak** (geçmiş hata; Kural 25/29).
- **Push yalnız açık onayla.** `git push` öncesi [KN9]; kullanıcı "onaylıyorum" demeden push yok (Kural 30).

---

## 12. Faz 5 Tamamlandı Şartları

| Şart                                                                                                     | Durum |
| -------------------------------------------------------------------------------------------------------- | ----- |
| G1 leaf-only fix: DOM doğrulandı, uygulandı, derin-scroll testi geçti                                    | ☐     |
| G1 audio-filter byte-for-byte korundu                                                                    | ☐     |
| Korunan envanter (Bölüm 3.1) bozulmadı                                                                   | ☐     |
| Cold-read race: karar verildi (uygulandı veya dokümante edildi)                                          | ☐     |
| DEFAULTS module: karar verildi                                                                           | ☐     |
| schemaVersion: karar verildi                                                                             | ☐     |
| `package.json` (yalnız devDependencies, `private:true`), ESLint/Prettier çalışıyor                       | ☐     |
| Eklenti hâlâ klasörden doğrudan yüklenebilir (build adımı yok)                                           | ☐     |
| `docs/selectors.md` + `docs/threat-model.md` yazıldı, doğrulandı                                         | ☐     |
| EN locale UI testi yapıldı                                                                               | ☐     |
| Manifest izinleri değişmedi VEYA yalnız onaylı değişiklik (DEFAULTS module (A) seçildiyse `type:module`) | ☐     |
| Görsel test: eklenti devre dışıyken IG normale dönüyor                                                   | ☐     |
| Konsola eklenti kaynaklı yeni hata düşmüyor                                                              | ☐     |
| Atomic commit'ler atıldı, mesajlar dürüst                                                                | ☐     |
| Push için açık onay alındı                                                                               | ☐     |

---

## 13. Ne YAPMA (Faz 5 sınırları)

- Commit geçmişine/mesajlarına dayanarak state çıkarsama — **dosyayı oku** (Kural 25).
- G1 fix'i DOM doğrulamadan uygulama (Kural 26).
- Karar görevlerini (5.2/5.3/5.4) tek başına uygulama (Kural 27).
- Audio-filter, loop guard, regex sıralaması, polling parametreleri, `location.replace`, default-true policy, `storage.local`'ı bozma (Kural 28).
- Yeni izin ekleme (`webNavigation`/`tabs`/`scripting`/`notifications`/`<all_urls>`) — DEFAULTS module (A) için `type:module` istisnası yalnız kullanıcı onayıyla.
- Mesajlaşma API'si ekleme.
- İkon, versiyon, paketleme, mağaza, CI/CD, test altyapısına dokunma — kapsam dışı.
- `chrome.storage.sync` kullanma.
- Popup'a inline script/handler/external resource ekleme (CSP `script-src 'self'`).
- README "Ne yapar" listesinden madde silme (kapsam daraltırsa kullanıcıya sor).
- Kod + doküman aynı commit'e karıştırma; yanıltıcı commit mesajı yazma.
- Otomatik `eslint --fix` / `prettier --write`'ı onaysız çalıştırma.

---

## 14. Sonraki Faza Hazırlık (Faz 5 sonu, bilgi)

Faz 5 tamamlandığında bir `PHASE5_HANDOFF.md` yazılması beklenir (proje disiplini). Faz 5'ten sonraki muhtemel kapsam (kullanıcı kararıyla numaralandırılır): gerçek ikon tasarımı, versiyon bump, paketleme, mağaza submission (Chrome Web Store + AMO — başvuru gereksinimleri/ücretler başvuru anında resmi dokümandan doğrulanmalı, değişmiş olabilir), repo public yapma, public tanıtım. **Bunların hiçbiri Faz 5'te yapılmaz.**

---

## 15. Bu Belgeyi Okuyan Claude Code'a Son Söz

Faz 5'in iki ayırt edici disiplini var:

1. **Canlı dosya = doğruluk, commit ağacı = değil.** Bu projenin geçmişinde yanıltıcı commit mesajları ve faz-numarası kaymaları kanıtlandı. Durumu daima diskteki dosyayı okuyarak belirle; git geçmişini karar dayanağı yapma.
2. **Önce doğrula, sonra dokun.** Özellikle G1 fix — canlı DOM doğrulanmadan tek karakter değiştirme. Karar görevlerinde kullanıcı seçmeden uygulama yok.

Projenin değişmez ilkesi: **"İyileştirici değil uygulayıcı ol. Belirsizlikte sor. Sapma yaparsan şeffaf raporla. Kapsam dışına çıkma."** Faz 5 bu ilkeye sıkı tutunmalı.
