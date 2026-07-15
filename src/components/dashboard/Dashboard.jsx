import {
  HiOutlineChatAlt2,
  HiOutlineTrendingUp,
  HiOutlineTrendingDown,
  HiOutlineCheckCircle,
  HiOutlineUserAdd,
  HiOutlineMail,
  HiOutlineLightningBolt,
  HiOutlinePlus,
  HiOutlineMailOpen,
  HiOutlineUserGroup,
  HiOutlineChevronRight,
} from "react-icons/hi";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Avatar from "@/components/ui/Avatar";
import styles from "./Dashboard.module.css";

/* ─── Helpers ─── */

// Deterministic pseudo-sparkline derived from a string seed + trend bias.
// No Math.random so server/client render identically.
function generateSparkline(seed = "", tone = "success") {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  const count = 9;
  const bias = tone === "success" ? 1 : tone === "danger" ? -1 : 0.15;
  const points = [];
  for (let i = 0; i < count; i++) {
    const noise = ((hash >> ((i * 5) % 24)) & 15) / 15; // 0..1
    const drift = (i / (count - 1)) * bias;
    points.push(Math.max(0.05, Math.min(0.95, noise * 0.55 + drift * 0.45 + 0.15)));
  }
  return points;
}

function sparklinePath(points, width = 96, height = 32, padding = 3) {
  const usableH = height - padding * 2;
  const step = width / (points.length - 1);
  const coords = points.map((p, i) => {
    const x = i * step;
    const y = padding + (1 - p) * usableH;
    return [x, y];
  });
  const line = coords.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area = `${line} L${width},${height} L0,${height} Z`;
  return { line, area };
}

const TONES = ["brand", "positive", "info", "amber"];

/* ─── Stats ─── */

export function StatCard({
  title,
  value,
  change,
  changeTone = "success",
  icon: Icon,
  hint,
}) {
  const points = generateSparkline(title, changeTone);
  const { line, area } = sparklinePath(points);
  const tone = TONES[Math.abs(title?.length ?? 0) % TONES.length];
  const TrendIcon = changeTone === "danger" ? HiOutlineTrendingDown : HiOutlineTrendingUp;

  return (
    <article className={`${styles.statCard} themeMotionCard`} data-tone={tone} data-theme-motion="card">
      <div className={styles.statTop}>
        <span className={styles.statIcon} aria-hidden="true">
          {Icon && <Icon />}
        </span>
        {change != null && (
          <Badge tone={changeTone}>
            <TrendIcon aria-hidden="true" className={styles.statBadgeIcon} />
            {change}
          </Badge>
        )}
      </div>

      <p className={styles.statTitle}>{title}</p>
      <p className={styles.statValue}>{value}</p>

      <div className={styles.statFoot}>
        {hint && <p className={styles.statHint}>{hint}</p>}
        <svg
          className={styles.sparkline}
          viewBox="0 0 96 32"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path className={styles.sparklineArea} d={area} />
          <path className={styles.sparklineLine} d={line} />
        </svg>
      </div>
    </article>
  );
}

/* ─── Activity Chart ─── */

const DEFAULT_CHART_DATA = [
  { label: "Mon", value: 42 },
  { label: "Tue", value: 58 },
  { label: "Wed", value: 35 },
  { label: "Thu", value: 72 },
  { label: "Fri", value: 64 },
  { label: "Sat", value: 48 },
  { label: "Sun", value: 55 },
];

export function ActivityChart({
  title = "Message Activity",
  subtitle = "Conversations over the last 7 days",
  data = DEFAULT_CHART_DATA,
}) {
  const max = Math.max(...data.map((d) => d.value), 1);
  const avg = Math.round(data.reduce((s, d) => s + d.value, 0) / data.length);
  const chartHeight = 160;
  const barWidth = 28;
  const gap = 16;
  const width = data.length * (barWidth + gap);
  const avgY = chartHeight - (avg / max) * chartHeight;

  return (
    <Card
      title={title}
      subtitle={subtitle}
      action={
        <Button variant="ghost" size="sm">
          Export
        </Button>
      }
    >
      <div className={`${styles.chartWrap} themeMotionChart`} data-theme-motion="chart">
        <div className={styles.chartLegend}>
          <span className={styles.chartLegendItem}>
            <span className={styles.chartLegendDot} />
            Daily conversations
          </span>
          <span className={styles.chartLegendItem}>
            <span className={styles.chartLegendDash} />
            Avg. {avg}
          </span>
        </div>

        <svg
          className={styles.chartSvg}
          viewBox={`0 0 ${width} ${chartHeight + 40}`}
          role="img"
          aria-label="Weekly message activity chart"
        >
          <defs>
            <linearGradient id="barFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--primary-light)" />
              <stop offset="100%" stopColor="var(--primary-color)" />
            </linearGradient>
          </defs>

          <line
            className={styles.chartAvgLine}
            x1="0"
            x2={width}
            y1={avgY}
            y2={avgY}
          />

          {data.map((item, index) => {
            const barH = Math.max((item.value / max) * chartHeight, 4);
            const x = index * (barWidth + gap);
            const y = chartHeight - barH;
            const isPeak = item.value === max;

            return (
              <g key={item.label} className={styles.chartGroup}>
                <rect
                  className={styles.chartTrack}
                  x={x}
                  y={0}
                  width={barWidth}
                  height={chartHeight}
                  rx="7"
                />
                <rect
                  className={styles.chartBar}
                  data-peak={isPeak ? "true" : "false"}
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barH}
                  rx="7"
                >
                  <title>{`${item.label}: ${item.value}`}</title>
                </rect>
                {isPeak && (
                  <circle
                    className={styles.chartPeakDot}
                    cx={x + barWidth / 2}
                    cy={y - 8}
                    r="3"
                  />
                )}
                <text
                  className={styles.chartLabel}
                  x={x + barWidth / 2}
                  y={chartHeight + 18}
                  textAnchor="middle"
                >
                  {item.label}
                </text>
                <text
                  className={styles.chartValue}
                  x={x + barWidth / 2}
                  y={chartHeight + 34}
                  textAnchor="middle"
                >
                  {item.value}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </Card>
  );
}

/* ─── Chatbot ─── */

const CHATBOT_METRICS = [
  { label: "Sessions", value: "1,248" },
  { label: "Resolution", value: "87%" },
  { label: "Avg. reply", value: "1.2s" },
];

export function ChatbotCard() {
  const resolutionPct = 87;
  const circumference = 2 * Math.PI * 26;
  const dashOffset = circumference * (1 - resolutionPct / 100);

  return (
    <Card
      title="Chatbot Activity"
      subtitle="AI agent performance today"
      action={<Badge tone="success">Live</Badge>}
    >
      <div className={styles.chatbotHero}>
        <div className={styles.chatbotRingWrap} aria-hidden="true">
          <svg viewBox="0 0 64 64" className={styles.chatbotRing}>
            <circle className={styles.chatbotRingTrack} cx="32" cy="32" r="26" />
            <circle
              className={styles.chatbotRingProgress}
              cx="32"
              cy="32"
              r="26"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
            />
          </svg>
          <span className={styles.chatbotIcon}>
            <HiOutlineChatAlt2 />
          </span>
        </div>
        <div>
          <p className={styles.chatbotHeroValue}>326</p>
          <p className={styles.chatbotHeroLabel}>
            <HiOutlineTrendingUp aria-hidden="true" />
            Active conversations
          </p>
        </div>
      </div>

      <ul className={styles.chatbotMetrics}>
        {CHATBOT_METRICS.map((item) => (
          <li key={item.label} className={styles.chatbotMetric}>
            <span className={styles.chatbotMetricLabel}>{item.label}</span>
            <strong className={styles.chatbotMetricValue}>{item.value}</strong>
          </li>
        ))}
      </ul>
    </Card>
  );
}

/* ─── Messages ─── */

const DEFAULT_MESSAGES = [
  {
    id: 1,
    name: "Sara Chen",
    preview: "Can we reschedule the onboarding call?",
    time: "2m",
    unread: true,
  },
  {
    id: 2,
    name: "Marcus Lee",
    preview: "Invoice #4821 has been paid. Thanks!",
    time: "18m",
    unread: true,
  },
  {
    id: 3,
    name: "Priya Nair",
    preview: "The automation rule fired twice — can you check?",
    time: "1h",
    unread: false,
  },
  {
    id: 4,
    name: "Jordan Blake",
    preview: "Shared a new lead list for Q3.",
    time: "3h",
    unread: false,
  },
];

export function MessageCard({
  title = "Unread Messages",
  messages = DEFAULT_MESSAGES,
}) {
  return (
    <Card
      title={title}
      subtitle={`${messages.filter((m) => m.unread).length} need attention`}
      action={
        <Button variant="ghost" size="sm">
          View all
        </Button>
      }
    >
      <ul className={styles.messageList}>
        {messages.map((msg) => (
          <li
            key={msg.id}
            className={styles.messageItem}
            data-unread={msg.unread ? "true" : "false"}
            tabIndex={0}
          >
            {msg.unread && <span className={styles.messageDot} aria-hidden="true" />}
            <Avatar
              name={msg.name}
              size="sm"
              status={msg.unread ? "online" : undefined}
            />
            <div className={styles.messageMeta}>
              <div className={styles.messageRow}>
                <span className={styles.messageName}>{msg.name}</span>
                <time className={styles.messageTime}>{msg.time}</time>
              </div>
              <p className={styles.messagePreview}>{msg.preview}</p>
            </div>
            <HiOutlineChevronRight className={styles.messageArrow} aria-hidden="true" />
          </li>
        ))}
      </ul>
    </Card>
  );
}

/* ─── Recent Activity ─── */

const DEFAULT_ACTIVITY = [
  {
    id: 1,
    icon: HiOutlineUserAdd,
    title: "New lead assigned",
    detail: "Sara Chen → Enterprise Pipeline",
    time: "4 min ago",
  },
  {
    id: 2,
    icon: HiOutlineMail,
    title: "Campaign sent",
    detail: "Q3 nurture sequence — 2,410 recipients",
    time: "32 min ago",
  },
  {
    id: 3,
    icon: HiOutlineLightningBolt,
    title: "Automation completed",
    detail: "Follow-up reminder rule ran successfully",
    time: "1 hr ago",
  },
  {
    id: 4,
    icon: HiOutlineCheckCircle,
    title: "Deal closed",
    detail: "Acme Corp — $18,400",
    time: "3 hr ago",
  },
];

export function RecentActivity({ items = DEFAULT_ACTIVITY }) {
  return (
    <Card title="Recent Activity" subtitle="Latest CRM events">
      <ul className={styles.activityList}>
        {items.map((item, i) => {
          const Icon = item.icon;
          const tone = TONES[i % TONES.length];
          const isLast = i === items.length - 1;
          return (
            <li key={item.id} className={styles.activityItem} data-tone={tone}>
              <div className={styles.activityRail} aria-hidden="true">
                <span className={styles.activityIcon}>
                  <Icon />
                </span>
                {!isLast && <span className={styles.activityLine} />}
              </div>
              <div className={styles.activityBody}>
                <div className={styles.activityRow}>
                  <p className={styles.activityTitle}>{item.title}</p>
                  <time className={styles.activityTime}>{item.time}</time>
                </div>
                <p className={styles.activityDetail}>{item.detail}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

/* ─── Quick Actions ─── */

const QUICK_ACTIONS = [
  { id: 1, label: "New contact", icon: HiOutlinePlus, tone: "brand" },
  { id: 2, label: "Compose email", icon: HiOutlineMailOpen, tone: "info" },
  { id: 3, label: "New automation", icon: HiOutlineLightningBolt, tone: "amber" },
  { id: 4, label: "Invite team", icon: HiOutlineUserGroup, tone: "positive" },
];

export function QuickActions() {
  return (
    <Card title="Quick Actions" subtitle="Jump into common workflows">
      <div className={styles.quickGrid}>
        {QUICK_ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              type="button"
              className={styles.quickTile}
              data-tone={action.tone}
            >
              <span className={styles.quickTileIcon}>
                <Icon />
              </span>
              <span className={styles.quickTileLabel}>{action.label}</span>
            </button>
          );
        })}
      </div>
    </Card>
  );
}