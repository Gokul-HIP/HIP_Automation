/** Workflow runtime engine types. */

export type ExecutionStatus =
  | "pending"
  | "running"
  | "completed"
  | "failed"
  | "cancelled"
  | "scheduled";

export type CommunicationStatus =
  | "queued"
  | "sent"
  | "delivered"
  | "read"
  | "failed"
  | "retried";

export type ExecutionContext = {
  executionId: string;
  workflowId: string | number;
  workflowName: string;
  triggerPayload: Record<string, unknown>;
  patient: Record<string, unknown>;
  doctor: Record<string, unknown>;
  appointment: Record<string, unknown>;
  prescription: Record<string, unknown>;
  medicine: Record<string, unknown>;
  hospital: Record<string, unknown>;
  variables: Record<string, unknown>;
  system: Record<string, unknown>;
};

export type OutgoingEdge = {
  edgeId: string;
  targetId: string;
  sourceHandle: string | null;
  label: string | null;
};

export type ExecutionStep = {
  id: string;
  nodeType: string;
  category: string;
  customPanel: string | null;
  data: Record<string, unknown>;
  incoming: string[];
  outgoing: OutgoingEdge[];
  isStart: boolean;
  isTrigger: boolean;
  isCondition: boolean;
  isDelay: boolean;
  isAction: boolean;
  isEnd: boolean;
  isLoop: boolean;
};

export type ExecutionGraph = {
  workflowId: string | number | null;
  workflowName: string;
  compiledAt: string;
  entryNodeId: string | null;
  trigger: ExecutionStep | null;
  steps: Record<string, ExecutionStep>;
  endNodeIds: string[];
  topologicalOrder: string[];
  metadata: Record<string, unknown>;
};

export type NodeExecutionResult = {
  action: "continue" | "branch" | "delay" | "end" | "error";
  nextNodeId?: string | null;
  branchHandle?: string | null;
  delayMs?: number | null;
  output?: Record<string, unknown>;
  error?: string | null;
};

export type TraceEvent = {
  executionId: string;
  nodeId: string;
  nodeType: string;
  label: string;
  status: ExecutionStatus;
  startedAt: string;
  completedAt: string | null;
  durationMs: number | null;
  detail?: Record<string, unknown>;
};

export type CommunicationLog = {
  id: string;
  executionId: string;
  workflowId: string | number;
  nodeId: string;
  patientId: string | null;
  channel: string;
  status: CommunicationStatus;
  createdAt: string;
  sentAt: string | null;
  deliveredAt: string | null;
  readAt: string | null;
  retryCount: number;
  error: string | null;
  meta?: Record<string, unknown>;
};

export type WorkflowExecutionRecord = {
  id: string;
  workflowId: string | number;
  workflowName: string;
  status: ExecutionStatus;
  currentNodeId: string | null;
  startedAt: string;
  completedAt: string | null;
  durationMs: number | null;
  error: string | null;
  trace: TraceEvent[];
};

export type WorkflowAnalytics = {
  workflowId: string | number | null;
  totalRuns: number;
  successRate: number;
  failureRate: number;
  averageDurationMs: number;
  messagesSent: number;
  messagesFailed: number;
  retryCount: number;
  completed: number;
  failed: number;
};
