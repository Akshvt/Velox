import AppShell from "@layouts/AppShell.jsx";
import { Construction } from "lucide-react";

export default function StubPage({
  active,
  title,
  subtitle,
  description,
  adminOnly = false,
}) {
  return (
    <AppShell
      active={active}
      title={title}
      subtitle={subtitle}
      topbarProps={{ searchPlaceholder: `Search ${title.toLowerCase()}...` }}
    >
      <div className="rounded-[32px] bg-white p-10 ring-1 ring-black/15 shadow-[0_2px_0_rgba(0,0,0,0.03)]">
        <div className="flex flex-col items-start gap-4">
          <span
            className="flex h-12 w-12 items-center justify-center rounded-full"
            style={{ background: "#FFF5DC" }}
          >
            <Construction
              size={20}
              strokeWidth={2.5}
              style={{ color: "#C28A00" }}
            />
          </span>
          <h2 className="font-display text-[26px] uppercase tracking-wide">
            {title}
          </h2>
          <p className="max-w-2xl text-[13px] font-medium text-black/65">
            {description ||
              `The ${title} screen is wired into navigation. Detailed UI is coming soon.`}
          </p>
          {adminOnly && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F1ECFF] px-3 py-1 text-[10.5px] font-bold uppercase tracking-wider text-[#7C5CFF] ring-1 ring-black/10">
              Admin only
            </span>
          )}
        </div>
      </div>
    </AppShell>
  );
}
