/**
 * Lightweight skeleton block. Use as `<Skeleton className="h-4 w-32" />`.
 * For more complex layouts, compose multiple Skeletons.
 */
export default function Skeleton({ className = "", rounded = "rounded-[14px]" }) {
  return (
    <div
      className={`animate-pulse bg-black/[0.06] ${rounded} ${className}`}
      aria-hidden="true"
    />
  );
}

export function SkeletonText({ lines = 3, className = "" }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          rounded="rounded-full"
          className={`h-3 ${i === lines - 1 ? "w-2/3" : "w-full"}`}
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ className = "" }) {
  return (
    <div
      className={`rounded-[20px] bg-white p-4 ring-1 ring-black/10 ${className}`}
    >
      <div className="flex items-center gap-3">
        <Skeleton rounded="rounded-full" className="h-9 w-9" />
        <div className="flex-1 space-y-2">
          <Skeleton rounded="rounded-full" className="h-3 w-1/2" />
          <Skeleton rounded="rounded-full" className="h-3 w-3/4" />
        </div>
      </div>
    </div>
  );
}
