// Proxy for Heyerdahls-siden med canonical, Open Graph og JSON-LD på domenet.
import type { Config } from "@netlify/edge-functions";

const UPSTREAM = "https://heyerdahls-vei-8b.netlify.app";
const SITE = "https://bruslettoeiendom.no";
const CANON = `${SITE}/heyerdahlsvei8/`;
const OG_IMG = `${SITE}/assets/ny/inngang.webp`;

const HEAD = `
<link rel="canonical" href="${CANON}">
<meta property="og:type" content="website">
<meta property="og:locale" content="nb_NO">
<meta property="og:site_name" content="Brusletto Eiendom">
<meta property="og:title" content="Heyerdahls vei 8B · Enebolig til salgs på Slemdal">
<meta property="og:description" content="Arkitekttegnet enebolig over to etasjer i teglstein fra Randers Tegl. Ca. 250 kvm, solrike terrasser, 2 parkeringsplasser. Heyerdahls vei 8B, Slemdal, Oslo. Utviklet av Brusletto Eiendom.">
<meta property="og:url" content="${CANON}">
<meta property="og:image" content="${OG_IMG}">
<meta name="twitter:card" content="summary_large_image">
<script type="application/ld+json">
{"@context":"https://schema.org","@graph":[{"@type":"WebPage","@id":"${CANON}#side","url":"${CANON}","name":"Heyerdahls vei 8B · Enebolig på Slemdal","inLanguage":"nb","isPartOf":{"@id":"${SITE}/#nettsted"}},{"@type":"SingleFamilyResidence","name":"Heyerdahls vei 8B","url":"${CANON}","image":"${OG_IMG}","address":{"@type":"PostalAddress","streetAddress":"Heyerdahls vei 8B","addressLocality":"Slemdal","postalCode":"0777","addressRegion":"Oslo","addressCountry":"NO"},"description":"Arkitekttegnet enebolig over to etasjer i teglstein. Utviklet av Brusletto Eiendom.","offers":{"@type":"Offer","availability":"https://schema.org/InStock"}},{"@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Forsiden","item":"${SITE}/"},{"@type":"ListItem","position":2,"name":"Prosjekter","item":"${SITE}/prosjekter/"},{"@type":"ListItem","position":3,"name":"Heyerdahls vei 8B","item":"${CANON}"}]}]}
</script>
`;

const FOOT = `
<nav class="be-fotnav" aria-label="Brusletto Eiendom" style="display:flex;flex-wrap:wrap;gap:12px 20px;justify-content:center;padding:20px 16px 28px;font-family:system-ui,sans-serif;font-size:12px;letter-spacing:.06em;text-transform:uppercase;border-top:1px solid #e8e4dc;background:#f3f1ec">
  <a href="${SITE}/" style="color:#171c20;text-decoration:none">Forsiden</a>
  <a href="${SITE}/prosjekter/" style="color:#171c20;text-decoration:none">Prosjekter</a>
  <a href="${SITE}/om/" style="color:#171c20;text-decoration:none">Om oss</a>
</nav>
`;

export default async (req: Request) => {
  const url = new URL(req.url);
  let path = url.pathname.replace(/^\/heyerdahlsvei8\/?/, "/");
  if (!path.startsWith("/")) path = "/" + path;
  const up = new URL(path, UPSTREAM);
  up.search = url.search;

  const res = await fetch(up.toString(), {
    headers: { accept: req.headers.get("accept") ?? "*/*" },
  });

  const ct = res.headers.get("content-type") ?? "";
  if (!ct.includes("text/html")) {
    return res;
  }

  let html = await res.text();
  if (!html.includes('rel="canonical"')) {
    html = html.replace("</head>", `${HEAD}\n</head>`);
  }
  if (!html.includes('class="be-fotnav"')) {
    html = html.replace("</body>", `${FOOT}\n</body>`);
  }

  const headers = new Headers(res.headers);
  headers.delete("content-length");
  return new Response(html, { status: res.status, headers });
};

export const config: Config = { path: "/heyerdahlsvei8/*" };
