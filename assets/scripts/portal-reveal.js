/*
 * Portal reveal – the video lives inside the "A" of the CREATIVE NERDS wordmark.
 *
 * How it works
 *  - The wordmark is an inline SVG (index.html -> <svg class="portal-wordmark">). Letters are outlined paths.
 *  - A paper-coloured layer covers the video. The "A" is cut out of it with an SVG mask, so the video shows through the A.
 *  - While you scroll, the whole wordmark zooms toward the A. The other letters fly off-screen (so the wordmark
 *    never stays on top of the video) and the A grows until the video fills the screen.
 *  - The MAKE MATTER. statement below slides in with the scroll.
 *
 * Edit: artwork = the SVG in src/pages/index.html · zoom length = ".portal{height}" in assets/styles/pages.css
 */
const smooth = (a, b, t) => { const x = Math.max(0, Math.min(1, (t - a) / (b - a))); return x * x * (3 - 2 * x); };
const state = { ready: false, off: false };

function setup() {
  const portal = document.querySelector('.portal');
  const video = document.querySelector('.portal-video');
  const svg = document.querySelector('.portal-wordmark');
  if (!portal || !video || !svg) { state.off = true; return; }
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) { state.off = true; video.pause(); return; }
  Object.assign(state, {
    portal, video, svg,
    fills: svg.querySelectorAll('.pm-fill'), hole: svg.querySelector('.pm-hole'), sil: svg.querySelector('.pm-sil'),
    ink: svg.querySelector('.pm-ink'), ring: svg.querySelector('.pm-ring'), mask: svg.querySelector('#portal-mask'),
    copy: document.querySelector('.portal-copy'), scrim: document.querySelector('.portal-scrim'),
    track: document.querySelector('.portal-track'), hint: document.querySelector('.portal-hint'),
    U: { w: +svg.dataset.w, h: +svg.dataset.h, cap: +svg.dataset.cap, ax: +svg.dataset.ax, ay: +svg.dataset.ay, r: +svg.dataset.r }
  });
  state.ready = true; layout();
  addEventListener('resize', () => { layout(); updatePortalReveal(); }, { passive: true });
}

function layout() {
  const s = state, U = s.U;
  s.vw = s.svg.clientWidth; s.vh = s.svg.clientHeight;
  s.svg.setAttribute('viewBox', `0 0 ${s.vw} ${s.vh}`);
  s.mask.setAttribute('x', 0); s.mask.setAttribute('y', 0);
  s.mask.setAttribute('width', s.vw); s.mask.setAttribute('height', s.vh);
  s.fills.forEach(r => { r.setAttribute('width', s.vw); r.setAttribute('height', s.vh); });
  const fit = s.vw < 700 ? 0.9 : 0.8;
  s.k = Math.min((s.vw * fit) / U.w, (s.vh * 0.6) / U.h);
  s.x0 = (s.vw - U.w * s.k) / 2;
  s.y0 = (s.vh - U.h * s.k) / 2 + U.cap * s.k;
  s.ox = s.x0 + U.ax * s.k; s.oy = s.y0 + U.ay * s.k;
  s.smax = (Math.hypot(s.vw, s.vh) / 2 * 1.08) / (U.r * s.k);
}

export function updatePortalReveal() {
  if (!state.ready && !state.off) setup();
  updateMakeMatter();
  if (!state.ready) return;
  const s = state;
  const range = Math.max(1, s.portal.offsetHeight - innerHeight);
  const p = Math.max(0, Math.min(1, -s.portal.getBoundingClientRect().top / range));
  if (p > 0 && p < 1 && s.video.paused) s.video.play().catch(() => {});
  if (p <= 0 && !s.video.paused) s.video.pause();
  const t = p < 0.06 ? 0 : (p > 0.86 ? 1 : (p - 0.06) / 0.8);
  const e = t * t * (3 - 2 * t);
  const sc = Math.exp(Math.log(s.smax) * e);
  const px = s.ox + (s.vw / 2 - s.ox) * e, py = s.oy + (s.vh / 2 - s.oy) * e;
  const sk = sc * s.k, tx = px + sc * (s.x0 - s.ox), ty = py + sc * (s.y0 - s.oy);
  const m = `matrix(${sk} 0 0 ${sk} ${tx} ${ty})`;
  s.hole.setAttribute('transform', m); s.ink.setAttribute('transform', m);
  s.sil.setAttribute('fill-opacity', smooth(0.12, 0.5, e).toFixed(3));
  s.ring.setAttribute('stroke-opacity', (1 - smooth(0, 0.3, e)).toFixed(3));
  const copyIn = smooth(0.84, 1, p);
  if (s.copy) { s.copy.style.opacity = copyIn; s.copy.style.transform = `translateY(${(1 - copyIn) * 18}px)`; }
  if (s.scrim) s.scrim.style.opacity = copyIn;
  if (s.hint) s.hint.style.opacity = 1 - smooth(0, 0.07, p);
  if (s.track) s.track.style.width = `${p * 100}%`;
}

let mm;
function updateMakeMatter() {
  mm = mm || document.querySelector('.make-matter');
  if (!mm) return;
  const r = mm.getBoundingClientRect();
  if (r.top < innerHeight * 0.8) mm.classList.add('in-view');
  const p = Math.max(-1, Math.min(1, (r.top + r.height / 2 - innerHeight / 2) / innerHeight)); // -1..1
  const a = mm.querySelector('.mm-a'), b = mm.querySelector('.mm-b');
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (a) a.style.setProperty('--mm-x', `${(-p * 6).toFixed(2)}vw`);
  if (b) b.style.setProperty('--mm-x', `${(p * 9).toFixed(2)}vw`);
}
