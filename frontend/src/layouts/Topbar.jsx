import { Building2, ChevronDown, Menu, Search } from "lucide-react";
import { useAuthStore } from "@store/authStore";
import UserMenu from "@components/UserMenu.jsx";
import NotificationsMenu from "@components/NotificationsMenu.jsx";
import HelpMenu from "@components/HelpMenu.jsx";

/**
 * Shared top navigation bar.
 * Used by every authenticated screen above the page content.
 *
 * Props:
 *   - searchPlaceholder?: string
 *   - notifCount?: number
 *   - tenants?: string[]              // optional tenant switcher list
 *   - activeTenant?: string
 *   - onTenantChange?: (t) => void
 *   - user?: { name, role, initials } // falls back to authStore user
 *   - onMenu?: () => void             // mobile menu trigger
 */
export default function Topbar({
  searchPlaceholder = "Search tickets, users, agents...",
  notifCount = 5,
  tenants = ["Acme Inc.", "Globex", "Initech"],
  activeTenant = "Acme Inc.",
  onTenantChange,
  user,
  onMenu,
}) {
  const storeUser = useAuthStore((s) => s.user);
  const resolvedUser = user ||
    (storeUser
      ? {
          name: storeUser.name || storeUser.email || "User",
          role: storeUser.roleLabel || storeUser.role || "",
          initials: storeUser.initials || "U",
        }
      : { name: "Guest", role: "", initials: "G" });
  return (
    <header className="flex shrink-0 items-center gap-2 px-3 pt-3 sm:gap-2.5 sm:px-5 sm:pt-5">
      {/* mobile menu */}
      <button
        onClick={onMenu}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white ring-1 ring-black/15 lg:hidden"
        aria-label="Open menu"
      >
        <Menu size={16} strokeWidth={2.5} />
      </button>

      {/* search */}
      <div className="flex min-w-0 flex-1 items-center gap-2 rounded-full bg-white px-3 py-2 ring-1 ring-black/15 sm:px-4 sm:py-2.5">
        <Search size={14} strokeWidth={2.5} className="shrink-0 text-black/50" />
        <input
          placeholder={searchPlaceholder}
          className="w-full min-w-0 bg-transparent text-xs font-medium placeholder:text-black/40 focus:outline-none sm:text-sm"
        />
        <span className="hidden rounded-md bg-[#FAFAF6] px-2 py-0.5 text-[10px] font-bold text-black/50 sm:inline-block">
          ⌘K
        </span>
      </div>

      {/* tenant switcher */}
      {tenants?.length ? (
        <label className="hidden items-center gap-2 rounded-full bg-white px-3 py-2 text-[12px] font-semibold ring-1 ring-black/15 md:inline-flex">
          <span className="flex h-6 w-6 items-center justify-center rounded-full" style={{ background: "#F1ECFF", color: "#7C5CFF" }}>
            <Building2 size={12} strokeWidth={2.5} />
          </span>
          <select
            value={activeTenant}
            onChange={(e) => onTenantChange?.(e.target.value)}
            className="appearance-none bg-transparent pr-1 focus:outline-none"
            aria-label="Switch tenant"
          >
            {tenants.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
          <ChevronDown size={12} strokeWidth={2.5} className="text-black/50" />
        </label>
      ) : null}

      {/* notifications */}
      <NotificationsMenu />

      {/* help */}
      <HelpMenu />

      {/* profile */}
      <UserMenu />
    </header>
  );
}
