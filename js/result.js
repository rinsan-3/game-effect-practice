/**
 * リザルト画面 - スコア表示・ランキング・1位輝きエフェクト
 */
(function () {
  'use strict';

  const params = new URLSearchParams(window.location.search);
  const status = params.get('status') || 'clear';
  const score = 1000;

  const resultScoreEl = document.getElementById('resultScore');
  const btnTop = document.getElementById('btnTop');
  const rankingItems = document.querySelectorAll('.ranking-item');
  const playerItem = document.querySelector('.ranking-item.is-player');

  // スコア表示
  resultScoreEl.textContent = score + ' pt';

  // TOPに戻る
  btnTop.href = 'index.html';

  // 1位ランクイン時の表示アニメーション
  if (playerItem && playerItem.classList.contains('top3')) {
    gsap.set(playerItem, { opacity: 0, scale: 0.8 });

    gsap.to(playerItem, {
      opacity: 1,
      scale: 1,
      duration: 0.6,
      delay: 0.3,
      ease: 'back.out(1.5)',
    });
  }

  // ランキング項目のスタッガー表示
  gsap.fromTo(
    rankingItems,
    { opacity: 0, y: 20 },
    {
      opacity: 1,
      y: 0,
      duration: 0.4,
      stagger: 0.1,
      delay: 0.2,
      ease: 'power2.out',
    }
  );
})();
