# Frontend Automation Node Documentation

## 1. Purpose

This document defines the **frontend automation node contract** used when building and saving workflows in the HIP Flow Builder. It describes every node currently registered in the frontend catalog, including property-panel fields, validation, variable support, the full JSON the frontend produces, and backend mapping status from `automation/node-contracts.json`.

It is intended for backend/frontend automation integration. Fields and behaviors not present in the inspected source files are **not** invented.

Generated: 2026-08-28T05:48:26.582Z  
**Synced with:** `docs/automation/node-system-readiness.md` (2026-09-05 browser verification)

### 1.1 Required generic nodes (canonical)

Aligned with `node-system-readiness.md`. Specialty segment needs use `condition` + messaging `recipient` — do **not** invent specialty node types.

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
| `condition` | conditions | Freeform JEXL (`expression`); true/false outgoing handles required |
| `wait` | wait | `duration` / `until` / `relative_date` / `cron` / `recurring`; units include **weeks** |
| `sendWhatsApp` | messaging | |
| `sendSms` | messaging | |
| `sendPush` | messaging | |
| `sendEmail` | messaging | |
| `end` | flow | no outgoing handle |

### 1.2 Wait units

`minutes` | `hours` | `days` | `weeks` (duration and relative offset).

### 1.3 Messaging fields (WA / SMS / Push / Email)

- `recipient` (patient | doctor | caregiver | custom)
- `customRecipient` (when recipient = custom)
- `templateId` (optional when manual content is valid)
- `message` / `title`+`body` / `subject`+`body` as applicable
- `campaignStep` (optional; required by campaign fixtures)

### 1.4 Connection rules

Implemented in `src/components/flow/validation/connectionRules.js` (`isValidWorkflowConnection`):

- No edges out of `end`
- No edges into trigger nodes (or UI `start`)
- Condition edges require `sourceHandle` `true` or `false`
- Non-condition nodes: at most one outgoing edge

### 1.5 Validation source of truth

`src/components/flow/validation/workflowGraphValidation.js`  
(`useFlowBuilder` re-exports this — do not duplicate.)

## 2. Source of Truth

| Concern | Files |
|---|---|
| Node catalog | `src/components/flow/config/nodes/catalog.js` |
| Categories / tones | `workflowCategories.js`, `nodeTones.js`, `workflowNodes.js` (`createNodeDefaults`) |
| Trigger schemas / aliases | `src/components/flow/config/triggers/schemas.js`, `triggers/shared.js` |
| Messaging schemas | `messaging/schemas.js`, `messaging/shared.js` |
| Condition schemas | `conditions/schemas.js` |
| Wait schemas | `wait/schemas.js` |
| Database schemas | `database/schemas.js`, `database/shared.js` |
| Variables | `src/components/flow/config/variables.js`, `src/utils/workflowVariableTokens.js` |
| Property panels | `panels/PropertyPanel.jsx`, `triggers/*`, `messaging/*`, `conditions/*`, `wait/*`, `database/*`, `flow/EndProperties.jsx` |
| Graph validation | `validation/workflowGraphValidation.js` (re-exported by `useFlowBuilder.js`) |
| Connection rules | `validation/connectionRules.js` |
| Node validation helpers | `triggerValidation.js`; `messagingUx.js`; `conditionValidation.js`; `dbDeleteValidation.js` |
| Generated contracts | `automation/node-contracts.json` |
| Backend contracts file | `docs/automation/backend-node-contracts.json` — **not present** in this repository |
| Laravel mapping | `NodeTypeNormalizer` / executors are **not in this repo**; mapping below uses contracts + frontend aliases only |
| Readiness inventory | `docs/automation/node-system-readiness.md` |

## 3. Node Summary

| # | Frontend Node ID | Display Name | Category | Frontend Role | Backend Canonical Type | Backend Status |
|---|---|---|---|---|---|---|
| 1 | `start` | Workflow Start | `triggers` | start | `start` | `partial` |
| 2 | `onChatMessage` | On Message Received | `triggers` | trigger | `onChatMessage` | `partial` |
| 3 | `patientRegistered` | Patient Registered | `triggers` | trigger | `patientRegistered` | `partial` |
| 4 | `appointmentBooked` | Appointment Booked | `triggers` | trigger | `appointmentBooked` (aliases: `appointment_booked`) | `implemented` |
| 5 | `appointmentRescheduled` | Appointment Rescheduled | `triggers` | trigger | `appointmentRescheduled` (aliases: `appointment_rescheduled`) | `partial` |
| 6 | `appointmentCompleted` | Appointment Completed | `triggers` | trigger | `appointmentCompleted` (aliases: `appointment_completed`) | `partial` |
| 7 | `appointmentCancelled` | Appointment Cancelled | `triggers` | trigger | `appointmentCancelled` (aliases: `appointment_cancelled`) | `partial` |
| 8 | `appointmentMissed` | Appointment Missed | `triggers` | trigger | `appointmentMissed` (aliases: `appointment_missed`) | `partial` |
| 9 | `prescriptionAdded` | Prescription Added | `triggers` | trigger | `prescriptionAdded` | `partial` |
| 10 | `medicineReminder` | Medicine Reminder Due | `triggers` | trigger | `medicineReminder` | `partial` |
| 11 | `labTestOrdered` | Lab Test Ordered | `triggers` | trigger | `labTestOrdered` | `partial` |
| 12 | `labReportNotification` | Lab Report Ready | `triggers` | trigger | `labReportNotification` | `partial` |
| 13 | `pharmacyRefillDue` | Pharmacy Refill Due | `triggers` | trigger | `pharmacyRefillDue` | `partial` |
| 14 | `appointmentReminder` | Appointment Reminder | `triggers` | trigger | `appointmentReminder` (aliases: `appointment_reminder`) | `partial` |
| 15 | `birthday` | Birthday | `triggers` | trigger | `birthday` | `partial` |
| 16 | `anniversary` | Anniversary | `triggers` | trigger | `anniversary` | `partial` |
| 17 | `membershipExpiry` | Hospital Membership Expiry | `triggers` | trigger | `membershipExpiry` | `partial` |
| 18 | `userPlanExpiry` | User Plan Expiry | `triggers` | trigger | `userPlanExpiry` | `partial` |
| 19 | `rewardUpdated` | Reward Points Updated | `triggers` | trigger | `rewardUpdated` | `partial` |
| 20 | `rewardsTierUpgraded` | Rewards Tier Upgraded | `triggers` | trigger | `rewardsTierUpgraded` | `partial` |
| 21 | `familyPackageTierUpdated` | Family Package Plan Tier Updated | `triggers` | trigger | `familyPackageTierUpdated` | `partial` |
| 22 | `invoiceGenerated` | Invoice Generated | `triggers` | trigger | `invoiceGenerated` | `partial` |
| 23 | `paymentReceived` | Payment Received | `triggers` | trigger | `paymentReceived` | `partial` |
| 24 | `webhookEvent` | Webhook Event | `triggers` | trigger | `webhookEvent` | `partial` |
| 25 | `apiEvent` | API Event | `triggers` | trigger | `apiEvent` | `partial` |
| 26 | `scheduledEvent` | Scheduled Event | `triggers` | trigger | `scheduledEvent` | `partial` |
| 27 | `condition` | Condition | `conditions` | logic | `condition` | `implemented` |
| 28 | `wait` | Wait | `wait` | control | `wait` | `implemented` |
| 29 | `sendWhatsApp` | Send WhatsApp | `messaging` | communication | `sendWhatsApp` | `partial` |
| 30 | `sendSms` | Send SMS | `messaging` | communication | `sendSms` | `partial` |
| 31 | `sendEmail` | Send Email | `messaging` | communication | `sendEmail` | `partial` |
| 32 | `sendPush` | Send Push Notification | `messaging` | communication | `sendPush` | `partial` |
| 33 | `sendAiChat` | Send AI Chat | `messaging` | communication | `sendAiChat` | `partial` |
| 34 | `sendAiVoice` | Send AI Voice Call | `messaging` | communication | `sendAiVoice` | `partial` |
| 35 | `sendIvr` | Send IVR | `messaging` | communication | `sendIvr` | `partial` |
| 36 | `sendTemplate` | Send Template | `messaging` | communication | `sendTemplate` | `partial` |
| 37 | `dbCreate` | Create Record | `database` | database | `dbCreate` | `stub` |
| 38 | `dbUpdate` | Update Record | `database` | database | `dbUpdate` | `stub` |
| 39 | `dbDelete` | Delete Record | `database` | database | `dbDelete` | `stub` |
| 40 | `updateAppointment` | Update Appointment | `database` | database | `updateAppointment` | `stub` |
| 41 | `updatePrescription` | Update Prescription | `database` | database | `updatePrescription` | `stub` |
| 42 | `updateMembership` | Update Membership | `database` | database | `updateMembership` | `stub` |
| 43 | `dbQuery` | Database Query | `database` | database | `dbQuery` | `stub` |
| 44 | `httpRequest` | REST API | `integrations` | action | `httpRequest` | `stub` |
| 45 | `ai` | AI | `ai` | AI | `ai` | `stub` |
| 46 | `end` | End | `flow` | end | `end` | `implemented` |

**Catalog node count:** 46  
**Contracts node count:** 46  
**Missing from contracts:** _none_

## 3.1 Shared messaging defaults (all messaging nodes)

Every messaging schema default is built with `createMessagingDefaults`, which always includes:

```json
{
  "label": "<node label>",
  "status": "draft",
  "templateId": "",
  "recipient": "patient",
  "customRecipient": "",
  "campaignStep": "",
  "repeatReminder": false,
  "retryInterval": 15,
  "maxRetryCount": 2,
  "fallbackChannel": "",
  "variables": {}
}
```

Recipient options: `patient`, `doctor`, `caregiver`, `custom`  
When `recipient` is `custom`, the `customRecipient` field is shown.  
`campaignStep` is an optional stable step id for campaign idempotency.  
Retry interval options: `5`, `10`, `15`, `30`, `60`  
Notification channel options: `whatsapp`, `sms`, `email`, `push`  
Push priority options: `normal`, `high`

## 3.2 Trigger aliases

| Alias | Canonical |
|---|---|
| `appointment_rescheduled` | `appointmentRescheduled` |
| `appointment_completed` | `appointmentCompleted` |
| `appointment_booked` | `appointmentBooked` |
| `appointment_cancelled` | `appointmentCancelled` |
| `appointment_missed` | `appointmentMissed` |
| `appointment_reminder` | `appointmentReminder` |
| `digitalPrescription` / `digital_prescription` | `prescriptionAdded` |

## 3.3 Campaign fixtures

See `automation/node-workflows/CAMPAIGNS.md` and `docs/automation/campaign-gap-notes.md` for medicine reminder, digital prescription, post-visit follow-up (`relative_date` wait), missed restart, birthday / Women's Day, inactive 30/90, and segment variants.

## 4. Detailed Node Documentation

# Node: start

## Basic Information

| Property | Value |
|---|---|
| Node ID | `start` |
| Display Name | Workflow Start |
| Purpose | Entry point for every hospital automation workflow. |
| Category | `triggers` |
| Node Type | `start` |
| Frontend Role | start |
| Custom Panel | _none (generic)_ |
| Property Panel Component | GenericNodeProperties (start is largely non-editable / disabled actions) |
| Backend Canonical Type | `start` |
| Backend Executor | NodeExecutorRegistry.#executePassthrough (JS); frontend-only — stripped before Laravel save |
| Backend Status | `partial` |

## Fields

| Field | Type | Required | Default | Allowed Values | Variables Supported | Description |
|---|---|---|---|---|---|---|
| `nodeType` | string | Yes | start | `start` | No | Canonical frontend node type. Set by `createNodeDefaults`. |
| `category` | string | Yes | triggers | `triggers` | No | Catalog category id. |
| `tone` | string | No | success | UI tone token from `toneForCategory` | No | Visual tone for the canvas node. |
| `description` | string | No | Entry point for every hospital automation workflow. | — | No | Human description copied from schema/catalog. |
| `label` | text | Yes | Workflow Start | — | No | Display name |
| `status` | string | No | ready | `ready` | No | UI status |
| `triggerSource` | string | No | manual | `manual` | No | Start source marker |

## Validation

### Graph-level (`validateWorkflowGraph`)
- Workflow must have nodes.
- Exactly one event trigger (`isTrigger` / `triggerKey`, excluding `start`).
- At least one `end` node.
- No cycles unless a `loop` node exists (catalog currently has no loop node).
- All non-start nodes must be connected when more than one node exists.
- Unknown node types are errors.

### Node-specific
- Multiple start nodes → warning.
- Start with no outgoing edge when other nodes exist → error.
- Start is stripped from Laravel save payload (`stripFrontendStartNodes`).

## Variable Support

No variable picker on this node’s property panel.

## Full Frontend JSON

Complete saved node object as produced for workflow configuration persistence (`serializeNode` / `configuration.nodes[]`). Shape is `{ id, type, position, data }` — canvas-only React Flow keys such as `dragHandle` / `selected` are **not** part of the saved Laravel payload.

### Complete saved node JSON

```json
{
  "id": "n_start_1",
  "type": "workflow",
  "position": {
    "x": 280,
    "y": 160
  },
  "data": {
    "nodeType": "start",
    "category": "triggers",
    "tone": "success",
    "description": "Entry point for every hospital automation workflow.",
    "label": "Workflow Start",
    "status": "ready",
    "triggerSource": "manual"
  }
}
```

### `node.data` only

```json
{
  "nodeType": "start",
  "category": "triggers",
  "tone": "success",
  "description": "Entry point for every hospital automation workflow.",
  "label": "Workflow Start",
  "status": "ready",
  "triggerSource": "manual"
}
```

## Backend Mapping

| Frontend Node ID | `start` |
| Trigger aliases (NodeTypeNormalizer-style, frontend) | _None in frontend `TRIGGER_TYPE_ALIASES`_ |
| Canonical backend type (from contracts) | `start` (same id; Laravel `NodeTypeNormalizer` **not in this repo**) |
| Executor (from `automation/node-contracts.json`) | NodeExecutorRegistry.#executePassthrough (JS); frontend-only — stripped before Laravel save |
| Backend status (contracts) | `partial` |

## Limitations / Notes

- Catalog description: Entry point for every hospital automation workflow.
- Next-step behavior (contracts): continue to first outgoing edge (usually trigger); omitted from persisted Laravel graph
- Frontend-only decoration; stripped before Laravel save/publish (`stripFrontendStartNodes`).

---
# Node: onChatMessage

## Basic Information

| Property | Value |
|---|---|
| Node ID | `onChatMessage` |
| Display Name | On Message Received |
| Purpose | Triggers the workflow whenever a new incoming message is received through a supported communication channel. |
| Category | `triggers` |
| Node Type | `onChatMessage` |
| Frontend Role | trigger |
| Custom Panel | `trigger` |
| Property Panel Component | TriggerProperties (`PANEL_MAP.trigger`) |
| Backend Canonical Type | `onChatMessage` |
| Backend Executor | JS NodeExecutorRegistry.#executeTrigger (generic passthrough). Laravel executor not present in this repo. |
| Backend Status | `partial` |

## Fields

| Field | Type | Required | Default | Allowed Values | Variables Supported | Description |
|---|---|---|---|---|---|---|
| `nodeType` | string | Yes | onChatMessage | `onChatMessage` | No | Canonical frontend node type. Set by `createNodeDefaults`. |
| `category` | string | Yes | triggers | `triggers` | No | Catalog category id. |
| `tone` | string | No | success | UI tone token from `toneForCategory` | No | Visual tone for the canvas node. |
| `description` | string | No | Triggers the workflow whenever a new incoming message is received through a supported communication channel. | — | No | Human description copied from schema/catalog. |
| `label` | text | Yes | "On Message Received" | — | No | Trigger Name. Enter trigger name. Placeholder: Enter trigger name |
| `channel` | multiselect | Yes | ["any"] | `any` (Any), `whatsapp` (WhatsApp), `web_chat` (Web Chat), `app_chat` (App Chat) | No | Channel. Which channels should start this workflow. |
| `messageType` | multiselect | Yes | ["any"] | `any` (Any), `text` (Text), `image` (Image), `document` (Document), `audio` (Audio), `button_reply` (Button Reply) | No | Message Type. Filter by incoming message type. |
| `messageMatch` | select | Yes | "any" | `any` (Any Message), `contains` (Contains), `exact` (Exact Match), `starts_with` (Starts With) | No | Message Match. How the message content should be matched. |
| `tags` | tags | No | [] | — | No | Tags. Enter keywords such as appointment, doctor, help. Placeholder: appointment, doctor, help |
| `status` | string | No | "draft" | — | No | Present on node.data via schema defaults / createNodeDefaults (saved with the node). _(Default key not declared as a schema.fields entry)_ |

## Validation

### Graph-level (`validateWorkflowGraph`)
- Workflow must have nodes.
- Exactly one event trigger (`isTrigger` / `triggerKey`, excluding `start`).
- At least one `end` node.
- No cycles unless a `loop` node exists (catalog currently has no loop node).
- All non-start nodes must be connected when more than one node exists.
- Unknown node types are errors.

### Node-specific (`validateTriggerNodeFields`)
- Required schema fields that are visible (`showWhen`) must be non-empty.
- Empty arrays count as empty.
- If a field of type `retry` exists and `repeatReminder` is on: `retryInterval` required; `maxRetryCount` ≥ 1.

## Variable Support

Triggers do not edit message templates in the main schema fields; context is injected at runtime.

UI context card keys (read-only): `{{patient_name}}` / `patient_name`, `{{channel}}` / `channel`, `{{message_text}}` / `message_text`

Declared laravelContext: `context.patient`, `context.message`, `context.hospital`

## Full Frontend JSON

Complete saved node object as produced for workflow configuration persistence (`serializeNode` / `configuration.nodes[]`). Shape is `{ id, type, position, data }` — canvas-only React Flow keys such as `dragHandle` / `selected` are **not** part of the saved Laravel payload.

### Complete saved node JSON

```json
{
  "id": "n_onChatMessage_1",
  "type": "workflow",
  "position": {
    "x": 280,
    "y": 160
  },
  "data": {
    "nodeType": "onChatMessage",
    "category": "triggers",
    "tone": "success",
    "description": "Triggers the workflow whenever a new incoming message is received through a supported communication channel.",
    "label": "On Message Received",
    "status": "draft",
    "channel": [
      "any"
    ],
    "messageType": [
      "any"
    ],
    "messageMatch": "any",
    "tags": []
  }
}
```

### `node.data` only

```json
{
  "nodeType": "onChatMessage",
  "category": "triggers",
  "tone": "success",
  "description": "Triggers the workflow whenever a new incoming message is received through a supported communication channel.",
  "label": "On Message Received",
  "status": "draft",
  "channel": [
    "any"
  ],
  "messageType": [
    "any"
  ],
  "messageMatch": "any",
  "tags": []
}
```

## Backend Mapping

| Frontend Node ID | `onChatMessage` |
| Trigger aliases (NodeTypeNormalizer-style, frontend) | _None in frontend `TRIGGER_TYPE_ALIASES`_ |
| Canonical backend type (from contracts) | `onChatMessage` (same id; Laravel `NodeTypeNormalizer` **not in this repo**) |
| Executor (from `automation/node-contracts.json`) | JS NodeExecutorRegistry.#executeTrigger (generic passthrough). Laravel executor not present in this repo. |
| Backend status (contracts) | `partial` |

## Limitations / Notes

- Catalog description: On Message Received
- Next-step behavior (contracts): action=continue; follow first outgoing edge (parallel fan-out not implemented)
- Frontend schema is complete; Laravel-specific executor for this trigger is not present in this repository (contracts: partial).

---
# Node: patientRegistered

## Basic Information

| Property | Value |
|---|---|
| Node ID | `patientRegistered` |
| Display Name | Patient Registered |
| Purpose | Triggers the workflow whenever a patient is registered in the HIP system. |
| Category | `triggers` |
| Node Type | `patientRegistered` |
| Frontend Role | trigger |
| Custom Panel | `trigger` |
| Property Panel Component | TriggerProperties (`PANEL_MAP.trigger`) |
| Backend Canonical Type | `patientRegistered` |
| Backend Executor | JS NodeExecutorRegistry.#executeTrigger (generic passthrough). Laravel executor not present in this repo. |
| Backend Status | `partial` |

## Fields

| Field | Type | Required | Default | Allowed Values | Variables Supported | Description |
|---|---|---|---|---|---|---|
| `nodeType` | string | Yes | patientRegistered | `patientRegistered` | No | Canonical frontend node type. Set by `createNodeDefaults`. |
| `category` | string | Yes | triggers | `triggers` | No | Catalog category id. |
| `tone` | string | No | success | UI tone token from `toneForCategory` | No | Visual tone for the canvas node. |
| `description` | string | No | Triggers the workflow whenever a patient is registered in the HIP system. | — | No | Human description copied from schema/catalog. |
| `label` | text | Yes | "Patient Registered" | — | No | Trigger Name. Enter trigger name. Placeholder: Enter trigger name |
| `registrationSource` | multiselect | Yes | ["any"] | `any` (Any), `app` (App), `website` (Website), `whatsapp` (WhatsApp), `hospital` (Hospital), `api` (API) | No | Registration Source. Which registration sources should start this workflow. |
| `patientType` | select | Yes | "any" | `any` (Any), `new` (New), `existing` (Existing) | No | Patient Type |
| `status` | string | No | "draft" | — | No | Present on node.data via schema defaults / createNodeDefaults (saved with the node). _(Default key not declared as a schema.fields entry)_ |

## Validation

### Graph-level (`validateWorkflowGraph`)
- Workflow must have nodes.
- Exactly one event trigger (`isTrigger` / `triggerKey`, excluding `start`).
- At least one `end` node.
- No cycles unless a `loop` node exists (catalog currently has no loop node).
- All non-start nodes must be connected when more than one node exists.
- Unknown node types are errors.

### Node-specific (`validateTriggerNodeFields`)
- Required schema fields that are visible (`showWhen`) must be non-empty.
- Empty arrays count as empty.
- If a field of type `retry` exists and `repeatReminder` is on: `retryInterval` required; `maxRetryCount` ≥ 1.

## Variable Support

Triggers do not edit message templates in the main schema fields; context is injected at runtime.

UI context card keys (read-only): `{{patient_name}}` / `patient_name`, `{{patient_mobile}}` / `patient_mobile`, `{{hospital_name}}` / `hospital_name`

Declared laravelContext: `context.patient`, `context.hospital`

## Full Frontend JSON

Complete saved node object as produced for workflow configuration persistence (`serializeNode` / `configuration.nodes[]`). Shape is `{ id, type, position, data }` — canvas-only React Flow keys such as `dragHandle` / `selected` are **not** part of the saved Laravel payload.

### Complete saved node JSON

```json
{
  "id": "n_patientRegistered_1",
  "type": "workflow",
  "position": {
    "x": 280,
    "y": 160
  },
  "data": {
    "nodeType": "patientRegistered",
    "category": "triggers",
    "tone": "success",
    "description": "Triggers the workflow whenever a patient is registered in the HIP system.",
    "label": "Patient Registered",
    "status": "draft",
    "registrationSource": [
      "any"
    ],
    "patientType": "any"
  }
}
```

### `node.data` only

```json
{
  "nodeType": "patientRegistered",
  "category": "triggers",
  "tone": "success",
  "description": "Triggers the workflow whenever a patient is registered in the HIP system.",
  "label": "Patient Registered",
  "status": "draft",
  "registrationSource": [
    "any"
  ],
  "patientType": "any"
}
```

## Backend Mapping

| Frontend Node ID | `patientRegistered` |
| Trigger aliases (NodeTypeNormalizer-style, frontend) | _None in frontend `TRIGGER_TYPE_ALIASES`_ |
| Canonical backend type (from contracts) | `patientRegistered` (same id; Laravel `NodeTypeNormalizer` **not in this repo**) |
| Executor (from `automation/node-contracts.json`) | JS NodeExecutorRegistry.#executeTrigger (generic passthrough). Laravel executor not present in this repo. |
| Backend status (contracts) | `partial` |

## Limitations / Notes

- Catalog description: Patient Registered
- Next-step behavior (contracts): action=continue; follow first outgoing edge (parallel fan-out not implemented)
- Frontend schema is complete; Laravel-specific executor for this trigger is not present in this repository (contracts: partial).

---
# Node: appointmentBooked

## Basic Information

| Property | Value |
|---|---|
| Node ID | `appointmentBooked` |
| Display Name | Appointment Booked |
| Purpose | Triggers the workflow whenever a new appointment is successfully booked. |
| Category | `triggers` |
| Node Type | `appointmentBooked` |
| Frontend Role | trigger |
| Custom Panel | `trigger` |
| Property Panel Component | TriggerProperties (`PANEL_MAP.trigger`) |
| Backend Canonical Type | `appointmentBooked` (aliases: `appointment_booked`) |
| Backend Executor | Laravel AppointmentBookedTriggerExecutor (reference) + JS NodeExecutorRegistry.#executeTrigger (passthrough metadata) |
| Backend Status | `implemented` |

## Fields

| Field | Type | Required | Default | Allowed Values | Variables Supported | Description |
|---|---|---|---|---|---|---|
| `nodeType` | string | Yes | appointmentBooked | `appointmentBooked` | No | Canonical frontend node type. Set by `createNodeDefaults`. |
| `category` | string | Yes | triggers | `triggers` | No | Catalog category id. |
| `tone` | string | No | success | UI tone token from `toneForCategory` | No | Visual tone for the canvas node. |
| `description` | string | No | Triggers the workflow whenever a new appointment is successfully booked. | — | No | Human description copied from schema/catalog. |
| `label` | text | Yes | "Appointment Booked" | — | No | Trigger Name. Enter trigger name. Placeholder: Enter trigger name |
| `source` | multiselect | Yes | ["any"] | `any` (Any), `mobile` (Mobile), `website` (Website), `admin` (Admin) | No | Source. Which booking sources should start this workflow. |
| `status` | string | No | "draft" | — | No | Present on node.data via schema defaults / createNodeDefaults (saved with the node). _(Default key not declared as a schema.fields entry)_ |

## Validation

### Graph-level (`validateWorkflowGraph`)
- Workflow must have nodes.
- Exactly one event trigger (`isTrigger` / `triggerKey`, excluding `start`).
- At least one `end` node.
- No cycles unless a `loop` node exists (catalog currently has no loop node).
- All non-start nodes must be connected when more than one node exists.
- Unknown node types are errors.

### Node-specific (`validateTriggerNodeFields`)
- Required schema fields that are visible (`showWhen`) must be non-empty.
- Empty arrays count as empty.
- If a field of type `retry` exists and `repeatReminder` is on: `retryInterval` required; `maxRetryCount` ≥ 1.

## Variable Support

Triggers do not edit message templates in the main schema fields; context is injected at runtime.

UI context card keys (read-only): `{{patient_name}}` / `patient_name`, `{{doctor_name}}` / `doctor_name`, `{{appointment_date}}` / `appointment_date`, `{{appointment_time}}` / `appointment_time`

Declared laravelContext: `context.patient`, `context.appointment`, `context.doctor`, `context.hospital`

## Full Frontend JSON

Complete saved node object as produced for workflow configuration persistence (`serializeNode` / `configuration.nodes[]`). Shape is `{ id, type, position, data }` — canvas-only React Flow keys such as `dragHandle` / `selected` are **not** part of the saved Laravel payload.

### Complete saved node JSON

```json
{
  "id": "n_appointmentBooked_1",
  "type": "workflow",
  "position": {
    "x": 280,
    "y": 160
  },
  "data": {
    "nodeType": "appointmentBooked",
    "category": "triggers",
    "tone": "success",
    "description": "Triggers the workflow whenever a new appointment is successfully booked.",
    "label": "Appointment Booked",
    "status": "draft",
    "source": [
      "any"
    ]
  }
}
```

### `node.data` only

```json
{
  "nodeType": "appointmentBooked",
  "category": "triggers",
  "tone": "success",
  "description": "Triggers the workflow whenever a new appointment is successfully booked.",
  "label": "Appointment Booked",
  "status": "draft",
  "source": [
    "any"
  ]
}
```

## Backend Mapping

| Frontend Node ID | `appointmentBooked` |
| Trigger aliases (NodeTypeNormalizer-style, frontend) | `appointment_booked` |
| Canonical backend type (from contracts) | `appointmentBooked` (same id; Laravel `NodeTypeNormalizer` **not in this repo**) |
| Executor (from `automation/node-contracts.json`) | Laravel AppointmentBookedTriggerExecutor (reference) + JS NodeExecutorRegistry.#executeTrigger (passthrough metadata) |
| Backend status (contracts) | `implemented` |
| Reference | Laravel `AppointmentBookedTriggerExecutor` (product reference; PHP not in this repository). |

## Limitations / Notes

- Catalog description: Appointment Booked
- Next-step behavior (contracts): action=continue; follow first outgoing edge (parallel fan-out not implemented)
- Frontend alias resolution maps `appointment_booked` → `appointmentBooked`.

---
# Node: appointmentRescheduled

## Basic Information

| Property | Value |
|---|---|
| Node ID | `appointmentRescheduled` |
| Display Name | Appointment Rescheduled |
| Purpose | Triggers the workflow whenever an existing appointment is rescheduled. |
| Category | `triggers` |
| Node Type | `appointmentRescheduled` |
| Frontend Role | trigger |
| Custom Panel | `trigger` |
| Property Panel Component | TriggerProperties (`PANEL_MAP.trigger`) |
| Backend Canonical Type | `appointmentRescheduled` (aliases: `appointment_rescheduled`) |
| Backend Executor | JS NodeExecutorRegistry.#executeTrigger (generic passthrough). Laravel executor not present in this repo. |
| Backend Status | `partial` |

## Fields

| Field | Type | Required | Default | Allowed Values | Variables Supported | Description |
|---|---|---|---|---|---|---|
| `nodeType` | string | Yes | appointmentRescheduled | `appointmentRescheduled` | No | Canonical frontend node type. Set by `createNodeDefaults`. |
| `category` | string | Yes | triggers | `triggers` | No | Catalog category id. |
| `tone` | string | No | success | UI tone token from `toneForCategory` | No | Visual tone for the canvas node. |
| `description` | string | No | Triggers the workflow whenever an existing appointment is rescheduled. | — | No | Human description copied from schema/catalog. |
| `label` | text | Yes | "Appointment Rescheduled" | — | No | Trigger Name. Enter trigger name. Placeholder: Enter trigger name |
| `source` | multiselect | Yes | ["any"] | `any` (Any), `mobile` (Mobile), `website` (Website), `admin` (Admin) | No | Source. Which booking sources should start this workflow. |
| `status` | string | No | "draft" | — | No | Present on node.data via schema defaults / createNodeDefaults (saved with the node). _(Default key not declared as a schema.fields entry)_ |

## Validation

### Graph-level (`validateWorkflowGraph`)
- Workflow must have nodes.
- Exactly one event trigger (`isTrigger` / `triggerKey`, excluding `start`).
- At least one `end` node.
- No cycles unless a `loop` node exists (catalog currently has no loop node).
- All non-start nodes must be connected when more than one node exists.
- Unknown node types are errors.

### Node-specific (`validateTriggerNodeFields`)
- Required schema fields that are visible (`showWhen`) must be non-empty.
- Empty arrays count as empty.
- If a field of type `retry` exists and `repeatReminder` is on: `retryInterval` required; `maxRetryCount` ≥ 1.

## Variable Support

Triggers do not edit message templates in the main schema fields; context is injected at runtime.

UI context card keys (read-only): `{{patient_name}}` / `patient_name`, `{{doctor_name}}` / `doctor_name`, `{{old_date}}` / `old_date`, `{{new_date}}` / `new_date`

Declared laravelContext: `context.patient`, `context.appointment`, `context.doctor`, `context.hospital`

## Full Frontend JSON

Complete saved node object as produced for workflow configuration persistence (`serializeNode` / `configuration.nodes[]`). Shape is `{ id, type, position, data }` — canvas-only React Flow keys such as `dragHandle` / `selected` are **not** part of the saved Laravel payload.

### Complete saved node JSON

```json
{
  "id": "n_appointmentRescheduled_1",
  "type": "workflow",
  "position": {
    "x": 280,
    "y": 160
  },
  "data": {
    "nodeType": "appointmentRescheduled",
    "category": "triggers",
    "tone": "success",
    "description": "Triggers the workflow whenever an existing appointment is rescheduled.",
    "label": "Appointment Rescheduled",
    "status": "draft",
    "source": [
      "any"
    ]
  }
}
```

### `node.data` only

```json
{
  "nodeType": "appointmentRescheduled",
  "category": "triggers",
  "tone": "success",
  "description": "Triggers the workflow whenever an existing appointment is rescheduled.",
  "label": "Appointment Rescheduled",
  "status": "draft",
  "source": [
    "any"
  ]
}
```

## Backend Mapping

| Frontend Node ID | `appointmentRescheduled` |
| Trigger aliases (NodeTypeNormalizer-style, frontend) | `appointment_rescheduled` |
| Canonical backend type (from contracts) | `appointmentRescheduled` (same id; Laravel `NodeTypeNormalizer` **not in this repo**) |
| Executor (from `automation/node-contracts.json`) | JS NodeExecutorRegistry.#executeTrigger (generic passthrough). Laravel executor not present in this repo. |
| Backend status (contracts) | `partial` |

## Limitations / Notes

- Catalog description: Appointment Rescheduled
- Next-step behavior (contracts): action=continue; follow first outgoing edge (parallel fan-out not implemented)
- Frontend schema is complete; Laravel-specific executor for this trigger is not present in this repository (contracts: partial).
- Frontend alias resolution maps `appointment_rescheduled` → `appointmentRescheduled`.

---
# Node: appointmentCompleted

## Basic Information

| Property | Value |
|---|---|
| Node ID | `appointmentCompleted` |
| Display Name | Appointment Completed |
| Purpose | Triggers the workflow whenever an appointment is marked as completed. |
| Category | `triggers` |
| Node Type | `appointmentCompleted` |
| Frontend Role | trigger |
| Custom Panel | `trigger` |
| Property Panel Component | TriggerProperties (`PANEL_MAP.trigger`) |
| Backend Canonical Type | `appointmentCompleted` (aliases: `appointment_completed`) |
| Backend Executor | JS NodeExecutorRegistry.#executeTrigger (generic passthrough). Laravel executor not present in this repo. |
| Backend Status | `partial` |

## Fields

| Field | Type | Required | Default | Allowed Values | Variables Supported | Description |
|---|---|---|---|---|---|---|
| `nodeType` | string | Yes | appointmentCompleted | `appointmentCompleted` | No | Canonical frontend node type. Set by `createNodeDefaults`. |
| `category` | string | Yes | triggers | `triggers` | No | Catalog category id. |
| `tone` | string | No | success | UI tone token from `toneForCategory` | No | Visual tone for the canvas node. |
| `description` | string | No | Triggers the workflow whenever an appointment is marked as completed. | — | No | Human description copied from schema/catalog. |
| `label` | text | Yes | "Appointment Completed" | — | No | Trigger Name. Enter trigger name. Placeholder: Enter trigger name |
| `source` | multiselect | Yes | ["any"] | `any` (Any), `mobile` (Mobile), `website` (Website), `admin` (Admin) | No | Source. Which booking sources should start this workflow. |
| `status` | string | No | "draft" | — | No | Present on node.data via schema defaults / createNodeDefaults (saved with the node). _(Default key not declared as a schema.fields entry)_ |

## Validation

### Graph-level (`validateWorkflowGraph`)
- Workflow must have nodes.
- Exactly one event trigger (`isTrigger` / `triggerKey`, excluding `start`).
- At least one `end` node.
- No cycles unless a `loop` node exists (catalog currently has no loop node).
- All non-start nodes must be connected when more than one node exists.
- Unknown node types are errors.

### Node-specific (`validateTriggerNodeFields`)
- Required schema fields that are visible (`showWhen`) must be non-empty.
- Empty arrays count as empty.
- If a field of type `retry` exists and `repeatReminder` is on: `retryInterval` required; `maxRetryCount` ≥ 1.

## Variable Support

Triggers do not edit message templates in the main schema fields; context is injected at runtime.

UI context card keys (read-only): `{{patient_name}}` / `patient_name`, `{{doctor_name}}` / `doctor_name`, `{{appointment_date}}` / `appointment_date`, `{{appointment_time}}` / `appointment_time`

Declared laravelContext: `context.patient`, `context.appointment`, `context.doctor`, `context.hospital`

## Full Frontend JSON

Complete saved node object as produced for workflow configuration persistence (`serializeNode` / `configuration.nodes[]`). Shape is `{ id, type, position, data }` — canvas-only React Flow keys such as `dragHandle` / `selected` are **not** part of the saved Laravel payload.

### Complete saved node JSON

```json
{
  "id": "n_appointmentCompleted_1",
  "type": "workflow",
  "position": {
    "x": 280,
    "y": 160
  },
  "data": {
    "nodeType": "appointmentCompleted",
    "category": "triggers",
    "tone": "success",
    "description": "Triggers the workflow whenever an appointment is marked as completed.",
    "label": "Appointment Completed",
    "status": "draft",
    "source": [
      "any"
    ]
  }
}
```

### `node.data` only

```json
{
  "nodeType": "appointmentCompleted",
  "category": "triggers",
  "tone": "success",
  "description": "Triggers the workflow whenever an appointment is marked as completed.",
  "label": "Appointment Completed",
  "status": "draft",
  "source": [
    "any"
  ]
}
```

## Backend Mapping

| Frontend Node ID | `appointmentCompleted` |
| Trigger aliases (NodeTypeNormalizer-style, frontend) | `appointment_completed` |
| Canonical backend type (from contracts) | `appointmentCompleted` (same id; Laravel `NodeTypeNormalizer` **not in this repo**) |
| Executor (from `automation/node-contracts.json`) | JS NodeExecutorRegistry.#executeTrigger (generic passthrough). Laravel executor not present in this repo. |
| Backend status (contracts) | `partial` |

## Limitations / Notes

- Catalog description: Appointment Completed
- Next-step behavior (contracts): action=continue; follow first outgoing edge (parallel fan-out not implemented)
- Frontend schema is complete; Laravel-specific executor for this trigger is not present in this repository (contracts: partial).
- Frontend alias resolution maps `appointment_completed` → `appointmentCompleted`.

---
# Node: appointmentCancelled

## Basic Information

| Property | Value |
|---|---|
| Node ID | `appointmentCancelled` |
| Display Name | Appointment Cancelled |
| Purpose | Triggers the workflow whenever an existing appointment is cancelled. |
| Category | `triggers` |
| Node Type | `appointmentCancelled` |
| Frontend Role | trigger |
| Custom Panel | `trigger` |
| Property Panel Component | TriggerProperties (`PANEL_MAP.trigger`) |
| Backend Canonical Type | `appointmentCancelled` (aliases: `appointment_cancelled`) |
| Backend Executor | JS NodeExecutorRegistry.#executeTrigger (generic passthrough). Laravel executor not present in this repo. |
| Backend Status | `partial` |

## Fields

| Field | Type | Required | Default | Allowed Values | Variables Supported | Description |
|---|---|---|---|---|---|---|
| `nodeType` | string | Yes | appointmentCancelled | `appointmentCancelled` | No | Canonical frontend node type. Set by `createNodeDefaults`. |
| `category` | string | Yes | triggers | `triggers` | No | Catalog category id. |
| `tone` | string | No | success | UI tone token from `toneForCategory` | No | Visual tone for the canvas node. |
| `description` | string | No | Triggers the workflow whenever an existing appointment is cancelled. | — | No | Human description copied from schema/catalog. |
| `label` | text | Yes | "Appointment Cancelled" | — | No | Trigger Name. Enter trigger name. Placeholder: Enter trigger name |
| `source` | multiselect | Yes | ["any"] | `any` (Any), `mobile` (Mobile), `website` (Website), `admin` (Admin) | No | Source. Which booking sources should start this workflow. |
| `cancelledBy` | multiselect | Yes | ["any"] | `any` (Any), `patient` (Patient), `doctor` (Doctor), `admin` (Admin) | No | Cancelled By. Who cancelled the appointment. |
| `status` | string | No | "draft" | — | No | Present on node.data via schema defaults / createNodeDefaults (saved with the node). _(Default key not declared as a schema.fields entry)_ |

## Validation

### Graph-level (`validateWorkflowGraph`)
- Workflow must have nodes.
- Exactly one event trigger (`isTrigger` / `triggerKey`, excluding `start`).
- At least one `end` node.
- No cycles unless a `loop` node exists (catalog currently has no loop node).
- All non-start nodes must be connected when more than one node exists.
- Unknown node types are errors.

### Node-specific (`validateTriggerNodeFields`)
- Required schema fields that are visible (`showWhen`) must be non-empty.
- Empty arrays count as empty.
- If a field of type `retry` exists and `repeatReminder` is on: `retryInterval` required; `maxRetryCount` ≥ 1.

## Variable Support

Triggers do not edit message templates in the main schema fields; context is injected at runtime.

UI context card keys (read-only): `{{patient_name}}` / `patient_name`, `{{doctor_name}}` / `doctor_name`, `{{appointment_date}}` / `appointment_date`

Declared laravelContext: `context.patient`, `context.appointment`, `context.doctor`, `context.hospital`

## Full Frontend JSON

Complete saved node object as produced for workflow configuration persistence (`serializeNode` / `configuration.nodes[]`). Shape is `{ id, type, position, data }` — canvas-only React Flow keys such as `dragHandle` / `selected` are **not** part of the saved Laravel payload.

### Complete saved node JSON

```json
{
  "id": "n_appointmentCancelled_1",
  "type": "workflow",
  "position": {
    "x": 280,
    "y": 160
  },
  "data": {
    "nodeType": "appointmentCancelled",
    "category": "triggers",
    "tone": "success",
    "description": "Triggers the workflow whenever an existing appointment is cancelled.",
    "label": "Appointment Cancelled",
    "status": "draft",
    "source": [
      "any"
    ],
    "cancelledBy": [
      "any"
    ]
  }
}
```

### `node.data` only

```json
{
  "nodeType": "appointmentCancelled",
  "category": "triggers",
  "tone": "success",
  "description": "Triggers the workflow whenever an existing appointment is cancelled.",
  "label": "Appointment Cancelled",
  "status": "draft",
  "source": [
    "any"
  ],
  "cancelledBy": [
    "any"
  ]
}
```

## Backend Mapping

| Frontend Node ID | `appointmentCancelled` |
| Trigger aliases (NodeTypeNormalizer-style, frontend) | `appointment_cancelled` |
| Canonical backend type (from contracts) | `appointmentCancelled` (same id; Laravel `NodeTypeNormalizer` **not in this repo**) |
| Executor (from `automation/node-contracts.json`) | JS NodeExecutorRegistry.#executeTrigger (generic passthrough). Laravel executor not present in this repo. |
| Backend status (contracts) | `partial` |

## Limitations / Notes

- Catalog description: Appointment Cancelled
- Next-step behavior (contracts): action=continue; follow first outgoing edge (parallel fan-out not implemented)
- Frontend schema is complete; Laravel-specific executor for this trigger is not present in this repository (contracts: partial).
- Frontend alias resolution maps `appointment_cancelled` → `appointmentCancelled`.

---
# Node: appointmentMissed

## Basic Information

| Property | Value |
|---|---|
| Node ID | `appointmentMissed` |
| Display Name | Appointment Missed |
| Purpose | Triggers the workflow when a scheduled appointment is marked as missed or no-show. |
| Category | `triggers` |
| Node Type | `appointmentMissed` |
| Frontend Role | trigger |
| Custom Panel | `trigger` |
| Property Panel Component | TriggerProperties (`PANEL_MAP.trigger`) |
| Backend Canonical Type | `appointmentMissed` (aliases: `appointment_missed`) |
| Backend Executor | JS NodeExecutorRegistry.#executeTrigger (generic passthrough). Laravel executor not present in this repo. |
| Backend Status | `partial` |

## Fields

| Field | Type | Required | Default | Allowed Values | Variables Supported | Description |
|---|---|---|---|---|---|---|
| `nodeType` | string | Yes | appointmentMissed | `appointmentMissed` | No | Canonical frontend node type. Set by `createNodeDefaults`. |
| `category` | string | Yes | triggers | `triggers` | No | Catalog category id. |
| `tone` | string | No | success | UI tone token from `toneForCategory` | No | Visual tone for the canvas node. |
| `description` | string | No | Triggers the workflow when a scheduled appointment is marked as missed or no-show. | — | No | Human description copied from schema/catalog. |
| `label` | text | Yes | "Appointment Missed" | — | No | Trigger Name. Enter trigger name. Placeholder: Enter trigger name |
| `status` | string | No | "draft" | — | No | Present on node.data via schema defaults / createNodeDefaults (saved with the node). _(Default key not declared as a schema.fields entry)_ |

## Validation

### Graph-level (`validateWorkflowGraph`)
- Workflow must have nodes.
- Exactly one event trigger (`isTrigger` / `triggerKey`, excluding `start`).
- At least one `end` node.
- No cycles unless a `loop` node exists (catalog currently has no loop node).
- All non-start nodes must be connected when more than one node exists.
- Unknown node types are errors.

### Node-specific (`validateTriggerNodeFields`)
- Required schema fields that are visible (`showWhen`) must be non-empty.
- Empty arrays count as empty.
- If a field of type `retry` exists and `repeatReminder` is on: `retryInterval` required; `maxRetryCount` ≥ 1.

## Variable Support

Triggers do not edit message templates in the main schema fields; context is injected at runtime.

UI context card keys (read-only): `{{patient_name}}` / `patient_name`, `{{doctor_name}}` / `doctor_name`, `{{appointment_date}}` / `appointment_date`, `{{appointment_time}}` / `appointment_time`

Declared laravelContext: `context.patient`, `context.appointment`, `context.doctor`, `context.hospital`

## Full Frontend JSON

Complete saved node object as produced for workflow configuration persistence (`serializeNode` / `configuration.nodes[]`). Shape is `{ id, type, position, data }` — canvas-only React Flow keys such as `dragHandle` / `selected` are **not** part of the saved Laravel payload.

### Complete saved node JSON

```json
{
  "id": "n_appointmentMissed_1",
  "type": "workflow",
  "position": {
    "x": 280,
    "y": 160
  },
  "data": {
    "nodeType": "appointmentMissed",
    "category": "triggers",
    "tone": "success",
    "description": "Triggers the workflow when a scheduled appointment is marked as missed or no-show.",
    "label": "Appointment Missed",
    "status": "draft"
  }
}
```

### `node.data` only

```json
{
  "nodeType": "appointmentMissed",
  "category": "triggers",
  "tone": "success",
  "description": "Triggers the workflow when a scheduled appointment is marked as missed or no-show.",
  "label": "Appointment Missed",
  "status": "draft"
}
```

## Backend Mapping

| Frontend Node ID | `appointmentMissed` |
| Trigger aliases (NodeTypeNormalizer-style, frontend) | `appointment_missed` |
| Canonical backend type (from contracts) | `appointmentMissed` (same id; Laravel `NodeTypeNormalizer` **not in this repo**) |
| Executor (from `automation/node-contracts.json`) | JS NodeExecutorRegistry.#executeTrigger (generic passthrough). Laravel executor not present in this repo. |
| Backend status (contracts) | `partial` |

## Limitations / Notes

- Catalog description: Appointment Missed
- Next-step behavior (contracts): action=continue; follow first outgoing edge (parallel fan-out not implemented)
- Frontend schema is complete; Laravel-specific executor for this trigger is not present in this repository (contracts: partial).
- Frontend alias resolution maps `appointment_missed` → `appointmentMissed`.

---
# Node: prescriptionAdded

## Basic Information

| Property | Value |
|---|---|
| Node ID | `prescriptionAdded` |
| Display Name | Prescription Added |
| Purpose | Triggers the workflow whenever a new prescription is added to a patient's medical record. |
| Category | `triggers` |
| Node Type | `prescriptionAdded` |
| Frontend Role | trigger |
| Custom Panel | `trigger` |
| Property Panel Component | TriggerProperties (`PANEL_MAP.trigger`) |
| Backend Canonical Type | `prescriptionAdded` |
| Backend Executor | JS NodeExecutorRegistry.#executeTrigger (generic passthrough). Laravel executor not present in this repo. |
| Backend Status | `partial` |

## Fields

| Field | Type | Required | Default | Allowed Values | Variables Supported | Description |
|---|---|---|---|---|---|---|
| `nodeType` | string | Yes | prescriptionAdded | `prescriptionAdded` | No | Canonical frontend node type. Set by `createNodeDefaults`. |
| `category` | string | Yes | triggers | `triggers` | No | Catalog category id. |
| `tone` | string | No | success | UI tone token from `toneForCategory` | No | Visual tone for the canvas node. |
| `description` | string | No | Triggers the workflow whenever a new prescription is added to a patient's medical record. | — | No | Human description copied from schema/catalog. |
| `label` | text | Yes | "Prescription Added" | — | No | Trigger Name. Enter trigger name. Placeholder: Enter trigger name |
| `source` | multiselect | Yes | ["any"] | `any` (Any), `mobile` (Mobile), `website` (Website), `admin` (Admin) | No | Source |
| `status` | string | No | "draft" | — | No | Present on node.data via schema defaults / createNodeDefaults (saved with the node). _(Default key not declared as a schema.fields entry)_ |

## Validation

### Graph-level (`validateWorkflowGraph`)
- Workflow must have nodes.
- Exactly one event trigger (`isTrigger` / `triggerKey`, excluding `start`).
- At least one `end` node.
- No cycles unless a `loop` node exists (catalog currently has no loop node).
- All non-start nodes must be connected when more than one node exists.
- Unknown node types are errors.

### Node-specific (`validateTriggerNodeFields`)
- Required schema fields that are visible (`showWhen`) must be non-empty.
- Empty arrays count as empty.
- If a field of type `retry` exists and `repeatReminder` is on: `retryInterval` required; `maxRetryCount` ≥ 1.

## Variable Support

Triggers do not edit message templates in the main schema fields; context is injected at runtime.

UI context card keys (read-only): `{{patient_name}}` / `patient_name`, `{{doctor_name}}` / `doctor_name`, `{{medicine_name}}` / `medicine_name`

Declared laravelContext: `context.patient`, `context.prescription`, `context.doctor`, `context.hospital`

## Full Frontend JSON

Complete saved node object as produced for workflow configuration persistence (`serializeNode` / `configuration.nodes[]`). Shape is `{ id, type, position, data }` — canvas-only React Flow keys such as `dragHandle` / `selected` are **not** part of the saved Laravel payload.

### Complete saved node JSON

```json
{
  "id": "n_prescriptionAdded_1",
  "type": "workflow",
  "position": {
    "x": 280,
    "y": 160
  },
  "data": {
    "nodeType": "prescriptionAdded",
    "category": "triggers",
    "tone": "success",
    "description": "Triggers the workflow whenever a new prescription is added to a patient's medical record.",
    "label": "Prescription Added",
    "status": "draft",
    "source": [
      "any"
    ]
  }
}
```

### `node.data` only

```json
{
  "nodeType": "prescriptionAdded",
  "category": "triggers",
  "tone": "success",
  "description": "Triggers the workflow whenever a new prescription is added to a patient's medical record.",
  "label": "Prescription Added",
  "status": "draft",
  "source": [
    "any"
  ]
}
```

## Backend Mapping

| Frontend Node ID | `prescriptionAdded` |
| Trigger aliases (NodeTypeNormalizer-style, frontend) | _None in frontend `TRIGGER_TYPE_ALIASES`_ |
| Canonical backend type (from contracts) | `prescriptionAdded` (same id; Laravel `NodeTypeNormalizer` **not in this repo**) |
| Executor (from `automation/node-contracts.json`) | JS NodeExecutorRegistry.#executeTrigger (generic passthrough). Laravel executor not present in this repo. |
| Backend status (contracts) | `partial` |

## Limitations / Notes

- Catalog description: Prescription Added
- Next-step behavior (contracts): action=continue; follow first outgoing edge (parallel fan-out not implemented)
- Frontend schema is complete; Laravel-specific executor for this trigger is not present in this repository (contracts: partial).

---
# Node: medicineReminder

## Basic Information

| Property | Value |
|---|---|
| Node ID | `medicineReminder` |
| Display Name | Medicine Reminder Due |
| Purpose | Triggers the workflow when a scheduled medicine reminder becomes due. |
| Category | `triggers` |
| Node Type | `medicineReminder` |
| Frontend Role | trigger |
| Custom Panel | `trigger` |
| Property Panel Component | TriggerProperties (`PANEL_MAP.trigger`) |
| Backend Canonical Type | `medicineReminder` |
| Backend Executor | JS NodeExecutorRegistry.#executeTrigger (generic passthrough). Laravel executor not present in this repo. |
| Backend Status | `partial` |

## Fields

| Field | Type | Required | Default | Allowed Values | Variables Supported | Description |
|---|---|---|---|---|---|---|
| `nodeType` | string | Yes | medicineReminder | `medicineReminder` | No | Canonical frontend node type. Set by `createNodeDefaults`. |
| `category` | string | Yes | triggers | `triggers` | No | Catalog category id. |
| `tone` | string | No | success | UI tone token from `toneForCategory` | No | Visual tone for the canvas node. |
| `description` | string | No | Triggers the workflow when a scheduled medicine reminder becomes due. | — | No | Human description copied from schema/catalog. |
| `label` | text | Yes | "Medicine Reminder Due" | — | No | Trigger Name. Enter trigger name. Placeholder: Enter trigger name |
| `reminderTiming` | select | Yes | "at_due" | `at_due` (At Due Time), `before_due` (Before Due Time) | No | Reminder Timing |
| `minutesBefore` | number | Yes | 30 | — | No | Minutes Before. Enter number of minutes before the reminder. Visible when: {"reminderTiming":"before_due"}. min=1. max=1440 |
| `status` | string | No | "draft" | — | No | Present on node.data via schema defaults / createNodeDefaults (saved with the node). _(Default key not declared as a schema.fields entry)_ |

## Validation

### Graph-level (`validateWorkflowGraph`)
- Workflow must have nodes.
- Exactly one event trigger (`isTrigger` / `triggerKey`, excluding `start`).
- At least one `end` node.
- No cycles unless a `loop` node exists (catalog currently has no loop node).
- All non-start nodes must be connected when more than one node exists.
- Unknown node types are errors.

### Node-specific (`validateTriggerNodeFields`)
- Required schema fields that are visible (`showWhen`) must be non-empty.
- Empty arrays count as empty.
- If a field of type `retry` exists and `repeatReminder` is on: `retryInterval` required; `maxRetryCount` ≥ 1.

## Variable Support

Triggers do not edit message templates in the main schema fields; context is injected at runtime.

UI context card keys (read-only): `{{medicine_name}}` / `medicine_name`, `{{dosage}}` / `dosage`, `{{frequency}}` / `frequency`, `{{doctor_name}}` / `doctor_name`, `{{patient_name}}` / `patient_name`

Declared laravelContext: `context.patient`, `context.prescription`, `context.medicines`, `context.doctor`, `context.hospital`

## Full Frontend JSON

Complete saved node object as produced for workflow configuration persistence (`serializeNode` / `configuration.nodes[]`). Shape is `{ id, type, position, data }` — canvas-only React Flow keys such as `dragHandle` / `selected` are **not** part of the saved Laravel payload.

### Complete saved node JSON

```json
{
  "id": "n_medicineReminder_1",
  "type": "workflow",
  "position": {
    "x": 280,
    "y": 160
  },
  "data": {
    "nodeType": "medicineReminder",
    "category": "triggers",
    "tone": "success",
    "description": "Triggers the workflow when a scheduled medicine reminder becomes due.",
    "label": "Medicine Reminder Due",
    "status": "draft",
    "reminderTiming": "at_due",
    "minutesBefore": 30
  }
}
```

### `node.data` only

```json
{
  "nodeType": "medicineReminder",
  "category": "triggers",
  "tone": "success",
  "description": "Triggers the workflow when a scheduled medicine reminder becomes due.",
  "label": "Medicine Reminder Due",
  "status": "draft",
  "reminderTiming": "at_due",
  "minutesBefore": 30
}
```

## Backend Mapping

| Frontend Node ID | `medicineReminder` |
| Trigger aliases (NodeTypeNormalizer-style, frontend) | _None in frontend `TRIGGER_TYPE_ALIASES`_ |
| Canonical backend type (from contracts) | `medicineReminder` (same id; Laravel `NodeTypeNormalizer` **not in this repo**) |
| Executor (from `automation/node-contracts.json`) | JS NodeExecutorRegistry.#executeTrigger (generic passthrough). Laravel executor not present in this repo. |
| Backend status (contracts) | `partial` |

## Limitations / Notes

- Catalog description: Medicine Reminder Due
- Next-step behavior (contracts): action=continue; follow first outgoing edge (parallel fan-out not implemented)
- Frontend schema is complete; Laravel-specific executor for this trigger is not present in this repository (contracts: partial).

---
# Node: labTestOrdered

## Basic Information

| Property | Value |
|---|---|
| Node ID | `labTestOrdered` |
| Display Name | Lab Test Ordered |
| Purpose | Triggers the workflow whenever a new laboratory test is ordered for a patient. |
| Category | `triggers` |
| Node Type | `labTestOrdered` |
| Frontend Role | trigger |
| Custom Panel | `trigger` |
| Property Panel Component | TriggerProperties (`PANEL_MAP.trigger`) |
| Backend Canonical Type | `labTestOrdered` |
| Backend Executor | JS NodeExecutorRegistry.#executeTrigger (generic passthrough). Laravel executor not present in this repo. |
| Backend Status | `partial` |

## Fields

| Field | Type | Required | Default | Allowed Values | Variables Supported | Description |
|---|---|---|---|---|---|---|
| `nodeType` | string | Yes | labTestOrdered | `labTestOrdered` | No | Canonical frontend node type. Set by `createNodeDefaults`. |
| `category` | string | Yes | triggers | `triggers` | No | Catalog category id. |
| `tone` | string | No | success | UI tone token from `toneForCategory` | No | Visual tone for the canvas node. |
| `description` | string | No | Triggers the workflow whenever a new laboratory test is ordered for a patient. | — | No | Human description copied from schema/catalog. |
| `label` | text | Yes | "Lab Test Ordered" | — | No | Trigger Name. Enter trigger name. Placeholder: Enter trigger name |
| `source` | multiselect | Yes | ["any"] | `any` (Any), `mobile` (Mobile), `website` (Website), `admin` (Admin) | No | Source |
| `status` | string | No | "draft" | — | No | Present on node.data via schema defaults / createNodeDefaults (saved with the node). _(Default key not declared as a schema.fields entry)_ |

## Validation

### Graph-level (`validateWorkflowGraph`)
- Workflow must have nodes.
- Exactly one event trigger (`isTrigger` / `triggerKey`, excluding `start`).
- At least one `end` node.
- No cycles unless a `loop` node exists (catalog currently has no loop node).
- All non-start nodes must be connected when more than one node exists.
- Unknown node types are errors.

### Node-specific (`validateTriggerNodeFields`)
- Required schema fields that are visible (`showWhen`) must be non-empty.
- Empty arrays count as empty.
- If a field of type `retry` exists and `repeatReminder` is on: `retryInterval` required; `maxRetryCount` ≥ 1.

## Variable Support

No variable picker on this node’s property panel.

## Full Frontend JSON

Complete saved node object as produced for workflow configuration persistence (`serializeNode` / `configuration.nodes[]`). Shape is `{ id, type, position, data }` — canvas-only React Flow keys such as `dragHandle` / `selected` are **not** part of the saved Laravel payload.

### Complete saved node JSON

```json
{
  "id": "n_labTestOrdered_1",
  "type": "workflow",
  "position": {
    "x": 280,
    "y": 160
  },
  "data": {
    "nodeType": "labTestOrdered",
    "category": "triggers",
    "tone": "success",
    "description": "Triggers the workflow whenever a new laboratory test is ordered for a patient.",
    "label": "Lab Test Ordered",
    "status": "draft",
    "source": [
      "any"
    ]
  }
}
```

### `node.data` only

```json
{
  "nodeType": "labTestOrdered",
  "category": "triggers",
  "tone": "success",
  "description": "Triggers the workflow whenever a new laboratory test is ordered for a patient.",
  "label": "Lab Test Ordered",
  "status": "draft",
  "source": [
    "any"
  ]
}
```

## Backend Mapping

| Frontend Node ID | `labTestOrdered` |
| Trigger aliases (NodeTypeNormalizer-style, frontend) | _None in frontend `TRIGGER_TYPE_ALIASES`_ |
| Canonical backend type (from contracts) | `labTestOrdered` (same id; Laravel `NodeTypeNormalizer` **not in this repo**) |
| Executor (from `automation/node-contracts.json`) | JS NodeExecutorRegistry.#executeTrigger (generic passthrough). Laravel executor not present in this repo. |
| Backend status (contracts) | `partial` |

## Limitations / Notes

- Catalog description: Lab Test Ordered
- Next-step behavior (contracts): action=continue; follow first outgoing edge (parallel fan-out not implemented)
- Frontend schema is complete; Laravel-specific executor for this trigger is not present in this repository (contracts: partial).

---
# Node: labReportNotification

## Basic Information

| Property | Value |
|---|---|
| Node ID | `labReportNotification` |
| Display Name | Lab Report Ready |
| Purpose | Triggers the workflow when a patient's laboratory report becomes available. |
| Category | `triggers` |
| Node Type | `labReportNotification` |
| Frontend Role | trigger |
| Custom Panel | `trigger` |
| Property Panel Component | TriggerProperties (`PANEL_MAP.trigger`) |
| Backend Canonical Type | `labReportNotification` |
| Backend Executor | JS NodeExecutorRegistry.#executeTrigger (generic passthrough). Laravel executor not present in this repo. |
| Backend Status | `partial` |

## Fields

| Field | Type | Required | Default | Allowed Values | Variables Supported | Description |
|---|---|---|---|---|---|---|
| `nodeType` | string | Yes | labReportNotification | `labReportNotification` | No | Canonical frontend node type. Set by `createNodeDefaults`. |
| `category` | string | Yes | triggers | `triggers` | No | Catalog category id. |
| `tone` | string | No | success | UI tone token from `toneForCategory` | No | Visual tone for the canvas node. |
| `description` | string | No | Triggers the workflow when a patient's laboratory report becomes available. | — | No | Human description copied from schema/catalog. |
| `label` | text | Yes | "Lab Report Ready" | — | No | Trigger Name. Enter trigger name. Placeholder: Enter trigger name |
| `status` | string | No | "draft" | — | No | Present on node.data via schema defaults / createNodeDefaults (saved with the node). _(Default key not declared as a schema.fields entry)_ |

## Validation

### Graph-level (`validateWorkflowGraph`)
- Workflow must have nodes.
- Exactly one event trigger (`isTrigger` / `triggerKey`, excluding `start`).
- At least one `end` node.
- No cycles unless a `loop` node exists (catalog currently has no loop node).
- All non-start nodes must be connected when more than one node exists.
- Unknown node types are errors.

### Node-specific (`validateTriggerNodeFields`)
- Required schema fields that are visible (`showWhen`) must be non-empty.
- Empty arrays count as empty.
- If a field of type `retry` exists and `repeatReminder` is on: `retryInterval` required; `maxRetryCount` ≥ 1.

## Variable Support

Triggers do not edit message templates in the main schema fields; context is injected at runtime.

UI context card keys (read-only): `{{patient_name}}` / `patient_name`, `{{report_name}}` / `report_name`, `{{report_status}}` / `report_status`

Declared laravelContext: `context.patient`, `context.lab`, `context.hospital`

## Full Frontend JSON

Complete saved node object as produced for workflow configuration persistence (`serializeNode` / `configuration.nodes[]`). Shape is `{ id, type, position, data }` — canvas-only React Flow keys such as `dragHandle` / `selected` are **not** part of the saved Laravel payload.

### Complete saved node JSON

```json
{
  "id": "n_labReportNotification_1",
  "type": "workflow",
  "position": {
    "x": 280,
    "y": 160
  },
  "data": {
    "nodeType": "labReportNotification",
    "category": "triggers",
    "tone": "success",
    "description": "Triggers the workflow when a patient's laboratory report becomes available.",
    "label": "Lab Report Ready",
    "status": "draft"
  }
}
```

### `node.data` only

```json
{
  "nodeType": "labReportNotification",
  "category": "triggers",
  "tone": "success",
  "description": "Triggers the workflow when a patient's laboratory report becomes available.",
  "label": "Lab Report Ready",
  "status": "draft"
}
```

## Backend Mapping

| Frontend Node ID | `labReportNotification` |
| Trigger aliases (NodeTypeNormalizer-style, frontend) | _None in frontend `TRIGGER_TYPE_ALIASES`_ |
| Canonical backend type (from contracts) | `labReportNotification` (same id; Laravel `NodeTypeNormalizer` **not in this repo**) |
| Executor (from `automation/node-contracts.json`) | JS NodeExecutorRegistry.#executeTrigger (generic passthrough). Laravel executor not present in this repo. |
| Backend status (contracts) | `partial` |

## Limitations / Notes

- Catalog description: Lab Report Ready
- Next-step behavior (contracts): action=continue; follow first outgoing edge (parallel fan-out not implemented)
- Frontend schema is complete; Laravel-specific executor for this trigger is not present in this repository (contracts: partial).

---
# Node: pharmacyRefillDue

## Basic Information

| Property | Value |
|---|---|
| Node ID | `pharmacyRefillDue` |
| Display Name | Pharmacy Refill Due |
| Purpose | Triggers the workflow when a patient's medicine refill is due or approaching its due date. |
| Category | `triggers` |
| Node Type | `pharmacyRefillDue` |
| Frontend Role | trigger |
| Custom Panel | `trigger` |
| Property Panel Component | TriggerProperties (`PANEL_MAP.trigger`) |
| Backend Canonical Type | `pharmacyRefillDue` |
| Backend Executor | JS NodeExecutorRegistry.#executeTrigger (generic passthrough). Laravel executor not present in this repo. |
| Backend Status | `partial` |

## Fields

| Field | Type | Required | Default | Allowed Values | Variables Supported | Description |
|---|---|---|---|---|---|---|
| `nodeType` | string | Yes | pharmacyRefillDue | `pharmacyRefillDue` | No | Canonical frontend node type. Set by `createNodeDefaults`. |
| `category` | string | Yes | triggers | `triggers` | No | Catalog category id. |
| `tone` | string | No | success | UI tone token from `toneForCategory` | No | Visual tone for the canvas node. |
| `description` | string | No | Triggers the workflow when a patient's medicine refill is due or approaching its due date. | — | No | Human description copied from schema/catalog. |
| `label` | text | Yes | "Pharmacy Refill Due" | — | No | Trigger Name. Enter trigger name. Placeholder: Enter trigger name |
| `daysBeforeRefill` | number | Yes | 3 | — | No | Days Before Refill. Enter number of days before refill date. min=0. max=365 |
| `status` | string | No | "draft" | — | No | Present on node.data via schema defaults / createNodeDefaults (saved with the node). _(Default key not declared as a schema.fields entry)_ |

## Validation

### Graph-level (`validateWorkflowGraph`)
- Workflow must have nodes.
- Exactly one event trigger (`isTrigger` / `triggerKey`, excluding `start`).
- At least one `end` node.
- No cycles unless a `loop` node exists (catalog currently has no loop node).
- All non-start nodes must be connected when more than one node exists.
- Unknown node types are errors.

### Node-specific (`validateTriggerNodeFields`)
- Required schema fields that are visible (`showWhen`) must be non-empty.
- Empty arrays count as empty.
- If a field of type `retry` exists and `repeatReminder` is on: `retryInterval` required; `maxRetryCount` ≥ 1.

## Variable Support

No variable picker on this node’s property panel.

## Full Frontend JSON

Complete saved node object as produced for workflow configuration persistence (`serializeNode` / `configuration.nodes[]`). Shape is `{ id, type, position, data }` — canvas-only React Flow keys such as `dragHandle` / `selected` are **not** part of the saved Laravel payload.

### Complete saved node JSON

```json
{
  "id": "n_pharmacyRefillDue_1",
  "type": "workflow",
  "position": {
    "x": 280,
    "y": 160
  },
  "data": {
    "nodeType": "pharmacyRefillDue",
    "category": "triggers",
    "tone": "success",
    "description": "Triggers the workflow when a patient's medicine refill is due or approaching its due date.",
    "label": "Pharmacy Refill Due",
    "status": "draft",
    "daysBeforeRefill": 3
  }
}
```

### `node.data` only

```json
{
  "nodeType": "pharmacyRefillDue",
  "category": "triggers",
  "tone": "success",
  "description": "Triggers the workflow when a patient's medicine refill is due or approaching its due date.",
  "label": "Pharmacy Refill Due",
  "status": "draft",
  "daysBeforeRefill": 3
}
```

## Backend Mapping

| Frontend Node ID | `pharmacyRefillDue` |
| Trigger aliases (NodeTypeNormalizer-style, frontend) | _None in frontend `TRIGGER_TYPE_ALIASES`_ |
| Canonical backend type (from contracts) | `pharmacyRefillDue` (same id; Laravel `NodeTypeNormalizer` **not in this repo**) |
| Executor (from `automation/node-contracts.json`) | JS NodeExecutorRegistry.#executeTrigger (generic passthrough). Laravel executor not present in this repo. |
| Backend status (contracts) | `partial` |

## Limitations / Notes

- Catalog description: Pharmacy Refill Due
- Next-step behavior (contracts): action=continue; follow first outgoing edge (parallel fan-out not implemented)
- Frontend schema is complete; Laravel-specific executor for this trigger is not present in this repository (contracts: partial).

---
# Node: appointmentReminder

## Basic Information

| Property | Value |
|---|---|
| Node ID | `appointmentReminder` |
| Display Name | Appointment Reminder |
| Purpose | Triggers the workflow relative to a scheduled appointment time. |
| Category | `triggers` |
| Node Type | `appointmentReminder` |
| Frontend Role | trigger |
| Custom Panel | `trigger` |
| Property Panel Component | TriggerProperties (`PANEL_MAP.trigger`) |
| Backend Canonical Type | `appointmentReminder` (aliases: `appointment_reminder`) |
| Backend Executor | JS NodeExecutorRegistry.#executeTrigger (generic passthrough). Laravel executor not present in this repo. |
| Backend Status | `partial` |

## Fields

| Field | Type | Required | Default | Allowed Values | Variables Supported | Description |
|---|---|---|---|---|---|---|
| `nodeType` | string | Yes | appointmentReminder | `appointmentReminder` | No | Canonical frontend node type. Set by `createNodeDefaults`. |
| `category` | string | Yes | triggers | `triggers` | No | Catalog category id. |
| `tone` | string | No | success | UI tone token from `toneForCategory` | No | Visual tone for the canvas node. |
| `description` | string | No | Triggers the workflow relative to a scheduled appointment time. | — | No | Human description copied from schema/catalog. |
| `label` | text | Yes | "Appointment Reminder" | — | No | Trigger Name. Enter trigger name. Placeholder: Enter trigger name |
| `triggerTiming` | select | Yes | "before_24h" | `before_24h` (24 Hours Before), `before_12h` (12 Hours Before), `before_6h` (6 Hours Before), `before_1h` (1 Hour Before), `at_time` (At Appointment Time) | No | Trigger Timing. When relative to the appointment this workflow should start. |
| `status` | string | No | "draft" | — | No | Present on node.data via schema defaults / createNodeDefaults (saved with the node). _(Default key not declared as a schema.fields entry)_ |

## Validation

### Graph-level (`validateWorkflowGraph`)
- Workflow must have nodes.
- Exactly one event trigger (`isTrigger` / `triggerKey`, excluding `start`).
- At least one `end` node.
- No cycles unless a `loop` node exists (catalog currently has no loop node).
- All non-start nodes must be connected when more than one node exists.
- Unknown node types are errors.

### Node-specific (`validateTriggerNodeFields`)
- Required schema fields that are visible (`showWhen`) must be non-empty.
- Empty arrays count as empty.
- If a field of type `retry` exists and `repeatReminder` is on: `retryInterval` required; `maxRetryCount` ≥ 1.

## Variable Support

Triggers do not edit message templates in the main schema fields; context is injected at runtime.

UI context card keys (read-only): `{{patient_name}}` / `patient_name`, `{{doctor_name}}` / `doctor_name`, `{{appointment_date}}` / `appointment_date`, `{{appointment_time}}` / `appointment_time`

Declared laravelContext: `context.patient`, `context.appointment`, `context.doctor`, `context.hospital`

## Full Frontend JSON

Complete saved node object as produced for workflow configuration persistence (`serializeNode` / `configuration.nodes[]`). Shape is `{ id, type, position, data }` — canvas-only React Flow keys such as `dragHandle` / `selected` are **not** part of the saved Laravel payload.

### Complete saved node JSON

```json
{
  "id": "n_appointmentReminder_1",
  "type": "workflow",
  "position": {
    "x": 280,
    "y": 160
  },
  "data": {
    "nodeType": "appointmentReminder",
    "category": "triggers",
    "tone": "success",
    "description": "Triggers the workflow relative to a scheduled appointment time.",
    "label": "Appointment Reminder",
    "status": "draft",
    "triggerTiming": "before_24h"
  }
}
```

### `node.data` only

```json
{
  "nodeType": "appointmentReminder",
  "category": "triggers",
  "tone": "success",
  "description": "Triggers the workflow relative to a scheduled appointment time.",
  "label": "Appointment Reminder",
  "status": "draft",
  "triggerTiming": "before_24h"
}
```

## Backend Mapping

| Frontend Node ID | `appointmentReminder` |
| Trigger aliases (NodeTypeNormalizer-style, frontend) | `appointment_reminder` |
| Canonical backend type (from contracts) | `appointmentReminder` (same id; Laravel `NodeTypeNormalizer` **not in this repo**) |
| Executor (from `automation/node-contracts.json`) | JS NodeExecutorRegistry.#executeTrigger (generic passthrough). Laravel executor not present in this repo. |
| Backend status (contracts) | `partial` |

## Limitations / Notes

- Catalog description: Appointment Reminder
- Next-step behavior (contracts): action=continue; follow first outgoing edge (parallel fan-out not implemented)
- Frontend schema is complete; Laravel-specific executor for this trigger is not present in this repository (contracts: partial).
- Frontend alias resolution maps `appointment_reminder` → `appointmentReminder`.

---
# Node: birthday

## Basic Information

| Property | Value |
|---|---|
| Node ID | `birthday` |
| Display Name | Birthday |
| Purpose | Triggers the workflow based on a patient's birthday. |
| Category | `triggers` |
| Node Type | `birthday` |
| Frontend Role | trigger |
| Custom Panel | `trigger` |
| Property Panel Component | TriggerProperties (`PANEL_MAP.trigger`) |
| Backend Canonical Type | `birthday` |
| Backend Executor | JS NodeExecutorRegistry.#executeTrigger (generic passthrough). Laravel executor not present in this repo. |
| Backend Status | `partial` |

## Fields

| Field | Type | Required | Default | Allowed Values | Variables Supported | Description |
|---|---|---|---|---|---|---|
| `nodeType` | string | Yes | birthday | `birthday` | No | Canonical frontend node type. Set by `createNodeDefaults`. |
| `category` | string | Yes | triggers | `triggers` | No | Catalog category id. |
| `tone` | string | No | success | UI tone token from `toneForCategory` | No | Visual tone for the canvas node. |
| `description` | string | No | Triggers the workflow based on a patient's birthday. | — | No | Human description copied from schema/catalog. |
| `label` | text | Yes | "Birthday" | — | No | Trigger Name. Enter trigger name. Placeholder: Enter trigger name |
| `triggerTiming` | select | Yes | "on_birthday" | `on_birthday` (On Birthday), `before_birthday` (Before Birthday) | No | Trigger Timing |
| `daysBefore` | number | Yes | 1 | — | No | Days Before. Enter number of days before birthday. Visible when: {"triggerTiming":"before_birthday"}. min=1. max=365 |
| `executionTime` | time | Yes | "09:00" | — | No | Execution Time. Select execution time |
| `status` | string | No | "draft" | — | No | Present on node.data via schema defaults / createNodeDefaults (saved with the node). _(Default key not declared as a schema.fields entry)_ |

## Validation

### Graph-level (`validateWorkflowGraph`)
- Workflow must have nodes.
- Exactly one event trigger (`isTrigger` / `triggerKey`, excluding `start`).
- At least one `end` node.
- No cycles unless a `loop` node exists (catalog currently has no loop node).
- All non-start nodes must be connected when more than one node exists.
- Unknown node types are errors.

### Node-specific (`validateTriggerNodeFields`)
- Required schema fields that are visible (`showWhen`) must be non-empty.
- Empty arrays count as empty.
- If a field of type `retry` exists and `repeatReminder` is on: `retryInterval` required; `maxRetryCount` ≥ 1.

## Variable Support

No variable picker on this node’s property panel.

## Full Frontend JSON

Complete saved node object as produced for workflow configuration persistence (`serializeNode` / `configuration.nodes[]`). Shape is `{ id, type, position, data }` — canvas-only React Flow keys such as `dragHandle` / `selected` are **not** part of the saved Laravel payload.

### Complete saved node JSON

```json
{
  "id": "n_birthday_1",
  "type": "workflow",
  "position": {
    "x": 280,
    "y": 160
  },
  "data": {
    "nodeType": "birthday",
    "category": "triggers",
    "tone": "success",
    "description": "Triggers the workflow based on a patient's birthday.",
    "label": "Birthday",
    "status": "draft",
    "triggerTiming": "on_birthday",
    "daysBefore": 1,
    "executionTime": "09:00"
  }
}
```

### `node.data` only

```json
{
  "nodeType": "birthday",
  "category": "triggers",
  "tone": "success",
  "description": "Triggers the workflow based on a patient's birthday.",
  "label": "Birthday",
  "status": "draft",
  "triggerTiming": "on_birthday",
  "daysBefore": 1,
  "executionTime": "09:00"
}
```

## Backend Mapping

| Frontend Node ID | `birthday` |
| Trigger aliases (NodeTypeNormalizer-style, frontend) | _None in frontend `TRIGGER_TYPE_ALIASES`_ |
| Canonical backend type (from contracts) | `birthday` (same id; Laravel `NodeTypeNormalizer` **not in this repo**) |
| Executor (from `automation/node-contracts.json`) | JS NodeExecutorRegistry.#executeTrigger (generic passthrough). Laravel executor not present in this repo. |
| Backend status (contracts) | `partial` |

## Limitations / Notes

- Catalog description: Birthday
- Next-step behavior (contracts): action=continue; follow first outgoing edge (parallel fan-out not implemented)
- Frontend schema is complete; Laravel-specific executor for this trigger is not present in this repository (contracts: partial).

---
# Node: anniversary

## Basic Information

| Property | Value |
|---|---|
| Node ID | `anniversary` |
| Display Name | Anniversary |
| Purpose | Triggers the workflow based on a configured anniversary date associated with the patient. |
| Category | `triggers` |
| Node Type | `anniversary` |
| Frontend Role | trigger |
| Custom Panel | `trigger` |
| Property Panel Component | TriggerProperties (`PANEL_MAP.trigger`) |
| Backend Canonical Type | `anniversary` |
| Backend Executor | JS NodeExecutorRegistry.#executeTrigger (generic passthrough). Laravel executor not present in this repo. |
| Backend Status | `partial` |

## Fields

| Field | Type | Required | Default | Allowed Values | Variables Supported | Description |
|---|---|---|---|---|---|---|
| `nodeType` | string | Yes | anniversary | `anniversary` | No | Canonical frontend node type. Set by `createNodeDefaults`. |
| `category` | string | Yes | triggers | `triggers` | No | Catalog category id. |
| `tone` | string | No | success | UI tone token from `toneForCategory` | No | Visual tone for the canvas node. |
| `description` | string | No | Triggers the workflow based on a configured anniversary date associated with the patient. | — | No | Human description copied from schema/catalog. |
| `label` | text | Yes | "Anniversary" | — | No | Trigger Name. Enter trigger name. Placeholder: Enter trigger name |
| `anniversaryType` | select | Yes | "registration" | `wedding` (Wedding), `registration` (Registration), `membership` (Membership), `custom` (Custom) | No | Anniversary Type |
| `triggerTiming` | select | Yes | "on_date" | `on_date` (On Date), `before_date` (Before Date) | No | Trigger Timing |
| `daysBefore` | number | Yes | 1 | — | No | Days Before. Enter number of days. Visible when: {"triggerTiming":"before_date"}. min=1. max=365 |
| `executionTime` | time | Yes | "09:00" | — | No | Execution Time. Select execution time |
| `status` | string | No | "draft" | — | No | Present on node.data via schema defaults / createNodeDefaults (saved with the node). _(Default key not declared as a schema.fields entry)_ |

## Validation

### Graph-level (`validateWorkflowGraph`)
- Workflow must have nodes.
- Exactly one event trigger (`isTrigger` / `triggerKey`, excluding `start`).
- At least one `end` node.
- No cycles unless a `loop` node exists (catalog currently has no loop node).
- All non-start nodes must be connected when more than one node exists.
- Unknown node types are errors.

### Node-specific (`validateTriggerNodeFields`)
- Required schema fields that are visible (`showWhen`) must be non-empty.
- Empty arrays count as empty.
- If a field of type `retry` exists and `repeatReminder` is on: `retryInterval` required; `maxRetryCount` ≥ 1.

## Variable Support

No variable picker on this node’s property panel.

## Full Frontend JSON

Complete saved node object as produced for workflow configuration persistence (`serializeNode` / `configuration.nodes[]`). Shape is `{ id, type, position, data }` — canvas-only React Flow keys such as `dragHandle` / `selected` are **not** part of the saved Laravel payload.

### Complete saved node JSON

```json
{
  "id": "n_anniversary_1",
  "type": "workflow",
  "position": {
    "x": 280,
    "y": 160
  },
  "data": {
    "nodeType": "anniversary",
    "category": "triggers",
    "tone": "success",
    "description": "Triggers the workflow based on a configured anniversary date associated with the patient.",
    "label": "Anniversary",
    "status": "draft",
    "anniversaryType": "registration",
    "triggerTiming": "on_date",
    "daysBefore": 1,
    "executionTime": "09:00"
  }
}
```

### `node.data` only

```json
{
  "nodeType": "anniversary",
  "category": "triggers",
  "tone": "success",
  "description": "Triggers the workflow based on a configured anniversary date associated with the patient.",
  "label": "Anniversary",
  "status": "draft",
  "anniversaryType": "registration",
  "triggerTiming": "on_date",
  "daysBefore": 1,
  "executionTime": "09:00"
}
```

## Backend Mapping

| Frontend Node ID | `anniversary` |
| Trigger aliases (NodeTypeNormalizer-style, frontend) | _None in frontend `TRIGGER_TYPE_ALIASES`_ |
| Canonical backend type (from contracts) | `anniversary` (same id; Laravel `NodeTypeNormalizer` **not in this repo**) |
| Executor (from `automation/node-contracts.json`) | JS NodeExecutorRegistry.#executeTrigger (generic passthrough). Laravel executor not present in this repo. |
| Backend status (contracts) | `partial` |

## Limitations / Notes

- Catalog description: Anniversary
- Next-step behavior (contracts): action=continue; follow first outgoing edge (parallel fan-out not implemented)
- Frontend schema is complete; Laravel-specific executor for this trigger is not present in this repository (contracts: partial).

---
# Node: membershipExpiry

## Basic Information

| Property | Value |
|---|---|
| Node ID | `membershipExpiry` |
| Display Name | Hospital Membership Expiry |
| Purpose | Triggers the workflow when a patient's hospital membership is approaching expiry, expires, or has expired. |
| Category | `triggers` |
| Node Type | `membershipExpiry` |
| Frontend Role | trigger |
| Custom Panel | `trigger` |
| Property Panel Component | TriggerProperties (`PANEL_MAP.trigger`) |
| Backend Canonical Type | `membershipExpiry` |
| Backend Executor | JS NodeExecutorRegistry.#executeTrigger (generic passthrough). Laravel executor not present in this repo. |
| Backend Status | `partial` |

## Fields

| Field | Type | Required | Default | Allowed Values | Variables Supported | Description |
|---|---|---|---|---|---|---|
| `nodeType` | string | Yes | membershipExpiry | `membershipExpiry` | No | Canonical frontend node type. Set by `createNodeDefaults`. |
| `category` | string | Yes | triggers | `triggers` | No | Catalog category id. |
| `tone` | string | No | success | UI tone token from `toneForCategory` | No | Visual tone for the canvas node. |
| `description` | string | No | Triggers the workflow when a patient's hospital membership is approaching expiry, expires, or has expired. | — | No | Human description copied from schema/catalog. |
| `label` | text | Yes | "Hospital Membership Expiry" | — | No | Trigger Name. Enter trigger name. Placeholder: Enter trigger name |
| `triggerTiming` | select | Yes | "before_expiry" | `before_expiry` (Before Expiry), `on_expiry` (On Expiry), `after_expiry` (After Expiry) | No | Trigger Timing |
| `numberOfDays` | number | Yes | 7 | — | No | Number of Days. Enter number of days. Visible when: {"triggerTiming":["before_expiry","after_expiry"]}. min=0. max=365 |
| `executionTime` | time | Yes | "09:00" | — | No | Execution Time. Select execution time |
| `status` | string | No | "draft" | — | No | Present on node.data via schema defaults / createNodeDefaults (saved with the node). _(Default key not declared as a schema.fields entry)_ |

## Validation

### Graph-level (`validateWorkflowGraph`)
- Workflow must have nodes.
- Exactly one event trigger (`isTrigger` / `triggerKey`, excluding `start`).
- At least one `end` node.
- No cycles unless a `loop` node exists (catalog currently has no loop node).
- All non-start nodes must be connected when more than one node exists.
- Unknown node types are errors.

### Node-specific (`validateTriggerNodeFields`)
- Required schema fields that are visible (`showWhen`) must be non-empty.
- Empty arrays count as empty.
- If a field of type `retry` exists and `repeatReminder` is on: `retryInterval` required; `maxRetryCount` ≥ 1.

## Variable Support

No variable picker on this node’s property panel.

## Full Frontend JSON

Complete saved node object as produced for workflow configuration persistence (`serializeNode` / `configuration.nodes[]`). Shape is `{ id, type, position, data }` — canvas-only React Flow keys such as `dragHandle` / `selected` are **not** part of the saved Laravel payload.

### Complete saved node JSON

```json
{
  "id": "n_membershipExpiry_1",
  "type": "workflow",
  "position": {
    "x": 280,
    "y": 160
  },
  "data": {
    "nodeType": "membershipExpiry",
    "category": "triggers",
    "tone": "success",
    "description": "Triggers the workflow when a patient's hospital membership is approaching expiry, expires, or has expired.",
    "label": "Hospital Membership Expiry",
    "status": "draft",
    "triggerTiming": "before_expiry",
    "numberOfDays": 7,
    "executionTime": "09:00"
  }
}
```

### `node.data` only

```json
{
  "nodeType": "membershipExpiry",
  "category": "triggers",
  "tone": "success",
  "description": "Triggers the workflow when a patient's hospital membership is approaching expiry, expires, or has expired.",
  "label": "Hospital Membership Expiry",
  "status": "draft",
  "triggerTiming": "before_expiry",
  "numberOfDays": 7,
  "executionTime": "09:00"
}
```

## Backend Mapping

| Frontend Node ID | `membershipExpiry` |
| Trigger aliases (NodeTypeNormalizer-style, frontend) | _None in frontend `TRIGGER_TYPE_ALIASES`_ |
| Canonical backend type (from contracts) | `membershipExpiry` (same id; Laravel `NodeTypeNormalizer` **not in this repo**) |
| Executor (from `automation/node-contracts.json`) | JS NodeExecutorRegistry.#executeTrigger (generic passthrough). Laravel executor not present in this repo. |
| Backend status (contracts) | `partial` |

## Limitations / Notes

- Catalog description: Hospital Membership Expiry
- Next-step behavior (contracts): action=continue; follow first outgoing edge (parallel fan-out not implemented)
- Frontend schema is complete; Laravel-specific executor for this trigger is not present in this repository (contracts: partial).

---
# Node: userPlanExpiry

## Basic Information

| Property | Value |
|---|---|
| Node ID | `userPlanExpiry` |
| Display Name | User Plan Expiry |
| Purpose | Triggers the workflow based on the expiry date of a user's subscription or service plan. |
| Category | `triggers` |
| Node Type | `userPlanExpiry` |
| Frontend Role | trigger |
| Custom Panel | `trigger` |
| Property Panel Component | TriggerProperties (`PANEL_MAP.trigger`) |
| Backend Canonical Type | `userPlanExpiry` |
| Backend Executor | JS NodeExecutorRegistry.#executeTrigger (generic passthrough). Laravel executor not present in this repo. |
| Backend Status | `partial` |

## Fields

| Field | Type | Required | Default | Allowed Values | Variables Supported | Description |
|---|---|---|---|---|---|---|
| `nodeType` | string | Yes | userPlanExpiry | `userPlanExpiry` | No | Canonical frontend node type. Set by `createNodeDefaults`. |
| `category` | string | Yes | triggers | `triggers` | No | Catalog category id. |
| `tone` | string | No | success | UI tone token from `toneForCategory` | No | Visual tone for the canvas node. |
| `description` | string | No | Triggers the workflow based on the expiry date of a user's subscription or service plan. | — | No | Human description copied from schema/catalog. |
| `label` | text | Yes | "User Plan Expiry" | — | No | Trigger Name. Enter trigger name. Placeholder: Enter trigger name |
| `triggerTiming` | select | Yes | "before_expiry" | `before_expiry` (Before Expiry), `on_expiry` (On Expiry), `after_expiry` (After Expiry) | No | Trigger Timing |
| `numberOfDays` | number | Yes | 7 | — | No | Number of Days. Enter number of days. Visible when: {"triggerTiming":["before_expiry","after_expiry"]}. min=0. max=365 |
| `executionTime` | time | Yes | "09:00" | — | No | Execution Time. Select execution time |
| `status` | string | No | "draft" | — | No | Present on node.data via schema defaults / createNodeDefaults (saved with the node). _(Default key not declared as a schema.fields entry)_ |

## Validation

### Graph-level (`validateWorkflowGraph`)
- Workflow must have nodes.
- Exactly one event trigger (`isTrigger` / `triggerKey`, excluding `start`).
- At least one `end` node.
- No cycles unless a `loop` node exists (catalog currently has no loop node).
- All non-start nodes must be connected when more than one node exists.
- Unknown node types are errors.

### Node-specific (`validateTriggerNodeFields`)
- Required schema fields that are visible (`showWhen`) must be non-empty.
- Empty arrays count as empty.
- If a field of type `retry` exists and `repeatReminder` is on: `retryInterval` required; `maxRetryCount` ≥ 1.

## Variable Support

No variable picker on this node’s property panel.

## Full Frontend JSON

Complete saved node object as produced for workflow configuration persistence (`serializeNode` / `configuration.nodes[]`). Shape is `{ id, type, position, data }` — canvas-only React Flow keys such as `dragHandle` / `selected` are **not** part of the saved Laravel payload.

### Complete saved node JSON

```json
{
  "id": "n_userPlanExpiry_1",
  "type": "workflow",
  "position": {
    "x": 280,
    "y": 160
  },
  "data": {
    "nodeType": "userPlanExpiry",
    "category": "triggers",
    "tone": "success",
    "description": "Triggers the workflow based on the expiry date of a user's subscription or service plan.",
    "label": "User Plan Expiry",
    "status": "draft",
    "triggerTiming": "before_expiry",
    "numberOfDays": 7,
    "executionTime": "09:00"
  }
}
```

### `node.data` only

```json
{
  "nodeType": "userPlanExpiry",
  "category": "triggers",
  "tone": "success",
  "description": "Triggers the workflow based on the expiry date of a user's subscription or service plan.",
  "label": "User Plan Expiry",
  "status": "draft",
  "triggerTiming": "before_expiry",
  "numberOfDays": 7,
  "executionTime": "09:00"
}
```

## Backend Mapping

| Frontend Node ID | `userPlanExpiry` |
| Trigger aliases (NodeTypeNormalizer-style, frontend) | _None in frontend `TRIGGER_TYPE_ALIASES`_ |
| Canonical backend type (from contracts) | `userPlanExpiry` (same id; Laravel `NodeTypeNormalizer` **not in this repo**) |
| Executor (from `automation/node-contracts.json`) | JS NodeExecutorRegistry.#executeTrigger (generic passthrough). Laravel executor not present in this repo. |
| Backend status (contracts) | `partial` |

## Limitations / Notes

- Catalog description: User Plan Expiry
- Next-step behavior (contracts): action=continue; follow first outgoing edge (parallel fan-out not implemented)
- Frontend schema is complete; Laravel-specific executor for this trigger is not present in this repository (contracts: partial).

---
# Node: rewardUpdated

## Basic Information

| Property | Value |
|---|---|
| Node ID | `rewardUpdated` |
| Display Name | Reward Points Updated |
| Purpose | Triggers the workflow whenever a patient's reward points balance is updated. |
| Category | `triggers` |
| Node Type | `rewardUpdated` |
| Frontend Role | trigger |
| Custom Panel | `trigger` |
| Property Panel Component | TriggerProperties (`PANEL_MAP.trigger`) |
| Backend Canonical Type | `rewardUpdated` |
| Backend Executor | JS NodeExecutorRegistry.#executeTrigger (generic passthrough). Laravel executor not present in this repo. |
| Backend Status | `partial` |

## Fields

| Field | Type | Required | Default | Allowed Values | Variables Supported | Description |
|---|---|---|---|---|---|---|
| `nodeType` | string | Yes | rewardUpdated | `rewardUpdated` | No | Canonical frontend node type. Set by `createNodeDefaults`. |
| `category` | string | Yes | triggers | `triggers` | No | Catalog category id. |
| `tone` | string | No | success | UI tone token from `toneForCategory` | No | Visual tone for the canvas node. |
| `description` | string | No | Triggers the workflow whenever a patient's reward points balance is updated. | — | No | Human description copied from schema/catalog. |
| `label` | text | Yes | "Reward Points Updated" | — | No | Trigger Name. Enter trigger name. Placeholder: Enter trigger name |
| `updateType` | multiselect | Yes | ["any"] | `any` (Any), `points_added` (Points Added), `points_redeemed` (Points Redeemed), `points_adjusted` (Points Adjusted) | No | Update Type |
| `status` | string | No | "draft" | — | No | Present on node.data via schema defaults / createNodeDefaults (saved with the node). _(Default key not declared as a schema.fields entry)_ |

## Validation

### Graph-level (`validateWorkflowGraph`)
- Workflow must have nodes.
- Exactly one event trigger (`isTrigger` / `triggerKey`, excluding `start`).
- At least one `end` node.
- No cycles unless a `loop` node exists (catalog currently has no loop node).
- All non-start nodes must be connected when more than one node exists.
- Unknown node types are errors.

### Node-specific (`validateTriggerNodeFields`)
- Required schema fields that are visible (`showWhen`) must be non-empty.
- Empty arrays count as empty.
- If a field of type `retry` exists and `repeatReminder` is on: `retryInterval` required; `maxRetryCount` ≥ 1.

## Variable Support

No variable picker on this node’s property panel.

## Full Frontend JSON

Complete saved node object as produced for workflow configuration persistence (`serializeNode` / `configuration.nodes[]`). Shape is `{ id, type, position, data }` — canvas-only React Flow keys such as `dragHandle` / `selected` are **not** part of the saved Laravel payload.

### Complete saved node JSON

```json
{
  "id": "n_rewardUpdated_1",
  "type": "workflow",
  "position": {
    "x": 280,
    "y": 160
  },
  "data": {
    "nodeType": "rewardUpdated",
    "category": "triggers",
    "tone": "success",
    "description": "Triggers the workflow whenever a patient's reward points balance is updated.",
    "label": "Reward Points Updated",
    "status": "draft",
    "updateType": [
      "any"
    ]
  }
}
```

### `node.data` only

```json
{
  "nodeType": "rewardUpdated",
  "category": "triggers",
  "tone": "success",
  "description": "Triggers the workflow whenever a patient's reward points balance is updated.",
  "label": "Reward Points Updated",
  "status": "draft",
  "updateType": [
    "any"
  ]
}
```

## Backend Mapping

| Frontend Node ID | `rewardUpdated` |
| Trigger aliases (NodeTypeNormalizer-style, frontend) | _None in frontend `TRIGGER_TYPE_ALIASES`_ |
| Canonical backend type (from contracts) | `rewardUpdated` (same id; Laravel `NodeTypeNormalizer` **not in this repo**) |
| Executor (from `automation/node-contracts.json`) | JS NodeExecutorRegistry.#executeTrigger (generic passthrough). Laravel executor not present in this repo. |
| Backend status (contracts) | `partial` |

## Limitations / Notes

- Catalog description: Reward Points Updated
- Next-step behavior (contracts): action=continue; follow first outgoing edge (parallel fan-out not implemented)
- Frontend schema is complete; Laravel-specific executor for this trigger is not present in this repository (contracts: partial).

---
# Node: rewardsTierUpgraded

## Basic Information

| Property | Value |
|---|---|
| Node ID | `rewardsTierUpgraded` |
| Display Name | Rewards Tier Upgraded |
| Purpose | Triggers the workflow whenever a patient is upgraded to a higher rewards tier. |
| Category | `triggers` |
| Node Type | `rewardsTierUpgraded` |
| Frontend Role | trigger |
| Custom Panel | `trigger` |
| Property Panel Component | TriggerProperties (`PANEL_MAP.trigger`) |
| Backend Canonical Type | `rewardsTierUpgraded` |
| Backend Executor | JS NodeExecutorRegistry.#executeTrigger (generic passthrough). Laravel executor not present in this repo. |
| Backend Status | `partial` |

## Fields

| Field | Type | Required | Default | Allowed Values | Variables Supported | Description |
|---|---|---|---|---|---|---|
| `nodeType` | string | Yes | rewardsTierUpgraded | `rewardsTierUpgraded` | No | Canonical frontend node type. Set by `createNodeDefaults`. |
| `category` | string | Yes | triggers | `triggers` | No | Catalog category id. |
| `tone` | string | No | success | UI tone token from `toneForCategory` | No | Visual tone for the canvas node. |
| `description` | string | No | Triggers the workflow whenever a patient is upgraded to a higher rewards tier. | — | No | Human description copied from schema/catalog. |
| `label` | text | Yes | "Rewards Tier Upgraded" | — | No | Trigger Name. Enter trigger name. Placeholder: Enter trigger name |
| `status` | string | No | "draft" | — | No | Present on node.data via schema defaults / createNodeDefaults (saved with the node). _(Default key not declared as a schema.fields entry)_ |

## Validation

### Graph-level (`validateWorkflowGraph`)
- Workflow must have nodes.
- Exactly one event trigger (`isTrigger` / `triggerKey`, excluding `start`).
- At least one `end` node.
- No cycles unless a `loop` node exists (catalog currently has no loop node).
- All non-start nodes must be connected when more than one node exists.
- Unknown node types are errors.

### Node-specific (`validateTriggerNodeFields`)
- Required schema fields that are visible (`showWhen`) must be non-empty.
- Empty arrays count as empty.
- If a field of type `retry` exists and `repeatReminder` is on: `retryInterval` required; `maxRetryCount` ≥ 1.

## Variable Support

No variable picker on this node’s property panel.

## Full Frontend JSON

Complete saved node object as produced for workflow configuration persistence (`serializeNode` / `configuration.nodes[]`). Shape is `{ id, type, position, data }` — canvas-only React Flow keys such as `dragHandle` / `selected` are **not** part of the saved Laravel payload.

### Complete saved node JSON

```json
{
  "id": "n_rewardsTierUpgraded_1",
  "type": "workflow",
  "position": {
    "x": 280,
    "y": 160
  },
  "data": {
    "nodeType": "rewardsTierUpgraded",
    "category": "triggers",
    "tone": "success",
    "description": "Triggers the workflow whenever a patient is upgraded to a higher rewards tier.",
    "label": "Rewards Tier Upgraded",
    "status": "draft"
  }
}
```

### `node.data` only

```json
{
  "nodeType": "rewardsTierUpgraded",
  "category": "triggers",
  "tone": "success",
  "description": "Triggers the workflow whenever a patient is upgraded to a higher rewards tier.",
  "label": "Rewards Tier Upgraded",
  "status": "draft"
}
```

## Backend Mapping

| Frontend Node ID | `rewardsTierUpgraded` |
| Trigger aliases (NodeTypeNormalizer-style, frontend) | _None in frontend `TRIGGER_TYPE_ALIASES`_ |
| Canonical backend type (from contracts) | `rewardsTierUpgraded` (same id; Laravel `NodeTypeNormalizer` **not in this repo**) |
| Executor (from `automation/node-contracts.json`) | JS NodeExecutorRegistry.#executeTrigger (generic passthrough). Laravel executor not present in this repo. |
| Backend status (contracts) | `partial` |

## Limitations / Notes

- Catalog description: Rewards Tier Upgraded
- Next-step behavior (contracts): action=continue; follow first outgoing edge (parallel fan-out not implemented)
- Frontend schema is complete; Laravel-specific executor for this trigger is not present in this repository (contracts: partial).

---
# Node: familyPackageTierUpdated

## Basic Information

| Property | Value |
|---|---|
| Node ID | `familyPackageTierUpdated` |
| Display Name | Family Package Plan Tier Updated |
| Purpose | Triggers the workflow whenever a patient's family package plan tier is changed. |
| Category | `triggers` |
| Node Type | `familyPackageTierUpdated` |
| Frontend Role | trigger |
| Custom Panel | `trigger` |
| Property Panel Component | TriggerProperties (`PANEL_MAP.trigger`) |
| Backend Canonical Type | `familyPackageTierUpdated` |
| Backend Executor | JS NodeExecutorRegistry.#executeTrigger (generic passthrough). Laravel executor not present in this repo. |
| Backend Status | `partial` |

## Fields

| Field | Type | Required | Default | Allowed Values | Variables Supported | Description |
|---|---|---|---|---|---|---|
| `nodeType` | string | Yes | familyPackageTierUpdated | `familyPackageTierUpdated` | No | Canonical frontend node type. Set by `createNodeDefaults`. |
| `category` | string | Yes | triggers | `triggers` | No | Catalog category id. |
| `tone` | string | No | success | UI tone token from `toneForCategory` | No | Visual tone for the canvas node. |
| `description` | string | No | Triggers the workflow whenever a patient's family package plan tier is changed. | — | No | Human description copied from schema/catalog. |
| `label` | text | Yes | "Family Package Plan Tier Updated" | — | No | Trigger Name. Enter trigger name. Placeholder: Enter trigger name |
| `updateType` | select | Yes | "any" | `any` (Any), `upgraded` (Upgraded), `downgraded` (Downgraded) | No | Update Type |
| `status` | string | No | "draft" | — | No | Present on node.data via schema defaults / createNodeDefaults (saved with the node). _(Default key not declared as a schema.fields entry)_ |

## Validation

### Graph-level (`validateWorkflowGraph`)
- Workflow must have nodes.
- Exactly one event trigger (`isTrigger` / `triggerKey`, excluding `start`).
- At least one `end` node.
- No cycles unless a `loop` node exists (catalog currently has no loop node).
- All non-start nodes must be connected when more than one node exists.
- Unknown node types are errors.

### Node-specific (`validateTriggerNodeFields`)
- Required schema fields that are visible (`showWhen`) must be non-empty.
- Empty arrays count as empty.
- If a field of type `retry` exists and `repeatReminder` is on: `retryInterval` required; `maxRetryCount` ≥ 1.

## Variable Support

No variable picker on this node’s property panel.

## Full Frontend JSON

Complete saved node object as produced for workflow configuration persistence (`serializeNode` / `configuration.nodes[]`). Shape is `{ id, type, position, data }` — canvas-only React Flow keys such as `dragHandle` / `selected` are **not** part of the saved Laravel payload.

### Complete saved node JSON

```json
{
  "id": "n_familyPackageTierUpdated_1",
  "type": "workflow",
  "position": {
    "x": 280,
    "y": 160
  },
  "data": {
    "nodeType": "familyPackageTierUpdated",
    "category": "triggers",
    "tone": "success",
    "description": "Triggers the workflow whenever a patient's family package plan tier is changed.",
    "label": "Family Package Plan Tier Updated",
    "status": "draft",
    "updateType": "any"
  }
}
```

### `node.data` only

```json
{
  "nodeType": "familyPackageTierUpdated",
  "category": "triggers",
  "tone": "success",
  "description": "Triggers the workflow whenever a patient's family package plan tier is changed.",
  "label": "Family Package Plan Tier Updated",
  "status": "draft",
  "updateType": "any"
}
```

## Backend Mapping

| Frontend Node ID | `familyPackageTierUpdated` |
| Trigger aliases (NodeTypeNormalizer-style, frontend) | _None in frontend `TRIGGER_TYPE_ALIASES`_ |
| Canonical backend type (from contracts) | `familyPackageTierUpdated` (same id; Laravel `NodeTypeNormalizer` **not in this repo**) |
| Executor (from `automation/node-contracts.json`) | JS NodeExecutorRegistry.#executeTrigger (generic passthrough). Laravel executor not present in this repo. |
| Backend status (contracts) | `partial` |

## Limitations / Notes

- Catalog description: Family Package Plan Tier Updated
- Next-step behavior (contracts): action=continue; follow first outgoing edge (parallel fan-out not implemented)
- Frontend schema is complete; Laravel-specific executor for this trigger is not present in this repository (contracts: partial).

---
# Node: invoiceGenerated

## Basic Information

| Property | Value |
|---|---|
| Node ID | `invoiceGenerated` |
| Display Name | Invoice Generated |
| Purpose | Triggers the workflow whenever a new invoice is generated for a patient or user. |
| Category | `triggers` |
| Node Type | `invoiceGenerated` |
| Frontend Role | trigger |
| Custom Panel | `trigger` |
| Property Panel Component | TriggerProperties (`PANEL_MAP.trigger`) |
| Backend Canonical Type | `invoiceGenerated` |
| Backend Executor | JS NodeExecutorRegistry.#executeTrigger (generic passthrough). Laravel executor not present in this repo. |
| Backend Status | `partial` |

## Fields

| Field | Type | Required | Default | Allowed Values | Variables Supported | Description |
|---|---|---|---|---|---|---|
| `nodeType` | string | Yes | invoiceGenerated | `invoiceGenerated` | No | Canonical frontend node type. Set by `createNodeDefaults`. |
| `category` | string | Yes | triggers | `triggers` | No | Catalog category id. |
| `tone` | string | No | success | UI tone token from `toneForCategory` | No | Visual tone for the canvas node. |
| `description` | string | No | Triggers the workflow whenever a new invoice is generated for a patient or user. | — | No | Human description copied from schema/catalog. |
| `label` | text | Yes | "Invoice Generated" | — | No | Trigger Name. Enter trigger name. Placeholder: Enter trigger name |
| `source` | multiselect | Yes | ["any"] | `any` (Any), `mobile` (Mobile), `website` (Website), `admin` (Admin), `api` (API) | No | Source |
| `status` | string | No | "draft" | — | No | Present on node.data via schema defaults / createNodeDefaults (saved with the node). _(Default key not declared as a schema.fields entry)_ |

## Validation

### Graph-level (`validateWorkflowGraph`)
- Workflow must have nodes.
- Exactly one event trigger (`isTrigger` / `triggerKey`, excluding `start`).
- At least one `end` node.
- No cycles unless a `loop` node exists (catalog currently has no loop node).
- All non-start nodes must be connected when more than one node exists.
- Unknown node types are errors.

### Node-specific (`validateTriggerNodeFields`)
- Required schema fields that are visible (`showWhen`) must be non-empty.
- Empty arrays count as empty.
- If a field of type `retry` exists and `repeatReminder` is on: `retryInterval` required; `maxRetryCount` ≥ 1.

## Variable Support

No variable picker on this node’s property panel.

## Full Frontend JSON

Complete saved node object as produced for workflow configuration persistence (`serializeNode` / `configuration.nodes[]`). Shape is `{ id, type, position, data }` — canvas-only React Flow keys such as `dragHandle` / `selected` are **not** part of the saved Laravel payload.

### Complete saved node JSON

```json
{
  "id": "n_invoiceGenerated_1",
  "type": "workflow",
  "position": {
    "x": 280,
    "y": 160
  },
  "data": {
    "nodeType": "invoiceGenerated",
    "category": "triggers",
    "tone": "success",
    "description": "Triggers the workflow whenever a new invoice is generated for a patient or user.",
    "label": "Invoice Generated",
    "status": "draft",
    "source": [
      "any"
    ]
  }
}
```

### `node.data` only

```json
{
  "nodeType": "invoiceGenerated",
  "category": "triggers",
  "tone": "success",
  "description": "Triggers the workflow whenever a new invoice is generated for a patient or user.",
  "label": "Invoice Generated",
  "status": "draft",
  "source": [
    "any"
  ]
}
```

## Backend Mapping

| Frontend Node ID | `invoiceGenerated` |
| Trigger aliases (NodeTypeNormalizer-style, frontend) | _None in frontend `TRIGGER_TYPE_ALIASES`_ |
| Canonical backend type (from contracts) | `invoiceGenerated` (same id; Laravel `NodeTypeNormalizer` **not in this repo**) |
| Executor (from `automation/node-contracts.json`) | JS NodeExecutorRegistry.#executeTrigger (generic passthrough). Laravel executor not present in this repo. |
| Backend status (contracts) | `partial` |

## Limitations / Notes

- Catalog description: Invoice Generated
- Next-step behavior (contracts): action=continue; follow first outgoing edge (parallel fan-out not implemented)
- Frontend schema is complete; Laravel-specific executor for this trigger is not present in this repository (contracts: partial).

---
# Node: paymentReceived

## Basic Information

| Property | Value |
|---|---|
| Node ID | `paymentReceived` |
| Display Name | Payment Received |
| Purpose | Triggers the workflow whenever a payment is successfully received and recorded. |
| Category | `triggers` |
| Node Type | `paymentReceived` |
| Frontend Role | trigger |
| Custom Panel | `trigger` |
| Property Panel Component | TriggerProperties (`PANEL_MAP.trigger`) |
| Backend Canonical Type | `paymentReceived` |
| Backend Executor | JS NodeExecutorRegistry.#executeTrigger (generic passthrough). Laravel executor not present in this repo. |
| Backend Status | `partial` |

## Fields

| Field | Type | Required | Default | Allowed Values | Variables Supported | Description |
|---|---|---|---|---|---|---|
| `nodeType` | string | Yes | paymentReceived | `paymentReceived` | No | Canonical frontend node type. Set by `createNodeDefaults`. |
| `category` | string | Yes | triggers | `triggers` | No | Catalog category id. |
| `tone` | string | No | success | UI tone token from `toneForCategory` | No | Visual tone for the canvas node. |
| `description` | string | No | Triggers the workflow whenever a payment is successfully received and recorded. | — | No | Human description copied from schema/catalog. |
| `label` | text | Yes | "Payment Received" | — | No | Trigger Name. Enter trigger name. Placeholder: Enter trigger name |
| `paymentMode` | multiselect | Yes | ["any"] | `any` (Any), `online` (Online), `cash` (Cash), `card` (Card), `upi` (UPI), `bank_transfer` (Bank Transfer) | No | Payment Mode |
| `source` | multiselect | Yes | ["any"] | `any` (Any), `mobile` (Mobile), `website` (Website), `admin` (Admin) | No | Source |
| `status` | string | No | "draft" | — | No | Present on node.data via schema defaults / createNodeDefaults (saved with the node). _(Default key not declared as a schema.fields entry)_ |

## Validation

### Graph-level (`validateWorkflowGraph`)
- Workflow must have nodes.
- Exactly one event trigger (`isTrigger` / `triggerKey`, excluding `start`).
- At least one `end` node.
- No cycles unless a `loop` node exists (catalog currently has no loop node).
- All non-start nodes must be connected when more than one node exists.
- Unknown node types are errors.

### Node-specific (`validateTriggerNodeFields`)
- Required schema fields that are visible (`showWhen`) must be non-empty.
- Empty arrays count as empty.
- If a field of type `retry` exists and `repeatReminder` is on: `retryInterval` required; `maxRetryCount` ≥ 1.

## Variable Support

No variable picker on this node’s property panel.

## Full Frontend JSON

Complete saved node object as produced for workflow configuration persistence (`serializeNode` / `configuration.nodes[]`). Shape is `{ id, type, position, data }` — canvas-only React Flow keys such as `dragHandle` / `selected` are **not** part of the saved Laravel payload.

### Complete saved node JSON

```json
{
  "id": "n_paymentReceived_1",
  "type": "workflow",
  "position": {
    "x": 280,
    "y": 160
  },
  "data": {
    "nodeType": "paymentReceived",
    "category": "triggers",
    "tone": "success",
    "description": "Triggers the workflow whenever a payment is successfully received and recorded.",
    "label": "Payment Received",
    "status": "draft",
    "paymentMode": [
      "any"
    ],
    "source": [
      "any"
    ]
  }
}
```

### `node.data` only

```json
{
  "nodeType": "paymentReceived",
  "category": "triggers",
  "tone": "success",
  "description": "Triggers the workflow whenever a payment is successfully received and recorded.",
  "label": "Payment Received",
  "status": "draft",
  "paymentMode": [
    "any"
  ],
  "source": [
    "any"
  ]
}
```

## Backend Mapping

| Frontend Node ID | `paymentReceived` |
| Trigger aliases (NodeTypeNormalizer-style, frontend) | _None in frontend `TRIGGER_TYPE_ALIASES`_ |
| Canonical backend type (from contracts) | `paymentReceived` (same id; Laravel `NodeTypeNormalizer` **not in this repo**) |
| Executor (from `automation/node-contracts.json`) | JS NodeExecutorRegistry.#executeTrigger (generic passthrough). Laravel executor not present in this repo. |
| Backend status (contracts) | `partial` |

## Limitations / Notes

- Catalog description: Payment Received
- Next-step behavior (contracts): action=continue; follow first outgoing edge (parallel fan-out not implemented)
- Frontend schema is complete; Laravel-specific executor for this trigger is not present in this repository (contracts: partial).

---
# Node: webhookEvent

## Basic Information

| Property | Value |
|---|---|
| Node ID | `webhookEvent` |
| Display Name | Webhook Event |
| Purpose | Triggers the workflow when an external system sends data to a configured HIP webhook endpoint. |
| Category | `triggers` |
| Node Type | `webhookEvent` |
| Frontend Role | trigger |
| Custom Panel | `trigger` |
| Property Panel Component | TriggerProperties (`PANEL_MAP.trigger`) |
| Backend Canonical Type | `webhookEvent` |
| Backend Executor | JS NodeExecutorRegistry.#executeTrigger (generic passthrough). Laravel executor not present in this repo. |
| Backend Status | `partial` |

## Fields

| Field | Type | Required | Default | Allowed Values | Variables Supported | Description |
|---|---|---|---|---|---|---|
| `nodeType` | string | Yes | webhookEvent | `webhookEvent` | No | Canonical frontend node type. Set by `createNodeDefaults`. |
| `category` | string | Yes | triggers | `triggers` | No | Catalog category id. |
| `tone` | string | No | success | UI tone token from `toneForCategory` | No | Visual tone for the canvas node. |
| `description` | string | No | Triggers the workflow when an external system sends data to a configured HIP webhook endpoint. | — | No | Human description copied from schema/catalog. |
| `label` | text | Yes | "Webhook Event" | — | No | Trigger Name. Enter trigger name. Placeholder: Enter trigger name |
| `webhookName` | text | Yes | "" | — | No | Webhook Name. Enter webhook name. Placeholder: Enter webhook name |
| `webhookUrl` | text | No | "https://api.healthinpocket.in/api/webhooks/{workflow_id}" | — | No | Webhook URL. Automatically generated by HIP |
| `httpMethod` | select | Yes | "POST" | `POST` (POST) | No | HTTP Method |
| `secretKey` | text | Yes | "" | — | No | Secret Key. Automatically generate or enter secret key. Placeholder: Enter or generate secret key |
| `payloadVariables` | keyValue | No | [{"key":"","variable":""}] | — | No | Payload Variables. Define incoming payload fields and workflow variables |
| `status` | string | No | "draft" | — | No | Present on node.data via schema defaults / createNodeDefaults (saved with the node). _(Default key not declared as a schema.fields entry)_ |

## Validation

### Graph-level (`validateWorkflowGraph`)
- Workflow must have nodes.
- Exactly one event trigger (`isTrigger` / `triggerKey`, excluding `start`).
- At least one `end` node.
- No cycles unless a `loop` node exists (catalog currently has no loop node).
- All non-start nodes must be connected when more than one node exists.
- Unknown node types are errors.

### Node-specific (`validateTriggerNodeFields`)
- Required schema fields that are visible (`showWhen`) must be non-empty.
- Empty arrays count as empty.
- If a field of type `retry` exists and `repeatReminder` is on: `retryInterval` required; `maxRetryCount` ≥ 1.

## Variable Support

No variable picker on this node’s property panel.

## Full Frontend JSON

Complete saved node object as produced for workflow configuration persistence (`serializeNode` / `configuration.nodes[]`). Shape is `{ id, type, position, data }` — canvas-only React Flow keys such as `dragHandle` / `selected` are **not** part of the saved Laravel payload.

### Complete saved node JSON

```json
{
  "id": "n_webhookEvent_1",
  "type": "workflow",
  "position": {
    "x": 280,
    "y": 160
  },
  "data": {
    "nodeType": "webhookEvent",
    "category": "triggers",
    "tone": "success",
    "description": "Triggers the workflow when an external system sends data to a configured HIP webhook endpoint.",
    "label": "Webhook Event",
    "status": "draft",
    "webhookName": "",
    "webhookUrl": "https://api.healthinpocket.in/api/webhooks/{workflow_id}",
    "httpMethod": "POST",
    "secretKey": "",
    "payloadVariables": [
      {
        "key": "",
        "variable": ""
      }
    ]
  }
}
```

### `node.data` only

```json
{
  "nodeType": "webhookEvent",
  "category": "triggers",
  "tone": "success",
  "description": "Triggers the workflow when an external system sends data to a configured HIP webhook endpoint.",
  "label": "Webhook Event",
  "status": "draft",
  "webhookName": "",
  "webhookUrl": "https://api.healthinpocket.in/api/webhooks/{workflow_id}",
  "httpMethod": "POST",
  "secretKey": "",
  "payloadVariables": [
    {
      "key": "",
      "variable": ""
    }
  ]
}
```

## Backend Mapping

| Frontend Node ID | `webhookEvent` |
| Trigger aliases (NodeTypeNormalizer-style, frontend) | _None in frontend `TRIGGER_TYPE_ALIASES`_ |
| Canonical backend type (from contracts) | `webhookEvent` (same id; Laravel `NodeTypeNormalizer` **not in this repo**) |
| Executor (from `automation/node-contracts.json`) | JS NodeExecutorRegistry.#executeTrigger (generic passthrough). Laravel executor not present in this repo. |
| Backend status (contracts) | `partial` |

## Limitations / Notes

- Catalog description: Webhook Event
- Next-step behavior (contracts): action=continue; follow first outgoing edge (parallel fan-out not implemented)
- Frontend schema is complete; Laravel-specific executor for this trigger is not present in this repository (contracts: partial).

---
# Node: apiEvent

## Basic Information

| Property | Value |
|---|---|
| Node ID | `apiEvent` |
| Display Name | API Event |
| Purpose | Triggers the workflow when an authorized external application sends a configured event through the HIP API. |
| Category | `triggers` |
| Node Type | `apiEvent` |
| Frontend Role | trigger |
| Custom Panel | `trigger` |
| Property Panel Component | TriggerProperties (`PANEL_MAP.trigger`) |
| Backend Canonical Type | `apiEvent` |
| Backend Executor | JS NodeExecutorRegistry.#executeTrigger (generic passthrough). Laravel executor not present in this repo. |
| Backend Status | `partial` |

## Fields

| Field | Type | Required | Default | Allowed Values | Variables Supported | Description |
|---|---|---|---|---|---|---|
| `nodeType` | string | Yes | apiEvent | `apiEvent` | No | Canonical frontend node type. Set by `createNodeDefaults`. |
| `category` | string | Yes | triggers | `triggers` | No | Catalog category id. |
| `tone` | string | No | success | UI tone token from `toneForCategory` | No | Visual tone for the canvas node. |
| `description` | string | No | Triggers the workflow when an authorized external application sends a configured event through the HIP API. | — | No | Human description copied from schema/catalog. |
| `label` | text | Yes | "API Event" | — | No | Trigger Name. Enter trigger name. Placeholder: Enter trigger name |
| `eventName` | text | Yes | "" | — | No | Event Name. Enter unique event name. Placeholder: Enter unique event name |
| `apiKey` | text | Yes | "" | — | No | API Key. Generate or select API credential. Placeholder: Generate or enter API key |
| `payloadVariables` | keyValue | No | [{"key":"","variable":""}] | — | No | Payload Variables. Define API payload fields and workflow variables |
| `status` | string | No | "draft" | — | No | Present on node.data via schema defaults / createNodeDefaults (saved with the node). _(Default key not declared as a schema.fields entry)_ |

## Validation

### Graph-level (`validateWorkflowGraph`)
- Workflow must have nodes.
- Exactly one event trigger (`isTrigger` / `triggerKey`, excluding `start`).
- At least one `end` node.
- No cycles unless a `loop` node exists (catalog currently has no loop node).
- All non-start nodes must be connected when more than one node exists.
- Unknown node types are errors.

### Node-specific (`validateTriggerNodeFields`)
- Required schema fields that are visible (`showWhen`) must be non-empty.
- Empty arrays count as empty.
- If a field of type `retry` exists and `repeatReminder` is on: `retryInterval` required; `maxRetryCount` ≥ 1.

## Variable Support

No variable picker on this node’s property panel.

## Full Frontend JSON

Complete saved node object as produced for workflow configuration persistence (`serializeNode` / `configuration.nodes[]`). Shape is `{ id, type, position, data }` — canvas-only React Flow keys such as `dragHandle` / `selected` are **not** part of the saved Laravel payload.

### Complete saved node JSON

```json
{
  "id": "n_apiEvent_1",
  "type": "workflow",
  "position": {
    "x": 280,
    "y": 160
  },
  "data": {
    "nodeType": "apiEvent",
    "category": "triggers",
    "tone": "success",
    "description": "Triggers the workflow when an authorized external application sends a configured event through the HIP API.",
    "label": "API Event",
    "status": "draft",
    "eventName": "",
    "apiKey": "",
    "payloadVariables": [
      {
        "key": "",
        "variable": ""
      }
    ]
  }
}
```

### `node.data` only

```json
{
  "nodeType": "apiEvent",
  "category": "triggers",
  "tone": "success",
  "description": "Triggers the workflow when an authorized external application sends a configured event through the HIP API.",
  "label": "API Event",
  "status": "draft",
  "eventName": "",
  "apiKey": "",
  "payloadVariables": [
    {
      "key": "",
      "variable": ""
    }
  ]
}
```

## Backend Mapping

| Frontend Node ID | `apiEvent` |
| Trigger aliases (NodeTypeNormalizer-style, frontend) | _None in frontend `TRIGGER_TYPE_ALIASES`_ |
| Canonical backend type (from contracts) | `apiEvent` (same id; Laravel `NodeTypeNormalizer` **not in this repo**) |
| Executor (from `automation/node-contracts.json`) | JS NodeExecutorRegistry.#executeTrigger (generic passthrough). Laravel executor not present in this repo. |
| Backend status (contracts) | `partial` |

## Limitations / Notes

- Catalog description: API Event
- Next-step behavior (contracts): action=continue; follow first outgoing edge (parallel fan-out not implemented)
- Frontend schema is complete; Laravel-specific executor for this trigger is not present in this repository (contracts: partial).

---
# Node: scheduledEvent

## Basic Information

| Property | Value |
|---|---|
| Node ID | `scheduledEvent` |
| Display Name | Scheduled Event |
| Purpose | Triggers the workflow automatically at a specified date, time, or recurring schedule. |
| Category | `triggers` |
| Node Type | `scheduledEvent` |
| Frontend Role | trigger |
| Custom Panel | `trigger` |
| Property Panel Component | TriggerProperties (`PANEL_MAP.trigger`) |
| Backend Canonical Type | `scheduledEvent` |
| Backend Executor | JS NodeExecutorRegistry.#executeTrigger (generic passthrough). Laravel executor not present in this repo. |
| Backend Status | `partial` |

## Fields

| Field | Type | Required | Default | Allowed Values | Variables Supported | Description |
|---|---|---|---|---|---|---|
| `nodeType` | string | Yes | scheduledEvent | `scheduledEvent` | No | Canonical frontend node type. Set by `createNodeDefaults`. |
| `category` | string | Yes | triggers | `triggers` | No | Catalog category id. |
| `tone` | string | No | success | UI tone token from `toneForCategory` | No | Visual tone for the canvas node. |
| `description` | string | No | Triggers the workflow automatically at a specified date, time, or recurring schedule. | — | No | Human description copied from schema/catalog. |
| `label` | text | Yes | "Scheduled Event" | — | No | Trigger Name. Enter trigger name. Placeholder: Enter trigger name |
| `scheduleType` | select | Yes | "once" | `once` (Once), `recurring` (Recurring) | No | Schedule Type |
| `startDate` | date | Yes | "" | — | No | Start Date. Select start date |
| `executionTime` | time | Yes | "09:00" | — | No | Execution Time. Select execution time |
| `repeatFrequency` | select | Yes | "daily" | `daily` (Daily), `weekly` (Weekly), `monthly` (Monthly), `yearly` (Yearly), `custom` (Custom) | No | Repeat Frequency. Visible when: {"scheduleType":"recurring"} |
| `endCondition` | select | Yes | "never" | `never` (Never), `on_date` (On Date), `after_runs` (After Number of Runs) | No | End Condition. Visible when: {"scheduleType":"recurring"} |
| `status` | string | No | "draft" | — | No | Present on node.data via schema defaults / createNodeDefaults (saved with the node). _(Default key not declared as a schema.fields entry)_ |

## Validation

### Graph-level (`validateWorkflowGraph`)
- Workflow must have nodes.
- Exactly one event trigger (`isTrigger` / `triggerKey`, excluding `start`).
- At least one `end` node.
- No cycles unless a `loop` node exists (catalog currently has no loop node).
- All non-start nodes must be connected when more than one node exists.
- Unknown node types are errors.

### Node-specific (`validateTriggerNodeFields`)
- Required schema fields that are visible (`showWhen`) must be non-empty.
- Empty arrays count as empty.
- If a field of type `retry` exists and `repeatReminder` is on: `retryInterval` required; `maxRetryCount` ≥ 1.

## Variable Support

No variable picker on this node’s property panel.

## Full Frontend JSON

Complete saved node object as produced for workflow configuration persistence (`serializeNode` / `configuration.nodes[]`). Shape is `{ id, type, position, data }` — canvas-only React Flow keys such as `dragHandle` / `selected` are **not** part of the saved Laravel payload.

### Complete saved node JSON

```json
{
  "id": "n_scheduledEvent_1",
  "type": "workflow",
  "position": {
    "x": 280,
    "y": 160
  },
  "data": {
    "nodeType": "scheduledEvent",
    "category": "triggers",
    "tone": "success",
    "description": "Triggers the workflow automatically at a specified date, time, or recurring schedule.",
    "label": "Scheduled Event",
    "status": "draft",
    "scheduleType": "once",
    "startDate": "",
    "executionTime": "09:00",
    "repeatFrequency": "daily",
    "endCondition": "never"
  }
}
```

### `node.data` only

```json
{
  "nodeType": "scheduledEvent",
  "category": "triggers",
  "tone": "success",
  "description": "Triggers the workflow automatically at a specified date, time, or recurring schedule.",
  "label": "Scheduled Event",
  "status": "draft",
  "scheduleType": "once",
  "startDate": "",
  "executionTime": "09:00",
  "repeatFrequency": "daily",
  "endCondition": "never"
}
```

## Backend Mapping

| Frontend Node ID | `scheduledEvent` |
| Trigger aliases (NodeTypeNormalizer-style, frontend) | _None in frontend `TRIGGER_TYPE_ALIASES`_ |
| Canonical backend type (from contracts) | `scheduledEvent` (same id; Laravel `NodeTypeNormalizer` **not in this repo**) |
| Executor (from `automation/node-contracts.json`) | JS NodeExecutorRegistry.#executeTrigger (generic passthrough). Laravel executor not present in this repo. |
| Backend status (contracts) | `partial` |

## Limitations / Notes

- Catalog description: Scheduled Event
- Next-step behavior (contracts): action=continue; follow first outgoing edge (parallel fan-out not implemented)
- Frontend schema is complete; Laravel-specific executor for this trigger is not present in this repository (contracts: partial).

---
# Node: condition

## Basic Information

| Property | Value |
|---|---|
| Node ID | `condition` |
| Display Name | Condition |
| Purpose | Evaluate a JEXL expression against the workflow context and route to True or False. |
| Category | `conditions` |
| Node Type | `condition` |
| Frontend Role | logic |
| Custom Panel | `condition` |
| Property Panel Component | ConditionProperties (`PANEL_MAP.condition`) |
| Backend Canonical Type | `condition` |
| Backend Executor | ConditionExecutor (JEXL) via ConditionEngine.execute |
| Backend Status | `implemented` |

## Fields

| Field | Type | Required | Default | Allowed Values | Variables Supported | Description |
|---|---|---|---|---|---|---|
| `nodeType` | string | Yes | condition | `condition` | No | Canonical frontend node type. Set by `createNodeDefaults`. |
| `category` | string | Yes | conditions | `conditions` | No | Catalog category id. |
| `tone` | string | No | warning | UI tone token from `toneForCategory` | No | Visual tone for the canvas node. |
| `description` | string | No | Evaluate a JEXL expression against the workflow context and route to True or False. | — | No | Human description copied from schema/catalog. |
| `name` | text | No | "Condition" | — | No | Name. Optional display name for this condition.. Placeholder: Payment Successful |
| `expression` | jexl | Yes | "" | — | JEXL expression over context (not `{{token}}` placeholders) | Condition. Placeholder: customer.age >= 18 |
| `label` | string | No | "Condition" | — | No | Present on node.data via schema defaults / createNodeDefaults (saved with the node). _(Default key not declared as a schema.fields entry)_ |
| `status` | string | No | "draft" | — | No | Present on node.data via schema defaults / createNodeDefaults (saved with the node). _(Default key not declared as a schema.fields entry)_ |

## Validation

### Graph-level (`validateWorkflowGraph`)
- Workflow must have nodes.
- Exactly one event trigger (`isTrigger` / `triggerKey`, excluding `start`).
- At least one `end` node.
- No cycles unless a `loop` node exists (catalog currently has no loop node).
- All non-start nodes must be connected when more than one node exists.
- Unknown node types are errors.

### Node-specific (`validateConditionNodeFields`)
- `expression` is required (non-empty).
- Expression must pass `validateJexlSyntax` (jexl.compile).

## Variable Support

Condition nodes use **JEXL**, not `{{token}}` placeholders.

Expression scope (from `src/runtime/engines/jexlCondition.js`): `patient`, `customer` (alias of patient), `doctor`, `hospital`, `appointment`, `payment`, `invoice`, `prescription`, `organization`, `medicine`, `workflow`, `variables`, `outputs`.

Examples from runtime: `patient.age >= 60`, `appointment.status == "Confirmed" && payment.success`.

## Full Frontend JSON

Complete saved node object as produced for workflow configuration persistence (`serializeNode` / `configuration.nodes[]`). Shape is `{ id, type, position, data }` — canvas-only React Flow keys such as `dragHandle` / `selected` are **not** part of the saved Laravel payload.

### Complete saved node JSON

```json
{
  "id": "n_condition_1",
  "type": "workflow",
  "position": {
    "x": 280,
    "y": 160
  },
  "data": {
    "nodeType": "condition",
    "category": "conditions",
    "tone": "warning",
    "description": "Evaluate a JEXL expression against the workflow context and route to True or False.",
    "label": "Condition",
    "name": "Condition",
    "status": "draft",
    "expression": ""
  }
}
```

### `node.data` only

```json
{
  "nodeType": "condition",
  "category": "conditions",
  "tone": "warning",
  "description": "Evaluate a JEXL expression against the workflow context and route to True or False.",
  "label": "Condition",
  "name": "Condition",
  "status": "draft",
  "expression": ""
}
```

## Backend Mapping

| Frontend Node ID | `condition` |
| Trigger aliases (NodeTypeNormalizer-style, frontend) | _None in frontend `TRIGGER_TYPE_ALIASES`_ |
| Canonical backend type (from contracts) | `condition` (same id; Laravel `NodeTypeNormalizer` **not in this repo**) |
| Executor (from `automation/node-contracts.json`) | ConditionExecutor (JEXL) via ConditionEngine.execute |
| Backend status (contracts) | `implemented` |

## Limitations / Notes

- Catalog description: Condition
- Next-step behavior (contracts): action=branch; WorkflowExecutor matches outgoing edge sourceHandle === 'true'|'false'

---
# Node: wait

## Basic Information

| Property | Value |
|---|---|
| Node ID | `wait` |
| Display Name | Wait |
| Purpose | Pause the workflow for a configured duration. |
| Category | `wait` |
| Node Type | `wait` |
| Frontend Role | control |
| Custom Panel | `wait` |
| Property Panel Component | WaitProperties (`PANEL_MAP.wait`) |
| Backend Canonical Type | `wait` |
| Backend Executor | NodeExecutorRegistry.#executeWait + DelayScheduler.calculateDelayMs |
| Backend Status | `implemented` |

## Fields

| Field | Type | Required | Default | Allowed Values | Variables Supported | Description |
|---|---|---|---|---|---|---|
| `nodeType` | string | Yes | wait | `wait` | No | Canonical frontend node type. Set by `createNodeDefaults`. |
| `category` | string | Yes | wait | `wait` | No | Catalog category id. |
| `tone` | string | No | warning | UI tone token from `toneForCategory` | No | Visual tone for the canvas node. |
| `description` | string | No | Pause the workflow for a configured duration. | — | No | Human description copied from schema/catalog. |
| `label` | text | Yes | "Wait" | — | No | Display Name |
| `waitType` | select | Yes | "duration" | `duration` (Duration), `until` (Wait Until Date), `cron` (Cron Schedule), `recurring` (Recurring) | No | Wait Type |
| `amount` | number | No | 30 | — | No | Amount. Visible when: {"waitType":"duration"}. min=1 |
| `unit` | select | No | "minutes" | `minutes` (Minutes), `hours` (Hours), `days` (Days) | No | Unit. Visible when: {"waitType":"duration"} |
| `untilDate` | text | No | "" | — | No | Until Date / Time. Placeholder: 2026-07-21T10:00. Visible when: {"waitType":"until"} |
| `cron` | text | No | "" | — | No | Cron Expression. Placeholder: 0 9 * * *. Visible when: {"waitType":"cron"} |
| `recurringInterval` | select | No | "daily" | `daily` (Daily), `weekly` (Weekly), `monthly` (Monthly) | No | Recurring Interval. Visible when: {"waitType":"recurring"} |
| `status` | string | No | "draft" | — | No | Present on node.data via schema defaults / createNodeDefaults (saved with the node). _(Default key not declared as a schema.fields entry)_ |

## Validation

### Graph-level (`validateWorkflowGraph`)
- Workflow must have nodes.
- Exactly one event trigger (`isTrigger` / `triggerKey`, excluding `start`).
- At least one `end` node.
- No cycles unless a `loop` node exists (catalog currently has no loop node).
- All non-start nodes must be connected when more than one node exists.
- Unknown node types are errors.

### Node-specific
- Wait/delay nodes must have an outgoing connection.
- Required catalog/schema fields (`label`, `waitType`) enforced via catalog required fields.

## Variable Support

No variable picker on this node’s property panel.

## Full Frontend JSON

Complete saved node object as produced for workflow configuration persistence (`serializeNode` / `configuration.nodes[]`). Shape is `{ id, type, position, data }` — canvas-only React Flow keys such as `dragHandle` / `selected` are **not** part of the saved Laravel payload.

### Complete saved node JSON

```json
{
  "id": "n_wait_1",
  "type": "workflow",
  "position": {
    "x": 280,
    "y": 160
  },
  "data": {
    "nodeType": "wait",
    "category": "wait",
    "tone": "warning",
    "description": "Pause the workflow for a configured duration.",
    "label": "Wait",
    "status": "draft",
    "waitType": "duration",
    "amount": 30,
    "unit": "minutes",
    "untilDate": "",
    "cron": "",
    "recurringInterval": "daily"
  }
}
```

### `node.data` only

```json
{
  "nodeType": "wait",
  "category": "wait",
  "tone": "warning",
  "description": "Pause the workflow for a configured duration.",
  "label": "Wait",
  "status": "draft",
  "waitType": "duration",
  "amount": 30,
  "unit": "minutes",
  "untilDate": "",
  "cron": "",
  "recurringInterval": "daily"
}
```

## Backend Mapping

| Frontend Node ID | `wait` |
| Trigger aliases (NodeTypeNormalizer-style, frontend) | _None in frontend `TRIGGER_TYPE_ALIASES`_ |
| Canonical backend type (from contracts) | `wait` (same id; Laravel `NodeTypeNormalizer` **not in this repo**) |
| Executor (from `automation/node-contracts.json`) | NodeExecutorRegistry.#executeWait + DelayScheduler.calculateDelayMs |
| Backend status (contracts) | `implemented` |

## Limitations / Notes

- Catalog description: Wait
- Next-step behavior (contracts): action=delay; scheduler resumes then follows first outgoing edge

---
# Node: sendWhatsApp

## Basic Information

| Property | Value |
|---|---|
| Node ID | `sendWhatsApp` |
| Display Name | Send WhatsApp |
| Purpose | Send an approved WhatsApp template to the patient or care team. |
| Category | `messaging` |
| Node Type | `sendWhatsApp` |
| Frontend Role | communication |
| Custom Panel | `messaging` |
| Property Panel Component | MessagingProperties (`PANEL_MAP.messaging`) |
| Backend Canonical Type | `sendWhatsApp` |
| Backend Executor | ActionDispatcher.#dispatchMessaging → ChannelManager.send (JS adapters currently stub adapters) |
| Backend Status | `partial` |

## Fields

| Field | Type | Required | Default | Allowed Values | Variables Supported | Description |
|---|---|---|---|---|---|---|
| `nodeType` | string | Yes | sendWhatsApp | `sendWhatsApp` | No | Canonical frontend node type. Set by `createNodeDefaults`. |
| `category` | string | Yes | messaging | `messaging` | No | Catalog category id. |
| `tone` | string | No | primary | UI tone token from `toneForCategory` | No | Visual tone for the canvas node. |
| `description` | string | No | Send an approved WhatsApp template to the patient or care team. | — | No | Human description copied from schema/catalog. |
| `label` | text | Yes | "Send WhatsApp" | — | No (field itself); node supports variable insertion into text fields | Display Name |
| `templateId` | templateSelect | Yes | "" | — | No (field itself); node supports variable insertion into text fields | Template |
| `message` | textarea | Yes | "" | — | Yes (`{{token}}` via ApiVariablePicker) | Message. Placeholder: Template message body |
| `buttons` | textarea | No | "" | — | Yes (`{{token}}` via ApiVariablePicker) | Buttons. Leave blank if the template has no buttons.. Placeholder: Optional WhatsApp quick-reply / CTA buttons |
| `recipient` | string | Yes | "patient" | `patient`, `doctor`, `caregiver`, `custom` | No | Present on node.data via createMessagingDefaults (saved with the node). Validated by validateWorkflowGraph as required. Only sendTemplate schema exposes recipient in the property panel; other messaging nodes still persist recipient on data. _(On node.data; may not appear in MessagingProperties schema.fields UI)_ |
| `repeatReminder` | boolean | No | false | — | No | Present on node.data via createMessagingDefaults (saved with the node). _(On node.data; may not appear in MessagingProperties schema.fields UI)_ |
| `retryInterval` | number | No | 15 | `5`, `10`, `15`, `30`, `60` | No | Present on node.data via createMessagingDefaults (saved with the node). Required by validateWorkflowGraph when repeatReminder is true. _(On node.data; may not appear in MessagingProperties schema.fields UI)_ |
| `maxRetryCount` | number | No | 2 | — | No | Present on node.data via createMessagingDefaults (saved with the node). Must be ≥ 1 when repeatReminder is true (validateWorkflowGraph). _(On node.data; may not appear in MessagingProperties schema.fields UI)_ |
| `fallbackChannel` | string | No | "sms" | `whatsapp`, `sms`, `email`, `push` or empty string | No | Present on node.data via createMessagingDefaults (saved with the node). _(On node.data; may not appear in MessagingProperties schema.fields UI)_ |
| `variables` | object | No | {} | — | No | Present on node.data via createMessagingDefaults (saved with the node). Object map reserved for template variables. _(On node.data; may not appear in MessagingProperties schema.fields UI)_ |
| `status` | string | No | "draft" | — | No | Present on node.data via createMessagingDefaults (saved with the node). _(On node.data; may not appear in MessagingProperties schema.fields UI)_ |

## Validation

### Graph-level (`validateWorkflowGraph`)
- Workflow must have nodes.
- Exactly one event trigger (`isTrigger` / `triggerKey`, excluding `start`).
- At least one `end` node.
- No cycles unless a `loop` node exists (catalog currently has no loop node).
- All non-start nodes must be connected when more than one node exists.
- Unknown node types are errors.

### Node-specific (`getMessagingFieldErrors` + `validateWorkflowGraph`)
- `recipient` must be set on node.data.
- When `repeatReminder` is true: `retryInterval` required; `maxRetryCount` ≥ 1.
- **sendWhatsApp / sendSms**: `templateId` and `message` required.
- **sendEmail**: template OR both `subject` and `body`.
- **sendPush**: template OR both `title` and `body`.
- **sendAiChat**: `templateId` and `prompt` required.
- **sendAiVoice**: template OR `prompt`.
- **sendIvr / sendTemplate**: `templateId` required (plus schema-required channel/recipient for sendTemplate).
- Catalog `fields` required-check also runs for required catalog fields.

## Variable Support

Variable tokens from `WORKFLOW_VARIABLE_GROUPS` (`src/components/flow/config/variables.js`):

**Patient**
- `{{patient_name}}` — Patient
- `{{patient_id}}` — Patient ID
- `{{patient_mobile}}` — Patient Mobile
- `{{patient_email}}` — Patient Email
- `{{patient_age}}` — Patient Age
- `{{patient_gender}}` — Patient Gender

**Doctor**
- `{{doctor_name}}` — Doctor
- `{{department}}` — Department

**Appointment**
- `{{appointment_date}}` — Appointment Date
- `{{appointment_time}}` — Appointment Time
- `{{appointment_id}}` — Appointment ID
- `{{branch_name}}` — Branch

**Invoice**
- `{{invoice_amount}}` — Invoice Amount
- `{{payment_status}}` — Payment Status

**Prescription**
- `{{prescription_id}}` — Prescription ID
- `{{pharmacy_link}}` — Pharmacy Link

**Medicine**
- `{{medicine_name}}` — Medicine
- `{{dosage}}` — Dosage
- `{{frequency}}` — Frequency
- `{{reminder_time}}` — Reminder Time
- `{{time}}` — Time
- `{{date}}` — Date

**Hospital**
- `{{hospital_name}}` — Hospital
- `{{hospital_phone}}` — Hospital Phone

**System**
- `{{workflow_id}}` — Workflow ID
- `{{triggered_at}}` — Triggered At

Messaging property panel inserts tokens via `ApiVariablePicker` (API variables for the workflow trigger, plus local catalog). Insertable fields: `subject`, `body`, `message`, `title`, `prompt`, `buttons`.

## Full Frontend JSON

Complete saved node object as produced for workflow configuration persistence (`serializeNode` / `configuration.nodes[]`). Shape is `{ id, type, position, data }` — canvas-only React Flow keys such as `dragHandle` / `selected` are **not** part of the saved Laravel payload.

### Complete saved node JSON

```json
{
  "id": "n_sendWhatsApp_1",
  "type": "workflow",
  "position": {
    "x": 280,
    "y": 160
  },
  "data": {
    "nodeType": "sendWhatsApp",
    "category": "messaging",
    "tone": "primary",
    "description": "Send an approved WhatsApp template to the patient or care team.",
    "label": "Send WhatsApp",
    "status": "draft",
    "templateId": "",
    "recipient": "patient",
    "repeatReminder": false,
    "retryInterval": 15,
    "maxRetryCount": 2,
    "fallbackChannel": "sms",
    "variables": {},
    "message": "",
    "buttons": ""
  }
}
```

### `node.data` only

```json
{
  "nodeType": "sendWhatsApp",
  "category": "messaging",
  "tone": "primary",
  "description": "Send an approved WhatsApp template to the patient or care team.",
  "label": "Send WhatsApp",
  "status": "draft",
  "templateId": "",
  "recipient": "patient",
  "repeatReminder": false,
  "retryInterval": 15,
  "maxRetryCount": 2,
  "fallbackChannel": "sms",
  "variables": {},
  "message": "",
  "buttons": ""
}
```

## Backend Mapping

| Frontend Node ID | `sendWhatsApp` |
| Trigger aliases (NodeTypeNormalizer-style, frontend) | _None in frontend `TRIGGER_TYPE_ALIASES`_ |
| Canonical backend type (from contracts) | `sendWhatsApp` (same id; Laravel `NodeTypeNormalizer` **not in this repo**) |
| Executor (from `automation/node-contracts.json`) | ActionDispatcher.#dispatchMessaging → ChannelManager.send (JS adapters currently stub adapters) |
| Backend status (contracts) | `partial` |

## Limitations / Notes

- Catalog description: Send WhatsApp
- Next-step behavior (contracts): action=continue; follow first outgoing edge (parallel fan-out not implemented)
- `MessagingProperties` renders `schema.fields` only; shared defaults (`recipient`, retry fields) remain on `node.data` and are validated on save.
- JS `ChannelManager` adapters in this repo return stub successes; production delivery is Laravel-side.

---
# Node: sendSms

## Basic Information

| Property | Value |
|---|---|
| Node ID | `sendSms` |
| Display Name | Send SMS |
| Purpose | Send an SMS using an approved template. |
| Category | `messaging` |
| Node Type | `sendSms` |
| Frontend Role | communication |
| Custom Panel | `messaging` |
| Property Panel Component | MessagingProperties (`PANEL_MAP.messaging`) |
| Backend Canonical Type | `sendSms` |
| Backend Executor | ActionDispatcher.#dispatchMessaging → ChannelManager.send (JS adapters currently stub adapters) |
| Backend Status | `partial` |

## Fields

| Field | Type | Required | Default | Allowed Values | Variables Supported | Description |
|---|---|---|---|---|---|---|
| `nodeType` | string | Yes | sendSms | `sendSms` | No | Canonical frontend node type. Set by `createNodeDefaults`. |
| `category` | string | Yes | messaging | `messaging` | No | Catalog category id. |
| `tone` | string | No | primary | UI tone token from `toneForCategory` | No | Visual tone for the canvas node. |
| `description` | string | No | Send an SMS using an approved template. | — | No | Human description copied from schema/catalog. |
| `label` | text | Yes | "Send SMS" | — | No (field itself); node supports variable insertion into text fields | Display Name |
| `templateId` | templateSelect | Yes | "" | — | No (field itself); node supports variable insertion into text fields | Template |
| `message` | textarea | Yes | "" | — | Yes (`{{token}}` via ApiVariablePicker) | Message. Placeholder: SMS message body |
| `recipient` | string | Yes | "patient" | `patient`, `doctor`, `caregiver`, `custom` | No | Present on node.data via createMessagingDefaults (saved with the node). Validated by validateWorkflowGraph as required. Only sendTemplate schema exposes recipient in the property panel; other messaging nodes still persist recipient on data. _(On node.data; may not appear in MessagingProperties schema.fields UI)_ |
| `repeatReminder` | boolean | No | false | — | No | Present on node.data via createMessagingDefaults (saved with the node). _(On node.data; may not appear in MessagingProperties schema.fields UI)_ |
| `retryInterval` | number | No | 15 | `5`, `10`, `15`, `30`, `60` | No | Present on node.data via createMessagingDefaults (saved with the node). Required by validateWorkflowGraph when repeatReminder is true. _(On node.data; may not appear in MessagingProperties schema.fields UI)_ |
| `maxRetryCount` | number | No | 2 | — | No | Present on node.data via createMessagingDefaults (saved with the node). Must be ≥ 1 when repeatReminder is true (validateWorkflowGraph). _(On node.data; may not appear in MessagingProperties schema.fields UI)_ |
| `fallbackChannel` | string | No | "" | `whatsapp`, `sms`, `email`, `push` or empty string | No | Present on node.data via createMessagingDefaults (saved with the node). _(On node.data; may not appear in MessagingProperties schema.fields UI)_ |
| `variables` | object | No | {} | — | No | Present on node.data via createMessagingDefaults (saved with the node). Object map reserved for template variables. _(On node.data; may not appear in MessagingProperties schema.fields UI)_ |
| `status` | string | No | "draft" | — | No | Present on node.data via createMessagingDefaults (saved with the node). _(On node.data; may not appear in MessagingProperties schema.fields UI)_ |

## Validation

### Graph-level (`validateWorkflowGraph`)
- Workflow must have nodes.
- Exactly one event trigger (`isTrigger` / `triggerKey`, excluding `start`).
- At least one `end` node.
- No cycles unless a `loop` node exists (catalog currently has no loop node).
- All non-start nodes must be connected when more than one node exists.
- Unknown node types are errors.

### Node-specific (`getMessagingFieldErrors` + `validateWorkflowGraph`)
- `recipient` must be set on node.data.
- When `repeatReminder` is true: `retryInterval` required; `maxRetryCount` ≥ 1.
- **sendWhatsApp / sendSms**: `templateId` and `message` required.
- **sendEmail**: template OR both `subject` and `body`.
- **sendPush**: template OR both `title` and `body`.
- **sendAiChat**: `templateId` and `prompt` required.
- **sendAiVoice**: template OR `prompt`.
- **sendIvr / sendTemplate**: `templateId` required (plus schema-required channel/recipient for sendTemplate).
- Catalog `fields` required-check also runs for required catalog fields.

## Variable Support

Variable tokens from `WORKFLOW_VARIABLE_GROUPS` (`src/components/flow/config/variables.js`):

**Patient**
- `{{patient_name}}` — Patient
- `{{patient_id}}` — Patient ID
- `{{patient_mobile}}` — Patient Mobile
- `{{patient_email}}` — Patient Email
- `{{patient_age}}` — Patient Age
- `{{patient_gender}}` — Patient Gender

**Doctor**
- `{{doctor_name}}` — Doctor
- `{{department}}` — Department

**Appointment**
- `{{appointment_date}}` — Appointment Date
- `{{appointment_time}}` — Appointment Time
- `{{appointment_id}}` — Appointment ID
- `{{branch_name}}` — Branch

**Invoice**
- `{{invoice_amount}}` — Invoice Amount
- `{{payment_status}}` — Payment Status

**Prescription**
- `{{prescription_id}}` — Prescription ID
- `{{pharmacy_link}}` — Pharmacy Link

**Medicine**
- `{{medicine_name}}` — Medicine
- `{{dosage}}` — Dosage
- `{{frequency}}` — Frequency
- `{{reminder_time}}` — Reminder Time
- `{{time}}` — Time
- `{{date}}` — Date

**Hospital**
- `{{hospital_name}}` — Hospital
- `{{hospital_phone}}` — Hospital Phone

**System**
- `{{workflow_id}}` — Workflow ID
- `{{triggered_at}}` — Triggered At

Messaging property panel inserts tokens via `ApiVariablePicker` (API variables for the workflow trigger, plus local catalog). Insertable fields: `subject`, `body`, `message`, `title`, `prompt`, `buttons`.

## Full Frontend JSON

Complete saved node object as produced for workflow configuration persistence (`serializeNode` / `configuration.nodes[]`). Shape is `{ id, type, position, data }` — canvas-only React Flow keys such as `dragHandle` / `selected` are **not** part of the saved Laravel payload.

### Complete saved node JSON

```json
{
  "id": "n_sendSms_1",
  "type": "workflow",
  "position": {
    "x": 280,
    "y": 160
  },
  "data": {
    "nodeType": "sendSms",
    "category": "messaging",
    "tone": "primary",
    "description": "Send an SMS using an approved template.",
    "label": "Send SMS",
    "status": "draft",
    "templateId": "",
    "recipient": "patient",
    "repeatReminder": false,
    "retryInterval": 15,
    "maxRetryCount": 2,
    "fallbackChannel": "",
    "variables": {},
    "message": ""
  }
}
```

### `node.data` only

```json
{
  "nodeType": "sendSms",
  "category": "messaging",
  "tone": "primary",
  "description": "Send an SMS using an approved template.",
  "label": "Send SMS",
  "status": "draft",
  "templateId": "",
  "recipient": "patient",
  "repeatReminder": false,
  "retryInterval": 15,
  "maxRetryCount": 2,
  "fallbackChannel": "",
  "variables": {},
  "message": ""
}
```

## Backend Mapping

| Frontend Node ID | `sendSms` |
| Trigger aliases (NodeTypeNormalizer-style, frontend) | _None in frontend `TRIGGER_TYPE_ALIASES`_ |
| Canonical backend type (from contracts) | `sendSms` (same id; Laravel `NodeTypeNormalizer` **not in this repo**) |
| Executor (from `automation/node-contracts.json`) | ActionDispatcher.#dispatchMessaging → ChannelManager.send (JS adapters currently stub adapters) |
| Backend status (contracts) | `partial` |

## Limitations / Notes

- Catalog description: Send SMS
- Next-step behavior (contracts): action=continue; follow first outgoing edge (parallel fan-out not implemented)
- `MessagingProperties` renders `schema.fields` only; shared defaults (`recipient`, retry fields) remain on `node.data` and are validated on save.
- JS `ChannelManager` adapters in this repo return stub successes; production delivery is Laravel-side.

---
# Node: sendEmail

## Basic Information

| Property | Value |
|---|---|
| Node ID | `sendEmail` |
| Display Name | Send Email |
| Purpose | Send a transactional email. Select a template, or enter subject and body manually. |
| Category | `messaging` |
| Node Type | `sendEmail` |
| Frontend Role | communication |
| Custom Panel | `messaging` |
| Property Panel Component | MessagingProperties (`PANEL_MAP.messaging`) |
| Backend Canonical Type | `sendEmail` |
| Backend Executor | ActionDispatcher.#dispatchMessaging → ChannelManager.send (JS adapters currently stub adapters) |
| Backend Status | `partial` |

## Fields

| Field | Type | Required | Default | Allowed Values | Variables Supported | Description |
|---|---|---|---|---|---|---|
| `nodeType` | string | Yes | sendEmail | `sendEmail` | No | Canonical frontend node type. Set by `createNodeDefaults`. |
| `category` | string | Yes | messaging | `messaging` | No | Catalog category id. |
| `tone` | string | No | primary | UI tone token from `toneForCategory` | No | Visual tone for the canvas node. |
| `description` | string | No | Send a transactional email. Select a template, or enter subject and body manually. | — | No | Human description copied from schema/catalog. |
| `label` | text | Yes | "Send Email" | — | No (field itself); node supports variable insertion into text fields | Display Name |
| `templateId` | templateSelect | No | "" | — | No (field itself); node supports variable insertion into text fields | Template |
| `subject` | text | No | "" | — | Yes (`{{token}}` via ApiVariablePicker) | Subject |
| `body` | textarea | No | "" | — | Yes (`{{token}}` via ApiVariablePicker) | Body. Placeholder: Email body |
| `recipient` | string | Yes | "patient" | `patient`, `doctor`, `caregiver`, `custom` | No | Present on node.data via createMessagingDefaults (saved with the node). Validated by validateWorkflowGraph as required. Only sendTemplate schema exposes recipient in the property panel; other messaging nodes still persist recipient on data. _(On node.data; may not appear in MessagingProperties schema.fields UI)_ |
| `repeatReminder` | boolean | No | false | — | No | Present on node.data via createMessagingDefaults (saved with the node). _(On node.data; may not appear in MessagingProperties schema.fields UI)_ |
| `retryInterval` | number | No | 15 | `5`, `10`, `15`, `30`, `60` | No | Present on node.data via createMessagingDefaults (saved with the node). Required by validateWorkflowGraph when repeatReminder is true. _(On node.data; may not appear in MessagingProperties schema.fields UI)_ |
| `maxRetryCount` | number | No | 2 | — | No | Present on node.data via createMessagingDefaults (saved with the node). Must be ≥ 1 when repeatReminder is true (validateWorkflowGraph). _(On node.data; may not appear in MessagingProperties schema.fields UI)_ |
| `fallbackChannel` | string | No | "" | `whatsapp`, `sms`, `email`, `push` or empty string | No | Present on node.data via createMessagingDefaults (saved with the node). _(On node.data; may not appear in MessagingProperties schema.fields UI)_ |
| `variables` | object | No | {} | — | No | Present on node.data via createMessagingDefaults (saved with the node). Object map reserved for template variables. _(On node.data; may not appear in MessagingProperties schema.fields UI)_ |
| `status` | string | No | "draft" | — | No | Present on node.data via createMessagingDefaults (saved with the node). _(On node.data; may not appear in MessagingProperties schema.fields UI)_ |

## Validation

### Graph-level (`validateWorkflowGraph`)
- Workflow must have nodes.
- Exactly one event trigger (`isTrigger` / `triggerKey`, excluding `start`).
- At least one `end` node.
- No cycles unless a `loop` node exists (catalog currently has no loop node).
- All non-start nodes must be connected when more than one node exists.
- Unknown node types are errors.

### Node-specific (`getMessagingFieldErrors` + `validateWorkflowGraph`)
- `recipient` must be set on node.data.
- When `repeatReminder` is true: `retryInterval` required; `maxRetryCount` ≥ 1.
- **sendWhatsApp / sendSms**: `templateId` and `message` required.
- **sendEmail**: template OR both `subject` and `body`.
- **sendPush**: template OR both `title` and `body`.
- **sendAiChat**: `templateId` and `prompt` required.
- **sendAiVoice**: template OR `prompt`.
- **sendIvr / sendTemplate**: `templateId` required (plus schema-required channel/recipient for sendTemplate).
- Catalog `fields` required-check also runs for required catalog fields.

## Variable Support

Variable tokens from `WORKFLOW_VARIABLE_GROUPS` (`src/components/flow/config/variables.js`):

**Patient**
- `{{patient_name}}` — Patient
- `{{patient_id}}` — Patient ID
- `{{patient_mobile}}` — Patient Mobile
- `{{patient_email}}` — Patient Email
- `{{patient_age}}` — Patient Age
- `{{patient_gender}}` — Patient Gender

**Doctor**
- `{{doctor_name}}` — Doctor
- `{{department}}` — Department

**Appointment**
- `{{appointment_date}}` — Appointment Date
- `{{appointment_time}}` — Appointment Time
- `{{appointment_id}}` — Appointment ID
- `{{branch_name}}` — Branch

**Invoice**
- `{{invoice_amount}}` — Invoice Amount
- `{{payment_status}}` — Payment Status

**Prescription**
- `{{prescription_id}}` — Prescription ID
- `{{pharmacy_link}}` — Pharmacy Link

**Medicine**
- `{{medicine_name}}` — Medicine
- `{{dosage}}` — Dosage
- `{{frequency}}` — Frequency
- `{{reminder_time}}` — Reminder Time
- `{{time}}` — Time
- `{{date}}` — Date

**Hospital**
- `{{hospital_name}}` — Hospital
- `{{hospital_phone}}` — Hospital Phone

**System**
- `{{workflow_id}}` — Workflow ID
- `{{triggered_at}}` — Triggered At

Messaging property panel inserts tokens via `ApiVariablePicker` (API variables for the workflow trigger, plus local catalog). Insertable fields: `subject`, `body`, `message`, `title`, `prompt`, `buttons`.

## Full Frontend JSON

Complete saved node object as produced for workflow configuration persistence (`serializeNode` / `configuration.nodes[]`). Shape is `{ id, type, position, data }` — canvas-only React Flow keys such as `dragHandle` / `selected` are **not** part of the saved Laravel payload.

### Complete saved node JSON

```json
{
  "id": "n_sendEmail_1",
  "type": "workflow",
  "position": {
    "x": 280,
    "y": 160
  },
  "data": {
    "nodeType": "sendEmail",
    "category": "messaging",
    "tone": "primary",
    "description": "Send a transactional email. Select a template, or enter subject and body manually.",
    "label": "Send Email",
    "status": "draft",
    "templateId": "",
    "recipient": "patient",
    "repeatReminder": false,
    "retryInterval": 15,
    "maxRetryCount": 2,
    "fallbackChannel": "",
    "variables": {},
    "subject": "",
    "body": ""
  }
}
```

### `node.data` only

```json
{
  "nodeType": "sendEmail",
  "category": "messaging",
  "tone": "primary",
  "description": "Send a transactional email. Select a template, or enter subject and body manually.",
  "label": "Send Email",
  "status": "draft",
  "templateId": "",
  "recipient": "patient",
  "repeatReminder": false,
  "retryInterval": 15,
  "maxRetryCount": 2,
  "fallbackChannel": "",
  "variables": {},
  "subject": "",
  "body": ""
}
```

## Backend Mapping

| Frontend Node ID | `sendEmail` |
| Trigger aliases (NodeTypeNormalizer-style, frontend) | _None in frontend `TRIGGER_TYPE_ALIASES`_ |
| Canonical backend type (from contracts) | `sendEmail` (same id; Laravel `NodeTypeNormalizer` **not in this repo**) |
| Executor (from `automation/node-contracts.json`) | ActionDispatcher.#dispatchMessaging → ChannelManager.send (JS adapters currently stub adapters) |
| Backend status (contracts) | `partial` |

## Limitations / Notes

- Catalog description: Send Email
- Next-step behavior (contracts): action=continue; follow first outgoing edge (parallel fan-out not implemented)
- `MessagingProperties` renders `schema.fields` only; shared defaults (`recipient`, retry fields) remain on `node.data` and are validated on save.
- JS `ChannelManager` adapters in this repo return stub successes; production delivery is Laravel-side.

---
# Node: sendPush

## Basic Information

| Property | Value |
|---|---|
| Node ID | `sendPush` |
| Display Name | Send Push Notification |
| Purpose | Deliver a push notification. Select a template, or enter title and body manually. |
| Category | `messaging` |
| Node Type | `sendPush` |
| Frontend Role | communication |
| Custom Panel | `messaging` |
| Property Panel Component | MessagingProperties (`PANEL_MAP.messaging`) |
| Backend Canonical Type | `sendPush` |
| Backend Executor | ActionDispatcher.#dispatchMessaging → ChannelManager.send (JS adapters currently stub adapters) |
| Backend Status | `partial` |

## Fields

| Field | Type | Required | Default | Allowed Values | Variables Supported | Description |
|---|---|---|---|---|---|---|
| `nodeType` | string | Yes | sendPush | `sendPush` | No | Canonical frontend node type. Set by `createNodeDefaults`. |
| `category` | string | Yes | messaging | `messaging` | No | Catalog category id. |
| `tone` | string | No | primary | UI tone token from `toneForCategory` | No | Visual tone for the canvas node. |
| `description` | string | No | Deliver a push notification. Select a template, or enter title and body manually. | — | No | Human description copied from schema/catalog. |
| `label` | text | Yes | "Send Push Notification" | — | No (field itself); node supports variable insertion into text fields | Display Name |
| `templateId` | templateSelect | No | "" | — | No (field itself); node supports variable insertion into text fields | Template |
| `title` | text | No | "" | — | Yes (`{{token}}` via ApiVariablePicker) | Title |
| `body` | textarea | No | "" | — | Yes (`{{token}}` via ApiVariablePicker) | Body |
| `priority` | select | No | "normal" | `normal` (Normal), `high` (High) | No (field itself); node supports variable insertion into text fields | Priority |
| `recipient` | string | Yes | "patient" | `patient`, `doctor`, `caregiver`, `custom` | No | Present on node.data via createMessagingDefaults (saved with the node). Validated by validateWorkflowGraph as required. Only sendTemplate schema exposes recipient in the property panel; other messaging nodes still persist recipient on data. _(On node.data; may not appear in MessagingProperties schema.fields UI)_ |
| `repeatReminder` | boolean | No | false | — | No | Present on node.data via createMessagingDefaults (saved with the node). _(On node.data; may not appear in MessagingProperties schema.fields UI)_ |
| `retryInterval` | number | No | 15 | `5`, `10`, `15`, `30`, `60` | No | Present on node.data via createMessagingDefaults (saved with the node). Required by validateWorkflowGraph when repeatReminder is true. _(On node.data; may not appear in MessagingProperties schema.fields UI)_ |
| `maxRetryCount` | number | No | 2 | — | No | Present on node.data via createMessagingDefaults (saved with the node). Must be ≥ 1 when repeatReminder is true (validateWorkflowGraph). _(On node.data; may not appear in MessagingProperties schema.fields UI)_ |
| `fallbackChannel` | string | No | "" | `whatsapp`, `sms`, `email`, `push` or empty string | No | Present on node.data via createMessagingDefaults (saved with the node). _(On node.data; may not appear in MessagingProperties schema.fields UI)_ |
| `variables` | object | No | {} | — | No | Present on node.data via createMessagingDefaults (saved with the node). Object map reserved for template variables. _(On node.data; may not appear in MessagingProperties schema.fields UI)_ |
| `status` | string | No | "draft" | — | No | Present on node.data via createMessagingDefaults (saved with the node). _(On node.data; may not appear in MessagingProperties schema.fields UI)_ |

## Validation

### Graph-level (`validateWorkflowGraph`)
- Workflow must have nodes.
- Exactly one event trigger (`isTrigger` / `triggerKey`, excluding `start`).
- At least one `end` node.
- No cycles unless a `loop` node exists (catalog currently has no loop node).
- All non-start nodes must be connected when more than one node exists.
- Unknown node types are errors.

### Node-specific (`getMessagingFieldErrors` + `validateWorkflowGraph`)
- `recipient` must be set on node.data.
- When `repeatReminder` is true: `retryInterval` required; `maxRetryCount` ≥ 1.
- **sendWhatsApp / sendSms**: `templateId` and `message` required.
- **sendEmail**: template OR both `subject` and `body`.
- **sendPush**: template OR both `title` and `body`.
- **sendAiChat**: `templateId` and `prompt` required.
- **sendAiVoice**: template OR `prompt`.
- **sendIvr / sendTemplate**: `templateId` required (plus schema-required channel/recipient for sendTemplate).
- Catalog `fields` required-check also runs for required catalog fields.

## Variable Support

Variable tokens from `WORKFLOW_VARIABLE_GROUPS` (`src/components/flow/config/variables.js`):

**Patient**
- `{{patient_name}}` — Patient
- `{{patient_id}}` — Patient ID
- `{{patient_mobile}}` — Patient Mobile
- `{{patient_email}}` — Patient Email
- `{{patient_age}}` — Patient Age
- `{{patient_gender}}` — Patient Gender

**Doctor**
- `{{doctor_name}}` — Doctor
- `{{department}}` — Department

**Appointment**
- `{{appointment_date}}` — Appointment Date
- `{{appointment_time}}` — Appointment Time
- `{{appointment_id}}` — Appointment ID
- `{{branch_name}}` — Branch

**Invoice**
- `{{invoice_amount}}` — Invoice Amount
- `{{payment_status}}` — Payment Status

**Prescription**
- `{{prescription_id}}` — Prescription ID
- `{{pharmacy_link}}` — Pharmacy Link

**Medicine**
- `{{medicine_name}}` — Medicine
- `{{dosage}}` — Dosage
- `{{frequency}}` — Frequency
- `{{reminder_time}}` — Reminder Time
- `{{time}}` — Time
- `{{date}}` — Date

**Hospital**
- `{{hospital_name}}` — Hospital
- `{{hospital_phone}}` — Hospital Phone

**System**
- `{{workflow_id}}` — Workflow ID
- `{{triggered_at}}` — Triggered At

Messaging property panel inserts tokens via `ApiVariablePicker` (API variables for the workflow trigger, plus local catalog). Insertable fields: `subject`, `body`, `message`, `title`, `prompt`, `buttons`.

## Full Frontend JSON

Complete saved node object as produced for workflow configuration persistence (`serializeNode` / `configuration.nodes[]`). Shape is `{ id, type, position, data }` — canvas-only React Flow keys such as `dragHandle` / `selected` are **not** part of the saved Laravel payload.

### Complete saved node JSON

```json
{
  "id": "n_sendPush_1",
  "type": "workflow",
  "position": {
    "x": 280,
    "y": 160
  },
  "data": {
    "nodeType": "sendPush",
    "category": "messaging",
    "tone": "primary",
    "description": "Deliver a push notification. Select a template, or enter title and body manually.",
    "label": "Send Push Notification",
    "status": "draft",
    "templateId": "",
    "recipient": "patient",
    "repeatReminder": false,
    "retryInterval": 15,
    "maxRetryCount": 2,
    "fallbackChannel": "",
    "variables": {},
    "title": "",
    "body": "",
    "priority": "normal"
  }
}
```

### `node.data` only

```json
{
  "nodeType": "sendPush",
  "category": "messaging",
  "tone": "primary",
  "description": "Deliver a push notification. Select a template, or enter title and body manually.",
  "label": "Send Push Notification",
  "status": "draft",
  "templateId": "",
  "recipient": "patient",
  "repeatReminder": false,
  "retryInterval": 15,
  "maxRetryCount": 2,
  "fallbackChannel": "",
  "variables": {},
  "title": "",
  "body": "",
  "priority": "normal"
}
```

## Backend Mapping

| Frontend Node ID | `sendPush` |
| Trigger aliases (NodeTypeNormalizer-style, frontend) | _None in frontend `TRIGGER_TYPE_ALIASES`_ |
| Canonical backend type (from contracts) | `sendPush` (same id; Laravel `NodeTypeNormalizer` **not in this repo**) |
| Executor (from `automation/node-contracts.json`) | ActionDispatcher.#dispatchMessaging → ChannelManager.send (JS adapters currently stub adapters) |
| Backend status (contracts) | `partial` |

## Limitations / Notes

- Catalog description: Send Push Notification
- Next-step behavior (contracts): action=continue; follow first outgoing edge (parallel fan-out not implemented)
- `MessagingProperties` renders `schema.fields` only; shared defaults (`recipient`, retry fields) remain on `node.data` and are validated on save.
- JS `ChannelManager` adapters in this repo return stub successes; production delivery is Laravel-side.

---
# Node: sendAiChat

## Basic Information

| Property | Value |
|---|---|
| Node ID | `sendAiChat` |
| Display Name | Send AI Chat |
| Purpose | Start an AI chat conversation with the patient. |
| Category | `messaging` |
| Node Type | `sendAiChat` |
| Frontend Role | communication |
| Custom Panel | `messaging` |
| Property Panel Component | MessagingProperties (`PANEL_MAP.messaging`) |
| Backend Canonical Type | `sendAiChat` |
| Backend Executor | ActionDispatcher.#dispatchMessaging → ChannelManager.send (JS adapters currently stub adapters) |
| Backend Status | `partial` |

## Fields

| Field | Type | Required | Default | Allowed Values | Variables Supported | Description |
|---|---|---|---|---|---|---|
| `nodeType` | string | Yes | sendAiChat | `sendAiChat` | No | Canonical frontend node type. Set by `createNodeDefaults`. |
| `category` | string | Yes | messaging | `messaging` | No | Catalog category id. |
| `tone` | string | No | primary | UI tone token from `toneForCategory` | No | Visual tone for the canvas node. |
| `description` | string | No | Start an AI chat conversation with the patient. | — | No | Human description copied from schema/catalog. |
| `label` | text | Yes | "Send AI Chat" | — | No (field itself); node supports variable insertion into text fields | Display Name |
| `templateId` | templateSelect | Yes | "" | — | No (field itself); node supports variable insertion into text fields | Template |
| `prompt` | textarea | Yes | "You are a helpful hospital care assistant." | — | Yes (`{{token}}` via ApiVariablePicker) | Prompt |
| `temperature` | number | No | 0.7 | — | No (field itself); node supports variable insertion into text fields | Temperature. min=0. max=2 |
| `recipient` | string | Yes | "patient" | `patient`, `doctor`, `caregiver`, `custom` | No | Present on node.data via createMessagingDefaults (saved with the node). Validated by validateWorkflowGraph as required. Only sendTemplate schema exposes recipient in the property panel; other messaging nodes still persist recipient on data. _(On node.data; may not appear in MessagingProperties schema.fields UI)_ |
| `repeatReminder` | boolean | No | false | — | No | Present on node.data via createMessagingDefaults (saved with the node). _(On node.data; may not appear in MessagingProperties schema.fields UI)_ |
| `retryInterval` | number | No | 15 | `5`, `10`, `15`, `30`, `60` | No | Present on node.data via createMessagingDefaults (saved with the node). Required by validateWorkflowGraph when repeatReminder is true. _(On node.data; may not appear in MessagingProperties schema.fields UI)_ |
| `maxRetryCount` | number | No | 2 | — | No | Present on node.data via createMessagingDefaults (saved with the node). Must be ≥ 1 when repeatReminder is true (validateWorkflowGraph). _(On node.data; may not appear in MessagingProperties schema.fields UI)_ |
| `fallbackChannel` | string | No | "" | `whatsapp`, `sms`, `email`, `push` or empty string | No | Present on node.data via createMessagingDefaults (saved with the node). _(On node.data; may not appear in MessagingProperties schema.fields UI)_ |
| `variables` | object | No | {} | — | No | Present on node.data via createMessagingDefaults (saved with the node). Object map reserved for template variables. _(On node.data; may not appear in MessagingProperties schema.fields UI)_ |
| `status` | string | No | "draft" | — | No | Present on node.data via createMessagingDefaults (saved with the node). _(On node.data; may not appear in MessagingProperties schema.fields UI)_ |

## Validation

### Graph-level (`validateWorkflowGraph`)
- Workflow must have nodes.
- Exactly one event trigger (`isTrigger` / `triggerKey`, excluding `start`).
- At least one `end` node.
- No cycles unless a `loop` node exists (catalog currently has no loop node).
- All non-start nodes must be connected when more than one node exists.
- Unknown node types are errors.

### Node-specific (`getMessagingFieldErrors` + `validateWorkflowGraph`)
- `recipient` must be set on node.data.
- When `repeatReminder` is true: `retryInterval` required; `maxRetryCount` ≥ 1.
- **sendWhatsApp / sendSms**: `templateId` and `message` required.
- **sendEmail**: template OR both `subject` and `body`.
- **sendPush**: template OR both `title` and `body`.
- **sendAiChat**: `templateId` and `prompt` required.
- **sendAiVoice**: template OR `prompt`.
- **sendIvr / sendTemplate**: `templateId` required (plus schema-required channel/recipient for sendTemplate).
- Catalog `fields` required-check also runs for required catalog fields.

## Variable Support

Variable tokens from `WORKFLOW_VARIABLE_GROUPS` (`src/components/flow/config/variables.js`):

**Patient**
- `{{patient_name}}` — Patient
- `{{patient_id}}` — Patient ID
- `{{patient_mobile}}` — Patient Mobile
- `{{patient_email}}` — Patient Email
- `{{patient_age}}` — Patient Age
- `{{patient_gender}}` — Patient Gender

**Doctor**
- `{{doctor_name}}` — Doctor
- `{{department}}` — Department

**Appointment**
- `{{appointment_date}}` — Appointment Date
- `{{appointment_time}}` — Appointment Time
- `{{appointment_id}}` — Appointment ID
- `{{branch_name}}` — Branch

**Invoice**
- `{{invoice_amount}}` — Invoice Amount
- `{{payment_status}}` — Payment Status

**Prescription**
- `{{prescription_id}}` — Prescription ID
- `{{pharmacy_link}}` — Pharmacy Link

**Medicine**
- `{{medicine_name}}` — Medicine
- `{{dosage}}` — Dosage
- `{{frequency}}` — Frequency
- `{{reminder_time}}` — Reminder Time
- `{{time}}` — Time
- `{{date}}` — Date

**Hospital**
- `{{hospital_name}}` — Hospital
- `{{hospital_phone}}` — Hospital Phone

**System**
- `{{workflow_id}}` — Workflow ID
- `{{triggered_at}}` — Triggered At

Messaging property panel inserts tokens via `ApiVariablePicker` (API variables for the workflow trigger, plus local catalog). Insertable fields: `subject`, `body`, `message`, `title`, `prompt`, `buttons`.

## Full Frontend JSON

Complete saved node object as produced for workflow configuration persistence (`serializeNode` / `configuration.nodes[]`). Shape is `{ id, type, position, data }` — canvas-only React Flow keys such as `dragHandle` / `selected` are **not** part of the saved Laravel payload.

### Complete saved node JSON

```json
{
  "id": "n_sendAiChat_1",
  "type": "workflow",
  "position": {
    "x": 280,
    "y": 160
  },
  "data": {
    "nodeType": "sendAiChat",
    "category": "messaging",
    "tone": "primary",
    "description": "Start an AI chat conversation with the patient.",
    "label": "Send AI Chat",
    "status": "draft",
    "templateId": "",
    "recipient": "patient",
    "repeatReminder": false,
    "retryInterval": 15,
    "maxRetryCount": 2,
    "fallbackChannel": "",
    "variables": {},
    "prompt": "You are a helpful hospital care assistant.",
    "temperature": 0.7
  }
}
```

### `node.data` only

```json
{
  "nodeType": "sendAiChat",
  "category": "messaging",
  "tone": "primary",
  "description": "Start an AI chat conversation with the patient.",
  "label": "Send AI Chat",
  "status": "draft",
  "templateId": "",
  "recipient": "patient",
  "repeatReminder": false,
  "retryInterval": 15,
  "maxRetryCount": 2,
  "fallbackChannel": "",
  "variables": {},
  "prompt": "You are a helpful hospital care assistant.",
  "temperature": 0.7
}
```

## Backend Mapping

| Frontend Node ID | `sendAiChat` |
| Trigger aliases (NodeTypeNormalizer-style, frontend) | _None in frontend `TRIGGER_TYPE_ALIASES`_ |
| Canonical backend type (from contracts) | `sendAiChat` (same id; Laravel `NodeTypeNormalizer` **not in this repo**) |
| Executor (from `automation/node-contracts.json`) | ActionDispatcher.#dispatchMessaging → ChannelManager.send (JS adapters currently stub adapters) |
| Backend status (contracts) | `partial` |

## Limitations / Notes

- Catalog description: Send AI Chat
- Next-step behavior (contracts): action=continue; follow first outgoing edge (parallel fan-out not implemented)
- `MessagingProperties` renders `schema.fields` only; shared defaults (`recipient`, retry fields) remain on `node.data` and are validated on save.
- JS `ChannelManager` adapters in this repo return stub successes; production delivery is Laravel-side.

---
# Node: sendAiVoice

## Basic Information

| Property | Value |
|---|---|
| Node ID | `sendAiVoice` |
| Display Name | Send AI Voice Call |
| Purpose | Place an AI voice call to the patient. |
| Category | `messaging` |
| Node Type | `sendAiVoice` |
| Frontend Role | communication |
| Custom Panel | `messaging` |
| Property Panel Component | MessagingProperties (`PANEL_MAP.messaging`) |
| Backend Canonical Type | `sendAiVoice` |
| Backend Executor | ActionDispatcher.#dispatchMessaging → ChannelManager.send (JS adapters currently stub adapters) |
| Backend Status | `partial` |

## Fields

| Field | Type | Required | Default | Allowed Values | Variables Supported | Description |
|---|---|---|---|---|---|---|
| `nodeType` | string | Yes | sendAiVoice | `sendAiVoice` | No | Canonical frontend node type. Set by `createNodeDefaults`. |
| `category` | string | Yes | messaging | `messaging` | No | Catalog category id. |
| `tone` | string | No | primary | UI tone token from `toneForCategory` | No | Visual tone for the canvas node. |
| `description` | string | No | Place an AI voice call to the patient. | — | No | Human description copied from schema/catalog. |
| `label` | text | Yes | "Send AI Voice Call" | — | No (field itself); node supports variable insertion into text fields | Display Name |
| `voiceProvider` | select | Yes | "default" | `default` (Default Hospital Voice), `openai` (OpenAI), `azure` (Azure), `custom` (Custom) | No (field itself); node supports variable insertion into text fields | Voice Provider |
| `templateId` | templateSelect | No | "" | — | No (field itself); node supports variable insertion into text fields | Template |
| `prompt` | textarea | Yes | "" | — | Yes (`{{token}}` via ApiVariablePicker) | Prompt. Placeholder: Spoken script or AI prompt… |
| `language` | select | No | "en" | `en` (English), `hi` (Hindi), `ta` (Tamil), `te` (Telugu), `ar` (Arabic) | No (field itself); node supports variable insertion into text fields | Language |
| `voice` | text | No | "" | — | No (field itself); node supports variable insertion into text fields | Voice. Placeholder: e.g. alloy, nova |
| `gender` | select | No | "neutral" | `neutral` (Neutral), `female` (Female), `male` (Male) | No (field itself); node supports variable insertion into text fields | Gender |
| `retryCount` | number | No | 1 | — | No (field itself); node supports variable insertion into text fields | Retry Count. min=0. max=5 |
| `recipient` | string | Yes | "patient" | `patient`, `doctor`, `caregiver`, `custom` | No | Present on node.data via createMessagingDefaults (saved with the node). Validated by validateWorkflowGraph as required. Only sendTemplate schema exposes recipient in the property panel; other messaging nodes still persist recipient on data. _(On node.data; may not appear in MessagingProperties schema.fields UI)_ |
| `repeatReminder` | boolean | No | false | — | No | Present on node.data via createMessagingDefaults (saved with the node). _(On node.data; may not appear in MessagingProperties schema.fields UI)_ |
| `retryInterval` | number | No | 15 | `5`, `10`, `15`, `30`, `60` | No | Present on node.data via createMessagingDefaults (saved with the node). Required by validateWorkflowGraph when repeatReminder is true. _(On node.data; may not appear in MessagingProperties schema.fields UI)_ |
| `maxRetryCount` | number | No | 2 | — | No | Present on node.data via createMessagingDefaults (saved with the node). Must be ≥ 1 when repeatReminder is true (validateWorkflowGraph). _(On node.data; may not appear in MessagingProperties schema.fields UI)_ |
| `fallbackChannel` | string | No | "" | `whatsapp`, `sms`, `email`, `push` or empty string | No | Present on node.data via createMessagingDefaults (saved with the node). _(On node.data; may not appear in MessagingProperties schema.fields UI)_ |
| `variables` | object | No | {} | — | No | Present on node.data via createMessagingDefaults (saved with the node). Object map reserved for template variables. _(On node.data; may not appear in MessagingProperties schema.fields UI)_ |
| `status` | string | No | "draft" | — | No | Present on node.data via createMessagingDefaults (saved with the node). _(On node.data; may not appear in MessagingProperties schema.fields UI)_ |

## Validation

### Graph-level (`validateWorkflowGraph`)
- Workflow must have nodes.
- Exactly one event trigger (`isTrigger` / `triggerKey`, excluding `start`).
- At least one `end` node.
- No cycles unless a `loop` node exists (catalog currently has no loop node).
- All non-start nodes must be connected when more than one node exists.
- Unknown node types are errors.

### Node-specific (`getMessagingFieldErrors` + `validateWorkflowGraph`)
- `recipient` must be set on node.data.
- When `repeatReminder` is true: `retryInterval` required; `maxRetryCount` ≥ 1.
- **sendWhatsApp / sendSms**: `templateId` and `message` required.
- **sendEmail**: template OR both `subject` and `body`.
- **sendPush**: template OR both `title` and `body`.
- **sendAiChat**: `templateId` and `prompt` required.
- **sendAiVoice**: template OR `prompt`.
- **sendIvr / sendTemplate**: `templateId` required (plus schema-required channel/recipient for sendTemplate).
- Catalog `fields` required-check also runs for required catalog fields.

## Variable Support

Variable tokens from `WORKFLOW_VARIABLE_GROUPS` (`src/components/flow/config/variables.js`):

**Patient**
- `{{patient_name}}` — Patient
- `{{patient_id}}` — Patient ID
- `{{patient_mobile}}` — Patient Mobile
- `{{patient_email}}` — Patient Email
- `{{patient_age}}` — Patient Age
- `{{patient_gender}}` — Patient Gender

**Doctor**
- `{{doctor_name}}` — Doctor
- `{{department}}` — Department

**Appointment**
- `{{appointment_date}}` — Appointment Date
- `{{appointment_time}}` — Appointment Time
- `{{appointment_id}}` — Appointment ID
- `{{branch_name}}` — Branch

**Invoice**
- `{{invoice_amount}}` — Invoice Amount
- `{{payment_status}}` — Payment Status

**Prescription**
- `{{prescription_id}}` — Prescription ID
- `{{pharmacy_link}}` — Pharmacy Link

**Medicine**
- `{{medicine_name}}` — Medicine
- `{{dosage}}` — Dosage
- `{{frequency}}` — Frequency
- `{{reminder_time}}` — Reminder Time
- `{{time}}` — Time
- `{{date}}` — Date

**Hospital**
- `{{hospital_name}}` — Hospital
- `{{hospital_phone}}` — Hospital Phone

**System**
- `{{workflow_id}}` — Workflow ID
- `{{triggered_at}}` — Triggered At

Messaging property panel inserts tokens via `ApiVariablePicker` (API variables for the workflow trigger, plus local catalog). Insertable fields: `subject`, `body`, `message`, `title`, `prompt`, `buttons`.

## Full Frontend JSON

Complete saved node object as produced for workflow configuration persistence (`serializeNode` / `configuration.nodes[]`). Shape is `{ id, type, position, data }` — canvas-only React Flow keys such as `dragHandle` / `selected` are **not** part of the saved Laravel payload.

### Complete saved node JSON

```json
{
  "id": "n_sendAiVoice_1",
  "type": "workflow",
  "position": {
    "x": 280,
    "y": 160
  },
  "data": {
    "nodeType": "sendAiVoice",
    "category": "messaging",
    "tone": "primary",
    "description": "Place an AI voice call to the patient.",
    "label": "Send AI Voice Call",
    "status": "draft",
    "templateId": "",
    "recipient": "patient",
    "repeatReminder": false,
    "retryInterval": 15,
    "maxRetryCount": 2,
    "fallbackChannel": "",
    "variables": {},
    "voiceProvider": "default",
    "prompt": "",
    "language": "en",
    "voice": "",
    "gender": "neutral",
    "retryCount": 1
  }
}
```

### `node.data` only

```json
{
  "nodeType": "sendAiVoice",
  "category": "messaging",
  "tone": "primary",
  "description": "Place an AI voice call to the patient.",
  "label": "Send AI Voice Call",
  "status": "draft",
  "templateId": "",
  "recipient": "patient",
  "repeatReminder": false,
  "retryInterval": 15,
  "maxRetryCount": 2,
  "fallbackChannel": "",
  "variables": {},
  "voiceProvider": "default",
  "prompt": "",
  "language": "en",
  "voice": "",
  "gender": "neutral",
  "retryCount": 1
}
```

## Backend Mapping

| Frontend Node ID | `sendAiVoice` |
| Trigger aliases (NodeTypeNormalizer-style, frontend) | _None in frontend `TRIGGER_TYPE_ALIASES`_ |
| Canonical backend type (from contracts) | `sendAiVoice` (same id; Laravel `NodeTypeNormalizer` **not in this repo**) |
| Executor (from `automation/node-contracts.json`) | ActionDispatcher.#dispatchMessaging → ChannelManager.send (JS adapters currently stub adapters) |
| Backend status (contracts) | `partial` |

## Limitations / Notes

- Catalog description: Send AI Voice Call
- Next-step behavior (contracts): action=continue; follow first outgoing edge (parallel fan-out not implemented)
- `MessagingProperties` renders `schema.fields` only; shared defaults (`recipient`, retry fields) remain on `node.data` and are validated on save.
- JS `ChannelManager` adapters in this repo return stub successes; production delivery is Laravel-side.

---
# Node: sendIvr

## Basic Information

| Property | Value |
|---|---|
| Node ID | `sendIvr` |
| Display Name | Send IVR |
| Purpose | Send an IVR call with a voice template. |
| Category | `messaging` |
| Node Type | `sendIvr` |
| Frontend Role | communication |
| Custom Panel | `messaging` |
| Property Panel Component | MessagingProperties (`PANEL_MAP.messaging`) |
| Backend Canonical Type | `sendIvr` |
| Backend Executor | ActionDispatcher.#dispatchMessaging → ChannelManager.send (JS adapters currently stub adapters) |
| Backend Status | `partial` |

## Fields

| Field | Type | Required | Default | Allowed Values | Variables Supported | Description |
|---|---|---|---|---|---|---|
| `nodeType` | string | Yes | sendIvr | `sendIvr` | No | Canonical frontend node type. Set by `createNodeDefaults`. |
| `category` | string | Yes | messaging | `messaging` | No | Catalog category id. |
| `tone` | string | No | primary | UI tone token from `toneForCategory` | No | Visual tone for the canvas node. |
| `description` | string | No | Send an IVR call with a voice template. | — | No | Human description copied from schema/catalog. |
| `label` | text | Yes | "Send IVR" | — | No (field itself); node supports variable insertion into text fields | Display Name |
| `templateId` | templateSelect | Yes | "" | — | No (field itself); node supports variable insertion into text fields | Template |
| `recipient` | string | Yes | "patient" | `patient`, `doctor`, `caregiver`, `custom` | No | Present on node.data via createMessagingDefaults (saved with the node). Validated by validateWorkflowGraph as required. Only sendTemplate schema exposes recipient in the property panel; other messaging nodes still persist recipient on data. _(On node.data; may not appear in MessagingProperties schema.fields UI)_ |
| `repeatReminder` | boolean | No | false | — | No | Present on node.data via createMessagingDefaults (saved with the node). _(On node.data; may not appear in MessagingProperties schema.fields UI)_ |
| `retryInterval` | number | No | 15 | `5`, `10`, `15`, `30`, `60` | No | Present on node.data via createMessagingDefaults (saved with the node). Required by validateWorkflowGraph when repeatReminder is true. _(On node.data; may not appear in MessagingProperties schema.fields UI)_ |
| `maxRetryCount` | number | No | 2 | — | No | Present on node.data via createMessagingDefaults (saved with the node). Must be ≥ 1 when repeatReminder is true (validateWorkflowGraph). _(On node.data; may not appear in MessagingProperties schema.fields UI)_ |
| `fallbackChannel` | string | No | "" | `whatsapp`, `sms`, `email`, `push` or empty string | No | Present on node.data via createMessagingDefaults (saved with the node). _(On node.data; may not appear in MessagingProperties schema.fields UI)_ |
| `variables` | object | No | {} | — | No | Present on node.data via createMessagingDefaults (saved with the node). Object map reserved for template variables. _(On node.data; may not appear in MessagingProperties schema.fields UI)_ |
| `status` | string | No | "draft" | — | No | Present on node.data via createMessagingDefaults (saved with the node). _(On node.data; may not appear in MessagingProperties schema.fields UI)_ |

## Validation

### Graph-level (`validateWorkflowGraph`)
- Workflow must have nodes.
- Exactly one event trigger (`isTrigger` / `triggerKey`, excluding `start`).
- At least one `end` node.
- No cycles unless a `loop` node exists (catalog currently has no loop node).
- All non-start nodes must be connected when more than one node exists.
- Unknown node types are errors.

### Node-specific (`getMessagingFieldErrors` + `validateWorkflowGraph`)
- `recipient` must be set on node.data.
- When `repeatReminder` is true: `retryInterval` required; `maxRetryCount` ≥ 1.
- **sendWhatsApp / sendSms**: `templateId` and `message` required.
- **sendEmail**: template OR both `subject` and `body`.
- **sendPush**: template OR both `title` and `body`.
- **sendAiChat**: `templateId` and `prompt` required.
- **sendAiVoice**: template OR `prompt`.
- **sendIvr / sendTemplate**: `templateId` required (plus schema-required channel/recipient for sendTemplate).
- Catalog `fields` required-check also runs for required catalog fields.

## Variable Support

Variable tokens from `WORKFLOW_VARIABLE_GROUPS` (`src/components/flow/config/variables.js`):

**Patient**
- `{{patient_name}}` — Patient
- `{{patient_id}}` — Patient ID
- `{{patient_mobile}}` — Patient Mobile
- `{{patient_email}}` — Patient Email
- `{{patient_age}}` — Patient Age
- `{{patient_gender}}` — Patient Gender

**Doctor**
- `{{doctor_name}}` — Doctor
- `{{department}}` — Department

**Appointment**
- `{{appointment_date}}` — Appointment Date
- `{{appointment_time}}` — Appointment Time
- `{{appointment_id}}` — Appointment ID
- `{{branch_name}}` — Branch

**Invoice**
- `{{invoice_amount}}` — Invoice Amount
- `{{payment_status}}` — Payment Status

**Prescription**
- `{{prescription_id}}` — Prescription ID
- `{{pharmacy_link}}` — Pharmacy Link

**Medicine**
- `{{medicine_name}}` — Medicine
- `{{dosage}}` — Dosage
- `{{frequency}}` — Frequency
- `{{reminder_time}}` — Reminder Time
- `{{time}}` — Time
- `{{date}}` — Date

**Hospital**
- `{{hospital_name}}` — Hospital
- `{{hospital_phone}}` — Hospital Phone

**System**
- `{{workflow_id}}` — Workflow ID
- `{{triggered_at}}` — Triggered At

Messaging property panel inserts tokens via `ApiVariablePicker` (API variables for the workflow trigger, plus local catalog). Insertable fields: `subject`, `body`, `message`, `title`, `prompt`, `buttons`.

## Full Frontend JSON

Complete saved node object as produced for workflow configuration persistence (`serializeNode` / `configuration.nodes[]`). Shape is `{ id, type, position, data }` — canvas-only React Flow keys such as `dragHandle` / `selected` are **not** part of the saved Laravel payload.

### Complete saved node JSON

```json
{
  "id": "n_sendIvr_1",
  "type": "workflow",
  "position": {
    "x": 280,
    "y": 160
  },
  "data": {
    "nodeType": "sendIvr",
    "category": "messaging",
    "tone": "primary",
    "description": "Send an IVR call with a voice template.",
    "label": "Send IVR",
    "status": "draft",
    "templateId": "",
    "recipient": "patient",
    "repeatReminder": false,
    "retryInterval": 15,
    "maxRetryCount": 2,
    "fallbackChannel": "",
    "variables": {}
  }
}
```

### `node.data` only

```json
{
  "nodeType": "sendIvr",
  "category": "messaging",
  "tone": "primary",
  "description": "Send an IVR call with a voice template.",
  "label": "Send IVR",
  "status": "draft",
  "templateId": "",
  "recipient": "patient",
  "repeatReminder": false,
  "retryInterval": 15,
  "maxRetryCount": 2,
  "fallbackChannel": "",
  "variables": {}
}
```

## Backend Mapping

| Frontend Node ID | `sendIvr` |
| Trigger aliases (NodeTypeNormalizer-style, frontend) | _None in frontend `TRIGGER_TYPE_ALIASES`_ |
| Canonical backend type (from contracts) | `sendIvr` (same id; Laravel `NodeTypeNormalizer` **not in this repo**) |
| Executor (from `automation/node-contracts.json`) | ActionDispatcher.#dispatchMessaging → ChannelManager.send (JS adapters currently stub adapters) |
| Backend status (contracts) | `partial` |

## Limitations / Notes

- Catalog description: Send IVR
- Next-step behavior (contracts): action=continue; follow first outgoing edge (parallel fan-out not implemented)
- `MessagingProperties` renders `schema.fields` only; shared defaults (`recipient`, retry fields) remain on `node.data` and are validated on save.
- JS `ChannelManager` adapters in this repo return stub successes; production delivery is Laravel-side.

---
# Node: sendTemplate

## Basic Information

| Property | Value |
|---|---|
| Node ID | `sendTemplate` |
| Display Name | Send Template |
| Purpose | Send a multi-channel approved template. |
| Category | `messaging` |
| Node Type | `sendTemplate` |
| Frontend Role | communication |
| Custom Panel | `messaging` |
| Property Panel Component | MessagingProperties (`PANEL_MAP.messaging`) |
| Backend Canonical Type | `sendTemplate` |
| Backend Executor | ActionDispatcher.#dispatchMessaging → ChannelManager.send (JS adapters currently stub adapters) |
| Backend Status | `partial` |

## Fields

| Field | Type | Required | Default | Allowed Values | Variables Supported | Description |
|---|---|---|---|---|---|---|
| `nodeType` | string | Yes | sendTemplate | `sendTemplate` | No | Canonical frontend node type. Set by `createNodeDefaults`. |
| `category` | string | Yes | messaging | `messaging` | No | Catalog category id. |
| `tone` | string | No | primary | UI tone token from `toneForCategory` | No | Visual tone for the canvas node. |
| `description` | string | No | Send a multi-channel approved template. | — | No | Human description copied from schema/catalog. |
| `label` | text | Yes | "Send Template" | — | No (field itself); node supports variable insertion into text fields | Display Name |
| `templateId` | templateSelect | Yes | "" | — | No (field itself); node supports variable insertion into text fields | Template |
| `channel` | select | Yes | "whatsapp" | `whatsapp` (WhatsApp), `sms` (SMS), `email` (Email), `push` (Push Notification) | No (field itself); node supports variable insertion into text fields | Primary Channel |
| `recipient` | select | Yes | "patient" | `patient` (Patient), `doctor` (Doctor), `caregiver` (Caregiver), `custom` (Custom expression) | No (field itself); node supports variable insertion into text fields | Recipient |
| `repeatReminder` | boolean | No | false | — | No | Present on node.data via createMessagingDefaults (saved with the node). _(On node.data; may not appear in MessagingProperties schema.fields UI)_ |
| `retryInterval` | number | No | 15 | `5`, `10`, `15`, `30`, `60` | No | Present on node.data via createMessagingDefaults (saved with the node). Required by validateWorkflowGraph when repeatReminder is true. _(On node.data; may not appear in MessagingProperties schema.fields UI)_ |
| `maxRetryCount` | number | No | 2 | — | No | Present on node.data via createMessagingDefaults (saved with the node). Must be ≥ 1 when repeatReminder is true (validateWorkflowGraph). _(On node.data; may not appear in MessagingProperties schema.fields UI)_ |
| `fallbackChannel` | string | No | "" | `whatsapp`, `sms`, `email`, `push` or empty string | No | Present on node.data via createMessagingDefaults (saved with the node). _(On node.data; may not appear in MessagingProperties schema.fields UI)_ |
| `variables` | object | No | {} | — | No | Present on node.data via createMessagingDefaults (saved with the node). Object map reserved for template variables. _(On node.data; may not appear in MessagingProperties schema.fields UI)_ |
| `status` | string | No | "draft" | — | No | Present on node.data via createMessagingDefaults (saved with the node). _(On node.data; may not appear in MessagingProperties schema.fields UI)_ |

## Validation

### Graph-level (`validateWorkflowGraph`)
- Workflow must have nodes.
- Exactly one event trigger (`isTrigger` / `triggerKey`, excluding `start`).
- At least one `end` node.
- No cycles unless a `loop` node exists (catalog currently has no loop node).
- All non-start nodes must be connected when more than one node exists.
- Unknown node types are errors.

### Node-specific (`getMessagingFieldErrors` + `validateWorkflowGraph`)
- `recipient` must be set on node.data.
- When `repeatReminder` is true: `retryInterval` required; `maxRetryCount` ≥ 1.
- **sendWhatsApp / sendSms**: `templateId` and `message` required.
- **sendEmail**: template OR both `subject` and `body`.
- **sendPush**: template OR both `title` and `body`.
- **sendAiChat**: `templateId` and `prompt` required.
- **sendAiVoice**: template OR `prompt`.
- **sendIvr / sendTemplate**: `templateId` required (plus schema-required channel/recipient for sendTemplate).
- Catalog `fields` required-check also runs for required catalog fields.

## Variable Support

Variable tokens from `WORKFLOW_VARIABLE_GROUPS` (`src/components/flow/config/variables.js`):

**Patient**
- `{{patient_name}}` — Patient
- `{{patient_id}}` — Patient ID
- `{{patient_mobile}}` — Patient Mobile
- `{{patient_email}}` — Patient Email
- `{{patient_age}}` — Patient Age
- `{{patient_gender}}` — Patient Gender

**Doctor**
- `{{doctor_name}}` — Doctor
- `{{department}}` — Department

**Appointment**
- `{{appointment_date}}` — Appointment Date
- `{{appointment_time}}` — Appointment Time
- `{{appointment_id}}` — Appointment ID
- `{{branch_name}}` — Branch

**Invoice**
- `{{invoice_amount}}` — Invoice Amount
- `{{payment_status}}` — Payment Status

**Prescription**
- `{{prescription_id}}` — Prescription ID
- `{{pharmacy_link}}` — Pharmacy Link

**Medicine**
- `{{medicine_name}}` — Medicine
- `{{dosage}}` — Dosage
- `{{frequency}}` — Frequency
- `{{reminder_time}}` — Reminder Time
- `{{time}}` — Time
- `{{date}}` — Date

**Hospital**
- `{{hospital_name}}` — Hospital
- `{{hospital_phone}}` — Hospital Phone

**System**
- `{{workflow_id}}` — Workflow ID
- `{{triggered_at}}` — Triggered At

Messaging property panel inserts tokens via `ApiVariablePicker` (API variables for the workflow trigger, plus local catalog). Insertable fields: `subject`, `body`, `message`, `title`, `prompt`, `buttons`.

## Full Frontend JSON

Complete saved node object as produced for workflow configuration persistence (`serializeNode` / `configuration.nodes[]`). Shape is `{ id, type, position, data }` — canvas-only React Flow keys such as `dragHandle` / `selected` are **not** part of the saved Laravel payload.

### Complete saved node JSON

```json
{
  "id": "n_sendTemplate_1",
  "type": "workflow",
  "position": {
    "x": 280,
    "y": 160
  },
  "data": {
    "nodeType": "sendTemplate",
    "category": "messaging",
    "tone": "primary",
    "description": "Send a multi-channel approved template.",
    "label": "Send Template",
    "status": "draft",
    "templateId": "",
    "recipient": "patient",
    "repeatReminder": false,
    "retryInterval": 15,
    "maxRetryCount": 2,
    "fallbackChannel": "",
    "variables": {},
    "channel": "whatsapp"
  }
}
```

### `node.data` only

```json
{
  "nodeType": "sendTemplate",
  "category": "messaging",
  "tone": "primary",
  "description": "Send a multi-channel approved template.",
  "label": "Send Template",
  "status": "draft",
  "templateId": "",
  "recipient": "patient",
  "repeatReminder": false,
  "retryInterval": 15,
  "maxRetryCount": 2,
  "fallbackChannel": "",
  "variables": {},
  "channel": "whatsapp"
}
```

## Backend Mapping

| Frontend Node ID | `sendTemplate` |
| Trigger aliases (NodeTypeNormalizer-style, frontend) | _None in frontend `TRIGGER_TYPE_ALIASES`_ |
| Canonical backend type (from contracts) | `sendTemplate` (same id; Laravel `NodeTypeNormalizer` **not in this repo**) |
| Executor (from `automation/node-contracts.json`) | ActionDispatcher.#dispatchMessaging → ChannelManager.send (JS adapters currently stub adapters) |
| Backend status (contracts) | `partial` |

## Limitations / Notes

- Catalog description: Send Template
- Next-step behavior (contracts): action=continue; follow first outgoing edge (parallel fan-out not implemented)
- `MessagingProperties` renders `schema.fields` only; shared defaults (`recipient`, retry fields) remain on `node.data` and are validated on save.
- JS `ChannelManager` adapters in this repo return stub successes; production delivery is Laravel-side.

---
# Node: dbCreate

## Basic Information

| Property | Value |
|---|---|
| Node ID | `dbCreate` |
| Display Name | Create Record |
| Purpose | Create a hospital record. |
| Category | `database` |
| Node Type | `dbCreate` |
| Frontend Role | database |
| Custom Panel | _none (generic)_ |
| Property Panel Component | GenericNodeProperties (catalog `fields` only; no customPanel) |
| Backend Canonical Type | `dbCreate` |
| Backend Executor | ActionDispatcher.#dispatchDatabase (returns stub:true) |
| Backend Status | `stub` |

## Fields

| Field | Type | Required | Default | Allowed Values | Variables Supported | Description |
|---|---|---|---|---|---|---|
| `nodeType` | string | Yes | dbCreate | `dbCreate` | No | Canonical frontend node type. Set by `createNodeDefaults`. |
| `category` | string | Yes | database | `database` | No | Catalog category id. |
| `tone` | string | No | purple | UI tone token from `toneForCategory` | No | Visual tone for the canvas node. |
| `description` | string | No | Create a hospital record. | — | No | Human description copied from schema/catalog. |
| `label` | text | Yes | "Create Record" | — | No | Display name (GenericNodeProperties) |
| `status` | string | No | "draft" | `draft` | No | Draft status from stubNode defaultData |

## Validation

### Graph-level (`validateWorkflowGraph`)
- Workflow must have nodes.
- Exactly one event trigger (`isTrigger` / `triggerKey`, excluding `start`).
- At least one `end` node.
- No cycles unless a `loop` node exists (catalog currently has no loop node).
- All non-start nodes must be connected when more than one node exists.
- Unknown node types are errors.

### Node-specific
- Generic required-field check against catalog `fields` (typically `label`, plus `entity`/`query`/`url` when listed).
- No dedicated custom-panel validator.

## Variable Support

No variable picker on this node’s property panel.

## Full Frontend JSON

Complete saved node object as produced for workflow configuration persistence (`serializeNode` / `configuration.nodes[]`). Shape is `{ id, type, position, data }` — canvas-only React Flow keys such as `dragHandle` / `selected` are **not** part of the saved Laravel payload.

### Complete saved node JSON

```json
{
  "id": "n_dbCreate_1",
  "type": "workflow",
  "position": {
    "x": 280,
    "y": 160
  },
  "data": {
    "nodeType": "dbCreate",
    "category": "database",
    "tone": "purple",
    "description": "Create a hospital record.",
    "label": "Create Record",
    "status": "draft"
  }
}
```

### `node.data` only

```json
{
  "nodeType": "dbCreate",
  "category": "database",
  "tone": "purple",
  "description": "Create a hospital record.",
  "label": "Create Record",
  "status": "draft"
}
```

## Backend Mapping

| Frontend Node ID | `dbCreate` |
| Trigger aliases (NodeTypeNormalizer-style, frontend) | _None in frontend `TRIGGER_TYPE_ALIASES`_ |
| Canonical backend type (from contracts) | `dbCreate` (same id; Laravel `NodeTypeNormalizer` **not in this repo**) |
| Executor (from `automation/node-contracts.json`) | ActionDispatcher.#dispatchDatabase (returns stub:true) |
| Backend status (contracts) | `stub` |

## Limitations / Notes

- Catalog description: Create a hospital record.
- Next-step behavior (contracts): action=continue; follow first outgoing edge (parallel fan-out not implemented)
- Catalog stub: GenericNodeProperties only; ActionDispatcher returns `stub: true` in JS runtime.

---
# Node: dbUpdate

## Basic Information

| Property | Value |
|---|---|
| Node ID | `dbUpdate` |
| Display Name | Update Record |
| Purpose | Update a hospital record. |
| Category | `database` |
| Node Type | `dbUpdate` |
| Frontend Role | database |
| Custom Panel | _none (generic)_ |
| Property Panel Component | GenericNodeProperties (catalog `fields` only; no customPanel) |
| Backend Canonical Type | `dbUpdate` |
| Backend Executor | ActionDispatcher.#dispatchDatabase (returns stub:true) |
| Backend Status | `stub` |

## Fields

| Field | Type | Required | Default | Allowed Values | Variables Supported | Description |
|---|---|---|---|---|---|---|
| `nodeType` | string | Yes | dbUpdate | `dbUpdate` | No | Canonical frontend node type. Set by `createNodeDefaults`. |
| `category` | string | Yes | database | `database` | No | Catalog category id. |
| `tone` | string | No | purple | UI tone token from `toneForCategory` | No | Visual tone for the canvas node. |
| `description` | string | No | Update a hospital record. | — | No | Human description copied from schema/catalog. |
| `label` | text | Yes | "Update Record" | — | No | Display name (GenericNodeProperties) |
| `status` | string | No | "draft" | `draft` | No | Draft status from stubNode defaultData |

## Validation

### Graph-level (`validateWorkflowGraph`)
- Workflow must have nodes.
- Exactly one event trigger (`isTrigger` / `triggerKey`, excluding `start`).
- At least one `end` node.
- No cycles unless a `loop` node exists (catalog currently has no loop node).
- All non-start nodes must be connected when more than one node exists.
- Unknown node types are errors.

### Node-specific
- Generic required-field check against catalog `fields` (typically `label`, plus `entity`/`query`/`url` when listed).
- No dedicated custom-panel validator.

## Variable Support

No variable picker on this node’s property panel.

## Full Frontend JSON

Complete saved node object as produced for workflow configuration persistence (`serializeNode` / `configuration.nodes[]`). Shape is `{ id, type, position, data }` — canvas-only React Flow keys such as `dragHandle` / `selected` are **not** part of the saved Laravel payload.

### Complete saved node JSON

```json
{
  "id": "n_dbUpdate_1",
  "type": "workflow",
  "position": {
    "x": 280,
    "y": 160
  },
  "data": {
    "nodeType": "dbUpdate",
    "category": "database",
    "tone": "purple",
    "description": "Update a hospital record.",
    "label": "Update Record",
    "status": "draft",
    "entity": "patient"
  }
}
```

### `node.data` only

```json
{
  "nodeType": "dbUpdate",
  "category": "database",
  "tone": "purple",
  "description": "Update a hospital record.",
  "label": "Update Record",
  "status": "draft",
  "entity": "patient"
}
```

## Backend Mapping

| Frontend Node ID | `dbUpdate` |
| Trigger aliases (NodeTypeNormalizer-style, frontend) | _None in frontend `TRIGGER_TYPE_ALIASES`_ |
| Canonical backend type (from contracts) | `dbUpdate` (same id; Laravel `NodeTypeNormalizer` **not in this repo**) |
| Executor (from `automation/node-contracts.json`) | ActionDispatcher.#dispatchDatabase (returns stub:true) |
| Backend status (contracts) | `stub` |

## Limitations / Notes

- Catalog description: Update a hospital record.
- Next-step behavior (contracts): action=continue; follow first outgoing edge (parallel fan-out not implemented)
- Catalog stub: GenericNodeProperties only; ActionDispatcher returns `stub: true` in JS runtime.

---
# Node: dbDelete

## Basic Information

| Property | Value |
|---|---|
| Node ID | `dbDelete` |
| Display Name | Delete Record |
| Purpose | Delete a single hospital-scoped patient or appointment record. Does not allow arbitrary SQL or tables. |
| Category | `database` |
| Node Type | `dbDelete` |
| Frontend Role | database |
| Custom Panel | `database` |
| Property Panel Component | DatabaseProperties (`PANEL_MAP.database`) |
| Backend Canonical Type | `dbDelete` |
| Backend Executor | ActionDispatcher.#dispatchDatabase (returns stub:true) |
| Backend Status | `stub` |

## Fields

| Field | Type | Required | Default | Allowed Values | Variables Supported | Description |
|---|---|---|---|---|---|---|
| `nodeType` | string | Yes | dbDelete | `dbDelete` | No | Canonical frontend node type. Set by `createNodeDefaults`. |
| `category` | string | Yes | database | `database` | No | Catalog category id. |
| `tone` | string | No | purple | UI tone token from `toneForCategory` | No | Visual tone for the canvas node. |
| `description` | string | No | Delete a single hospital-scoped patient or appointment record. Does not allow arbitrary SQL or tables. | — | No | Human description copied from schema/catalog. |
| `label` | text | Yes | "Delete Record" | — | No | Display Name |
| `entity` | select | Yes | "appointment" | `patient` (Patient), `appointment` (Appointment) | No | Entity. Only Patient and Appointment are supported by the backend executor. |
| `recordId` | text | Yes | "{{appointment_id}}" | — | Yes (`{{token}}` via VariablePicker; defaults `{{appointment_id}}` / `{{patient_id}}`) | Record ID. Literal ID or workflow variable such as {{appointment_id}} / {{patient_id}}.. Placeholder: {{appointment_id}} |
| `status` | string | No | "draft" | — | No | Present on node.data via schema defaults / createNodeDefaults (saved with the node). _(Default key not declared as a schema.fields entry)_ |

Schema UI markers (not stored as `node.data` keys):
- `variables`: Schema marker for variable picker section (not stored as a data key).

## Validation

### Graph-level (`validateWorkflowGraph`)
- Workflow must have nodes.
- Exactly one event trigger (`isTrigger` / `triggerKey`, excluding `start`).
- At least one `end` node.
- No cycles unless a `loop` node exists (catalog currently has no loop node).
- All non-start nodes must be connected when more than one node exists.
- Unknown node types are errors.

### Node-specific (`validateDbDeleteNodeFields` / `getDbDeleteFieldErrors`)
- `label` required.
- `entity` required and must be `patient` or `appointment`.
- `recordId` required (also accepts legacy `id` / `record_id` when reading for validation).

## Variable Support

Variable tokens from `WORKFLOW_VARIABLE_GROUPS` (`src/components/flow/config/variables.js`):

**Patient**
- `{{patient_name}}` — Patient
- `{{patient_id}}` — Patient ID
- `{{patient_mobile}}` — Patient Mobile
- `{{patient_email}}` — Patient Email
- `{{patient_age}}` — Patient Age
- `{{patient_gender}}` — Patient Gender

**Doctor**
- `{{doctor_name}}` — Doctor
- `{{department}}` — Department

**Appointment**
- `{{appointment_date}}` — Appointment Date
- `{{appointment_time}}` — Appointment Time
- `{{appointment_id}}` — Appointment ID
- `{{branch_name}}` — Branch

**Invoice**
- `{{invoice_amount}}` — Invoice Amount
- `{{payment_status}}` — Payment Status

**Prescription**
- `{{prescription_id}}` — Prescription ID
- `{{pharmacy_link}}` — Pharmacy Link

**Medicine**
- `{{medicine_name}}` — Medicine
- `{{dosage}}` — Dosage
- `{{frequency}}` — Frequency
- `{{reminder_time}}` — Reminder Time
- `{{time}}` — Time
- `{{date}}` — Date

**Hospital**
- `{{hospital_name}}` — Hospital
- `{{hospital_phone}}` — Hospital Phone

**System**
- `{{workflow_id}}` — Workflow ID
- `{{triggered_at}}` — Triggered At

Database Delete inserts into `recordId` via `VariablePicker`. Panel hint mentions `{{appointment_id}}` and `{{patient_id}}` (both are present in `WORKFLOW_VARIABLE_GROUPS`).

## Full Frontend JSON

Complete saved node object as produced for workflow configuration persistence (`serializeNode` / `configuration.nodes[]`). Shape is `{ id, type, position, data }` — canvas-only React Flow keys such as `dragHandle` / `selected` are **not** part of the saved Laravel payload.

### Complete saved node JSON

```json
{
  "id": "n_dbDelete_1",
  "type": "workflow",
  "position": {
    "x": 280,
    "y": 160
  },
  "data": {
    "nodeType": "dbDelete",
    "category": "database",
    "tone": "purple",
    "description": "Delete a single hospital-scoped patient or appointment record. Does not allow arbitrary SQL or tables.",
    "label": "Delete Record",
    "status": "draft",
    "entity": "appointment",
    "recordId": "{{appointment_id}}"
  }
}
```

### `node.data` only

```json
{
  "nodeType": "dbDelete",
  "category": "database",
  "tone": "purple",
  "description": "Delete a single hospital-scoped patient or appointment record. Does not allow arbitrary SQL or tables.",
  "label": "Delete Record",
  "status": "draft",
  "entity": "appointment",
  "recordId": "{{appointment_id}}"
}
```

## Backend Mapping

| Frontend Node ID | `dbDelete` |
| Trigger aliases (NodeTypeNormalizer-style, frontend) | _None in frontend `TRIGGER_TYPE_ALIASES`_ |
| Canonical backend type (from contracts) | `dbDelete` (same id; Laravel `NodeTypeNormalizer` **not in this repo**) |
| Executor (from `automation/node-contracts.json`) | ActionDispatcher.#dispatchDatabase (returns stub:true) |
| Backend status (contracts) | `stub` |
| Schema note | Frontend schema comment: keep field keys aligned with Laravel `DbDeleteExecutor` (`entity`, `recordId`). Contracts still mark status `stub` / dispatcher stub in JS runtime. |

## Limitations / Notes

- Catalog description: Delete Record
- Next-step behavior (contracts): action=continue; follow first outgoing edge (parallel fan-out not implemented)
- Has a full schema + DatabaseProperties panel. Contracts/JS dispatcher still treat database actions as stubs until Laravel DbDeleteExecutor is confirmed in the PHP app.
- `docs/automation/backend-node-contracts.json` was not found in this repository.

---
# Node: updateAppointment

## Basic Information

| Property | Value |
|---|---|
| Node ID | `updateAppointment` |
| Display Name | Update Appointment |
| Purpose | Update appointment details. |
| Category | `database` |
| Node Type | `updateAppointment` |
| Frontend Role | database |
| Custom Panel | _none (generic)_ |
| Property Panel Component | GenericNodeProperties (catalog `fields` only; no customPanel) |
| Backend Canonical Type | `updateAppointment` |
| Backend Executor | ActionDispatcher.#dispatchDatabase (returns stub:true) |
| Backend Status | `stub` |

## Fields

| Field | Type | Required | Default | Allowed Values | Variables Supported | Description |
|---|---|---|---|---|---|---|
| `nodeType` | string | Yes | updateAppointment | `updateAppointment` | No | Canonical frontend node type. Set by `createNodeDefaults`. |
| `category` | string | Yes | database | `database` | No | Catalog category id. |
| `tone` | string | No | purple | UI tone token from `toneForCategory` | No | Visual tone for the canvas node. |
| `description` | string | No | Update appointment details. | — | No | Human description copied from schema/catalog. |
| `label` | text | Yes | "Update Appointment" | — | No | Display name (GenericNodeProperties) |
| `status` | string | No | "draft" | `draft` | No | Draft status from stubNode defaultData |

## Validation

### Graph-level (`validateWorkflowGraph`)
- Workflow must have nodes.
- Exactly one event trigger (`isTrigger` / `triggerKey`, excluding `start`).
- At least one `end` node.
- No cycles unless a `loop` node exists (catalog currently has no loop node).
- All non-start nodes must be connected when more than one node exists.
- Unknown node types are errors.

### Node-specific
- Generic required-field check against catalog `fields` (typically `label`, plus `entity`/`query`/`url` when listed).
- No dedicated custom-panel validator.

## Variable Support

No variable picker on this node’s property panel.

## Full Frontend JSON

Complete saved node object as produced for workflow configuration persistence (`serializeNode` / `configuration.nodes[]`). Shape is `{ id, type, position, data }` — canvas-only React Flow keys such as `dragHandle` / `selected` are **not** part of the saved Laravel payload.

### Complete saved node JSON

```json
{
  "id": "n_updateAppointment_1",
  "type": "workflow",
  "position": {
    "x": 280,
    "y": 160
  },
  "data": {
    "nodeType": "updateAppointment",
    "category": "database",
    "tone": "purple",
    "description": "Update appointment details.",
    "label": "Update Appointment",
    "status": "draft"
  }
}
```

### `node.data` only

```json
{
  "nodeType": "updateAppointment",
  "category": "database",
  "tone": "purple",
  "description": "Update appointment details.",
  "label": "Update Appointment",
  "status": "draft"
}
```

## Backend Mapping

| Frontend Node ID | `updateAppointment` |
| Trigger aliases (NodeTypeNormalizer-style, frontend) | _None in frontend `TRIGGER_TYPE_ALIASES`_ |
| Canonical backend type (from contracts) | `updateAppointment` (same id; Laravel `NodeTypeNormalizer` **not in this repo**) |
| Executor (from `automation/node-contracts.json`) | ActionDispatcher.#dispatchDatabase (returns stub:true) |
| Backend status (contracts) | `stub` |

## Limitations / Notes

- Catalog description: Update appointment details.
- Next-step behavior (contracts): action=continue; follow first outgoing edge (parallel fan-out not implemented)
- Catalog stub: GenericNodeProperties only; ActionDispatcher returns `stub: true` in JS runtime.

---
# Node: updatePrescription

## Basic Information

| Property | Value |
|---|---|
| Node ID | `updatePrescription` |
| Display Name | Update Prescription |
| Purpose | Update prescription data. |
| Category | `database` |
| Node Type | `updatePrescription` |
| Frontend Role | database |
| Custom Panel | _none (generic)_ |
| Property Panel Component | GenericNodeProperties (catalog `fields` only; no customPanel) |
| Backend Canonical Type | `updatePrescription` |
| Backend Executor | ActionDispatcher.#dispatchDatabase (returns stub:true) |
| Backend Status | `stub` |

## Fields

| Field | Type | Required | Default | Allowed Values | Variables Supported | Description |
|---|---|---|---|---|---|---|
| `nodeType` | string | Yes | updatePrescription | `updatePrescription` | No | Canonical frontend node type. Set by `createNodeDefaults`. |
| `category` | string | Yes | database | `database` | No | Catalog category id. |
| `tone` | string | No | purple | UI tone token from `toneForCategory` | No | Visual tone for the canvas node. |
| `description` | string | No | Update prescription data. | — | No | Human description copied from schema/catalog. |
| `label` | text | Yes | "Update Prescription" | — | No | Display name (GenericNodeProperties) |
| `status` | string | No | "draft" | `draft` | No | Draft status from stubNode defaultData |

## Validation

### Graph-level (`validateWorkflowGraph`)
- Workflow must have nodes.
- Exactly one event trigger (`isTrigger` / `triggerKey`, excluding `start`).
- At least one `end` node.
- No cycles unless a `loop` node exists (catalog currently has no loop node).
- All non-start nodes must be connected when more than one node exists.
- Unknown node types are errors.

### Node-specific
- Generic required-field check against catalog `fields` (typically `label`, plus `entity`/`query`/`url` when listed).
- No dedicated custom-panel validator.

## Variable Support

No variable picker on this node’s property panel.

## Full Frontend JSON

Complete saved node object as produced for workflow configuration persistence (`serializeNode` / `configuration.nodes[]`). Shape is `{ id, type, position, data }` — canvas-only React Flow keys such as `dragHandle` / `selected` are **not** part of the saved Laravel payload.

### Complete saved node JSON

```json
{
  "id": "n_updatePrescription_1",
  "type": "workflow",
  "position": {
    "x": 280,
    "y": 160
  },
  "data": {
    "nodeType": "updatePrescription",
    "category": "database",
    "tone": "purple",
    "description": "Update prescription data.",
    "label": "Update Prescription",
    "status": "draft"
  }
}
```

### `node.data` only

```json
{
  "nodeType": "updatePrescription",
  "category": "database",
  "tone": "purple",
  "description": "Update prescription data.",
  "label": "Update Prescription",
  "status": "draft"
}
```

## Backend Mapping

| Frontend Node ID | `updatePrescription` |
| Trigger aliases (NodeTypeNormalizer-style, frontend) | _None in frontend `TRIGGER_TYPE_ALIASES`_ |
| Canonical backend type (from contracts) | `updatePrescription` (same id; Laravel `NodeTypeNormalizer` **not in this repo**) |
| Executor (from `automation/node-contracts.json`) | ActionDispatcher.#dispatchDatabase (returns stub:true) |
| Backend status (contracts) | `stub` |

## Limitations / Notes

- Catalog description: Update prescription data.
- Next-step behavior (contracts): action=continue; follow first outgoing edge (parallel fan-out not implemented)
- Catalog stub: GenericNodeProperties only; ActionDispatcher returns `stub: true` in JS runtime.

---
# Node: updateMembership

## Basic Information

| Property | Value |
|---|---|
| Node ID | `updateMembership` |
| Display Name | Update Membership |
| Purpose | Update membership status. |
| Category | `database` |
| Node Type | `updateMembership` |
| Frontend Role | database |
| Custom Panel | _none (generic)_ |
| Property Panel Component | GenericNodeProperties (catalog `fields` only; no customPanel) |
| Backend Canonical Type | `updateMembership` |
| Backend Executor | ActionDispatcher.#dispatchDatabase (returns stub:true) |
| Backend Status | `stub` |

## Fields

| Field | Type | Required | Default | Allowed Values | Variables Supported | Description |
|---|---|---|---|---|---|---|
| `nodeType` | string | Yes | updateMembership | `updateMembership` | No | Canonical frontend node type. Set by `createNodeDefaults`. |
| `category` | string | Yes | database | `database` | No | Catalog category id. |
| `tone` | string | No | purple | UI tone token from `toneForCategory` | No | Visual tone for the canvas node. |
| `description` | string | No | Update membership status. | — | No | Human description copied from schema/catalog. |
| `label` | text | Yes | "Update Membership" | — | No | Display name (GenericNodeProperties) |
| `status` | string | No | "draft" | `draft` | No | Draft status from stubNode defaultData |

## Validation

### Graph-level (`validateWorkflowGraph`)
- Workflow must have nodes.
- Exactly one event trigger (`isTrigger` / `triggerKey`, excluding `start`).
- At least one `end` node.
- No cycles unless a `loop` node exists (catalog currently has no loop node).
- All non-start nodes must be connected when more than one node exists.
- Unknown node types are errors.

### Node-specific
- Generic required-field check against catalog `fields` (typically `label`, plus `entity`/`query`/`url` when listed).
- No dedicated custom-panel validator.

## Variable Support

No variable picker on this node’s property panel.

## Full Frontend JSON

Complete saved node object as produced for workflow configuration persistence (`serializeNode` / `configuration.nodes[]`). Shape is `{ id, type, position, data }` — canvas-only React Flow keys such as `dragHandle` / `selected` are **not** part of the saved Laravel payload.

### Complete saved node JSON

```json
{
  "id": "n_updateMembership_1",
  "type": "workflow",
  "position": {
    "x": 280,
    "y": 160
  },
  "data": {
    "nodeType": "updateMembership",
    "category": "database",
    "tone": "purple",
    "description": "Update membership status.",
    "label": "Update Membership",
    "status": "draft"
  }
}
```

### `node.data` only

```json
{
  "nodeType": "updateMembership",
  "category": "database",
  "tone": "purple",
  "description": "Update membership status.",
  "label": "Update Membership",
  "status": "draft"
}
```

## Backend Mapping

| Frontend Node ID | `updateMembership` |
| Trigger aliases (NodeTypeNormalizer-style, frontend) | _None in frontend `TRIGGER_TYPE_ALIASES`_ |
| Canonical backend type (from contracts) | `updateMembership` (same id; Laravel `NodeTypeNormalizer` **not in this repo**) |
| Executor (from `automation/node-contracts.json`) | ActionDispatcher.#dispatchDatabase (returns stub:true) |
| Backend status (contracts) | `stub` |

## Limitations / Notes

- Catalog description: Update membership status.
- Next-step behavior (contracts): action=continue; follow first outgoing edge (parallel fan-out not implemented)
- Catalog stub: GenericNodeProperties only; ActionDispatcher returns `stub: true` in JS runtime.

---
# Node: dbQuery

## Basic Information

| Property | Value |
|---|---|
| Node ID | `dbQuery` |
| Display Name | Database Query |
| Purpose | Read patient or encounter records. |
| Category | `database` |
| Node Type | `dbQuery` |
| Frontend Role | database |
| Custom Panel | _none (generic)_ |
| Property Panel Component | GenericNodeProperties (catalog `fields` only; no customPanel) |
| Backend Canonical Type | `dbQuery` |
| Backend Executor | ActionDispatcher.#dispatchDatabase (returns stub:true) |
| Backend Status | `stub` |

## Fields

| Field | Type | Required | Default | Allowed Values | Variables Supported | Description |
|---|---|---|---|---|---|---|
| `nodeType` | string | Yes | dbQuery | `dbQuery` | No | Canonical frontend node type. Set by `createNodeDefaults`. |
| `category` | string | Yes | database | `database` | No | Catalog category id. |
| `tone` | string | No | purple | UI tone token from `toneForCategory` | No | Visual tone for the canvas node. |
| `description` | string | No | Read patient or encounter records. | — | No | Human description copied from schema/catalog. |
| `label` | text | Yes | "Database Query" | — | No | Display name (GenericNodeProperties) |
| `status` | string | No | "draft" | `draft` | No | Draft status from stubNode defaultData |

## Validation

### Graph-level (`validateWorkflowGraph`)
- Workflow must have nodes.
- Exactly one event trigger (`isTrigger` / `triggerKey`, excluding `start`).
- At least one `end` node.
- No cycles unless a `loop` node exists (catalog currently has no loop node).
- All non-start nodes must be connected when more than one node exists.
- Unknown node types are errors.

### Node-specific
- Generic required-field check against catalog `fields` (typically `label`, plus `entity`/`query`/`url` when listed).
- No dedicated custom-panel validator.

## Variable Support

No variable picker on this node’s property panel.

## Full Frontend JSON

Complete saved node object as produced for workflow configuration persistence (`serializeNode` / `configuration.nodes[]`). Shape is `{ id, type, position, data }` — canvas-only React Flow keys such as `dragHandle` / `selected` are **not** part of the saved Laravel payload.

### Complete saved node JSON

```json
{
  "id": "n_dbQuery_1",
  "type": "workflow",
  "position": {
    "x": 280,
    "y": 160
  },
  "data": {
    "nodeType": "dbQuery",
    "category": "database",
    "tone": "purple",
    "description": "Read patient or encounter records.",
    "label": "Database Query",
    "status": "draft",
    "query": ""
  }
}
```

### `node.data` only

```json
{
  "nodeType": "dbQuery",
  "category": "database",
  "tone": "purple",
  "description": "Read patient or encounter records.",
  "label": "Database Query",
  "status": "draft",
  "query": ""
}
```

## Backend Mapping

| Frontend Node ID | `dbQuery` |
| Trigger aliases (NodeTypeNormalizer-style, frontend) | _None in frontend `TRIGGER_TYPE_ALIASES`_ |
| Canonical backend type (from contracts) | `dbQuery` (same id; Laravel `NodeTypeNormalizer` **not in this repo**) |
| Executor (from `automation/node-contracts.json`) | ActionDispatcher.#dispatchDatabase (returns stub:true) |
| Backend status (contracts) | `stub` |

## Limitations / Notes

- Catalog description: Read patient or encounter records.
- Next-step behavior (contracts): action=continue; follow first outgoing edge (parallel fan-out not implemented)
- Catalog stub: GenericNodeProperties only; ActionDispatcher returns `stub: true` in JS runtime.

---
# Node: httpRequest

## Basic Information

| Property | Value |
|---|---|
| Node ID | `httpRequest` |
| Display Name | REST API |
| Purpose | Call an external REST API. |
| Category | `integrations` |
| Node Type | `httpRequest` |
| Frontend Role | action |
| Custom Panel | _none (generic)_ |
| Property Panel Component | GenericNodeProperties (catalog `fields` only; no customPanel) |
| Backend Canonical Type | `httpRequest` |
| Backend Executor | ActionDispatcher.#dispatchIntegration (returns stub:true) |
| Backend Status | `stub` |

## Fields

| Field | Type | Required | Default | Allowed Values | Variables Supported | Description |
|---|---|---|---|---|---|---|
| `nodeType` | string | Yes | httpRequest | `httpRequest` | No | Canonical frontend node type. Set by `createNodeDefaults`. |
| `category` | string | Yes | integrations | `integrations` | No | Catalog category id. |
| `tone` | string | No | cyan | UI tone token from `toneForCategory` | No | Visual tone for the canvas node. |
| `description` | string | No | Call an external REST API. | — | No | Human description copied from schema/catalog. |
| `label` | text | Yes | "REST API" | — | No | Display name (GenericNodeProperties) |
| `status` | string | No | "draft" | `draft` | No | Draft status from stubNode defaultData |

## Validation

### Graph-level (`validateWorkflowGraph`)
- Workflow must have nodes.
- Exactly one event trigger (`isTrigger` / `triggerKey`, excluding `start`).
- At least one `end` node.
- No cycles unless a `loop` node exists (catalog currently has no loop node).
- All non-start nodes must be connected when more than one node exists.
- Unknown node types are errors.

### Node-specific
- Generic required-field check against catalog `fields` (typically `label`, plus `entity`/`query`/`url` when listed).
- No dedicated custom-panel validator.

## Variable Support

No variable picker on this node’s property panel.

## Full Frontend JSON

Complete saved node object as produced for workflow configuration persistence (`serializeNode` / `configuration.nodes[]`). Shape is `{ id, type, position, data }` — canvas-only React Flow keys such as `dragHandle` / `selected` are **not** part of the saved Laravel payload.

### Complete saved node JSON

```json
{
  "id": "n_httpRequest_1",
  "type": "workflow",
  "position": {
    "x": 280,
    "y": 160
  },
  "data": {
    "nodeType": "httpRequest",
    "category": "integrations",
    "tone": "cyan",
    "description": "Call an external REST API.",
    "label": "REST API",
    "status": "draft",
    "url": ""
  }
}
```

### `node.data` only

```json
{
  "nodeType": "httpRequest",
  "category": "integrations",
  "tone": "cyan",
  "description": "Call an external REST API.",
  "label": "REST API",
  "status": "draft",
  "url": ""
}
```

## Backend Mapping

| Frontend Node ID | `httpRequest` |
| Trigger aliases (NodeTypeNormalizer-style, frontend) | _None in frontend `TRIGGER_TYPE_ALIASES`_ |
| Canonical backend type (from contracts) | `httpRequest` (same id; Laravel `NodeTypeNormalizer` **not in this repo**) |
| Executor (from `automation/node-contracts.json`) | ActionDispatcher.#dispatchIntegration (returns stub:true) |
| Backend status (contracts) | `stub` |

## Limitations / Notes

- Catalog description: Call an external REST API.
- Next-step behavior (contracts): action=continue; follow first outgoing edge (parallel fan-out not implemented)
- Catalog stub: GenericNodeProperties only; ActionDispatcher returns `stub: true` in JS runtime.

---
# Node: ai

## Basic Information

| Property | Value |
|---|---|
| Node ID | `ai` |
| Display Name | AI |
| Purpose | Run an AI chat step. |
| Category | `ai` |
| Node Type | `ai` |
| Frontend Role | AI |
| Custom Panel | _none (generic)_ |
| Property Panel Component | GenericNodeProperties (catalog `fields` only; no customPanel) |
| Backend Canonical Type | `ai` |
| Backend Executor | ActionDispatcher.#dispatchAI (returns stub:true) |
| Backend Status | `stub` |

## Fields

| Field | Type | Required | Default | Allowed Values | Variables Supported | Description |
|---|---|---|---|---|---|---|
| `nodeType` | string | Yes | ai | `ai` | No | Canonical frontend node type. Set by `createNodeDefaults`. |
| `category` | string | Yes | ai | `ai` | No | Catalog category id. |
| `tone` | string | No | pink | UI tone token from `toneForCategory` | No | Visual tone for the canvas node. |
| `description` | string | No | Run an AI chat step. | — | No | Human description copied from schema/catalog. |
| `label` | text | Yes | "AI" | — | No | Display name (GenericNodeProperties) |
| `status` | string | No | "draft" | `draft` | No | Draft status from stubNode defaultData |

## Validation

### Graph-level (`validateWorkflowGraph`)
- Workflow must have nodes.
- Exactly one event trigger (`isTrigger` / `triggerKey`, excluding `start`).
- At least one `end` node.
- No cycles unless a `loop` node exists (catalog currently has no loop node).
- All non-start nodes must be connected when more than one node exists.
- Unknown node types are errors.

### Node-specific
- Generic required-field check against catalog `fields` (typically `label`, plus `entity`/`query`/`url` when listed).
- No dedicated custom-panel validator.

## Variable Support

No variable picker on this node’s property panel.

## Full Frontend JSON

Complete saved node object as produced for workflow configuration persistence (`serializeNode` / `configuration.nodes[]`). Shape is `{ id, type, position, data }` — canvas-only React Flow keys such as `dragHandle` / `selected` are **not** part of the saved Laravel payload.

### Complete saved node JSON

```json
{
  "id": "n_ai_1",
  "type": "workflow",
  "position": {
    "x": 280,
    "y": 160
  },
  "data": {
    "nodeType": "ai",
    "category": "ai",
    "tone": "pink",
    "description": "Run an AI chat step.",
    "label": "AI",
    "status": "draft"
  }
}
```

### `node.data` only

```json
{
  "nodeType": "ai",
  "category": "ai",
  "tone": "pink",
  "description": "Run an AI chat step.",
  "label": "AI",
  "status": "draft"
}
```

## Backend Mapping

| Frontend Node ID | `ai` |
| Trigger aliases (NodeTypeNormalizer-style, frontend) | _None in frontend `TRIGGER_TYPE_ALIASES`_ |
| Canonical backend type (from contracts) | `ai` (same id; Laravel `NodeTypeNormalizer` **not in this repo**) |
| Executor (from `automation/node-contracts.json`) | ActionDispatcher.#dispatchAI (returns stub:true) |
| Backend status (contracts) | `stub` |

## Limitations / Notes

- Catalog description: Run an AI chat step.
- Next-step behavior (contracts): action=continue; follow first outgoing edge (parallel fan-out not implemented)
- Catalog stub: GenericNodeProperties only; ActionDispatcher returns `stub: true` in JS runtime.

---
# Node: end

## Basic Information

| Property | Value |
|---|---|
| Node ID | `end` |
| Display Name | End |
| Purpose | Marks the end of a workflow branch. |
| Category | `flow` |
| Node Type | `end` |
| Frontend Role | end |
| Custom Panel | `end` |
| Property Panel Component | EndProperties (`PANEL_MAP.end`) |
| Backend Canonical Type | `end` |
| Backend Executor | NodeExecutorRegistry.#executeFlow (action: end) |
| Backend Status | `implemented` |

## Fields

| Field | Type | Required | Default | Allowed Values | Variables Supported | Description |
|---|---|---|---|---|---|---|
| `nodeType` | string | Yes | end | `end` | No | Canonical frontend node type. Set by `createNodeDefaults`. |
| `category` | string | Yes | flow | `flow` | No | Catalog category id. |
| `tone` | string | No | danger | UI tone token from `toneForCategory` | No | Visual tone for the canvas node. |
| `description` | string | No | Marks the end of a workflow branch. | — | No | Human description copied from schema/catalog. |
| `label` | text | Yes | End | — | No | Display Name (EndProperties) |
| `status` | string | No | ready | `ready` | No | UI status |
| `outcome` | select | No | completed | `completed`, `cancelled`, `failed` | No | Branch termination outcome (EndProperties) |

## Validation

### Graph-level (`validateWorkflowGraph`)
- Workflow must have nodes.
- Exactly one event trigger (`isTrigger` / `triggerKey`, excluding `start`).
- At least one `end` node.
- No cycles unless a `loop` node exists (catalog currently has no loop node).
- All non-start nodes must be connected when more than one node exists.
- Unknown node types are errors.

### Node-specific
- At least one End node required in the graph.
- `label` required via catalog fields.

## Variable Support

No variable picker on this node’s property panel.

## Full Frontend JSON

Complete saved node object as produced for workflow configuration persistence (`serializeNode` / `configuration.nodes[]`). Shape is `{ id, type, position, data }` — canvas-only React Flow keys such as `dragHandle` / `selected` are **not** part of the saved Laravel payload.

### Complete saved node JSON

```json
{
  "id": "n_end_1",
  "type": "workflow",
  "position": {
    "x": 280,
    "y": 160
  },
  "data": {
    "nodeType": "end",
    "category": "flow",
    "tone": "danger",
    "description": "Marks the end of a workflow branch.",
    "label": "End",
    "status": "ready",
    "outcome": "completed"
  }
}
```

### `node.data` only

```json
{
  "nodeType": "end",
  "category": "flow",
  "tone": "danger",
  "description": "Marks the end of a workflow branch.",
  "label": "End",
  "status": "ready",
  "outcome": "completed"
}
```

## Backend Mapping

| Frontend Node ID | `end` |
| Trigger aliases (NodeTypeNormalizer-style, frontend) | _None in frontend `TRIGGER_TYPE_ALIASES`_ |
| Canonical backend type (from contracts) | `end` (same id; Laravel `NodeTypeNormalizer` **not in this repo**) |
| Executor (from `automation/node-contracts.json`) | NodeExecutorRegistry.#executeFlow (action: end) |
| Backend status (contracts) | `implemented` |

## Limitations / Notes

- Catalog description: Marks the end of a workflow branch.
- Next-step behavior (contracts): action=end; execution status=completed; branch terminates

---
## 5. Appendix — Variable Catalog

### Patient

- `{{patient_name}}` — Patient
- `{{patient_id}}` — Patient ID
- `{{patient_mobile}}` — Patient Mobile
- `{{patient_email}}` — Patient Email
- `{{patient_age}}` — Patient Age
- `{{patient_gender}}` — Patient Gender

### Doctor

- `{{doctor_name}}` — Doctor
- `{{department}}` — Department

### Appointment

- `{{appointment_date}}` — Appointment Date
- `{{appointment_time}}` — Appointment Time
- `{{appointment_id}}` — Appointment ID
- `{{branch_name}}` — Branch

### Invoice

- `{{invoice_amount}}` — Invoice Amount
- `{{payment_status}}` — Payment Status

### Prescription

- `{{prescription_id}}` — Prescription ID
- `{{pharmacy_link}}` — Pharmacy Link

### Medicine

- `{{medicine_name}}` — Medicine
- `{{dosage}}` — Dosage
- `{{frequency}}` — Frequency
- `{{reminder_time}}` — Reminder Time
- `{{time}}` — Time
- `{{date}}` — Date

### Hospital

- `{{hospital_name}}` — Hospital
- `{{hospital_phone}}` — Hospital Phone

### System

- `{{workflow_id}}` — Workflow ID
- `{{triggered_at}}` — Triggered At

## 6. Appendix — Schema-only types (not in catalog)

These appear in schemas or `runtime/types.js` but are **not** in `WORKFLOW_NODES` and therefore have no catalog documentation section:

### Deprecated / unused orphan schemas (intentionally retained)

Do **not** remove unless confirmed unused across contracts, fixtures, and runtime. They are **not** in the node palette.

| Schema key | File | Status |
|---|---|---|
| `delay` | `src/components/flow/config/wait/schemas.js` | **Deprecated / unused** — superseded by catalog `wait` (`waitType: duration`). No weeks unit; not in palette. |
| `switch` | `src/components/flow/config/conditions/schemas.js` | **Deprecated / unused** — superseded by catalog `condition` (JEXL + true/false handles). Not in palette. |
| `waitUntil` / `cronSchedule` / `recurring` (legacy keys) | `wait/schemas.js` | Covered by unified `wait` node's `waitType` values; orphan schema entries retained. |

### Other schema-only / runtime types

- `sendInApp`
- `waitUntil`
- `cronSchedule`
- `recurring`
- `webhook`
- `fhir`
- `abdm`
- `paymentGateway`
- `thirdPartyApi`
- `aiChat`
- `aiVoice`
- `aiSummarize`
- `aiIntent`
- `aiRag`
- `aiRecommend`
- `aiSentiment`
- `aiClassify`
- `assignPatient`
- `loop`
- `split`
- `parallel`
- `merge`

