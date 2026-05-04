import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useEscalationStore } from "@store/escalationStore";
import { useAuthStore } from "@store/authStore";
import { widget } from "@api/services/widget.service";
import { getWidgetSocket, disconnectWidgetSocket, SOCKET_EVENTS } from "@realtime/socket";
import UserMenu from "@components/UserMenu.jsx";
import {
  ArrowRight,
  Bot,
  Check,
  ChevronDown,
  ChevronRight,
  Headphones,
  Image as ImageIcon,
  Maximize2,
  Mic,
  Minimize2,
  MoreHorizontal,
  Package,
  PanelLeftClose,
  PanelLeftOpen,
  Paperclip,
  Pencil,
  Receipt,
  Search,
  Send,
  Settings,
  Smile,
  Sparkles,
  User,
  Wrench,
  X,
  Zap,
} from "lucide-react";

/* ----------------------------- initialization state ----------------------------- */
const defaultConvoId = 1;
const initialConversations = [
  {
    id: defaultConvoId,
    title: "New Conversation",
    preview: "Start typing\u2026",
    time: "Just now",
    Icon: Sparkles,
    iconColor: "#7C5CFF",
    tone: "#F1ECFF",
  },
];

const initialThreads = {
  [defaultConvoId]: [
    {
      id: 2,
      from: "bot",
      text: "Hi! How can I help you today?",
      time: "Just now",
    },
  ],
};

/* ----------------------------- page ----------------------------- */
const WIDGET_API_KEY = import.meta.env.VITE_WIDGET_API_KEY || "";
const WIDGET_LIVE = !!WIDGET_API_KEY && import.meta.env.VITE_USE_MOCK === "false";

const fmtTime = () =>
  new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

export default function Chat() {
  const [conversations, setConversations] = useState(initialConversations);
  const [threads, setThreads] = useState(initialThreads);
  const [activeId, setActiveId] = useState(1);
  const [draft, setDraft] = useState("");
  const [searchQ, setSearchQ] = useState("");
  const [mode, setMode] = useState("text"); // text | photo | voice
  const [fullscreen, setFullscreen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [escalating, setEscalating] = useState(false);
  const [ticketId, setTicketId] = useState(null);
  const [sending, setSending] = useState(false);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const fileInputRef = useRef(null);
  const scrollRef = useRef(null);
  const navigate = useNavigate();
  const addEscalation = useEscalationStore((s) => s.addEscalation);
  const authUser = useAuthStore((s) => s.user);

  const messages = threads[activeId] || [];
  const setMessages = (updater) =>
    setThreads((t) => ({
      ...t,
      [activeId]: typeof updater === "function" ? updater(t[activeId] || []) : updater,
    }));

  const filteredConversations = useMemo(() => {
    const q = searchQ.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter(
      (c) => c.title.toLowerCase().includes(q) || c.preview.toLowerCase().includes(q),
    );
  }, [conversations, searchQ]);

  const updateConvoPreview = (id, text) => {
    setConversations((cs) =>
      cs.map((c) => (c.id === id ? { ...c, preview: text.slice(0, 60), time: fmtTime() } : c)),
    );
  };

  const startNewConversation = () => {
    const id = Date.now();
    const newConvo = {
      id,
      title: "New Conversation",
      preview: "Start typing\u2026",
      time: fmtTime(),
      Icon: Sparkles,
      iconColor: "#7C5CFF",
      tone: "#F1ECFF",
    };
    setConversations((cs) => [newConvo, ...cs]);
    setThreads((t) => ({
      ...t,
      [id]: [
        { id: Date.now() + 1, from: "bot", text: "Hi! How can I help you today?", time: fmtTime() },
      ],
    }));
    setActiveId(id);
    setDraft("");
    setTicketId(null);
  };

  const clearActiveChat = () => {
    setMessages([
      { id: Date.now(), from: "bot", text: "Chat cleared. How can I help?", time: fmtTime() },
    ]);
    setMoreOpen(false);
  };

  const endChat = () => {
    setTicketId(null);
    setEmojiOpen(false);
    setMoreOpen(false);
    navigate("/");
  };

  const onPickFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setMessages((m) => [
      ...m,
      {
        id: Date.now(),
        from: "user",
        text: `\uD83D\uDCCE Attached: ${file.name} (${Math.round(file.size / 1024)} KB)`,
        time: fmtTime(),
      },
    ]);
    e.target.value = "";
  };

  const insertEmoji = (emoji) => {
    setDraft((d) => d + emoji);
    setEmojiOpen(false);
  };

  // ---- Live widget: subscribe to ticket room once a real ticket exists ----
  useEffect(() => {
    if (!WIDGET_LIVE || !ticketId) return;
    const sock = getWidgetSocket({
      apiKey: WIDGET_API_KEY,
      sessionToken: `sess_${ticketId}`,
    });
    sock.emit(SOCKET_EVENTS.CHAT_JOIN, { ticketId });
    const onMessage = ({ message }) => {
      if (!message || message.ticketId !== ticketId) return;
      // Skip messages we already rendered locally (customer echoes)
      if (message.senderType === "customer") return;
      setMessages((m) => [
        ...m,
        {
          id: message._id || Date.now(),
          from: message.senderType === "ai" ? "bot" : "agent",
          text: message.content,
          time: new Date(message.createdAt || Date.now()).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    };
    sock.on(SOCKET_EVENTS.CHAT_MESSAGE, onMessage);
    return () => {
      sock.off(SOCKET_EVENTS.CHAT_MESSAGE, onMessage);
      sock.emit(SOCKET_EVENTS.CHAT_LEAVE, { ticketId });
    };
  }, [ticketId]);

  // Tear down the widget socket when the page unmounts
  useEffect(() => () => disconnectWidgetSocket(), []);

  const handleEscalate = () => {
    if (escalating) return;
    setEscalating(true);
    const lastUser = [...messages].reverse().find((m) => m.from === "user");
    const preview = lastUser?.text || "Customer needs help from a human agent.";
    addEscalation({
      name: "Guest Customer",
      subject: "Escalated from AI chat",
      preview,
      transcript: messages.map(({ from, text, time }) => ({ from, text, time })),
    });
    setMessages((m) => [
      ...m,
      {
        id: Date.now(),
        from: "bot",
        text: "Connecting you with a support agent now\u2026",
        time: fmtTime(),
      },
    ]);
    setTimeout(() => navigate("/agent"), 700);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    // Only stick to bottom if user is already near the bottom (within 120px).
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    if (distanceFromBottom < 120) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages]);

  const send = async (e) => {
    e?.preventDefault();
    const text = draft.trim();
    if (!text || sending) return;
    const time = fmtTime();
    setMessages((m) => [...m, { id: Date.now(), from: "user", text, time }]);
    updateConvoPreview(activeId, text);
    setDraft("");
    setEmojiOpen(false);

    // ---- Live mode: backend round-trip via /widget/ticket + socket ----
    if (WIDGET_LIVE) {
      setSending(true);
      try {
        if (!ticketId) {
          // First message - create the ticket; AI auto-reply (if any) is in `messages`
          const res = await widget.createTicket({
            apiKey: WIDGET_API_KEY,
            content: text,
          });
          const newId = res?.ticket?._id;
          if (newId) {
            setTicketId(newId);
            (res.messages || [])
              .filter((m) => m.senderType === "ai")
              .forEach((m) =>
                setMessages((prev) => [
                  ...prev,
                  {
                    id: m._id,
                    from: "bot",
                    text: m.content,
                    time: new Date(m.createdAt || Date.now()).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    }),
                  },
                ]),
              );
          }
        } else {
          // Subsequent messages - push over socket; agent/AI replies arrive via the listener
          const sock = getWidgetSocket({
            apiKey: WIDGET_API_KEY,
            sessionToken: `sess_${ticketId}`,
          });
          sock.emit(SOCKET_EVENTS.CHAT_SEND, {
            ticketId,
            content: text,
            senderType: "customer",
          });
        }
      } catch (err) {
        setMessages((m) => [
          ...m,
          {
            id: Date.now() + 1,
            from: "bot",
            text: `Couldn't reach support: ${err?.message || "network error"}`,
            time: fmtTime(),
          },
        ]);
      } finally {
        setSending(false);
      }
      return;
    }

    // ---- Mock fallback (no API key configured) ----
    setSending(true);
    setTimeout(() => {
      const reply = mockReply(text);
      setMessages((m) => [
        ...m,
        { id: Date.now() + 1, from: "bot", text: reply, time: fmtTime() },
      ]);
      updateConvoPreview(activeId, reply);
      setSending(false);
    }, 900);
  };

  return (
    <div
      className={`flex w-full flex-col overflow-hidden ${
        fullscreen ? "fixed inset-0 z-50 h-screen" : "h-screen"
      }`}
      style={{ background: "#FAFAF6" }}
    >
      {/* ============ TOP BAR ============ */}
      {!fullscreen && (
      <header className="mx-auto flex w-full max-w-[1320px] shrink-0 items-center justify-between gap-2 px-3 pt-3 sm:gap-4 sm:px-5 sm:pt-5">
        <Link
          to="/"
          className="inline-flex shrink-0 items-center gap-2 rounded-[18px] bg-white px-2.5 py-2 shadow-[0_4px_16px_rgba(0,0,0,0.06)] ring-1 ring-black/10 transition-shadow hover:shadow-[0_6px_20px_rgba(0,0,0,0.08)] sm:gap-3 sm:px-4 sm:py-2.5"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full sm:h-9 sm:w-9" style={{ background: "#E9F5E0" }}>
            <Sparkles size={16} strokeWidth={2.5} className="text-[#3FA02A]" />
          </span>
          <span className="hidden font-display text-base uppercase tracking-wide sm:inline">AI Support</span>
        </Link>

        <div className="flex min-w-0 items-center gap-1.5 sm:gap-3">
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-white px-2.5 py-1.5 text-[11px] font-semibold shadow-[0_4px_16px_rgba(0,0,0,0.06)] ring-1 ring-black/10 sm:gap-2 sm:px-4 sm:py-2 sm:text-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#3FA02A] opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#3FA02A]" />
            </span>
            <span className="hidden sm:inline">Connected</span>
            <span className="sm:hidden">Live</span>
          </span>
          <button
            type="button"
            onClick={endChat}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold shadow-[0_4px_16px_rgba(0,0,0,0.08)] ring-1 ring-black/10 transition-transform hover:-translate-y-0.5 sm:gap-2 sm:px-5 sm:py-2.5 sm:text-sm"
            style={{ background: "#FFE9A8" }}
          >
            <X size={14} strokeWidth={2.8} />
            <span className="hidden sm:inline">End Chat</span>
            <span className="sm:hidden">End</span>
          </button>
          <UserMenu />
        </div>
      </header>
      )}

      {/* ============ MAIN GRID ============ */}
      <main
        className={`mx-auto grid min-h-0 w-full flex-1 grid-cols-1 gap-3 px-3 py-3 sm:gap-5 sm:px-5 sm:py-5 ${
          fullscreen ? "max-w-none" : "max-w-[1320px]"
        } ${sidebarOpen ? "lg:grid-cols-[320px_1fr]" : "lg:grid-cols-[84px_1fr]"}`}
      >
        {/* -------- SIDEBAR (collapsed rail) -------- */}
        {!sidebarOpen && (
          <aside
            className="hidden h-full min-h-0 flex-col items-center gap-3 rounded-[40px] bg-white p-3 shadow-[0_18px_44px_-12px_rgba(28,28,40,0.18),0_4px_12px_rgba(28,28,40,0.06)] ring-1 ring-black/10 lg:flex"
          >
            <button
              onClick={() => setSidebarOpen(true)}
              aria-label="Show conversations"
              title="Expand panel"
              className="flex h-11 w-11 items-center justify-center rounded-full bg-[#FAFAF6] transition-transform hover:-translate-y-0.5"
            >
              <PanelLeftOpen size={16} strokeWidth={2.5} />
            </button>
            <button
              aria-label="New conversation"
              title="New conversation"
              onClick={startNewConversation}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-[#F1ECFF] transition-transform hover:-translate-y-0.5"
            >
              <Pencil size={15} strokeWidth={2.5} className="text-[#7C5CFF]" />
            </button>
            <button
              aria-label="Search"
              title="Search"
              onClick={() => setSidebarOpen(true)}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-[#FAFAF6] transition-transform hover:-translate-y-0.5"
            >
              <Search size={15} strokeWidth={2.5} />
            </button>

            {/* mini conversation list */}
            <div className="mt-1 flex w-full flex-col items-center gap-2.5 overflow-y-auto px-1 py-1">
              {filteredConversations.map((c) => {
                const active = c.id === activeId;
                const Icon = c.Icon;
                return (
                  <button
                    key={c.id}
                    onClick={() => setActiveId(c.id)}
                    title={c.title}
                    className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-transform hover:-translate-y-0.5"
                    style={{
                      background: c.tone,
                      color: c.iconColor,
                      boxShadow: active ? "inset 0 0 0 2px #3FA02A" : undefined,
                    }}
                  >
                    <Icon size={16} strokeWidth={2.5} />
                    {active && (
                      <span className="absolute right-0 top-0 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#3FA02A]">
                        <Check size={8} strokeWidth={4} className="text-white" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-auto flex flex-col items-center gap-2">
              <span className="flex h-11 w-11 items-center justify-center rounded-full ring-2 ring-white" style={{ background: "#E9F5E0", color: "#3FA02A" }}>
                <User size={16} strokeWidth={2.5} />
              </span>
            </div>
          </aside>
        )}

        {/* -------- SIDEBAR (expanded capsule) -------- */}
        {sidebarOpen && (
        <aside
          className="hidden h-full min-h-0 flex-col rounded-[40px] bg-white p-4 shadow-[0_18px_44px_-12px_rgba(28,28,40,0.18),0_4px_12px_rgba(28,28,40,0.06)] ring-1 ring-black/10 lg:flex"
        >
          {/* sidebar head */}
          <div className="flex items-center justify-between px-2 pb-3">
            <div>
              <span className="font-display text-base uppercase tracking-wide">Chats</span>
              <div className="text-[12px] font-medium text-black/50">4 active conversations</div>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                aria-label="New conversation"
                onClick={startNewConversation}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F1ECFF] transition-transform hover:-translate-y-0.5"
              >
                <Pencil size={14} strokeWidth={2.5} className="text-[#7C5CFF]" />
              </button>
              <button
                onClick={() => setSidebarOpen(false)}
                aria-label="Hide conversations"
                title="Collapse panel"
                className="hidden h-9 w-9 items-center justify-center rounded-full bg-[#FAFAF6] transition-transform hover:-translate-y-0.5 lg:flex"
              >
                <PanelLeftClose size={15} strokeWidth={2.5} />
              </button>
            </div>
          </div>

          {/* search */}
          <div className="px-1 pb-3">
            <div className="flex items-center gap-2 rounded-full bg-[#F4F4EE] px-4 py-2.5">
              <Search size={14} strokeWidth={2.5} className="text-black/50" />
              <input
                type="text"
                value={searchQ}
                onChange={(e) => setSearchQ(e.target.value)}
                placeholder="Search conversations..."
                className="w-full bg-transparent text-sm font-medium placeholder:text-black/40 focus:outline-none"
              />
            </div>
          </div>

          {/* conversation list */}
          <ul className="flex-1 space-y-2 overflow-y-auto px-1 pb-2">
            {filteredConversations.map((c) => {
              const active = c.id === activeId;
              return (
                <li key={c.id}>
                  <button
                    onClick={() => setActiveId(c.id)}
                    className={`flex w-full items-center gap-3 rounded-[18px] p-3 text-left transition-all hover:-translate-y-0.5 ${
                      active ? "shadow-[0_6px_18px_rgba(0,0,0,0.06)]" : "hover:bg-[#FAFAF6]"
                    }`}
                    style={active ? { background: c.tone } : undefined}
                  >
                    <span
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
                      style={{ background: active ? "#fff" : c.tone, color: c.iconColor }}
                    >
                      <c.Icon size={16} strokeWidth={2.5} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-2">
                        <span className="truncate text-[14px] font-semibold">{c.title}</span>
                        <span className="shrink-0 text-[10px] font-semibold text-black/40">{c.time}</span>
                      </span>
                      <span className="mt-0.5 line-clamp-1 block text-[12px] font-medium text-black/55">
                        {c.preview}
                      </span>
                    </span>
                    {active && (
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#3FA02A] text-white">
                        <Check size={12} strokeWidth={3.5} />
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>

          {/* leaderboard pill */}
          <div className="mt-2 flex items-center justify-between rounded-[20px] bg-[#FFF5DC] p-2 pl-3">
            <div className="flex items-center gap-2">
              <span className="flex -space-x-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FCE7F3] ring-2 ring-white" style={{ color: "#D63384" }}>
                  <User size={13} strokeWidth={2.5} />
                </span>
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E9F5E0] ring-2 ring-white" style={{ color: "#3FA02A" }}>
                  <User size={13} strokeWidth={2.5} />
                </span>
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F1ECFF] ring-2 ring-white" style={{ color: "#7C5CFF" }}>
                  <User size={13} strokeWidth={2.5} />
                </span>
              </span>
              <span className="text-[13px] font-semibold">Top helpers</span>
            </div>
            <ChevronRight size={16} strokeWidth={2.5} />
          </div>

          {/* user profile */}
          <button
            type="button"
            onClick={() => navigate(authUser ? (authUser.role === "admin" ? "/admin" : "/agent") : "/login")}
            className="mt-3 flex w-full items-center gap-3 rounded-[18px] bg-[#FAFAF6] p-3 text-left transition-transform hover:-translate-y-0.5"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full text-[12px] font-bold" style={{ background: "#E9F5E0", color: "#3FA02A" }}>
              {authUser?.initials || "GU"}
            </span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[13px] font-semibold">{authUser?.name || "Guest User"}</div>
              <div className="truncate text-[11px] font-medium text-black/55">{authUser?.email || "Sign in to sync"}</div>
            </div>
            <ChevronDown size={14} strokeWidth={2.5} />
          </button>
        </aside>
        )}

        {/* -------- CHAT PANEL -------- */}
        <section
          className="flex h-full min-h-0 flex-col overflow-hidden rounded-[24px] bg-white shadow-[0_18px_44px_-12px_rgba(28,28,40,0.18),0_4px_12px_rgba(28,28,40,0.06)] ring-1 ring-black/10 sm:rounded-[40px]"
        >
          {/* chat header */}
          <div className="flex items-center justify-between gap-2 border-b border-black/5 px-3 py-3 sm:gap-3 sm:px-6 sm:py-4">
            <div className="flex min-w-0 items-center gap-2 sm:gap-3">
              <span className="relative shrink-0">
                <span className="flex h-10 w-10 items-center justify-center rounded-full sm:h-11 sm:w-11" style={{ background: "#E9F5E0", color: "#3FA02A" }}>
                  <Bot size={18} strokeWidth={2.5} />
                </span>
                <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-[#3FA02A] ring-2 ring-white" />
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="truncate text-[14px] font-semibold sm:text-[15px]">AI Assistant</span>
                  <span className="rounded-full bg-[#F1ECFF] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#7C5CFF]">
                    Bot
                  </span>
                </div>
                <div className="truncate text-[11px] font-medium text-black/55 sm:text-[12px]">Always here to help</div>
              </div>
            </div>
            <div className="relative flex shrink-0 items-center gap-1.5 sm:gap-2">
              <button
                onClick={() => setFullscreen((v) => !v)}
                aria-label={fullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                className="hidden h-9 w-9 items-center justify-center rounded-full bg-[#FAFAF6] transition-transform hover:-translate-y-0.5 sm:flex"
              >
                {fullscreen ? (
                  <Minimize2 size={15} strokeWidth={2.5} />
                ) : (
                  <Maximize2 size={15} strokeWidth={2.5} />
                )}
              </button>
              <button
                onClick={() => setMoreOpen((v) => !v)}
                aria-label="More"
                className="relative flex h-9 w-9 items-center justify-center rounded-full bg-[#FAFAF6] transition-transform hover:-translate-y-0.5"
              >
                <MoreHorizontal size={16} strokeWidth={2.5} />
              </button>
              {moreOpen && (
                <div className="absolute right-0 top-12 z-30 w-48 rounded-2xl bg-white p-2 shadow-[0_18px_44px_-12px_rgba(28,28,40,0.22)] ring-1 ring-black/10">
                  <button onClick={clearActiveChat} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-[13px] font-semibold hover:bg-[#FAFAF6]">
                    <Pencil size={13} strokeWidth={2.5} /> Clear chat
                  </button>
                  <button onClick={() => { setMoreOpen(false); setFullscreen((v) => !v); }} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-[13px] font-semibold hover:bg-[#FAFAF6]">
                    {fullscreen ? <Minimize2 size={13} strokeWidth={2.5} /> : <Maximize2 size={13} strokeWidth={2.5} />}
                    {fullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                  </button>
                  <button onClick={endChat} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-[13px] font-semibold text-[#D63384] hover:bg-[#FCE7F3]">
                    <X size={13} strokeWidth={2.5} /> End chat
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* messages */}
          <div ref={scrollRef} className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-3 py-4 sm:space-y-5 sm:px-6 sm:py-5">
            {/* date divider */}
            <div className="flex items-center gap-3">
              <span className="h-px flex-1 bg-black/10" />
              <span className="rounded-full bg-[#FAFAF6] px-3 py-1 text-[11px] font-semibold tracking-wide text-black/50">
                May 20, 2025
              </span>
              <span className="h-px flex-1 bg-black/10" />
            </div>

            {messages.map((m) =>
              m.from === "bot" ? (
                <div key={m.id} className="flex items-end gap-2.5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full" style={{ background: "#E9F5E0", color: "#3FA02A" }}>
                    <Bot size={15} strokeWidth={2.5} />
                  </span>
                  <div className="max-w-[75%]">
                    <div
                      className="whitespace-pre-line rounded-[20px] rounded-bl-[6px] px-4 py-2.5 text-[14px] font-medium leading-relaxed"
                      style={{ background: "#F4F4EE" }}
                    >
                      {m.text}
                    </div>
                    <div className="mt-1 pl-2 text-[11px] font-semibold text-black/40">{m.time}</div>
                  </div>
                </div>
              ) : (
                <div key={m.id} className="flex items-end justify-end gap-2.5">
                  <div className="max-w-[75%]">
                    <div
                      className="whitespace-pre-line rounded-[20px] rounded-br-[6px] px-4 py-2.5 text-[14px] font-medium leading-relaxed text-black"
                      style={{ background: "#FFE9A8" }}
                    >
                      {m.text}
                    </div>
                    <div className="mt-1 pr-2 text-right text-[11px] font-semibold text-black/40">{m.time}</div>
                  </div>
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full" style={{ background: "#FCE7F3", color: "#D63384" }}>
                    <User size={15} strokeWidth={2.5} />
                  </span>
                </div>
              ),
            )}

            {/* typing indicator */}
            {sending && (
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full" style={{ background: "#E9F5E0", color: "#3FA02A" }}>
                  <Bot size={15} strokeWidth={2.5} />
                </span>
                <div className="inline-flex items-center gap-2 rounded-full bg-[#F4F4EE] px-3.5 py-2">
                  <span className="flex gap-1">
                    <span className="typing-dot" />
                    <span className="typing-dot" style={{ animationDelay: "0.15s" }} />
                    <span className="typing-dot" style={{ animationDelay: "0.3s" }} />
                  </span>
                  <span className="text-[11px] font-semibold text-black/55">AI is typing</span>
                </div>
              </div>
            )}
          </div>

          {/* input bar */}
          <form onSubmit={send} className="border-t border-black/5 p-2 sm:p-4">
            <div className="flex items-center gap-1.5 rounded-full bg-[#F4F4EE] px-2 py-1.5 sm:gap-2 sm:px-3 sm:py-2">
              {/* mode switcher (text / photo / voice) - hidden on small */}
              <div className="hidden items-center gap-1 rounded-full bg-white p-1 shadow-[0_2px_8px_rgba(0,0,0,0.04)] sm:flex">
                {[
                  { key: "text",  Icon: Pencil },
                  { key: "photo", Icon: ImageIcon },
                  { key: "voice", Icon: Mic },
                ].map(({ key, Icon }) => {
                  const sel = mode === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setMode(key)}
                      className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
                        sel ? "" : "text-black/50 hover:text-black"
                      }`}
                      style={sel ? { background: "#FFE9A8" } : undefined}
                    >
                      <Icon size={14} strokeWidth={2.5} />
                    </button>
                  );
                })}
              </div>

              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Type your message..."
                className="min-w-0 flex-1 bg-transparent px-2 text-[13px] font-medium placeholder:text-black/40 focus:outline-none sm:text-[14px]"
              />

              <button type="button" aria-label="Attach" onClick={() => fileInputRef.current?.click()} className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-full text-black/50 hover:text-black sm:flex">
                <Paperclip size={16} strokeWidth={2.5} />
              </button>
              <input ref={fileInputRef} type="file" hidden onChange={onPickFile} />
              <div className="relative shrink-0">
                <button type="button" aria-label="Emoji" onClick={() => setEmojiOpen((v) => !v)} className="flex h-9 w-9 items-center justify-center rounded-full text-black/50 hover:text-black">
                  <Smile size={16} strokeWidth={2.5} />
                </button>
                {emojiOpen && (
                  <div className="absolute bottom-12 right-0 z-20 grid grid-cols-6 gap-1 rounded-2xl bg-white p-2 shadow-[0_18px_44px_-12px_rgba(28,28,40,0.22)] ring-1 ring-black/10">
                    {["\uD83D\uDE00", "\uD83D\uDE02", "\uD83D\uDE0D", "\uD83D\uDC4D", "\uD83D\uDE4F", "\uD83C\uDF89", "\u2764\uFE0F", "\uD83D\uDD25", "\u2728", "\uD83D\uDE0A", "\uD83D\uDC4B", "\uD83D\uDCAF"].map((e) => (
                      <button key={e} type="button" onClick={() => insertEmoji(e)} className="h-8 w-8 rounded-lg text-lg hover:bg-[#FAFAF6]">
                        {e}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="submit"
                aria-label="Send"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white shadow-[0_4px_12px_rgba(63,160,42,0.35)] transition-transform hover:-translate-y-0.5 sm:h-10 sm:w-10"
                style={{ background: "#3FA02A" }}
              >
                <Send size={15} strokeWidth={2.8} />
              </button>
            </div>
          </form>

          {/* compact flow strip + AI confidence + agent button - bottom of chat panel */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-black/5 px-3 py-2 sm:px-4 sm:py-2.5">
            {/* AI confidence chip */}
            <div className="inline-flex min-w-0 items-center gap-2 rounded-full px-3 py-1" style={{ background: "#F1ECFF" }} title="Intent: Order Status Inquiry">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white">
                <Sparkles size={11} strokeWidth={2.5} className="text-[#7C5CFF]" />
              </span>
              <span className="text-[11px] font-semibold text-[#7C5CFF]">85%</span>
              <span className="hidden h-1 w-16 overflow-hidden rounded-full bg-white/70 sm:block">
                <span className="block h-full rounded-full" style={{ width: "85%", background: "#7C5CFF" }} />
              </span>
              <span className="hidden truncate text-[11px] font-medium text-black/55 md:inline">Order Status</span>
            </div>

            {/* flow steps */}
            <div className="hidden items-center gap-1.5 sm:flex sm:gap-2">
              <MiniFlowStep tone="#F1ECFF" iconColor="#7C5CFF" icon={<Bot size={12} strokeWidth={2.5} />} label="AI" />
              <MiniArrow />
              <MiniFlowStep tone="#FFF5DC" iconColor="#C28A00" icon={<Zap size={12} strokeWidth={2.5} />} label="Escalate" />
              <MiniArrow />
              <MiniFlowStep tone="#FCE7F3" iconColor="#D63384" icon={<Headphones size={12} strokeWidth={2.5} />} label="Agent" />
              <MiniArrow />
              <MiniFlowStep tone="#E9F5E0" iconColor="#3FA02A" icon={<Sparkles size={12} strokeWidth={2.5} />} label="Resolved" />
            </div>

            {/* connect to agent */}
            <div className="flex shrink-0 items-center gap-2">
              <span className="hidden text-[11px] font-medium text-black/55 md:inline">Can't resolve?</span>
              <button
                type="button"
                onClick={handleEscalate}
                disabled={escalating}
                className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[11px] font-semibold shadow-[0_2px_8px_rgba(0,0,0,0.04)] ring-1 ring-black/10 transition-transform hover:-translate-y-0.5 disabled:opacity-60"
              >
                <Headphones size={12} strokeWidth={2.5} className="text-[#D63384]" />
                {escalating ? "Connecting\u2026" : "Connect to Agent"}
              </button>
            </div>
          </div>
        </section>
      </main>

    </div>
  );
}

/* ----------------------------- bits ----------------------------- */
function FlowStep({ tone, iconColor, icon, title, sub }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full" style={{ background: tone, color: iconColor }}>
        {icon}
      </span>
      <div className="min-w-0">
        <div className="text-[14px] font-semibold leading-tight">{title}</div>
        <div className="text-[12px] font-medium text-black/55">{sub}</div>
      </div>
    </div>
  );
}

function FlowArrow() {
  return (
    <div className="hidden items-center justify-center text-black/30 md:flex">
      <ArrowRight size={20} strokeWidth={2.5} />
    </div>
  );
}

function MiniFlowStep({ tone, iconColor, icon, label }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1" style={{ background: tone, color: iconColor }}>
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white">{icon}</span>
      <span className="text-[11px] font-semibold">{label}</span>
    </span>
  );
}

function MiniArrow() {
  return <ArrowRight size={12} strokeWidth={2.5} className="shrink-0 text-black/30" />;
}

function mockReply(text) {
  const t = text.toLowerCase();
  if (t.includes("refund")) return "I can help with that refund. Could you share the order ID?";
  if (t.includes("order")) return "Let me check that order for you. One moment\u2026";
  if (t.includes("hi") || t.includes("hello")) return "Hi there! How can I help today?";
  if (t.includes("thanks") || t.includes("thank")) return "You're welcome! \u2728";
  return "Got it \u2014 let me look into that for you right away!";
}
