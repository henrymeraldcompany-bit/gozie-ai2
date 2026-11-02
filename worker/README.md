# Gozie AI Backend

A separate Cloudflare Worker for the Gozie AI application. It does not modify or depend on the existing `gozie-search-media` or `henry-search-api` Workers.

## Features
- Cloudflare Workers AI inference through an AI binding.
- Firebase ID-token verification for verified Firebase email accounts.
- Permanent Gozie AI identity configuration (Henry Cee is the creator, developer and owner).
- Deterministic identity answers for common name, creator and owner questions.
- Model selection through the `MODEL_ID` Worker variable.
- Authenticated web-search endpoint at `/v1/search?q=...`.
- OpenAI-compatible chat-completions response at `/v1/chat/completions`.

## Deployment
The Worker is named `gozie-ai-backend`. Bind Workers AI as `AI`. Configure `MODEL_ID` and optionally `ALLOWED_EMAILS` as Worker variables. Never put private API keys in the frontend.

## Notes
The initial web-search adapter uses DuckDuckGo's HTML results. Search provider markup and availability can change, so the search endpoint must be tested and monitored. Per-isolate in-memory request limiting is a basic safeguard, not a global distributed quota.
