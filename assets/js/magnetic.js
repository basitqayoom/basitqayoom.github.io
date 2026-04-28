/* ===========================================================
   magnetic.js — magnetic hover effect.
   Listens on each [data-magnetic] target; reads optional
   data-magnetic-strength (default 0.3); writes --mag-x / --mag-y
   custom properties that are consumed by CSS transforms.
   =========================================================== */

const DEFAULT_STRENGTH = 0.3;
const MAX_OFFSET_PX = 14;

export function initMagnetic() {
    const supportsHover = window.matchMedia('(hover: hover)').matches;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!supportsHover || reduceMotion) return;

    const targets = document.querySelectorAll('[data-magnetic]');
    if (!targets.length) return;

    targets.forEach(el => {
        const strength = parseFloat(el.dataset.magneticStrength) || DEFAULT_STRENGTH;
        let raf = 0;

        const onMove = (e) => {
            cancelAnimationFrame(raf);
            raf = requestAnimationFrame(() => {
                const rect = el.getBoundingClientRect();
                const cx = rect.left + rect.width / 2;
                const cy = rect.top + rect.height / 2;
                let dx = (e.clientX - cx) * strength;
                let dy = (e.clientY - cy) * strength;
                dx = Math.max(-MAX_OFFSET_PX, Math.min(MAX_OFFSET_PX, dx));
                dy = Math.max(-MAX_OFFSET_PX, Math.min(MAX_OFFSET_PX, dy));
                el.style.setProperty('--mag-x', `${dx.toFixed(2)}px`);
                el.style.setProperty('--mag-y', `${dy.toFixed(2)}px`);
            });
        };

        const onLeave = () => {
            cancelAnimationFrame(raf);
            el.style.setProperty('--mag-x', '0px');
            el.style.setProperty('--mag-y', '0px');
        };

        el.addEventListener('mousemove', onMove);
        el.addEventListener('mouseleave', onLeave);
    });
}
