import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "./Sidebar.jsx";
import Topbar from "./Topbar.jsx";

/**
 * AppShell - common layout for every authenticated screen.
 *
 *   <AppShell active="dashboard" title="Dashboard" subtitle="..." actions={<...>}>
 *     <YourPageContent />
 *   </AppShell>
 *
 * Layout contract:
 *   - viewport-locked (h-screen, no body scroll)
 *   - sidebar fixed on the left (lg+)
 *   - topbar fixed on top of the right column
 *   - the page container scrolls; an optional cream "page header" banner sits at the top of it
 */
export default function AppShell({
  active,
  title,
  subtitle,
  actions,
  banner = true,
  topbarProps,
  sidebarProps,
  variant = "scroll", // "scroll" | "workspace"
  children,
  contentClassName = "",
}) {
  const isWorkspace = variant === "workspace";
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const location = useLocation();
  // close drawer on route change
  useEffect(() => {
    setMobileNavOpen(false);
  }, [location.pathname]);
  return (
    <div className="velox-shell flex h-screen w-full overflow-hidden">
      <Sidebar
        active={active}
        mobileOpen={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        {...sidebarProps}
      />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Topbar onMenu={() => setMobileNavOpen(true)} {...topbarProps} />

        {isWorkspace ? (
          <div className={`flex min-h-0 flex-1 flex-col px-3 py-3 sm:px-5 sm:py-5 ${contentClassName}`}>{children}</div>
        ) : (
          <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3 sm:px-5 sm:py-5">
            {banner && (title || actions) && (
              <div
                className="velox-banner mb-4 flex flex-wrap items-center justify-between gap-2 rounded-[24px] px-3 py-3 ring-1 ring-black/15 sm:mb-5 sm:gap-3 sm:rounded-[28px] sm:px-5 sm:py-4"
              >
                <div className="leading-tight">
                  {title && <h1 className="font-display text-[18px] uppercase tracking-wide sm:text-[24px]">{title}</h1>}
                  {subtitle && <p className="mt-0.5 text-[11px] font-medium text-black/65 sm:text-[12px]">{subtitle}</p>}
                </div>
                {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
              </div>
            )}
            <div className={contentClassName}>{children}</div>
          </div>
        )}
      </div>
    </div>
  );
}
