import { initNavigation } from './navigation.js';
import { initScrollEffects } from './scroll-effects.js';
import { initPortfolioFilter } from './portfolio-filter.js';
import { initContactForm } from './contact-form.js';
import { initPreviewPlaceholders } from './preview-placeholders.js';
import { initInteractions } from './interactions.js';
import { initMotionEnhancements } from './motion-enhancements.js';

document.documentElement.classList.add('js','js-ready');
initNavigation();
initMotionEnhancements();
initScrollEffects();
initPortfolioFilter();
initContactForm();
initPreviewPlaceholders();
initInteractions();
document.querySelectorAll('[data-year]').forEach(el => el.textContent = new Date().getFullYear());
