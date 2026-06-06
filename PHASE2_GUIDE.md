# Faz 2 Implementation Guide — Claude Code İçin

> **Bu dosya Claude Code'a verilmek üzere hazırlanmıştır.** Eklentinin Faz 2 aşamasını (Content Script CSS Injection — Reels engelleme CSS'i) doğru, eksiksiz ve Faz 1'deki kararlarla **çelişmeden** tamamlamak için kullanılır.
>
> **Kaynak otorite hiyerarşisi:** Bu kılavuz > MV3/WebExtensions resmi dokümantasyonu > `PHASE1_HANDOFF.md`. **İstisna:** Bu kılavuzla MV3 spesifikasyonu çatışırsa MV3 üstündür — bu durumda DUR, sapmayı kullanıcıya bildir, onay al, sonra `PHASE1_HANDOFF.md` Bölüm 7'deki gibi şeffaf raporla. (Faz 1'de `_locales/` konusunda tam böyle bir sapma yaşandı; aşağıda Bölüm 1.2'ye bak.)

---

## 0. Bu Dokümanı Nasıl Kullanmalısın

1. Önce **Bölüm 1**'i (Faz 1'den Devralınan Durum) oku — özellikle Bölüm 1.2'deki `_locales/` sapması Faz 2'yi de etkileyebilir.
2. **Bölüm 2**'deki kapsam sınırlarını içselleştir. Faz 2 kasıtlı olarak dar: yalnızca CSS, yalnızca 3 hedef.
3. Görevleri (Bölüm 5) **sıralı** yap. Her görev sonrası doğrulama yap.
4. **G1 hedefi özel dikkat ister** (Bölüm 8). Container yapısı Faz 0'da tam doğrulanmadı — doğrulamadan aktive etme.
5. Şüphede kal, varsayma — Bölüm 11, Kural 7.
6. Faz 2 kapsamı dışına çıkma. redirect.js, popup, toggle, permission = Faz 2 DEĞİL.

---

## 1. Faz 1'den Devralınan Durum (Kritik)

### 1.1 — Repo State (PHASE1_HANDOFF.md ile doğrulandı)

```
Branch:        main (origin/main ile tracking)
Remote:        https://github.com/keremtunayetkinn/reels-off.git (private)
Commit sayısı: 3 (HEAD = 8c95378)
Working tree:  clean
```

**Faz 1'de oluşturulan ve Faz 2'de DOKUNULMAYACAK dosyalar:**
`manifest.json`, `LICENSE`, `README.md`, `PRIVACY-TR.md`, `PRIVACY-EN.md`, `.gitignore`, `.eslintrc.json`, `.prettierrc.json`, `_locales/tr/messages.json`, `_locales/en/messages.json`, ikonlar.

**Faz 2'nin DOKUNACAĞI tek dosya:** `src/content/block.css` (şu an sadece `/* Faz 2-4'te doldurulacak */` yorumu içeriyor).

### 1.2 — ⚠️ Faz 1 Sapması: `_locales/` kök seviyede (src/ altında DEĞİL)

Faz 1 kılavuzu yanlışlıkla `src/_locales/` demişti. Chrome MV3 `_locales/` klasörünü **eklenti köküne sabit kodlamıştır**; başka yere konamaz. Bu yüzden Faz 1'de `_locales/` köke taşındı (commit `8c95378`).

**Faz 2 için sonuç:** Faz 2 yeni bir locale string'i **gerektirmez** (saf CSS, kullanıcıya gösterilen yeni metin yok). Yani `_locales/`'e dokunmayacaksın. Ama ileride dokunman gerekirse doğru yol kökte `_locales/tr/messages.json`'dır, `src/_locales/` DEĞİL.

### 1.3 — Mevcut manifest content_scripts bloğu (DEĞİŞTİRME)

Manifest zaten şunu içeriyor (Faz 2'de **olduğu gibi kalacak**):

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

- `css: ["src/content/block.css"]` → Faz 2'de dolduracağın dosyaya zaten işaret ediyor. **Manifest'i değiştirmene gerek YOK.**
- `js: ["src/content/redirect.js"]` → boş placeholder. **Faz 2'de buna dokunma** (Faz 3 işi).
- `run_at: "document_start"` → CSS enjeksiyonu için ideal. content_scripts'in `css` array'i tarayıcı tarafından erkenden enjekte edilir, bu da flicker'ı önler. **Değiştirme.**

---

## 2. Faz 2 Kapsamı ve Sınırları

### 2.1 — Faz 2'de YAPILACAK

`src/content/block.css` dosyasına **href-first CSS seçicileri** yazarak şu 3 hedefi gizlemek:

| ID  | Element                              | Güven                            |
| --- | ------------------------------------ | -------------------------------- |
| A1  | Sol kenar çubuğu Reels linki         | Yüksek (Faz 0 doğruladı)         |
| D1  | Profil sayfası Reels sekmesi         | Yüksek (Faz 0 doğruladı)         |
| G1  | Feed'e gömülü tekil Reel gönderileri | **Doğrulanmadı** — Bölüm 8'e bak |

Tüm kurallar "her zaman aktif" olacak. Kullanıcı açma/kapama toggle'ları Faz 5'te eklenecek (popup + storage gerektirir).

### 2.2 — Faz 2'de YAPILMAYACAK (önemli sınırlar)

| Yapma                                          | Sebep                                                                                                |
| ---------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| ❌ A2 (Explore/Keşfet) gizleme                 | **README'de yok.** Committed kapsam dışı. Eklemek README güncellemesi + kullanıcı kararı gerektirir. |
| ❌ `redirect.js`'i doldurma                    | URL redirect (F1) JS işi = Faz 3.                                                                    |
| ❌ Popup UI veya toggle yazma                  | Faz 5.                                                                                               |
| ❌ `chrome.storage` kullanma                   | Faz 5.                                                                                               |
| ❌ Yeni `permissions` ekleme                   | CSS enjeksiyonu mevcut izinlerle çalışır.                                                            |
| ❌ `manifest.json`'ı değiştirme                | block.css yolu zaten doğru.                                                                          |
| ❌ `_locales/`'e string ekleme                 | Saf CSS, yeni metin yok.                                                                             |
| ❌ MutationObserver / JS DOM manipülasyonu     | CSS kuralları SPA'da otomatik kalıcı — JS gerekmez.                                                  |
| ❌ Class-name tabanlı seçici (`.x1qjc9v5` vb.) | Obfuscated, sık değişir. Sadece href/öznitelik seçicileri.                                           |

---

## 3. Mimari Kararlar (Faz 1'den Miras + Faz 2'ye Özel)

| Karar                                      | Gerekçe                                                                                                                       |
| ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| **href-first seçici**                      | Instagram class isimleri obfuscated (`x1qjc9v5`, `_aaa1`); href routing kararlı.                                              |
| **CSS-only, JS yok**                       | JS = saldırı yüzeyi. Saf CSS, XSS riski sıfır, SPA navigasyonunda otomatik kalıcı.                                            |
| **`display: none !important`**             | Instagram kendi stillerini inline veya yüksek-özgüllükle uygular; `!important` gerekli.                                       |
| **Section'lı, yorumlu CSS**                | Faz 5'te toggle refactor'u kolaylaşsın diye her hedef ayrı bölümde, açıklamalı.                                               |
| **`:has()` izinli ama dar**                | Hedef tarayıcılar (Chrome MV3, Firefox 140+) destekliyor (Baseline 2023). Performans için anchor mümkün olduğunca dar olmalı. |
| **`@import`, `url()`, inline style YASAK** | CSP sıkı; CSS dosyası içinde external kaynak çağırma.                                                                         |

---

## 4. Hedef Seçiciler ve Güven Durumu

Bu seçiciler Faz 0 saha araştırmasından gelir. **Önemli uyarı:** Faz 0 mapping'i birkaç hafta öncesine ait ve Instagram aktif redesign sürecinde (Faz 1 öncesi araştırmalarda doğrulandı). Bu yüzden Bölüm 9'daki görsel test ZORUNLU — seçiciler canlı Instagram'da hâlâ çalışıyor mu, kullanıcı doğrulayacak.

### A1 — Sidebar Reels linki

- **Seçici:** `a[href="/reels/"]`
- **Mantık:** Tam eşleme. Sidebar'daki Reels linki tam olarak `/reels/` href'ine sahip. Feed'deki reel post'ları `/reels/<id>/` formatında olduğu için tam eşleme onları HARİÇ tutar.
- **Güven:** Yüksek.

### D1 — Profil Reels sekmesi

- **Seçici:** `main a[href$="/reels/"]:not([href="/reels/"])`
- **Mantık:** `main` içinde, href'i `/reels/` ile BİTEN (yani `/<username>/reels/`), ama tam `/reels/` OLMAYAN link. Bu profil tab bar'ındaki Reels sekmesini yakalar, sidebar linkini değil.
- **Not:** Faz 0'da profil tab'larının `role="link"` (NOT `role="tab"`) + `aria-selected` hibrit yapı kullandığı doğrulandı. Bu yüzden `[role="tab"]` ile değil, href suffix ile hedefliyoruz.
- **Güven:** Yüksek.

### G1 — Feed'e gömülü tekil Reel gönderileri

- **Aday seçici:** `article:has(a[href^="/reels/"]:not([href="/reels/"]))`
- **Mantık:** Feed'de `/reels/<id>/` linkine sahip post container'ını gizle. Sadece linki gizlemek yetmez — post'un thumbnail/caption kısmı açık kalır; tüm container'ı gizlemek gerekir.
- **SORUN:** Faz 0'da feed reel post'unun container'ının `<article>` olup olmadığı **doğrulanmadı**. Ajan "8 dağıtık reel linki" buldu ama post-seviyesi container'ı haritalamadı. **Bu yüzden G1, Bölüm 8'deki doğrulama tamamlanana kadar block.css'te YORUM olarak kalacak.**
- **Güven:** Düşük (container doğrulanmadı).

---

## 5. Görev Listesi

### Görev 5.1 — Mevcut state'i doğrula

Repo'ya girdiğinde önce Faz 1 state'inin bozulmadığını teyit et (Bölüm 10'daki komutlar). Özellikle:

- `git status` clean mi?
- `src/content/block.css` hâlâ placeholder mı?
- `manifest.json` content_scripts.css `src/content/block.css`'e mi işaret ediyor?

Bir tutarsızlık görürsen DUR, kullanıcıya bildir.

### Görev 5.2 — A1 + D1 kurallarını yaz (confident core)

`src/content/block.css` dosyasını Bölüm 6'daki şablonla doldur. **A1 ve D1 bloklarını aktif, G1 bloğunu YORUMDA bırak.**

### Görev 5.3 — G1 doğrulamasını başlat

G1'in container yapısı doğrulanmadan aktive edilemez. Bölüm 8'deki prosedürü kullanıcıya sun. Bu doğrulama:

- Ya bir tarayıcı-ajan oturumu (Faz 0'daki gibi) ile,
- Ya da kullanıcının DevTools ile manuel incelemesiyle yapılır.

**Sen (Claude Code) Instagram'a erişemezsin.** Bu yüzden G1 doğrulamasını sen yapamazsın — kullanıcıya prosedürü ver, sonucu bekle. Sonuç gelince G1 bloğunu sonuca göre kesinleştir (Bölüm 8.3).

### Görev 5.4 — Görsel test (kullanıcı yapar)

A1 + D1 yazıldıktan sonra kullanıcı eklentiyi yükleyip Bölüm 9'daki görsel test checklist'ini uygular. Test geçmeden commit etme.

### Görev 5.5 — Commit

Tüm testler geçince:

```bash
git add src/content/block.css
git commit -m "Phase 2: CSS injection for Reels blocking (A1 sidebar, D1 profile tab)"
```

G1 henüz aktive edilmediyse commit mesajında belirt: `(G1 feed posts pending DOM verification)`.

**Push'tan önce kullanıcı onayı bekle** (PHASE1_HANDOFF: kullanıcı geri-alınması zor aksiyonlardan önce açık onay ister).

---

## 6. `src/content/block.css` Şablonu

Aşağıdaki içeriği **birebir** kullan. A1 ve D1 aktif; G1 yorumda (Bölüm 8 doğrulaması sonrası açılacak).

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
 *   D1 — Profil Reels sekmesi        [aktif]
 *   G1 — Feed tekil Reel gönderileri [doğrulama bekliyor — Bölüm 8]
 * Kapsam DIŞI: A2 (Explore) — README'de yer almıyor.
 */

/* ---------------------------------------------------------------------------
 * A1 — Sol kenar çubuğu Reels linki
 * Seçici mantığı: tam eşleme href="/reels/" yalnızca sidebar linkini yakalar.
 *   Feed reel post'ları /reels/<id>/ formatında olduğundan hariç kalır.
 * Güven: Yüksek (Faz 0)
 * ------------------------------------------------------------------------- */
a[href='/reels/'] {
  display: none !important;
}

/* ---------------------------------------------------------------------------
 * D1 — Profil sayfası Reels sekmesi
 * Seçici mantığı: main içinde /<username>/reels/ ile biten link;
 *   tam /reels/ (sidebar) hariç tutulur.
 * Not: Profil tab'ları role="link" + aria-selected hibrit yapı kullanır
 *   (role="tab" DEĞİL), bu yüzden href suffix ile hedefleniyor.
 * Güven: Yüksek (Faz 0)
 * ------------------------------------------------------------------------- */
main a[href$='/reels/']:not([href='/reels/']) {
  display: none !important;
}

/* ---------------------------------------------------------------------------
 * G1 — Feed'e gömülü tekil Reel gönderileri
 * DURUM: Container yapısı Faz 0'da DOĞRULANMADI. Aşağıdaki kural
 *   Bölüm 8'deki doğrulama tamamlanana kadar YORUMDA kalır.
 *   Doğrulama sonucu container <article> ise yorum kaldırılır;
 *   farklı bir container çıkarsa seçici güncellenir.
 * Performans notu: :has() anchor'ı (article) mümkün olduğunca dar olmalı.
 * Güven: Düşük (doğrulama bekliyor)
 * ------------------------------------------------------------------------- */
/*
article:has(a[href^="/reels/"]:not([href="/reels/"])) {
  display: none !important;
}
*/
```

---

## 7. Sıkı Kısıtlamalar (DO NOT)

### Kategori: Kapsam

- ❌ A2 (Explore/Keşfet) kuralı ekleme — README'de yok.
- ❌ G1'i doğrulamadan aktive etme (yorumdan çıkarma).
- ❌ `redirect.js`, `popup.*`, `_locales/*`, `manifest.json` dosyalarına dokunma.

### Kategori: Seçici

- ❌ Class-name seçici (`.x1qjc9v5`, `._aaa1`, herhangi bir obfuscated class). Sadece href / öznitelik / role.
- ❌ `nav` veya `[role="navigation"]` seçici — Faz 0'da Instagram'da bu landmark'ın OLMADIĞI doğrulandı.
- ❌ Geniş anchor'lı `:has()` (`*:has()`, `div:has()` gibi performans katili). Anchor dar olmalı.
- ❌ Nested `:has()` (`:has()` içinde `:has()`) — desteklenmiyor.

### Kategori: CSS hijyen

- ❌ `@import url(...)` — CSP'ye takılır + external kaynak.
- ❌ CSS içinde `url()` ile external resource.
- ❌ Inline style enjeksiyonu (JS ile `style.cssText` vb.) — Faz 2 saf CSS dosyası.
- ❌ `!important` olmadan kural yazma — Instagram stilleri ezmek için gerekli.

### Kategori: Genel

- ❌ JavaScript yazma (Faz 2 saf CSS; redirect.js Faz 3).
- ❌ Yeni dosya oluşturma (sadece mevcut block.css doldurulacak).
- ❌ Test dosyası, CI, build pipeline.

---

## 8. G1 Doğrulama Prosedürü (Özel Bölüm)

G1 (feed reel post'ları) için container yapısı bilinmiyor. Aktive etmeden önce doğrulanmalı.

### 8.1 — Doğrulama yöntemi seçimi

İki seçenek var, kullanıcıya sun:

- **Seçenek A — Tarayıcı-ajan oturumu:** Faz 0'daki gibi bir Claude in Chrome oturumu. Daha sistematik.
- **Seçenek B — Manuel DevTools:** Kullanıcı kendi tarayıcısında inceler. Daha hızlı.

### 8.2 — Doğrulama soruları (her iki yöntemde de cevaplanacak)

Instagram ana feed'inde bir reel post'u bulunup şunlar tespit edilmeli:

1. Feed'deki bir reel post linkinin (`/reels/<id>/`) en yakın anlamlı container'ı hangi tag? (`<article>`, `<div>`, başka?)
2. Bu container, **tek bir post'u mu** kapsıyor yoksa birden fazla post'u mu? (Tüm feed'i gizlememek için container post-seviyesi olmalı.)
3. Aynı container, normal (reel olmayan) post'lar için de kullanılıyor mu? (Eğer feed'deki TÜM post'lar `<article>` ise, `article:has(reel-link)` sadece reel içerenleri gizler — bu doğru davranış.)
4. Test seçicisi Console'da çalışıyor mu (kişisel veri raporlamadan):
   ```javascript
   document.querySelectorAll('article:has(a[href^="/reels/"]:not([href="/reels/"]))').length;
   document.querySelectorAll('article').length;
   ```
   İlki, reel içeren post sayısını; ikincisi toplam post sayısını verir. İlki ≤ ikinci olmalı ve feed'de reel varsa 0'dan büyük olmalı.

### 8.3 — Sonuca göre G1'i kesinleştir

- **Container `<article>` ise:** block.css'teki G1 yorumunu kaldır, olduğu gibi aktive et.
- **Container farklı bir tag ise (örn. `<div>` belirli bir öznitelikle):** Seçiciyi o tag'e göre güncelle, ama anchor'ı dar tut (performans). Geniş `div:has()` kullanman gerekiyorsa kullanıcıyı performans riski konusunda uyar.
- **Container post-seviyesi değilse (tek container çok fazla post kapsıyor):** G1'i bu fazda aktive ETME, kullanıcıyla daha derin bir mapping planla. Yanlış container gizlemek tüm feed'i silebilir.

### 8.4 — G1 görsel doğrulaması

G1 aktive edildikten sonra Bölüm 9'daki feed testini özellikle dikkatli yap: reel post'lar gidiyor mu, **normal post'lar duruyor mu?**

---

## 9. Görsel Test Checklist (Kullanıcı Tarayıcıda Yapar)

Eklentiyi `chrome://extensions/` → "Paketlenmemiş öğe yükle" ile yükledikten sonra:

### A1 — Sidebar Reels linki

- [ ] `instagram.com` ana sayfada sol kenar çubuğunda **Reels linki kayboldu**.
- [ ] Diğer sidebar linkleri sağlam: Ana Sayfa, Ara, Keşfet, Mesajlar, Bildirimler, Profil.
- [ ] Sidebar layout'u bozulmadı (boşluk/kayma yok).

### D1 — Profil Reels sekmesi

- [ ] Kendi profiline git: Reels sekmesi **kayboldu**.
- [ ] Diğer sekmeler sağlam: Gönderiler, Kaydedilenler, Etiketlenenler.
- [ ] Tab bar layout'u bozulmadı.
- [ ] **Başka bir profilde de** test et (örn. `/instagram/`): Reels sekmesi orada da gizli mi?

### G1 — Feed reel post'ları (yalnızca aktive edildiyse)

- [ ] Ana feed'de reel gönderileri **görünmüyor**.
- [ ] Normal fotoğraf/video gönderileri **görünüyor** (yanlışlıkla gizlenmedi).
- [ ] Feed scroll'u çalışıyor, boş ekran/donma yok.

### Genel sağlık

- [ ] Hiçbir sayfa tamamen boş/beyaz değil.
- [ ] DM, Story, arama, profil — hepsi normal çalışıyor.
- [ ] Eklentiyi **devre dışı bırakınca** her şey eski haline dönüyor (gizlenenler geri geliyor).
- [ ] Konsola eklentiden kaynaklı hata düşmüyor.

Bir madde geçmezse: hangi seçicinin sorun çıkardığını izole et, kullanıcıya bildir, düzelt.

---

## 10. Doğrulama Komutları

```bash
# 1. Faz 1 dosyaları korundu mu? (block.css dışında değişiklik OLMAMALI)
git status --short
# Sadece src/content/block.css değişmiş görünmeli

# 2. block.css class-name seçici içeriyor mu? (obfuscated class YASAK)
grep -E '\.(x[0-9a-z]{6,}|_[a-z]{3,})' src/content/block.css && echo "✗ HATA: class-name seçici" || echo "✓ Class-name seçici yok"

# 3. !important her display kuralında var mı?
grep -c "display: none !important" src/content/block.css
# Aktif kural sayısıyla eşleşmeli (A1+D1 = 2; G1 aktifse 3)

# 4. Yasaklı CSS yapıları var mı?
grep -E "@import|url\(" src/content/block.css && echo "✗ HATA: import/url" || echo "✓ Temiz"

# 5. manifest.json değişmedi mi?
git diff manifest.json
# Çıktı BOŞ olmalı

# 6. redirect.js hâlâ placeholder mı?
cat src/content/redirect.js
# "// Faz 2'de doldurulacak" olmalı (DEĞİŞMEMİŞ)

# 7. _locales dokunulmadı mı?
git diff _locales/
# Çıktı BOŞ olmalı
```

---

## 11. Halüsinasyon Önleme Kuralları

`PHASE1_HANDOFF.md` Bölüm 2'deki 8 kural Faz 2'de de geçerli. Faz 2'ye özel vurgular:

1. **Verbatim şablon:** Bölüm 6'daki block.css'i harfiyen kullan. A1 ve D1 seçicilerini "iyileştirme" — Faz 0'da doğrulandılar.
2. **Placeholder/belirsizlik açık:** G1 doğrulanmadı; yorumda bırak, doğrulanmadan aktive etme.
3. **Bilmediğin seçici uydurma:** Faz 0'da haritalanmamış bir element için "muhtemelen şu seçici" yazma. Sadece A1, D1 (doğrulanmış) ve G1 (doğrulanacak).
4. **Sürüm/destek iddiası → kaynak:** `:has()` desteği için: Chrome 105+, Firefox 121+ (biz Firefox 140+ hedefliyoruz, güvenli). Bu doğrulanmıştır.
5. **Generic CSS'ten kaçın:** İnternetteki "Instagram Reels blocker" CSS snippet'lerini kopyalama — çoğu obfuscated class kullanır, bir hafta sonra kırılır. Sadece bu kılavuzun href-first seçicileri.
6. **Faz sınırı:** redirect.js, popup, toggle, storage = Faz 2 DEĞİL. Dokunma.
7. **Şüphede sor:** G1 container'ı, seçici davranışı, layout kırılması — emin değilsen kullanıcıya sor.
8. **Çıktı raporu:** Faz sonunda: hangi kurallar aktif, G1 durumu, hangi testler geçti, push yapıldı mı.

### Faz 2'ye özel ek kural — Canlı doğrulama zorunluluğu

Instagram aktif redesign sürecinde. Faz 0 mapping'i birkaç hafta önce. **Sen Instagram'a erişemediğin için seçicilerin hâlâ çalıştığını garanti EDEMEZSİN.** Bu yüzden:

- A1, D1 seçicilerini yaz, ama "Faz 0'da doğrulandı, ancak canlı test kullanıcıda" notunu düş.
- Görsel test (Bölüm 9) geçmeden "tamamlandı" deme.
- Test başarısızsa, seçici Instagram güncellemesiyle kırılmış olabilir — kullanıcıyla yeni bir DOM doğrulama oturumu planla.

---

## 12. Faz 2 Tamamlandı Şartları

Aşağıdaki tüm maddeler ✓ olmadan Faz 2 tamamlanmış sayılmaz:

- [ ] `src/content/block.css` Bölüm 6 şablonuyla dolduruldu
- [ ] A1 ve D1 kuralları aktif, doğru href-first seçiciler kullanıldı
- [ ] G1 ya doğrulanıp aktive edildi, ya da doğrulama beklediği için yorumda bırakıldı (durum net raporlandı)
- [ ] Hiçbir class-name (obfuscated) seçici yok
- [ ] Tüm aktif kurallar `display: none !important` kullanıyor
- [ ] `@import`, `url()`, inline style yok
- [ ] `manifest.json`, `redirect.js`, `_locales/`, popup dosyaları DEĞİŞMEDİ
- [ ] Görsel test (Bölüm 9) kullanıcı tarafından yapıldı ve geçti
- [ ] Eklenti devre dışı bırakılınca Instagram normale dönüyor (geri-alınabilirlik)
- [ ] Konsola eklenti kaynaklı hata düşmüyor
- [ ] Commit atıldı; push için kullanıcı onayı alındı

---

## 13. Faz 3'e Hazırlık (Önizleme — İmplement ETME)

Faz 2 bittiğinde sıradaki faz **Faz 3: URL Redirect (JavaScript)** olacak. Faz 3'te `src/content/redirect.js` doldurulacak:

- `/reels/` ve `/reels/<id>/` URL'lerini yakalayıp `/`'a yönlendirme (F1)
- Polling-based URL değişikliği tespiti (Instagram SPA; `history.pushState` content script'ten patch'lenemez — izole world)
- Profil Reels feed'i (`/<username>/reels/`) için ayrı path matcher

**Bunların HİÇBİRİNİ Faz 2'de yapma.** Faz 3 kılavuzu ayrıca gelecek. Bu bölüm sadece bağlam içindir, görev değil (Kural 6).

---

## Son Not

Faz 2 kasıtlı olarak dar ve düşük riskli: saf CSS, 3 hedef, 2'si yüksek güvenli. En büyük belirsizlik G1 — onu doğrulamadan aktive etmek tüm feed'i gizleme riski taşır, bu yüzden "doğrula-sonra-aktive et" disiplinine sıkı uy. Bir şey net değilse kullanıcıya sor. Faz 2 tamamlandığında kullanıcı Faz 3 kılavuzunu verecek.
