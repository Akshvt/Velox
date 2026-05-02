import { Inbox } from "lucide-react";

export default function EmptyState({
  icon: Icon = Inbox,
  title = "Nothing here yet",
  message = "When data appears, it will show up here.",
  action,
  tone = "#FFF5DC",
  iconColor = "#C28A00",
  className = "",
}) {
  return (
    <div
      className={`flex flex-col items-start gap-3 rounded-[20px] bg-white p-5 ring-1 ring-black/10 ${className}`}
    >
      <span
        className="flex h-10 w-10 items-center justify-center rounded-full"
        style={{ background: tone }}
      >
        <Icon size={16} strokeWidth={2.5} style={{ color: iconColor }} />
      </span>
      <div className="leading-tight">
        <h3 className="font-display text-[15px] uppercase tracking-wide">
          {title}
        </h3>
        <p className="mt-1 text-[12px] font-medium text-black/60">{message}</p>
      </div>
      {action}
    </div>
  );
}
