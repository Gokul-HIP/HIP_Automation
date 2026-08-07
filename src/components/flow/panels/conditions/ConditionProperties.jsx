"use client";

import { useRef, useState } from "react";
import TextField from "../fields/TextField";
import SchemaFieldRenderer from "../shared/SchemaFieldRenderer";
import ApiVariablePicker from "@/components/variable-picker/ApiVariablePicker";
import { getConditionSchema } from "../../config/conditions/schemas";
import {
  JEXL_CONDITION_EXAMPLES,
  tokenToJexlPath,
  validateJexlSyntax,
} from "@/runtime/engines/jexlCondition";
import styles from "../../styles/propertyPanel.module.css";

/**
 * Condition property panel.
 * - nodeType "condition" → JEXL editor (Name + Expression)
 * - other condition catalog types (e.g. Switch) → schema fields
 */
export default function ConditionProperties({ data, onChange }) {
  const schema = getConditionSchema(data?.nodeType);
  const textareaRef = useRef(null);
  const [syntaxHint, setSyntaxHint] = useState(null);

  if (!schema) {
    return (
      <div className={styles.scroll}>
        <p className={styles.hint}>No condition schema found.</p>
      </div>
    );
  }

  const patch = (partial) => {
    const next = { ...partial };
    if (Object.prototype.hasOwnProperty.call(partial, "name")) {
      next.label = partial.name || "Condition";
    }
    onChange?.(next);
  };

  if (data?.nodeType !== "condition") {
    return (
      <div className={styles.scroll}>
        <div className={styles.helpBox}>{schema.description}</div>
        {(schema.fields || []).map((field) => (
          <SchemaFieldRenderer
            key={field.key || field.type}
            field={field}
            data={data}
            schema={schema}
            onChange={patch}
          />
        ))}
      </div>
    );
  }

  const name = data?.name ?? data?.label ?? "";
  const expression = data?.expression ?? "";
  const triggerKey = data?.workflowTriggerKey ?? null;

  const insertAtCursor = (text) => {
    const el = textareaRef.current;
    const current = String(expression ?? "");
    if (!el) {
      const spacer = current && !/\s$/.test(current) ? " " : "";
      patch({ expression: `${current}${spacer}${text}` });
      return;
    }

    const start = el.selectionStart ?? current.length;
    const end = el.selectionEnd ?? current.length;
    const next = `${current.slice(0, start)}${text}${current.slice(end)}`;
    patch({ expression: next });

    requestAnimationFrame(() => {
      el.focus();
      const caret = start + text.length;
      el.setSelectionRange(caret, caret);
    });
  };

  const handleExpressionChange = (value) => {
    patch({ expression: value });
    const trimmed = value.trim();
    if (!trimmed) {
      setSyntaxHint(null);
      return;
    }
    const result = validateJexlSyntax(trimmed);
    setSyntaxHint(
      result.ok
        ? { ok: true, message: "Valid JEXL syntax" }
        : { ok: false, message: result.error }
    );
  };

  return (
    <div className={styles.scroll}>
      <div className={styles.helpBox}>
        Evaluate a JEXL expression against the workflow context. Route execution
        through the True or False output.
      </div>

      <TextField
        id="condition-name"
        label="Name"
        value={name}
        placeholder="Payment Successful"
        onChange={(next) => patch({ name: next })}
      />

      <div className={styles.field}>
        <label htmlFor="condition-expression" className={styles.label}>
          Condition *
        </label>
        <textarea
          ref={textareaRef}
          id="condition-expression"
          className={`${styles.textarea} ${styles.jexlEditor}`}
          rows={6}
          spellCheck={false}
          placeholder="customer.age >= 18"
          value={expression}
          onChange={(e) => handleExpressionChange(e.target.value)}
        />
        {syntaxHint ? (
          <p
            className={styles.hint}
            style={{
              color: syntaxHint.ok ? "var(--success)" : "var(--danger)",
            }}
          >
            {syntaxHint.message}
          </p>
        ) : (
          <p className={styles.hint}>
            Write a JEXL expression that evaluates to true or false.
          </p>
        )}
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Variables</h3>
        <p className={styles.sectionHint}>
          Click a variable to insert it into the expression (e.g. patient.age).
        </p>
        <ApiVariablePicker
          triggerKey={triggerKey}
          onInsert={(token) => {
            const path = tokenToJexlPath(token);
            if (path) insertAtCursor(path);
          }}
        />
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Examples</h3>
        <p className={styles.sectionHint}>
          Click an example to use it as the condition.
        </p>
        <div className={styles.exampleList}>
          {JEXL_CONDITION_EXAMPLES.map((example) => (
            <button
              key={example}
              type="button"
              className={styles.exampleChip}
              onClick={() => handleExpressionChange(example)}
            >
              <code>{example}</code>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
