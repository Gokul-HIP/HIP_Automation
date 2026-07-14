import { HiOutlineLightningBolt, HiOutlinePlay, HiOutlinePause } from "react-icons/hi";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import styles from "./automation.module.css";

export const metadata = {
  title: "Automation · HIP Automation",
};

const RULES = [
  {
    id: 1,
    name: "Lead welcome sequence",
    status: "active",
    runs: "1,204",
  },
  {
    id: 2,
    name: "SLA breach alert",
    status: "active",
    runs: "86",
  },
  {
    id: 3,
    name: "Inactive contact nudge",
    status: "paused",
    runs: "412",
  },
];

export default function AutomationPage() {
  return (
    <DashboardLayout>
      <div className="pageShell">
        <header className={styles.header}>
          <div>
            <h1 className="pageTitle">Automation</h1>
            <p className="pageSubtitle">
              Build and monitor workflow rules across your CRM.
            </p>
          </div>
          <Button icon={HiOutlineLightningBolt}>New rule</Button>
        </header>

        <div className={styles.grid}>
          {RULES.map((rule) => (
            <Card key={rule.id} padding="md">
              <div className={styles.ruleTop}>
                <h3 className={styles.ruleName}>{rule.name}</h3>
                <Badge tone={rule.status === "active" ? "success" : "warning"}>
                  {rule.status}
                </Badge>
              </div>
              <p className={styles.runs}>{rule.runs} runs this month</p>
              <div className={styles.ruleActions}>
                <Button
                  size="sm"
                  variant="secondary"
                  icon={rule.status === "active" ? HiOutlinePause : HiOutlinePlay}
                >
                  {rule.status === "active" ? "Pause" : "Resume"}
                </Button>
                <Button size="sm" variant="ghost">
                  Edit
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
