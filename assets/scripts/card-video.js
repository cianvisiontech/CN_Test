export function initCardVideos() {
  const videos = [...document.querySelectorAll('[data-card-video]')];
  if (!videos.length || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const play = video => video.play().then(() => video.closest('.project-visual')?.classList.add('is-playing')).catch(() => {});
  const pause = video => {
    video.pause();
    video.closest('.project-visual')?.classList.remove('is-playing');
  };
  if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
    videos.forEach(video => {
      const card = video.closest('.project-card');
      card?.addEventListener('pointerenter', () => play(video));
      card?.addEventListener('pointerleave', () => pause(video));
    });
  } else {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) play(entry.target);
      else pause(entry.target);
    }), {threshold:.6});
    videos.forEach(video => observer.observe(video));
  }
}
