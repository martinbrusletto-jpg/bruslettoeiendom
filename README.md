# Brusletto Eiendom

Nettsted for **Brusletto Eiendom AS**. Kjernebudskap (Martin, 2. okt 2026):
«Vi bygger hus og leiligheter vi vil bo i selv. Da bygger vi det beste.
Ingenting blir overlatt til tilfeldighetene.»

Forsiden ble bygget om 2. oktober 2026 etter et konsept Martin godkjente
(«utrolig bra», «bygg den ferdig og launch»). Ikke gjør visuelle endringer på
forsiden, merket eller profilen uten at Martin har godkjent dem.

## Struktur

```
index.html      Forsiden: intro (merket konstrueres, spilles av som film) og åtte kapitler
be.css          All stil (Geist, kalkpuss #F3F1EC, skifer #1D2327, kobber #B0703F)
be.js           Scrollmotor: festede scener, solbane, spørsmål, bildestripe, arkiv, film-intro
profil/         Profilside bak innlogging: merket, farger, brevark, visittkort, skilt, SVG (profil/merke/)
netlify/edge-functions/profil.ts  Innlogging for /profil/ (PROFIL_PASSORD i Netlify, bruker job@reserva.as)
takk.html       Etter innsendt skjema (Netlify Forms «kontakt»)
404.html        Feilside
assets/ny/      Bilder i WebP brukt av forsiden
assets/favicon.svg, og.jpg, robots.txt, sitemap.xml
```

## Filmen

Forsiden spiller seg selv av med `scrollfilm.js` 2.0 (kopi av `~/.claude/skills/scrollfilm/scrollfilm.js`).
Hver seksjon har `data-film="4 | 8 | 12"` i `index.html`: spill i så mange sekunder, så 3 sekunder ro.
Hver seksjon glir inn på 0,9 s før tiden begynner. Scroll ned spoler seksjonen ferdig på 1 sekund, venter 2 og går videre; scroll under ventetiden går rett
til neste. Scroll opp går til starten av seksjonen. Klikk setter på pause.

## SEO og KI-søk

- `verktoy/lag_seo_sider.py` lager `/prosjekter/`, `/om/` (med spørsmål og svar), `llms.txt` og `sitemap.xml`
  fra én prosjektliste. Kjør `python verktoy/lag_seo_sider.py` etter endringer i prosjekter eller fakta.
- Strukturerte data (schema.org): Organization + HomeAndConstructionBusiness, WebSite, WebPage, ItemList
  (til salgs og prosjekter), FAQPage og BreadcrumbList.
- `robots.txt` slipper inn KI-crawlere (GPTBot, ClaudeBot, PerplexityBot m.fl.), men ikke `/profil/`.
- `bruslettoeiendom.netlify.app` sendes med 301 til `bruslettoeiendom.no`.
- Fakta: boligutvikling siden 1984; Brusletto Eiendom AS stiftet 26.05.1997 (Enhetsregisteret).

## Plattformen (innlogget)

`/plattform/` er familiens arbeidsflate: prosjekter, dokumenter og tegninger, og byggeregnskap.
`/profil/` (merket og profilen) ligger bak samme innlogging.

- `logg-inn/` innloggingssiden. `netlify/edge-functions/port.ts` sender alle uten økt dit.
- `netlify/functions/api.mts` hele serverdelen (`/api/*`): innlogging, brukere, prosjekter, filer, regnskap.
- `netlify/lib/okt.mts` signert økt (30 dager) og passord-hashing (PBKDF2).
- `plattform/` brukerflaten (én side, `#/`-adresser). Laget for å være lett: stor tekst, store knapper, få valg.
- Data ligger i Netlify Blobs (butikken `plattform`), aldri i repoet. Filer lagres i deler på 4 MB.
- Første innlogging: job@reserva.as med passordet i `PROFIL_PASSORD` blir administrator.
  Administrator gir andre tilgang under «Brukere». Bytter man `PROFIL_PASSORD`, logges alle ut.
- Lokal test: `PROFIL_PASSORD=<testpassord> netlify dev --offline` (edge-funksjonene krever Deno).

## Merket

Speilvendt B og E som deler én bærevegg. Nett 12,75 × 16 moduler, strek 2 moduler,
boller R 3,25 (over) og R 3,75 (under), midje på 7,5. SVG-geometri:

```
M6.75 0V16
M12.25 1H4.75A3.25 3.25 0 0 0 4.75 7.5H11.25
M12.75 15H4.75A3.75 3.75 0 0 1 4.75 7.5
```

## Språk

Konservativt bokmål uten a-endinger: stuen, solen, døren, natten, klokken. «Syv», ikke «sju».

## Publisering

Netlify-prosjektet `bruslettoeiendom` er koblet til GitHub og publiserer automatisk ved push til `main`.
Ingen byggetrinn. Lokal visning: `python -m http.server` i rotmappen.

## Åpne punkter

- Boligsummen i arkivet blir 179 (Nedre Skøyen vei mangler antall); tidligere side sa 176.
- Tomtekapitlet bruker eksempeltall (dreid 18°, kveldssol til 21:40), merket «eksempel».
- Domenet bruslettoeiendom.no ligger hos Domeneshop (okt 2026) og er lagt inn på Netlify. DNS: A @ 75.2.60.5, CNAME www bruslettoeiendom.netlify.app.
