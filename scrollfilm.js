/*!
 * scrollfilm.js 2.0 — siden spiller seg selv av, seksjon for seksjon.
 *
 * Modellen (Martin, okt 2026): hver seksjon spilles på 4, 8 eller 12 sekunder, avhengig av hvor
 * mye som skal ses eller leses, og står så stille i 3 sekunder før neste begynner.
 * Scroller noen, spiller seksjonen seg raskt ferdig, venter 2 sekunder og går videre.
 *
 *   spill (4 | 8 | 12 s)  →  vent (3 s)  →  neste seksjon
 *   scroll ned under spill   →  spill ferdig på ~1 s  →  vent 2 s  →  neste
 *   scroll ned under vent    →  neste seksjon med en gang
 *   scroll opp               →  starten av denne seksjonen, eller forrige hvis du står i starten
 *   klikk                    →  pause (knappen nederst til høyre fortsetter)
 *
 * Oppsett i HTML (passer alle stiler, ingen kode per side):
 *   <section data-film="4">   <section data-film="8">   <section data-film="12">
 *   data-film="auto" (eller tom) velger 4/8/12 ut fra antall ord som vises.
 *   data-film-vent="5" overstyrer ventetiden for én seksjon.
 *   <script src="/scrollfilm.js" defer></script>  +  ScrollFilm.start()
 *
 * Eller i JS: ScrollFilm.start({ seksjoner: [{ el: '#intro', sek: 4 }, { el: '#om', sek: 8 }] })
 *
 * Sticky scener (høye seksjoner med position: sticky) scrolles gjennom på seksjonens sekunder,
 * så scenens egne scroll-animasjoner spilles av. Vanlige seksjoner glir inn og står.
 * prefers-reduced-motion: ingen avspilling, vanlig scroll.
 */
(function (global) {
  'use strict';

  const $ = s => typeof s === 'string' ? document.querySelector(s) : s;
  const ord = t => (t || '').trim().split(/\s+/).filter(w => /[\p{L}\p{N}]/u.test(w)).length;
  const myk = t => t * t * (3 - 2 * t);                    // inn og ut
  const ut = t => 1 - Math.pow(1 - t, 3);                  // rask start, myk landing

  const CSS = '.sf-knapp{position:fixed;right:clamp(16px,4vw,56px);bottom:calc(18px + env(safe-area-inset-bottom,0px));z-index:60;' +
    'mix-blend-mode:difference;color:#fff;background:none;border:1px solid currentColor;border-radius:999px;padding:8px 13px;' +
    'font:500 10.5px/1 ui-monospace,Consolas,monospace;letter-spacing:.08em;text-transform:uppercase;cursor:pointer}' +
    '.sf-knapp[hidden]{display:none}' +
    '.sf-linje{position:fixed;left:0;top:0;height:2px;width:100%;z-index:61;pointer-events:none;transform-origin:0 50%;transform:scaleX(0);background:currentColor;opacity:.55}';

  function start(opt = {}) {
    const o = Object.assign({
      seksjoner: null,          // [{ el, sek, vent }] — ellers alle [data-film] i dokumentet
      vent: 3,                  // sekunder stille etter hver seksjon
      ferdigVent: 2,            // sekunder stille etter at en seksjon er spolt ferdig med scroll
      hurtig: 1,                // sekunder for å spille ferdig når noen scroller
      grenser: [25, 70],        // auto: <=25 ord = 4 s, <=70 ord = 8 s, ellers 12 s
      autostart: true, knapp: true, linje: false, css: true,
      tekst: { spill: 'Spill av', pause: 'Pause' }, onSeksjon: null
    }, opt);
    const rolig = matchMedia('(prefers-reduced-motion: reduce)').matches;

    const kilde = o.seksjoner || [...document.querySelectorAll('[data-film]')].map(el => ({ el }));
    const S = kilde.map(s => { const el = $(s.el); if (!el) throw new Error('scrollfilm: finner ikke ' + s.el); return { el, sek: s.sek, vent: s.vent }; });
    const varighet = n => {
      const v = S[n].sek ?? S[n].el.dataset.film;
      if (v && v !== 'auto') return +v;
      const w = ord(S[n].el.innerText);
      return w <= o.grenser[0] ? 4 : w <= o.grenser[1] ? 8 : 12;
    };
    const venting = n => +(S[n].vent ?? S[n].el.dataset.filmVent ?? o.vent);
    // Posisjoner regnes ut på nytt hver gang (tåler resize og bilder som laster).
    function pos(n) {
      const max = document.documentElement.scrollHeight - innerHeight;
      const el = S[n].el, top = Math.min(max, el.getBoundingClientRect().top + scrollY);
      return { top, end: Math.min(max, Math.max(top, top + el.offsetHeight - innerHeight)) };
    }

    let i = 0, fase = 'stopp', spiller = false, raf = 0;
    let knapp = null, linje = null;
    if (o.css && (o.knapp || o.linje) && !document.getElementById('sf-css')) {
      const st = document.createElement('style'); st.id = 'sf-css'; st.textContent = CSS; document.head.appendChild(st);
    }
    if (o.knapp) knapp = o.knapp instanceof Element ? o.knapp : document.body.appendChild(Object.assign(document.createElement('button'), { type: 'button', className: 'sf-knapp' }));
    if (o.linje) linje = document.body.appendChild(Object.assign(document.createElement('div'), { className: 'sf-linje' }));
    const vis = () => { if (knapp) { knapp.textContent = spiller ? o.tekst.pause : o.tekst.spill; knapp.setAttribute('aria-pressed', spiller); } };

    // Én bevegelse fra nåværende posisjon til mål på dur sekunder.
    function tween(til, dur, ease, ferdig) {
      cancelAnimationFrame(raf);
      const fra = scrollY, t0 = performance.now();
      const step = now => {
        if (!spiller) return;
        const k = dur <= 0 ? 1 : Math.min(1, (now - t0) / (dur * 1000));
        scrollTo(0, fra + (til - fra) * ease(k));
        if (linje && fase === 'spill') linje.style.transform = `scaleX(${k})`;
        if (k < 1) raf = requestAnimationFrame(step); else ferdig();
      };
      raf = requestAnimationFrame(step);
    }
    function vent(sekunder, deretter) {
      cancelAnimationFrame(raf);
      const t0 = performance.now();
      const step = now => {
        if (!spiller) return;
        if (now - t0 >= sekunder * 1000) deretter(); else raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    }

    function spill(n, dur) {
      if (n >= S.length) { stopp(); return; }
      i = n; fase = 'spill'; spiller = true; vis();
      if (o.onSeksjon) o.onSeksjon(S[i].el.id, i);
      tween(pos(i).end, dur ?? varighet(i), myk, () => { fase = 'vent'; vent(venting(i), () => spill(i + 1)); });
    }
    function spolFerdig() {
      fase = 'spoler';
      tween(pos(i).end, o.hurtig, ut, () => { fase = 'vent'; vent(o.ferdigVent, () => spill(i + 1)); });
    }
    function stopp() { spiller = false; cancelAnimationFrame(raf); fase = 'stopp'; vis(); }

    // Hvilken seksjon står leseren i (når filmen er stoppet)?
    function her() {
      const y = scrollY + 4; let k = 0;
      S.forEach((_, n) => { if (pos(n).top <= y) k = n; });
      return k;
    }
    // Fortsett seksjon k fra der leseren står, med resten av tiden.
    function fortsett(k) {
      const p = pos(k);
      if (scrollY >= p.end - 4) return spill(k + 1);
      const rest = (p.end - scrollY) / Math.max(1, p.end - p.top);
      spill(k, Math.max(1, varighet(k) * Math.min(1, rest)));
    }
    function ned() {
      if (!spiller) { i = her(); spiller = true; vis(); return scrollY < pos(i).end - 4 ? spolFerdig() : spill(i + 1); }
      if (fase === 'spill') spolFerdig();
      else if (fase === 'vent') spill(i + 1);
    }
    function opp() {
      const k = spiller ? i : her();
      const m = scrollY > pos(k).top + innerHeight * .35 ? k : Math.max(0, k - 1);
      spiller = true; vis(); i = m; fase = 'spoler';
      tween(pos(m).top, .9, ut, () => spill(m));
    }

    if (!rolig) {
      let sisteHjul = 0, sisteHopp = 0, ty = null;
      const felt = el => el && el.closest && el.closest('input, textarea, select, button, [contenteditable]');
      const hopp = r => { const t = performance.now(); if (t - sisteHopp > 700) { sisteHopp = t; r > 0 ? ned() : opp(); } };
      addEventListener('wheel', e => {
        if (e.ctrlKey) return;
        e.preventDefault();
        const t = performance.now(), ny = t - sisteHjul > 280; sisteHjul = t;
        if (Math.abs(e.deltaY) < 3) return;
        if (ny || t - sisteHopp > 1600) { sisteHopp = 0; hopp(Math.sign(e.deltaY)); }
      }, { passive: false });
      addEventListener('touchstart', e => { ty = e.touches[0].clientY; }, { passive: true });
      addEventListener('touchmove', e => { if (!felt(e.target)) e.preventDefault(); }, { passive: false });
      addEventListener('touchend', e => {
        if (ty === null) return;
        const dy = ty - e.changedTouches[0].clientY; ty = null;
        if (Math.abs(dy) > 40) hopp(Math.sign(dy));
      }, { passive: true });
      addEventListener('keydown', e => {
        if (felt(e.target) || e.metaKey || e.ctrlKey || e.altKey) return;
        if (['ArrowDown', 'PageDown', ' '].includes(e.key)) { e.preventDefault(); hopp(1); }
        else if (['ArrowUp', 'PageUp'].includes(e.key)) { e.preventDefault(); hopp(-1); }
        else if (e.key === 'Home') { e.preventDefault(); spiller = true; vis(); fase = 'spoler'; tween(0, 1, ut, () => spill(0)); }
        else if (e.key === 'End') { e.preventDefault(); spill(S.length - 1); }
      });
      addEventListener('mousedown', e => { if (!knapp || !knapp.contains(e.target)) stopp(); }, { capture: true });
    }
    if (knapp) {
      knapp.hidden = rolig;
      knapp.addEventListener('click', () => spiller ? stopp() : fortsett(her()));
    }
    vis();
    if (!rolig && o.autostart && scrollY < 10 && S.length) {
      (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => setTimeout(() => spill(0), 150));
    }
    return {
      spill: () => fortsett(her()), stopp, neste: ned, forrige: opp,
      get seksjon() { return i; }, get fase() { return fase; },
      plan: () => S.map((s, n) => ({ id: s.el.id, sek: varighet(n), vent: venting(n) }))
    };
  }

  global.ScrollFilm = { start, ord, versjon: '2.0' };
})(window);
