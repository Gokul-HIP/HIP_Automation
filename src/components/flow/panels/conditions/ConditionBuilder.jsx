"use client";

import {
  CONDITION_FIELD_OPTIONS,
  CONDITION_OPERATOR_OPTIONS,
  LOGIC_OPERATOR_OPTIONS,
} from "../../config/conditions/schemas";
import SelectField from "../fields/SelectField";
import TextField from "../fields/TextField";
import styles from "../../styles/propertyPanel.module.css";

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
        Build rules like Age &gt; 60, Disease = Diabetes, Payment Pending.
      </p>

      <SelectField
        id="condition-logic"
        label="Match"
        value={logic}
        options={LOGIC_OPERATOR_OPTIONS}
        onChange={(next) => onChange?.({ logic: next })}
      />

      <div className={styles.rulesList}>
        {rules.map((rule, index) => (
          <div key={`rule-${index}`} className={styles.ruleRow}>
            <SelectField
              id={`rule-field-${index}`}
              label={index === 0 ? "Field" : ""}
              value={rule.field || "age"}
              options={CONDITION_FIELD_OPTIONS}
              onChange={(field) => patchRule(index, { field })}
            />
            <SelectField
              id={`rule-op-${index}`}
              label={index === 0 ? "Operator" : ""}
              value={rule.operator || "eq"}
              options={CONDITION_OPERATOR_OPTIONS}
              onChange={(operator) => patchRule(index, { operator })}
            />
            <TextField
              id={`rule-val-${index}`}
              label={index === 0 ? "Value" : ""}
              value={rule.value ?? ""}
              onChange={(value) => patchRule(index, { value })}
            />
            <button
              type="button"
              className={styles.ruleRemove}
              onClick={() => removeRule(index)}
              aria-label="Remove rule"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <button type="button" className={styles.addRuleBtn} onClick={addRule}>
        + Add Rule
      </button>
    </div>
  );
}
