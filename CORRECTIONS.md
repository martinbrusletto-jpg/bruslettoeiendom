# Martin — correction log

Denne filen er læringsloggen for konkrete korrigeringer. Den skal brukes til å fange før/etter-mønstre uten å fylle hovedinstruksen med enkelthendelser.

## Hvordan bruke filen

For hver tydelig korrigering, logg:

### Dato
Kategori: e-post / SMS / eiendom / analyse / design / kode / annet

**Før:**
Kort beskrivelse eller relevant utdrag.

**Etter:**
Hva Martin endret eller godkjente.

**Læringssignal:**
Hva korrigeringen antyder om en mulig preferanse.

**Status:**
- observasjon
- gjentatt mønster
- varig regel

---

## Regler for oppgradering

En observasjon skal normalt ikke bli en varig regel etter én korreksjon.

Oppgrader til «gjentatt mønster» når samme type korreksjon skjer flere ganger.

Oppgrader til «varig regel» når:
- Martin eksplisitt sier at preferansen er varig, eller
- mønsteret er stabilt på tvers av flere leveranser.

Når noe blir en varig regel, oppdater riktig fil i `references/` og eventuelt `AI_OS.md` dersom regelen er overordnet.

Hvis nyere godkjente leveranser motsier en gammel regel, skal regelen revurderes.

Inntak: Notion-databasen [Korrigeringer – AI OS](https://app.notion.com/p/7fb3a69ee88844b9ab57dcd78be64c71). Aktør og synk: se `LEARNING_LOOP.md`.

---

## Logg

### 2026-09-05
Kategori: system

**Før:**
AI_OS §8/§10 beskriver ukentlig læring. Action ble «keyless» og validerte bare filstruktur. `/learn` ikke lagt inn. `CORRECTIONS.md` tom.

**Etter:**
Martin ba om at løkka faktisk skal kjøre. Notion-databasen opprettet som inntak. Martin Ai bygde aktør (skill + ukentlig routine) og synket loggen hit.

**Læringssignal:**
Beskrivelser av prosess uten en aktør som utfører dem gir null læring. Hver regel om læring må ha et verktøy som kjører den.

**Status:**
gjentatt mønster → håndtert (se `LEARNING_LOOP.md`)

Notion: https://app.notion.com/p/3d2f76d1e88081a19d6adb8fd359c067

---

### 2026-09-05
Kategori: design

**Før:**
Modellen påpekte at Los Verdiales-heroen brøt WEBSITE_DESIGN_SYSTEM §3 (kursiv undertittel) og §6 (døgnsyklus-animasjon).

**Etter:**
Martin var fornøyd med heroen. Reglene var skrevet av ChatGPT, ikke uttalt av Martin.

**Læringssignal:**
Én bevisst kursiv undertittel og én ambisiøs, langsom hero-bevegelse er ønsket. Det er spredning av små effekter som skal unngås. Autogenererte designregler veier mindre enn Martins faktiske godkjenning.

**Status:**
varig regel (oppdatert i `references/WEBSITE_DESIGN_SYSTEM.md`)

Notion: https://app.notion.com/p/3d2f76d1e880816aaccedfd023f1ee78

---

### 2026-09-05
Kategori: system

**Før:**
Konkret `ABOUT_MARTIN.md` med prosjekttabell, stack og «det modellen ofte får feil».

**Etter:**
Omskrevet til generelle beskrivelser som gjentar AI_OS. Martin ba om at det nyttige legges tilbake.

**Læringssignal:**
Konkrete fakta (prosjekter, stack, typiske feil) er mer nyttige for modellen enn beskrivelser av holdning.

**Status:**
observasjon — åpen: forrige konkrete versjon finnes ikke i git-historikk; trenger Martins fakta for full restore.

Notion: https://app.notion.com/p/3d2f76d1e8808167bad1f20935fa4c12

---

### 2026-09-05 · e-post/salg · Tilbud i vedlegg, e-post skal selge inn
**Før:**
Modellen la hele pristilbudet inn i e-posten med kostnadsposter og totalestimat, og avsluttet med å tilby å sende et formelt tilbud.

**Etter:**
Martin presiserte at tilbud som hovedregel sendes som vedlegg, med mindre han uttrykkelig ber om at det skal stå i e-posten. Den reviderte e-posten som bygget verdi rundt honorar, presentasjon, foto og posisjonering ble eksplisitt godkjent med karakter 5.

**Signal:**
Ved tilbudsmailer skal e-posten bygge verdi og posisjonere Martin, mens detaljert prisoppsett normalt ligger i vedlegget.

**Status:** varig regel — eksplisitt formulert som generell arbeidsmåte og bekreftet med godkjent versjon

---

### 2026-09-05 · design/nettside · Scroll skal gi større opplevelse
**Før:**
Boligsiden hadde rolig redaksjonell retning, store bilder og diskrete animasjoner, men opplevdes hovedsakelig som en serie pene, statiske seksjoner.

**Etter:**
Martin vurderte siden som karakter 4 og presiserte at den manglet effekter og en større opplevelse når man scroller. Dagen etter ga han samme type tilbakemelding på en annen boligpresentasjon: for lite effekt, fargedybde og eksklusiv opplevelse.

**Signal:**
Premium nettsider skal ikke bare være visuelt pene; scrollingen bør ha dramaturgi, bevegelse og tydelig progresjon som gjør at siden føles større og mer opplevelsesrik uten å bli masete.

**Status:** gjentatt mønster — to separate leveranser peker samme vei

---

### 2026-09-05 · boligvideo · Huyrebel som presentasjonsbenchmark
**Før:**
Ingen eksplisitt fast referanse for nivået på boligvideo og muntlig presentasjon var logget.

**Etter:**
Martin sa at Huyrebel er den beste på boligvideo og presenterer boliger ekstremt godt.

**Signal:**
Ved boligvideo skal Huyrebel brukes som kvalitetsbenchmark for presentasjon, flyt, trygghet, timing og evnen til å gjøre boligen interessant uten at det føles påtatt.

**Status:** varig regel — eksplisitt global preferanse

---

### 2026-09-05 · design/nettside · Award-vinnende boligsider som benchmark
**Før:**
Nettsideregler var formulert generelt rundt rolig premiumdesign, store bilder og redaksjonell stil.

**Etter:**
Martin sa at de award-vinnende bolig-/eiendomsnettsidene funnet tidligere samme dag er det beste nivået, med EVER som viktigste referanse, deretter Vide Infra sin samling, MACNAA og HOUS Luxury Homes. Nye boligsider skal komme så tett på dette kvalitetsnivået som mulig.

**Signal:**
Bolignettsider skal benchmarkes mot de beste prisbelønte referansene, ikke mot typiske meglersider eller generiske templates.

**Status:** varig regel — eksplisitt global preferanse

---

### 2026-09-05 · system/produksjon · AI skal lukke kvalitetsgapet selv
**Før:**
AI kunne beskrive hva som manglet for å nå referansenivået uten nødvendigvis å produsere alle elementene den faktisk kunne lage.

**Etter:**
Martin presiserte at AI skal si konkret hva som mangler for å nå benchmarknivået, og selv lage alt den faktisk kan lage.

**Signal:**
Ved kvalitetsgap skal AI både gjøre gap-analysen og utføre alle forbedringer den har verktøy og kapasitet til, i stedet for å stoppe ved anbefalinger.

**Status:** varig regel — eksplisitt global preferanse

---

### 2026-09-06
Kategori: design

**Før:**
Holmenkollveien 48B-presentasjonen: dempet beige/kalk-palett, én Ken Burns på hero, lite øvrig bevegelse. Martin syntes den var fin.

**Etter:**
«Mangler farger og eksklusivitet.» «Mangler også effekter slik at man ikke får den store opplevelsen.»

**Læringssignal:**
Stille luksus er ikke det samme som blek og stillestående. Bolig-/premiumsider trenger rikere farge- og materialdybde (varmere toner, kontrast, merkevarefølelse) og et par kuraterte opplevelseseffekter — ikke bare én subtil hero-bevegelse. Unngå fortsatt støy og mange små scroll-effekter; lag heller få, tydelige øyeblikk.

**Status:**
gjentatt mønster sammen med scroll-tilbakemeldingen 2026-09-05

Notion: https://app.notion.com/p/3d3f76d1e8808179b8e8c50c3c4e1065

---

### 2026-09-06 · nettside/arbeidsflyt · Ferdige sider skal kunne åpnes direkte på mobil
**Før:**
Nettsider kunne bli levert som lokal HTML/ZIP som krevde ekstra steg før Martin kunne vurdere dem på telefon.

**Etter:**
Martin presiserte at han ofte jobber fra mobil, at bilder skal være med i nettsiden, og at ferdige sider skal publiseres direkte på Netlify eller tilsvarende når mulig slik at de kan åpnes med en gang.

**Læringssignal:**
For nettsideoppgaver er en fungerende mobilåpnebar URL del av selve leveransen, ikke et valgfritt siste steg. Lokale filer er backup.

**Status:** varig regel — eksplisitt global arbeidsflytpreferanse

---

### 2026-09-06 · eiendomstekst · Selg det markedet ikke kan erstatte
**Før:**
Eiendomsreglene prioriterte lokal sammenligning, kjøpergruppe og konkrete verdidrivere, men hadde ikke et samlet skrivehierarki for annonser og salgsdokumenter.

**Etter:**
Det ble lagt inn en egen Martin-standard for eiendomstekst med kjerneprinsippet «Selg det markedet ikke kan erstatte»: knapphetskvaliteter, mikrobeliggenhet, tomt, sol/utsikt, arkitektur og praktiske goder skal komme før generiske interiørsuperlativer. Stilen skal være stram, moderne, faktabasert og autoritativ uten å bli pompøs.

**Læringssignal:**
Eiendomstekst skal raskt forklare hvorfor objektet er vanskelig å erstatte i markedet. Fakta og knapphet skal bære sterke formuleringer; standard meglerprosa og ubegrunnede superlativer skal nedprioriteres.

**Status:** gjentatt/sterkt signal — samsvarer med eksisterende preferanser for lokal data, konkrete kvaliteter, korte setninger og lite reklamespråk


### 2026-09-05
Kategori: design

**Før:**
Gulleråsveien 43B v2: hero med linjevis tittel og parallax, clip-path-avdekking av bilder, tellere, sticky-sekvens for badene, progressstripe. Ingen horisontal scroll eller layoutbrudd.

**Etter:**
Martin: «Bra.» Godkjent uten endringer.

**Læringssignal:**
Dette bevegelsesnivået er riktig for boligpresentasjoner: flere orkestrerte effekter som følger scroll, men rolige og uten brudd. Bruk som referanse for «én scroll-opplevelse».

**Status:**
observasjon

Notion: https://app.notion.com/p/3d2f76d1e88081269ad0ee787376bf90

---

### 2026-09-05
Kategori: design

**Før:**
Gullerås-side med én fade som eneste bevegelse, etter WEBSITE_DESIGN_SYSTEM §6 («for mange scroll-animasjoner» dårlig).

**Etter:**
Martin: «Bra nettside men karakter 4 fordi det ikke er effekter og at man ikke får en større opplevelse av nettsiden når man scroller.»

**Læringssignal:**
Martin vil ha en scroll-opplevelse: parallax, avdekking av bilder, sticky-paneler, tellere. Regelen om lite bevegelse er ChatGPT-utledet og strengere enn smaken. Andre gang §6 motsies av en godkjenning (Los Verdiales var første).

**Status:**
gjentatt mønster (målfil `references/WEBSITE_DESIGN_SYSTEM.md` §6 — allerede oppdatert)

Notion: https://app.notion.com/p/3d2f76d1e8808133a42ad5e422b6d892

---

### 2026-09-05
Kategori: design

**Før:**
Gulleråsveien 43B-presentasjon: kjøkken som hero, ett stort bilde per seksjon, én følelsessetning + én faktasetning, materialbolk, mørk kontaktseksjon.

**Etter:**
Score 4. Tekst, struktur, bildevalg og palett godkjent uten kommentar. Trekk kun for manglende bevegelse.

**Læringssignal:**
Oppbyggingen bilde + én følelsessetning + én faktasetning treffer. Kan brukes som mal for boligpresentasjoner.

**Status:**
observasjon

Notion: https://app.notion.com/p/3d2f76d1e880815e9684fbaff239402f

---

### 2026-09-05
Kategori: system

**Før:**
Læringsloop levert: LEARNING_LOOP, CORRECTIONS-synk, skill, mandagsroutine, designregel.

**Etter:**
Martin sa «Supert» uten endringer.

**Læringssignal:**
Godkjenning uten endringer: levert løsning for læringsaktør traff.

**Status:**
observasjon

Notion: https://app.notion.com/p/3d2f76d1e880818f9207d1ca99419ed1

---

### 2026-09-05
Kategori: e-post/SMS

**Før:**
Første kjøring av tests/oppgaver.md #01 mot AI_OS d737e7fa.

**Etter:**
Score 4. «Ganske så bra.» To korrigeringer logget separat.

**Læringssignal:**
Struktur, lengde og tone i befaringsmail treffer. Feilene lå i språkform og salgsargument, ikke i oppbygging.

**Status:**
observasjon

Notion: https://app.notion.com/p/3d2f76d1e880819d881df9a209ac9a8c

---

### 2026-09-05
Kategori: tekst

**Før:**
Smakstest 01, befaringsmail: «Tomta og lyset i stuen».

**Etter:**
Martin: «Jeg bruker ikke a-endinger.» Skal være «tomten». Konservativt bokmål gjennomgående (tomten, boken, hytten, gaten).

**Læringssignal:**
Skriv konservativt bokmål uten a-endinger i all tekst for Martin.

**Status:**
varig regel (oppdatert i `references/EMAIL_SMS_EXAMPLES.md` og `AI_OS.md` §2)

Notion: https://app.notion.com/p/3d2f76d1e88081c7a21ce40fc611daef

---

### 2026-09-05
Kategori: eiendom

**Før:**
Smakstest 01 argumenterte med kjøkken fra 2019 og «innflyttingsklart» som salgspoeng.

**Etter:**
Martin: «Jeg liker å selge boligen på følelser fordi følelser er ubetalelig, men rene materialer har en pris.»

**Læringssignal:**
Boligens følelse (lys, ro, tomt, liv i huset) er hovedargumentet. Materialer og oppgraderinger er støtte, ikke overskrift, fordi de kan prises av kjøper.

**Status:**
observasjon

Notion: https://app.notion.com/p/3d2f76d1e88081f6ac40d3227f933b92

---

### 2026-09-06
Kategori: system

**Før:**
Gulleråsveien 43B ble levert som zip med index.html og img/-mappe. Kan ikke åpnes fra mobil uten å pakke ut og laste opp.

**Etter:**
Martin: nettsider skal ha bildene lagt inn og lanseres direkte på Netlify, slik at de kan åpnes på mobil med en gang.

**Læringssignal:**
Leveranseformat: nettsider deployes til Netlify (eller bilder bakes inn) før de leveres. En fil Martin ikke kan åpne på mobil er ikke ferdig.

**Status:**
varig regel (allerede i `AI_OS.md` §4 og `references/WEBSITE_DESIGN_SYSTEM.md` §7)

Notion: https://app.notion.com/p/3d3f76d1e880810d8de2ec1bfd1c0814