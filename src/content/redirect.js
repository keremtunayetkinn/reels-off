/*
 * Reels Off — redirect.js
 * Faz 3: URL Redirect (polling-based)
 *
 * Amaç: Instagram'ın Reels (/reels/, /reels/<id>/, /<user>/reels/) ve
 *   Explore (/explore/*) URL'lerine yapılan navigasyonları engelleyip
 *   güvenli bir hedefe yönlendirmek.
 *
 * Strateji: Polling (setInterval) ile location.pathname kontrolü.
 *   history.pushState content script'in izole world'ünden patch'lenemez;
 *   chrome.webNavigation ekstra izin gerektirir. Polling, izinsiz ve
 *   güvenilir SPA URL değişiklik tespiti olarak seçildi.
 *
 * Geri-alınabilirlik: location.replace() kullanılır — back tuşu reel
 *   sayfasına dönmez (history stack'e eklenmez).
 *
 * Loop guard: Her redirect sonrası polling 1 saniye duraklatılır;
 *   navigation'ın location.pathname'i güncellemesi için zaman tanınır.
 *
 * Kapsam (README ile tutarlı):
 *   F1a — /reels/                  → /                [aktif]
 *   F1b — /reels/<id>/, alt yollar → /                [aktif]
 *   F1c — /<username>/reels/       → /<username>      [aktif]
 *   E1  — /explore/, /explore/<x>  → /                [aktif]
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

  let pollingPaused = false;

  function computeRedirect(pathname) {
    // Sıralama önemli: F1a/b önce, E1 sonra, F1c en son.
    if (REELS_RE.test(pathname)) return '/';
    if (EXPLORE_RE.test(pathname)) return '/';
    const match = pathname.match(PROFILE_REELS_RE);
    if (match) return '/' + match[1];
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

  // İlk kontrol document_start anında — kullanıcı doğrudan /reels/'e gelmişse
  // IG kodunun render başlamasından önce redirect tetiklenir (flicker yok).
  tick();

  // SPA navigation (history.pushState) için periyodik kontrol.
  window.setInterval(tick, POLL_INTERVAL_MS);
})();
