(() => {
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const span = (p, a, b) => clamp((p - a) / (b - a));
  const $ = id => document.getElementById(id);
  const NS = 'http://www.w3.org/2000/svg';
  const scenes = [...document.querySelectorAll('.scene')];
  const FADE = .05;

  document.querySelectorAll('[data-words]').forEach(el => {
    el.innerHTML = el.textContent.trim().split(/\s+/).map(w => `<span class="w">${w}</span>`).join(' ');
  });

  // ---- modulnettet bak merket ----
  const grid = $('grid');
  const ln = (g, x1, y1, x2, y2) => { const l = document.createElementNS(NS, 'line'); Object.entries({ x1, y1, x2, y2, pathLength: 1 }).forEach(([k, v]) => l.setAttribute(k, v)); g.appendChild(l); };
  for (let x = 0; x <= 13; x++) ln(grid, Math.min(x, 12.75), -.8, Math.min(x, 12.75), 16.8);
  for (let y = 0; y <= 16; y++) ln(grid, -.8, y, 13.55, y);

  // Konstruksjonsark i Merket-kapitlet: samme tegning, ferdig og stille
  const sheet = $('markSheet');
  const cons = $('cons').cloneNode(true); cons.removeAttribute('id');
  cons.querySelector('.grid').removeAttribute('id');
  cons.style.cssText = '--gk:1;--rk:1;--ak:1;--co:1';
  sheet.appendChild(cons);
  const solid = document.createElementNS(NS, 'use'); solid.setAttribute('href', '#be');
  solid.setAttribute('width', 12.75); solid.setAttribute('height', 16); solid.style.color = 'var(--ink)';
  sheet.appendChild(solid);

  // ---- 0: merket konstrueres ----
  const big = $('bigmark'), segs = [...big.querySelectorAll('.seg')], consEl = $('cons');
  const wm = $('wm'), rule = $('rule'), lock = $('lock'), introSub = $('introSub'), introImg = $('introImg');
  const top = document.querySelector('.top');
  let wmW = 0, s0 = 3;
  function measure() {
    wm.style.width = 'auto'; wmW = wm.scrollWidth; wm.style.width = '0px';
    const h = big.getBoundingClientRect().height / (parseFloat(big.style.getPropertyValue('--s')) || 1);
    s0 = Math.max(1.4, Math.min(innerHeight * .52, innerWidth * .62 * 16 / 12.75) / h);
  }
  const SEG = [[.15, .21], [.19, .27], [.23, .31], [.27, .32], [.29, .34], [.31, .36]];
  function drawIntro(p) {
    consEl.style.setProperty('--gk', ease(span(p, .01, .12)));
    consEl.style.setProperty('--rk', ease(span(p, .07, .16)));
    consEl.style.setProperty('--ak', ease(span(p, .10, .16)));
    segs.forEach((s, i) => s.style.strokeDashoffset = 1 - ease(span(p, SEG[i][0], SEG[i][1])));
    consEl.style.setProperty('--co', 1 - ease(span(p, .36, .44)));
    const tr = ease(span(p, .38, .50));
    big.style.setProperty('--s', s0 + (1 - s0) * tr);
    const t = ease(span(p, .44, .56));
    wm.style.width = wmW * t + 'px';
    rule.style.setProperty('--t', t);
    const ti = ease(span(p, .64, .95)), imgH = ti * innerHeight * .46;
    introImg.style.height = imgH + 'px';
    const lift = -imgH * .55;
    lock.style.setProperty('--ny', lift + 'px');
    introSub.style.setProperty('--ny', lift + 'px');
    top.style.setProperty('--topo', p > .9 ? 1 : 0);
  }

  // ---- II: solbanen og huset ----
  const arc = $('sunArc'), sun = $('sun'), halo = $('halo'), sunT = $('sunT'), hus = $('hus'), ray = $('ray'), siteState = $('siteState');
  const arcLen = arc.getTotalLength();
  const fmt = h => String(Math.floor(h)).padStart(2, '0') + ':' + String(Math.round((h % 1) * 60 / 10) * 10 % 60).padStart(2, '0');
  function drawSite(p) {
    const ts = ease(span(p, .04, .72));
    const pt = arc.getPointAtLength(arcLen * ts);
    [sun, halo].forEach(c => { c.setAttribute('cx', pt.x); c.setAttribute('cy', pt.y); });
    sunT.setAttribute('x', pt.x); sunT.setAttribute('y', pt.y - 16);
    sunT.textContent = fmt(4 + ts * 18.7);
    const rot = -18 * ease(span(p, .5, .78));
    hus.setAttribute('transform', `translate(300 214) rotate(${rot})`);
    const locked = p > .8;
    const a = rot * Math.PI / 180, tx = 300 + (-113 * Math.cos(a) - 31 * Math.sin(a)), ty = 214 + (-113 * Math.sin(a) + 31 * Math.cos(a));
    ray.setAttribute('x1', pt.x); ray.setAttribute('y1', pt.y); ray.setAttribute('x2', tx); ray.setAttribute('y2', ty);
    ray.setAttribute('opacity', ts > .78 ? .9 : 0);
    siteState.innerHTML = locked ? '<b>Dreid 18° · kveldssol på terrassen til 21:40</b> · eksempel' : 'Huset dreies …';
  }

  // ---- III: spørsmålene krysses av ----
  const qs = [...$('qs').children];
  function drawQs(p) {
    const n = qs.length * span(p, .06, .82);
    qs.forEach((q, i) => q.classList.toggle('on', i < n));
  }

  // ---- IV: detaljstripen glir sideveis ----
  const track = $('track');
  function drawTrack(p) {
    const max = Math.max(0, track.scrollWidth - innerWidth);
    track.style.setProperty('--x', -max * ease(span(p, .04, .92)) + 'px');
  }

  // ---- V: arkivet ----
  const ARK = [
    [1990, 'Øvre Ullern Terrasse 5', 'Terrasseleiligheter · Ullern', 21, 'a-ovre-ullern-terrasse-5'],
    [1993, 'Halvor Torgersens vei 14–20', 'Leiligheter · Ris', 20, 'a-halvor-torgersens-vei'],
    [1995, 'Krags vei 10', 'Leiligheter · Holmenkollen', 14, 'a-krags-vei-10'],
    [1996, 'Nedre Skøyen vei', 'Skøyen', 0, null],
    [1999, 'Bjørnveien 101B', 'Terrasseleiligheter · Holmen', 6, 'a-bjornveien-101b'],
    [2000, 'Ekelyveien 11', 'Leiligheter · Vinderen', 14, 'a-ekelyveien-11'],
    [2001, 'Tennisveien 26', 'Leiligheter · Slemdal', 6, 'a-tennisveien-26'],
    [2003, 'Thorleif Haugs vei 1–7', 'Leiligheter · Voksenkollen', 55, 'a-thorleif-haugs-vei'],
    [2004, 'Haakon den Godes vei 12', 'Leiligheter · Vinderen', 14, 'a-haakon-den-godes-vei-12'],
    [2007, 'Bærumsveien 219', 'Leiligheter · Bekkestua', 8, 'a-baerumsveien-219'],
    [2011, 'Skogryggveien 14', 'Leiligheter · Vinderen', 8, 'a-skogryggveien-14'],
    [2013, 'Nye Havsdalsvegen 35', 'Leiligheter · Geilo', 4, null],
    [2020, 'Helleveien 8', 'Leiligheter · Holmendammen', 6, 'helleveien'],
    [2021, 'Tangenodden 13', 'Strandeiendom · Sandefjord', 1, 'tangenodden'],
    [2023, 'Heyerdahls vei 8B', 'Enebolig · Slemdal', 1, 'inngang'],
    [2027, 'Varden 8', 'Fjellhytte · Kvitfjell', 1, 'varden']];
  const arkImg = $('arkImg'), axis = $('axis');
  const Y0 = 1990, Y1 = 2027, pos = y => (y - Y0) / (Y1 - Y0) * 100;
  const frames = ARK.map(r => {
    const d = document.createElement('div');
    if (r[4]) d.style.backgroundImage = `url(assets/ny/${r[4]}.webp)`;
    else { d.className = 'none mono'; d.textContent = 'Ingen foto i arkivet'; }
    arkImg.appendChild(d); return d;
  });
  const arkSc = $('arkivet');
  const dots = ARK.map((r, k) => {
    const b = document.createElement('button'); b.type = 'button'; b.style.left = pos(r[0]) + '%';
    b.setAttribute('aria-label', `${r[0]} · ${r[1]}`); b.title = `${r[0]} · ${r[1]}`;
    const i = document.createElement('i'); b.appendChild(i); axis.appendChild(b);
    b.addEventListener('click', () => {
      const p = .02 + (k + .5) / ARK.length * .92, top = arkSc.getBoundingClientRect().top + scrollY;
      scrollTo({ top: top + p * (arkSc.offsetHeight - innerHeight), behavior: 'smooth' });
    });
    return i;
  });
  [1990, 2000, 2010, 2020, 2027].forEach(y => { const s = document.createElement('span'); s.className = 'yr' + (y === 1990 || y === 2027 ? ' edge' : ''); s.style.left = pos(y) + '%'; s.textContent = y; axis.appendChild(s); });
  let lastK = -1;
  function drawArk(p) {
    const k = Math.min(ARK.length - 1, Math.floor(span(p, .02, .94) * ARK.length));
    axis.style.setProperty('--ax', pos(ARK[k][0]) + '%');
    if (k === lastK) return; lastK = k;
    const r = ARK[k];
    $('arkYear').textContent = r[0];
    $('arkName').textContent = r[1];
    $('arkDesc').textContent = r[3] > 1 ? `${r[3]} boliger · ${r[2]}` : r[2];
    $('sumA').textContent = k + 1;
    $('sumB').textContent = ARK.slice(0, k + 1).reduce((s, x) => s + x[3], 0);
    frames.forEach((f, i) => f.classList.toggle('on', i === k));
    dots.forEach((d, i) => { d.classList.toggle('past', i < k); d.classList.toggle('cur', i === k); });
  }

  // ---- kopier telefon og e-post ----
  document.querySelectorAll('[data-copy]').forEach(b => b.addEventListener('click', () => {
    const done = () => { b.textContent = 'Kopiert'; setTimeout(() => b.textContent = 'Kopier', 1600); };
    const sel = () => { const r = document.createRange(); r.selectNodeContents(b.previousElementSibling); const s = getSelection(); s.removeAllRanges(); s.addRange(r); b.textContent = 'Merket'; };
    try { navigator.clipboard.writeText(b.dataset.copy).then(done, sel); } catch (e) { sel(); }
  }));

  // ---- skinne ----
  const rail = [...document.querySelectorAll('.rail a')];
  rail.forEach(a => a.addEventListener('click', e => {
    e.preventDefault();
    const el = $(a.dataset.for);
    const smooth = !matchMedia('(prefers-reduced-motion: reduce)').matches;
    scrollTo({ top: el.getBoundingClientRect().top + scrollY + 2, behavior: smooth ? 'smooth' : 'auto' });
  }));
  document.querySelector('.top a').addEventListener('click', e => { e.preventDefault(); scrollTo({ top: $('salg').getBoundingClientRect().top + scrollY, behavior: 'smooth' }); });
  const chapters = rail.map(a => $(a.dataset.for));

  function frameTick() {
    const vh = innerHeight;
    scenes.forEach(sc => {
      const r = sc.getBoundingClientRect();
      if (r.bottom < -vh || r.top > vh * 2) return;
      const p = clamp(-r.top / (r.height - vh));
      sc.querySelectorAll('[data-r]').forEach(el => {
        const [a, b] = el.dataset.r.split(',').map(Number);
        const o = Math.min(a <= 0 ? 1 : clamp((p - a) / FADE), b >= 1 ? 1 : clamp((b - p) / FADE));
        el.style.opacity = o; el.style.visibility = o === 0 ? 'hidden' : '';
      });
      sc.querySelectorAll('[data-words]').forEach(el => {
        const [a, b] = el.dataset.words.split(',').map(Number), ws = el.children, n = ws.length * span(p, a, b);
        for (let i = 0; i < ws.length; i++) ws[i].classList.toggle('on', i < n);
      });
      if (sc.id === 'intro') drawIntro(p);
      if (sc.id === 'loftet') $('vowImg').style.setProperty('--w', ease(span(p, .5, .76)));
      if (sc.id === 'tomten') drawSite(p);
      if (sc.id === 'sporsmal') drawQs(p);
      if (sc.id === 'detaljer') drawTrack(p);
      if (sc.id === 'arkivet') drawArk(p);
    });
    let cur = null;
    chapters.forEach(c => { if (c.getBoundingClientRect().top < vh * .5) cur = c.id; });
    rail.forEach(a => a.classList.toggle('on', a.dataset.for === cur));
    if ($('intro').getBoundingClientRect().bottom < vh) top.style.setProperty('--topo', 1);
  }
  let queued = false;
  const req = () => { if (!queued) { queued = true; requestAnimationFrame(() => { queued = false; frameTick(); }); } };
  measure(); frameTick();
  addEventListener('scroll', req, { passive: true });
  addEventListener('resize', () => { measure(); lastK = -1; frameTick(); });
  document.fonts && document.fonts.ready.then(() => { measure(); frameTick(); });

  // ---- Siden spilles av som en film ----
  // Hvert kapittel har eget tempo, tilpasset innholdet: der det skal leses står filmen
  // stille, der det bare er bevegelse går den fortere. All brukerinput stopper filmen.
  // inn: sekunder fra forrige kapittel til dette står øverst.
  // kf: [sekunder etter inn, andel av kapitlet] (0 = kapitlet øverst, 1 = ferdig scrollet).
  // Rytmen: hvert kapittel ankommer rolig, står stille mens overskriften leses, spiller av
  // bevegelsen sin i lesetempo og hviler før det går videre. Kurven gjennom nøkkelbildene er
  // en monoton kubisk spline, så farten endrer seg mykt uten rykk mellom bevegelse og pause.
  const INTRO = [[0, 0], [.4, 0], [2.5, .37], [3.6, .57], [4.1, .60], [6.4, .60], [8.4, 1], [9.4, 1]];
  function arkivTempo() {
    // Lysbildefremvisning: hvert prosjekt glir inn og får stå.
    const n = 16, FLYTT = .5, STA = 1.2, kf = [[0, 0], [2.4, .02]];
    let t = 2.4;
    for (let k = 0; k < n; k++) {
      const p = .02 + (k + .5) / n * .92;
      t += FLYTT; kf.push([t, p]);
      t += STA + (k === n - 1 ? 1.4 : 0); kf.push([t, p]);
    }
    kf.push([t + .8, 1]);
    return kf;
  }
  const TEMPO = {
    loftet:   { inn: 2, kf: [[0, 0], [.8, .02], [5.3, .33], [6.1, .40], [8.8, .40], [10.8, .64], [11.8, .80], [15.3, .80], [16.3, 1]] },
    tomten:   { inn: 2, kf: [[0, 0], [4, .03], [10, .72], [11.6, .85], [14.4, .85], [15.2, 1]] },
    sporsmal: { inn: 2, kf: [[0, 0], [3.2, .05], [13.2, .82], [14.2, .90], [17.2, .90], [17.9, 1]] },
    detaljer: { inn: 2, kf: [[0, 0], [2.8, .03], [13.8, .92], [15.4, .92], [16.2, 1]] },
    arkivet:  { inn: 2, kf: arkivTempo() },
    salg:     { inn: 2.6, kf: [[0, 0], [5.4, 1]] },
    samtale:  { inn: 2.4, kf: [[0, 0], [5, 1]] },
    merket:   { inn: 2.6, kf: [[0, 0], [3.6, .5], [7, 1], [8, 1]] }
  };
  const KAP = Object.keys(TEMPO);
  // Hele filmen som én liste [tid, scrollposisjon].
  function manus() {
    const max = document.documentElement.scrollHeight - innerHeight;
    const introDist = $('intro').offsetHeight - innerHeight;
    const L = INTRO.map(([t, p]) => [t, p * introDist]);
    L.marks = [{ id: 'intro', t: 0, pos: 0 }];
    let t0 = L[L.length - 1][0];
    KAP.forEach(id => {
      const el = $(id), top = Math.min(max, el.getBoundingClientRect().top + scrollY);
      const end = Math.min(max, el.classList.contains('scene') ? top + el.offsetHeight - innerHeight : Math.max(top, top + el.offsetHeight - innerHeight));
      const { inn, kf } = TEMPO[id];
      L.push([t0 + inn, top]);
      L.marks.push({ id, t: t0 + inn, pos: top });
      kf.forEach(([t, p]) => { if (t > 0) L.push([t0 + inn + t, top + p * (end - top)]); });
      t0 = L[L.length - 1][0];
    });
    return L;
  }
  // Monoton kubisk interpolasjon (Fritsch–Carlson): ingen oversving, pauser blir ekte stillstand.
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
  const knapp = document.createElement('button');
  knapp.type = 'button'; knapp.className = 'film-knapp';
  document.body.appendChild(knapp);
  const rolig = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let spiller = false, raf = 0;
  const vis = () => { knapp.textContent = spiller ? 'Pause' : 'Spill av'; knapp.setAttribute('aria-pressed', spiller); };
  function stop() { spiller = false; cancelAnimationFrame(raf); vis(); }
  // Spill av en liste [tid, posisjon] fra start.
  function kjør(L) {
    cancelAnimationFrame(raf);
    spiller = true; vis();
    const slutt = L[L.length - 1][0], y = kurve(L);
    let start = null;
    const step = now => {
      if (!spiller) return;
      if (start === null) start = now;
      const t = (now - start) / 1000;
      scrollTo(0, y(t));
      if (t >= slutt) { stop(); return; }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
  }
  // Gli til et kapittel og spill filmen videre derfra.
  function fraKapittel(i) {
    const L = manus(), m = L.marks[Math.max(0, Math.min(L.marks.length - 1, i))];
    const y0 = scrollY, glid = Math.abs(m.pos - y0) < 2 ? 0 : Math.min(1.6, .7 + Math.abs(m.pos - y0) / 4000);
    const rest = L.filter(([t]) => t > m.t + .001).map(([t, pos]) => [t - m.t + glid, pos]);
    kjør(glid ? [[0, y0], [glid, m.pos], ...rest] : [[0, m.pos], ...rest]);
  }
  // Hvilket kapittel står leseren i nå?
  function nå() {
    const marks = manus().marks, y = scrollY + 4;
    let i = 0; marks.forEach((m, k) => { if (m.pos <= y) i = k; });
    return { i, inne: scrollY > marks[i].pos + innerHeight * .35 };
  }
  function bla(retning) {
    const { i, inne } = nå();
    fraKapittel(retning > 0 ? i + 1 : (inne ? i : i - 1));
  }
  // Fortsett fra der leseren står (Spill av-knappen midt på siden).
  function fortsett() {
    let L = manus();
    const y = scrollY, k = L.findIndex(([, pos]) => pos > y + 2);
    if (k < 1) return;
    const dt = Math.max(1, (L[k][0] - L[k - 1][0]) * Math.min(1, (L[k][1] - y) / Math.max(1, L[k][1] - L[k - 1][1])));
    const base = L[k][0] - dt;
    kjør([[0, y], ...L.slice(k).map(([t, pos]) => [t - base, pos])]);
  }

  // Scroll blar ett kapittel opp eller ned, og filmen går videre derfra.
  // Én bevegelse med hjul eller styreflate gir ett hopp, selv om den sender mange hendelser.
  let sisteHjul = 0, sisteBla = 0;
  const skjema = el => el && el.closest && el.closest('input, textarea, select, button, [contenteditable]');
  function prøvBla(retning) {
    const t = performance.now();
    if (t - sisteBla > 900) { sisteBla = t; bla(retning); }
  }
  if (!rolig) {
    addEventListener('wheel', e => {
      if (e.ctrlKey) return;
      e.preventDefault();
      const t = performance.now(), ny = t - sisteHjul > 280;
      sisteHjul = t;
      if (Math.abs(e.deltaY) < 3) return;
      if (ny || t - sisteBla > 1600) { sisteBla = 0; prøvBla(Math.sign(e.deltaY)); }
    }, { passive: false });
    let ty = null;
    addEventListener('touchstart', e => { ty = e.touches[0].clientY; }, { passive: true });
    addEventListener('touchmove', e => { if (!skjema(e.target)) e.preventDefault(); }, { passive: false });
    addEventListener('touchend', e => {
      if (ty === null) return;
      const dy = ty - e.changedTouches[0].clientY; ty = null;
      if (Math.abs(dy) > 40) prøvBla(Math.sign(dy));
    }, { passive: true });
    addEventListener('keydown', e => {
      if (skjema(e.target)) return;
      const ned = ['ArrowDown', 'PageDown', ' '].includes(e.key), opp = ['ArrowUp', 'PageUp'].includes(e.key);
      if (e.key === 'Home') { e.preventDefault(); fraKapittel(0); return; }
      if (e.key === 'End') { e.preventDefault(); fraKapittel(99); return; }
      if (ned || opp) { e.preventDefault(); prøvBla(ned ? 1 : -1); }
    });
    // Klikk på siden (lenker, skinnen, arkivet) setter filmen på pause.
    addEventListener('mousedown', e => { if (e.target !== knapp && !knapp.contains(e.target)) stop(); }, { capture: true });
  }
  knapp.addEventListener('click', () => spiller ? stop() : (scrollY < 10 ? fraKapittel(0) : fortsett()));
  vis();
  if (rolig) knapp.hidden = true;
  else if (scrollY < 10) (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => setTimeout(() => fraKapittel(0), 150));
})();
