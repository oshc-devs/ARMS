(function () {
    'use strict';

    /* ─────────────────────────────────────────────────────────
     * Register plugins – guard against missing ScrollSmoother
     * (cdnjs may not carry the club-tier plugin)
     * ───────────────────────────────────────────────────────── */
    const corePlugins = [ScrollTrigger, ScrollToPlugin];

    if (typeof ScrollSmoother !== 'undefined') {
        corePlugins.push(ScrollSmoother);
    }

    gsap.registerPlugin(...corePlugins);

    /* ─────────────────────────────────────────────────────────
     * ScrollSmoother – with full fallback to native scroll
     * ───────────────────────────────────────────────────────── */
    let smoother = null;

    function restoreNativeScroll() {
        /* Undo the CSS-lock so the page can scroll normally */
        document.documentElement.classList.add('no-smoother');
        document.body.style.overflow = '';

        const wrapper = document.getElementById('smooth-wrapper');
        const content = document.getElementById('smooth-content');

        if (wrapper) {
            wrapper.style.cssText =
                'position:relative;overflow:visible;height:auto;width:100%;';
        }
        if (content) {
            content.style.cssText = 'overflow:visible;width:100%;';
        }
    }

    if (typeof ScrollSmoother !== 'undefined') {
        try {
            smoother = ScrollSmoother.create({
                wrapper:     '#smooth-wrapper',
                content:     '#smooth-content',
                smooth:      2,        /* higher = more lag / silkier */
                effects:     true,       /* enables data-speed / data-lag attrs */
                smoothTouch: 0.1,        /* subtle on mobile */
                normalizeScroll: true,   /* prevent browser-native jank */
            });
        } catch (err) {
            console.warn('[ARMS] ScrollSmoother init failed – native scroll restored.', err);
            restoreNativeScroll();
        }
    } else {
        console.warn('[ARMS] ScrollSmoother not loaded – native scroll restored.');
        restoreNativeScroll();
    }

    /* ─────────────────────────────────────────────────────────
     * 1. NAVBAR — transparent → solid on scroll
     * ───────────────────────────────────────────────────────── */
    const navbar = document.querySelector('.navbar-arms');

    ScrollTrigger.create({
        start:       'top -60',
        onEnter:     () => navbar.classList.add('scrolled'),
        onLeaveBack: () => navbar.classList.remove('scrolled'),
    });

    /* ─────────────────────────────────────────────────────────
     * 2. SMOOTH HASH-LINK SCROLLING
     *    Uses smoother.scrollTo() when active, gsap.to() fallback
     * ───────────────────────────────────────────────────────── */
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', function (e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (!target) return;
            e.preventDefault();

            const offset = navbar.offsetHeight;

            if (smoother) {
                smoother.scrollTo(target, true, 'top ' + offset + 'px');
            } else {
                const top = target.getBoundingClientRect().top + window.scrollY - offset;
                gsap.to(window, { scrollTo: { y: top }, duration: 1.1, ease: 'power3.inOut' });
            }
        });
    });

    /* ─────────────────────────────────────────────────────────
     * 3. HERO — entrance animation (page load)
     * ───────────────────────────────────────────────────────── */
    const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    heroTl
        .from('.hero-eyebrow',  { opacity: 0, y: 28, duration: .7, delay: .2 })
        .from('.hero-title',    { opacity: 0, y: 40, duration: .8 }, '-=.4')
        .from('.hero-lead',     { opacity: 0, y: 28, duration: .7 }, '-=.5')
        .from('.hero-btns > *', { opacity: 0, y: 22, duration: .6, stagger: .15 }, '-=.4');

    /* ─────────────────────────────────────────────────────────
     * 4. CTA band — immersive entrance
     * ───────────────────────────────────────────────────────── */
    gsap.from('.cta-immersive-content', {
        scrollTrigger: { trigger: '.cta-band', start: 'top 80%' },
        opacity: 0, y: 60, duration: 1.2, ease: 'power4.out',
    });

    /* ─────────────────────────────────────────────────────────
     * 5. REGISTER — Redirect for First Aid Training Providers
     * ───────────────────────────────────────────────────────── */
    const typeSelect = document.getElementById('accreditation_type');
    const nextBtn    = document.getElementById('nextBtn');

    if (nextBtn && typeSelect) {
        nextBtn.addEventListener('click', function () {
            if (typeSelect.value === '7') {
                window.open('https://forms.gle/di975FSGsJE3d7Na7', '_blank');
            } else {
                /* For other selections that are not yet open */
                if (typeSelect.value) {
                    alert('Registration for this category is not yet open on ARMS. Please check back later.');
                } else {
                    typeSelect.reportValidity();
                }
            }
        });
    }

})();
