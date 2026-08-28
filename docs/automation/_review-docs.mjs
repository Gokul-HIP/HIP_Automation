/**
 * Verify docs/automation/frontend-node-documentation.md against catalog + schemas.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { register } from "node:module";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");

register("./alias-loader.mjs", pathToFileURL(path.join(__dirname, "_review-docs.mjs")));

const { TRIGGER_SCHEMAS } = await import(
  pathToFileURL(path.join(ROOT, "src/components/flow/config/triggers/schemas.js")).href
);
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
const { toneForCategory } = await import(
  pathToFileURL(path.join(ROOT, "src/components/flow/config/nodeTones.js")).href
);

const contracts = JSON.parse(
  fs.readFileSync(path.join(ROOT, "automation/node-contracts.json"), "utf8")
);
const doc = fs.readFileSync(
  path.join(ROOT, "docs/automation/frontend-node-documentation.md"),
  "utf8"
);

function parseCatalog() {
  const src = fs.readFileSync(
    path.join(ROOT, "src/components/flow/config/nodes/catalog.js"),
    "utf8"
  );
  const withoutBlock = src.replace(/\/\*[\s\S]*?\*\//g, "");
  const cleaned = withoutBlock
    .split(/\r?\n/)
    .map((line) => {
      const trimmed = line.trimStart();
      if (trimmed.startsWith("//")) return "";
      return line.replace(/(^|[^:])\/\/.*$/, "$1");
    })
    .join("\n");

  const nodesRegionMatch = cleaned.match(
    /export const WORKFLOW_NODES\s*=\s*\[([\s\S]*)\];\s*$/m
  );
  const nodesRegion = nodesRegionMatch ? nodesRegionMatch[1] : cleaned;
  const helperRe =
    /(triggerNode|messagingNode|conditionNode|waitNode|databaseNode|stubNode)\(\s*\{/g;

  function extractBalancedObject(str, openIdx) {
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

  const nodes = [
    {
      type: "start",
      category: "triggers",
      title: "Workflow Start",
      kind: "start",
      customPanel: null,
    },
  ];

  let m;
  while ((m = helperRe.exec(nodesRegion))) {
    const helper = m[1];
    const body = extractBalancedObject(
      nodesRegion,
      nodesRegion.indexOf("{", m.index)
    );
    if (!body || !/type:\s*"/.test(body)) continue;
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
                : null);
    nodes.push({
      type,
      category,
      title,
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
      stubHasFields: /fields:\s*\[/.test(body),
      body,
    });
  }

  nodes.push({
    type: "end",
    category: "flow",
    title: "End",
    kind: "end",
    customPanel: "end",
  });

  const seen = new Set();
  return nodes.filter((n) => {
    if (seen.has(n.type)) return false;
    seen.add(n.type);
    return true;
  });
}

function schemaFor(node) {
  if (node.kind === "trigger") return TRIGGER_SCHEMAS[node.type];
  if (node.kind === "messaging") return MESSAGING_SCHEMAS[node.type];
  if (node.kind === "condition") return CONDITION_SCHEMAS[node.type];
  if (node.kind === "wait") return WAIT_SCHEMAS[node.type];
  if (node.kind === "database") return DATABASE_SCHEMAS[node.type];
  return null;
}

function expectedDataKeys(node) {
  const keys = new Set(["nodeType", "category", "tone", "description"]);
  if (node.type === "start") {
    ["label", "status", "triggerSource"].forEach((k) => keys.add(k));
    return keys;
  }
  if (node.type === "end") {
    ["label", "status", "outcome"].forEach((k) => keys.add(k));
    return keys;
  }
  const schema = schemaFor(node);
  if (schema?.defaults) {
    Object.keys(schema.defaults).forEach((k) => keys.add(k));
  } else {
    keys.add("label");
    keys.add("status");
  }
  // stub extras from catalog bodies
  if (node.type === "dbUpdate") keys.add("entity");
  if (node.type === "dbQuery") keys.add("query");
  if (node.type === "httpRequest") keys.add("url");
  return keys;
}

function sectionFor(type) {
  const idx = doc.indexOf(`# Node: ${type}`);
  if (idx < 0) return null;
  const next = doc.indexOf("\n# Node:", idx + 1);
  return doc.slice(idx, next === -1 ? doc.length : next);
}

const catalog = parseCatalog();
const docNodes = [...doc.matchAll(/^# Node: (\S+)/gm)].map((m) => m[1]);
const issues = [];

if (catalog.length !== 46) {
  issues.push({ level: "error", msg: `Catalog parse count ${catalog.length} != 46` });
}
if (docNodes.length !== catalog.length) {
  issues.push({
    level: "error",
    msg: `Doc node count ${docNodes.length} != catalog ${catalog.length}`,
  });
}

const missingInDoc = catalog.filter((n) => !docNodes.includes(n.type)).map((n) => n.type);
const extraInDoc = docNodes.filter((t) => !catalog.some((n) => n.type === t));
if (missingInDoc.length) issues.push({ level: "error", msg: "Missing in doc", missingInDoc });
if (extraInDoc.length) issues.push({ level: "error", msg: "Extra in doc", extraInDoc });

  const requiredHeadings = [
  "## Basic Information",
  "## Fields",
  "## Validation",
  "## Variable Support",
  "## Full Frontend JSON",
  "## Backend Mapping",
  "## Limitations / Notes",
];

// Also require Purpose + Complete saved node JSON after regenerate
const softRequired = ["| Purpose |", "### Complete saved node JSON", "| Frontend Role |"];

for (const node of catalog) {
  const section = sectionFor(node.type);
  if (!section) {
    issues.push({ level: "error", msg: `No section for ${node.type}` });
    continue;
  }

  for (const h of requiredHeadings) {
    if (!section.includes(h)) {
      issues.push({ level: "error", msg: `${node.type} missing ${h}` });
    }
  }

  // Purpose / description presence
  if (!section.includes("| Node ID |") || !section.includes("| Display Name |")) {
    issues.push({ level: "error", msg: `${node.type} incomplete basic info table` });
  }

for (const h of softRequired) {
    if (!section.includes(h)) {
      issues.push({ level: "error", msg: `${node.type} missing marker ${h}` });
    }
  }

  // Full saved JSON
  const jsonMatch = section.match(
    /### Complete saved node JSON\s*```json\s*(\{[\s\S]*?\})\s*```/
  );
  if (!jsonMatch) {
    issues.push({ level: "error", msg: `${node.type} missing complete saved JSON block` });
  } else {
    if (jsonMatch[1].includes("...")) {
      issues.push({ level: "error", msg: `${node.type} JSON contains ellipsis` });
    }
    let obj;
    try {
      obj = JSON.parse(jsonMatch[1]);
    } catch (e) {
      issues.push({ level: "error", msg: `${node.type} JSON parse fail: ${e.message}` });
      continue;
    }
    for (const k of ["id", "type", "position", "data"]) {
      if (!(k in obj)) issues.push({ level: "error", msg: `${node.type} JSON missing ${k}` });
    }
    if (obj.type !== "workflow") {
      issues.push({
        level: "warn",
        msg: `${node.type} RF type is ${obj.type}, expected workflow`,
      });
    }
    if (obj.data?.nodeType !== node.type) {
      issues.push({
        level: "error",
        msg: `${node.type} data.nodeType mismatch ${obj.data?.nodeType}`,
      });
    }

    const expected = expectedDataKeys(node);
    const actual = new Set(Object.keys(obj.data || {}));
    const missingKeys = [...expected].filter((k) => !actual.has(k));
    const extraKeys = [...actual].filter((k) => !expected.has(k));
    if (missingKeys.length) {
      issues.push({
        level: "error",
        msg: `${node.type} node.data missing keys`,
        missingKeys,
      });
    }
    if (extraKeys.length) {
      issues.push({
        level: "warn",
        msg: `${node.type} node.data unexpected keys`,
        extraKeys,
      });
    }

    // Schema field keys (excluding markers) must appear in Fields table
    const schema = schemaFor(node);
    if (schema?.fields) {
      for (const f of schema.fields) {
        if (!f.key || f.type === "variables" || f.type === "retry") continue;
        if (!section.includes(`\`${f.key}\``)) {
          issues.push({
            level: "error",
            msg: `${node.type} field ${f.key} not in Fields table`,
          });
        }
      }
    }

    // Messaging shared keys
    if (node.kind === "messaging") {
      for (const k of [
        "recipient",
        "repeatReminder",
        "retryInterval",
        "maxRetryCount",
        "fallbackChannel",
        "variables",
        "status",
      ]) {
        if (!(k in (obj.data || {}))) {
          issues.push({
            level: "error",
            msg: `${node.type} messaging default key missing in JSON: ${k}`,
          });
        }
      }
    }

    // Contract status mentioned
    const contract = (contracts.nodes || []).find((n) => n.nodeType === node.type);
    if (contract?.status && !section.includes(`\`${contract.status}\``)) {
      issues.push({
        level: "warn",
        msg: `${node.type} contract status ${contract.status} not clearly shown`,
      });
    }

    // tone matches category
    const expectedTone = toneForCategory(node.category);
    if (obj.data?.tone !== expectedTone) {
      issues.push({
        level: "error",
        msg: `${node.type} tone ${obj.data?.tone} != ${expectedTone}`,
      });
    }
  }
}

// Summary table row count
const summaryRows = [
  ...doc.matchAll(
    /^\| \d+ \| `([^`]+)` \|/gm
  ),
].map((m) => m[1]);
const summaryMissing = catalog
  .map((n) => n.type)
  .filter((t) => !summaryRows.includes(t));
const summaryExtra = summaryRows.filter(
  (t) => !catalog.some((n) => n.type === t)
);
if (summaryMissing.length || summaryExtra.length) {
  issues.push({
    level: "error",
    msg: "Summary table mismatch",
    summaryMissing,
    summaryExtra,
    summaryCount: summaryRows.length,
  });
}

// Check for invented ellipsis patterns in JSON examples
const ellipsisHits = [...doc.matchAll(/```json[\s\S]*?\.\.\.[\s\S]*?```/g)].length;

const errors = issues.filter((i) => i.level === "error");
const warns = issues.filter((i) => i.level === "warn");

console.log(
  JSON.stringify(
    {
      catalogCount: catalog.length,
      docCount: docNodes.length,
      summaryCount: summaryRows.length,
      ellipsisJsonBlocks: ellipsisHits,
      errorCount: errors.length,
      warnCount: warns.length,
      errors,
      warns: warns.slice(0, 40),
    },
    null,
    2
  )
);
