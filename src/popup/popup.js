/*
 * Reels Off — popup.js
 * Faz 4: Popup yönetimi
 *
 * Görevler:
 *   1. data-i18n attribute'larını chrome.i18n.getMessage() ile doldur
 *   2. data-key attribute'larındaki checkbox'ları chrome.storage.local'tan başlat
 *   3. Değişiklikleri canlı olarak storage'a yaz (content script onChanged ile duyar)
 *
 * Mesajlaşma yok: chrome.storage.onChanged content script'i bilgilendiriyor;
 *   doğrudan chrome.runtime.sendMessage gereksiz.
 */

(function () {
  'use strict';

  const DEFAULTS = {
    blockSidebarReels: true,
    blockSidebarExplore: true,
    blockProfileReelsTab: true,
    blockFeedReelPosts: true,
    redirectReels: true,
    redirectExplore: true,
    redirectProfileReels: true,
  };

  // 1. i18n replacement — tüm [data-i18n] elementlerini doldur
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.dataset.i18n;
    const msg = chrome.i18n.getMessage(key);
    if (msg) {
      el.textContent = msg;
    }
  });

  // 2. Toggle wiring — storage'tan oku, checkbox'ları başlat, change event'ı bağla
  chrome.storage.local.get(DEFAULTS, (settings) => {
    document.querySelectorAll('[data-key]').forEach((input) => {
      const key = input.dataset.key;
      // settings[key] undefined ise default true (DEFAULTS sayesinde)
      input.checked = settings[key] !== false;
      input.addEventListener('change', () => {
        chrome.storage.local.set({ [key]: input.checked });
      });
    });
  });
})();
