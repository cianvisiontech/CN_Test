export function initNavigation() {
  const button = document.querySelector('.menu-toggle');
  const links = document.querySelector('.nav-links');
  if (!button || !links) return;
  const close = () => { button.setAttribute('aria-expanded','false'); links.classList.remove('is-open'); document.body.classList.remove('menu-open'); };
  button.addEventListener('click', () => {
    const open = button.getAttribute('aria-expanded') !== 'true';
    button.setAttribute('aria-expanded', String(open)); links.classList.toggle('is-open',open); document.body.classList.toggle('menu-open',open);
  });
  links.addEventListener('click', e => { if (e.target.closest('a')) close(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  window.addEventListener('resize', () => { if (innerWidth > 850) close(); });
}
