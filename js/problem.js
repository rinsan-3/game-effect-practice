/**
 * 問題画面 - 3問制・テーマ対応・正解/不正解演出
 */
(function () {
  'use strict';

  const THEME_ICONS = {
    ship: '<svg viewBox="0 0 48 32" xmlns="http://www.w3.org/2000/svg"><path d="M4 24 L12 20 L36 20 L44 24 L44 28 L4 28 Z" fill="#2563eb" stroke="#1d4ed8" stroke-width="1.5"/><path d="M20 20 L24 8 L28 20 Z" fill="#fbbf24" stroke="#f59e0b" stroke-width="1"/><circle cx="24" cy="26" r="3" fill="#fff" stroke="#e2e8f0" stroke-width="1"/></svg>',
    train: '<svg viewBox="0 0 48 32" xmlns="http://www.w3.org/2000/svg"><rect x="4" y="12" width="40" height="16" rx="4" fill="#ef4444" stroke="#b91c1c" stroke-width="1.5"/><rect x="8" y="16" width="6" height="8" fill="#fef3c7"/><rect x="18" y="16" width="6" height="8" fill="#fef3c7"/><rect x="28" y="16" width="6" height="8" fill="#fef3c7"/><rect x="38" y="16" width="6" height="8" fill="#fef3c7"/><circle cx="12" cy="26" r="3" fill="#1e293b"/><circle cx="36" cy="26" r="3" fill="#1e293b"/><rect x="42" y="14" width="4" height="4" fill="#94a3b8"/></svg>',
    hero: '<svg viewBox="0 0 48 32" xmlns="http://www.w3.org/2000/svg"><ellipse cx="24" cy="20" rx="10" ry="8" fill="#fbbf24" stroke="#f59e0b" stroke-width="1.5"/><path d="M14 20 L24 8 L34 20" fill="none" stroke="#78716c" stroke-width="2" stroke-linecap="round"/><rect x="22" y="4" width="4" height="8" rx="1" fill="#a8a29e"/><circle cx="24" cy="14" r="4" fill="#fef3c7"/><path d="M20 24 L24 28 L28 24" fill="none" stroke="#78716c" stroke-width="1.5" stroke-linecap="round"/></svg>',
  };

  const QUESTIONS = [
    { text: '日本の首都はどこですか？', choices: [{ text: '東京', correct: true }, { text: '大阪', correct: false }] },
    { text: '1年は何ヶ月ですか？', choices: [{ text: '12ヶ月', correct: true }, { text: '10ヶ月', correct: false }] },
    { text: '太陽は何色に見えますか？', choices: [{ text: '黄色', correct: true }, { text: '青', correct: false }] },
  ];

  const TOTAL_QUESTIONS = QUESTIONS.length;
  const theme = typeof Theme !== 'undefined' ? Theme.get() : 'ship';
  const feedbackBadge = document.getElementById('feedbackBadge');
  const feedbackIcon = document.getElementById('feedbackIcon');
  const feedbackText = document.getElementById('feedbackText');
  const btnTop = document.getElementById('btnTop');
  const problemText = document.getElementById('problemText');
  const problemChoices = document.getElementById('problemChoices');
  const progressIcon = document.getElementById('progressIcon');
  const progressTrack = document.getElementById('progressTrack');
  const confettiLayer = document.getElementById('confettiLayer');
  const confettiContainer = document.getElementById('confettiContainer');

  let currentQuestionIndex = 0;
  let correctCount = 0;
  let answered = false;
  let redirectTimer = null;

  const ICON_CORRECT = '<svg viewBox="0 0 64 64" width="64" height="64" aria-hidden="true"><circle cx="32" cy="32" r="30" fill="currentColor" stroke="currentColor" stroke-width="3"/><path d="M18 32 L28 42 L46 22" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const ICON_INCORRECT = '<svg viewBox="0 0 64 64" width="64" height="64" aria-hidden="true"><circle cx="32" cy="32" r="30" fill="currentColor" stroke="currentColor" stroke-width="3"/><path d="M20 20 L44 44 M44 20 L20 44" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round"/></svg>';

  function cancelRedirect() {
    if (redirectTimer) {
      redirectTimer.kill();
      redirectTimer = null;
    }
  }

  function initTheme() {
    if (progressIcon && THEME_ICONS[theme]) {
      progressIcon.innerHTML = THEME_ICONS[theme];
    }
    if (progressTrack) {
      progressTrack.classList.remove('progress-track--train', 'progress-track--hero');
      if (theme === 'train') progressTrack.classList.add('progress-track--train');
      if (theme === 'hero') progressTrack.classList.add('progress-track--hero');
    }
  }

  function getTrackWidth() {
    return progressTrack ? progressTrack.offsetWidth : 300;
  }

  function calcIconLeft(count) {
    const trackWidth = getTrackWidth();
    const iconWidth = 48;
    const padding = 12;
    const range = trackWidth - iconWidth - padding * 2;
    return padding + iconWidth / 2 + (count / TOTAL_QUESTIONS) * range;
  }

  function updateIconPosition() {
    if (!progressIcon) return;
    progressIcon.style.left = calcIconLeft(correctCount) + 'px';
  }

  function moveIconToNext() {
    correctCount++;
    const left = calcIconLeft(correctCount);
    gsap.to(progressIcon, {
      left: left,
      duration: 0.6,
      ease: 'back.out(1.4)',
    });
  }

  function renderQuestion() {
    const q = QUESTIONS[currentQuestionIndex];
    problemText.textContent = q.text;
    problemChoices.innerHTML = '';
    q.choices.forEach((choice) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'problem-choice';
      btn.textContent = choice.text;
      btn.dataset.correct = String(choice.correct);
      problemChoices.appendChild(btn);
    });
  }

  function bindChoiceHandlers() {
    problemChoices.querySelectorAll('.problem-choice').forEach((btn) => {
      btn.addEventListener('click', handleChoiceClick);
    });
  }

  function createConfetti() {
    if (!confettiContainer) return;
    confettiContainer.innerHTML = '';
    confettiLayer?.classList.add('visible');
    confettiLayer?.removeAttribute('aria-hidden');

    const colors = ['#ef4444', '#fbbf24', '#22c55e', '#2563eb', '#ec4899', '#f97316', '#8b5cf6'];
    const centerX = window.innerWidth / 2;
    const startY = window.innerHeight + 20;

    for (let i = 0; i < 70; i++) {
      const piece = document.createElement('div');
      piece.className = 'confetti-piece';
      piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      piece.style.width = 4 + Math.random() * 4 + 'px';
      piece.style.height = 4 + Math.random() * 4 + 'px';
      piece.style.borderRadius = Math.random() > 0.4 ? '50%' : '2px';

      gsap.set(piece, {
        left: centerX + (Math.random() - 0.5) * 50,
        top: startY,
        xPercent: -50,
        yPercent: -50,
        x: 0,
        y: 0,
        rotation: 0,
        opacity: 1,
      });
      confettiContainer.appendChild(piece);

      gsap.to(piece, {
        duration: 3 + Math.random() * 1.5,
        delay: Math.random() * 0.08,
        physics2D: {
          velocity: 550 + Math.random() * 350,
          angle: -90 + (Math.random() - 0.5) * 50,
          gravity: 380 + Math.random() * 120,
          friction: 0.01 + Math.random() * 0.015,
        },
        rotation: (Math.random() - 0.5) * 1080,
        opacity: 0.2,
        ease: 'none',
      });
    }
  }

  function showFeedbackBadge(type, showButton) {
    feedbackBadge.classList.remove('visible');
    feedbackBadge.setAttribute('aria-hidden', 'true');
    feedbackIcon.className = 'feedback-icon';
    feedbackText.className = 'feedback-text';
    btnTop.classList.remove('visible');

    if (type === 'correct') {
      feedbackIcon.innerHTML = ICON_CORRECT;
      feedbackIcon.classList.add('feedback-icon--correct');
      feedbackText.textContent = '正解！';
      feedbackText.classList.add('feedback-text--correct');
    } else if (type === 'incorrect') {
      feedbackIcon.innerHTML = ICON_INCORRECT;
      feedbackIcon.classList.add('feedback-icon--incorrect');
      feedbackText.textContent = '不正解...';
      feedbackText.classList.add('feedback-text--incorrect');
    } else if (type === 'clear') {
      feedbackIcon.innerHTML = ICON_CORRECT;
      feedbackIcon.classList.add('feedback-icon--correct');
      feedbackText.textContent = 'クリア！';
      feedbackText.classList.add('feedback-text--correct');
    }

    btnTop.style.display = showButton ? 'inline-block' : 'none';
    feedbackBadge.classList.add('visible');
    feedbackBadge.removeAttribute('aria-hidden');
  }

  function hideFeedbackBadge() {
    feedbackBadge.classList.remove('visible');
    feedbackBadge.setAttribute('aria-hidden', 'true');
    confettiLayer?.classList.remove('visible');
    confettiLayer?.setAttribute('aria-hidden', 'true');
  }

  function playCorrectEffect() {
    showFeedbackBadge('correct', false);
    gsap.set(feedbackBadge, { scale: 0 });
    gsap.to(feedbackBadge, { scale: 1, duration: 0.5, ease: 'back.out(2)' });
  }

  function playShipFlyOff() {
    if (!progressIcon) return;
    const rect = progressIcon.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    progressIcon.classList.add('is-flying');
    gsap.set(progressIcon, { left: centerX, top: centerY, xPercent: -50, yPercent: -50, x: 0, y: 0, rotation: 0 });

    gsap.to(progressIcon, {
      duration: 2.8,
      physics2D: { velocity: 320 + Math.random() * 150, angle: -80 + (Math.random() - 0.5) * 50, gravity: 450, friction: 0.012 },
      rotation: 2160,
      ease: 'none',
    });
  }

  function playHeroGameOver() {
    if (!progressIcon) return;
    const rect = progressIcon.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    progressIcon.classList.add('is-flying');
    gsap.set(progressIcon, {
      left: centerX,
      top: centerY,
      xPercent: -50,
      yPercent: -50,
      x: 0,
      y: 0,
      rotation: 0,
      transformOrigin: '50% 100%',
    });

    const tl = gsap.timeline();
    tl.to(progressIcon, { x: '+=8', duration: 0.035, yoyo: true, repeat: 10, ease: 'power2.inOut' });
    tl.to(progressIcon, { x: 0, duration: 0.02 });
    tl.to(progressIcon, {
      rotation: 85,
      y: 80,
      duration: 0.5,
      ease: 'power2.in',
    });
  }

  function playTrainGameOver() {
    if (!progressIcon) return;
    const rect = progressIcon.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    progressIcon.style.visibility = 'hidden';

    const debrisColors = ['#ef4444', '#b91c1c', '#78716c', '#1e293b', '#fef3c7'];
    const debrisCount = 12;

    for (let i = 0; i < debrisCount; i++) {
      const piece = document.createElement('div');
      piece.className = 'confetti-piece';
      piece.style.position = 'fixed';
      piece.style.left = centerX + 'px';
      piece.style.top = centerY + 'px';
      piece.style.width = 8 + Math.random() * 12 + 'px';
      piece.style.height = 8 + Math.random() * 12 + 'px';
      piece.style.backgroundColor = debrisColors[Math.floor(Math.random() * debrisColors.length)];
      piece.style.borderRadius = Math.random() > 0.5 ? '2px' : '0';
      piece.style.zIndex = '91';
      document.body.appendChild(piece);

      gsap.set(piece, { xPercent: -50, yPercent: -50, x: 0, y: 0, rotation: 0 });
      gsap.to(piece, {
        duration: 1.5 + Math.random() * 1,
        physics2D: {
          velocity: 180 + Math.random() * 220,
          angle: (360 / debrisCount) * i + Math.random() * 30,
          gravity: 500,
          friction: 0.02,
        },
        rotation: (Math.random() - 0.5) * 720,
        opacity: 0,
        ease: 'none',
        onComplete: () => piece.remove(),
      });
    }
  }

  function playGameOverEffect() {
    if (theme === 'hero') {
      playHeroGameOver();
    } else if (theme === 'train') {
      playTrainGameOver();
    } else {
      playShipFlyOff();
    }
  }

  function playIncorrectEffect() {
    playGameOverEffect();

    showFeedbackBadge('incorrect', true);
    gsap.set(btnTop, { opacity: 0, scale: 0.5 });
    gsap.set(feedbackBadge, { scale: 0, x: 0 });

    const tl = gsap.timeline();
    tl.to(feedbackBadge, { scale: 1, duration: 0.35, ease: 'back.out(1.5)' });
    tl.to(feedbackBadge, { x: '+=4', duration: 0.04, yoyo: true, repeat: 6, ease: 'power2.inOut' });
    tl.to(feedbackBadge, { x: 0, duration: 0.05 });

    gsap.to(btnTop, {
      opacity: 1,
      scale: 1,
      duration: 0.5,
      delay: 0.8,
      ease: 'back.out(2)',
      onStart: () => btnTop.classList.add('visible'),
    });

    redirectTimer = gsap.delayedCall(2.5, () => {
      window.location.href = 'result.html?status=gameover';
    });
  }

  function playClearEffect() {
    createConfetti();
    showFeedbackBadge('clear', true);
    gsap.set(btnTop, { opacity: 0 });
    gsap.set(feedbackBadge, { scale: 0 });
    gsap.to(feedbackBadge, { scale: 1, duration: 0.6, delay: 0.2, ease: 'back.out(1.7)' });
    gsap.to(btnTop, { opacity: 1, duration: 0.3, delay: 1, onStart: () => btnTop.classList.add('visible') });
    redirectTimer = gsap.delayedCall(2.5, () => {
      window.location.href = 'result.html?status=clear';
    });
  }

  function handleChoiceClick() {
    if (answered) return;
    const isCorrect = this.getAttribute('data-correct') === 'true';

    if (isCorrect) {
      answered = true;
      problemChoices.querySelectorAll('.problem-choice').forEach((c) => (c.disabled = true));
      moveIconToNext();
      playCorrectEffect();

      if (correctCount >= TOTAL_QUESTIONS) {
        gsap.delayedCall(0.8, () => {
          hideFeedbackBadge();
          playClearEffect();
        });
      } else {
        gsap.delayedCall(0.8, () => {
          hideFeedbackBadge();
          currentQuestionIndex++;
          answered = false;
          renderQuestion();
          bindChoiceHandlers();
        });
      }
    } else {
      answered = true;
      problemChoices.querySelectorAll('.problem-choice').forEach((c) => (c.disabled = true));
      playIncorrectEffect();
    }
  }

  function init() {
    initTheme();
    renderQuestion();
    bindChoiceHandlers();
    updateIconPosition();

    btnTop.addEventListener('click', function (e) {
      e.preventDefault();
      cancelRedirect();
      window.location.href = 'index.html';
    });
  }

  init();
})();
