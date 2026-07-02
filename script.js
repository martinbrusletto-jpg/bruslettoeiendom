// «Snekret i 1984»: hero-bildet snekres sammen av seks bord ved lasting.
// Bygges kun med JS og hoppes over ved prefers-reduced-motion —
// da står det ferdige bildet der som før.
//
// Bordene må ikke begynne å smelle sammen før selve fotografiet er
// lastet ferdig — ellers "bygges" det bare mørke/tomme flater på
// tregere mobilnett, og bildet dukker opp etterpå uten noen effekt.
const heroSection = document.querySelector('.hero');
const buildReduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (heroSection && !buildReduceMotion) {
  const HERO_IMG_URL = 'assets/hero-engraved.jpg';
  const HERO_LOAD_TIMEOUT = 7000; // gi opp montasjen om bildet bruker for lang tid (treigt mobilnett)

  const runBuild = () => {
    const BOARDS = 6;
    heroSection.classList.add('assembling');
    const build = document.createElement('div');
    build.className = 'hero-build';
    build.setAttribute('aria-hidden', 'true');
    let landed = 0;
    const finish = () => {
      if (!build.isConnected || build.classList.contains('done')) return;
      build.classList.add('done');
      setTimeout(() => build.remove(), 1100);
    };
    for (let i = 0; i < BOARDS; i++) {
      const board = document.createElement('div');
      board.className = 'board ' + (i % 2 ? 'from-right' : 'from-left');
      board.style.setProperty('--i', i);
      const img = document.createElement('div');
      img.className = 'board-img';
      img.style.setProperty('--i', i);
      board.appendChild(img);
      build.appendChild(board);
      board.addEventListener('animationend', () => {
        // Hammerslag: nagler inn, liten risting og sagflis langs skjøten
        board.classList.add('landed');
        build.classList.remove('thud');
        void build.offsetWidth;
        build.classList.add('thud');
        const seamY = Math.min(((i + 1) / BOARDS) * 100, 97);
        for (let d = 0; d < 7; d++) {
          const dust = document.createElement('span');
          dust.className = 'dust';
          dust.style.left = (6 + Math.random() * 88) + '%';
          dust.style.top = 'calc(' + seamY + '% - 6px)';
          dust.style.setProperty('--dx', (Math.random() * 64 - 32).toFixed(0) + 'px');
          dust.style.setProperty('--dy', '-' + (18 + Math.random() * 52).toFixed(0) + 'px');
          dust.addEventListener('animationend', () => dust.remove());
          build.appendChild(dust);
        }
        if (++landed === BOARDS) setTimeout(finish, 650);
      }, { once: true });
    }
    const buildYear = document.createElement('div');
    buildYear.className = 'build-year';
    buildYear.textContent = '1984';
    build.appendChild(buildYear);
    heroSection.appendChild(build);
    setTimeout(finish, 6000); // sikkerhetsnett om animasjonene aldri fullfører
  };

  // Vent til bildet faktisk er lastet (typisk umiddelbart, takket være
  // preload-lenken i <head>) — men gi opp montasjen om det tar for lang
  // tid, slik at siden bare viser bildet rett frem i stedet for å bygge
  // tomme flater.
  const heroImg = new Image();
  let started = false;
  const start = () => {
    if (started) return;
    started = true;
    runBuild();
  };
  const giveUp = setTimeout(() => { started = true; }, HERO_LOAD_TIMEOUT);
  heroImg.addEventListener('load', () => { clearTimeout(giveUp); start(); });
  heroImg.addEventListener('error', () => clearTimeout(giveUp));
  heroImg.src = HERO_IMG_URL;
  if (heroImg.complete) start();
}

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

// Aman-style sale notice: gentle fade-in, dismissible, remembered for the visit.
// It retires by itself when the visitor reaches the project timeline —
// the two "Til salgs" flags take over from there.
const notice = document.getElementById('saleNotice');
if (notice) {
  let dismissed = false;
  try { dismissed = sessionStorage.getItem('bnoticeDismissed') === '1'; } catch (e) {}
  const dismiss = () => {
    notice.classList.remove('show');
    try { sessionStorage.setItem('bnoticeDismissed', '1'); } catch (e) {}
  };
  if (!dismissed) {
    setTimeout(() => notice.classList.add('show'), 2200);
    const close = document.getElementById('noticeClose');
    if (close) close.addEventListener('click', dismiss);
    const works = document.getElementById('prosjekter');
    if (works && 'IntersectionObserver' in window) {
      const noticeObserver = new IntersectionObserver((entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          dismiss();
          noticeObserver.disconnect();
        }
      }, { rootMargin: '0px 0px -30% 0px' });
      noticeObserver.observe(works);
    }
  }
}

// Mobile menu toggle
const toggle = document.getElementById('navToggle');
const menu = document.getElementById('primaryNav');
const navLabel = toggle.querySelector('.nav-label');
const setOpen = (open) => {
  const wasOpen = nav.classList.contains('open');
  nav.classList.toggle('open', open);
  menu.classList.toggle('open', open);
  toggle.setAttribute('aria-expanded', String(open));
  toggle.setAttribute('aria-label', open ? 'Lukk meny' : 'Åpne meny');
  if (navLabel) navLabel.textContent = open ? 'Lukk' : 'Meny';
  if (open) {
    const first = menu.querySelector('a');
    if (first) first.focus();
  } else if (wasOpen) {
    toggle.focus();
  }
};
toggle.addEventListener('click', () => setOpen(!nav.classList.contains('open')));
menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setOpen(false)));
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });
