/*
 * Reels Off — redirect.js
 * Faz 3 + Faz 4: URL Redirect + Settings-aware CSS class toggle
 *
 * Faz 3'ten gelen: polling-based URL redirect (Reels + Explore + Profile Reels).
 * Faz 4'te eklenen: chrome.storage.local'dan toggle ayarları okuma,
 *   block.css için <html>'de root class toggle, chrome.storage.onChanged
 *   ile canlı güncelleme.
 *
 * Dosya adı tarihsel sebeple "redirect.js"; artık hem URL redirect hem
 *   CSS class gating yönetir. Yeniden adlandırma düşünülebilir ama
 *   manifest dependency kırma riski; yorumlarla belgelendi.
 *
 * Storage schema:
 *   blockSidebarReels         (bool, default true) → A1 CSS class
 *   blockSidebarExplore       (bool, default true) → A2 CSS class
 *   blockProfileReelsTab      (bool, default true) → D1 CSS class
 *   blockFeedReelPosts        (bool, default true) → G1 CSS class
 *   redirectReels             (bool, default true) → F1a/b koşulu
 *   redirectExplore           (bool, default true) → E1 koşulu
 *   redirectProfileReels      (bool, default true) → F1c koşulu
 *
 * Cold-read race: block.css default kuralları race penceresinde engellemeyi
 *   aktif tutar (gizleme toggle'ları için kabul edilebilir trade-off). Faz 5
 *   G5.2 ile yönlendirme tick'i storage callback içine taşındı: bookmark veya
 *   doğrudan navigation ile gelen kullanıcı, yönlendirme toggle'ının kapalı
 *   değerine ilk hit'te saygı görür. Ek redirect gecikmesi ~10-20ms.
 *
 * Faz 3'ten korunan: location.replace(), iki katmanlı loop guard, regex
 *   sıralaması (F1a/b → E1 → F1c), polling parametreleri (300/1000 ms).
 */

(function () {
  'use strict';

  const POLL_INTERVAL_MS = 300;
  const PAUSE_AFTER_REDIRECT_MS = 1000;

  // /reels/, /reels/<id>/, /reels/audio/<id>/ — tüm /reels/ alt yolları
  const REELS_RE = /^\/reels(\/|$)/;
  // /explore/, /explore/locations/, /explore/tags/<tag>/ — tüm /explore/ alt yolları
  const EXPLORE_RE = /^\/explore(\/|$)/;
  // /<username>/reels(/) — profil Reels feed'i (capture group 1 = username)
  const PROFILE_REELS_RE = /^\/([^/]+)\/reels(\/|$)/;

  const DEFAULTS = {
    blockSidebarReels: true,
    blockSidebarExplore: true,
    blockProfileReelsTab: true,
    blockFeedReelPosts: true,
    redirectReels: true,
    redirectExplore: true,
    redirectProfileReels: true,
  };

  let settings = { ...DEFAULTS };
  let pollingPaused = false;

  function computeRedirect(pathname) {
    // Sıralama önemli: F1a/b önce, E1 sonra, F1c en son.
    if (settings.redirectReels && REELS_RE.test(pathname)) return '/';
    if (settings.redirectExplore && EXPLORE_RE.test(pathname)) return '/';
    if (settings.redirectProfileReels) {
      const match = pathname.match(PROFILE_REELS_RE);
      if (match) return '/' + match[1];
    }
    return null;
  }

  function tick() {
    if (pollingPaused) return;
    const target = computeRedirect(location.pathname);
    if (target !== null && target !== location.pathname) {
      pollingPaused = true;
      window.setTimeout(() => {
        pollingPaused = false;
      }, PAUSE_AFTER_REDIRECT_MS);
      location.replace(target);
    }
  }

  function applyBlockingClasses() {
    const root = document.documentElement;
    // settings.blockX === false → class eklenir → CSS override aktif → element görünür
    root.classList.toggle('ro-disable-sidebar-reels', settings.blockSidebarReels === false);
    root.classList.toggle('ro-disable-sidebar-explore', settings.blockSidebarExplore === false);
    root.classList.toggle('ro-disable-profile-reels-tab', settings.blockProfileReelsTab === false);
    root.classList.toggle('ro-disable-feed-reel-posts', settings.blockFeedReelPosts === false);
    // Chrome :has() bazen ancestor class değişiminde re-evaluate olmuyor;
    // OFF→ON canlı cycle'ında reel'ler yeniden gizlenmiyordu (KN2 Bulgu #5).
    // Layout pass'i zorlayarak :has() invalidation'ını tetikliyoruz. ~1 frame perf.
    void root.offsetHeight;
  }

  // onChanged listener'ı storage.get callback'inden ÖNCE kur: callback gelmeden
  // önce popup'ta toggle değişirse kaçırılmasın.
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'local') return;
    for (const key in changes) {
      if (key in settings) {
        settings[key] = changes[key].newValue !== false;
      }
    }
    applyBlockingClasses();
  });

  // Storage hazır → class'ları uygula → tick + interval'ı başlat.
  // Faz 5 G5.2: tick'in callback içine taşınması cold-read race'i kapatır.
  // Yönlendirme aktif kullanıcı için redirect storage gelir gelmez tetiklenir;
  // IG render başlamasından önce (flicker pratik olarak yok).
  chrome.storage.local.get(DEFAULTS, (loaded) => {
    settings = { ...DEFAULTS, ...loaded };
    applyBlockingClasses();
    tick();
    window.setInterval(tick, POLL_INTERVAL_MS);
  });
})();
