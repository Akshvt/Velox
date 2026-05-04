import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Bell,
  CheckCheck,
  CircleAlert,
  MessageSquare,
  Sparkles,
  Ticket,
  UserPlus,
  X,
} from "lucide-react";

/**
 * NotificationsMenu - bell icon + dropdown panel.
 *
 * Backend-ready: this is a pure UI shell. Replace the `useMockNotifications`
 * hook with a real one (e.g. `useNotifications()` backed by react-query)
 * and wire up `onMarkAllRead` / `onMarkRead` / `onDismiss` to real endpoints.
 *
 * Expected notification shape:
 *   {
 *     id:        string,
 *     type:      "ticket" | "mention" | "escalation" | "ai" | "agent" | "system",
 *     title:     string,
 *     body?:     string,
 *     href?:     string,             // route to navigate to on click
 *     createdAt: string | number,    // ISO or epoch ms
 *     read:      boolean,
 *   }
 *
 * Suggested API contract for the backend:
 *   GET    /api/notifications?limit=20&unreadOnly=false   -> { items: Notification[], unreadCount: number }
 *   POST   /api/notifications/:id/read                    -> 204
 *   POST   /api/notifications/read-all                    -> 204
 *   DELETE /api/notifications/:id                         -> 204
 *   WebSocket event "notification:new" -> Notification    (push to top of list)
 */

const TYPE_META = {
  ticket:     { Icon: Ticket,        bg: "#E9F5E0", color: "#3FA02A" },
  mention:    { Icon: MessageSquare, bg: "#F1ECFF", color: "#7C5CFF" },
  escalation: { Icon: CircleAlert,   bg: "#FCE7F3", color: "#D63384" },
  ai:         { Icon: Sparkles,      bg: "#FFE9A8", color: "#8a6d00" },
  agent:      { Icon: UserPlus,      bg: "#FFF5DC", color: "#C28A00" },
  system:     { Icon: Bell,          bg: "#FAFAF6", color: "#5B5B57" },
};

/* ---------- mock data hook (swap with a real one wired to backend) ---------- */
function useMockNotifications() {
  const [items, setItems] = useState(() => {
    const now = Date.now();
    return [
      { id: "n1", type: "escalation", title: "New escalation from Live Chat", body: "Guest customer asked for a human agent.",            href: "/agent",                createdAt: now - 1 * 60 * 1000,  read: false },
      { id: "n2", type: "ticket",     title: "Ticket #ESC-MONVKM36 updated",  body: "Status changed: Open → In Progress",                 href: "/agent",                createdAt: now - 12 * 60 * 1000, read: false },
      { id: "n3", type: "mention",    title: "Sarah mentioned you",           body: "“Could you take a look at the refund flow?”",        href: "/admin",                createdAt: now - 45 * 60 * 1000, read: false },
      { id: "n4", type: "ai",         title: "AI suggested 3 replies",        body: "Tap to review and send the best fit.",               href: "/agent",                createdAt: now - 2 * 60 * 60 * 1000, read: true  },
      { id: "n5", type: "agent",      title: "New agent joined: Mike",        body: "Mike has joined the Support team.",                  href: "/admin/agents",         createdAt: now - 5 * 60 * 60 * 1000, read: true  },
      { id: "n6", type: "system",     title: "Weekly report is ready",        body: "Last week's performance summary is now available.",  href: "/admin/reports",        createdAt: now - 26 * 60 * 60 * 1000, read: true  },
    ];
  });

  const unreadCount = items.filter((n) => !n.read).length;
  const markRead    = (id) => setItems((xs) => xs.map((n) => (n.id === id ? { ...n, read: true } : n)));
  const markAllRead = ()   => setItems((xs) => xs.map((n) => ({ ...n, read: true })));
  const dismiss     = (id) => setItems((xs) => xs.filter((n) => n.id !== id));

  return { items, unreadCount, markRead, markAllRead, dismiss };
}

/* ---------- helpers ---------- */
function timeAgo(ts) {
  const diff = Math.max(0, Date.now() - new Date(ts).getTime());
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  return `${d}d`;
}

/* ---------- component ---------- */
export default function NotificationsMenu() {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const { items, unreadCount, markRead, markAllRead, dismiss } = useMockNotifications();

  // close on outside click / ESC
  useEffect(() => {
    if (!open) return;
    const onClick = (e) => {
      if (!wrapRef.current?.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Notifications"
        aria-haspopup="menu"
        aria-expanded={open}
        className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white ring-1 ring-black/15 transition-shadow hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)]"
      >
        <Bell size={16} strokeWidth={2.5} />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#D63384] px-1 text-[9px] font-bold text-white ring-2 ring-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="fixed inset-x-2 top-16 z-50 max-h-[78vh] overflow-hidden rounded-[20px] bg-white shadow-[0_18px_44px_-12px_rgba(28,28,40,0.22)] ring-1 ring-black/10 sm:absolute sm:inset-x-auto sm:right-0 sm:top-12 sm:w-[360px]"
        >
          {/* header */}
          <div className="flex items-center justify-between border-b border-black/5 px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="font-display text-[14px] uppercase tracking-wide">Notifications</span>
              {unreadCount > 0 && (
                <span className="rounded-full bg-[#FCE7F3] px-2 py-0.5 text-[10px] font-bold text-[#D63384]">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllRead}
                  className="inline-flex items-center gap-1 rounded-full bg-[#FAFAF6] px-2.5 py-1 text-[11px] font-semibold text-black/65 transition-colors hover:bg-black/5"
                >
                  <CheckCheck size={12} strokeWidth={2.5} />
                  Mark all read
                </button>
              )}
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="flex h-7 w-7 items-center justify-center rounded-full text-black/55 hover:bg-[#FAFAF6]"
              >
                <X size={14} strokeWidth={2.5} />
              </button>
            </div>
          </div>

          {/* list */}
          <ul className="max-h-[60vh] divide-y divide-black/5 overflow-y-auto">
            {items.length === 0 && (
              <li className="px-4 py-10 text-center text-[12px] font-medium text-black/45">
                You're all caught up.
              </li>
            )}
            {items.map((n) => {
              const meta = TYPE_META[n.type] || TYPE_META.system;
              const Icon = meta.Icon;
              const Inner = (
                <div className={`flex items-start gap-3 px-4 py-3 transition-colors ${n.read ? "opacity-75" : "bg-[#FFFCEF]"} hover:bg-[#FAFAF6]`}>
                  <span
                    className="relative mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                    style={{ background: meta.bg, color: meta.color }}
                  >
                    <Icon size={15} strokeWidth={2.5} />
                    {!n.read && (
                      <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-[#D63384] ring-2 ring-white" />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className={`truncate text-[13px] ${n.read ? "font-semibold text-black/70" : "font-bold text-black"}`}>
                        {n.title}
                      </span>
                      <span className="shrink-0 text-[10px] font-semibold text-black/45">{timeAgo(n.createdAt)}</span>
                    </div>
                    {n.body && (
                      <p className="mt-0.5 line-clamp-2 text-[11.5px] font-medium leading-snug text-black/55">
                        {n.body}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      dismiss(n.id);
                    }}
                    aria-label="Dismiss"
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-black/40 hover:bg-black/5 hover:text-black"
                  >
                    <X size={12} strokeWidth={2.5} />
                  </button>
                </div>
              );
              return (
                <li key={n.id}>
                  {n.href ? (
                    <Link
                      to={n.href}
                      onClick={() => {
                        markRead(n.id);
                        setOpen(false);
                      }}
                      className="block"
                    >
                      {Inner}
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={() => markRead(n.id)}
                      className="block w-full text-left"
                    >
                      {Inner}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>

          {/* footer */}
          <div className="border-t border-black/5 px-4 py-2.5 text-center">
            <Link
              to="/admin/notifications"
              onClick={() => setOpen(false)}
              className="text-[12px] font-semibold text-[#7C5CFF] hover:underline"
            >
              View all notifications →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
