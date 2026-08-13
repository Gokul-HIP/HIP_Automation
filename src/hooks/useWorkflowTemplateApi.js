import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchWorkflowTemplates,
  fetchAdminWorkflowTemplates,
  fetchWorkflowTemplate,
  createWorkflowTemplate,
  updateWorkflowTemplate,
  deleteWorkflowTemplate,
  duplicateWorkflowTemplate,
  previewWorkflowTemplate,
  loadTemplateForBuilder,
  loadTemplatePreviewForBuilder,
  buildTemplatePayload,
  extractTemplateId,
} from "@/services/api/workflowTemplates";

export const templateQueryKeys = {
  templates: (params) => ["workflow-blueprint-templates", params],
  template: (id) => ["workflow-blueprint-template", id],
  templateBuilder: (id) => ["workflow-blueprint-template", id, "builder"],
  templatePreview: (id) => ["workflow-blueprint-template", id, "preview"],
};

export function useWorkflowTemplates(params = {}) {
  return useQuery({
    queryKey: templateQueryKeys.templates({ ...params, scope: "catalog" }),
    queryFn: () => fetchWorkflowTemplates(params),
  });
}

export function useAdminWorkflowTemplates(params = {}) {
  return useQuery({
    queryKey: templateQueryKeys.templates({ ...params, scope: "admin" }),
    queryFn: () => fetchAdminWorkflowTemplates(params),
  });
}

export function useWorkflowTemplate(id, options = {}) {
  return useQuery({
    queryKey: templateQueryKeys.template(id),
    queryFn: () => fetchWorkflowTemplate(id),
    enabled: Boolean(id) && (options.enabled ?? true),
  });
}

export function useTemplateBuilderLoad(id, { preview = false } = {}) {
  return useQuery({
    queryKey: preview
      ? templateQueryKeys.templatePreview(id)
      : templateQueryKeys.templateBuilder(id),
    queryFn: () =>
      preview ? loadTemplatePreviewForBuilder(id) : loadTemplateForBuilder(id),
    enabled: Boolean(id),
  });
}

export function useCreateWorkflowTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createWorkflowTemplate,
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["workflow-blueprint-templates"] }),
  });
}

export function useUpdateWorkflowTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => updateWorkflowTemplate(id, payload),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ["workflow-blueprint-templates"] });
      qc.invalidateQueries({ queryKey: templateQueryKeys.template(id) });
    },
  });
}

export function useDeleteWorkflowTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteWorkflowTemplate,
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["workflow-blueprint-templates"] }),
  });
}

export function useDuplicateWorkflowTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: duplicateWorkflowTemplate,
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["workflow-blueprint-templates"] }),
  });
}

export function usePreviewWorkflowTemplate(id, options = {}) {
  return useQuery({
    queryKey: templateQueryKeys.templatePreview(id),
    queryFn: () => previewWorkflowTemplate(id),
    enabled: Boolean(id) && (options.enabled ?? true),
  });
}

export function useSaveWorkflowTemplateMutation() {
  const create = useCreateWorkflowTemplate();
  const update = useUpdateWorkflowTemplate();

  return useMutation({
    mutationFn: async ({ id, ...flowState }) => {
      const payload = buildTemplatePayload(flowState);
      if (id) return update.mutateAsync({ id, payload });
      return create.mutateAsync(payload);
    },
  });
}

export { buildTemplatePayload, extractTemplateId };
