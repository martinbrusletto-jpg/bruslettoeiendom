# Brusletto Eiendom

Konsept- og profilside for **Brusletto Eiendom AS** — utvikler av eksklusive boliger
i Oslo, på fjellet og ved sjøen siden 1984. Uttrykket «Carved Luxury»: norsk skifer,
drivved, bronse og presis boligkunst.

## Teknisk

Statisk ettsides-nettsted uten byggetrinn — publiseres direkte på Netlify.

```
index.html      Innhold og struktur (semantisk, med JSON-LD + Open Graph)
styles.css      Design (Cormorant Garamond + Inter, slate/kobber-palett)
script.js       Scroll-reveal, sticky header, mobilmeny og prosjekt-tidslinje
assets/         Prosjektfoto (JPG), drivved-logo, favicon
netlify.toml    Publiserer rotmappen som den er
```

### Seksjoner
Hero · Intro · Nøkkeltall · Prosess · Prosjekter (scroll-drevet tidslinje) ·
Nåværende retning · Materialer · Drivved-logo · Kontakt (Netlify-skjema) · Footer

## Lokal visning

Åpne `index.html` direkte i nettleser, eller kjør en enkel server:

```bash
python -m http.server 8000
```

## Kontaktskjema

Skjemaet bruker [Netlify Forms](https://docs.netlify.com/forms/setup/)
(`data-netlify="true"`). Innsendinger vises i Netlify-dashbordet under **Forms**.
