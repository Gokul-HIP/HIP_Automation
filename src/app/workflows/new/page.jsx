"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import FlowBuilder from "@/components/flow/FlowBuilder";

function NewWorkflowBuilder() {
  const searchParams = useSearchParams();
  const templateId = searchParams.get("templateId");
  const hospitalIdParam = searchParams.get("hospitalId");
  const hospitalId = hospitalIdParam
    ? Number(hospitalIdParam) || hospitalIdParam
    : null;

  return (
    <FlowBuilder
      mode="workflow"
      fromTemplateId={templateId ? Number(templateId) || templateId : null}
      initialHospitalId={hospitalId}
    />
  );
}

export default function NewWorkflowPage() {
  return (
    <DashboardLayout>
      <Suspense fallback={<div style={{ padding: 24 }}>Loading builder…</div>}>
        <NewWorkflowBuilder />
      </Suspense>
    </DashboardLayout>
  );
}
