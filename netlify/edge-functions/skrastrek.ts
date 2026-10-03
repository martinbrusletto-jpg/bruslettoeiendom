// Prosjektsidene bruker relative lenker, så adressen må slutte med skråstrek.
// (En vanlig redirect-regel gir løkke, fordi Netlify behandler /x og /x/ likt.)
import type { Config } from "@netlify/edge-functions";

export default (req: Request) => {
  const url = new URL(req.url);
  if (!url.pathname.endsWith("/")) {
    url.pathname += "/";
    return Response.redirect(url.toString(), 301);
  }
};

export const config: Config = { path: ["/heyerdahlsvei8", "/varden8"] };
