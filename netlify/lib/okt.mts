// Felles for innlogging: signert økt-informasjonskapsel og passord-hashing.
// Nøkkelen til signaturen avledes fra PROFIL_PASSORD (Netlify-variabel), så den ligger aldri i repoet.
// Bytter man PROFIL_PASSORD, blir alle innlogginger ugyldige.

export const KAKE = "be_okt";
export const DAGER = 30;
const enc = new TextEncoder();

const b64url = (buf: ArrayBuffer) =>
  btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

export function hemmelighet(): string {
  // @ts-ignore Netlify-globalen finnes i både funksjoner og edge-funksjoner
  const pw = (globalThis.Netlify?.env?.get?.("PROFIL_PASSORD") ?? (globalThis as any).process?.env?.PROFIL_PASSORD ?? "") as string;
  return pw;
}

async function hmac(data: string): Promise<string> {
  const key = await crypto.subtle.importKey("raw", enc.encode("be-plattform|" + hemmelighet()), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return b64url(await crypto.subtle.sign("HMAC", key, enc.encode(data)));
}

export function lik(a: string, b: string): boolean {
  const x = enc.encode(a), y = enc.encode(b);
  let d = x.length ^ y.length;
  for (let i = 0; i < Math.max(x.length, y.length); i++) d |= (x[i] ?? 0) ^ (y[i] ?? 0);
  return d === 0;
}

export async function lagOkt(epost: string): Promise<string> {
  const utloper = String(Date.now() + DAGER * 864e5);
  const data = encodeURIComponent(epost) + "." + utloper;
  return data + "." + (await hmac(data));
}

export async function lesOkt(req: Request): Promise<string | null> {
  if (!hemmelighet()) return null;
  const m = (req.headers.get("cookie") || "").match(new RegExp("(?:^|;\\s*)" + KAKE + "=([^;]+)"));
  if (!m) return null;
  // E-postadressen kan inneholde punktum, så de to siste delene leses bakfra.
  const deler = m[1].split("."), sig = deler.pop(), utloper = deler.pop(), e = deler.join(".");
  if (!e || !utloper || !sig || +utloper < Date.now()) return null;
  if (!lik(sig, await hmac(e + "." + utloper))) return null;
  return decodeURIComponent(e);
}

export const settKake = (verdi: string) =>
  `${KAKE}=${verdi}; Path=/; Max-Age=${DAGER * 86400}; HttpOnly; Secure; SameSite=Lax`;
export const slettKake = () => `${KAKE}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax`;

// PBKDF2 (210 000 runder, SHA-256) for brukernes passord.
export async function hashPassord(passord: string, salt?: string): Promise<{ salt: string; hash: string }> {
  const s = salt ?? b64url(crypto.getRandomValues(new Uint8Array(16)).buffer);
  const key = await crypto.subtle.importKey("raw", enc.encode(passord), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: enc.encode(s), iterations: 210000 }, key, 256);
  return { salt: s, hash: b64url(bits) };
}
