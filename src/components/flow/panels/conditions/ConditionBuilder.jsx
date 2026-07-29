"use client";

import {
  CONDITION_FIELD_GROUPS,
  CONDITION_OPERATOR_OPTIONS,
  LOGIC_OPERATOR_OPTIONS,
} from "../../config/conditions/schemas";
import SelectField from "../fields/SelectField";
import TextField from "../fields/TextField";
import styles from "../../styles/propertyPanel.module.css";

const VALUELESS_OPS = new Set(["empty", "not_empty"]);

export default function ConditionBuilder({ data, onChange }) {
  const logic = data?.logic || "and";
  const rules = Array.isArray(data?.rules) ? data.rules : [];

  const patchRule = (index, partial) => {
    const next = rules.map((rule, i) => (i === index ? { ...rule, ...partial } : rule));
    onChange?.({ rules: next });
  };

  const addRule = () => {
    onChange?.({
      rules: [...rules, { field: "age", operator: "gt", value: "" }],
    });
  };

  const removeRule = (index) => {
    onChange?.({ rules: rules.filter((_, i) => i !== index) });
  };

  return (
    <div className={styles.section}>
      <h3 className={styles.sectionTitle}>Condition Builder</h3>
      <p className={styles.sectionHint}>
        Match all rules (AND) or any rule (OR). Add or remove rules as needed.
      </p>

      <SelectField
        id="condition-logic"
        label="Match"
        value={logic}
        options={LOGIC_OPERATOR_OPTIONS}
        onChange={(next) => onChange?.({ logic: next })}
      />

      <div className={styles.rulesList}>
        {rules.map((rule, index) => {
          const operator = rule.operator || "eq";
          const hideValue = VALUELESS_OPS.has(operator);
          return (
            <div key={`rule-${index}`} className={styles.ruleRow}>
              <div className={styles.field}>
                {index === 0 ? (
                  <label className={styles.label} htmlFor={`rule-field-${index}`}>
                    Field
                  </label>
                ) : null}
                <select
                  id={`rule-field-${index}`}
                  className={styles.select}
                  value={rule.field || "age"}
                  onChange={(e) => patchRule(index, { field: e.target.value })}
                >
                  {CONDITION_FIELD_GROUPS.map((group) => (
                    <optgroup key={group.label} label={group.label}>
                      {group.options.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              <SelectField
                id={`rule-op-${index}`}
                label={index === 0 ? "Operator" : ""}
                value={operator}
                options={CONDITION_OPERATOR_OPTIONS}
                onChange={(next) => patchRule(index, { operator: next })}
              />

              {hideValue ? (
                <div className={styles.field} aria-hidden="true" />
              ) : (
                <TextField
                  id={`rule-val-${index}`}
                  label={index === 0 ? "Value" : ""}
                  value={rule.value ?? ""}
                  onChange={(value) => patchRule(index, { value })}
                />
              )}

              <button
                type="button"
                className={styles.ruleRemove}
                onClick={() => removeRule(index)}
                aria-label="Remove rule"
                disabled={rules.length <= 1}
              >
                ×
              </button>
            </div>
          );
        })}
      </div>

      <button type="button" className={styles.addRuleBtn} onClick={addRule}>
        + Add Rule
      </button>
    </div>
  );
}
