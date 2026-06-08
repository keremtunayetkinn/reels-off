# Store Listing Materyalleri — Reels Off v1.0.0

> Bu belge mağaza (Chrome Web Store + Firefox Add-ons) submit sırasında textbox'lara
> kopyala-yapıştır referansıdır. Pakete dahil değildir (allowlist dışı).
>
> Tüm metinler `README.md`, `PRIVACY-{TR,EN}.md` ve `_locales/{tr,en}/messages.json`
> kaynaklarından türetilmiştir; yeni iddia yoktur.

---

## 1. Eklenti Metadata

| Alan | Değer |
|---|---|
| Eklenti adı | Reels Off |
| Versiyon | 1.0.0 |
| Varsayılan dil | Türkçe (`tr`) |
| Destek dilleri | Türkçe, İngilizce |
| Önerilen kategori (CWS) | Productivity |
| Önerilen kategori (AMO) | Productivity & Workflow / Privacy & Security |
| Geliştirici iletişim | ktyetkinwork@gmail.com |
| Genel destek/sorun bildirimi | https://github.com/keremtunayetkinn/reels-off (issues) |

---

## 2. Tek-Amaç Beyanı (Single Purpose)

> Chrome Web Store "Single purpose" alanı için zorunlu. AMO'da aynı bilgi
> long description'ın bir paragrafı olarak verilir.

### Türkçe

> Bu eklenti yalnızca tek bir amaca hizmet eder: Instagram web arayüzünde Reels ve algoritmik içerik önerilerini kullanıcının seçimine bağlı olarak gizlemek ya da bu URL'leri ana sayfaya yönlendirmek. Başka hiçbir özellik veya işlev içermez.

### English

> This extension serves a single purpose: hiding Reels and algorithmic content recommendations on Instagram's web interface based on user choice, or redirecting those URLs to the homepage. It includes no other features or functions.

---

## 3. Kısa Açıklama (Short Description)

> Kaynak: `_locales/{tr,en}/messages.json` → `extDescription` (tutarlılık teyitli).
> Mağazalar genellikle kısa karakter limiti uygular; submit anında resmi
> dokümandan limit doğrulanmalı.

### Türkçe

> Instagram web arayüzünde Reels ve algoritmik içerik önerilerini gizleyerek dikkat dağılmasını azaltır. Veri toplamaz.

### English

> Reduces distraction by hiding Reels and algorithmic content suggestions on Instagram's web interface. Collects no data.

---

## 4. Uzun Açıklama (Detailed Description)

### Türkçe

> **Reels Off**, Instagram'ın web arayüzünde Reels ve algoritmik içerik önerilerini gizleyerek odaklanmanı kolaylaştıran, gizlilik odaklı bir tarayıcı eklentisidir.
>
> **Ne yapar**
>
> - Sol kenar çubuğundaki Reels bağlantısını gizler
> - Sol kenar çubuğundaki Keşfet bağlantısını gizler
> - Profil sayfasındaki Reels sekmesini gizler
> - Ana akışa gömülü tekil Reels gönderilerini gizler
> - `/reels/` ve `/reels/<id>/` URL'lerine erişimi engelleyip ana sayfaya yönlendirir
> - `/explore/` URL'lerine erişimi engelleyip ana sayfaya yönlendirir
> - Profilin Reels alt URL'sinden profile geri döner
>
> **Ne yapmaz**
>
> - Hiçbir veri toplamaz, hiçbir analitik göndermez
> - Kullanıcı kimlik bilgilerine erişmez
> - Instagram API'sine bağlanmaz; yalnızca sayfa görünümünü değiştirir
> - Otomatik beğeni, takip veya etkileşim yapmaz
>
> **Kullanıcı kontrolü**
>
> Yedi ayrı seçenek popup'tan tek tıkla açılıp kapatılabilir. Tüm tercihler yalnızca senin cihazında, tarayıcı yerel depolamasında saklanır. Bulutla senkronizasyon yoktur. Eklentiyi kaldırırsan tüm yerel ayarlar otomatik olarak silinir.
>
> **Bilinen sınırlama**
>
> "Ana akıştaki Reels gönderilerini gizle" seçeneği açıkken (varsayılan), ana akışta uzun süreli kaydırma sırasında nadiren boş bir alan ve hafif bir kayma görülebilir. Bunun nedeni Instagram'ın akış render yapısı ile gizleme katmanının etkileşimidir; veri kaybına veya gizlilik sorununa yol açmaz. Geçici çözüm olarak popup'tan ilgili seçenek kapatılabilir.
>
> **Teknik şeffaflık**
>
> Eklenti bağımlısız vanilla JavaScript ile yazılmıştır; harici CDN, analitik veya minify edilmiş paket yoktur. İstek üzerine kaynak kodun tamamı GitHub'da incelenebilir. Lisans: MIT.

### English

> **Reels Off** is a privacy-focused browser extension that helps you stay focused by hiding Reels and algorithmic content suggestions on Instagram's web interface.
>
> **What it does**
>
> - Hides the Reels link in the left sidebar
> - Hides the Explore link in the left sidebar
> - Hides the Reels tab on profile pages
> - Hides individual Reel posts embedded in the main feed
> - Blocks access to `/reels/` and `/reels/<id>/` URLs by redirecting to the homepage
> - Blocks access to `/explore/` URLs by redirecting to the homepage
> - Redirects profile Reels sub-URLs back to the profile page
>
> **What it doesn't do**
>
> - Collects no data, sends no analytics
> - Does not access user credentials
> - Does not connect to Instagram's API; only modifies the page view
> - Does not perform automated likes, follows, or interactions
>
> **User control**
>
> Seven separate options can be toggled on or off from the popup with one click. All preferences are stored exclusively on your device in browser local storage. No cloud sync. When you uninstall the extension, all local settings are automatically deleted.
>
> **Known limitation**
>
> When "Hide Reel posts in main feed" is enabled (default), prolonged scrolling on the main feed may rarely produce a brief empty area and slight jitter. This is due to the interaction between Instagram's feed render structure and the hide layer; it causes no data loss or privacy issue. As a workaround, the corresponding option can be turned off from the popup.
>
> **Technical transparency**
>
> The extension is written in dependency-free vanilla JavaScript; there are no external CDNs, analytics, or minified bundles. The full source code is available on GitHub for inspection. License: MIT.

---

## 5. İzin Gerekçeleri (Permission Justifications)

> Mağazalar her izin için ayrı gerekçe textbox'ı sunar. Net, kısa, dürüst.

### `storage`

**TR:**
> Kullanıcının popup'tan açıp kapattığı engelleme/yönlendirme tercihleri (boolean değerler) yalnızca kullanıcının cihazında, `chrome.storage.local` API'si üzerinden saklanır. Hiçbir veri sunucuya gönderilmez, hiçbir üçüncü tarafla paylaşılmaz.

**EN:**
> The user's hide/redirect preferences (boolean values) toggled from the popup are stored only on the user's device via the `chrome.storage.local` API. No data is sent to any server or shared with any third party.

### Host izni — `https://www.instagram.com/*`

**TR:**
> Eklenti yalnızca Instagram web sayfasında çalışmak üzere tasarlanmıştır. Reels ve önerilen içerikleri gizleyebilmesi ve `/reels/` / `/explore/` URL'lerini yönlendirebilmesi için bu host izni gereklidir. Eklenti başka hiçbir siteye erişmez.

**EN:**
> The extension is designed to operate only on Instagram's website. This host permission is required so the extension can hide Reels and recommended content, and redirect `/reels/` and `/explore/` URLs. The extension does not access any other website.

### Diğer izinler

> Eklenti başka hiçbir izin (örn. `tabs`, `webNavigation`, `scripting`, `activeTab`, `cookies`, `<all_urls>`) **kullanmaz**. Mağaza reviewer'ı için manifest'ten teyit edilebilir.

---

## 6. Veri Toplama Beyanı (Data Use)

### CWS "Data usage" / AMO "Data collection"

| Soru | Cevap |
|---|---|
| Kişisel bilgi toplar mı? | Hayır |
| Sağlık bilgisi toplar mı? | Hayır |
| Finansal bilgi toplar mı? | Hayır |
| Kimlik doğrulama bilgisi (şifre/jeton) toplar mı? | Hayır |
| Kişisel iletişim toplar mı? | Hayır |
| Konum verisi toplar mı? | Hayır |
| Web tarama geçmişi toplar mı? | Hayır |
| Kullanıcı etkinliği (tıklama/scroll) toplar mı? | Hayır |
| Web içeriği (sayfa içeriği) toplar mı? | Hayır |
| Üçüncü taraflara veri satar/transfer eder mi? | Hayır |
| Reklam amaçlı veri kullanır mı? | Hayır |
| Verileri belirtilen amaç dışında kullanır mı? | Hayır |

Tek saklanan veri: kullanıcının tercih ettiği toggle durumları (boolean), `chrome.storage.local`'da yalnızca cihazda.

---

## 7. Gizlilik Politikası URL'si

**Kullanıcı aksiyonu gerekli — Claude Code yapamaz (Kural 34).**

Mağazalar yayınlanmış (HTTPS) bir gizlilik politikası URL'si ister. Şu an mevcut:

- Repo'da: `PRIVACY-TR.md` ve `PRIVACY-EN.md` (yerel)

İhtiyaç: Bu dosyaların **public erişilebilir HTTPS URL'leri**. Üç olası yol:

1. **GitHub repo public yapıldıktan sonra raw URL:**
   - `https://raw.githubusercontent.com/keremtunayetkinn/reels-off/main/PRIVACY-EN.md`
   - `https://raw.githubusercontent.com/keremtunayetkinn/reels-off/main/PRIVACY-TR.md`
2. **GitHub Pages** (görsel olarak daha temiz):
   - `https://keremtunayetkinn.github.io/reels-off/privacy-en`
3. **Ayrı statik host** (örn. kişisel site).

**Karar tek başına senin:** repo public yapma ve gizlilik politikası hosting'i Kural 34 kapsamında kullanıcı aksiyonudur.

---

## 8. Görsel Listesi (Hatırlatma)

> Boyut/adet sabit sayı vermiyorum (Kural 35) — başvuru anında CWS ve AMO resmi
> dokümanından doğrula.

Hazırlanan/hazırlanacak:

- [x] Popup ekran görüntüsü — `Ekran görüntüsü 2026-06-07 180033.png` (HIDE/REDIRECT toggle'lar görünür, English UI)
- [x] `/reels/` redirect demosu — `Ekran görüntüsü 2026-06-07 181002.png`
- [x] `/explore/` redirect demosu — `Ekran görüntüsü 2026-06-07 181233.png`
- [ ] (Opsiyonel) İkonun büyük render'ı (mağaza tile/promo)
- [ ] (Opsiyonel) "Öncesi vs. sonrası" karşılaştırma görseli

Görsel çekimi ve mağazaya yükleme **kullanıcı aksiyonudur** (Kural 34).

---

## 9. Hızlı Submit Checklist

- [ ] CWS geliştirici hesabı açıldı (ödeme + ToS — kullanıcı aksiyonu)
- [ ] AMO geliştirici hesabı açıldı (kullanıcı aksiyonu)
- [ ] Privacy policy URL'leri canlı (repo public + raw/Pages)
- [ ] `dist/reels-off-chrome-1.0.0.zip` CWS'e yüklendi
- [ ] `dist/reels-off-firefox-1.0.0.zip` AMO'ya yüklendi
- [ ] Single purpose alanı dolduruldu (TR/EN — bu belgenin §2)
- [ ] Permission justifications dolduruldu (§5)
- [ ] Short description dolduruldu (§3)
- [ ] Long description dolduruldu (§4)
- [ ] Data usage soruları işaretlendi (§6)
- [ ] Görseller yüklendi (§8)
- [ ] Reviewer notu (varsa): "Vanilla JS, bundler yok, kaynak GitHub'da public — minify/obfuscation yok"

Submit sonrası reviewer feedback'i — kullanıcı yürütür.
