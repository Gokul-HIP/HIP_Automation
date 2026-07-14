import DashboardLayout from "@/components/layout/DashboardLayout";
import { ChatbotCard } from "@/components/dashboard/Dashboard";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import styles from "./chatbot.module.css";

export const metadata = {
  title: "Chatbot · HIP Automation",
};

const INTENTS = [
  { id: 1, name: "Pricing inquiry", hits: 420, accuracy: "92%" },
  { id: 2, name: "Order status", hits: 318, accuracy: "95%" },
  { id: 3, name: "Support escalation", hits: 146, accuracy: "88%" },
];

export default function ChatbotPage() {
  return (
    <DashboardLayout>
      <div className="pageShell">
        <header className={styles.header}>
          <div>
            <h1 className="pageTitle">Chatbot</h1>
            <p className="pageSubtitle">
              Monitor AI agents, intents, and live conversation quality.
            </p>
          </div>
          <Button>Train agent</Button>
        </header>

        <div className={styles.layout}>
          <ChatbotCard />
          <Card title="Top Intents" subtitle="Last 7 days">
            <ul className={styles.intents}>
              {INTENTS.map((intent) => (
                <li key={intent.id} className={styles.intent}>
                  <div>
                    <p className={styles.intentName}>{intent.name}</p>
                    <p className={styles.intentMeta}>{intent.hits} hits</p>
                  </div>
                  <Badge tone="success">{intent.accuracy}</Badge>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
