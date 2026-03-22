/**
 * ランキング画面 - 1位輝きエフェクト
 */
(function () {
  'use strict';

  const playerItem = document.querySelector('.ranking-item.is-player');
  const rankingItems = document.querySelectorAll('.ranking-item');

  if (playerItem && playerItem.classList.contains('top3')) {
    gsap.set(playerItem, { opacity: 0, scale: 0.8 });

    gsap.to(playerItem, {
      opacity: 1,
      scale: 1,
      duration: 0.6,
      delay: 0.2,
      ease: 'back.out(1.5)',
    });
  }

  gsap.fromTo(
    rankingItems,
    { opacity: 0, y: 20 },
    {
      opacity: 1,
      y: 0,
      duration: 0.4,
      stagger: 0.1,
      delay: 0.1,
      ease: 'power2.out',
    }
  );
})();
