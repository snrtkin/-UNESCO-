

/* ── HERO PARALLAX ── */
const heroBg = document.getElementById('heroBg');
const heroSlides = heroBg ? Array.from(heroBg.querySelectorAll('.hero-slide')) : [];
let ticking = false;

let heroSlideIndex = 0;
let heroSliderTimer = null;

function activateHeroSlide(nextIndex) {
      heroSlides.forEach((slide, index) => {
            slide.classList.toggle('is-active', index === nextIndex);
      });
      heroSlideIndex = nextIndex;
}

function startHeroSlider() {
      if (heroSlides.length <= 1) {
            return;
      }

      if (heroSliderTimer) {
            clearInterval(heroSliderTimer);
      }

      heroSliderTimer = setInterval(() => {
            const nextIndex = (heroSlideIndex + 1) % heroSlides.length;
            activateHeroSlide(nextIndex);
      }, 4600);
}

if (heroSlides.length > 0) {
      activateHeroSlide(0);
      startHeroSlider();

      document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                  clearInterval(heroSliderTimer);
                  heroSliderTimer = null;
                  return;
            }

            startHeroSlider();
      });
}

window.addEventListener('scroll', () => {
      if (!ticking) {
            requestAnimationFrame(() => {
                  const y = window.scrollY;
                  if (heroBg) heroBg.style.transform = `scale(1.04) translateY(${y * 0.3}px)`;
                  ticking = false;
            });
            ticking = true;
      }
});

/* ── FLOATING PARTICLES ── */
const particlesEl = document.getElementById('heroParticles');

if (particlesEl) {
      for (let i = 0; i < 14; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';

            const size = Math.random() * 3 + 1.5;
            particle.style.cssText = `
            width:${size}px; height:${size}px;
            top:${Math.random() * 100}%;
            left:${Math.random() * 100}%;
            --dur:${4 + Math.random() * 5}s;
            --delay:-${Math.random() * 6}s;
        `;

            particlesEl.appendChild(particle);
      }
}

/* ── NAVBAR SCROLL ── */
const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
      if (navbar) {
            navbar.classList.toggle('scrolled', window.scrollY > 60);
      }
}, { passive: true });

/* ── SIDEBAR ── */
const menuToggle = document.getElementById('menuToggle');
const closeToggle = document.getElementById('closeToggle');
const sidebarMenu = document.getElementById('sidebarMenu');
const sidebarOverlay = document.getElementById('sidebarOverlay');

function openSidebar() {
      if (sidebarMenu) sidebarMenu.classList.add('open');
      if (sidebarOverlay) sidebarOverlay.classList.add('active');
      if (menuToggle) {
            menuToggle.classList.add('open');
            menuToggle.setAttribute('aria-expanded', 'true');
      }
      document.body.style.overflow = 'hidden';
}

function closeSidebar() {
      if (sidebarMenu) sidebarMenu.classList.remove('open');
      if (sidebarOverlay) sidebarOverlay.classList.remove('active');
      if (menuToggle) {
            menuToggle.classList.remove('open');
            menuToggle.setAttribute('aria-expanded', 'false');
      }
      document.body.style.overflow = '';
}

if (menuToggle && sidebarMenu) {
      menuToggle.addEventListener('click', () => (sidebarMenu.classList.contains('open') ? closeSidebar() : openSidebar()));
}
if (closeToggle) {
      closeToggle.addEventListener('click', closeSidebar);
}
if (sidebarOverlay) {
      sidebarOverlay.addEventListener('click', closeSidebar);
}
document.querySelectorAll('.menu-item').forEach((link) => link.addEventListener('click', closeSidebar));
document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
            closeSidebar();
      }
});

/* ── ANIMATED COUNTERS ── */
function easeOutQuart(t) {
      return 1 - Math.pow(1 - t, 4);
}

function animateCounter(element, target, suffix, duration) {
      const start = performance.now();

      function step(now) {
            const t = Math.min((now - start) / duration, 1);
            const value = Math.round(easeOutQuart(t) * target);

            element.textContent = value + suffix;

            if (t < 1) {
                  requestAnimationFrame(step);
                  return;
            }

            element.textContent = target + suffix;
            element.closest('.stat-item').classList.add('counted');
      }

      requestAnimationFrame(step);
}

/* ── INTERSECTION OBSERVER ── */
let statsAnimated = false;

const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
            if (!entry.isIntersecting) {
                  return;
            }

            entry.target.classList.add('active');

            if (entry.target.id === 'stats' && !statsAnimated) {
                  statsAnimated = true;
                  setTimeout(() => {
                        document.querySelectorAll('.stat-item').forEach((item, index) => {
                              const target = parseInt(item.dataset.target, 10);
                              const suffix = item.dataset.suffix;
                              const statNumber = item.querySelector('.stat-number');

                              setTimeout(() => animateCounter(statNumber, target, suffix, 1400), index * 120);
                        });
                  }, 200);
            }
      });
}, { threshold: 0.05 });

document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));

/* ── ACTIVATE REVEALS ALREADY IN VIEW ON LOAD ── */
window.addEventListener('load', () => {
      document.querySelectorAll('.reveal').forEach((element) => {
            const rect = element.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom >= 0) {
                  element.classList.add('active');
            }
      });
});

/* ── TRANSLATION SYSTEM ── */
function applyTranslations(lang) {
      if (!window.translations || !window.translations[lang]) {
            console.warn(`Translations for language "${lang}" not found.`);
            return;
      }
      
      // Update HTML lang attribute
      document.documentElement.lang = lang;

      const dict = window.translations[lang];
      
      // Select all elements with data-i18n
      document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (dict[key] !== undefined) {
                  if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                        el.placeholder = dict[key];
                  } else {
                        el.innerHTML = dict[key];
                  }
            }
      });
      
      // Keep dropdown menu active state synced
      const langDropdown = document.querySelector('.lang-dropdown');
      if (langDropdown) {
            const toggleBtn = langDropdown.querySelector('.lang-toggle-btn');
            if (toggleBtn) {
                  toggleBtn.querySelector('span').textContent = lang.toUpperCase();
            }
            const langItems = langDropdown.querySelectorAll('.lang-item');
            langItems.forEach(item => {
                  if (item.dataset.lang === lang) {
                        item.classList.add('active');
                  } else {
                        item.classList.remove('active');
                  }
            });
      }
}

function setLanguage(lang) {
      localStorage.setItem('selectedLanguage', lang);
      applyTranslations(lang);
}

// Automatically apply saved language as early as possible
const savedLang = localStorage.getItem('selectedLanguage') || 'ja';
// We can apply translations on page load / DOMContentLoaded
if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => applyTranslations(savedLang));
} else {
      applyTranslations(savedLang);
}

/* ── LANGUAGE SWITCHER DROPDOWN ── */
const langDropdown = document.querySelector('.lang-dropdown');
if (langDropdown) {
      const toggleBtn = langDropdown.querySelector('.lang-toggle-btn');
      toggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            langDropdown.classList.toggle('active');
            const expanded = langDropdown.classList.contains('active');
            toggleBtn.setAttribute('aria-expanded', expanded ? 'true' : 'false');
      });

      document.addEventListener('click', (e) => {
            if (!langDropdown.contains(e.target)) {
                  langDropdown.classList.remove('active');
                  toggleBtn.setAttribute('aria-expanded', 'false');
            }
      });
      
      const langItems = langDropdown.querySelectorAll('.lang-item');
      langItems.forEach(item => {
            item.addEventListener('click', (e) => {
                  e.preventDefault();
                  const lang = item.dataset.lang;
                  setLanguage(lang);
                  
                  langDropdown.classList.remove('active');
                  toggleBtn.setAttribute('aria-expanded', 'false');

                  // Show a localized toast notification
                  const toastMsg = (window.translations && window.translations[lang] && window.translations[lang].toast_lang_changed) 
                        || `Language: ${item.textContent}`;
                  showLangToast(toastMsg);
            });
      });
}

/* ── LANGUAGE TOAST NOTIFICATION ── */
function showLangToast(message) {
      // Remove any existing toast
      const existing = document.getElementById('lang-toast');
      if (existing) existing.remove();

      const toast = document.createElement('div');
      toast.id = 'lang-toast';
      toast.textContent = message;
      toast.style.cssText = `
            position: fixed;
            bottom: 2rem;
            left: 50%;
            transform: translateX(-50%) translateY(1rem);
            background: rgba(20, 20, 20, 0.92);
            color: #fff;
            padding: 0.65rem 1.4rem;
            border-radius: 2rem;
            font-size: 0.85rem;
            font-family: inherit;
            letter-spacing: 0.04em;
            z-index: 99999;
            box-shadow: 0 4px 24px rgba(0,0,0,0.3);
            backdrop-filter: blur(8px);
            opacity: 0;
            transition: opacity 0.25s ease, transform 0.25s ease;
            pointer-events: none;
      `;
      document.body.appendChild(toast);

      // Animate in
      requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                  toast.style.opacity = '1';
                  toast.style.transform = 'translateX(-50%) translateY(0)';
            });
      });

      // Auto-dismiss after 2.5s
      setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(-50%) translateY(1rem)';
            setTimeout(() => toast.remove(), 300);
      }, 2500);
}
