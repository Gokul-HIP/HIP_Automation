"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
} from "reactflow";
import { createNodeDefaults, getWorkflowNode } from "../config/workflowNodes";
import {
  createWorkflow,
  updateWorkflow,
  fetchWorkflows,
  fetchWorkflow,
  loadWorkflowForBuilder,
  extractWorkflowId,
  buildWorkflowPayload as buildApiWorkflowPayload,
  publishWorkflow as publishWorkflowApi,
} from "@/services/api/workflows";
import {
  findExistingCampaignWorkflow,
  FIRST_APPOINTMENT_NURTURING_CAMPAIGN_KEY,
} from "@/utils/workflowCampaignLookup";
import {
  createWorkflowTemplate,
  updateWorkflowTemplate,
  loadTemplateForBuilder,
  loadTemplatePreviewForBuilder,
  cloneTemplateIntoWorkflowSeed,
  buildTemplatePayload as buildApiTemplatePayload,
  extractTemplateId,
} from "@/services/api/workflowTemplates";
import { getCurrentUser } from "@/services/authService";
import { WORKFLOW_STATUS } from "@/utils/workflowStatus";
import { normalizeOrganizationId, normalizeUserId } from "@/utils/organization";
import { useAuth } from "@/context/AuthContext";
import useFlowToast from "./useFlowToast";
import { useWorkflowBuilderStore } from "@/stores/workflowBuilderStore";
import { useTriggers } from "@/hooks/useWorkflowApi";
import {
  stripUiStartFromGraph,
} from "@/utils/flowEditorLifecycle";
import { deserializeWorkflow, readCampaignFields } from "@/utils/flowDeserializer";
import {
  extractWorkflowGraph,
  graphNodeEdgeCounts,
} from "@/utils/extractWorkflowGraph";
import {
  getEmbedParentOrigin,
  isEmbedMode,
  postToParent,
} from "@/utils/embedMode";
import { validateWorkflowGraph as validateWorkflowGraphImpl } from "../validation/workflowGraphValidation";
import { isValidWorkflowConnection } from "../validation/connectionRules";

export function validateWorkflowGraph(nodes, edges, options = {}) {
  return validateWorkflowGraphImpl(nodes, edges, options);
}

function buildBlankCanvas() {
  return { nodes: [], edges: [] };
}

const HISTORY_LIMIT = 40;
const COL_GAP = 280;
const ROW_GAP = 140;
const FALLBACK_TRIGGER_DESCRIPTION =
  "Triggers the workflow when this hospital event occurs.";

function createId(prefix = "node") {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

/** Default placement for the first canvas node (no reserved Start slot). */
function nextNodePosition(existingCount) {
  if (existingCount === 0) {
    return { x: 80, y: 180 };
  }
  const offset = existingCount * 28;
  return {
    x: 80 + (offset % 220),
    y: 120 + (offset % 260),
  };
}

/** Positive numeric / non-empty string ids only — null, "", 0 are create-mode. */
function hasPresentId(value) {
  if (value == null || value === "") return false;
  if (typeof value === "number") return Number.isFinite(value) && value > 0;
  const trimmed = String(value).trim();
  if (!trimmed) return false;
  const n = Number(trimmed);
  if (Number.isFinite(n)) return n > 0;
  return true;
}


/** Simple left-to-right auto layout from graph roots. */
export function computeAutoLayout(nodes, edges) {
  const children = new Map();
  const incoming = new Map();

  nodes.forEach((n) => {
    children.set(n.id, []);
    incoming.set(n.id, 0);
  });

  edges.forEach((e) => {
    if (!children.has(e.source) || !incoming.has(e.target)) return;
    children.get(e.source).push(e.target);
    incoming.set(e.target, (incoming.get(e.target) || 0) + 1);
  });

  const roots = nodes
    .filter((n) => (incoming.get(n.id) || 0) === 0)
    .map((n) => n.id);

  const depth = new Map();
  const queue = [...roots];
  roots.forEach((id) => depth.set(id, 0));

  while (queue.length) {
    const id = queue.shift();
    const d = depth.get(id) ?? 0;
    for (const child of children.get(id) || []) {
      const next = d + 1;
      if (!depth.has(child) || depth.get(child) < next) {
        depth.set(child, next);
        queue.push(child);
      }
    }
  }

  nodes.forEach((n) => {
    if (!depth.has(n.id)) depth.set(n.id, 0);
  });

  const columns = new Map();
  for (const [id, d] of depth.entries()) {
    if (!columns.has(d)) columns.set(d, []);
    columns.get(d).push(id);
  }

  const positions = new Map();
  for (const [col, ids] of columns.entries()) {
    ids.forEach((id, row) => {
      positions.set(id, {
        x: 80 + col * COL_GAP,
        y: 80 + row * ROW_GAP,
      });
    });
  }

  return nodes.map((n) => ({
    ...n,
    position: positions.get(n.id) || n.position,
  }));
}

/**
 * @param {object} options
 * @param {string|number|null} [options.initialWorkflowId]
 * @param {string|number|null} [options.initialId]
 * @param {string|number|null} [options.fromTemplateId] — copy template into a new workflow (not linked)
 * @param {string|number|null} [options.initialHospitalId] — hospital selected at create time
 * @param {Record<string, unknown>|null} [options.embedInitMessage]
 * @param {"workflow"|"template"} [options.mode]
 * @param {boolean} [options.readOnly]
 * @param {boolean} [options.usePreviewEndpoint]
 */
export default function useFlowBuilder({
  initialWorkflowId = null,
  initialId = null,
  fromTemplateId = null,
  initialHospitalId = null,
  embedInitMessage = null,
  mode = "workflow",
  readOnly = false,
  usePreviewEndpoint = false,
} = {}) {
  const isTemplateMode = mode === "template";
  const entityId = hasPresentId(initialId)
    ? initialId
    : hasPresentId(initialWorkflowId)
      ? initialWorkflowId
      : null;
  // Edit / seed-from-template: show loading until the saved graph hydrates.
  const isExistingLoad = Boolean(entityId || hasPresentId(fromTemplateId));

  const router = useRouter();
  const { user } = useAuth();
  const { toast, showToast, clearToast } = useFlowToast();
  const inEmbed = typeof window !== "undefined" ? isEmbedMode() : false;
  const { data: triggerCatalog } = useTriggers({
    // Avoid unauthenticated 401 noise inside Laravel Admin iframe.
    enabled: !inEmbed,
    retry: inEmbed ? false : undefined,
  });
  const viewportApiRef = useRef(null);
  const lastEmbedInitKeyRef = useRef(null);

  const [nodes, setNodes] = useState(() => buildBlankCanvas().nodes);
  const [edges, setEdges] = useState([]);
  const [selectedNodeIds, setSelectedNodeIds] = useState([]);
  const [workflowName, setWorkflowName] = useState(
    isTemplateMode ? "Untitled Template" : "Hospital workflow"
  );
  const [description, setDescription] = useState("");
  // Never seed workflowId from a template id (copy-not-link).
  const [workflowId, setWorkflowId] = useState(
    fromTemplateId && !isTemplateMode ? null : entityId
  );
  const [workflowStatus, setWorkflowStatus] = useState(
    isTemplateMode ? WORKFLOW_STATUS.ACTIVE : WORKFLOW_STATUS.INACTIVE
  );
  const [hospitalId, setHospitalId] = useState(
    normalizeOrganizationId(initialHospitalId)
  );
  const [campaignKey, setCampaignKey] = useState("");
  const [suppressOnAppointment, setSuppressOnAppointment] = useState(false);
  const [templateMeta, setTemplateMeta] = useState({
    module: null,
    triggerType: null,
    triggerLabel: null,
    nodeCount: 0,
    edgeCount: 0,
  });
  const [sidebarOpen, setSidebarOpen] = useState(!readOnly);
  const [propertiesOpen, setPropertiesOpen] = useState(false);
  const [locked, setLocked] = useState(Boolean(readOnly));
  const [zoom, setZoom] = useState(100);
  const [past, setPast] = useState([]);
  const [future, setFuture] = useState([]);
  const [validation, setValidation] = useState({ valid: true, issues: [] });
  const [busy, setBusy] = useState(isExistingLoad ? "load" : null);

  // Keep sidebar/lock in sync when embed flips readOnly after URL/parent init.
  useEffect(() => {
    if (!readOnly) {
      setSidebarOpen(true);
      setLocked(false);
    } else {
      setSidebarOpen(false);
      setLocked(true);
    }
  }, [readOnly]);

  // Read-only view/preview always locks the canvas (no sync setState-in-effect).
  const isLocked = readOnly || locked;

  const organizationId = useMemo(() => {
    return (
      normalizeOrganizationId(user?.organization_id) ??
      getCurrentUser()?.organization_id ??
      null
    );
  }, [user]);

  const createdById = useMemo(() => {
    return (
      normalizeUserId(user?.id) ?? getCurrentUser()?.id ?? null
    );
  }, [user]);

  const registerViewportApi = useCallback((api) => {
    viewportApiRef.current = api;
  }, []);

  const getViewport = useCallback(() => {
    return (
      viewportApiRef.current?.getViewport() ?? { x: 0, y: 0, zoom: 1 }
    );
  }, []);

  const buildWorkflowPayload = useCallback(
    (status) => {
      const currentUser = getCurrentUser() ?? user;
      const orgId =
        normalizeOrganizationId(currentUser?.organization_id) ??
        normalizeOrganizationId(organizationId);
      const creatorId =
        normalizeUserId(currentUser?.id) ?? normalizeUserId(createdById);

      // Embed saves go to Laravel Admin (already authenticated); org may be filled server-side.
      if (orgId == null && !isTemplateMode && !isEmbedMode()) {
        const error = new Error("No organization assigned.");
        error.code = "missing_organization";
        throw error;
      }

      const triggerNode = nodes.find((n) => {
        const def = getWorkflowNode(n.data?.nodeType);
        return (def?.isTrigger || n.data?.triggerKey) && n.data?.nodeType !== "start";
      });

      if (isTemplateMode) {
        return buildApiTemplatePayload({
          name: workflowName,
          description,
          status: status ?? workflowStatus ?? WORKFLOW_STATUS.ACTIVE,
          nodes,
          edges,
          viewport: getViewport(),
          organizationId: orgId != null ? Number(orgId) : undefined,
        });
      }

      return buildApiWorkflowPayload({
        name: workflowName,
        nodes,
        edges,
        viewport: getViewport(),
        status,
        organizationId: orgId != null ? Number(orgId) : undefined,
        hospitalId: hospitalId != null ? Number(hospitalId) : undefined,
        createdBy: creatorId,
        module: triggerNode?.data?.module ?? null,
        triggerKey:
          triggerNode?.data?.triggerKey ?? triggerNode?.data?.nodeType ?? null,
        campaignKey: campaignKey.trim() ? campaignKey.trim() : null,
        suppressOnAppointment,
      });
    },
    [
      user,
      organizationId,
      hospitalId,
      createdById,
      nodes,
      edges,
      workflowName,
      description,
      workflowStatus,
      campaignKey,
      suppressOnAppointment,
      getViewport,
      isTemplateMode,
    ]
  );

  // Laravel Admin posts definition via postMessage — skip authenticated API load.
  useEffect(() => {
    if (!isEmbedMode()) return undefined;

    const applyParentPayload = (message) => {
      const payload = message?.payload || {};
      const { graph, field } = extractWorkflowGraph(payload);
      const { nodeCount, edgeCount } = graphNodeEdgeCounts(graph);
      const isEditWithId =
        hasPresentId(entityId) ||
        hasPresentId(payload.templateId) ||
        hasPresentId(payload.workflowId);

      if (payload.name) setWorkflowName(String(payload.name));
      if (payload.description != null) setDescription(String(payload.description));
      if (payload.status) setWorkflowStatus(payload.status);

      const idFromParent =
        payload.templateId ??
        payload.workflowId ??
        payload.id ??
        entityId;
      if (
        hasPresentId(idFromParent) &&
        !(fromTemplateId && !isTemplateMode)
      ) {
        setWorkflowId(idFromParent);
      }

      setTemplateMeta((prev) => ({
        ...prev,
        module: payload.module ?? prev.module,
        triggerType: payload.trigger_type ?? payload.triggerType ?? prev.triggerType,
        triggerLabel:
          payload.trigger_label ?? payload.triggerLabel ?? prev.triggerLabel,
        nodeCount: nodeCount || prev.nodeCount,
        edgeCount: edgeCount || prev.edgeCount,
      }));

      // Edit expects a saved graph. Empty/null definition must not fall back to Start-only.
      if (!graph || (nodeCount === 0 && edgeCount === 0)) {
        if (isEditWithId) {
          console.warn(
            "[embed] Empty or null workflow definition while editing.",
            { field, entityId, payload }
          );
          showToast(
            "error",
            "Template definition is empty — saved nodes could not be loaded."
          );
          setBusy(null);
          return;
        }
        // Brand-new template/workflow in embed: empty canvas.
        setNodes(buildBlankCanvas().nodes);
        setEdges([]);
        setBusy(null);
        return;
      }

      const { nodes: savedNodes, edges: savedEdges, viewport } =
        deserializeWorkflow(graph);
      const normalized = stripUiStartFromGraph(savedNodes, savedEdges);
      const campaign = readCampaignFields(graph);
      setCampaignKey(campaign.campaignKey);
      setSuppressOnAppointment(campaign.suppressOnAppointment);
      setNodes(normalized.nodes);
      setEdges(normalized.edges);
      setPast([]);
      setFuture([]);
      setBusy(null);

      requestAnimationFrame(() => {
        viewportApiRef.current?.setViewport?.(viewport, { duration: 0 });
        setZoom(Math.round((viewport?.zoom ?? 1) * 100));
      });
    };

    const onMessage = (event) => {
      const data = event?.data || {};
      if (data.type !== "hip:builder-init") return;

      // Enforce parent origin only when production embed tokens are required.
      const requireToken =
        String(process.env.NEXT_PUBLIC_EMBED_REQUIRE_TOKEN || "").toLowerCase() ===
        "true";
      const expected = getEmbedParentOrigin();
      if (
        requireToken &&
        expected &&
        event.origin &&
        event.origin !== expected
      ) {
        console.warn("[hip-builder] Rejected init message due to origin mismatch", {
          expected,
          actual: event.origin,
        });
        return;
      }

      // Deduplicate identical init payloads (parent retries + ready handshake).
      const key = JSON.stringify({
        mode: data.mode,
        readOnly: data.readOnly,
        payload: data.payload,
      });
      if (lastEmbedInitKeyRef.current === key) return;
      lastEmbedInitKeyRef.current = key;

      applyParentPayload(data);
    };

    window.addEventListener("message", onMessage);
    // Ready is sent by EmbedHandshakeHost — avoid duplicate ready/init loops.

    return () => {
      window.removeEventListener("message", onMessage);
    };
  }, [entityId, fromTemplateId, isTemplateMode, showToast]);

  useEffect(() => {
    if (!isEmbedMode() || !embedInitMessage) return;

    const payload = embedInitMessage?.payload || {};
    const { graph, field } = extractWorkflowGraph(payload);
    const { nodeCount, edgeCount } = graphNodeEdgeCounts(graph);
    const isEditWithId =
      hasPresentId(entityId) ||
      hasPresentId(payload.templateId) ||
      hasPresentId(payload.workflowId);

    const key = JSON.stringify({
      mode: embedInitMessage.mode,
      readOnly: embedInitMessage.readOnly,
      payload,
    });
    if (lastEmbedInitKeyRef.current === key) return;
    lastEmbedInitKeyRef.current = key;

    if (payload.name) setWorkflowName(String(payload.name));
    if (payload.description != null) setDescription(String(payload.description));
    if (payload.status) setWorkflowStatus(payload.status);

    const idFromParent =
      payload.templateId ??
      payload.workflowId ??
      payload.id ??
      entityId;
    if (
      hasPresentId(idFromParent) &&
      !(fromTemplateId && !isTemplateMode)
    ) {
      setWorkflowId(idFromParent);
    }

    setTemplateMeta((prev) => ({
      ...prev,
      module: payload.module ?? prev.module,
      triggerType: payload.trigger_type ?? payload.triggerType ?? prev.triggerType,
      triggerLabel:
        payload.trigger_label ?? payload.triggerLabel ?? prev.triggerLabel,
      nodeCount: nodeCount || prev.nodeCount,
      edgeCount: edgeCount || prev.edgeCount,
    }));

    if (!graph || (nodeCount === 0 && edgeCount === 0)) {
      if (isEditWithId) {
        // Wait for parent hip:builder-init with the real definition.
        setBusy("load");
        return;
      }
      setNodes(buildBlankCanvas().nodes);
      setEdges([]);
      setBusy(null);
      return;
    }

    const { nodes: savedNodes, edges: savedEdges, viewport } =
      deserializeWorkflow(graph);
    const normalized = stripUiStartFromGraph(savedNodes, savedEdges);
    const campaign = readCampaignFields(graph);
    setCampaignKey(campaign.campaignKey);
    setSuppressOnAppointment(campaign.suppressOnAppointment);
    setNodes(normalized.nodes);
    setEdges(normalized.edges);
    setPast([]);
    setFuture([]);
    setBusy(null);

    requestAnimationFrame(() => {
      viewportApiRef.current?.setViewport?.(viewport, { duration: 0 });
      setZoom(Math.round((viewport?.zoom ?? 1) * 100));
    });
  }, [
    embedInitMessage,
    entityId,
    fromTemplateId,
    isTemplateMode,
    showToast,
  ]);

  useEffect(() => {
    // Embed mode hydrates from Laravel parent, not frontend APIs.
    if (isEmbedMode()) return;
    if (!entityId && !fromTemplateId) return;

    let cancelled = false;

    (async () => {
      setBusy("load");
      try {
        let state;

        if (fromTemplateId && !isTemplateMode) {
          // Independent copy — workflowId stays null until first save.
          state = await cloneTemplateIntoWorkflowSeed(fromTemplateId);
        } else if (isTemplateMode && entityId) {
          state = usePreviewEndpoint
            ? await loadTemplatePreviewForBuilder(entityId)
            : await loadTemplateForBuilder(entityId, { admin: true });
        } else if (entityId) {
          state = await loadWorkflowForBuilder(entityId);
        } else {
          return;
        }

        if (cancelled) return;

        if (fromTemplateId && !isTemplateMode) {
          setWorkflowId(null);
        } else {
          setWorkflowId(state.id ?? entityId);
        }

        setWorkflowName(state.name);
        setDescription(state.description ?? "");
        setWorkflowStatus(state.status ?? WORKFLOW_STATUS.INACTIVE);
        setCampaignKey(state.campaignKey ?? "");
        setSuppressOnAppointment(Boolean(state.suppressOnAppointment));
        if (!(fromTemplateId && !isTemplateMode)) {
          const loadedHospitalId = normalizeOrganizationId(state.hospitalId);
          if (loadedHospitalId != null) setHospitalId(loadedHospitalId);
        } else if (normalizeOrganizationId(initialHospitalId) != null) {
          setHospitalId(normalizeOrganizationId(initialHospitalId));
        }
        setTemplateMeta({
          module: state.module ?? null,
          triggerType: state.triggerType ?? null,
          triggerLabel: state.triggerLabel ?? null,
          nodeCount: state.nodeCount ?? state.nodes?.length ?? 0,
          edgeCount: state.edgeCount ?? state.edges?.length ?? 0,
        });
        const normalized = stripUiStartFromGraph(
          state.nodes?.length ? state.nodes : [],
          state.edges ?? []
        );

        if (
          entityId &&
          !(fromTemplateId && !isTemplateMode) &&
          !(state.nodes?.length)
        ) {
          console.warn(
            "[builder] Loaded entity has no nodes/edges in the saved definition.",
            { entityId, isTemplateMode, state }
          );
        }

        setNodes(normalized.nodes);
        setEdges(normalized.edges);
        setPast([]);
        setFuture([]);

        requestAnimationFrame(() => {
          viewportApiRef.current?.setViewport?.(state.viewport, {
            duration: 0,
          });
          setZoom(Math.round((state.viewport?.zoom ?? 1) * 100));
        });

        showToast(
          "success",
          fromTemplateId && !isTemplateMode
            ? "Template copied into new workflow"
            : isTemplateMode
              ? "Template loaded"
              : "Workflow loaded"
        );
      } catch (error) {
        if (!cancelled) {
          showToast(
            "error",
            error?.message ||
              (isTemplateMode
                ? "Failed to load template"
                : "Failed to load workflow")
          );
        }
      } finally {
        if (!cancelled) setBusy(null);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [entityId, fromTemplateId, initialHospitalId, isTemplateMode, usePreviewEndpoint, showToast]);

  const selectedNodeId = selectedNodeIds[0] ?? null;
  const selectedNode = useMemo(
    () => nodes.find((n) => n.id === selectedNodeId) ?? null,
    [nodes, selectedNodeId]
  );

  const workflowTriggerKey = useMemo(() => {
    const triggerNode = nodes.find((n) => {
      const def = getWorkflowNode(n.data?.nodeType);
      return (def?.isTrigger || n.data?.triggerKey) && n.data?.nodeType !== "start";
    });
    return triggerNode?.data?.triggerKey ?? triggerNode?.data?.nodeType ?? null;
  }, [nodes]);

  useEffect(() => {
    useWorkflowBuilderStore.getState().setWorkflowMeta({
      workflowId,
      workflowName,
      workflowStatus,
      triggerKey: workflowTriggerKey,
    });
  }, [workflowId, workflowName, workflowStatus, workflowTriggerKey]);

  useEffect(() => {
    useWorkflowBuilderStore.getState().setGraph({
      nodes,
      edges,
      viewport: getViewport(),
      pushHistory: false,
    });
  }, [nodes, edges, getViewport]);

  useEffect(() => {
    useWorkflowBuilderStore.getState().setSelectedNodeId(selectedNodeId);
  }, [selectedNodeId]);

  useEffect(() => {
    return () => useWorkflowBuilderStore.getState().reset();
  }, []);

  const pushHistory = useCallback(
    (nextNodes, nextEdges) => {
      setPast((prev) => {
        const snapshot = {
          nodes: structuredClone(nodes),
          edges: structuredClone(edges),
        };
        const stacked = [...prev, snapshot];
        return stacked.length > HISTORY_LIMIT
          ? stacked.slice(stacked.length - HISTORY_LIMIT)
          : stacked;
      });
      setFuture([]);
      setNodes(nextNodes);
      setEdges(nextEdges);
    },
    [nodes, edges]
  );

  const onNodesChange = useCallback(
    (changes) => {
      if (isLocked) return;
      setNodes((nds) => applyNodeChanges(changes, nds));
    },
    [isLocked]
  );

  const onEdgesChange = useCallback(
    (changes) => {
      if (isLocked) return;
      setEdges((eds) => applyEdgeChanges(changes, eds));
    },
    [isLocked]
  );

  const onConnect = useCallback(
    (connection) => {
      if (isLocked) return;
      if (
        !isValidWorkflowConnection({
          source: connection.source,
          target: connection.target,
          sourceHandle: connection.sourceHandle,
          nodes,
          edges,
        })
      ) {
        return;
      }
      setPast((prev) => [
        ...prev,
        { nodes: structuredClone(nodes), edges: structuredClone(edges) },
      ]);
      setFuture([]);
      setEdges((eds) =>
        addEdge(
          {
            ...connection,
            type: "custom",
            animated: true,
          },
          eds
        )
      );
    },
    [isLocked, nodes, edges]
  );

  const isValidConnection = useCallback(
    (connection) =>
      isValidWorkflowConnection({
        source: connection.source,
        target: connection.target,
        sourceHandle: connection.sourceHandle,
        nodes,
        edges,
      }),
    [nodes, edges]
  );

  const onSelectionChange = useCallback(({ nodes: selected }) => {
    const ids = (selected || []).map((n) => n.id);
    setSelectedNodeIds(ids);
    if (ids.length) setPropertiesOpen(true);
  }, []);

  const addNodeFromTrigger = useCallback(
    (trigger) => {
      if (isLocked || !trigger) return;

      const localDefaults = createNodeDefaults(trigger.key) || {};
      const id = createId(trigger.key);
      const nextNode = {
        id,
        type: "workflow",
        position: nextNodePosition(nodes.length),
        data: {
          ...localDefaults,
          nodeType: trigger.key,
          triggerKey: trigger.key,
          category: "triggers",
          tone: localDefaults.tone || "success",
          label: trigger.name || localDefaults.label,
          description:
            trigger.description ||
            localDefaults.description ||
            FALLBACK_TRIGGER_DESCRIPTION,
          status: "draft",
          isTrigger: true,
          module: trigger.module ?? trigger.group ?? null,
          ...(trigger.defaults ?? {}),
        },
        dragHandle: ".nodeDragHandle",
      };

      pushHistory([...nodes, nextNode], edges);
      setSelectedNodeIds([id]);
      setPropertiesOpen(true);
    },
    [isLocked, nodes, edges, pushHistory]
  );

  const addNodeFromCatalog = useCallback(
    (type) => {
      if (isLocked) return;
      const defaults = createNodeDefaults(type);
      if (!defaults) return;

      const id = createId(type);
      const nextNode = {
        id,
        type: "workflow",
        position: nextNodePosition(nodes.length),
        data: defaults,
        dragHandle: ".nodeDragHandle",
        selected: true,
      };

      const cleared = nodes.map((n) => ({ ...n, selected: false }));

      pushHistory([...cleared, nextNode], edges);
      setSelectedNodeIds([id]);
      setPropertiesOpen(true);
    },
    [isLocked, nodes, edges, pushHistory]
  );

  const updateNodeData = useCallback((nodeId, patch) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, ...patch } }
          : node
      )
    );
  }, []);

  const deleteNodes = useCallback(
    (ids) => {
      if (isLocked) return;
      const remove = new Set(ids || []);
      if (!remove.size) return;

      const nextNodes = nodes.filter((n) => !remove.has(n.id));
      const nextEdges = edges.filter(
        (e) => !remove.has(e.source) && !remove.has(e.target)
      );
      pushHistory(nextNodes, nextEdges);
      setSelectedNodeIds((prev) => prev.filter((id) => !remove.has(id)));
    },
    [isLocked, nodes, edges, pushHistory]
  );

  const duplicateNodes = useCallback(
    (ids) => {
      if (isLocked) return;
      const sources = nodes.filter(
        (n) => ids.includes(n.id) && n.data?.nodeType !== "start"
      );
      if (!sources.length) return;

      const clones = sources.map((source) => {
        const id = createId(source.data?.nodeType || "node");
        return {
          ...structuredClone(source),
          id,
          position: {
            x: source.position.x + 48,
            y: source.position.y + 48,
          },
          selected: true,
        };
      });

      const cleared = nodes.map((n) => ({ ...n, selected: false }));
      pushHistory([...cleared, ...clones], edges);
      setSelectedNodeIds(clones.map((c) => c.id));
    },
    [isLocked, nodes, edges, pushHistory]
  );

  const undo = useCallback(() => {
    setPast((prev) => {
      if (!prev.length) return prev;
      const previous = prev[prev.length - 1];
      setFuture((f) => [
        { nodes: structuredClone(nodes), edges: structuredClone(edges) },
        ...f,
      ]);
      setNodes(previous.nodes);
      setEdges(previous.edges);
      return prev.slice(0, -1);
    });
  }, [nodes, edges]);

  const redo = useCallback(() => {
    setFuture((prev) => {
      if (!prev.length) return prev;
      const [next, ...rest] = prev;
      setPast((p) => [
        ...p,
        { nodes: structuredClone(nodes), edges: structuredClone(edges) },
      ]);
      setNodes(next.nodes);
      setEdges(next.edges);
      return rest;
    });
  }, [nodes, edges]);

  const autoLayout = useCallback(() => {
    if (isLocked) return;
    const laidOut = computeAutoLayout(nodes, edges);
    pushHistory(laidOut, edges);
  }, [isLocked, nodes, edges, pushHistory]);

  const validate = useCallback(() => {
    const result = validateWorkflowGraph(nodes, edges, {
      triggerCatalog,
      campaignKey,
      suppressOnAppointment,
    });
    setValidation(result);
    return result;
  }, [nodes, edges, triggerCatalog, campaignKey, suppressOnAppointment]);

  const handleSave = useCallback(async () => {
    if (busy || readOnly) return;

    const result = validateWorkflowGraph(nodes, edges, {
      triggerCatalog,
      campaignKey,
      suppressOnAppointment,
    });
    setValidation(result);
    if (!result.valid) {
      showToast("error", "Fix validation errors before saving.");
      return result;
    }

    setBusy("save");
    try {
      if (isTemplateMode) {
        const payload = buildWorkflowPayload(workflowStatus || WORKFLOW_STATUS.ACTIVE);

        if (isEmbedMode()) {
          postToParent("hip:builder-save", payload);
          showToast("success", "Sending template to admin…");
          return payload;
        }

        let response;
        if (workflowId) {
          response = await updateWorkflowTemplate(workflowId, payload);
        } else {
          response = await createWorkflowTemplate(payload);
          const newId = extractTemplateId(response);
          if (newId != null) {
            setWorkflowId(newId);
            router.replace(`/admin/workflow-templates/${newId}/edit`);
          }
        }
        showToast("success", "Template saved");
        return response;
      }

      const payload = buildWorkflowPayload(WORKFLOW_STATUS.INACTIVE);

      if (isEmbedMode()) {
        postToParent("hip:builder-save", {
          name: payload.name,
          configuration: payload.configuration,
          organization_id: payload.organization_id,
          hospital_id: payload.hospital_id,
        });
        showToast("success", "Sending workflow to admin…");
        return payload;
      }

      let response;
      let activeId = workflowId;
      if (!activeId) {
        // Prevent duplicate campaign records when stable campaignKey/name already exists.
        try {
          const listed = await fetchWorkflows({
            search: payload.name,
            perPage: 50,
          });
          const candidates = [];
          for (const row of listed.items || []) {
            if (!row?.id) continue;
            try {
              const detail = await fetchWorkflow(row.id);
              const body = detail?.data ?? detail;
              candidates.push({
                id: body?.id ?? row.id,
                name: body?.name ?? row.name,
                configuration: body?.configuration ?? body?.config,
              });
            } catch {
              candidates.push(row);
            }
          }
          const existing = findExistingCampaignWorkflow(candidates, {
            campaignKey:
              payload.configuration?.campaignKey ||
              campaignKey ||
              FIRST_APPOINTMENT_NURTURING_CAMPAIGN_KEY,
            name: payload.name,
          });
          if (existing?.id != null) {
            activeId = existing.id;
            setWorkflowId(activeId);
            router.replace(`/workflows/${activeId}`);
            showToast(
              "success",
              "Existing campaign workflow found — updating instead of creating a duplicate."
            );
          }
        } catch {
          // List lookup is best-effort; fall through to create if search fails.
        }
      }

      if (activeId) {
        response = await updateWorkflow(activeId, payload);
      } else {
        response = await createWorkflow(payload);
        const newId = extractWorkflowId(response);
        if (newId != null) {
          setWorkflowId(newId);
          router.replace(`/workflows/${newId}`);
        }
      }

      setWorkflowStatus(WORKFLOW_STATUS.INACTIVE);
      showToast("success", "Workflow Saved");
      return response;
    } catch (error) {
      showToast(
        "error",
        error?.message ||
          (isTemplateMode ? "Failed to save template" : "Failed to save workflow")
      );
      if (error?.code !== "missing_organization") {
        throw error;
      }
    } finally {
      setBusy(null);
    }
  }, [
    busy,
    readOnly,
    isTemplateMode,
    buildWorkflowPayload,
    workflowId,
    workflowStatus,
    showToast,
    nodes,
    edges,
    triggerCatalog,
    campaignKey,
    suppressOnAppointment,
    router,
  ]);

  const handlePublish = useCallback(async () => {
    if (busy || isTemplateMode || readOnly) return;

    const result = validateWorkflowGraph(nodes, edges, {
      triggerCatalog,
      campaignKey,
      suppressOnAppointment,
    });
    setValidation(result);
    if (!result.valid) return result;

    setBusy("publish");
    try {
      const payload = buildWorkflowPayload(WORKFLOW_STATUS.INACTIVE);

      if (isEmbedMode()) {
        postToParent("hip:builder-publish", {
          name: payload.name,
          configuration: payload.configuration,
          organization_id: payload.organization_id,
          hospital_id: payload.hospital_id,
        });
        showToast("success", "Sending publish request to admin…");
        return { ...result, embed: true };
      }

      let id = workflowId;
      if (id) {
        await updateWorkflow(id, payload);
      } else {
        const saved = await createWorkflow(payload);
        id = extractWorkflowId(saved);
        if (id != null) setWorkflowId(id);
      }

      if (!id) {
        throw new Error("Save workflow before publishing.");
      }

      const publishResponse = await publishWorkflowApi(id);
      const publishedVersion =
        publishResponse?.version ??
        publishResponse?.data?.version ??
        publishResponse?.published_version ??
        null;
      const warnings =
        publishResponse?.warnings ??
        publishResponse?.data?.warnings ??
        [];
      const apiErrors =
        publishResponse?.errors ?? publishResponse?.data?.errors ?? [];

      if (apiErrors.length) {
        apiErrors.forEach((msg) =>
          showToast("error", typeof msg === "string" ? msg : msg.message)
        );
        return result;
      }

      warnings.forEach((msg) =>
        showToast("error", typeof msg === "string" ? `Warning: ${msg}` : `Warning: ${msg.message}`)
      );

      setWorkflowStatus(WORKFLOW_STATUS.ACTIVE);
      showToast(
        "success",
        publishedVersion
          ? `Workflow published (v${publishedVersion})`
          : publishResponse?.message || "Workflow published"
      );
      return { ...result, publishResponse };
    } catch (error) {
      showToast("error", error?.message || "Failed to publish workflow");
      if (error?.code !== "missing_organization") {
        throw error;
      }
    } finally {
      setBusy(null);
    }
  }, [
    busy,
    isTemplateMode,
    readOnly,
    nodes,
    edges,
    buildWorkflowPayload,
    workflowId,
    showToast,
    triggerCatalog,
    campaignKey,
    suppressOnAppointment,
  ]);

  const liveValidation = useMemo(
    () =>
      validateWorkflowGraph(nodes, edges, {
        triggerCatalog,
        campaignKey,
        suppressOnAppointment,
      }),
    [nodes, edges, triggerCatalog, campaignKey, suppressOnAppointment]
  );

  const status = useMemo(() => {
    if (isLocked) return { label: "Locked", tone: "warning" };
    if (liveValidation.issues.some((i) => i.level === "error")) {
      return { label: "Invalid", tone: "danger" };
    }
    if (workflowStatus === WORKFLOW_STATUS.ACTIVE) {
      return { label: "Published", tone: "success" };
    }
    if (!edges.length) return { label: "Draft", tone: "info" };
    return { label: "Ready", tone: "success" };
  }, [isLocked, edges.length, liveValidation.issues, workflowStatus]);

  const focusValidationIssue = useCallback(
    (issue) => {
      if (!issue?.nodeId) return;
      setNodes((nds) =>
        nds.map((n) => ({
          ...n,
          selected: n.id === issue.nodeId,
        }))
      );
      setSelectedNodeIds([issue.nodeId]);
      setPropertiesOpen(true);
      const target = nodes.find((n) => n.id === issue.nodeId);
      if (target && viewportApiRef.current?.setCenter) {
        viewportApiRef.current.setCenter(
          target.position.x + 120,
          target.position.y + 40,
          { zoom: Math.max(zoom, 0.9), duration: 280 }
        );
      }
    },
    [nodes, zoom]
  );

  return {
    nodes,
    edges,
    selectedNodeIds,
    selectedNodeId,
    selectedNode,
    workflowName,
    setWorkflowName,
    description,
    setDescription,
    workflowId,
    workflowStatus,
    setWorkflowStatus,
    hospitalId,
    campaignKey,
    setCampaignKey,
    suppressOnAppointment,
    setSuppressOnAppointment,
    templateMeta,
    mode,
    isTemplateMode,
    readOnly,
    sidebarOpen,
    setSidebarOpen,
    propertiesOpen,
    setPropertiesOpen,
    locked: isLocked,
    setLocked,
    zoom,
    setZoom,
    status,
    validation: liveValidation,
    canPublish: !isTemplateMode && !readOnly && liveValidation.valid,
    showPublish: !isTemplateMode && !readOnly,
    showSave: !readOnly,
    busy,
    toast,
    showToast,
    clearToast,
    canUndo: past.length > 0 && !readOnly,
    canRedo: future.length > 0 && !readOnly,
    workflowTriggerKey,
    onNodesChange,
    onEdgesChange,
    onConnect,
    isValidConnection,
    onSelectionChange,
    addNodeFromCatalog,
    addNodeFromTrigger,
    updateNodeData,
    deleteNodes,
    duplicateNodes,
    undo,
    redo,
    autoLayout,
    validate,
    handleSave,
    handlePublish,
    registerViewportApi,
    focusValidationIssue,
  };
}
