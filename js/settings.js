/**
 * 設定画面
 */
(function () {
  'use strict';

  const themeInputs = document.querySelectorAll('input[name="theme"]');
  const currentTheme = Theme.get();

  themeInputs.forEach((input) => {
    if (input.value === currentTheme) {
      input.checked = true;
    }
    input.addEventListener('change', function () {
      Theme.set(this.value);
    });
  });
})();
