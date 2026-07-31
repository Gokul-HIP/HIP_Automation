"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import FlowBuilder from "@/components/flow/FlowBuilder";
import {
  isEmbedPath,
  postToParent,
  validateEmbedAccess,
} from "@/utils/embedMode";

function truthy(value) {
  if (value == null) return false;
  return ["1", "true", "yes"].includes(String(value).toLowerCase());
}

function detectEmbedded() {
  if (typeof window === "undefined") return false;
  try {
    if (window.parent !== window) return true;
    return window.self !== window.top;
  } catch {
    return true;
  }
}

/** Only positive numeric ids count as an existing entity. */
function parseEntityId(raw) {
  if (raw == null || raw === "") return null;
  const n = Number(raw);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

/**
 * Normalize parent hip:builder-init into a stable shape.
 * Laravel sends { mode, readOnly, payload, template, workflow }.
 */
function normalizeInitMessage(data, fallbackMode = "workflow") {
  if (!data || typeof data !== "object") {
    return {
      type: "hip:builder-init",
      mode: fallbackMode,
      readOnly: false,
      payload: {},
    };
  }

  const payload =
    (data.payload && typeof data.payload === "object" ? data.payload : null) ||
    (data.template && typeof data.template === "object" ? data.template : null) ||
    (data.workflow && typeof data.workflow === "object" ? data.workflow : null) ||
    {};

  // Prefer URL mode over parent when they disagree (parent Alpine can be stale).
  const mode =
    fallbackMode === "template" || fallbackMode === "workflow"
      ? fallbackMode
      : data.mode === "template" || data.mode === "workflow"
        ? data.mode
        : "workflow";

  return {
    type: "hip:builder-init",
    mode,
    readOnly: Boolean(data.readOnly),
    payload,
  };
}

function blankInitFromLocation() {
  if (typeof window === "undefined") {
    return {
      type: "hip:builder-init",
      mode: "workflow",
      readOnly: false,
      payload: {},
    };
  }
  const params = new URLSearchParams(window.location.search);
  return {
    type: "hip:builder-init",
    mode: params.get("mode") === "template" ? "template" : "workflow",
    readOnly: truthy(params.get("readOnly")),
    payload: {},
  };
}

/**
 * Top-level handshake host — no useSearchParams (avoids Suspense delay).
 */
function EmbedHandshakeHost({ children }) {
  const [initMessage, setInitMessage] = useState(() => blankInitFromLocation());
  const [standalone, setStandalone] = useState(false);

  useEffect(() => {
    const embedded = detectEmbedded();

    // Always refresh from the real iframe URL (SSR seed defaults to workflow).
    setInitMessage(blankInitFromLocation());

    if (!embedded) {
      setStandalone(true);
      return undefined;
    }

    const onMessage = (event) => {
      const data = event?.data || {};
      if (data.type !== "hip:builder-init") return;

      const params = new URLSearchParams(window.location.search);
      const urlMode =
        params.get("mode") === "template" ? "template" : "workflow";
      setInitMessage(normalizeInitMessage(data, urlMode));
    };

    window.addEventListener("message", onMessage);
    postToParent("hip:builder-ready", {});

    return () => {
      window.removeEventListener("message", onMessage);
    };
  }, []);

  return typeof children === "function"
    ? children({ initMessage, standalone })
    : children;
}

function EmbedWorkflowBuilderInner({ initMessage }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [gate, setGate] = useState({ status: "checking", reason: null });

  // URL is the source of truth for embed mode (avoids SSR blankInit forcing workflow).
  const mode =
    searchParams.get("mode") === "template" ? "template" : "workflow";
  const readOnlyFromQuery = truthy(searchParams.get("readOnly"));
  const readOnly =
    typeof initMessage?.readOnly === "boolean"
      ? initMessage.readOnly
      : readOnlyFromQuery;

  const templateId = parseEntityId(searchParams.get("template_id"));
  const workflowId = parseEntityId(searchParams.get("workflow_id"));
  const usePreview = mode === "template" && readOnly;

  const initialId = mode === "template" ? templateId : null;
  const initialWorkflowId = mode === "workflow" ? workflowId : null;

  const normalizedInit = useMemo(
    () => normalizeInitMessage(initMessage, mode),
    [initMessage, mode]
  );

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!isEmbedPath(pathname)) {
        setGate({ status: "denied", reason: "not_embed_route" });
        return;
      }

      setGate({ status: "ok", reason: null });

      const result = await validateEmbedAccess({ pathname });
      if (cancelled) return;
      if (!result.ok) {
        setGate({ status: "denied", reason: result.reason || "denied" });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [pathname]);

  if (gate.status === "denied") {
    return (
      <div style={{ padding: 24, fontFamily: "system-ui, sans-serif" }}>
        Embed access denied
        {gate.reason ? ` (${gate.reason})` : ""}.
      </div>
    );
  }

  return (
    <div className="hip-embed-builder-root" style={{ height: "100%", minHeight: 0 }}>
      <FlowBuilder
        embedInitMessage={normalizedInit}
        mode={mode}
        readOnly={readOnly}
        initialId={initialId}
        initialWorkflowId={initialWorkflowId}
        usePreviewEndpoint={usePreview}
        showMetaBanner={usePreview}
      />
    </div>
  );
}

function EmbedLoadingFallback() {
  return (
    <div style={{ padding: 24, fontFamily: "system-ui, sans-serif" }}>
      Loading workflow builder...
    </div>
  );
}

export default function EmbedWorkflowBuilderPage() {
  return (
    <EmbedHandshakeHost>
      {({ initMessage }) => (
        <Suspense fallback={<EmbedLoadingFallback />}>
          <EmbedWorkflowBuilderInner initMessage={initMessage} />
        </Suspense>
      )}
    </EmbedHandshakeHost>
  );
}
