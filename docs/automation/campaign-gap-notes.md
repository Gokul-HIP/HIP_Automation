# Campaign gaps — frontend contract notes

Generated to accompany the campaign gap plan implementation (2026-09-05).

## Existing nodes reused (no new specialty types)

| Campaign | Nodes |
|----------|--------|
| Medicine reminder | `medicineReminder` → messaging → `end` |
| Digital prescription | `prescriptionAdded` (alias `digitalPrescription`) → messaging → `end` |
| Post-visit follow-up | `appointmentCompleted` → `condition` (`followup.exists`) → doctor/patient messaging + `wait` `relative_date` → `end` |
| Missed restart | `appointmentMissed` → messaging → wait → `appointment.exists` → `end` |
| Birthday | `birthday` → messaging → `end` |
| Women's Day | `anniversary` (`womens_day`) → gender `condition` → messaging → `end` |
| Inactive 30/90 | `scheduledEvent` → `last_visit` condition → messaging → `end` |
| Dentist / senior / parent-child | Any trigger + `condition` on department / age / relationship + messaging (`caregiver`) |

## Schema / behavior changes

1. **Wait** — `waitType: "relative_date"` with `relativeDateField`, `relativeOffsetDirection` (`before`|`on`|`after`), `relativeOffsetAmount`, `relativeOffsetUnit`.
2. **Follow-up context** — JEXL `followup.exists`, `followup.date`; variables `followup_date`.
3. **appointmentCompleted** — `requireFollowUp`: `any` | `yes`; context includes follow-up date.
4. **Trigger alias** — `digitalPrescription` / `digital_prescription` → `prescriptionAdded`.
5. **Anniversary** — type `womens_day`.
6. **Serialization** — `configuration.campaignKey`, `configuration.suppressOnAppointment` via `buildWorkflowPayload` / `serializeWorkflow`.
7. **Segments** — condition examples + variable catalog for age, gender, relationship, department, `last_visit`.

## Fixture JSON

See [automation/node-workflows/CAMPAIGNS.md](../../automation/node-workflows/CAMPAIGNS.md).

## Laravel still required

- Durable relative-date scheduling / hospital timezone
- Inject `followup`, `last_visit_days`, department, relationship, caregiver_contact into AutomationContext
- Executors for medicine reminder due times and anniversary `womens_day`
- Cohort scan for inactive scheduled workflows
- Persist fixtures via `/workflows` so they appear in the product workflow list
- Real WhatsApp/SMS/Push providers and hospital-approved templates

## Frontend complete (this repo)

- Separate builder-shaped fixtures per campaign (see CAMPAIGNS.md)
- Messaging UI: `recipient` + `campaignStep` on WA/SMS/Push/Email
- Campaign settings: `campaignKey` / `suppressOnAppointment`
- Graph validation including condition true/false branches
- Fixture validation tests under `src/components/flow/__tests__/campaignFixtures.frontend.test.js`
