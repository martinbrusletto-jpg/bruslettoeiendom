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

**Status:** observasjon — eksplisitt positiv godkjenning av korrigert versjon

---

### 2026-09-05 · design/nettside · Scroll skal gi større opplevelse
**Før:**
Boligsiden hadde rolig redaksjonell retning, store bilder og diskrete animasjoner, men opplevdes hovedsakelig som en serie pene, statiske seksjoner.

**Etter:**
Martin vurderte siden som karakter 4 og presiserte at den manglet effekter og en større opplevelse når man scroller.

**Signal:**
Premium nettsider skal ikke bare være visuelt pene; scrollingen bør ha dramaturgi, bevegelse og tydelig progresjon som gjør at siden føles større og mer opplevelsesrik uten å bli masete.

**Status:** observasjon

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
observasjon

Notion: https://app.notion.com/p/3d3f76d1e8808179b8e8c50c3c4e1065
