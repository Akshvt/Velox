import { useMemo, useState } from "react";
import AppShell from "@layouts/AppShell.jsx";
import {
  useAnalyticsOverview,
  useTicketsTrend,
  useAgentPerformance,
  useCategories
} from "@api/hooks/useAnalytics";
import {
  Activity,
  Calendar,
  ChevronDown,
  ChevronRight,
  Clock,
  Download,
  Filter,
  Inbox,
  LineChart as LineChartIcon,
  ListChecks,
  Search,
  Smile,
  Target,
  Ticket,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

/* ----------------------------- constants ----------------------------- */
const DEFAULT_KPIS = [
  { key: "total",    label: "Total Tickets",         value: "0", delta: "", up: true,  hint: "from selected range", icon: Inbox,    tone: "#F1ECFF", iconColor: "#7C5CFF" },
  { key: "open",     label: "Open Tickets",          value: "0", delta: "", up: true,  hint: "from selected range", icon: Ticket,   tone: "#FFF5DC", iconColor: "#C28A00" },
  { key: "resolved", label: "Resolved Tickets",      value: "0", delta: "", up: true,  hint: "from selected range", icon: Smile,    tone: "#E9F5E0", iconColor: "#3FA02A" },
  { key: "resp",     label: "Avg. Resolution Time",  value: "0m", delta: "", up: false, hint: "from selected range", icon: Clock,    tone: "#FCE7F3", iconColor: "#D63384" },
  { key: "csat",     label: "Customer Satisfaction", value: "N/A", delta: "", up: true,  hint: "from selected range", icon: Activity, tone: "#E9F5E0", iconColor: "#3FA02A" },
];

const FRT_BUCKETS = [
  { label: "< 30m",   pct: 38 },
  { label: "30m - 1h", pct: 27 },
  { label: "1h - 2h",  pct: 19 },
  { label: "2h - 6h",  pct: 11 },
  { label: "> 6h",     pct:  5 },
];

/* ============================== page ============================== */
export default function Analytics() {
  const [chartRange, setChartRange] = useState("Daily");
  const { data: overview } = useAnalyticsOverview();
  const { data: trends } = useTicketsTrend();
  const { data: agentsData } = useAgentPerformance();
  const { data: categoriesData } = useCategories();

  const liveKpis = useMemo(() => {
    if (!overview) return DEFAULT_KPIS;
    const fmt = (n) => (typeof n === "number" ? n.toLocaleString() : n ?? "-");
    return [
      { ...DEFAULT_KPIS[0], value: fmt(overview.total) },
      { ...DEFAULT_KPIS[1], value: fmt(overview.open) },
      { ...DEFAULT_KPIS[2], value: fmt(overview.resolved) },
      { ...DEFAULT_KPIS[3], value: overview.avgResolutionFormatted || "-" },
      { ...DEFAULT_KPIS[4], value: overview.csat !== "N/A" ? `${overview.csat} / 5` : "N/A" },
    ];
  }, [overview]);

  const liveTimeSeries = useMemo(() => {
    const list = trends?.trends || [];
    if (!list.length) return [{ x: "No Data", y: 0 }];
    return list.slice(-14).map((t) => ({
      x: new Date(t.date).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      y: t.count,
    }));
  }, [trends]);

  const liveAgentPerf = useMemo(() => {
    const list = agentsData?.agents || [];
    return list.slice(0, 6).map((a) => {
      const initials = (a.name || a.email || "??").split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
      return {
        name: a.name || a.email,
        initials,
        tone: "#E9F5E0",
        color: "#3FA02A",
        resolved: a.resolved || 0,
        avgResp: a.total ? `${a.resolved}/${a.total}` : "-",
        csat: "-",
      };
    });
  }, [agentsData]);

  const liveStatusData = useMemo(() => {
    if (!overview) return [];
    const total = overview.total || 1;
    return [
      { key: "Open", value: overview.open || 0, pct: Math.round(((overview.open || 0) / total) * 100), color: "#3FA02A" },
      { key: "Resolved", value: overview.resolved || 0, pct: Math.round(((overview.resolved || 0) / total) * 100), color: "#D63384" },
      { key: "Closed", value: overview.closed || 0, pct: Math.round(((overview.closed || 0) / total) * 100), color: "#7C5CFF" },
    ].filter(d => d.value > 0);
  }, [overview]);

  const liveChannels = useMemo(() => {
    // We mock channel logic as channel breakdown doesn't strictly exist on tickets, we map categories to channels
    const total = categoriesData?.total || 1;
    const cats = categoriesData?.categories || [];
    return cats.slice(0, 4).map((c, i) => {
      const colors = ["#7C5CFF", "#3FA02A", "#C28A00", "#D63384"];
      return {
        key: c._id || "Other",
        value: c.count,
        pct: Math.round((c.count / total) * 100),
        color: colors[i % colors.length]
      };
    });
  }, [categoriesData]);

  const liveTopIssues = useMemo(() => {
    const total = categoriesData?.total || 1;
    const cats = categoriesData?.categories || [];
    return cats.slice(0, 5).map((c) => ({
      issue: c._id || "Other",
      tickets: c.count,
      pct: Math.round((c.count / total) * 100)
    }));
  }, [categoriesData]);

  const liveSla = useMemo(() => {
    if (!overview || !overview.sla) return { met: 0, breached: 0 };
    return overview.sla;
  }, [overview]);

  const livePerfSeries = useMemo(() => {
    const list = trends?.trends || [];
    if (!list.length) return { labels: ["No Data"], lines: [] };
    const labels = list.slice(-7).map((t) => new Date(t.date).toLocaleDateString(undefined, { month: "short", day: "numeric" }));
    return {
      labels,
      lines: [
        { key: "Tickets Opened", color: "#7C5CFF", dash: "0", data: list.slice(-7).map(t => t.count) }
      ]
    };
  }, [trends]);

  return (
    <AppShell
      active="analytics"
      title="Analytics Overview"
      subtitle="Track performance metrics and gain insights into your support operations."
      actions={
        <>
          <button className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-[12px] font-semibold ring-1 ring-black/15">
            <Calendar size={13} strokeWidth={2.5} className="text-black/55" />
            May 14 – May 20, 2025
            <ChevronDown size={12} strokeWidth={2.5} className="text-black/50" />
          </button>
          <button className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-[12px] font-bold ring-1 ring-black/15 transition-transform hover:-translate-y-0.5">
            <Filter size={13} strokeWidth={2.8} className="text-[#7C5CFF]" />
            Filters
            <ChevronDown size={12} strokeWidth={2.5} className="text-black/50" />
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

      {/* charts row 1: trends / status / channels */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader
            title="Tickets Over Time"
            right={<RangePill value={chartRange} onChange={setChartRange} options={["Daily", "Weekly", "Monthly"]} />}
          />
          <LineChart data={liveTimeSeries} />
        </Card>
        <Card>
          <CardHeader title="Tickets by Status" />
          <DonutChart data={liveStatusData.length ? liveStatusData : [{ key: "No Data", value: 1, pct: 100, color: "#e5e7eb" }]} total={overview?.total || 0} />
        </Card>
        <Card>
          <CardHeader title="Tickets by Channel" />
          <BarsChart data={liveChannels} />
        </Card>
      </div>

      {/* charts row 2: performance over time + top issues */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_380px]">
        <Card>
          <CardHeader
            title="Performance Over Time"
            right={
              <div className="flex flex-wrap items-center gap-3 text-[10px] font-semibold text-black/55">
                {livePerfSeries.lines.map((l) => (
                  <span key={l.key} className="inline-flex items-center gap-1.5">
                    <span
                      className="inline-block h-[3px] w-5 rounded-full"
                      style={{
                        background: l.color,
                        backgroundImage: l.dash !== "0"
                          ? `repeating-linear-gradient(90deg, ${l.color} 0 6px, transparent 6px 10px)`
                          : undefined,
                      }}
                    />
                    {l.key}
                  </span>
                ))}
              </div>
            }
          />
          <MultiLineChart series={livePerfSeries} />
        </Card>

        <Card>
          <CardHeader title="Top Issues" />
          <table className="w-full text-left text-[12px]">
            <thead>
              <tr className="text-black/45">
                <Th>Issue</Th>
                <Th className="text-right">Tickets</Th>
                <Th className="text-right">% of Total</Th>
              </tr>
            </thead>
            <tbody>
              {liveTopIssues.length === 0 && (
                <tr><td colSpan="3" className="py-4 text-center text-black/50">No data found</td></tr>
              )}
              {liveTopIssues.map((t) => (
                <tr key={t.issue} className="border-t border-black/5 align-middle">
                  <Td className="font-semibold capitalize">{t.issue}</Td>
                  <Td className="text-right font-semibold text-black/70">{t.tickets.toLocaleString()}</Td>
                  <Td className="text-right font-medium text-black/55">{t.pct}%</Td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-3 text-right">
            <TextLink>View all issues →</TextLink>
          </div>
        </Card>
      </div>

      {/* row 3: agent perf / SLA / FRT distribution */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader title="Agent Performance Summary" />
          <table className="w-full text-left text-[12px]">
            <thead>
              <tr className="text-black/45">
                <Th>Agent</Th>
                <Th className="text-right">Resolved</Th>
                <Th className="text-right">Avg. Resp.</Th>
                <Th className="text-right">CSAT</Th>
              </tr>
            </thead>
            <tbody>
              {liveAgentPerf.length === 0 && (
                 <tr><td colSpan="4" className="py-4 text-center text-black/50">No data found</td></tr>
              )}
              {liveAgentPerf.map((a) => (
                <tr key={a.name} className="border-t border-black/5 align-middle">
                  <Td>
                    <span className="inline-flex items-center gap-2">
                      <span
                        className="flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold"
                        style={{ background: a.tone, color: a.color }}
                      >
                        {a.initials}
                      </span>
                      <span className="font-semibold">{a.name}</span>
                    </span>
                  </Td>
                  <Td className="text-right font-semibold text-black/70">{a.resolved}</Td>
                  <Td className="text-right font-medium text-black/65">{a.avgResp}</Td>
                  <Td className="text-right font-medium text-black/65">{a.csat}</Td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-3 text-right">
            <TextLink>View full report →</TextLink>
          </div>
        </Card>

        <Card>
          <CardHeader title="SLA Compliance" />
          <SlaDonut met={liveSla.met} breached={liveSla.breached} />
          <div className="mt-3 text-right">
            <TextLink>View SLA Report →</TextLink>
          </div>
        </Card>

        <Card>
          <CardHeader title="First Response Time Distribution" />
          <Histogram data={FRT_BUCKETS} />
        </Card>
      </div>

      {/* Analytics workflow strip */}
      <Card className="mt-4">
        <div className="mb-3 font-display text-[12px] uppercase tracking-wide">Analytics Workflow</div>
        <div className="flex flex-wrap items-stretch gap-3">
          {[
            { key: "select",  title: "Select Range",   desc: "Pick a date range and filters",       icon: Calendar,      tone: "#F1ECFF", color: "#7C5CFF" },
            { key: "kpis",    title: "Review KPIs",    desc: "Scan headline support metrics",       icon: Target,        tone: "#E9F5E0", color: "#3FA02A" },
            { key: "trends",  title: "Spot Trends",    desc: "Read charts for volume & response",   icon: LineChartIcon, tone: "#FFF5DC", color: "#C28A00" },
            { key: "drill",   title: "Drill Down",     desc: "Inspect issues, agents, and SLA",     icon: Search,        tone: "#FCE7F3", color: "#D63384" },
            { key: "act",     title: "Take Action",    desc: "Assign work and improve coverage",    icon: ListChecks,    tone: "#E9F5E0", color: "#3FA02A" },
            { key: "share",   title: "Share / Export", desc: "Export reports for stakeholders",     icon: Download,      tone: "#F1ECFF", color: "#7C5CFF" },
          ].map((w, i, arr) => {
            const Icon = w.icon;
            return (
              <div key={w.key} className="flex flex-1 min-w-[160px] items-center gap-3">
                <div className="flex flex-1 items-start gap-2.5 rounded-[18px] bg-[#FAFAF6] p-3 ring-1 ring-black/10">
                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                    style={{ background: w.tone, color: w.color }}
                  >
                    <Icon size={14} strokeWidth={2.5} />
                  </span>
                  <div className="min-w-0 leading-tight">
                    <div className="truncate text-[12px] font-bold">{w.title}</div>
                    <div className="mt-0.5 text-[10px] font-medium text-black/55">{w.desc}</div>
                  </div>
                </div>
                {i < arr.length - 1 && (
                  <ChevronRight size={14} strokeWidth={2.5} className="hidden shrink-0 text-black/35 sm:block" />
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </AppShell>
  );
}

/* ============================== bits ============================== */
function KpiCard({ label, value, delta, up, hint, icon: Icon, tone, iconColor }) {
  const trendBg = up ? "#E9F5E0" : "#FCE7F3";
  const trendColor = up ? "#3FA02A" : "#D63384";
  const Trend = up ? TrendingUp : TrendingDown;
  return (
    <div className="rounded-[28px] bg-white p-4 shadow-[0_2px_0_rgba(0,0,0,0.03)] ring-1 ring-black/15">
      <div className="flex items-start justify-between">
        <span
          className="flex h-10 w-10 items-center justify-center rounded-full ring-1 ring-black/5"
          style={{ background: tone, color: iconColor }}
        >
          <Icon size={16} strokeWidth={2.5} />
        </span>
        <span
          className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold"
          style={{ background: trendBg, color: trendColor }}
        >
          <Trend size={10} strokeWidth={3} />
          {delta}
        </span>
      </div>
      <div className="mt-3 font-display text-[26px] leading-none tracking-tight">{value}</div>
      <div className="mt-1.5 text-[11px] font-semibold text-black/55">{label}</div>
      <div className="mt-1 text-[10px] font-medium text-black/40">{hint}</div>
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
    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
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
    <button className="text-[11px] font-semibold text-[#7C5CFF] hover:underline">
      {children}
    </button>
  );
}

function Th({ children, className = "" }) {
  return <th className={`px-2 pb-2 text-[10px] font-bold uppercase tracking-wide ${className}`}>{children}</th>;
}
function Td({ children, className = "" }) {
  return <td className={`px-2 py-2 ${className}`}>{children}</td>;
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
          <linearGradient id="aLineGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7C5CFF" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#7C5CFF" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 1, 2, 3].map((g) => (
          <line key={g} x1={P} x2={W - P} y1={P + (g * (H - 2 * P)) / 3} y2={P + (g * (H - 2 * P)) / 3} stroke="rgba(0,0,0,0.06)" strokeDasharray="2 4" />
        ))}
        <path d={area} fill="url(#aLineGrad)" />
        <path d={path} fill="none" stroke="#7C5CFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {xs.map((x, i) => (
          <circle key={i} cx={x} cy={ys[i]} r="3.5" fill="#fff" stroke="#7C5CFF" strokeWidth="2" />
        ))}
      </svg>
      <div className="mt-1 flex justify-between px-3 text-[10px] font-semibold text-black/45">
        {data.map((d) => <span key={d.x}>{d.x}</span>)}
      </div>
    </div>
  );
}

function MultiLineChart({ series }) {
  const W = 600, H = 220, P = 28;
  const { labels, lines } = series;
  const all = lines.flatMap((l) => l.data);
  const max = Math.max(...all) * 1.1;
  const xs = labels.map((_, i) => P + (i * (W - 2 * P)) / (labels.length - 1));

  return (
    <div className="-mx-1">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-[220px] w-full">
        {[0, 1, 2, 3, 4].map((g) => (
          <line
            key={g}
            x1={P}
            x2={W - P}
            y1={P + (g * (H - 2 * P)) / 4}
            y2={P + (g * (H - 2 * P)) / 4}
            stroke="rgba(0,0,0,0.06)"
            strokeDasharray="2 4"
          />
        ))}
        {lines.map((l) => {
          const ys = l.data.map((v) => H - P - (v / max) * (H - 2 * P));
          const path = xs.map((x, i) => `${i === 0 ? "M" : "L"} ${x} ${ys[i]}`).join(" ");
          return (
            <g key={l.key}>
              <path
                d={path}
                fill="none"
                stroke={l.color}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray={l.dash}
              />
              {xs.map((x, i) => (
                <circle key={i} cx={x} cy={ys[i]} r="2.5" fill="#fff" stroke={l.color} strokeWidth="1.5" />
              ))}
            </g>
          );
        })}
      </svg>
      <div className="mt-1 flex justify-between px-3 text-[10px] font-semibold text-black/45">
        {labels.map((d) => <span key={d}>{d}</span>)}
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
            <span className="shrink-0 text-black/55">
              {d.value.toLocaleString()} <span className="text-black/40">({d.pct}%)</span>
            </span>
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

function SlaDonut({ met, breached }) {
  const total = (met + breached) || 1;
  const pctMet = (met / total) * 100;
  const pctBreached = 100 - pctMet;
  const size = 160, stroke = 24, r = (size - stroke) / 2, c = 2 * Math.PI * r;
  const dashMet = (pctMet / 100) * c;
  const dashBreached = (pctBreached / 100) * c;
  return (
    <div className="flex items-center gap-4">
      <div className="relative h-[160px] w-[160px] shrink-0">
        <svg viewBox={`0 0 ${size} ${size}`} className="h-full w-full -rotate-90">
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#FAFAF6" strokeWidth={stroke} />
          <circle
            cx={size / 2} cy={size / 2} r={r}
            fill="none" stroke="#3FA02A" strokeWidth={stroke}
            strokeDasharray={`${dashMet} ${c - dashMet}`} strokeDashoffset={0}
          />
          <circle
            cx={size / 2} cy={size / 2} r={r}
            fill="none" stroke="#D63384" strokeWidth={stroke}
            strokeDasharray={`${dashBreached} ${c - dashBreached}`} strokeDashoffset={-dashMet}
          />
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-[22px] leading-none">{Math.round(pctMet)}%</span>
          <span className="mt-1 text-[10px] font-semibold text-black/55">SLA Met</span>
        </div>
      </div>
      <ul className="min-w-0 flex-1 space-y-2 text-[11px] font-semibold">
        <li className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-2 truncate">
            <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: "#3FA02A" }} />
            <span className="truncate text-black/65">Met</span>
          </span>
          <span className="shrink-0 text-black/55">
            {met.toLocaleString()} <span className="text-black/40">({Math.round(pctMet)}%)</span>
          </span>
        </li>
        <li className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-2 truncate">
            <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: "#D63384" }} />
            <span className="truncate text-black/65">Breached</span>
          </span>
          <span className="shrink-0 text-black/55">
            {breached.toLocaleString()} <span className="text-black/40">({Math.round(pctBreached)}%)</span>
          </span>
        </li>
      </ul>
    </div>
  );
}

function BarsChart({ data }) {
  if (!data.length) return <p className="py-4 text-center text-[11px] text-black/50">No data found</p>;
  const max = Math.max(...data.map((d) => d.value)) || 1;
  return (
    <ul className="space-y-3">
      {data.map((d) => (
        <li key={d.key}>
          <div className="flex items-center justify-between text-[11px] font-semibold">
            <span className="text-black/65">{d.key}</span>
            <span className="text-black/55">
              {d.value.toLocaleString()} <span className="text-black/40">({d.pct}%)</span>
            </span>
          </div>
          <div className="mt-1 h-2.5 w-full overflow-hidden rounded-full bg-[#FAFAF6]">
            <div className="h-full rounded-full" style={{ width: `${(d.value / max) * 100}%`, background: d.color }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

function Histogram({ data }) {
  const max = Math.max(...data.map((d) => d.pct));
  return (
    <div>
      <div className="flex h-[160px] items-end gap-3 px-1">
        {data.map((d) => (
          <div key={d.label} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
            <span className="text-[10px] font-bold text-black/55">{d.pct}%</span>
            <div
              className="w-full rounded-t-[10px]"
              style={{
                height: `${(d.pct / max) * 90}%`,
                background: "linear-gradient(180deg, #7C5CFF 0%, #B8A6FF 100%)",
              }}
            />
          </div>
        ))}
      </div>
      <div className="mt-2 flex gap-3 px-1">
        {data.map((d) => (
          <span key={d.label} className="flex-1 text-center text-[10px] font-semibold text-black/55">
            {d.label}
          </span>
        ))}
      </div>
    </div>
  );
}
