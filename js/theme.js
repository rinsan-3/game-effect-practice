/**
 * テーマ設定 - 共通
 */
(function () {
  'use strict';

  const STORAGE_KEY = 'lesson-app-theme';
  const THEMES = { ship: '船', train: '電車', hero: '勇者' };

  function getTheme() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved && THEMES[saved] ? saved : 'ship';
    } catch {
      return 'ship';
    }
  }

  function setTheme(theme) {
    if (THEMES[theme]) {
      try {
        localStorage.setItem(STORAGE_KEY, theme);
        return true;
      } catch {
        return false;
      }
    }
    return false;
  }

  window.Theme = {
    get: getTheme,
    set: setTheme,
    keys: Object.keys(THEMES),
    labels: THEMES,
  };
})();
