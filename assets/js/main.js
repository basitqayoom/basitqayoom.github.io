/* ===========================================================
   main.js — entrypoint
   Theme · Progress rail · Nav scroll · Active section ·
   Custom cursor · Local time · Bootstrapping observers
   =========================================================== */

import { initReveal } from './reveal.js';
import { initCounters } from './counters.js';
import { initMagnetic } from './magnetic.js';

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const supportsHover = window.matchMedia('(hover: hover)').matches;

/* ---------- Theme ---------- */
const THEME_KEY = 'bqc:theme';

function initTheme() {
    const root = document.documentElement;
    const toggle = document.getElementById('themeToggle');
    if (!toggle) return;

    const stored = localStorage.getItem(THEME_KEY);
    const systemPrefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
    const initial = stored || (systemPrefersLight ? 'light' : 'dark');

    setTheme(initial, false);

    toggle.addEventListener('click', () => {
        const current = root.dataset.theme;
        setTheme(current === 'light' ? 'dark' : 'light', true);
    });

    function setTheme(theme, persist) {
        root.dataset.theme = theme;
        toggle.setAttribute('aria-pressed', String(theme === 'light'));
        if (persist) localStorage.setItem(THEME_KEY, theme);
    }
}

/* ---------- Scroll: progress rail + nav state + active section ---------- */
function initScroll() {
    const fill = document.getElementById('progressFill');
    const nav = document.getElementById('nav');
    let ticking = false;

    const onScroll = () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
            const docH = document.documentElement.scrollHeight - window.innerHeight;
            const pct = docH > 0 ? (window.scrollY / docH) * 100 : 0;
            if (fill) fill.style.width = `${pct}%`;
            if (nav) nav.classList.toggle('is-scrolled', window.scrollY > 8);
            ticking = false;
        });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    // Active section tracking
    const navLinks = document.querySelectorAll('.nav__links a');
    if (!navLinks.length) return;

    const sectionMap = new Map();
    navLinks.forEach(link => {
        const id = link.getAttribute('href')?.slice(1);
        const el = id ? document.getElementById(id) : null;
        if (el) sectionMap.set(el, link);
    });

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const link = sectionMap.get(entry.target);
            if (!link) return;
            if (entry.isIntersecting) {
                navLinks.forEach(l => {
                    l.classList.remove('is-active');
                    l.removeAttribute('aria-current');
                });
                link.classList.add('is-active');
                link.setAttribute('aria-current', 'true');
            }
        });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

    sectionMap.forEach((_link, el) => sectionObserver.observe(el));
}

/* ---------- Custom cursor ---------- */
function initCursor() {
    if (!supportsHover || prefersReducedMotion) return;
    const cursor = document.getElementById('cursor');
    if (!cursor) return;

    const dot = cursor.querySelector('.cursor__dot');
    const ring = cursor.querySelector('.cursor__ring');
    if (!dot || !ring) return;

    let mx = -100, my = -100;
    let rx = -100, ry = -100;
    let raf;

    const tick = () => {
        rx += (mx - rx) * 0.18;
        ry += (my - ry) * 0.18;
        dot.style.transform = `translate3d(${mx}px, ${my}px, 0) translate(-50%, -50%)`;
        ring.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%)`;
        raf = requestAnimationFrame(tick);
    };
    tick();

    document.addEventListener('mousemove', (e) => {
        mx = e.clientX;
        my = e.clientY;
    }, { passive: true });

    document.addEventListener('mouseleave', () => cursor.classList.add('is-hidden'));
    document.addEventListener('mouseenter', () => cursor.classList.remove('is-hidden'));

    const interactiveSelector = 'a, button, [data-magnetic], summary, label, input, textarea';
    document.addEventListener('mouseover', (e) => {
        const target = e.target;
        if (!(target instanceof Element)) return;
        if (target.closest(interactiveSelector)) {
            cursor.classList.add('is-hover');
        }
    });
    document.addEventListener('mouseout', (e) => {
        const target = e.target;
        const related = e.relatedTarget;
        if (!(target instanceof Element)) return;
        const wasInteractive = target.closest(interactiveSelector);
        const stillInteractive = related instanceof Element && related.closest(interactiveSelector);
        if (wasInteractive && !stillInteractive) {
            cursor.classList.remove('is-hover');
        }
    });
}

/* ---------- Local time (Noida / IST) ---------- */
function initLocalTime() {
    const el = document.getElementById('localTime');
    if (!el) return;

    const formatter = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    });

    const update = () => {
        el.textContent = `${formatter.format(new Date())} IST`;
    };
    update();
    setInterval(update, 30_000);
}

/* ---------- Smooth-scroll polyfill for hash links (with nav offset) ---------- */
function initHashScroll() {
    const links = document.querySelectorAll('a[href^="#"]');
    links.forEach(a => {
        a.addEventListener('click', (e) => {
            const href = a.getAttribute('href');
            if (!href || href === '#' || href.length < 2) return;
            const target = document.querySelector(href);
            if (!target) return;
            e.preventDefault();
            target.scrollIntoView({
                behavior: prefersReducedMotion ? 'auto' : 'smooth',
                block: 'start',
            });
            history.pushState(null, '', href);
        });
    });
}

/* ---------- Bootstrap ---------- */
function bootstrap() {
    initTheme();
    initScroll();
    initCursor();
    initLocalTime();
    initHashScroll();
    initReveal();
    initCounters();
    initMagnetic();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap);
} else {
    bootstrap();
}
