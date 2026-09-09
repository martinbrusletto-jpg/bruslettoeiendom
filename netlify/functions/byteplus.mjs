// BytePlus ModelArk-proxy for bruslettoeiendom.
//
// API-nøkkelen ligger kun i miljøvariabelen BYTEPLUS_API_KEY på Netlify og
// forlater aldri serveren. Klienten snakker med /api/byteplus, aldri direkte
// med BytePlus.
//
//   GET  /api/byteplus          Status: er nøkkelen på plass og modellen åpnet?
//   POST /api/byteplus          Chat: { prompt } eller { messages: [...] }

const DEFAULTS = {
  baseUrl: "https://ark.ap-southeast.bytepluses.com/api/v3",
  model: "seed-2-0-pro-260328",
  timeoutMs: 25000,
  maxTokens: 1024,
  maxMessages: 20,
  maxChars: 12000,
  rateLimit: 20,
  rateWindowMs: 5 * 60 * 1000,
};

function settings() {
  const num = (key, fallback) => {
    const value = Number(Netlify.env.get(key));
    return Number.isFinite(value) && value > 0 ? value : fallback;
  };

  return {
    apiKey: Netlify.env.get("BYTEPLUS_API_KEY"),
    baseUrl: (Netlify.env.get("BYTEPLUS_BASE_URL") || DEFAULTS.baseUrl).replace(/\/+$/, ""),
    model: Netlify.env.get("BYTEPLUS_MODEL") || DEFAULTS.model,
    clientToken: Netlify.env.get("BYTEPLUS_CLIENT_TOKEN") || "",
    allowedOrigins: (Netlify.env.get("BYTEPLUS_ALLOWED_ORIGINS") || "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean),
    timeoutMs: num("BYTEPLUS_TIMEOUT_MS", DEFAULTS.timeoutMs),
    maxTokens: num("BYTEPLUS_MAX_TOKENS", DEFAULTS.maxTokens),
    rateLimit: num("BYTEPLUS_RATE_LIMIT", DEFAULTS.rateLimit),
  };
}

const PUBLIC_ERRORS = {
  ModelNotOpen: "Modellen er ikke aktivert på BytePlus-kontoen. Åpne den under Model Service i Ark-konsollen.",
  "InvalidEndpointOrModel.NotFound": "Ukjent modell eller endepunkt.",
  AuthenticationError: "BytePlus avviste API-nøkkelen.",
  QuotaExceeded: "Kvoten på BytePlus-kontoen er brukt opp.",
  RateLimitExceeded: "BytePlus begrenser antall kall akkurat nå.",
};

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

// Beste forsøk per instans. Ikke en global grense, men stopper den enkleste
// misbruken av et åpent endepunkt.
function rateLimited(key, limit) {
  const now = Date.now();
  const store = (globalThis.__byteplusHits ||= new Map());

  for (const [id, hits] of store) {
    const fresh = hits.filter((time) => now - time < DEFAULTS.rateWindowMs);
    if (fresh.length) store.set(id, fresh);
    else store.delete(id);
  }

  const hits = store.get(key) || [];
  if (hits.length >= limit) return true;
  store.set(key, [...hits, now]);
  return false;
}

function originAllowed(req, config) {
  const origin = req.headers.get("origin");
  if (!origin) return true; // server-til-server og curl

  let host;
  try {
    host = new URL(origin).host;
  } catch {
    return false;
  }

  if (host === new URL(req.url).host) return true;
  if (host.endsWith(".netlify.app")) return true;
  return config.allowedOrigins.includes(origin) || config.allowedOrigins.includes(host);
}

function normalizeMessages(payload, config) {
  const messages = Array.isArray(payload.messages)
    ? payload.messages
    : typeof payload.prompt === "string"
      ? [{ role: "user", content: payload.prompt }]
      : null;

  if (!messages || !messages.length) {
    return { error: "Send enten { prompt } eller { messages: [{ role, content }] }." };
  }
  if (messages.length > DEFAULTS.maxMessages) {
    return { error: `Maks ${DEFAULTS.maxMessages} meldinger per kall.` };
  }

  let chars = 0;
  for (const message of messages) {
    if (!message || typeof message.content !== "string" || !["system", "user", "assistant"].includes(message.role)) {
      return { error: "Hver melding må ha role (system, user, assistant) og content som tekst." };
    }
    chars += message.content.length;
  }
  if (chars > DEFAULTS.maxChars) {
    return { error: `Samlet tekst er for lang (maks ${DEFAULTS.maxChars} tegn).` };
  }

  const system = typeof payload.system === "string" && payload.system.trim()
    ? [{ role: "system", content: payload.system.trim() }]
    : [];

  return { messages: [...system, ...messages], model: typeof payload.model === "string" && payload.model ? payload.model : config.model };
}

async function callArk(path, config, init = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), config.timeoutMs);
  try {
    return await fetch(`${config.baseUrl}${path}`, {
      ...init,
      signal: controller.signal,
      headers: {
        authorization: `Bearer ${config.apiKey}`,
        "content-type": "application/json",
        ...(init.headers || {}),
      },
    });
  } finally {
    clearTimeout(timer);
  }
}

async function status(config) {
  const response = await callArk("/models", config);
  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    return json(
      {
        connected: false,
        reason: body?.error?.message || `BytePlus svarte ${response.status}`,
        model: config.model,
      },
      502,
    );
  }

  const models = Array.isArray(body.data) ? body.data : [];
  const configured = models.find((model) => model.id === config.model);

  return json({
    connected: true,
    region: new URL(config.baseUrl).host,
    model: config.model,
    modelKnown: Boolean(configured),
    // Nøkkelen ser modellkatalogen selv om modellen ikke er aktivert i Ark-konsollen.
    note: configured ? undefined : `Modellen ${config.model} finnes ikke i katalogen for denne regionen.`,
    availableModels: models.filter((model) => model.status !== "Shutdown").map((model) => model.id),
  });
}

async function chat(req, config) {
  const payload = await req.json().catch(() => null);
  if (!payload || typeof payload !== "object") {
    return json({ error: "Forventet en JSON-body." }, 400);
  }

  const normalized = normalizeMessages(payload, config);
  if (normalized.error) return json({ error: normalized.error }, 400);

  const stream = payload.stream === true;
  const requested = Number(payload.max_tokens);
  const body = {
    model: normalized.model,
    messages: normalized.messages,
    max_tokens: Math.min(Number.isFinite(requested) && requested > 0 ? requested : config.maxTokens, config.maxTokens),
    stream,
  };
  if (Number.isFinite(Number(payload.temperature))) {
    body.temperature = Math.min(Math.max(Number(payload.temperature), 0), 2);
  }

  let response;
  try {
    response = await callArk("/chat/completions", config, { method: "POST", body: JSON.stringify(body) });
  } catch (error) {
    const timedOut = error?.name === "AbortError";
    return json({ error: timedOut ? "BytePlus svarte ikke i tide." : "Fikk ikke kontakt med BytePlus." }, timedOut ? 504 : 502);
  }

  if (!response.ok) {
    const detail = await response.json().catch(() => ({}));
    const code = detail?.error?.code;
    // Full feilmelding inneholder konto-id og request-id. Den hører hjemme i
    // funksjonsloggen, ikke i svaret til en anonym klient.
    console.error("BytePlus-feil", response.status, JSON.stringify(detail));
    return json(
      {
        error: PUBLIC_ERRORS[code] || `BytePlus svarte ${response.status}.`,
        code,
        model: body.model,
      },
      response.status === 429 ? 429 : 502,
    );
  }

  if (stream) {
    return new Response(response.body, {
      headers: {
        "content-type": "text/event-stream; charset=utf-8",
        "cache-control": "no-store",
        connection: "keep-alive",
      },
    });
  }

  const result = await response.json();
  return json({
    model: result.model || body.model,
    text: result.choices?.[0]?.message?.content ?? "",
    finishReason: result.choices?.[0]?.finish_reason,
    usage: result.usage,
  });
}

export default async (req, context) => {
  const config = settings();

  if (!config.apiKey) {
    return json({ error: "BYTEPLUS_API_KEY mangler i miljøvariablene." }, 500);
  }
  if (!originAllowed(req, config)) {
    return json({ error: "Ugyldig origin." }, 403);
  }
  if (config.clientToken && req.headers.get("x-byteplus-token") !== config.clientToken) {
    return json({ error: "Mangler eller feil klienttoken." }, 401);
  }

  if (req.method === "GET") return status(config);
  if (req.method !== "POST") {
    return json({ error: "Bruk GET for status og POST for chat." }, 405);
  }

  const caller = context?.ip || req.headers.get("x-nf-client-connection-ip") || "ukjent";
  if (rateLimited(caller, config.rateLimit)) {
    return json({ error: "For mange kall. Prøv igjen om noen minutter." }, 429);
  }

  return chat(req, config);
};

export const config = {
  path: "/api/byteplus",
};
