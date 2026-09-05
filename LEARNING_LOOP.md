# Læringsloop — aktør

Dette er verktøyet som kjører AI_OS §8 og §10. Uten denne filen (og aktøren bak) er læringsreglene bare tekst.

## Aktør

- **Martin Ai** (Grok Bot) eier loopen.
- Inntak: Notion [Korrigeringer – AI OS](https://app.notion.com/p/7fb3a69ee88844b9ab57dcd78be64c71)
- Repo-logg: `CORRECTIONS.md`
- Varige regler: `AI_OS.md` + `references/*`

## Når noe skal læres

1. Martin godkjenner, korrigerer, velger, eller sier «mer sånn» / «ikke sånn».
2. Aktøren logger signalet i Notion (Type: godkjenning / korrigering / valg) med Før, Etter, Signal, Status, Målfil, Kategori, Kilde.
3. Status starter som `observasjon` med mindre Martin sier det er varig, eller mønsteret allerede er gjentatt.
4. Synk til `CORRECTIONS.md` samme dag når mulig. Sett «Synket til repo» i Notion.
5. Ved `gjentatt mønster` eller `varig regel`: oppdater målfilen i `references/` (eller `AI_OS.md` hvis overordnet).

## Ukentlig runde (mandag)

1. Hent rader i Notion der «Synket til repo» er av.
2. Synk dem til `CORRECTIONS.md`.
3. Se etter mønstre som bør oppgraderes.
4. Oppdater referansefiler / AI_OS bare når oppgraderingsreglene i `CORRECTIONS.md` er oppfylt.
5. Marker synkede rader.
6. Ping Martin kun hvis det er noe å beslutte (oppgradering til varig regel, konflikt, manglende fakta). Ellers stille.

## Skill

Bruk skillen «AI OS lær» når Martin gir et læringssignal midt i arbeidet.
