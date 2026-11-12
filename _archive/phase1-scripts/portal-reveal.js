export function initPortalReveal() {
  const portal = document.querySelector('.portal');
  const video = document.querySelector('.portal-video');
  const letter = document.querySelector('.portal-letter');
  const copy = document.querySelector('.portal-copy');
  const scrim = document.querySelector('.portal-scrim');
  const track = document.querySelector('.portal-track');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) { video?.removeAttribute('autoplay'); video?.pause(); return; }
  video?.play().catch(() => {});
  if (!portal || !video) return;

  let pending = false;
  const update = () => {
    pending = false;
    const range = Math.max(1, portal.offsetHeight - innerHeight);
    const p = Math.max(0, Math.min(1, -portal.getBoundingClientRect().top / range));
    const ease = p * p * (3 - 2 * p);
    const pct = (from, to) => `${(from + (to - from) * ease).toFixed(2)}%`;
    video.style.clipPath = `polygon(${pct(50,0)} ${pct(22,0)},${pct(61,100)} ${pct(56,0)},${pct(39,100)} ${pct(56,100)},${pct(50,0)} ${pct(22,100)})`;
    if (letter) letter.style.opacity = String(1 - p);
    const visible = Math.max(0, Math.min(1, (p - .35) / .25));
    if (copy) { copy.style.opacity = visible; copy.style.transform = `translateY(${(1 - visible) * 16}px)`; }
    if (scrim) scrim.style.opacity = visible;
    if (track) track.style.width = `${100 * p}%`;
  };
  addEventListener('scroll', () => {
    if (!pending) { pending = true; requestAnimationFrame(update); }
  }, { passive: true });
  addEventListener('resize', update, { passive: true });
  update();
}
