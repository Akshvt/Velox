import { useMemo, useState } from "react";
import AppShell from "@layouts/AppShell.jsx";
import {
  BarChart3,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Database,
  Download,
  FileText,
  Filter,
  HardDrive,
  ListChecks,
  MoreHorizontal,
  Play,
  Plus,
  Repeat,
  Search,
  Share2,
  X,
  Loader2,
} from "lucide-react";
import { useReports } from "@api/hooks/useReports";

/* ----------------------------- mock data ----------------------------- */
const SUMMARY = [
  { key: "total",     label: "Total Reports",    value: "42",     hint: "↑ 8 this month",   icon: FileText,    tone: "#F1ECFF", color: "#7C5CFF" },
  { key: "scheduled", label: "Scheduled Reports",value: "12",     hint: "25% of total",     icon: Calendar,    tone: "#E9F5E0", color: "#3FA02A" },
  { key: "runs",      label: "Reports Run",      value: "30",     hint: "↑ 12 this month",  icon: CheckCircle2,tone: "#FFF5DC", color: "#C28A00" },
  { key: "downloads", label: "Downloads",        value: "86",     hint: "↑ 18 this month",  icon: Download,    tone: "#FCE7F3", color: "#D63384" },
  { key: "lastRun",   label: "Last Run",         value: "May 20, 2025", hint: "08:30 AM",   icon: Clock,       tone: "#E9F5E0", color: "#3FA02A" },
  { key: "storage",   label: "Storage Used",     value: "2.4 GB", hint: "24% of 10 GB",     icon: HardDrive,   tone: "#F1ECFF", color: "#7C5CFF" },
];

const TYPES = ["All Types", "Performance", "Satisfaction", "Knowledge Base", "Customer", "SLA", "Export"];
const STATUSES = ["All Status", "Success", "Failed", "Running", "Scheduled"];
const CREATORS = ["Created By", "Admin User", "Sophia Lee", "David Brown"];

const STATUS_TONES = {
  Success:   { bg: "#E9F5E0", color: "#3FA02A" },
  Failed:    { bg: "#FCE7F3", color: "#D63384" },
  Running:   { bg: "#FFF5DC", color: "#C28A00" },
  Scheduled: { bg: "#F1ECFF", color: "#7C5CFF" },
};

const TYPE_ICONS = {
  Performance:      { icon: BarChart3, tone: "#F1ECFF", color: "#7C5CFF" },
  Satisfaction:     { icon: CheckCircle2, tone: "#E9F5E0", color: "#3FA02A" },
  "Knowledge Base": { icon: Database, tone: "#FFF5DC", color: "#C28A00" },
  Customer:         { icon: Share2,    tone: "#FCE7F3", color: "#D63384" },
  SLA:              { icon: Clock,     tone: "#E9F5E0", color: "#3FA02A" },
  Export:           { icon: Download,  tone: "#F1ECFF", color: "#7C5CFF" },
};



const RECENT_RUNS = [
  { date: "May 20, 2025 08:30 AM", status: "Success" },
  { date: "May 19, 2025 08:30 AM", status: "Success" },
  { date: "May 18, 2025 08:30 AM", status: "Success" },
];

/* ============================== page ============================== */
export default function Reports() {
  const [search, setSearch] = useState("");
  const [type, setType] = useState("All Types");
  const [status, setStatus] = useState("All Status");
  const [createdBy, setCreatedBy] = useState("Created By");
  const [rowsPerPage, setRowsPerPage] = useState("10");
  const [selectedId, setSelectedId] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const { data: fetchResult, isLoading } = useReports();
  const reports = fetchResult?.reports || [];

  const filtered = useMemo(() => {
    return reports.filter((r) => {
      if (type !== "All Types" && r.type !== type) return false;
      if (status !== "All Status" && r.status !== status) return false;
      if (createdBy !== "Created By" && r.createdBy !== createdBy) return false;
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        if (!r.name.toLowerCase().includes(q) && !r.desc.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [type, status, createdBy, search, reports]);

  const selected = reports.find((r) => r._id === selectedId) || reports[0];

  return (
    <AppShell
      active="reports"
      title="Reports"
      subtitle="Generate and manage reports to gain insights and track performance."
      actions={
        <button className="inline-flex items-center gap-2 rounded-full bg-black px-4 py-2 text-[12px] font-bold text-white transition-transform hover:-translate-y-0.5">
          <Plus size={13} strokeWidth={3} />
          New Report
        </button>
      }
    >
      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <SummaryCard label="Total Reports" value={reports.length} hint="Dynamic" icon={FileText} tone="#F1ECFF" color="#7C5CFF" />
        <SummaryCard label="Scheduled Reports" value={reports.filter(r => r.frequency !== "One-time").length} hint="Dynamic" icon={Calendar} tone="#E9F5E0" color="#3FA02A" />
        <SummaryCard label="Reports Run" value={reports.length} hint="Dynamic" icon={CheckCircle2} tone="#FFF5DC" color="#C28A00" />
        <SummaryCard label="Downloads" value={reports.length * 2} hint="Dynamic" icon={Download} tone="#FCE7F3" color="#D63384" />
        <SummaryCard label="Last Run" value={reports.length ? new Date(reports[0]?.createdAt).toLocaleDateString() : "N/A"} hint="Dynamic" icon={Clock} tone="#E9F5E0" color="#3FA02A" />
        <SummaryCard label="Storage Used" value="2.4 GB" hint="24% of 10 GB" icon={HardDrive} tone="#F1ECFF" color="#7C5CFF" />
      </div>

      {/* List card */}
      <Card className="mt-4">
        {/* Toolbar */}
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <label className="flex min-w-[220px] flex-1 items-center gap-2 rounded-full bg-[#FAFAF6] px-3 py-2 ring-1 ring-black/10">
            <Search size={13} strokeWidth={2.5} className="text-black/45" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search reports..."
              className="w-full bg-transparent text-[12px] font-medium placeholder:text-black/40 focus:outline-none"
            />
          </label>
          <SelectPill value={type}      onChange={setType}      options={TYPES} />
          <SelectPill value={status}    onChange={setStatus}    options={STATUSES} />
          <SelectPill value={createdBy} onChange={setCreatedBy} options={CREATORS} />
          <button className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-[12px] font-semibold ring-1 ring-black/15">
            <Calendar size={13} strokeWidth={2.5} className="text-black/55" />
            May 14, 2025 – May 20, 2025
            <ChevronDown size={12} strokeWidth={2.5} className="text-black/50" />
          </button>
          <button className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-[12px] font-bold ring-1 ring-black/15">
            <Filter size={13} strokeWidth={2.8} className="text-[#7C5CFF]" />
            Filters
            <ChevronDown size={12} strokeWidth={2.5} className="text-black/50" />
          </button>
        </div>

        {/* Table */}
        <div className="-mx-2 overflow-x-auto px-2">
          <table className="w-full min-w-[920px] text-left text-[12px]">
            <thead>
              <tr className="text-black/45">
                <Th>Report Name</Th>
                <Th>Type</Th>
                <Th>Description</Th>
                <Th>Created By</Th>
                <Th>Frequency</Th>
                <Th>Last Run</Th>
                <Th>Status</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-2 py-8 text-center text-[12px] font-medium text-black/45">
                    <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                  </td>
                </tr>
              ) : filtered.map((r) => {
                const TypeIcon = TYPE_ICONS[r.type]?.icon ?? FileText;
                const ti = TYPE_ICONS[r.type] ?? { tone: "#FAFAF6", color: "#5B5B57" };
                const sel = r._id === selectedId;
                return (
                  <tr
                    key={r._id}
                    onClick={() => { setSelectedId(r._id); setShowDetails(true); }}
                    className={`cursor-pointer border-t border-black/5 align-middle transition-colors ${
                      sel ? "bg-[#FAFAF6]" : "hover:bg-[#FAFAF6]"
                    }`}
                  >
                    <Td>
                      <span className="inline-flex items-center gap-2">
                        <span
                          className="flex h-7 w-7 items-center justify-center rounded-full"
                          style={{ background: ti.tone, color: ti.color }}
                        >
                          <TypeIcon size={12} strokeWidth={2.5} />
                        </span>
                        <span className="font-semibold">{r.name}</span>
                      </span>
                    </Td>
                    <Td className="font-medium text-black/65">{r.type}</Td>
                    <Td className="font-medium text-black/65 max-w-[280px] truncate">{r.desc}</Td>
                    <Td className="font-medium text-black/65">{r.createdBy}</Td>
                    <Td className="font-medium text-black/65">{r.frequency}</Td>
                    <Td className="font-medium text-black/55 whitespace-nowrap">{new Date(r.createdAt).toLocaleDateString()}</Td>
                    <Td><Pill tone={STATUS_TONES[r.status] || STATUS_TONES.Success}>{r.status}</Pill></Td>
                    <Td className="text-right">
                      <span className="inline-flex items-center gap-1">
                        <IconBtn aria-label="Run"><Play size={12} strokeWidth={2.5} /></IconBtn>
                        <IconBtn aria-label="Download"><Download size={12} strokeWidth={2.5} /></IconBtn>
                        <IconBtn aria-label="More"><MoreHorizontal size={13} strokeWidth={2.5} /></IconBtn>
                      </span>
                    </Td>
                  </tr>
                );
              })}
              {!isLoading && filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-2 py-8 text-center text-[12px] font-medium text-black/45">
                    No reports match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer pagination */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <div className="text-[11px] font-medium text-black/55">
            Showing 1 to {Math.min(filtered.length, parseInt(rowsPerPage, 10))} of {filtered.length} reports
          </div>
          <Pagination />
          <label className="inline-flex items-center gap-1 text-[11px] font-semibold text-black/55">
            Rows per page:
            <select
              value={rowsPerPage}
              onChange={(e) => setRowsPerPage(e.target.value)}
              className="appearance-none rounded-full bg-[#FAFAF6] px-3 py-1 pr-6 ring-1 ring-black/10 focus:outline-none"
            >
              {["10", "25", "50"].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </label>
        </div>
      </Card>

      {/* Details */}
      {showDetails && (
        <Card className="mt-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="font-display text-[13px] uppercase tracking-wide">Report Details</span>
            <button
              onClick={() => setShowDetails(false)}
              aria-label="Close details"
              className="flex h-7 w-7 items-center justify-center rounded-full bg-[#FAFAF6] hover:bg-white hover:ring-1 hover:ring-black/10"
            >
              <X size={13} strokeWidth={2.5} />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[260px_minmax(0,1fr)_300px]">
            {/* Meta */}
            <dl className="grid grid-cols-[110px_minmax(0,1fr)] gap-y-2.5 text-[12px]">
              <Meta label="Report Name">{selected?.name}</Meta>
              <Meta label="Type">{selected?.type}</Meta>
              <Meta label="Description">{selected?.desc}</Meta>
              <Meta label="Created By">{selected?.createdBy}</Meta>
              <Meta label="Created On">{selected?.createdAt ? new Date(selected.createdAt).toLocaleDateString() : ""}</Meta>
            </dl>

            {/* Schedule */}
            <dl className="grid grid-cols-[110px_minmax(0,1fr)] gap-y-2.5 text-[12px]">
              <Meta label="Frequency">{selected?.frequency}</Meta>
              <Meta label="Next Run">N/A</Meta>
              <Meta label="Last Run">{selected?.createdAt ? new Date(selected.createdAt).toLocaleDateString() : ""}</Meta>
              <Meta label="Status"><Pill tone={STATUS_TONES[selected?.status] || STATUS_TONES.Success}>{selected?.status}</Pill></Meta>
              <Meta label="File Format">PDF</Meta>
            </dl>

            {/* Recent runs */}
            <div>
              <div className="mb-2 text-[11px] font-bold uppercase tracking-wide text-black/55">Recent Runs</div>
              <ul className="flex flex-col gap-2">
                {RECENT_RUNS.map((run, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-2 rounded-[14px] bg-[#FAFAF6] px-3 py-2 ring-1 ring-black/10"
                  >
                    <span className="flex-1 text-[12px] font-semibold text-black/75">{run.date}</span>
                    <Pill tone={STATUS_TONES[run.status]}>{run.status}</Pill>
                    <button aria-label="Download" className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white ring-1 ring-black/10 hover:-translate-y-0.5 transition-transform">
                      <Download size={12} strokeWidth={2.5} />
                    </button>
                  </li>
                ))}
              </ul>
              <div className="mt-2 text-right">
                <button className="text-[11px] font-semibold text-[#7C5CFF] hover:underline">View all runs →</button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Reports workflow strip */}
      <Card className="mt-4">
        <div className="mb-3 font-display text-[12px] uppercase tracking-wide">Reports Workflow</div>
        <div className="flex flex-wrap items-stretch gap-3">
          {[
            { key: "create",   title: "Create Report",   desc: "Define metrics and filters",       icon: Plus,        tone: "#F1ECFF", color: "#7C5CFF" },
            { key: "schedule", title: "Schedule",        desc: "Set frequency and recipients",     icon: Calendar,    tone: "#E9F5E0", color: "#3FA02A" },
            { key: "run",      title: "Run",             desc: "Generate report on demand or auto", icon: Play,        tone: "#FFF5DC", color: "#C28A00" },
            { key: "review",   title: "Review",          desc: "Inspect data and trends",           icon: ListChecks,  tone: "#FCE7F3", color: "#D63384" },
            { key: "export",   title: "Export",          desc: "Download as PDF, CSV, or XLSX",     icon: Download,    tone: "#E9F5E0", color: "#3FA02A" },
            { key: "share",    title: "Share / Repeat",  desc: "Share with team and re-run",        icon: Repeat,      tone: "#F1ECFF", color: "#7C5CFF" },
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
function SummaryCard({ label, value, hint, icon: Icon, tone, color }) {
  return (
    <div className="rounded-[28px] bg-white p-4 shadow-[0_2px_0_rgba(0,0,0,0.03)] ring-1 ring-black/15">
      <div className="flex items-start gap-3">
        <span
          className="flex h-10 w-10 items-center justify-center rounded-full ring-1 ring-black/5"
          style={{ background: tone, color }}
        >
          <Icon size={16} strokeWidth={2.5} />
        </span>
        <div className="min-w-0">
          <div className="text-[11px] font-semibold text-black/55">{label}</div>
          <div className="mt-1 font-display text-[22px] leading-none tracking-tight">{value}</div>
          <div className="mt-1.5 text-[10px] font-medium text-black/45">{hint}</div>
        </div>
      </div>
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

function Pill({ tone, children }) {
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
      style={{ background: tone.bg, color: tone.color }}
    >
      {children}
    </span>
  );
}

function Th({ children, className = "" }) {
  return <th className={`px-2 pb-2 text-[10px] font-bold uppercase tracking-wide ${className}`}>{children}</th>;
}
function Td({ children, className = "" }) {
  return <td className={`px-2 py-2.5 ${className}`}>{children}</td>;
}

function IconBtn({ children, ...rest }) {
  return (
    <button
      {...rest}
      onClick={(e) => { e.stopPropagation(); rest.onClick?.(e); }}
      className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#FAFAF6] hover:bg-white hover:ring-1 hover:ring-black/10"
    >
      {children}
    </button>
  );
}

function SelectPill({ value, onChange, options }) {
  return (
    <label className="inline-flex items-center gap-1 rounded-full bg-[#FAFAF6] px-3 py-2 text-[11px] font-semibold ring-1 ring-black/10">
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

function Meta({ label, children }) {
  return (
    <>
      <dt className="text-[11px] font-semibold text-black/45">{label}</dt>
      <dd className="text-[12px] font-semibold text-black/75">{children}</dd>
    </>
  );
}

function Pagination() {
  const pages = ["1", "2", "3", "…", "5"];
  const [active, setActive] = useState("1");
  return (
    <div className="inline-flex items-center gap-1">
      <button className="flex h-7 w-7 items-center justify-center rounded-full bg-[#FAFAF6] text-black/55 hover:bg-white hover:ring-1 hover:ring-black/10">
        <ChevronLeft size={12} strokeWidth={2.5} />
      </button>
      {pages.map((p) => {
        const sel = p === active;
        return (
          <button
            key={p}
            onClick={() => p !== "…" && setActive(p)}
            disabled={p === "…"}
            className={`min-w-7 rounded-full px-2 py-1 text-[11px] font-bold ${
              sel ? "bg-black text-white" : "text-black/55 hover:bg-[#FAFAF6]"
            }`}
          >
            {p}
          </button>
        );
      })}
      <button className="flex h-7 w-7 items-center justify-center rounded-full bg-[#FAFAF6] text-black/55 hover:bg-white hover:ring-1 hover:ring-black/10">
        <ChevronRight size={12} strokeWidth={2.5} />
      </button>
    </div>
  );
}
