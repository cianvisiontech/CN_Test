/*
 * Pointer interactions (desktop only):
 *  - cursor spotlight on capability, project and journal cards
 *  - gentle 3D tilt on journal cards and project visuals
 */
export function initInteractions() {
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cards = document.querySelectorAll('.pillar-card, .project-card, .journal-card');
  cards.forEach(card => {
    const target = card.classList.contains('journal-card')
      ? card.firstElementChild
      : card.classList.contains('project-card')
        ? card.querySelector('.project-visual')
        : card;
    card.addEventListener('pointermove', e => {
      const r = card.getBoundingClientRect();
      const x = e.clientX - r.left, y = e.clientY - r.top;
      card.style.setProperty('--spot-x', `${x}px`);
      card.style.setProperty('--spot-y', `${y}px`);
      if (!reduce && target) {
        target.style.setProperty('--ry', `${((x / r.width) - .5) * (card.classList.contains('project-card') ? 3.5 : 6)}deg`);
        target.style.setProperty('--rx', `${((y / r.height) - .5) * -3.5}deg`);
      }
    });
    card.addEventListener('pointerleave', () => {
      if (target) {
        target.style.setProperty('--rx', '0deg');
        target.style.setProperty('--ry', '0deg');
      }
    });
  });
}
