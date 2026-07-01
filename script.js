// Scroll reveal
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

// Project timeline: reveal each item + fill the spine as you scroll through
const tlItems = document.querySelectorAll('.tl-item');
const tlObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in');
      tlObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.28 });
tlItems.forEach((el) => tlObserver.observe(el));

const tl = document.getElementById('tl');
const tlFill = document.getElementById('tlFill');
const scrubber = document.getElementById('tlScrubber');
const scrubberDot = document.getElementById('tlScrubberDot');
const updateTl = () => {
  if (!tl || !tlFill) return;
  const rect = tl.getBoundingClientRect();
  const progressed = window.innerHeight * 0.5 - rect.top;
  const pct = Math.max(0, Math.min(1, progressed / rect.height));
  tlFill.style.height = (pct * 100).toFixed(2) + '%';
  if (scrubberDot) scrubberDot.style.top = (pct * 100).toFixed(1) + '%';
  if (scrubber) {
    const inView = rect.top < window.innerHeight * 0.55 && rect.bottom > window.innerHeight * 0.45;
    scrubber.classList.toggle('show', inView);
  }
};
updateTl();
window.addEventListener('scroll', updateTl, { passive: true });
window.addEventListener('resize', updateTl);

// Apple-style hero: parallax background + fading scroll cue
const heroBg = document.querySelector('.hero-bg');
const scrollCue = document.querySelector('.scroll-cue');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (heroBg && !reduceMotion) {
  const onHeroScroll = () => {
    const y = window.scrollY;
    if (window.innerWidth > 900) {
      if (y <= window.innerHeight) {
        const scale = (1.04 + Math.min(y, 700) / 700 * 0.06).toFixed(4);
        heroBg.style.transform = 'translate3d(0,' + (y * 0.35).toFixed(1) + 'px,0) scale(' + scale + ')';
      }
    } else {
      heroBg.style.transform = '';
    }
    if (scrollCue) scrollCue.style.opacity = y > 60 ? '0' : '';
  };
  onHeroScroll();
  window.addEventListener('scroll', onHeroScroll, { passive: true });
}

// Solid header after scrolling past the hero
const nav = document.getElementById('siteNav');
const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 40);
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

// Aman-style sale notice: gentle fade-in, dismissible, remembered
const notice = document.getElementById('saleNotice');
if (notice) {
  let dismissed = false;
  try { dismissed = localStorage.getItem('bnoticeDismissed') === '1'; } catch (e) {}
  if (!dismissed) {
    setTimeout(() => notice.classList.add('show'), 2200);
    const close = document.getElementById('noticeClose');
    if (close) close.addEventListener('click', () => {
      notice.classList.remove('show');
      try { localStorage.setItem('bnoticeDismissed', '1'); } catch (e) {}
    });
  }
}

// Mobile menu toggle
const toggle = document.getElementById('navToggle');
const menu = document.getElementById('primaryNav');
const navLabel = toggle.querySelector('.nav-label');
const setOpen = (open) => {
  nav.classList.toggle('open', open);
  menu.classList.toggle('open', open);
  toggle.setAttribute('aria-expanded', String(open));
  toggle.setAttribute('aria-label', open ? 'Lukk meny' : 'Åpne meny');
  if (navLabel) navLabel.textContent = open ? 'Lukk' : 'Meny';
};
toggle.addEventListener('click', () => setOpen(!nav.classList.contains('open')));
menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setOpen(false)));
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });
