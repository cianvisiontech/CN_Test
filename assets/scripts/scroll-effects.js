import { updatePortalReveal } from './portal-reveal.js';

export function initScrollEffects() {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const items = document.querySelectorAll('.reveal, .reveal-text, .word-reveal, .image-reveal');
  if (!reduce && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('is-visible','visible'); observer.unobserve(entry.target); }
    }), {threshold:.14, rootMargin:'0px 0px -35px 0px'});
    items.forEach(item => observer.observe(item));
  } else items.forEach(item => item.classList.add('is-visible','visible'));
  let queued = false;
  const update = () => {
    if (queued) return; queued = true;
    requestAnimationFrame(() => { updatePortalReveal(); const pageProgress = scrollY / Math.max(1, document.documentElement.scrollHeight - innerHeight);
    document.documentElement.style.setProperty('--scroll-progress', `${pageProgress}`);
    document.querySelectorAll('.process-timeline').forEach(timeline => {
      const rect = timeline.getBoundingClientRect();
      const span = Math.max(1, rect.height + innerHeight * .5);
      const progress = Math.max(0, Math.min(1, (innerHeight * .8 - rect.top) / span));
      timeline.style.setProperty('--timeline-progress', `${progress * 100}%`);
    });
    queued = false; });
  };
  addEventListener('scroll', update, {passive:true}); addEventListener('resize', update); update();
}
