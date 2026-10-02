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
profil/         Profilside (noindex): merket, farger, brevark, visittkort, skilt, nedlasting
takk.html       Etter innsendt skjema (Netlify Forms «kontakt»)
404.html        Feilside
assets/ny/      Bilder i WebP brukt av forsiden
assets/merke/   Merket som SVG i skifer, kalk og kobber
assets/favicon.svg, og.jpg, robots.txt, sitemap.xml
```

## Filmen

Forsiden spiller seg selv av ved første besøk. Tempoet styres i `TEMPO` i `be.js`: hvert kapittel har
`inn` (sekunder inn fra forrige kapittel) og nøkkelbilder `[sekunder, andel av kapitlet]`. Like andeler etter
hverandre gir en pause for lesing. Arkivet genereres av `arkivTempo()` (ca. 1,7 sekunder per prosjekt).
Hele filmen tar rundt 2,5 minutter. Kurven er en monoton kubisk spline (`kurve()`), så farten endrer seg mykt. Scroll (hjul, styreflate, sveip, piltaster, Page Up/Down, mellomrom) blar ett kapittel opp eller ned og
spiller filmen videre derfra. Home og End går til start og slutt. Klikk setter filmen på pause.

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
