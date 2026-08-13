"use client";

import { useState } from "react";
import { FieldLabel, FieldHint } from "./FieldChrome";
import styles from "../../styles/propertyPanel.module.css";

/**
 * @param {unknown} value
 * @returns {string[]}
 */
function toTagList(value) {
  if (Array.isArray(value)) {
    return value.map((v) => String(v).trim()).filter(Boolean);
  }
  if (typeof value === "string") {
    return value
      .split(/[,]+/)
      .map((v) => v.trim())
      .filter(Boolean);
  }
  return [];
}

/**
 * Free-text tags input. Stores string[] in node data.
 */
export default function TagsField({
  id,
  label,
  values = [],
  required = false,
  placeholder = "appointment, doctor, help",
  hint = "Enter keywords and press Enter or comma.",
  onChange,
}) {
  const tags = toTagList(values);
  const [draft, setDraft] = useState("");

  const commit = (raw) => {
    const parts = String(raw || "")
      .split(/[,]+/)
      .map((v) => v.trim())
      .filter(Boolean);
    if (!parts.length) return;
    const next = [...tags];
    for (const part of parts) {
      if (!next.includes(part)) next.push(part);
    }
    onChange?.(next);
    setDraft("");
  };

  const removeTag = (tag) => {
    onChange?.(tags.filter((t) => t !== tag));
  };

  return (
    <div className={styles.field}>
      <FieldLabel htmlFor={id} required={required}>
        {label}
      </FieldLabel>

      {tags.length ? (
        <div className={styles.chipGroup} aria-label={`${label} tags`}>
          {tags.map((tag) => (
            <button
              key={tag}
              type="button"
              className={styles.chip}
              data-active="true"
              onClick={() => removeTag(tag)}
              title={`Remove ${tag}`}
            >
              {tag} ×
            </button>
          ))}
        </div>
      ) : null}

      <input
        id={id}
        type="text"
        className={styles.control}
        value={draft}
        placeholder={placeholder}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            commit(draft);
          } else if (e.key === "Backspace" && !draft && tags.length) {
            removeTag(tags[tags.length - 1]);
          }
        }}
        onBlur={() => {
          if (draft.trim()) commit(draft);
        }}
      />
      {hint ? <FieldHint>{hint}</FieldHint> : null}
    </div>
  );
}
