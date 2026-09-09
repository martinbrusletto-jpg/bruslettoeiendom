#!/usr/bin/env node
// Sjekker at BytePlus-nøkkelen virker og hvilke modeller kontoen faktisk kan bruke.
//
//   BYTEPLUS_API_KEY=... node scripts/byteplus-check.mjs
//   BYTEPLUS_API_KEY=... node scripts/byteplus-check.mjs seed-2-0-pro-260328

const BASE = (process.env.BYTEPLUS_BASE_URL || "https://ark.ap-southeast.bytepluses.com/api/v3").replace(/\/+$/, "");
const KEY = process.env.BYTEPLUS_API_KEY;
const MODEL = process.argv[2] || process.env.BYTEPLUS_MODEL || "seed-2-0-pro-260328";

if (!KEY) {
  console.error("Mangler BYTEPLUS_API_KEY. Kjør: netlify env:get BYTEPLUS_API_KEY");
  process.exit(1);
}

const headers = { authorization: `Bearer ${KEY}`, "content-type": "application/json" };

const catalog = await fetch(`${BASE}/models`, { headers });
const catalogBody = await catalog.json().catch(() => ({}));

if (!catalog.ok) {
  console.error(`Nøkkelen ble avvist (${catalog.status}): ${catalogBody?.error?.message || "ukjent feil"}`);
  process.exit(1);
}

const models = (catalogBody.data || []).filter((model) => model.status !== "Shutdown");
console.log(`Nøkkel OK mot ${new URL(BASE).host} — ${models.length} modeller i katalogen.`);

const chat = await fetch(`${BASE}/chat/completions`, {
  method: "POST",
  headers,
  body: JSON.stringify({ model: MODEL, messages: [{ role: "user", content: "Svar med ordet OK." }], max_tokens: 16 }),
});
const chatBody = await chat.json().catch(() => ({}));

if (chat.ok) {
  console.log(`Modell ${MODEL} svarer: ${chatBody.choices?.[0]?.message?.content?.trim()}`);
  process.exit(0);
}

if (chatBody?.error?.code === "ModelNotOpen") {
  console.error(`Modell ${MODEL} er ikke aktivert på kontoen. Åpne den under Model Service i Ark-konsollen.`);
} else {
  console.error(`Modell ${MODEL} feilet (${chat.status}): ${chatBody?.error?.message || "ukjent feil"}`);
}
console.error(`Kandidater i katalogen: ${models.map((model) => model.id).slice(0, 12).join(", ")}`);
process.exit(1);
