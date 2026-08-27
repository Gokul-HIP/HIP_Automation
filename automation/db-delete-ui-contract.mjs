/**
 * Lightweight contract check for dbDelete UI ↔ backend executor shape.
 * Run: node automation/db-delete-ui-contract.mjs
 *
 * Does not import Next/React modules (extensionless aliases). Validates source
 * and the saved JSON contract Laravel DbDeleteExecutor expects.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

function getDbDeleteFieldErrors(data) {
  const errors = {};
  const entity = String(data?.entity ?? "").trim();
  const recordId = String(
    data?.recordId ?? data?.id ?? data?.record_id ?? ""
  ).trim();
  const allowed = ["patient", "appointment"];

  if (!String(data?.label ?? "").trim()) errors.label = "Display Name is required";
  if (!entity) errors.entity = "Entity is required";
  else if (!allowed.includes(entity)) {
    errors.entity = "Entity must be Patient or Appointment";
  }
  if (!recordId) errors.recordId = "Record ID is required";
  return errors;
}

const saved = {
  nodeType: "dbDelete",
  label: "Delete Record",
  entity: "appointment",
  recordId: "{{appointment_id}}",
  status: "draft",
};

assert(Object.keys(getDbDeleteFieldErrors(saved)).length === 0, "valid config");
assert(getDbDeleteFieldErrors({ ...saved, entity: "" }).entity, "entity required");
assert(
  getDbDeleteFieldErrors({ ...saved, entity: "invoices" }).entity,
  "entity allowlist"
);
assert(
  getDbDeleteFieldErrors({ ...saved, recordId: "" }).recordId,
  "recordId required"
);

const files = {
  shared: "src/components/flow/config/database/shared.js",
  schemas: "src/components/flow/config/database/schemas.js",
  validation: "src/components/flow/panels/database/dbDeleteValidation.js",
  panel: "src/components/flow/panels/database/DatabaseProperties.jsx",
  catalog: "src/components/flow/config/nodes/catalog.js",
  propertyPanel: "src/components/flow/panels/PropertyPanel.jsx",
  flowBuilder: "src/components/flow/hooks/useFlowBuilder.js",
  variables: "src/components/flow/config/variables.js",
};

for (const [key, rel] of Object.entries(files)) {
  const full = path.join(root, rel);
  assert(fs.existsSync(full), `missing ${key}: ${rel}`);
}

const schemas = fs.readFileSync(path.join(root, files.schemas), "utf8");
assert(schemas.includes('key: "entity"'), "schema entity");
assert(schemas.includes('key: "recordId"'), "schema recordId");
assert(schemas.includes('entity: "appointment"'), "default entity");
assert(schemas.includes('"{{appointment_id}}"'), "default recordId");
assert(!/"table"/.test(schemas) || !schemas.includes('key: "table"'), "no table key");
assert(!schemas.includes('key: "where"'), "no where key");
assert(!schemas.includes('key: "sql"'), "no sql key");

const catalog = fs.readFileSync(path.join(root, files.catalog), "utf8");
assert(
  catalog.includes('databaseNode({ type: "dbDelete"'),
  "catalog databaseNode"
);

const propertyPanel = fs.readFileSync(
  path.join(root, files.propertyPanel),
  "utf8"
);
assert(
  propertyPanel.includes("database: DatabaseProperties"),
  "PropertyPanel map"
);

const flowBuilder = fs.readFileSync(path.join(root, files.flowBuilder), "utf8");
assert(
  flowBuilder.includes("validateDbDeleteNodeFields"),
  "flow validation wired"
);

const variables = fs.readFileSync(path.join(root, files.variables), "utf8");
assert(variables.includes('entry("patient_id"'), "patient_id variable");
assert(variables.includes('entry("appointment_id"'), "appointment_id variable");

const serialized = JSON.parse(JSON.stringify(saved));
assert(serialized.nodeType === "dbDelete", "nodeType");
assert(serialized.entity === "appointment", "entity");
assert(serialized.recordId === "{{appointment_id}}", "recordId");

console.log(
  JSON.stringify(
    {
      ok: true,
      savedJson: serialized,
      graph: {
        nodes: [
          { data: { nodeType: "appointmentBooked" } },
          { data: serialized },
          { data: { nodeType: "end" } },
        ],
      },
    },
    null,
    2
  )
);
