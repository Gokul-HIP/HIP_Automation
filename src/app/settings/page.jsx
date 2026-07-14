import DashboardLayout from "@/components/layout/DashboardLayout";
import SettingsView from "./SettingsView";

export const metadata = {
  title: "Settings · HIP Automation",
};

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <SettingsView />
    </DashboardLayout>
  );
}
