"use client";

import { HiOutlinePlus, HiOutlineSearch, HiChevronDown } from "react-icons/hi";
import styles from "./Workflows.module.css";

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

export default function WorkflowToolbar({
  search,
  onSearchChange,
  status,
  onStatusChange,
  sort,
  onSortChange,
  onCreate,
  disabled = false,
}) {
  return (
    <div className={styles.toolbar}>
      <div className={styles.toolbarFilters}>
        <label className={styles.searchWrap}>
          <span className={styles.srOnly}>Search workflows</span>
          <HiOutlineSearch className={styles.searchIcon} aria-hidden="true" />
          <input
            type="text"
            value={search}
            onChange={(event) => onSearchChange?.(event.target.value)}
            placeholder="Search workflow name…"
            className={styles.searchInput}
          />
        </label>

        <SelectField
          value={status}
          onChange={onStatusChange}
          disabled={disabled}
          ariaLabel="Filter by status"
        >
          <option value="all">All statuses</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="paused">Paused</option>
          <option value="archived">Archived</option>
        </SelectField>

        <SelectField
          value={sort}
          onChange={onSortChange}
          disabled={disabled}
          ariaLabel="Sort workflows"
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
        </SelectField>
      </div>

      <button
        type="button"
        onClick={onCreate}
        disabled={disabled}
        className={styles.btnPrimary}
      >
        <HiOutlinePlus aria-hidden="true" />
        Create Workflow
      </button>
    </div>
  );
}
