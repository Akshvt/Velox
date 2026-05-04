import { useEffect, useMemo, useRef, useState } from "react";
import AppShell from "@layouts/AppShell.jsx";
import { useEscalationStore } from "@store/escalationStore";
import { useAuthStore } from "@store/authStore";
import {
  useTickets,
  useChatHistory,
  useSendMessage,
  useUpdateTicket,
  useAiSuggest,
  useAiSummarize,
} from "@api/hooks";
import { useQueryClient } from "@tanstack/react-query";
import { qk } from "@api/queryKeys";
import { adaptTicket, adaptMessage, statusLabel, statusTone } from "@lib/adapters";
import { getSocket, SOCKET_EVENTS, socketActions } from "@realtime/socket";
import {
  Bookmark,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronUp,
  Clock,
  Flag,
  Folder,
  Hourglass,
  Inbox,
  Mail,
  MapPin,
  MoreHorizontal,
  Paperclip,
  Phone,
  Search,
  Send,
  Smile,
  Sparkles,
  Tag,
  UserPlus,
  Loader2,
} from "lucide-react";

/* ----------------------------- ui constants ----------------------------- */
const TABS = [
  { key: "all",      label: "All" },
  { key: "open",     label: "Open" },
  { key: "pending",  label: "Pending" },
  { key: "resolved", label: "Resolved" },
];

const STATUS_TONES = {
  Open:          { bg: "#E9F5E0", color: "#3FA02A" },
  Pending:       { bg: "#FFF5DC", color: "#C28A00" },
  "In Progress": { bg: "#F1ECFF", color: "#7C5CFF" },
  Resolved:      { bg: "#FCE7F3", color: "#D63384" },
};

const quickReplies = ["Order Status", "Refund Policy", "Shipping Info"];
const SUB_TABS = ["Conversation", "Customer Details", "Ticket Info", "History", "AI Insights"];

/* ----------------------------- page ----------------------------- */
export default function AgentDashboard() {
  const escalations = useEscalationStore((s) => s.escalations);
  const me = useAuthStore((s) => s.user);
  const qc = useQueryClient();

  const [activeTab, setActiveTab] = useState("all");
  const [activeTicket, setActiveTicket] = useState(null);
  const [activeSubTab, setActiveSubTab] = useState("Conversation");
  const [mobileView, setMobileView] = useState("list"); // 'list' | 'chat' | 'details' (mobile only)
  const [reply, setReply] = useState("");
  const [internalNote, setInternalNote] = useState("");
  const [ticketQuery, setTicketQuery] = useState("");
  const [aiBusy, setAiBusy] = useState(false);
  const [summary, setSummary] = useState("");
  const scrollRef = useRef(null);

  // ---- Real tickets (status filter mapped from active tab) ----
  const statusParam = useMemo(() => {
    if (activeTab === "open") return "open";
    if (activeTab === "pending") return "in_progress";
    if (activeTab === "resolved") return "resolved";
    return undefined;
  }, [activeTab]);

  const ticketsQuery = useTickets({ status: statusParam, limit: 50 });
  const apiTickets = ticketsQuery.data?.tickets || [];
  const adapted = useMemo(() => apiTickets.map(adaptTicket).filter(Boolean), [apiTickets]);

  // Counts per tab from full set (re-fetch unscoped for accurate counts)
  const allTicketsQuery = useTickets({ limit: 100 });
  const counts = useMemo(() => {
    const all = allTicketsQuery.data?.tickets || [];
    return {
      all: all.length,
      open: all.filter((t) => t.status === "open").length,
      pending: all.filter((t) => t.status === "in_progress").length,
      resolved: all.filter((t) => ["resolved", "closed"].includes(t.status)).length,
    };
  }, [allTicketsQuery.data]);

  // Merge escalations (from /chat) at the top so demo flow works even when no real
  // tickets exist yet. They share the same UI shape thanks to the adapter.
  const escalationCards = escalations.map((e) => ({
    raw: e,
    id: e.id,
    code: `ES-${String(e.id).slice(-4).toUpperCase()}`,
    initials: (e.name || "GC")
      .split(" ")
      .map((s) => s[0])
      .join("")
      .slice(0, 2)
      .toUpperCase(),
    name: e.name || "Guest Customer",
    email: "",
    subject: e.subject || "Escalated from AI chat",
    time: new Date(e.createdAt).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
    status: statusLabel(e.status || "open"),
    tone: statusTone(statusLabel(e.status || "open")),
    escalated: true,
    preview: e.preview,
    transcript: e.transcript,
  }));

  const allTickets = [...escalationCards, ...adapted];

  // Pick a sensible default ticket once data lands
  useEffect(() => {
    if (!activeTicket && allTickets.length) setActiveTicket(allTickets[0].id);
  }, [activeTicket, allTickets]);

  const filtered = allTickets.filter((t) => {
    const q = ticketQuery.trim().toLowerCase();
    const queryMatch =
      !q ||
      t.name.toLowerCase().includes(q) ||
      String(t.id).toLowerCase().includes(q) ||
      t.subject.toLowerCase().includes(q);
    return queryMatch;
  });

  const ticket =
    allTickets.find((t) => t.id === activeTicket) ??
    allTickets[0] ?? {
      id: null,
      code: "-",
      status: "Open",
      tone: "#E9F5E0",
      initials: "-",
      name: "No tickets yet",
      email: "",
      subject: "Waiting for the first ticket",
      time: "",
      priority: "Medium",
      category: "",
    };

  // ---- Real chat history (only for non-escalation tickets) ----
  const isRealTicket = ticket && !ticket.escalated;
  const historyQuery = useChatHistory(isRealTicket ? ticket.id : null);
  const apiMessages = historyQuery.data?.messages || [];
  const messages = useMemo(
    () => apiMessages.map((m) => adaptMessage(m, me?.id)).filter(Boolean),
    [apiMessages, me?.id],
  );

  const sendMutation = useSendMessage(isRealTicket ? ticket?.id : null);
  const updateMutation = useUpdateTicket();
  const aiSuggest = useAiSuggest();
  const aiSummarize = useAiSummarize();

  // ---- Socket: join ticket room + listen for new messages ----
  useEffect(() => {
    if (!isRealTicket || !ticket?.id) return;
    const sock = getSocket();
    socketActions.joinTicket(ticket.id);

    const onMessage = ({ message }) => {
      if (!message || String(message.ticketId) !== String(ticket.id)) return;
      qc.setQueryData(qk.chat.history(ticket.id), (old) => {
        const prev = old?.messages || [];
        if (prev.some((m) => m._id === message._id)) return old;
        return { ...(old || {}), messages: [...prev, message] };
      });
    };
    const onTicketUpdated = () => {
      qc.invalidateQueries({ queryKey: qk.tickets.all });
    };

    sock.on(SOCKET_EVENTS.CHAT_MESSAGE, onMessage);
    sock.on(SOCKET_EVENTS.TICKET_NEW, onTicketUpdated);
    sock.on(SOCKET_EVENTS.TICKET_UPDATED, onTicketUpdated);
    return () => {
      sock.off?.(SOCKET_EVENTS.CHAT_MESSAGE, onMessage);
      sock.off?.(SOCKET_EVENTS.TICKET_NEW, onTicketUpdated);
      sock.off?.(SOCKET_EVENTS.TICKET_UPDATED, onTicketUpdated);
      socketActions.leaveTicket(ticket.id);
    };
  }, [isRealTicket, ticket?.id, qc]);

  // Auto-scroll on ticket change / new messages
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
    if (distance < 200) el.scrollTop = el.scrollHeight;
  }, [activeTicket, messages.length]);

  function handleSend(e) {
    e?.preventDefault?.();
    const text = reply.trim();
    if (!text || !isRealTicket || !ticket?.id) return;
    socketActions.sendMessage({ ticketId: ticket.id, content: text, senderType: "agent" });
    sendMutation.mutate({ content: text, senderType: "agent" });
    setReply("");
  }

  function handleResolve() {
    if (!isRealTicket || !ticket?.id) return;
    updateMutation.mutate({ id: ticket.id, status: "resolved" });
  }

  function handleAiSuggest() {
    if (!isRealTicket || !ticket?.id) return;
    setAiBusy(true);
    aiSuggest.mutate(
      { ticketId: ticket.id },
      {
        onSuccess: (data) => {
          const text = data?.suggestion || data?.reply || "";
          if (text) setReply(text);
        },
        onSettled: () => setAiBusy(false),
      },
    );
  }

  function handleAiSummarize() {
    if (!isRealTicket || !ticket?.id) return;
    aiSummarize.mutate(ticket.id, {
      onSuccess: (data) => setSummary(data?.summary || ""),
    });
  }

  return (
    <AppShell
      active="tickets"
      variant="workspace"
      topbarProps={{
        searchPlaceholder: "Search tickets, customers...",
        notifCount: 0,
        user: {
          name: me?.name || "Agent",
          role: me?.roleLabel || (me?.role === "admin" ? "Admin" : "Support Agent"),
          initials: me?.initials || (me?.name || "AG").slice(0, 2).toUpperCase(),
        },
      }}
    >
      {/* ============ MAIN GRID ============ */}
      <main className="grid min-h-0 flex-1 grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-[300px_minmax(0,1fr)_320px]">
        {/* -------- LEFT: TICKET LIST -------- */}
        <aside className={`${mobileView === "list" ? "flex" : "hidden"} h-full min-h-0 flex-col rounded-[28px] bg-white p-3 shadow-[0_18px_44px_-12px_rgba(28,28,40,0.18),0_4px_12px_rgba(28,28,40,0.06)] ring-1 ring-black/10 sm:p-4 lg:flex lg:rounded-[40px]`}>
          <div className="flex items-center justify-between px-1 pb-3">
            <span className="font-display text-base uppercase tracking-wide">My Tickets</span>
            <button aria-label="Filter" className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FAFAF6]">
              <Inbox size={14} strokeWidth={2.5} />
            </button>
          </div>

          {/* tabs */}
          <div className="-mx-1 flex items-center gap-1 overflow-x-auto px-1 pb-3 text-[12px] font-semibold">
            {TABS.map((t) => {
              const sel = activeTab === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key)}
                  className={`shrink-0 rounded-full px-3 py-1.5 transition-colors ${
                    sel ? "bg-black text-white" : "bg-[#FAFAF6] text-black/65 hover:bg-black/5"
                  }`}
                >
                  {t.label} ({counts[t.key] ?? 0})
                </button>
              );
            })}
          </div>

          {/* search */}
          <div className="px-1 pb-3">
            <div className="flex items-center gap-2 rounded-full bg-[#F4F4EE] px-4 py-2.5">
              <Search size={14} strokeWidth={2.5} className="text-black/50" />
              <input
                value={ticketQuery}
                onChange={(e) => setTicketQuery(e.target.value)}
                placeholder="Search tickets..."
                className="w-full bg-transparent text-sm font-medium placeholder:text-black/40 focus:outline-none"
              />
            </div>
          </div>

          {/* ticket list */}
          <ul className="flex-1 space-y-2 overflow-y-auto overscroll-contain px-1 pb-2">
            {filtered.map((t) => {
              const active = t.id === activeTicket;
              const tones = STATUS_TONES[t.status];
              return (
                <li key={t.id}>
                  <button
                    onClick={() => { setActiveTicket(t.id); setMobileView("chat"); }}
                    className={`flex w-full items-start gap-3 rounded-[18px] p-3 text-left transition-all hover:-translate-y-0.5 ${
                      active ? "shadow-[0_6px_18px_rgba(0,0,0,0.06)]" : "hover:bg-[#FAFAF6]"
                    }`}
                    style={active ? { background: t.tone } : undefined}
                  >
                    <span
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[11px] font-bold"
                      style={{ background: active ? "#fff" : t.tone, color: tones.color }}
                    >
                      {t.initials}
                    </span>
                    <span className="min-w-0 flex-1 leading-tight">
                      <span className="flex items-center justify-between gap-2">
                        <span className="truncate text-[12px] font-bold text-black/70">#{t.id}</span>
                        <span
                          className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                          style={{ background: tones.bg, color: tones.color }}
                        >
                          {t.status}
                        </span>
                      </span>
                      <span className="mt-0.5 block truncate text-[13px] font-semibold">{t.name}</span>
                      <span className="mt-0.5 block truncate text-[11px] font-medium text-black/55">{t.subject}</span>
                      <span className="mt-1 block text-[10px] font-semibold text-black/40">{t.time}</span>
                    </span>
                  </button>
                </li>
              );
            })}
            {ticketsQuery.isLoading && (
              <li className="rounded-[18px] p-6 text-center text-black/50">
                <Loader2 className="mx-auto h-5 w-5 animate-spin" />
              </li>
            )}
            {!ticketsQuery.isLoading && filtered.length === 0 && (
              <li className="rounded-[18px] bg-[#FAFAF6] p-6 text-center text-[12px] font-medium text-black/55">
                No tickets match your filters.
              </li>
            )}
          </ul>

          <button className="mt-2 flex items-center justify-center gap-2 rounded-[18px] bg-[#FAFAF6] py-2.5 text-[12px] font-semibold transition-transform hover:-translate-y-0.5">
            <Bookmark size={13} strokeWidth={2.5} />
            Load More
          </button>
        </aside>

        {/* -------- CENTER: CONVERSATION -------- */}
        <section className={`${mobileView === "chat" ? "flex" : "hidden"} h-full min-h-0 flex-col overflow-hidden rounded-[24px] bg-white shadow-[0_18px_44px_-12px_rgba(28,28,40,0.18),0_4px_12px_rgba(28,28,40,0.06)] ring-1 ring-black/10 sm:rounded-[40px] lg:flex`}>
          {/* ticket header */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-black/5 px-3 py-3 sm:gap-3 sm:px-5 sm:py-4">
            <div className="flex min-w-0 flex-wrap items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => setMobileView("list")}
                aria-label="Back to tickets"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FAFAF6] lg:hidden"
              >
                <ChevronLeft size={16} strokeWidth={2.5} />
              </button>
              <span className="font-display text-[14px] uppercase tracking-wide sm:text-base">Ticket {ticket.code}</span>
              <span
                className="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                style={{ background: STATUS_TONES[ticket.status].bg, color: STATUS_TONES[ticket.status].color }}
              >
                {ticket.status}
              </span>
            </div>
            <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={() => setMobileView("details")}
                aria-label="Open details"
                className="inline-flex items-center gap-1.5 rounded-full bg-[#FFE9A8] px-2.5 py-1 text-[11px] font-semibold text-[#8a6d00] transition-transform hover:-translate-y-0.5 lg:hidden"
              >
                <Inbox size={12} strokeWidth={2.5} />
                Details
              </button>
              <button
                type="button"
                onClick={handleAiSummarize}
                disabled={!isRealTicket || aiSummarize.isPending}
                className="inline-flex items-center gap-1.5 rounded-full bg-[#F1ECFF] px-2.5 py-1 text-[11px] font-semibold text-[#7C5CFF] transition-transform hover:-translate-y-0.5 disabled:opacity-50 sm:px-3 sm:py-1.5 sm:text-[12px]"
              >
                <Sparkles size={13} strokeWidth={2.5} />
                <span className="hidden sm:inline">{aiSummarize.isPending ? "Summarizing…" : "AI Summarize"}</span>
                <span className="sm:hidden">{aiSummarize.isPending ? "…" : "AI"}</span>
              </button>
              <button aria-label="More" className="hidden h-9 w-9 items-center justify-center rounded-full bg-[#FAFAF6] sm:flex">
                <MoreHorizontal size={16} strokeWidth={2.5} />
              </button>
            </div>
          </div>

          {/* customer mini bar */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-black/5 px-3 py-2 text-[11px] font-medium text-black/65 sm:gap-x-5 sm:px-5 sm:py-3 sm:text-[12px]">
            <span className="inline-flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold" style={{ background: "#F1ECFF", color: "#7C5CFF" }}>
                {ticket.initials}
              </span>
              <span className="font-semibold text-black">{ticket.name}</span>
            </span>
            {ticket.email && (
              <span className="inline-flex items-center gap-1.5">
                <Mail size={12} strokeWidth={2.5} className="text-black/45" />
                {ticket.email}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5">
              <Tag size={12} strokeWidth={2.5} className="text-black/45" />
              {ticket.category || "Uncategorized"}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock size={12} strokeWidth={2.5} className="text-black/45" />
              {ticket.time || "-"}
            </span>
          </div>

          {/* sub tabs */}
          <div className="flex items-center gap-1 overflow-x-auto border-b border-black/5 px-2 py-2 text-[12px] font-semibold sm:px-3">
            {SUB_TABS.map((t) => {
              const sel = activeSubTab === t;
              return (
                <button
                  key={t}
                  onClick={() => setActiveSubTab(t)}
                  className={`shrink-0 rounded-full px-2.5 py-1 transition-colors sm:px-3 sm:py-1.5 ${
                    sel ? "bg-[#F1ECFF] text-[#7C5CFF]" : "text-black/55 hover:bg-[#FAFAF6]"
                  }`}
                >
                  {t}
                </button>
              );
            })}
          </div>

          {/* messages */}
          <div ref={scrollRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain px-3 py-3 sm:space-y-4 sm:px-5 sm:py-4">
            {summary && (
              <div className="rounded-[18px] border border-dashed border-[#7C5CFF]/40 bg-[#F1ECFF]/60 px-4 py-3 text-[12px] font-medium leading-relaxed text-black/75">
                <span className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-[#7C5CFF]">AI Summary</span>
                {summary}
              </div>
            )}
            {historyQuery.isLoading && isRealTicket && (
              <div className="flex justify-center p-4">
                <Loader2 className="h-5 w-5 animate-spin text-black/45" />
              </div>
            )}
            {messages.length === 0 && !historyQuery.isLoading && isRealTicket && (
              <div className="py-12 text-center text-[12px] font-medium text-black/45">No messages yet - say hi.</div>
            )}
            {!isRealTicket && (
              <div className="py-12 text-center text-[12px] font-medium text-black/45">
                {ticket.id ? "Live escalation preview - connect this lead to a real ticket from your backend." : "No ticket selected."}
              </div>
            )}
            {messages.map((m) =>
              m.from === "customer" ? (
                <div key={m.id} className="flex items-end gap-2.5">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold" style={{ background: "#F1ECFF", color: "#7C5CFF" }}>
                    {ticket.initials}
                  </span>
                  <div className="max-w-[70%]">
                    <span className="mb-1 block pl-2 text-[10px] font-semibold text-black/45">{ticket.name} · {m.time}</span>
                    <div className="whitespace-pre-line rounded-[18px] rounded-bl-[6px] px-4 py-2.5 text-[13px] font-medium leading-relaxed" style={{ background: "#F4F4EE" }}>
                      {m.text}
                    </div>
                  </div>
                </div>
              ) : m.from === "ai" ? (
                <div key={m.id} className="flex items-end gap-2.5">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold" style={{ background: "#E9F5E0", color: "#3FA02A" }}>
                    AI
                  </span>
                  <div className="max-w-[70%]">
                    <span className="mb-1 block pl-2 text-[10px] font-semibold text-[#3FA02A]">AI Auto-reply · {m.time}</span>
                    <div className="whitespace-pre-line rounded-[18px] rounded-bl-[6px] border border-dashed border-[#3FA02A]/40 px-4 py-2.5 text-[13px] font-medium leading-relaxed" style={{ background: "#F4FBEE" }}>
                      {m.text}
                    </div>
                  </div>
                </div>
              ) : (
                <div key={m.id} className="flex items-end justify-end gap-2.5">
                  <div className="max-w-[70%]">
                    <span className="mb-1 block pr-2 text-right text-[10px] font-semibold text-black/45">{m.senderName || "Agent"} · {m.time}</span>
                    <div className="whitespace-pre-line rounded-[18px] rounded-br-[6px] px-4 py-2.5 text-[13px] font-medium leading-relaxed text-black" style={{ background: "#FFE9A8" }}>
                      {m.text}
                    </div>
                  </div>
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold" style={{ background: "#E9F5E0", color: "#3FA02A" }}>
                    {(me?.initials || "AG").slice(0, 2)}
                  </span>
                </div>
              ),
            )}
          </div>

          {/* quick replies */}
          <div className="flex flex-wrap items-center gap-2 border-t border-black/5 px-3 py-2 sm:px-5 sm:py-2.5">
            {quickReplies.map((q) => (
              <button
                key={q}
                onClick={() => setReply((r) => (r ? `${r} ${q}` : q))}
                className="rounded-full bg-[#FAFAF6] px-3 py-1.5 text-[11px] font-semibold text-black/65 transition-transform hover:-translate-y-0.5"
              >
                {q}
              </button>
            ))}
            <button className="ml-auto inline-flex items-center gap-1 rounded-full bg-[#FAFAF6] px-3 py-1.5 text-[11px] font-semibold text-black/65">
              More Replies <ChevronDown size={11} strokeWidth={2.5} />
            </button>
          </div>

          {/* reply box */}
          <form onSubmit={handleSend} className="border-t border-black/5 p-2 sm:p-4">
            <div className="rounded-[20px] bg-[#FAFAF6] p-2.5 sm:p-3">
              <textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder={isRealTicket ? "Type your reply…" : "Pick a ticket to reply"}
                rows={2}
                disabled={!isRealTicket}
                className="w-full resize-none bg-transparent px-1 text-[13px] font-medium placeholder:text-black/40 focus:outline-none disabled:opacity-50"
              />
              <div className="mt-2 flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleAiSuggest}
                  disabled={!isRealTicket || aiBusy}
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#F1ECFF] px-3 py-1 text-[11px] font-bold text-[#7C5CFF] transition-transform hover:-translate-y-0.5 disabled:opacity-50"
                >
                  <Sparkles size={11} strokeWidth={2.8} />
                  {aiBusy ? "Drafting…" : "AI Suggest"}
                </button>
                <IconBtn aria-label="Attach"><Paperclip size={14} strokeWidth={2.5} /></IconBtn>
                <IconBtn aria-label="Emoji"><Smile size={14} strokeWidth={2.5} /></IconBtn>
                <IconBtn aria-label="Save"><Bookmark size={14} strokeWidth={2.5} /></IconBtn>
                <div className="ml-auto flex items-center gap-1.5">
                  <button
                    type="submit"
                    disabled={!isRealTicket || !reply.trim() || sendMutation.isPending}
                    className="inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[12px] font-semibold text-white shadow-[0_4px_12px_rgba(63,160,42,0.35)] transition-transform hover:-translate-y-0.5 disabled:opacity-50"
                    style={{ background: "#3FA02A" }}
                  >
                    <Send size={12} strokeWidth={2.8} />
                    {sendMutation.isPending ? "Sending…" : "Send"}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </section>

        {/* -------- RIGHT: TICKET DETAILS -------- */}
        <aside className={`${mobileView === "details" ? "flex" : "hidden"} h-full min-h-0 flex-col gap-3 overflow-y-auto rounded-[24px] bg-white p-3 shadow-[0_18px_44px_-12px_rgba(28,28,40,0.18),0_4px_12px_rgba(28,28,40,0.06)] ring-1 ring-black/10 sm:p-4 lg:flex lg:rounded-[40px]`}>
          {/* mobile back row */}
          <div className="flex items-center justify-between lg:hidden">
            <button
              type="button"
              onClick={() => setMobileView("chat")}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#FAFAF6] px-3 py-1.5 text-[12px] font-semibold"
            >
              <ChevronLeft size={14} strokeWidth={2.5} />
              Back to chat
            </button>
            <span className="font-display text-[13px] uppercase tracking-wide">Details</span>
          </div>
          {/* primary action card */}
          <div className="rounded-[20px] p-3" style={{ background: "#E9F5E0" }}>
            <div className="flex items-center justify-between">
              <div className="leading-tight">
                <div className="text-[11px] font-semibold uppercase tracking-wide text-[#3FA02A]">Status</div>
                <div className="text-[14px] font-bold">{ticket.status}</div>
              </div>
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white">
                <CheckCircle2 size={16} strokeWidth={2.5} className="text-[#3FA02A]" />
              </span>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={handleResolve}
                disabled={!isRealTicket || updateMutation.isPending || ticket.status === "Resolved"}
                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-2 text-[12px] font-semibold text-white shadow-[0_4px_12px_rgba(63,160,42,0.35)] transition-transform hover:-translate-y-0.5 disabled:opacity-50"
                style={{ background: "#3FA02A" }}
              >
                <CheckCircle2 size={13} strokeWidth={2.8} />
                {updateMutation.isPending ? "Saving…" : ticket.status === "Resolved" ? "Resolved" : "Mark Resolved"}
              </button>
              <button
                type="button"
                className="inline-flex items-center justify-center gap-1.5 rounded-full bg-white px-3 py-2 text-[12px] font-semibold ring-1 ring-black/10 transition-transform hover:-translate-y-0.5"
              >
                <UserPlus size={13} strokeWidth={2.5} />
                Reassign
              </button>
            </div>
          </div>

          {/* ticket details */}
          <CollapsibleSection title="Ticket Details" defaultOpen>
            <Row label="Status">
              <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold" style={{ background: STATUS_TONES[ticket.status].bg, color: STATUS_TONES[ticket.status].color }}>
                {ticket.status} <ChevronDown size={11} strokeWidth={2.5} />
              </span>
            </Row>
            <Row label="Priority">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FCE7F3] px-2.5 py-0.5 text-[11px] font-bold text-[#D63384]">
                <Flag size={10} strokeWidth={3} />
                High <ChevronDown size={11} strokeWidth={2.5} />
              </span>
            </Row>
            <Row label="Category">
              <span className="inline-flex items-center gap-1.5 font-semibold">
                <Tag size={11} strokeWidth={2.5} className="text-black/40" />
                Order Status
              </span>
            </Row>
            <Row label="Source"><span className="font-semibold">Web Chat</span></Row>
            <Row label="Created"><span className="font-medium text-black/65">May 20, 10:28 AM</span></Row>
            <Row label="Updated"><span className="font-medium text-black/65">May 20, 10:32 AM</span></Row>
          </CollapsibleSection>

          {/* customer details */}
          <CollapsibleSection title="Customer Details" defaultOpen>
            <div className="flex items-center gap-2.5">
              <span className="flex h-10 w-10 items-center justify-center rounded-full text-[12px] font-bold" style={{ background: "#F1ECFF", color: "#7C5CFF" }}>
                {ticket.initials}
              </span>
              <div className="min-w-0 leading-tight">
                <div className="truncate text-[13px] font-semibold">{ticket.name}</div>
                <span className="mt-0.5 inline-flex items-center gap-1 rounded-full bg-[#F1ECFF] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#7C5CFF]">
                  <Sparkles size={10} strokeWidth={2.8} />
                  Premium
                </span>
              </div>
            </div>
            <ul className="mt-3 space-y-1.5 text-[12px] font-medium text-black/65">
              <li className="inline-flex items-center gap-2"><Mail size={12} strokeWidth={2.5} className="text-black/45" /> john.doe@email.com</li>
              <li className="inline-flex items-center gap-2"><Phone size={12} strokeWidth={2.5} className="text-black/45" /> +1 234 567 8900</li>
              <li className="inline-flex items-center gap-2"><MapPin size={12} strokeWidth={2.5} className="text-black/45" /> New York, USA</li>
            </ul>
            <div className="mt-3 grid grid-cols-3 gap-2">
              <Stat label="Tickets" value="7" />
              <Stat label="Since" value="May 24" />
              <Stat label="LTV" value="$1,250" />
            </div>
          </CollapsibleSection>

          {/* internal note */}
          <CollapsibleSection title="Internal Note" defaultOpen>
            <div className="rounded-[14px] bg-[#FFF5DC] p-3 text-[12px] font-medium leading-relaxed text-black/70">
              Customer is a premium member. Previously had delivery delay issue in April.
            </div>
            <textarea
              value={internalNote}
              onChange={(e) => setInternalNote(e.target.value)}
              placeholder="Add internal note..."
              rows={2}
              className="mt-2 w-full resize-none rounded-[14px] bg-white px-3 py-2 text-[12px] font-medium ring-1 ring-black/10 placeholder:text-black/40 focus:outline-none focus:ring-[#7C5CFF]/40"
            />
          </CollapsibleSection>
        </aside>
      </main>

      {/* ============ BOTTOM STATS (compact) ============ */}
      <footer className="mt-3 flex w-full justify-center px-1">
        <div className="-mx-1 flex max-w-full items-center gap-1.5 overflow-x-auto rounded-full bg-white px-2 py-1.5 ring-1 ring-black/15 sm:flex-wrap sm:overflow-visible">
          <MiniStat tone="#E9F5E0" iconColor="#3FA02A" icon={<Folder size={12} strokeWidth={2.5} />} value="8" label="Open" />
          <MiniStat tone="#FFF5DC" iconColor="#C28A00" icon={<Hourglass size={12} strokeWidth={2.5} />} value="2" label="Pending" />
          <MiniStat tone="#FCE7F3" iconColor="#D63384" icon={<CheckCircle2 size={12} strokeWidth={2.5} />} value="12" label="Resolved" />
          <MiniStat tone="#F1ECFF" iconColor="#7C5CFF" icon={<Clock size={12} strokeWidth={2.5} />} value="2h 45m" label="Avg" />
        </div>
      </footer>
    </AppShell>
  );
}

/* ----------------------------- bits ----------------------------- */
function Row({ label, children }) {
  return (
    <div className="flex items-center justify-between py-1 text-[12px]">
      <span className="font-medium text-black/55">{label}</span>
      <span className="text-right">{children}</span>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-[12px] bg-white p-2 ring-1 ring-black/10">
      <div className="text-[12px] font-bold">{value}</div>
      <div className="text-[10px] font-medium text-black/55">{label}</div>
    </div>
  );
}

function IconBtn({ children, ...rest }) {
  return (
    <button
      type="button"
      {...rest}
      className="flex h-7 w-7 items-center justify-center rounded-full text-black/55 transition-colors hover:bg-white hover:text-black"
    >
      {children}
    </button>
  );
}

function MiniStat({ tone, iconColor, icon, value, label }) {
  return (
    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1" style={{ background: tone, color: iconColor }}>
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white">{icon}</span>
      <span className="text-[12px] font-bold leading-none">{value}</span>
      <span className="text-[11px] font-medium leading-none text-black/60">{label}</span>
    </span>
  );
}

function CollapsibleSection({ title, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-[18px] bg-[#FAFAF6]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-3 py-2.5"
        aria-expanded={open}
      >
        <span className="text-[11px] font-bold uppercase tracking-wide text-black/55">{title}</span>
        {open ? (
          <ChevronUp size={13} strokeWidth={2.5} className="text-black/45" />
        ) : (
          <ChevronDown size={13} strokeWidth={2.5} className="text-black/45" />
        )}
      </button>
      {open && <div className="px-3 pb-3">{children}</div>}
    </div>
  );
}
