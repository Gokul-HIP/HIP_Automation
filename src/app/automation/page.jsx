import DashboardLayout from "@/components/layout/DashboardLayout";
import FlowBuilder from "@/components/flow/FlowBuilder";

export const metadata = {
  title: "Workflows · HIP Automation",
};

export default function AutomationPage() {
  return (
    <DashboardLayout>
      <FlowBuilder />
    </DashboardLayout>
  );
}
