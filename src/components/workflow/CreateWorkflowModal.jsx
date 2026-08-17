"use client";

import { useEffect, useMemo, useState } from "react";
import {
  HiOutlineX,
  HiOutlineTemplate,
  HiOutlineDocumentAdd,
  HiOutlineSearch,
  HiOutlineOfficeBuilding,
  HiOutlineCheckCircle,
} from "react-icons/hi";
import { useWorkflowTemplates } from "@/hooks/useWorkflowTemplateApi";
import { useHospitals } from "@/hooks/useWorkflowApi";
import styles from "./Workflows.module.css";

/**
 * Create Workflow flow:
 * 1) Select hospital
 * 2) Blank vs Use Template
 * 3) Pick template (optional)
 */
export default function CreateWorkflowModal({
  open,
  onClose,
  onBlank,
  onSelectTemplate,
}) {
  const [step, setStep] = useState("hospital"); // hospital | chooser | templates
  const [search, setSearch] = useState("");
  const [hospitalSearch, setHospitalSearch] = useState("");
  const [debouncedHospitalSearch, setDebouncedHospitalSearch] = useState("");
  const [selectedHospitalId, setSelectedHospitalId] = useState(null);

  useEffect(() => {
    const handle = window.setTimeout(
      () => setDebouncedHospitalSearch(hospitalSearch),
      300
    );
    return () => window.clearTimeout(handle);
  }, [hospitalSearch]);

  const {
    data: hospitalData,
    isLoading: hospitalsLoading,
    error: hospitalsError,
  } = useHospitals(
    {
      search: debouncedHospitalSearch.trim() || undefined,
      perPage: 50,
    },
    { enabled: open }
  );

  const { data, isLoading, error } = useWorkflowTemplates({
    search: search.trim() || undefined,
    perPage: 50,
  });

  const hospitals = useMemo(
    () => hospitalData?.items ?? [],
    [hospitalData?.items]
  );
  const templates = useMemo(() => data?.items ?? [], [data?.items]);

  if (!open) return null;

  const reset = () => {
    setStep("hospital");
    setSearch("");
    setHospitalSearch("");
    setDebouncedHospitalSearch("");
    setSelectedHospitalId(null);
  };

  const close = () => {
    reset();
    onClose?.();
  };

  const title =
    step === "hospital"
      ? "Select Hospital"
      : step === "chooser"
        ? "Create Workflow"
        : "Use Template";

  const goToChooser = () => {
    if (selectedHospitalId == null) return;
    setStep("chooser");
  };

  return (
    <div
      className={styles.modalOverlay}
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-workflow-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div className={`${styles.modal} ${styles.createWorkflowModal}`}>
        <div className={styles.createModalHeader}>
          <h2 id="create-workflow-title" className={styles.modalTitle}>
            {title}
          </h2>
          <button
            type="button"
            className={styles.iconBtn}
            onClick={close}
            aria-label="Close"
          >
            <HiOutlineX />
          </button>
        </div>

        {step === "hospital" ? (
          <div className={styles.templatePickWrap}>
            <p className={styles.createStepHint}>
              Choose which hospital this workflow belongs to. You can edit and
              publish it after creating.
            </p>

            <label className={styles.searchWrap}>
              <HiOutlineSearch className={styles.searchIcon} aria-hidden="true" />
              <input
                type="search"
                className={styles.searchInput}
                placeholder="Search hospitals…"
                value={hospitalSearch}
                onChange={(e) => setHospitalSearch(e.target.value)}
              />
            </label>

            {hospitalsLoading ? (
              <p className={styles.stateText}>Loading hospitals…</p>
            ) : null}

            {hospitalsError ? (
              <p className={styles.errorText}>{hospitalsError.message}</p>
            ) : null}

            {!hospitalsLoading && !hospitalsError && hospitals.length === 0 ? (
              <p className={styles.stateText}>
                No hospitals available. Ask an administrator to add hospitals,
                then try again.
              </p>
            ) : null}

            <div className={styles.templateCardGrid} role="listbox" aria-label="Hospitals">
              {hospitals.map((hospital) => {
                const selected = selectedHospitalId === hospital.id;
                return (
                  <button
                    key={hospital.id}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    className={`${styles.templatePickCard} ${
                      selected ? styles.hospitalPickCardSelected : ""
                    }`}
                    onClick={() => setSelectedHospitalId(hospital.id)}
                  >
                    <span className={styles.hospitalPickHeader}>
                      <span className={styles.createOptionIcon}>
                        <HiOutlineOfficeBuilding aria-hidden="true" />
                      </span>
                      {selected ? (
                        <HiOutlineCheckCircle
                          className={styles.hospitalPickCheck}
                          aria-hidden="true"
                        />
                      ) : null}
                    </span>
                    <span className={styles.templatePickName}>{hospital.name}</span>
                    <span className={styles.templatePickMeta}>
                      {hospital.code ? <span>{hospital.code}</span> : null}
                      {hospital.city ? <span>{hospital.city}</span> : null}
                      <span>ID #{hospital.id}</span>
                    </span>
                  </button>
                );
              })}
            </div>

            <div className={styles.createStepActions}>
              <button type="button" className={styles.btnGhost} onClick={close}>
                Cancel
              </button>
              <button
                type="button"
                className={styles.btnPrimary}
                disabled={selectedHospitalId == null}
                onClick={goToChooser}
              >
                Continue
              </button>
            </div>
          </div>
        ) : null}

        {step === "chooser" ? (
          <div className={styles.templatePickWrap}>
            <button
              type="button"
              className={styles.btnGhost}
              onClick={() => setStep("hospital")}
            >
              ← Back
            </button>

            <div className={styles.createOptions}>
              <button
                type="button"
                className={styles.createOptionCard}
                onClick={() => setStep("templates")}
              >
                <span className={styles.createOptionIcon}>
                  <HiOutlineTemplate aria-hidden="true" />
                </span>
                <span className={styles.createOptionTitle}>Use Template</span>
                <span className={styles.createOptionText}>
                  Start from an admin-managed blueprint. Your workflow is an
                  independent copy.
                </span>
              </button>

              <button
                type="button"
                className={styles.createOptionCard}
                onClick={() => {
                  const hospitalId = selectedHospitalId;
                  close();
                  onBlank?.(hospitalId);
                }}
              >
                <span className={styles.createOptionIcon}>
                  <HiOutlineDocumentAdd aria-hidden="true" />
                </span>
                <span className={styles.createOptionTitle}>
                  Create My Own Workflow
                </span>
                <span className={styles.createOptionText}>
                  Open a blank Workflow Builder and design from scratch.
                </span>
              </button>
            </div>
          </div>
        ) : null}

        {step === "templates" ? (
          <div className={styles.templatePickWrap}>
            <button
              type="button"
              className={styles.btnGhost}
              onClick={() => setStep("chooser")}
            >
              ← Back
            </button>

            <label className={styles.searchWrap}>
              <HiOutlineSearch className={styles.searchIcon} aria-hidden="true" />
              <input
                type="search"
                className={styles.searchInput}
                placeholder="Search templates…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </label>

            {isLoading ? (
              <p className={styles.stateText}>Loading templates…</p>
            ) : null}

            {error ? (
              <p className={styles.errorText}>{error.message}</p>
            ) : null}

            {!isLoading && !error && templates.length === 0 ? (
              <p className={styles.stateText}>
                No active templates available. Ask an administrator to publish
                one, or create your own workflow.
              </p>
            ) : null}

            <div className={styles.templateCardGrid}>
              {templates.map((tpl) => (
                <button
                  key={tpl.id}
                  type="button"
                  className={styles.templatePickCard}
                  onClick={() => {
                    const hospitalId = selectedHospitalId;
                    close();
                    onSelectTemplate?.(tpl, hospitalId);
                  }}
                >
                  <span className={styles.templatePickName}>{tpl.name}</span>
                  {tpl.description ? (
                    <span className={styles.templatePickDesc}>
                      {tpl.description}
                    </span>
                  ) : null}
                  <span className={styles.templatePickMeta}>
                    <span>{tpl.module || "—"}</span>
                    <span>{tpl.trigger || "—"}</span>
                    <span>{tpl.nodeCount ?? 0} nodes</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
