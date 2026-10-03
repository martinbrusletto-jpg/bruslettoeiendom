// Plattformen til Brusletto Eiendom: innlogging, prosjekter, dokumentarkiv og byggeregnskap.
// Alt lagres i Netlify Blobs (butikken «plattform»). Ingen data ligger i repoet.
//
// Store filer lastes opp og ned i deler på 4 MB, fordi Netlify-funksjoner tar inntil 6 MB per kall.
import { getStore } from "@netlify/blobs";
import type { Config, Context } from "@netlify/functions";
import { lagOkt, lesOkt, settKake, slettKake, hashPassord, lik, hemmelighet } from "../lib/okt.mts";

const DEL = 4 * 1024 * 1024;
const KATEGORIER = ["Tegninger", "Kontrakter", "Byggesak", "Bank og finansiering", "Salg", "Bilder", "Annet"];
const STANDARDPOSTER = ["Tomt", "Prosjektering og rådgivning", "Byggesak og gebyrer", "Grunnarbeid", "Betong og mur", "Tømrer og råbygg",
  "Tak", "Vinduer og dører", "Elektro", "Rør og sanitær", "Ventilasjon", "Kjøkken og innredning", "Overflater", "Utomhus",
  "Finanskostnader", "Uforutsett"];

type Bruker = { navn: string; rolle: "admin" | "familie"; salt: string; hash: string; opprettet: string };
type Brukere = Record<string, Bruker>;

const lager = () => getStore({ name: "plattform", consistency: "strong" });
const json = (data: unknown, status = 200, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...headers } });
const feil = (melding: string, status = 400) => json({ feil: melding }, status);
const id = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
const nå = () => new Date().toISOString();

async function hent<T>(nøkkel: string, standard: T): Promise<T> {
  return ((await lager().get(nøkkel, { type: "json" })) as T) ?? standard;
}
const lagre = (nøkkel: string, data: unknown) => lager().setJSON(nøkkel, data);

const standardBruker = () => ((Netlify.env.get("PROFIL_BRUKER") || "job@reserva.as").trim().toLowerCase());

async function prosjekter() {
  let p = await hent<any[] | null>("prosjekter", null);
  if (!p) {
    p = [
      { id: "heyerdahlsvei8", navn: "Heyerdahls vei 8B", sted: "Slemdal, Oslo", status: "Til salgs", side: "/heyerdahlsvei8/", opprettet: nå() },
      { id: "varden8", navn: "Varden 8", sted: "Kvitfjell", status: "Til salgs", side: "/varden8/", opprettet: nå() },
    ];
    await lagre("prosjekter", p);
  }
  return p;
}

async function regnskap(pid: string) {
  return hent<any>(`regnskap/${pid}`, {
    poster: STANDARDPOSTER.map((navn) => ({ id: id(), navn, budsjett: 0 })),
    bilag: [],
    oppdatert: null,
  });
}

export default async (req: Request, _ctx: Context) => {
  const url = new URL(req.url);
  // (Netlify kan prøve /api/x.html eller /api/x/index.html som reserve; behandle dem likt.)
  const sti = url.pathname.replace(/^\/api\/?/, "").replace(/(\/index)?\.html?$/, "");
  const m = req.method;

  if (!hemmelighet()) return feil("Plattformen er ikke satt opp (PROFIL_PASSORD mangler i Netlify).", 503);

  // ---------- innlogging ----------
  if (sti === "logg-inn" && m === "POST") {
    const { epost = "", passord = "" } = await req.json().catch(() => ({}));
    const e = String(epost).trim().toLowerCase();
    const brukere = await hent<Brukere>("brukere", {});
    let ok = false;
    const b = brukere[e];
    if (b) ok = lik((await hashPassord(String(passord), b.salt)).hash, b.hash);
    else if (e === standardBruker() && lik(String(passord), hemmelighet())) {
      // Første innlogging: eieren av plattformen blir administrator.
      const h = await hashPassord(String(passord));
      brukere[e] = { navn: "Brusletto Eiendom", rolle: "admin", ...h, opprettet: nå() };
      await lagre("brukere", brukere);
      ok = true;
    }
    if (!ok) { await new Promise((r) => setTimeout(r, 700)); return feil("Feil e-post eller passord.", 401); }
    return json({ ok: true }, 200, { "set-cookie": settKake(await lagOkt(e)) });
  }
  if (sti === "logg-ut") return json({ ok: true }, 200, { "set-cookie": slettKake() });

  // ---------- alt under krever innlogging ----------
  const epost = await lesOkt(req);
  const brukere = await hent<Brukere>("brukere", {});
  const meg = epost ? brukere[epost] : null;
  if (!epost || !meg) return feil("Du må logge inn.", 401);
  const admin = meg.rolle === "admin";

  if (sti === "meg") return json({ epost, navn: meg.navn, rolle: meg.rolle, kategorier: KATEGORIER });

  if (sti === "passord" && m === "POST") {
    const { gammelt = "", nytt = "" } = await req.json();
    if (String(nytt).length < 8) return feil("Det nye passordet må ha minst 8 tegn.");
    if (!lik((await hashPassord(String(gammelt), meg.salt)).hash, meg.hash)) return feil("Det nåværende passordet stemmer ikke.");
    Object.assign(meg, await hashPassord(String(nytt)));
    await lagre("brukere", brukere);
    return json({ ok: true });
  }

  // ---------- brukere (bare administrator) ----------
  if (sti === "brukere") {
    if (!admin) return feil("Bare administrator kan endre brukere.", 403);
    if (m === "GET") return json(Object.entries(brukere).map(([e, b]) => ({ epost: e, navn: b.navn, rolle: b.rolle, opprettet: b.opprettet })));
    if (m === "POST") {
      const { navn = "", epost: ny = "", passord = "", rolle = "familie" } = await req.json();
      const e = String(ny).trim().toLowerCase();
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e)) return feil("Skriv inn en gyldig e-postadresse.");
      if (String(passord).length < 8) return feil("Passordet må ha minst 8 tegn.");
      if (!String(navn).trim()) return feil("Skriv inn navnet.");
      const fantes = !!brukere[e];
      brukere[e] = { navn: String(navn).trim(), rolle: rolle === "admin" ? "admin" : "familie", ...(await hashPassord(String(passord))), opprettet: brukere[e]?.opprettet ?? nå() };
      await lagre("brukere", brukere);
      return json({ ok: true, oppdatert: fantes });
    }
    if (m === "DELETE") {
      const e = (url.searchParams.get("epost") || "").toLowerCase();
      if (e === epost) return feil("Du kan ikke slette deg selv.");
      delete brukere[e];
      await lagre("brukere", brukere);
      return json({ ok: true });
    }
  }

  // ---------- prosjekter ----------
  if (sti === "prosjekter") {
    const liste = await prosjekter();
    if (m === "GET") return json(liste);
    if (m === "POST") {
      const { navn = "", sted = "" } = await req.json();
      if (!String(navn).trim()) return feil("Skriv inn navnet på prosjektet.");
      const p = { id: id(), navn: String(navn).trim(), sted: String(sted).trim(), status: "Under arbeid", opprettet: nå() };
      liste.push(p); await lagre("prosjekter", liste);
      return json(p);
    }
    if (m === "PUT") {
      const d = await req.json();
      const p = liste.find((x) => x.id === d.id);
      if (!p) return feil("Fant ikke prosjektet.", 404);
      for (const k of ["navn", "sted", "status"]) if (typeof d[k] === "string") p[k] = d[k].trim();
      await lagre("prosjekter", liste);
      return json(p);
    }
  }

  // ---------- dokumentarkiv ----------
  if (sti === "filer" && m === "GET") {
    const pid = url.searchParams.get("prosjekt") || "";
    return json(await hent<any[]>(`filer/${pid}`, []));
  }
  if (sti === "filer/start" && m === "POST") {
    const { prosjekt, navn, type, storrelse, kategori } = await req.json();
    if (!(await prosjekter()).some((p) => p.id === prosjekt)) return feil("Fant ikke prosjektet.", 404);
    const fid = id();
    await lagre(`opplasting/${fid}`, { prosjekt, navn: String(navn).slice(0, 200), type: String(type || "application/octet-stream"),
      storrelse: +storrelse || 0, kategori: KATEGORIER.includes(kategori) ? kategori : "Annet", deler: Math.max(1, Math.ceil((+storrelse || 0) / DEL)) });
    return json({ id: fid, del: DEL });
  }
  if (sti === "filer/del" && m === "PUT") {
    const fid = url.searchParams.get("id") || "", n = +(url.searchParams.get("n") || 0);
    const info = await hent<any>(`opplasting/${fid}`, null) ?? (await hent<any>(`fil/${fid}`, null));
    if (!info || n < 0 || n >= info.deler) return feil("Ukjent opplasting.", 404);
    const buf = await req.arrayBuffer();
    if (buf.byteLength > DEL + 1024) return feil("Delen er for stor.", 413);
    await lager().set(`fildel/${fid}/${n}`, buf);
    return json({ ok: true });
  }
  if (sti === "filer/ferdig" && m === "POST") {
    const { id: fid } = await req.json();
    const info = await hent<any>(`opplasting/${fid}`, null);
    if (!info) return feil("Ukjent opplasting.", 404);
    const meta = { id: fid, navn: info.navn, type: info.type, storrelse: info.storrelse, kategori: info.kategori, deler: info.deler, lastetOpp: nå(), av: meg.navn };
    const liste = await hent<any[]>(`filer/${info.prosjekt}`, []);
    liste.unshift(meta);
    await lagre(`filer/${info.prosjekt}`, liste);
    await lagre(`fil/${fid}`, { ...meta, prosjekt: info.prosjekt });
    await lager().delete(`opplasting/${fid}`);
    return json(meta);
  }
  if (sti === "filer/del" && m === "GET") {
    const fid = url.searchParams.get("id") || "", n = +(url.searchParams.get("n") || 0);
    const data = await lager().get(`fildel/${fid}/${n}`, { type: "arrayBuffer" });
    if (!data) return feil("Fant ikke filen.", 404);
    return new Response(data, { headers: { "content-type": "application/octet-stream", "cache-control": "private, no-store" } });
  }
  if (sti === "filer" && m === "PUT") {
    const { id: fid, prosjekt, navn, kategori } = await req.json();
    const liste = await hent<any[]>(`filer/${prosjekt}`, []);
    const f = liste.find((x) => x.id === fid);
    if (!f) return feil("Fant ikke filen.", 404);
    if (typeof navn === "string" && navn.trim()) f.navn = navn.trim().slice(0, 200);
    if (KATEGORIER.includes(kategori)) f.kategori = kategori;
    await lagre(`filer/${prosjekt}`, liste);
    return json(f);
  }
  if (sti === "filer" && m === "DELETE") {
    const fid = url.searchParams.get("id") || "", pid = url.searchParams.get("prosjekt") || "";
    const liste = await hent<any[]>(`filer/${pid}`, []);
    const f = liste.find((x) => x.id === fid);
    if (!f) return feil("Fant ikke filen.", 404);
    await lagre(`filer/${pid}`, liste.filter((x) => x.id !== fid));
    for (let n = 0; n < f.deler; n++) await lager().delete(`fildel/${fid}/${n}`);
    await lager().delete(`fil/${fid}`);
    return json({ ok: true });
  }

  // ---------- byggeregnskap ----------
  if (sti === "regnskap") {
    const pid = url.searchParams.get("prosjekt") || "";
    if (!(await prosjekter()).some((p) => p.id === pid)) return feil("Fant ikke prosjektet.", 404);
    if (m === "GET") return json(await regnskap(pid));
    if (m === "PUT") {
      const d = await req.json();
      const nåværende = await regnskap(pid);
      if (nåværende.oppdatert && d.oppdatert !== nåværende.oppdatert)
        return feil("Noen andre har endret regnskapet i mellomtiden. Last siden på nytt og prøv igjen.", 409);
      const tall = (v: unknown) => Math.round((+String(v).replace(/\s/g, "").replace(",", ".") || 0) * 100) / 100;
      const ny = {
        poster: (d.poster || []).slice(0, 200).map((p: any) => ({ id: String(p.id || id()), navn: String(p.navn || "").slice(0, 120), budsjett: tall(p.budsjett) })),
        bilag: (d.bilag || []).slice(0, 5000).map((b: any) => ({ id: String(b.id || id()), dato: String(b.dato || "").slice(0, 10), leverandor: String(b.leverandor || "").slice(0, 120),
          post: String(b.post || ""), belop: tall(b.belop), notat: String(b.notat || "").slice(0, 500), fil: b.fil ? String(b.fil) : null, av: String(b.av || meg.navn) })),
        oppdatert: nå(), av: meg.navn,
      };
      await lagre(`regnskap/${pid}`, ny);
      return json(ny);
    }
  }

  return feil("Ukjent forespørsel.", 404);
};

export const config: Config = { path: "/api/*" };
