"use client";

import { HiOutlineSearch, HiChevronDown } from "react-icons/hi";
import styles from "@/components/workflow/Workflows.module.css";

const MODULES = [
  { value: "all", label: "All modules" },
  { value: "pharmacy", label: "Pharmacy" },
  { value: "appointment", label: "Appointment" },
  { value: "lab", label: "Lab" },
  { value: "billing", label: "Billing" },
  { value: "membership", label: "Membership" },
  { value: "engagement", label: "Engagement" },
  { value: "general", label: "General" },
];

function SelectField({ value, onChange, disabled, ariaLabel, children }) {
  return (
    <div className={styles.selectWrap}>
      <select
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        disabled={disabled}
        aria-label={ariaLabel}
        className={styles.select}
      >
        {children}
      </select>
      <HiChevronDown className={styles.selectChevron} aria-hidden="true" />
    </div>
  );
}

/** Admin-facing filters only — Create Template lives in Laravel Backend Admin. */
export default function WorkflowTemplateToolbar({
  search,
  onSearchChange,
  status,
  onStatusChange,
  moduleFilter,
  onModuleChange,
  disabled = false,
}) {
  return (
    <div className={styles.toolbar}>
      <div className={styles.toolbarFilters}>
        <label className={styles.searchWrap}>
          <span className={styles.srOnly}>Search templates</span>
          <HiOutlineSearch className={styles.searchIcon} aria-hidden="true" />
          <input
            type="text"
            value={search}
            onChange={(event) => onSearchChange?.(event.target.value)}
            placeholder="Search template name…"
            className={styles.searchInput}
          />
        </label>

        <SelectField
          value={moduleFilter}
          onChange={onModuleChange}
          disabled={disabled}
          ariaLabel="Filter by module"
        >
          {MODULES.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </SelectField>

        <SelectField
          value={status}
          onChange={onStatusChange}
          disabled={disabled}
          ariaLabel="Filter by status"
        >
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </SelectField>
      </div>
    </div>
  );
}
