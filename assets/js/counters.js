/* ===========================================================
   counters.js — animated number counters
   Reads data-counter-target, optional data-counter-decimals (default 0)
   and data-counter-duration (ms, default 1500). Runs once on intersect.
   =========================================================== */

const DEFAULT_DURATION = 1500;
const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

function formatNumber(value, decimals) {
    return value.toLocaleString('en-IN', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    });
}

function animateCounter(el) {
    const target = parseFloat(el.dataset.counterTarget);
    const decimals = parseInt(el.dataset.counterDecimals, 10) || 0;
    const duration = parseInt(el.dataset.counterDuration, 10) || DEFAULT_DURATION;
    if (!Number.isFinite(target)) return;

    const start = performance.now();

    const tick = (now) => {
        const elapsed = now - start;
        const t = Math.min(1, elapsed / duration);
        const eased = easeOutCubic(t);
        const current = target * eased;
        el.textContent = formatNumber(current, decimals);
        if (t < 1) requestAnimationFrame(tick);
        else el.textContent = formatNumber(target, decimals);
    };

    requestAnimationFrame(tick);
}

export function initCounters() {
    const counters = document.querySelectorAll('[data-counter]');
    if (!counters.length) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion || !('IntersectionObserver' in window)) {
        counters.forEach(el => {
            const target = parseFloat(el.dataset.counterTarget);
            const decimals = parseInt(el.dataset.counterDecimals, 10) || 0;
            if (Number.isFinite(target)) el.textContent = formatNumber(target, decimals);
        });
        return;
    }

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.4 });

    counters.forEach(el => observer.observe(el));
}
