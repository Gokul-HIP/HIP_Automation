# Campaign workflow fixtures

These JSON files are builder-compatible campaign graphs for Laravel automation.
They reuse existing catalog nodes — **no specialty campaign node types**.

| Fixture | Trigger | campaignKey |
|---------|---------|-------------|
| `firstAppointmentNurturing.workflow.json` | `patientRegistered` | `first_appointment_nurturing` |
| `medicineReminderCampaign.workflow.json` | `medicineReminder` | `medicine_reminder` |
| `digitalPrescriptionCampaign.workflow.json` | `prescriptionAdded` (alias `digitalPrescription`) | `digital_prescription` |
| `postVisitFollowup.workflow.json` | `appointmentCompleted` | `post_visit_followup` |
| `missedAppointmentRestart.workflow.json` | `appointmentMissed` | `missed_appointment_restart` |
| `birthdayWish.workflow.json` | `birthday` | `birthday_wish` |
| `womensDayWish.workflow.json` | `anniversary` (`womens_day`) | `womens_day_wish` |
| `inactivePatient30.workflow.json` | `scheduledEvent` + `last_visit >= 30` | `inactive_30` |
| `inactivePatient90.workflow.json` | `scheduledEvent` + `last_visit >= 90` | `inactive_90` |
| `dentistSegment.workflow.json` | `appointmentBooked` + department | `dentist_segment` |
| `seniorPatientSegment.workflow.json` | `appointmentBooked` + age ≥ 60 | `senior_patient_segment` |
| `parentChildSegment.workflow.json` | `appointmentBooked` + child/relationship | `parent_child_segment` |
| `segmentDentistSeniorParentChild.workflow.json` | Combined example (optional reference) | `segment_variants` |

## Frontend extensions used

- `waitType: "relative_date"` with `relativeDateField`, `relativeOffsetDirection`, `relativeOffsetAmount`
- JEXL: `followup.exists`, `followup.date`, `last_visit`, segment fields
- `configuration.campaignKey` / `suppressOnAppointment` on saved workflow JSON
- Messaging: `recipient`, `campaignStep` (builder properties)
- Trigger alias: `digitalPrescription` → `prescriptionAdded`
- Anniversary type: `womens_day`

## How to use in the builder

1. Create a workflow matching the trigger (hospital-scoped via Laravel list API).
2. Copy node `data` shapes from the fixture (or import when import UI exists).
3. Set **Campaign Key** / **Cancel on appointment booked** in Properties (no node selected).
4. Set **Campaign Step** and **Recipient** on each messaging node.
5. Keep status Draft/`inactive` until Publish → `active`.

## Product note

The workflow **list** loads from Laravel `/workflows`. Fixtures under `automation/node-workflows/` are the frontend contract/seed graphs — they are not auto-listed until saved through the builder API.
