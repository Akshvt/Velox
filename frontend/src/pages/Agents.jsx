import { useMemo, useState } from "react";
import AppShell from "@layouts/AppShell.jsx";
import { useAgents, useInviteAgent, useUpdateAgent } from "@api/hooks/useAgents";
import {
  Activity,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  Filter,
  LayoutGrid,
  List,
  Mail,
  MoreHorizontal,
  Pencil,
  Plus,
  Power,
  Search,
  Shield,
  ShieldCheck,
  Star,
  UserCog,
  UserPlus,
  UserX,
  Users,
  X,
  Loader2,
} from "lucide-react";

/* ----------------------------- mock data ----------------------------- */
const SUMMARY = [
  { key: "total",   label: "Total Agents",   value: "24", hint: "↑ 4 this month",  icon: Users,        tone: "#F1ECFF", color: "#7C5CFF" },
  { key: "active",  label: "Active Agents",  value: "20", hint: "83% of total",    icon: ShieldCheck,  tone: "#E9F5E0", color: "#3FA02A" },
  { key: "offline", label: "Offline Agents", value: "4",  hint: "17% of total",    icon: UserX,        tone: "#FCE7F3", color: "#D63384" },
  { key: "roles",   label: "Roles",          value: "5",  hint: "Admin, Agent, etc.", icon: Shield,    tone: "#FFF5DC", color: "#C28A00" },
];

const ROLES   = ["All Roles", "Agent", "Supervisor", "Trainee"];
const STATUSES = ["All Status", "Online", "Offline", "On Break", "Deactivated"];
const SORTS   = ["Sort: Newest", "Sort: Oldest", "Sort: Name A–Z", "Sort: Name Z–A"];

const STATUS_TONES = {
  Online:      { bg: "#E9F5E0", color: "#3FA02A", dot: "#3FA02A" },
  Offline:     { bg: "#EDEDEA", color: "#5B5B57", dot: "#9A9A93" },
  "On Break":  { bg: "#FFF5DC", color: "#C28A00", dot: "#C28A00" },
  Deactivated: { bg: "#FCE7F3", color: "#D63384", dot: "#D63384" },
};

const ROLE_TONES = {
  Admin:      { bg: "#F1ECFF", color: "#7C5CFF" },
  Agent:      { bg: "#E9F5E0", color: "#3FA02A" },
  Supervisor: { bg: "#FFF5DC", color: "#C28A00" },
  Trainee:    { bg: "#FCE7F3", color: "#D63384" },
};

const WORKFLOW = [
  { key: "add",        title: "Add Agent",  desc: "Create new agent and assign role", icon: UserPlus, tone: "#F1ECFF", color: "#7C5CFF" },
  { key: "role",       title: "Assign Role",desc: "Set permissions for the agent",    icon: Shield,   tone: "#E9F5E0", color: "#3FA02A" },
  { key: "activate",   title: "Activate",   desc: "Enable agent access",              icon: Power,    tone: "#FFF5DC", color: "#C28A00" },
  { key: "monitor",    title: "Monitor",    desc: "Track performance and tickets",    icon: Activity, tone: "#FCE7F3", color: "#D63384" },
  { key: "update",     title: "Update",     desc: "Edit details or permissions",      icon: Pencil,   tone: "#E9F5E0", color: "#3FA02A" },
  { key: "deactivate", title: "Deactivate", desc: "Disable access if needed",         icon: UserX,    tone: "#F1ECFF", color: "#7C5CFF" },
];

/* ============================== page ============================== */
const ROLE_LABEL = { admin: "Admin", agent: "Agent", viewer: "Trainee" };

function adaptAgent(u) {
  const role = ROLE_LABEL[u.role] || "Agent";
  const name = u.name || u.email?.split("@")[0] || "Agent";
  return {
    id:          u._id || u.id,
    name,
    email:       u.email || "",
    role,
    status:      u.isActive === false ? "Deactivated" : "Online",
    handled:     u.metrics?.handled  ?? 0,
    resolved:    u.metrics?.resolved ?? 0,
    avg:         u.metrics?.avg      ?? "-",
    lastActive:  u.lastActiveAt
      ? new Date(u.lastActiveAt).toLocaleString()
      : u.updatedAt
      ? new Date(u.updatedAt).toLocaleDateString()
      : "-",
    joined:      u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "-",
    firstResp:   u.metrics?.firstResp ?? "-",
    rating:      u.metrics?.rating    ?? 0,
    raw:         u,
  };
}

export default function Agents() {
  const { data: agentsData, isLoading } = useAgents();
  const inviteMutation = useInviteAgent();
  const updateMutation = useUpdateAgent();

  const allAgents = useMemo(() => {
    const list = agentsData?.users || agentsData?.data || agentsData || [];
    return Array.isArray(list)
      ? list.map(adaptAgent).filter((agent) => agent.raw?.role === "agent" || agent.raw?.role === "viewer")
      : [];
  }, [agentsData]);

  const [search, setSearch] = useState("");
  const [role, setRole] = useState("All Roles");
  const [status, setStatus] = useState("All Status");
  const [sort, setSort] = useState("Sort: Newest");
  const [view, setView] = useState("rows");
  const [rowsPerPage, setRowsPerPage] = useState("10");
  const [selectedId, setSelectedId] = useState(null);
  const [showDetails, setShowDetails] = useState(true);

  const liveSummary = useMemo(() => {
    const total = allAgents.length;
    const active = allAgents.filter(a => a.status === "Online").length;
    const deactivated = allAgents.filter(a => a.status === "Deactivated").length;
    
    return [
      { key: "total",   label: "Total Agents",   value: total.toString(), hint: "Current",  icon: Users,        tone: "#F1ECFF", color: "#7C5CFF" },
      { key: "active",  label: "Active Agents",  value: active.toString(), hint: total ? `${Math.round((active/total)*100)}% of total` : "",    icon: ShieldCheck,  tone: "#E9F5E0", color: "#3FA02A" },
      { key: "offline", label: "Deactivated", value: deactivated.toString(),  hint: total ? `${Math.round((deactivated/total)*100)}% of total` : "",    icon: UserX,        tone: "#FCE7F3", color: "#D63384" },
      { key: "roles",   label: "Roles",          value: "3",  hint: "Admin, Agent, Trainee", icon: Shield,    tone: "#FFF5DC", color: "#C28A00" },
    ];
  }, [allAgents]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = allAgents.filter((a) => {
      if (role !== "All Roles" && a.role !== role) return false;
      if (status !== "All Status" && a.status !== status) return false;
      if (q && !a.name.toLowerCase().includes(q) && !a.email.toLowerCase().includes(q) && !a.role.toLowerCase().includes(q)) return false;
      return true;
    });
    if (sort === "Sort: Name A–Z") list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    if (sort === "Sort: Name Z–A") list = [...list].sort((a, b) => b.name.localeCompare(a.name));
    if (sort === "Sort: Oldest")    list = [...list].reverse();
    return list;
  }, [allAgents, role, status, search, sort]);

  const selected =
    allAgents.find((a) => a.id === selectedId) ||
    allAgents[0] || {
      id: null, name: "No agents yet", email: "-", role: "Agent", status: "Offline",
      handled: 0, resolved: 0, avg: "-", lastActive: "-", joined: "-", firstResp: "-", rating: 0,
    };

  const handleInvite = async () => {
    const name = window.prompt("Full name");
    if (!name) return;
    const email = window.prompt("Email");
    if (!email) return;
    const password = window.prompt("Temporary password (min 8 chars)");
    if (!password) return;
    const roleInput = (window.prompt("Role: admin | agent | viewer", "agent") || "agent").toLowerCase();
    try {
      await inviteMutation.mutateAsync({ name, email, password, role: roleInput });
    } catch (err) {
      window.alert(`Invite failed: ${err?.message || "unknown error"}`);
    }
  };

  const handleToggleActive = (a) => {
    if (!a.id) return;
    updateMutation.mutate({ id: a.id, isActive: a.status === "Deactivated" });
  };

  return (
    <AppShell
      active="agents"
      title="Agents"
      subtitle="Manage your support agents, roles, and permissions."
      actions={
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-[12px] font-bold ring-1 ring-black/15">
            <Filter size={13} strokeWidth={2.8} className="text-[#7C5CFF]" />
            Filters
            <ChevronDown size={12} strokeWidth={2.5} className="text-black/50" />
          </button>
          <button onClick={handleInvite} disabled={inviteMutation.isPending} className="inline-flex items-center gap-2 rounded-full bg-black px-4 py-2 text-[12px] font-bold text-white transition-transform hover:-translate-y-0.5 disabled:opacity-50">
            <Plus size={13} strokeWidth={3} />
            {inviteMutation.isPending ? "Inviting…" : "Add Agent"}
          </button>
        </div>
      }
    >
      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {liveSummary.map((s) => <SummaryCard key={s.key} {...s} />)}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        {/* List card */}
        <Card>
          {/* Toolbar */}
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <label className="flex min-w-[220px] flex-1 items-center gap-2 rounded-full bg-[#FAFAF6] px-3 py-2 ring-1 ring-black/10">
              <Search size={13} strokeWidth={2.5} className="text-black/45" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search agents by name, email, or role..."
                className="w-full bg-transparent text-[12px] font-medium placeholder:text-black/40 focus:outline-none"
              />
            </label>
            <SelectPill value={role}   onChange={setRole}   options={ROLES} />
            <SelectPill value={status} onChange={setStatus} options={STATUSES} />
            <SelectPill value={sort}   onChange={setSort}   options={SORTS} />
            <div className="inline-flex items-center gap-0.5 rounded-full bg-[#FAFAF6] p-1 ring-1 ring-black/10">
              <button
                onClick={() => setView("rows")}
                aria-label="Row view"
                className={`flex h-7 w-7 items-center justify-center rounded-full ${view === "rows" ? "bg-white ring-1 ring-black/15" : "text-black/55"}`}
              >
                <List size={13} strokeWidth={2.5} />
              </button>
              <button
                onClick={() => setView("grid")}
                aria-label="Grid view"
                className={`flex h-7 w-7 items-center justify-center rounded-full ${view === "grid" ? "bg-white ring-1 ring-black/15" : "text-black/55"}`}
              >
                <LayoutGrid size={13} strokeWidth={2.5} />
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="-mx-2 overflow-x-auto px-2">
            <table className="w-full min-w-[920px] text-left text-[12px]">
              <thead>
                <tr className="text-black/45">
                  <Th>Agent</Th>
                  <Th>Role</Th>
                  <Th>Status</Th>
                  <Th>Tickets Handled</Th>
                  <Th>Resolved</Th>
                  <Th>Avg. Response Time</Th>
                  <Th>Last Active</Th>
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
                ) : filtered.map((a) => {
                  const sel = a.id === selectedId;
                  const st = STATUS_TONES[a.status] || STATUS_TONES.Offline;
                  return (
                    <tr
                      key={a.id}
                      onClick={() => { setSelectedId(a.id); setShowDetails(true); }}
                      className={`cursor-pointer border-t border-black/5 align-middle transition-colors ${sel ? "bg-[#FAFAF6]" : "hover:bg-[#FAFAF6]"}`}
                    >
                      <Td>
                        <span className="inline-flex items-center gap-2.5">
                          <Avatar name={a.name} />
                          <span className="min-w-0">
                            <div className="font-semibold">{a.name}</div>
                            <div className="text-[10px] font-medium text-black/45 truncate">{a.email}</div>
                          </span>
                        </span>
                      </Td>
                      <Td><RolePill role={a.role} /></Td>
                      <Td>
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold" style={{ color: st.color }}>
                          <span className="h-1.5 w-1.5 rounded-full" style={{ background: st.dot }} />
                          {a.status}
                        </span>
                      </Td>
                      <Td className="font-semibold text-black/75">{a.handled}</Td>
                      <Td className="font-semibold text-black/75">{a.resolved}</Td>
                      <Td className="font-medium text-black/65 whitespace-nowrap">{a.avg}</Td>
                      <Td className="font-medium text-black/55 whitespace-nowrap">{a.lastActive}</Td>
                      <Td className="text-right">
                        <span className="inline-flex items-center gap-1">
                          <IconBtn aria-label="View" onClick={(e) => { e.stopPropagation(); setSelectedId(a.id); }}><Eye size={12} strokeWidth={2.5} /></IconBtn>
                          <IconBtn
                            aria-label={a.status === "Deactivated" ? "Activate" : "Deactivate"}
                            onClick={(e) => { e.stopPropagation(); handleToggleActive(a); }}
                          >
                            <Power size={12} strokeWidth={2.5} />
                          </IconBtn>
                          <IconBtn aria-label="More"><MoreHorizontal size={13} strokeWidth={2.5} /></IconBtn>
                        </span>
                      </Td>
                    </tr>
                  );
                })}
                {!isLoading && filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-2 py-8 text-center text-[12px] font-medium text-black/45">
                      No agents match the current filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Footer pagination */}
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <div className="text-[11px] font-medium text-black/55">
              Showing 1 to {Math.min(filtered.length, parseInt(rowsPerPage, 10))} of {allAgents.length} agents
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

        {/* Right panel - Agent overview */}
        {showDetails && (
          <Card>
            <div className="mb-3 flex items-center justify-between">
              <span className="font-display text-[13px] uppercase tracking-wide">Agent Overview</span>
              <button
                onClick={() => setShowDetails(false)}
                aria-label="Close"
                className="flex h-7 w-7 items-center justify-center rounded-full bg-[#FAFAF6] hover:bg-white hover:ring-1 hover:ring-black/10"
              >
                <X size={13} strokeWidth={2.5} />
              </button>
            </div>

            <div className="flex flex-col items-center text-center">
              <Avatar name={selected.name} size={56} />
              <div className="mt-2 font-display text-[16px] tracking-tight">{selected.name}</div>
              <div className="text-[11px] font-medium text-black/55">{selected.email}</div>
              <div className="mt-2"><RolePill role={selected.role} /></div>
            </div>

            <dl className="mt-4 grid grid-cols-[120px_minmax(0,1fr)] gap-y-2.5 text-[12px]">
              <Meta label="Role">{selected.role}</Meta>
              <Meta label="Status">
                <span className="inline-flex items-center gap-1.5 font-bold" style={{ color: STATUS_TONES[selected.status]?.color }}>
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: STATUS_TONES[selected.status]?.dot }} />
                  {selected.status}
                </span>
              </Meta>
              <Meta label="Joined On">{selected.joined}</Meta>
              <Meta label="Total Tickets">{selected.handled}</Meta>
              <Meta label="Resolved">{selected.resolved} ({Math.round((selected.resolved / selected.handled) * 1000) / 10}%)</Meta>
              <Meta label="Avg. Response">{selected.avg}</Meta>
              <Meta label="First Response">{selected.firstResp}</Meta>
              <Meta label="Customer Rating">
                <span className="inline-flex items-center gap-1.5">
                  <Stars value={selected.rating} />
                  <span className="text-[11px] font-semibold text-black/65">{selected.rating.toFixed(1)} / 5</span>
                </span>
              </Meta>
            </dl>

            <div className="mt-4 flex flex-col gap-2">
              <button className="inline-flex items-center justify-center gap-2 rounded-full bg-[#FAFAF6] px-3 py-2 text-[12px] font-bold ring-1 ring-black/15 hover:bg-white">
                <Activity size={13} strokeWidth={2.5} className="text-[#7C5CFF]" />
                View Performance
              </button>
              <button className="inline-flex items-center justify-center gap-2 rounded-full bg-black px-3 py-2 text-[12px] font-bold text-white">
                <UserCog size={13} strokeWidth={2.5} />
                Edit Agent
              </button>
              <button className="inline-flex items-center justify-center gap-2 text-[11px] font-semibold text-black/55 hover:text-black/80">
                <Mail size={12} strokeWidth={2.5} />
                Send message
              </button>
            </div>
          </Card>
        )}
      </div>

      {/* Agent management workflow */}
      <Card className="mt-4">
        <div className="mb-3 font-display text-[12px] uppercase tracking-wide">Agent Management Workflow</div>
        <div className="flex flex-wrap items-stretch gap-3">
          {WORKFLOW.map((w, i, arr) => {
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

function RolePill({ role }) {
  const tone = ROLE_TONES[role] || { bg: "#EDEDEA", color: "#5B5B57" };
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
      style={{ background: tone.bg, color: tone.color }}
    >
      {role}
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

function Avatar({ name, size = 32 }) {
  const initials = name.split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase();
  const palette = ["#F1ECFF#7C5CFF", "#E9F5E0#3FA02A", "#FFF5DC#C28A00", "#FCE7F3#D63384"];
  const idx = (name.charCodeAt(0) + name.length) % palette.length;
  const [bg, color] = [palette[idx].slice(0, 7), palette[idx].slice(7)];
  return (
    <span
      className="inline-flex items-center justify-center rounded-full font-bold ring-1 ring-black/10"
      style={{ background: bg, color, width: size, height: size, fontSize: Math.max(10, size * 0.36) }}
    >
      {initials}
    </span>
  );
}

function Stars({ value }) {
  return (
    <span className="inline-flex">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={11}
          strokeWidth={2}
          className={i <= Math.round(value) ? "text-[#C28A00]" : "text-black/20"}
          fill={i <= Math.round(value) ? "#C28A00" : "transparent"}
        />
      ))}
    </span>
  );
}

function Pagination() {
  const pages = ["1", "2", "3", "…", "4"];
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
