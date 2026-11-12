export function initScrollEffects() {
  document.documentElement.classList.add('motion-ready');
  document.querySelectorAll('[data-year]').forEach(node => node.textContent = new Date().getFullYear());

  const progress = document.createElement('div');
  progress.className = 'page-progress';
  progress.setAttribute('aria-hidden', 'true');
  document.body.append(progress);

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }), { threshold: .12, rootMargin: '0px 0px -4% 0px' });
    document.querySelectorAll('.reveal').forEach((node, index) => {
      node.dataset.delay = 'true';
      node.style.setProperty('--reveal-delay', `${Math.min(index % 4, 3) * 90}ms`);
      observer.observe(node);
    });
  } else {
    document.querySelectorAll('.reveal').forEach(node => node.classList.add('visible'));
  }

  let pending = false;
  const update = () => {
    pending = false;
    const range = document.documentElement.scrollHeight - innerHeight;
    progress.style.width = `${range > 0 ? (scrollY / range) * 100 : 0}%`;
    document.querySelector('.site-header')?.classList.toggle('compact', scrollY > 24);
    const hero = document.querySelector('.hero-title');
    if (hero && matchMedia('(prefers-reduced-motion: reduce)').matches === false) {
      hero.style.setProperty('--hero-drift', `${Math.min(scrollY * .12, 44)}px`);
    }
  };
  addEventListener('scroll', () => {
    if (!pending) { pending = true; requestAnimationFrame(update); }
  }, { passive: true });
  update();

  document.querySelectorAll('.service-card, .work-card, .article-card').forEach(card => {
    card.addEventListener('pointermove', event => {
      const box = card.getBoundingClientRect();
      card.style.setProperty('--pointer-x', `${event.clientX - box.left}px`);
      card.style.setProperty('--pointer-y', `${event.clientY - box.top}px`);
    }, { passive: true });
  });
}
