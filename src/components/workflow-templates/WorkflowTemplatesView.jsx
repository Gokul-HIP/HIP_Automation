"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  HiOutlineRefresh,
  HiOutlineExclamation,
  HiOutlineCheckCircle,
  HiOutlineExclamationCircle,
  HiChevronLeft,
  HiChevronRight,
} from "react-icons/hi";
import WorkflowTemplateToolbar from "./WorkflowTemplateToolbar";
import WorkflowTemplateTable from "./WorkflowTemplateTable";
import EmptyTemplate from "./EmptyTemplate";
import DeleteTemplateModal from "./DeleteTemplateModal";
import {
  useAdminWorkflowTemplates,
  useDeleteWorkflowTemplate,
  useDuplicateWorkflowTemplate,
} from "@/hooks/useWorkflowTemplateApi";
import {
  resolveWorkflowListPagination,
} from "@/utils/workflowList";
import styles from "@/components/workflow/Workflows.module.css";

const PER_PAGE = 10;

export default function WorkflowTemplatesView() {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [moduleFilter, setModuleFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [busyAction, setBusyAction] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => window.clearTimeout(handle);
  }, [search]);

  const { data, isLoading, error, refetch, isFetching } = useAdminWorkflowTemplates({
    search: debouncedSearch,
    status,
    module: moduleFilter,
    page,
    perPage: PER_PAGE,
  });

  const deleteMutation = useDeleteWorkflowTemplate();
  const duplicateMutation = useDuplicateWorkflowTemplate();

  const paginated = useMemo(
    () =>
      resolveWorkflowListPagination(data, page, PER_PAGE, {
        search: debouncedSearch,
        status,
        sort: "newest",
      }),
    [data, page, debouncedSearch, status]
  );

  useEffect(() => {
    if (!data) return;
    if (paginated.lastPage >= 1 && page > paginated.lastPage) {
      setPage(paginated.lastPage);
    }
  }, [data, page, paginated.lastPage]);

  const showToast = useCallback((type, message) => {
    setToast({ type, message });
    window.setTimeout(() => setToast(null), 4200);
  }, []);

  const handleStatusChange = (value) => {
    setStatus(value);
    setPage(1);
  };

  const handleModuleChange = (value) => {
    setModuleFilter(value);
    setPage(1);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
      showToast("success", "Template deleted successfully.");
      await refetch();
    } catch (err) {
      showToast("error", err?.message || "Failed to delete template.");
    }
  };

  const handleDuplicate = async (template) => {
    setBusyAction(template.id);
    try {
      await duplicateMutation.mutateAsync(template.id);
      showToast("success", "Template duplicated.");
      await refetch();
    } catch (err) {
      showToast("error", err?.message || "Failed to duplicate template.");
    } finally {
      setBusyAction(null);
    }
  };

  const loading = isLoading || isFetching;
  const hasRows = paginated.items.length > 0;
  const showEmpty = !loading && !error && !hasRows;
  const showTable = !error && hasRows;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Workflow Templates</h1>
        <p className={styles.subtitle}>
          Reusable React Flow blueprints. Templates are never executed — copy
          them into a workflow when ready.
        </p>
      </header>

      <WorkflowTemplateToolbar
        search={search}
        onSearchChange={setSearch}
        status={status}
        onStatusChange={handleStatusChange}
        moduleFilter={moduleFilter}
        onModuleChange={handleModuleChange}
        disabled={loading || deleteMutation.isPending}
      />

      {loading && !hasRows ? (
        <div className={styles.stateCard}>
          <span className={styles.loadingSpinner} aria-hidden="true" />
          <p className={styles.stateText}>Loading templates…</p>
        </div>
      ) : null}

      {error ? (
        <div className={styles.errorCard}>
          <div className={styles.errorBody}>
            <span className={styles.errorIcon}>
              <HiOutlineExclamation aria-hidden="true" />
            </span>
            <div>
              <h2 className={styles.errorTitle}>Unable to load templates</h2>
              <p className={styles.errorText}>{error.message}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => refetch()}
            className={styles.btnSecondary}
          >
            <HiOutlineRefresh aria-hidden="true" />
            Retry
          </button>
        </div>
      ) : null}

      {showEmpty ? <EmptyTemplate /> : null}

      {showTable ? (
        <>
          <WorkflowTemplateTable
            templates={paginated.items}
            loading={loading}
            onView={(t) => router.push(`/admin/workflow-templates/${t.id}`)}
            onEdit={(t) =>
              router.push(`/admin/workflow-templates/${t.id}/edit`)
            }
            onPreview={(t) =>
              router.push(`/admin/workflow-templates/${t.id}/preview`)
            }
            onDuplicate={handleDuplicate}
            onDelete={setDeleteTarget}
            busyAction={busyAction}
            disabled={
              loading ||
              deleteMutation.isPending ||
              duplicateMutation.isPending
            }
          />

          <div className={styles.pagination}>
            <p className={styles.paginationText}>
              Showing{" "}
              <span className={styles.paginationStrong}>
                {paginated.items.length}
              </span>{" "}
              of{" "}
              <span className={styles.paginationStrong}>{paginated.total}</span>{" "}
              templates
            </p>
            <div className={styles.paginationControls}>
              <button
                type="button"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={loading || paginated.page <= 1}
                className={styles.pageBtn}
              >
                <HiChevronLeft aria-hidden="true" />
                Previous
              </button>
              <span className={styles.pageIndicator}>
                Page {paginated.page} of {paginated.totalPages}
              </span>
              <button
                type="button"
                onClick={() =>
                  setPage((current) =>
                    Math.min(paginated.totalPages, current + 1)
                  )
                }
                disabled={loading || paginated.page >= paginated.totalPages}
                className={styles.pageBtn}
              >
                Next
                <HiChevronRight aria-hidden="true" />
              </button>
            </div>
          </div>
        </>
      ) : null}

      <DeleteTemplateModal
        open={Boolean(deleteTarget)}
        template={deleteTarget}
        loading={deleteMutation.isPending}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
      />

      {toast ? (
        <div
          role="status"
          aria-live="polite"
          className={`${styles.toast} ${
            toast.type === "success" ? styles.toastSuccess : styles.toastError
          }`}
        >
          <span className={styles.toastIcon}>
            {toast.type === "success" ? (
              <HiOutlineCheckCircle aria-hidden="true" />
            ) : (
              <HiOutlineExclamationCircle aria-hidden="true" />
            )}
          </span>
          <span className={styles.toastMessage}>{toast.message}</span>
        </div>
      ) : null}
    </div>
  );
}
