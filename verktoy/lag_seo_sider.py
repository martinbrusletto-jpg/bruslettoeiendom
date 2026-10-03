"""Lager de tekstrike SEO-sidene for bruslettoeiendom.no fra én datakilde.

Kjør fra repo-roten:  python verktoy/lag_seo_sider.py
Skriver: prosjekter/index.html, om/index.html, llms.txt, sitemap.xml
Oppdater PROSJEKTER under når et prosjekt endrer seg; forsidens arkiv (ARK i be.js) bør holdes likt.
Bare fakta som står her eller på forsiden. Ingen påstander som ikke kan dokumenteres.
"""
import json, html, datetime, pathlib

ROT = pathlib.Path(__file__).resolve().parent.parent
URL = "https://bruslettoeiendom.no"
I_DAG = datetime.date.today().isoformat()
TLF, TLF_VIS, EPOST = "+4790521234", "+47 905 21 234", "job@reserva.as"
ADR = {"streetAddress": "Helleveien 8", "postalCode": "0376", "addressLocality": "Oslo", "addressCountry": "NO"}

# (år, adresse, sted, kommune, type, antall boliger eller None, bilde eller None, til salgs-lenke eller None)
PROSJEKTER = [
    (2027, "Varden 8", "Kvitfjell", "Ringebu", "Fjellhytte", 1, "varden", "https://bruslettoeiendom.no/varden8/"),
    (2023, "Heyerdahls vei 8B", "Slemdal", "Oslo", "Enebolig", 1, "inngang", "https://bruslettoeiendom.no/heyerdahlsvei8/"),
    (2021, "Tangenodden 13", "Sandefjord", "Sandefjord", "Strandeiendom", 1, "tangenodden", None),
    (2020, "Helleveien 8", "Holmendammen", "Oslo", "Leiligheter", 6, "helleveien", None),
    (2013, "Nye Havsdalsvegen 35", "Geilo", "Hol", "Leiligheter", 4, None, None),
    (2011, "Skogryggveien 14", "Vinderen", "Oslo", "Leiligheter", 8, "a-skogryggveien-14", None),
    (2007, "Bærumsveien 219", "Bekkestua", "Bærum", "Leiligheter", 8, "a-baerumsveien-219", None),
    (2004, "Haakon den Godes vei 12", "Vinderen", "Oslo", "Leiligheter", 14, "a-haakon-den-godes-vei-12", None),
    (2003, "Thorleif Haugs vei 1–7", "Voksenkollen", "Oslo", "Leiligheter", 55, "a-thorleif-haugs-vei", None),
    (2001, "Tennisveien 26", "Slemdal", "Oslo", "Leiligheter", 6, "a-tennisveien-26", None),
    (2000, "Ekelyveien 11", "Vinderen", "Oslo", "Leiligheter", 14, "a-ekelyveien-11", None),
    (1999, "Bjørnveien 101B", "Holmen", "Oslo", "Terrasseleiligheter", 6, "a-bjornveien-101b", None),
    (1996, "Nedre Skøyen vei", "Skøyen", "Oslo", "Boligprosjekt", None, None, None),
    (1995, "Krags vei 10", "Holmenkollen", "Oslo", "Leiligheter", 14, "a-krags-vei-10", None),
    (1993, "Halvor Torgersens vei 14–20", "Ris", "Oslo", "Leiligheter", 20, "a-halvor-torgersens-vei", None),
    (1990, "Øvre Ullern Terrasse 5", "Ullern", "Oslo", "Terrasseleiligheter", 21, "a-ovre-ullern-terrasse-5", None),
]
GRUPPER = [
    ("vinderen", "Vinderen og Holmendammen", "Leiligheter og boliger på Vinderen og ved Holmendammen i Vestre Aker.", ["Vinderen", "Holmendammen"]),
    ("slemdal", "Slemdal", "Enebolig og leiligheter på Slemdal, mellom Vinderen og Holmenkollen.", ["Slemdal"]),
    ("holmenkollen", "Holmenkollen, Holmen og Voksenkollen", "Leiligheter i de høyereliggende delene av Vestre Aker, nær marka.", ["Holmenkollen", "Holmen", "Voksenkollen"]),
    ("ullern", "Ris, Ullern og Skøyen", "Terrasseleiligheter og leiligheter i Oslo vest.", ["Ris", "Ullern", "Skøyen"]),
    ("baerum", "Bærum", "Leiligheter på Bekkestua.", ["Bekkestua"]),
    ("fjellet", "På fjellet", "Hytte og leiligheter på Kvitfjell og Geilo.", ["Kvitfjell", "Geilo"]),
    ("sjoen", "Ved sjøen", "Strandeiendom i Sandefjord.", ["Sandefjord"]),
]
OMRADER = ["Vinderen", "Slemdal", "Holmendammen", "Holmen", "Holmenkollen", "Voksenkollen", "Ris", "Ullern", "Skøyen", "Bekkestua", "Kvitfjell", "Geilo", "Sandefjord"]
ANTALL = sum(p[5] or 0 for p in PROSJEKTER)

FAQ = [
    ("Hva er Brusletto Eiendom?",
     f"Brusletto Eiendom utvikler og bygger hus og leiligheter, hovedsakelig i Oslo vest, og har drevet med boligutvikling siden 1984. Aksjeselskapet Brusletto Eiendom AS (org.nr. 879 152 682) ble stiftet i 1997. Siden 1990 har vi stått bak {len(PROSJEKTER)} adresser med til sammen minst {ANTALL} boliger."),
    ("Hva betyr det at dere bygger hus dere vil bo i selv?",
     "Det er arbeidsmåten vår. Vi bygger hus og leiligheter vi selv vil bo i, og da bygger vi det beste. Ingenting blir overlatt til tilfeldighetene: tomten, solforholdene, planløsningen, materialene og detaljene blir vurdert som om vi skulle flytte inn selv."),
    ("Hvor bygger Brusletto Eiendom?",
     "Hovedsakelig i Oslo vest: Vinderen, Slemdal, Holmendammen, Holmen, Holmenkollen, Voksenkollen, Ris, Ullern og Skøyen. Vi har også bygget på Bekkestua i Bærum, på fjellet på Geilo og Kvitfjell, og ved sjøen i Sandefjord."),
    ("Hvilke boliger har Brusletto Eiendom til salgs nå?",
     "Heyerdahls vei 8B, en enebolig på Slemdal, og Varden 8, en fjellhytte på Kvitfjell. Resten av prosjektene våre er solgt."),
    ("Kjøper Brusletto Eiendom tomter og eiendommer?",
     "Ja. Vi kjøper tomter og eiendommer i Vestre Aker direkte, uten annonsering. Ta kontakt med en kort beskrivelse av eiendommen, så tar vi kontakt personlig."),
    ("Hvordan kontakter jeg Brusletto Eiendom?",
     f"Ring {TLF_VIS} eller send e-post til {EPOST}. Kontoret ligger i Helleveien 8, 0376 Oslo."),
]

e = html.escape


def hode(tittel, beskrivelse, sti, ekstra_ld):
    return f"""<!doctype html>
<html lang="no">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{e(tittel)}</title>
<meta name="description" content="{e(beskrivelse)}">
<meta name="theme-color" content="#F3F1EC">
<link rel="canonical" href="{URL}{sti}">
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
<meta property="og:type" content="website">
<meta property="og:locale" content="nb_NO">
<meta property="og:site_name" content="Brusletto Eiendom">
<meta property="og:title" content="{e(tittel)}">
<meta property="og:description" content="{e(beskrivelse)}">
<meta property="og:url" content="{URL}{sti}">
<meta property="og:image" content="{URL}/og.jpg">
<meta name="twitter:card" content="summary_large_image">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&family=Geist+Mono:wght@400;500&display=swap">
<link rel="stylesheet" href="/be.css">
<style>.top .lockup{{opacity:1}}</style>
<script type="application/ld+json">
{json.dumps(ekstra_ld, ensure_ascii=False)}
</script>
</head>
<body>
<svg width="0" height="0" style="position:absolute" aria-hidden="true"><symbol id="be" viewBox="0 0 12.75 16"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="butt"><path d="M6.75 0V16"/><path d="M12.25 1H4.75A3.25 3.25 0 0 0 4.75 7.5H11.25"/><path d="M12.75 15H4.75A3.75 3.75 0 0 1 4.75 7.5"/></g></symbol></svg>
<header class="top">
  <a class="hjem" href="/" aria-label="Brusletto Eiendom, til forsiden"><span class="lockup"><svg class="mk" viewBox="0 0 12.75 16"><use href="#be"/></svg><i></i><span class="wm"><span>BRUSLETTO</span><span>EIENDOM</span></span></span></a>
  <a href="/#salg">Til salgs</a>
</header>
"""


def fot():
    return """<footer class="colo mono">
  <span>Brusletto Eiendom AS · Org. 879 152 682 · Helleveien 8, 0376 Oslo</span>
  <nav class="fotnav" aria-label="Sider"><a href="/">Forsiden</a><a href="/prosjekter/">Prosjekter</a><a href="/om/">Om oss</a><a href="/plattform/">Plattform (innlogging)</a></nav>
  <span>© 1984–2026 · Oslo</span>
</footer>
</body>
</html>
"""


ORG_ID = URL + "/#organisasjon"
org_ref = {"@id": ORG_ID}


def bredsmule(*ledd):
    return {"@type": "BreadcrumbList", "itemListElement": [
        {"@type": "ListItem", "position": i + 1, "name": n, "item": URL + s} for i, (n, s) in enumerate(ledd)]}


def prosjekt_ld(p):
    aar, adr, sted, kommune, typ, antall, bilde, salg = p
    t = "SingleFamilyResidence" if typ in ("Enebolig", "Strandeiendom") else "House" if typ == "Fjellhytte" else "ApartmentComplex"
    d = {"@type": t, "name": f"{adr}, {sted}", "address": {"@type": "PostalAddress", "streetAddress": adr, "addressLocality": sted, "addressRegion": kommune, "addressCountry": "NO"},
         "description": f"{typ} på {sted}" + (f", {antall} boliger" if antall and antall > 1 else "") + f". Utviklet av Brusletto Eiendom, {aar}.",
         "url": salg or f"{URL}/prosjekter/#{slug(adr)}"}
    if antall and antall > 1 and t == "ApartmentComplex":
        d["numberOfAccommodationUnits"] = antall
    if bilde:
        d["image"] = f"{URL}/assets/ny/{bilde}.webp"
    return d


def slug(s):
    t = s.lower()
    for a, b in [("æ", "ae"), ("ø", "o"), ("å", "a"), ("–", "-"), (" ", "-"), (".", "")]:
        t = t.replace(a, b)
    return t


def lag_prosjekter():
    ld = {"@context": "https://schema.org", "@graph": [
        {"@type": "CollectionPage", "@id": URL + "/prosjekter/#side", "url": URL + "/prosjekter/", "name": "Prosjekter fra Brusletto Eiendom",
         "inLanguage": "nb", "isPartOf": {"@id": URL + "/#nettsted"}, "about": org_ref, "breadcrumb": bredsmule(("Forsiden", "/"), ("Prosjekter", "/prosjekter/"))},
        {"@type": "ItemList", "name": "Boligprosjekter utviklet av Brusletto Eiendom", "numberOfItems": len(PROSJEKTER),
         "itemListElement": [{"@type": "ListItem", "position": i + 1, "item": prosjekt_ld(p)} for i, p in enumerate(PROSJEKTER)]},
    ]}
    b = [hode("Prosjekter · Brusletto Eiendom · Boligutvikler på Vinderen, Slemdal og i Oslo vest",
              f"Alle {len(PROSJEKTER)} adressene Brusletto Eiendom har utviklet siden 1990: leiligheter og eneboliger på Vinderen, Slemdal, Holmenkollen, Ullern og Ris, på fjellet og ved sjøen.",
              "/prosjekter/", ld)]
    b.append(f"""<main class="side">
<header class="side-hode">
  <span class="eyebrow">Arkivet · 1990–2027</span>
  <h1>Prosjekter fra Brusletto Eiendom</h1>
  <p class="ingress">{len(PROSJEKTER)} adresser og minst {ANTALL} boliger, de fleste i Oslo vest. Alle bygget på samme måte: som om vi skulle bo der selv.</p>
  <nav class="hopp" aria-label="Områder">{''.join(f'<a href="#{g[0]}">{e(g[1])}</a>' for g in GRUPPER)}</nav>
</header>
""")
    for gid, navn, ingress, steder in GRUPPER:
        ps = [p for p in PROSJEKTER if p[2] in steder]
        b.append(f'<section class="gruppe" id="{gid}" aria-labelledby="{gid}-h">\n  <h2 id="{gid}-h">{e(navn)}</h2>\n  <p class="gruppe-ingress">{e(ingress)}</p>\n  <div class="kort-rad">\n')
        for p in ps:
            aar, adr, sted, kommune, typ, antall, bilde, salg = p
            fakta = f"{typ}" + (f" · {antall} boliger" if antall and antall > 1 else "") + f" · {sted}" + (f", {kommune}" if kommune != "Oslo" else ", Oslo")
            img = (f'<img src="/assets/ny/{bilde}.webp" alt="{e(adr)} på {e(sted)}, utviklet av Brusletto Eiendom" loading="lazy" decoding="async" width="720" height="540">'
                   if bilde else '<div class="uten-bilde mono">Ingen foto i arkivet</div>')
            status = f'<a class="go" href="{salg}" target="_blank" rel="noopener">Til salgs: se prosjektet</a>' if salg else '<span class="mono solgt">Solgt</span>'
            b.append(f'''    <article class="prosjekt" id="{slug(adr)}">
      {img}
      <p class="mono aar">{aar}</p>
      <h3>{e(adr)}</h3>
      <p class="fakta">{e(fakta)}</p>
      {status}
    </article>
''')
        b.append("  </div>\n</section>\n")
    b.append('<p class="side-slutt">Eier du en tomt i Vestre Aker? <a href="/#samtale">Ta kontakt</a>, vi kjøper direkte uten annonsering.</p>\n</main>\n')
    b.append(fot())
    (ROT / "prosjekter").mkdir(exist_ok=True)
    (ROT / "prosjekter" / "index.html").write_text("".join(b), encoding="utf-8")


def lag_om():
    ld = {"@context": "https://schema.org", "@graph": [
        {"@type": "AboutPage", "@id": URL + "/om/#side", "url": URL + "/om/", "name": "Om Brusletto Eiendom", "inLanguage": "nb",
         "isPartOf": {"@id": URL + "/#nettsted"}, "about": org_ref, "mainEntity": org_ref, "breadcrumb": bredsmule(("Forsiden", "/"), ("Om oss", "/om/"))},
        {"@type": "FAQPage", "@id": URL + "/om/#faq", "mainEntity": [
            {"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in FAQ]},
    ]}
    b = [hode("Om Brusletto Eiendom · Utbygger i Oslo vest siden 1984",
              "Brusletto Eiendom bygger hus og leiligheter vi vil bo i selv, på Vinderen, Slemdal og ellers i Oslo vest. Boligutvikling siden 1984. Les hvordan vi jobber, hvor vi bygger og hvordan du kontakter oss.",
              "/om/", ld)]
    b.append(f"""<main class="side">
<header class="side-hode">
  <span class="eyebrow">Om oss</span>
  <h1>Brusletto Eiendom bygger hus og leiligheter vi vil bo i selv.</h1>
  <p class="ingress">Da bygger vi det beste. Ingenting blir overlatt til tilfeldighetene.</p>
</header>

<section class="tekst" aria-labelledby="hvem">
  <h2 id="hvem">Hvem vi er</h2>
  <p>Brusletto Eiendom utvikler og bygger boliger, hovedsakelig i Oslo vest, og har drevet med boligutvikling siden 1984. Aksjeselskapet Brusletto Eiendom AS ble stiftet i 1997. Siden 1990 har vi stått bak {len(PROSJEKTER)} adresser med til sammen minst {ANTALL} boliger: terrasseleiligheter på Ullern og Holmen, leilighetsbygg på Vinderen, Slemdal, Ris og Voksenkollen, eneboliger, en strandeiendom i Sandefjord og hytter og leiligheter på fjellet.</p>
  <p>Vi tar få prosjekter om gangen. Det er ikke en begrensning, det er arbeidsmåten.</p>
</section>

<section class="tekst" aria-labelledby="hvordan">
  <h2 id="hvordan">Slik jobber vi</h2>
  <p>Først spør vi: Ville vi bodd her selv? Vi går tomten til alle tider av døgnet, ser hvor solen står, hvor vinden kommer fra og hva naboen ser. Huset plasseres etter det, ikke etter det som er enklest å bygge.</p>
  <p>Deretter stiller vi de samme spørsmålene som om vi skulle flytte inn: hvilken vei døren slår når du kommer hjem med handleposer, hvor du ser når du sitter i sofaen, hvor mye lys som faller på kjøkkenbenken en morgen i februar, og hvordan teglen ser ut om tretti år. Vi velger materialer og løsninger som om det var vårt eget hjem.</p>
</section>

<section class="tekst" aria-labelledby="hvor">
  <h2 id="hvor">Hvor vi bygger</h2>
  <p>Vi bygger hovedsakelig i Oslo vest og Vestre Aker: {", ".join(OMRADER[:-4])}. Vi har også bygget på Bekkestua i Bærum, på fjellet på Geilo og Kvitfjell og ved sjøen i Sandefjord. <a href="/prosjekter/">Se alle prosjektene</a>.</p>
</section>

<section class="tekst" aria-labelledby="tomt">
  <h2 id="tomt">Har du en tomt eller en eiendom?</h2>
  <p>Vi kjøper tomter og eiendommer i Vestre Aker direkte, uten annonsering. Ring {TLF_VIS} eller skriv til <a href="mailto:{EPOST}">{EPOST}</a> med en kort beskrivelse, så tar vi kontakt personlig.</p>
</section>

<section class="tekst faq" aria-labelledby="sporsmal-og-svar">
  <h2 id="sporsmal-og-svar">Spørsmål og svar</h2>
""")
    for q, a in FAQ:
        b.append(f"  <details><summary>{e(q)}</summary><p>{e(a)}</p></details>\n")
    b.append(f"""</section>

<section class="tekst" aria-labelledby="kontakt">
  <h2 id="kontakt">Kontakt</h2>
  <p>Brusletto Eiendom AS · Helleveien 8, 0376 Oslo · Telefon <a href="tel:{TLF}">{TLF_VIS}</a> · E-post <a href="mailto:{EPOST}">{EPOST}</a> · Org.nr. 879 152 682</p>
</section>
</main>
""")
    b.append(fot())
    (ROT / "om").mkdir(exist_ok=True)
    (ROT / "om" / "index.html").write_text("".join(b), encoding="utf-8")


def lag_llms():
    lin = [
        "# Brusletto Eiendom",
        "",
        "> Brusletto Eiendom AS er en boligutvikler og utbygger i Oslo (boligutvikling siden 1984, aksjeselskap stiftet 1997). Selskapet bygger hus og leiligheter de selv vil bo i, hovedsakelig i Oslo vest (Vinderen, Slemdal, Holmenkollen, Ullern). Motto: «Vi bygger hus og leiligheter vi vil bo i selv. Da bygger vi det beste. Ingenting blir overlatt til tilfeldighetene.»",
        "",
        "## Fakta",
        "- Navn: Brusletto Eiendom AS (org.nr. 879 152 682)",
        "- Boligutvikling siden 1984. Brusletto Eiendom AS stiftet 26.05.1997 (Enhetsregisteret, næringskode 68.120 Utvikling og salg av byggeprosjekter). Første prosjekt i arkivet: 1990",
        f"- Prosjekter: {len(PROSJEKTER)} adresser, minst {ANTALL} boliger",
        "- Områder: " + ", ".join(OMRADER) + " (Oslo vest, Bærum, fjellet og sjøen)",
        f"- Kontakt: {TLF_VIS}, {EPOST}, Helleveien 8, 0376 Oslo",
        "- Kjøper tomter og eiendommer i Vestre Aker direkte, uten annonsering",
        "",
        "## Til salgs nå",
    ]
    lin += [f"- [{p[1]}, {p[2]}]({p[7]}): {p[4].lower()}, {p[0]}" for p in PROSJEKTER if p[7]]
    lin += ["", "## Prosjekter (år, adresse, sted, type)"]
    lin += [f"- {p[0]}: {p[1]}, {p[2]} – {p[4].lower()}" + (f", {p[5]} boliger" if p[5] and p[5] > 1 else "") for p in PROSJEKTER]
    lin += ["", "## Sider",
            f"- [Forsiden]({URL}/): hvordan vi bygger, i kapitler",
            f"- [Prosjekter]({URL}/prosjekter/): alle adressene gruppert etter område",
            f"- [Om oss]({URL}/om/): hvem vi er, slik jobber vi, spørsmål og svar", ""]
    (ROT / "llms.txt").write_text("\n".join(lin), encoding="utf-8")


def lag_sitemap():
    sider = [("/", "1.0"), ("/prosjekter/", "0.8"), ("/om/", "0.8"), ("/varden8/", "0.9"), ("/heyerdahlsvei8/", "0.9")]
    x = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    x += [f"  <url><loc>{URL}{s}</loc><lastmod>{I_DAG}</lastmod><priority>{p}</priority></url>" for s, p in sider]
    x.append("</urlset>")
    (ROT / "sitemap.xml").write_text("\n".join(x) + "\n", encoding="utf-8")


if __name__ == "__main__":
    lag_prosjekter(); lag_om(); lag_llms(); lag_sitemap()
    print("Skrev prosjekter/, om/, llms.txt, sitemap.xml ·", len(PROSJEKTER), "prosjekter,", ANTALL, "boliger")
