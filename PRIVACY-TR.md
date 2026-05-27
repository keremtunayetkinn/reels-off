# Gizlilik Politikası — Reels Off

**Son güncelleme:** 2026

## Özet

Bu eklenti **hiçbir kişisel veri toplamaz, işlemez veya iletmez.** Hiçbir analitik, telemetri veya kullanıcı takibi mekanizması içermez. Tüm ayarlar yalnızca kullanıcının kendi cihazında, tarayıcı yerel depolamasında saklanır.

## Toplanmayan veriler

Eklenti aşağıdaki veri türlerinin **hiçbirini** toplamaz, kaydetmez veya iletmez:
- Kişisel kimlik bilgileri (ad, e-posta, telefon, adres)
- Kimlik doğrulama bilgileri (şifre, oturum jetonu, çerez)
- Konum verisi
- Web tarama geçmişi
- Kullanıcı etkinlikleri (tıklama, kaydırma, görüntüleme)
- Cihaz veya tarayıcı kimlik bilgisi
- Instagram hesap içeriği (gönderiler, mesajlar, takipçi listesi)

## Yerel depolama

Eklentinin tek depoladığı bilgi, kullanıcının açıp kapattığı engelleme özelliklerinin tercihleridir (boolean değerler). Bu veriler:
- `chrome.storage.local` API'si üzerinden **yalnızca kullanıcının cihazında** saklanır
- Hiçbir sunucuya gönderilmez
- Hiçbir üçüncü tarafla paylaşılmaz
- Eklenti kaldırıldığında tamamen silinir

## İzinler

Eklenti yalnızca aşağıdaki izni kullanır:
- **`https://www.instagram.com/*` (host izni):** Eklentinin Instagram web sayfalarında çalışıp Reels ve önerilen içerikleri gizleyebilmesi için gereklidir. Eklenti yalnızca bu siteye erişir, başka hiçbir siteye değil.

## Üçüncü taraflar

Eklenti hiçbir üçüncü taraf hizmetiyle entegre değildir. Hiçbir CDN, hiçbir harici script, hiçbir analitik servis kullanılmaz.

## Veri saklama ve silme

Toplanan veri olmadığı için saklama veya silme prosedürü yoktur. Eklenti kaldırıldığında tüm yerel ayarlar tarayıcı tarafından otomatik olarak silinir.

## Çocukların gizliliği

Eklenti yaş kısıtlaması olmaksızın kullanılabilir, ancak Instagram'ın kendi yaş kuralları geçerlidir. Eklenti çocuklardan veya yetişkinlerden bilinçli olarak hiçbir veri toplamaz.

## Değişiklikler

Bu gizlilik politikası eklentinin gelişimine paralel olarak güncellenebilir. Önemli değişiklikler bu sayfada ve eklentinin GitHub repo'sunda duyurulur.

## İletişim

Gizlilikle ilgili sorular için: **ktyetkinwork@gmail.com**

## Yasal Uyumluluk

Bu eklenti veri toplamadığı için GDPR (Genel Veri Koruma Yönetmeliği), CCPA (Kaliforniya Tüketici Gizlilik Yasası) ve KVKK (Kişisel Verilerin Korunması Kanunu) kapsamındaki veri işleme yükümlülükleri otomatik olarak karşılanır.
