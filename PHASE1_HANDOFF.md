# Faz 1 Tamamlama Raporu — Sonraki Ajan Devretme Belgesi

> **Bu belgenin amacı:** Faz 1 tamamlanmış halde, projeyi henüz görmemiş bir AI ajanına projeyi devretmek. Belge sayesinde yeni ajan; (a) projenin felsefesini, (b) Faz 1'de neyin nasıl yapıldığını, (c) Faz 2'ye geçerken nelere dikkat etmesi gerektiğini sıfırdan anlayabilmeli.
>
> **Kaynak otorite hiyerarşisi:** `PHASE1_GUIDE.md` (kullanıcının yazdığı kılavuz) > MV3/WebExtensions resmi dokümantasyonu > bu rapor. **İstisna:** Kılavuzla MV3 spesifikasyonu çatışırsa MV3 üstündür (örneği aşağıda Bölüm 7).

---

## 1. Proje Kimliği

| Alan | Değer |
|---|---|
| Proje adı | **Reels Off** (TR ve EN aynı) |
| Tür | Chrome + Firefox MV3 tarayıcı eklentisi |
| Tek amaç (Web Store gereği) | "Instagram web arayüzünde Reels ve algoritmik içerik önerilerini gizleyerek kullanıcının dikkat dağıtıcı içeriklere maruz kalmasını azaltır." |
| Sahibi | Kerem Tuna |
| Telif yılı | 2026 |
| Hedef mağazalar | Chrome Web Store + Mozilla Add-ons (AMO) |
| Diller | Türkçe (varsayılan), İngilizce (fallback) |
| Mevcut faz | **Faz 1 tamamlandı**; sıradaki Faz 2 (Content Script CSS Injection) |

### Teknik kararlar (non-negotiable)

| Karar | Sebep |
|---|---|
| Vanilla JavaScript | React/Vue/jQuery yok. Bağımlılık = saldırı yüzeyi |
| Bundler yok | Web Store reviewer kaynak kodu okur — minify yasak |
| `package.json` opsiyonel | Eklenirse sadece `devDependencies` (ESLint/Prettier) |
| CSS-first engelleme | Faz 2-4'te Instagram class isimleri yerine href-first seçici |
| `chrome.storage.local` | sync **değil** — Google sunucularına veri gitmez |
| CSP sıkı | `script-src 'self'; object-src 'none'; base-uri 'none';` |
| `host_permissions` tek entry | Sadece `https://www.instagram.com/*` — `<all_urls>` yasak |
| `permissions` boş başlar | İhtiyaç çıktıkça eklenir |
| Build adımı yok | Klasör doğrudan yüklenebilir |
| Telemetri / analitik | **Hiç** — hiçbir network çağrısı |

---

## 2. Çalışma Felsefesi (Ajan İçin En Önemli Bölüm)

`PHASE1_GUIDE.md` (Bölüm 9 — Halüsinasyon Önleme Kuralları) bu projedeki **tüm** ajan davranışını yönetir. Faz 2-13 için de geçerli olduğunu varsay:

1. **Kural 1 — Verbatim şablon kullanımı:** Kılavuzdaki şablonları harfiyen kopyala. Tek satır ekleme, "iyileştirme" yapma.
2. **Kural 2 — Placeholder'ları açık bırak:** Bilmediğin bir alanı asla doldurma; `[KULLANICI_X]` ile bırak ve sor.
3. **Kural 3 — Bilmediğin MV3 alanı ekleme:** Kılavuzda olmayan bir manifest alanı eklemek istiyorsan **DUR**, sor. Anthropic eğitim verisi MV3 için eski olabilir.
4. **Kural 4 — Sürüm bilgilerini sorgula:** Firefox/Chrome sürüm numarası verirken kaynak alıntıla.
5. **Kural 5 — Generic policy'den uzak dur:** Privacy policy minimal olacak; "ekleyelim" deme.
6. **Kural 6 — Faz sınırına saygı:** Faz N kılavuzu sadece Faz N içindir. Faz N+1'in dosyalarını proaktif olarak doldurma.
7. **Kural 7 — Şüphede sor:** Eksik/çelişkili/belirsiz hiçbir şeyi varsayma; kullanıcıya net soru sor.
8. **Kural 8 — Çıktı raporu ver:** Faz sonunda hangi dosyalar oluştu / hangi testler geçti / hangi placeholder'lar kaldı raporla.

### Kullanıcı bağlamı (operasyonel)

- Kullanıcı Türkçe konuşur; sorularını Türkçe yapılandırılmış olarak (örn. `AskUserQuestion`) sormak verimli.
- Kullanıcı, bilgisi olmayan kararlar için **kesinlikle sorulmasını** ister (önceden bir kez ad/açıklama/email konularında sorulan toplu soru memnuniyetle kabul gördü).
- Kullanıcı geri alınması zor aksiyonlardan (push, force-push, mağaza yükleme) önce **açık onay** bekler.
- Kullanıcı kılavuz dışına çıkmadığın sürece bu felsefeyi sürdürmen yeterli; ekstra "doğrulama" sorularına ihtiyaç yok — kılavuzdaki şart açık, uygula.

---

## 3. Repo Durumu (Faz 1 Sonu, Doğrulanmış)

```
Yerel dizin:  C:\Users\User\Desktop\İnstagram Chrome Plugin\
Branch:       main (origin/main ile tracking)
Remote:       origin = https://github.com/keremtunayetkinn/reels-off.git
Visibility:   Private (GitHub)
Working tree: clean (bu rapor commit edilmeden önceki durumu kasteder)
Toplam commit: 3
```

### Commit zinciri (eski → yeni)

| Hash | Mesaj | Kapsam |
|---|---|---|
| `a63ed55` | Initial scaffold: Phase 1 (project skeleton + manifest + legal docs) | 20 dosya, 1118 ekleme, Faz 1 ana iskelet |
| `c1db646` | Add placeholder PNG icons for Phase 1 Chrome load (to be replaced in Phase 10) | 4 PNG + `.gitkeep` temizliği |
| `8c95378` | Move _locales to extension root (Chrome MV3 requires hard-coded path) | `src/_locales/` → `_locales/` rename |

`8c95378` HEAD'dir ve GitHub origin/main ile senkronizedir.

---

## 4. Dosya Envanteri (Faz 1 Sonu — `git ls-files` ile doğrulandı)

### Kökte (kullanıcıya görünür, doğrudan değiştirilebilir)

| Dosya | İçerik kategorisi | Not |
|---|---|---|
| `manifest.json` | Şablon dolu | MV3, kullanıcı bilgileriyle dolduruldu, valid JSON |
| `LICENSE` | Verbatim şablon | MIT, "Kerem Tuna", yıl 2026 |
| `README.md` | Şablon dolu | Marketing dili yok, repo URL + email doldu |
| `PRIVACY-TR.md` | Verbatim şablon | Email placeholder dolu, başka değişiklik yok |
| `PRIVACY-EN.md` | Verbatim şablon | Email placeholder dolu, başka değişiklik yok |
| `.gitignore` | Verbatim şablon | Faz 1 Bölüm 6.1 |
| `.eslintrc.json` | Verbatim şablon | Vanilla JS, no-eval/no-implied-eval vb. |
| `.prettierrc.json` | Verbatim şablon | semi/singleQuote/2-tab vs. |
| `PHASE1_GUIDE.md` | Kullanıcı kaynağı | **Düzenleme**; Faz 2 kılavuzu geldiğinde paralel kalır |
| `PHASE1_HANDOFF.md` | Bu dosya | Faz 1 sonu, ajan devretme raporu |

### `_locales/` (kök seviyede — Chrome MV3 ZORUNLULUK)

| Dosya | İçerik |
|---|---|
| `_locales/tr/messages.json` | `extName` = "Reels Off", `extDescription` = "Instagram web arayüzünde Reels ve algoritmik içerik önerilerini gizleyerek dikkat dağılmasını azaltır. Veri toplamaz." |
| `_locales/en/messages.json` | `extName` = "Reels Off", `extDescription` = "Reduces distraction by hiding Reels and algorithmic content suggestions on Instagram's web interface. Collects no data." |

İki dil aynı key setini (`extName`, `extDescription`) içerir.

### `src/content/` (Faz 2-4 kapsamı)

| Dosya | Durum |
|---|---|
| `src/content/block.css` | Sadece yorum: `/* Faz 2-4'te doldurulacak */` |
| `src/content/redirect.js` | Sadece yorum: `// Faz 2'de doldurulacak` |
| `src/content/.gitkeep` | Klasör placeholder'ı |

### `src/popup/` (Faz 5 kapsamı)

| Dosya | Durum |
|---|---|
| `src/popup/popup.html` | Boilerplate iskelet (12 satır); body içeriği `<!-- Faz 5'te doldurulacak -->` |
| `src/popup/popup.css` | `/* Faz 5'te doldurulacak */` |
| `src/popup/popup.js` | `// Faz 5'te doldurulacak` |
| `src/popup/.gitkeep` | Klasör placeholder'ı |

### `src/icons/` (Faz 10 kapsamı — placeholder PNG'ler mevcut)

| Dosya | Boyut (byte) | Açıklama |
|---|---|---|
| `src/icons/icon-16.png` | 234 | Koyu gri (#262626) zemin + açık gri "X" işareti |
| `src/icons/icon-32.png` | 395 | Aynı tasarım, 32×32 |
| `src/icons/icon-48.png` | 475 | Aynı tasarım, 48×48 |
| `src/icons/icon-128.png` | 1095 | Aynı tasarım, 128×128 |

**Bu PNG'ler kasten geçici**; Faz 10'da gerçek tasarımla **birebir aynı isimle değiştirilecek**. Manifest yolları (`src/icons/icon-XX.png`) Faz 10'da değişmemeli.

### `docs/` (Faz 0'dan kullanıcı sağlayacak)

| Dosya | Durum |
|---|---|
| `docs/.gitkeep` | Klasör placeholder'ı — `selectors.md` ve `threat-model.md` kullanıcının Faz 0 çıktıları (Faz 1 sırasında getirilmedi) |

---

## 5. Kullanıcı Kararları (Sorularla Toplandı)

Faz 1 başında bir kerede toplandı; Faz 2-13'te bu kararlar **değişmemeli**:

| Karar | Değer |
|---|---|
| Eklenti adı (TR/EN) | Reels Off / Reels Off (aynı) |
| Açıklama TR (~130 char) | "Instagram web arayüzünde Reels ve algoritmik içerik önerilerini gizleyerek dikkat dağılmasını azaltır. Veri toplamaz." (117 char) |
| Açıklama EN (~130 char) | "Reduces distraction by hiding Reels and algorithmic content suggestions on Instagram's web interface. Collects no data." (119 char) |
| GitHub kullanıcı adı | `keremtunayetkinn` |
| İletişim email | `ktyetkinwork@gmail.com` (privacy policy ve README'de görünür) |
| Firefox Android desteği | Evet → manifest'te `gecko_android: {}` mevcut |
| ESLint/Prettier config | Evet → dosyalar oluşturuldu (npm kurulmadı, sadece referans) |
| GitHub repo visibility | Private (kullanıcı manuel oluşturdu) |
| Gecko ID | `@reels-off.kerem-tuna` (slug + ad) |

---

## 6. Manifest İçeriği (Tam, Verbatim)

```json
{
  "manifest_version": 3,
  "name": "__MSG_extName__",
  "description": "__MSG_extDescription__",
  "version": "0.1.0",
  "default_locale": "tr",

  "icons": {
    "16": "src/icons/icon-16.png",
    "32": "src/icons/icon-32.png",
    "48": "src/icons/icon-48.png",
    "128": "src/icons/icon-128.png"
  },

  "host_permissions": [
    "https://www.instagram.com/*"
  ],

  "content_scripts": [
    {
      "matches": ["https://www.instagram.com/*"],
      "css": ["src/content/block.css"],
      "js": ["src/content/redirect.js"],
      "run_at": "document_start"
    }
  ],

  "action": {
    "default_popup": "src/popup/popup.html",
    "default_title": "__MSG_extName__",
    "default_icon": {
      "16": "src/icons/icon-16.png",
      "32": "src/icons/icon-32.png"
    }
  },

  "content_security_policy": {
    "extension_pages": "script-src 'self'; object-src 'none'; base-uri 'none';"
  },

  "browser_specific_settings": {
    "gecko": {
      "id": "@reels-off.kerem-tuna",
      "strict_min_version": "140.0",
      "data_collection_permissions": {
        "required": ["none"]
      }
    },
    "gecko_android": {}
  }
}
```

**Faz 2'de muhtemelen değişecek alanlar (kılavuz gelene kadar varsayım yapma):** `content_scripts.css`, `content_scripts.js`, `content_scripts.run_at`, ihtimal `content_scripts.world`. Yeni `permissions` eklenmesi de **gerekebilir**, ama kılavuz açıkça söylemeden ekleme.

---

## 7. PHASE1_GUIDE.md'den Sapmalar (Şeffaf İfşa)

Faz 1 boyunca kılavuzdan **iki** zorunlu sapma yapıldı. İkisi de kullanıcı onayıyla:

### Sapma 1 — Placeholder ikonlar üretildi

- **Kılavuzdaki durum:** `src/icons/` klasörü `.gitkeep` ile boş kalsın, gerçek ikonlar Faz 10'da yapılsın.
- **Neden sapıldı:** Chrome MV3, manifest'te referans edilen ikon dosyalarını yüklerken zorunlu olarak okur. İkonlar olmadan eklenti yüklenmiyordu (`Could not load icon 'src/icons/icon-16.png'`). Bölüm 10 başarı kriteri ("Chrome'da hata vermeden yüklenebiliyor") için bu engelleyici idi.
- **Çözüm:** PowerShell + System.Drawing ile 16/32/48/128 px sade koyu gri + "X" işaretli PNG'ler üretildi. Faz 10'da aynı isimle değiştirilecek.
- **Commit:** `c1db646`

### Sapma 2 — `_locales/` klasörü kök seviyeye taşındı

- **Kılavuzdaki durum:** Bölüm 4.2 ve Bölüm 6.7/6.8 `src/_locales/tr/messages.json` ve `src/_locales/en/messages.json` yolunu söylüyor.
- **Neden sapıldı:** Chrome MV3 spesifikasyonu `_locales/` klasörünü **eklenti köküne sabit kodlamış**; manifest'te yolu değiştirecek bir alan yok. `default_locale: "tr"` tanımlıyken `_locales/` kökte değilse Chrome `"Default locale was specified, but _locales subtree is missing."` hatası verip reddediyor. MDN WebExtensions dokümantasyonu da aynı kuralı doğruluyor (Firefox için de geçerli).
- **Çözüm:** `git mv src/_locales _locales` ile rename. Manifest'te değişiklik gerekmedi (manifest zaten `_locales` yolunu referanslamıyor — Chrome bunu sabit varsayar).
- **Commit:** `8c95378`
- **Etki:** Bu sapma kılavuzdaki Bölüm 4.2'deki klasör ağacı diyagramı ve Bölüm 8.2'deki doğrulama komutuyla **çelişir**. Faz 2 kılavuzu bu yapıyı varsayarsa kullanıcıya hatırlatılmalı.

### Hangi yollar Chrome tarafından **sabit kodlu değil** (önemli — gereksiz panik yapma)

- `src/icons/` ✓ (manifest'te bağıl yol)
- `src/content/` ✓ (manifest'te bağıl yol)
- `src/popup/` ✓ (manifest'te bağıl yol)

Sadece `_locales/` istisnası vardır. Faz 2-13'te yeni bir klasör yapısı önerirsen aynı kontrol disiplini geçerli: kılavuza güven, ama Chrome reddederse spec'ten doğrula.

---

## 8. Faz 1 Tamamlandı Şartları (PHASE1_GUIDE.md Bölüm 10)

| Şart | Durum |
|---|---|
| Git repo başlatıldı, ilk commit atıldı | ✅ `main` branch, 3 commit |
| Klasör yapısı tam | ✅ (Sapma 2 ile: `_locales/` kökte) |
| `manifest.json` valid JSON, doğrulama testleri geçti | ✅ |
| `manifest.json` Bölüm 6.2 şablonuyla birebir uyumlu (placeholder'lar dolu) | ✅ (`gecko_android: {}` eklemesi dahil) |
| `LICENSE` MIT, yıl 2026, isim Kerem Tuna | ✅ |
| `README.md` placeholder'lar dolu, marketing dili yok | ✅ |
| `PRIVACY-TR.md` ve `PRIVACY-EN.md` birebir şablon | ✅ |
| `_locales/tr/messages.json` ve `_locales/en/messages.json` aynı key'ler | ✅ (`extName`, `extDescription`) |
| `.gitignore` Bölüm 6.1 ile aynı | ✅ |
| `.eslintrc.json` ve `.prettierrc.json` mevcut | ✅ |
| `src/{content,popup,icons}/` placeholder'lar | ✅ (icons placeholder PNG ile) |
| Chrome'da hata vermeden yüklenebiliyor | ✅ (kullanıcı manuel doğruladı) |
| Firefox 140+'ta hata vermeden yüklenebiliyor | ✅ (kullanıcı manuel doğruladı) |
| Yasaklı izin/framework/bağımlılık yok | ✅ |

**Bonus (kapsam dışıydı, talep üzerine yapıldı):** GitHub private remote'a push.

---

## 9. Faz 2'ye Hazırlık (Sonraki Ajan İçin Operasyonel Notlar)

### Faz 2 hakkında bilinen (kılavuzdan)

- **Konu:** Content Script CSS Injection.
- **Hedef dosya:** `src/content/block.css` (manifest'te zaten referanslı).
- **Faz 0 seçici çıktıları (PHASE1_GUIDE.md Bölüm 3'ten — Faz 2'de CSS'e döküleceği varsayılır):**

  | ID | Element | Seçici |
  |---|---|---|
  | A1 | Sidebar Reels linki | `a[href="/reels/"]` |
  | A2 | Sidebar Keşfet linki (opsiyonel) | `a[href="/explore/"]` |
  | D1 | Profil Reels tab | `main a[href$="/reels/"]:not([href="/reels/"])` |
  | G1 | Feed'e gömülü tekil Reel post'ları | `a[href^="/reels/"]:not([href="/reels/"])` |

### Yeni ajanın **başlamadan** doğrulaması gerekenler

1. Kullanıcıdan **Faz 2 kılavuzu** (`PHASE2_GUIDE.md` veya muadili) gelmesini bekle. Faz 2 görevini bu rapora dayanarak proaktif başlatma — Kural 6'yı ihlal eder.
2. Kullanıcı kılavuzu sağladığında, kılavuzun bu rapordaki state'le tutarlı olup olmadığını kontrol et:
   - Kılavuz `src/_locales/...` referansı yapıyor mu? (Yapıyorsa kullanıcıya Sapma 2'yi hatırlat.)
   - Kılavuz yeni bir `permissions` ekliyor mu? Kural 3 — varsa kullanıcıya MV3 dokümanından doğrulamayı öner.
   - Kılavuz CSS'i `src/content/block.css` dışında bir yola koyuyor mu? Öyleyse `manifest.json` `content_scripts.css` yolunu da güncellemen gerekir; aksi halde içerik script yüklenmez.
3. Faz 2 kılavuzu net değilse Kural 7 — sor, varsayma.

### Bilinen riskler / dikkat noktaları

- **Instagram class isimleri obfuscated** (`x1qjc9v5`, `_aaa1` vb.). Mimari karar: **href-first seçici stratejisi** (yukarıdaki tabloda görüldüğü gibi). Class isimlerine güvenip CSS yazma — bir hafta sonra Instagram class'ı değiştirir, eklenti çalışmaz.
- **CSP sıkı.** Inline style, inline script, external CDN HEPSİ yasak. CSS dosyası içinde `@import url(...)` veya inline `<style>` enjekte etme deneme.
- **`run_at: "document_start"`** — content script DOM hazır olmadan çalışır. JS Faz 2'de boş kalacaksa CSS-only yaklaşım için sorun değil. Ama JS doldurulduğunda DOMContentLoaded'i beklemek veya MutationObserver kullanmak gerekebilir (Faz 2 kılavuzu netleştirir).

### Ne YAPMA

- Faz 1 dosyalarına dokunma (manifest, LICENSE, README, privacy policy'ler, locale'ler) — Faz 2 kılavuzu açıkça istemiyorsa.
- Yeni `permissions` ekleme — kılavuz emretmediği sürece.
- `package.json` oluşturma / `npm install` çalıştırma — kullanıcı açıkça istemediği sürece.
- Test dosyası yazma (Faz 10), CI/CD eklemek (Faz 13), Docker (gereksiz).
- İkon PNG'lerini güncelleme (Faz 10).
- `docs/` içine içerik üretme — bu klasör kullanıcının Faz 0 selectors.md ve threat-model.md'sini bekliyor.

---

## 10. Yeni Ajan İçin Hızlı Self-Doğrulama Komutları

Repo'ya girdiğinde state'i hızlı teyit etmek için (Windows ortam, bash + PowerShell karışık çalışıyor):

```bash
# Repo durumu
git log --oneline                          # 3 commit; HEAD = 8c95378 olmalı
git status                                 # working tree clean (rapor commit edildiyse)
git remote -v                              # origin = ...keremtunayetkinn/reels-off.git

# Manifest sağlığı
python -m json.tool manifest.json          # valid JSON olmalı (çıktı manifest'in pretty-print hali)

# Locale eşleşmesi
python -c "import json; tr=json.load(open('_locales/tr/messages.json',encoding='utf-8')); en=json.load(open('_locales/en/messages.json',encoding='utf-8')); print(sorted(tr.keys())==sorted(en.keys()))"
# True dönmeli

# Yasaklı izin kontrolü (eşleşme bulursa hata var)
grep -E '"(storage|tabs|activeTab|webNavigation|cookies|scripting|<all_urls>)"' manifest.json
# Hiçbir şey çıkmamalı

# CSP unsafe kontrolü
grep -E "unsafe-(inline|eval)" manifest.json
# Hiçbir şey çıkmamalı

# Klasör konumu (Sapma 2'nin doğruluğu)
ls _locales/tr/messages.json _locales/en/messages.json  # iki dosya da görünmeli
test ! -d src/_locales && echo "OK: src/_locales kaldırılmış"
```

Bu komutlar geçerse repo Faz 2'ye hazır.

---

## 11. Açık Konular / Henüz Yapılmadıklar

| Konu | Faz | Not |
|---|---|---|
| Gerçek ikon tasarımları | Faz 10 | Şu an placeholder PNG var |
| `docs/selectors.md` ve `docs/threat-model.md` | Faz 0 (kullanıcıdan) | Repo'ya henüz konmadı |
| `package.json` (devDependencies için) | Opsiyonel | Sadece kullanıcı isterse |
| Test infrastructure | Faz 10 | Faz 1'de hiç yok |
| CI/CD (GitHub Actions) | Faz 13 | Yok |
| AMO submission, Web Store submission | Faz 13 | Yok |
| Eklenti versiyonu | `0.1.0` | Faz 13 öncesi bump için kullanıcı kararı |

---

## 12. Bu Belgeyi Okuyan Ajan'a Son Söz

Bu projede ajan rolü, kullanıcının yazdığı kılavuzu **eksiksiz uygulayan ve sınırlarına saygı duyan** bir yardımcı olmaktır. "İyileştirici" değil "uygulayıcı" ol. Belirsizlikte sor. Sapma yapman gerekirse şeffaf raporla (Bölüm 7'deki gibi). Kullanıcı verimli ama dikkatli — sorularını yapılandırılmış, kısa, gerçek bilgi gerektiren konularda tut.

Faz 1 temiz tamamlandı. Faz 2 kılavuzunu kullanıcıdan alana kadar bu repo'da hiçbir değişiklik yapma.
