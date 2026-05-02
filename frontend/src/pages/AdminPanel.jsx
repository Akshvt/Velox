import { useMemo, useState } from "react";
import AppShell from "@layouts/AppShell.jsx";
import { useAnalyticsOverview, useTicketsTrend, useAgentPerformance } from "@api/hooks/useAnalytics";
import { useTickets } from "@api/hooks/useTickets";
import {
  Activity,
  AlertTriangle,
  Calendar,
  ChevronDown,
  Download,
  Inbox,
  MoreHorizontal,
  Smile,
  Ticket,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

/* ----------------------------- constants & tones ----------------------------- */

const STATUS_TONES = {
  Open:          { bg: "#E9F5E0", color: "#3FA02A" },
  Pending:       { bg: "#FFF5DC", color: "#C28A00" },
  "In Progress": { bg: "#F1ECFF", color: "#7C5CFF" },
  Resolved:      { bg: "#FCE7F3", color: "#D63384" },
  Closed:        { bg: "#EDEDEA", color: "#5B5B57" },
};

const PRIORITY_TONES = {
  high:   { bg: "#FCE7F3", color: "#D63384" },
  medium: { bg: "#FFF5DC", color: "#C28A00" },
  low:    { bg: "#E9F5E0", color: "#3FA02A" },
};

const DEFAULT_KPIS = [
  { key: "total",    label: "Total Tickets",       value: "0", delta: "", up: true,  icon: Inbox,        tone: "#F1ECFF", iconColor: "#7C5CFF" },
  { key: "open",     label: "Open Tickets",        value: "0", delta: "", up: true,  icon: Ticket,       tone: "#FFF5DC", iconColor: "#C28A00" },
  { key: "resolved", label: "Resolved Tickets",    value: "0", delta: "", up: true,  icon: Smile,        tone: "#E9F5E0", iconColor: "#3FA02A" },
  { key: "resp",     label: "Avg. Resolution Time",value: "0m", delta: "", up: false, icon: Activity,    tone: "#FCE7F3", iconColor: "#D63384" },
  { key: "csat",     label: "Customer Satisfaction", value: "N/A", delta: "", up: true, icon: Smile,     tone: "#E9F5E0", iconColor: "#3FA02A" },
];

/* ============================== page ============================== */
export default function AdminPanel() {
  const [chartRange, setChartRange] = useState("Daily");
  const [agentRange, setAgentRange] = useState("This Week");

  // Fetch live data
  const { data: overviewData, isLoading: overviewLoading, isError: overviewError } = useAnalyticsOverview();
  const { data: trendsData, isLoading: trendsLoading, isError: trendsError } = useTicketsTrend();
  const { data: agentsData, isLoading: agentsLoading, isError: agentsError } = useAgentPerformance();
  const { data: ticketsData, isLoading: ticketsLoading, isError: ticketsError } = useTickets({ limit: 5 });

  const isLoading = overviewLoading || trendsLoading || agentsLoading || ticketsLoading;
  const isError = overviewError || trendsError || agentsError || ticketsError;

  const overview = overviewData || {};

  const liveKpis = useMemo(() => {
    if (!overviewData) return DEFAULT_KPIS;
    const fmt = (n) => (typeof n === "number" ? n.toLocaleString() : n ?? "0");
    return [
      { ...DEFAULT_KPIS[0], value: fmt(overview.total) },
      { ...DEFAULT_KPIS[1], value: fmt(overview.open) },
      { ...DEFAULT_KPIS[2], value: fmt(overview.resolved) },
      { ...DEFAULT_KPIS[3], value: overview.avgResolutionFormatted || "0m" },
      { ...DEFAULT_KPIS[4], value: overview.csat !== "N/A" ? `${overview.csat} / 5` : "N/A" },
    ];
  }, [overviewData]);

  const liveTimeSeries = useMemo(() => {
    const list = trendsData?.trends || [];
    if (!list.length) return [{ x: "No Data", y: 0 }];
    return list.slice(-7).map((t) => ({
      x: new Date(t.date).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      y: t.count,
    }));
  }, [trendsData]);

  const liveStatusData = useMemo(() => {
    if (!overviewData) return [];
    const total = overview.total || 1; // avoid /0
    return [
      { key: "Open", value: overview.open || 0, pct: Math.round(((overview.open || 0) / total) * 100), color: "#3FA02A" },
      { key: "Resolved", value: overview.resolved || 0, pct: Math.round(((overview.resolved || 0) / total) * 100), color: "#D63384" },
      { key: "Closed", value: overview.closed || 0, pct: Math.round(((overview.closed || 0) / total) * 100), color: "#7C5CFF" },
    ].filter((d) => d.value > 0);
  }, [overviewData]);

  const liveTickets = useMemo(() => {
    const list = ticketsData?.tickets || [];
    return list.map((t) => {
      const initial = t.customer?.name?.[0]?.toUpperCase() || "U";
      const agentInit = t.assignedTo?.name?.split(" ").map((n) => n[0]).join("") || "--";
      const statusCapitalized = t.status ? t.status.charAt(0).toUpperCase() + t.status.slice(1) : "Open";
      return {
        id: t._id.slice(-4).toUpperCase(), // Using last 4 chars as short ID
        customer: t.customer?.name || "Unknown",
        initials: initial,
        subject: t.subject || "No subject",
        status: statusCapitalized,
        priority: t.priority || "medium",
        agent: t.assignedTo?.name || "Unassigned",
        agentInitials: agentInit,
        agentTone: "#E9F5E0",
        updated: new Date(t.updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
    });
  }, [ticketsData]);

  const liveTopAgents = useMemo(() => {
    const list = agentsData?.agents || [];
    return list.slice(0, 5).map((a) => {
      const initial = (a.name || a.email || "??").split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
      const pct = a.total > 0 ? Math.round((a.resolved / a.total) * 100) : 0;
      return {
        name: a.name || a.email,
        initials: initial,
        tone: "#F1ECFF",
        color: "#7C5CFF",
        resolved: a.resolved || 0,
        pct,
      };
    });
  }, [agentsData]);

  if (isLoading) {
    return (
      <AppShell active="dashboard" title="Dashboard" subtitle="Overview of your support system">
        <div className="flex h-[400px] items-center justify-center text-[13px] font-semibold text-black/50">
          <Activity className="mr-2 animate-pulse" size={16} />
          Loading dashboard data...
        </div>
      </AppShell>
    );
  }

  if (isError) {
    return (
      <AppShell active="dashboard" title="Dashboard" subtitle="Overview of your support system">
        <div className="flex h-[400px] items-center justify-center text-[13px] font-semibold text-[#D63384]">
          <AlertTriangle className="mr-2" size={16} />
          Failed to load dashboard data. Please refresh.
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      active="dashboard"
      title="Dashboard"
      subtitle="Overview of your support system"
      actions={
        <>
          <button className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-[12px] font-semibold ring-1 ring-black/15">
            <Calendar size={13} strokeWidth={2.5} className="text-black/55" />
            Live Data
            <ChevronDown size={12} strokeWidth={2.5} className="text-black/50" />
          </button>
          <button className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-[12px] font-bold ring-1 ring-black/15 transition-transform hover:-translate-y-0.5">
            <Download size={13} strokeWidth={2.8} className="text-[#3FA02A]" />
            Export
          </button>
        </>
      }
    >
      {/* KPI grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {liveKpis.map((k) => (
          <KpiCard key={k.key} {...k} />
        ))}
      </div>

      {/* charts row */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Tickets Over Time" right={<RangePill value={chartRange} onChange={setChartRange} options={["Daily", "Weekly", "Monthly"]} />} />
          <LineChart data={liveTimeSeries} />
        </Card>
        <Card>
          <CardHeader title="Tickets by Status" />
          <DonutChart data={liveStatusData.length ? liveStatusData : [{ key: "No Data", value: 1, pct: 100, color: "#e5e7eb" }]} total={overview.total || 0} />
        </Card>
      </div>

      {/* table + side rail */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        <Card>
          <CardHeader title="Recent Tickets" right={<TextLink>View All</TextLink>} />
          <div className="-mx-2 overflow-x-auto px-2">
            <table className="w-full min-w-[720px] text-left text-[12px]">
              <thead>
                <tr className="text-black/45">
                  <Th>Ticket ID</Th>
                  <Th>Customer</Th>
                  <Th>Subject</Th>
                  <Th>Status</Th>
                  <Th>Priority</Th>
                  <Th>Agent</Th>
                  <Th>Updated</Th>
                  <Th className="text-right">Actions</Th>
                </tr>
              </thead>
              <tbody>
                {liveTickets.length === 0 && (
                  <tr><td colSpan="8" className="py-4 text-center text-black/50">No tickets found</td></tr>
                )}
                {liveTickets.map((t) => (
                  <tr key={t.id} className="border-t border-black/5 align-middle">
                    <Td className="font-bold text-black/70">#{t.id}</Td>
                    <Td>
                      <span className="inline-flex items-center gap-2">
                        <span
                          className="flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold"
                          style={{ background: STATUS_TONES[t.status]?.bg || "#e5e7eb", color: STATUS_TONES[t.status]?.color || "#000" }}
                        >
                          {t.initials}
                        </span>
                        <span className="font-semibold">{t.customer}</span>
                      </span>
                    </Td>
                    <Td className="font-medium text-black/70">{t.subject}</Td>
                    <Td><Pill tone={STATUS_TONES[t.status] || STATUS_TONES.Open}>{t.status}</Pill></Td>
                    <Td><Pill tone={PRIORITY_TONES[t.priority] || PRIORITY_TONES.medium}>{t.priority}</Pill></Td>
                    <Td>
                      <span className="inline-flex items-center gap-2">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold" style={{ background: t.agentTone }}>
                          {t.agentInitials}
                        </span>
                        <span className="font-semibold">{t.agent}</span>
                      </span>
                    </Td>
                    <Td className="font-medium text-black/55">{t.updated}</Td>
                    <Td className="text-right">
                      <button aria-label="More" className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#FAFAF6]">
                        <MoreHorizontal size={14} strokeWidth={2.5} />
                      </button>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader title="Top Performing Agents" right={<RangePill value={agentRange} onChange={setAgentRange} options={["This Week", "This Month", "All Time"]} />} />
            <ul className="space-y-3">
              {liveTopAgents.length === 0 && <li className="text-[12px] text-black/50">No agent data</li>}
              {liveTopAgents.map((a, i) => (
                <li key={a.name} className="flex items-center gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#FAFAF6] text-[11px] font-bold text-black/65">{i + 1}</span>
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11px] font-bold" style={{ background: a.tone, color: a.color }}>{a.initials}</span>
                  <div className="min-w-0 flex-1 leading-tight">
                    <div className="flex items-center justify-between">
                      <span className="truncate text-[12px] font-semibold">{a.name}</span>
                      <span className="text-[11px] font-bold" style={{ color: a.color }}>{a.pct}%</span>
                    </div>
                    <div className="text-[10px] font-medium text-black/55">{a.resolved} resolved</div>
                    <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-[#FAFAF6]">
                      <div className="h-full rounded-full" style={{ width: `${a.pct}%`, background: a.color }} />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </Card>

          <Card>
            <CardHeader title="System Alerts" right={<TextLink>View All</TextLink>} />
            {overview.csat && overview.csat < 4 ? (
              <div className="flex items-start gap-3 rounded-[18px] bg-[#FCE7F3] p-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-[#D63384]">
                  <AlertTriangle size={14} strokeWidth={2.5} />
                </span>
                <div className="min-w-0 flex-1 leading-tight">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-[12px] font-semibold">CSAT Dropping</span>
                  </div>
                  <div className="mt-1 text-[11px] font-medium text-black/65">Average satisfaction is below 4.0.</div>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3 rounded-[18px] bg-[#E9F5E0] p-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-[#3FA02A]">
                  <Activity size={14} strokeWidth={2.5} />
                </span>
                <div className="min-w-0 flex-1 leading-tight">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-[12px] font-semibold">System Stable</span>
                  </div>
                  <div className="mt-1 text-[11px] font-medium text-black/65">All systems operating normally.</div>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </AppShell>
  );
}

/* ============================== bits ============================== */
function KpiCard({ label, value, delta, up, icon: Icon, tone, iconColor }) {
  const trendBg = up ? "#E9F5E0" : "#FCE7F3";
  const trendColor = up ? "#3FA02A" : "#D63384";
  const Trend = up ? TrendingUp : TrendingDown;
  return (
    <div className="rounded-[28px] bg-white p-4 shadow-[0_2px_0_rgba(0,0,0,0.03)] ring-1 ring-black/15">
      <div className="flex items-start justify-between">
        <span className="flex h-10 w-10 items-center justify-center rounded-full ring-1 ring-black/5" style={{ background: tone, color: iconColor }}>
          <Icon size={16} strokeWidth={2.5} />
        </span>
        <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ background: trendBg, color: trendColor }}>
          <Trend size={10} strokeWidth={3} />
          {delta}
        </span>
      </div>
      <div className="mt-3 font-display text-[26px] leading-none tracking-tight">{value}</div>
      <div className="mt-1.5 text-[11px] font-semibold text-black/55">{label}</div>
      <div className="mt-1 text-[10px] font-medium text-black/40">vs. last 7 days</div>
    </div>
  );
}

function Card({ children, className = "" }) {
  return (
    <div className={`rounded-[32px] bg-white p-4 shadow-[0_2px_0_rgba(0,0,0,0.03)] ring-1 ring-black/15 ${className}`}>
      {children}
    </div>
  );
}

function CardHeader({ title, right }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <span className="font-display text-[14px] uppercase tracking-wide">{title}</span>
      {right}
    </div>
  );
}

function RangePill({ value, onChange, options }) {
  return (
    <label className="inline-flex items-center gap-1 rounded-full bg-[#FAFAF6] px-2.5 py-1 text-[11px] font-semibold">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none bg-transparent pr-1 focus:outline-none"
      >
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      <ChevronDown size={11} strokeWidth={2.5} className="text-black/50" />
    </label>
  );
}

function TextLink({ children }) {
  return (
    <button className="text-[11px] font-semibold text-[#7C5CFF] hover:underline">{children}</button>
  );
}

function Th({ children, className = "" }) {
  return <th className={`px-2 pb-2 text-[10px] font-bold uppercase tracking-wide ${className}`}>{children}</th>;
}
function Td({ children, className = "" }) {
  return <td className={`px-2 py-2 ${className}`}>{children}</td>;
}

function Pill({ tone, children }) {
  return (
    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide" style={{ background: tone.bg, color: tone.color }}>
      {children}
    </span>
  );
}

/* ----------------------------- charts ----------------------------- */
function LineChart({ data }) {
  const W = 320, H = 160, P = 24;
  const xs = data.map((_, i) => P + (i * (W - 2 * P)) / (data.length - 1));
  const max = Math.max(...data.map((d) => d.y)) * 1.1;
  const ys = data.map((d) => H - P - (d.y / max) * (H - 2 * P));
  const path = xs.map((x, i) => `${i === 0 ? "M" : "L"} ${x} ${ys[i]}`).join(" ");
  const area = `${path} L ${xs[xs.length - 1]} ${H - P} L ${xs[0]} ${H - P} Z`;

  return (
    <div className="-mx-1">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-[160px] w-full">
        <defs>
          <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7C5CFF" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#7C5CFF" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 1, 2, 3].map((g) => (
          <line key={g} x1={P} x2={W - P} y1={P + (g * (H - 2 * P)) / 3} y2={P + (g * (H - 2 * P)) / 3} stroke="rgba(0,0,0,0.06)" strokeDasharray="2 4" />
        ))}
        <path d={area} fill="url(#lineGrad)" />
        <path d={path} fill="none" stroke="#7C5CFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {xs.map((x, i) => (
          <circle key={i} cx={x} cy={ys[i]} r="3.5" fill="#fff" stroke="#7C5CFF" strokeWidth="2" />
        ))}
      </svg>
      <div className="mt-1 flex justify-between px-3 text-[10px] font-semibold text-black/45">
        {data.map((d) => <span key={d.x}>{d.x}</span>)}
      </div>
      <div className="mt-2 flex items-center gap-3 px-3 text-[10px] font-semibold text-black/55">
        <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ background: "#7C5CFF" }} /> Tickets (K)</span>
      </div>
    </div>
  );
}

function DonutChart({ data, total }) {
  const size = 150, stroke = 22, r = (size - stroke) / 2, c = 2 * Math.PI * r;
  let acc = 0;
  const sumPct = data.reduce((s, d) => s + d.pct, 0);
  return (
    <div className="flex items-center gap-4">
      <svg viewBox={`0 0 ${size} ${size}`} className="h-[150px] w-[150px] shrink-0 -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#FAFAF6" strokeWidth={stroke} />
        {data.map((d, i) => {
          const dash = (d.pct / sumPct) * c;
          const seg = (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={d.color}
              strokeWidth={stroke}
              strokeDasharray={`${dash} ${c - dash}`}
              strokeDashoffset={-acc}
              strokeLinecap="butt"
            />
          );
          acc += dash;
          return seg;
        })}
      </svg>
      <ul className="min-w-0 flex-1 space-y-1.5 text-[11px] font-semibold">
        {data.map((d) => (
          <li key={d.key} className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-2 truncate">
              <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: d.color }} />
              <span className="truncate text-black/65">{d.key}</span>
            </span>
            <span className="shrink-0 text-black/55">{d.value.toLocaleString()} <span className="text-black/40">({d.pct}%)</span></span>
          </li>
        ))}
        <li className="!mt-2 flex items-center justify-between border-t border-black/5 pt-2">
          <span className="text-black/55">Total</span>
          <span className="font-bold">{total.toLocaleString()}</span>
        </li>
      </ul>
    </div>
  );
}

function BarsChart({ data }) {
  const max = Math.max(...data.map((d) => d.value));
  return (
    <ul className="space-y-3">
      {data.map((d) => (
        <li key={d.key}>
          <div className="flex items-center justify-between text-[11px] font-semibold">
            <span className="text-black/65">{d.key}</span>
            <span className="text-black/55">{d.value.toLocaleString()} <span className="text-black/40">({d.pct}%)</span></span>
          </div>
          <div className="mt-1 h-2.5 w-full overflow-hidden rounded-full bg-[#FAFAF6]">
            <div className="h-full rounded-full" style={{ width: `${(d.value / max) * 100}%`, background: d.color }} />
          </div>
        </li>
      ))}
    </ul>
  );
}
