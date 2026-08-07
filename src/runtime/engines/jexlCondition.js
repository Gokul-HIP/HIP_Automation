import jexl from "jexl";

/**
 * JEXL expression helpers for Condition nodes.
 * Portable contract — Laravel ConditionExecutor should mirror this behavior.
 */

export const JEXL_CONDITION_EXAMPLES = [
  'customer.age >= 18',
  'customer.country == "India"',
  "payment.amount >= 1000",
  'appointment.status == "Confirmed"',
  "!payment.success",
  "patient.phone != null",
  'customer.country == "India" && payment.success',
  "patient.age >= 60",
  'doctor.specialization == "Cardiology"',
  'invoice.status == "Paid"',
  "workflow.ai_summary != null",
  'appointment.status == "Confirmed" && payment.success',
];

/**
 * Convert a messaging-style `{{token}}` into a JEXL path.
 * @param {string} token
 * @returns {string}
 */
export function tokenToJexlPath(token) {
  const bare = String(token || "")
    .replace(/^\{\{\s*/, "")
    .replace(/\s*\}\}$/, "")
    .trim();
  if (!bare) return "";
  if (bare.includes(".")) return bare;

  const prefixes = [
    "patient",
    "doctor",
    "hospital",
    "appointment",
    "payment",
    "invoice",
    "prescription",
    "organization",
    "workflow",
    "medicine",
    "lab",
    "customer",
  ];
  for (const prefix of prefixes) {
    if (bare === prefix) return prefix;
    if (bare.startsWith(`${prefix}_`)) {
      return `${prefix}.${bare.slice(prefix.length + 1)}`;
    }
  }
  return bare;
}

/**
 * Validate JEXL syntax (and optionally that it compiles).
 * @param {string} expression
 * @returns {{ ok: boolean, error?: string }}
 */
export function validateJexlSyntax(expression) {
  const expr = String(expression || "").trim();
  if (!expr) {
    return { ok: false, error: "Condition expression is required." };
  }
  try {
    jexl.compile(expr);
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err?.message || "Invalid JEXL syntax.",
    };
  }
}

/**
 * Build the evaluation context object for JEXL.
 * @param {import('../types').ExecutionContext | Record<string, unknown>} context
 */
export function buildJexlContext(context = {}) {
  const patient = context.patient && typeof context.patient === "object" ? context.patient : {};
  const variables =
    context.variables && typeof context.variables === "object" ? context.variables : {};
  const workflow = {
    ...variables,
    ai_summary: variables.ai_summary ?? context.ai_summary ?? null,
  };

  return {
    patient,
    // Spec examples use `customer.*` — alias to patient.
    customer: patient,
    doctor: context.doctor && typeof context.doctor === "object" ? context.doctor : {},
    hospital: context.hospital && typeof context.hospital === "object" ? context.hospital : {},
    appointment:
      context.appointment && typeof context.appointment === "object"
        ? context.appointment
        : {},
    payment:
      context.payment && typeof context.payment === "object"
        ? context.payment
        : variables.payment && typeof variables.payment === "object"
          ? variables.payment
          : {},
    invoice:
      context.invoice && typeof context.invoice === "object"
        ? context.invoice
        : variables.invoice && typeof variables.invoice === "object"
          ? variables.invoice
          : {},
    prescription:
      context.prescription && typeof context.prescription === "object"
        ? context.prescription
        : {},
    organization:
      context.organization && typeof context.organization === "object"
        ? context.organization
        : {},
    medicine: context.medicine && typeof context.medicine === "object" ? context.medicine : {},
    workflow,
    variables,
    outputs:
      context.outputs && typeof context.outputs === "object" ? context.outputs : {},
  };
}

/**
 * Evaluate a JEXL condition expression against workflow context.
 * Must return a boolean; throws on invalid syntax / unknown paths / non-boolean.
 * @param {string} expression
 * @param {import('../types').ExecutionContext | Record<string, unknown>} context
 * @returns {Promise<boolean>}
 */
export async function evaluateJexlCondition(expression, context) {
  const expr = String(expression || "").trim();
  if (!expr) {
    throw new Error("Condition expression is required.");
  }

  const syntax = validateJexlSyntax(expr);
  if (!syntax.ok) {
    throw new Error(syntax.error || "Invalid JEXL syntax.");
  }

  const scope = buildJexlContext(context);

  let result;
  try {
    result = await jexl.eval(expr, scope);
  } catch (err) {
    const message = err?.message || "Condition evaluation failed.";
    if (/undefined|null|Cannot read/i.test(message)) {
      throw new Error(`Null reference in condition: ${message}`);
    }
    if (/unknown|not defined|identifier/i.test(message)) {
      throw new Error(`Unknown variable in condition: ${message}`);
    }
    if (/operator|token|Unexpected/i.test(message)) {
      throw new Error(`Invalid operator or syntax: ${message}`);
    }
    throw new Error(message);
  }

  if (typeof result !== "boolean") {
    throw new Error(
      `Condition expression must return a boolean, got ${result === null ? "null" : typeof result}.`
    );
  }

  return result;
}
