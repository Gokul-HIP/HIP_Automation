# Frontend node system readiness

Canonical inventory for the React Flow builder. **This document covers nodes only** — not seeded workflows.

## Required generic nodes

| Canonical `nodeType` | Category | Notes |
|----------------------|----------|--------|
| `patientRegistered` | triggers | |
| `appointmentBooked` | triggers | alias `appointment_booked` |
| `appointmentCompleted` | triggers | alias `appointment_completed` |
| `appointmentMissed` | triggers | alias `appointment_missed` |
| `prescriptionAdded` | triggers | aliases `digitalPrescription`, `digital_prescription` |
| `medicineReminder` | triggers | |
| `birthday` | triggers | |
| `anniversary` | triggers | `anniversaryType` includes `womens_day` (**not** a separate node type) |
| `scheduledEvent` | triggers | |
| `condition` | conditions | JEXL; true/false handles required |
| `wait` | wait | `duration` / `until` / `relative_date` / `cron` / `recurring` |
| `sendWhatsApp` | messaging | |
| `sendSms` | messaging | |
| `sendPush` | messaging | |
| `sendEmail` | messaging | |
| `end` | flow | no outgoing handle |

Do **not** create specialty nodes (`DentistNode`, `SeniorCitizenNode`, etc.). Represent segments with `condition` + messaging `recipient`.

## Canonical keys & aliases

| Alias / UI | Canonical |
|------------|-----------|
| `digitalPrescription` / `digital_prescription` | `prescriptionAdded` |
| `womens_day` | `anniversary.anniversaryType = "womens_day"` |
| `campaignKey` / `campaign_key` | configuration `campaignKey` |
| `campaignStep` | messaging node `data.campaignStep` |
| `suppressOnAppointment` | configuration boolean |

## Wait units

`minutes` | `hours` | `days` | `weeks` (duration and relative offset).

## Messaging fields (WA / SMS / Push / Email)

- `recipient` (patient | doctor | caregiver | custom)
- `customRecipient` (when recipient = custom)
- `templateId` (optional when manual content is valid)
- `message` / `title`+`body` / `subject`+`body` as applicable
- `campaignStep` (optional but required by campaign fixtures)

Provider delivery is a **backend dependency**.

## Condition

- Freeform JEXL (`expression`)
- Examples include `appointment.exists == false`, `followup.exists`, `last_visit`, age, gender, relationship, department
- True / false outgoing edges required

## Connection rules

- No edges out of `end`
- No edges into trigger nodes (or UI `start`)
- Condition edges require `sourceHandle` `true` or `false`
- Non-condition nodes: at most one outgoing edge

## Validation source of truth

`src/components/flow/validation/workflowGraphValidation.js`  
(`useFlowBuilder` re-exports this — do not duplicate.)

## Backend-dependent fields

Context values injected at runtime by Laravel: appointment existence, follow-up dates, age, gender, relationship, department, last visit days, caregiver contact, medicine schedule, birthday cohort, anniversary occasion runners.

## Specialty campaign representation (nodes only)

| Business need | Nodes |
|---------------|--------|
| Dentist | `appointmentBooked` + `condition` on department + messaging |
| Senior | trigger + `patient.age` condition + messaging |
| Parent–child | trigger + age/relationship condition + `recipient: caregiver` |
| Women’s Day | `anniversary` (`womens_day`) + gender condition + messaging |
| Inactive 30/90 | `scheduledEvent` + `last_visit` condition + messaging |

## Orphan schemas (not in catalog — retained)

| Schema key | Location | Status |
|------------|----------|--------|
| `delay` | `wait/schemas.js` | **Deprecated / unused** — superseded by catalog `wait`. Not removed. |
| `switch` | `conditions/schemas.js` | **Deprecated / unused** — superseded by catalog `condition`. Not removed. |

See also `docs/automation/frontend-node-documentation.md` §1 and §6.
