/* ===========================================================
   reveal.js — IntersectionObserver-driven scroll reveal.
   Adds .is-visible to any [data-reveal] element when ~12% in view.
   =========================================================== */

const REVEAL_THRESHOLD = 0.12;
const REVEAL_ROOT_MARGIN = '0px 0px -8% 0px';

export function initReveal() {
    const targets = document.querySelectorAll('[data-reveal]');
    if (!targets.length) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion || !('IntersectionObserver' in window)) {
        targets.forEach(el => el.classList.add('is-visible'));
        return;
    }

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                obs.unobserve(entry.target);
            }
        });
    }, {
        threshold: REVEAL_THRESHOLD,
        rootMargin: REVEAL_ROOT_MARGIN,
    });

    targets.forEach(el => observer.observe(el));
}
