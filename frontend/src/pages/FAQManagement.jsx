import { useMemo, useState } from "react";
import AppShell from "@layouts/AppShell.jsx";
import { useFaq, useUpsertFaq, useRemoveFaq } from "@api/hooks/useKbFaq";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Copy,
  Eye,
  EyeOff,
  FileEdit,
  FileText,
  Filter,
  MessageCircleQuestion,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  ThumbsDown,
  ThumbsUp,
  Trash2,
  X,
  Loader2,
} from "lucide-react";

/* ----------------------------- mock data ----------------------------- */
const SUMMARY = [
  { key: "total",     label: "Total FAQs", value: "87", hint: "↑ 12 this month", icon: MessageCircleQuestion, tone: "#F1ECFF", color: "#7C5CFF" },
  { key: "published", label: "Published",  value: "72", hint: "83% of total",    icon: FileText,              tone: "#E9F5E0", color: "#3FA02A" },
  { key: "drafts",    label: "Drafts",     value: "10", hint: "11% of total",    icon: FileEdit,              tone: "#FFF5DC", color: "#C28A00" },
  { key: "hidden",    label: "Hidden",     value: "5",  hint: "6% of total",     icon: EyeOff,                tone: "#FCE7F3", color: "#D63384" },
];

const CATEGORIES = ["All Categories", "Account & Security", "Tickets", "Billing & Payments", "Integrations", "General"];
const STATUSES   = ["All Statuses", "Published", "Draft", "Hidden"];
const LANGUAGES  = ["All Languages", "English", "Spanish", "French", "German"];

const STATUS_TONES = {
  Published: { bg: "#E9F5E0", color: "#3FA02A" },
  Draft:     { bg: "#FFF5DC", color: "#C28A00" },
  Hidden:    { bg: "#EDEDEA", color: "#5B5B57" },
};



/* ============================== page ============================== */
function adaptFaq(f) {
  return {
    id:       f._id || f.id,
    q:        f.question || "(untitled)",
    answer:   f.answer || "",
    category: f.category || "General",
    language: f.language || "English",
    status:   f.isActive === false ? "Hidden" : "Published",
    updated:  f.updatedAt
      ? new Date(f.updatedAt).toLocaleString()
      : f.createdAt
      ? new Date(f.createdAt).toLocaleString()
      : "-",
    views:    f.views ?? null,
    votes:    f.helpfulCount ?? null,
    raw:      f,
  };
}

export default function FAQManagement() {
  const { data: faqData, isLoading } = useFaq();
  const upsert = useUpsertFaq();
  const remove = useRemoveFaq();

  const allFaqs = useMemo(() => {
    const list = faqData?.faqs || faqData?.data || faqData || [];
    return Array.isArray(list) ? list.map(adaptFaq) : [];
  }, [faqData]);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [status, setStatus] = useState("All Statuses");
  const [language, setLanguage] = useState("All Languages");
  const [rowsPerPage, setRowsPerPage] = useState("10");
  const [selectedId, setSelectedId] = useState(null);
  const [showDetails, setShowDetails] = useState(true);

  const filtered = useMemo(() => {
    return allFaqs.filter((r) => {
      if (category !== "All Categories" && r.category !== category) return false;
      if (status !== "All Statuses" && r.status !== status) return false;
      if (language !== "All Languages" && r.language !== language) return false;
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        if (!r.q.toLowerCase().includes(q) && !r.category.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [allFaqs, category, status, language, search]);

  const selected =
    allFaqs.find((f) => f.id === selectedId) ||
    allFaqs[0] || {
      id: null, q: "No FAQs yet", answer: "Click \"New FAQ\" to add your first knowledge base entry.",
      category: "-", language: "English", status: "Published", updated: "-", views: null, votes: null,
    };

  const handleNew = async () => {
    const question = window.prompt("Question");
    if (!question) return;
    const answer = window.prompt("Answer");
    if (!answer) return;
    const cat = window.prompt("Category (optional)") || undefined;
    try {
      await upsert.mutateAsync({ question, answer, category: cat });
    } catch (err) {
      window.alert(`Create failed: ${err?.message || "unknown"}`);
    }
  };

  const handleEdit = async () => {
    if (!selected.id) return;
    const question = window.prompt("Question", selected.q);
    if (!question) return;
    const answer = window.prompt("Answer", selected.answer);
    if (answer === null) return;
    try {
      await upsert.mutateAsync({ id: selected.id, question, answer });
    } catch (err) {
      window.alert(`Update failed: ${err?.message || "unknown"}`);
    }
  };

  const handleToggleStatus = async () => {
    if (!selected.id) return;
    try {
      await upsert.mutateAsync({ id: selected.id, isActive: selected.status !== "Published" });
    } catch (err) {
      window.alert(`Update failed: ${err?.message || "unknown"}`);
    }
  };

  const handleDelete = async () => {
    if (!selected.id) return;
    if (!window.confirm(`Delete FAQ: "${selected.q}"?`)) return;
    try {
      await remove.mutateAsync(selected.id);
      setSelectedId(null);
    } catch (err) {
      window.alert(`Delete failed: ${err?.message || "unknown"}`);
    }
  };

  return (
    <AppShell
      active="faq"
      title="FAQ Management"
      subtitle="Create and manage frequently asked questions to help customers find quick answers."
      actions={
        <button onClick={handleNew} disabled={upsert.isPending} className="inline-flex items-center gap-2 rounded-full bg-black px-4 py-2 text-[12px] font-bold text-white transition-transform hover:-translate-y-0.5 disabled:opacity-50">
          <Plus size={13} strokeWidth={3} />
          {upsert.isPending ? "Saving…" : "New FAQ"}
        </button>
      }
    >
      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {SUMMARY.map((s) => (
          <SummaryCard key={s.key} {...s} />
        ))}
      </div>

      {/* Main list card */}
      <Card className="mt-4">
        {/* Toolbar */}
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <label className="flex min-w-[220px] flex-1 items-center gap-2 rounded-full bg-[#FAFAF6] px-3 py-2 ring-1 ring-black/10">
            <Search size={13} strokeWidth={2.5} className="text-black/45" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search FAQs..."
              className="w-full bg-transparent text-[12px] font-medium placeholder:text-black/40 focus:outline-none"
            />
          </label>
          <SelectPill value={category} onChange={setCategory} options={CATEGORIES} />
          <SelectPill value={status}   onChange={setStatus}   options={STATUSES} />
          <SelectPill value={language} onChange={setLanguage} options={LANGUAGES} />
          <button className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-[12px] font-bold ring-1 ring-black/15">
            <Filter size={13} strokeWidth={2.8} className="text-[#7C5CFF]" />
            Filters
            <ChevronDown size={12} strokeWidth={2.5} className="text-black/50" />
          </button>
        </div>

        {/* Table */}
        <div className="-mx-2 overflow-x-auto px-2">
          <table className="w-full min-w-[860px] text-left text-[12px]">
            <thead>
              <tr className="text-black/45">
                <Th className="w-6"></Th>
                <Th>Question</Th>
                <Th>Category</Th>
                <Th>Language</Th>
                <Th>Status</Th>
                <Th>Last Updated</Th>
                <Th className="text-right">Views</Th>
                <Th className="text-right">Helpful Votes</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="px-2 py-8 text-center text-[12px] font-medium text-black/45">
                    <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                  </td>
                </tr>
              ) : filtered.map((f) => {
                const sel = f.id === selectedId;
                return (
                  <tr
                    key={f.id}
                    onClick={() => { setSelectedId(f.id); setShowDetails(true); }}
                    className={`cursor-pointer border-t border-black/5 align-middle transition-colors ${
                      sel ? "bg-[#FAFAF6]" : "hover:bg-[#FAFAF6]"
                    }`}
                  >
                    <Td><ChevronRight size={12} strokeWidth={2.5} className="text-black/40" /></Td>
                    <Td className="font-semibold">{f.q}</Td>
                    <Td className="font-medium text-black/65">{f.category}</Td>
                    <Td className="font-medium text-black/65">{f.language}</Td>
                    <Td><Pill tone={STATUS_TONES[f.status]}>{f.status}</Pill></Td>
                    <Td className="font-medium text-black/55 whitespace-nowrap">{f.updated}</Td>
                    <Td className="text-right font-semibold text-black/70">{f.views ?? "-"}</Td>
                    <Td className="text-right">
                      {f.votes != null ? (
                        <span className="inline-flex items-center gap-1 font-semibold text-black/70">
                          <ThumbsUp size={11} strokeWidth={2.5} className="text-[#3FA02A]" /> {f.votes}
                        </span>
                      ) : (
                        <span className="text-black/40">-</span>
                      )}
                    </Td>
                    <Td className="text-right">
                      <span className="inline-flex items-center gap-1">
                        {f.status !== "Draft" && <IconBtn aria-label="View"><Eye size={12} strokeWidth={2.5} /></IconBtn>}
                        <IconBtn aria-label="Edit"><Pencil size={12} strokeWidth={2.5} /></IconBtn>
                        <IconBtn aria-label="More"><MoreHorizontal size={13} strokeWidth={2.5} /></IconBtn>
                      </span>
                    </Td>
                  </tr>
                );
              })}
              {!isLoading && filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-2 py-8 text-center text-[12px] font-medium text-black/45">
                    No FAQs match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer: pagination */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <div className="text-[11px] font-medium text-black/55">
            Showing 1 to {Math.min(filtered.length, parseInt(rowsPerPage, 10))} of {allFaqs.length} FAQs
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

      {/* FAQ Details panel */}
      {showDetails && (
        <Card className="mt-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="font-display text-[13px] uppercase tracking-wide">
              FAQ Details: <span className="text-black/65 normal-case">{selected.q}</span>
            </span>
            <button
              onClick={() => setShowDetails(false)}
              aria-label="Close details"
              className="flex h-7 w-7 items-center justify-center rounded-full bg-[#FAFAF6] hover:bg-white hover:ring-1 hover:ring-black/10"
            >
              <X size={13} strokeWidth={2.5} />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[260px_minmax(0,1fr)_220px]">
            {/* Meta column */}
            <dl className="grid grid-cols-[110px_minmax(0,1fr)] gap-y-2.5 text-[12px]">
              <Meta label="Category">{selected.category}</Meta>
              <Meta label="Language">{selected.language}</Meta>
              <Meta label="Status"><Pill tone={STATUS_TONES[selected.status]}>{selected.status}</Pill></Meta>
              <Meta label="Created By">Sophia Lee</Meta>
              <Meta label="Created On">Apr 25, 2025 10:00 AM</Meta>
              <Meta label="Last Updated">{selected.updated}</Meta>
              <Meta label="Views">{selected.views ?? "-"}</Meta>
              <Meta label="Helpful Votes">
                <span className="inline-flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 text-[#3FA02A]"><ThumbsUp size={11} strokeWidth={2.5} /> {selected.votes ?? 0}</span>
                  <span className="inline-flex items-center gap-1 text-[#D63384]"><ThumbsDown size={11} strokeWidth={2.5} /> 12</span>
                </span>
              </Meta>
            </dl>

            {/* Content column */}
            <div className="min-w-0">
              <SectionLabel>Question</SectionLabel>
              <p className="mb-3 text-[12.5px] font-semibold text-black/80">{selected.q}</p>

              <SectionLabel>Answer</SectionLabel>
              <p className="whitespace-pre-line text-[12px] text-black/70 leading-relaxed">
                {selected.answer || "No answer yet."}
              </p>

              <div className="mt-4 rounded-[14px] bg-[#FAFAF6] p-3 ring-1 ring-black/10">
                <div className="text-[11px] font-semibold text-black/55">Was this answer helpful?</div>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <button className="inline-flex items-center gap-1.5 rounded-full bg-[#E9F5E0] px-3 py-1.5 text-[11px] font-bold text-[#3FA02A] ring-1 ring-black/10">
                    <ThumbsUp size={11} strokeWidth={2.5} /> Yes ({selected.votes ?? 0})
                  </button>
                  <button className="inline-flex items-center gap-1.5 rounded-full bg-[#FCE7F3] px-3 py-1.5 text-[11px] font-bold text-[#D63384] ring-1 ring-black/10">
                    <ThumbsDown size={11} strokeWidth={2.5} /> No (12)
                  </button>
                </div>
              </div>
            </div>

            {/* Actions column */}
            <div>
              <SectionLabel>Actions</SectionLabel>
              <div className="flex flex-col gap-2">
                <ActionBtn icon={Eye}    color="#7C5CFF" onClick={() => setShowDetails(true)}>View FAQ</ActionBtn>
                <ActionBtn icon={Pencil} color="#3FA02A" onClick={handleEdit}>Edit FAQ</ActionBtn>
                <ActionBtn icon={Copy}   color="#C28A00">Duplicate FAQ</ActionBtn>
                <ActionBtn icon={EyeOff} color="#5B5B57" onClick={handleToggleStatus} trailing>Change Status</ActionBtn>
                <button onClick={handleDelete} disabled={remove.isPending || !selected.id} className="inline-flex w-full items-center justify-start gap-2 rounded-[14px] bg-[#FCE7F3] px-3 py-2 text-[12px] font-bold text-[#D63384] ring-1 ring-black/10 hover:-translate-y-0.5 transition-transform disabled:opacity-50">
                  <Trash2 size={13} strokeWidth={2.5} /> {remove.isPending ? "Deleting…" : "Delete FAQ"}
                </button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* FAQ workflow strip */}
      <Card className="mt-4">
        <div className="mb-3 font-display text-[12px] uppercase tracking-wide">FAQ Workflow</div>
        <div className="flex flex-wrap items-stretch gap-3">
          {[
            { key: "create",   title: "Create FAQ",    desc: "Add a new question and answer",     icon: Plus,                 tone: "#F1ECFF", color: "#7C5CFF" },
            { key: "category", title: "Categorize",    desc: "Assign category and language",       icon: FileText,             tone: "#E9F5E0", color: "#3FA02A" },
            { key: "review",   title: "Review",        desc: "Edit, refine, and proofread answer", icon: Pencil,               tone: "#FFF5DC", color: "#C28A00" },
            { key: "publish",  title: "Publish",       desc: "Make FAQ live for customers",        icon: Eye,                  tone: "#E9F5E0", color: "#3FA02A" },
            { key: "votes",    title: "Customer Votes",desc: "Track helpful & unhelpful feedback", icon: ThumbsUp,             tone: "#FCE7F3", color: "#D63384" },
            { key: "update",   title: "Update / Hide", desc: "Improve content or hide if outdated",icon: EyeOff,               tone: "#F1ECFF", color: "#7C5CFF" },
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
          <div className="mt-1 font-display text-[24px] leading-none tracking-tight">{value}</div>
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

function SelectPill({ value, onChange, options, prefix }) {
  return (
    <label className="inline-flex items-center gap-1 rounded-full bg-[#FAFAF6] px-3 py-2 text-[11px] font-semibold ring-1 ring-black/10">
      {prefix && <span className="text-black/45">{prefix}</span>}
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

function SectionLabel({ children }) {
  return <div className="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-black/55">{children}</div>;
}

function ActionBtn({ icon: Icon, color, children, trailing, onClick }) {
  return (
    <button onClick={onClick} className="inline-flex w-full items-center justify-start gap-2 rounded-[14px] bg-[#FAFAF6] px-3 py-2 text-[12px] font-bold text-black/75 ring-1 ring-black/10 transition-transform hover:-translate-y-0.5 hover:bg-white">
      <Icon size={13} strokeWidth={2.5} style={{ color }} />
      <span className="flex-1 text-left">{children}</span>
      {trailing && <ChevronDown size={12} strokeWidth={2.5} className="text-black/45" />}
    </button>
  );
}

function Pagination() {
  const pages = ["1", "2", "3", "…", "11"];
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
