(() => {
  'use strict';
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const nav = document.getElementById('siteNav');
  const toggle = document.getElementById('navToggle');
  const menu = document.getElementById('primaryNav');
  function setMenu(open) {
    menu.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.innerHTML = open ? 'Lukk <span aria-hidden="true">×</span>' : 'Meny <span aria-hidden="true">☰</span>';
    nav.classList.toggle('menu-active', open);
    document.body.classList.toggle('menu-open', open);
    if (open) menu.querySelector('a').focus();
  }
  toggle.addEventListener('click', () => setMenu(menu.hidden));
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', e => {
    if (!menu.hidden && e.key === 'Escape') { setMenu(false); toggle.focus(); }
    if (!menu.hidden && e.key === 'Tab') {
      const links = [...menu.querySelectorAll('a')];
      if (e.shiftKey && document.activeElement === links[0]) { e.preventDefault(); toggle.focus(); }
      else if (!e.shiftKey && document.activeElement === links.at(-1)) { e.preventDefault(); toggle.focus(); }
      else if (document.activeElement === toggle) { e.preventDefault(); (e.shiftKey ? links.at(-1) : links[0]).focus(); }
    }
  });
  if ('IntersectionObserver' in window && !reduced.matches) {
    const reveals = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { entry.target.classList.add('visible'); reveals.unobserve(entry.target); }
      });
    }, {threshold: .07});
    document.querySelectorAll('.reveal').forEach(el => reveals.observe(el));
    document.documentElement.classList.add('motion-ready');
  }
  const hero = document.querySelector('.hero');
  const heroImage = document.querySelector('.hero-image');
  const heroCopy = document.querySelector('.hero-copy');
  const stories = [...document.querySelectorAll('.sale-story')].map(el => ({el, img:el.querySelector('img'), fill:el.querySelector('.story-progress span')}));
  const material = document.querySelector('.material-story');
  const materialPhoto = document.querySelector('.material-photo');
  const progress = document.getElementById('readingProgress');
  const clamp = (v,min=0,max=1) => Math.min(max,Math.max(min,v));
  let queued = false;
  function paint() {
    queued = false;
    const y = window.scrollY, vh = window.innerHeight;
    nav.classList.toggle('scrolled', y > 80);
    const total = document.documentElement.scrollHeight - vh;
    progress.style.transform = `scaleX(${total > 0 ? y / total : 0})`;
    if (reduced.matches) return;
    const hr = hero.getBoundingClientRect();
    if (hr.bottom > 0) {
      const hp = clamp(-hr.top / (hr.height * .7));
      heroImage.style.transform = `scale(${1.04 + hp * .08}) translateY(${hp * 3}%)`;
      heroCopy.style.transform = `translateY(${-hp * 65}px)`;
      heroCopy.style.opacity = String(1 - hp * .55);
    }
    stories.forEach(({el,img,fill}) => {
      const r = el.getBoundingClientRect();
      if (r.top < vh && r.bottom > 0) {
        const p = clamp((vh - r.top) / (r.height + vh));
        img.style.transform = `scale(${1.025 + p * .075}) translateY(${(p-.5)*3}%)`;
        fill.style.transform = `scaleX(${clamp((vh-r.top)/r.height)})`;
      }
    });
    const mr = material.getBoundingClientRect();
    if (mr.top < vh && mr.bottom > 0) materialPhoto.style.transform = `translateY(${(clamp((vh-mr.top)/(vh+mr.height))-.5)*8}%)`;
  }
  const schedule = () => { if (!queued) { queued = true; requestAnimationFrame(paint); } };
  window.addEventListener('scroll', schedule, {passive:true});
  window.addEventListener('resize', () => { if (window.innerWidth > 640 && !menu.hidden) setMenu(false); schedule(); }, {passive:true});
  reduced.addEventListener('change', () => { document.documentElement.classList.toggle('motion-ready', !reduced.matches); schedule(); });
  paint();
  const dialog = document.getElementById('imageDialog');
  const dialogImage = document.getElementById('dialogImage');
  const caption = document.getElementById('imageCaption');
  document.querySelectorAll('.image-open').forEach(button => {
    button.addEventListener('click', () => {
      if (typeof dialog.showModal !== 'function') { window.open(button.dataset.image, '_blank','noopener'); return; }
      dialogImage.src = button.dataset.image;
      dialogImage.alt = button.dataset.caption;
      caption.textContent = button.dataset.caption;
      dialog.showModal();
      document.body.classList.add('dialog-open');
    });
  });
  dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => document.body.classList.remove('dialog-open'));
  dialog.addEventListener('click', e => { if (e.target === dialog || e.target.tagName === 'FIGURE') dialog.close(); });
})();
