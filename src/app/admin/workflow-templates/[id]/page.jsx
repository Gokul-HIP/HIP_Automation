import DashboardLayout from "@/components/layout/DashboardLayout";
import FlowBuilder from "@/components/flow/FlowBuilder";

export default async function ViewWorkflowTemplatePage({ params }) {
  const { id } = await params;
  return (
    <DashboardLayout>
      <FlowBuilder
        mode="template"
        initialId={id}
        readOnly
        showMetaBanner
      />
    </DashboardLayout>
  );
}
