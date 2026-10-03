// Port for de innloggede sidene: /plattform/ og /profil/.
// Uten gyldig økt sendes man til /logg-inn/. Selve innloggingen skjer i netlify/functions/api.mts.
import type { Config, Context } from "@netlify/edge-functions";
import { lesOkt, slettKake } from "../lib/okt.mts";

export default async (req: Request, context: Context) => {
  const url = new URL(req.url);
  if (url.pathname === "/profil/logg-ut" || url.pathname === "/plattform/logg-ut") {
    return new Response(null, { status: 303, headers: { location: "/logg-inn/", "set-cookie": slettKake() } });
  }
  const epost = await lesOkt(req);
  if (!epost) {
    const til = encodeURIComponent(url.pathname + url.search);
    return new Response(null, { status: 302, headers: { location: `/logg-inn/?til=${til}`, "cache-control": "no-store" } });
  }
  const res = await context.next();
  const h = new Headers(res.headers);
  h.set("cache-control", "private, no-store");
  h.set("x-robots-tag", "noindex");
  return new Response(res.body, { status: res.status, headers: h });
};

export const config: Config = { path: ["/profil", "/profil/*", "/plattform", "/plattform/*"] };
