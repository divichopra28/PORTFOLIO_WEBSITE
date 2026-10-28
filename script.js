// ============================================
// SETUP & FEATURE DETECTION
// ============================================

const htmlElement = document.documentElement;
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const hasGSAP = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
const animate = hasGSAP && !prefersReducedMotion;

const CONTACT_EMAIL = 'divi.chopra28@gmail.com';
// Replace YOUR_FORM_ID with your Formspree form ID (https://formspree.io)
const FORM_ENDPOINT = 'https://formspree.io/f/YOUR_FORM_ID';

let lenis = null;

if (hasGSAP) {
    gsap.registerPlugin(ScrollTrigger);
}

// localStorage can throw in private browsing / with blocked storage
const storage = {
    get(key) {
        try { return localStorage.getItem(key); } catch (e) { return null; }
    },
    set(key, value) {
        try { localStorage.setItem(key, value); } catch (e) { /* storage unavailable */ }
    }
};

// ============================================
// DARK MODE TOGGLE
// ============================================

const themeToggle = document.getElementById('themeToggle');
const themeColorMeta = document.querySelector('meta[name="theme-color"]');
const systemDark = window.matchMedia('(prefers-color-scheme: dark)');

function getPreferredTheme() {
    const saved = storage.get('theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return systemDark.matches ? 'dark' : 'light';
}

applyTheme(getPreferredTheme());

themeToggle.addEventListener('click', toggleTheme);

// Follow the OS setting until the visitor picks a theme themselves
systemDark.addEventListener('change', (e) => {
    if (!storage.get('theme')) applyTheme(e.matches ? 'dark' : 'light');
});

function applyTheme(theme) {
    htmlElement.setAttribute('data-theme', theme);
    updateThemeToggle(theme);
    if (themeColorMeta) themeColorMeta.setAttribute('content', theme === 'dark' ? '#241A13' : '#F5EFE6');
}

function updateThemeToggle(theme) {
    themeToggle.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
}

function toggleTheme() {
    const newTheme = htmlElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    storage.set('theme', newTheme);

    if (prefersReducedMotion) {
        applyTheme(newTheme);
        return;
    }

    // Fallback: simple colour fade
    if (!document.startViewTransition) {
        htmlElement.classList.add('theme-fading');
        applyTheme(newTheme);
        setTimeout(() => htmlElement.classList.remove('theme-fading'), 500);
        return;
    }

    // Circular reveal spreading from the toggle button
    const rect = themeToggle.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));

    const transition = document.startViewTransition(() => applyTheme(newTheme));
    transition.ready.then(() => {
        htmlElement.animate(
            { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
            { duration: 700, easing: 'cubic-bezier(0.65, 0, 0.35, 1)', pseudoElement: '::view-transition-new(root)' }
        );
    }).catch(() => { /* transition skipped */ });
}

// ============================================
// SMOOTH SCROLL (LENIS)
// ============================================

if (animate && typeof window.Lenis !== 'undefined') {
    lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
}

function scrollToTarget(target) {
    if (lenis) {
        lenis.scrollTo(target, { offset: 0 });
    } else {
        target.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
    }
}

// ============================================
// MOBILE NAVIGATION
// ============================================

const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');

function setMenu(open) {
    hamburger.classList.toggle('active', open);
    navLinks.classList.toggle('active', open);
    document.body.classList.toggle('menu-open', open);
    hamburger.setAttribute('aria-expanded', String(open));
    hamburger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.body.style.overflow = open ? 'hidden' : '';
    if (lenis) open ? lenis.stop() : lenis.start();
}

hamburger.addEventListener('click', () => {
    setMenu(!navLinks.classList.contains('active'));
});

// Close mobile menu when a link is clicked
navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => setMenu(false));
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navLinks.classList.contains('active')) {
        setMenu(false);
        hamburger.focus();
    }
});

// ============================================
// SCROLL: NAVBAR, PROGRESS, BACK TO TOP, ACTIVE LINK
// ============================================

const navbar = document.querySelector('.navbar');
const progressBar = document.querySelector('.scroll-progress');
const backToTop = document.getElementById('backToTop');
const ringProgress = backToTop.querySelector('.ring-progress');
const RING_LENGTH = 2 * Math.PI * 22;
const sections = document.querySelectorAll('section[id]');
const navLinkItems = document.querySelectorAll('.nav-link');

let lastScrollY = window.scrollY;
let scrollTicking = false;

window.addEventListener('scroll', () => {
    if (!scrollTicking) {
        requestAnimationFrame(updateOnScroll);
        scrollTicking = true;
    }
}, { passive: true });

function updateOnScroll() {
    const y = window.scrollY;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const progress = maxScroll > 0 ? Math.min(y / maxScroll, 1) : 0;

    progressBar.style.transform = `scaleX(${progress})`;
    ringProgress.style.strokeDashoffset = RING_LENGTH * (1 - progress);
    backToTop.classList.toggle('visible', y > 600);

    // Transparent at top → floating pill; hide on scroll down, show on scroll up
    navbar.classList.toggle('scrolled', y > 40);
    if (!document.body.classList.contains('menu-open')) {
        const scrollingDown = y > lastScrollY;
        if (Math.abs(y - lastScrollY) > 4) {
            navbar.classList.toggle('nav-hidden', scrollingDown && y > 200);
        }
    }

    lastScrollY = y;
    updateActiveNavLink();
    scrollTicking = false;
}

// Keyboard users tabbing into a hidden nav should see it
navbar.addEventListener('focusin', () => navbar.classList.remove('nav-hidden'));

function updateActiveNavLink() {
    let currentSection = 'home';

    sections.forEach(section => {
        if (window.scrollY >= section.offsetTop - window.innerHeight * 0.35) {
            currentSection = section.getAttribute('id');
        }
    });

    navLinkItems.forEach(link => {
        const isActive = link.getAttribute('href').slice(1) === currentSection;
        link.classList.toggle('active', isActive);
        if (isActive) link.setAttribute('aria-current', 'true');
        else link.removeAttribute('aria-current');
    });
}

backToTop.addEventListener('click', () => scrollToTarget(document.getElementById('home')));

// ============================================
// SMOOTH SCROLL FOR ANCHOR LINKS
// ============================================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');

        // Placeholder links (e.g. projects without a demo yet)
        if (href === '#') {
            e.preventDefault();
            return;
        }

        const targetElement = document.querySelector(href);
        if (targetElement) {
            e.preventDefault();
            scrollToTarget(targetElement);
            if (targetElement.tagName === 'SECTION') {
                targetElement.focus({ preventScroll: true });
            }
        }
    });
});

// ============================================
// CONTACT FORM HANDLING
// ============================================

const contactForm = document.getElementById('contactForm');
const submitBtn = contactForm.querySelector('.btn-submit');
const submitLabel = submitBtn.querySelector('.btn-label');

const validators = {
    name: (v) => (v ? '' : 'Please enter your name.'),
    email: (v) => (!v ? 'Please enter your email.' : isValidEmail(v) ? '' : 'Please enter a valid email address.'),
    subject: (v) => (v ? '' : 'Please add a subject.'),
    message: (v) => (v.length >= 10 ? '' : 'Your message should be at least 10 characters.')
};

const formFields = Object.keys(validators).map(name => contactForm.elements[name]);

formFields.forEach(field => {
    field.addEventListener('blur', () => {
        if (field.value.trim()) validateField(field);
    });
    field.addEventListener('input', () => {
        if (field.closest('.form-group').classList.contains('has-error')) validateField(field);
    });
});

contactForm.addEventListener('submit', handleFormSubmit);

function validateField(field) {
    const error = validators[field.name](field.value.trim());
    field.setAttribute('aria-invalid', error ? 'true' : 'false');
    field.closest('.form-group').classList.toggle('has-error', Boolean(error));
    document.getElementById(`${field.id}-error`).textContent = error;
    return !error;
}

function setButtonState(state) {
    submitBtn.classList.remove('is-loading', 'is-success');
    submitBtn.disabled = state === 'loading';
    if (state === 'loading') {
        submitBtn.classList.add('is-loading');
        submitLabel.textContent = 'Sending…';
    } else if (state === 'success') {
        submitBtn.classList.add('is-success');
        submitLabel.textContent = 'Sent!';
    } else {
        submitLabel.textContent = 'Send Message';
    }
}

async function handleFormSubmit(e) {
    e.preventDefault();

    // Validate every field so all errors show at once
    const results = formFields.map(validateField);
    if (results.includes(false)) {
        formFields[results.indexOf(false)].focus();
        showNotification('Please fix the highlighted fields.', 'error');
        return;
    }

    // Bots fill the hidden honeypot
    if (contactForm.elements._gotcha.value) return;

    const name = contactForm.elements.name.value.trim();
    const email = contactForm.elements.email.value.trim();
    const subject = contactForm.elements.subject.value.trim();
    const message = contactForm.elements.message.value.trim();

    // Formspree not configured yet: fall back to the visitor's mail app
    if (FORM_ENDPOINT.includes('YOUR_FORM_ID')) {
        const body = `${message}\n\n— ${name} (${email})`;
        window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(`Portfolio Contact: ${subject}`)}&body=${encodeURIComponent(body)}`;
        showNotification('Opening your email app to send the message…', 'info');
        return;
    }

    setButtonState('loading');
    showNotification('Sending…', 'info', 0);

    try {
        const response = await fetch(FORM_ENDPOINT, {
            method: 'POST',
            body: new FormData(contactForm),
            headers: { Accept: 'application/json' }
        });

        if (!response.ok) throw new Error(`Request failed: ${response.status}`);

        setButtonState('success');
        showNotification('Message sent successfully! I\'ll get back to you soon.', 'success');
        contactForm.reset();
        formFields.forEach(field => field.removeAttribute('aria-invalid'));
        setTimeout(() => setButtonState('idle'), 3000);
    } catch (error) {
        setButtonState('idle');
        showNotification(`Couldn't send your message. Please try again or email ${CONTACT_EMAIL}.`, 'error', 6000);
    }
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// ============================================
// NOTIFICATIONS
// ============================================

const toastRegion = document.getElementById('toastRegion');
let toastTimer = null;

// duration 0 keeps the toast until the next one replaces it
function showNotification(message, type = 'info', duration = 3500) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;

    toastRegion.replaceChildren(notification);
    requestAnimationFrame(() => requestAnimationFrame(() => notification.classList.add('show')));

    clearTimeout(toastTimer);
    if (duration > 0) {
        toastTimer = setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 400);
        }, duration);
    }
}

// ============================================
// COPY TO CLIPBOARD
// ============================================

document.querySelectorAll('[data-copy]').forEach(button => {
    button.addEventListener('click', async () => {
        const copied = await copyText(button.dataset.copy);
        showNotification(copied ? 'Copied!' : 'Couldn\'t copy, please copy it manually.', copied ? 'success' : 'error', 2000);
    });
});

async function copyText(text) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (e) {
        // Fallback for older browsers / insecure contexts
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        let ok = false;
        try { ok = document.execCommand('copy'); } catch (err) { ok = false; }
        textarea.remove();
        return ok;
    }
}

// ============================================
// PRELOADER
// ============================================

function runPreloader(onDone) {
    const preloader = document.getElementById('preloader');
    if (!preloader) {
        onDone();
        return;
    }
    if (prefersReducedMotion) {
        preloader.remove();
        onDone();
        return;
    }

    const counter = preloader.querySelector('.preloader-count');
    const duration = 1200;
    const start = performance.now();

    function tick(now) {
        const t = Math.min((now - start) / duration, 1);
        counter.textContent = Math.round((1 - Math.pow(1 - t, 3)) * 100);
        if (t < 1) {
            requestAnimationFrame(tick);
            return;
        }
        preloader.classList.add('is-done');
        setTimeout(onDone, 300);
        setTimeout(() => preloader.remove(), 1000);
    }

    requestAnimationFrame(tick);
}

// ============================================
// HERO: ENTRANCE, ROLES, PARALLAX
// ============================================

if (animate) {
    // Hidden only once JS is confirmed running, so content stays visible without it
    gsap.set('.hero-title .line-inner', { yPercent: 115 });
    gsap.set('.hero-intro-item', { opacity: 0, y: 24 });
    gsap.set('.hero-image', { opacity: 0, scale: 0.94 });
}

function heroIntro() {
    if (!animate) return;
    gsap.timeline({ defaults: { ease: 'power4.out' } })
        .to('.hero-title .line-inner', { yPercent: 0, duration: 1.2, stagger: 0.12 })
        .to('.hero-image', { opacity: 1, scale: 1, duration: 1.4 }, 0.1)
        .to('.hero-intro-item', { opacity: 1, y: 0, duration: 0.9, stagger: 0.08, clearProps: 'transform' }, 0.45);
}

function initRoleRotator() {
    const roleText = document.querySelector('.role-text');
    if (!roleText) return;

    const roles = ['Full-Stack Developer', 'AI Security Builder', 'Hackathon Winner', 'Problem Solver'];
    let index = 0;

    setInterval(() => {
        if (document.hidden) return;
        index = (index + 1) % roles.length;
        roleText.classList.add('is-leaving');
        setTimeout(() => {
            roleText.textContent = roles[index];
            roleText.classList.remove('is-leaving');
            roleText.classList.add('is-entering');
            void roleText.offsetWidth; // commit the off-screen start position before sliding in
            roleText.classList.remove('is-entering');
        }, 450);
    }, 2800);
}

function initHeroParallax() {
    if (!animate) return;
    const scrub = { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true };
    gsap.to('.hero-bg', { yPercent: 25, ease: 'none', scrollTrigger: scrub });
    gsap.to('.avatar', { yPercent: -12, ease: 'none', scrollTrigger: { ...scrub } });
}

// ============================================
// SCROLL ANIMATIONS (GSAP SCROLLTRIGGER)
// ============================================

function initReveals() {
    if (!animate) return;

    gsap.set('.reveal', { opacity: 0, y: 40 });
    ScrollTrigger.batch('.reveal', {
        start: 'top 88%',
        once: true,
        onEnter: (batch) => gsap.to(batch, {
            opacity: 1,
            y: 0,
            duration: 0.9,
            ease: 'power3.out',
            stagger: 0.1,
            overwrite: true,
            clearProps: 'transform'
        })
    });
}

function initTimeline() {
    if (!animate) return;

    gsap.fromTo('.timeline-progress', { scaleY: 0 }, {
        scaleY: 1,
        ease: 'none',
        scrollTrigger: { trigger: '.timeline', start: 'top 70%', end: 'bottom 55%', scrub: true }
    });

    gsap.utils.toArray('.timeline-item').forEach(item => {
        const trigger = { trigger: item, start: 'top 72%' };
        gsap.from(item.querySelector('.timeline-dot'), { scale: 0, duration: 0.6, ease: 'back.out(3)', scrollTrigger: trigger });
        gsap.from(item.querySelector('.experience-card'), {
            opacity: 0, x: 40, duration: 0.9, ease: 'power3.out', clearProps: 'transform', scrollTrigger: { ...trigger }
        });
    });
}

// ============================================
// POINTER EFFECTS: CURSOR, MAGNETIC BUTTONS, TILT
// ============================================

function initCursor() {
    if (!canHover || prefersReducedMotion) return;

    const dot = document.querySelector('.cursor-dot');
    const ring = document.querySelector('.cursor-ring');
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;

    htmlElement.classList.add('has-cursor');

    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        dot.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
        htmlElement.classList.add('cursor-visible');
    }, { passive: true });

    document.addEventListener('mouseleave', () => htmlElement.classList.remove('cursor-visible'));

    (function follow() {
        ringX += (mouseX - ringX) * 0.18;
        ringY += (mouseY - ringY) * 0.18;
        ring.style.transform = `translate(${ringX}px, ${ringY}px)`;
        requestAnimationFrame(follow);
    })();

    document.addEventListener('mouseover', (e) => {
        const interactive = e.target.closest('a, button, input, textarea, .copy-btn');
        const viewTarget = e.target.closest('[data-cursor="view"]');
        ring.classList.toggle('is-view', Boolean(viewTarget) && !interactive);
        ring.classList.toggle('is-hover', Boolean(interactive));
    });
}

function initMagneticButtons() {
    if (!canHover || prefersReducedMotion) return;

    document.querySelectorAll('.btn-primary, .btn-secondary').forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            btn.style.transform = `translate(${x * 0.25}px, ${y * 0.35}px)`;
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.transform = '';
        });
    });
}

function initProjectTilt() {
    if (!canHover || prefersReducedMotion) return;

    const MAX_TILT = 6;
    document.querySelectorAll('.project-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const px = (e.clientX - rect.left) / rect.width;
            const py = (e.clientY - rect.top) / rect.height;
            card.style.transform = `perspective(1000px) rotateX(${(0.5 - py) * MAX_TILT * 2}deg) rotateY(${(px - 0.5) * MAX_TILT * 2}deg)`;
            card.style.setProperty('--mx', `${px * 100}%`);
            card.style.setProperty('--my', `${py * 100}%`);
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });
}

// ============================================
// PAGE LOAD INITIALIZATION
// ============================================

updateOnScroll();
initRoleRotator();
initReveals();
initTimeline();
initHeroParallax();
initCursor();
initMagneticButtons();
initProjectTilt();
runPreloader(heroIntro);
