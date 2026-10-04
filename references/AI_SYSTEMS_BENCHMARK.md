# Martin — AI-systemer: benchmark, hull og plan

Bruk denne filen når oppgaven gjelder markedsføringsautomatikk, agenter, AI-produksjon av bilde/video, KI-synlighet, off-market-motorene, lead-oppfølging eller valg av hva som skal bygges neste.

Grunnlag: gjennomgang av alle Martins repoer og research mot de ledende aktørene, 4. oktober 2026. Tall om aktørene er deres egne oppgitte tall. Sjekk på nytt hvert kvartal; feltet endrer seg raskt.

## 1. Benchmark per kategori

Brukes som kvalitetsnivå på samme måte som EVER for nettsider og Huyrebel for boligvideo (AI_OS §4A).

| Kategori | Benchmark | Hva de faktisk gjør |
|---|---|---|
| Markedsføringsagent | Luxury Presence «Autonomous AI Marketing Team» | Fire faste agenter: annonser, SEO, blogg, lead-oppfølging. Går hele døgnet. Bygget på data fra 65 000 meglere. |
| Produksjonslinje | Monks.Flow | Plan → lag → skaler → lever, med lukket tilbakekobling: resultatet styrer neste runde. Oppgir opptil 120x raskere produksjon. Persona.Flow simulerer kjøperprofiler før lansering. |
| Annonseinnhold | Jellyfish / Pencil (Brandtech) | Hver annonse får forventet effekt-score før lansering, basert på faktisk mediekjøp. Svake annonser byttes automatisk. |
| Romlig visning | Zillow SkyTour, Domain | Gaussian splats. Zillow: +79 % visninger, +76 % lagringer, +91 % delinger. |
| KI-synlighet | GEO-praksis (HousingWire, Homeflow) | Lik oppføring overalt (Google Business Profile, Bing Places, Apple Business Connect) og testing av hva ChatGPT faktisk svarer. |
| Video fra stillbilder | Veo 3.1, Kling 3.0, Runway Gen-4.5 | Korte klipp i 9:16 fra boligfoto. |

Følg for løpende oppdatering: Latent Space (swyx), One Useful Thing (Ethan Mollick), Import AI (Jack Clark), @bilawalsidhu (3D/splats), @runwayml.

## 2. Hva Martin har, og hullet mot benchmark

| Har | Fil | Hull |
|---|---|---|
| Daglig markedsagent | `martinbrusletto-site/AGENT_BRIEF.md`, `marketing/` | Måler «bygg grønt», ikke besøk eller henvendelser. Umami finnes (`BaseHead.astro`), men leses aldri. Kun LinkedIn-utkast, ingen Instagram, ingen annonser. |
| Videoregi | `martinbrusletto-site/netlify/functions/videoregi.ts` | Lager klippeplan, ikke video. |
| Multimodal scoring | `liggetid/.../dagens-beste.mjs`, `Kverv/.../tag-images.mjs` | Scorer andres boliger, ikke eget innhold. Finn/Hjem/EIE LOOK-tall per bolig finnes ukentlig, men lagres ikke strukturert. |
| Off-market-matching | `offmarket-vinderen/netlify/lib/motor.ts`, `offmarket-daglig.ts`, `offmarket-engine`, `diskre` | Fire motorer, ingen felles historikk. Matcher, men følger ikke opp eiere mellom treff. |
| KI-synlighet | `llms.txt`, IndexNow, Bing, JSON-LD | Optimaliserer, men tester aldri om Martin blir nevnt. |
| Boligsider | `property-site-template`, `scrollfilm.js` | Bildebasert. Ingen romlig scene. |
| Læringsloop | `AI_OS.md`, `CORRECTIONS.md`, `LEARNING_LOOP.md` | Føres manuelt. Ingen test som viser at leveransene blir bedre. |

## 3. Prinsipper (observasjon, se CORRECTIONS 2026-10-04)

1. **Mål effekt, ikke leveranse.** En automatikk er ikke ferdig før den leser tilbake hva den førte til (besøk, henvendelser, befaringer) og lar det styre neste runde.
2. **Planen er ikke produktet.** Når AI kan lage selve bildet, klippet eller annonsen, skal flyten ikke stoppe ved manus.
3. **Score eget innhold med egne tall.** Samme metode som `dagens-beste` brukes på Martins egne forsidebilder, titler og poster.
4. **Følg opp, ikke bare match.** En registrert eier eller kjøper skal høre noe nyttig mellom treff.
5. **Test synlighet.** KI-søk måles med faste spørsmål, ikke antas.
6. **Én kjerne før neste produkt.** Nye funksjoner bygges på en felles database, ikke som enda en frittstående motor.

## 4. Implementeringsplan

Rekkefølgen følger Musk-algoritmen i `AGENT_BRIEF.md`: først det som kobler sammen det som finnes, sist nye produkter.

### Fase 1 — Lukk loopen (uke 1–2). Høyest effekt, lavest risiko.

**1a. Effekt i den daglige loopen.**
- Hva: Agenten henter siste 7 dagers besøk per side fra Umami API før den velger dagens forbedring, og logger effekt-kolonne i `marketing/LOG.md`. Innlegg som gir trafikk til `/verdivurdering` eller `/private-market` prioriteres som tema.
- AI gjør selv: script `scripts/effekt/umami.mjs`, endring i daglig rutine.
- Martin må: lage API-nøkkel i Umami Cloud og legge den inn som `UMAMI_API_KEY` i rutinens miljø.
- Suksess: hver loggrad har et tall, og temavalg begrunnes med tall etter fire uker.

**1b. Annonse-effekt per bolig (egen Pencil).**
- Hva: Tallene Martin allerede sender selgere ukentlig (Finn, Hjem, EIE LOOK) lagres som én JSON per bolig per uke. Etter 8–10 boliger lar Claude finne mønster i forsidebilde, tittel og prisnivå mot klikk og lagringer.
- AI gjør selv: format, lagring og analyse.
- Martin må: lime inn tallene som før; ingen nye kilder.
- Merk: kun aggregerte annonsetall, ingen personopplysninger.

**1c. KI-synlighetstest.**
- Hva: Ukentlig jobb stiller faste spørsmål («beste megler Slemdal», «hva er boligen min verdt Vinderen», m.fl.) til Claude med websøk, og til ChatGPT/Perplexity hvis nøkler finnes. Logger om Martin nevnes, og hvilke kilder som siteres.
- Martin må: rydde Google Business Profile, Bing Places og Apple Business Connect slik at navn, tittel og kontor er identisk. Dette kan ikke AI gjøre for ham.

### Fase 2 — Produksjon (uke 3–6)

**2a. Fra klippeplan til klipp.** `videoregi.ts` sender planen videre til Kling eller Veo og lager 3–5 vertikale klipp per bolig fra fotodagens bilder. Huyrebel er fortsatt benchmark for det som spilles inn; dette dekker mellomrommet.

**2b. «Slik kan den bli».** Rendering av potensial og virtuell styling etter `VISUAL_RENDERING.md` (arkitektur låst).

**2c. Instagram-utkast.** Loopen lager Instagram-caption + bildeforslag ved siden av LinkedIn.

Krav for hele fase 2: alt generert merkes tydelig som illustrasjon. Hva markedsføringsloven og god meglerskikk krever må kontrolleres av fagansvarlig hos EIE før første bruk. Ansvarlig megler godkjenner hvert materiell før publisering.

### Fase 3 — Én kjerne (uke 6–10)

**3a. Felles database.** `offmarket-vinderen` er beste utgangspunkt (flerbruker, samtykke, gyldig-til-dato, ekte sletting, logg). Private Market-skjemaet og `offmarket-engine` kobles inn som kilder med `kilde`-felt; `diskre` og `offmarket-engine` fryses som konsepter til kjernen er i drift.

**3b. Eierrapport.** Månedlig e-post til eiere som har samtykket: verdiintervall fra `verdivurdering.ts`, ferske salg i nabolaget, ett utdrag fra Vestre Aker Journal. Erstatter stillhet mellom treff.

Krav: behandlingsgrunnlag, databehandleravtale (Netlify, Anthropic, e-postleverandør) og forholdet til EIEs systemer avklares med fagansvarlig og personvernansvarlig før ekte kundedata brukes. Gjelder også Kverv-integrasjonene mot regnskapssystemer.

### Fase 4 — Neste nivå (etter at fase 1–3 virker)

- **Splat-kapittel** i `property-site-template`: én romlig scene (hage eller hovedrom) som et kapittel i scrollfilmen. Krever opptak; resten kan AI bygge.
- **Persona-test:** tre anonymiserte, generelle kjøperprofiler leser salgsoppgave/side før publisering og peker på hva som mangler. Legges i `tests/` sammen med smakstestene.
- **Annonseagent** på Meta/Instagram når 1b har gitt nok data til å vite hva som virker. Krever Meta Business-tilgang og EIEs retningslinjer for betalt annonsering.

### Ikke nå

- Telefon-/stemmeagent: mulig, men krever opptak og samtykke som må avklares først.
- Salgsprediksjon for eiere: høy verdi, høy personvernrisiko. Ikke start uten skriftlig avklaring.
- Liggetid som betalt produkt: avklar Finn.no sine vilkår og databasevern først.

## 5. Hvordan AI skal bruke filen

1. Ved arbeid i en kategori over: sammenlign leveransen med benchmark, si konkret hva som mangler, og bygg det som kan bygges (AI_OS §4A).
2. Foreslå ikke nye frittstående produkter før fase 1 og 3a er i drift, med mindre Martin ber om det.
3. Oppdater tabellen i §2 når et hull lukkes, og logg det i `CORRECTIONS.md`.
