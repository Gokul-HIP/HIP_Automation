import DashboardLayout from "@/components/layout/DashboardLayout";
import FlowBuilder from "@/components/flow/FlowBuilder";

export default function CreateWorkflowTemplatePage() {
  return (
    <DashboardLayout>
      <FlowBuilder mode="template" />
    </DashboardLayout>
  );
}
