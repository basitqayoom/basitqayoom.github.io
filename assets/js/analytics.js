/* ===========================================================
   analytics.js — GA4 event tracking
   Outbound links · Resume download · Email / phone clicks ·
   Section views · Scroll depth · Theme toggle · Nav clicks
   =========================================================== */

const safeGtag = (...args) => {
    if (typeof window.gtag === 'function') window.gtag(...args);
};

const inferPlatform = (host) => {
    if (/linkedin\.com$/i.test(host)) return 'linkedin';
    if (/github\.com$/i.test(host)) return 'github';
    if (/leetcode\.com$/i.test(host)) return 'leetcode';
    if (/(twitter|x)\.com$/i.test(host)) return 'twitter';
    return 'other';
};

function initLinkTracking() {
    document.addEventListener('click', (e) => {
        const target = e.target;
        if (!(target instanceof Element)) return;
        const link = target.closest('a[href]');
        if (!link) return;

        const href = link.getAttribute('href') || '';
        const text = (link.innerText || link.getAttribute('aria-label') || '').trim();

        const isMailto = href.startsWith('mailto:');
        const isTel = href.startsWith('tel:');
        const isHash = href.startsWith('#') && href.length > 1;
        const isResume = link.hasAttribute('download') && /\.pdf$/i.test(href);
        const isExternal = !!link.hostname && link.hostname !== window.location.hostname && !isMailto && !isTel;

        if (isResume) {
            safeGtag('event', 'file_download', {
                file_name: 'Basit_Qayoom_CV.pdf',
                file_extension: 'pdf',
                link_text: text,
            });
            return;
        }

        if (isMailto) {
            safeGtag('event', 'contact_click', {
                method: 'email',
                value: href.replace(/^mailto:/i, ''),
                link_text: text,
            });
            return;
        }

        if (isTel) {
            safeGtag('event', 'contact_click', {
                method: 'phone',
                value: href.replace(/^tel:/i, ''),
                link_text: text,
            });
            return;
        }

        if (isExternal) {
            safeGtag('event', 'outbound_click', {
                link_url: link.href,
                link_domain: link.hostname,
                link_text: text,
                platform: inferPlatform(link.hostname),
            });
            return;
        }

        if (isHash) {
            safeGtag('event', 'nav_click', {
                section_id: href.slice(1),
                link_text: text,
            });
        }
    }, { capture: true });
}

function initThemeToggleTracking() {
    const toggle = document.getElementById('themeToggle');
    if (!toggle) return;
    toggle.addEventListener('click', () => {
        // dataset.theme is updated *before* gtag fires? toggle handler in main.js
        // also runs on click; both listeners are independent — read the
        // post-toggle theme on next tick.
        requestAnimationFrame(() => {
            const theme = document.documentElement.dataset.theme || 'unknown';
            safeGtag('event', 'theme_toggle', { theme });
        });
    });
}

function initSectionViewTracking() {
    const sections = document.querySelectorAll('main section[id]');
    if (!sections.length || !('IntersectionObserver' in window)) return;
    const seen = new Set();

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const id = entry.target.id;
            if (seen.has(id)) return;
            seen.add(id);
            safeGtag('event', 'section_view', { section_id: id });
        });
    }, { threshold: 0.4 });

    sections.forEach((section) => observer.observe(section));
}

function initScrollDepthTracking() {
    const milestones = [25, 50, 75, 90];
    const fired = new Set();
    let ticking = false;

    const measure = () => {
        const docH = document.documentElement.scrollHeight - window.innerHeight;
        if (docH <= 0) return;
        const pct = (window.scrollY / docH) * 100;
        milestones.forEach((m) => {
            if (pct >= m && !fired.has(m)) {
                fired.add(m);
                safeGtag('event', 'scroll_depth', { percent: m });
            }
        });
    };

    const onScroll = () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
            measure();
            ticking = false;
        });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    measure();
}

export function initAnalytics() {
    initLinkTracking();
    initThemeToggleTracking();
    initSectionViewTracking();
    initScrollDepthTracking();
}
