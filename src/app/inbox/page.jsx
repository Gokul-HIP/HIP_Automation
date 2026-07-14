import DashboardLayout from "@/components/layout/DashboardLayout";
import { MessageCard } from "@/components/dashboard/Dashboard";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import styles from "./inbox.module.css";

export const metadata = {
  title: "Inbox · HIP Automation",
};

const CHANNELS = [
  { id: 1, name: "Email", count: 48, tone: "primary" },
  { id: 2, name: "WhatsApp", count: 22, tone: "success" },
  { id: 3, name: "Live Chat", count: 15, tone: "info" },
  { id: 4, name: "SMS", count: 6, tone: "warning" },
];

export default function InboxPage() {
  return (
    <DashboardLayout>
      <div className="pageShell">
        <header>
          <h1 className="pageTitle">Inbox</h1>
          <p className="pageSubtitle">
            Unified view of customer conversations across channels.
          </p>
        </header>

        <div className={styles.layout}>
          <Card title="Channels" subtitle="Active queues">
            <ul className={styles.channels}>
              {CHANNELS.map((ch) => (
                <li key={ch.id} className={styles.channel}>
                  <span>{ch.name}</span>
                  <Badge tone={ch.tone}>{ch.count}</Badge>
                </li>
              ))}
            </ul>
            <div className={styles.actions}>
              <Button fullWidth>Compose</Button>
            </div>
          </Card>

          <MessageCard title="All Messages" />
        </div>
      </div>
    </DashboardLayout>
  );
}
