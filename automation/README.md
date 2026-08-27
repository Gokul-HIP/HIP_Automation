# Automation Engine Contract Artifacts

- `node-contracts.json` — machine-readable backend contract for every catalog node
- `node-workflows/` — one minimal executable workflow fixture per node
- `generate-contracts.mjs` — regenerator (re-run after catalog/schema changes)

Source of truth: frontend Flow Builder catalog/schemas + JS runtime under `src/runtime/`.

Laravel PHP Automation Engine code is not in this repository; `appointmentBooked` is marked **implemented** as the product reference implementation.
