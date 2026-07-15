"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { HiOutlineChevronDown, HiOutlineInformationCircle } from "react-icons/hi";
import styles from "../../styles/medicineReminder.module.css";

export default function TriggerContextCard({ schema }) {
  const [open, setOpen] = useState(false);
  const card = schema?.contextCard;
  if (!card) return null;

  const context = schema.sampleContext || {};

  return (
    <div className={styles.previewCard}>
      <button
        type="button"
        className={styles.previewHeader}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className={styles.previewHeaderLeft}>
          <HiOutlineInformationCircle
            className={styles.previewIcon}
            aria-hidden="true"
          />
          <span>
            <span className={styles.previewTitle}>{card.title}</span>
            <span className={styles.previewMeta}>
              Injected by Laravel · read only
            </span>
          </span>
        </span>
        <HiOutlineChevronDown
          className={styles.previewChevron}
          data-open={open ? "true" : "false"}
        />
      </button>

      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={styles.previewCollapse}
          >
            <div className={styles.previewBody}>
              <p className={styles.previewIntro}>
                {card.note}
                {schema.laravelContext?.length ? (
                  <>
                    {" "}
                    {(schema.laravelContext || []).map((item, i) => (
                      <span key={item}>
                        {i > 0 ? ", " : null}
                        <code>{item}</code>
                      </span>
                    ))}
                    .
                  </>
                ) : null}
              </p>
              <dl className={styles.previewList}>
                {(card.rows || []).map((row) => (
                  <div key={row.label} className={styles.previewRow}>
                    <dt>{row.label}</dt>
                    <dd>{context[row.key] ?? "—"}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
