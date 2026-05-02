import { cn } from "@lib/cn";

/**
 * Neo-Brutalist card. Pass `tone` for a colored fill.
 * tones: white | cream | mustard | mint | sky | pink | lilac
 */
export default function BrutalCard({
  tone = "white",
  rotate,
  className,
  children,
  ...rest
}) {
  const tones = {
    white: "bg-white",
    cream: "bg-cream",
    mustard: "bg-mustard",
    mint: "bg-mint",
    sky: "bg-sky",
    pink: "bg-pink",
    lilac: "bg-lilac",
  };
  return (
    <div
      className={cn("brutal-card p-5", tones[tone], rotate, className)}
      {...rest}
    >
      {children}
    </div>
  );
}
