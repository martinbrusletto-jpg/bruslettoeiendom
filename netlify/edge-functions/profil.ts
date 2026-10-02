// Innlogging for /profil/ (merket, farger, brevark, visittkort, skilt og nedlasting).
// Brukernavn: PROFIL_BRUKER (standard job@reserva.as). Passord: Netlify-miljøvariabelen PROFIL_PASSORD,
// aldri i repoet (det er offentlig). Innlogget = signert informasjonskapsel i 30 dager.
// Bytter man passord, blir alle gamle innlogginger ugyldige.
import type { Config, Context } from "@netlify/edge-functions";

const KAKE = "be_profil";
const DAGER = 30;
const enc = new TextEncoder();

async function hmac(nokkel: string, data: string): Promise<string> {
  const key = await crypto.subtle.importKey("raw", enc.encode("be-profil|" + nokkel), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(data));
  return btoa(String.fromCharCode(...new Uint8Array(sig))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
// Sammenligning i konstant tid.
function lik(a: string, b: string): boolean {
  const x = enc.encode(a), y = enc.encode(b);
  let d = x.length ^ y.length;
  for (let i = 0; i < Math.max(x.length, y.length); i++) d |= (x[i] ?? 0) ^ (y[i] ?? 0);
  return d === 0;
}
function kake(req: Request, navn: string): string | null {
  const m = (req.headers.get("cookie") || "").match(new RegExp("(?:^|;\\s*)" + navn + "=([^;]+)"));
  return m ? decodeURIComponent(m[1]) : null;
}

function side(feil: string, status = 401): Response {
  const html = `<!doctype html>
<html lang="no"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Logg inn · Brusletto Eiendom</title><meta name="robots" content="noindex">
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500&family=Geist+Mono&display=swap">
<style>
:root{--bg:#F3F1EC;--ink:#171C20;--ink-2:#5E6266;--ink-3:#9B9D9F;--line:#DDD9D1;--cu:#B0703F;--cu-ink:#8C5329;--slate:#1D2327;--paper:#FBFAF7;color-scheme:light}
*{box-sizing:border-box}body{margin:0;min-height:100svh;display:grid;place-items:center;background:var(--bg);color:var(--ink);font-family:Geist,"Helvetica Neue",Arial,sans-serif;padding:32px 16px;-webkit-font-smoothing:antialiased}
form{width:min(380px,100%);display:flex;flex-direction:column;gap:20px}
svg{height:48px;width:auto;align-self:flex-start}
.e{font-family:"Geist Mono",monospace;font-size:10.5px;letter-spacing:.08em;text-transform:uppercase;color:var(--cu-ink)}
h1{margin:0;font-weight:500;font-size:30px;letter-spacing:-.04em;line-height:1.1}
label{display:flex;flex-direction:column;gap:8px}
label span{font-family:"Geist Mono",monospace;font-size:10.5px;letter-spacing:.08em;text-transform:uppercase;color:var(--ink-3)}
input{font:inherit;font-size:16px;color:var(--ink);background:transparent;border:0;border-bottom:1px solid var(--line);padding:8px 0;border-radius:0}
input:focus{outline:none;border-bottom-color:var(--cu)}
button{align-self:flex-start;font-family:"Geist Mono",monospace;font-size:11px;letter-spacing:.08em;text-transform:uppercase;background:var(--slate);color:var(--paper);border:0;border-radius:999px;padding:15px 24px;cursor:pointer}
.feil{color:#9A3B2E;font-size:14px;margin:0}
a{color:var(--ink-2);font-size:13px}
</style></head><body>
<form method="POST" action="/profil/">
<svg viewBox="0 0 12.75 16" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="2"><path d="M6.75 0V16"/><path d="M12.25 1H4.75A3.25 3.25 0 0 0 4.75 7.5H11.25"/><path d="M12.75 15H4.75A3.75 3.75 0 0 1 4.75 7.5"/></g></svg>
<span class="e">Profil</span>
<h1>Logg inn for å se merket og profilen.</h1>
${feil ? `<p class="feil" role="alert">${feil}</p>` : ""}
<label for="b"><span>E-post</span><input id="b" name="bruker" type="email" autocomplete="username" required></label>
<label for="p"><span>Passord</span><input id="p" name="passord" type="password" autocomplete="current-password" required></label>
<button type="submit">Logg inn</button>
<a href="/">Til forsiden</a>
</form></body></html>`;
  return new Response(html, { status, headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store", "x-robots-tag": "noindex" } });
}

export default async (req: Request, context: Context) => {
  const bruker = (Netlify.env.get("PROFIL_BRUKER") || "job@reserva.as").trim().toLowerCase();
  const passord = Netlify.env.get("PROFIL_PASSORD") || "";
  const url = new URL(req.url);
  if (!bruker || !passord) return side("Innloggingen er ikke satt opp ennå.", 503);

  if (url.pathname === "/profil/logg-ut") {
    return new Response(null, { status: 303, headers: { location: "/", "set-cookie": `${KAKE}=; Path=/profil; Max-Age=0; HttpOnly; Secure; SameSite=Lax` } });
  }

  if (req.method === "POST") {
    const f = await req.formData();
    const b = String(f.get("bruker") || "").trim().toLowerCase(), p = String(f.get("passord") || "");
    if (lik(b, bruker) && lik(p, passord)) {
      const utloper = String(Date.now() + DAGER * 864e5);
      const verdi = utloper + "." + await hmac(passord, utloper);
      return new Response(null, { status: 303, headers: { location: "/profil/", "cache-control": "no-store",
        "set-cookie": `${KAKE}=${verdi}; Path=/profil; Max-Age=${DAGER * 86400}; HttpOnly; Secure; SameSite=Lax` } });
    }
    await new Promise(r => setTimeout(r, 600));            // brems gjetting
    return side("Feil e-post eller passord.");
  }

  const k = kake(req, KAKE);
  if (k) {
    const [utloper, sig] = k.split(".");
    if (sig && +utloper > Date.now() && lik(sig, await hmac(passord, utloper))) {
      const res = await context.next();
      const h = new Headers(res.headers);
      h.set("cache-control", "private, no-store");
      h.set("x-robots-tag", "noindex");
      return new Response(res.body, { status: res.status, headers: h });
    }
  }
  return side("");
};

export const config: Config = { path: ["/profil", "/profil/*"] };
