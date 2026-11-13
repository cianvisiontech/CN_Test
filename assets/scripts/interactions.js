/*
 * Pointer interactions (desktop only):
 *  - cursor spotlight on capability, project and journal cards  (sets --spot-x / --spot-y)
 *  - gentle 3D tilt on journal cards                            (sets --rx / --ry on the card link)
 */
export function initInteractions() {
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cards = document.querySelectorAll('.pillar-card, .project-card, .journal-card');
  cards.forEach(card => {
    const target = card.classList.contains('journal-card') ? card.firstElementChild : card;
    card.addEventListener('pointermove', e => {
      const r = card.getBoundingClientRect();
      const x = e.clientX - r.left, y = e.clientY - r.top;
      card.style.setProperty('--spot-x', `${x}px`); card.style.setProperty('--spot-y', `${y}px`);
      if (!reduce && target !== card && target) {
        target.style.setProperty('--ry', `${((x / r.width) - .5) * 6}deg`);
        target.style.setProperty('--rx', `${((y / r.height) - .5) * -6}deg`);
      }
    });
    card.addEventListener('pointerleave', () => {
      if (target && target !== card) { target.style.setProperty('--rx', '0deg'); target.style.setProperty('--ry', '0deg'); }
    });
  });
}
