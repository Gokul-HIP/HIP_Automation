"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  HiOutlineRefresh,
  HiOutlineExclamation,
  HiOutlineCheckCircle,
  HiOutlineExclamationCircle,
  HiChevronLeft,
  HiChevronRight,
} from "react-icons/hi";
import WorkflowToolbar from "@/components/workflow/WorkflowToolbar";
import WorkflowTable from "@/components/workflow/WorkflowTable";
import EmptyWorkflow from "@/components/workflow/EmptyWorkflow";
import DeleteWorkflowModal from "@/components/workflow/DeleteWorkflowModal";
import CreateWorkflowModal from "@/components/workflow/CreateWorkflowModal";
import {
  useWorkflows,
  useDeleteWorkflow,
  usePublishWorkflow,
  useDuplicateWorkflow,
} from "@/hooks/useWorkflowApi";
import { extractWorkflowId } from "@/services/api/workflows";
import { resolveWorkflowListPagination } from "@/utils/workflowList";
import styles from "./Workflows.module.css";

const PER_PAGE = 10;

export default function WorkflowsView() {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [busyAction, setBusyAction] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toast, setToast] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    const handle = window.setTimeout(() => setDebouncedSearch(search), 400);
    return () => window.clearTimeout(handle);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status, sort]);

  const { data, isLoading, error, refetch, isFetching } = useWorkflows({
    search: debouncedSearch,
    status,
    sort,
    page,
    perPage: PER_PAGE,
  });

  const deleteMutation = useDeleteWorkflow();
  const publishMutation = usePublishWorkflow();
  const duplicateMutation = useDuplicateWorkflow();

  const paginated = useMemo(
    () =>
      resolveWorkflowListPagination(data, page, PER_PAGE, {
        search: debouncedSearch,
        status,
        sort,
      }),
    [data, page, debouncedSearch, status, sort]
  );

  // If delete/filter shrinks lastPage below current page, step back safely.
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

  const handleCreate = () => setCreateOpen(true);

  const handleBlankWorkflow = (hospitalId) => {
    const params = new URLSearchParams();
    if (hospitalId != null) params.set("hospitalId", String(hospitalId));
    const qs = params.toString();
    router.push(qs ? `/workflows/new?${qs}` : "/workflows/new");
  };

  const handleSelectTemplate = (template, hospitalId) => {
    const params = new URLSearchParams();
    params.set("templateId", String(template.id));
    if (hospitalId != null) params.set("hospitalId", String(hospitalId));
    router.push(`/workflows/new?${params.toString()}`);
  };

  const handleOpenWorkflow = (workflow, mode) => {
    router.push(`/workflows/${workflow.id}${mode === "view" ? "?mode=view" : ""}`);
  };

  const handlePublish = async (workflow) => {
    setBusyAction(workflow.id);
    try {
      const result = await publishMutation.mutateAsync(workflow.id);
      const version =
        result?.version ?? result?.data?.version ?? result?.published_version;
      showToast(
        "success",
        version ? `Published v${version}` : result?.message || "Workflow published"
      );
      await refetch();
    } catch (err) {
      showToast("error", err?.message || "Failed to publish workflow.");
    } finally {
      setBusyAction(null);
    }
  };

  const handleDuplicate = async (workflow) => {
    setBusyAction(workflow.id);
    try {
      const result = await duplicateMutation.mutateAsync(workflow.id);
      const newId = extractWorkflowId(result);
      showToast("success", "Workflow duplicated. You can edit and publish it.");
      await refetch();
      if (newId != null) {
        router.push(`/workflows/${newId}`);
      }
    } catch (err) {
      showToast("error", err?.message || "Failed to duplicate workflow.");
    } finally {
      setBusyAction(null);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
      showToast("success", "Workflow deleted successfully.");
      const result = await refetch();
      const next = resolveWorkflowListPagination(
        result?.data,
        page,
        PER_PAGE,
        { search: debouncedSearch, status, sort }
      );
      if (page > next.lastPage) {
        setPage(Math.max(1, next.lastPage));
      }
    } catch (err) {
      showToast("error", err?.message || "Failed to delete workflow.");
    }
  };

  const loading = isLoading || isFetching;
  const hasRows = paginated.items.length > 0;
  const showEmpty = !loading && !error && !hasRows;
  const showTable = !error && hasRows;
  const showInitialLoading = loading && !hasRows && !error;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Hospital Workflows</h1>
        <p className={styles.subtitle}>
          Manage automation workflows connected to Builder Connect APIs.
        </p>
        <Link href="/workflows/executions" className={styles.btnGhost}>
          View execution history
        </Link>
      </header>

      <WorkflowToolbar
        search={search}
        onSearchChange={setSearch}
        status={status}
        onStatusChange={setStatus}
        sort={sort}
        onSortChange={setSort}
        onCreate={handleCreate}
        disabled={
          loading || deleteMutation.isPending || duplicateMutation.isPending
        }
      />

      {showInitialLoading ? (
        <div className={styles.stateCard}>
          <span className={styles.loadingSpinner} aria-hidden="true" />
          <p className={styles.stateText}>Loading workflows…</p>
        </div>
      ) : null}

      {error ? (
        <div className={styles.errorCard}>
          <div className={styles.errorBody}>
            <span className={styles.errorIcon}>
              <HiOutlineExclamation aria-hidden="true" />
            </span>
            <div>
              <h2 className={styles.errorTitle}>Unable to load workflows</h2>
              <p className={styles.errorText}>{error.message}</p>
            </div>
          </div>
          <button type="button" onClick={() => refetch()} className={styles.btnSecondary}>
            <HiOutlineRefresh aria-hidden="true" />
            Retry
          </button>
        </div>
      ) : null}

      {showEmpty ? <EmptyWorkflow onCreate={handleCreate} disabled={loading} /> : null}

      {showTable ? (
        <>
          <WorkflowTable
            workflows={paginated.items}
            loading={loading}
            onView={(workflow) => handleOpenWorkflow(workflow, "view")}
            onEdit={(workflow) => handleOpenWorkflow(workflow, "edit")}
            onDelete={setDeleteTarget}
            onPublish={handlePublish}
            onDuplicate={handleDuplicate}
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
              workflows
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

      <DeleteWorkflowModal
        open={Boolean(deleteTarget)}
        workflow={deleteTarget}
        loading={deleteMutation.isPending}
        onCancel={() => {
          if (!deleteMutation.isPending) setDeleteTarget(null);
        }}
        onConfirm={handleDeleteConfirm}
      />

      <CreateWorkflowModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onBlank={handleBlankWorkflow}
        onSelectTemplate={handleSelectTemplate}
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
