"use client";

import { useMemo, useRef, useState } from "react";
import {
  getDatabaseSchema,
} from "../../config/database/schemas";
import {
  DB_DELETE_DEFAULT_RECORD_ID,
} from "../../config/database/shared";
import SchemaFieldRenderer from "../shared/SchemaFieldRenderer";
import VariablePicker from "../shared/VariablePicker";
import { ensureValidPlaceholder } from "@/utils/workflowVariableTokens";
import { getDbDeleteFieldErrors } from "./dbDeleteValidation";
import styles from "../../styles/propertyPanel.module.css";

function insertAtCursor(value, token, start, end) {
  const text = String(value ?? "");
  const from = typeof start === "number" ? start : text.length;
  const to = typeof end === "number" ? end : from;
  const next = `${text.slice(0, from)}${token}${text.slice(to)}`;
  return { value: next, cursor: from + token.length };
}

/**
 * Property panel for database nodes (currently dbDelete).
 */
export default function DatabaseProperties({ data, onChange }) {
  const schema = getDatabaseSchema(data?.nodeType);
  const patch = (partial) => onChange?.(partial);
  const activeFieldRef = useRef({ key: "recordId", start: null, end: null });
  const [activeFieldKey, setActiveFieldKey] = useState("recordId");

  const errors = useMemo(() => {
    if (data?.nodeType === "dbDelete") {
      return getDbDeleteFieldErrors(data || {});
    }
    return {};
  }, [data]);

  if (!schema) {
    return (
      <div className={styles.scroll}>
        <p className={styles.hint}>No database schema found.</p>
      </div>
    );
  }

  const rememberSelection = (target) => {
    activeFieldRef.current = {
      key: "recordId",
      start: target?.selectionStart ?? null,
      end: target?.selectionEnd ?? null,
    };
    setActiveFieldKey("recordId");
  };

  const handleEntityChange = (entity) => {
    const next = { entity };
    const currentId = String(data?.recordId ?? "").trim();
    const previousDefault =
      DB_DELETE_DEFAULT_RECORD_ID[data?.entity] || "";
    const nextDefault = DB_DELETE_DEFAULT_RECORD_ID[entity] || "";

    // Only auto-switch recordId when empty or still on the previous entity default.
    if (!currentId || currentId === previousDefault) {
      next.recordId = nextDefault;
    }

    patch(next);
  };

  const handleInsertVariable = (token) => {
    const safeToken = ensureValidPlaceholder(token);
    if (!safeToken) return;

    const current = String(data?.recordId ?? "");
    const { value, cursor } = insertAtCursor(
      current,
      safeToken,
      activeFieldRef.current.start,
      activeFieldRef.current.end
    );

    patch({ recordId: value });
    activeFieldRef.current = {
      key: "recordId",
      start: cursor,
      end: cursor,
    };
    setActiveFieldKey("recordId");

    requestAnimationFrame(() => {
      const el = document.getElementById("schema-recordId");
      if (el && typeof el.setSelectionRange === "function") {
        el.focus();
        el.setSelectionRange(cursor, cursor);
      }
    });
  };

  const errorList = Object.values(errors);

  return (
    <div className={styles.scroll}>
      <div className={styles.helpBox}>{schema.description}</div>

      {(schema.fields || []).map((field) => {
        if (field.type === "variables") return null;

        if (field.key === "entity") {
          return (
            <SchemaFieldRenderer
              key={field.key}
              field={field}
              data={data}
              schema={schema}
              error={errors.entity || null}
              onChange={(partial) => {
                if (Object.prototype.hasOwnProperty.call(partial, "entity")) {
                  handleEntityChange(partial.entity);
                  return;
                }
                patch(partial);
              }}
            />
          );
        }

        if (field.key === "recordId") {
          return (
            <SchemaFieldRenderer
              key={field.key}
              field={field}
              data={data}
              schema={schema}
              error={errors.recordId || null}
              onChange={patch}
              onFocusField={(e) => rememberSelection(e?.target)}
              onSelectField={(e) => rememberSelection(e?.target)}
            />
          );
        }

        return (
          <SchemaFieldRenderer
            key={field.key || field.type}
            field={field}
            data={data}
            schema={schema}
            error={errors[field.key] || null}
            onChange={patch}
          />
        );
      })}

      <VariablePicker
        groups={schema.variableGroups || []}
        onInsert={handleInsertVariable}
      />

      {activeFieldKey === "recordId" ? (
        <p className={styles.hint}>
          Variables insert into Record ID (supports {"{{appointment_id}}"} and{" "}
          {"{{patient_id}}"}).
        </p>
      ) : null}

      {errorList.length ? (
        <div className={styles.helpBox} role="alert">
          {errorList.map((msg) => (
            <p key={msg} className={styles.fieldError}>
              {msg}
            </p>
          ))}
        </div>
      ) : null}
    </div>
  );
}
