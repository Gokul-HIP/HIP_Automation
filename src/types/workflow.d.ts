/** Medicine workflow API contract (Laravel). */

export type WorkflowStatus = "active" | "inactive";

export type WorkflowViewport = {
  x: number;
  y: number;
  zoom: number;
};

export type SerializedWorkflowNode = {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: Record<string, unknown>;
};

export type SerializedWorkflowEdge = {
  id: string;
  source: string;
  target: string;
  sourceHandle: string | null;
  targetHandle: string | null;
  type: "smoothstep";
};

export type WorkflowConfiguration = {
  builderVersion: string;
  reactFlowVersion: string;
  viewport: WorkflowViewport;
  nodes: SerializedWorkflowNode[];
  edges: SerializedWorkflowEdge[];
};

export type MedicineWorkflowPayload = {
  organization_id: number | null;
  created_by?: string | null;
  name: string;
  status: WorkflowStatus;
  configuration: WorkflowConfiguration;
};

export type MedicineWorkflowResponse = MedicineWorkflowPayload & {
  id: number;
  created_at?: string;
  updated_at?: string;
};
