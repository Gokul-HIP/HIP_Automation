/**
 * Generates docs/automation/frontend-node-documentation.md from live schemas
 * + automation/node-contracts.json.
 *
 * Run from repo root:
 *   node docs/automation/generate-frontend-node-docs.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { register } from "node:module";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");

register("./alias-loader.mjs", pathToFileURL(path.join(__dirname, "generate-frontend-node-docs.mjs")));

const { TRIGGER_SCHEMAS, TRIGGER_TYPE_ALIASES_EXPORT } = await import(
  pathToFileURL(path.join(ROOT, "src/components/flow/config/triggers/schemas.js")).href
).then(async (mod) => {
  // TRIGGER_TYPE_ALIASES is not exported — re-read from file text
  return { TRIGGER_SCHEMAS: mod.TRIGGER_SCHEMAS };
});

const { MESSAGING_SCHEMAS } = await import(
  pathToFileURL(path.join(ROOT, "src/components/flow/config/messaging/schemas.js")).href
);
const { CONDITION_SCHEMAS } = await import(
  pathToFileURL(path.join(ROOT, "src/components/flow/config/conditions/schemas.js")).href
);
const { WAIT_SCHEMAS } = await import(
  pathToFileURL(path.join(ROOT, "src/components/flow/config/wait/schemas.js")).href
);
const { DATABASE_SCHEMAS } = await import(
  pathToFileURL(path.join(ROOT, "src/components/flow/config/database/schemas.js")).href
);
const { WORKFLOW_VARIABLE_GROUPS } = await import(
  pathToFileURL(path.join(ROOT, "src/components/flow/config/variables.js")).href
);
const { toneForCategory } = await import(
  pathToFileURL(path.join(ROOT, "src/components/flow/config/nodeTones.js")).href
);
const {
  RECIPIENT_OPTIONS,
  NOTIFICATION_CHANNEL_OPTIONS,
  RETRY_INTERVAL_OPTIONS,
  PUSH_PRIORITY_OPTIONS,
  createMessagingDefaults,
} = await import(
  pathToFileURL(path.join(ROOT, "src/components/flow/config/messaging/shared.js")).href
);

const contracts = JSON.parse(
  fs.readFileSync(path.join(ROOT, "automation/node-contracts.json"), "utf8")
);

const TRIGGER_TYPE_ALIASES = {
  appointment_rescheduled: "appointmentRescheduled",
  appointment_completed: "appointmentCompleted",
  appointment_booked: "appointmentBooked",
  appointment_cancelled: "appointmentCancelled",
  appointment_missed: "appointmentMissed",
  appointment_reminder: "appointmentReminder",
};

/** Parse catalog.js without importing react-icons. */
function parseCatalog() {
  const src = fs.readFileSync(
    path.join(ROOT, "src/components/flow/config/nodes/catalog.js"),
    "utf8"
  );
  const nodes = [];

  // start / end literals
  const startMatch = src.match(
    /type:\s*"start"[\s\S]*?defaultData:\s*(\{[\s\S]*?\})/
  );
  nodes.push({
    type: "start",
    category: "triggers",
    title: "Workflow Start",
    description: "Entry point for every hospital automation workflow.",
    isStart: true,
    customPanel: null,
    defaultData: { label: "Workflow Start", status: "ready", triggerSource: "manual" },
    fields: [{ key: "label", label: "Display name", type: "text", required: true }],
    kind: "start",
  });

  // Strip block and line comments so commented-out catalog entries are ignored.
  const withoutBlock = src.replace(/\/\*[\s\S]*?\*\//g, "");
  const cleaned = withoutBlock
    .split(/\r?\n/)
    .map((line) => {
      // Remove full-line // comments and trailing // comments.
      const trimmed = line.trimStart();
      if (trimmed.startsWith("//")) return "";
      return line.replace(/(^|[^:])\/\/.*$/, "$1");
    })
    .join("\n");

  // Only match WORKFLOW_NODES helper invocations (skip function definitions).
  const nodesRegionMatch = cleaned.match(
    /export const WORKFLOW_NODES\s*=\s*\[([\s\S]*)\];\s*$/m
  );
  const nodesRegion = nodesRegionMatch ? nodesRegionMatch[1] : cleaned;

  const helperRe =
    /(triggerNode|messagingNode|conditionNode|waitNode|databaseNode|stubNode)\(\s*\{/g;

  function extractBalancedObject(str, openIdx) {
    // openIdx points at '{'
    let depth = 0;
    let inStr = null;
    let escaped = false;
    for (let i = openIdx; i < str.length; i++) {
      const ch = str[i];
      if (inStr) {
        if (escaped) {
          escaped = false;
          continue;
        }
        if (ch === "\\") {
          escaped = true;
          continue;
        }
        if (ch === inStr) inStr = null;
        continue;
      }
      if (ch === '"' || ch === "'" || ch === "`") {
        inStr = ch;
        continue;
      }
      if (ch === "{") depth++;
      else if (ch === "}") {
        depth--;
        if (depth === 0) return str.slice(openIdx + 1, i);
      }
    }
    return null;
  }

  let m;
  while ((m = helperRe.exec(nodesRegion))) {
    const helper = m[1];
    const braceIdx = nodesRegion.indexOf("{", m.index);
    const body = extractBalancedObject(nodesRegion, braceIdx);
    if (!body) continue;
    // Skip function parameter destructuring: "type, title, icon"
    if (!/type:\s*"/.test(body)) continue;
    const type = /type:\s*"([^"]+)"/.exec(body)?.[1];
    if (!type) continue;
    const title = /title:\s*"([^"]+)"/.exec(body)?.[1] || type;
    const category =
      /category:\s*"([^"]+)"/.exec(body)?.[1] ||
      (helper === "triggerNode"
        ? "triggers"
        : helper === "messagingNode"
          ? "messaging"
          : helper === "conditionNode"
            ? "conditions"
            : helper === "waitNode"
              ? "wait"
              : helper === "databaseNode"
                ? "database"
                : /category:\s*"([^"]+)"/.exec(body)?.[1]);
    const description = /description:\s*"([^"]+)"/.exec(body)?.[1] || title;

    // stub fields if present
    let stubFields = null;
    const fieldsMatch = /fields:\s*(\[[\s\S]*?\])\s*(?:,|\})/.exec(body);
    if (helper === "stubNode" && fieldsMatch) {
      try {
        stubFields = Function(`"use strict"; return (${fieldsMatch[1]});`)();
      } catch {
        stubFields = null;
      }
    }

    nodes.push({
      type,
      category:
        category ||
        (helper === "stubNode" ? "database" : "unknown"),
      title,
      description,
      isTrigger: helper === "triggerNode",
      customPanel:
        helper === "triggerNode"
          ? "trigger"
          : helper === "messagingNode"
            ? "messaging"
            : helper === "conditionNode"
              ? "condition"
              : helper === "waitNode"
                ? "wait"
                : helper === "databaseNode"
                  ? "database"
                  : null,
      stubFields,
      kind:
        helper === "triggerNode"
          ? "trigger"
          : helper === "messagingNode"
            ? "messaging"
            : helper === "conditionNode"
              ? "condition"
              : helper === "waitNode"
                ? "wait"
                : helper === "databaseNode"
                  ? "database"
                  : "stub",
    });
  }

  nodes.push({
    type: "end",
    category: "flow",
    title: "End",
    description: "Marks the end of a workflow branch.",
    customPanel: "end",
    defaultData: { label: "End", status: "ready", outcome: "completed" },
    fields: [{ key: "label", label: "Display name", type: "text", required: true }],
    kind: "end",
  });

  // Deduplicate by type preserving order
  const seen = new Set();
  return nodes.filter((n) => {
    if (seen.has(n.type)) return false;
    seen.add(n.type);
    return true;
  });
}

function roleFor(node) {
  // Taxonomy aligned to frontend categories / panels (not invented backend roles).
  if (node.type === "start") return "start";
  if (node.type === "end") return "end";
  if (node.kind === "trigger" || node.isTrigger) return "trigger";
  if (node.kind === "condition") return "logic";
  if (node.kind === "wait") return "control";
  if (node.kind === "messaging") return "communication";
  if (node.category === "database") return "database";
  if (node.category === "integrations") return "action";
  if (node.category === "ai") return "AI";
  if (node.category === "flow") return "control";
  return "action";
}

function panelComponentFor(node) {
  if (node.type === "start") {
    return "GenericNodeProperties (start is largely non-editable / disabled actions)";
  }
  if (node.customPanel === "trigger") return "TriggerProperties (`PANEL_MAP.trigger`)";
  if (node.customPanel === "messaging") return "MessagingProperties (`PANEL_MAP.messaging`)";
  if (node.customPanel === "condition") return "ConditionProperties (`PANEL_MAP.condition`)";
  if (node.customPanel === "wait") return "WaitProperties (`PANEL_MAP.wait`)";
  if (node.customPanel === "database") return "DatabaseProperties (`PANEL_MAP.database`)";
  if (node.customPanel === "end") return "EndProperties (`PANEL_MAP.end`)";
  return "GenericNodeProperties (catalog `fields` only; no customPanel)";
}

function optionsText(field) {
  if (!field?.options) return "—";
  return field.options
    .map((o) => `\`${o.value}\` (${o.label})`)
    .join(", ");
}

function fieldTypeLabel(t) {
  return t || "text";
}

function supportsVariables(node, field) {
  if (!field?.key) return "No";
  if (node.kind === "messaging") {
    if (["message", "body", "subject", "title", "prompt", "buttons"].includes(field.key)) {
      return "Yes (`{{token}}` via ApiVariablePicker)";
    }
    return "No (field itself); node supports variable insertion into text fields";
  }
  if (node.type === "dbDelete" && field.key === "recordId") {
    return "Yes (`{{token}}` via VariablePicker; defaults `{{appointment_id}}` / `{{patient_id}}`)";
  }
  if (node.kind === "condition" && field.key === "expression") {
    return "JEXL expression over context (not `{{token}}` placeholders)";
  }
  return "No";
}

function exampleFor(field, defaults) {
  if (defaults && field.key != null && defaults[field.key] !== undefined) {
    return JSON.stringify(defaults[field.key]);
  }
  if (field.placeholder) return JSON.stringify(field.placeholder);
  if (field.options?.[0]) return JSON.stringify(field.options[0].value);
  if (field.type === "number") return "1";
  if (field.type === "boolean") return "false";
  return '""';
}

function getSchema(node) {
  if (node.kind === "trigger") return TRIGGER_SCHEMAS[node.type] || null;
  if (node.kind === "messaging") return MESSAGING_SCHEMAS[node.type] || null;
  if (node.kind === "condition") return CONDITION_SCHEMAS[node.type] || null;
  if (node.kind === "wait") return WAIT_SCHEMAS[node.type] || null;
  if (node.kind === "database") return DATABASE_SCHEMAS[node.type] || null;
  return null;
}

function buildDefaults(node, schema) {
  const tone = toneForCategory(node.category);
  const description =
    schema?.description || node.description || node.title || "";

  if (node.type === "start") {
    return {
      nodeType: "start",
      category: "triggers",
      tone,
      description: node.description,
      label: "Workflow Start",
      status: "ready",
      triggerSource: "manual",
    };
  }
  if (node.type === "end") {
    return {
      nodeType: "end",
      category: "flow",
      tone,
      description: node.description,
      label: "End",
      status: "ready",
      outcome: "completed",
    };
  }
  if (schema?.defaults) {
    return {
      nodeType: node.type,
      category: node.category,
      tone,
      description,
      ...structuredClone(schema.defaults),
    };
  }
  // stub
  const data = {
    nodeType: node.type,
    category: node.category,
    tone,
    description,
    label: node.title,
    status: "draft",
  };
  if (node.stubFields) {
    for (const f of node.stubFields) {
      if (f.key === "label") continue;
      if (f.key === "entity") data.entity = "patient";
      if (f.key === "query") data.query = "";
      if (f.key === "url") data.url = "";
    }
  }
  // Special stub defaults from catalog
  if (node.type === "dbUpdate") data.entity = "patient";
  if (node.type === "dbQuery") data.query = "";
  if (node.type === "httpRequest") data.url = "";
  return data;
}

function panelFields(node, schema) {
  const rows = [];

  // Injected by createNodeDefaults — always on saved node.data
  rows.push({
    key: "nodeType",
    type: "string",
    required: true,
    default: node.type,
    allowed: `\`${node.type}\``,
    variables: "No",
    description: "Canonical frontend node type. Set by `createNodeDefaults`.",
    example: JSON.stringify(node.type),
    system: true,
  });
  rows.push({
    key: "category",
    type: "string",
    required: true,
    default: node.category,
    allowed: `\`${node.category}\``,
    variables: "No",
    description: "Catalog category id.",
    example: JSON.stringify(node.category),
    system: true,
  });
  rows.push({
    key: "tone",
    type: "string",
    required: false,
    default: toneForCategory(node.category),
    allowed: "UI tone token from `toneForCategory`",
    variables: "No",
    description: "Visual tone for the canvas node.",
    example: JSON.stringify(toneForCategory(node.category)),
    system: true,
  });
  rows.push({
    key: "description",
    type: "string",
    required: false,
    default: schema?.description || node.description || "",
    allowed: "—",
    variables: "No",
    description: "Human description copied from schema/catalog.",
    example: JSON.stringify(schema?.description || node.description || ""),
    system: true,
  });

  if (node.type === "start") {
    rows.push(
      {
        key: "label",
        type: "text",
        required: true,
        default: "Workflow Start",
        allowed: "—",
        variables: "No",
        description: "Display name",
        example: '"Workflow Start"',
      },
      {
        key: "status",
        type: "string",
        required: false,
        default: "ready",
        allowed: "`ready`",
        variables: "No",
        description: "UI status",
        example: '"ready"',
      },
      {
        key: "triggerSource",
        type: "string",
        required: false,
        default: "manual",
        allowed: "`manual`",
        variables: "No",
        description: "Start source marker",
        example: '"manual"',
      }
    );
    return rows;
  }

  if (node.type === "end") {
    rows.push(
      {
        key: "label",
        type: "text",
        required: true,
        default: "End",
        allowed: "—",
        variables: "No",
        description: "Display Name (EndProperties)",
        example: '"End"',
      },
      {
        key: "status",
        type: "string",
        required: false,
        default: "ready",
        allowed: "`ready`",
        variables: "No",
        description: "UI status",
        example: '"ready"',
      },
      {
        key: "outcome",
        type: "select",
        required: false,
        default: "completed",
        allowed: "`completed`, `cancelled`, `failed`",
        variables: "No",
        description: "Branch termination outcome (EndProperties)",
        example: '"completed"',
      }
    );
    return rows;
  }

  if (schema?.fields) {
    for (const field of schema.fields) {
      if (field.type === "variables" || field.type === "retry") {
        rows.push({
          key: field.type,
          type: field.type,
          required: false,
          default: "—",
          allowed: "—",
          variables: field.type === "variables" ? "Picker UI only" : "N/A",
          description:
            field.type === "variables"
              ? "Schema marker for variable picker section (not stored as a data key)."
              : "Schema marker for retry UI (not currently present on messaging schemas).",
          example: "—",
          marker: true,
        });
        continue;
      }
      const defVal =
        schema.defaults && field.key in schema.defaults
          ? schema.defaults[field.key]
          : undefined;
      rows.push({
        key: field.key,
        type: fieldTypeLabel(field.type),
        required: Boolean(field.required),
        default: defVal !== undefined ? JSON.stringify(defVal) : "—",
        allowed: optionsText(field),
        variables: supportsVariables(node, field),
        description: [field.label, field.hint, field.placeholder ? `Placeholder: ${field.placeholder}` : null, field.showWhen ? `Visible when: ${JSON.stringify(field.showWhen)}` : null, field.min != null ? `min=${field.min}` : null, field.max != null ? `max=${field.max}` : null]
          .filter(Boolean)
          .join(". "),
        example: exampleFor(field, schema.defaults),
      });
    }
  } else if (node.stubFields) {
    for (const field of node.stubFields) {
      rows.push({
        key: field.key,
        type: fieldTypeLabel(field.type),
        required: Boolean(field.required),
        default:
          field.key === "label"
            ? JSON.stringify(node.title)
            : field.key === "entity"
              ? '"patient"'
              : "—",
        allowed: optionsText(field),
        variables: "No",
        description: field.label || field.key,
        example:
          field.key === "label"
            ? JSON.stringify(node.title)
            : field.options?.[0]
              ? JSON.stringify(field.options[0].value)
              : '""',
      });
    }
  } else {
    rows.push({
      key: "label",
      type: "text",
      required: true,
      default: JSON.stringify(node.title),
      allowed: "—",
      variables: "No",
      description: "Display name (GenericNodeProperties)",
      example: JSON.stringify(node.title),
    });
    rows.push({
      key: "status",
      type: "string",
      required: false,
      default: '"draft"',
      allowed: "`draft`",
      variables: "No",
      description: "Draft status from stubNode defaultData",
      example: '"draft"',
    });
  }

  // Messaging defaults present on node.data even when not in schema.fields UI
  if (node.kind === "messaging" && schema?.defaults) {
    const sharedKeys = [
      "recipient",
      "repeatReminder",
      "retryInterval",
      "maxRetryCount",
      "fallbackChannel",
      "variables",
      "status",
      "templateId",
    ];
    const existing = new Set(rows.map((r) => r.key));
    for (const key of sharedKeys) {
      if (existing.has(key)) continue;
      if (!(key in schema.defaults)) continue;
      const val = schema.defaults[key];
      let allowed = "—";
      let description = `Present on node.data via createMessagingDefaults (saved with the node).`;
      let variables = "No";
      if (key === "recipient") {
        allowed = RECIPIENT_OPTIONS.map((o) => `\`${o.value}\``).join(", ");
        description +=
          " Validated by validateWorkflowGraph as required. Only sendTemplate schema exposes recipient in the property panel; other messaging nodes still persist recipient on data.";
      }
      if (key === "fallbackChannel") {
        allowed =
          NOTIFICATION_CHANNEL_OPTIONS.map((o) => `\`${o.value}\``).join(", ") +
          " or empty string";
      }
      if (key === "retryInterval") {
        allowed = RETRY_INTERVAL_OPTIONS.map((o) => `\`${o.value}\``).join(", ");
        description +=
          " Required by validateWorkflowGraph when repeatReminder is true.";
      }
      if (key === "maxRetryCount") {
        description +=
          " Must be ≥ 1 when repeatReminder is true (validateWorkflowGraph).";
      }
      if (key === "variables") {
        description += " Object map reserved for template variables.";
      }
      rows.push({
        key,
        type: typeof val,
        required: key === "recipient",
        default: JSON.stringify(val),
        allowed,
        variables,
        description,
        example: JSON.stringify(val),
        note: "On node.data; may not appear in MessagingProperties schema.fields UI",
      });
    }
  }

  // Persist any remaining schema.defaults keys (e.g. trigger `status`) not already listed.
  if (schema?.defaults) {
    const existing = new Set(rows.map((r) => r.key));
    for (const [key, val] of Object.entries(schema.defaults)) {
      if (existing.has(key)) continue;
      rows.push({
        key,
        type: Array.isArray(val) ? "array" : typeof val,
        required: false,
        default: JSON.stringify(val),
        allowed: "—",
        variables: "No",
        description:
          "Present on node.data via schema defaults / createNodeDefaults (saved with the node).",
        example: JSON.stringify(val),
        note: "Default key not declared as a schema.fields entry",
      });
    }
  }

  return rows;
}

function variableSection(node, schema) {
  const lines = [];
  if (node.kind === "messaging" || node.type === "dbDelete") {
    lines.push(
      "Variable tokens from `WORKFLOW_VARIABLE_GROUPS` (`src/components/flow/config/variables.js`):"
    );
    lines.push("");
    for (const group of WORKFLOW_VARIABLE_GROUPS) {
      lines.push(`**${group.label}**`);
      for (const v of group.variables) {
        lines.push(`- \`{{${v.key}}}\` — ${v.label}`);
      }
      lines.push("");
    }
    if (node.kind === "messaging") {
      lines.push(
        "Messaging property panel inserts tokens via `ApiVariablePicker` (API variables for the workflow trigger, plus local catalog). Insertable fields: `subject`, `body`, `message`, `title`, `prompt`, `buttons`."
      );
    }
    if (node.type === "dbDelete") {
      lines.push(
        "Database Delete inserts into `recordId` via `VariablePicker`. Panel hint mentions `{{appointment_id}}` and `{{patient_id}}` (both are present in `WORKFLOW_VARIABLE_GROUPS`)."
      );
    }
    return lines.join("\n");
  }
  if (node.kind === "condition") {
    return [
      "Condition nodes use **JEXL**, not `{{token}}` placeholders.",
      "",
      "Expression scope (from `src/runtime/engines/jexlCondition.js`): `patient`, `customer` (alias of patient), `doctor`, `hospital`, `appointment`, `payment`, `invoice`, `prescription`, `organization`, `medicine`, `workflow`, `variables`, `outputs`.",
      "",
      "Examples from runtime: `patient.age >= 60`, `appointment.status == \"Confirmed\" && payment.success`.",
    ].join("\n");
  }
  if (node.kind === "trigger" && schema?.contextCard) {
    const keys = (schema.contextCard.rows || []).map((r) => r.key);
    return [
      "Triggers do not edit message templates in the main schema fields; context is injected at runtime.",
      "",
      `UI context card keys (read-only): ${keys.map((k) => `\`{{${k}}}\` / \`${k}\``).join(", ") || "—"}`,
      "",
      schema.laravelContext?.length
        ? `Declared laravelContext: ${schema.laravelContext.map((c) => `\`${c}\``).join(", ")}`
        : "No laravelContext declared on this trigger schema.",
    ].join("\n");
  }
  return "No variable picker on this node’s property panel.";
}

function validationSection(node) {
  const lines = [
    "### Graph-level (`validateWorkflowGraph`)",
    "- Workflow must have nodes.",
    "- Exactly one event trigger (`isTrigger` / `triggerKey`, excluding `start`).",
    "- At least one `end` node.",
    "- No cycles unless a `loop` node exists (catalog currently has no loop node).",
    "- All non-start nodes must be connected when more than one node exists.",
    "- Unknown node types are errors.",
    "",
  ];

  if (node.type === "start") {
    lines.push(
      "### Node-specific",
      "- Multiple start nodes → warning.",
      "- Start with no outgoing edge when other nodes exist → error.",
      "- Start is stripped from Laravel save payload (`stripFrontendStartNodes`)."
    );
    return lines.join("\n");
  }

  if (node.kind === "trigger") {
    lines.push(
      "### Node-specific (`validateTriggerNodeFields`)",
      "- Required schema fields that are visible (`showWhen`) must be non-empty.",
      "- Empty arrays count as empty.",
      "- If a field of type `retry` exists and `repeatReminder` is on: `retryInterval` required; `maxRetryCount` ≥ 1."
    );
    return lines.join("\n");
  }

  if (node.kind === "messaging") {
    lines.push(
      "### Node-specific (`getMessagingFieldErrors` + `validateWorkflowGraph`)",
      "- `recipient` must be set on node.data.",
      "- When `repeatReminder` is true: `retryInterval` required; `maxRetryCount` ≥ 1.",
      "- **sendWhatsApp / sendSms**: `templateId` and `message` required.",
      "- **sendEmail**: template OR both `subject` and `body`.",
      "- **sendPush**: template OR both `title` and `body`.",
      "- **sendAiChat**: `templateId` and `prompt` required.",
      "- **sendAiVoice**: template OR `prompt`.",
      "- **sendIvr / sendTemplate**: `templateId` required (plus schema-required channel/recipient for sendTemplate).",
      "- Catalog `fields` required-check also runs for required catalog fields."
    );
    return lines.join("\n");
  }

  if (node.kind === "condition") {
    lines.push(
      "### Node-specific (`validateConditionNodeFields`)",
      "- `expression` is required (non-empty).",
      "- Expression must pass `validateJexlSyntax` (jexl.compile)."
    );
    return lines.join("\n");
  }

  if (node.kind === "wait") {
    lines.push(
      "### Node-specific",
      "- Wait/delay nodes must have an outgoing connection.",
      "- Required catalog/schema fields (`label`, `waitType`) enforced via catalog required fields."
    );
    return lines.join("\n");
  }

  if (node.type === "dbDelete") {
    lines.push(
      "### Node-specific (`validateDbDeleteNodeFields` / `getDbDeleteFieldErrors`)",
      "- `label` required.",
      "- `entity` required and must be `patient` or `appointment`.",
      "- `recordId` required (also accepts legacy `id` / `record_id` when reading for validation)."
    );
    return lines.join("\n");
  }

  if (node.kind === "stub" || node.category === "database" || node.category === "integrations" || node.category === "ai") {
    lines.push(
      "### Node-specific",
      "- Generic required-field check against catalog `fields` (typically `label`, plus `entity`/`query`/`url` when listed).",
      "- No dedicated custom-panel validator."
    );
    return lines.join("\n");
  }

  if (node.type === "end") {
    lines.push(
      "### Node-specific",
      "- At least one End node required in the graph.",
      "- `label` required via catalog fields."
    );
    return lines.join("\n");
  }

  return lines.join("\n");
}

function aliasesFor(type) {
  return Object.entries(TRIGGER_TYPE_ALIASES)
    .filter(([, v]) => v === type)
    .map(([k]) => k);
}

function contractFor(type) {
  return (contracts.nodes || []).find((n) => n.nodeType === type) || null;
}

function backendMapping(node, contract) {
  const aliases = aliasesFor(node.type);
  const lines = [
    `| Frontend Node ID | \`${node.type}\` |`,
    `| Trigger aliases (NodeTypeNormalizer-style, frontend) | ${
      aliases.length ? aliases.map((a) => `\`${a}\``).join(", ") : "_None in frontend `TRIGGER_TYPE_ALIASES`_"
    } |`,
    `| Canonical backend type (from contracts) | \`${contract?.nodeType || node.type}\` (same id; Laravel \`NodeTypeNormalizer\` **not in this repo**) |`,
    `| Executor (from \`automation/node-contracts.json\`) | ${contract?.executor || "_Not documented_"} |`,
    `| Backend status (contracts) | \`${contract?.status || "unknown"}\` |`,
  ];
  if (node.type === "dbDelete") {
    lines.push(
      `| Schema note | Frontend schema comment: keep field keys aligned with Laravel \`DbDeleteExecutor\` (\`entity\`, \`recordId\`). Contracts still mark status \`stub\` / dispatcher stub in JS runtime. |`
    );
  }
  if (node.type === "appointmentBooked") {
    lines.push(
      `| Reference | Laravel \`AppointmentBookedTriggerExecutor\` (product reference; PHP not in this repository). |`
    );
  }
  return lines.join("\n");
}

function mdEscapeCell(s) {
  return String(s ?? "").replace(/\|/g, "\\|").replace(/\n/g, " ");
}

function renderNodeSection(node, index) {
  const schema = getSchema(node);
  const contract = contractFor(node.type);
  const defaults = buildDefaults(node, schema);
  const fields = panelFields(node, schema);
  const aliases = aliasesFor(node.type);

  const lines = [];
  lines.push(`# Node: ${node.type}`);
  lines.push("");
  lines.push("## Basic Information");
  lines.push("");
  lines.push("| Property | Value |");
  lines.push("|---|---|");
  lines.push(`| Node ID | \`${node.type}\` |`);
  lines.push(`| Display Name | ${node.title} |`);
  lines.push(
    `| Purpose | ${mdEscapeCell(schema?.description || node.description || node.title)} |`
  );
  lines.push(`| Category | \`${node.category}\` |`);
  lines.push(`| Node Type | \`${node.type}\` |`);
  lines.push(`| Frontend Role | ${roleFor(node)} |`);
  lines.push(
    `| Custom Panel | ${node.customPanel ? `\`${node.customPanel}\`` : "_none (generic)_"} |`
  );
  lines.push(`| Property Panel Component | ${panelComponentFor(node)} |`);
  lines.push(
    `| Backend Canonical Type | \`${node.type}\`${aliases.length ? ` (aliases: ${aliases.map((a) => `\`${a}\``).join(", ")})` : ""} |`
  );
  lines.push(`| Backend Executor | ${mdEscapeCell(contract?.executor || "Not documented in this repo")} |`);
  lines.push(`| Backend Status | \`${contract?.status || "unknown"}\` |`);
  lines.push("");

  lines.push("## Fields");
  lines.push("");
  const dataFields = fields.filter((f) => !f.marker);
  if (!dataFields.length) {
    lines.push("No configurable fields.");
  } else {
    lines.push(
      "| Field | Type | Required | Default | Allowed Values | Variables Supported | Description |"
    );
    lines.push("|---|---|---|---|---|---|---|");
    for (const f of dataFields) {
      lines.push(
        `| \`${f.key}\` | ${mdEscapeCell(f.type)} | ${f.required ? "Yes" : "No"} | ${mdEscapeCell(f.default)} | ${mdEscapeCell(f.allowed)} | ${mdEscapeCell(f.variables)} | ${mdEscapeCell(f.description)}${f.note ? ` _(${mdEscapeCell(f.note)})_` : ""} |`
      );
    }
  }
  const markers = fields.filter((f) => f.marker);
  if (markers.length) {
    lines.push("");
    lines.push("Schema UI markers (not stored as `node.data` keys):");
    for (const m of markers) {
      lines.push(`- \`${m.key}\`: ${m.description}`);
    }
  }
  lines.push("");

  lines.push("## Validation");
  lines.push("");
  lines.push(validationSection(node));
  lines.push("");

  lines.push("## Variable Support");
  lines.push("");
  lines.push(variableSection(node, schema));
  lines.push("");

  lines.push("## Full Frontend JSON");
  lines.push("");
  lines.push(
    "Complete saved node object as produced for workflow configuration persistence (`serializeNode` / `configuration.nodes[]`). Shape is `{ id, type, position, data }` — canvas-only React Flow keys such as `dragHandle` / `selected` are **not** part of the saved Laravel payload."
  );
  lines.push("");
  lines.push("### Complete saved node JSON");
  lines.push("");
  const savedNode = {
    id: `n_${node.type}_1`,
    type: "workflow",
    position: { x: 280, y: 160 },
    data: defaults,
  };
  lines.push("```json");
  lines.push(JSON.stringify(savedNode, null, 2));
  lines.push("```");
  lines.push("");
  lines.push("### `node.data` only");
  lines.push("");
  lines.push("```json");
  lines.push(JSON.stringify(defaults, null, 2));
  lines.push("```");
  lines.push("");

  lines.push("## Backend Mapping");
  lines.push("");
  lines.push(backendMapping(node, contract));
  lines.push("");

  lines.push("## Limitations / Notes");
  lines.push("");
  const notes = [];
  notes.push(`- Catalog description: ${node.description || schema?.description || "—"}`);
  if (contract?.nextStepBehavior) {
    notes.push(`- Next-step behavior (contracts): ${contract.nextStepBehavior}`);
  }
  if (node.type === "start") {
    notes.push(
      "- Frontend-only decoration; stripped before Laravel save/publish (`stripFrontendStartNodes`)."
    );
  }
  if (node.kind === "messaging") {
    notes.push(
      "- `MessagingProperties` renders `schema.fields` only; shared defaults (`recipient`, retry fields) remain on `node.data` and are validated on save."
    );
    notes.push(
      "- JS `ChannelManager` adapters in this repo return stub successes; production delivery is Laravel-side."
    );
  }
  if (node.kind === "stub" || (node.category === "database" && node.type !== "dbDelete")) {
    notes.push("- Catalog stub: GenericNodeProperties only; ActionDispatcher returns `stub: true` in JS runtime.");
  }
  if (node.type === "dbDelete") {
    notes.push(
      "- Has a full schema + DatabaseProperties panel. Contracts/JS dispatcher still treat database actions as stubs until Laravel DbDeleteExecutor is confirmed in the PHP app."
    );
    notes.push(
      "- `docs/automation/backend-node-contracts.json` was not found in this repository."
    );
  }
  if (node.kind === "trigger" && node.type !== "appointmentBooked") {
    notes.push(
      "- Frontend schema is complete; Laravel-specific executor for this trigger is not present in this repository (contracts: partial)."
    );
  }
  if (aliases.length) {
    notes.push(
      `- Frontend alias resolution maps ${aliases.map((a) => `\`${a}\``).join(", ")} → \`${node.type}\`.`
    );
  }
  for (const n of notes) lines.push(n);
  lines.push("");
  lines.push("---");
  lines.push("");
  return lines.join("\n");
}

// ── Build document ──────────────────────────────────────────────
const catalogNodes = parseCatalog();
const contractTypes = new Set((contracts.nodes || []).map((n) => n.nodeType));

let md = "";
md += `# Frontend Automation Node Documentation\n\n`;
md += `## 1. Purpose\n\n`;
md += `This document defines the **frontend automation node contract** used when building and saving workflows in the HIP Flow Builder. It describes every node currently registered in the frontend catalog, including property-panel fields, validation, variable support, the full JSON the frontend produces, and backend mapping status from \`automation/node-contracts.json\`.\n\n`;
md += `It is intended for backend/frontend automation integration. Fields and behaviors not present in the inspected source files are **not** invented.\n\n`;
md += `Generated: ${new Date().toISOString()}\n\n`;

md += `## 2. Source of Truth\n\n`;
md += `| Concern | Files |\n|---|---|\n`;
md += `| Node catalog | \`src/components/flow/config/nodes/catalog.js\` |\n`;
md += `| Categories / tones | \`workflowCategories.js\`, \`nodeTones.js\`, \`workflowNodes.js\` (\`createNodeDefaults\`) |\n`;
md += `| Trigger schemas / aliases | \`src/components/flow/config/triggers/schemas.js\`, \`triggers/shared.js\` |\n`;
md += `| Messaging schemas | \`messaging/schemas.js\`, \`messaging/shared.js\` |\n`;
md += `| Condition schemas | \`conditions/schemas.js\` |\n`;
md += `| Wait schemas | \`wait/schemas.js\` |\n`;
md += `| Database schemas | \`database/schemas.js\`, \`database/shared.js\` |\n`;
md += `| Variables | \`src/components/flow/config/variables.js\`, \`src/utils/workflowVariableTokens.js\` |\n`;
md += `| Property panels | \`panels/PropertyPanel.jsx\`, \`triggers/*\`, \`messaging/*\`, \`conditions/*\`, \`wait/*\`, \`database/*\`, \`flow/EndProperties.jsx\` |\n`;
md += `| Validation | \`useFlowBuilder.js\` → \`validateWorkflowGraph\`; \`triggerValidation.js\`; \`messagingUx.js\`; \`conditionValidation.js\`; \`dbDeleteValidation.js\` |\n`;
md += `| Generated contracts | \`automation/node-contracts.json\` |\n`;
md += `| Backend contracts file | \`docs/automation/backend-node-contracts.json\` — **not present** in this repository |\n`;
md += `| Laravel mapping | \`NodeTypeNormalizer\` / executors are **not in this repo**; mapping below uses contracts + frontend aliases only |\n\n`;

md += `## 3. Node Summary\n\n`;
md += `| # | Frontend Node ID | Display Name | Category | Frontend Role | Backend Canonical Type | Backend Status |\n`;
md += `|---|---|---|---|---|---|---|\n`;
catalogNodes.forEach((n, i) => {
  const c = contractFor(n.type);
  const aliases = aliasesFor(n.type);
  const canonical =
    aliases.length > 0
      ? `\`${n.type}\` (aliases: ${aliases.map((a) => `\`${a}\``).join(", ")})`
      : `\`${n.type}\``;
  md += `| ${i + 1} | \`${n.type}\` | ${n.title} | \`${n.category}\` | ${roleFor(n)} | ${canonical} | \`${c?.status || "unknown"}\` |\n`;
});
md += `\n`;
md += `**Catalog node count:** ${catalogNodes.length}  \n`;
md += `**Contracts node count:** ${contracts.summary?.totalNodes ?? contractTypes.size}  \n`;
md += `**Missing from contracts:** ${catalogNodes
  .filter((n) => !contractTypes.has(n.type))
  .map((n) => n.type)
  .join(", ") || "_none_"}\n\n`;

md += `## 3.1 Shared messaging defaults (all messaging nodes)\n\n`;
md += `Every messaging schema default is built with \`createMessagingDefaults\`, which always includes:\n\n`;
md += "```json\n";
md += JSON.stringify(createMessagingDefaults({ label: "<node label>" }), null, 2);
md += "\n```\n\n";
md += `Recipient options: ${RECIPIENT_OPTIONS.map((o) => `\`${o.value}\``).join(", ")}  \n`;
md += `Retry interval options: ${RETRY_INTERVAL_OPTIONS.map((o) => `\`${o.value}\``).join(", ")}  \n`;
md += `Notification channel options: ${NOTIFICATION_CHANNEL_OPTIONS.map((o) => `\`${o.value}\``).join(", ")}  \n`;
md += `Push priority options: ${PUSH_PRIORITY_OPTIONS.map((o) => `\`${o.value}\``).join(", ")}\n\n`;

md += `## 3.2 Trigger aliases\n\n`;
md += `| Alias | Canonical |\n|---|---|\n`;
for (const [a, c] of Object.entries(TRIGGER_TYPE_ALIASES)) {
  md += `| \`${a}\` | \`${c}\` |\n`;
}
md += `\n`;

md += `## 4. Detailed Node Documentation\n\n`;
catalogNodes.forEach((n, i) => {
  md += renderNodeSection(n, i);
});

md += `## 5. Appendix — Variable Catalog\n\n`;
for (const group of WORKFLOW_VARIABLE_GROUPS) {
  md += `### ${group.label}\n\n`;
  for (const v of group.variables) {
    md += `- \`{{${v.key}}}\` — ${v.label}\n`;
  }
  md += `\n`;
}

md += `## 6. Appendix — Schema-only types (not in catalog)\n\n`;
md += `These appear in schemas or \`runtime/types.js\` but are **not** in \`WORKFLOW_NODES\` and therefore have no catalog documentation section:\n\n`;
const schemaOnly = contracts.schemaOnlyTypesNotInCatalog?.types || [];
for (const t of schemaOnly) {
  md += `- \`${t}\`\n`;
}
md += `\n`;

const outPath = path.join(ROOT, "docs/automation/frontend-node-documentation.md");
fs.writeFileSync(outPath, md);
console.log(
  JSON.stringify(
    {
      outPath,
      catalogNodes: catalogNodes.length,
      bytes: md.length,
      types: catalogNodes.map((n) => n.type),
    },
    null,
    2
  )
);
