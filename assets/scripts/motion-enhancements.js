/*
 * Creative Nerds motion enhancements.
 * Lightweight, dependency-free interactions; all are disabled or simplified for reduced motion/touch.
 */
function splitHeadingWords(root) {
  if (!root || root.dataset.wordsReady === 'true' || root.closest('[aria-hidden="true"]')) return;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      return node.nodeValue.trim() && node.parentElement?.closest('script,style,.word') === null
        ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
    }
  });
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach(node => {
    const fragment = document.createDocumentFragment();
    const parts = node.nodeValue.split(/(\s+)/);
    let wordIndex = 0;
    parts.forEach(part => {
      if (!part) return;
      if (/^\s+$/.test(part)) fragment.append(document.createTextNode(part));
      else {
        const word = document.createElement('span');
        word.className = 'word';
        word.style.setProperty('--word-index', wordIndex++);
        word.textContent = part;
        fragment.append(word);
      }
    });
    node.replaceWith(fragment);
  });
  root.classList.add('word-reveal');
  root.dataset.wordsReady = 'true';
}

export function initMotionEnhancements() {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.querySelectorAll('.hero-heading, .section-heading h2, .page-hero h1, .case-next h2').forEach(splitHeadingWords);

  // Desktop-only project cursor; native pointer remains available everywhere else.
  if (matchMedia('(hover: hover) and (pointer: fine)').matches && !reduce) {
    const cursor = document.createElement('div');
    cursor.className = 'custom-cursor';
    cursor.setAttribute('aria-hidden', 'true');
    cursor.innerHTML = '<svg viewBox="0 0 32 32" focusable="false"><path d="M10.2 20.2a8.1 8.1 0 1 1 11.6 0c-1.6 1.5-2.2 2.5-2.4 4.3h-6.8c-.2-1.8-.8-2.8-2.4-4.3Z"/><path d="M13.1 27h5.8M14 30h4M16 1v3M4.2 5.2l2.2 2.2M1 16h3M27.8 7.4 30 5.2M28 16h3"/></svg>';
    document.body.append(cursor);
    document.addEventListener('pointermove', event => {
      cursor.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0) translate(-50%, -50%)`;
    }, {passive:true});
    document.querySelectorAll('.project-visual').forEach(target => {
      target.addEventListener('pointerenter', () => {
        document.body.classList.add('cursor-active','cursor-hover');
      });
      target.addEventListener('pointerleave', () => {
        document.body.classList.remove('cursor-hover');
        if (!document.querySelector('.project-visual:hover')) document.body.classList.remove('cursor-active');
      });
    });
  }
}
