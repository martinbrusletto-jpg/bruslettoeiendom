"""Merket til Brusletto Eiendom: geometri, SVG-filer og materialutførelser.

Kjør fra repo-roten:  python verktoy/lag_merke.py
Skriver: profil/merke/*.svg og materialseksjonen i profil/index.html (mellom markørene).

Merket finnes i to utgaver:
- Detaljert (fra 32 px og opp, trykk, skilt): B og E møter bæreveggen med en skyggefuge på 0,25 modul,
  og midtstreken går gjennom veggen som et dekke.
- Forenklet (under 32 px, favicon): uten fuger, så det ikke blir grøtete.
"""
import pathlib, re

ROT = pathlib.Path(__file__).resolve().parent.parent
FUGE = .25

FORENKLET = ["M6.75 0V16", "M12.25 1H4.75A3.25 3.25 0 0 0 4.75 7.5H11.25", "M12.75 15H4.75A3.75 3.75 0 0 1 4.75 7.5"]
# Bæreveggen stopper mot dekket; buene og armene stopper en fuge fra veggen.
DETALJERT = [
    "M6.75 0V6.25", "M6.75 8.75V16",                       # bærevegg over og under dekket
    "M4.75 7.5H11.25",                                     # dekket (midjen) gjennom veggen
    "M5.5 1H4.75A3.25 3.25 0 0 0 4.75 7.5",                # øvre bue
    "M5.5 15H4.75A3.75 3.75 0 0 1 4.75 7.5",               # nedre bue
    "M8 1H12.25", "M8 15H12.75",                           # E-armene
]


def paths(ds, stroke="currentColor", extra=""):
    return f'<g fill="none" stroke="{stroke}" stroke-width="2" stroke-linecap="butt"{extra}>' + "".join(f'<path d="{d}"/>' for d in ds) + "</g>"


def svg_fil(ds, farge):
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12.75 16" width="255" height="320">{paths(ds, farge)}</svg>\n'


# ---------- materialutførelser (SVG med teksturer, 480 x 360) ----------
W, H = 480, 360


def merke(ds, hoyde, cx=W / 2, cy=H / 2, dx=0, dy=0, stroke="currentColor", extra=""):
    s = hoyde / 16
    tx, ty = cx - 12.75 * s / 2 + dx, cy - hoyde / 2 + dy
    return f'<g transform="translate({tx:.2f} {ty:.2f}) scale({s:.4f})">{paths(ds, stroke, extra)}</g>'


def relieff(ds, hoyde, flate, lys, skygge, opp=True, d=1.3, blur="sf-myk", **kw):
    """Opphøyd (preg) eller nedsenket (gravering): lys og skygge forskjøvet hver sin vei."""
    a, b = (-d, d) if opp else (d, -d)
    return (f'<g filter="url(#{blur})">' + merke(ds, hoyde, dx=a, dy=a, stroke=lys, **kw) + merke(ds, hoyde, dx=b, dy=b, stroke=skygge, **kw) + "</g>"
            + merke(ds, hoyde, stroke=flate, **kw))


DEFS = f"""<defs>
  <filter id="sf-myk" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation=".7"/></filter>
  <filter id="sf-korn" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="3" seed="4"/><feColorMatrix type="saturate" values="0"/></filter>
  <filter id="sf-skifer" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".004 .06" numOctaves="4" seed="11"/><feColorMatrix type="saturate" values="0"/></filter>
  <filter id="sf-eik" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".0035 .11" numOctaves="4" seed="7"/><feColorMatrix type="saturate" values="0"/></filter>
  <filter id="sf-eik2" x="0" y="0" width="100%" height="100%"><feTurbulence type="turbulence" baseFrequency=".002 .32" numOctaves="2" seed="2"/><feColorMatrix type="saturate" values="0"/></filter>
  <filter id="sf-borstet" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".002 .9" numOctaves="2" seed="5"/><feColorMatrix type="saturate" values="0"/></filter>
  <filter id="sf-patina" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".05" numOctaves="5" seed="9"/>
    <feColorMatrix type="matrix" values="0 0 0 0 .38  0 0 0 0 .56  0 0 0 0 .49  3 0 0 0 -1.62"/></filter>
  <filter id="sf-skilt" x="-20%" y="-20%" width="140%" height="160%"><feDropShadow dx="3" dy="7" stdDeviation="3.5" flood-color="#1a0d06" flood-opacity=".55"/></filter>
  <linearGradient id="sf-kobber" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="12.75" y2="16"><stop offset="0" stop-color="#D08A55"/><stop offset=".45" stop-color="#B0703F"/><stop offset="1" stop-color="#7E4320"/></linearGradient>
  <linearGradient id="sf-kobberflate" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#C98250"/><stop offset=".5" stop-color="#B0703F"/><stop offset="1" stop-color="#8A4C27"/></linearGradient>
  <linearGradient id="sf-kobberkant" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="16"><stop offset="0" stop-color="#F0B88A"/><stop offset="1" stop-color="#8C4F28"/></linearGradient>
  <linearGradient id="sf-messing" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#E2C27A"/><stop offset=".5" stop-color="#C29A45"/><stop offset="1" stop-color="#8A6A28"/></linearGradient>
  <pattern id="sf-tegl" width="110" height="34" patternUnits="userSpaceOnUse">
    <rect width="110" height="34" fill="#B4A898"/>
    <rect x="0" y="0" width="52" height="14" fill="#9A4E33"/><rect x="55" y="0" width="52" height="14" fill="#A85A3C"/>
    <rect x="-27.5" y="17" width="52" height="14" fill="#8E472E"/><rect x="27.5" y="17" width="52" height="14" fill="#9F5236"/><rect x="82.5" y="17" width="52" height="14" fill="#93492F"/>
  </pattern>
  <filter id="sf-tone" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".06" numOctaves="2" seed="21"/><feColorMatrix type="saturate" values="0"/></filter>
</defs>"""


def tekstur(fyll, filt=None, op=.3, blend="multiply"):
    base = f'<rect width="{W}" height="{H}" fill="{fyll}"/>'
    return base + (f'<rect width="{W}" height="{H}" filter="url(#{filt})" opacity="{op}" style="mix-blend-mode:{blend}"/>' if filt else "")


def flis(innhold):
    return f'<svg viewBox="0 0 {W} {H}" role="img" xmlns="http://www.w3.org/2000/svg">{innhold}</svg>'


D = DETALJERT
MATERIALER = [
    ("Blindpreg", "350 g papir · visittkort og brevark",
     tekstur("#F4F0E8", "sf-korn", .07) + relieff(D, 150, "#F4F0E8", "rgba(255,255,255,.95)", "rgba(60,45,30,.3)", opp=True, d=1.3)),
    ("Gravert i skifer", "Fasadeplate og byggeplasskilt",
     tekstur("#2C3439", "sf-skifer", .55, "overlay") + f'<rect width="{W}" height="{H}" filter="url(#sf-korn)" opacity=".12" style="mix-blend-mode:multiply"/>'
     + relieff(D, 160, "#8F989D", "rgba(255,255,255,.22)", "rgba(0,0,0,.75)", opp=False, d=1.1)),
    ("Utskåret i eik", "Inngangsparti og interiør",
     tekstur("#B98A5C", "sf-eik", .45) + f'<rect width="{W}" height="{H}" filter="url(#sf-eik2)" opacity=".12" style="mix-blend-mode:multiply"/>'
     + relieff(D, 160, "#7A4E2C", "rgba(255,236,210,.45)", "rgba(40,20,5,.55)", opp=False, d=1.4)),
    ("Patinert kobber", "Skilt ved inngangen",
     f'<rect width="{W}" height="{H}" fill="url(#sf-kobberflate)"/><rect width="{W}" height="{H}" filter="url(#sf-patina)" opacity=".42"/>'
     + f'<rect width="{W}" height="{H}" filter="url(#sf-korn)" opacity=".1" style="mix-blend-mode:multiply"/>'
     + relieff(D, 160, "#6A3618", "rgba(255,210,170,.35)", "rgba(30,10,0,.6)", opp=False, d=1.2)),
    ("Kobber på tegl", "Fasade · bokstaver montert med avstand",
     f'<rect width="{W}" height="{H}" fill="url(#sf-tegl)"/><rect width="{W}" height="{H}" filter="url(#sf-tone)" opacity=".28" style="mix-blend-mode:multiply"/><rect width="{W}" height="{H}" filter="url(#sf-korn)" opacity=".2" style="mix-blend-mode:multiply"/>'
     + f'<g filter="url(#sf-skilt)">{merke(D, 170, stroke="url(#sf-kobber)")}</g>' + merke(D, 170, dx=-.8, dy=-.8, stroke="url(#sf-kobberkant)", extra=' opacity=".35"')),
    ("Gravert messing", "Nøkkelbrikke ved overlevering",
     tekstur("#1D2327", "sf-korn", .12, "overlay")
     + f'<g filter="url(#sf-skilt)"><rect x="170" y="44" width="140" height="272" rx="22" fill="url(#sf-messing)"/></g>'
     + '<rect x="170" y="44" width="140" height="272" rx="22" filter="url(#sf-borstet)" opacity=".22" style="mix-blend-mode:multiply"/>'
     + '<circle cx="240" cy="78" r="11" fill="#1D2327"/><circle cx="240" cy="78" r="11" fill="none" stroke="rgba(255,240,200,.5)" stroke-width="1.5"/>'
     + relieff(D, 120, "#6E521C", "rgba(255,245,215,.5)", "rgba(40,25,0,.55)", opp=False, d=.9, cy=H / 2 + 22)),
]


def materialseksjon():
    # Filtrene og mønstrene ligger i første flis; id-er i innebygd SVG gjelder hele dokumentet.
    fliser = "".join(
        f'<figure class="mat"><div class="mat-flis">{flis((DEFS if i == 0 else "") + innhold)}</div>'
        f'<figcaption><b>{navn}</b><span class="mono">{bruk}</span></figcaption></figure>'
        for i, (navn, bruk, innhold) in enumerate(MATERIALER))
    return f"""<!--materialer-start-->
  <div class="mat-hode">
    <span class="eyebrow">Materialer</span>
    <h2>Merket er tegningen. Materialet er huset.</h2>
    <p>Formen er alltid den samme. Der merket brukes, lages det i ekte materialer: preget i papir, gravert i skifer og messing, skåret i eik, montert i kobber på tegl. Hvert prosjekt kan få merket i sine egne materialer.</p>
  </div>
  <div class="mat-rad">{fliser}</div>
<!--materialer-slutt-->"""


MAT_CSS = """
/* ---------- merket i materialer ---------- */
.mat-hode{display:flex;flex-direction:column;gap:14px;max-width:640px;border-top:1px solid var(--line);padding-top:32px}
.mat-hode h2{font-size:clamp(24px,2.8vw,40px)}
.mat-hode p{color:var(--ink-2)}
.mat-rad{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:28px 18px}
.mat{margin:0;display:flex;flex-direction:column;gap:10px;min-width:0}
.mat-flis svg{display:block;width:100%;height:auto;aspect-ratio:4/3}
.mat figcaption{display:flex;flex-direction:column;gap:2px}
.mat figcaption b{font-weight:500;font-size:15px;letter-spacing:-.01em}
.mat figcaption span{color:var(--ink-3)}
@media (max-width:820px){.mat-rad{grid-template-columns:1fr 1fr}}
@media (max-width:480px){.mat-rad{grid-template-columns:1fr}}
"""


if __name__ == "__main__":
    ut = ROT / "profil" / "merke"
    ut.mkdir(parents=True, exist_ok=True)
    for navn, farge in [("skifer", "#1D2327"), ("kalk", "#FBFAF7"), ("kobber", "#B0703F")]:
        (ut / f"be-merke-{navn}.svg").write_text(svg_fil(DETALJERT, farge), encoding="utf-8")
        (ut / f"be-merke-{navn}-forenklet.svg").write_text(svg_fil(FORENKLET, farge), encoding="utf-8")
    p = ROT / "profil" / "index.html"
    s = p.read_text(encoding="utf-8")
    seksjon = materialseksjon()
    if "<!--materialer-start-->" in s:
        s = re.sub(r"<!--materialer-start-->.*?<!--materialer-slutt-->", lambda m: seksjon, s, flags=re.S)
    else:
        s = s.replace('  <div class="m-var">', seksjon + '\n  <div class="m-var">', 1)
    p.write_text(s, encoding="utf-8")
    css = (ROT / "be.css").read_text(encoding="utf-8")
    if "merket i materialer" not in css:
        (ROT / "be.css").write_text(css + MAT_CSS, encoding="utf-8")
    # Forhåndsvisning (frittstående side) for gjennomgang
    (ROT / "verktoy" / "_materialer-forhandsvisning.html").write_text(
        f'<!doctype html><meta charset="utf-8"><title>Merket i materialer</title><link rel="stylesheet" href="../be.css">'
        f'<style>body{{padding:40px}}</style><div class="merket" style="padding:0">{seksjon}</div>', encoding="utf-8")
    print("Skrev SVG-filer, materialseksjon i profil/index.html og CSS")
