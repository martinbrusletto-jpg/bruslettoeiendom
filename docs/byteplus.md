# BytePlus ModelArk

Nettstedet snakker med BytePlus gjennom en Netlify-funksjon. API-nøkkelen ligger
som hemmelig miljøvariabel på Netlify og finnes ikke i repoet eller i noe som
sendes til nettleseren.

```
netlify/functions/byteplus.mjs   Proxy mot ModelArk (status + chat)
scripts/byteplus-check.mjs       Sjekker nøkkel og modelltilgang fra terminalen
.env.example                     Hvilke variabler som gjelder
```

Region er `ark.ap-southeast.bytepluses.com`. Nøkkelen er utstedt der og virker
ikke mot den kinesiske Volcengine-regionen.

## Endepunkt

**Status** — `GET /api/byteplus`

```json
{
  "connected": true,
  "region": "ark.ap-southeast.bytepluses.com",
  "model": "seed-2-0-pro-260328",
  "modelKnown": true,
  "availableModels": ["seed-2-0-pro-260328", "deepseek-v4-pro-ga-260813", "..."]
}
```

**Chat** — `POST /api/byteplus`

```bash
curl -sS https://bruslettoeiendom.netlify.app/api/byteplus \
  -H "content-type: application/json" \
  -d '{"prompt":"Skriv en kort ingress om Carved Luxury."}'
```

Body-felter: `prompt` eller `messages` (`role` + `content`), og valgfritt
`system`, `model`, `temperature`, `max_tokens`, `stream`. Med `stream: true`
sendes SSE-strømmen fra BytePlus rett videre.

Svaret er `{ model, text, finishReason, usage }`.

## Grenser i proxyen

Endepunktet er åpent på nettet og bruker Martins kvote, så det er strammet inn:

- maks 20 meldinger og 12 000 tegn per kall
- `max_tokens` klippes til `BYTEPLUS_MAX_TOKENS` (standard 1024)
- 20 kall per IP per fem minutter, per funksjonsinstans
- kall fra andre domener enn eget og `*.netlify.app` avvises
- settes `BYTEPLUS_CLIENT_TOKEN`, kreves headeren `x-byteplus-token`

Netlify avbryter synkrone funksjoner før BytePlus rekker å svare på lange
generereringer. Bruk `stream: true` eller hold `max_tokens` nede for tunge svar.

## Aktivere en modell

Nøkkelen leser modellkatalogen med en gang, men hvert modellkall krever at
modellen er aktivert på kontoen. Er den ikke det, svarer BytePlus:

```
ModelNotOpen: Your account ... has not activated the model ...
```

Åpne modellen under **Model Service** i Ark-konsollen, og oppdater
`BYTEPLUS_MODEL` på Netlify hvis du velger en annen enn standardmodellen.

## Verifisere

```bash
netlify env:get BYTEPLUS_API_KEY            # henter nøkkelen fra Netlify
BYTEPLUS_API_KEY=... node scripts/byteplus-check.mjs

netlify dev                                  # lokalt, leser .env
curl -sS localhost:8888/api/byteplus
```

## Bytte nøkkel

```bash
netlify env:set BYTEPLUS_API_KEY <ny-nøkkel> --secret
```

Nøkkelen skal aldri inn i `index.html`, `script.js` eller andre filer som
serveres til nettleseren.
