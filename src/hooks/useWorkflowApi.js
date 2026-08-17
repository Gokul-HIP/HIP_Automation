import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchWorkflows,
  fetchWorkflow,
  createWorkflow,
  updateWorkflow,
  deleteWorkflow,
  publishWorkflow,
  duplicateWorkflow,
  loadWorkflowForBuilder,
  buildWorkflowPayload,
} from "@/services/api/workflows";
import { fetchTriggers } from "@/services/api/triggers";
import { fetchVariables } from "@/services/api/variables";
import { fetchTemplates, previewTemplate } from "@/services/api/templates";
import { fetchExecutions } from "@/services/api/executions";
import { fetchHospitals } from "@/services/api/hospitals";

export const queryKeys = {
  workflows: (params) => ["workflows", params],
  workflow: (id) => ["workflow", id],
  triggers: ["workflow-triggers"],
  variables: (trigger) => ["workflow-variables", trigger ?? "all"],
  templates: (channel) => ["workflow-templates", channel ?? "all"],
  executions: (params) => ["workflow-executions", params],
  hospitals: (params) => ["hospitals", params],
};

export function useWorkflows(params = {}) {
  return useQuery({
    queryKey: queryKeys.workflows(params),
    queryFn: () => fetchWorkflows(params),
  });
}

export function useWorkflow(id, options = {}) {
  return useQuery({
    queryKey: queryKeys.workflow(id),
    queryFn: () => fetchWorkflow(id),
    enabled: Boolean(id) && (options.enabled ?? true),
  });
}

export function useWorkflowBuilderLoad(id) {
  return useQuery({
    queryKey: [...queryKeys.workflow(id), "builder"],
    queryFn: () => loadWorkflowForBuilder(id),
    enabled: Boolean(id),
  });
}

export function useCreateWorkflow() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createWorkflow,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["workflows"] }),
  });
}

export function useUpdateWorkflow() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => updateWorkflow(id, payload),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ["workflows"] });
      qc.invalidateQueries({ queryKey: queryKeys.workflow(id) });
    },
  });
}

export function useDeleteWorkflow() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteWorkflow,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["workflows"] }),
  });
}

export function usePublishWorkflow() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: publishWorkflow,
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ["workflows"] });
      qc.invalidateQueries({ queryKey: queryKeys.workflow(id) });
    },
  });
}

export function useDuplicateWorkflow() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: duplicateWorkflow,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["workflows"] }),
  });
}

export function useSaveWorkflowMutation() {
  const create = useCreateWorkflow();
  const update = useUpdateWorkflow();

  return useMutation({
    mutationFn: async ({ id, ...flowState }) => {
      const payload = buildWorkflowPayload(flowState);
      if (id) return update.mutateAsync({ id, payload });
      return create.mutateAsync(payload);
    },
  });
}

export function useTriggers(options = {}) {
  return useQuery({
    queryKey: queryKeys.triggers,
    queryFn: fetchTriggers,
    staleTime: 5 * 60 * 1000,
    enabled: options.enabled ?? true,
    retry: options.retry,
  });
}

export function useVariables(triggerKey = null) {
  return useQuery({
    queryKey: queryKeys.variables(triggerKey),
    queryFn: () => fetchVariables(triggerKey),
    enabled: Boolean(triggerKey),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}

export function useTemplates(channel = null) {
  return useQuery({
    queryKey: queryKeys.templates(channel),
    queryFn: () => fetchTemplates(channel),
    enabled: Boolean(channel),
    staleTime: 5 * 60 * 1000,
  });
}

export function useTemplatePreview() {
  return useMutation({
    mutationFn: ({ id, payload }) => previewTemplate(id, payload),
  });
}

export function useExecutions(params = {}) {
  return useQuery({
    queryKey: queryKeys.executions(params),
    queryFn: () => fetchExecutions(params),
  });
}

export function useHospitals(params = {}, options = {}) {
  return useQuery({
    queryKey: queryKeys.hospitals(params),
    queryFn: () => fetchHospitals(params),
    staleTime: 5 * 60 * 1000,
    enabled: options.enabled ?? true,
  });
}
