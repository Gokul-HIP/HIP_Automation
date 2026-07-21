/**
 * Resolves {{Variable}} tokens from execution context.
 * Generic — works for any workflow domain.
 */

const TOKEN_PATTERN = /\{\{(\w+)\}\}/g;

/** Maps condition field keys to context paths. */
const FIELD_PATH_MAP = {
  age: "patient.age",
  gender: "patient.gender",
  disease: "patient.disease",
  language: "patient.language",
  membership: "patient.membership_status",
  payment_status: "patient.payment_status",
  last_visit: "patient.last_visit_days",
  patient_segment: "patient.segment",
};

export class VariableResolver {
  /**
   * Build a flat lookup map from nested execution context.
   * @param {import('../types').ExecutionContext} context
   */
  flattenContext(context) {
    const flat = {
      ...(context.system ?? {}),
      ...(context.variables ?? {}),
    };

    const sections = [
      ["patient", context.patient],
      ["doctor", context.doctor],
      ["appointment", context.appointment],
      ["prescription", context.prescription],
      ["medicine", context.medicine],
      ["hospital", context.hospital],
      ["trigger", context.triggerPayload],
    ];

    for (const [prefix, section] of sections) {
      if (!section || typeof section !== "object") continue;
      for (const [key, value] of Object.entries(section)) {
        flat[key] = value;
        flat[`${prefix}.${key}`] = value;
        // PascalCase aliases e.g. PatientName
        const pascal = key.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
        const pascalKey = pascal.charAt(0).toUpperCase() + pascal.slice(1);
        flat[pascalKey] = value;
      }
    }

    return flat;
  }

  /**
   * @param {string} template
   * @param {import('../types').ExecutionContext} context
   */
  resolve(template, context) {
    if (!template) return "";
    const flat = this.flattenContext(context);
    return template.replace(TOKEN_PATTERN, (match, key) => {
      const value = flat[key] ?? flat[key.toLowerCase()];
      return value == null || value === "" ? match : String(value);
    });
  }

  /**
   * Resolve a condition field value from context.
   * @param {string} field
   * @param {import('../types').ExecutionContext} context
   */
  getFieldValue(field, context) {
    const flat = this.flattenContext(context);
    const path = FIELD_PATH_MAP[field] ?? field;
    if (flat[path] != null) return flat[path];
    if (flat[field] != null) return flat[field];
    return null;
  }

  /**
   * Resolve all keys in an object using context.
   * @param {Record<string, unknown>} obj
   * @param {import('../types').ExecutionContext} context
   */
  resolveObject(obj, context) {
    if (!obj || typeof obj !== "object") return {};
    const result = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] =
        typeof value === "string" ? this.resolve(value, context) : value;
    }
    return result;
  }
}

export const variableResolver = new VariableResolver();
