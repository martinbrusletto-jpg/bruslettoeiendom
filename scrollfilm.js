/*!
 * scrollfilm.js — siden spiller seg selv av som en film, kapittel for kapittel.
 *
 * - Hvert kapittel har eget tempo: nøkkelbilder [sekunder, andel av kapitlet] der like andeler
 *   etter hverandre gir en pause for lesing.
 * - Bevegelsen følger en monoton kubisk spline (Fritsch–Carlson): myke overganger mellom fart
 *   og stillstand, aldri oversving.
 * - Scroll (hjul, styreflate, sveip, piltaster, Page Up/Down, mellomrom) blar ett kapittel opp
 *   eller ned, glir dit og spiller videre derfra. Home/End går til start/slutt. Klikk = pause.
 * - Pause/Spill av-knapp. Skjemafelt får vanlig tastatur og berøring.
 * - prefers-reduced-motion: ingen avspilling, ingen blaing, vanlig scroll.
 *
 * Bruk:
 *   <script src="/scrollfilm.js" defer></script>
 *   ScrollFilm.start({
 *     kapitler: [
 *       { el: '#intro', kf: [[0, 0], [.4, 0], [3.6, .6], [6, .6], [8, 1]] },   // første: ingen inn
 *       { el: '#loftet', inn: 2, kf: [[0, 0], [4, .33], [6.5, .33], [9, 1]] },
 *       { el: '#arkiv',  inn: 2, kf: ScrollFilm.lysbilder(16) },
 *       { el: '#kontakt', varighet: 5 }                                        // gli inn og hvil
 *     ]
 *   });
 *
 * Andel 0 = kapitlets topp står øverst i vinduet. Andel 1 = kapitlet er scrollet ferdig
 * (for et høyt kapittel med sticky scene: bunnen nås; for en vanlig seksjon: den står i ro).
 * Versjon 1.0 · 2026-10-02 · Martin Brusletto / Claude
 */
(function (global) {
  'use strict';

  const $ = s => typeof s === 'string' ? document.querySelector(s) : s;

  // Monoton kubisk interpolasjon gjennom punktene L = [[t, y], ...].
  function kurve(L) {
    const n = L.length, d = [], m = new Array(n).fill(0);
    for (let k = 0; k < n - 1; k++) d.push((L[k + 1][1] - L[k][1]) / (L[k + 1][0] - L[k][0]));
    for (let k = 1; k < n - 1; k++) m[k] = d[k - 1] * d[k] <= 0 ? 0 : (d[k - 1] + d[k]) / 2;
    for (let k = 0; k < n - 1; k++) {
      if (d[k] === 0) { m[k] = 0; m[k + 1] = 0; continue; }
      const a = m[k] / d[k], b = m[k + 1] / d[k], h = a * a + b * b;
      if (h > 9) { const tau = 3 / Math.sqrt(h); m[k] = tau * a * d[k]; m[k + 1] = tau * b * d[k]; }
    }
    return t => {
      let k = 0;
      while (k < n - 2 && t > L[k + 1][0]) k++;
      const [t0, y0] = L[k], [t1, y1] = L[k + 1], h = t1 - t0, s = Math.min(1, Math.max(0, (t - t0) / h));
      const s2 = s * s, s3 = s2 * s;
      return (2 * s3 - 3 * s2 + 1) * y0 + (s3 - 2 * s2 + s) * h * m[k] + (-2 * s3 + 3 * s2) * y1 + (s3 - s2) * h * m[k + 1];
    };
  }

  // Lysbildefremvisning: n trinn som hvert glir inn og står (for tidslinjer, arkiv, lister).
  function lysbilder(n, o = {}) {
    const { forst = 2.4, flytt = .5, sta = 1.2, fra = .02, til = .94, hvil = 1.4 } = o;
    const kf = [[0, 0], [forst, fra]];
    let t = forst;
    for (let k = 0; k < n; k++) {
      const p = fra + (k + .5) / n * (til - fra);
      t += flytt; kf.push([t, p]);
      t += sta + (k === n - 1 ? hvil : 0); kf.push([t, p]);
    }
    kf.push([t + .8, 1]);
    return kf;
  }

  const CSS = '.sf-knapp{position:fixed;right:clamp(16px,4vw,56px);bottom:calc(18px + env(safe-area-inset-bottom,0px));z-index:60;' +
    'mix-blend-mode:difference;color:#fff;background:none;border:1px solid currentColor;border-radius:999px;padding:8px 13px;' +
    'font:500 10.5px/1 ui-monospace,Consolas,monospace;letter-spacing:.08em;text-transform:uppercase;cursor:pointer}' +
    '.sf-knapp[hidden]{display:none}';

  function start(opt) {
    const o = Object.assign({
      kapitler: [], autostart: true, bla: true, knapp: true, css: true,
      tekst: { spill: 'Spill av', pause: 'Pause' }, onKapittel: null
    }, opt);
    const rolig = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const kap = o.kapitler.map((k, i) => {
      const el = $(k.el);
      if (!el) throw new Error('scrollfilm: finner ikke ' + k.el);
      const v = k.varighet || 6;
      return { el, id: el.id || 'k' + i, inn: i === 0 ? (k.inn || 0) : (k.inn ?? 2), kf: k.kf || [[0, 0], [v * .55, 1], [v, 1]] };
    });

    // Hele filmen som [tid, scrollposisjon], med et merke der hvert kapittel står øverst.
    function manus() {
      const max = document.documentElement.scrollHeight - innerHeight;
      const L = [[0, 0]]; L.marks = [];
      let t0 = 0;
      const push = (t, y) => { const last = L[L.length - 1]; if (t <= last[0] + 1e-3) { last[1] = y; } else L.push([t, y]); };
      kap.forEach(k => {
        const top = Math.min(max, k.el.getBoundingClientRect().top + scrollY);
        const hoy = k.el.offsetHeight;
        const end = Math.min(max, Math.max(top, top + hoy - innerHeight));
        push(t0 + k.inn, top);
        L.marks.push({ id: k.id, t: L[L.length - 1][0], pos: top });
        k.kf.forEach(([t, p]) => { if (t > 0) push(t0 + k.inn + t, top + p * (end - top)); });
        t0 = L[L.length - 1][0];
      });
      if (L.length < 2) L.push([1, L[0][1]]);
      return L;
    }

    let knapp = null;
    if (o.knapp) {
      if (o.css && !document.getElementById('sf-css')) {
        const st = document.createElement('style'); st.id = 'sf-css'; st.textContent = CSS; document.head.appendChild(st);
      }
      knapp = o.knapp instanceof Element ? o.knapp : document.body.appendChild(Object.assign(document.createElement('button'), { type: 'button', className: 'sf-knapp' }));
    }
    let spiller = false, raf = 0, sistKap = null;
    const vis = () => { if (knapp) { knapp.textContent = spiller ? o.tekst.pause : o.tekst.spill; knapp.setAttribute('aria-pressed', spiller); } };
    function pause() { spiller = false; cancelAnimationFrame(raf); vis(); }
    function meld() {
      if (!o.onKapittel) return;
      const { i } = naa(); if (i !== sistKap) { sistKap = i; o.onKapittel(kap[i].id, i); }
    }
    function kjor(L) {
      cancelAnimationFrame(raf);
      spiller = true; vis();
      const slutt = L[L.length - 1][0], y = kurve(L);
      let t0 = null;
      const step = now => {
        if (!spiller) return;
        if (t0 === null) t0 = now;
        const t = (now - t0) / 1000;
        scrollTo(0, y(t)); meld();
        if (t >= slutt) { pause(); return; }
        raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    }
    function til(i) {
      const L = manus(), m = L.marks[Math.max(0, Math.min(L.marks.length - 1, i))];
      const y0 = scrollY, avst = Math.abs(m.pos - y0), glid = avst < 2 ? 0 : Math.min(1.6, .7 + avst / 4000);
      const rest = L.filter(([t]) => t > m.t + 1e-3).map(([t, pos]) => [t - m.t + glid, pos]);
      const P = glid ? [[0, y0], [glid, m.pos], ...rest] : [[0, m.pos], ...rest];
      if (P.length < 2) P.push([1, m.pos]);
      kjor(P);
    }
    function naa() {
      const marks = manus().marks, y = scrollY + 4;
      let i = 0; marks.forEach((m, k) => { if (m.pos <= y) i = k; });
      return { i, inne: scrollY > marks[i].pos + innerHeight * .35 };
    }
    function bla(retning) { const { i, inne } = naa(); til(retning > 0 ? i + 1 : (inne ? i : i - 1)); }
    function fortsett() {
      const L = manus(), y = scrollY, k = L.findIndex(([, pos]) => pos > y + 2);
      if (k < 1) return;
      const dt = Math.max(1, (L[k][0] - L[k - 1][0]) * Math.min(1, (L[k][1] - y) / Math.max(1, L[k][1] - L[k - 1][1])));
      const base = L[k][0] - dt;
      kjor([[0, y], ...L.slice(k).map(([t, pos]) => [t - base, pos])]);
    }

    if (!rolig && o.bla) {
      let sisteHjul = 0, sisteBla = 0, ty = null;
      const felt = el => el && el.closest && el.closest('input, textarea, select, button, [contenteditable]');
      const prov = r => { const t = performance.now(); if (t - sisteBla > 900) { sisteBla = t; bla(r); } };
      addEventListener('wheel', e => {
        if (e.ctrlKey) return;
        e.preventDefault();
        const t = performance.now(), ny = t - sisteHjul > 280;
        sisteHjul = t;
        if (Math.abs(e.deltaY) < 3) return;
        if (ny || t - sisteBla > 1600) { sisteBla = 0; prov(Math.sign(e.deltaY)); }
      }, { passive: false });
      addEventListener('touchstart', e => { ty = e.touches[0].clientY; }, { passive: true });
      addEventListener('touchmove', e => { if (!felt(e.target)) e.preventDefault(); }, { passive: false });
      addEventListener('touchend', e => {
        if (ty === null) return;
        const dy = ty - e.changedTouches[0].clientY; ty = null;
        if (Math.abs(dy) > 40) prov(Math.sign(dy));
      }, { passive: true });
      addEventListener('keydown', e => {
        if (felt(e.target) || e.metaKey || e.ctrlKey || e.altKey) return;
        const ned = ['ArrowDown', 'PageDown', ' '].includes(e.key), opp = ['ArrowUp', 'PageUp'].includes(e.key);
        if (e.key === 'Home') { e.preventDefault(); til(0); return; }
        if (e.key === 'End') { e.preventDefault(); til(kap.length - 1); return; }
        if (ned || opp) { e.preventDefault(); prov(ned ? 1 : -1); }
      });
      addEventListener('mousedown', e => { if (!knapp || !knapp.contains(e.target)) pause(); }, { capture: true });
    }
    if (knapp) {
      knapp.addEventListener('click', () => spiller ? pause() : (scrollY < 10 ? til(0) : fortsett()));
      knapp.hidden = rolig;
    }
    vis();
    if (!rolig && o.autostart && scrollY < 10) {
      (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => setTimeout(() => til(0), 150));
    }
    return { spill: () => (scrollY < 10 ? til(0) : fortsett()), pause, til, fortsett, get spiller() { return spiller; }, manus };
  }

  global.ScrollFilm = { start, lysbilder, kurve, versjon: '1.0' };
})(window);
