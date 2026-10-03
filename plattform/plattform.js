// Plattformen til Brusletto Eiendom. Én side, adresser med # (#/, #/p/<id>, #/p/<id>/regnskap, #/brukere, #/passord).
(() => {
  'use strict';
  const $ = s => document.querySelector(s);
  const main = $('#innhold');
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const kr = n => (Math.round(+n || 0)).toLocaleString('nb-NO') + ' kr';
  const mill = n => (Math.abs(n) >= 1e6 ? (n / 1e6).toLocaleString('nb-NO', { maximumFractionDigits: 1 }) + ' mill.' : kr(n));
  const dato = s => s ? new Date(s).toLocaleDateString('nb-NO', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
  const størrelse = b => b > 1e6 ? (b / 1e6).toLocaleString('nb-NO', { maximumFractionDigits: 1 }) + ' MB' : Math.max(1, Math.round(b / 1e3)) + ' kB';
  const iDag = () => new Date().toISOString().slice(0, 10);
  const tall = v => +String(v ?? '').replace(/\s|kr/g, '').replace(',', '.') || 0;

  let meg = null, KATEGORIER = [];

  // ---------- beskjeder og API ----------
  let beskjedTid;
  function beskjed(tekst, feil = false) {
    const b = $('#beskjed');
    b.textContent = tekst; b.classList.toggle('feil', feil); b.classList.add('vis');
    clearTimeout(beskjedTid); beskjedTid = setTimeout(() => b.classList.remove('vis'), feil ? 6000 : 3500);
  }
  async function api(sti, { metode = 'GET', data, raw } = {}) {
    const r = await fetch('/api/' + sti, {
      method: metode, credentials: 'same-origin',
      headers: raw ? { 'content-type': 'application/octet-stream' } : data ? { 'content-type': 'application/json' } : {},
      body: raw ?? (data ? JSON.stringify(data) : undefined),
    });
    if (r.status === 401) { location.href = '/logg-inn/?til=' + encodeURIComponent('/plattform/' + location.hash); throw new Error('Logg inn'); }
    const svar = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(svar.feil || 'Noe gikk galt.');
    return svar;
  }
  const prøv = async (fn, ok) => { try { const r = await fn(); if (ok) beskjed(ok); return r; } catch (e) { beskjed(e.message, true); throw e; } };

  // ---------- filtype ----------
  function filtype(f) {
    const n = (f.navn || '').toLowerCase(), t = f.type || '';
    if (t === 'application/pdf' || n.endsWith('.pdf')) return ['pdf', 'PDF'];
    if (t.startsWith('image/')) return ['bilde', 'Bilde'];
    if (/\.(xlsx?|csv|numbers)$/.test(n)) return ['excel', 'Excel'];
    if (/\.(docx?|pages|rtf)$/.test(n)) return ['word', 'Word'];
    if (/\.(dwg|dxf|ifc|skp|rvt)$/.test(n)) return ['', 'Tegning'];
    return ['', (n.split('.').pop() || 'Fil').slice(0, 5)];
  }

  // ---------- opp- og nedlasting i deler ----------
  async function lastOpp(fil, prosjekt, kategori, vis) {
    const { id, del } = await api('filer/start', { metode: 'POST', data: { prosjekt, navn: fil.name, type: fil.type, storrelse: fil.size, kategori } });
    const deler = Math.max(1, Math.ceil(fil.size / del));
    for (let n = 0; n < deler; n++) {
      const bit = fil.slice(n * del, (n + 1) * del);
      for (let forsøk = 0; ; forsøk++) {
        try { await api(`filer/del?id=${id}&n=${n}`, { metode: 'PUT', raw: bit }); break; }
        catch (e) { if (forsøk >= 2) throw e; await new Promise(r => setTimeout(r, 1000 * (forsøk + 1))); }
      }
      vis((n + 1) / deler);
    }
    return api('filer/ferdig', { metode: 'POST', data: { id } });
  }
  async function hentFil(f, vis) {
    const biter = [];
    for (let n = 0; n < f.deler; n++) {
      const r = await fetch(`/api/filer/del?id=${f.id}&n=${n}`, { credentials: 'same-origin' });
      if (!r.ok) throw new Error('Kunne ikke hente filen.');
      biter.push(await r.arrayBuffer()); vis && vis((n + 1) / f.deler);
    }
    return new Blob(biter, { type: f.type || 'application/octet-stream' });
  }
  async function åpne(f, lastNed = false) {
    beskjed(`Henter «${f.navn}» …`);
    const blob = await prøv(() => hentFil(f));
    const url = URL.createObjectURL(blob);
    const kanVises = /^(application\/pdf|image\/|text\/)/.test(blob.type);
    if (kanVises && !lastNed) {
      const w = window.open(url, '_blank');
      if (!w) location.href = url;
    } else {
      const a = Object.assign(document.createElement('a'), { href: url, download: f.navn });
      document.body.appendChild(a); a.click(); a.remove();
    }
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  }

  // ---------- visninger ----------
  async function visProsjekter() {
    const liste = await api('prosjekter');
    const nøkkeltall = await Promise.all(liste.map(async p => {
      const [filer, r] = await Promise.all([api('filer?prosjekt=' + p.id).catch(() => []), api('regnskap?prosjekt=' + p.id).catch(() => null)]);
      const budsjett = r ? r.poster.reduce((s, x) => s + x.budsjett, 0) : 0, brukt = r ? r.bilag.reduce((s, x) => s + x.belop, 0) : 0;
      return { filer: filer.length, budsjett, brukt };
    }));
    main.innerHTML = `
      <div class="p-hode"><h1>Prosjekter</h1><p class="hjelp">Velg et prosjekt for å se dokumenter, tegninger og byggeregnskap.</p></div>
      <div class="kort-rutenett">
        ${liste.map((p, i) => `
          <a class="pkort" href="#/p/${esc(p.id)}">
            <span class="status">${esc(p.status || 'Under arbeid')}</span>
            <h2>${esc(p.navn)}</h2>
            <p class="sted">${esc(p.sted)}</p>
            <p class="tall">${nøkkeltall[i].filer} ${nøkkeltall[i].filer === 1 ? 'dokument' : 'dokumenter'}${nøkkeltall[i].budsjett ? ` · brukt ${mill(nøkkeltall[i].brukt)} av ${mill(nøkkeltall[i].budsjett)}` : nøkkeltall[i].brukt ? ` · brukt ${mill(nøkkeltall[i].brukt)}` : ''}</p>
          </a>`).join('')}
        <div class="pkort ny" id="nytt-prosjekt">
          <button class="knapp lys" type="button" id="vis-nytt">+ Nytt prosjekt</button>
        </div>
      </div>`;
    $('#vis-nytt').onclick = () => {
      $('#nytt-prosjekt').innerHTML = `
        <form class="panel" id="nytt-skjema" style="border:0;padding:0;width:100%">
          <h3>Nytt prosjekt</h3>
          <label class="felt">Navn, for eksempel adressen<input name="navn" required></label>
          <label class="felt">Sted<input name="sted" placeholder="For eksempel Vinderen, Oslo"></label>
          <div class="rad"><button class="knapp">Lag prosjektet</button><button class="knapp lys" type="button" id="avbryt-nytt">Avbryt</button></div>
        </form>`;
      $('#nytt-skjema [name=navn]').focus();
      $('#avbryt-nytt').onclick = visProsjekter;
      $('#nytt-skjema').onsubmit = async e => {
        e.preventDefault();
        const f = e.target;
        const p = await prøv(() => api('prosjekter', { metode: 'POST', data: { navn: f.navn.value, sted: f.sted.value } }), 'Prosjektet er laget.');
        location.hash = '#/p/' + p.id;
      };
    };
  }

  async function visProsjekt(pid, fane) {
    const p = (await api('prosjekter')).find(x => x.id === pid);
    if (!p) { main.innerHTML = '<a class="tilbake" href="#/">← Alle prosjekter</a><h1>Fant ikke prosjektet</h1>'; return; }
    main.innerHTML = `
      <a class="tilbake" href="#/">← Alle prosjekter</a>
      <div class="p-hode"><h1>${esc(p.navn)}</h1><p class="sted">${esc(p.sted)}${p.side ? ` · <a href="${esc(p.side)}" target="_blank" rel="noopener">Se salgssiden</a>` : ''}</p></div>
      <div class="faner" role="tablist">
        <button role="tab" class="${fane === 'regnskap' ? '' : 'på'}" data-fane="dokumenter">Dokumenter og tegninger</button>
        <button role="tab" class="${fane === 'regnskap' ? 'på' : ''}" data-fane="regnskap">Byggeregnskap</button>
      </div>
      <section id="fane"></section>`;
    main.querySelectorAll('[data-fane]').forEach(b => b.onclick = () => { location.hash = `#/p/${pid}${b.dataset.fane === 'regnskap' ? '/regnskap' : ''}`; });
    if (fane === 'regnskap') await visRegnskap(p); else await visDokumenter(p);
  }

  // ---------- dokumenter ----------
  async function visDokumenter(p, filter = 'Alle', søk = '') {
    const filer = await api('filer?prosjekt=' + p.id);
    const el = $('#fane');
    const antall = k => filer.filter(f => f.kategori === k).length;
    const synlige = filer.filter(f => (filter === 'Alle' || f.kategori === filter) && (!søk || f.navn.toLowerCase().includes(søk.toLowerCase())));
    el.style.cssText = 'display:flex;flex-direction:column;gap:22px';
    el.innerHTML = `
      <div class="slipp" id="slipp" tabindex="0" role="button" aria-label="Last opp filer">
        <strong>Last opp dokumenter eller tegninger</strong>
        <p class="hjelp">Dra filene hit, eller trykk på knappen. Du kan velge flere filer samtidig.</p>
        <div class="rad">
          <label class="felt" style="flex:0 1 auto">Hva slags dokumenter er det?
            <select id="kategori">${KATEGORIER.map(k => `<option${k === (filter !== 'Alle' ? filter : 'Tegninger') ? ' selected' : ''}>${esc(k)}</option>`).join('')}</select>
          </label>
          <button class="knapp" type="button" id="velg">Velg filer</button>
        </div>
        <input type="file" id="filvelger" multiple hidden>
        <div class="fremdrift" id="fremdrift"></div>
      </div>
      <div class="rad" style="align-items:center;justify-content:space-between">
        <div class="filtre" role="group" aria-label="Vis kategori">
          ${['Alle', ...KATEGORIER].map(k => `<button type="button" class="${k === filter ? 'på' : ''}" data-filter="${esc(k)}">${esc(k)} (${k === 'Alle' ? filer.length : antall(k)})</button>`).join('')}
        </div>
        <label class="felt" style="flex:0 1 300px">Søk i dokumentene<input type="search" id="søk" value="${esc(søk)}" placeholder="Skriv et ord fra filnavnet"></label>
      </div>
      <div class="filer" id="filer">
        ${synlige.length ? synlige.map(f => {
          const [kl, navn] = filtype(f);
          return `<div class="fil" data-id="${esc(f.id)}">
            <span class="type ${kl}">${esc(navn)}</span>
            <div><button class="navn" type="button" data-åpne>${esc(f.navn)}</button>
              <p class="meta">${esc(f.kategori)} · ${dato(f.lastetOpp)} · ${størrelse(f.storrelse)} · lastet opp av ${esc(f.av)}</p></div>
            <div class="handlinger">
              <button class="knapp lys liten" type="button" data-åpne>Åpne</button>
              <button class="knapp lys liten" type="button" data-last>Last ned</button>
              <button class="knapp lys liten" type="button" data-endre>Endre</button>
              <button class="knapp lys liten" type="button" data-slett>Slett</button>
            </div>
          </div>`;
        }).join('') : `<p class="tomt">${filer.length ? 'Ingen dokumenter passer med valget.' : 'Ingen dokumenter ennå. Last opp det første over.'}</p>`}
      </div>`;

    const velger = $('#filvelger'), slipp = $('#slipp');
    $('#velg').onclick = e => { e.stopPropagation(); velger.click(); };
    slipp.onclick = e => { if (e.target === slipp || e.target.tagName === 'STRONG' || e.target.tagName === 'P') velger.click(); };
    slipp.onkeydown = e => { if ((e.key === 'Enter' || e.key === ' ') && e.target === slipp) { e.preventDefault(); velger.click(); } };
    slipp.ondragover = e => { e.preventDefault(); slipp.classList.add('over'); };
    slipp.ondragleave = () => slipp.classList.remove('over');
    slipp.ondrop = e => { e.preventDefault(); slipp.classList.remove('over'); last([...e.dataTransfer.files]); };
    velger.onchange = () => last([...velger.files]);
    async function last(liste) {
      if (!liste.length) return;
      const kategori = $('#kategori').value, fr = $('#fremdrift');
      fr.innerHTML = liste.map((f, i) => `<div><span>${esc(f.name)}</span><progress id="fr${i}" max="1" value="0"></progress></div>`).join('');
      let ok = 0;
      for (let i = 0; i < liste.length; i++) {
        try { await lastOpp(liste[i], p.id, kategori, v => { const b = $('#fr' + i); if (b) b.value = v; }); ok++; }
        catch (e) { beskjed(`«${liste[i].name}» ble ikke lastet opp: ${e.message}`, true); }
      }
      if (ok) beskjed(ok === 1 ? 'Dokumentet er lastet opp.' : `${ok} dokumenter er lastet opp.`);
      visDokumenter(p, filter, søk);
    }
    el.querySelectorAll('[data-filter]').forEach(b => b.onclick = () => visDokumenter(p, b.dataset.filter, $('#søk').value));
    let søkTid; $('#søk').oninput = e => { clearTimeout(søkTid); søkTid = setTimeout(() => { visDokumenter(p, filter, e.target.value).then(() => { const s = $('#søk'); s.focus(); s.setSelectionRange(s.value.length, s.value.length); }); }, 300); };
    el.querySelectorAll('.fil').forEach(rad => {
      const f = filer.find(x => x.id === rad.dataset.id);
      rad.querySelectorAll('[data-åpne]').forEach(b => b.onclick = () => åpne(f));
      rad.querySelector('[data-last]').onclick = () => åpne(f, true);
      rad.querySelector('[data-slett]').onclick = () => {
        rad.querySelector('.bekreft')?.remove();
        rad.insertAdjacentHTML('beforeend', `<div class="bekreft"><p>Vil du slette «${esc(f.navn)}»? Dette kan ikke angres.</p>
          <button class="knapp fare liten" type="button" data-ja>Ja, slett</button><button class="knapp lys liten" type="button" data-nei>Avbryt</button></div>`);
        rad.querySelector('[data-nei]').onclick = () => rad.querySelector('.bekreft').remove();
        rad.querySelector('[data-ja]').onclick = async () => { await prøv(() => api(`filer?id=${f.id}&prosjekt=${p.id}`, { metode: 'DELETE' }), 'Dokumentet er slettet.'); visDokumenter(p, filter, søk); };
      };
      rad.querySelector('[data-endre]').onclick = () => {
        if (rad.querySelector('.endre')) return rad.querySelector('.endre').remove();
        rad.insertAdjacentHTML('beforeend', `<form class="endre"><div class="rad">
          <label class="felt">Navn<input name="navn" value="${esc(f.navn)}"></label>
          <label class="felt">Kategori<select name="kategori">${KATEGORIER.map(k => `<option${k === f.kategori ? ' selected' : ''}>${esc(k)}</option>`).join('')}</select></label></div>
          <div class="rad"><button class="knapp liten">Lagre</button><button class="knapp lys liten" type="button" data-avbryt>Avbryt</button></div></form>`);
        const fm = rad.querySelector('.endre');
        fm.querySelector('[data-avbryt]').onclick = () => fm.remove();
        fm.onsubmit = async e => { e.preventDefault(); await prøv(() => api('filer', { metode: 'PUT', data: { id: f.id, prosjekt: p.id, navn: fm.navn.value, kategori: fm.kategori.value } }), 'Endringen er lagret.'); visDokumenter(p, filter, søk); };
      };
    });
  }

  // ---------- byggeregnskap ----------
  async function visRegnskap(p, r) {
    r = r || await api('regnskap?prosjekt=' + p.id);
    const el = $('#fane');
    el.style.cssText = 'display:flex;flex-direction:column;gap:24px';
    const brukt = id => r.bilag.filter(b => b.post === id).reduce((s, b) => s + b.belop, 0);
    const budsjett = r.poster.reduce((s, x) => s + x.budsjett, 0), totalt = r.bilag.reduce((s, b) => s + b.belop, 0), igjen = budsjett - totalt;
    const pst = budsjett ? Math.min(100, totalt / budsjett * 100) : 0;
    const postNavn = id => r.poster.find(x => x.id === id)?.navn || 'Uten post';
    el.innerHTML = `
      <div class="sum">
        <div><span>Budsjett</span><b>${kr(budsjett)}</b></div>
        <div><span>Brukt så langt</span><b>${kr(totalt)}</b></div>
        <div class="${igjen < 0 ? 'over' : 'igjen'}"><span>${igjen < 0 ? 'Over budsjett' : 'Igjen av budsjettet'}</span><b>${kr(Math.abs(igjen))}</b></div>
      </div>
      ${budsjett ? `<div><div class="stolpe ${totalt > budsjett ? 'over' : ''}"><i style="width:${pst}%"></i></div><p class="hjelp" style="margin-top:6px">${Math.round(totalt / budsjett * 100)} % av budsjettet er brukt.</p></div>` : '<p class="hjelp">Skriv inn budsjettet per post i tabellen under, så ser du hvor mye som er brukt og hvor mye som er igjen.</p>'}
      <div class="handlingsrad">
        <button class="knapp" type="button" id="ny-faktura">+ Registrer en faktura</button>
        <button class="knapp lys" type="button" id="eksport">Last ned regnskapet (Excel)</button>
      </div>
      <div id="faktura-skjema"></div>
      <h2>Budsjett per post</h2>
      <div class="tabell-ramme"><table class="tabell kortvis">
        <thead><tr><th>Post</th><th class="tall">Budsjett</th><th class="tall">Brukt</th><th class="tall">Igjen</th><th>Andel brukt</th></tr></thead>
        <tbody>${r.poster.map(x => { const b = brukt(x.id), g = x.budsjett - b; return `<tr>
          <td data-etikett="Post"><input class="postnavn" data-post="${esc(x.id)}" data-felt="navn" value="${esc(x.navn)}" aria-label="Navn på posten"></td>
          <td class="tall" data-etikett="Budsjett"><input inputmode="decimal" data-post="${esc(x.id)}" data-felt="budsjett" value="${x.budsjett ? x.budsjett.toLocaleString('nb-NO') : ''}" placeholder="0" aria-label="Budsjett for ${esc(x.navn)}"></td>
          <td class="tall" data-etikett="Brukt">${kr(b)}</td><td class="tall" data-etikett="Igjen" style="color:${g < 0 ? 'var(--fare)' : 'inherit'}">${kr(g)}</td>
          <td class="liten-stolpe" data-etikett="Andel brukt">${x.budsjett ? `<div class="stolpe ${b > x.budsjett ? 'over' : ''}"><i style="width:${Math.min(100, b / x.budsjett * 100)}%"></i></div>` : ''}</td></tr>`; }).join('')}</tbody>
        <tfoot><tr><td data-etikett="">Sum</td><td class="tall" data-etikett="Budsjett">${kr(budsjett)}</td><td class="tall" data-etikett="Brukt">${kr(totalt)}</td><td class="tall" data-etikett="Igjen">${kr(igjen)}</td><td></td></tr></tfoot>
      </table></div>
      <div class="handlingsrad"><button class="knapp" type="button" id="lagre-budsjett" hidden>Lagre budsjettet</button><button class="knapp lys" type="button" id="ny-post">+ Legg til en post</button></div>
      <h2>Fakturaer (${r.bilag.length})</h2>
      ${r.bilag.length ? `<div class="tabell-ramme"><table class="tabell kortvis">
        <thead><tr><th>Dato</th><th>Leverandør</th><th>Post</th><th class="tall">Beløp</th><th>Notat</th><th></th></tr></thead>
        <tbody>${[...r.bilag].sort((a, b) => (b.dato || '').localeCompare(a.dato || '')).map(b => `<tr data-bilag="${esc(b.id)}">
          <td data-etikett="Dato" style="white-space:nowrap">${dato(b.dato)}</td><td data-etikett="Leverandør">${esc(b.leverandor)}</td><td data-etikett="Post">${esc(postNavn(b.post))}</td>
          <td class="tall" data-etikett="Beløp">${kr(b.belop)}</td><td data-etikett="Notat">${esc(b.notat)}</td>
          <td style="white-space:nowrap"><button class="knapp lys liten" type="button" data-endre-bilag>Endre</button> <button class="knapp lys liten" type="button" data-slett-bilag>Slett</button></td></tr>`).join('')}</tbody>
      </table></div>` : '<p class="tomt panel">Ingen fakturaer registrert ennå.</p>'}
      ${r.oppdatert ? `<p class="hjelp">Sist endret ${dato(r.oppdatert)} av ${esc(r.av || '')}.</p>` : ''}`;

    const lagre = async (ny, melding) => { const svar = await prøv(() => api('regnskap?prosjekt=' + p.id, { metode: 'PUT', data: ny }), melding); visRegnskap(p, svar); };
    // budsjett og postnavn
    const endret = () => $('#lagre-budsjett').hidden = false;
    el.querySelectorAll('[data-post]').forEach(i => i.oninput = endret);
    $('#lagre-budsjett').onclick = () => {
      const poster = r.poster.map(x => ({ ...x,
        navn: el.querySelector(`[data-post="${x.id}"][data-felt=navn]`).value,
        budsjett: tall(el.querySelector(`[data-post="${x.id}"][data-felt=budsjett]`).value) }));
      lagre({ ...r, poster }, 'Budsjettet er lagret.');
    };
    $('#ny-post').onclick = () => lagre({ ...r, poster: [...r.poster, { id: 'ny' + Date.now(), navn: 'Ny post', budsjett: 0 }] }, 'Posten er lagt til. Skriv inn navn og budsjett.');
    // fakturaer
    function fakturaSkjema(b) {
      const s = $('#faktura-skjema');
      s.innerHTML = `<form class="panel" id="fakt">
        <h3>${b ? 'Endre faktura' : 'Registrer en faktura'}</h3>
        <div class="rad">
          <label class="felt" style="flex:0 1 200px">Dato<input type="date" name="dato" value="${esc(b?.dato || iDag())}" required></label>
          <label class="felt">Leverandør<input name="leverandor" value="${esc(b?.leverandor || '')}" placeholder="For eksempel rørleggeren" required></label>
        </div>
        <div class="rad">
          <label class="felt">Hvilken post gjelder det?<select name="post">${r.poster.map(x => `<option value="${esc(x.id)}"${b?.post === x.id ? ' selected' : ''}>${esc(x.navn)}</option>`).join('')}</select></label>
          <label class="felt" style="flex:0 1 240px">Beløp i kroner<input name="belop" inputmode="decimal" value="${b ? b.belop.toLocaleString('nb-NO') : ''}" placeholder="0" required></label>
        </div>
        <label class="felt">Notat (valgfritt)<input name="notat" value="${esc(b?.notat || '')}" placeholder="For eksempel fakturanummer"></label>
        <div class="rad"><button class="knapp">${b ? 'Lagre endringen' : 'Registrer fakturaen'}</button><button class="knapp lys" type="button" id="avbryt-fakt">Avbryt</button></div>
      </form>`;
      const f = $('#fakt');
      f.scrollIntoView({ behavior: 'smooth', block: 'center' }); f.leverandor.focus();
      $('#avbryt-fakt').onclick = () => s.innerHTML = '';
      f.onsubmit = e => {
        e.preventDefault();
        if (!tall(f.belop.value)) return beskjed('Skriv inn beløpet.', true);
        const ny = { id: b?.id || 'b' + Date.now(), dato: f.dato.value, leverandor: f.leverandor.value, post: f.post.value, belop: tall(f.belop.value), notat: f.notat.value, av: meg.navn };
        lagre({ ...r, bilag: b ? r.bilag.map(x => x.id === b.id ? ny : x) : [...r.bilag, ny] }, b ? 'Fakturaen er endret.' : 'Fakturaen er registrert.');
      };
    }
    $('#ny-faktura').onclick = () => fakturaSkjema();
    el.querySelectorAll('[data-bilag]').forEach(rad => {
      const b = r.bilag.find(x => x.id === rad.dataset.bilag);
      rad.querySelector('[data-endre-bilag]').onclick = () => fakturaSkjema(b);
      rad.querySelector('[data-slett-bilag]').onclick = e => {
        const td = e.target.closest('td');
        td.innerHTML = `<span style="color:var(--fare)">Slette?</span> <button class="knapp fare liten" type="button" data-ja>Ja</button> <button class="knapp lys liten" type="button" data-nei>Nei</button>`;
        td.querySelector('[data-nei]').onclick = () => visRegnskap(p, r);
        td.querySelector('[data-ja]').onclick = () => lagre({ ...r, bilag: r.bilag.filter(x => x.id !== b.id) }, 'Fakturaen er slettet.');
      };
    });
    // eksport til Excel (CSV med semikolon og norsk desimalkomma)
    $('#eksport').onclick = () => {
      const c = v => `"${String(v ?? '').replace(/"/g, '""')}"`, t = n => (+n || 0).toFixed(2).replace('.', ',');
      const linjer = [`${c('Byggeregnskap: ' + p.navn)}`, '', ['Post', 'Budsjett', 'Brukt', 'Igjen'].map(c).join(';'),
        ...r.poster.map(x => [c(x.navn), t(x.budsjett), t(brukt(x.id)), t(x.budsjett - brukt(x.id))].join(';')),
        [c('Sum'), t(budsjett), t(totalt), t(igjen)].join(';'), '', ['Dato', 'Leverandør', 'Post', 'Beløp', 'Notat'].map(c).join(';'),
        ...r.bilag.map(b => [c(b.dato), c(b.leverandor), c(postNavn(b.post)), t(b.belop), c(b.notat)].join(';'))];
      const blob = new Blob(['﻿' + linjer.join('\r\n')], { type: 'text/csv;charset=utf-8' });
      const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: `Byggeregnskap ${p.navn} ${iDag()}.csv` });
      document.body.appendChild(a); a.click(); a.remove();
    };
  }

  // ---------- brukere ----------
  async function visBrukere() {
    if (meg.rolle !== 'admin') { location.hash = '#/'; return; }
    const liste = await api('brukere');
    main.innerHTML = `
      <div class="p-hode"><h1>Brukere</h1><p class="hjelp">Alle her kan se og endre alle prosjekter. Gi personen e-post og passord selv; de kan bytte passord under «Mitt passord».</p></div>
      <div class="filer">${liste.map(b => `<div class="fil" data-epost="${esc(b.epost)}">
        <span class="type">${b.rolle === 'admin' ? 'Admin' : 'Familie'}</span>
        <div><p class="navn" style="cursor:default">${esc(b.navn)}</p><p class="meta">${esc(b.epost)} · lagt til ${dato(b.opprettet)}</p></div>
        <div class="handlinger">${b.epost === meg.epost ? '<span class="hjelp">Deg</span>' : '<button class="knapp lys liten" type="button" data-slett>Fjern tilgang</button>'}</div></div>`).join('')}</div>
      <form class="panel" id="ny-bruker">
        <h2>Gi en person tilgang</h2>
        <div class="rad"><label class="felt">Navn<input name="navn" required></label><label class="felt">E-post<input name="epost" type="email" required></label></div>
        <div class="rad"><label class="felt">Passord (minst 8 tegn)<input name="passord" required minlength="8"></label>
          <button class="knapp lys" type="button" id="lag-passord">Lag et passord for meg</button></div>
        <label class="felt" style="max-width:320px">Rolle<select name="rolle"><option value="familie">Familie (kan alt unntatt brukere)</option><option value="admin">Administrator (kan også gi tilgang)</option></select></label>
        <div class="rad"><button class="knapp">Gi tilgang</button></div>
      </form>`;
    $('#lag-passord').onclick = () => {
      const ord = ['Skifer', 'Kobber', 'Eik', 'Tegl', 'Kalk', 'Messing', 'Fjell', 'Fjord'];
      const a = crypto.getRandomValues(new Uint32Array(3));
      $('#ny-bruker').passord.value = ord[a[0] % ord.length] + '-' + ord[a[1] % ord.length].toLowerCase() + '-' + (1000 + a[2] % 9000);
    };
    $('#ny-bruker').onsubmit = async e => {
      e.preventDefault(); const f = e.target;
      const svar = await prøv(() => api('brukere', { metode: 'POST', data: { navn: f.navn.value, epost: f.epost.value, passord: f.passord.value, rolle: f.rolle.value } }));
      beskjed(svar.oppdatert ? 'Personen er oppdatert.' : `${f.navn.value} har fått tilgang. Husk å gi beskjed om passordet.`);
      visBrukere();
    };
    main.querySelectorAll('[data-epost] [data-slett]').forEach(b => b.onclick = () => {
      const rad = b.closest('.fil'), e = rad.dataset.epost;
      rad.insertAdjacentHTML('beforeend', `<div class="bekreft"><p>Fjerne tilgangen for ${esc(e)}?</p><button class="knapp fare liten" type="button" data-ja>Ja, fjern</button><button class="knapp lys liten" type="button" data-nei>Avbryt</button></div>`);
      rad.querySelector('[data-nei]').onclick = () => rad.querySelector('.bekreft').remove();
      rad.querySelector('[data-ja]').onclick = async () => { await prøv(() => api('brukere?epost=' + encodeURIComponent(e), { metode: 'DELETE' }), 'Tilgangen er fjernet.'); visBrukere(); };
    });
  }

  // ---------- passord ----------
  function visPassord() {
    main.innerHTML = `
      <div class="p-hode"><h1>Mitt passord</h1><p class="hjelp">Du er logget inn som ${esc(meg.navn)} (${esc(meg.epost)}).</p></div>
      <form class="panel" id="pw" style="max-width:560px">
        <label class="felt">Nåværende passord<input type="password" name="gammelt" autocomplete="current-password" required></label>
        <label class="felt">Nytt passord (minst 8 tegn)<input type="password" name="nytt" autocomplete="new-password" required minlength="8"></label>
        <label class="felt">Skriv det nye passordet en gang til<input type="password" name="igjen" autocomplete="new-password" required></label>
        <div class="rad"><button class="knapp">Bytt passord</button></div>
      </form>`;
    $('#pw').onsubmit = async e => {
      e.preventDefault(); const f = e.target;
      if (f.nytt.value !== f.igjen.value) return beskjed('De to nye passordene er ikke like.', true);
      await prøv(() => api('passord', { metode: 'POST', data: { gammelt: f.gammelt.value, nytt: f.nytt.value } }), 'Passordet er byttet.');
      f.reset();
    };
  }

  // ---------- ruting ----------
  async function rute() {
    const h = location.hash.replace(/^#\/?/, '').split('/');
    document.querySelectorAll('[data-meny]').forEach(a => a.classList.toggle('på',
      (a.dataset.meny === 'prosjekter' && (h[0] === '' || h[0] === 'p')) || a.dataset.meny === h[0]));
    main.innerHTML = '<p class="laster">Henter …</p>';
    try {
      if (h[0] === 'p' && h[1]) await visProsjekt(decodeURIComponent(h[1]), h[2]);
      else if (h[0] === 'brukere') await visBrukere();
      else if (h[0] === 'passord') visPassord();
      else await visProsjekter();
    } catch (e) { main.innerHTML = `<h1>Noe gikk galt</h1><p class="hjelp">${esc(e.message)}</p><p><button class="knapp" onclick="location.reload()">Prøv igjen</button></p>`; }
    main.focus({ preventScroll: true });
  }

  (async () => {
    try { meg = await api('meg'); } catch { return; }
    KATEGORIER = meg.kategorier;
    $('#hei').textContent = 'Hei, ' + meg.navn.split(' ')[0];
    if (meg.rolle === 'admin') $('#meny-brukere').hidden = false;
    addEventListener('hashchange', () => { scrollTo(0, 0); rute(); });
    rute();
  })();
})();
