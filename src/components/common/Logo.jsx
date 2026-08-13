"use client";

import { useState } from "react";
import Image from "next/image";
import styles from "./Logo.module.css";

export default function Logo({ logo = null, collapsed = false }) {
  const [imgFailed, setImgFailed] = useState(false);
  const showImage = Boolean(logo) && !imgFailed;
  const showImgFallback = Boolean(logo) && imgFailed;
  const isLocal =
    typeof logo === "string" &&
    (logo.startsWith("https://api.healthinpocket.in") || logo.startsWith("http://localhost"));

  return (
    <div
      className={`${styles.logo} ${
        collapsed ? styles.logoCollapsed : styles.logoExpanded
      }`}
      data-collapsed={collapsed ? "true" : "false"}
    >
      {showImage ? (
        <span className={styles.imageWrap}>
          <Image
            src={logo}
            alt="HIP Automation"
            width={160}
            height={50}
            className={styles.logoImage}
            priority
            unoptimized={isLocal}
            onError={() => setImgFailed(true)}
          />
        </span>
      ) : showImgFallback ? (
        <span className={styles.imageWrap}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logo}
            alt="HIP Automation"
            className={styles.logoImage}
          />
        </span>
      ) : collapsed ? (
        <span className={styles.mark} aria-label="HIP Automation">
          H
        </span>
      ) : (
        <span className={styles.logoText}>
          <span className={styles.brand}>HIP</span>
          <span className={styles.sub}>Automation</span>
        </span>
      )}
    </div>
  );
}
