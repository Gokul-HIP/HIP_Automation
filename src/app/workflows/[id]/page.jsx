import DashboardLayout from "@/components/layout/DashboardLayout";
import FlowBuilder from "@/components/flow/FlowBuilder";

export default async function EditWorkflowPage({ params }) {
  const { id } = await params;
  return (
    <DashboardLayout>
      <FlowBuilder initialWorkflowId={id} />
    </DashboardLayout>
  );
}
