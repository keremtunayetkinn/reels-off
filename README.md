# Reels Off

> Instagram web arayüzünde Reels ve algoritmik içerik önerilerini gizleyen, gizlilik odaklı bir tarayıcı eklentisi.

## Ne yapar

- Sol kenar çubuğundaki Reels bağlantısını gizler
- Sol kenar çubuğundaki Keşfet bağlantısını gizler
- Profil sayfasındaki Reels sekmesini gizler
- Ana akışa gömülü tekil Reels gönderilerini gizler
- `/reels/` ve `/reels/<id>/` URL'lerine erişimi engelleyip ana sayfaya yönlendirir
- `/explore/` URL'lerine erişimi engelleyip ana sayfaya yönlendirir
- Tüm ayarlar yerel olarak saklanır; hiçbir veri sunucuya gönderilmez

## Ne yapmaz

- Kullanıcı kimlik bilgilerine erişmez
- Instagram'ın API'sine bağlanmaz, yalnızca sayfa görünümünü değiştirir
- Hiçbir veri toplamaz, hiçbir analitik göndermez
- Otomatik beğeni, takip etme veya etkileşim yapmaz

## Kurulum

### Chrome

1. Chrome Web Store sayfasından yükleyin: _(yayınlandığında eklenecek)_

### Firefox

1. Mozilla Add-ons sayfasından yükleyin: _(yayınlandığında eklenecek)_

### Geliştirici modunda yükleme (yayın öncesi)

1. Bu repo'yu klonlayın
2. Chrome'da: `chrome://extensions/` → "Geliştirici modu" → "Paketlenmemiş öğe yükle" → repo klasörünü seçin
3. Firefox'ta: `about:debugging#/runtime/this-firefox` → "Geçici Eklenti Yükle" → `manifest.json` dosyasını seçin

## Teknik bilgi

- **Manifest:** V3 (Chrome ve Firefox uyumlu)
- **Bağımlılık:** Yok (vanilla JS)
- **İzin:** Sadece `https://www.instagram.com/*` host izni
- **Depolama:** `chrome.storage.local` (yerel cihaz)
- **Veri akışı:** Yok — eklenti hiçbir sunucuya veri göndermez

## Lisans

MIT — bkz. [LICENSE](./LICENSE).

## Gizlilik

Hiçbir kullanıcı verisi toplanmaz. Detay için [PRIVACY-TR.md](./PRIVACY-TR.md) ([English](./PRIVACY-EN.md)).

## Geliştirme aşamaları

Bu proje fazlar halinde geliştirilmektedir. Mevcut durum: **Faz 4 (Kullanıcı kontrolü ve ayarlar)**.

## Geri bildirim

Hata bildirimleri ve özellik istekleri için: GitHub Issues (https://github.com/keremtunayetkinn/reels-off).
İletişim: ktyetkinwork@gmail.com
