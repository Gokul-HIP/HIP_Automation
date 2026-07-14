import {
  HiOutlineUsers,
  HiOutlineCurrencyDollar,
  HiOutlineChatAlt2,
  HiOutlineTrendingUp,
} from "react-icons/hi";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  WelcomeCard,
  StatCard,
  ActivityChart,
  ChatbotCard,
  MessageCard,
  RecentActivity,
  QuickActions,
} from "@/components/dashboard/Dashboard";
import styles from "./dashboard.module.css";

export const metadata = {
  title: "Dashboard · HIP Automation",
};

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className={`${styles.grid} dashboardGrid`}>
        <div className="span12">
          <WelcomeCard />
        </div>

        <div className="statsRow">
          <StatCard
            title="Active Contacts"
            value="12,480"
            change="+8.2%"
            changeTone="success"
            icon={HiOutlineUsers}
            hint="vs last 30 days"
          />
          <StatCard
            title="Revenue"
            value="$248.6k"
            change="+12%"
            changeTone="success"
            icon={HiOutlineCurrencyDollar}
            hint="Closed this month"
          />
          <StatCard
            title="Open Conversations"
            value="384"
            change="-3.1%"
            changeTone="warning"
            icon={HiOutlineChatAlt2}
            hint="Across all channels"
          />
          <StatCard
            title="Conversion Rate"
            value="24.8%"
            change="+1.4%"
            changeTone="success"
            icon={HiOutlineTrendingUp}
            hint="Lead to opportunity"
          />
        </div>

        <div className="span8">
          <ActivityChart />
        </div>

        <div className="span4">
          <ChatbotCard />
        </div>

        <div className="span6">
          <MessageCard />
        </div>

        <div className="span6">
          <RecentActivity />
        </div>

        <div className="span12">
          <QuickActions />
        </div>
      </div>
    </DashboardLayout>
  );
}
