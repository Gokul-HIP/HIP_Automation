# Automation Engine Contract Artifacts

- `node-contracts.json` — machine-readable backend contract for every catalog node
- `node-workflows/` — one minimal executable workflow fixture per node
- `node-workflows/*Campaign*.workflow.json` / campaign fixtures — multi-node hospital campaigns (see `CAMPAIGNS.md`)
- `node-workflows/firstAppointmentNurturing.workflow.json` — multi-node campaign fixture (patientRegistered → wait → `appointment.exists` → messaging)
- `generate-contracts.mjs` — regenerator (re-run after catalog/schema changes)

Source of truth: frontend Flow Builder catalog/schemas + JS runtime under `src/runtime/`.

Laravel PHP Automation Engine code is not in this repository; `appointmentBooked` is marked **implemented** as the product reference implementation.

## First Appointment Nurturing (JS runtime mirror)

Reusable pieces added under `src/runtime/services/`:

- `AppointmentLookup` — patient-scoped `appointment.exists` (+ injectable DB lookup)
- `CampaignSuppression` — cancel pending executions by `campaignKey` + patient (not workflow id)
- `MessageIdempotency` — dedupe sends by workflow/execution/patient/node/step
- `FollowupContext` — `followup.exists` / `followup.date` + relative_date wait targeting

Set `configuration.campaignKey: "first_appointment_nurturing"` on saved workflows so `onAppointmentBooked` can cancel pending runs.

Run runtime tests: `npm test`

Campaign gap notes: `docs/automation/campaign-gap-notes.md`

