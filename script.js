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
const updateTl = () => {
  if (!tl || !tlFill) return;
  const rect = tl.getBoundingClientRect();
  const progressed = window.innerHeight * 0.5 - rect.top;
  const pct = Math.max(0, Math.min(1, progressed / rect.height));
  tlFill.style.height = (pct * 100).toFixed(2) + '%';
};
updateTl();
window.addEventListener('scroll', updateTl, { passive: true });
window.addEventListener('resize', updateTl);

// Solid header after scrolling past the hero
const nav = document.getElementById('siteNav');
const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 40);
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

// Mobile menu toggle
const toggle = document.getElementById('navToggle');
const menu = document.getElementById('primaryNav');
const setOpen = (open) => {
  nav.classList.toggle('open', open);
  toggle.setAttribute('aria-expanded', String(open));
  toggle.setAttribute('aria-label', open ? 'Lukk meny' : 'Åpne meny');
};
toggle.addEventListener('click', () => setOpen(!nav.classList.contains('open')));
menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setOpen(false)));
