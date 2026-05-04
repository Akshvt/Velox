import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuthStore } from "@store/authStore";
import {
  BarChart3,
  BookOpen,
  ChevronDown,
  ChevronRight,
  FileBarChart,
  LayoutDashboard,
  LogOut,
  MessageCircleQuestion,
  Settings,
  Sparkles,
  Ticket,
  UsersRound,
  X,
} from "lucide-react";

/**
 * Single source of truth for the app sidebar.
 * Used by every authenticated screen (Agent / Admin / Analytics / Settings / KB / FAQ / Reports / Integrations).
 *
 * Active item is auto-derived from the current route, but can be forced via `active` prop.
 */
export const NAV_ITEMS = [
  { key: "dashboard",  label: "Dashboard",      icon: LayoutDashboard,        to: "/admin",                roles: ["admin"] },
  { key: "tickets",    label: "Tickets",        icon: Ticket,                 to: "/agent",                roles: ["agent", "admin"] },
  { key: "agents",     label: "Agents",         icon: UsersRound,             to: "/admin/agents",         roles: ["admin"] },
  { key: "analytics",  label: "Analytics",      icon: BarChart3,              to: "/admin/analytics",      roles: ["admin"] },
  { key: "kb",         label: "Knowledge Base", icon: BookOpen,               to: "/admin/knowledge-base", roles: ["agent", "admin"] },
  { key: "faq",        label: "FAQ",            icon: MessageCircleQuestion,  to: "/admin/faq",            roles: ["agent", "admin"] },
  { key: "reports",    label: "Reports",        icon: FileBarChart,           to: "/admin/reports",        roles: ["admin"] },
  { key: "settings",   label: "Settings",       icon: Settings,               to: "/admin/settings",       roles: ["agent", "admin"] },
];

const ROUTE_TO_KEY = {
  "/admin": "dashboard",
  "/agent": "tickets",
  "/admin/agents": "agents",
  "/admin/analytics": "analytics",
  "/admin/knowledge-base": "kb",
  "/admin/faq": "faq",
  "/admin/reports": "reports",
  "/admin/settings": "settings",
};

export default function Sidebar({ active, user, mobileOpen = false, onClose }) {
  const location = useLocation();
  const navigate = useNavigate();
  const storeUser = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const activeKey = active ?? ROUTE_TO_KEY[location.pathname] ?? "dashboard";

  // lock body scroll when mobile drawer is open
  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  // close on ESC
  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen, onClose]);

  const resolvedUser = user ||
    (storeUser
      ? {
          name: storeUser.name || storeUser.email || "User",
          role: storeUser.roleLabel || storeUser.role || "",
          initials: storeUser.initials || "U",
        }
      : { name: "Guest", role: "", initials: "G" });

  const currentRole = storeUser?.role;
  const visibleNav = NAV_ITEMS.filter(
    (item) => !item.roles || !currentRole || item.roles.includes(currentRole),
  );

  const handleLogout = () => {
    // Best-effort: clear refresh-token cookie on the server. Don't block UI.
    import("@api/services/auth.service")
      .then(({ auth }) => auth.logout().catch(() => {}))
      .catch(() => {});
    clearAuth();
    navigate("/login", { replace: true });
  };

  return (
    <>
      {/* mobile backdrop */}
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close menu"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[260px] max-w-[85vw] flex-col gap-2 overflow-y-auto bg-[#FAF6E9] p-4 shadow-[12px_0_40px_rgba(0,0,0,0.18)] transition-transform duration-300 ease-out lg:static lg:z-auto lg:w-[248px] lg:shrink-0 lg:overflow-visible lg:bg-transparent lg:shadow-none lg:transition-none ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* mobile close button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close menu"
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white ring-1 ring-black/15 lg:hidden"
        >
          <X size={16} strokeWidth={2.5} />
        </button>

        {/* brand */}
        <Link
          to="/"
          onClick={onClose}
          className="flex items-center gap-2.5 rounded-[18px] bg-white px-3 py-2.5 ring-1 ring-black/15"
        >
        <span className="flex h-9 w-9 items-center justify-center rounded-full" style={{ background: "#E9F5E0" }}>
          <Sparkles size={16} strokeWidth={2.5} className="text-[#3FA02A]" />
        </span>
        <span className="leading-tight">
          <span className="block font-display text-[13px] uppercase tracking-wide">AI Support</span>
          <span className="block text-[10px] font-medium text-black/55">Platform</span>
        </span>
      </Link>

      {/* nav */}
      <nav className="mt-2 flex flex-1 flex-col gap-1.5 overflow-y-auto rounded-[32px] bg-white p-2.5 shadow-[0_2px_0_rgba(0,0,0,0.03)] ring-1 ring-black/15">
        {visibleNav.map((item) => {
          const Icon = item.icon;
          const sel = activeKey === item.key;
          return (
            <Link
              key={item.key}
              to={item.to}
              className={`flex items-center gap-3 rounded-[16px] px-3 py-2.5 text-left text-[13px] font-semibold transition-colors ${
                sel ? "text-black ring-1 ring-black/10" : "text-black/65 hover:bg-[#FAFAF6]"
              }`}
              style={sel ? { background: "#E9F5E0" } : undefined}
            >
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full ${
                  sel ? "bg-white ring-1 ring-black/10" : "text-black/55"
                }`}
                style={sel ? { color: "#3FA02A" } : undefined}
              >
                <Icon size={14} strokeWidth={2.5} />
              </span>
              <span className="flex-1 truncate">{item.label}</span>
              {sel && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full text-white" style={{ background: "#3FA02A" }}>
                  <ChevronRight size={11} strokeWidth={3} />
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* profile */}
      <div className="rounded-[20px] bg-white p-3 ring-1 ring-black/15">
        <div className="flex items-center gap-2.5">
          <span
            className="flex h-9 w-9 items-center justify-center rounded-full text-[11px] font-bold"
            style={{ background: "#F1ECFF", color: "#7C5CFF" }}
          >
            {resolvedUser.initials}
          </span>
          <div className="min-w-0 flex-1 leading-tight">
            <div className="truncate text-[12px] font-semibold">{resolvedUser.name}</div>
            <div className="text-[10px] font-medium text-black/55">{resolvedUser.role}</div>
          </div>
          <ChevronDown size={13} strokeWidth={2.5} className="text-black/40" />
        </div>
      </div>

      <button
        type="button"
        onClick={handleLogout}
        className="flex items-center gap-2.5 rounded-[14px] px-3 py-2.5 text-[12px] font-semibold text-black/60 hover:bg-white"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#FCE7F3] text-[#D63384]">
          <LogOut size={13} strokeWidth={2.5} />
        </span>
        Log Out
      </button>
    </aside>
    </>
  );
}
