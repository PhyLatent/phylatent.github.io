const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
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

// Keep content visible by default; animate only when it first enters the viewport.
if (!reducedMotion && 'IntersectionObserver' in window && 'animate' in Element.prototype) {
  const revealAnimations = new Set();
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      revealObserver.unobserve(entry.target);
      if (entry.target.matches(':focus-within')) return;
      const animation = entry.target.animate([
        { opacity: 0, translate: '0 8px' },
        { opacity: 1, translate: '0 0' }
      ], { duration: 450, easing: 'cubic-bezier(.22, 1, .36, 1)' });
      revealAnimations.add(animation);
      const cancelOnFocus = () => animation.cancel();
      entry.target.addEventListener('focusin', cancelOnFocus);
      animation.finished.catch(() => {}).finally(() => {
        revealAnimations.delete(animation);
        entry.target.removeEventListener('focusin', cancelOnFocus);
      });
    });
  }, { threshold: 0 });

  document.querySelectorAll('.section-heading, .principles article, .resource-grid > a').forEach(element => {
    if (element.getBoundingClientRect().top >= window.innerHeight) revealObserver.observe(element);
  });

  const stopReveals = () => {
    revealObserver.disconnect();
    revealAnimations.forEach(animation => animation.cancel());
    revealAnimations.clear();
  };
  window.addEventListener('beforeprint', stopReveals);
  window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', event => {
    if (event.matches) stopReveals();
  });
}
