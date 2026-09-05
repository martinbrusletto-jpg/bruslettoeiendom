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
Martin presiserte at tilbud som hovedregel sendes som vedlegg, med mindre han uttrykkelig ber om at det skal stå i e-posten. Selve e-posten skal tydeligere fremheve de sterke elementene i tilbudet og tørre å selge dem inn.

**Signal:**
Ved tilbudsmailer skal e-posten bygge verdi og posisjonere Martin, mens detaljert prisoppsett normalt ligger i vedlegget.

**Status:** observasjon
