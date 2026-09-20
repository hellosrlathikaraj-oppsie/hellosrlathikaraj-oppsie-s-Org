# Scout

Scout is a browser-first research-outreach tool for finding professors whose recent OpenAlex-indexed work matches a candidate's interests. Profile, tracker, manual-email, and OpenAlex-key data stay in the visitor's browser. Live searches send the visitor's OpenAlex key to the Scout proxy for that request; Scout never guesses or scrapes email addresses.

## Local development

```bash
npm install
npm run dev
```

The server listens on `127.0.0.1:3000` by default. Without a visitor-supplied OpenAlex key, Discover uses clearly labeled illustrative sample data. Visitors can add their own free key from [OpenAlex settings](https://openalex.org/settings/api).

## Reverse-proxy configuration

`TRUST_PROXY_HOPS` controls how many trusted reverse-proxy hops Express may use when deriving `req.ip` for rate limiting. It defaults to **0**, which is the safe setting when Scout is reached directly with no proxy in front. Scout does not manually parse `X-Forwarded-For`.

For a hosted deployment, set `TRUST_PROXY_HOPS` to the real number of trusted proxy hops in front of the application according to that hosting provider's network topology. Do not blindly copy a value from another platform: an incorrect value can make rate limiting trust a client-supplied address or collapse visitors behind a proxy address. The corresponding setting is documented in `.env.example`.

If the hosting topology is not known, leave the value at `0` until the platform's documented proxy chain has been confirmed. No permanent hosting provider is configured for this repository yet.

## Validation

```bash
npm run lint
npm run build
npm test
```
