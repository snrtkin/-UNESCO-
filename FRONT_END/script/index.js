/* ── CURSOR ── */
const dot = document.getElementById('cursor-dot');
const ring = document.getElementById('cursor-ring');
let mx = 0;
let my = 0;
let rx = 0;
let ry = 0;

document.addEventListener('mousemove', (event) => {
      mx = event.clientX;
      my = event.clientY;
      dot.style.left = mx + 'px';
      dot.style.top = my + 'px';
});

(function animRing() {
      rx += (mx - rx) * 0.12;
      ry += (my - ry) * 0.12;
      ring.style.left = rx + 'px';
      ring.style.top = ry + 'px';
      requestAnimationFrame(animRing);
})();

document.querySelectorAll('a, button, .split-block').forEach((element) => {
      element.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
      element.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
});

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
      navbar.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

/* ── SIDEBAR ── */
const menuToggle = document.getElementById('menuToggle');
const closeToggle = document.getElementById('closeToggle');
const sidebarMenu = document.getElementById('sidebarMenu');
const sidebarOverlay = document.getElementById('sidebarOverlay');

function openSidebar() {
      sidebarMenu.classList.add('open');
      sidebarOverlay.classList.add('active');
      menuToggle.classList.add('open');
      menuToggle.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
}

function closeSidebar() {
      sidebarMenu.classList.remove('open');
      sidebarOverlay.classList.remove('active');
      menuToggle.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
}

menuToggle.addEventListener('click', () => (sidebarMenu.classList.contains('open') ? closeSidebar() : openSidebar()));
closeToggle.addEventListener('click', closeSidebar);
sidebarOverlay.addEventListener('click', closeSidebar);
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
}, { threshold: 0.15 });

document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));