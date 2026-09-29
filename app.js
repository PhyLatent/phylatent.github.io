const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
let reducedMotion = motionPreference.matches;
if (reducedMotion) document.querySelectorAll('video[autoplay]').forEach(video => { video.pause(); video.removeAttribute('autoplay'); });

document.querySelector('#copy-citation')?.addEventListener('click', async () => {
  const button = document.querySelector('#copy-citation');
  const status = document.querySelector('.copy-status');
  const text = document.querySelector('#bibtex').textContent;
  try {
    await navigator.clipboard.writeText(text);
    button.textContent = 'Copied';
    status.textContent = 'BibTeX copied to clipboard.';
    setTimeout(() => { button.textContent = 'Copy BibTeX'; status.textContent = ''; }, 3000);
  } catch {
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(document.querySelector('#bibtex'));
    selection.removeAllRanges(); selection.addRange(range);
    status.textContent = 'Citation selected. Press Ctrl+C (or Command+C) to copy, or download the .bib file.';
  }
});

document.querySelectorAll('#hero-video, .case-row video').forEach(video => {
  let resumeWhenVisible = !reducedMotion;
  let automaticPauses = 0;
  video.addEventListener('pause', () => {
    if (automaticPauses > 0) { automaticPauses--; return; }
    resumeWhenVisible = false;
  });
  video.addEventListener('play', () => { resumeWhenVisible = true; });
  new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting || entry.intersectionRatio < 0.05) {
        if (!video.paused) automaticPauses++;
        video.pause();
      } else if (resumeWhenVisible && !reducedMotion) {
        video.play().catch(() => {});
      }
    }
  }, { threshold: 0.05 }).observe(video);
});

const navLinks = [...document.querySelectorAll('.nav-links a')];
const sectionObserver = new IntersectionObserver(entries => {
  const visible = entries.filter(entry => entry.isIntersecting);
  if (!visible.length) return;
  const id = visible[0].target.id;
  navLinks.forEach(link => {
    const active = link.getAttribute('href') === '#' + id;
    link.classList.toggle('active', active);
    if (active) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
}, { rootMargin: '-15% 0px -65% 0px' });
navLinks.forEach(link => sectionObserver.observe(document.querySelector(link.getAttribute('href'))));

// Leave the underlying content visible; reveal animations never change layout.
if ('IntersectionObserver' in window && 'animate' in Element.prototype) {
  const root = document.documentElement;
  const motionButton = document.querySelector('#motion-toggle');
  const introTargets = [...document.querySelectorAll('.hero > .eyebrow, .hero h1, .authors, .affiliations, .paper-actions, .hero-summary, .demo-section .section-kicker, .hero-film')];
  introTargets.forEach(element => {
    const finishIntro = () => element.classList.add('intro-done');
    element.addEventListener('animationend', event => {
      if (event.target === element && event.animationName === 'intro-rise') finishIntro();
    });
    element.addEventListener('focusin', finishIntro);
    element.addEventListener('pointerdown', finishIntro);
  });
  const revealAnimations = new Map();
  const revealed = new WeakSet();
  const revealTargets = [...document.querySelectorAll('.abstract h2, .section-heading, .paper-figure, .case-copy, .case-row figure, .principles article, .resource-grid > a, .result-summary > div, .table-title, .citation-heading')];
  let manuallyPaused = false;
  let printing = false;
  let heroVisible = true;
  const motionEnabled = () => !motionPreference.matches && !manuallyPaused && !printing;

  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting || entry.intersectionRatio < 0.1 || !motionEnabled()) return;
      revealObserver.unobserve(entry.target);
      revealed.add(entry.target);
      if (entry.target.matches(':focus-within') || revealAnimations.has(entry.target)) return;
      const isCard = entry.target.matches('.principles article, .resource-grid > a, .result-summary > div');
      const cardIndex = isCard ? [...entry.target.parentElement.children].indexOf(entry.target) : 0;
      const delay = window.matchMedia('(min-width: 761px)').matches ? Math.min(cardIndex, 2) * 90 : 0;
      const animation = entry.target.animate([
        { opacity: 0.35, translate: '0 20px' },
        { opacity: 1, translate: '0 0' }
      ], { duration: 750, delay, easing: 'cubic-bezier(.22, 1, .36, 1)', fill: 'backwards' });
      revealAnimations.set(entry.target, animation);
      const cancelOnInteraction = () => animation.cancel();
      entry.target.addEventListener('focusin', cancelOnInteraction);
      entry.target.addEventListener('pointerdown', cancelOnInteraction);
      animation.finished.catch(() => {}).finally(() => {
        revealAnimations.delete(entry.target);
        entry.target.removeEventListener('focusin', cancelOnInteraction);
        entry.target.removeEventListener('pointerdown', cancelOnInteraction);
      });
    });
  }, { threshold: [0, 0.1], rootMargin: '0px 0px -5% 0px' });

  const syncAmbientMotion = () => {
    root.classList.toggle('ambient-paused', !motionEnabled() || !heroVisible || document.hidden);
  };
  const syncMotion = () => {
    reducedMotion = motionPreference.matches;
    root.classList.toggle('motion-paused', !motionEnabled());
    if (!motionEnabled()) introTargets.forEach(element => element.classList.add('intro-done'));
    revealObserver.disconnect();
    revealAnimations.forEach(animation => animation.cancel());
    revealAnimations.clear();
    if (motionEnabled()) revealTargets.forEach(element => {
      if (revealed.has(element)) return;
      if (element.getBoundingClientRect().bottom <= 0) revealed.add(element);
      else revealObserver.observe(element);
    });
    motionButton.hidden = false;
    motionButton.disabled = reducedMotion;
    motionButton.textContent = reducedMotion ? 'Reduced motion' : manuallyPaused ? 'Resume motion' : 'Pause motion';
    motionButton.title = reducedMotion ? 'Motion follows your system accessibility setting.' : 'Control decorative animations. Video playback is unchanged.';
    syncAmbientMotion();
  };

  motionButton.addEventListener('click', () => { manuallyPaused = !manuallyPaused; syncMotion(); });
  motionPreference.addEventListener('change', () => {
    syncMotion();
    if (reducedMotion) document.querySelectorAll('video').forEach(video => video.pause());
  });
  window.addEventListener('beforeprint', () => { printing = true; syncMotion(); });
  window.addEventListener('afterprint', () => { printing = false; syncMotion(); });
  document.addEventListener('visibilitychange', syncAmbientMotion);
  new IntersectionObserver(entries => {
    heroVisible = entries[0].isIntersecting;
    syncAmbientMotion();
  }).observe(document.querySelector('.hero'));
  root.classList.add('motion-ready');
  syncMotion();
}

// A thin progress line gives scroll feedback without moving the page content.
let progressFrame = 0;
const updateReadingProgress = () => {
  progressFrame = 0;
  const maximumScroll = document.documentElement.scrollHeight - window.innerHeight;
  const progress = maximumScroll > 0 ? Math.min(1, Math.max(0, window.scrollY / maximumScroll)) : 0;
  document.documentElement.style.setProperty('--reading-progress', progress);
};
const queueReadingProgress = () => {
  if (!progressFrame) progressFrame = requestAnimationFrame(updateReadingProgress);
};
window.addEventListener('scroll', queueReadingProgress, { passive: true });
window.addEventListener('resize', queueReadingProgress);
if ('ResizeObserver' in window) new ResizeObserver(queueReadingProgress).observe(document.body);
updateReadingProgress();
