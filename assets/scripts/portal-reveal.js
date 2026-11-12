const clamp = (n,min,max) => Math.min(max,Math.max(min,n));
export function updatePortalReveal() {
  const section = document.querySelector('.wordmark-reveal');
  const glyph = document.querySelector('#a-glyph');
  const stage = document.querySelector('#hero-stage');
  const reveal = document.querySelector('#video-reveal');
  const video = document.querySelector('#hero-video');
  if (!section || !glyph || !stage || !reveal) return;
  const rect = section.getBoundingClientRect();
  const span = Math.max(1, section.offsetHeight - innerHeight);
  const progress = clamp(-rect.top / span,0,1);
  const r = glyph.getBoundingClientRect();
  const x = r.left + r.width * .5, y = r.top + r.height * .42;
  const start = 2.7, radius = start + progress * 160;
  stage.style.setProperty('--reveal-x', `${x}px`); stage.style.setProperty('--reveal-y', `${y}px`);
  stage.style.setProperty('--reveal-radius', `${radius}vmax`);
  reveal.style.clipPath = progress < .01
    ? 'polygon(50% 25.6%, 61% 53.6%, 39% 53.6%, 50% 25.6%)'
    : `circle(${radius}vmax at ${x}px ${y}px)`;
  reveal.style.opacity = String(clamp(progress * 12,0,1));
  stage.style.setProperty('--reveal-progress', String(progress));
  const progressBar=document.querySelector('#hero-progress');
  if(progressBar)progressBar.style.width=`${progress*100}%`;
  if (video && progress > .04 && video.paused) video.play().catch(()=>{});
  if (video && progress < .01 && !video.paused) video.pause();
  const note=document.querySelector('#hero-note'); if(note) note.style.opacity=String(1-progress*1.8);
  const copy=document.querySelector('#hero-transition-copy'); if(copy) copy.style.opacity=String(clamp((progress-.58)*2.6,0,1));
}
