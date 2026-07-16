import DashboardLayout from "@/components/layout/DashboardLayout";
import FlowBuilder from "@/components/flow/FlowBuilder";

export const metadata = {
  title: "Workflows · HIP Automation",
};

export default async function AutomationPage({ searchParams }) {
  const params = await searchParams;
  const initialWorkflowId = params?.id ?? params?.workflowId ?? null;

  return (
    <DashboardLayout>
      <FlowBuilder initialWorkflowId={initialWorkflowId} />
    </DashboardLayout>
  );
}
