import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ChevronDown,
  LayoutDashboard,
  LogIn,
  LogOut,
  Settings as SettingsIcon,
  User as UserIcon,
  UserPlus,
} from "lucide-react";
import { useAuthStore } from "@store/authStore";

/**
 * Shared profile / auth menu used by Topbar and the public Chat page.
 *
 * - When logged out: shows "Sign in" + "Register" pills.
 * - When logged in: shows avatar + name with a dropdown
 *      (Dashboard, Profile, Settings, Sign out).
 */
export default function UserMenu({ compact = false }) {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center gap-2">
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-semibold ring-1 ring-black/15 transition-transform hover:-translate-y-0.5"
        >
          <LogIn size={14} strokeWidth={2.5} />
          Sign in
        </Link>
        {!compact && (
          <Link
            to="/register"
            className="hidden items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold ring-1 ring-black/15 transition-transform hover:-translate-y-0.5 sm:inline-flex"
            style={{ background: "#C4F37A" }}
          >
            <UserPlus size={14} strokeWidth={2.5} />
            Register
          </Link>
        )}
      </div>
    );
  }

  const name = user.name || user.email || "User";
  const role = user.roleLabel || user.role || "";
  const initials = user.initials || name.slice(0, 2).toUpperCase();
  const home = user.role === "admin" ? "/admin" : "/agent";

  const onSignOut = () => {
    clearAuth();
    setOpen(false);
    navigate("/login", { replace: true });
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="inline-flex items-center gap-2.5 rounded-full bg-white py-1.5 pl-1.5 pr-3 ring-1 ring-black/15 transition-shadow hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)]"
      >
        <span
          className="flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-bold"
          style={{ background: "#F1ECFF", color: "#7C5CFF" }}
        >
          {initials}
        </span>
        {!compact && (
          <span className="hidden text-left leading-tight sm:block">
            <span className="block text-[12px] font-semibold">{name}</span>
            <span className="block text-[10px] font-medium text-black/55">{role}</span>
          </span>
        )}
        <ChevronDown size={14} strokeWidth={2.5} className="text-black/50" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-60 overflow-hidden rounded-2xl bg-white p-2 shadow-[0_18px_44px_-12px_rgba(28,28,40,0.22),0_4px_12px_rgba(28,28,40,0.08)] ring-1 ring-black/10"
        >
          <div className="flex items-center gap-3 rounded-xl bg-[#FAFAF6] px-3 py-2.5">
            <span
              className="flex h-9 w-9 items-center justify-center rounded-full text-[12px] font-bold"
              style={{ background: "#F1ECFF", color: "#7C5CFF" }}
            >
              {initials}
            </span>
            <div className="min-w-0 leading-tight">
              <div className="truncate text-[13px] font-semibold">{name}</div>
              <div className="truncate text-[11px] text-black/55">{user.email}</div>
            </div>
          </div>

          <div className="mt-2 flex flex-col">
            <MenuLink to={home} icon={LayoutDashboard} label="Dashboard" onClick={() => setOpen(false)} />
            <MenuLink to="/admin/settings" icon={UserIcon} label="Profile" onClick={() => setOpen(false)} />
            <MenuLink to="/admin/settings" icon={SettingsIcon} label="Settings" onClick={() => setOpen(false)} />
            <button
              type="button"
              role="menuitem"
              onClick={onSignOut}
              className="mt-1 flex items-center gap-2.5 rounded-xl px-3 py-2 text-left text-[13px] font-semibold text-[#D63384] hover:bg-[#FCE7F3]"
            >
              <LogOut size={14} strokeWidth={2.5} />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function MenuLink({ to, icon: Icon, label, onClick }) {
  return (
    <Link
      to={to}
      role="menuitem"
      onClick={onClick}
      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] font-semibold hover:bg-[#FAFAF6]"
    >
      <Icon size={14} strokeWidth={2.5} className="text-black/60" />
      {label}
    </Link>
  );
}
