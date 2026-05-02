import { AlertTriangle, RefreshCcw } from "lucide-react";

export default function ErrorState({
  title = "Something went wrong",
  message = "We couldn't load this section. Please try again.",
  onRetry,
  className = "",
}) {
  return (
    <div
      className={`flex flex-col items-start gap-3 rounded-[20px] bg-white p-5 ring-1 ring-black/10 ${className}`}
      role="alert"
    >
      <span
        className="flex h-10 w-10 items-center justify-center rounded-full"
        style={{ background: "#FCE7F3" }}
      >
        <AlertTriangle size={16} strokeWidth={2.5} className="text-[#D63384]" />
      </span>
      <div className="leading-tight">
        <h3 className="font-display text-[15px] uppercase tracking-wide">
          {title}
        </h3>
        <p className="mt-1 text-[12px] font-medium text-black/60">{message}</p>
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 rounded-full bg-black px-3.5 py-1.5 text-[11px] font-semibold text-white"
        >
          <RefreshCcw size={12} strokeWidth={2.5} />
          Retry
        </button>
      )}
    </div>
  );
}
