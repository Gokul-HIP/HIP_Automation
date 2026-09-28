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
  "invoice.status": "invoice.status",
  "invoice.payment_status": "invoice.payment_status",
  "invoice.id": "invoice.id",
  "invoice.amount": "invoice.amount",
  invoice_status: "invoice.status",
  invoice_id: "invoice.id",
  invoice_amount: "invoice.amount",
};

/**
 * Payment Pending amount rule: total_amount first, amount as fallback.
 * @param {Record<string, unknown> | null | undefined} invoice
 */
export function resolveInvoiceAmount(invoice) {
  if (!invoice || typeof invoice !== "object") return null;
  const total = invoice.total_amount ?? invoice.totalAmount;
  if (total != null && total !== "") return total;
  const amount = invoice.amount ?? invoice.invoice_amount;
  return amount == null || amount === "" ? null : amount;
}

/**
 * Normalize invoice facts for templates and JEXL. Does not invent fields
 * or rewrite stored status casing.
 * @param {Record<string, unknown> | null | undefined} invoice
 */
export function normalizeInvoiceFacts(invoice) {
  const src = invoice && typeof invoice === "object" ? { ...invoice } : {};
  const id = src.id ?? src.invoice_id ?? null;
  const status = src.status ?? src.invoice_status ?? null;
  const amount = resolveInvoiceAmount(src);
  const paymentStatus = src.payment_status ?? src.paymentStatus ?? null;

  if (id != null && id !== "") {
    src.id = id;
    src.invoice_id = src.invoice_id ?? id;
  }
  if (status != null && status !== "") {
    src.status = status;
  }
  if (amount != null) {
    if (src.total_amount == null && src.totalAmount == null) {
      src.total_amount = amount;
    }
    if (src.amount == null) {
      src.amount = amount;
    }
  }
  if (paymentStatus != null && paymentStatus !== "") {
    src.payment_status = paymentStatus;
  }
  return src;
}

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
      ["payment", context.payment],
      ["invoice", context.invoice],
      ["organization", context.organization],
      ["trigger", context.triggerPayload],
    ];

    for (const [prefix, section] of sections) {
      if (!section || typeof section !== "object") continue;
      for (const [key, value] of Object.entries(section)) {
        flat[key] = value;
        flat[`${prefix}.${key}`] = value;
        flat[`${prefix}_${key}`] = value;
        // PascalCase aliases e.g. PatientName
        const pascal = key.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
        const pascalKey = pascal.charAt(0).toUpperCase() + pascal.slice(1);
        flat[pascalKey] = value;
      }
    }

    // Reusable booking link aliases (hospital or variables).
    const bookingLink =
      flat.booking_link ??
      flat.hospital_booking_link ??
      flat["hospital.booking_link"] ??
      flat.booking_url ??
      flat["hospital.booking_url"] ??
      null;
    if (bookingLink != null && bookingLink !== "") {
      flat.booking_link = bookingLink;
      flat.BookingLink = bookingLink;
    }

    const hospitalPhone =
      flat.hospital_phone ??
      flat["hospital.phone"] ??
      flat.phone ??
      null;
    if (hospitalPhone != null && hospitalPhone !== "") {
      flat.hospital_phone = hospitalPhone;
    }

    const invoiceFacts = normalizeInvoiceFacts(context.invoice);
    if (invoiceFacts.id != null && invoiceFacts.id !== "") {
      flat.invoice_id = invoiceFacts.id;
      flat["invoice.id"] = invoiceFacts.id;
    }
    const invoiceAmount = resolveInvoiceAmount(invoiceFacts);
    if (invoiceAmount != null) {
      flat.invoice_amount = invoiceAmount;
      flat["invoice.amount"] = invoiceFacts.amount ?? invoiceAmount;
      if (invoiceFacts.total_amount != null) {
        flat["invoice.total_amount"] = invoiceFacts.total_amount;
      }
    }
    if (invoiceFacts.status != null && invoiceFacts.status !== "") {
      flat.invoice_status = invoiceFacts.status;
      flat["invoice.status"] = invoiceFacts.status;
    }
    if (
      invoiceFacts.payment_status != null &&
      invoiceFacts.payment_status !== ""
    ) {
      flat["invoice.payment_status"] = invoiceFacts.payment_status;
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
